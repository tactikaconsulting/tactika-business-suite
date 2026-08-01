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

### 2026-07-28 - Acciones rapidas desde ficha lateral

Objetivo:

- Permitir avanzar un prospecto desde la ficha lateral sin abrir el formulario completo.
- Reducir pasos operativos en el CRM comercial.
- Mantener el pipeline actualizado desde una vista ejecutiva.

Resultado:

- Se agrego una seccion "Acciones rapidas" en la ficha lateral del prospecto.
- Las acciones disponibles permiten:
  - Marcar como contactado.
  - Agendar diagnostico.
  - Marcar propuesta enviada.
  - Convertir a cliente.
  - Marcar como perdido.
- Cada accion actualiza el estado del prospecto usando la misma logica del Kanban.
- Si se convierte en cliente, se mantiene la conversion automatica existente.

Archivos modificados:

- `src/components/CRM/ProspectoResumenPanel.jsx`
- `src/pages/CRMComercial.jsx`
- `docs/bitacora-tactika-suite.md`

### 2026-07-28 - Propuestas comerciales en CRM

Objetivo:

- Crear una primera version del modulo de propuestas comerciales dentro del CRM.
- Permitir registrar una propuesta desde la ficha lateral del prospecto.
- Dejar trazabilidad del plan, valor y alcance ofrecido.

Resultado:

- Se agrego el formulario `CrearPropuestaComercial`.
- Cada propuesta registra prospecto, titulo, plan, valor de implementacion, mensualidad, alcance, condiciones, estado y fecha de envio.
- La ficha lateral del prospecto muestra las ultimas propuestas asociadas.
- Si una propuesta se guarda como "Enviada", el prospecto pasa automaticamente a "Propuesta Enviada".
- Se agrego una migracion SQL para crear la tabla `prospecto_propuestas` en Supabase.

Archivos modificados:

- `src/components/CRM/CrearPropuestaComercial.jsx`
- `src/components/CRM/ProspectoResumenPanel.jsx`
- `src/pages/CRMComercial.jsx`
- `src/services/PropuestaComercialService.js`
- `supabase/migrations/202607280002_prospecto_propuestas.sql`
- `docs/bitacora-tactika-suite.md`

Nota operativa:

- Antes de usar esta funcion en produccion, ejecutar la migracion SQL en Supabase.
- La generacion formal de propuesta en PDF queda como siguiente mejora.

### 2026-07-28 - PDF de propuesta comercial

Objetivo:

- Permitir descargar una propuesta comercial en PDF desde la ficha del prospecto.
- Reutilizar las librerias existentes de reportes para no agregar dependencias nuevas.
- Entregar un documento simple con identidad Tactika para enviar al cliente.

Resultado:

- Se agrego el servicio `PropuestaPDFService`.
- Cada propuesta guardada muestra un boton "Descargar PDF".
- El PDF incluye datos del prospecto, plan sugerido, valor de implementacion, mensualidad, alcance y condiciones.
- El documento usa encabezado oscuro con marca Tactika Consulting y pie de pagina.

Archivos modificados:

- `src/services/PropuestaPDFService.js`
- `src/components/CRM/ProspectoResumenPanel.jsx`
- `src/pages/CRMComercial.jsx`
- `docs/bitacora-tactika-suite.md`

### 2026-07-28 - Plantillas y vista previa de propuestas

Objetivo:

- Acelerar la creacion de propuestas comerciales.
- Evitar redactar desde cero cada alcance.
- Mejorar la propuesta como documento de venta.

Resultado:

- El formulario de propuesta ahora carga plantillas segun el plan seleccionado:
  - Diagnostico Empresarial.
  - Sistema Tactika Base.
  - Sistema Tactika Profesional.
  - Sistema Tactika Enterprise.
  - Proyecto a medida.
- Cada plantilla completa titulo, valor de implementacion, mensualidad, alcance y condiciones.
- Los textos siguen siendo editables antes de guardar.
- Se agrego una vista previa comercial dentro del formulario.
- El PDF incluye una bajada comercial y un siguiente paso recomendado.

Archivos modificados:

- `src/components/CRM/CrearPropuestaComercial.jsx`
- `src/services/PropuestaPDFService.js`
- `docs/bitacora-tactika-suite.md`

### 2026-07-28 - Seguimiento de propuestas comerciales

Objetivo:

- Controlar las propuestas comerciales despues de crearlas.
- Ver rapidamente cuantas estan en borrador, enviadas, aceptadas o rechazadas.
- Detectar propuestas enviadas que requieren seguimiento.

Resultado:

- Se agrego el panel `SeguimientoPropuestas`.
- El CRM muestra resumen por estado de propuesta y monto asociado.
- Las propuestas enviadas hace 3 dias o mas aparecen como pendientes de seguimiento.
- Desde el panel se puede:
  - Ver la ficha del prospecto.
  - Descargar PDF.
  - Registrar seguimiento.
  - Marcar una propuesta como enviada.
  - Marcar una propuesta como aceptada.
  - Marcar una propuesta como rechazada.
