import { writable } from 'svelte/store';
import type SimplePeer from 'simple-peer';

// Types
export interface PeerConnection {
  id: string;
  peer: SimplePeer.Instance;
  stream?: MediaStream;
  username?: string;
}

// Create stores for managing peers and streams
export const localStream = writable<MediaStream | null>(null);
export const peerConnections = writable<Map<string, PeerConnection>>(new Map());
export const activeSpeaker = writable<string | null>(null);

// Service for handling WebRTC connections
export const webrtcService = {
  /**
   * Initialize the local media stream with video and audio
   */
  async initLocalStream(videoEnabled = true, audioEnabled = true) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: audioEnabled
      });
      
      localStream.set(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  },
  
  /**
   * Toggle video on/off
   */
  toggleVideo(enabled: boolean) {
    localStream.update(stream => {
      if (stream) {
        stream.getVideoTracks().forEach(track => {
          track.enabled = enabled;
        });
      }
      return stream;
    });
  },
  
  /**
   * Toggle audio on/off
   */
  toggleAudio(enabled: boolean) {
    localStream.update(stream => {
      if (stream) {
        stream.getAudioTracks().forEach(track => {
          track.enabled = enabled;
        });
      }
      return stream;
    });
  },
  
  /**
   * Start screen sharing
   */
  async startScreenShare() {
    try {
      // @ts-ignore - TypeScript doesn't recognize getDisplayMedia
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      // Replace the video track in the local stream
      let currentStream: MediaStream | null = null;
      localStream.update(stream => {
        if (stream) {
          currentStream = stream;
          const videoTrack = displayStream.getVideoTracks()[0];
          
          const senders = this.getPeerSenders();
          senders.forEach(sender => {
            if (sender.track?.kind === 'video') {
              sender.replaceTrack(videoTrack);
            }
          });
          
          // Replace track in local stream
          const oldVideoTracks = stream.getVideoTracks();
          oldVideoTracks.forEach(track => stream.removeTrack(track));
          stream.addTrack(videoTrack);
        }
        return stream;
      });
      
      // Stop screen sharing when the user ends it
      displayStream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopScreenShare();
      });
      
      return displayStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  },
  
  /**
   * Stop screen sharing and revert to camera
   */
  async stopScreenShare() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];
      
      localStream.update(currentStream => {
        if (currentStream) {
          // Replace screen share track with camera track
          const oldVideoTracks = currentStream.getVideoTracks();
          oldVideoTracks.forEach(track => currentStream.removeTrack(track));
          currentStream.addTrack(videoTrack);
          
          // Update all peer connections
          const senders = this.getPeerSenders();
          senders.forEach(sender => {
            if (sender.track?.kind === 'video') {
              sender.replaceTrack(videoTrack);
            }
          });
        }
        return currentStream;
      });
    } catch (error) {
      console.error('Error stopping screen share:', error);
      throw error;
    }
  },
  
  /**
   * Clean up and release resources
   */
  cleanup() {
    localStream.update(stream => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      return null;
    });
    
    peerConnections.update(connections => {
      connections.forEach(connection => {
        connection.peer.destroy();
      });
      return new Map();
    });
  },
  
  /**
   * Helper method to get all RTCRtpSenders from peer connections
   */
  getPeerSenders() {
    const senders: RTCRtpSender[] = [];
    let connections: Map<string, PeerConnection> = new Map();
    
    peerConnections.subscribe(val => {
      connections = val;
    })();
    
    connections.forEach(connection => {
      // @ts-ignore - Type definitions mismatch
      const peerSenders = connection.peer._pc?.getSenders();
      if (peerSenders) {
        senders.push(...peerSenders);
      }
    });
    
    return senders;
  }
};
