// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = async ({ parent }: Parameters<PageServerLoad>[0]) => {
  const { user } = await parent();
  
  if (!user) {
    throw redirect(303, '/login');
  }

  return { user };
};
