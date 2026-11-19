# Mettre Speranza Ops en ligne

Tout ce qu'il y a à faire, dans l'ordre, sans rien supposer de connu.

À la fin tu auras une adresse à donner aux joueurs, qui marche sur PC, téléphone et console, et qui se met à jour toute seule à chaque fois qu'on modifie le site.

Compte **30 minutes** la première fois. Tout est gratuit.

---

## Avant de commencer

Il te faut trois comptes : GitHub (tu l'as), Vercel et Supabase. Les deux derniers se créent en se connectant avec GitHub, sans mot de passe supplémentaire.

Et il te faut Git installé. Pour vérifier, dans PowerShell :

```
git --version
```

Si ça répond un numéro, c'est bon.

---

## Étape 1 — Envoyer le site sur GitHub

### 1.1 Créer le dépôt

Sur github.com : bouton **+** en haut à droite → **New repository**.

- Repository name : `speranza-ops`
- **Public** (obligatoire pour que les joueurs puissent voir le projet et pour les offres gratuites)
- Ne coche rien d'autre : pas de README, pas de .gitignore, pas de licence
- **Create repository**

### 1.2 Envoyer

Dans PowerShell :

```
cd "C:\Dev\Arc Raiders\Speranza_En_Ligne"
git init
git add -A
git status --short
```

La liste qui s'affiche est ce que le dépôt va contenir : `app/`, `assets/`, `engine/`, `research/`, `vendor/`, `api/`, `supabase/`, `docs/`, `tests/`, `.github/`, `index.html`, `vercel.json`, `README.md`. Si tu vois autre chose, dis-le-moi avant de continuer.

```
git commit -m "depart : Speranza Ops en ligne"
git branch -M main
git remote add origin https://github.com/Baithz/speranza-ops.git
git push -u origin main
```

L'envoi fait environ 250 Mo. Une fenêtre du navigateur s'ouvre pour te connecter à GitHub. Laisse finir : deux à cinq minutes selon ta connexion.

---

## Étape 2 — Mettre en ligne avec Vercel

1. Va sur [vercel.com](https://vercel.com) → **Continue with GitHub**.
2. **Add New…** → **Project**.
3. En face de `speranza-ops`, clique **Import**. Si le dépôt n'apparaît pas, clique **Adjust GitHub App Permissions** et autorise-le.
4. Sur l'écran de configuration, ne touche à rien :
   - Framework Preset : **Other**
   - Root Directory : la racine (ne pas changer)
   - Build Command, Output Directory, Install Command : vides
5. **Deploy**.

Une minute plus tard tu as une adresse du type `https://speranza-ops.vercel.app`.

Il n'y a rien à compiler : Vercel sert les fichiers tels quels, et transforme `api/planning.js` en petit service qui va chercher le planning officiel d'Embark.

---

## Étape 3 — Vérifier que tout marche

Trois contrôles, dans l'ordre :

| Quoi | Comment | Ce que tu dois voir |
|---|---|---|
| Le site | Ouvre ton adresse `.vercel.app` | L'écran d'accueil, avec le choix du profil |
| Le planning | Ouvre `ton-adresse.vercel.app/api/planning` | Du texte JSON qui commence par `{"version":1,...` |
| Le lien entre les deux | Reviens sur le site, écran QG | Sous « En surface », **Planning en direct** en vert, pas « Planning périmé » |

Si le deuxième contrôle renvoie une erreur `upstream_format`, c'est qu'Embark a changé sa page : dis-le-moi, c'est une ligne à corriger dans `api/planning.js`.

---

## Étape 4 — Ton propre nom de domaine (facultatif)

Une adresse en `.vercel.app` marche très bien. Si tu préfères `speranza.baithz-labs.eu` :

1. Dans Vercel : **Settings** → **Domains** → tape le sous-domaine → **Add**.
2. Vercel affiche un enregistrement **CNAME** à créer chez ton hébergeur de domaine.
3. Chez ton hébergeur, ajoute ce CNAME, puis attends : de quelques minutes à quelques heures.

Le certificat HTTPS se fait tout seul.

---

## Étape 5 — La base de données (Supabase)

Cette étape prépare le partage des spawns entre tous les joueurs. **Le site ne s'en sert pas encore** : je dois d'abord le brancher. Tu peux donc la faire maintenant, ou attendre que je te le dise.

1. Sur [supabase.com](https://supabase.com) → **New project**.
   - Name : `speranza-ops`
   - Region : **Frankfurt** (la plus proche)
   - Note le mot de passe de la base dans ton gestionnaire. On ne s'en sert presque jamais, mais il n'est pas récupérable.
2. Onglet **SQL Editor** → **New query**. Les trois fichiers du dossier `supabase/migrations/`, **dans l'ordre**, un par requête :
   - `0001_avis_de_spawn.sql` — la table des avis, les règles d'accès, la limite anti-abus et la vue de présence.
   - `0002_bornes_et_activite.sql` — les bornes de retour calculées sur les relevés de tous, et le compteur de raiders actifs.
   - `0003_magasin_echange.sql` — le magasin d'échange, et l'ouverture des avis à tous les ARC et plus seulement aux cinq gros.
   - `0004_appels_escouade.sql` — les appels d'escouade, avec leur expiration automatique.

   **Celle-ci n'est pas facultative** : depuis que le site affiche les vingt-cinq ARC des cartes, il envoie leur identifiant tel quel. Tant que `0003` n'est pas passée, la base refuse tous les avis de spawn. Si tu as déjà fait tourner `0001` et `0002`, passe simplement `0003`.
3. Onglet **Authentication** → **Sign In / Providers** → active **Anonymous sign-ins**.
   Les joueurs n'ont ainsi ni compte à créer ni mot de passe à retenir, mais chacun garde une identité : c'est ce qui permet de limiter les abus.
4. Onglet **Project Settings** → **API**. Copie **Project URL** et la clé **anon public**, et donne-les moi : je les mets dans le site.

Sur les clés : la clé `anon` est faite pour être publique, elle sera lisible dans le code du site, c'est normal. Ce qui protège les données, ce sont les règles de l'étape 2 : lecture ouverte, écriture signée, aucune modification ni suppression possible, 30 avis par minute au maximum. La clé `service_role`, elle, ne doit jamais sortir de Supabase ni d'un secret GitHub.

---

## Étape 6 — L'entretien quotidien

Un projet Supabase gratuit **se met en pause après 7 jours sans la moindre requête**. Une tâche GitHub l'appelle donc une fois par jour, ce qui le garde éveillé et efface au passage les avis de plus de 90 jours.

Dans le dépôt GitHub : **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Deux secrets à créer :

| Name | Secret |
|---|---|
| `SUPABASE_URL` | le Project URL de l'étape 5 |
| `SUPABASE_SERVICE_KEY` | la clé **service_role** (Project Settings → API) |

Ensuite, onglet **Actions** du dépôt → **Entretien de la base** → **Run workflow** pour l'essayer tout de suite. Il doit répondre `200`.

---

## La vie courante : modifier le site

```
cd "C:\Dev\Arc Raiders\Speranza_En_Ligne"
git pull
# … tu modifies des fichiers …
git add -A
git commit -m "correctif : libellé du bouton Abattu"
git push
```

Trente secondes plus tard, le site en ligne est à jour. Aucune archive à refaire, aucun lien à reposter.

Pour essayer quelque chose sans toucher au site public :

```
git switch -c essai/nouvelle-idee
git push -u origin essai/nouvelle-idee
```

Vercel crée une adresse d'essai séparée pour cette branche. Quand c'est bon, tu fusionnes dans `main` depuis GitHub.

---

## Donner le lien aux joueurs

Une seule phrase suffit : l'adresse, et « ça s'ouvre dans le navigateur, rien à installer ».

Sur téléphone, le navigateur propose « Ajouter à l'écran d'accueil » : le site se lance alors comme une application. Je dois encore ajouter le fichier qui rend cette installation propre (icône, écran de démarrage) — c'est prévu.

---

## Quand ça casse

| Symptôme | Cause probable | Quoi faire |
|---|---|---|
| Vercel affiche « Build failed » | Un fichier JavaScript a une faute de frappe | Onglet **Deployments** → le déploiement rouge → **Building** : le message dit le fichier et la ligne |
| Le site s'affiche mais « Planning périmé » | La fonction ne répond pas | Ouvre `/api/planning` : si c'est `upstream_network`, le site d'Embark est en panne ; si c'est `upstream_format`, leur page a changé, préviens-moi |
| Une page blanche après une modification | Erreur JavaScript | Touche F12 → onglet Console : la première ligne rouge donne le fichier |
| Le site répond « 429 » ou se coupe | Trafic au-delà du quota gratuit | Onglet **Usage** de Vercel ; au-delà, Vercel met le site en pause jusqu'au mois suivant |
| Supabase « Project paused » | 7 jours sans requête | Bouton **Restore** dans Supabase, puis vérifie que la tâche d'entretien tourne bien |
| Les joueurs voient une vieille version | Leur navigateur garde l'ancien fichier | Ctrl + F5 chez eux ; les fichiers du site portent un numéro de version qui évite ça en principe |

---

## Ce que ça coûte

Rien, dans ces limites :

- **Vercel (offre Hobby)** : 100 Go de trafic par mois, un seul compte, et **usage personnel non commercial** — donc pas de publicité ni de dons sur le site. Au-delà du quota, Vercel coupe au lieu de facturer.
- **Supabase (offre gratuite)** : 500 Mo de base, 5 Go de trafic par mois, 50 000 joueurs actifs mensuels, deux projets, et la pause au bout de 7 jours d'inactivité.
- **GitHub** : dépôt public illimité.

Pour donner une idée : le site fait environ 1,5 Mo au premier chargement, et les images ne se téléchargent qu'une fois grâce au cache. Les 100 Go tiennent plusieurs milliers de visites par mois.

---

## Ce qui n'est pas encore en ligne

Pour être clair sur l'état réel du projet :

- **Le partage des spawns par Supabase** : la base est prête, le site n'y est pas encore branché. Il utilise toujours le relais public ntfy.sh.
- **Le compte anonyme et la synchronisation du profil** : à venir, après le branchement.
- **L'installation comme application (PWA)** : le fichier manifeste reste à écrire.
- **L'écran Opérations** : il charge 13 Mo et met une dizaine de secondes à s'ouvrir. Il faut décider s'il reste dans la version en ligne.
