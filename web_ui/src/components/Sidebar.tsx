'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Menu,
  X,
  Network,
  Server,
  BookOpen,
  ScrollText,
  Brain,
  GitPullRequest,
  Bot,
  Cog,
  LayoutDashboard,
  Key,
} from 'lucide-react';
import { clsx } from 'clsx';
import { LogoFull } from './Logo';
import { useState } from 'react';
import { useIdentity } from '@/lib/useIdentity';
import { AccountMenu } from './AccountMenu';

// Navigation for team users
const teamNavigation = [
  { name: 'Dashboard', href: '/team', icon: LayoutDashboard },
  { name: 'Agent Runs', href: '/team/agent-runs', icon: Bot },
  { name: 'Agent Topology', href: '/team/agents', icon: Bot },
  { name: 'Tools & MCPs', href: '/team/tools', icon: Server },
  { name: 'Knowledge Base', href: '/team/knowledge', icon: BookOpen },
  { name: 'Team Context', href: '/team/context', icon: ScrollText },
  { name: 'Memory', href: '/team/memory', icon: Brain },
  { name: 'Proposed Changes', href: '/team/pending-changes', icon: GitPullRequest },
  { name: 'Settings', href: '/settings', icon: ShieldCheck },
];

// Navigation for admin users
const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Org Tree', href: '/admin/org-tree', icon: Network },
  { name: 'Org Configurations', href: '/admin/config', icon: Cog },
  { name: 'Token Management', href: '/admin/token-management', icon: Key },
  { name: 'Settings', href: '/settings', icon: ShieldCheck },
];

// Navigation when not logged in
const guestNavigation = [
  { name: 'Sign In', href: '/settings', icon: ShieldCheck },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/team') {
    return pathname === '/team' || pathname === '/team/';
  }
  return pathname === href || pathname.startsWith(href + '/');
}

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { identity } = useIdentity();
  const nav =
    identity?.role === 'admin'
      ? adminNavigation
      : identity?.role === 'team'
        ? teamNavigation
        : guestNavigation;

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-stone-50 dark:bg-stone-800 rounded-md shadow-md border border-stone-200 dark:border-stone-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Container */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-[inset_-1px_0_0_var(--apl-neutral-300)] dark:bg-stone-800 dark:shadow-[inset_-1px_0_0_var(--apl-neutral-600)] transform transition-transform duration-200 ease-[var(--apl-ease)] lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 shadow-[inset_0_-1px_0_var(--apl-neutral-300)] dark:shadow-[inset_0_-1px_0_var(--apl-neutral-600)]">
            <LogoFull />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {nav.map((item) => {
              const isActive = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "flex items-center h-10 px-3 text-sm rounded-lg transition-colors group",
                    isActive
                      ? "bg-emerald-100 text-emerald-600 font-semibold dark:bg-emerald-500/20 dark:text-emerald-300"
                      : "text-stone-500 font-medium hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-600 dark:hover:text-white"
                  )}
                >
                  <item.icon className={clsx("w-5 h-5 mr-3 transition-colors", isActive ? "text-current" : "text-stone-400 group-hover:text-current")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User / Footer */}
          <div className="p-4 shadow-[inset_0_1px_0_var(--apl-neutral-300)] dark:shadow-[inset_0_1px_0_var(--apl-neutral-600)]">
            <AccountMenu />
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
