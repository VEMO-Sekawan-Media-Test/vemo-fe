'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };

  const iconColors = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slideIn',
        'bg-[var(--card-bg)]',
        bgColors[toast.type]
      )}
    >
      <span className={iconColors[toast.type]}>{icons[toast.type]}</span>
      <p className={clsx('flex-1 text-sm font-medium', 'text-[var(--foreground)]')}>
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        className={clsx(
          'flex-shrink-0 p-1 rounded-lg transition-colors',
          'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
          'hover:bg-gray-100 dark:hover:bg-gray-700'
        )}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed top-4 right-4 z-[10000] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>,
    document.body
  );
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const showSuccess = (message: string) => showToast(message, 'success');
  const showError = (message: string) => showToast(message, 'error');
  const showWarning = (message: string) => showToast(message, 'warning');
  const showInfo = (message: string) => showToast(message, 'info');

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