- Si una propuesta se marca como enviada, el prospecto pasa a "Propuesta Enviada".
- Si una propuesta se marca como aceptada, el prospecto pasa a "Cliente".
- Si una propuesta se marca como rechazada, el prospecto pasa a "Perdido".

Archivos modificados:

- `src/components/CRM/SeguimientoPropuestas.jsx`
- `src/pages/CRMComercial.jsx`
- `src/services/PropuestaComercialService.js`
- `docs/bitacora-tactika-suite.md`

### 2026-07-28 - CRM ordenado por secciones

Objetivo:

- Evitar que la pantalla del CRM quede saturada con demasiada informacion apilada.
- Separar las funciones principales por area de trabajo.
- Mejorar la experiencia de uso diaria del CRM.

Resultado:

- Se reorganizo el CRM en pestañas principales:
  - Pipeline.
  - Tareas.
  - Propuestas.
  - Dashboard.
- La vista Pipeline concentra KPIs, alertas, Kanban y lista operativa de prospectos.
- La vista Tareas concentra seguimientos y recordatorios.
- La vista Propuestas concentra el control de propuestas comerciales.
- La vista Dashboard queda enfocada en indicadores y analisis.
- No se cambio la base de datos ni la logica comercial existente.

Archivos modificados:

- `src/pages/CRMComercial.jsx`
- `docs/bitacora-tactika-suite.md`

### 2026-07-28 - Inicio ejecutivo del CRM

Objetivo:

- Crear una vista inicial para comenzar el trabajo comercial del dia.
- Mostrar prioridades sin obligar al usuario a revisar todas las pestañas.
- Convertir el CRM en una herramienta de gestion diaria.

Resultado:

- Se agrego la pestaña "Inicio" como primera vista del CRM.
- El inicio muestra:
  - Pipeline activo.
  - Seguimientos vencidos.
  - Monto de propuestas enviadas.
  - Propuestas sin respuesta.
  - Prospectos prioritarios.
  - Seguimientos vencidos o para hoy.
  - Propuestas pendientes.
  - Oportunidades de mayor valor.
- Desde Inicio se puede abrir ficha, registrar interaccion, crear propuesta o navegar a Pipeline, Tareas y Propuestas.
- No se agregaron tablas ni cambios en Supabase.

Archivos modificados:

- `src/components/CRM/InicioCRM.jsx`
- `src/pages/CRMComercial.jsx`
- `docs/bitacora-tactika-suite.md`

### 2026-07-28 - Pulido visual del CRM

Objetivo:

- Mejorar la presentacion general del CRM para uso diario y demostraciones comerciales.
- Evitar que botones, pestañas y secciones se vean apretadas.
- Mejorar respuesta visual en pantallas pequenas.

Resultado:

- Se rediseño el encabezado del CRM como bloque principal con titulo, descripcion, acciones y pestañas.
- Los botones superiores ahora tienen iconos, mejor altura y distribucion responsiva.
- Las pestañas principales quedaron en una barra horizontal con scroll cuando sea necesario.
- El inicio CRM ajusta mejor sus tarjetas, textos y botones en desktop y movil.
- El Kanban ahora vive dentro de un contenedor con titulo y descripcion, para verse mas profesional.
- Se corrigio la estructura visual de la seccion Lista de prospectos.

Archivos modificados:

- `src/pages/CRMComercial.jsx`
- `src/components/CRM/InicioCRM.jsx`
- `src/components/CRM/KanbanBoard.jsx`
- `docs/bitacora-tactika-suite.md`

### 2026-07-28 - Agente de venta conectado al CRM

Objetivo:

- Automatizar la captura de prospectos desde la landing page.
- Hacer que el agente de venta registre interesados directamente en el CRM.
- Mantener una version segura, sin envios masivos ni cierre automatico de ventas.

Resultado:

- Se fortalecio la funcion `agente-venta`.
- El agente ahora solo registra un prospecto cuando tiene empresa, dato de contacto y autorizacion del visitante.
- Se evita duplicar prospectos buscando coincidencias por correo o telefono.
- Si el prospecto ya existe, se actualiza su ficha en vez de crear otro registro.
- Se programa seguimiento para el dia siguiente cuando el prospecto viene desde la landing.
- Se registra una interaccion comercial con resumen de la conversacion.
- La landing muestra confirmacion cuando los datos fueron registrados.

Archivos modificados:

- `supabase/functions/agente-venta/index.ts`
- `/Users/claudioandresurrairarrazabal/Downloads/tactika-landing-repo/index.html`
- `docs/bitacora-tactika-suite.md`

Nota operativa:

- Para activar esta mejora en produccion, desplegar nuevamente la funcion Supabase `agente-venta` y publicar la landing.

### 2026-07-29 - Envio de plantillas por WhatsApp y correo

Objetivo:

- Permitir contactar prospectos desde las plantillas comerciales del CRM.
- Abrir WhatsApp o correo con el mensaje preparado.
- Registrar automaticamente la accion en el historial comercial.

Resultado:

