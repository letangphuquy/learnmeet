<script>
  import Button from '$lib/components/ui/Button.svelte';
</script>

<main class="min-h-screen bg-gradient-to-b from-primary-100 to-white">
  <div class="container mx-auto px-4 py-12 md:py-24">
    <div class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-bold text-primary-800 mb-4">LearnMeet</h1>
      <p class="text-xl text-gray-700 max-w-2xl mx-auto">
        A powerful online meeting platform designed specifically for education.
        Connect, teach, and learn from anywhere in the world.
      </p>
    </div>
    
    <div class="flex flex-col md:flex-row items-center justify-center gap-8">
      <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 class="text-2xl font-semibold mb-6 text-center text-primary-800">
          Start or Join a Meeting
        </h2>
        <div class="space-y-4">
          <Button fullWidth={true} variant="primary">Create New Meeting</Button>
          <Button fullWidth={true} variant="secondary">Join Meeting</Button>
        </div>
      </div>
      
      <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 class="text-2xl font-semibold mb-6 text-center text-primary-800">
          Sign In to Your Account
        </h2>
        <div class="space-y-4">
          <Button fullWidth={true} variant="primary">Sign In</Button>
          <Button fullWidth={true} variant="ghost">Create Account</Button>
        </div>
      </div>
    </div>
    
    <div class="mt-20 text-center">
      <h2 class="text-3xl font-semibold text-primary-800 mb-8">Features</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="p-6 bg-white rounded-lg shadow">
          <h3 class="text-xl font-semibold mb-3 text-primary-700">Video Conferencing</h3>
          <p>High-quality video and audio for seamless virtual classrooms.</p>
        </div>
        
        <div class="p-6 bg-white rounded-lg shadow">
          <h3 class="text-xl font-semibold mb-3 text-primary-700">Screen Sharing</h3>
          <p>Share presentations, documents, and more with your students.</p>
        </div>
        
        <div class="p-6 bg-white rounded-lg shadow">
          <h3 class="text-xl font-semibold mb-3 text-primary-700">Recording</h3>
          <p>Record your sessions for students to review later.</p>
        </div>
      </div>
    </div>
  </div>
</main>
