create table if not exists public.bitacora_cliente (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  tipo text not null default 'nota' check (
    tipo in ('reunion', 'llamada', 'whatsapp', 'correo', 'acuerdo', 'problema', 'decision', 'nota')
  ),
  titulo text not null,
  detalle text,
  resultado text,
  proximo_paso text,
  responsable text,
  visible_cliente boolean not null default false,
  fecha_evento timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create index if not exists idx_bitacora_cliente_cliente_id
  on public.bitacora_cliente(cliente_id);

create index if not exists idx_bitacora_cliente_fecha_evento
  on public.bitacora_cliente(fecha_evento desc);

alter table public.bitacora_cliente enable row level security;

create policy "Bitacora visible para cliente asignado"
  on public.bitacora_cliente
  for select
  to authenticated
  using (
    public.es_usuario_interno_tactika()
    or exists (
      select 1
      from public.perfiles p
      where p.id = auth.uid()
        and p.cliente_id = bitacora_cliente.cliente_id
        and p.tipo_usuario in ('cliente_admin', 'cliente_usuario')
        and bitacora_cliente.visible_cliente = true
    )
  );

create policy "Admin Tactika inserta bitacora"
  on public.bitacora_cliente
  for insert
  to authenticated
  with check (
    public.es_admin_tactika()
    and created_by = auth.uid()
  );

create policy "Admin Tactika actualiza bitacora"
  on public.bitacora_cliente
  for update
  to authenticated
  using (public.es_admin_tactika())
  with check (public.es_admin_tactika());

create policy "Admin Tactika elimina bitacora"
  on public.bitacora_cliente
  for delete
  to authenticated
  using (public.es_admin_tactika());
