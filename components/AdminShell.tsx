'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  LayoutDashboard,
  Store,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Bell,
  Menu,
  ClipboardList,
} from 'lucide-react';
import {
  Sidebar,
  DashboardLayout,
  Logo,
  Avatar,
  Badge,
} from 'lupa-design-system';
import type { SidebarItem } from 'lupa-design-system';
import { useSidebar } from 'lupa-design-system';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { resetApiClient } from 'lupa-api-client/client';

const GET_PENDING_COUNT = gql`
  query GetPendingCount {
    getPendingStores(limit: 1) {
      id
    }
    getPlatformStats
  }
`;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAdminAuth();
  const { collapsed, toggle } = useSidebar();

  const { data } = useQuery<any>(GET_PENDING_COUNT, {
    errorPolicy: 'ignore',
    pollInterval: 60000,
  });

  const pendingCount: number = data?.getPlatformStats?.pendingApprovals ?? 0;

  const handleLogout = () => {
    logout();
    try { resetApiClient(); } catch { /* ignore */ }
    router.replace('/login');
  };

  const adminNavItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Store, label: 'Lojas & Aprovação', href: '/stores', badge: pendingCount || undefined },
    { icon: Users, label: 'Utilizadores', href: '/users' },
    { icon: DollarSign, label: 'Financeiro', href: '/finances' },
    { icon: ClipboardList, label: 'Auditoria', href: '/audit' },
    { icon: Settings, label: 'Configurações', href: '/settings' },
  ];

  // Login page renders without shell
  if (pathname === '/login') return <>{children}</>;

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
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      }
    />
  );

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'AD';

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
        <Link
          href="/audit"
          className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title="Auditoria"
        >
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2">
          <Avatar fallback={initials} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">
              {user?.fullName || 'Admin'}
            </p>
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
