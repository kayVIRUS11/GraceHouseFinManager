alter table public.sync_ops
  add column if not exists user_id uuid;

alter table public.sync_ops
  alter column user_id set default auth.uid();

drop policy if exists "Allow anon read/write" on public.sync_ops;

create policy "Allow authenticated access" on public.sync_ops
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists sync_ops_user_id_idx on public.sync_ops (user_id);
