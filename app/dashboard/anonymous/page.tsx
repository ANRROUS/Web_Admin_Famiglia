import dbConnect from '@/lib/mongodb';
import { Auditoria } from '@/models/Auditoria';
import { User, Clock, Activity, TrendingUp, BarChart3, ArrowUpRight } from 'lucide-react';
import AnonymousActionsChart from '@/components/charts/AnonymousActionsChart';

export const dynamic = 'force-dynamic';

interface AnonymousUser {
    anonimoId: string;
    lastActive: string;
    firstSeen: string;
    actions: number;
    lastAction: string;
}

interface AnonymousMetrics {
    totalUsers: number;
    totalEvents: number;
    avgEventsPerUser: number;
    topAction: string;
}

async function getAnonymousMetrics(): Promise<AnonymousMetrics> {
    try {
        await dbConnect();

        const totalUsers = await Auditoria.distinct('anonimoId', {
            anonimoId: { $ne: null }
        });

        const totalEvents = await Auditoria.countDocuments({
            anonimoId: { $ne: null }
        });

        const topActions = await Auditoria.aggregate([
            { $match: { anonimoId: { $ne: null } } },
            { $group: { _id: '$accion', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        return {
            totalUsers: totalUsers.length,
            totalEvents,
            avgEventsPerUser: totalUsers.length > 0 ? Math.round(totalEvents / totalUsers.length) : 0,
            topAction: topActions[0]?._id || 'N/A'
        };
    } catch (error) {
        console.error('Error fetching anonymous metrics:', error);
        return { totalUsers: 0, totalEvents: 0, avgEventsPerUser: 0, topAction: 'N/A' };
    }
}

async function getTopActions() {
    try {
        await dbConnect();

        const actions = await Auditoria.aggregate([
            { $match: { anonimoId: { $ne: null } } },
            { $group: { _id: '$accion', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        return actions.map(a => ({
            action: a._id,
            count: a.count
        }));
    } catch (error) {
        console.error('Error fetching top actions:', error);
        return [];
    }
}

async function getAnonymousUsers(): Promise<AnonymousUser[]> {
    try {
        await dbConnect();

        const users = await Auditoria.aggregate([
            { $match: { usuarioId: null, anonimoId: { $ne: null } } },
            {
                $group: {
                    _id: "$anonimoId",
                    lastActive: { $max: "$creadoEn" },
                    firstSeen: { $min: "$creadoEn" },
                    actions: { $sum: 1 },
                    lastAction: { $last: "$accion" }
                }
            },
            { $sort: { lastActive: -1 } },
            { $limit: 50 }
        ]);

        return users.map(u => ({
            anonimoId: u._id,
            lastActive: u.lastActive.toISOString(),
            firstSeen: u.firstSeen.toISOString(),
            actions: u.actions,
            lastAction: u.lastAction
        }));
    } catch (error) {
        console.error('Error fetching anonymous users:', error);
        return [];
    }
}

export default async function AnonymousUsersPage() {
    const metrics = await getAnonymousMetrics();
    const topActions = await getTopActions();
    const users = await getAnonymousUsers();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analítica de Usuarios Anónimos</h1>
                <p className="text-slate-500 mt-1 text-sm">Seguimiento y análisis de visitantes no autenticados</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                            <User size={20} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Usuarios</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{metrics.totalUsers}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
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
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
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
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
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
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-6">Top 10 Acciones Más Frecuentes</h3>
                    <AnonymousActionsChart data={topActions} />
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Usuarios Recientes</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID Anónimo</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Primera Visita</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Última Actividad</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Eventos</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Última Acción</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user.anonimoId} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-slate-100 rounded text-slate-500">
                                                <User size={14} />
                                            </div>
                                            <span className="text-sm font-mono text-slate-600">{user.anonimoId.substring(0, 8)}...</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {new Date(user.firstSeen).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-slate-400" />
                                            {new Date(user.lastActive).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium border border-slate-200">
                                            {user.actions} eventos
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Activity size={14} className="text-slate-400" />
                                            {user.lastAction}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No se encontró actividad de usuarios anónimos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
