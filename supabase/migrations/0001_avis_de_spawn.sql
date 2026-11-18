-- Avis de spawn des gros ARC, partagés entre raiders.
-- Rien de personnel : un identifiant anonyme donné par Supabase, et c'est tout.
-- Pas de pseudo, pas de collection, pas de position.

create table public.avis (
  id         bigint generated always as identity primary key,
  cree_le    timestamptz not null default now(),
  auteur     uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  carte      text        not null check (char_length(carte) between 1 and 40),
  point      text        not null check (char_length(point) between 1 and 60),
  genre      text        not null check (genre in ('bastion', 'artificier', 'bombardier', 'bondisseur', 'sentinelle')),
  etat       text        not null check (etat in ('vu', 'vide', 'abattu')),
  -- Âge de la carte en secondes au moment de l'avis. Un raid dure 30 min ; on tolère 40.
  age_carte  integer     not null check (age_carte between 0 and 2400),
  -- Code de partie affiché en jeu, quand le joueur l'a saisi. Absent sinon.
  partie     text                 check (partie is null or char_length(partie) between 4 and 24)
);

comment on table public.avis is 'Signalements de spawn. Lecture ouverte, écriture signée anonymement, jamais modifiable.';

-- Les trois lectures du site : l'historique d'un point, le canal d'une partie, la garde anti-abus.
create index avis_point_idx  on public.avis (carte, point, cree_le desc);
create index avis_partie_idx on public.avis (partie, cree_le desc) where partie is not null;
create index avis_auteur_idx on public.avis (auteur, cree_le desc);

-- L'heure et l'auteur viennent du serveur, jamais du client. Et pas plus de 30 avis par minute.
create or replace function public.avis_garde() returns trigger
  language plpgsql security definer set search_path = public as $$
declare
  recents integer;
begin
  new.cree_le := now();
  new.auteur := auth.uid();
  select count(*) into recents from public.avis
    where auteur = new.auteur and cree_le > now() - interval '1 minute';
  if recents >= 30 then
    raise exception 'Trop d''avis en une minute.' using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger avis_garde before insert on public.avis
  for each row execute function public.avis_garde();

alter table public.avis enable row level security;

-- Tout le monde lit (le site sert justement à partager), personne ne modifie ni ne supprime.
create policy "lecture ouverte"  on public.avis for select to authenticated using (true);
create policy "ecriture signee"  on public.avis for insert to authenticated with check (auteur = auth.uid());

-- Les chronos d'une partie arrivent en direct chez ceux qui ont tapé le même code.
alter publication supabase_realtime add table public.avis;

-- Présence par tranche de 10 minutes de carte : ce que l'écran Spawn ARC affiche en jauge.
create view public.presence with (security_invoker = true) as
  select carte, point, genre,
         age_carte / 600                                  as tranche,
         count(*)                                         as avis,
         count(*) filter (where etat in ('vu', 'abattu')) as presents,
         max(cree_le)                                     as dernier
    from public.avis
   group by carte, point, genre, age_carte / 600;

comment on view public.presence is 'Avis regroupés par tranche de 10 min. Le site n''affiche une tranche qu''à partir de 3 avis.';

-- Ménage quotidien : au-delà de 90 jours un avis ne sert plus à rien.
-- Appelée une fois par jour par .github/workflows/entretien.yml, ce qui garde aussi
-- le projet gratuit éveillé (Supabase met en pause après 7 jours sans requête).
create or replace function public.menage() returns integer
  language plpgsql security definer set search_path = public as $$
declare
  efface integer;
begin
  delete from public.avis where cree_le < now() - interval '90 days';
  get diagnostics efface = row_count;
  return efface;
end $$;

revoke all on function public.menage() from public, anon, authenticated;
grant execute on function public.menage() to service_role;
