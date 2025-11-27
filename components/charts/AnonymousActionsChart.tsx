'use client';

import { Bar } from 'react-chartjs-2';
import { defaultOptions, colors } from '@/lib/chartConfig';

interface ActionData {
    action: string;
    count: number;
}

interface AnonymousActionsChartProps {
    data: ActionData[];
}

export default function AnonymousActionsChart({ data }: AnonymousActionsChartProps) {
    const chartData = {
        labels: data.map(d => d.action),
        datasets: [
            {
                label: 'Eventos',
                data: data.map(d => d.count),
                backgroundColor: colors.primary,
                borderRadius: 4,
                barThickness: 20,
            },
        ],
    };

    const options = {
        ...defaultOptions,
        indexAxis: 'y' as const,
        plugins: {
            ...defaultOptions.plugins,
            legend: {
                display: false,
            },
        },
        scales: {
            ...defaultOptions.scales,
            x: {
                ...defaultOptions.scales.x,
                grid: {
                    display: true,
                    color: 'rgb(241, 245, 249)',
                    borderDash: [4, 4],
                },
                beginAtZero: true,
            },
            y: {
                ...defaultOptions.scales.y,
                grid: {
                    display: false,
                }
            }
        },
    };

    return (
        <div className="h-80 w-full">
            <Bar data={chartData} options={options} />
        </div>
    );
}
