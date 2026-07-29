'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

type ToastMessageProp = {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessageProp[]>([]);

  const show = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.random().toString(36);
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    if (duration && duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    show,
    success: (msg: string) => show(msg, 'success'),
    error: (msg: string) => show(msg, 'error'),
    info: (msg: string) => show(msg, 'info'),
    dismiss,
  };
}

type ToastProviderProps = {
  children: React.ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  return <>{children}</>;
}

type ToastContainerProps = {
  toasts: ToastMessageProp[];
  onDismiss: (id: string) => void;
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

type ToastProps = ToastMessageProp & {
  onDismiss: (id: string) => void;
};

function Toast({ id, type, message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const bgColor =
    type === 'success' ? 'bg-green-50 border-green-200' :
    type === 'error' ? 'bg-red-50 border-red-200' :
    'bg-blue-50 border-blue-200';

  const textColor =
    type === 'success' ? 'text-green-800' :
    type === 'error' ? 'text-red-800' :
    'text-blue-800';

  const Icon =
    type === 'success' ? CheckCircle :
    type === 'error' ? AlertCircle :
    AlertCircle;

  const iconColor =
    type === 'success' ? 'text-green-600' :
    type === 'error' ? 'text-red-600' :
    'text-blue-600';

  return (
    <div className={`flex items-start gap-3 rounded-2xl border ${bgColor} p-4 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-200`}>
      <Icon className={`h-5 w-5 flex-shrink-0 ${iconColor} mt-0.5`} />
      <p className={`flex-1 text-sm font-medium ${textColor}`}>{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className={`flex-shrink-0 ${textColor} hover:opacity-70 transition`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
