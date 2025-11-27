import prisma from '@/lib/prisma';
import dbConnect from '@/lib/mongodb';
import { Auditoria } from '@/models/Auditoria';
import { Users, ShoppingBag, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import RevenueChart from '@/components/charts/RevenueChart';
import OrderStatusChart from '@/components/charts/OrderStatusChart';

export const dynamic = 'force-dynamic';

async function getDashboardMetrics() {
    // 1. Total Revenue
    const payments = await prisma.pago.aggregate({
        _sum: { total: true }
    });
    const totalRevenue = payments._sum.total || 0;

    // 2. Total Orders (Month)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const totalOrders = await prisma.pedido.count({
        where: {
            fecha: { gte: startOfMonth }
        }
    });

    // 3. Active Users (Auth + Anon from Audit Logs in last 30 days)
    let totalActiveUsers = 0;
    try {
        await dbConnect();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeUsersCount = await Auditoria.distinct('usuarioId', {
            creadoEn: { $gte: thirtyDaysAgo },
            usuarioId: { $ne: null }
        });

        const activeAnonCount = await Auditoria.distinct('anonimoId', {
            creadoEn: { $gte: thirtyDaysAgo },
            anonimoId: { $ne: null }
        });

        totalActiveUsers = activeUsersCount.length + activeAnonCount.length;
    } catch (error) {
        console.error('Error fetching active users from MongoDB:', error);
    }

    // 4. Conversion Rate
    const conversionRate = totalActiveUsers > 0 ? ((totalOrders / totalActiveUsers) * 100).toFixed(1) : 0;

    return {
        totalRevenue,
        totalOrders,
        totalActiveUsers,
        conversionRate
    };
}

async function getMonthlyRevenue() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const payments = await prisma.pago.findMany({
        where: {
            fecha: { gte: sixMonthsAgo }
        },
        select: {
            fecha: true,
            total: true
        }
    });

    // Group by month
    const monthlyData: Record<string, { revenue: number; sortKey: number }> = {};
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    payments.forEach(payment => {
        if (payment.fecha && payment.total) {
            const date = new Date(payment.fecha);
            const year = date.getFullYear();
            const month = date.getMonth();
            const monthKey = `${monthNames[month]} ${year}`;
            const sortKey = year * 100 + month;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { revenue: 0, sortKey };
            }
            monthlyData[monthKey].revenue += payment.total;
        }
    });

    // Convert to array, sort by date, and return last 6 months
    return Object.entries(monthlyData)
        .map(([month, data]) => ({
            month,
            revenue: data.revenue,
            sortKey: data.sortKey
        }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .slice(-6)
        .map(({ month, revenue }) => ({ month, revenue }));
}

async function getOrderStatusDistribution() {
    const statuses = await prisma.pedido.groupBy({
        by: ['estado'],
        _count: {
            estado: true
        }
    });

    return statuses
        .filter(s => s.estado)
        .map(s => ({
            status: s.estado!,
            count: s._count.estado
        }));
}

export default async function DashboardPage() {
    const metrics = await getDashboardMetrics();
    const monthlyRevenue = await getMonthlyRevenue();
    const orderStatus = await getOrderStatusDistribution();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Panel de Control</h1>
                <p className="text-slate-500 mt-1 text-sm">Resumen ejecutivo del rendimiento de Famiglia</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Revenue */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                            <DollarSign size={20} strokeWidth={1.5} />
                        </div>
                        <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <ArrowUpRight size={12} className="mr-1" /> +12.5%
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Ingresos Totales</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">${metrics.totalRevenue.toLocaleString()}</h3>
                    </div>
                </div>

                {/* Orders */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                            <ShoppingBag size={20} strokeWidth={1.5} />
                        </div>
                        <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <ArrowUpRight size={12} className="mr-1" /> +5.2%
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Pedidos del Mes</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{metrics.totalOrders}</h3>
                    </div>
                </div>

                {/* Active Users */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                            <Users size={20} strokeWidth={1.5} />
                        </div>
                        <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <ArrowUpRight size={12} className="mr-1" /> +8.1%
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Usuarios Activos</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{metrics.totalActiveUsers}</h3>
                    </div>
                </div>

                {/* Conversion Rate */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                            <TrendingUp size={20} strokeWidth={1.5} />
                        </div>
                        <span className="flex items-center text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                            <ArrowDownRight size={12} className="mr-1" /> -1.2%
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Tasa de Conversión</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{metrics.conversionRate}%</h3>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Ingresos Mensuales</h3>
                        <button className="text-sm text-slate-500 hover:text-slate-900 font-medium">Ver reporte</button>
                    </div>
                    <RevenueChart data={monthlyRevenue} />
                </div>

                {/* Order Status Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-6">Estado de Pedidos</h3>
                    <OrderStatusChart data={orderStatus} />
                    <div className="mt-6 space-y-3">
                        {orderStatus.map((status, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                                <span className="text-slate-600 capitalize">{status.status}</span>
                                <span className="font-semibold text-slate-900">{status.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
