/* Speranza Ops — dossiers d'opération : Empereur échoué et Frégate ARC.
   Synthèse rédigée à partir de guides communautaires (voir « sources » dans chaque dossier),
   relevés en novembre 2026. Les schémas sont des plans de principe, pas des relevés à l'échelle. */
window.OPS_DOSSIERS={
  emperor:{
    name:'Empereur échoué',where:'Col de Pendola, à l’ouest de la carte',arc:'emperor',map:'pendola-pass',
    pitch:'Le premier donjon du jeu : une suite de salles piégées à l’intérieur de l’épave, avec un hangar de butin au bout.',
    facts:[['Clé','Conduit de passerelle de l’Empereur'],['Salles','Entrée, puits, épreuves et hangar final ; parcours à reconnaître en raid'],['Butin','Modules d’amplification Mk. I à V, Modulateur d’Empereur']],
    nodes:[
      {id:'door',zone:'in',name:'Trappe d’entrée',tag:'Fixe',what:'Une prise sur la coque, à la base de l’Empereur, à côté d’une trappe ronde.',
        do:['Apporte un Conduit de passerelle de l’Empereur déjà fabriqué : on ne peut pas le fabriquer en raid.','Utilise-le sur la prise : la trappe ronde voisine s’ouvre.'],
        warn:['L’ouverture s’entend de loin : attends-toi à de la visite.']},
      {id:'ground',zone:'in',name:'Rez-de-chaussée',tag:'Fixe',what:'Un tunnel de boîtiers électrifiés gardé par une Hydre.',
        do:['Tire sur un boîtier pour le décharger : il devient sûr quelques secondes.','Abats l’Hydre qui bloque le passage (environ 8 tirs de Brise-fuselage).'],
        gear:['Brise-fuselage']},
      {id:'lift',zone:'in',name:'Ascenseur',tag:'Fixe',what:'L’ascenseur reste électrifié tant que ses nœuds jaunes sont intacts.',
        do:['Détruis les nœuds jaunes sur le mécanisme et sur les murs autour.','Monte jusqu’en haut. Les paliers ont des conteneurs à forcer.']},
      {id:'gas',zone:'mid',name:'Salle de gaz',tag:'Épreuve',what:'Le gaz vide l’endurance et les murs se referment.',
        do:['Les murs ne bougent qu’après le premier pas sur le sol : regroupez-vous avant.','Descends dans le creux au milieu de la salle et attends : des ouvertures s’y libèrent.'],
        gear:['Stimulants pour un court sprint']},
      {id:'above',zone:'mid',name:'Au-dessus du gaz',tag:'Épreuve',what:'La traversée par le haut de la salle de gaz.',
        do:['Attends l’ouverture des murs.','Mousqueton jusqu’en haut, traverse, redescends, puis Mousqueton vers la porte du fond.'],gear:['Mousqueton']},
      {id:'hangar',zone:'mid',name:'Hangar à conteneurs',tag:'Épreuve',what:'Des conteneurs circulent sur un rail au-dessus du vide. Plusieurs Hydres gardent la salle.',
        do:['Nettoie les Hydres depuis un abri.','Monte sur le rail, puis Mousqueton jusqu’à la porte située au-dessus.'],warn:['Une chute est probablement mortelle.'],gear:['Brise-fuselage','Mousqueton']},
      {id:'chasm',zone:'mid',name:'Descente du gouffre',tag:'Épreuve',what:'Une descente par des découpes dans les planchers.',
        do:['Descends un niveau à la fois.','Tire sur les boîtiers électrifiés avant de passer.'],warn:['Sauter plusieurs niveaux d’un coup peut tuer.']},
      {id:'maze',zone:'mid',name:'Labyrinthe',tag:'Épreuve',what:'Des cloisons ouvertes d’où sortent Pops et Bolides. Deux variantes existent.',
        do:['Garde la direction que tu avais en entrant.','Abats Pops et Bolides dès qu’ils sortent : l’Enclume les tue en un tir.'],gear:['Enclume']},
      {id:'climb',zone:'mid',name:'Montée des plateformes',tag:'Épreuve',what:'Une ascension sur des conteneurs électrifiés, en trois puits.',
        do:['Monte l’échelle, saute sur le conteneur derrière toi.','Tire sur chaque conteneur électrifié avant d’atterrir dessus.','Le deuxième puits demande un saut en diagonale vers un conteneur près d’un pilier : le Mousqueton est plus sûr.','Le troisième puits est une montée simple, avec du butin.'],gear:['Mousqueton']},
      {id:'laser',zone:'mid',name:'Salle des lasers',tag:'Épreuve',what:'Des lasers tournants. Certains conteneurs coupent les rayons.',
        do:['Coin droit, puis couloir des lasers.','À droite au bout, saute, esquive le conteneur qui arrive, puis saute vers le grand mur.'],warn:['Rester dans un rayon est mortel.']},
      {id:'box',zone:'mid',name:'Conteneur mobile',tag:'Épreuve',what:'Un conteneur monte et descend dans un puits.',
        do:['Saute dessus, puis passe sur les corniches d’un côté.','Prends l’échelle jusqu’au palier.'],warn:['Rater une corniche coûte en général seulement des dégâts de chute.']},
      {id:'loot',zone:'out',name:'Hangar de butin',tag:'Fixe',what:'La dernière salle, toujours. Six nœuds libèrent les capsules de butin.',
        do:['Passe par la grande ouverture, pas par la porte à lumière jaune à côté.','Monte sur la grande pièce qui se balance et saute près du conteneur effondré.','Détruis les 3 nœuds de chaque côté (6 en tout) : le toit s’ouvre, de petits ARC et un Vaporisateur entrent.','Tire depuis le dessous du conteneur effondré. Un silencieux aide à rester discret.','Quand les six nœuds sont tombés, des capsules sortent des murs : attends le départ du Vaporisateur, puis fouille.'],
        warn:['Les capsules orange sont des bombes : recule quand elles clignotent.','Fouille avant de sortir et repère le passage ouvert depuis le hangar.'],gear:['Silencieux']},
      {id:'exit',zone:'out',name:'Sorties',tag:'Repère',what:'La grande ouverture du hangar domine le terrain. Des passages secondaires débouchent plus bas dans la coque ; leurs seuils et dénivelés sont différents.',
        do:['Repère le passage ouvert et vérifie le dénivelé avant de descendre.','Range les modules dans ta poche sécurisée.','Appelle une télécabine balistique. Le transmetteur le plus proche est à côté de l’Empereur, mais c’est le plus exposé.']}
    ],
    rule:'Repère des portes, d’après un guide : lumières blanches sur une grande porte scellée, c’est la suite. Lumière jaune, la porte te renvoie à l’ascenseur du bas ou dehors. Vérifie où mène une porte avant de t’engager.',
    steps:[
      {t:'Obtenir la clé',items:['Jouer le Col de Pendola pendant l’événement Redirection.','Attendre qu’un relais d’Empereur endommagé s’active (faisceau rouge), vers 25 minutes restantes.','Fouiller le relais actif pour prendre une Balise d’Empereur.','Poser la balise à découvert, puis se mettre à l’abri des débris.','Forcer la grande charge utile dressée : c’est la seule qui contient les coupleurs et le schéma.','Extraire, puis fabriquer le Conduit à l’Établi I : schéma + 1 coupleur conducteur + 1 isolé + 1 plaqué.']},
      {t:'Entrer et monter',items:['Ouvrir la trappe à la base de l’Empereur avec le Conduit.','Décharger les boîtiers électrifiés et abattre l’Hydre du tunnel.','Détruire les nœuds jaunes de l’ascenseur, puis monter.']},
      {t:'Traverser les épreuves',items:['Reconnaître chaque salle et le passage ouvert : ne pas suivre un ordre supposé universel.','Forcer chaque panneau rond rencontré en montant.','Surveiller le temps : une annonce signale que la fenêtre se referme à 10 minutes de la fin.']},
      {t:'Vider le hangar et sortir',items:['Détruire les 6 nœuds du hangar et laisser partir le Vaporisateur.','Fouiller les capsules, en commençant par le sol.','Mettre Modulateur et modules en poche sécurisée.','Sortir par une porte du hangar et appeler une télécabine.']}
    ],
    kit:[['Brise-fuselage','Contre les Hydres : environ 8 tirs chacune.'],['Enclume','Nœuds et labyrinthe : un tir par Pop ou Bolide.'],['Mousqueton','Plusieurs épreuves se raccourcissent ou se sécurisent avec.'],['Stimulants, soins, recharges de bouclier','La salle de gaz vide l’endurance.'],['Silencieux','Pour le hangar final.'],['Augment à poches sécurisées','Schéma d’abord, puis un coupleur de chaque type, puis les modules.']],
    alerts:['Sans coéquipier pour te relever, la sortie s’arrête si tu tombes.','Le schéma du Conduit est rare : certains joueurs ont ouvert plus de 20 charges utiles avant de le trouver.','Les coupleurs ne se mettent pas en commun entre Raiders.','Les faisceaux des relais attirent les autres Raiders : certains campent les balises.'],
    loot:['Modules d’amplification, Mk. I à V','Modulateur d’Empereur (Armurier niveau 4)','Matériaux de fabrication d’amplification','Modules de données ARC et pièces ARC'],
    sources:[['Arc Raiders Hub · Fallen Emperor Guide','https://arcraidershub.com/guides/fallen-emperor-guide'],['ARC Raiders Wiki · Belly Of The Beast','https://arcraiders.wiki/wiki/Belly_Of_The_Beast'],['Embark · Mise à jour 2.3.0','https://arcraiders.com/news/live-update-2-3-0']]
  },
  frigate:{
    name:'Frégate ARC',where:'Condition de carte : Barrage, Ville enfouie, Port spatial, Portail bleu, Riven Tides, Col de Pendola',arc:'arc-frigate',
    pitch:'Un vaisseau ARC à aborder en équipe : 20 noyaux d’énergie à détruire à l’extérieur, 8 à l’intérieur, puis la cargaison à décrocher.',
    facts:[['Durée du raid','35 minutes'],['Équipe','3 Raiders pour plusieurs commandes'],['Objectif','Détruire les noyaux, décrocher la cargaison']],
    nodes:[
      {id:'landing',zone:'a',name:'Zone d’arrivée',tag:'Abordage',cores:0,what:'L’arrière du vaisseau, où les Récupérateurs viennent s’amarrer.',
        do:['Va sous l’arrière de la Frégate, là où les Récupérateurs montent et descendent.','Monte sur un Récupérateur posé au sol et utilise « Perturber » en son centre : il te remonte.','Descends sur l’une des 2 passerelles latérales : elles mènent à l’atrium inférieur.','Une seconde entrée, plus petite et plus loin, mène à une partie cachée de l’atrium inférieur.'],
        warn:['Au sol, les autocanons de la Frégate s’annoncent par un signal sonore et des lasers bleus.']},
      {id:'lower',zone:'b',name:'Atrium inférieur',tag:'6 noyaux',cores:6,what:'Un ascenseur, 4 Hydres (2 actives à la fois) et des plateformes à déployer.',
        do:['Ascenseur : 2 boutons à tenir en même temps. Un Mousqueton ou un Grappin permet de s’en passer.','Tire sur les composants jaunes des murs pour faire sortir les plateformes.','Troisième plateforme de chaque côté : un Raider tient un bouton pour sortir une grande plateforme, un second en tient un autre pour la verrouiller.','4 noyaux : 3 Raiders tiennent 3 boutons en même temps pour les exposer, puis tire sur les anneaux orange.','Les 2 autres noyaux sont accessibles par la seconde entrée, à l’opposé de l’ascenseur : ils alimentent la cargaison.'],
        warn:['Exposer les noyaux fait apparaître 2 Hydres de chaque côté.','Si celui qui tient le bouton lâche, la plateforme se replie.'],gear:['Mousqueton ou Grappin','Brise-fuselage']},
      {id:'upper',zone:'c',name:'Atrium supérieur',tag:'Butin',cores:0,what:'Une passerelle en W qui fait presque le tour de l’atrium. Aucun noyau ici.',
        do:['Force les conteneurs encastrés dans les murs.','À l’arrière : une salle de chaque côté, avec 2 conteneurs et 3 passages vers le pont supérieur.','À l’avant : une ouverture mène au pont supérieur.']},
      {id:'top',zone:'d',name:'Pont supérieur',tag:'14 noyaux',cores:14,what:'La section la plus vaste et la plus dangereuse : 6 Hydres (3 par côté), rafales de vent et pièges à feu.',
        do:['6 noyaux surplombent l’atrium, à l’arrière (3 par côté), près des 2 Hydres les plus reculées.','6 noyaux sur les flancs extérieurs (3 par côté) : force chaque noyau avant de pouvoir l’endommager.','2 noyaux dans les salles à entrée en pente, près des accès arrière : un noyau par salle.','À l’avant, 3 crêtes à « aérofreins » : celle du centre vient de l’atrium supérieur, les deux autres mènent à la soute.'],
        warn:['Le vent peut te pousser dans les pièges à feu. Détruire les 3 noyaux extérieurs d’un côté coupe le vent de ce côté.','Les salles en pente se remplissent de feu tant que leur noyau est actif.','Les accès à la soute ne s’ouvrent qu’une fois les 20 noyaux extérieurs détruits.'],gear:['Arme précise à longue portée']},
      {id:'cargo',zone:'e',name:'Soute',tag:'Cargaison',cores:0,what:'Deux niveaux. En bas, la cargaison et un abri relatif. En haut, 4 Hydres, des composants jaunes et 2 portes vers l’intérieur.',
        do:['Détruis les composants jaunes pour activer les 2 portes de l’intérieur.','Après l’intérieur : défais les 4 loquets, puis force les 2 loquets circulaires.','Reste debout sur la cargaison pendant qu’elle descend : c’est la sortie prévue.'],
        warn:['Défaire les loquets fait apparaître 2 Hydres au niveau bas.','Depuis la 2.1.0, ouvrir les trappes de la Frégate brûle dans la durée.']},
      {id:'inside',zone:'f',name:'Intérieur et turbines',tag:'8 noyaux',cores:8,what:'Deux salles en miroir (2 Hydres et 2 noyaux chacune), puis la salle des turbines et ses 4 noyaux.',
        do:['Entre par l’une des 2 portes et descends la rampe en spirale.','Dans chaque salle miroir : détruis les 2 noyaux, puis les composants jaunes qui apparaissent pour ouvrir la salle des turbines.','Salle des turbines : tire sur les composants jaunes pour ralentir le ventilateur le plus proche et chasser le brouillard du quartier.','Détruis les 4 noyaux des turbines (2 par côté), puis retourne à la soute.'],
        warn:['Le brouillard de la salle des turbines draine la vie en continu.','Une moitié nettoyée réveille les 2 Hydres de l’autre : ne laisse aucun ARC vivant derrière toi.']}
    ],
    rule:'Le vaisseau est symétrique : gauche et droite se valent. Les composants jaunes ouvrent toujours quelque chose. Les sources divergent sur le total exact de noyaux à l’extérieur (18 ou 20) : compte 6 en atrium inférieur et 14 sur le pont.',
    steps:[
      {t:'Avant de partir',items:['Vérifier l’étiquette « Frégate ARC » sous la carte dans l’écran de destination.','Venir avec son propre équipement : pas d’équipement gratuit pendant cette condition.','Prévoir une équipe de 3, ou se regrouper sur place.']},
      {t:'Aborder',items:['Rejoindre l’arrière de la Frégate dès son arrivée, 1 à 2 minutes après le début.','Monter sur un Récupérateur posé et le perturber.','Descendre sur une passerelle latérale vers l’atrium inférieur.']},
      {t:'Extérieur : 20 noyaux',items:['Atrium inférieur : détruire les 6 noyaux.','Atrium supérieur : forcer les conteneurs, puis monter sur le pont.','Pont supérieur : détruire les 14 noyaux, un côté après l’autre.']},
      {t:'Intérieur : 8 noyaux',items:['Soute, niveau haut : détruire les composants jaunes pour ouvrir les 2 portes.','Salles miroir : 2 noyaux chacune, puis leurs composants jaunes.','Salle des turbines : 4 noyaux.']},
      {t:'Cargaison et sortie',items:['Retourner à la soute et défaire les 4 loquets.','Forcer les 2 loquets circulaires.','Descendre debout sur la cargaison, puis la fouiller au sol.','Garder 7 à 10 minutes pour rejoindre une extraction.']}
    ],
    kit:[['Mousqueton ou Grappin','Évite l’ascenseur à 2 boutons et sécurise l’abordage.'],['Brise-fuselage','Hydres dans toutes les sections ; leur dos n’est pas blindé.'],['Explosifs','Depuis la 2.0, ils font au moins 50 % de dégâts en plus aux plaques de blindage ARC.'],['Arme précise à longue portée','Deux noyaux du pont se tirent de loin.'],['Poche sécurisée libre','Pour les modules d’amplification.']],
    alerts:['Pas d’équipement gratuit, pas de trappes de Raider, pas de salles verrouillées : le butin au sol est réduit.','Plusieurs commandes demandent 2 ou 3 Raiders en même temps.','Artificiers, Vaporisateurs, Lucioles, Frelons et Guêpes défendent aussi le vaisseau.','Problème connu en 2.2.0 : un Récupérateur peut ne pas s’amarrer.'],
    loot:['Cargaison : nœuds de diagnostic de Frégate, modules et pièces d’amplification','Inducteur de Frégate (Station de recherche niveau 4)','Conteneurs : butin ARC intermédiaire, parfois modules d’amplification et données ARC','Coupleurs ARC sur les ARC du vaisseau'],
    sources:[['ARC Raiders Wiki · ARC Frigate','https://arcraiders.wiki/wiki/ARC_Frigate'],['COE.gg · ARC Frigate Guide','https://coe.gg/frigate/'],['Hardcore Gamer · How To Loot the ARC Frigate','https://hardcoregamer.com/arc-raiders-frozen-trail-arc-frigate/'],['GFUEL · ARC Raiders Frigate Guide','https://gfuel.com/blogs/news/arc-raiders-frigate-guide']]
  }
};
