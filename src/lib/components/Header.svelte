<script lang="ts">
  import { authStore } from '$lib/stores/authStore';
  import Button from '$lib/components/ui/Button.svelte';
  
  export let sticky = false;
  
  let user = null;
  
  // Subscribe to auth state
  authStore.subscribe(state => {
    user = state.user;
  });
  
  async function handleSignOut() {
    try {
      await authStore.signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  }
</script>

<header class="{sticky ? 'sticky top-0 z-10' : ''} bg-white shadow-md">
  <div class="container mx-auto px-4 py-4 flex justify-between items-center">
    <div class="flex items-center">
      <a href="/" class="text-2xl font-bold text-primary-800">LearnMeet</a>
      
      {#if user}
        <nav class="hidden md:flex ml-8">
          <ul class="flex space-x-6">
            <li><a href="/dashboard" class="text-gray-700 hover:text-primary-600">Dashboard</a></li>
            <li><a href="/meeting/create" class="text-gray-700 hover:text-primary-600">New Meeting</a></li>
            <li><a href="/dashboard/schedule" class="text-gray-700 hover:text-primary-600">Schedule</a></li>
          </ul>
        </nav>
      {/if}
    </div>
    
    <div class="flex items-center space-x-4">
      {#if user}
        <div class="hidden md:flex items-center space-x-2">
          <div class="text-sm">
            <p class="text-gray-900 font-medium">{user.displayName || 'User'}</p>
            <p class="text-xs text-gray-500">{user.email}</p>
          </div>
          <button 
            class="text-sm text-gray-600 hover:text-primary-700"
            on:click={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      {:else}
        <a href="/auth/signin">
          <Button variant="primary" size="sm">Sign In</Button>
        </a>
      {/if}
    </div>
  </div>
</header>
