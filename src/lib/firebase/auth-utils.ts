// Authentication utilities for LearnMeet
import { goto } from '$app/navigation';
import { authStore, type User } from '$lib/stores/authStore';
import { browser } from '$app/environment';
import { get } from 'svelte/store';

// Check if user is authenticated and redirect if needed
export async function checkAuth(redirectTo: string = '/auth/signin'): Promise<User | null> {
  if (!browser) {
    return null;
  }

  const authState = get(authStore);
  
  // If loading, wait for it to complete
  if (authState.loading) {
    return new Promise((resolve) => {
      const unsubscribe = authStore.subscribe((state) => {
        if (!state.loading) {
          unsubscribe();
          if (!state.isAuthenticated) {
            goto(redirectTo);
            resolve(null);
          } else {
            resolve(state.user);
          }
        }
      });
    });
  }
  
  // If not loading and not authenticated, redirect
  if (!authState.isAuthenticated) {
    goto(redirectTo);
    return null;
  }
  
  return authState.user;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (!browser) {
    return false;
  }
  
  const authState = get(authStore);
  return authState.isAuthenticated;
}

// Check if current user has required role
export function hasRequiredRole(requiredRoles: string[]): boolean {
  if (!browser) {
    return false;
  }
  
  const authState = get(authStore);
  if (!authState.isAuthenticated || !authState.user) {
    return false;
  }
  
  return requiredRoles.includes(authState.user.role);
}

// Handle authentication errors with friendly messages
export function getAuthErrorMessage(error: any): string {
  const errorCode = error?.code || '';
  
  // Common Firebase auth error codes
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'This email is already in use. Try signing in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password.';
    case 'auth/invalid-email':
      return 'Invalid email address. Please check and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many sign-in attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/configuration-not-found':
      return 'Firebase configuration error. Please make sure your .env file is set up correctly and the Firebase project is properly configured.';
    case 'auth/internal-error':
      return 'An internal authentication error occurred. Please try again later.';
    case 'auth/operation-not-allowed':
      return 'Email/password authentication is not enabled in Firebase console.';
    default:
      return error?.message || 'An error occurred during authentication.';
  }
}
