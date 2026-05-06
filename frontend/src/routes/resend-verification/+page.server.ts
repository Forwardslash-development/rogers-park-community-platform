import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { apiUrl } from '$lib/config';

export const load: PageServerLoad = async ({ parent }) => {
  const { user } = await parent();
  
  // Require authentication
  if (!user) {
    throw redirect(303, '/login');
  }
  
  return {
    user,
  };
};

export const actions: Actions = {
  default: async ({ cookies }) => {
    const sessionCookie = cookies.get('session');
    
    if (!sessionCookie) {
      throw redirect(303, '/login');
    }
    
    try {
      const response = await fetch(apiUrl('/api/v1/auth/send-verification-email'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `session=${sessionCookie}`,
        },
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return fail(response.status, {
          error: result.error?.message || 'Failed to send verification email',
        });
      }
      
      return {
        success: true,
        message: result.data.message || 'Verification email sent successfully!',
      };
    } catch (error) {
      return fail(500, {
        error: 'An error occurred. Please try again.',
      });
    }
  },
};
