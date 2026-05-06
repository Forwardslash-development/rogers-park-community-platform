import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const API_URL = 'http://localhost:3000';

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

    if (!email || !password) {
      return fail(400, {
        error: 'Email and password are required',
        email,
      });
    }

    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      return fail(response.status, {
        error: result.error?.message || 'Login failed',
        email,
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
