// Defines the data structure for a meeting
export interface Meeting {
  id: string;
  name: string;
  description?: string;
  hostId: string;
  hostName?: string;
  scheduledStart?: Date | string;
  scheduledEnd?: Date | string;
  isPublic: boolean;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  createdAt: Date | string;
  updatedAt?: Date | string;
  status: MeetingStatus;
  participants?: MeetingParticipant[];
}

export interface MeetingParticipant {
  userId: string;
  displayName: string;
  role: ParticipantRole;
  joinedAt?: Date | string;
  leftAt?: Date | string;
}

export enum ParticipantRole {
  Host = 'host',
  CoHost = 'co-host',
  Participant = 'participant',
  Guest = 'guest'
}

export enum MeetingStatus {
  Scheduled = 'scheduled',
  InProgress = 'in-progress',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date | string;
  occurrences?: number;
}

export interface MeetingInvitation {
  meetingId: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: Date | string;
  respondedAt?: Date | string;
}
