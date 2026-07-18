const KEY = "clientes";

export function obtenerClientes() {
  const datos = localStorage.getItem(KEY);
  return datos ? JSON.parse(datos) : [];
}

export function guardarCliente(cliente) {
  const clientes = obtenerClientes();

  clientes.push({
    id: Date.now(),
    ...cliente,
  });

  localStorage.setItem(KEY, JSON.stringify(clientes));
}

export function eliminarCliente(id) {
  const clientes = obtenerClientes().filter(
    (cliente) => cliente.id !== id
  );

  localStorage.setItem(KEY, JSON.stringify(clientes));
}