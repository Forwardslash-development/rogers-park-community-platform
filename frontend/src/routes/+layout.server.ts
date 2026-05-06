import type { LayoutServerLoad } from './$types';

const API_URL = 'http://localhost:3000';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const sessionCookie = cookies.get('session');

  if (!sessionCookie) {
    return {
      user: null,
    };
  }

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/user`, {
      headers: {
        Cookie: `session=${sessionCookie}`,
      },
    });

    if (!response.ok) {
      return { user: null };
    }

    const data = await response.json();
    return {
      user: data.data.user,
    };
  } catch (error) {
    console.error('Error loading user:', error);
    return { user: null };
  }
};
