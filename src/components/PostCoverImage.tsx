import { useState } from 'react';
import { getPostGradient } from '@/utils/gradientUtils';

interface PostCoverImageProps {
  src: string | null;
  alt: string;
  postId: string;
  title: string;
  className?: string;
  objectFit?: 'cover' | 'contain';
}

export function PostCoverImage({ src, alt, postId, title, className = "", objectFit = 'cover' }: PostCoverImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const gradientClass = getPostGradient(postId, title);

  // If no src provided or image failed to load, show gradient
  if (!src || imageError) {
    return (
      <div className={`bg-gradient-to-br ${gradientClass} flex items-center justify-center ${className}`}>
        <div className="text-white text-center p-4">
          <div className="text-2xl font-bold mb-2 opacity-90">
            {title.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="text-sm opacity-75 font-medium">
            {title.length > 20 ? title.slice(0, 20) + '...' : title}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Gradient background that shows while loading */}
      {!imageLoaded && (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} animate-pulse min-h-[200px]`} />
      )}
      
      <img
        src={src}
        alt={alt}
        className={`w-full ${objectFit === 'contain' ? 'h-auto' : 'h-full'} object-${objectFit} transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(false);
        }}
      />
    </div>
  );
}