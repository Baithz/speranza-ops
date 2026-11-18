# Étude d'ergonomie et d'accessibilité

Faite le 18 novembre 2026 sur la version 2026.11.16.1. Elle juge le site tel qu'un joueur le découvre, pas tel qu'on l'a construit.

## Comment j'ai regardé

- Les 9 écrans (QG, Sortie, Cartes, Schémas, ARC, Butin, Armurerie, Terrain, Opérations) à trois largeurs : téléphone 390 px, tablette 820 px, ordinateur 1440 px. Plus les deux extrêmes, 320 et 1920 px.
- Des mesures automatiques sur chaque écran : contraste réel de chaque texte (en composant les fonds semi-transparents, comme le fait le navigateur), taille de police calculée, taille de chaque élément cliquable, nom accessible des boutons, structure des titres, débordement horizontal.
- La navigation au clavier de bout en bout : lien d'évitement, ordre de tabulation, visibilité du focus, fenêtres (ouverture, Échap, retour du focus), onglets.
- La lecture des captures d'écran, écran par écran, en me demandant à chaque fois : un joueur qui arrive ici sait-il quoi faire sans réfléchir ?

Ce que je n'ai **pas** fait, et qui manquera tant que ce ne sera pas fait : aucun lecteur d'écran réel (NVDA, VoiceOver), aucun essai sur un vrai téléphone avec un vrai pouce, aucun joueur observé en situation.

## Ce qui est déjà solide

Il faut le dire, parce que c'est rare et que ça tient :

- **Aucun débordement horizontal**, nulle part, de 320 à 1920 px, sur les neuf écrans. La discipline responsive tient.
- **Les contrastes sont bons.** J'ai cherché les textes illisibles ; mes deux premières alertes se sont révélées fausses après vérification à l'œil. La palette sombre est respectée partout.
- **Le clavier est traité sérieusement** : lien « Aller au contenu » en première tabulation, contour de focus ambre de 2 px visible sur chaque élément, fenêtres en `<dialog>` natif qui se ferment avec Échap et rendent le focus.
- **Les onglets sont de vrais onglets** (annoncés comme tels aux lecteurs d'écran, avec l'onglet actif marqué).
- **Aucune erreur JavaScript** sur les neuf écrans, aux trois largeurs.
- Le français est partout, y compris dans les messages d'erreur.

Le reste de ce document ne parle que de ce qui coince.

---

## 1. Le premier lancement montre surtout ce qui manque

C'est le constat le plus important, parce qu'il décide si le joueur revient.

Sur un profil neuf, le QG affiche un beau bloc en haut (« Meilleure sortie maintenant : Portail bleu », deux boutons clairs), puis **trois blocs qui ne contiennent rien** :

- « En surface » s'ouvre sur un avertissement ambre « Planning périmé » et un paragraphe qui demande de lancer `Ouvrir Speranza Ops.cmd`. Sur un site qu'on vient d'ouvrir, le premier texte sous le titre est un message d'échec, et il parle d'un fichier `.cmd`.
- « Collection » affiche un grand **0 %** et « 0 schémas sur 91 ».
- « Objectifs » et « Dernière sortie » n'expliquent que ce qu'on pourrait y mettre.

Le joueur lit donc, dans l'ordre : une recommandation, une panne, un zéro, deux explications. La seule action qui le ferait avancer — « Mettre à jour depuis une capture du jeu » — est un petit lien, en troisième position dans la colonne de droite.

**Ce que je propose.** Un QG « premier jour » tant que la collection est vide : le bloc du haut, puis une seule invitation, grande, « Importe une capture de ton écran Schémas — 30 secondes, et le site saura quoi te conseiller », avec une image d'exemple de la capture attendue. Les blocs vides n'apparaissent qu'une fois qu'ils ont quelque chose à dire. Et le message du planning devient une ligne discrète, pas un pavé.

## 2. Sur Spawn ARC, la clé de tout n'est expliquée nulle part

Le chrono du jeu commande l'écran entier : sans lui, aucun retour d'ARC ne peut être calculé. Il est présenté par un champ `mm:ss` gris et un bouton « Caler », dans un cadre de la même taille que les autres.

Rien ne dit **où** lire ce temps dans le jeu, ni pourquoi on le demande. Un joueur qui n'a pas suivi la conversation ne peut pas deviner. Et tant qu'il n'a rien tapé, les vingt lignes en dessous affichent toutes « Pas encore d'avis » : l'écran ne donne rien, donc il n'invite à rien.

**Ce que je propose.** Tant que le chrono n'est pas calé, cet écran ne montre que lui : grand, centré, avec une phrase (« Le temps restant s'affiche en haut à droite de ton écran de jeu ») et une petite image repère. Une fois calé, l'écran bascule sur la liste. C'est un écran, deux états, au lieu d'un écran à moitié mort.

