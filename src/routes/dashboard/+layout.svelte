<!-- Protected route layout - only accessible to authenticated users -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/authStore';
  import Header from '$lib/components/Header.svelte';
  
  let isAuthenticated = false;
  let loading = true;
  
  onMount(() => {
    const unsubscribe = authStore.subscribe((authState) => {
      isAuthenticated = authState.isAuthenticated;
      loading = authState.loading;
      
      // If user isn't authenticated and we've finished loading, redirect to sign in
      if (!authState.loading && !authState.isAuthenticated) {
        goto('/auth/signin');
      }
    });
    
    return unsubscribe;
  });
</script>

{#if loading}
  <div class="flex justify-center items-center h-screen bg-gray-50">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
{:else if isAuthenticated}
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Header sticky={true} />
    <main class="flex-1 container mx-auto px-4 py-8">
      <slot></slot>
    </main>
  </div>
{/if}
