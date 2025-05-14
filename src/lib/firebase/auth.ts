// Firebase authentication service for LearnMeet
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type UserCredential,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth } from './config';
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// User interface
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  emailVerified: boolean;
  role: UserRole;
}

export enum UserRole {
  Student = 'student',
  Teacher = 'teacher',
  Admin = 'admin'
}

// Auth store state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true, // Start with loading true to check auth state
  error: null
};

// Create the auth store
function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  // Transform Firebase User to our User model
  function transformUser(firebaseUser: FirebaseUser): User {
    // Get user role from custom claims or default to Student
    // For now, determine role by email domain as a simple example
    // In a real app, this would come from custom claims or a database
    const isTeacher = firebaseUser.email?.includes('teacher') || false;
    const isAdmin = firebaseUser.email?.includes('admin') || false;
    
    let role = UserRole.Student;
    if (isTeacher) role = UserRole.Teacher;
    if (isAdmin) role = UserRole.Admin;

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      role
    };
  }
  // Initialize listener for authentication state changes with error handling
  try {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user = transformUser(firebaseUser);
        update(state => ({
          ...state,
          user,
          isAuthenticated: true,
          loading: false,
          error: null // Clear any previous errors
        }));
      } else {
        update(state => ({
          ...state,
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null // Clear any previous errors
        }));
      }
    }, (error) => {
      // This error handler catches auth state changes errors
      console.error('Auth state change error:', error);
      update(state => ({
        ...state,
        loading: false,
        error: error.message || 'Authentication service failed'
      }));
    });
  } catch (initError) {
    console.error('Failed to initialize auth listener:', initError);
    update(state => ({
      ...state,
      loading: false,
      error: 'Failed to initialize authentication'
    }));
  }
  
  return {
    subscribe,
      // Sign in a user with email and password
    signIn: async (email: string, password: string, rememberMe: boolean = false): Promise<User | null> => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        // Set persistence based on remember me checkbox
        // This is handled separately from the signIn to avoid unnecessary imports in this file
        
        const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = transformUser(userCredential.user);
        
        return user;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to sign in';
        update(state => ({ 
          ...state, 
          error: errorMessage, 
          loading: false 
        }));
        throw new Error(errorMessage);
      }
    },
    
    // Sign out the current user
    signOut: async (): Promise<boolean> => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        await firebaseSignOut(auth);
        return true;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to sign out';
        update(state => ({ 
          ...state, 
          error: errorMessage, 
          loading: false 
        }));
        throw new Error(errorMessage);
      }
    },
      // Register a new user
    register: async (email: string, password: string, displayName: string, role: UserRole = UserRole.Student): Promise<User | null> => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        if (browser && import.meta.env.DEV) {
          console.log('Starting user registration process for:', email);
        }
        
        // Validate auth object exists
        if (!auth) {
          throw new Error('Firebase auth is not initialized. Check your configuration.');
        }
        
        // Create the user
        const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        if (browser && import.meta.env.DEV) {
          console.log('User created successfully, updating profile');
        }
        
        // Update profile with display name
        await updateProfile(userCredential.user, { displayName });
        
        // Send email verification
        await sendEmailVerification(userCredential.user);
        
        // Transform and return user
        const user = transformUser(userCredential.user);
        
        return user;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to register';
        update(state => ({ 
          ...state, 
          error: errorMessage, 
          loading: false 
        }));
        throw new Error(errorMessage);
      }
    },
    
    // Send password reset email
    resetPassword: async (email: string): Promise<boolean> => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        await sendPasswordResetEmail(auth, email);
        update(state => ({ ...state, loading: false }));
        return true;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to send password reset email';
        update(state => ({ 
          ...state, 
          error: errorMessage, 
          loading: false 
        }));
        throw new Error(errorMessage);
      }
    }
  };
}

// Create the auth store instance
export const authStore = createAuthStore();

// Create a derived store for user role-based authorization
export const isTeacher = derived(authStore, $authStore => 
  $authStore.user?.role === UserRole.Teacher
);

export const isAdmin = derived(authStore, $authStore => 
  $authStore.user?.role === UserRole.Admin
);

// Helper function to check if user has required role
export function hasRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}
