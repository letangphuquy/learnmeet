// Firebase configuration for LearnMeet
// This file initializes Firebase services for authentication
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence } from 'firebase/auth';
import { PUBLIC_FIREBASE_API_KEY, PUBLIC_FIREBASE_AUTH_DOMAIN, PUBLIC_FIREBASE_PROJECT_ID,
         PUBLIC_FIREBASE_STORAGE_BUCKET, PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
         PUBLIC_FIREBASE_APP_ID, PUBLIC_FIREBASE_MEASUREMENT_ID } from '$env/static/public';
import { browser } from '$app/environment';

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

// Initialize Firebase
let app;
try {
  // Check if Firebase app is already initialized to prevent duplicate apps
  app = initializeApp(firebaseConfig);
  if (browser) console.log('Firebase initialized successfully');
} catch (error) {
  if (browser) console.error('Error initializing Firebase:', error);
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
