'use client';

import type { ReactNode } from 'react';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-[inset_0_0_0_1px_var(--apl-neutral-200)] p-12 flex flex-col items-center text-center dark:bg-slate-800 dark:shadow-[inset_0_0_0_1px_var(--apl-neutral-600)]">
      <h2 className="text-lg font-semibold text-slate-700 dark:text-white">{title}</h2>
      {description ? (
        <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-[48ch]">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
