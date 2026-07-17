export default function Sidebar() {

    return (

        <aside className="w-64 h-screen bg-slate-900 text-white">

            <div className="p-6 text-2xl font-bold border-b border-slate-700">

                Táctika

            </div>

            <nav className="mt-6">

                <ul className="space-y-2">

                    <li className="px-6 py-3 hover:bg-slate-700 cursor-pointer">
                        Dashboard
                    </li>

                    <li className="px-6 py-3 hover:bg-slate-700 cursor-pointer">
                        Clientes
                    </li>

                    <li className="px-6 py-3 hover:bg-slate-700 cursor-pointer">
                        Diagnóstico
                    </li>

                    <li className="px-6 py-3 hover:bg-slate-700 cursor-pointer">
                        Plan Acción
                    </li>

                    <li className="px-6 py-3 hover:bg-slate-700 cursor-pointer">
                        Seguimiento
                    </li>

                    <li className="px-6 py-3 hover:bg-slate-700 cursor-pointer">
                        Reportes
                    </li>

                    <li className="px-6 py-3 hover:bg-slate-700 cursor-pointer">
                        RRHH
                    </li>

                    <li className="px-6 py-3 hover:bg-slate-700 cursor-pointer">
                        Configuración
                    </li>

                </ul>

            </nav>

        </aside>

    );

}