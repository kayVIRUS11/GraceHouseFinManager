create table if not exists public.sync_ops (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  payload jsonb not null,
  device_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists sync_ops_created_at_idx on public.sync_ops (created_at);

alter table public.sync_ops enable row level security;

create policy "Allow anon read/write" on public.sync_ops
  for all
  to anon
  using (true)
  with check (true);
