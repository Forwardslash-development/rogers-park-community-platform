import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { apiUrl } from '$lib/config';

export const load: PageServerLoad = async ({ parent }) => {
  const { user } = await parent();
  if (user) {
    throw redirect(303, '/dashboard');
  }
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();
    const display_name = data.get('display_name')?.toString();

    if (!email || !password || !display_name) {
      return fail(400, {
        error: 'All fields are required',
        email,
        display_name,
      });
    }

    const response = await fetch(apiUrl('/api/v1/auth/signup'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, display_name }),
    });

    const result = await response.json();

    if (!response.ok) {
      return fail(response.status, {
        error: result.error?.message || 'Signup failed',
        email,
        display_name,
      });
    }

    // Get session ID from response body
    const sessionId = result.data?.session?.id;
    if (sessionId) {
      cookies.set('session', sessionId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    throw redirect(303, '/dashboard');
  },
};
