'use client';

import { clsx } from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('rounded-lg bg-slate-100 shimmer dark:bg-slate-700', className)} aria-hidden />
  );
}
