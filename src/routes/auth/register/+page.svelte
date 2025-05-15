<!-- Registration page for LearnMeet -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore, UserRole } from '$lib/stores/authStore';
  import Button from '$lib/components/ui/Button.svelte';
  
  let email = '';
  let password = '';
  let confirmPassword = '';
  let displayName = '';
  let role = UserRole.Student;
  let loading = false;
  let error = '';
  
  async function handleRegistration() {
    // Basic validation
    if (!email || !password || !displayName) {
      error = 'Please fill in all required fields';
      return;
    }
    
    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }
    
    if (password.length < 8) {
      error = 'Password must be at least 8 characters';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      const user = await authStore.register(email, password, displayName, role);
      if (user) {
        // Navigate to a verification page or dashboard
        goto('/auth/verify-email');
      }
    } catch (err: any) {
      error = err.message || 'Failed to register';
    } finally {
      loading = false;
    }
  }
</script>

<main class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Create your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or <a href="/auth/signin" class="font-medium text-primary-600 hover:text-primary-500">
          sign in to your existing account
        </a>
      </p>
    </div>
    
    <form class="mt-8 space-y-6" on:submit|preventDefault={handleRegistration}>
      {#if error}
        <div class="p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      {/if}
      
      <div class="rounded-md -space-y-px">
        <div class="mb-4">
          <label for="displayName" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            bind:value={displayName}
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Full name"
          />
        </div>
        
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            bind:value={email}
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Email address"
          />
        </div>
        
        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="new-password"
            required
            bind:value={password}
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Password (min 8 characters)"
          />
        </div>
        
        <div class="mb-4">
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autocomplete="new-password"
            required
            bind:value={confirmPassword}
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Confirm password"
          />
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
          <div class="flex space-x-4">
            <label class="flex items-center">
              <input 
                type="radio" 
                name="role" 
                value={UserRole.Student} 
                bind:group={role} 
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span class="ml-2 text-gray-700">Student</span>
            </label>
            
            <label class="flex items-center">
              <input 
                type="radio" 
                name="role" 
                value={UserRole.Teacher} 
                bind:group={role} 
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span class="ml-2 text-gray-700">Teacher</span>
            </label>
          </div>
        </div>
      </div>
      
      <div>
        <Button 
          type="submit" 
          fullWidth={true} 
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </div>
      
      <div class="text-sm text-center">
        <p class="text-gray-600">
          By creating an account, you agree to our 
          <a href="/terms" class="font-medium text-primary-600 hover:text-primary-500">
            Terms of Service
          </a> and 
          <a href="/privacy" class="font-medium text-primary-600 hover:text-primary-500">
            Privacy Policy
          </a>.
        </p>
      </div>
    </form>
  </div>
</main>
