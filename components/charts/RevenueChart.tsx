'use client';

import { Line } from 'react-chartjs-2';
import { defaultOptions, colors } from '@/lib/chartConfig';

interface MonthlyRevenue {
    month: string;
    revenue: number;
}

interface RevenueChartProps {
    data: MonthlyRevenue[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
    const chartData = {
        labels: data.map(d => d.month),
        datasets: [
            {
                label: 'Ingresos',
                data: data.map(d => d.revenue),
                borderColor: colors.primary,
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.1)');
                    gradient.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: colors.primary,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                borderWidth: 2,
            },
        ],
    };

    const options = {
        ...defaultOptions,
        scales: {
            ...defaultOptions.scales,
            y: {
                ...defaultOptions.scales.y,
                beginAtZero: true,
                ticks: {
                    ...defaultOptions.scales.y.ticks,
                    callback: function (value: number | string) {
                        return '$' + Number(value).toLocaleString();
                    },
                },
            },
        },
        plugins: {
            ...defaultOptions.plugins,
            tooltip: {
                ...defaultOptions.plugins.tooltip,
                callbacks: {
                    label: function (context: any) {
                        return 'Ingresos: $' + context.parsed.y.toLocaleString();
                    },
                },
            },
        },
    };

    return (
        <div className="h-72 w-full">
            <Line data={chartData} options={options} />
        </div>
    );
}
