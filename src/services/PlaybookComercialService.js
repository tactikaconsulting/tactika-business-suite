export const etapasPlaybook = [
  {
    id: "primer-contacto",
    nombre: "Primer contacto",
    objetivo: "Abrir conversacion sin presionar una venta.",
    cuandoUsar: "Cuando tienes una empresa en CRM con telefono, correo o redes.",
    mensajeWhatsApp:
      "Hola, soy Claudio Urra de Tactika Consulting. Estamos conversando con pymes para entender como estan gestionando clientes, ventas, tareas y seguimiento. Me gustaria hacerte 2 preguntas rapidas para ver si podemos aportar valor con un diagnostico empresarial. ¿Con quien podria hablar 10 minutos?",
    correo:
      "Hola,\n\nSoy Claudio Urra, de Tactika Consulting. Estamos ayudando a pymes a ordenar su gestion comercial y operativa cuando la informacion esta repartida entre WhatsApp, Excel, papel o distintas planillas.\n\nLa idea no es vender un sistema de inmediato, sino primero entender como trabajan y detectar si existe una oportunidad real de mejora.\n\n¿Te haria sentido coordinar una conversacion breve de 10 a 15 minutos?\n\nSaludos,\nClaudio Urra\nTactika Consulting",
    guionLlamada: [
      "Hola, mi nombre es Claudio Urra, de Tactika Consulting.",
      "Estamos conversando con empresas de la zona para entender como gestionan clientes, ventas y procesos internos.",
      "No lo llamo para venderle un software ahora. Primero quiero saber si existe algun problema real donde podamos aportar.",
      "¿Hoy trabajan con algun sistema o principalmente con Excel, WhatsApp o planillas?",
      "Si detectamos algo concreto, puedo proponerle un diagnostico breve y ordenado.",
    ],
    cierre: "El objetivo no es cerrar venta. Es conseguir una reunion o autorizacion para enviar informacion.",
  },
  {
    id: "diagnostico",
    nombre: "Invitar al diagnostico",
    objetivo: "Convertir interes en una reunion concreta.",
    cuandoUsar: "Cuando el prospecto responde o muestra algun dolor.",
    mensajeWhatsApp:
      "Perfecto. Lo que hacemos normalmente es partir con un diagnostico empresarial breve. Revisamos como gestionan clientes, ventas, tareas y procesos; luego entregamos recomendaciones concretas y, si tiene sentido, una propuesta de implementacion con Tactika Suite. ¿Te acomoda que lo veamos en una reunion de 20 minutos?",
    correo:
      "Hola,\n\nGracias por responder. Para avanzar ordenadamente, te propongo partir con un Diagnostico Empresarial Tactika.\n\nEn esa instancia revisamos como se gestionan clientes, ventas, tareas, documentos y seguimiento. Luego entregamos una mirada clara de oportunidades de mejora y, si corresponde, una propuesta de implementacion adaptada a la empresa.\n\n¿Te acomoda coordinar una reunion breve esta semana?\n\nSaludos,\nClaudio Urra",
    guionLlamada: [
      "Lo primero no seria implementar nada, sino entender bien como trabajan.",
      "El diagnostico nos permite ver donde se pierde tiempo, informacion o control.",
      "Despues de eso recien vemos si Tactika Suite calza con lo que necesitan.",
      "¿Le parece si agendamos una reunion breve y lo revisamos con calma?",
    ],
    cierre: "Cerrar fecha y hora. Si no acepta, pedir permiso para enviar informacion.",
  },
  {
    id: "propuesta",
    nombre: "Enviar propuesta",
    objetivo: "Mostrar valor y dejar claro el siguiente paso.",
    cuandoUsar: "Despues de diagnostico o reunion con interes real.",
    mensajeWhatsApp:
      "Te envio la propuesta con el alcance conversado. La idea es partir con una implementacion simple, enfocada en ordenar lo mas urgente y dejar una base para seguir creciendo. Si quieres, la revisamos juntos en 15 minutos para resolver dudas y ajustar lo necesario.",
    correo:
      "Hola,\n\nTe comparto la propuesta de Tactika Consulting segun lo conversado.\n\nEl foco inicial es ordenar los procesos prioritarios, configurar Tactika Suite de acuerdo a la realidad de la empresa y acompañar la puesta en marcha para que el sistema se use de forma practica.\n\nQuedo atento para revisarla juntos y ajustar el alcance si hace falta.\n\nSaludos,\nClaudio Urra",
    guionLlamada: [
      "La propuesta esta pensada para partir por lo que genera valor primero.",
      "No buscamos llenar la empresa de modulos, sino implementar lo que realmente necesitan.",
      "El diagnostico nos mostro que el primer foco deberia ser el control y seguimiento.",
      "Si esto le hace sentido, el siguiente paso es definir fecha de inicio.",
    ],
    cierre: "Proponer reunion de revision y pedir decision concreta.",
  },
  {
    id: "seguimiento",
    nombre: "Seguimiento sin presionar",
    objetivo: "Reactivar una oportunidad sin sonar insistente.",
    cuandoUsar: "Cuando pasaron 2 a 5 dias sin respuesta.",
    mensajeWhatsApp:
      "Hola, solo queria hacer seguimiento a lo que conversamos. No quiero presionarte; solo saber si sigue teniendo sentido revisar una mejora para ordenar la gestion de la empresa o si prefieres que lo dejemos para mas adelante.",
    correo:
      "Hola,\n\nTe escribo solo para hacer seguimiento a nuestra conversacion. Mi intencion no es presionar, sino saber si sigue siendo oportuno avanzar con el diagnostico o la propuesta.\n\nSi no es prioridad ahora, no hay problema. Podemos retomarlo mas adelante.\n\nSaludos,\nClaudio Urra",
    guionLlamada: [
      "Lo llamo solo para cerrar el ciclo de nuestra conversacion.",
      "Queria saber si esto sigue siendo una prioridad para ustedes.",
      "Si no es el momento, lo dejamos registrado y lo retomamos mas adelante.",
      "Si todavia les interesa, definimos un siguiente paso concreto.",
    ],
    cierre: "Obtener respuesta: avanzar, pausar o cerrar como perdido.",
  },
];

