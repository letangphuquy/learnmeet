# Resolving the "auth/configuration-not-found" Error

This guide provides steps to resolve the common "auth/configuration-not-found" error that occurs in Firebase authentication.

## Understanding the Error

The `auth/configuration-not-found` error typically occurs when:

1. The Firebase API key is incorrect or invalid
2. The Firebase project ID doesn't match a valid Firebase project
3. The Firebase auth domain is incorrectly formatted
4. The Firebase app ID is incorrect or missing
5. The Firebase project hasn't been properly configured for authentication in the Firebase console

## Step-by-step Resolution

### 1. Check Environment Variables

First, verify that your `.env` file contains the correct Firebase configuration values:

```
PUBLIC_FIREBASE_API_KEY=AIza...
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEF123
```

Make sure:
- API key starts with "AIza"
- Auth domain ends with `.firebaseapp.com`
- Project ID matches your Firebase project
- App ID is in the format `1:123456789:web:abcdef`

### 2. Use the Debug Page

The `/debug/firebase` page provides tools to test and validate your Firebase configuration:

1. Go to `/debug/firebase` in your browser
2. Check the "Environment Variables" section to confirm your values are loaded
3. Click "Run Full Diagnostics" to perform comprehensive tests
4. Click "Test Registration" to attempt a direct Firebase registration
5. Use the "Test Custom Firebase Configuration" section to try alternative configuration values

### 3. Common Solutions

For `auth/configuration-not-found` errors, try these solutions:

- **API Key Issues**: Verify your API key in the Firebase console under Project Settings > General
- **Project Not Found**: Check that your project ID matches an active Firebase project
- **Auth Domain Mismatch**: Ensure the auth domain matches your Firebase project ID (usually `[PROJECT_ID].firebaseapp.com`)
- **Authentication Not Enabled**: In the Firebase console, go to Authentication > Sign-in method and enable Email/Password authentication

### 4. Checking Firebase Console Settings

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Project Settings > General
4. Verify the Web SDK configuration matches your `.env` file
5. Navigate to Authentication > Sign-in method
6. Ensure Email/Password authentication is enabled

### 5. Using the Auth Debug Tools

The `auth-debug.ts` file provides utilities to directly test Firebase authentication:

```typescript
import { testRegistration, testSignIn, testAuthFlow } from '$lib/firebase/auth-debug';

// Test registration directly
const registrationResult = await testRegistration();

// Test a complete auth flow
const flowResult = await testAuthFlow();
```

### Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Common Firebase Authentication Error Codes](https://firebase.google.com/docs/auth/admin/errors)

## Contact Support

If you continue to experience issues after following this guide, please contact the development team with:

1. The full error message from the console
2. A screenshot of the `/debug/firebase` page results
3. Your environment configuration (with sensitive values redacted)
