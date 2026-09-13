-- Hind Lux Shop remote state. The service-role server is the only writer.
create table if not exists public.shop_state (
  id smallint primary key default 1,
  data jsonb not null,
  revision bigint not null default 0,
  updated_at timestamptz not null default now(),
  constraint shop_state_singleton check (id = 1),
  constraint shop_state_data_object check (jsonb_typeof(data) = 'object')
);

alter table public.shop_state enable row level security;
alter table public.shop_state force row level security;

revoke all on table public.shop_state from anon, authenticated;
grant select, insert, update on table public.shop_state to service_role;

create or replace function public.update_shop_state(
  expected_revision bigint,
  next_data jsonb
)
returns table (revision bigint, updated_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
  update public.shop_state
     set data = next_data,
         revision = shop_state.revision + 1,
         updated_at = now()
   where id = 1
     and shop_state.revision = expected_revision
  returning shop_state.revision, shop_state.updated_at;
end;
$$;

revoke all on function public.update_shop_state(bigint, jsonb) from public, anon, authenticated;
grant execute on function public.update_shop_state(bigint, jsonb) to service_role;

comment on table public.shop_state is
  'Private singleton JSON state for Hind Lux Shop; accessed only by the trusted Node server.';
