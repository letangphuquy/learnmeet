// Root layout server-side script for LearnMeet
import type { LayoutServerLoad } from './$types';

// Server-side load function
export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    // Server-rendered data can go here
    // We'll handle auth client-side since Firebase requires the browser
  };
};
