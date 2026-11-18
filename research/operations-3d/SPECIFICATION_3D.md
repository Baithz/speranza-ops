# Frégate et Empereur spécification de reconstruction

Cette spécification traduit les [références étudiées](<C:/Dev/Arc Raiders/Speranza_Ops/research/operations-3d/RECHERCHE_3D.md>) en exigences de modélisation, d’animation et d’intégration. Elle décrit le travail à réaliser ; elle ne constitue pas une validation de modèles déjà reconstruits.

## Définition du résultat attendu

La fidélité porte sur la silhouette, les proportions, la posture, les surfaces, les ouvertures, la circulation intérieure et les états des mécanismes. Un rendu extérieur séduisant ne valide pas l’intérieur. Une coupe schématique ne valide pas une scène à l’échelle.

Chaque objet important doit conserver sa référence, sa version et son statut : géométrie issue de l’export, forme observée sur une capture, mesure reconstituée ou partie encore indéterminée. Ces informations appartiennent aux métadonnées de production. Le visualiseur destiné au joueur doit simplement distinguer une reconstitution vérifiée d’une zone encore approximative.

## État du projet à remplacer

| Fichier actuel | Constat | Implication |
| --- | --- | --- |
| [aerial_operation_shapes.py](<C:/Dev/Arc Raiders/tools/aerial_operation_shapes.py:97>) | Frégate générée par primitives ; périmètre déclaré comme extérieur d’orientation et intérieur schématique | Remplacer la structure de référence, pas seulement augmenter le nombre de détails |
| [model_wrecks.py](<C:/Dev/Arc Raiders/tools/model_wrecks.py:234>) | Empereur limité à un fragment extérieur, avec câbles et corrosion interprétés | Refaire l’enveloppe complète et ajouter un intérieur distinct |
| [flight-render.js](<C:/Dev/Arc Raiders/Speranza_Ops/engine/flight-render.js:61>) | Géométrie chargée en tableaux ; couleur et propriétés par pièce ; aucun attribut UV chargé dans cette boucle | Étendre ou isoler le chargement des modèles texturés |
| [model-library.js](<C:/Dev/Arc Raiders/Speranza_Ops/engine/model-library.js>) | Archives JSON comprimées intégrées en JavaScript | Ne pas ajouter systématiquement tout le cache de recherche à l’archive initiale |
| [engines.js](<C:/Dev/Arc Raiders/Speranza_Ops/app/engines.js:36>) | L’action `study` ouvre l’atelier existant | Conserver les entrées et les identifiants `arc-frigate` et `emperor` |
| [ops-data.js](<C:/Dev/Arc Raiders/Speranza_Ops/app/ops-data.js>) | Nombres de noyaux et salles non réconciliés avec les nouvelles sources | Mettre à jour les dossiers seulement après résolution des contradictions |

Le travail concerne `Speranza_Ops`. Plusieurs anciens outils du dossier parent écrivent dans `dist` et `Modeles_ARC` : leurs destinations devront être rendues explicites avant de les employer pour les nouveaux modèles.

## Assemblage de la Frégate

### Import et repère

1. Charger le manifeste local, `source/frigate/meshes/index.json` et `source/frigate/data/scene.json`.
2. Décoder les 51 GLB utilisés par les instances visibles. Ils exigent `EXT_meshopt_compression` et `KHR_mesh_quantization`. Les fichiers comprimés ne sont pas encore un assemblage Blender prêt à ouvrir.
3. Conserver les transformations propres aux nœuds des GLB : la quantification utilise notamment des translations et des échelles. Supprimer ces transformations déformerait les pièces.
4. Instancier les ressources selon les matrices de `scene.meshes`, en conservant les liens acteur/composant. Ne pas cumuler une seconde fois la matrice de l’acteur sur une matrice déjà mondiale.
5. Appliquer les matériaux des composants, avec repli sur `defaultMaterials` du maillage pour les emplacements non surchargés.
6. Conserver séparément les objets masqués, les collisions et les emplacements d’ennemis. Le cache actuel couvre les objets visibles ; les autres ressources devront être récupérées selon le besoin.

Le repère de la scène web est Y vertical. Pour un traitement manuel vers Blender, la conversion de vecteur `(x,y,z) → (x,-z,y)` est une rotation cohérente ; l’importeur glTF peut déjà effectuer cette conversion. Ne pas la répéter. Une conversion de matrice s’effectue par changement de base, pas par permutation improvisée des seules translations.

Vérifier les bornes d’une pièce test avant d’importer l’ensemble. `SM_Frigate_Rear_01` a par exemple des bornes déclarées d’environ `[-103.455,-30.829,-38.989]` à `[93.331,19.294,38.989]` dans le repère source. Vérifier ensuite la boîte globale, les quatre propulseurs et l’emplacement de la cargaison.

