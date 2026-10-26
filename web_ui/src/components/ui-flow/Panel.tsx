'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

type PanelAs = 'div' | 'ul' | 'section';

export function Panel({
  as: Tag = 'div',
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & { as?: PanelAs; children: ReactNode }) {
  return (
    <Tag
      {...props}
      className={clsx(
        'bg-white rounded-2xl shadow-[inset_0_0_0_1px_var(--apl-neutral-200)] overflow-hidden dark:bg-slate-800 dark:shadow-[inset_0_0_0_1px_var(--apl-neutral-600)]',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
