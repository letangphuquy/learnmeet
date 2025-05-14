// Firebase configuration for LearnMeet
// This file initializes Firebase services for authentication
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "learnmeet-app.firebaseapp.com",
  projectId: "learnmeet-app",
  storageBucket: "learnmeet-app.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize authentication service
const auth = getAuth(app);

export { app, auth };
