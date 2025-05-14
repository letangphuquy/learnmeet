import { io, Socket } from 'socket.io-client';
import { writable, get } from 'svelte/store';

// Types
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  type: 'text' | 'file' | 'system';
}

interface RoomInfo {
  id: string;
  name: string;
  participants: string[];
  hostId: string;
  createdAt: number;
}

// Stores
export const socketConnected = writable(false);
export const currentRoom = writable<RoomInfo | null>(null);
export const messages = writable<Message[]>([]);
export const participants = writable<Map<string, { id: string, name: string, isHost: boolean }>>(new Map());

// Socket instance
let socket: Socket;

/**
 * Socket service for real-time communication
 */
export const socketService = {
  /**
   * Initialize the socket connection
   */
  init(serverUrl = 'http://localhost:3000') {
    if (socket) return;

    socket = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Set up event listeners
    socket.on('connect', () => {
      socketConnected.set(true);
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      socketConnected.set(false);
      console.log('Disconnected from server');
    });

    // Room events
    socket.on('room:joined', (room: RoomInfo) => {
      currentRoom.set(room);
      
      const participantMap = new Map();
      room.participants.forEach(id => {
        participantMap.set(id, { id, name: 'Unknown', isHost: id === room.hostId });
      });
      
      participants.set(participantMap);
    });

    socket.on('room:participant_joined', (user: { id: string, name: string }) => {
      participants.update(map => {
        const currentRoom = get(currentRoom);
        map.set(user.id, { 
          ...user,
          isHost: currentRoom ? user.id === currentRoom.hostId : false
        });
        return map;
      });
      
      // Add system message
      this.addSystemMessage(`${user.name} joined the meeting`);
    });

    socket.on('room:participant_left', (userId: string) => {
      participants.update(map => {
        const user = map.get(userId);
        const name = user ? user.name : 'Someone';
        
        this.addSystemMessage(`${name} left the meeting`);
        
        map.delete(userId);
        return map;
      });
    });

    // Message events
    socket.on('message:new', (message: Message) => {
      messages.update(msgs => [...msgs, message]);
    });

    // WebRTC signaling
    socket.on('signal', (data: { from: string, signal: any }) => {
      // Handle WebRTC signaling - will be implemented when connecting with webrtcService
    });

    return socket;
  },

  /**
   * Join a meeting room
   */
  joinRoom(roomId: string, userName: string, userId: string) {
    if (!socket || !socket.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise<RoomInfo>((resolve, reject) => {
      socket.emit('room:join', { roomId, userName, userId }, (response: { success: boolean, room?: RoomInfo, error?: string }) => {
        if (response.success && response.room) {
          resolve(response.room);
        } else {
          reject(new Error(response.error || 'Failed to join room'));
        }
      });
    });
  },

  /**
   * Create a new meeting room
   */
  createRoom(roomName: string, hostName: string, hostId: string) {
    if (!socket || !socket.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise<RoomInfo>((resolve, reject) => {
      socket.emit('room:create', { roomName, hostName, hostId }, (response: { success: boolean, room?: RoomInfo, error?: string }) => {
        if (response.success && response.room) {
          resolve(response.room);
        } else {
          reject(new Error(response.error || 'Failed to create room'));
        }
      });
    });
  },

  /**
   * Leave the current room
   */
  leaveRoom() {
    if (socket && get(currentRoom)) {
      socket.emit('room:leave');
      currentRoom.set(null);
      messages.set([]);
      participants.set(new Map());
    }
  },

  /**
   * Send a chat message
   */
  sendMessage(content: string, userId: string, userName: string) {
    if (!socket || !get(currentRoom)) {
      throw new Error('Not in a room');
    }

    const message = {
      content,
      senderId: userId,
      senderName: userName,
    };

    socket.emit('message:send', message);
  },

  /**
   * Send a WebRTC signal to another peer
   */
  sendSignal(to: string, signal: any) {
    if (!socket) {
      throw new Error('Socket not connected');
    }

    socket.emit('signal', { to, signal });
  },

  /**
   * Add a system message to the chat
   */
  addSystemMessage(content: string) {
    messages.update(msgs => [
      ...msgs,
      {
        id: `system-${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        content,
        timestamp: Date.now(),
        type: 'system'
      }
    ]);
  },

  /**
   * Disconnect and clean up
   */
  disconnect() {
    if (socket) {
      this.leaveRoom();
      socket.disconnect();
      socketConnected.set(false);
    }
  }
};
