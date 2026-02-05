import React from 'react';
import { clsx } from 'clsx';
import { Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1 text-[var(--color-gray-700)]">
          {label}
        </label>
      )}
      <div className="relative w-full">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-gray-400)]">
            {icon}
          </div>
        )}
        <input
          className={clsx(
            'w-full px-3 py-2 border rounded-lg shadow-sm transition-colors',
            'placeholder-[var(--color-gray-400)]',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-[var(--color-gray-100)] disabled:cursor-not-allowed',
            'bg-[var(--card-bg)] text-[var(--foreground)]',
            error ? 'border-red-500' : 'border-[var(--card-border)]',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1 text-[var(--color-gray-700)]">
          {label}
        </label>
      )}
      <select
        className={clsx(
          'w-full px-3 py-2 border rounded-lg shadow-sm transition-colors cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:bg-[var(--color-gray-100)] disabled:cursor-not-allowed',
          'bg-[var(--card-bg)] text-[var(--foreground)]',
          error ? 'border-red-500' : 'border-[var(--card-border)]',
          className
        )}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1 text-[var(--color-gray-700)]">
          {label}
        </label>
      )}
      <textarea
        className={clsx(
          'w-full px-3 py-2 border rounded-lg shadow-sm transition-colors',
          'placeholder-[var(--color-gray-400)]',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:bg-[var(--color-gray-100)] disabled:cursor-not-allowed',
          'bg-[var(--card-bg)] text-[var(--foreground)]',
          error ? 'border-red-500' : 'border-[var(--card-border)]',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
