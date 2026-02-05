'use client';

import React, { Fragment, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Efek untuk mematikan scroll pada body saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Jangan render apapun jika belum mounted (Client-side) atau modal tertutup
  if (!mounted || !isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  // Konten Modal
  const modalContent = (
    <Fragment>
      {/* Backdrop - full coverage */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal container - centered with padding */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className={clsx(
            'rounded-xl shadow-2xl w-full transition-all animate-fadeIn pointer-events-auto',
            'bg-[var(--card-bg)] border border-[var(--card-border)]',
            sizes[size],
            'max-h-[90vh] flex flex-col' // flex-col agar header dan footer tetap, body scroll
          )}
          role="dialog"
          aria-modal="true"
        >
          {title && (
            <div className={clsx(
              'flex items-center justify-between px-6 py-4 border-b transition-colors shrink-0',
              'border-[var(--card-border)]'
            )}>
              <h3 className={clsx('text-lg font-semibold', 'text-[var(--foreground)]')}>{title}</h3>
              <button
                onClick={onClose}
                className={clsx(
                  'focus:outline-none transition-colors rounded-lg p-1',
                  'text-[var(--color-gray-400)] hover:text-[var(--color-gray-500)] hover:bg-[var(--color-gray-100)]'
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          
          {/* Content Area dengan Scroll jika konten terlalu panjang */}
          <div className="px-6 py-4 overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </Fragment>
  );

  // Render ke document.body menggunakan Portal
  return createPortal(modalContent, document.body);
}