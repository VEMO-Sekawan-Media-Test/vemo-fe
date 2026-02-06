import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex space-x-1">
        {[0, 150, 300].map(delay => (
          <div
            key={delay}
            className={`${sizeClasses[size]} bg-amber-500 rounded-full animate-bounce`}
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function FullPageLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function CardLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="md" />
    </div>
  );
}
