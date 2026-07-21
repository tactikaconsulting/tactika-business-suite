import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import RutaProtegida from "../components/RutaProtegida";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Clientes from "../pages/Clientes";
import Diagnostico from "../pages/Diagnostico";
import PlanAccion from "../pages/PlanAccion";
import Seguimientos from "../pages/Seguimientos";
import Reportes from "../pages/Reportes";
import Configuracion from "../pages/Configuracion";

import GestionPersonal from "../pages/GestionPersonal";
import MatrizRiesgos from "../pages/MatrizRiesgos";
import CRMComercial from "../pages/CRMComercial"; // ⬅ NUEVO

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<RutaProtegida />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/diagnosticos" element={<Diagnostico />} />
            <Route path="/planes" element={<PlanAccion />} />
            <Route path="/seguimiento" element={<Seguimientos />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/personal" element={<GestionPersonal />} />
            <Route path="/riesgos" element={<MatrizRiesgos />} />
            <Route path="/crm" element={<CRMComercial />} /> {/* ⬅ NUEVO */}
            <Route path="/configuracion" element={<Configuracion />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}