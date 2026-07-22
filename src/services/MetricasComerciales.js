export function calcularMetricasComerciales(prospectos, historial) {
  const cantidadProspectos = prospectos.length;

  const pasoPor = (estado) =>
    new Set(historial.filter((h) => h.estadoNuevo === estado).map((h) => h.prospectoId)).size;

  const diagnosticosAgendados = pasoPor("Diagnóstico Agendado");
  const diagnosticosRealizados = pasoPor("Diagnóstico Realizado");
  const propuestasEnviadas = pasoPor("Propuesta Enviada");

  const clientesGanados = prospectos.filter((p) => p.estado === "Cliente").length;
  const clientesPerdidos = prospectos.filter((p) => p.estado === "Perdido").length;

  const activos = prospectos.filter((p) => p.estado !== "Cliente" && p.estado !== "Perdido");

  const montoPotencial = activos.reduce((acc, p) => acc + (Number(p.valorEstimado) || 0), 0);
  const montoVendido = prospectos
    .filter((p) => p.estado === "Cliente")
    .reduce((acc, p) => acc + (Number(p.valorEstimado) || 0), 0);

  const conversion = cantidadProspectos === 0 ? 0 : Math.round((clientesGanados / cantidadProspectos) * 100);

  // Tiempo promedio de cierre: días entre creación y el momento en que llegó a "Cliente"
  const tiempos = prospectos
    .filter((p) => p.estado === "Cliente")
    .map((p) => {
      const cierre = historial.find((h) => h.prospectoId === p.id && h.estadoNuevo === "Cliente");
      if (!cierre || !p.createdAt) return null;
      const dias = (new Date(cierre.fecha) - new Date(p.createdAt)) / (1000 * 60 * 60 * 24);
      return dias >= 0 ? dias : null;
    })
    .filter((d) => d !== null);

  const tiempoPromedioCierre =
    tiempos.length === 0 ? null : Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length);

  // Agrupaciones
  const agrupar = (campo) => {
    const mapa = {};
    prospectos.forEach((p) => {
      const clave = p[campo]?.trim() || "Sin especificar";
      mapa[clave] = (mapa[clave] || 0) + 1;
    });
    return Object.entries(mapa)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  };

  const porComuna = agrupar("comuna").slice(0, 6);
  const porRubro = agrupar("giro").slice(0, 6);

  // Ranking de oportunidades: valor estimado x probabilidad, solo pipeline activo
  const ranking = activos
    .map((p) => ({
      ...p,
      puntajeOportunidad: (Number(p.valorEstimado) || 0) * ((Number(p.probabilidadCierre) || 0) / 100),
    }))
    .sort((a, b) => b.puntajeOportunidad - a.puntajeOportunidad)
    .slice(0, 5);

  return {
    cantidadProspectos,
    diagnosticosAgendados,
    diagnosticosRealizados,
    propuestasEnviadas,
    clientesGanados,
    clientesPerdidos,
    montoPotencial,
    montoVendido,
    conversion,
    tiempoPromedioCierre,
    porComuna,
    porRubro,
    ranking,
  };
}