### Organisation des objets

Prévoir une collection de coque, une de structure intérieure, une de mécanismes, une de lumières et effets, une d’interactions et une de collisions. La coque doit pouvoir être cachée ou coupée sans supprimer les plateformes, les portes ou le sol intérieur.

Les mécanismes doivent rester identifiables par les ID de l’export. Les noyaux, leurs boucliers, les points faibles et les commandes ont des rôles différents et ne doivent pas être fusionnés. Conserver les pivots locaux des vantaux, ventilateurs, plateformes, loquets et de la charge.

### Surfaces et éclairage

Les textures KTX2 sont séparées des GLB. Reconstituer les affectations à partir de `materials.json`, puis contrôler couleur, rugosité, métal et émission individuellement. Le canal vert des normales est indiqué `dx` dans plusieurs matériaux ; la convention doit être convertie si le moteur de destination l’exige. Les canaux des masques ne doivent pas être traités comme des images en couleur.

Restaurer uniquement les couches supplémentaires confirmées par les captures : poussière, dépôts, usure, neige éventuelle, décals et émission. Ne pas ajouter arbitrairement du bruit ou une forte corrosion pour masquer une géométrie erronée.

Séparer un éclairage neutre de contrôle de l’ambiance en jeu. Les 115 lumières de la scène source sont des repères ; leurs intensités ne se transposent pas directement entre moteurs. Les notes de l’export mentionnent notamment des unités par défaut et des atténuations différentes.

## Reconstruction de l’Empereur

**Correction du 10 novembre 2026 après précision de l’utilisateur :** la version couchée est l’épave jouable de Pendola. Étudier ensemble sa coque, ses passages et leur correspondance avec le marcheur intact. L’ancienne reconstruction est retirée de l’application et conservée dans `models/_rejected_emperor_2026-11-10/` ; la maquette intacte v02 reste non validée. L’[étude révisée](EMPEROR_FORME_INTACTE.md) et les [captures de Pendola](emperor-pendola.html) remplacent les hypothèses antérieures.

### Coque et posture

Construire le marcheur intact en tenant compte dès ce stade des volumes jouables de Pendola : corps suspendu, six membres articulés à recouper avec les captures en jeu, épaules cylindriques, grandes articulations déportées, segments profilés et petits appuis au sol. Vérifier la silhouette et les espaces vides sous le corps avant tout ajout de panneaux ou de textures. Le visuel Catnip d’Esbjörn Nord est une référence de développement, pas une preuve que chaque détail correspond au jeu actuel.

Utiliser plusieurs caméras de comparaison verrouillées : vue de référence, profil, trois quarts, dessus, arrière et dessous lorsque disponibles. Ne pas transformer une image en perspective en plan orthographique. Les dimensions en mètres ne sont pas établies.

Conserver des variantes intacte et échouée, mais ne pas supposer que le décor jouable est une simple rotation du concept de développement ou du marcheur lointain. Relever d’abord les ouvertures et l’encombrement des volumes intérieurs de Pendola. Réutiliser les pièces réellement correspondantes ; documenter toute adaptation entre les variantes. Le terrain reste indépendant pour contrôler l’enfoncement dans la neige et les contacts des membres.

La trappe, les articulations, les carénages et les faisceaux de câbles doivent être distincts. Les répétitions de plaques, fixations et nervures viennent après la validation des volumes. Les longues pièces sont profilées et raccordées par des volumes cylindriques ; une suite de parallélépipèdes ne reproduira pas correctement leur silhouette.

Les faces cachées restent non validées tant qu’aucune autre vue ou géométrie source ne les documente. Le modèle imprimable d’un Empereur debout ne suffit pas à établir la posture de l’épave ni son intérieur.

### Modules intérieurs

Prévoir des modules pour le tunnel d’accès, le puits principal, les portes, les passages, les salles à conteneurs, la compression, le labyrinthe, les lasers, la salle sombre, les puits de montée et descente et le hangar final. La trappe à la base, le mécanisme annulaire du puits, la cargaison inclinée et la grande ouverture du hangar contraignent la coque dès le début. Une trappe, un conteneur ou une capsule réutilisée doit conserver les mêmes dimensions d’un module à l’autre.

Chaque module comprend une enveloppe visible, des surfaces de marche, des passages, des objets mobiles et des repères d’entrée/sortie. Les liaisons entre modules doivent être enregistrées par variante de parcours. Ne pas raccorder arbitrairement toutes les salles dans une tour unique à partir de leur ordre dans un guide vidéo.

Mesurer les dimensions avec plusieurs repères sur le même plan et plusieurs vues. Un personnage plus proche de la caméra que la porte ne constitue pas à lui seul une règle d’échelle. Conserver pour chaque mesure les captures utilisées et sa marge d’incertitude.

