import Link from 'next/link';
import prisma from '@/lib/prisma';
import { ShoppingCart, ArrowRight, AlertTriangle, DollarSign, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getAbandonedCarts() {
    try {
        const carts = await prisma.pedido.findMany({
            where: {
                estado: 'carrito',
            },
            include: {
                usuario: true,
                detalle_pedido: {
                    include: {
                        producto: true,
                    },
                },
            },
            orderBy: {
                fecha: 'desc',
            },
            take: 20,
        });
        return carts;
    } catch (error) {
        console.error('Error fetching abandoned carts:', error);
        return [];
    }
}

async function getSalesMetrics() {
    try {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        // Total Revenue (Month)
        const revenue = await prisma.pago.aggregate({
            _sum: { total: true },
            where: {
                fecha: { gte: startOfMonth }
            }
        });

        // Completed Orders (Month) - Assuming 'entregado' is the completed status
        // If you have different status logic, adjust here.
        const completedOrders = await prisma.pedido.count({
            where: {
                estado: 'entregado',
                fecha: { gte: startOfMonth }
            }
        });

        return {
            monthlyRevenue: revenue._sum.total || 0,
            completedOrders
        };
    } catch (error) {
        console.error('Error fetching sales metrics:', error);
        return { monthlyRevenue: 0, completedOrders: 0 };
    }
}

type CartWithDetails = Awaited<ReturnType<typeof getAbandonedCarts>>[number];

export default async function SalesPage() {
    const abandonedCarts = await getAbandonedCarts();
    const metrics = await getSalesMetrics();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Análisis de Ventas</h1>
                <p className="text-slate-500 mt-1 text-sm">Identificación de oportunidades y recuperación de carritos abandonados</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Monthly Revenue */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Ventas del Mes</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">S/. {metrics.monthlyRevenue.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <DollarSign size={20} strokeWidth={1.5} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">Ingresos confirmados este mes</p>
                </div>

                {/* Completed Orders */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pedidos Completados</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{metrics.completedOrders}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <CheckCircle size={20} strokeWidth={1.5} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">Órdenes entregadas este mes</p>
                </div>

                {/* Abandoned Carts */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Carritos Pendientes</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{abandonedCarts.length}</h3>
                        </div>
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                            <ShoppingCart size={20} strokeWidth={1.5} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">Potenciales ventas a recuperar</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-500" />
                        Carritos Pendientes
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Est.</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {abandonedCarts.map((cart: CartWithDetails) => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const totalItems = cart.detalle_pedido.reduce((acc: number, item: any) => acc + (item.cantidad || 0), 0);
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const totalValue = cart.detalle_pedido.reduce((acc: number, item: any) => acc + ((item.producto?.precio || 0) * (item.cantidad || 0)), 0);

                                return (
                                    <tr key={cart.id_pedido.toString()} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">
                                                {cart.usuario?.nombre || 'Anónimo'}
                                            </div>
                                            <div className="text-xs text-slate-500">{cart.usuario?.correo}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {cart.fecha ? new Date(cart.fecha).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {totalItems} productos
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                                            S/.{totalValue.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {cart.id_usuario ? (
                                                <Link href={`/dashboard/users/${cart.id_usuario}`} className="text-slate-600 hover:text-slate-900 flex items-center justify-end gap-1 hover:underline decoration-slate-300 underline-offset-4">
                                                    Ver Usuario <ArrowRight size={14} />
                                                </Link>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Usuario Anónimo</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {abandonedCarts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No hay carritos abandonados por el momento.
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
