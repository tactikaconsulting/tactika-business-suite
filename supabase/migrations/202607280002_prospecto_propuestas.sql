create table if not exists public.prospecto_propuestas (
  id uuid primary key default gen_random_uuid(),
  prospecto_id uuid not null references public.prospectos(id) on delete cascade,
  titulo text not null,
  plan text not null,
  valor_implementacion numeric not null default 0,
  valor_mensual numeric not null default 0,
  alcance text not null,
  condiciones text,
  estado text not null default 'Borrador'
    check (estado in ('Borrador', 'Enviada', 'Aceptada', 'Rechazada')),
  fecha_envio date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_prospecto_propuestas_prospecto_id
  on public.prospecto_propuestas (prospecto_id);

create index if not exists idx_prospecto_propuestas_created_at
  on public.prospecto_propuestas (created_at desc);

alter table public.prospecto_propuestas enable row level security;

drop policy if exists "Permitir lectura de propuestas autenticadas"
  on public.prospecto_propuestas;
drop policy if exists "Permitir creacion de propuestas autenticadas"
  on public.prospecto_propuestas;
drop policy if exists "Permitir actualizacion de propuestas autenticadas"
  on public.prospecto_propuestas;
drop policy if exists "Permitir eliminacion de propuestas autenticadas"
  on public.prospecto_propuestas;

create policy "Permitir lectura de propuestas autenticadas"
  on public.prospecto_propuestas
  for select
  to authenticated
  using (true);

create policy "Permitir creacion de propuestas autenticadas"
  on public.prospecto_propuestas
  for insert
  to authenticated
  with check (true);

create policy "Permitir actualizacion de propuestas autenticadas"
  on public.prospecto_propuestas
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Permitir eliminacion de propuestas autenticadas"
  on public.prospecto_propuestas
  for delete
  to authenticated
  using (true);