export const objecionesPlaybook = [
  {
    objecion: "No tengo presupuesto.",
    respuesta:
      "Lo entiendo. Por eso no proponemos implementar todo de inmediato. Partimos con un diagnostico y luego priorizamos solo lo que puede generar valor primero. La idea es que la inversion tenga sentido para la empresa.",
  },
  {
    objecion: "Ya usamos Excel.",
    respuesta:
      "Perfecto. Excel sirve bastante al comienzo. El problema aparece cuando la informacion crece, se duplica o depende de una sola persona. Tactika no busca borrar lo que ya hacen, sino ordenar y centralizar lo que hoy cuesta controlar.",
  },
  {
    objecion: "No necesito un sistema.",
    respuesta:
      "Puede ser. Por eso nuestro primer paso es diagnosticar, no vender un software. Si vemos que no hay una oportunidad real de mejora, lo diremos con transparencia.",
  },
  {
    objecion: "Mandame informacion.",
    respuesta:
      "Claro. Te envio una presentacion breve, pero para que sea util me gustaria entender primero una cosa: ¿hoy el mayor problema esta en clientes, ventas, inventario, tareas o documentos?",
  },
  {
    objecion: "Lo vemos mas adelante.",
    respuesta:
      "Perfecto. Para no molestarte, ¿te parece que lo dejemos agendado para revisar en unas semanas? Asi no queda en el aire y lo retomamos cuando tenga mas sentido.",
  },
];

export const cierresPlaybook = [
  "¿Te parece si agendamos 15 minutos y revisamos si realmente aplica para tu empresa?",
  "Si te hace sentido, el siguiente paso seria hacer un diagnostico breve y dejarte una recomendacion clara.",
  "Para avanzar sin compromiso grande, podemos partir por el diagnostico y despues decides si implementamos.",
  "¿Prefieres que lo conversemos por llamada o te envio una propuesta inicial por correo?",
];

export function obtenerPlaybookComercial() {
  return {
    etapas: etapasPlaybook,
    objeciones: objecionesPlaybook,
    cierres: cierresPlaybook,
  };
}
