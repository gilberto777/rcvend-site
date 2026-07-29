'use client';

import { AlertCircle } from 'lucide-react';

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-line bg-white p-12 text-center">
      {icon ? (
        <div className="mb-4 text-4xl">{icon}</div>
      ) : (
        <div className="mb-4 rounded-full bg-muted/8 p-3">
          <AlertCircle className="h-8 w-8 text-muted" />
        </div>
      )}

      <h3 className="text-xl font-black text-brand-strong">{title}</h3>

      {description && <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>}

      {action && (
        <a
          href={action.href}
          className="mt-6 rounded-2xl bg-brand px-5 py-2 font-black text-white hover:bg-brand-strong transition-colors"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
