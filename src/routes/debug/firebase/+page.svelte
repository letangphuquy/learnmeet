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
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-bold mb-2">Auth Test Result</h2>
        <div class="p-4 bg-blue-100 rounded">
          <pre class="whitespace-pre-wrap font-mono text-sm">{testResult}</pre>
        </div>
      </div>
    {/if}
  </div>
</main>
