create or replace function public.es_admin_tactika()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.perfiles
    where id = auth.uid()
      and tipo_usuario = 'admin_tactika'
  );
$$;

create or replace function public.obtener_perfiles_acceso_cliente()
returns table (
  id uuid,
  nombre text,
  rol text,
  tipo_usuario text,
  cliente_id uuid,
  cliente_nombre text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin_tactika() then
    raise exception 'No autorizado para ver perfiles de acceso.';
  end if;

  return query
  select
    p.id,
    p.nombre,
    p.rol,
    p.tipo_usuario,
    p.cliente_id,
    c.empresa as cliente_nombre,
    p.created_at
  from public.perfiles p
  left join public.clientes c on c.id = p.cliente_id
  order by p.created_at asc;
end;
$$;

create or replace function public.asignar_usuario_cliente(
  perfil_id uuid,
  nuevo_tipo_usuario text,
  nuevo_cliente_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin_tactika() then
    raise exception 'No autorizado para modificar accesos.';
  end if;

  if nuevo_tipo_usuario not in ('cliente_admin', 'cliente_usuario') then
    raise exception 'Esta accion solo permite asignar accesos de cliente.';
  end if;

  if nuevo_cliente_id is null then
    raise exception 'Debes seleccionar una empresa cliente.';
  end if;

  update public.perfiles
  set
    tipo_usuario = nuevo_tipo_usuario,
    cliente_id = nuevo_cliente_id
  where id = perfil_id
    and id <> auth.uid();

  if not found then
    raise exception 'Perfil no encontrado o no se puede modificar tu propio usuario administrador.';
  end if;
end;
$$;

create or replace function public.quitar_acceso_cliente(perfil_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin_tactika() then
    raise exception 'No autorizado para modificar accesos.';
  end if;

  update public.perfiles
  set
    tipo_usuario = null,
    cliente_id = null
  where id = perfil_id
    and id <> auth.uid()
    and tipo_usuario in ('cliente_admin', 'cliente_usuario');

  if not found then
    raise exception 'Perfil no encontrado o no corresponde a un usuario cliente.';
  end if;
end;
$$;
