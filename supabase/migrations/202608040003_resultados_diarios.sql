create table if not exists public.resultados_diarios (
  id uuid primary key default gen_random_uuid(),
  fecha date not null unique,
  prospectos_contactados integer not null default 0,
  respuestas_recibidas integer not null default 0,
  reuniones_agendadas integer not null default 0,
  diagnosticos_realizados integer not null default 0,
  propuestas_enviadas integer not null default 0,
  ventas_cerradas integer not null default 0,
  monto_vendido numeric not null default 0,
  aprendizajes text,
  bloqueos text,
  proxima_mejora text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_resultados_diarios_fecha
  on public.resultados_diarios(fecha desc);

alter table public.resultados_diarios enable row level security;

create policy "Usuarios internos leen resultados diarios"
  on public.resultados_diarios
  for select
  to authenticated
  using (public.es_usuario_interno_tactika());

create policy "Usuarios internos crean resultados diarios"
  on public.resultados_diarios
  for insert
  to authenticated
  with check (
    public.es_usuario_interno_tactika()
    and created_by = auth.uid()
  );

create policy "Usuarios internos actualizan resultados diarios"
  on public.resultados_diarios
  for update
  to authenticated
  using (public.es_usuario_interno_tactika())
  with check (public.es_usuario_interno_tactika());

create policy "Admin Tactika elimina resultados diarios"
  on public.resultados_diarios
  for delete
  to authenticated
  using (public.es_admin_tactika());
