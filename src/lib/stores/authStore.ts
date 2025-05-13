// filepath: e:\Computer Science\Projects\OnlineCourse\learnmeet\src\lib\stores\authStore.ts
// Re-export the authentication functionality from our Firebase implementation
export { authStore, type User, UserRole, isTeacher, isAdmin, hasRole } from '../firebase/auth';

/* Original implementation kept as reference but commented out
import { writable } from 'svelte/store';

// Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isTeacher: boolean;
}

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

// Create the store
function createAuthStore() {
  const { subscribe, set, update } = writable(initialState);
  
  return {
    subscribe,
    
    // Sign in a user
    signIn: async (email, password) => {
      update(state => ({ ...state, loading: true, error: null }));
      try {
        // Here, you would implement the actual authentication logic
        // This is a placeholder for now
        
        // Mock successful authentication for now
        const user = {
          id: 'user123',
          email,
          displayName: 'Test User',
          isTeacher: email.includes('teacher')
        };
        
        update(state => ({
          ...state,
          user,
          isAuthenticated: true,
          loading: false
        }));
        
        return user;
      } catch (error) {
        update(state => ({ 
          ...state, 
          error: error.message, 
          loading: false 
        }));
        return null;
      }
    },
    
    // Sign out a user
    signOut: async () => {
      update(state => ({ ...state, loading: true }));
      try {
        // Implement sign out logic here
        
        set(initialState);
        return true;
      } catch (error) {
        update(state => ({ 
          ...state, 
          error: error.message, 
          loading: false 
        }));
        return false;
      }
    },
    
    // Register a new user
    register: async (email, password, displayName, isTeacher = false) => {
      update(state => ({ ...state, loading: true, error: null }));
      try {
        // Implement registration logic here
        
        // Mock successful registration
        const user = {
          id: 'newuser123',
          email,
          displayName,
          isTeacher
        };
        
        update(state => ({
          ...state,
          user,
          isAuthenticated: true,
          loading: false
        }));
        
        return user;
      } catch (error) {
        update(state => ({ 
          ...state, 
          error: error.message, 
          loading: false 
        }));
        return null;
      }
    }
  };
}

export const authStore = createAuthStore();
*/
