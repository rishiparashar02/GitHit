-- Run once in Supabase: SQL Editor → New query → paste → Run.
-- Then add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env (see .env.example).

create table if not exists public.githit_visit_counter (
  id smallint primary key default 1 constraint githit_visit_single_row check (id = 1),
  total bigint not null default 0
);

insert into public.githit_visit_counter (id, total) values (1, 0)
on conflict (id) do nothing;

alter table public.githit_visit_counter enable row level security;

create or replace function public.increment_githit_visit()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_total bigint;
begin
  insert into public.githit_visit_counter (id, total)
  values (1, 1)
  on conflict (id) do update
  set total = githit_visit_counter.total + 1
  returning total into new_total;
  return new_total;
end;
$$;

create or replace function public.get_githit_visit_count()
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select total from public.githit_visit_counter where id = 1), 0::bigint);
$$;

grant execute on function public.increment_githit_visit() to anon, authenticated;
grant execute on function public.get_githit_visit_count() to anon, authenticated;
