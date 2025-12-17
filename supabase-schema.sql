-- Supabase Tabelle für Favoriten mit User-Authentifizierung

create table if not exists public.favorites (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  thema text not null,
  klassenstufe text not null,
  niveau text not null,
  laenge text not null,
  textsorte text not null,
  zusatzinfo text,
  text text not null,
  questions text,
  savedAt timestamptz not null default now()
);

-- Index für bessere Performance bei User-Abfragen
create index if not exists favorites_user_id_idx on public.favorites(user_id);

alter table public.favorites enable row level security;

-- Policies: Nutzer können nur ihre eigenen Favoriten sehen/bearbeiten/löschen

drop policy if exists "Favoriten lesen" on public.favorites;
create policy "Favoriten lesen"
  on public.favorites
  for select
  using ( auth.uid() = user_id );

drop policy if exists "Favoriten schreiben" on public.favorites;
create policy "Favoriten schreiben"
  on public.favorites
  for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Favoriten aktualisieren" on public.favorites;
create policy "Favoriten aktualisieren"
  on public.favorites
  for update
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

drop policy if exists "Favoriten löschen" on public.favorites;
create policy "Favoriten löschen"
  on public.favorites
  for delete
  using ( auth.uid() = user_id );


