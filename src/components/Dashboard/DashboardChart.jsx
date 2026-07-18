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
}) {
  const data = {
    labels: ["Clientes", "Diagnósticos", "Planes"],
    datasets: [
      {
        label: "Registros",
        data: [clientes, diagnosticos, planes],
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
        ],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">
        Resumen General
      </h2>

      <Bar data={data} options={options} />
    </div>
  );
}