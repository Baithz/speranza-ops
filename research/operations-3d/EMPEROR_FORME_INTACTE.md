> Correction du 10 novembre : la V01 Pendola a été rejetée par le joueur. La V02 reprend deux longerons séparés et des biellettes élargies depuis sa capture frontale. Voir `emperor-3d.html`, mode Comparer. La profondeur, les faces masquées et les raccords restent estimés ; aucune fidélité intégrale validée.

# Empereur — confronter le marcheur à l’épave jouable

Recherche révisée le 10 novembre 2026. L’utilisateur précise que la version couchée est **l’épave jouable de Pendola**, avec les passages des Raiders. La forme intacte et l’architecture intérieure de cette épave doivent être étudiées ensemble. **Aucun nouveau modèle fidèle n’est validé à ce stade.**

[Ouvrir les références de Pendola](emperor-pendola.html) · [Comparer les références du marcheur](emperor-intact.html).

## Correction : l’intérieur contraint la coque

La maquette v02 reproduit une lecture du concept Catnip. Elle ne constitue pas une géométrie du jeu, même en ajoutant des textures. Il serait prématuré de la coucher puis d’y insérer des salles. Il faut d’abord confronter le corps à l’épave réellement visitable, sans présumer une correspondance rigide entre le concept ancien, le marcheur lointain et le décor de Pendola.

