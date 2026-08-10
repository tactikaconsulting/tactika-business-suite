create table if not exists prospectos_encontrados (
  id uuid primary key default gen_random_uuid(),
  google_place_id text unique,
  empresa text not null,
  giro text,
  comuna text,
  region text,
  telefono text,
  sitio_web text,
  dominio text,
  direccion text,
  google_maps_url text,
  rating numeric,
  user_rating_count integer,
  fuente text default 'Google Places',
  rubro_buscado text,
  consulta text,
  problema_detectado text,
  dolor_principal text,
  necesidad text,
  potencial integer default 0,
  estado text default 'Encontrada',
  raw jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_prospectos_encontrados_empresa
  on prospectos_encontrados (empresa);

create index if not exists idx_prospectos_encontrados_telefono
  on prospectos_encontrados (telefono);

create index if not exists idx_prospectos_encontrados_dominio
  on prospectos_encontrados (dominio);

create index if not exists idx_prospectos_encontrados_comuna
  on prospectos_encontrados (comuna);

alter table prospectos_encontrados enable row level security;

create policy "Usuarios autenticados leen prospectos encontrados"
  on prospectos_encontrados
  for select
  to authenticated
  using (true);
