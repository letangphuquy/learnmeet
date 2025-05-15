// Firebase configuration validator
// This file provides utilities to test and validate Firebase configuration
import { browser } from '$app/environment';
import { 
  PUBLIC_FIREBASE_API_KEY,
  PUBLIC_FIREBASE_AUTH_DOMAIN, 
  PUBLIC_FIREBASE_PROJECT_ID,
  PUBLIC_FIREBASE_STORAGE_BUCKET, 
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  PUBLIC_FIREBASE_APP_ID
} from '$env/static/public';

/**
 * Validates the Firebase configuration by checking if all required 
 * environment variables are provided and properly formed
 */
export function validateFirebaseConfig(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check for missing values
  if (!PUBLIC_FIREBASE_API_KEY) issues.push('Missing API Key');
  if (!PUBLIC_FIREBASE_AUTH_DOMAIN) issues.push('Missing Auth Domain');
  if (!PUBLIC_FIREBASE_PROJECT_ID) issues.push('Missing Project ID');
  if (!PUBLIC_FIREBASE_APP_ID) issues.push('Missing App ID');
  
  // Check format of values
  if (PUBLIC_FIREBASE_API_KEY && PUBLIC_FIREBASE_API_KEY === 'undefined') 
    issues.push('API Key is "undefined" string');
  
  if (PUBLIC_FIREBASE_API_KEY && !PUBLIC_FIREBASE_API_KEY.startsWith('AIza')) 
    issues.push('API Key should start with "AIza"');
  
  if (PUBLIC_FIREBASE_AUTH_DOMAIN && !PUBLIC_FIREBASE_AUTH_DOMAIN.includes('.firebaseapp.com')) 
    issues.push('Auth Domain should end with .firebaseapp.com');
  
  if (PUBLIC_FIREBASE_APP_ID && !PUBLIC_FIREBASE_APP_ID.includes(':')) 
    issues.push('App ID format is incorrect');
    
  // Check for potential causes of "auth/configuration-not-found"
  if (PUBLIC_FIREBASE_API_KEY && PUBLIC_FIREBASE_AUTH_DOMAIN && PUBLIC_FIREBASE_PROJECT_ID) {
    try {
      const url = `https://identitytoolkit.googleapis.com/v1/accounts?key=${PUBLIC_FIREBASE_API_KEY}`;
      if (browser) {
        fetch(url, { method: 'HEAD' })
          .catch(() => {
            // We can't actually check this synchronously, but we'll add the issue if there's an API problem
            console.warn('Firebase API Key might be invalid or API access might be blocked');
          });
      }
    } catch (error) {
      // Just skip this check if it fails
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Creates a debugging report for Firebase configuration
 */
export function getFirebaseConfigReport(): string {
  const validation = validateFirebaseConfig();
  
  return `
Firebase Configuration Status:
----------------------------
API Key: ${PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}
Auth Domain: ${PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing'}
Project ID: ${PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}
Storage Bucket: ${PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '⚠️ Optional but missing'}
Messaging Sender ID: ${PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '⚠️ Optional but missing'}
App ID: ${PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing'}

Validation Result: ${validation.valid ? '✅ Valid' : '❌ Invalid'}
${validation.issues.length > 0 ? 'Issues:\n- ' + validation.issues.join('\n- ') : 'No issues found.'}

Environment: ${browser ? 'Browser' : 'Server'}
  `.trim();
}

// Log configuration issues in development mode
if (browser && import.meta.env.DEV) {
  const validation = validateFirebaseConfig();
  if (!validation.valid) {
    console.warn('⚠️ Firebase configuration issues detected:');
    validation.issues.forEach(issue => console.warn(`- ${issue}`));
    console.log('Full configuration report:\n', getFirebaseConfigReport());
  }
}
