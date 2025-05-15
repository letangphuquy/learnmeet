# Firebase Console Setup Guide for LearnMeet

This guide explains how to properly set up your Firebase project to avoid the "auth/configuration-not-found" error.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Enter a project name (e.g., "LearnMeet") and follow the creation steps
4. Once created, you'll be taken to the project overview page

## Step 2: Enable Authentication

1. In the Firebase Console, click on **Authentication** in the left sidebar
2. Click on the **Get started** button
3. Under the **Sign-in providers** tab, click on **Email/Password**
4. Toggle the **Enable** switch to **ON**
5. Click **Save**

## Step 3: Register Your Web App

1. From the project overview page, click on the web icon (</>) to add a web app
2. Enter your app's nickname (e.g., "LearnMeet Web")
3. Check the box for "Also set up Firebase Hosting" if desired
4. Click **Register app**
5. You'll see your Firebase configuration. It should look like:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

6. Copy these values to your `.env` file (make sure they match exactly!)

## Step 4: Configure Firebase Auth for Web Use

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your app's domain (during development, add "localhost")
3. Click **Add domain**

## Step 5: Check Project Settings

1. Go to **Project settings** (gear icon in top left)
2. Under the **General** tab, scroll down to "Your apps" section
3. Click on your web app
4. Verify that all the config values match what's in your `.env` file

## Common Issues and Solutions

### "auth/configuration-not-found" Error

This error typically indicates:

- **Incorrect API Key**: Verify your API key in Firebase Console → Project settings → Web app configuration 
- **Project Not Found**: Ensure your project ID is correct and the project is active
- **Missing Authentication Setup**: Check if Email/Password authentication is enabled
- **Domain Not Authorized**: Add your domain to the authorized domains list

### Testing Your Configuration

1. Navigate to the `/debug/firebase` page in your LearnMeet app
2. Use the diagnostic tools to verify your Firebase configuration
3. The custom configuration tester can help diagnose specific issues

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Web Setup Guide](https://firebase.google.com/docs/web/setup)
- [Firebase Authentication Error Codes](https://firebase.google.com/docs/auth/admin/errors)

Remember to restart your development server after making changes to your Firebase configuration or `.env` file!
