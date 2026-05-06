// @ts-nocheck
import type { PageLoad } from './$types';

export const ssr = false; // Client-side only for token handling

export const load = async ({ url }: Parameters<PageLoad>[0]) => {
  const token = url.searchParams.get('token');
  
  return {
    token,
  };
};
