import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function DashboardChart({
  clientes = 0,
  diagnosticos = 0,
  planes = 0,
  seguimientos = 0,
}) {
  const data = {
    labels: [
      "Clientes",
      "Diagnósticos",
      "Planes",
      "Seguimientos",
    ],
    datasets: [
      {
        label: "Registros",
        data: [
          clientes,
          diagnosticos,
          planes,
          seguimientos,
        ],
        backgroundColor: [
          "#2563EB",
          "#10B981",
          "#F59E0B",
          "#06B6D4",
        ],
        borderRadius: 12,
        borderSkipped: false,
        maxBarThickness: 55,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0F172A",
        padding: 12,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#475569",
          font: {
            size: 13,
            weight: "bold",
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: "#64748B",
        },
        grid: {
          color: "#E2E8F0",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Resumen General
          </h2>

          <p className="text-slate-500 text-sm">
            Estado general del sistema
          </p>
        </div>
      </div>

      <div className="h-80">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}