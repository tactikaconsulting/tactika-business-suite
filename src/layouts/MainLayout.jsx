import { Sidebar, Topbar } from "../components/layout";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Contenido */}
      <div className="flex-1 flex flex-col">

        {/* Barra superior */}
        <Topbar />

        {/* Contenido de las páginas */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}