## États et animations

| Système | États minimaux proposés | Contrôle attendu |
| --- | --- | --- |
| Porte | Fermée, déverrouillée, en mouvement, ouverte | Ouverture praticable et aucun passage à travers le vantail |
| Noyau Frégate | Protégé, exposé, éléments détruits, circuit activé | Une cible détruite ne valide pas les autres boucliers |
| Plateforme | Au repos, en mouvement, verrouillée | Pivot, course et position d’arrivée documentés |
| Charge Frégate | Retenue, libérée, en descente, posée | Loquets et cliquet cohérents avec l’état de la charge |
| Obstacle électrique Empereur | Actif, déchargé temporairement, réarmé | Effet visuel et fenêtre de passage synchronisés |
| Compacteur | Attente, déclenché, compression, dégagement | Mouvement indépendant du gaz et du volume dangereux |
| Laser | Actif, balayage, occultation | Rayon visuel et obstacle concordants |
| Hangar Empereur | Fermé, alerte, accès supérieur ouvert, récompenses accessibles | Commandes et capsules représentées séparément |

Les durées ne doivent être fixées que lorsqu’un fichier source ou un relevé vidéo les établit. Les valeurs exportées de la Frégate restent associées à leur build. L’Empereur ne dispose pas ici d’un tableau fiable des durées, vitesses ou dégâts : ne pas remplacer ces données manquantes par des constantes présentées comme officielles.

## Intégration dans Speranza Ops

La scène détaillée doit être chargée à l’ouverture de l’opération. Préserver le fonctionnement des autres ARC et libérer géométries, textures, workers et événements lorsque le visualiseur se ferme.

Un chargement glTF peut utiliser `GLTFLoader` avec un décodeur Meshopt. Les textures Basis/KTX2 demandent un chargeur compatible et une détection du support du GPU. Les versions de Three et de ses compléments doivent être cohérentes. [Documentation GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [documentation KTX2Loader](https://threejs.org/docs/pages/KTX2Loader.html).

Pour la visite, prévoir une caméra en perspective à échelle humaine, un mode orbital extérieur, des coupes réglables et des accès directs aux zones. Une caméra orthographique reste utile pour comparer des plans, mais ne remplace pas la visite intérieure. Les annotations doivent pointer vers l’objet réel, y compris après animation.

Le projet peut être ouvert en `file://`. Le futur chargement devra conserver un chemin compatible avec cet usage ou fournir un lancement local explicite ; une chaîne reposant uniquement sur des requêtes HTTP relatives ne doit pas casser silencieusement l’ouverture actuelle.

Les niveaux de détail seront construits après la validation visuelle. Préserver les ouvertures, les marches, les cibles et les silhouettes à toutes les distances utiles. Déterminer le budget final sur le matériel de test ; les 2,30 millions de triangles de la Frégate instanciée ne préjugent pas à eux seuls des performances.

## Critères de réception

| Domaine | Preuve nécessaire |
| --- | --- |
| Silhouette | Images de comparaison à cadrage équivalent, sur toutes les faces documentées |
| Proportions | Dimensions et distances entre repères mesurées ; aucune mise à l’échelle différente entre coque et intérieur |
| Circulation | Parcours continus validés, accès dégagés, plafonds et sols cohérents |
| Matériaux | Comparaison en lumière neutre puis en ambiance de jeu, avec gros plans |
| Mécanismes | Début, course, fin et dépendances vérifiés ; pivots et états accessibles séparément |
| Empereur | Variante de parcours identifiée ; aucune connexion inventée présentée comme réelle |
| Version | Porte et indicateurs Frégate comparés à la révision actuelle ; changements officiels pris en compte |
| Livraison | Fichiers Blender éditables, ressources embarquées nécessaires, export web et références associées |
| Application | Ouverture, fermeture, réouverture, navigation intérieure et mode local contrôlés |

Le seuil d’acceptation demandé est l’absence d’écart visible sur les références alignées et la concordance des parcours et mécanismes documentés. Tant que les angles ou les variantes nécessaires manquent, la zone concernée reste « non vérifiée » ; une note globale de ressemblance ne doit pas dissimuler cette lacune.

## Ordre de production

1. Assembler et vérifier la Frégate de référence dans une scène dédiée, avec ses transformations et ses matériaux.
2. Comparer les composants modifiés depuis la build indiquée et relever les écarts actuels.
3. Valider la coque de l’Empereur avec des vues complémentaires, puis construire les modules intérieurs documentés.
4. Valider les variantes de circulation et animer les mécanismes.
5. Produire les versions optimisées pour le web, puis raccorder les deux modèles à l’atelier existant.

Les anciens fichiers `.blend` et les archives actuelles restent les versions de secours jusqu’à validation des remplaçants.
