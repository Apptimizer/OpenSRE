'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export function Chip({
  active = false,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; children?: ReactNode }) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        'h-8 px-3 rounded-full text-[13px] font-semibold transition-colors',
        active
          ? 'bg-emerald-100 text-emerald-600 shadow-[inset_0_0_0_1px_var(--apl-secondary-500)] dark:bg-emerald-500/20 dark:text-emerald-300'
          : 'bg-white text-slate-500 shadow-[inset_0_0_0_1px_var(--apl-neutral-300)] hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:shadow-[inset_0_0_0_1px_var(--apl-neutral-600)]',
        className,
      )}
    >
      {children}
    </button>
  );
}
