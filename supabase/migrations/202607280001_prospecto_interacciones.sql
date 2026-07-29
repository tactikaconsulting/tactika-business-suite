create table if not exists public.prospecto_interacciones (
  id uuid primary key default gen_random_uuid(),
  prospecto_id uuid not null references public.prospectos(id) on delete cascade,
  tipo text not null check (tipo in ('llamada', 'whatsapp', 'correo', 'reunion', 'nota')),
  titulo text not null,
  detalle text,
  resultado text,
  fecha_interaccion timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_prospecto_interacciones_prospecto_id
  on public.prospecto_interacciones (prospecto_id);

create index if not exists idx_prospecto_interacciones_fecha
  on public.prospecto_interacciones (fecha_interaccion desc);

alter table public.prospecto_interacciones enable row level security;

drop policy if exists "Permitir lectura de interacciones autenticadas"
  on public.prospecto_interacciones;
drop policy if exists "Permitir creacion de interacciones autenticadas"
  on public.prospecto_interacciones;
drop policy if exists "Permitir actualizacion de interacciones autenticadas"
  on public.prospecto_interacciones;
drop policy if exists "Permitir eliminacion de interacciones autenticadas"
  on public.prospecto_interacciones;

create policy "Permitir lectura de interacciones autenticadas"
  on public.prospecto_interacciones
  for select
  to authenticated
  using (true);

create policy "Permitir creacion de interacciones autenticadas"
  on public.prospecto_interacciones
  for insert
  to authenticated
  with check (true);

create policy "Permitir actualizacion de interacciones autenticadas"
  on public.prospecto_interacciones
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Permitir eliminacion de interacciones autenticadas"
  on public.prospecto_interacciones
  for delete
  to authenticated
  using (true);
