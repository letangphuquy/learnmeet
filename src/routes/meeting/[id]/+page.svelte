<!-- Meeting room page -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/authStore';
  import { meetingStore } from '$lib/stores/meetingStore';
  import { webrtcService, localStream, peerConnections, activeSpeaker } from '$lib/services/webrtcService';
  import { socketService, socketConnected, currentRoom, participants, messages } from '$lib/services/socketService';
  import Button from '$lib/components/ui/Button.svelte';

  // Extract meeting ID from the URL
  const meetingId = $page.params.id;
  let user = null;
  let loading = true;
  let error = '';
  let localVideoElement: HTMLVideoElement;
  let mediaLoading = true;
  
  // State for UI components
  let showControls = true;
  let controlsTimeout: number;
  
  // Track remote participants
  let peers: Map<string, any> = new Map();
  let participantsList: Map<string, { id: string, name: string, isHost: boolean }> = new Map();
  let messageList: any[] = [];
  let newMessage = '';
  
  // Subscribe to stores
  let unsubscribers: (() => void)[] = [];

  onMount(async () => {
    // Subscribe to auth store
    unsubscribers.push(
      authStore.subscribe((state) => {
        user = state.user;
        
        // Redirect to login if not authenticated
        if (!state.loading && !state.isAuthenticated) {
          goto('/auth/signin');
        }
      })
    );

    // Subscribe to participant changes
    unsubscribers.push(
      participants.subscribe(value => {
        participantsList = value;
      })
    );

    // Subscribe to message changes
    unsubscribers.push(
      messages.subscribe(value => {
        messageList = value;
      })
    );

    // Subscribe to peer connections
    unsubscribers.push(
      peerConnections.subscribe(value => {
        peers = value;
      })
    );

    try {
      // Initialize video/audio
      loading = true;
      await setupLocalMedia();
      
      // Initialize socket connection
      socketService.init();

      // Join the meeting room
      if (user) {
        await socketService.joinRoom(meetingId, user.displayName || 'Anonymous', user.uid);
      }
      
      loading = false;
    } catch (err: any) {
      error = err.message || 'Failed to join meeting';
      loading = false;
    }
  });

  onDestroy(() => {
    // Clean up resources
    webrtcService.cleanup();
    socketService.disconnect();
    
    // Clean up timeouts
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    // Unsubscribe from stores
    unsubscribers.forEach(unsubscribe => unsubscribe());
  });

  // Setup local media stream
  async function setupLocalMedia() {
    try {
      mediaLoading = true;
      
      const stream = await webrtcService.initLocalStream(
        $meetingStore.videoEnabled,
        $meetingStore.audioEnabled
      );
      
      if (localVideoElement) {
        localVideoElement.srcObject = stream;
      }
      
      mediaLoading = false;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      error = 'Could not access camera or microphone. Please check permissions.';
      mediaLoading = false;
    }
  }

  // UI control functions
  function toggleVideo() {
    meetingStore.toggleVideo();
    webrtcService.toggleVideo($meetingStore.videoEnabled);
  }

  function toggleAudio() {
    meetingStore.toggleAudio();
    webrtcService.toggleAudio($meetingStore.audioEnabled);
  }

  function toggleScreenShare() {
    if ($meetingStore.screenShareActive) {
      webrtcService.stopScreenShare().catch(err => {
        console.error('Failed to stop screen sharing:', err);
      });
    } else {
      webrtcService.startScreenShare().catch(err => {
        console.error('Failed to start screen sharing:', err);
      });
    }
    meetingStore.toggleScreenShare();
  }

  function toggleChat() {
    meetingStore.toggleChat();
  }

  function toggleParticipants() {
    meetingStore.toggleParticipantList();
  }

  function handleMouseMove() {
    showControls = true;
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    controlsTimeout = setTimeout(() => {
      showControls = false;
    }, 3000);
  }

  function handleLeaveMeeting() {
    socketService.leaveRoom();
    webrtcService.cleanup();
    goto('/dashboard');
  }

  function sendMessage() {
    if (!newMessage.trim() || !user) return;
    
    socketService.sendMessage(newMessage, user.uid, user.displayName || 'Anonymous');
    newMessage = '';
  }
</script>

<main 
  class="h-screen bg-gray-900 text-white flex flex-col overflow-hidden"
  on:mousemove={handleMouseMove}
