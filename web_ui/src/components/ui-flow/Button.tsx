'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

type Variant = 'primary' | 'secondary' | 'soft' | 'ghost';

/** applift indigo tint (selection colour) — for secondary emphasis; red stays on the one primary action */
export const ACCENT_BUTTON =
  'bg-emerald-100 text-emerald-600 hover:bg-emerald-200/60 dark:bg-emerald-500/20 dark:text-emerald-300';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary:
    'bg-white text-slate-700 shadow-[inset_0_0_0_1px_var(--apl-neutral-300)] hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:shadow-[inset_0_0_0_1px_var(--apl-neutral-600)] dark:hover:bg-slate-600',
  soft: ACCENT_BUTTON,
  ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white',
};

export function Button({
  variant = 'secondary',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children?: ReactNode }) {
  return (
    <button
      {...props}
      className={clsx(
        'inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold transition-colors duration-[120ms] ease-[var(--apl-ease)] focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--apl-neutral-600)] disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-500',
        VARIANT[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}
