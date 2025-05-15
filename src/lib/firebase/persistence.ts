// Firebase persistence helper for authentication
import { auth, authPersistence } from './config';
import { setPersistence } from 'firebase/auth';
import { browser } from '$app/environment';

/**
 * Sets the Firebase authentication persistence mode
 * @param rememberMe - If true, uses local persistence (persists after browser close)
 * @returns Promise that resolves when persistence is set
 */
export async function setAuthPersistence(rememberMe: boolean = false): Promise<void> {
  if (!browser) return;
  
  try {
    // Choose persistence type based on rememberMe flag
    const persistenceType = rememberMe 
      ? authPersistence.LOCAL    // Persists even after browser is closed
      : authPersistence.SESSION; // Persists until browser is closed
      
    await setPersistence(auth, persistenceType);
    console.log(`Auth persistence set to: ${rememberMe ? 'LOCAL' : 'SESSION'}`);
  } catch (error) {
    console.error('Error setting auth persistence:', error);
    // Fall back to default persistence
  }
}
