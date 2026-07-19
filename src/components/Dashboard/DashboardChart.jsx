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
    labels: ["Clientes", "Diagnósticos", "Planes", "Seguimientos"],
    datasets: [
      {
        label: "Registros",
        data: [clientes, diagnosticos, planes, seguimientos],
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#06B6D4",
        ],
        borderRadius: 8,
        maxBarThickness: 60,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 10,
        cornerRadius: 8,
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
            weight: "500",
          },
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: 5,
        grid: {
          color: "#f1f5f9",
        },
        ticks: {
          color: "#94a3b8",
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
      <h2 className="text-xl font-bold mb-6 text-slate-800">
        Resumen General
      </h2>

      <div style={{ height: "300px" }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}