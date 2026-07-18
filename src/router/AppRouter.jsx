import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard";
import Clientes from "../pages/Clientes";
import Diagnostico from "../pages/Diagnostico";
import PlanAccion from "../pages/PlanAccion";
import Seguimientos from "../pages/Seguimientos";
import Reportes from "../pages/Reportes";
import Configuracion from "../pages/Configuracion";

// 1. NUEVAS IMPORTACIONES
import GestionPersonal from "../pages/GestionPersonal";
import MatrizRiesgos from "../pages/MatrizRiesgos";

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
          
          {/* 2. NUEVAS RUTAS CONECTADAS */}
          <Route path="/personal" element={<GestionPersonal />} />
          <Route path="/riesgos" element={<MatrizRiesgos />} />
          
          <Route path="/configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}