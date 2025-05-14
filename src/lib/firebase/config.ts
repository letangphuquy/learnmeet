// Firebase configuration for LearnMeet
// This file initializes Firebase services for authentication
import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence } from 'firebase/auth';
import { PUBLIC_FIREBASE_API_KEY, PUBLIC_FIREBASE_AUTH_DOMAIN, PUBLIC_FIREBASE_PROJECT_ID,
         PUBLIC_FIREBASE_STORAGE_BUCKET, PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
         PUBLIC_FIREBASE_APP_ID, PUBLIC_FIREBASE_MEASUREMENT_ID } from '$env/static/public';
import { browser } from '$app/environment';
import { validateFirebaseConfig, getFirebaseConfigReport } from './config-validator';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: PUBLIC_FIREBASE_API_KEY,
  authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: PUBLIC_FIREBASE_APP_ID,
  measurementId: PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate configuration before initialization
if (browser) {
  const { valid, issues } = validateFirebaseConfig();
  if (!valid) {
    console.error('⚠️ Invalid Firebase configuration:', issues);
    console.info(getFirebaseConfigReport());
  }
}

// Debug output for configuration
if (browser && import.meta.env.DEV) {
  console.log('Firebase Config:', {
    apiKey: PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
    authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ Set' : '✗ Missing',
    projectId: PUBLIC_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing',
    storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET ? '✓ Set' : '✗ Missing',
    messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓ Set' : '✗ Missing',
    appId: PUBLIC_FIREBASE_APP_ID ? '✓ Set' : '✗ Missing',
    measurementId: PUBLIC_FIREBASE_MEASUREMENT_ID ? '✓ Set' : '✗ Missing',
  });
}

// Initialize Firebase with proper error handling
let app: FirebaseApp;
try {
  // Validate that we have minimal required config values
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    throw new Error('Missing required Firebase configuration values. Check your .env file.');
  }

  // Check API key format to prevent auth/configuration-not-found error
  if (!firebaseConfig.apiKey.startsWith('AIza')) {
    throw new Error('Invalid Firebase API key format. API keys should start with "AIza".');
  }

  // Validate auth domain format
  if (!firebaseConfig.authDomain.includes('.firebaseapp.com')) {
    throw new Error('Invalid Firebase Auth Domain format. Should end with .firebaseapp.com');
  }

  // Check if Firebase app is already initialized to prevent duplicate apps
  const existingApps = getApps();
  if (existingApps.length > 0) {
    // Use existing app if available
    app = existingApps[0];
    if (browser) console.log('Using existing Firebase app');
  } else {
    // Initialize new app if no existing app is found
    app = initializeApp(firebaseConfig);
    if (browser) console.log('Firebase initialized successfully with new app');
  }
} catch (error: any) {
  if (browser) {
    console.error('Error initializing Firebase:', error);
    
    // Special handling for API key issues which often cause configuration-not-found
    if (error.message.includes('API key')) {
      console.error('❌ API Key validation failed. This is likely causing the "auth/configuration-not-found" error.');
    }
    
    console.error('Firebase Config (redacted):', {
      apiKey: firebaseConfig.apiKey ? '✓ Set (starts with: ' + firebaseConfig.apiKey.substring(0, 4) + '...)' : '✗ Missing',
      authDomain: firebaseConfig.authDomain ? '✓ Set' : '✗ Missing',
      projectId: firebaseConfig.projectId ? '✓ Set' : '✗ Missing',
      storageBucket: firebaseConfig.storageBucket ? '✓ Set' : '✗ Missing',
      messagingSenderId: firebaseConfig.messagingSenderId ? '✓ Set' : '✗ Missing',
      appId: firebaseConfig.appId ? '✓ Set' : '✗ Missing',
    });
    
    // Try to provide a helpful error message
    error.code = error.code || (error.message.includes('API key') ? 'auth/invalid-api-key' : 'auth/initialization-error');
  }
  throw error;
}

// Initialize authentication service
const auth = getAuth(app);

// Persistence types for reference
export const authPersistence = {
  LOCAL: browserLocalPersistence,    // Persists even when browser is closed
  SESSION: browserSessionPersistence, // Persists until browser is closed
  NONE: inMemoryPersistence         // No persistence (clears on page refresh)
};

export { app, auth };
