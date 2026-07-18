const KEY = "clientes";

export function obtenerClientes() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

export function guardarCliente(cliente) {
  const clientes = obtenerClientes();

  clientes.push({
    id: crypto.randomUUID(),
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