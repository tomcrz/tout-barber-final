-- COLLE CE CODE DANS L'ÉDITEUR SQL DE SUPABASE

-- Table des créneaux
create table slots (
  id bigint generated always as identity primary key,
  date date not null,
  time text not null,
  taken boolean default false,
  created_at timestamp with time zone default now()
);

-- Table des rendez-vous
create table rdvs (
  id bigint generated always as identity primary key,
  name text not null,
  service text not null,
  price integer default 15,
  date date not null,
  time text not null,
  phone text not null,
  status text default 'pending' check (status in ('pending','confirmed','done','cancelled')),
  created_at timestamp with time zone default now()
);

-- Permissions publiques (lecture/écriture pour les clients)
alter table slots enable row level security;
alter table rdvs enable row level security;

create policy "Lecture publique slots" on slots for select using (true);
create policy "Insertion publique slots" on slots for insert with check (true);
create policy "Mise à jour slots" on slots for update using (true);
create policy "Suppression slots" on slots for delete using (true);

create policy "Lecture publique rdvs" on rdvs for select using (true);
create policy "Insertion publique rdvs" on rdvs for insert with check (true);
create policy "Mise à jour rdvs" on rdvs for update using (true);
