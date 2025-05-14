<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/authStore';
  import Button from '$lib/components/ui/Button.svelte';
  import { getAuthErrorMessage } from '$lib/firebase/auth-utils';
  import { setAuthPersistence } from '$lib/firebase/persistence';
  import { onMount } from 'svelte';
  
  let email = '';
  let password = '';
  let rememberMe = false;
  let loading = false;
  let error = '';
  
  onMount(() => {
    // Check if user is already signed in
    const unsubscribe = authStore.subscribe((state) => {
      if (!state.loading && state.isAuthenticated) {
        goto('/dashboard');
      }
    });
    
    return unsubscribe;
  });
  
  async function handleSignIn() {
    if (!email || !password) {
      error = 'Please enter both email and password';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      // Set persistence based on remember me checkbox
      await setAuthPersistence(rememberMe);
      
      // Attempt to sign in
      const user = await authStore.signIn(email, password, rememberMe);
      if (user) {
        goto('/dashboard');
      }
    } catch (err) {
      error = getAuthErrorMessage(err);
    } finally {
      loading = false;
    }
  }
</script>

<main class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">  <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
    <div class="flex items-center justify-between mb-4">
      <a href="/" class="flex items-center text-primary-600 hover:text-primary-700">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        <span>Home</span>
      </a>
    </div>
  
    <div>
      <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900">
        Sign in to LearnMeet
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or <a href="/auth/register" class="font-medium text-primary-600 hover:text-primary-500">
          create a new account
        </a>
      </p>
    </div>
    
    <form class="mt-8 space-y-6" on:submit|preventDefault={handleSignIn}>
      {#if error}
        <div class="p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      {/if}
      
      <div class="rounded-md -space-y-px">
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            bind:value={email}
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Email address"
          />
        </div>
        
        <div class="mb-4">
          <div class="flex justify-between items-center mb-1">
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <a href="/auth/forgot-password" class="text-sm font-medium text-primary-600 hover:text-primary-500">
              Forgot your password?
            </a>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            bind:value={password}
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Password"
          />
        </div>
      </div>      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            bind:checked={rememberMe}
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label for="remember-me" class="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>
      </div>

      <div>
        <Button 
          type="submit" 
          fullWidth={true} 
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>
    </form>
  </div>
</main>
