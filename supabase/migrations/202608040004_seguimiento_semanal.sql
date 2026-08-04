create table if not exists public.seguimiento_semanal (
  id uuid primary key default gen_random_uuid(),
  semana_inicio date not null unique,
  meta_contactos integer not null default 50,
  meta_respuestas integer not null default 10,
  meta_reuniones integer not null default 5,
  meta_diagnosticos integer not null default 3,
  meta_propuestas integer not null default 2,
  meta_ventas integer not null default 1,
  meta_monto numeric not null default 0,
  foco_semana text,
  decision_semana text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_seguimiento_semanal_semana
  on public.seguimiento_semanal (semana_inicio desc);

alter table public.seguimiento_semanal enable row level security;

drop policy if exists "Usuarios internos leen seguimiento semanal" on public.seguimiento_semanal;
create policy "Usuarios internos leen seguimiento semanal"
  on public.seguimiento_semanal
  for select
  to authenticated
  using (public.es_usuario_interno_tactika());

drop policy if exists "Usuarios internos crean seguimiento semanal" on public.seguimiento_semanal;
create policy "Usuarios internos crean seguimiento semanal"
  on public.seguimiento_semanal
  for insert
  to authenticated
  with check (public.es_usuario_interno_tactika());

drop policy if exists "Usuarios internos actualizan seguimiento semanal" on public.seguimiento_semanal;
create policy "Usuarios internos actualizan seguimiento semanal"
  on public.seguimiento_semanal
  for update
  to authenticated
  using (public.es_usuario_interno_tactika())
  with check (public.es_usuario_interno_tactika());

drop policy if exists "Admin elimina seguimiento semanal" on public.seguimiento_semanal;
create policy "Admin elimina seguimiento semanal"
  on public.seguimiento_semanal
  for delete
  to authenticated
  using (public.es_admin_tactika());
