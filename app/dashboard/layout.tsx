'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, ShoppingCart, Settings, LogOut, Command } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });
            // Force a full page reload to clear all client-side state and ensure middleware redirect
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                        <div className="p-1.5 bg-slate-900 text-white rounded-md">
                            <Command size={18} />
                        </div>
                        Famiglia
                    </h1>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Principal</p>

                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all group">
                        <LayoutDashboard size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                        <span>General</span>
                    </Link>

                    <Link href="/dashboard/sales" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all group">
                        <ShoppingCart size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                        <span>Ventas</span>
                    </Link>

                    <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2">Usuarios</p>

                    <Link href="/dashboard/users" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all group">
                        <Users size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                        <span>Registrados</span>
                    </Link>

                    <Link href="/dashboard/anonymous" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all group">
                        <Users size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                        <span>Anónimos</span>
                    </Link>

                    <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2">Sistema</p>

                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all group">
                        <Settings size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                        <span>Configuración</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 z-10">
                    <div className="md:hidden">
                        <button className="text-slate-500 hover:text-slate-700">
                            <Command size={24} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-900">Administrador</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium shadow-sm">
                            AD
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8 relative">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
