'use client';

import React, { Fragment, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  if (!mounted || !isOpen) return null;

  const iconColors = {
    danger: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  };

  const buttonVariants = {
    danger: 'danger' as const,
    warning: 'primary' as const,
    info: 'primary' as const,
  };

  const modalContent = (
    <Fragment>
      <div
        className="fixed inset-0 bg-black/50 z-[9998] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className={clsx(
            'rounded-xl shadow-2xl w-full transition-all animate-fadeIn pointer-events-auto',
            'bg-[var(--card-bg)] border border-[var(--card-border)]',
            'max-w-md'
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={clsx('flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center', iconColors[variant])}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className={clsx('text-lg font-semibold mb-2', 'text-[var(--foreground)]')}>
                  {title}
                </h3>
                <p className={clsx('text-sm mb-6', 'text-[var(--color-gray-500)]')}>
                  {message}
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    {cancelText}
                  </Button>
                  <Button
                    type="button"
                    variant={buttonVariants[variant]}
                    onClick={onConfirm}
                    isLoading={isLoading}
                  >
                    {confirmText}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );

  return createPortal(modalContent, document.body);
}
