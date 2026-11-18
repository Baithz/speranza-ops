# Speranza Ops — version en ligne

Site compagnon pour ARC Raiders, fait par des joueurs : cartes, schémas manquants, échanges en escouade, spawns des gros ARC avec chrono. Projet de fan, non officiel, sans lien avec Embark Studios.

Ce dossier est la version en ligne. Elle s'ouvre dans un navigateur, s'installe comme une application depuis celui-ci, et se met à jour toute seule. La version locale à télécharger vit à côté, dans `Speranza_Ops`, et n'est pas touchée par ce qui se passe ici.

## Comment c'est fait

| | Quoi |
|---|---|
| Le site | HTML, CSS et JavaScript, sans outil de fabrication. On modifie un fichier, on recharge la page. |
| `api/planning.js` | Récupère le planning officiel d'Embark. Remplace le relais Python de la version locale. |
| `supabase/` | La base qui garde les avis de spawn partagés entre raiders. |
| `vercel.json` | En-têtes et durées de cache. |
| `tests/` | Vérifications automatiques : `node tests/test_planning.js`. |

## Où est quoi dans le site

| Dossier | Contenu |
|---|---|
| `app/` | Le code : écrans, escouade, réseau, spawns. C'est ici que se passe presque tout. |
| `engine/` | Données du jeu et moteurs repris de l'ancien atlas (cartes, armurerie, 3D). |
| `assets/`, `research/` | Images, polices, modèles affichés, références de l'écran Opérations. |
| `vendor/` | Bibliothèques externes (PeerJS, Three.js, fflate, jsfeat). |

## Mettre en ligne

Tout est dans `docs/01_MISE_EN_LIGNE.md` : les comptes à créer, les clics, et ce que je fais ensuite.

## Langue

Tout ce qui se lit est en français : textes du site, commentaires, documents, messages de commit. Seules exceptions, imposées par les outils : les commandes Git, l'interface de GitHub et de Vercel, et quelques noms de fichiers que ces outils ne reconnaissent qu'en anglais (`README.md`, le dossier `.github`, `vercel.json`).