- El boton WhatsApp abre el enlace con el mensaje editado.
- El boton correo prepara un `mailto` con asunto y cuerpo del mensaje.
- Al abrir WhatsApp o correo, se registra una interaccion comercial.
- Se programa seguimiento automatico: 2 dias para WhatsApp y 3 dias para correo.
- El mensaje queda guardado en el detalle de la interaccion.

Archivos modificados:

- `src/components/CRM/PlantillasMensajes.jsx`
- `src/pages/CRMComercial.jsx`
- `docs/bitacora-tactika-suite.md`

### 2026-07-29 - Eliminacion en ficha CRM y control de duplicados

Objetivo:

- Agregar una opcion visible para eliminar prospectos desde la ficha lateral del CRM.
- Evitar que un prospecto convertido a cliente cree duplicados si el cliente ya existe.

Resultado:

- La ficha lateral del prospecto ahora muestra un boton Eliminar.
- Al eliminar desde la ficha, el panel se cierra y el CRM recarga la informacion.
- La conversion de prospecto a cliente busca coincidencias por RUT, correo, telefono o empresa antes de crear un nuevo cliente.
- Si encuentra un cliente existente, solo vincula el prospecto a ese cliente.

Archivos modificados:

- `src/components/CRM/ProspectoResumenPanel.jsx`
- `src/pages/CRMComercial.jsx`
- `src/services/ProspectoService.js`
- `docs/bitacora-tactika-suite.md`

### 2026-07-29 - Campanas comerciales en CRM

Objetivo:

- Crear una primera version segura para automatizar seguimiento comercial.
- Programar mensajes por correo o WhatsApp desde el CRM.
- Mantener revision manual antes de abrir el canal de envio.

Resultado:

- Se agrego la pestaña Campanas al CRM Comercial.
- Se puede crear una campana con nombre, canal, plantilla, fecha y prospectos seleccionados.
- El sistema crea mensajes programados para cada prospecto.
- Cada mensaje puede prepararse por correo o WhatsApp desde el CRM.
- Al preparar o marcar como enviado, se registra una interaccion comercial y un proximo seguimiento.
- WhatsApp queda como envio manual para evitar riesgos de bloqueo.
- El correo queda preparado para una futura integracion con Gmail, Resend o Brevo.

Archivos modificados:

- `src/components/CRM/CampanasComerciales.jsx`
- `src/services/CampanaComercialService.js`
- `src/pages/CRMComercial.jsx`
- `supabase/migrations/202607290001_campanas_comerciales.sql`
- `docs/bitacora-tactika-suite.md`

### 2026-07-31 - Ajuste del agente de venta en landing

Objetivo:

- Mejorar el agente de venta para que ayude a captar prospectos desde la landing.
- Cambiar el enfoque desde una conversacion generica hacia un flujo comercial simple.
- Hacer que el visitante pueda iniciar rapidamente una conversacion sobre clientes, ventas, inventario o diagnostico.

Resultado:

- El chat de la landing ahora muestra opciones rapidas para iniciar la conversacion.
- El agente se abre de forma proactiva una vez por sesion despues de unos segundos.
- El mensaje inicial orienta al visitante hacia problemas concretos de gestion.
- El prompt interno del agente ahora sigue un flujo comercial: detectar problema, ofrecer diagnostico, pedir datos minimos y solicitar autorizacion antes de guardar.
- La funcion `agente-venta` fue desplegada en Supabase.
- Los cambios fueron subidos a GitHub para que Vercel actualice la landing.

Archivos modificados:

- `index.html` en landing Tactika.
- `supabase/functions/agente-venta/index.ts`
- `docs/bitacora-tactika-suite.md`

### 2026-08-01 - Correccion de error en agente de venta

Objetivo:

- Corregir el error mostrado en la landing cuando el visitante intentaba conversar con el agente.
- Evitar que el chat responda solo "no pude procesar tu mensaje" sin explicar el problema.

Resultado:

- Se corrigio el nombre del modelo usado por la funcion `agente-venta`.
- Se agrego una respuesta de respaldo si la IA externa responde con error.
- Se desplego nuevamente la funcion en Supabase.
- El agente queda preparado para indicar un detalle tecnico si vuelve a fallar la conexion con la IA.

Archivos modificados:

- `supabase/functions/agente-venta/index.ts`
- `docs/bitacora-tactika-suite.md`

### 2026-08-01 - Agente de venta guiado sin IA

Objetivo:

- Evitar que la captacion de prospectos dependa de una API externa.
- Dejar funcionando el agente de venta aunque no exista credito o clave activa de IA.
- Mantener el registro automatico de prospectos en el CRM.

Resultado:

- Se reemplazo la logica con IA por un flujo guiado fijo.
- El agente pregunta por problema, empresa, comuna, contacto, telefono/correo y trabajadores.
- El agente solicita autorizacion antes de registrar el prospecto.
- Si el visitante autoriza, el lead queda guardado en la tabla `prospectos`.
- Se registra una interaccion comercial en `prospecto_interacciones`.
- La funcion `agente-venta` fue desplegada nuevamente en Supabase.

Archivos modificados:

- `supabase/functions/agente-venta/index.ts`
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
