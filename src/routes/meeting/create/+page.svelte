<!-- Meeting creation page -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/authStore';
  import { meetingService } from '$lib/services/meetingService';
  import type { Meeting } from '$lib/models/meeting';
  import Button from '$lib/components/ui/Button.svelte';
  import { onMount } from 'svelte';

  // Meeting settings
  let meetingName = '';
  let scheduledStart = '';
  let scheduledEnd = '';
  let description = '';
  let isPublic = false;
  let loading = false;
  let error = '';
  let user = null;
  
  // Watch for authentication state
  onMount(() => {
    const unsubscribe = authStore.subscribe((state) => {
      user = state.user;
      
      // Redirect to login if not authenticated
      if (!state.loading && !state.isAuthenticated) {
        goto('/auth/signin');
      }
    });
    
    return unsubscribe;
  });
  
  // Handle meeting creation
  async function handleCreateMeeting() {
    if (!meetingName) {
      error = 'Meeting name is required';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      // Create meeting object
      const meetingData: Partial<Meeting> = {
        name: meetingName,
        description,
        scheduledStart: scheduledStart || new Date().toISOString(),
        scheduledEnd: scheduledEnd || undefined,
        isPublic,
        status: 'scheduled'
      };
      
      // Create meeting using the service
      const meeting = await meetingService.createMeeting(meetingData);
      
      // Navigate to the meeting page
      goto(`/meeting/${meeting.id}`);
    } catch (err: any) {
      error = err.message || 'Failed to create meeting';
      loading = false;
    }
  }
  
  // Create instant meeting
  function createInstantMeeting() {
    meetingName = `Instant Meeting - ${new Date().toLocaleString()}`;
    handleCreateMeeting();
  }
</script>

<main class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <h1 class="text-2xl font-semibold text-gray-900">Create a Meeting</h1>
      </div>
      
      <div class="p-6">
        {#if error}
          <div class="p-3 mb-4 bg-red-100 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        {/if}
        
        <div class="grid grid-cols-1 gap-y-6 gap-x-4">
          <div>
            <label for="meetingName" class="block text-sm font-medium text-gray-700">
              Meeting Name*
            </label>
            <input
              type="text"
              id="meetingName"
              bind:value={meetingName}
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              bind:value={description}
              rows="3"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="scheduledStart" class="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="datetime-local"
                id="scheduledStart"
                bind:value={scheduledStart}
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label for="scheduledEnd" class="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="datetime-local"
                id="scheduledEnd"
                bind:value={scheduledEnd}
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="isPublic"
                type="checkbox"
                bind:checked={isPublic}
                class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="isPublic" class="font-medium text-gray-700">Public Meeting</label>
              <p class="text-gray-500">Anyone with the link can join this meeting</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row-reverse gap-3">
        <Button 
          type="button" 
          variant="primary" 
          disabled={loading} 
          on:click={handleCreateMeeting}
        >
          {loading ? 'Creating...' : 'Schedule Meeting'}
        </Button>
        
        <Button 
          type="button" 
          variant="secondary" 
          disabled={loading} 
          on:click={createInstantMeeting}
        >
          Start Instant Meeting
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          disabled={loading} 
          on:click={() => goto('/dashboard')}
        >
          Cancel
        </Button>
      </div>
    </div>
  </div>
</main>
