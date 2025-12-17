-- Supabase Tabelle für Favoriten

create table if not exists public.favorites (
  id bigint generated always as identity primary key,
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

alter table public.favorites enable row level security;

-- Einfache Policy: alle dürfen lesen/schreiben (für ersten Prototypen).
-- Für Produktion solltest du das mit Auth absichern.

create policy "Favoriten lesen"
  on public.favorites
  for select
  using ( true );

create policy "Favoriten schreiben"
  on public.favorites
  for insert
  with check ( true );

create policy "Favoriten löschen"
  on public.favorites
  for delete
  using ( true );


