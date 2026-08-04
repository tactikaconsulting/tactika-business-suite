create table if not exists public.objetivos_mensuales (
  id uuid primary key default gen_random_uuid(),
  mes text not null unique,
  meta_contactos integer not null default 200,
  meta_respuestas integer not null default 40,
  meta_reuniones integer not null default 20,
  meta_diagnosticos integer not null default 12,
  meta_propuestas integer not null default 8,
  meta_clientes integer not null default 3,
  meta_venta numeric not null default 300000,
  meta_mensualidad numeric not null default 150000,
  foco_mes text,
  decision_mes text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_objetivos_mensuales_mes
  on public.objetivos_mensuales (mes desc);

alter table public.objetivos_mensuales enable row level security;

drop policy if exists "Usuarios internos leen objetivos mensuales" on public.objetivos_mensuales;
create policy "Usuarios internos leen objetivos mensuales"
  on public.objetivos_mensuales
  for select
  to authenticated
  using (public.es_usuario_interno_tactika());

drop policy if exists "Usuarios internos crean objetivos mensuales" on public.objetivos_mensuales;
create policy "Usuarios internos crean objetivos mensuales"
  on public.objetivos_mensuales
  for insert
  to authenticated
  with check (public.es_usuario_interno_tactika());

drop policy if exists "Usuarios internos actualizan objetivos mensuales" on public.objetivos_mensuales;
create policy "Usuarios internos actualizan objetivos mensuales"
  on public.objetivos_mensuales
  for update
  to authenticated
  using (public.es_usuario_interno_tactika())
  with check (public.es_usuario_interno_tactika());

drop policy if exists "Admin elimina objetivos mensuales" on public.objetivos_mensuales;
create policy "Admin elimina objetivos mensuales"
  on public.objetivos_mensuales
  for delete
  to authenticated
  using (public.es_admin_tactika());