Les [captures originales de RaiderLogic](https://www.youtube.com/watch?v=JLBVTdaahLQ), conservées avec leur instant et leur empreinte dans `references/emperor-pendola/provenance.json`, établissent les repères suivants :

| Repère observé | Capture | Conséquence pour la construction |
| --- | --- | --- |
| Trappe à bras articulés | 00:26 | Épaisseur, seuil et volume de débattement distincts du passage |
| Tunnel avec boîtiers | 00:48 et 01:06 | Conserver une voie de circulation continue |
| Mât et plateforme annulaire | 01:56 et 02:20 | Paliers, paroi courbe et ouvertures séparés du mécanisme |
| Hangar avec cargaison inclinée | 25:20 et 26:10 | Encombrement de la cargaison et passage autour d’elle contraignent le corps |
| Grande ouverture et passages bas | 33:40, 34:00 et 34:25 | Raccords à la coque et hauteurs de sortie différents |

Ces vues ne donnent pas une échelle absolue ni des faces cachées. La trappe d’entrée et la grande ouverture du hangar sont des repères distincts ; ne pas les fusionner en un unique orifice décoratif. Le relevé ne démontre pas un parcours universel ni une distribution immuable de toutes les salles.

Le [Topside Atlas de Space-Wayfarer](https://topsideatlas.com/) fournit une référence communautaire des connexions : 26 volumes nommés, dont cinq niveaux d’ascenseur, et 39 objets de liaison dans la version observée. **Ces nombres décrivent cette carte, pas un décompte officiel des salles du jeu.** L’auteur indique que les tailles et positions sont approximatives. Le fichier `emperor-pendola-topology.json` consigne ces relations, les éventuels sens de sortie et les blocages séparément. Il ne contient ni son maillage ni ses textures et ne sert pas de modèle de navigation à l’échelle. Les indications nord/sud appartiennent à son repère, sans calibration géographique ici.

Les [notes officielles 2.3.0 du 27 octobre 2026](https://arcraiders.com/news/live-update-2-3-0) signalent des corrections de collisions autour de l’épave et au plafond. La vidéo du 26 octobre précède ces corrections : une ouverture aperçue ne prouve donc pas à elle seule qu’un passage est encore autorisé par les collisions actuelles.

## Reconstruction de Pendola disponible

Une [nouvelle scène 3D de l’épave](emperor-3d.html) est disponible dans `models/emperor-pendola/Emperor_Pendola_v01.blend`, avec export `emperor-pendola-v01.glb`. Elle réunit coque et intérieur, 14 repères de consultation, 19 raccords et huit animations de démonstration. Les contrôles statiques de sol et de hauteur libre passent sur les axes des raccords construits. Cela ne valide ni leur disposition exacte dans le jeu, ni un contrôleur de déplacement, ni les collisions en mouvement.

La géométrie comporte encore des proportions et faces cachées estimées. Les textures de métal sont reconstituées ; seuls les composants ARC partagés identifiés conservent leurs UV et matériaux source. L’export reste séparé du modèle de repérage utilisé en raid dans Opés. Les détails de fabrication et limites sont consignés dans `models/emperor-pendola/README.txt`.

## Maquette de volumes disponible

Une [étude 3D comparative](emperor-study.html) est disponible avec six chaînes articulées et quatre vues. Elle conserve le concept et le gameplay à côté du modèle. Fichier éditable : `models/emperor-intact/Emperor_Intact_Blockout_v02.blend` ; export de consultation : `models/emperor-intact/emperor-intact-blockout-v02.glb`.

Cette maquette cale les repères de la vue principale. La profondeur a été estimée indépendamment : les longueurs des segments homologues ne sont pas encore cohérentes ou validées entre elles. Le contrôle de fidélité des proportions reste insuffisant ; cette version n’est pas promue au modèle utilisé pour se repérer dans Opés. Avant une nouvelle exportation, reprendre les volumes du corps avec les accès et l’encombrement intérieur de Pendola, puis contrôler les segments et attaches du marcheur avec les vues du jeu.

## Pourquoi la première reconstruction est écartée

Le corps massif et presque rectangulaire, les quatre membres simplifiés et leur implantation ont été extrapolés depuis une vue partielle de l’épave. Les détails ajoutés ensuite ne corrigeaient pas cette architecture. Les fichiers générés sont conservés dans `models/_rejected_emperor_2026-11-10/`, hors du chargement de la page Opés. Les anciennes captures de rendu ne sont pas des références du jeu.

## Références retenues et ce qu’elles prouvent

| Référence | Nature et repère | Ce qu’on peut en tirer | Limites |
| --- | --- | --- | --- |
| [Esbjörn Nord — Arc Raiders Enemies Early Exploration](https://esbjornnord.artstation.com/projects/6Ll2Wr) | Auteur ayant travaillé chez Embark ; image `esbjorn-nord-catnip-01.webp` ; copie de consultation `references/emperor-intact/nord-catnip.png` | Six membres distincts, épaules cylindriques, articulations, profil des segments, orifice circulaire central et dessous du corps | Concept de développement. L’auteur précise que les ARC ont beaucoup évolué ; aucune attestation que ce rendu soit le modèle final de l’Empereur |
| [Pork Uh Bowl — L’Empereur se rapproche !](https://www.youtube.com/watch?v=KiBHEDTC8WA&t=35s) | Vidéo de gameplay ; captures à **00:35** et **01:00** ; fichiers `porkuhbowl-35.png` et `porkuhbowl-60.png` | Marcheur réellement visible sur Blue Gate : corps surélevé, membres longs, genoux déportés, changements de pose entre les images | Brume, perspective et résolution réduisent le détail. Le commentaire sur de futurs combats est une hypothèse du vidéaste, pas un fait retenu |
| [ARC Raiders — page Steam officielle](https://store.steampowered.com/app/1808500/ARC_Raiders/) | Clip promotionnel du store, 6 secondes ; [fichier source](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1808500/extras/138bc82b1d7cd44c7a8c1b40ff9351aa.webm?t=1761855189) ; capture à **00:05.8** | Silhouette du grand marcheur à l’horizon, indépendante de la vidéo communautaire | Sujet très petit ; inutilisable pour compter les fixations, mesurer les pieds ou établir une échelle absolue |
| [Embark — Frozen Trail First Look](https://arcraiders.com/news/frozen-trail-content-preview) | Annonce officielle du 23 septembre 2026 | Confirme qu’un Empereur est tombé à Pendola et qu’il est explorable | Ne fournit pas de plan mécanique ni de dimensions |

Les vidéos sont observées comme sources visuelles. Les captures ne sont pas redessinées ni « améliorées » par génération d’image. Le fichier `references/emperor-intact/provenance.json` consigne les fichiers sélectionnés, URL, repères et empreintes SHA-256.

## Anatomie à reconstruire

| Élément | Observation | Statut pour la reconstruction |
| --- | --- | --- |
| Silhouette générale | Corps suspendu avec un large espace libre dessous ; les pattes définissent l’essentiel de l’envergure et de la hauteur | Recoupé entre gameplay et concept ; remplace la lecture de l’épave comme un bloc dressé |
| Nombre de membres | **Six pattes** clairement séparées sur Catnip ; la silhouette en jeu est compatible avec cette architecture | Base de travail étayée, à contrôler sur des vues de jeu plus proches pour les attaches cachées |
| Corps | Volume central relativement compact face à l’envergure des membres, avec une partie inférieure en saillie | Ne pas le réduire à une plaque plate ; profondeur et face arrière encore insuffisamment documentées |
| Implantation | Grands raccords cylindriques autour du corps ; membres écartés, grandes articulations hors du volume central | Détails lisibles dans le concept, validation finale en jeu à faire |
| Pattes | Plusieurs segments profilés, axes et vérins apparents ; longues parties distales et appuis étroits | Construire des pièces articulées. Éviter les quatre grosses poutres droites du modèle rejeté |
| Repère circulaire | Large orifice sombre avec cerclage sur le concept ; l’épave possède aussi un grand accès circulaire | Correspondance visuelle utile, mais orientation et transformations exactes à établir ; ne pas le nommer arbitrairement cockpit ou canon |
| Surfaces | Métal gris, creux sombres, petites touches jaunes et points lumineux sur le concept | Palette de développement seulement. La lumière du gameplay ne permet pas d’étalonner les textures finales |

Les captures de Blue Gate à 00:35 et 01:00 montrent des positions différentes des membres. Cela justifie un modèle articulable ; cela ne suffit pas à fixer un cycle de marche, sa cadence, la séquence d’appuis ou les limites angulaires. La vidéo ne fournit pas de vue orthographique. Aucune hauteur en mètres n’est retenue.

## Ordre de construction corrigé

1. Relever ensemble l’enveloppe de Pendola, la trappe d’entrée, le puits, le hangar et les sorties. Associer chaque pièce à des vues concordantes ; ne pas convertir les positions approximatives du plan communautaire en mètres.
2. Construire les volumes intérieurs traversables et les raccords à la coque dans un même repère. Contrôler les seuils, les dénivelés, les passages sous les mécanismes et le volume libre autour de la cargaison.
3. Confronter cette enveloppe au marcheur intact observé en jeu. Conserver ses chaînes articulées et vérifier leurs longueurs et attaches. Documenter les différences de géométrie entre la silhouette distante et le décor jouable au lieu de les effacer par hypothèse.
4. Conserver les variantes intacte et échouée. Réutiliser les pièces dont la correspondance est démontrée ; relever séparément les ruptures, adaptations du décor et contacts au terrain.
5. Détail, textures et animations seulement après validation de chaque volume et de ses passages. Une texture partagée avec la Frégate n’atteste ni la géométrie de la coque ni la position d’une pièce dans l’Empereur.

## Sources écartées de la validation

Les concepts Mustard, les engins à chenilles et les sphères de la même galerie ne représentent pas cette silhouette. Les tableaux communautaires « King / Emperor », miniatures de vidéos, images de fans et modèles imprimables ne sont pas des preuves du modèle final. Le modèle imprimable à six pattes peut servir de comparaison secondaire, jamais de gabarit officiel. Les laboratoires humains montrés dans le documentaire Frozen Trail ne doivent pas être confondus avec l’intérieur de l’Empereur.

La recherche établit une base visuelle beaucoup plus solide que l’épave seule. Il manque encore des vues proches et concordantes des faces cachées, l’échelle absolue et les données de mouvement pour certifier une reproduction identique.
