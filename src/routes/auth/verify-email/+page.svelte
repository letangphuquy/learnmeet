<!-- Email verification page for LearnMeet -->
<script lang="ts">
  import { authStore } from '$lib/stores/authStore';
  import Button from '$lib/components/ui/Button.svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  let loading = false;
  let error = '';
  let user = null;
  
  onMount(() => {
    const unsubscribe = authStore.subscribe((authState) => {
      user = authState.user;
      
      // If no user is logged in, redirect to sign in
      if (!authState.loading && !authState.user) {
        goto('/auth/signin');
      }
      
      // If user is verified, redirect to dashboard
      if (authState.user?.emailVerified) {
        goto('/dashboard');
      }
    });
    
    return unsubscribe;
  });
  
  async function handleResendVerification() {
    loading = true;
    error = '';
    
    try {
      // This functionality needs to be added to the auth service
      // For now, just show a success message
      setTimeout(() => {
        loading = false;
      }, 1000);
    } catch (err: any) {
      error = err.message || 'Failed to resend verification email';
      loading = false;
    }
  }
  
  async function handleSignOut() {
    try {
      await authStore.signOut();
      goto('/auth/signin');
    } catch (err: any) {
      error = err.message || 'Failed to sign out';
    }
  }
</script>

<main class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Verify your email
      </h2>
      <p class="mt-4 text-center text-md text-gray-700">
        We've sent a verification email to:
      </p>
      {#if user?.email}
        <p class="mt-2 text-center text-lg font-semibold text-gray-900">
          {user.email}
        </p>
      {/if}
    </div>
    
    <div class="border border-yellow-200 bg-yellow-50 p-4 rounded-md">
      <p class="text-center text-yellow-700">
        Please check your email and click the verification link to activate your account.
        <br><br>
        If you don't see the email, check your spam folder.
      </p>
    </div>
    
    {#if error}
      <div class="p-3 bg-red-100 border border-red-200 text-red-700 rounded">
        {error}
      </div>
    {/if}
    
    <div class="space-y-4">
      <Button 
        type="button" 
        fullWidth={true} 
        disabled={loading}
        on:click={handleResendVerification}
      >
        {loading ? 'Sending...' : 'Resend verification email'}
      </Button>
      
      <Button 
        type="button" 
        variant="ghost" 
        fullWidth={true} 
        on:click={handleSignOut}
      >
        Sign out
      </Button>
    </div>
    
    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">
        Need help? <a href="/support" class="font-medium text-primary-600 hover:text-primary-500">Contact support</a>
      </p>
    </div>
  </div>
</main>