## 3. Spawn ARC : vingt lignes identiques, aucune priorité visible

Sur ordinateur, la colonne de droite affiche « À vérifier 20 » puis vingt lignes de même taille, de même couleur, avec les trois mêmes boutons. Trois lignes s'appellent « Complexe de dômes hydroponiques », deux « Installation principale ». Rien ne relie une ligne à son point sur la carte.

Le joueur qui demande « je vais où, là, maintenant ? » doit comparer vingt lignes et deviner lequel des trois « Complexe de dômes hydroponiques » est celui du haut de la carte.

**Ce que je propose.**

- Numéroter les points sur la carte et reprendre le numéro dans la liste. Survol et clic s'éclairent des deux côtés.
- Ajouter au nom ce qui distingue vraiment deux points du même lieu : le secteur, ou une direction (« dômes — nord », « dômes — quai »).
- Montrer en premier ce qui est actionnable : les chronos en cours, puis ceux qui reviennent bientôt. Le reste se replie derrière « Voir les 14 autres points ».
- « Abattu » est aujourd'hui un bouton rouge. Le rouge dit « attention, action destructrice » ; ici c'est une bonne nouvelle. À passer en neutre ou en vert, et garder le rouge pour rien du tout sur cet écran.

## 4. « Mes schémas manquants » : 91 cartes, aucun tri, 600 pastilles identiques

L'écran affiche 91 vignettes, chacune avec son image, son nom, sa rareté et la liste des cartes où la chercher. Comme presque tous les schémas se trouvent sur presque toutes les cartes, les mêmes sept pastilles (Barrage, Port spatial, Ville enfouie, Portail bleu, Stella Montis, Riven Tides, Pendola) se répètent sur chaque vignette : environ **600 petits boutons** sur un seul écran, qui disent tous la même chose.

Il n'y a ni tri, ni filtre, ni ordre. Le texte d'introduction doit expliquer comment s'en servir — signe que l'écran ne se comprend pas seul.

Et la logique est inversée. Le joueur ne se demande pas « où trouver ce schéma ? » ; il part en raid sur une carte et se demande « qu'est-ce que je peux ramasser ici ? ».

**Ce que je propose.** Mettre la carte en premier : un sélecteur de carte en haut (préréglé sur la sortie conseillée au QG), et en dessous uniquement les schémas qu'on y trouve, groupés par lieu de fouille. Les pastilles de cartes disparaissent des vignettes — elles ne servaient qu'à compenser l'absence de filtre. Garder un tri par rareté et une recherche par nom pour ceux qui chassent un schéma précis.

## 5. « Meilleure sortie maintenant » sans raison affichée

Le QG conseille Portail bleu avec « 71 schémas à trouver ». Juste en dessous, la liste des cartes montre Stella Montis également à 71. Pourquoi Portail bleu plutôt que Stella Montis ? Le joueur ne peut pas le savoir, donc il ne peut pas faire confiance au conseil, donc il va vérifier lui-même — exactement ce qu'on voulait lui éviter.

**Ce que je propose.** Une ligne sous le titre qui donne la raison en clair : « 71 schémas à trouver, dont 3 de tes objectifs, et un événement en cours ». Si le site ne sait pas départager, il le dit : « À égalité avec Stella Montis ».

## 6. Des textes trop petits

Mesures relevées (taille calculée, pas déclarée) :

| Taille | Où | Exemple |
|---|---|---|
| 7 px | `small` de l'écran Opérations | « Démonstration · mouvements simulés » |
| 8 px | `oc-eyebrow`, `oc-fidelity`, `oc-gesture`, `oc-orientation-text` | « Glisser : tourner · Molette : zoomer » |
| 9 px | `button.btn.small` | **« Préparation & sources », « Nouvelle sortie »** |
| 9 px | `span` du QG | **« À FAIRE MAINTENANT »** |
| 10 px | `button.oc-here`, `oc-text-button` | « Je suis ici », « Tout voir sur cette zone » |
| 11,6 px | libellés du rail de navigation | « Cartes », « Schémas », « Opés » |

Deux cas sont vraiment gênants : des **boutons** à 9 px, et un titre d'action (« À FAIRE MAINTENANT ») à 9 px en majuscules, ce qui est le pire des deux mondes pour la lecture. Le plancher raisonnable est 12 px pour du texte secondaire, 14 px pour tout ce qu'on doit lire vite, et 16 px pour les libellés de boutons.

L'écran Opérations concentre 29 textes sous 12 px sur téléphone. Il mériterait une passe à lui seul.

