<!-- Debug page for Firebase authentication testing -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { runDiagnostics, testFirebaseConfig } from '$lib/firebase/debug-tools';
  import { getFirebaseConfigReport } from '$lib/firebase/config-validator';
  import { authStore } from '$lib/stores/authStore';
  import { auth } from '$lib/firebase/config';
  import { testRegistration, testSignIn, testAuthFlow, getAuthInstanceDetails } from '$lib/firebase/auth-debug';
  
  let loading = true;
  let configReport = '';
  let diagnosticsReport = '';
  let testResult = '';
  let authFlowResult: any = null;
  let authInstanceDetails: any = null;
  let success = false;
  let authState: any = {};
  
  let customApiKey = '';
  let customAuthDomain = '';
  let customProjectId = '';
  let customAppId = '';
  let customTestResult = '';
  let customTestLoading = false;
  
  // Get environment variables for display
  let envVars = '';
  if (browser) {
    // Import them directly to prevent bundling issues
    import { 
      PUBLIC_FIREBASE_API_KEY,
      PUBLIC_FIREBASE_AUTH_DOMAIN,
      PUBLIC_FIREBASE_PROJECT_ID,
      PUBLIC_FIREBASE_APP_ID
    } from '$env/static/public';
    
    // Format with stars to hide sensitive info but show it's present
    envVars = `
API Key: ${PUBLIC_FIREBASE_API_KEY ? '✓ ' + PUBLIC_FIREBASE_API_KEY.substring(0, 4) + '****' : '✗ Missing'}
Auth Domain: ${PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ ' + PUBLIC_FIREBASE_AUTH_DOMAIN : '✗ Missing'}
Project ID: ${PUBLIC_FIREBASE_PROJECT_ID ? '✓ ' + PUBLIC_FIREBASE_PROJECT_ID : '✗ Missing'}
App ID: ${PUBLIC_FIREBASE_APP_ID ? '✓ ' + PUBLIC_FIREBASE_APP_ID.substring(0, 4) + '****' : '✗ Missing'}
    `.trim();
  }
  
  onMount(async () => {
    if (browser) {
      // Run basic config test
      const configTest = testFirebaseConfig();
      configReport = configTest.details;
      
      // Subscribe to auth state
      const unsubscribe = authStore.subscribe(state => {
        authState = { 
          isAuthenticated: state.isAuthenticated,
          loading: state.loading,
          error: state.error,
          user: state.user ? {
            ...state.user,
            uid: state.user.uid ? state.user.uid.substring(0, 6) + '***' : null // Mask UID for security
          } : null
        };
      });
      
      loading = false;
      
      return unsubscribe;
    }
  });
  
  async function handleRunDiagnostics() {
    loading = true;
    try {
      const result = await runDiagnostics();
      diagnosticsReport = result.report;
      success = result.success;
    } catch (error) {
      diagnosticsReport = `Error running diagnostics: ${error.message}`;
      success = false;
    } finally {
      loading = false;
    }
  }
    async function handleTestAuth() {
    loading = true;
    testResult = '';
    
    try {
      // Simple test of the auth object
      if (!auth) {
        testResult = 'Auth object does not exist - Firebase initialization failed';
        return;
      }
      
      testResult = 'Auth object exists and appears to be properly initialized!\n\n';
      testResult += `Current user: ${auth.currentUser ? 'Signed in' : 'Not signed in'}\n`;
      testResult += `Auth instance ID: ${auth.app.name}\n`;
      testResult += 'Auth appears to be working correctly.';
      
      // Get detailed auth info
      const details = getAuthInstanceDetails();
      testResult += '\n\n=== Auth Instance Details ===\n';
      testResult += JSON.stringify(details, null, 2);
      
    } catch (error) {
      testResult = `Error testing auth: ${error.message}`;
    } finally {
      loading = false;
    }
  }
  
  async function handleTestRegistration() {
    loading = true;
    testResult = '';
    
    try {
      // Create a test user with a unique email
      const result = await testRegistration();
      testResult = 'Registration Test Result:\n\n';
      testResult += JSON.stringify(result, null, 2);
    } catch (error) {
      testResult = `Error in registration test: ${error.message}`;
    } finally {
      loading = false;
    }
  }
  
  async function handleAuthFlowTest() {
    loading = true;
    testResult = '';
    
    try {
      // Run a complete auth flow test
      const result = await testAuthFlow();
      testResult = 'Auth Flow Test Result:\n\n';
      testResult += JSON.stringify(result, null, 2);
    } catch (error) {
      testResult = `Error in auth flow test: ${error.message}`;
    } finally {
      loading = false;
    }
  }
  
  async function testCustomConfig() {
    customTestLoading = true;
    customTestResult = '';
    
    try {
      // Only include non-empty fields
      const customConfig: any = {};
      if (customApiKey) customConfig.apiKey = customApiKey;
      if (customAuthDomain) customConfig.authDomain = customAuthDomain;
      if (customProjectId) customConfig.projectId = customProjectId;
      if (customAppId) customConfig.appId = customAppId;
      
      // If any field is provided, test it
      if (Object.keys(customConfig).length > 0) {
        // Import directly to avoid bundling issues
        import { initializeApp, deleteApp } from 'firebase/app';
        
        // Create a unique name for the test app
        const testAppName = `test-app-${Date.now()}`;
        
        // Try to initialize with this custom config
        const testApp = initializeApp({
          ...customConfig,
          // Use existing values for any missing fields
          apiKey: customConfig.apiKey || PUBLIC_FIREBASE_API_KEY,
          authDomain: customConfig.authDomain || PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: customConfig.projectId || PUBLIC_FIREBASE_PROJECT_ID,
          appId: customConfig.appId || PUBLIC_FIREBASE_APP_ID
        }, testAppName);
        
        customTestResult = '✅ Firebase app initialized successfully with custom config!';
        
        // Clean up
        await deleteApp(testApp);
        customTestResult += '\n✅ Test app deleted successfully';
      } else {
        customTestResult = 'Please provide at least one custom configuration value to test';
      }
    } catch (error: any) {
      customTestResult = `❌ Error: ${error.message}\n\nThis indicates the custom configuration didn't work. The "auth/configuration-not-found" error is likely to occur with this configuration.`;
    } finally {
      customTestLoading = false;
    }
  }
