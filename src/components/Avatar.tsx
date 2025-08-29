import React from 'react';
import { cn } from '../lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  square?: boolean;
  className?: string;
  slot?: string;
}

export function Avatar({ 
  src, 
  alt = '', 
  initials, 
  square = false, 
  className,
  ...props 
}: AvatarProps) {
  const baseClasses = cn(
    'inline-block overflow-hidden bg-gray-100',
    square ? 'rounded-md' : 'rounded-full',
    className
  );

  if (src) {
    return (
      <img
        className={cn(baseClasses, 'h-8 w-8 object-cover')}
        src={src}
        alt={alt}
        {...props}
      />
    );
  }

  if (initials) {
    return (
      <span
        className={cn(
          baseClasses,
          'flex h-8 w-8 items-center justify-center text-sm font-medium text-gray-700'
        )}
        {...props}
      >
        {initials}
      </span>
    );
  }

  // Default avatar
  return (
    <span
      className={cn(
        baseClasses,
        'flex h-8 w-8 items-center justify-center bg-gray-300'
      )}
      {...props}
    >
      <svg
        className="h-5 w-5 text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}