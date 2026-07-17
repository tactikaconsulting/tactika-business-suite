import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard";
import Clientes from "../pages/Clientes";
import Diagnostico from "../pages/Diagnostico";
import PlanAccion from "../pages/PlanAccion";
import Seguimientos from "../pages/Seguimientos";
import Reportes from "../pages/Reportes";
import Configuracion from "../pages/configuracion";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/diagnosticos" element={<Diagnostico />} />
          <Route path="/planes" element={<PlanAccion />} />
          <Route path="/seguimiento" element={<Seguimientos />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}