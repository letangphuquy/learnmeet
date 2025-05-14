# Resolving "auth/configuration-not-found" Error in LearnMeet

If you're encountering the "auth/configuration-not-found" error when trying to register or sign in, follow these steps to resolve the issue.

## Step 1: Check Firebase Console Setup

The most common cause of this error is improper setup in the Firebase Console. Follow these steps:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one if needed)
3. Enable Authentication:
   - Click on **Authentication** in the left sidebar
   - Go to **Sign-in method** tab
   - Enable **Email/Password** provider

For detailed Firebase Console setup instructions, see our [Firebase Console Setup Guide](./firebase-console-setup-guide.md).

## Step 2: Verify Your .env Configuration

Make sure your `.env` file has the correct values:

1. In Firebase Console, go to **Project settings** (gear icon)
2. Scroll down to **Your apps** section and click on your web app
3. Copy the Firebase configuration values
4. Compare them with your `.env` file and update if necessary:

```
PUBLIC_FIREBASE_API_KEY=AIza...
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Important:** After changing `.env` values, restart your development server!

## Step 3: Use the Debug Page

We've created a special debug page to help diagnose and fix authentication issues:

1. Navigate to `/debug/firebase` in your browser
2. Run the diagnostic tests to check your configuration
3. Use the "Test Registration" button to attempt registration directly
4. If needed, try the "Test Custom Configuration" section to test with different values

## Step 4: Check for Common Issues

If you're still seeing the error, check these common problems:

- **Incorrect API Key**: Make sure your API key starts with "AIza"
- **Auth Domain Format**: Should be `[your-project-id].firebaseapp.com`
- **Web App Not Registered**: Make sure you've added a web app in Firebase Console
- **Authorized Domains**: Add `localhost` to authorized domains in Authentication settings
- **Firebase Plan**: Some features require a paid Firebase plan (Blaze)

## Step 5: Enable Required Firebase Services

For complete functionality, enable these Firebase services:

1. **Authentication** - For user management
2. **Firestore Database** - For storing application data
3. **Storage** - For file uploads

## Step 6: Restart and Clear Cache

Sometimes cached data can cause issues:

1. Restart your development server: `npm run dev`
2. Clear your browser cache and cookies
3. Try sign in/registration in an incognito/private window

## Still Having Issues?

If you're still encountering problems:

1. Check browser console logs for specific error messages
2. Run `git pull` to ensure you have the latest fixes
3. Check your Firebase project's usage limits
4. Make sure Firebase APIs are enabled in the Google Cloud Console
5. Contact the development team with your debug page results

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Web Setup Guide](https://firebase.google.com/docs/web/setup)
- [LearnMeet Debugging Firebase Authentication](./debugging-firebase-auth.md)
