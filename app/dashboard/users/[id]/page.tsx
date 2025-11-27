import Link from 'next/link';
import prisma from '@/lib/prisma';
import dbConnect from '@/lib/mongodb';
import { Auditoria } from '@/models/Auditoria';
import { ArrowLeft, Shield, Calendar, Activity, ShoppingBag } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AuditLog {
    _id: string;
    accion: string;
    creadoEn: string;
    ruta?: string;
    recurso?: string;
    usuarioId?: string | null;
    [key: string]: unknown;
}

async function getUserDetails(id: string) {
    try {
        const user = await prisma.usuario.findUnique({
            where: { id_usuario: BigInt(id) },
            include: {
                pedido: {
                    take: 5,
                    orderBy: { fecha: 'desc' },
                },
            },
        });
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

async function getUserAuditLogs(userId: string): Promise<AuditLog[]> {
    try {
        await dbConnect();
        // Fetch logs where usuarioId matches the user's ID
        const logs = await Auditoria.find({ usuarioId: userId })
            .sort({ creadoEn: -1 })
            .limit(20)
            .lean();

        // Serialize MongoDB documents (convert _id and dates to strings)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return logs.map((log: any) => ({
            ...log,
            _id: log._id.toString(),
            creadoEn: log.creadoEn.toISOString(),
        }));
    } catch (error) {
        console.error('Error fetching audit logs for user:', userId, error);
        // Return empty array to prevent page crash
        return [];
    }
}

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getUserDetails(id);
    const auditLogs = await getUserAuditLogs(id);

    if (!user) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-slate-700">Usuario no encontrado</h2>
                <Link href="/dashboard/users" className="text-blue-600 hover:underline mt-4 inline-block">
                    Volver a la lista
                </Link>
            </div>
        );
    }

    return (
        <div>
            <Link href="/dashboard/users" className="inline-flex items-center text-slate-500 hover:text-slate-700 mb-6 transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                Volver a Usuarios
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all">
                        <div className="flex flex-col items-center text-center">
                            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4">
                                {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">{user.nombre}</h2>
                            <p className="text-slate-500">{user.correo}</p>

                            <div className="mt-6 w-full space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Shield className="text-purple-500" size={20} />
                                        <span className="text-sm font-medium text-slate-700">Rol</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.rol === 'A' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {user.rol === 'A' ? 'ADMIN' : 'CLIENTE'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="text-blue-500" size={20} />
                                        <span className="text-sm font-medium text-slate-700">ID Usuario</span>
                                    </div>
                                    <span className="text-sm text-slate-600">#{user.id_usuario.toString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity & Orders */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Audit Logs (MongoDB) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Activity className="text-amber-500" />
                            Actividad Reciente (Auditoría)
                        </h3>
                        <div className="overflow-hidden">
                            {auditLogs.length > 0 ? (
                                <ul className="divide-y divide-slate-100">
                                    {auditLogs.map((log) => (
                                        <li key={log._id} className="py-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-slate-900">{log.accion}</span>
                                                <span className="text-slate-400 text-xs">
                                                    {new Date(log.creadoEn).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="mt-1 text-slate-500 text-xs">
                                                {log.ruta && <span className="mr-2">Ruta: {log.ruta}</span>}
                                                {log.recurso && <span>Recurso: {log.recurso}</span>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500 text-sm italic">No hay registros de actividad reciente.</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders (Supabase) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <ShoppingBag className="text-emerald-500" />
                            Últimos Pedidos
                        </h3>
                        <div className="overflow-x-auto">
                            {user.pedido && user.pedido.length > 0 ? (
                                <table className="min-w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="px-4 py-2">ID</th>
                                            <th className="px-4 py-2">Fecha</th>
                                            <th className="px-4 py-2">Estado</th>
                                            <th className="px-4 py-2">Envío</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {user.pedido.map((pedido: any) => (
                                            <tr key={pedido.id_pedido.toString()}>
                                                <td className="px-4 py-2 font-medium text-slate-900">#{pedido.id_pedido.toString()}</td>
                                                <td className="px-4 py-2 text-slate-500">
                                                    {pedido.fecha ? new Date(pedido.fecha).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">
                                                        {pedido.estado || 'Pendiente'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-slate-500">{pedido.envio || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-slate-500 text-sm italic">Este usuario no ha realizado pedidos.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
