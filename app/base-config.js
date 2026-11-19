/* Adresse et clé publique de la base Speranza Ops.
   La clé « publishable » est faite pour être lisible ici : elle n'a que les droits d'un joueur,
   et les règles d'accès de la base font le reste (lecture ouverte, écriture signée, rien d'autre).
   La clé « secret », elle, ne doit jamais apparaître dans ce dossier.
   Tant que ces deux lignes sont vides, le site marche normalement, simplement sans partage. */
window.OPS_BASE = {
  url: 'https://wrxujuonivvbhnpgfsbz.supabase.co',
  cle: 'sb_publishable_MTM2CXTa7TAfWvn3cni5xw_4H0FkudB'           // colle ici la clé « Publishable » : sb_publishable_…
};
