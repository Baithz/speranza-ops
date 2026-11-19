-- Magasin d'échange : les annonces que les raiders se laissent entre eux.
-- Trois genres seulement : je donne, j'échange ceci contre cela, je cherche.
-- Rien d'argent réel : on troque des schémas et du butin, comme en jeu.

-- ── 1. Les avis de spawn acceptent désormais tous les ARC relevés sur les cartes ──
-- Le site n'affichait que cinq gros ARC ; il les affiche tous. Les anciens genres français
-- sont renommés en identifiants techniques pour que les deux époques se rejoignent.
update public.avis set genre = case genre
    when 'bastion'    then 'arc-bastion'
    when 'artificier' then 'arc-rocketeer'
    when 'bombardier' then 'arc-bombardier'
    when 'bondisseur' then 'arc-leaper'
    when 'sentinelle' then 'arc-sentinel'
    else genre end
  where genre in ('bastion','artificier','bombardier','bondisseur','sentinelle');

alter table public.avis drop constraint if exists avis_genre_check;
alter table public.avis add constraint avis_genre_check
  check (genre ~ '^[a-z][a-z0-9-]{1,23}$');

-- ── 2. Les annonces ──
create table if not exists public.annonces (
  id       bigint generated always as identity primary key,
  cree_le  timestamptz not null default now(),
  auteur   uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  -- Pseudo ARC Raiders complet, numéro à quatre chiffres compris : sans lui l'échange est impossible.
  pseudo   text        not null check (pseudo ~ '^[^#]{1,24}#[0-9]{4}$'),
  genre    text        not null check (genre in ('don', 'echange', 'recherche')),
  -- Listes d'objets : [{"t":"bp","id":"…"}] pour un schéma, [{"t":"loot","id":"…"}] pour du butin.
  donne    jsonb       not null default '[]'::jsonb,
  cherche  jsonb       not null default '[]'::jsonb,
  mot      text                 check (mot is null or char_length(mot) <= 160),
  ferme_le timestamptz,
  constraint annonces_donne_liste   check (jsonb_typeof(donne)   = 'array' and jsonb_array_length(donne)   <= 12),
  constraint annonces_cherche_liste check (jsonb_typeof(cherche) = 'array' and jsonb_array_length(cherche) <= 12),
  -- Une annonce vide des deux côtés ne dit rien à personne.
  constraint annonces_non_vide check (jsonb_array_length(donne) + jsonb_array_length(cherche) > 0),
  -- Chaque genre a sa forme : un don donne, une recherche cherche, un échange fait les deux.
  constraint annonces_forme check (
    (genre = 'don'       and jsonb_array_length(donne)   > 0) or
    (genre = 'recherche' and jsonb_array_length(cherche) > 0) or
    (genre = 'echange'   and jsonb_array_length(donne)   > 0 and jsonb_array_length(cherche) > 0))
);

comment on table public.annonces is 'Magasin d''échange. Lecture ouverte, écriture et retrait par l''auteur seulement.';

create index if not exists annonces_ouvertes_idx on public.annonces (cree_le desc) where ferme_le is null;
create index if not exists annonces_auteur_idx   on public.annonces (auteur, cree_le desc);

-- Chaque objet annoncé doit être nommé proprement : un type et un identifiant, rien d'autre.
create or replace function public.objets_ok(liste jsonb) returns boolean
  language sql immutable set search_path = public as $$
  select coalesce(bool_and(
           jsonb_typeof(o) = 'object'
           and o->>'t' in ('bp', 'loot')
           and o->>'id' ~ '^[a-z0-9][a-z0-9_-]{0,47}$'), true)
    from jsonb_array_elements(coalesce(liste, '[]'::jsonb)) o;
$$;

alter table public.annonces
  add constraint annonces_objets check (objets_ok(donne) and objets_ok(cherche));

-- L'heure, l'auteur et le plafond viennent du serveur. Dix annonces ouvertes suffisent largement.
create or replace function public.annonces_garde() returns trigger
  language plpgsql security definer set search_path = public as $$
declare
  ouvertes integer;
begin
  new.cree_le := now();
  new.auteur  := auth.uid();
  select count(*) into ouvertes from public.annonces
    where auteur = new.auteur and ferme_le is null;
  if ouvertes >= 10 then
    raise exception 'Dix annonces ouvertes au maximum. Ferme-en une avant d''en publier une autre.'
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

drop trigger if exists annonces_garde on public.annonces;
create trigger annonces_garde before insert on public.annonces
  for each row execute function public.annonces_garde();

-- Une annonce publiée ne change plus de contenu : on la ferme, on en republie une autre.
create or replace function public.annonces_fige() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  new.cree_le := old.cree_le;
  new.auteur  := old.auteur;
  new.pseudo  := old.pseudo;
  new.genre   := old.genre;
  new.donne   := old.donne;
  new.cherche := old.cherche;
  new.mot     := old.mot;
  return new;
end $$;

drop trigger if exists annonces_fige on public.annonces;
create trigger annonces_fige before update on public.annonces
  for each row execute function public.annonces_fige();

alter table public.annonces enable row level security;

create policy "annonces lecture"  on public.annonces for select to authenticated using (true);
create policy "annonces ecriture" on public.annonces for insert to authenticated with check (auteur = auth.uid());
create policy "annonces fermeture" on public.annonces for update to authenticated
  using (auteur = auth.uid()) with check (auteur = auth.uid());
create policy "annonces retrait"  on public.annonces for delete to authenticated using (auteur = auth.uid());

-- Les annonces arrivent en direct : le magasin se remplit sous les yeux de ceux qui l'ont ouvert.
alter publication supabase_realtime add table public.annonces;

-- Ménage : une annonce de plus de 21 jours ne vaut plus rien, et une annonce fermée non plus.
create or replace function public.menage() returns integer
  language plpgsql security definer set search_path = public as $$
declare
  efface integer; total integer;
begin
  delete from public.avis where cree_le < now() - interval '90 days';
  get diagnostics total = row_count;
  delete from public.annonces
    where cree_le < now() - interval '21 days'
       or (ferme_le is not null and ferme_le < now() - interval '2 days');
  get diagnostics efface = row_count;
  return total + efface;
end $$;

revoke all on function public.menage() from public, anon, authenticated;
grant execute on function public.menage() to service_role;
