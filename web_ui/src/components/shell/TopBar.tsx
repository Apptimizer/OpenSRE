'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui-flow/Button';
import { OpenSreBrandLogo } from '@/components/brand/OpenSreBrandLogo';
import { useInvestigationLauncher } from './InvestigationLauncherContext';

type Props = {
  sidebarWidth: number;
};

export function TopBar({ sidebarWidth }: Props) {
  const { open } = useInvestigationLauncher();
  const collapsed = sidebarWidth <= 64;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[inset_0_-1px_0_var(--apl-neutral-300)] dark:bg-slate-800 dark:shadow-[inset_0_-1px_0_var(--apl-neutral-600)]">
      <div className="flex items-center py-3">
        <div
          className="flex shrink-0 justify-center transition-[width] duration-300 ease-out"
          style={{ width: sidebarWidth }}
        >
          <Link
            href="/team"
            className="flex items-center justify-center gap-2.5"
            aria-label="applift SRE home"
          >
            <OpenSreBrandLogo
              variant={collapsed ? 'spinner' : 'wordmark'}
              surface="topbar"
              priority
            />
            {!collapsed && (
              <span className="rounded px-2 py-0.5 text-xs font-bold uppercase tracking-[0.06em] text-slate-500 shadow-[inset_0_0_0_1px_var(--apl-neutral-300)] dark:text-slate-400 dark:shadow-[inset_0_0_0_1px_var(--apl-neutral-600)]">
                SRE
              </span>
            )}
          </Link>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-3 px-6">
          <span className="hidden text-xs font-bold uppercase tracking-[0.06em] text-slate-400 sm:inline">
            team console
          </span>
          <Button
            variant="primary"
            className="ml-auto"
            onClick={open}
            title="New Investigation (⌘I)"
          >
            <Plus className="h-3.5 w-3.5" />
            New investigation
            <span className="ml-0.5 rounded px-1.5 font-mono text-xs font-medium shadow-[inset_0_0_0_1px_rgb(255_255_255/0.4)]">
              ⌘I
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
