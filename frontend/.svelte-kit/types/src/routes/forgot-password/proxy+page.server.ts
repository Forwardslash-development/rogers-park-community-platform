// @ts-nocheck
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { apiUrl } from '$lib/config';

export const actions = {
  default: async ({ request }: import('./$types').RequestEvent) => {
    const data = await request.formData();
    const email = data.get('email')?.toString();

    if (!email) {
      return fail(400, {
        error: 'Email is required',
        email,
      });
    }

    try {
      const response = await fetch(apiUrl('/api/v1/auth/request-password-reset'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        return fail(response.status, {
          error: result.error?.message || 'Failed to send reset email',
          email,
        });
      }

      // Success - show generic message (security)
      return {
        success: true,
        message: result.data.message,
      };
    } catch (error) {
      return fail(500, {
        error: 'An error occurred. Please try again.',
        email,
      });
    }
  },
};
;null as any as Actions;