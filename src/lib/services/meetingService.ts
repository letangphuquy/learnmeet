import { writable } from 'svelte/store';
import type { Meeting, MeetingParticipant } from '../models/meeting';
import { authStore } from '../stores/authStore';

// Temporary in-memory storage for meetings (will be replaced with a backend)
const MEETINGS_STORE: Record<string, Meeting> = {};

// Store for user's meetings
export const userMeetings = writable<Meeting[]>([]);

// Meeting service for creating and managing meetings
export const meetingService = {
  /**
   * Create a new meeting
   */
  async createMeeting(meetingData: Partial<Meeting>): Promise<Meeting> {
    // Get current user
    let currentUser: any = null;
    const unsubscribe = authStore.subscribe((state) => {
      currentUser = state.user;
    });
    unsubscribe();

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Generate a random ID (in production this would be done by the backend)
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Create meeting object
    const meeting: Meeting = {
      id,
      name: meetingData.name || 'Untitled Meeting',
      description: meetingData.description || '',
      hostId: currentUser.uid,
      hostName: currentUser.displayName || 'Anonymous',
      scheduledStart: meetingData.scheduledStart || new Date().toISOString(),
      scheduledEnd: meetingData.scheduledEnd,
      isPublic: meetingData.isPublic || false,
      createdAt: new Date().toISOString(),
      status: meetingData.status || 'scheduled',
      participants: []
    };

    // Add host as participant
    const hostParticipant: MeetingParticipant = {
      userId: currentUser.uid,
      displayName: currentUser.displayName || 'Anonymous',
      role: 'host'
    };

    meeting.participants = [hostParticipant];

    // Save to local storage (in a real app, this would be an API call)
    MEETINGS_STORE[id] = meeting;
    
    // Update the user meetings store
    userMeetings.update(meetings => [...meetings, meeting]);

    return meeting;
  },

  /**
   * Get a meeting by ID
   */
  async getMeeting(id: string): Promise<Meeting> {
    // In a real app, this would be an API call
    const meeting = MEETINGS_STORE[id];
    
    if (!meeting) {
      throw new Error('Meeting not found');
    }
    
    return meeting;
  },

  /**
   * Get all meetings for the current user
   */
  async getUserMeetings(): Promise<Meeting[]> {
    // Get current user
    let currentUser: any = null;
    const unsubscribe = authStore.subscribe((state) => {
      currentUser = state.user;
    });
    unsubscribe();

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Filter meetings by host ID or participant (in a real app, this would be an API call)
    const meetings = Object.values(MEETINGS_STORE).filter(meeting => {
      return meeting.hostId === currentUser.uid || 
             meeting.participants?.some(p => p.userId === currentUser.uid);
    });

    // Update the meetings store
    userMeetings.set(meetings);
    
    return meetings;
  },

  /**
   * Join a meeting
   */
  async joinMeeting(meetingId: string): Promise<Meeting> {
    // Get current user
    let currentUser: any = null;
    const unsubscribe = authStore.subscribe((state) => {
      currentUser = state.user;
    });
    unsubscribe();

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Get the meeting
    const meeting = MEETINGS_STORE[meetingId];
    
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // Check if user is already a participant
    if (!meeting.participants?.some(p => p.userId === currentUser.uid)) {
      const participant: MeetingParticipant = {
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous',
        role: meeting.hostId === currentUser.uid ? 'host' : 'participant',
        joinedAt: new Date().toISOString()
      };

      // Add participant to meeting
      meeting.participants = [...(meeting.participants || []), participant];
      
      // Update the meeting in storage
      MEETINGS_STORE[meetingId] = meeting;
    }

    return meeting;
  },

  /**
   * Leave a meeting
   */
  async leaveMeeting(meetingId: string): Promise<void> {
    // Get current user
    let currentUser: any = null;
    const unsubscribe = authStore.subscribe((state) => {
      currentUser = state.user;
    });
    unsubscribe();

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Get the meeting
    const meeting = MEETINGS_STORE[meetingId];
    
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // If user is a participant, update their left time
    if (meeting.participants) {
      const userIndex = meeting.participants.findIndex(p => p.userId === currentUser.uid);
      
      if (userIndex >= 0) {
        meeting.participants[userIndex].leftAt = new Date().toISOString();
        
        // Update the meeting in storage
        MEETINGS_STORE[meetingId] = meeting;
      }
    }
  },

  /**
   * End a meeting (host only)
   */
  async endMeeting(meetingId: string): Promise<void> {
    // Get current user
    let currentUser: any = null;
    const unsubscribe = authStore.subscribe((state) => {
      currentUser = state.user;
    });
    unsubscribe();

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Get the meeting
    const meeting = MEETINGS_STORE[meetingId];
    
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // Check if user is the host
    if (meeting.hostId !== currentUser.uid) {
      throw new Error('Only the host can end the meeting');
    }

    // Update meeting status
    meeting.status = 'completed';
    meeting.updatedAt = new Date().toISOString();
    
    // Update the meeting in storage
    MEETINGS_STORE[meetingId] = meeting;

    // Update the user meetings store
    userMeetings.update(meetings => 
      meetings.map(m => m.id === meetingId ? { ...m, status: 'completed' } : m)
    );
  }
};
