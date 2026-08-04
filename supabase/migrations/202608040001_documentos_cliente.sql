create table if not exists public.documentos_cliente (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  titulo text not null,
  tipo text not null default 'Documento',
  url text,
  descripcion text,
  visible_cliente boolean not null default true,
  fecha_documento date not null default current_date,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create index if not exists idx_documentos_cliente_cliente_id
  on public.documentos_cliente(cliente_id);

alter table public.documentos_cliente enable row level security;

create or replace function public.es_usuario_interno_tactika()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.perfiles
    where id = auth.uid()
      and tipo_usuario in ('admin_tactika', 'consultor_tactika')
  );
$$;

create policy "Documentos visibles para cliente asignado"
  on public.documentos_cliente
  for select
  to authenticated
  using (
    public.es_usuario_interno_tactika()
    or exists (
      select 1
      from public.perfiles p
      where p.id = auth.uid()
        and p.cliente_id = documentos_cliente.cliente_id
        and p.tipo_usuario in ('cliente_admin', 'cliente_usuario')
        and documentos_cliente.visible_cliente = true
    )
  );

create policy "Admin Tactika inserta documentos"
  on public.documentos_cliente
  for insert
  to authenticated
  with check (
    public.es_admin_tactika()
    and created_by = auth.uid()
  );

create policy "Admin Tactika actualiza documentos"
  on public.documentos_cliente
  for update
  to authenticated
  using (public.es_admin_tactika())
  with check (public.es_admin_tactika());

create policy "Admin Tactika elimina documentos"
  on public.documentos_cliente
  for delete
  to authenticated
  using (public.es_admin_tactika());
