<!-- Dashboard page for LearnMeet -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore, UserRole } from '$lib/stores/authStore';
  import Button from '$lib/components/ui/Button.svelte';
  
  let user = null;
  let loading = true;
  
  onMount(() => {
    const unsubscribe = authStore.subscribe((authState) => {
      user = authState.user;
      loading = authState.loading;
      
      // If user isn't authenticated and we've finished loading, redirect to sign in
      if (!authState.loading && !authState.isAuthenticated) {
        goto('/auth/signin');
      }
    });
    
    return unsubscribe;
  });
  
  async function handleSignOut() {
    try {
      await authStore.signOut();
      goto('/auth/signin');
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  }
</script>

<main class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      <div class="flex items-center">
        <h1 class="text-2xl font-bold text-gray-900">LearnMeet</h1>
      </div>
      
      <div class="flex items-center space-x-4">
        {#if user}
          <div class="flex items-center space-x-2">
            <div class="text-sm">
              <p class="text-gray-900 font-medium">{user.displayName}</p>
              <p class="text-gray-500">{user.role}</p>
            </div>
            <Button variant="ghost" size="sm" on:click={handleSignOut}>
              Sign Out
            </Button>
          </div>
        {/if}
      </div>
    </div>
  </header>

  <!-- Dashboard Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if loading}
      <div class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    {:else}
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Welcome, {user?.displayName}!</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Quick Actions Panel -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <Button variant="primary" fullWidth={true}>
              Create New Meeting
            </Button>
            <Button variant="secondary" fullWidth={true}>
              Join a Meeting
            </Button>
            {#if user?.role === UserRole.Teacher}
              <Button variant="secondary" fullWidth={true}>
                Create Course
              </Button>
            {/if}
          </div>
        </div>
        
        <!-- Upcoming Meetings Panel -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Upcoming Meetings</h3>
          <div class="space-y-4">
            <p class="text-gray-500 text-sm italic">No upcoming meetings scheduled.</p>
            
            <div class="text-center mt-6">
              <Button variant="ghost" size="sm">
                View Calendar
              </Button>
            </div>
          </div>
        </div>
        
        <!-- Recent Activity Panel -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div class="space-y-4">
            <p class="text-gray-500 text-sm italic">No recent activity to display.</p>
          </div>
        </div>
      </div>
      
      <!-- Additional Content Based on Role -->
      {#if user?.role === UserRole.Teacher}
        <div class="mt-8">
          <h3 class="text-xl font-medium text-gray-800 mb-4">Your Courses</h3>
          <div class="bg-white shadow rounded-lg p-6">
            <p class="text-gray-500 text-sm italic">You haven't created any courses yet.</p>
            <div class="mt-4">
              <Button variant="primary" size="sm">
                Create your first course
              </Button>
            </div>
          </div>
        </div>
      {:else if user?.role === UserRole.Student}
        <div class="mt-8">
          <h3 class="text-xl font-medium text-gray-800 mb-4">Enrolled Courses</h3>
          <div class="bg-white shadow rounded-lg p-6">
            <p class="text-gray-500 text-sm italic">You aren't enrolled in any courses yet.</p>
            <div class="mt-4">
              <Button variant="primary" size="sm">
                Explore courses
              </Button>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</main>
