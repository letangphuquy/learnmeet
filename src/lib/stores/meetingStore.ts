import { writable, derived } from 'svelte/store';

// Types
export interface MeetingSettings {
  videoEnabled: boolean;
  audioEnabled: boolean;
  screenShareActive: boolean;
  chatOpen: boolean;
  participantListOpen: boolean;
  isRecording: boolean;
}

// Create the store
function createMeetingStore() {
  const initialSettings: MeetingSettings = {
    videoEnabled: true,
    audioEnabled: true,
    screenShareActive: false,
    chatOpen: false,
    participantListOpen: false,
    isRecording: false
  };

  const { subscribe, update, set } = writable(initialSettings);

  return {
    subscribe,
    
    // Toggle video
    toggleVideo: (enabled?: boolean) => update(state => ({ 
      ...state, 
      videoEnabled: enabled !== undefined ? enabled : !state.videoEnabled 
    })),
    
    // Toggle audio
    toggleAudio: (enabled?: boolean) => update(state => ({ 
      ...state, 
      audioEnabled: enabled !== undefined ? enabled : !state.audioEnabled 
    })),
    
    // Toggle screen sharing
    toggleScreenShare: (active?: boolean) => update(state => ({ 
      ...state, 
      screenShareActive: active !== undefined ? active : !state.screenShareActive 
    })),
    
    // Toggle chat panel
    toggleChat: (open?: boolean) => update(state => ({ 
      ...state, 
      chatOpen: open !== undefined ? open : !state.chatOpen 
    })),
    
    // Toggle participant list
    toggleParticipantList: (open?: boolean) => update(state => ({ 
      ...state, 
      participantListOpen: open !== undefined ? open : !state.participantListOpen 
    })),
    
    // Toggle recording
    toggleRecording: (recording?: boolean) => update(state => ({ 
      ...state, 
      isRecording: recording !== undefined ? recording : !state.isRecording 
    })),
    
    // Reset all settings to defaults
    reset: () => set(initialSettings)
  };
}

export const meetingStore = createMeetingStore();

// Derived store for determining if any panel is open
export const isPanelOpen = derived(
  meetingStore,
  $meetingStore => $meetingStore.chatOpen || $meetingStore.participantListOpen
);
