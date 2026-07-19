import { Calendar, TrendingUp } from "lucide-react";

export default function WelcomeBanner() {
  const fecha = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl p-8 shadow-lg">

      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">

        <div>
          <h1 className="text-3xl font-bold">
            Bienvenido a Táctika Business Suite
          </h1>

          <p className="mt-3 text-blue-100">
            Administra clientes, diagnósticos, planes de acción y seguimientos
            desde un solo lugar.
          </p>
        </div>

        <div className="flex gap-6">

          <div className="bg-white/20 rounded-xl p-4 text-center min-w-[150px]">
            <Calendar className="mx-auto mb-2" />
            <p className="text-sm">Hoy</p>
            <p className="font-semibold capitalize">{fecha}</p>
          </div>

          <div className="bg-white/20 rounded-xl p-4 text-center min-w-[150px]">
            <TrendingUp className="mx-auto mb-2" />
            <p className="text-sm">Estado</p>
            <p className="font-semibold">Sistema Operativo</p>
          </div>

        </div>

      </div>

    </div>
  );
}