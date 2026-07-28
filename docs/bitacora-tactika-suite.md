# Bitacora Tactika Suite

Documento de seguimiento del avance tecnico y comercial de Tactika Suite.

## Regla de trabajo

Antes de agregar una funcion nueva, validar si cumple al menos una de estas condiciones:

- Ayuda a vender mas.
- Ayuda a entregar mejor servicio al cliente.
- Hace que el CRM sea mas util para prospeccion real.
- Mejora la estabilidad o escalabilidad de la plataforma.

## Estado general

Tactika Suite ya cuenta con una base funcional para operar como CRM comercial y plataforma de consultoria para pymes.

La prioridad actual es fortalecer el proceso comercial antes de seguir agregando modulos grandes.

## Modulos y mejoras completadas

### CRM Comercial

Estado: completado como base operativa.

Incluye:

- Pipeline Kanban.
- Estados comerciales: Prospecto, Contactado, Diagnostico Agendado, Diagnostico Realizado, Propuesta Enviada, Negociacion, Cliente y Perdido.
- Conversion automatica de prospecto a cliente.
- Edicion de prospectos.
- Eliminacion de prospectos.
- Alertas de seguimiento atrasado.

### Importacion Excel/CSV

Estado: implementado.

Incluye:

- Importador reutilizable.
- Mapeo de columnas.
- Vista previa antes de importar.
- Importacion aplicada a CRM y otros modulos.

Notas:

- Se corrigieron problemas de mayusculas/minusculas en imports para Vercel.
- Se valido build antes de publicar.

### Enriquecimiento de prospectos

Estado: implementado.

Incluye:

- Boton "Enriquecer prospectos".
- Busqueda guiada de informacion publica.
- Campos para sitio web, correo y redes sociales.
- Sugerencias de correos por dominio: contacto, ventas, comercial, administracion e info.
- Mensaje de primer contacto para copiar.
- Revision manual antes de guardar.

Decision importante:

- No se implemento envio automatico de correos.
- No se implemento scraping masivo.
- El enfoque queda como prospeccion segura y revisada por el usuario.

### KPIs superiores del CRM

Estado: implementado.

Incluye:

- Pipeline activo.
- Prospectos totales.
- Propuestas enviadas.
- Clientes ganados.
- Conversion.
- Seguimientos vencidos.

Objetivo:

- Dar una vista ejecutiva rapida del estado comercial.

### Historial del prospecto

Estado: implementado.

Incluye:

- Boton "Ver historial" en Kanban.
- Boton "Historial" en tabla.
- Panel lateral con linea de tiempo.
- Registro de creacion.
- Registro de cambios de estado.
- Visualizacion de proximo contacto, valor estimado y observaciones.

Decision tecnica:

- Se reutilizo la tabla existente `prospecto_historial`.
- No se creo una tabla nueva en esta etapa.

### Tareas y recordatorios

Estado: implementado.

Incluye:

- Panel de tareas y recordatorios.
- Agrupacion en atrasadas, hoy y esta semana.
- Acciones rapidas:
  - Editar prospecto.
  - Reprogramar para manana.
  - Reprogramar para 7 dias.

Decision tecnica:

- Se reutilizo `fechaProximoContacto`.
- No se creo una tabla independiente de tareas en esta primera version.

## Commits relevantes

- `142a975` Agrega enriquecimiento de prospectos.
- `df47d70` Conecta enriquecimiento en CRM.
- `0cc43cf` Agrega KPIs superiores al CRM.
- `ae776f8` Agrega historial del prospecto.
- `a3d4da7` Agrega tareas y recordatorios al CRM.

## Proxima etapa acordada

### Plantillas de mensajes comerciales

Objetivo:

Crear mensajes listos para copiar y usar en WhatsApp o correo, conectados al CRM.

Plantillas iniciales:

1. Primer contacto.
2. Seguimiento despues de llamada.
3. Envio de propuesta.
4. Recordatorio de propuesta pendiente.
5. Reactivacion de prospecto frio.

Regla:

- El sistema puede sugerir y copiar mensajes.
- El usuario revisa antes de enviar.
- No se enviaran mensajes automaticos en esta etapa.

## Sesiones de trabajo

### 2026-07-28 - Plantillas de mensajes comerciales

Objetivo:

- Crear un panel de plantillas comerciales dentro del CRM.
- Permitir seleccionar un prospecto y generar mensajes personalizados.
- Permitir copiar mensajes para WhatsApp o correo.
- Mantener revision manual antes de enviar.

Estado inicial:

- CRM estable con KPIs, historial, tareas y recordatorios.
- No se tocara Supabase en esta primera version.

Resultado:

