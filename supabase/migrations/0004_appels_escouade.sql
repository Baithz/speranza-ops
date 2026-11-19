-- Appels d'escouade : « je cherche deux francophones pour farmer ce soir ».
-- Le besoin que personne ne couvre sans passer par dix serveurs Discord.
-- Une annonce porte toujours une heure de fin : une escouade fantôme ne sert à rien.

create table if not exists public.appels (
  id          bigint generated always as identity primary key,
  cree_le     timestamptz not null default now(),
  expire_le   timestamptz not null,
  auteur      uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  -- Pseudo ARC Raiders complet : c'est par lui qu'on s'ajoute en jeu.
  pseudo      text        not null check (pseudo ~ '^[^#]{1,24}#[0-9]{4}$'),
  -- Code d'escouade du site, quand le raider veut aussi partager cartes et positions.
  code        text                 check (code is null or code ~ '^[A-Z0-9]{8}$'),
  plateforme  text        not null check (plateforme in ('pc', 'playstation', 'xbox', 'peu-importe')),
  langue      text        not null check (langue     in ('fr', 'en', 'peu-importe')),
  style       text        not null check (style      in ('quetes', 'butin', 'schemas', 'arc', 'pvp', 'decouverte')),
  niveau      text        not null check (niveau     in ('debutants', 'tous', 'experimentes')),
  -- Une escouade compte trois raiders : il reste une ou deux places.
  places      smallint    not null check (places between 1 and 2),
  carte       text                 check (carte is null or carte ~ '^[a-z][a-z0-9-]{1,39}$'),
  mot         text                 check (mot is null or char_length(mot) <= 160)
);

comment on table public.appels is 'Appels d''escouade. Lecture ouverte, ecriture et retrait par l''auteur, expiration obligatoire.';

create index if not exists appels_vivants_idx on public.appels (expire_le desc);
create index if not exists appels_auteur_idx  on public.appels (auteur, cree_le desc);

-- Le serveur fixe l'heure, l'auteur et la durée de vie : entre un quart d'heure et six heures.
-- Deux appels ouverts suffisent : au-delà, c'est du bruit pour les autres.
create or replace function public.appels_garde() returns trigger
  language plpgsql security definer set search_path = public as $$
declare
  ouverts integer;
begin
  new.cree_le := now();
  new.auteur  := auth.uid();
  new.expire_le := greatest(now() + interval '15 minutes',
                            least(coalesce(new.expire_le, now() + interval '2 hours'),
                                  now() + interval '6 hours'));
  select count(*) into ouverts from public.appels
    where auteur = new.auteur and expire_le > now();
  if ouverts >= 2 then
    raise exception 'Deux appels ouverts au maximum. Ferme le precedent avant d''en lancer un autre.'
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

drop trigger if exists appels_garde on public.appels;
create trigger appels_garde before insert on public.appels
  for each row execute function public.appels_garde();

-- Un appel publié ne change plus : on le ferme en avançant son heure de fin.
create or replace function public.appels_fige() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  new.cree_le    := old.cree_le;
  new.auteur     := old.auteur;
  new.pseudo     := old.pseudo;
  new.code       := old.code;
  new.plateforme := old.plateforme;
  new.langue     := old.langue;
  new.style      := old.style;
  new.niveau     := old.niveau;
  new.carte      := old.carte;
  new.mot        := old.mot;
  -- Seules les places et l'heure de fin bougent, et jamais vers plus de temps.
  new.places     := least(greatest(new.places, 1), old.places);
  new.expire_le  := least(new.expire_le, old.expire_le);
  return new;
end $$;

drop trigger if exists appels_fige on public.appels;
create trigger appels_fige before update on public.appels
  for each row execute function public.appels_fige();

alter table public.appels enable row level security;

create policy "appels lecture"  on public.appels for select to authenticated using (true);
create policy "appels ecriture" on public.appels for insert to authenticated with check (auteur = auth.uid());
create policy "appels maj"      on public.appels for update to authenticated
  using (auteur = auth.uid()) with check (auteur = auth.uid());
create policy "appels retrait"  on public.appels for delete to authenticated using (auteur = auth.uid());

alter publication supabase_realtime add table public.appels;

-- Ménage : un appel expiré depuis plus d'une journée n'intéresse plus personne.
create or replace function public.menage() returns integer
  language plpgsql security definer set search_path = public as $$
declare
  n integer; total integer := 0;
begin
  delete from public.avis where cree_le < now() - interval '90 days';
  get diagnostics n = row_count; total := total + n;
  delete from public.annonces
    where cree_le < now() - interval '21 days'
       or (ferme_le is not null and ferme_le < now() - interval '2 days');
  get diagnostics n = row_count; total := total + n;
  delete from public.appels where expire_le < now() - interval '1 day';
  get diagnostics n = row_count; total := total + n;
  return total;
end $$;

revoke all on function public.menage() from public, anon, authenticated;
grant execute on function public.menage() to service_role;
