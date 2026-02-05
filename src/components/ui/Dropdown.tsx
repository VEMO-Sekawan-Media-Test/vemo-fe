'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder = 'Pilih',
  className,
  error,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate position
  useEffect(() => {
    if (isOpen && buttonRef.current && listboxRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const listbox = listboxRef.current;
      
      // Reset styles first
      listbox.style.position = 'fixed';
      listbox.style.left = `${buttonRect.left}px`;
      listbox.style.top = `${buttonRect.bottom + 4}px`;
      listbox.style.width = `${buttonRect.width}px`;
      listbox.style.zIndex = '9999';
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'w-full h-10 px-3 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)]',
            'text-left text-sm font-normal transition-colors cursor-pointer',
            'hover:bg-[var(--color-gray-100)]',
            'flex items-center justify-between gap-2',
            !value && 'text-[var(--color-gray-500)]',
            error && 'border-red-500'
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`${id}-label`}
        >
          <span className="truncate">
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={clsx(
              'w-4 h-4 text-[var(--color-gray-400)] transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div
            ref={listboxRef}
            role="listbox"
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl overflow-hidden"
          >
            {/* Search input */}
            <div className="p-2 border-b border-[var(--card-border)]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari..."
                className={clsx(
                  'w-full px-2 py-1.5 rounded-md border border-[var(--card-border)]',
                  'text-sm bg-[var(--card-bg)] text-[var(--foreground)]',
                  'focus:outline-none focus:ring-1 focus:ring-[var(--color-secondary)]'
                )}
                autoFocus
              />
            </div>

            {/* Options list */}
            <div className="max-h-48 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-[var(--color-gray-500)] text-center">
                  Tidak ada hasil
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    role="option"
                    aria-selected={value === option.value}
                    className={clsx(
                      'w-full px-3 py-2 rounded-md text-sm text-left transition-colors cursor-pointer',
                      'flex items-center justify-between gap-2',
                      value === option.value
                        ? 'bg-[var(--color-secondary)] text-white'
                        : 'hover:bg-[var(--color-gray-100)] text-[var(--foreground)]'
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {value === option.value && <Check className="w-4 h-4 flex-shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
