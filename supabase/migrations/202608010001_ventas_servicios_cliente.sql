create table if not exists public.ventas_servicios (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  servicio text not null,
  descripcion text,
  modalidad text not null default 'Pago unico'
    check (modalidad in ('Pago unico', 'Mensual', 'Anual')),
  valor numeric not null default 0,
  moneda text not null default 'CLP',
  estado text not null default 'Pendiente'
    check (estado in ('Pendiente', 'Pagado', 'Activo', 'Vencido', 'Cancelado')),
  fecha_contratacion date not null default current_date,
  fecha_pago date,
  fecha_proximo_cobro date,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ventas_servicios_cliente_id
  on public.ventas_servicios (cliente_id);

create index if not exists idx_ventas_servicios_estado
  on public.ventas_servicios (estado);

create index if not exists idx_ventas_servicios_fecha_contratacion
  on public.ventas_servicios (fecha_contratacion desc);

alter table public.ventas_servicios enable row level security;

drop policy if exists "Permitir lectura de ventas autenticadas"
  on public.ventas_servicios;
drop policy if exists "Permitir creacion de ventas autenticadas"
  on public.ventas_servicios;
drop policy if exists "Permitir actualizacion de ventas autenticadas"
  on public.ventas_servicios;
drop policy if exists "Permitir eliminacion de ventas autenticadas"
  on public.ventas_servicios;

create policy "Permitir lectura de ventas autenticadas"
  on public.ventas_servicios
  for select
  to authenticated
  using (true);

create policy "Permitir creacion de ventas autenticadas"
  on public.ventas_servicios
  for insert
  to authenticated
  with check (true);

create policy "Permitir actualizacion de ventas autenticadas"
  on public.ventas_servicios
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Permitir eliminacion de ventas autenticadas"
  on public.ventas_servicios
  for delete
  to authenticated
  using (true);
