create table if not exists public.campanas_comerciales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  canal text not null check (canal in ('correo', 'whatsapp')),
  plantilla text not null,
  estado text not null default 'Borrador'
    check (estado in ('Borrador', 'Programada', 'Activa', 'Pausada', 'Finalizada')),
  fecha_programada timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mensajes_programados (
  id uuid primary key default gen_random_uuid(),
  campana_id uuid not null references public.campanas_comerciales(id) on delete cascade,
  prospecto_id uuid not null references public.prospectos(id) on delete cascade,
  canal text not null check (canal in ('correo', 'whatsapp')),
  asunto text,
  mensaje text not null,
  estado text not null default 'Programado'
    check (estado in ('Programado', 'Preparado', 'Enviado', 'Respondio', 'Sin respuesta', 'Cancelado', 'Error')),
  fecha_programada timestamptz not null,
  fecha_envio timestamptz,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_campanas_comerciales_estado
  on public.campanas_comerciales (estado);

create index if not exists idx_mensajes_programados_campana_id
  on public.mensajes_programados (campana_id);

create index if not exists idx_mensajes_programados_prospecto_id
  on public.mensajes_programados (prospecto_id);

create index if not exists idx_mensajes_programados_fecha
  on public.mensajes_programados (fecha_programada asc);

alter table public.campanas_comerciales enable row level security;
alter table public.mensajes_programados enable row level security;

drop policy if exists "Permitir lectura de campanas autenticadas"
  on public.campanas_comerciales;
drop policy if exists "Permitir creacion de campanas autenticadas"
  on public.campanas_comerciales;
drop policy if exists "Permitir actualizacion de campanas autenticadas"
  on public.campanas_comerciales;
drop policy if exists "Permitir eliminacion de campanas autenticadas"
  on public.campanas_comerciales;
drop policy if exists "Permitir lectura de mensajes programados autenticados"
  on public.mensajes_programados;
drop policy if exists "Permitir creacion de mensajes programados autenticados"
  on public.mensajes_programados;
drop policy if exists "Permitir actualizacion de mensajes programados autenticados"
  on public.mensajes_programados;
drop policy if exists "Permitir eliminacion de mensajes programados autenticados"
  on public.mensajes_programados;

create policy "Permitir lectura de campanas autenticadas"
  on public.campanas_comerciales
  for select
  to authenticated
  using (true);

create policy "Permitir creacion de campanas autenticadas"
  on public.campanas_comerciales
  for insert
  to authenticated
  with check (true);

create policy "Permitir actualizacion de campanas autenticadas"
  on public.campanas_comerciales
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Permitir eliminacion de campanas autenticadas"
  on public.campanas_comerciales
  for delete
  to authenticated
  using (true);

create policy "Permitir lectura de mensajes programados autenticados"
  on public.mensajes_programados
  for select
  to authenticated
  using (true);

create policy "Permitir creacion de mensajes programados autenticados"
  on public.mensajes_programados
  for insert
  to authenticated
  with check (true);

create policy "Permitir actualizacion de mensajes programados autenticados"
  on public.mensajes_programados
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Permitir eliminacion de mensajes programados autenticados"
  on public.mensajes_programados
  for delete
  to authenticated
  using (true);