>
  {#if loading}
    <div class="absolute inset-0 flex items-center justify-center bg-gray-900 z-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
        <p>Joining meeting...</p>
      </div>
    </div>
  {:else if error}
    <div class="absolute inset-0 flex items-center justify-center bg-gray-900 z-50">
      <div class="bg-gray-800 p-6 rounded-lg max-w-md">
        <h2 class="text-xl font-semibold mb-4">Error</h2>
        <p class="text-red-400 mb-4">{error}</p>
        <Button on:click={() => goto('/dashboard')}>Return to Dashboard</Button>
      </div>
    </div>
  {/if}
  
  <!-- Main content area -->
  <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
    <!-- Video grid -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Grid of videos -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 h-full">
        <!-- Local video -->
        <div class="relative bg-black rounded-lg overflow-hidden aspect-video">
          {#if mediaLoading}
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="animate-pulse">Loading media...</div>
            </div>
          {/if}
          <video
            bind:this={localVideoElement}
            autoplay
            muted
            playsinline
            class="w-full h-full object-cover"
          ></video>
          <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded">
            You {#if !$meetingStore.audioEnabled}<span class="text-red-500">(muted)</span>{/if}
          </div>
        </div>
        
        <!-- Remote videos will be added dynamically -->
        {#if peers.size === 0}
          <div class="bg-gray-800 rounded-lg flex items-center justify-center aspect-video">
            <p class="text-gray-400">Waiting for participants to join...</p>
          </div>
        {/if}
      </div>
      
      <!-- Meeting controls -->
      <div 
        class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 py-3 px-4 transition-opacity duration-300"
        class:opacity-0={!showControls}
        class:pointer-events-none={!showControls}
      >
        <div class="flex justify-center space-x-4">
          <Button 
            variant={$meetingStore.audioEnabled ? "primary" : "danger"} 
            on:click={toggleAudio}
          >
            {$meetingStore.audioEnabled ? 'Mute' : 'Unmute'}
          </Button>
          
          <Button 
            variant={$meetingStore.videoEnabled ? "primary" : "danger"} 
            on:click={toggleVideo}
          >
            {$meetingStore.videoEnabled ? 'Stop Video' : 'Start Video'}
          </Button>
          
          <Button 
            variant={$meetingStore.screenShareActive ? "danger" : "primary"} 
            on:click={toggleScreenShare}
          >
            {$meetingStore.screenShareActive ? 'Stop Sharing' : 'Share Screen'}
          </Button>
          
          <Button 
            variant={$meetingStore.participantListOpen ? "secondary" : "primary"} 
            on:click={toggleParticipants}
          >
            Participants
          </Button>
          
          <Button 
            variant={$meetingStore.chatOpen ? "secondary" : "primary"} 
            on:click={toggleChat}
          >
            Chat
          </Button>
          
          <Button 
            variant="danger" 
            on:click={handleLeaveMeeting}
          >
            Leave
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Side panel (chat or participants) -->
    {#if $meetingStore.chatOpen || $meetingStore.participantListOpen}
      <div class="w-full md:w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        <!-- Panel header -->
        <div class="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
          <h2 class="font-medium">
            {$meetingStore.chatOpen ? 'Chat' : 'Participants'}
          </h2>
          <button 
            class="text-gray-400 hover:text-white"
            on:click={() => $meetingStore.chatOpen ? toggleChat() : toggleParticipants()}
          >
            ✕
          </button>
        </div>
        
        <!-- Panel content -->
        {#if $meetingStore.chatOpen}
          <!-- Chat panel -->
          <div class="flex-1 flex flex-col overflow-hidden">
            <div class="flex-1 overflow-y-auto p-4 space-y-3">
              {#each messageList as message}
                <div class={`${message.senderId === (user?.uid || 'self') ? 'text-right' : ''}`}>
                  <div class={`inline-block px-3 py-2 rounded-lg ${
                    message.senderId === 'system' 
                      ? 'bg-gray-700 text-gray-300'
                      : message.senderId === (user?.uid || 'self')
                        ? 'bg-primary-600'
                        : 'bg-gray-700'
                  }`}>
                    {#if message.senderId !== 'system' && message.senderId !== (user?.uid || 'self')}
                      <div class="text-xs text-gray-400">{message.senderName}</div>
                    {/if}
                    <div>{message.content}</div>
                  </div>
                </div>
              {/each}
              
              {#if messageList.length === 0}
                <div class="text-center text-gray-500 my-4">
                  No messages yet
                </div>
              {/if}
            </div>
            
            <!-- Message input -->
            <div class="p-3 border-t border-gray-700">
              <form on:submit|preventDefault={sendMessage} class="flex">
                <input
                  type="text"
                  bind:value={newMessage}
                  placeholder="Type a message..."
                  class="flex-1 bg-gray-700 border border-gray-600 rounded-l px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  class="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-r"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        {:else if $meetingStore.participantListOpen}
          <!-- Participants panel -->
          <div class="flex-1 overflow-y-auto p-4">
            <ul class="space-y-2">
              {#each [...participantsList.values()] as participant}
                <li class="flex items-center justify-between py-2">
                  <div>
                    <span>{participant.name}</span>
                    {#if participant.isHost}
                      <span class="ml-2 text-xs bg-primary-700 px-2 py-0.5 rounded">Host</span>
                    {/if}
                  </div>
                  
                  {#if participant.id === (user?.uid || '')}
                    <span class="text-xs text-gray-400">(You)</span>
                  {/if}
                </li>
              {/each}
              
              {#if participantsList.size === 0}
                <li class="text-center text-gray-500 my-4">
                  No participants yet
                </li>
              {/if}
            </ul>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</main>
