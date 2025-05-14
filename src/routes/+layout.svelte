<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto, afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { auth } from '$lib/firebase/config';
  import { authStore } from '$lib/stores/authStore';
    // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/verify-email',
    '/debug/firebase' // Adding the debug page as public for easy access during troubleshooting
  ];
  
  // Check if the current path is a public route
  function isPublicRoute(path: string): boolean {
    return publicRoutes.some(route => path === route || path.startsWith(route + '/'));
  }
  
  // Handle route changes
  afterNavigate(({ to }) => {
    if (browser && to?.url) {
      const path = to.url.pathname;
      
      // Subscribe to auth state to protect routes
      const unsubscribe = authStore.subscribe(state => {
        if (!state.loading) {
          const isAuthorized = state.isAuthenticated;
          const isPublic = isPublicRoute(path);
          
          if (!isAuthorized && !isPublic) {
            // Redirect to login if trying to access protected route without auth
            goto('/auth/signin');
          } else if (isAuthorized && path === '/auth/signin') {
            // Redirect to dashboard if trying to access login when already logged in
            goto('/dashboard');
          }
        }
      });
      
      // Cleanup subscription on next navigation
      return unsubscribe;
    }
  });
</script>

<slot />
