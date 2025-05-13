<script>
  export let type = 'button';
  export let variant = 'primary';
  export let size = 'md';
  export let disabled = false;
  export let fullWidth = false;
  
  const sizeClasses = {
    sm: 'py-1 px-2 text-sm',
    md: 'py-2 px-4',
    lg: 'py-3 px-6 text-lg',
  };
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-400',
  };
</script>

<button
  {type}
  on:click
  {disabled}
  class="rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
         {sizeClasses[size]} 
         {variantClasses[variant]} 
         {fullWidth ? 'w-full' : ''}
         {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
>
  <slot />
</button>
