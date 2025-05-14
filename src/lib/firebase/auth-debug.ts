// Authentication debug utilities
// This file provides test functions to check Firebase authentication functionality
import { browser } from '$app/environment';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential
} from 'firebase/auth';
import { app } from './config';
import { validateFirebaseConfig } from './config-validator';

/**
 * Test user registration functionality directly with Firebase
 * This bypasses application logic to test core Firebase functionality
 */
export async function testRegistration(
  email: string = `test-${Date.now()}@example.com`, 
  password: string = 'Test1234!'
): Promise<{
  success: boolean;
  user: any | null;
  error: string | null;
  rawError: any | null;
  configValid: boolean;
}> {
  if (!browser) {
    return { 
      success: false, 
      user: null, 
      error: "Must run in browser environment",
      rawError: null,
      configValid: false
    };
  }

  // First validate Firebase config
  const configCheck = validateFirebaseConfig();
  
  try {
    // Get auth instance directly to avoid any application-specific issues
    const auth = getAuth(app);
    
    // Attempt to create a new user
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Return success with limited user info
    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified
      },
      error: null,
      rawError: null,
      configValid: configCheck.valid
    };
  } catch (error: any) {
    // Log the error for debugging
    console.error('Test registration error:', error);
    
    return {
      success: false,
      user: null,
      error: error.message || 'Unknown error during test registration',
      rawError: error,
      configValid: configCheck.valid
    };
  }
}

/**
 * Test sign-in functionality directly with Firebase
 * This bypasses application logic to test core Firebase functionality
 */
export async function testSignIn(
  email: string, 
  password: string
): Promise<{
  success: boolean;
  user: any | null;
  error: string | null;
  rawError: any | null;
}> {
  if (!browser) {
    return { 
      success: false, 
      user: null, 
      error: "Must run in browser environment",
      rawError: null
    };
  }
  
  try {
    // Get auth instance directly to avoid any application-specific issues
    const auth = getAuth(app);
    
    // Attempt to sign in
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Return success with limited user info
    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified
      },
      error: null,
      rawError: null
    };
  } catch (error: any) {
    // Log the error for debugging
    console.error('Test sign-in error:', error);
    
    return {
      success: false,
      user: null,
      error: error.message || 'Unknown error during test sign-in',
      rawError: error
    };
  }
}

/**
 * Check Firebase auth instance configuration
 * Returns detailed information about the current auth setup
 */
export function getAuthInstanceDetails(): any {
  if (!browser) {
    return { error: "Must run in browser environment" };
  }
  
  try {
    const auth = getAuth(app);
    
    return {
      initialized: !!auth,
      currentUser: auth.currentUser ? {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        emailVerified: auth.currentUser.emailVerified
      } : null,
      config: {
        apiKey: auth.app.options.apiKey ? 'Set (hidden)' : 'Missing',
        authDomain: auth.app.options.authDomain,
        projectId: auth.app.options.projectId
      },
      tenantId: auth.tenantId || 'default'
    };
  } catch (error: any) {
    return {
      error: error.message || 'Error getting auth details',
      rawError: error
    };
  }
}

/**
 * Runs a basic authentication flow test
 * This tests the complete flow: register → sign in → sign out
 */
export async function testAuthFlow(): Promise<{
  success: boolean;
  stepResults: any[];
  errors: string[];
}> {
  const errors: string[] = [];
  const stepResults: any[] = [];
  let success = true;
  
  if (!browser) {
    return { success: false, stepResults: [], errors: ["Must run in browser environment"] };
  }
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test1234!';
  
  try {
    // Step 1: Register
    const registrationResult = await testRegistration(testEmail, testPassword);
    stepResults.push({ step: 'registration', ...registrationResult });
    
    if (!registrationResult.success) {
      errors.push(`Registration failed: ${registrationResult.error}`);
      success = false;
      return { success, stepResults, errors };
    }
    
    // Step 2: Sign Out (to clear state)
    const auth = getAuth(app);
    await signOut(auth);
    
    // Step 3: Sign In with same credentials
    const signInResult = await testSignIn(testEmail, testPassword);
    stepResults.push({ step: 'signIn', ...signInResult });
    
    if (!signInResult.success) {
      errors.push(`Sign in failed: ${signInResult.error}`);
      success = false;
    }
    
    // Step 4: Sign Out again
    await signOut(auth);
    stepResults.push({ step: 'signOut', success: true });
    
    return { success, stepResults, errors };
  } catch (error: any) {
    errors.push(`Unexpected error in auth flow test: ${error.message}`);
    return { success: false, stepResults, errors };
  }
}
