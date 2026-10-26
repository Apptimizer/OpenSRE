'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  BookOpen,
  ScrollText,
  Brain,
  GitPullRequest,
  Bot,
  Server,
  LayoutDashboard,
  ListChecks,
  ChevronLeft,
} from 'lucide-react';
import { clsx } from 'clsx';
import { AccountMenu } from '@/components/AccountMenu';

const teamNavigation = [
  { name: 'Dashboard', href: '/team', icon: LayoutDashboard },
  { name: 'Investigations', href: '/team/agent-runs', icon: ListChecks },
  { name: 'Agent Topology', href: '/team/agents', icon: Bot },
  { name: 'Tools & MCPs', href: '/team/tools', icon: Server },
  { name: 'Knowledge Base', href: '/team/knowledge', icon: BookOpen },
  { name: 'Team Context', href: '/team/context', icon: ScrollText },
  { name: 'Memory', href: '/team/memory', icon: Brain },
  { name: 'Proposed Changes', href: '/team/pending-changes', icon: GitPullRequest },
  { name: 'Settings', href: '/settings', icon: ShieldCheck },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/team') {
    return pathname === '/team' || pathname === '/team/';
  }
  return pathname === href || pathname.startsWith(href + '/');
}

type Props = {
  collapsed: boolean;
  onToggle: () => void;
};

export function TeamSidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname();
  const width = collapsed ? 64 : 230;

  return (
    <aside
      className="relative sticky top-[57px] h-[calc(100dvh-57px)] shrink-0 bg-white px-3 py-6 pb-28 shadow-[inset_-1px_0_0_var(--apl-neutral-300)] transition-[width] duration-200 ease-[var(--apl-ease)] dark:bg-slate-800 dark:shadow-[inset_-1px_0_0_var(--apl-neutral-600)]"
      style={{ width }}
    >
      <div className="mb-6 flex items-center justify-between px-3">
        {!collapsed && (
          <span className="text-xs font-bold uppercase tracking-[0.06em] text-slate-400">
            workspace
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={clsx(
            'rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white',
            collapsed && 'mx-auto',
          )}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            className={clsx(
              'h-3.5 w-3.5 transition-transform',
              collapsed && 'rotate-180',
            )}
          />
        </button>
      </div>

      <nav className="space-y-1 px-1">
        {teamNavigation.map((item) => {
          const isActive = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={clsx(
                'relative flex h-10 items-center gap-3 rounded-lg px-3 text-left transition-colors duration-[120ms]',
                isActive
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white',
                collapsed && 'justify-center px-2',
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && (
                <span className={clsx('truncate text-sm', isActive ? 'font-semibold' : 'font-medium')}>{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-3 right-3">
        <div className="rounded-2xl bg-slate-50 p-2 shadow-[inset_0_0_0_1px_var(--apl-neutral-200)] dark:bg-slate-700 dark:shadow-[inset_0_0_0_1px_var(--apl-neutral-600)]">
          <AccountMenu />
        </div>
      </div>
    </aside>
  );
}