## 7. Des cibles trop petites pour le pouce

Mesures des éléments cliquables sous 24 px de haut :

| Taille | Où |
|---|---|
| 18 px de haut | curseurs de réglage de l'écran Opérations (3 champs) |
| 18–19 px | boutons texte d'Opérations (« Tout voir sur cette zone », « Comparer au jeu ») |
| 19–22 px | les pastilles de cartes des écrans Cartes et Armurerie |
| 22 × 22 px | cases à cocher des écrans Cartes et Schémas |

La recommandation courante est 24 px minimum, 44 px pour ce qu'on vise en jouant. Les cases à cocher à 22 px et les curseurs à 18 px sont à agrandir en priorité : ce sont des cibles isolées, pas du texte en ligne.

## 8. La barre du haut et ses symboles

Sur téléphone, la barre du haut passe **sur deux lignes** (recherche en haut, nom du joueur et thème en dessous) et mange une bonne part du premier écran.

Elle contient aussi deux éléments que rien n'explique : un **« 1 » dans un cercle** (le niveau, mais il faut l'apprendre) et une **pastille grise** (l'état de l'escouade, mais la couleur seule porte l'information — et une pastille grise ne dit ni « connecté » ni « hors ligne »).

**Ce que je propose.** Sur téléphone, garder la recherche et le thème, déplacer le niveau et le profil dans la fenêtre de profil. La pastille d'escouade reçoit un mot à côté d'elle (« Escouade : hors ligne ») plutôt qu'une couleur seule.

## 9. L'écran Opérations fige la page six secondes

Mesure : à l'ouverture de l'écran Opérations, la page ne répond plus pendant **6,6 secondes** sur mon ordinateur, et met **16 secondes** à se stabiliser. Les huit autres écrans répondent en 1 à 2 millisecondes. Il charge d'un coup 13 Mo de JavaScript (`emperor-operation-assets.js` à lui seul fait 12 Mo).

Sur un téléphone, ce sera plusieurs fois pire. Et en ligne, ce sont 13 Mo à télécharger.

**Ce que je propose.** Avant d'optimiser : se demander si cet écran a sa place dans un compagnon de raid. Il vient de l'ancien atlas, il sert à inspecter des modèles 3D, et il pèse à lui seul plus que tout le reste du site. Trois options, par effort croissant : le sortir du rail principal et le laisser accessible par la recherche ; charger les modèles seulement quand on clique dessus ; ou le laisser de côté dans la version en ligne.

## 10. Accessibilité technique

Quatre points précis, tous rapides à corriger :

- **Aucune règle `prefers-reduced-motion`** dans les feuilles de style. Les joueurs qui ont demandé moins d'animations à leur système ne sont pas écoutés. C'est un réglage que prennent souvent les personnes sujettes au mal des transports ou aux migraines.
- **Pas de titre de niveau 1** sur l'onglet Plan de Cartes, sur Armurerie et sur Terrain. Un lecteur d'écran qui liste les titres ne trouve pas de quoi la page parle.
- **Le champ de recherche de l'écran Cartes n'a pas de libellé accessible** : il n'a qu'un texte d'invite (« Caisse d'armes, trappe… »), qui disparaît dès qu'on tape et que certains lecteurs d'écran n'annoncent pas.
- **Des textes techniques subsistent** à l'écran : « Lance Ouvrir Speranza Ops.cmd dans le dossier du site ». Ils n'auront plus aucun sens dans la version en ligne.

---

## Dans quel ordre je m'y prendrais

1. **Le premier lancement** (constat 1) et **le chrono de Spawn ARC** (constat 2). Ce sont les deux moments où un joueur décide s'il garde le site.
2. **La liste de Spawn ARC** (constat 3) : numéros partagés avec la carte, tri par urgence, couleur du bouton « Abattu ».
3. **Les schémas manquants par carte** (constat 4). C'est le plus gros chantier des quatre, mais il supprime 600 boutons et une page d'explications.
4. **Les tailles** (constats 6 et 7) : une passe de nettoyage, surtout sur les boutons.
5. **L'accessibilité technique** (constat 10) : une heure de travail pour les quatre points.
6. **Opérations** (constat 9) : à décider avant la mise en ligne, parce que ça change le poids du site.
7. **La barre du haut** (constat 8) et **la raison du conseil** (constat 5).

## Ce qu'il faudra vérifier autrement

- Un vrai lecteur d'écran sur les trois écrans principaux.
- Un vrai téléphone, en jouant, avec les mains qui tremblent et l'écran qui bouge.
- Deux ou trois joueurs qui découvrent le site devant toi, sans que tu dises un mot. Dix minutes chacun suffisent à trouver ce qu'aucune mesure ne montre.
