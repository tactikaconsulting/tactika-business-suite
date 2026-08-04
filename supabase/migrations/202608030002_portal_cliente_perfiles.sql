alter table if exists public.perfiles
  add column if not exists cliente_id uuid references public.clientes(id) on delete set null;

alter table if exists public.perfiles
  add column if not exists tipo_usuario text
    check (tipo_usuario in ('admin_tactika', 'consultor_tactika', 'cliente_admin', 'cliente_usuario'));

create index if not exists idx_perfiles_cliente_id
  on public.perfiles (cliente_id);
