'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  backHref,
  backLabel = 'Back',
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="flex items-end justify-between gap-10">
      <div>
        {backHref ? (
          <Link
            href={backHref}
            className="text-[13px] font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        ) : null}
        <div className="text-xs font-bold uppercase tracking-[0.06em] text-slate-400 mb-2">
          {eyebrow}
        </div>
        <h1 className="text-[28px] leading-[30px] font-semibold tracking-[-0.04em] text-slate-700 dark:text-white">
          {title}
        </h1>
        {subtitle ? <p className="mt-2 text-slate-500 text-sm max-w-2xl dark:text-slate-400">{subtitle}</p> : null}
      </div>
      {actions ? <div className="shrink-0 flex items-center gap-3">{actions}</div> : null}
    </header>
  );
}
