import { ArrowUpRight, BriefcaseBusiness, ChartNoAxesCombined, ContactRound, UsersRound } from "lucide-react";

const gestionUrl = "https://vique.tactikaconsulting.com/admin/gestion";

const areas = [
  { nombre: "Usuarios", descripcion: "Cuentas, saldos y llamadas registradas", icono: UsersRound, ancla: "usuarios" },
  { nombre: "RR. HH.", descripcion: "Anfitrionas, contratos y actividad", icono: BriefcaseBusiness, ancla: "rrhh" },
  { nombre: "Ventas", descripcion: "Recargas pagadas y liquidaciones", icono: ChartNoAxesCombined, ancla: "ventas" },
  { nombre: "CRM", descripcion: "Clientes pendientes de seguimiento", icono: ContactRound, ancla: "crm" },
];

export default function App() {
  return (
    <main className="min-h-screen bg-[#f7f8f8] text-[#18262a]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dbe3e3] pb-6">
          <div>
            <p className="text-xs font-bold uppercase text-teal-700">Tactika Business Suite</p>
            <h1 className="mt-1 text-3xl font-bold">Gestión Vique</h1>
            <p className="mt-2 text-sm text-[#5f7074]">Usuarios, anfitrionas, ventas y seguimiento en un solo lugar.</p>
          </div>
          <a href={gestionUrl} className="inline-flex items-center gap-2 bg-[#146a62] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0d514b]">
            Abrir control de gestión <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </header>

        <section className="py-7" aria-label="Áreas de gestión">
          <div className="divide-y divide-[#dbe3e3] border-y border-[#dbe3e3]">
            {areas.map(({ nombre, descripcion, icono: Icono, ancla }) => (
              <a key={ancla} href={`${gestionUrl}#${ancla}`} className="flex items-center gap-4 px-2 py-5 hover:bg-white sm:px-4">
                <Icono size={22} className="shrink-0 text-teal-700" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <strong className="block text-base">{nombre}</strong>
                  <span className="block text-sm text-[#5f7074]">{descripcion}</span>
                </span>
                <ArrowUpRight size={18} className="shrink-0 text-[#708185]" aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>

        <p className="text-xs text-[#66777a]">Los datos se consultan en Vique con acceso de administrador. La información anterior de Tactika no se muestra ni se ha borrado.</p>
      </div>
    </main>
  );
}
