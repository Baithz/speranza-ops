-- Ce que la base calcule pour tous les raiders : les bornes de retour par point, et le nombre
-- de raiders actifs. Le site s'en sert quand il n'a pas encore assez de relevés à lui.

-- L'écart mesuré entre l'élimination et le relevé suivant, en secondes. C'est lui qui porte
-- l'information : « vide après 400 s » borne par le bas, « vu après 330 s » borne par le haut.
alter table public.avis add column if not exists ecart integer
  check (ecart is null or ecart between 1 and 3600);

create index if not exists avis_bornes_idx on public.avis (carte, point, genre)
  where ecart is not null and etat <> 'abattu';

-- Bornes par point : on écarte les relevés extrêmes plutôt que de faire une moyenne.
-- « vide » donne la borne basse (le retour est plus long que ça) : on garde le 9e décile.
-- « vu »  donne la borne haute (le retour est plus court ou égal) : on garde le 1er décile.
create or replace view public.bornes with (security_invoker = true) as
  select carte, point, genre,
         round(percentile_cont(0.9) within group (order by ecart)
               filter (where etat = 'vide'))::int                        as basse,
         round(percentile_cont(0.1) within group (order by ecart)
               filter (where etat = 'vu'))::int                          as haute,
         count(*) filter (where etat = 'vide')                           as n_basse,
         count(*) filter (where etat = 'vu')                             as n_haute
    from public.avis
   where ecart is not null and etat <> 'abattu'
     and cree_le > now() - interval '60 days'
   group by carte, point, genre
  having count(*) >= 3;

comment on view public.bornes is 'Bornes de retour par point, à partir de 3 relevés. Le site les mélange à sa propre mesure.';

-- Combien de raiders ont signalé quelque chose dans l'heure. Sert uniquement à afficher
-- « 12 raiders actifs » : aucun identifiant ne sort de la base.
create or replace function public.actifs() returns integer
  language sql security definer stable set search_path = public as $$
  select count(distinct auteur)::int from public.avis where cree_le > now() - interval '1 hour';
$$;

grant execute on function public.actifs() to authenticated;
