import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const API_URL = 'http://localhost:3000';

export const actions: Actions = {
  default: async ({ cookies }) => {
    const sessionCookie = cookies.get('session');

    if (sessionCookie) {
      try {
        await fetch(`${API_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            Cookie: `session=${sessionCookie}`,
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    // Clear cookie regardless of API response
    cookies.delete('session', { path: '/' });
    throw redirect(303, '/');
  },
};