- Se creo el panel de plantillas comerciales dentro del CRM.
- Se agregaron cinco plantillas iniciales:
  - Primer contacto.
  - Seguimiento despues de llamada.
  - Envio de propuesta.
  - Recordatorio de propuesta pendiente.
  - Reactivacion de prospecto frio.
- Se permite seleccionar prospecto y canal: WhatsApp o correo.
- Se permite editar y copiar el mensaje antes de enviarlo.
- Se agregaron accesos para abrir WhatsApp o preparar correo, sin envio automatico.
- Se valido `npm run build` correctamente.

Archivos modificados:

- `src/components/CRM/PlantillasMensajes.jsx`
- `src/pages/CRMComercial.jsx`
- `docs/bitacora-tactika-suite.md`

Proximo paso sugerido:

- Registrar interacciones comerciales: llamada, correo, WhatsApp, reunion y nota interna.

### 2026-07-28 - Registro de interacciones comerciales

Objetivo:

- Permitir registrar interacciones vinculadas a cada prospecto.
- Incluir llamadas, WhatsApp, correos, reuniones y notas internas.
- Mostrar estas interacciones dentro del historial comercial del prospecto.

Resultado:

- Se agrego el formulario "Registrar interaccion" en el CRM.
- Se creo el servicio `InteraccionComercialService`.
- Se agrego la migracion SQL para la tabla `prospecto_interacciones`.
- El historial del prospecto ahora mezcla cambios de estado e interacciones comerciales en una linea de tiempo.

Archivos modificados:

- `src/components/CRM/RegistrarInteraccion.jsx`
- `src/components/CRM/ProspectoHistorialPanel.jsx`
- `src/pages/CRMComercial.jsx`
- `src/services/InteraccionComercialService.js`
- `supabase/migrations/202607280001_prospecto_interacciones.sql`
- `docs/bitacora-tactika-suite.md`

Nota operativa:

- Antes de usar esta funcion en produccion, ejecutar la migracion SQL en Supabase.

### 2026-07-28 - Proximo paso sugerido

Objetivo:

- Al registrar una interaccion comercial, sugerir automaticamente un siguiente paso.
- Permitir definir fecha de seguimiento sin obligar al usuario.
- Actualizar el prospecto para que aparezca en tareas y recordatorios.

Resultado:

- El formulario de interacciones ahora muestra "Proximo paso sugerido".
- La sugerencia cambia segun el tipo de interaccion: llamada, WhatsApp, correo, reunion o nota.
- El usuario puede activar o desactivar la actualizacion del seguimiento.
- Si se confirma, se actualiza `fechaProximoContacto` del prospecto.
- La sugerencia queda registrada en observaciones del prospecto.

Archivos modificados:

- `src/components/CRM/RegistrarInteraccion.jsx`
- `src/pages/CRMComercial.jsx`
- `docs/bitacora-tactika-suite.md`

### 2026-07-28 - Mini ficha lateral del prospecto

Objetivo:

- Abrir una ficha rapida al hacer clic en una tarjeta del Kanban.
- Evitar que el usuario tenga que ir directo al formulario de edicion.
- Centralizar acciones comerciales desde una vista lateral.

Resultado:

- Se agrego el panel `ProspectoResumenPanel`.
- La tarjeta del Kanban ahora abre la ficha del prospecto.
- La ficha muestra contacto, estado, indice Tactika, valor estimado, probabilidad, proximo seguimiento, ultimas interacciones y observaciones.
- La ficha permite ejecutar acciones rapidas:
  - Registrar interaccion.
  - Abrir plantillas.
  - Ver historial.
  - Editar prospecto.
  - Reprogramar seguimiento.

Archivos modificados:

- `src/components/CRM/ProspectoResumenPanel.jsx`
- `src/pages/CRMComercial.jsx`
- `src/components/CRM/PlantillasMensajes.jsx`
- `src/components/CRM/RegistrarInteraccion.jsx`
- `docs/bitacora-tactika-suite.md`

## Pendientes tecnicos

- Revisar errores existentes de `npm run lint`.
- Evaluar una tabla futura para tareas reales si el CRM requiere multiples tareas por prospecto.
- Evaluar una tabla futura para mensajes o interacciones comerciales.
- Separar componentes pesados si el bundle sigue creciendo.
- Revisar politicas RLS de Supabase antes de escalar usuarios externos.

## Pendientes comerciales

- Definir discurso final del Metodo Tactika.
- Crear folleto comercial.
- Crear presentacion de ventas.
- Crear propuesta comercial PDF.
- Definir oferta inicial: diagnostico, implementacion y suscripcion.
- Preparar lista de prospectos priorizados para primeras conversaciones.
