'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Store,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Bell,
  Menu,
} from 'lucide-react';
import {
  Sidebar,
  DashboardLayout,
  Logo,
  Avatar,
  Badge,
} from '@lupa/design-system';
import type { SidebarItem } from '@lupa/design-system';
import { useSidebar } from '@lupa/design-system';

const adminNavItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Store, label: 'Lojas & Aprovação', href: '/stores', badge: 3 },
  { icon: Users, label: 'Usuários', href: '/users' },
  { icon: DollarSign, label: 'Financeiro', href: '/finances' },
  { icon: Settings, label: 'Configurações', href: '/settings' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  // Strip basePath for matching
  const currentPath = pathname.replace('/admin', '') || '/';

  const sidebar = (
    <Sidebar
      zoneName="Admin"
      zoneSubtitle="Backoffice Central"
      items={adminNavItems}
      currentPath={currentPath}
      linkComponent={Link}
      collapsed={collapsed}
      onToggle={toggle}
      footer={
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      }
    />
  );

  const header = (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo zone="Admin" size="sm" linkComponent={Link} href="/" />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            2
          </span>
        </button>
        <div className="flex items-center gap-2">
          <Avatar fallback="AD" size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">Admin</p>
            <Badge variant="outline" className="text-[10px]">Super Admin</Badge>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout sidebar={sidebar} header={header}>
      {children}
    </DashboardLayout>
  );
}
