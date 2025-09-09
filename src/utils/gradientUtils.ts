// Generate a unique gradient based on a string (like post ID or title)
export function generateGradient(seed: string): string {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Predefined beautiful gradient combinations
  const gradients = [
    'from-purple-400 via-pink-500 to-red-500',
    'from-blue-400 via-purple-500 to-pink-500',
    'from-green-400 via-blue-500 to-purple-600',
    'from-yellow-400 via-orange-500 to-red-500',
    'from-pink-400 via-purple-500 to-indigo-500',
    'from-indigo-400 via-purple-500 to-pink-500',
    'from-cyan-400 via-blue-500 to-purple-500',
    'from-emerald-400 via-cyan-500 to-blue-500',
    'from-orange-400 via-pink-500 to-purple-500',
    'from-teal-400 via-green-500 to-blue-500',
    'from-rose-400 via-pink-500 to-purple-500',
    'from-violet-400 via-purple-500 to-pink-500',
    'from-sky-400 via-blue-500 to-indigo-500',
    'from-lime-400 via-green-500 to-emerald-500',
    'from-amber-400 via-orange-500 to-red-500',
    'from-fuchsia-400 via-pink-500 to-rose-500'
  ];

  // Use hash to select gradient
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

// Generate gradient for post cover
export function getPostGradient(postId: string, title: string): string {
  const seed = postId + title; // Combine ID and title for more uniqueness
  return generateGradient(seed);
}