</script>

<main class="min-h-screen bg-gray-50 py-12 px-4">
  <div class="max-w-3xl mx-auto">
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <h1 class="text-2xl font-bold mb-4">Firebase Authentication Diagnostics</h1>
      <p class="mb-4 text-gray-600">
        This page helps diagnose issues with Firebase authentication configuration.
      </p>
      
      <div class="mb-6 p-4 bg-gray-100 rounded">
        <h2 class="text-lg font-semibold mb-2">Environment Variables</h2>
        <pre class="whitespace-pre-wrap font-mono text-sm">{envVars}</pre>
      </div>
      
      <div class="mb-6 p-4 bg-gray-100 rounded">
        <h2 class="text-lg font-semibold mb-2">Basic Config Check</h2>
        <pre class="whitespace-pre-wrap font-mono text-sm">{configReport}</pre>
      </div>
      
      <div class="mb-6 p-4 bg-gray-100 rounded">
        <h2 class="text-lg font-semibold mb-2">Current Auth State</h2>
        <pre class="whitespace-pre-wrap font-mono text-sm">{JSON.stringify(authState, null, 2)}</pre>
      </div>
        <div class="flex flex-wrap gap-2">
        <button 
          on:click={handleRunDiagnostics}
          disabled={loading}
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Running...' : 'Run Full Diagnostics'}
        </button>
        
        <button 
          on:click={handleTestAuth}
          disabled={loading}
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
        >
          {loading ? 'Testing...' : 'Test Auth Object'}
        </button>
        
        <button 
          on:click={handleTestRegistration}
          disabled={loading}
          class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-300"
        >
          {loading ? 'Testing...' : 'Test Registration'}
        </button>
        
        <button 
          on:click={handleAuthFlowTest}
          disabled={loading}
          class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-yellow-300"
        >
          {loading ? 'Testing...' : 'Test Complete Auth Flow'}
        </button>
      </div>
    </div>
    
    {#if diagnosticsReport}
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-xl font-bold mb-2">Diagnostics Report</h2>
        <div class={`p-4 rounded ${success ? 'bg-green-100' : 'bg-red-100'}`}>
          <pre class="whitespace-pre-wrap font-mono text-sm">{diagnosticsReport}</pre>
        </div>
      </div>
    {/if}
    
    {#if testResult}
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-xl font-bold mb-2">Auth Test Result</h2>
        <div class="p-4 bg-blue-100 rounded">
          <pre class="whitespace-pre-wrap font-mono text-sm">{testResult}</pre>
        </div>
      </div>
    {/if}
    
    <!-- New section for testing custom Firebase config -->
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <h2 class="text-xl font-bold mb-4">Test Custom Firebase Configuration</h2>
      <p class="mb-4 text-gray-600">
        Use this tool to test different Firebase configuration values to resolve the "auth/configuration-not-found" error.
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input
            type="text"
            bind:value={customApiKey}
            placeholder="AIza..."
            class="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Auth Domain</label>
          <input
            type="text"
            bind:value={customAuthDomain}
            placeholder="project-id.firebaseapp.com"
            class="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Project ID</label>
          <input
            type="text"
            bind:value={customProjectId}
            placeholder="project-id"
            class="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">App ID</label>
          <input
            type="text"
            bind:value={customAppId}
            placeholder="1:123456789:web:abcdef"
            class="w-full p-2 border rounded"
          />
        </div>
      </div>
      
      <button 
        on:click={testCustomConfig}
        disabled={customTestLoading}
        class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300"
      >
        {customTestLoading ? 'Testing...' : 'Test Configuration'}
      </button>
      
      {#if customTestResult}
        <div class="mt-4 p-4 bg-gray-100 rounded">
          <pre class="whitespace-pre-wrap font-mono text-sm">{customTestResult}</pre>
        </div>
      {/if}
    </div>
  </div>
</main>
