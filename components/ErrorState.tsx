'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

type ErrorStateProps = {
  title: string;
  description?: string;
  error?: string;
  onRetry?: () => void;
};

export function ErrorState({ title, description, error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-red-200 bg-red-50 p-12 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-3">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>

      <h3 className="text-xl font-black text-red-900">{title}</h3>

      {description && <p className="mt-2 max-w-sm text-sm text-red-800">{description}</p>}

      {error && (
        <pre className="mt-4 max-w-sm rounded-xl bg-white p-3 text-left text-xs text-red-700 overflow-auto">
          {error}
        </pre>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-2 font-black text-white hover:bg-red-700 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Tentar novamente
        </button>
      )}
    </div>
  );
}
