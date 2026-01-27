'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, Users, DollarSign, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils'; // May need to copy utils from helper or recreate

// Recreate cn utility since it's a new project
function cn(...classes: (string | undefined | null | boolean)[]) {
    return classes.filter(Boolean).join(' ');
}

const adminItems = [
    {
        icon: LayoutDashboard,
        label: 'Dashboard',
        href: '/',
    },
    {
        icon: Store,
        label: 'Lojas & Aprovação',
        href: '/stores',
    },
    {
        icon: Users,
        label: 'Usuários',
        href: '/users',
    },
    {
        icon: DollarSign,
        label: 'Financeiro',
        href: '/finances',
    },
    {
        icon: Settings,
        label: 'Configurações',
        href: '/settings',
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
            <div className="mb-8 px-2">
                <h1 className="text-xl font-bold tracking-tight">Lupa<span className="text-blue-400">Admin</span></h1>
                <p className="text-xs text-slate-400">Backoffice Central</p>
            </div>

            <nav className="flex-1 space-y-1">
                {adminItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-slate-800 pt-4 mt-auto">
                <button className="flex items-center gap-3 px-3 py-2 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium">
                    <LogOut className="w-5 h-5" />
                    Sair
                </button>
            </div>
        </div>
    );
}
