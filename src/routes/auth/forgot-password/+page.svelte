<!-- Password reset page for LearnMeet -->
<script lang="ts">
  import { authStore } from '$lib/stores/authStore';
  import Button from '$lib/components/ui/Button.svelte';
  
  let email = '';
  let loading = false;
  let error = '';
  let emailSent = false;
  
  async function handleResetPassword() {
    if (!email) {
      error = 'Please enter your email address';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      const success = await authStore.resetPassword(email);
      if (success) {
        emailSent = true;
      }
    } catch (err: any) {
      error = err.message || 'Failed to send password reset email';
      emailSent = false;
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
        Reset your password
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Enter your email address and we'll send you a link to reset your password.
      </p>
    </div>
    
    {#if emailSent}
      <div class="py-3 px-4 bg-green-100 border border-green-200 text-green-700 rounded">
        <p class="font-semibold">Reset email sent!</p>
        <p class="text-sm mt-1">Check your inbox for instructions on how to reset your password.</p>
      </div>
      
      <div class="text-center mt-4">
        <a href="/auth/signin" class="font-medium text-primary-600 hover:text-primary-500">
          Return to sign in
        </a>
      </div>
    {:else}
      <form class="mt-8 space-y-6" on:submit|preventDefault={handleResetPassword}>
        {#if error}
          <div class="p-3 bg-red-100 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        {/if}
        
        <div>
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
        
        <div>
          <Button 
            type="submit" 
            fullWidth={true} 
            disabled={loading}
          >
            {loading ? 'Sending reset email...' : 'Send reset email'}
          </Button>
        </div>
        
        <div class="text-sm text-center">
          <a href="/auth/signin" class="font-medium text-primary-600 hover:text-primary-500">
            Remember your password? Sign in
          </a>
        </div>
      </form>
    {/if}
  </div>
</main>
