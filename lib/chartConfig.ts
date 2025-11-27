import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  BarElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Modern Neutral Color Palette (Light Mode Optimized)
export const colors = {
  primary: 'rgb(15, 23, 42)', // slate-900
  secondary: 'rgb(100, 116, 139)', // slate-500
  accent: 'rgb(79, 70, 229)', // indigo-600
  success: 'rgb(16, 185, 129)', // emerald-500
  warning: 'rgb(245, 158, 11)', // amber-500
  danger: 'rgb(239, 68, 68)', // red-500
  surface: 'rgb(255, 255, 255)', // white
  border: 'rgb(226, 232, 240)', // slate-200
};

// Default chart options
export const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        },
        color: 'rgb(100, 116, 139)', // slate-500
      },
    },
    tooltip: {
      backgroundColor: 'rgb(15, 23, 42)', // slate-900
      padding: 12,
      titleFont: {
        size: 13,
        family: "'Inter', sans-serif",
      },
      bodyFont: {
        size: 12,
        family: "'Inter', sans-serif",
      },
      cornerRadius: 8,
      displayColors: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: 'rgb(100, 116, 139)', // slate-500
        font: {
          family: "'Inter', sans-serif",
        },
      },
      border: {
        display: false,
      },
    },
    y: {
      grid: {
        color: 'rgba(226, 232, 240, 0.8)', // slate-200
        borderDash: [4, 4],
      },
      ticks: {
        color: 'rgb(100, 116, 139)', // slate-500
        font: {
          family: "'Inter', sans-serif",
        },
        padding: 10,
      },
      border: {
        display: false,
      },
    },
  },
};
