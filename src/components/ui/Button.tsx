'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'primary' | 'danger';
  size?: 'default' | 'sm' | 'icon' | 'lg';
  isLoading?: boolean;
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    default: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]',
    primary: 'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-light)]',
    outline: 'border border-[var(--card-border)] bg-transparent hover:bg-[var(--color-gray-100)]',
    ghost: 'bg-transparent hover:bg-[var(--color-gray-100)]',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    icon: 'h-10 w-10',
    lg: 'h-12 px-8 text-lg',
  };

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
