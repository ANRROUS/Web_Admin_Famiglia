'use client';

import { Doughnut } from 'react-chartjs-2';
import { defaultOptions, colors } from '@/lib/chartConfig';

interface OrderStatus {
    status: string;
    count: number;
}

interface OrderStatusChartProps {
    data: OrderStatus[];
}

const statusColors: Record<string, string> = {
    'completado': colors.primary,    // Slate-900
    'pendiente': colors.secondary,   // Slate-500
    'carrito': 'rgb(203, 213, 225)', // Slate-300
    'cancelado': 'rgb(241, 245, 249)', // Slate-100
};

const statusLabels: Record<string, string> = {
    'completado': 'Completados',
    'pendiente': 'Pendientes',
    'carrito': 'En Carrito',
    'cancelado': 'Cancelados',
};

export default function OrderStatusChart({ data }: OrderStatusChartProps) {
    const chartData = {
        labels: data.map(d => statusLabels[d.status] || d.status),
        datasets: [
            {
                data: data.map(d => d.count),
                backgroundColor: data.map(d => statusColors[d.status] || colors.secondary),
                borderWidth: 0,
                hoverOffset: 4,
            },
        ],
    };

    const options = {
        ...defaultOptions,
        cutout: '75%',
        plugins: {
            ...defaultOptions.plugins,
            legend: {
                ...defaultOptions.plugins.legend,
                position: 'right' as const,
                labels: {
                    ...defaultOptions.plugins.legend.labels,
                    padding: 20,
                    boxWidth: 10,
                }
            },
        },
        scales: {
            x: { display: false },
            y: { display: false }
        }
    };

    return (
        <div className="h-64 flex items-center justify-center">
            <Doughnut data={chartData} options={options} />
        </div>
    );
}
