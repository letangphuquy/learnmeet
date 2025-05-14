// Debug tools for Firebase authentication troubleshooting
import { browser } from '$app/environment';
import { 
  PUBLIC_FIREBASE_API_KEY, 
  PUBLIC_FIREBASE_AUTH_DOMAIN, 
  PUBLIC_FIREBASE_PROJECT_ID,
  PUBLIC_FIREBASE_STORAGE_BUCKET,
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  PUBLIC_FIREBASE_APP_ID,
  PUBLIC_FIREBASE_MEASUREMENT_ID
} from '$env/static/public';
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';

/**
 * Runs a series of diagnostic tests on Firebase configuration
 * This function should be used only in development mode to troubleshoot auth issues
 */
export async function runDiagnostics(): Promise<{ success: boolean; report: string }> {
  if (!browser) {
    return { success: false, report: 'Diagnostics must run in browser environment' };
  }
  
  const issues: string[] = [];
  const results: string[] = [];
  let success = true;
  
  // Step 1: Check environment variables
  results.push('== Environment Variables Check ==');
  try {
    const envVars = {
      apiKey: PUBLIC_FIREBASE_API_KEY,
      authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: PUBLIC_FIREBASE_APP_ID,
      measurementId: PUBLIC_FIREBASE_MEASUREMENT_ID
    };
    
    // Check required vars
    const requiredVars = ['apiKey', 'authDomain', 'projectId', 'appId'];
    for (const key of requiredVars) {
      if (!envVars[key]) {
        issues.push(`Missing required Firebase config: ${key}`);
        success = false;
      } else {
        results.push(`✓ ${key}: Present`);
      }
    }
    
    // Check for typical configuration format errors
    if (envVars.apiKey && envVars.apiKey.startsWith('AIza')) {
      results.push('✓ API Key format appears correct');
    } else if (envVars.apiKey) {
      issues.push('API Key format is incorrect (should start with "AIza")');
      success = false;
    }
    
    if (envVars.authDomain && envVars.authDomain.includes('.firebaseapp.com')) {
      results.push('✓ Auth Domain format appears correct');
    } else if (envVars.authDomain) {
      issues.push('Auth Domain format is incorrect (should contain ".firebaseapp.com")');
      success = false;
    }
  } catch (error) {
    issues.push(`Error checking environment variables: ${error.message}`);
    success = false;
  }
  
  // Step 2: Check Firebase initialization
  results.push('\n== Firebase Initialization Check ==');
  try {
    // Clear existing apps to avoid conflicts
    const existingApps = getApps();
    if (existingApps.length > 0) {
      results.push(`Found ${existingApps.length} existing Firebase app(s)`);
      // We don't delete existing apps as that could break the main app
    } else {
      results.push('No existing Firebase apps found');
    }
    
    // Create a test configuration
    const testConfig = {
      apiKey: PUBLIC_FIREBASE_API_KEY,
      authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: PUBLIC_FIREBASE_APP_ID,
      measurementId: PUBLIC_FIREBASE_MEASUREMENT_ID
    };
    
    // Try to initialize with this config
    const testApp = initializeApp(testConfig, 'diagnostic-app');
    results.push('✓ Firebase app initialized successfully');
    
    // Test auth initialization
    const testAuth = getAuth(testApp);
    results.push('✓ Firebase auth initialized successfully');
    
    // Clean up
    await deleteApp(testApp);
    results.push('✓ Test app deleted successfully');
  } catch (error) {
    issues.push(`Error initializing Firebase: ${error.message}`);
    success = false;
  }
  
  // Step 3: Test an actual auth operation if previous steps passed
  if (success) {
    results.push('\n== Firebase Auth Operation Test ==');
    try {
      // Create a temporary app for testing
      const tempApp = initializeApp({
        apiKey: PUBLIC_FIREBASE_API_KEY,
        authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: PUBLIC_FIREBASE_PROJECT_ID,
        appId: PUBLIC_FIREBASE_APP_ID
      }, 'temp-auth-test');
      
      const tempAuth = getAuth(tempApp);
      
      // Try anonymous sign-in as a simple auth operation test
      await signInAnonymously(tempAuth);
      results.push('✓ Anonymous authentication successful - Firebase is working!');
      
      // Clean up
      await tempAuth.signOut();
      await deleteApp(tempApp);
      results.push('✓ Test cleanup successful');
    } catch (error) {
      issues.push(`Error testing authentication: ${error.message}`);
      success = false;
    }
  }
  
  // Compile final report
  const report = `
Firebase Authentication Diagnostics Report
=========================================
${results.join('\n')}

${issues.length > 0 ? `\nIssues Found (${issues.length}):\n${issues.map(i => '! ' + i).join('\n')}` : '\nNo issues found! 🎉'}

Test completed at: ${new Date().toLocaleString()}
  `.trim();
  
  return { success, report };
}

/**
 * Test Firebase configuration without performing any auth operations
 * Useful for quick validation of configuration values
 */
export function testFirebaseConfig(): { isValid: boolean; details: string } {
  const config = {
    apiKey: PUBLIC_FIREBASE_API_KEY,
    authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: PUBLIC_FIREBASE_APP_ID,
    measurementId: PUBLIC_FIREBASE_MEASUREMENT_ID
  };
  
  const issues: string[] = [];
  
  // Check required fields
  if (!config.apiKey) issues.push('Missing API Key');
  if (!config.authDomain) issues.push('Missing Auth Domain');
  if (!config.projectId) issues.push('Missing Project ID');
  if (!config.appId) issues.push('Missing App ID');
  
  // Format validation
  if (config.apiKey && !config.apiKey.startsWith('AIza')) {
    issues.push('API Key format appears invalid (should start with "AIza")');
  }
  
  if (config.authDomain && !config.authDomain.includes('.firebaseapp.com')) {
    issues.push('Auth Domain format appears invalid (should contain ".firebaseapp.com")');
  }
  
  // Build response
  const details = issues.length > 0 
    ? `Configuration issues found:\n- ${issues.join('\n- ')}` 
    : 'Firebase configuration appears valid';
  
  return { 
    isValid: issues.length === 0,
    details
  };
}
