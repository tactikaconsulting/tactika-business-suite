create table if not exists public.proyectos_cliente (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  prospecto_id uuid references public.prospectos(id) on delete set null,
  nombre text not null,
  tipo text not null default 'Implementacion Tactika Suite',
  estado text not null default 'Pendiente'
    check (estado in ('Pendiente', 'En implementacion', 'Pausado', 'Completado', 'Cancelado')),
  fecha_inicio date not null default current_date,
  fecha_objetivo date,
  responsable text,
  observaciones text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_proyectos_cliente_cliente_id
  on public.proyectos_cliente (cliente_id);

create index if not exists idx_proyectos_cliente_created_by
  on public.proyectos_cliente (created_by);

create table if not exists public.implementaciones_cliente (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references public.proyectos_cliente(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  etapa text not null default 'Diagnostico inicial'
    check (etapa in ('Diagnostico inicial', 'Configuracion', 'Capacitacion', 'Puesta en marcha', 'Seguimiento mensual')),
  estado text not null default 'Pendiente'
    check (estado in ('Pendiente', 'En proceso', 'Completado', 'Bloqueado')),
  avance integer not null default 0 check (avance >= 0 and avance <= 100),
  fecha_inicio date not null default current_date,
  fecha_objetivo date,
  responsable text,
  notas text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_implementaciones_cliente_proyecto_id
  on public.implementaciones_cliente (proyecto_id);

create index if not exists idx_implementaciones_cliente_created_by
  on public.implementaciones_cliente (created_by);

create table if not exists public.implementacion_tareas (
  id uuid primary key default gen_random_uuid(),
  implementacion_id uuid not null references public.implementaciones_cliente(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  titulo text not null,
  descripcion text,
  responsable text,
  estado text not null default 'Pendiente'
    check (estado in ('Pendiente', 'En proceso', 'Completado')),
  prioridad text not null default 'Media'
    check (prioridad in ('Alta', 'Media', 'Baja')),
  fecha_limite date,
  orden integer not null default 0,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_implementacion_tareas_implementacion_id
  on public.implementacion_tareas (implementacion_id);

create index if not exists idx_implementacion_tareas_created_by
  on public.implementacion_tareas (created_by);

create table if not exists public.modulos_cliente (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  modulo text not null,
  estado text not null default 'Activo'
    check (estado in ('Activo', 'Pendiente', 'Inactivo')),
  plan text not null default 'Diagnostico',
  fecha_activacion date not null default current_date,
  observaciones text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cliente_id, modulo)
);

create index if not exists idx_modulos_cliente_cliente_id
  on public.modulos_cliente (cliente_id);

create index if not exists idx_modulos_cliente_created_by
  on public.modulos_cliente (created_by);

alter table public.proyectos_cliente enable row level security;
alter table public.implementaciones_cliente enable row level security;
alter table public.implementacion_tareas enable row level security;
alter table public.modulos_cliente enable row level security;

drop policy if exists "Usuarios gestionan sus proyectos"
  on public.proyectos_cliente;
create policy "Usuarios gestionan sus proyectos"
  on public.proyectos_cliente
  for all
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists "Usuarios gestionan sus implementaciones"
  on public.implementaciones_cliente;
create policy "Usuarios gestionan sus implementaciones"
  on public.implementaciones_cliente
  for all
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists "Usuarios gestionan sus tareas de implementacion"
  on public.implementacion_tareas;
create policy "Usuarios gestionan sus tareas de implementacion"
  on public.implementacion_tareas
  for all
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists "Usuarios gestionan sus modulos de cliente"
  on public.modulos_cliente;
create policy "Usuarios gestionan sus modulos de cliente"
  on public.modulos_cliente
  for all
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());
