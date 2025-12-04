import Link from 'next/link';
import prisma from '@/lib/prisma';
import dbConnect from '@/lib/mongodb';
import { Auditoria } from '@/models/Auditoria';
import { Eye, Search, Users as UsersIcon, Activity, TrendingUp, BarChart3 } from 'lucide-react';
import RegisteredActionsChart from '@/components/charts/RegisteredActionsChart';

export const dynamic = 'force-dynamic';

interface UserMetrics {
    totalUsers: number;
    totalEvents: number;
    avgEventsPerUser: number;
    topAction: string;
}

async function getUsers() {
    try {
        const users = await prisma.usuario.findMany({
            orderBy: { id_usuario: 'desc' },
            take: 50,
        });
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

async function getUserMetrics(): Promise<UserMetrics> {
    try {
        await dbConnect();

        // Get all registered user IDs
        const users = await prisma.usuario.findMany({
            select: { id_usuario: true }
        });

        const userIds = users.map(u => u.id_usuario.toString());

        const totalEvents = await Auditoria.countDocuments({
            usuarioId: { $in: userIds }
        });

        const topActions = await Auditoria.aggregate([
            { $match: { usuarioId: { $in: userIds } } },
            { $group: { _id: '$accion', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        return {
            totalUsers: users.length,
            totalEvents,
            avgEventsPerUser: users.length > 0 ? Math.round(totalEvents / users.length) : 0,
            topAction: topActions[0]?._id || 'N/A'
        };
    } catch (error) {
        console.error('Error fetching user metrics:', error);
        return { totalUsers: 0, totalEvents: 0, avgEventsPerUser: 0, topAction: 'N/A' };
    }
}

async function getTopUserActions() {
    try {
        await dbConnect();

        const users = await prisma.usuario.findMany({
            select: { id_usuario: true }
        });

        const userIds = users.map(u => u.id_usuario.toString());

        const actions = await Auditoria.aggregate([
            { $match: { usuarioId: { $in: userIds } } },
            { $group: { _id: '$accion', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        return actions.map(a => ({
            action: a._id,
            count: a.count
        }));
    } catch (error) {
        console.error('Error fetching top user actions:', error);
        return [];
    }
}

export default async function UsersPage() {
    const users = await getUsers();
    const metrics = await getUserMetrics();
    const topActions = await getTopUserActions();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Usuarios</h1>
                <p className="text-slate-500 mt-1 text-sm">Administración y seguimiento de la base de usuarios registrados</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <UsersIcon size={20} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Usuarios</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{metrics.totalUsers}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-red-50 rounded-lg text-red-600">
                            <Activity size={20} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Eventos</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{metrics.totalEvents.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-300">
                            <TrendingUp size={20} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Promedio Eventos</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{metrics.avgEventsPerUser}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <BarChart3 size={20} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Acción Principal</p>
                        <h3 className="text-lg font-bold text-slate-900 mt-1 truncate tracking-tight">{metrics.topAction}</h3>
                    </div>
                </div>
            </div>

            {/* Top Actions Chart */}
            {topActions.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-6">Top 10 Acciones de Usuarios Registrados</h3>
                    <RegisteredActionsChart data={topActions} />
                </div>
            )}

            {/* Search Bar */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Lista de Usuarios</h3>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm w-64 transition-all"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Rol
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user.id_usuario.toString()} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border border-slate-200">
                                            {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-slate-900">
                                                {user.nombre || 'Sin nombre'}
                                            </div>
                                            <div className="text-sm text-slate-500">{user.correo}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full border ${user.rol === 'A'
                                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            }`}
                                    >
                                        {user.rol === 'A' ? 'Administrador' : 'Cliente'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                                    #{user.id_usuario.toString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                        href={`/dashboard/users/${user.id_usuario}`}
                                        className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 hover:underline decoration-slate-300 underline-offset-4"
                                    >
                                        <Eye size={16} /> Ver Detalles
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No se encontraron usuarios.
                    </div>
                )}
            </div>
        </div>
    );
}
