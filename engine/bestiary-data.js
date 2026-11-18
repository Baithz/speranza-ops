window.BESTIARY_DATA = [
  {
    "id": "snitch",
    "name": "Mouchard",
    "en": "Snitch",
    "aliases": [],
    "family": "Drones",
    "role": "Reconnaissance",
    "image": "assets/bestiary/snitch.webp",
    "behavior": "Son projecteur balaie la surface. Une fois la cible repérée, il appelle des renforts avant de se retirer.",
    "weak": "Quatre propulseurs non blindés soutiennent le drone.",
    "opening": "Tire dès le premier appel. D’après le wiki, les renforts sont assurés quand le troisième appel commence.",
    "tactic": "Si personne n’est repéré, laisse passer le faisceau. Si le combat démarre, concentrez vos tirs avant la fin de la séquence.",
    "zone": "Patrouilles à ciel ouvert. Les renforts peuvent comprendre un Artificier.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu"
    ],
    "armor": "Sans plaques",
    "hp": "158",
    "xp": 100,
    "loot": [
      [
        "snitch_scanner",
        "Scanner de Mouchard"
      ],
      [
        "arc_synthetic_resin",
        "Résine synthétique ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ],
      [
        "sensors",
        "Capteurs"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Snitch",
        "https://arcraiders.wiki/wiki/Snitch"
      ],
      [
        "RaidTheory · Cartes de présence",
        "https://github.com/RaidTheory/arcraiders-data/blob/main/bots.json"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/c/c6/ARC_Snitch.png",
    "engagement": {
      "target": "Les propulseurs nus",
      "signal": "Dès le premier appel",
      "weapons": [
        [
          "anvil",
          "Ses six cartouches lourdes permettent de corriger un premier tir manqué avant le troisième appel du drone."
        ],
        [
          "rattler",
          "Une rafale de munitions moyennes laisse le temps de suivre le drone s’il commence à tournoyer."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Interrompre l’alerte",
        "title": "Tire avant le troisième appel",
        "action": "Depuis un couvert, prépare tes cartouches moyennes ou lourdes pendant son balayage. Ouvre le feu dès que tu peux garder le drone en joue.",
        "limit": "Au début du troisième appel, le wiki considère les renforts comme acquis.",
        "refs": [
          "snitch"
        ],
        "gear": "rattler"
      },
      {
        "effect": "Provoquer la chute",
        "title": "Passe au rotor voisin",
        "action": "Avec une arme ordinaire, vise les propulseurs nus. Lorsqu’un premier rotor lâche, passe au suivant pour que le drone perde le contrôle et percute le décor.",
        "limit": "Le vol devient irrégulier après la première casse. Garde de l’espace pour suivre sa trajectoire.",
        "refs": [
          "snitch"
        ],
        "gear": "kettle"
      }
    ]
  },
  {
    "id": "wasp",
    "name": "Guêpe",
    "en": "Wasp",
    "aliases": [],
    "family": "Drones",
    "role": "Mitrailleuse légère",
    "image": "assets/bestiary/wasp.webp",
    "behavior": "Elle marque sa cible au laser rouge, se stabilise pour tirer puis change de position.",
    "weak": "Ses quatre propulseurs sont exposés. En perdre plusieurs peut la faire chuter.",
    "opening": "Le bref vol stationnaire qui précède sa rafale offre une cible plus stable.",
    "tactic": "Choisis un propulseur et tire depuis un angle qui permet de rompre la ligne de vue. Évite de poursuivre au viseur le drone qui chute en vrille.",
    "zone": "Espaces extérieurs dégagés, souvent avec des Frelons ou des Lucioles.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu"
    ],
    "armor": "Sans plaques",
    "hp": "110",
    "xp": 100,
    "loot": [
      [
        "wasp_driver",
        "Pilote de Guêpe"
      ],
      [
        "light_ammo",
        "Munitions légères"
      ],
      [
        "simple_gun_parts",
        "Pièces de pistolet simples"
      ],
      [
        "arc_synthetic_resin",
        "Résine synthétique ARC"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Wasp",
        "https://arcraiders.wiki/wiki/Wasp"
      ],
      [
        "RaidTheory · Cartes de présence",
        "https://github.com/RaidTheory/arcraiders-data/blob/main/bots.json"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/1/17/ARC_Wasp.png",
    "engagement": {
      "target": "Les rotors extérieurs",
      "signal": "Quand la Guêpe se stabilise",
      "weapons": [
        [
          "kettle",
          "À courte ou moyenne distance, le tir semi-automatique permet de reprendre le même rotor après chaque impact."
        ],
        [
          "renegade",
          "Depuis un toit, le fusil à levier permet de détacher les tirs sur un rotor pendant le vol stationnaire."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Provoquer la chute",
        "title": "Profite du vol stationnaire",
        "action": "Le laser devient rouge et la Guêpe suspend son déplacement. Enchaîne les tirs dans le même rotor puis change de rotor quand il casse.",
        "limit": "Le choc contre le décor peut achever le drone. Vérifie sa destruction avant de passer au suivant.",
        "refs": [
          "wasp"
        ],
        "gear": "kettle"
      },
      {
        "effect": "Isoler une cible",
        "title": "Sépare la Guêpe de l’essaim",
        "action": "Si plusieurs drones arrivent, lance un leurre à l’écart de ta sortie. Utilise le répit pour reprendre un angle couvert sur une seule Guêpe.",
        "limit": "Le leurre détourne temporairement l’attention. Les dégâts viennent ensuite de tes tirs sur les rotors.",
        "refs": [
          "wasp"
        ],
        "gear": "lure_grenade"
      }
    ]
  },
  {
    "id": "hornet",
    "name": "Frelon",
    "en": "Hornet",
    "aliases": [],
    "family": "Drones",
    "role": "Tir paralysant",
    "image": "assets/bestiary/hornet.webp",
    "behavior": "Son tir unique étourdit et entame le bouclier. Le laser rouge annonce le départ du projectile.",
    "weak": "Les deux propulseurs avant sont protégés. Ceux de l’arrière sont exposés.",
    "opening": "Au passage du drone devant ton partenaire, son arrière devient accessible.",
    "tactic": "L’un garde un abri face au laser pendant que l’autre vise les propulseurs arrière. Une esquive latérale bien calée évite le projectile lent.",
    "zone": "Patrouilles extérieures, notamment en escorte d’autres ARC volants.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu"
    ],
    "armor": "Léger",
    "hp": "200",
    "xp": 150,
    "loot": [
      [
        "hornet_driver",
        "Pilote de Frelon"
      ],
      [
        "medium_ammo",
        "Munitions moyennes"
      ],
      [
        "simple_gun_parts",
        "Pièces de pistolet simples"
      ],
      [
        "arc_performance_steel",
        "Acier de performance ARC"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "arc_synthetic_resin",
        "Résine synthétique ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Hornet",
        "https://arcraiders.wiki/wiki/Hornet"
      ],
      [
        "RaidTheory · Cartes de présence",
        "https://github.com/RaidTheory/arcraiders-data/blob/main/bots.json"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/f/f7/ARC_Hornet.png",
    "engagement": {
      "target": "Les propulseurs arrière",
      "signal": "Quand le Frelon dépasse sa cible",
      "weapons": [
        [
          "rattler",
          "Une rafale dans le propulseur arrière profite de sa face exposée. Recharge derrière un obstacle avant le prochain passage."
        ],
        [
          "anvil",
          "Si le drone ne présente que l’avant, ses munitions lourdes permettent de travailler la protection d’un propulseur."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Contourner le blindage",
        "title": "Laisse-le passer de profil",
        "action": "Les rotors arrière sont nus. Sors sur le côté lorsque le Frelon pointe son laser vers ton partenaire et concentre les tirs sur ces rotors.",
        "limit": "Si le laser se tourne vers toi, casse la ligne de tir avant la décharge électrique.",
        "refs": [
          "hornet"
        ],
        "gear": "rattler"
      },
      {
        "effect": "Percer une plaque",
        "title": "Travaille le même rotor de face",
        "action": "Coincé dans un passage frontal, tire des cartouches moyennes ou lourdes dans la protection d’un propulseur avant, puis sur la pièce dégagée.",
        "limit": "Avec des balles légères, retrouve plutôt l’angle arrière. Un propulseur cassé rend le vol irrégulier.",
        "refs": [
          "hornet"
        ],
        "gear": "ferro"
      }
    ]
  },
  {
    "id": "pop",
    "name": "Pop",
    "en": "Pop",
    "aliases": [],
    "family": "Terrestres",
    "role": "Bombe roulante",
    "image": "assets/bestiary/pop.webp",
    "behavior": "Il fonce au sol et accélère ses bips avant d’exploser à courte portée.",
    "weak": "La coque est dépourvue de blindage. Tout le corps est une cible.",
    "opening": "Intercepte-le à l’ouverture d’une porte, avant la phase de détonation.",
    "tactic": "Prends de la hauteur ou change de côté du couvert. Une arme rapide permet de l’intercepter sans consacrer une munition lourde à ce petit ARC.",
    "zone": "Grandes installations intérieures, souvent près des Bolides.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu",
      "Stella Montis"
    ],
    "armor": "Sans plaques",
    "hp": "20",
    "xp": 50,
    "loot": [
      [
        "pop_trigger",
        "Détonateur de Pop"
      ],
      [
        "arc_coolant",
        "Liquide de refroidissement ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ],
      [
        "crude_explosives",
        "Explosifs rudimentaires"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Pop",
        "https://arcraiders.wiki/wiki/Pop"
      ],
      [
        "RaidTheory · Cartes de présence",
        "https://github.com/RaidTheory/arcraiders-data/blob/main/bots.json"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/f/ff/ARC_Pop.png",
    "engagement": {
      "target": "Le corps entier",
      "signal": "Avant l’accélération des bips",
      "weapons": [
        [
          "stitcher",
          "L’arme automatique permet de suivre la boule qui roule sans chercher une petite pièce. Ouvre le feu avant qu’elle arrive à tes pieds."
        ],
        [
          "kettle",
          "Devant une porte, quelques tirs semi-automatiques permettent de corriger rapidement la visée à mesure que le Pop se rapproche."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Détruire avant explosion",
        "title": "Commence au premier bip",
        "action": "Prends la boule entière en joue dès son entrée dans le passage. Un tir rapide aide à corriger la visée pendant qu’elle accélère droit sur toi.",
        "limit": "Plus les bips se rapprochent, moins tu peux rester dans l’axe. Regarde aussi si un deuxième Pop suit.",
        "refs": [
          "pop",
          "GS"
        ],
        "gear": "stitcher"
      },
      {
        "effect": "Provoquer la détonation",
        "title": "Traverse avant l’explosion",
        "action": "Sans munitions prêtes, le wiki décrit un sprint lancé au-delà du Pop pour déclencher sa charge puis sortir du souffle. Il faut une issue libre de l’autre côté.",
        "limit": "Cette solution sert à survivre. Un couloir bouché ou un deuxième Pop peut couper ta course.",
        "refs": [
          "pop"
        ],
        "gear": ""
      }
    ]
  },
  {
    "id": "fireball",
    "name": "Bolide",
    "en": "Fireball",
    "aliases": [
      "Boule de feu"
    ],
    "family": "Terrestres",
    "role": "Lance-flammes",
    "image": "assets/bestiary/fireball.webp",
    "behavior": "Cette sphère roule jusqu’à portée puis ouvre sa carapace pour projeter du feu.",
    "weak": "Le noyau central apparaît derrière les panneaux avant. La coque fermée est blindée.",
    "opening": "Attends l’ouverture, tire dans le noyau puis recule hors de la zone en feu.",
    "tactic": "Garde une sortie latérale. Si tu entres dans le métro, cherche d’abord le reflet de sa coque dans le couloir.",
    "zone": "Ville enfouie, entrées du métro. Portail bleu, grand bunker souterrain au nord-est.",
    "maps": [
      "Ville enfouie",
      "Portail bleu"
    ],
    "armor": "Lourd",
    "hp": "20",
    "xp": 100,
    "loot": [
      [
        "fireball_burner",
        "Brûleur de Bolide"
      ],
      [
        "crude_explosives",
        "Explosifs rudimentaires"
      ],
      [
        "arc_coolant",
        "Liquide de refroidissement ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Fireball",
        "https://arcraiders.wiki/wiki/Fireball"
      ],
      [
        "RaidTheory · Cartes de présence",
        "https://github.com/RaidTheory/arcraiders-data/blob/main/bots.json"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/2/26/ARC_Fireball.png",
    "engagement": {
      "target": "Le cœur derrière la trappe",
      "signal": "À l’ouverture des plaques",
      "weapons": [
        [
          "kettle",
          "Les balles légères atteignent le cœur découvert. Garde le viseur au centre de la trappe et relâche si elle se referme."
        ],
        [
          "anvil",
          "Le wiki cite ce revolver lourd pour traverser la coque quand attendre l’ouverture expose au lance-flammes."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Atteindre le cœur",
        "title": "Retarde le premier tir léger",
        "action": "Attends que les panneaux avant s’ouvrent pour le lance-flammes. Les armes légères atteignent alors le noyau sans traverser la coque.",
        "limit": "Garde tes distances. Même détruit, le Bolide incendie le sol autour de lui.",
        "refs": [
          "fireball"
        ],
        "gear": "kettle"
      },
      {
        "effect": "Percer la coque",
        "title": "Intercepte-le avec un Ferro",
        "action": "Si le Bolide bloque une porte avant de s’ouvrir, le wiki cite le Ferro et l’Enclume pour traverser la coque. Recule d’un angle pendant la recharge.",
        "limit": "Le Ferro recharge après chaque tir. Garde un repli si la première balle ne suffit pas.",
        "refs": [
          "fireball"
        ],
        "gear": "ferro"
      }
    ]
  },
  {
    "id": "tick",
    "name": "Tique",
    "en": "Tick",
    "aliases": [],
    "family": "Terrestres",
    "role": "Parasite",
    "image": "assets/bestiary/tick.webp",
    "behavior": "Tapie dans les charpentes ou au plafond, elle bondit sur la tête d’un Raider et draine son bouclier et ses PV.",
    "weak": "Petit corps sans protection. Une frappe avec l’outil de Raider suffit selon le wiki.",
    "opening": "Repère le raclement avant le saut ou frappe quand elle s’éloigne après avoir été décrochée.",
    "tactic": "Si elle s’agrippe, maintiens la commande d’interaction. Fais surveiller le sol par ton partenaire pour éviter qu’elle ne saute à nouveau.",
    "zone": "Intérieurs, plafonds et poutres au-dessus des passages.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu",
      "Stella Montis"
    ],
    "armor": "Sans plaques",
    "hp": "10",
    "xp": 50,
    "loot": [
      [
        "tick_pod",
        "Nacelle de Tique"
      ],
      [
        "arc_flex_rubber",
        "Caoutchouc flexible ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Tick",
        "https://arcraiders.wiki/wiki/Tick"
      ],
      [
        "RaidTheory · Cartes de présence",
        "https://github.com/RaidTheory/arcraiders-data/blob/main/bots.json"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/1/17/ARC_Tick.png",
    "engagement": {
      "target": "La Tique au sol",
      "signal": "Après l’avoir décrochée",
      "weapons": [
        [
          "stitcher",
          "En dehors de la portée de ton outil, une courte rafale suit sa fuite au sol. À tes pieds, une frappe à l’outil économise les munitions."
        ],
        [
          "kettle",
          "Si tu la repères au plafond, saisis l’occasion de tirer sur le corps sans couverture avant le saut."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Achever au contact",
        "title": "Frappe à la retombée",
        "action": "Écoute le raclement, surveille les poutres puis la réception. À portée, le wiki rapporte qu’une frappe d’outil de Raider détruit la Tique.",
        "limit": "Si elle est déjà accrochée à ton visage, il faut d’abord la décrocher.",
        "refs": [
          "tick"
        ],
        "gear": ""
      },
      {
        "effect": "Libérer puis achever",
        "title": "Maintiens l’interaction",
        "action": "Lorsqu’elle s’accroche, maintiens la touche d’interaction. À la chute, suis-la du regard et frappe pendant qu’elle s’enfuit au sol.",
        "limit": "Elle peut bondir de nouveau. Sors l’arme si elle est hors de portée de ton outil.",
        "refs": [
          "tick"
        ],
        "gear": "kettle"
      }
    ]
  },
  {
    "id": "turret",
    "name": "Tourelle",
    "en": "Turret",
    "aliases": [],
    "family": "Tourelles",
    "role": "Défense intérieure",
    "image": "assets/bestiary/turret.webp",
    "behavior": "Un faisceau mobile balaie la pièce. La tourelle suit une cible et continue brièvement de tirer sur sa dernière position connue.",
    "weak": "Arme montée sur pivot, sans plaques. Le corps prend les tirs d’armes ordinaires.",
    "opening": "Après avoir cassé la ligne de vue, change d’angle pendant qu’elle arrose encore le premier couvert.",
    "tactic": "Identifie le balayage avant d’ouvrir la porte. Décale à deux angles si le même abri reste pris sous le feu.",
    "zone": "Fixée à la structure des bâtiments. Les postes varient selon la carte.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu",
      "Stella Montis"
    ],
    "armor": "Sans plaques",
    "hp": "80",
    "xp": 100,
    "loot": [
      [
        "simple_gun_parts",
        "Pièces de pistolet simples"
      ],
      [
        "light_ammo",
        "Munitions légères"
      ],
      [
        "arc_synthetic_resin",
        "Résine synthétique ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Turret",
        "https://arcraiders.wiki/wiki/Turret"
      ],
      [
        "RaidTheory · Cartes de présence",
        "https://github.com/RaidTheory/arcraiders-data/blob/main/bots.json"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/c/c1/ARC_Turret.png",
    "engagement": {
      "target": "Le corps sur son pivot",
      "signal": "Quand elle arrose l’ancien angle",
      "weapons": [
        [
          "kettle",
          "La tourelle est immobile et sans blindage. Une série de tirs légers depuis un nouvel angle suffit à exploiter ces deux caractéristiques."
        ],
        [
          "ferro",
          "Si tu disposes seulement d’une ouverture étroite, tire au coup par coup et profite du couvert pour recharger."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Détruire au tir direct",
        "title": "Utilise l’angle mort du balayage",
        "action": "Avant son verrouillage, aligne le corps depuis le côté ou l’arrière. Une arme courante suffit contre cette tourelle sans plaque.",
        "limit": "Si elle te repère, la rafale est continue. Évite de finir ton chargeur devant le canon.",
        "refs": [
          "turret",
          "GS"
        ],
        "gear": "kettle"
      },
      {
        "effect": "Déplacer son tir",
        "title": "Ressors ailleurs",
        "action": "Passe derrière un obstacle à deux sorties. La tourelle arrose un instant ta dernière position. Reprends la visée depuis le bord opposé.",
        "limit": "Revenir trop tôt au premier bord te fait ressortir dans les balles.",
        "refs": [
          "turret"
        ],
        "gear": ""
      }
    ]
  },
  {
    "id": "rocketeer",
    "name": "Artificier",
    "en": "Rocketeer",
    "aliases": [
      "Roquetteur",
      "Lance-roquettes"
    ],
    "family": "Drones",
    "role": "Artillerie aérienne",
    "image": "assets/bestiary/rocketeer.webp",
    "behavior": "Ses quatre lasers jaunes convergent puis passent au rouge avant les missiles. Les explosions touchent aussi les bords du couvert.",
    "weak": "Deux propulseurs détruits provoquent la chute. Leur partie supérieure est accessible sans traverser la plaque.",
    "opening": "Depuis un point haut, vise la face supérieure des propulseurs. Au sol, recule avant la salve puis reprends le même angle.",
    "tactic": "Le duo choisit deux propulseurs précis. Un bâtiment massif permet d’interrompre la poursuite entre deux salves.",
    "zone": "Espaces ouverts à forte valeur. Peut aussi intervenir en renfort d’un Mouchard.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu"
    ],
    "armor": "Lourd",
    "hp": "1,100",
    "xp": 500,
    "loot": [
      [
        "rocketeer_driver",
        "Pilote d'Artificier"
      ],
      [
        "electrical_components",
        "Composants électriques"
      ],
      [
        "arc_circuitry",
        "Câblage ARC"
      ],
      [
        "heavy_gun_parts",
        "Pièces d'arme lourdes"
      ],
      [
        "launcher_ammo",
        "Munitions de lanceur"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "arc_motion_core",
        "Processeur de mobilité ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Rocketeer",
        "https://arcraiders.wiki/wiki/Rocketeer"
      ],
      [
        "RaidTheory · Cartes de présence",
        "https://github.com/RaidTheory/arcraiders-data/blob/main/bots.json"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/5/57/ARC_Rocketeer.png",
    "engagement": {
      "target": "Deux propulseurs, en priorité",
      "signal": "Entre les salves de roquettes",
      "weapons": [
        [
          "bettina",
          "Les munitions lourdes et le tir automatique aident à détacher la protection d’un même propulseur si tu combats depuis le sol."
        ],
        [
          "ferro",
          "Depuis un point haut, tu peux viser le dessus découvert, te retirer pour recharger et revenir sur le même propulseur."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Exposer un point faible",
        "title": "Retire la plaque au-dessus de l’œil",
        "action": "Le wiki décrit une plaque frontale en forme de sourcil. Fais-la céder avec une arme à forte pénétration, puis concentre une arme rapide sur la pièce découverte.",
        "limit": "Le retrait de la plaque et le tir sur la pièce sont deux étapes. Rejoins un abri dès le verrouillage des missiles.",
        "refs": [
          "rocketeer"
        ],
        "gear": "bettina"
      },
      {
        "effect": "Provoquer la chute",
        "title": "Prends deux moteurs par le dessus",
        "action": "D’un toit sécurisé, vise deux propulseurs depuis leur face supérieure sans blindage. Tu évites les tirs nécessaires pour traverser leurs plaques latérales.",
        "limit": "Deux moteurs détruits provoquent la chute. Les dégâts qui suivent dépendent de la hauteur et du point d’impact.",
        "refs": [
          "rocketeer"
        ],
        "gear": "ferro"
      }
    ]
  },
  {
    "id": "leaper",
    "name": "Bondisseur",
    "en": "Leaper",
    "aliases": [
      "Bison",
      "Sauteur"
    ],
    "family": "Terrestres",
    "role": "Assaut par bonds",
    "image": "assets/bestiary/leaper.webp",
    "behavior": "Ce quadrupède franchit de très grandes distances et déclenche une onde de choc à proximité.",
    "weak": "Les articulations jaunes et l’œil derrière ses plaques constituent des cibles documentées.",
    "opening": "Un obstacle qu’il ne peut traverser laisse voir les pattes. Tire entre deux bonds, puis réévalue sa position.",
    "tactic": "Place-toi à l’intérieur d’un passage bas. Garde une issue et traite ses escortes volantes avant de t’exposer de nouveau.",
    "zone": "Grandes surfaces ouvertes. Le wiki le signale notamment au Barrage, en Ville enfouie, au Port spatial, au Portail bleu et sur Marées déchirées.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu",
      "Marées déchirées"
    ],
    "armor": "Lourd",
    "hp": "1100",
    "xp": 500,
    "loot": [
      [
        "leaper_pulse_unit",
        "Unité à impulsion de Bondisseur"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "arc_performance_steel",
        "Acier de performance ARC"
      ],
      [
        "explosive_compound",
        "Composé explosif"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "mechanical_components",
        "Composants mécaniques"
      ],
      [
        "arc_flex_rubber",
        "Caoutchouc flexible ARC"
      ],
      [
        "arc_motion_core",
        "Processeur de mobilité ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Leaper",
        "https://arcraiders.wiki/wiki/Leaper"
      ],
      [
        "RaidTheory · Cartes de présence",
        "https://github.com/RaidTheory/arcraiders-data/blob/main/bots.json"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/0/06/ARC_Leaper.png",
    "engagement": {
      "target": "Une articulation jaune",
      "signal": "À la réception du saut",
      "weapons": [
        [
          "bettina",
          "Suis une articulation par rafales courtes. Les cartouches lourdes restent utiles si une plaque masque le genou pendant la rotation."
        ],
        [
          "anvil",
          "Un tir lourd à chaque réception permet de revenir vite à l’abri si les bonds empêchent un suivi continu."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Dégâts de brûlure",
        "title": "Espace les grenades flamboyantes",
        "action": "À la réception du bond, colle la première grenade sur la machine. Attends la fin des flammes pour appliquer la suivante, puis vise la partie dégagée.",
        "limit": "Un lancer qui brûle le sol perd de son intérêt si le Bondisseur saute. La vidéo précède la version 2.0.",
        "refs": [
          "WL",
          "leaper"
        ],
        "gear": "blaze_grenade"
      },
      {
        "effect": "Réduire la mobilité",
        "title": "Donne le même genou au duo",
        "action": "Désigne une patte avant d’engager. Après chaque réception, les deux tireurs reprennent l’articulation. Quand elle cède, reporte le tir vers le visage si l’angle s’ouvre.",
        "limit": "Une patte abîmée réduit sa mobilité sans supprimer le risque d’écrasement. Repars avant le bond suivant.",
        "refs": [
          "GS",
          "leaper"
        ],
        "gear": "ferro"
      }
    ]
  },
  {
    "id": "bastion",
    "name": "Bastion",
    "en": "Bastion",
    "aliases": [],
    "family": "Terrestres",
    "role": "Mitrailleuse lourde",
    "image": "assets/bestiary/bastion.webp",
    "behavior": "Un cri mécanique précède sa rafale de mitrailleuse vers la dernière position repérée.",
    "weak": "Les articulations jaunes l’étourdissent lorsqu’elles cèdent. Détruire le cylindre jaune arrière dévoile un point faible plus grand.",
    "opening": "Prends son flanc pendant qu’il engage ton partenaire derrière un couvert solide.",
    "tactic": "Désignez le même cylindre. Quand sa plaque arrière s’ouvre, transférez les tirs sur la pièce exposée au lieu de continuer sur le blindage.",
    "zone": "Ville enfouie, parc Marano et ruines du marché. Stella Montis, bas du Loading Bay. Pendola, sous l’observatoire Cielo Sereno.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu",
      "Stella Montis",
      "Col de Pendola"
    ],
    "armor": "Lourd",
    "hp": "2,050",
    "xp": 500,
    "loot": [
      [
        "bastion_cell",
        "Cellule de Bastion"
      ],
      [
        "medium_ammo",
        "Munitions moyennes"
      ],
      [
        "arc_circuitry",
        "Câblage ARC"
      ],
      [
        "arc_performance_steel",
        "Acier de performance ARC"
      ],
      [
        "heavy_gun_parts",
        "Pièces d'arme lourdes"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "mechanical_components",
        "Composants mécaniques"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "arc_flex_rubber",
        "Caoutchouc flexible ARC"
      ],
      [
        "arc_motion_core",
        "Processeur de mobilité ARC"
      ],
      [
        "medium_gun_parts",
        "Pièces de pistolet moyennes"
      ],
      [
        "arc_conductive_coupler",
        "Coupleur conducteur ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Bastion",
        "https://arcraiders.wiki/wiki/Bastion"
      ],
      [
        "RaidTheory · Cartes de présence",
        "https://github.com/RaidTheory/arcraiders-data/blob/main/bots.json"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/4/47/ARC_Bastion.png",
    "engagement": {
      "target": "Le genou, puis le cylindre arrière",
      "signal": "Pendant la rafale dirigée ailleurs",
      "weapons": [
        [
          "hullcracker",
          "Fais exploser le projectile directement contre la machine pour attaquer une plaque. Garde une ligne de repli pendant le réarmement."
        ],
        [
          "bettina",
          "Sur le flanc, contrôle la rafale pour garder tous les tirs sur le même genou. Change de cible quand il cède."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Exposer le point faible",
        "title": "Du genou au réservoir arrière",
        "action": "Dans sa vidéo, rl1975 brise un genou, profite du déséquilibre pour passer sur l’arrière, ouvre le réservoir puis tire dans la cavité. Décide du côté de débordement avant l’engagement.",
        "limit": "La démonstration précède Frozen Trail. La version 2.0 a changé les dégâts explosifs aux plaques et aux pièces fragiles.",
        "refs": [
          "RB",
          "bastion",
          "P"
        ],
        "gear": "hullcracker"
      },
      {
        "effect": "Ouvrir au tir lourd",
        "title": "Exploite la rafale sur ton partenaire",
        "action": "Laisse la mitrailleuse prendre le couvert de ton partenaire pour cible. Depuis le flanc, insiste sur le cylindre jaune arrière. Lorsqu’il se détache, tire dans l’ouverture.",
        "limit": "Le cylindre en place et la cavité qu’il protège sont des cibles différentes. Si le Bastion pivote, reprends le couvert.",
        "refs": [
          "bastion"
        ],
        "gear": "ferro"
      }
    ]
  },
  {
    "id": "bombardier",
    "name": "Bombardier",
    "en": "Bombardier",
    "aliases": [],
    "family": "Terrestres",
    "role": "Mortier indirect",
    "image": "assets/bestiary/bombardier.webp",
    "behavior": "Ses Observateurs désignent les cibles pour son mortier. Au contact, il dispose aussi d’une onde de choc.",
    "weak": "Articulations jaunes et réservoir jaune dorsal. Une pièce détruite interrompt brièvement la machine.",
    "opening": "Un toit solide casse le marquage et protège des obus. Sors de l’autre côté après la salve.",
    "tactic": "Occupe ou détruis les drones pour dégager une fenêtre puis attaque les articulations de côté. Les Observateurs peuvent revenir.",
    "zone": "Ville enfouie, toit du parking et parc Marano. Port spatial, tranchée. Portail bleu, tunnel routier. Marées déchirées, lit de rivière asséché.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu",
      "Marées déchirées"
    ],
    "armor": "Léger",
    "hp": "2,670",
    "xp": 500,
    "loot": [
      [
        "bombardier_cell",
        "Cellule de Bombardier"
      ],
      [
        "launcher_ammo",
        "Munitions de lanceur"
      ],
      [
        "arc_performance_steel",
        "Acier de performance ARC"
      ],
      [
        "heavy_gun_parts",
        "Pièces d'arme lourdes"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "mechanical_components",
        "Composants mécaniques"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "arc_flex_rubber",
        "Caoutchouc flexible ARC"
      ],
      [
        "arc_motion_core",
        "Processeur de mobilité ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Bombardier",
        "https://arcraiders.wiki/wiki/Bombardier"
      ],
      [
        "RaidTheory · Cartes de présence",
        "https://github.com/RaidTheory/arcraiders-data/blob/main/bots.json"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/7/76/ARC_Bombardier.png",
    "engagement": {
      "target": "Le réservoir jaune à l’arrière",
      "signal": "À la fin d’une salve d’artillerie",
      "weapons": [
        [
          "renegade",
          "Depuis un deuxième angle, sa précision facilite les tirs sur le réservoir. Évite de rester en vue du drone qui prépare le prochain marquage."
        ],
        [
          "hullcracker",
          "Si une plaque te sépare du réservoir, l’impact explosif direct permet de l’attaquer pendant que l’autre Raider occupe les drones."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Poser une charge",
        "title": "Approche pendant une diversion",
        "action": "Even-Recipe7769 décrit la pose d’une mine pendant que son allié attire le Bombardier depuis un autre angle. Le wiki situe la pose près du réservoir arrière. Repars avant l’explosion.",
        "limit": "Le marquage des Observateurs peut ruiner l’approche. Le résultat dépend de la pose et de la version du jeu.",
        "refs": [
          "RD",
          "bombardier",
          "P"
        ],
        "gear": "deadline"
      },
      {
        "effect": "Exposer l’intérieur d’une patte",
        "title": "Sors juste après le mortier",
        "action": "Garde un toit entre toi et la salve. Après les impacts, tire sur un genou jaune. Lorsqu’il casse, garde cet angle pour atteindre les composants internes sans plaque.",
        "limit": "Les Observateurs peuvent revenir. Décale-toi dès qu’un nouveau faisceau te marque.",
        "refs": [
          "bombardier"
        ],
        "gear": "anvil"
      }
    ]
  },
  {
    "id": "spotter",
    "name": "Observateur",
    "en": "Spotter",
    "aliases": [],
    "family": "Drones",
    "role": "Désignation de cible",
    "image": "assets/bestiary/spotter.webp",
    "behavior": "Ce drone sans arme garde un laser sur la cible et transmet sa position au Bombardier.",
    "weak": "Propulseurs exposés et châssis léger. Il lui faut une ligne de vue continue pour marquer.",
    "opening": "Quand son faisceau suit ton partenaire, il devient plus facile à viser depuis le second angle.",
    "tactic": "Détruire les deux drones aveugle temporairement le Bombardier. Profite du répit avant leur remplacement plutôt que de les éliminer en boucle.",
    "zone": "Cherche les drones au-dessus des zones de patrouille du Bombardier.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu"
    ],
    "armor": "Sans plaques",
    "hp": "80",
    "xp": 100,
    "loot": [
      [
        "spotter_relay",
        "Relais d'Observateur"
      ],
      [
        "arc_synthetic_resin",
        "Résine synthétique ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ],
      [
        "sensors",
        "Capteurs"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Spotter",
        "https://arcraiders.wiki/wiki/Spotter"
      ],
      [
        "RaidTheory · Cartes de présence",
        "https://github.com/RaidTheory/arcraiders-data/blob/main/bots.json"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/0/02/ARC_Spotter.png",
    "engagement": {
      "target": "Les propulseurs du désignateur",
      "signal": "Pendant son marquage",
      "weapons": [
        [
          "renegade",
          "Sa précision convient au petit drone visible au-dessus du couvert. Décale-toi dès que le faisceau change de cible."
        ],
        [
          "rattler",
          "À moyenne distance, une courte rafale suit le propulseur. Recharge sous un toit avant de réapparaître."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Interrompre le marquage",
        "title": "Coupe le faisceau puis vise",
        "action": "Interpose un mur. Le drone doit retrouver sa cible. Profites-en pour sortir d’un autre angle ou laisser ton partenaire engager son châssis.",
        "limit": "Le faisceau peut aussi alerter d’autres ARC. Un obstacle sans toit laisse parfois arriver les obus.",
        "refs": [
          "spotter"
        ],
        "gear": "kettle"
      },
      {
        "effect": "Aveugler le Bombardier",
        "title": "Élimine les deux Observateurs",
        "action": "Pour traverser une zone de mortier, donnez chacun la position d’un drone. Détruisez les deux puis exploitez immédiatement la perte de désignation.",
        "limit": "Les drones réapparaissent. Répéter l’opération sans avancer dépense des munitions pour un répit temporaire.",
        "refs": [
          "spotter"
        ],
        "gear": ""
      }
    ]
  },
  {
    "id": "sentinel",
    "name": "Sentinelle",
    "en": "Sentinel",
    "aliases": [],
    "family": "Tourelles",
    "role": "Tireur longue portée",
    "image": "assets/bestiary/sentinel.webp",
    "behavior": "La Sentinelle suit sa cible avec un laser et aligne plusieurs faisceaux avant son tir lourd.",
    "weak": "Le petit cylindre jaune sur le bras pivotant prend davantage de dégâts.",
    "opening": "Attends le départ du tir à couvert, puis profite de sa cadence lente pour viser le bras.",
    "tactic": "Un toit ou un parapet solide interrompt sa visée. Change de position si les faisceaux ont déjà convergé.",
    "zone": "Ville enfouie, clocher de l’hôtel de ville. Port spatial, angle est de South Trench Tower. Stella Montis, plafond de l’atrium.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu",
      "Stella Montis"
    ],
    "armor": "Léger",
    "hp": "300",
    "xp": 200,
    "loot": [
      [
        "sentinel_firing_core",
        "Noyau de tir de Sentinelle"
      ],
      [
        "heavy_ammo",
        "Munitions lourdes"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "arc_coolant",
        "Liquide de refroidissement ARC"
      ],
      [
        "medium_gun_parts",
        "Pièces de pistolet moyennes"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "simple_gun_parts",
        "Pièces de pistolet simples"
      ],
      [
        "arc_flex_rubber",
        "Caoutchouc flexible ARC"
      ],
      [
        "arc_motion_core",
        "Processeur de mobilité ARC"
      ],
      [
        "arc_synthetic_resin",
        "Résine synthétique ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Sentinel",
        "https://arcraiders.wiki/wiki/Sentinel"
      ],
      [
        "RaidTheory · Cartes de présence",
        "https://github.com/RaidTheory/arcraiders-data/blob/main/bots.json"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/f/f1/ARC_Sentinel.png",
    "engagement": {
      "target": "Le vérin jaune sous le canon",
      "signal": "Juste après son tir",
      "weapons": [
        [
          "ferro",
          "Un tir lourd sur le petit cylindre, puis une recharge à couvert. Le rythme du fusil convient à celui de la tourelle."
        ],
        [
          "renegade",
          "Sa précision et sa réserve de cartouches te permettent de corriger le premier tir tant que la Sentinelle n’a pas repris sa visée."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Déclencher le tir à vide",
        "title": "Attire la visée derrière un mur",
        "action": "Laisse les faisceaux converger, puis mets le mur entre la Sentinelle et toi avant le départ du coup. Pendant son réarmement, sors pour viser le vérin jaune.",
        "limit": "Il faut un vrai couvert. La seule distance ne te protège pas de son tir de précision.",
        "refs": [
          "sentinel"
        ],
        "gear": "ferro"
      },
      {
        "effect": "Prendre le mécanisme de côté",
        "title": "Contourne le secteur balayé",
        "action": "Avant qu’elle t’accroche, Billy Givens recommande une approche arrière avec une arme lourde. Prends cet angle pour atteindre le cylindre sous la tourelle.",
        "limit": "Si le canon pivote, interromps ton approche. La prochaine ouverture après le tir est plus sûre.",
        "refs": [
          "GS",
          "sentinel"
        ],
        "gear": "anvil"
      }
    ]
  },
  {
    "id": "arc-surveyor",
    "name": "Guetteur",
    "en": "ARC Surveyor",
    "aliases": [
      "Sondeur",
      "Arpenteur"
    ],
    "family": "Terrestres",
    "role": "Prospection",
    "image": "assets/bestiary/arc-surveyor.webp",
    "behavior": "La sphère scanne le ciel au moyen d’un faisceau bleu. À l’approche d’un Raider, elle replie son antenne et roule pour fuir.",
    "weak": "Son noyau est visible sous la carapace pendant la transmission.",
    "opening": "Attends l’arrêt complet et le déploiement du faisceau avant le premier tir.",
    "tactic": "Approche par un angle masqué. Une charge paralysante conserve brièvement la fenêtre de tir avant sa fuite.",
    "zone": "Pendant Close Scrutiny, certains Guetteurs escortés par des Vaporisateurs appellent un Évaluateur.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu"
    ],
    "armor": "Lourd",
    "hp": "257",
    "xp": 200,
    "loot": [
      [
        "surveyor_vault",
        "Coffre de Guetteur"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "arc_circuitry",
        "Câblage ARC"
      ],
      [
        "sensors",
        "Capteurs"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "mechanical_components",
        "Composants mécaniques"
      ],
      [
        "arc_coolant",
        "Liquide de refroidissement ARC"
      ],
      [
        "arc_motion_core",
        "Processeur de mobilité ARC"
      ],
      [
        "arc_performance_steel",
        "Acier de performance ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · ARC Surveyor",
        "https://arcraiders.wiki/wiki/ARC_Surveyor"
      ],
      [
        "RaidTheory · Cartes de présence",
        "https://github.com/RaidTheory/arcraiders-data/blob/main/bots.json"
      ],
      [
        "Wiki · Opération Close Scrutiny",
        "https://arcraiders.wiki/wiki/Close_Scrutiny"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/c/c3/ARC_Surveyor.png",
    "engagement": {
      "target": "Le noyau sous la carapace",
      "signal": "Pendant la transmission",
      "weapons": [
        [
          "bettina",
          "Commence par une rafale sur le noyau immobile. Si le Guetteur s’enroule pour fuir, les munitions lourdes restent utiles pour déloger ses plaques."
        ],
        [
          "anvil",
          "Un barillet prêt permet d’enchaîner des coups lourds avant que la carapace se referme. Laisse ton partenaire déclencher l’étourdissement."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Immobiliser le noyau exposé",
        "title": "Étourdis pendant le faisceau",
        "action": "Prépare une Soufflante ou un pilote de Frelon. Attends le faisceau vertical, étourdis le Guetteur déjà ouvert, puis tire sur le noyau avant la fermeture de la coque.",
        "limit": "Un premier tir prématuré peut le faire fuir. Prépare ton chargeur avant de révéler ta position.",
        "refs": [
          "arc-surveyor",
          "MIX"
        ],
        "gear": "hornet_driver"
      },
      {
        "effect": "Retirer une plaque",
        "title": "Garde un seul panneau en joue",
        "action": "Sans étourdissement, tire au lourd pendant la transmission. S’il s’enroule, concentre les tirs sur un panneau pour le détacher. Une plaque tombée peut être fouillée séparément.",
        "limit": "Une plaque au sol ne prouve pas la destruction du Guetteur. Il peut encore fuir à grande vitesse.",
        "refs": [
          "arc-surveyor"
        ],
        "gear": "ferro"
      }
    ]
  },
  {
    "id": "queen",
    "name": "Reine",
    "en": "Queen",
    "aliases": [],
    "family": "Colosses",
    "role": "Gardienne du Moissonneur",
    "image": "assets/bestiary/queen.webp",
    "behavior": "Mortiers, laser incendiaire et attaques à courte portée protègent le Moissonneur. Elle peut aussi électrifier son intérieur.",
    "weak": "Le noyau rouge est protégé par des plaques. Les articulations jaunes des pattes sont des cibles secondaires.",
    "opening": "Retire une plaque depuis un couvert, puis concentre les tirs sur la section exposée.",
    "tactic": "Garde plusieurs positions de repli hors des traces enflammées. Pour la récupération, marque les pattes détachées. Depuis Frozen Trail, les meilleures pièces y sont concentrées.",
    "zone": "Autour du Moissonneur uniquement pendant sa condition, sur les trois cartes signalées.",
    "maps": [
      "Champ de bataille du Barrage",
      "Port spatial",
      "Portail bleu"
    ],
    "armor": "Lourd",
    "hp": "≈ 23000",
    "xp": 1000,
    "loot": [
      [
        "queen_reactor",
        "Réacteur de Reine"
      ],
      [
        "advanced_electrical_components",
        "Composants électriques avancés"
      ],
      [
        "advanced_mechanical_components",
        "Composants mécaniques avancés"
      ],
      [
        "complex_gun_parts",
        "Pièces d'arme complexes"
      ],
      [
        "magnetic_accelerator",
        "Accélérateur magnétique"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "arc_circuitry",
        "Câblage ARC"
      ],
      [
        "arc_coolant",
        "Liquide de refroidissement ARC"
      ],
      [
        "arc_flex_rubber",
        "Caoutchouc flexible ARC"
      ],
      [
        "arc_motion_core",
        "Processeur de mobilité ARC"
      ],
      [
        "arc_performance_steel",
        "Acier de performance ARC"
      ],
      [
        "arc_synthetic_resin",
        "Résine synthétique ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Queen",
        "https://arcraiders.wiki/wiki/Queen"
      ],
      [
        "Wiki · Condition Moissonneur",
        "https://arcraiders.wiki/wiki/Harvester"
      ],
      [
        "Embark · Frozen Trail 2.0",
        "https://arcraiders.com/news/frozen-trail-2-0-update"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/1/1d/ARC_Queen.png",
    "engagement": {
      "target": "Une plaque, puis le noyau rouge",
      "signal": "Dès que la plaque se détache",
      "weapons": [
        [
          "hullcracker",
          "Réserve les projectiles explosifs à la plaque choisie avec ton partenaire. Les munitions du lanceur détonent au contact d’un ARC."
        ],
        [
          "equalizer",
          "Dès que le noyau apparaît, le faisceau permet d’y concentrer le tir tant que la Reine vise ailleurs. Garde un couvert à un pas."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Exposer le noyau",
        "title": "Ouvre une seule plaque",
        "action": "Choisis une plaque qui protège le cœur. Indique-la au groupe et concentre les tirs à cet endroit depuis un abri. Au changement de silhouette, passe au noyau visible.",
        "limit": "Depuis Frozen Trail, les réacteurs liés aux pattes se récupèrent sur les pattes entières détachées. Une plaque seule ne donne plus cette récompense.",
        "refs": [
          "queen",
          "QR",
          "P"
        ],
        "gear": "bettina"
      },
      {
        "effect": "Attaquer au contact",
        "title": "L’abordage d’Irex8",
        "action": "Irex8 décrit un abordage au Mousqueton, l’ouverture de la protection du cœur à l’Égaliseur et la pose de mines sur la partie exposée. Prévois ta descente avant la pose.",
        "limit": "Ce témoignage précède la 2.0. Le Mousqueton a perdu de la portée depuis, les explosifs ont changé et la Reine peut frapper à courte distance.",
        "refs": [
          "QR",
          "queen",
          "P"
        ],
        "gear": "snap_hook"
      }
    ]
  },
  {
    "id": "matriarch",
    "name": "Matriarche",
    "en": "Matriarch",
    "aliases": [],
    "family": "Colosses",
    "role": "Commandement",
    "image": "assets/bestiary/matriarch.webp",
    "behavior": "Missiles guidés, gaz, flashs, appels de renforts et champ d’énergie couvrent son approche.",
    "weak": "Le noyau est derrière les plaques faciales. Les articulations de pattes constituent d’autres ouvertures.",
    "opening": "Attends une interruption du bouclier et concentre les tirs sur une plaque déjà entamée.",
    "tactic": "Répartissez surveillance des renforts et tir sur le noyau. Depuis Frozen Trail, les pièces de pattes contiennent le meilleur butin de ce démembrement.",
    "zone": "Pendant la condition Matriarche au Barrage, au Port spatial ou au Portail bleu.",
    "maps": [
      "Champ de bataille du Barrage",
      "Port spatial",
      "Portail bleu"
    ],
    "armor": "Lourd",
    "hp": "≈ 23000",
    "xp": 1000,
    "loot": [
      [
        "matriarch_reactor",
        "Réacteur de Matriarche"
      ],
      [
        "advanced_electrical_components",
        "Composants électriques avancés"
      ],
      [
        "advanced_mechanical_components",
        "Composants mécaniques avancés"
      ],
      [
        "complex_gun_parts",
        "Pièces d'arme complexes"
      ],
      [
        "magnetic_accelerator",
        "Accélérateur magnétique"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "arc_circuitry",
        "Câblage ARC"
      ],
      [
        "arc_coolant",
        "Liquide de refroidissement ARC"
      ],
      [
        "arc_flex_rubber",
        "Caoutchouc flexible ARC"
      ],
      [
        "arc_motion_core",
        "Processeur de mobilité ARC"
      ],
      [
        "arc_performance_steel",
        "Acier de performance ARC"
      ],
      [
        "arc_synthetic_resin",
        "Résine synthétique ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ],
      [
        "arc_insulated_coupler",
        "Coupleur isolé ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Matriarch",
        "https://arcraiders.wiki/wiki/Matriarch"
      ],
      [
        "Wiki · Condition Matriarche",
        "https://arcraiders.wiki/wiki/Matriarch_(map_condition)"
      ],
      [
        "Embark · Frozen Trail 2.0",
        "https://arcraiders.com/news/frozen-trail-2-0-update"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/4/49/ARC_Matriarch.png",
    "engagement": {
      "target": "La plaque du visage, puis le noyau",
      "signal": "Quand le bouclier disparaît",
      "weapons": [
        [
          "jupiter",
          "Sa forte pénétration convient à la plaque du visage. Tire depuis ton couvert et profite du réarmement pour vérifier la réaction du boss."
        ],
        [
          "bettina",
          "Avec une ligne de tir plus courte, ses cartouches lourdes permettent de concentrer une rafale sur la même plaque puis sur le noyau."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Exposer le noyau",
        "title": "Entame une seule plaque faciale",
        "action": "Depuis un couvert haut ou une structure solide, tire sur la même plaque du visage. Quand le noyau rouge apparaît, déplace ton point d’impact sur lui.",
        "limit": "Arrête le feu à la montée du champ. Les tirs depuis l’extérieur sont bloqués jusqu’à sa disparition.",
        "refs": [
          "matriarch"
        ],
        "gear": "ferro"
      },
      {
        "effect": "Tirer depuis l’intérieur du champ",
        "title": "Traverse le bouclier si le cœur est accessible",
        "action": "Le wiki rapporte que les tirs partis de l’intérieur du champ atteignent la Matriarche. Si les renforts sont occupés et le cœur visible, traverse la limite du bouclier et tire depuis cet angle.",
        "limit": "À cette distance, les attaques et les renforts deviennent plus dangereux. Sans passage sûr, recharge à couvert et reprends le tir de l’extérieur à la disparition du champ.",
        "refs": [
          "matriarch"
        ],
        "gear": ""
      }
    ]
  },
  {
    "id": "shredder",
    "name": "Déchiqueteuse",
    "en": "Shredder",
    "aliases": [
      "Broyeur",
      "Déchiqueteur"
    ],
    "family": "Terrestres",
    "role": "Défense rapprochée",
    "image": "assets/bestiary/shredder.webp",
    "behavior": "Elle flotte près du sol, poursuit les Raiders et projette des éclats tout autour d’elle après une charge audible.",
    "weak": "Les jets bleus des propulseurs sous son corps sont des points vulnérables.",
    "opening": "Un angle de mur absorbe la salve. Reprends la ligne de tir pendant sa récupération.",
    "tactic": "Guide-la vers une porte couverte par une mine à secousse. Pendant l’étourdissement, vise les propulseurs.",
    "zone": "Couloirs de Stella Montis. Flashpoint l’a étendue aux autres cartes de l’époque, avec des conditions particulières au Barrage.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu",
      "Stella Montis"
    ],
    "armor": "Lourd",
    "hp": "385",
    "xp": 200,
    "loot": [
      [
        "shredder_gyro",
        "Gyroscope de Déchiqueteuse"
      ],
      [
        "mechanical_components",
        "Composants mécaniques"
      ],
      [
        "simple_gun_parts",
        "Pièces de pistolet simples"
      ],
      [
        "arc_synthetic_resin",
        "Résine synthétique ARC"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "shotgun_ammo",
        "Cartouches de pompe"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ],
      [
        "arc_data_module",
        "Module de données ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Shredder",
        "https://arcraiders.wiki/wiki/Shredder"
      ],
      [
        "Embark · Mise à jour 1.22",
        "https://arcraiders.com/news/patch-notes-1-22-0"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/e/e3/ARC_Shredder.png",
    "engagement": {
      "target": "Les jets bleus sous le corps",
      "signal": "Après la salve de shrapnel",
      "weapons": [
        [
          "anvil",
          "Sa frappe lourde convient aux brèves sorties d’angle. Replie-toi dès que la machine recommence à charger."
        ],
        [
          "rattler",
          "Suis le propulseur en rafale quand la Déchiqueteuse passe devant l’encadrement. Termine la recharge à couvert."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Immobiliser",
        "title": "Piège le seuil d’une porte",
        "action": "Place une mine étourdissante sur son passage, près de ton couvert. Quand la Déchiqueteuse franchit le seuil et s’arrête, tire sur les jets bleus sous le corps.",
        "limit": "La mine crée une courte immobilisation. Trouve l’angle sur les jets avant de l’attirer.",
        "refs": [
          "shredder"
        ],
        "gear": "jolt_mine"
      },
      {
        "effect": "Toucher les propulseurs",
        "title": "Fais absorber la salve par le mur",
        "action": "Laisse-la approcher d’un angle plein. Tiens-toi derrière le mur pendant la charge, puis ressors à la fin de la projection et vise sous le châssis.",
        "limit": "Le shrapnel peut toucher plusieurs Raiders. Laisse au duo un deuxième passage pour sortir.",
        "refs": [
          "shredder"
        ],
        "gear": "anvil"
      }
    ]
  },
  {
    "id": "comet",
    "name": "Comète",
    "en": "Comet",
    "aliases": [],
    "family": "Terrestres",
    "role": "Charge explosive",
    "image": "assets/bestiary/comet.webp",
    "behavior": "Elle recherche le centre d’un groupe et déclenche une explosion sismique quand elle est à portée.",
    "weak": "Le blindage s’entrouvre pendant la charge et laisse apparaître un point faible frontal.",
    "opening": "Attire-la de loin et attends l’ouverture. Une arme automatique permet de placer plusieurs coups dans ce court intervalle.",
    "tactic": "Espacez-vous dès le premier contact. La détruire avant son explosion préserve la possibilité de récupérer son allumeur.",
    "zone": "Signalée en Ville enfouie et au Portail bleu. Retirée des sessions standard du Barrage en 1.26.",
    "maps": [
      "Ville enfouie",
      "Portail bleu"
    ],
    "armor": "Lourd",
    "hp": "150",
    "xp": 100,
    "loot": [
      [
        "comet_igniter",
        "Allumeur de Comète"
      ],
      [
        "crude_explosives",
        "Explosifs rudimentaires"
      ],
      [
        "arc_coolant",
        "Liquide de refroidissement ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "explosive_compound",
        "Composé explosif"
      ]
    ],
    "sources": [
      [
        "Wiki · Comet",
        "https://arcraiders.wiki/wiki/Comet"
      ],
      [
        "Embark · Combattre la Luciole et la Comète",
        "https://arcraiders.com/news/firefly-comet-tips-and-tricks"
      ],
      [
        "Embark · Riven Tides 1.26",
        "https://arcraiders.com/news/riven-tides-patch-notes-1-26-0"
      ],
      [
        "Embark · Mise à jour 1.22",
        "https://arcraiders.com/news/patch-notes-1-22-0"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/c/cc/ARC_Comet.png",
    "engagement": {
      "target": "L’ouverture frontale",
      "signal": "À distance, quand la coque s’écarte",
      "weapons": [
        [
          "rattler",
          "Embark conseille un automatique pour exploiter le bref passage du cœur à découvert. À moyenne distance, cette rafale permet encore de te replier."
        ],
        [
          "stitcher",
          "Dans un passage étroit, son débit aide à suivre l’ouverture. Prépare la ligne de fuite avant le premier tir."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Toucher le cœur",
        "title": "Ouvre à distance et suis la fente",
        "action": "David et Oskar, chez Embark, recommandent de déclencher la charge de loin et d’utiliser un automatique. Suis l’entrebâillement frontal avant l’autodestruction.",
        "limit": "Embark conseille d’espacer les joueurs. Une Comète qui explose d’elle-même peut aussi endommager son allumeur.",
        "refs": [
          "EC",
          "comet"
        ],
        "gear": "rattler"
      },
      {
        "effect": "Retirer une plaque",
        "title": "Découvre un flanc",
        "action": "Victor, programmeur chez Embark, conseille de détacher les plaques latérales. Concentre les tirs sur un seul côté si la fente frontale est masquée.",
        "limit": "Le flanc s’ouvre sous les tirs, mais la Comète avance toujours. La détonation a une large zone d’effet.",
        "refs": [
          "EV",
          "comet"
        ],
        "gear": "bettina"
      }
    ]
  },
  {
    "id": "firefly",
    "name": "Luciole",
    "en": "Firefly",
    "aliases": [],
    "family": "Drones",
    "role": "Lance-flammes aérien",
    "image": "assets/bestiary/firefly.webp",
    "behavior": "Elle se rapproche, déloge les Raiders et enflamme le sol quand elle tombe.",
    "weak": "Quand elle déploie son arme, un réservoir jaune sans protection apparaît. Les propulseurs sont protégés.",
    "opening": "Vise le réservoir dès la mise en batterie sans rester dans l’axe de son jet.",
    "tactic": "Privilégie un vrai intérieur si tu dois rompre le combat. Un simple angle en extérieur la laisse te contourner par le haut.",
    "zone": "Patrouilles avec Guêpes et Frelons, notamment au Barrage où sa présence a été réduite. Défend aussi la Frégate.",
    "maps": [
      "Champ de bataille du Barrage"
    ],
    "armor": "Lourd",
    "hp": "200",
    "xp": 150,
    "loot": [
      [
        "firefly_burner",
        "Brûleur de Luciole"
      ],
      [
        "arc_performance_steel",
        "Acier de performance ARC"
      ],
      [
        "simple_gun_parts",
        "Pièces de pistolet simples"
      ],
      [
        "arc_coolant",
        "Liquide de refroidissement ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "chemicals",
        "Produits chimiques"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "arc_synthetic_resin",
        "Résine synthétique ARC"
      ],
      [
        "synthesized_fuel",
        "Combustible synthétisé"
      ]
    ],
    "sources": [
      [
        "Wiki · Firefly",
        "https://arcraiders.wiki/wiki/Firefly"
      ],
      [
        "Embark · Combattre la Luciole et la Comète",
        "https://arcraiders.com/news/firefly-comet-tips-and-tricks"
      ],
      [
        "Embark · Riven Tides 1.26",
        "https://arcraiders.com/news/riven-tides-patch-notes-1-26-0"
      ],
      [
        "Wiki · Opération Frégate",
        "https://arcraiders.wiki/wiki/ARC_Frigate"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/b/b8/ARC_Firefly.png",
    "engagement": {
      "target": "Le réservoir jaune",
      "signal": "Quand le lance-flammes se déploie",
      "weapons": [
        [
          "renegade",
          "Son tir précis permet de viser le petit réservoir depuis la limite d’un bâtiment, avant que la Luciole entre à portée de jet."
        ],
        [
          "rattler",
          "Pendant un passage de flanc, une rafale de munitions moyennes accompagne le réservoir. Replie-toi à l’intérieur si le drone se tourne."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Viser le réservoir",
        "title": "Attends le déploiement du brûleur",
        "action": "Alexander, programmeur chez Embark, recommande le réservoir jaune. Sa mise à découvert permet de placer des tirs ordinaires sans traverser les propulseurs blindés.",
        "limit": "Le drone laisse du feu après sa destruction. Attends la fin de l’incendie avant de ramasser le brûleur.",
        "refs": [
          "EF",
          "firefly"
        ],
        "gear": "kettle"
      },
      {
        "effect": "Créer un nouvel angle",
        "title": "Rentre pour sortir de l’axe",
        "action": "Leon conseille de gagner un véritable intérieur et Junsik propose la cape photoélectrique pour rompre le contact. Depuis l’abri, prépare le prochain tir sur le réservoir.",
        "limit": "La cape est temporaire. Dehors, la Luciole peut contourner un simple angle par le haut.",
        "refs": [
          "EF2",
          "firefly"
        ],
        "gear": "photoelectric_cloak"
      }
    ]
  },
  {
    "id": "vaporizer",
    "name": "Vaporisateur",
    "en": "Vaporizer",
    "aliases": [],
    "family": "Drones",
    "role": "Faisceau thermique",
    "image": "assets/bestiary/vaporizer.webp",
    "behavior": "Il dépose des traînées brûlantes avec son laser. Son bouclier réagit aux projectiles lancés.",
    "weak": "Un panneau rectangulaire sous le fuselage peut être arraché pour exposer le noyau. Ses propulseurs restent d’autres cibles.",
    "opening": "Provoque l’activation du bouclier avec un premier lancer puis engage quand celui-ci retombe.",
    "tactic": "Évite de gaspiller ta grenade principale sur le champ actif. Sépare tes positions de tir pour ne pas traverser la même traînée de feu.",
    "zone": "Autour des Guetteurs et de l’Évaluateur pendant Close Scrutiny. Rencontré également autour de la Frégate.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu"
    ],
    "armor": "Léger",
    "hp": "1500",
    "xp": 500,
    "loot": [
      [
        "vaporizer_regulator",
        "Régulateur de Vaporisateur"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "energy_clip",
        "Chargeur d'énergie"
      ],
      [
        "heavy_gun_parts",
        "Pièces d'arme lourdes"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "electrical_components",
        "Composants électriques"
      ],
      [
        "arc_circuitry",
        "Câblage ARC"
      ],
      [
        "arc_flex_rubber",
        "Caoutchouc flexible ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Vaporizer",
        "https://arcraiders.wiki/wiki/Vaporizer"
      ],
      [
        "Wiki · Opération Close Scrutiny",
        "https://arcraiders.wiki/wiki/Close_Scrutiny"
      ],
      [
        "Embark · Flashpoint",
        "https://arcraiders.com/fr/news/flashpoint-content-update"
      ],
      [
        "Wiki · Opération Frégate",
        "https://arcraiders.wiki/wiki/ARC_Frigate"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/0/0c/ARC_Vaporizer.png",
    "engagement": {
      "target": "Le panneau sous le fuselage",
      "signal": "À la retombée du bouclier",
      "weapons": [
        [
          "bettina",
          "Depuis un abri, les cartouches lourdes permettent d’insister sur le panneau ventral. Reprends la rafale sur le noyau lorsqu’il apparaît."
        ],
        [
          "hullcracker",
          "Quand le champ s’éteint, touche directement le panneau encore en place. Reste à l’abri pendant le cycle de la pompe."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Forcer le bouclier",
        "title": "Garde la grosse grenade en réserve",
        "action": "Le wiki décrit un bouclier réactif aux projectiles lancés. Déclenche-le avec une grenade moins précieuse, attends sa chute puis lance la suivante pendant la récupération.",
        "limit": "John Schutt rapporte des sous-munitions de Meute arrêtées par le champ. Un lancer sur le champ actif gaspille la fenêtre.",
        "refs": [
          "vaporizer",
          "VS"
        ],
        "gear": "seeker_grenade"
      },
      {
        "effect": "Exposer le noyau",
        "title": "Ouvre le panneau ventral",
        "action": "Avec une arme lourde, tire sur le petit panneau rectangulaire sous le fuselage. Une fois détaché, reprends cet angle pour atteindre le noyau sans traverser le reste du corps.",
        "limit": "Les flaques laissées par le laser brûlent après son passage. Ne poursuis pas le drone sur leur trajectoire.",
        "refs": [
          "vaporizer"
        ],
        "gear": "ferro"
      }
    ]
  },
  {
    "id": "arc-turbine",
    "name": "Turbine ARC",
    "en": "ARC Turbine",
    "aliases": [],
    "family": "Colosses",
    "role": "Foudre et mines",
    "image": "assets/bestiary/arc-turbine.webp",
    "behavior": "Elle dérive en altitude, disperse des mines puis descend. Ses missiles de foudre peuvent toujours frapper après son atterrissage.",
    "weak": "Les pièces jaunes en rotation sont visibles dans les ouvertures du train d’atterrissage.",
    "opening": "Attends qu’elle se pose puis tire à travers les ouvertures. Repère les mines avant tout déplacement.",
    "tactic": "Garde le duo à distance de la zone de pose. Un abri et une ligne de tir dégagée coûtent moins de munitions que des tirs sur la coque en vol.",
    "zone": "Marées déchirées. Des observations directes signalent aussi le Barrage et la Ville enfouie. Son passage dépend de la sortie.",
    "maps": [
      "Marées déchirées",
      "Champ de bataille du Barrage",
      "Ville enfouie"
    ],
    "armor": "Lourd",
    "hp": "≈ 4000",
    "xp": 700,
    "loot": [
      [
        "turbine_compressor",
        "Compresseur de Turbine"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "launcher_ammo",
        "Munitions de lanceur"
      ],
      [
        "medium_gun_parts",
        "Pièces de pistolet moyennes"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "arc_coolant",
        "Liquide de refroidissement ARC"
      ],
      [
        "arc_flex_rubber",
        "Caoutchouc flexible ARC"
      ],
      [
        "arc_motion_core",
        "Processeur de mobilité ARC"
      ],
      [
        "arc_performance_steel",
        "Acier de performance ARC"
      ],
      [
        "arc_synthetic_resin",
        "Résine synthétique ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · ARC Turbine",
        "https://arcraiders.wiki/wiki/ARC_Turbine"
      ],
      [
        "Observation en raid · Sean Martin",
        "https://www.pcgamer.com/games/third-person-shooter/arc-raiders-arc-turbine-location-kill/"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/3/3e/ARC_Turbine.png",
    "engagement": {
      "target": "Les pièces jaunes en rotation",
      "signal": "Une fois le train déployé",
      "weapons": [
        [
          "jupiter",
          "Le wiki rapporte l’usage de ce fusil depuis une position éloignée. Son tir précis et sa pénétration conviennent à l’ouverture étroite du train."
        ],
        [
          "renegade",
          "À l’atterrissage, sa précision facilite le tir entre les plaques. Attends que la pièce jaune revienne devant l’ouverture pour tirer."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Poser une charge",
        "title": "Place la mine à l’intérieur",
        "action": "Sean Martin décrit une pose de mine à retardement dans l’ouverture au sol. Repère un passage entre les mines avant l’atterrissage, puis dégage avant le redécollage.",
        "limit": "Ce guide précède la refonte des explosifs. Le nombre de charges dépend du placement et de la version.",
        "refs": [
          "TM",
          "arc-turbine",
          "P"
        ],
        "gear": "deadline"
      },
      {
        "effect": "Atteindre les pièces en rotation",
        "title": "Tire à travers le train déployé",
        "action": "Sans lanceur ni mine, prends un angle sur l’atterrissage. Laisse les cylindres jaunes passer devant la fente avant de tirer. Recommence à la pose suivante si nécessaire.",
        "limit": "Même au sol, la Turbine peut lancer ses charges électriques. Les tirs sur la coque en vol exposent le tireur.",
        "refs": [
          "TM",
          "arc-turbine"
        ],
        "gear": "ferro"
      }
    ]
  },
  {
    "id": "bully",
    "name": "Brute",
    "en": "Bully",
    "aliases": [
      "Bully",
      "Brute"
    ],
    "family": "Terrestres",
    "role": "Assaut de Pendola",
    "image": "assets/bestiary/bully.webp",
    "behavior": "Ce quadrupède rapide charge, tire à courte portée et projette des sous-munitions. En terrain ouvert il peut rattraper un Raider au sprint.",
    "weak": "Les articulations peuvent céder. La tête révèle des éléments jaunes lorsqu’il prépare le tir de chevrotine.",
    "opening": "La fenêtre sur la tête est brève. Décale-toi aussitôt après le tir et reprends un couvert.",
    "tactic": "Le second Raider peut viser une patte quand la Brute charge le premier. Casser une patte réduit sa mobilité et facilite les tirs suivants.",
    "zone": "Col de Pendola, notamment Piazza della Rupe, Old Town, Railyard et Frozen River.",
    "maps": [
      "Col de Pendola"
    ],
    "armor": "Lourd",
    "hp": "≈ 2000–4000",
    "xp": 500,
    "loot": [
      [
        "bully_fragmenter",
        "Fragmenteur de Brute"
      ],
      [
        "arc_motion_core",
        "Processeur de mobilité ARC"
      ],
      [
        "heavy_gun_parts",
        "Pièces d'arme lourdes"
      ],
      [
        "launcher_ammo",
        "Munitions de lanceur"
      ],
      [
        "shotgun_ammo",
        "Cartouches de pompe"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "arc_circuitry",
        "Câblage ARC"
      ],
      [
        "arc_coolant",
        "Liquide de refroidissement ARC"
      ],
      [
        "arc_flex_rubber",
        "Caoutchouc flexible ARC"
      ],
      [
        "arc_performance_steel",
        "Acier de performance ARC"
      ],
      [
        "arc_synthetic_resin",
        "Résine synthétique ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Bully",
        "https://arcraiders.wiki/wiki/Bully"
      ],
      [
        "Embark · Nouveaux ARC de Pendola",
        "https://arcraiders.com/news/frozen-trail-content-preview"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/9/97/ARC_Bully.png",
    "engagement": {
      "target": "Un genou jaune, puis la tête ouverte",
      "signal": "Quand la Brute prépare sa chevrotine",
      "weapons": [
        [
          "anvil",
          "Un tir lourd tient dans la courte ouverture de la tête. Vise d’abord le genou si tu ne peux pas sortir du cône de chevrotine."
        ],
        [
          "bettina",
          "Si ton partenaire attire sa charge, suis une seule articulation avec une courte rafale pour lui retirer de la mobilité."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Immobiliser la machine",
        "title": "Fixe-la avant de tirer au genou",
        "action": "Joel Franey décrit la Soufflante et la grenade tractrice pour obtenir quelques tirs immobiles. Tire sur une articulation jaune pendant l’arrêt pour réduire ensuite sa mobilité.",
        "limit": "L’arrêt obtenu par la grenade est temporaire. Le handicap durable demande de détruire la pièce.",
        "refs": [
          "BG",
          "bully"
        ],
        "gear": "showstopper"
      },
      {
        "effect": "Interrompre la chevrotine",
        "title": "Choisis une fenêtre haute et étroite",
        "action": "Attends que la tête s’ouvre et vise la pièce jaune dans l’axe du canon. Le guide rapporte qu’un tir puissant bien placé peut interrompre le départ du coup.",
        "limit": "Si l’angle est mauvais, replie-toi. Le genou reste moins risqué et les grenades de la Brute peuvent atteindre les hauteurs.",
        "refs": [
          "BG",
          "bully"
        ],
        "gear": "anvil"
      }
    ]
  },
  {
    "id": "skulker",
    "name": "Rôdeur",
    "en": "Skulker",
    "aliases": [
      "Skulker",
      "Traqueur"
    ],
    "family": "Terrestres",
    "role": "Embuscade",
    "image": "assets/bestiary/skulker.webp",
    "behavior": "Il flotte près du sol, attend sur le flanc et ouvre le feu avec sa tourelle de queue avant de se replacer.",
    "weak": "Les propulseurs permettent de le ralentir puis de l’immobiliser. Le désignateur recherché est dans la queue armée.",
    "opening": "Brise sa ligne de tir et vise un propulseur quand il pivote ou se décale au ras du sol.",
    "tactic": "Vérifiez vos flancs avant de vous ruer sur le premier corps. Les Rôdeurs sont fréquemment observés en groupe.",
    "zone": "Col de Pendola. Embark documente l’embuscade, mais pas de position fixe par raid.",
    "maps": [
      "Col de Pendola"
    ],
    "armor": "Léger",
    "hp": "",
    "xp": 200,
    "loot": [
      [
        "skulker_targeter",
        "Désignateur de Rôdeur"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "arc_coolant",
        "Liquide de refroidissement ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ],
      [
        "heavy_ammo",
        "Munitions lourdes"
      ],
      [
        "arc_data_module",
        "Module de données ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Skulker",
        "https://arcraiders.wiki/wiki/Skulker"
      ],
      [
        "Embark · Nouveaux ARC de Pendola",
        "https://arcraiders.com/news/frozen-trail-content-preview"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/2/2c/ARC_Skulker.png",
    "engagement": {
      "target": "Les propulseurs latéraux",
      "signal": "Quand le Rôdeur pivote",
      "weapons": [
        [
          "hullcracker",
          "Le wiki rapporte que le Rôdeur supporte mal un impact direct de ce lanceur. Choisis un angle qui t’évite d’être visé par son groupe."
        ],
        [
          "rattler",
          "Concentre les rafales sur un seul propulseur. Le premier propulseur détruit ralentit la machine et facilite le suivant."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Immobiliser",
        "title": "Détruis les propulseurs séparément",
        "action": "Suis un seul propulseur pendant son déplacement latéral. Le premier détruit ralentit le Rôdeur. Le second l’immobilise, ce qui facilite les tirs de finition.",
        "limit": "Immobilisé, il garde sa queue armée. Reste hors de l’axe du tir.",
        "refs": [
          "skulker"
        ],
        "gear": "rattler"
      },
      {
        "effect": "Toucher directement",
        "title": "Tire après avoir rompu la visée",
        "action": "Le wiki rapporte une destruction rapide au Brise-fuselage ou à la grenade traqueuse. Engage depuis un couvert après avoir localisé le reste du groupe.",
        "limit": "Embark a corrigé en 2.3 la possibilité de rester debout indéfiniment sur le Rôdeur. Un couvert fixe reste utilisable.",
        "refs": [
          "skulker",
          "P23"
        ],
        "gear": "hullcracker"
      }
    ]
  },
  {
    "id": "hydra",
    "name": "Hydre",
    "en": "Hydra",
    "aliases": [],
    "family": "Tourelles",
    "role": "Défense multidirectionnelle",
    "image": "assets/bestiary/hydra.webp",
    "behavior": "Cette tourelle sort de son logement et peut arroser trois directions. Les couloirs et les superstructures offrent des angles morts.",
    "weak": "L’arrière découvre des éléments jaunes entre les blocs de canons. L’avant est fortement protégé.",
    "opening": "Laisse finir la rafale depuis un couvert puis tire sur l’arrière pendant qu’un autre joueur dirige son attention.",
    "tactic": "N’engagez pas deux batteries à la fois. À bord de la Frégate, choisissez un couvert qui protège aussi des autres machines et du vent.",
    "zone": "Dans l’Empereur échoué à Pendola et pendant l’opération Frégate, notamment sur le pont et dans les atriums.",
    "maps": [
      "Col de Pendola",
      "Champ de bataille du Barrage",
      "Port spatial",
      "Ville enfouie",
      "Portail bleu",
      "Marées déchirées"
    ],
    "armor": "",
    "hp": "1050",
    "xp": 500,
    "loot": [
      [
        "light_ammo",
        "Munitions légères"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Hydra",
        "https://arcraiders.wiki/wiki/Hydra"
      ],
      [
        "Embark · Nouveaux ARC de Pendola",
        "https://arcraiders.com/news/frozen-trail-content-preview"
      ],
      [
        "Wiki · Opération Frégate",
        "https://arcraiders.wiki/wiki/ARC_Frigate"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/5/54/ARC_Hydra.png",
    "engagement": {
      "target": "Les pièces jaunes à l’arrière",
      "signal": "Quand l’autre Raider attire le tir",
      "weapons": [
        [
          "renegade",
          "Son tir précis convient aux pièces arrière découvertes. Prends le temps de les aligner dès que la batterie tire sur l’autre position."
        ],
        [
          "bettina",
          "De flanc, concentre les cartouches lourdes sur une seule section. Si l’Hydre pivote vers toi, reviens derrière la coque."
        ]
      ]
    },
    "methods": [
      {
        "effect": "Contourner le blindage",
        "title": "Fais pivoter ses canons",
        "action": "Un Raider attire les canons derrière un obstacle. L’autre attend que la batterie pivote puis tire dans les pièces jaunes nues de l’arrière.",
        "limit": "Sur la Frégate, elle réapparaît. Exploite le passage libéré sans attendre que toute la zone soit vide.",
        "refs": [
          "hydra"
        ],
        "gear": "kettle"
      },
      {
        "effect": "Exploiter la récupération",
        "title": "Tire entre deux rafales",
        "action": "En solo, passe d’un abri plein à l’autre sur la coque ou dans l’Empereur. Attends la fin de la rafale pour viser le côté découvert et replie-toi quand elle reprend.",
        "limit": "Le wiki rapporte un angle mort très près des canons, mais le vent, les autres ARC ou les Raiders rendent cette position exposée.",
        "refs": [
          "hydra"
        ],
        "gear": "ferro"
      }
    ]
  },
  {
    "id": "arc-reclaimer",
    "name": "Récupérateur ARC",
    "en": "ARC Reclaimer",
    "aliases": [
      "Récupératrice",
      "Réclameur"
    ],
    "family": "Opérations",
    "role": "Navette de la Frégate",
    "image": "assets/bestiary/arc-reclaimer.webp",
    "behavior": "Il descend du vaisseau, stationne près du sol ou des toits puis rejoint ses quais.",
    "weak": "Sa surface supérieure supporte un Raider. L’interaction de perturbation avec l’outil provoque le trajet de retour.",
    "opening": "Monte pendant son stationnement. Perturbe-le après que ton partenaire a pris place.",
    "tactic": "Utilisez ce drone comme transport. Tenter de l’abattre coûte un moyen d’abordage pour un butin courant.",
    "zone": "Pendant l’opération Frégate, entre la surface et les quais de poupe.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu",
      "Marées déchirées",
      "Col de Pendola"
    ],
    "armor": "Lourd",
    "hp": "830",
    "xp": 0,
    "loot": [
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "heavy_ammo",
        "Munitions lourdes"
      ],
      [
        "light_ammo",
        "Munitions légères"
      ],
      [
        "medium_ammo",
        "Munitions moyennes"
      ],
      [
        "shotgun_ammo",
        "Cartouches de pompe"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · ARC Reclaimer",
        "https://arcraiders.wiki/wiki/ARC_Reclaimer"
      ],
      [
        "Wiki · Opération Frégate",
        "https://arcraiders.wiki/wiki/ARC_Frigate"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/a/a9/ARC_Reclaimer.png",
    "engagement": {
      "target": "Le dessus du drone",
      "signal": "Pendant son vol stationnaire",
      "weapons": [],
      "operation": {
        "tool": "Outil de Raider",
        "reason": "Monte sur le dos du Récupérateur, attends ton partenaire, puis frappe le drone avec l’outil pour déclencher le retour sous bouclier. Le wiki le décrit comme destructible, mais une carcasse ne vous emmènera plus à bord.",
        "related": [
          "arc-frigate"
        ]
      }
    }
  },
  {
    "id": "wasp-husk",
    "name": "Épave de Guêpe",
    "en": "Wasp Husk",
    "aliases": [],
    "family": "Épaves",
    "role": "Récupération",
    "image": "assets/bestiary/wasp-husk.webp",
    "behavior": "Restes d’un drone pendant une sortie. L’épave est un conteneur distinct d’une Guêpe active.",
    "weak": "Une section de coque se force avec l’outil de Raider.",
    "opening": "Approche après avoir vérifié les lignes de vue. Le butin devient accessible après l’effraction.",
    "tactic": "Un Raider fouille, l’autre surveille les bruits de patrouille. La condition Cimetière d’épaves augmente le nombre de carcasses.",
    "zone": "Régions touchées par le Cimetière d’épaves, également possible hors de cette condition.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu",
      "Marées déchirées"
    ],
    "armor": "",
    "hp": "",
    "xp": null,
    "loot": [
      [
        "wasp_driver",
        "Pilote de Guêpe"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "light_ammo",
        "Munitions légères"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "arc_circuitry",
        "Câblage ARC"
      ],
      [
        "arc_coolant",
        "Liquide de refroidissement ARC"
      ],
      [
        "arc_flex_rubber",
        "Caoutchouc flexible ARC"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_performance_steel",
        "Acier de performance ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ],
      [
        "damaged_wasp_driver",
        "Pilote de Guêpe endommagé"
      ]
    ],
    "sources": [
      [
        "Wiki · Wasp Husk",
        "https://arcraiders.wiki/wiki/Wasp_Husk"
      ],
      [
        "Wiki · Cimetière d’épaves",
        "https://arcraiders.wiki/wiki/Husk_Graveyard"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/f/ff/ARC_Wasp_Husk.png",
    "engagement": {
      "target": "Le panneau à forcer",
      "signal": "Quand la patrouille s’éloigne",
      "weapons": [],
      "operation": {
        "tool": "Outil de Raider",
        "reason": "Positionne-toi à portée de l’interaction d’effraction. Ton partenaire peut observer les machines encore en vol pendant l’ouverture.",
        "related": [
          "wasp"
        ]
      }
    }
  },
  {
    "id": "arc-probe",
    "name": "Sonde ARC",
    "en": "ARC Probe",
    "aliases": [],
    "family": "Opérations",
    "role": "Sonde orbitale",
    "image": "assets/bestiary/arc-probe.webp",
    "behavior": "Elle descend pour prélever des échantillons. Une tentative d’effraction fait retentir un signal pouvant attirer des ARC.",
    "weak": "Trois panneaux à ouvrir sur une sonde intacte. Une sonde déjà écrasée ne livre qu’un panneau.",
    "opening": "Attends l’atterrissage puis termine l’effraction à l’outil. Prévois un couvert pendant le signal.",
    "tactic": "Répartissez surveillance aérienne et fouille. Vérifiez l’état de la sonde avant d’y consacrer le temps d’une sortie.",
    "zone": "Repère son bruit de descente et les sondes regroupées pendant la condition Prospecting Probes.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu",
      "Marées déchirées"
    ],
    "armor": "",
    "hp": "",
    "xp": null,
    "loot": [
      [
        "arc_motion_core",
        "Processeur de mobilité ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "arc_circuitry",
        "Câblage ARC"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_synthetic_resin",
        "Résine synthétique ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · ARC Probe",
        "https://arcraiders.wiki/wiki/ARC_Probe"
      ],
      [
        "Wiki · Sondes de prospection",
        "https://arcraiders.wiki/wiki/Prospecting_Probes"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/c/c5/ARC_Probe.png",
    "engagement": {
      "target": "Les panneaux de la sonde",
      "signal": "Après l’atterrissage",
      "weapons": [],
      "operation": {
        "tool": "Outil de Raider",
        "reason": "La tentative d’effraction déclenche un signal sonore et peut attirer les ARC. Choisis ton couvert avant de commencer.",
        "related": []
      }
    }
  },
  {
    "id": "arc-courier",
    "name": "Coursier ARC",
    "en": "ARC Courier",
    "aliases": [
      "Transporteur",
      "Coursier ARC"
    ],
    "family": "Épaves",
    "role": "Transport de pièces",
    "image": "assets/bestiary/arc-courier.webp",
    "behavior": "Ses débris peuvent dégager une colonne de fumée. Leur contenu mélange des pièces de machines intactes et endommagées.",
    "weak": "Un seul compartiment s’ouvre après effraction.",
    "opening": "Avant de traverser vers la fumée, observe les abords. D’autres Raiders voient le même signal.",
    "tactic": "Cette fouille permet de chercher des pièces de plusieurs types d’ARC sans combattre chacun d’eux. Le contenu exact varie.",
    "zone": "Cherche la fumée en surface. Le Cimetière d’épaves augmente le nombre de Coursiers disponibles sur les cartes concernées.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu",
      "Marées déchirées"
    ],
    "armor": "",
    "hp": "",
    "xp": null,
    "loot": [
      [
        "sentinel_firing_core",
        "Noyau de tir de Sentinelle"
      ],
      [
        "arc_circuitry",
        "Câblage ARC"
      ],
      [
        "hornet_driver",
        "Pilote de Frelon"
      ],
      [
        "surveyor_vault",
        "Coffre de Guetteur"
      ],
      [
        "arc_motion_core",
        "Processeur de mobilité ARC"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "burned_arc_circuitry",
        "Câblage ARC brûlé"
      ],
      [
        "damaged_arc_motion_core",
        "Processeur de mobilité ARC endommagé"
      ],
      [
        "damaged_hornet_driver",
        "Pilote de Frelon endommagé"
      ],
      [
        "damaged_wasp_driver",
        "Pilote de Guêpe endommagé"
      ],
      [
        "fireball_burner",
        "Brûleur de Bolide"
      ],
      [
        "pop_trigger",
        "Détonateur de Pop"
      ],
      [
        "skulker_targeter",
        "Désignateur de Rôdeur"
      ],
      [
        "spotter_relay",
        "Relais d'Observateur"
      ],
      [
        "vaporizer_regulator",
        "Régulateur de Vaporisateur"
      ],
      [
        "bully_fragmenter",
        "Fragmenteur de Brute"
      ]
    ],
    "sources": [
      [
        "Wiki · ARC Courier",
        "https://arcraiders.wiki/wiki/ARC_Courier"
      ],
      [
        "Wiki · Cimetière d’épaves",
        "https://arcraiders.wiki/wiki/Husk_Graveyard"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/b/bc/ARC_Courier.png",
    "engagement": {
      "target": "Le compartiment sous la fumée",
      "signal": "Après avoir vérifié les abords",
      "weapons": [],
      "operation": {
        "tool": "Outil de Raider",
        "reason": "Fouille le compartiment de la carcasse lorsque les alentours sont sûrs. La fumée offre aussi aux autres Raiders un point de repère.",
        "related": []
      }
    }
  },
  {
    "id": "rocketeer-husk",
    "name": "Épave d’Artificier",
    "en": "Rocketeer Husk",
    "aliases": [],
    "family": "Épaves",
    "role": "Récupération lourde",
    "image": "assets/bestiary/rocketeer-husk.webp",
    "behavior": "Carcasse au sol à forcer pendant une condition d’épaves. Elle se distingue du drone actif par son absence de vol et de visée.",
    "weak": "Un compartiment accessible à l’outil. Le wiki classe encore son contenu comme provisoire.",
    "opening": "Vérifie l’absence de patrouille puis ouvre depuis le côté le mieux couvert.",
    "tactic": "Si tu vises le pilote, contrôle son état avant d’encombrer ton sac. La présence d’un pilote intact reste aléatoire.",
    "zone": "Cimetière d’épaves sur les cartes signalées par la condition.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu",
      "Marées déchirées"
    ],
    "armor": "",
    "hp": "",
    "xp": null,
    "loot": [
      [
        "rocketeer_driver",
        "Pilote d'Artificier"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "heavy_ammo",
        "Munitions lourdes"
      ],
      [
        "damaged_rocketeer_driver",
        "Pilote d'Artificier endommagé"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "arc_coolant",
        "Liquide de refroidissement ARC"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ],
      [
        "launcher_ammo",
        "Munitions de lanceur"
      ]
    ],
    "sources": [
      [
        "Wiki · Rocketeer Husk",
        "https://arcraiders.wiki/wiki/Rocketeer_Husk"
      ],
      [
        "Wiki · Cimetière d’épaves",
        "https://arcraiders.wiki/wiki/Husk_Graveyard"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/e/e3/ARC_Rocketeer_Husk.png",
    "engagement": {
      "target": "Le compartiment de la coque",
      "signal": "Quand un partenaire couvre la fouille",
      "weapons": [],
      "operation": {
        "tool": "Outil de Raider",
        "reason": "Force le compartiment et inspecte la pièce récupérée. Un pilote endommagé et un pilote intact n’ont pas les mêmes usages.",
        "related": [
          "rocketeer"
        ]
      }
    }
  },
  {
    "id": "arc-assessor",
    "name": "Évaluateur ARC",
    "en": "ARC Assessor",
    "aliases": [
      "Assesseur"
    ],
    "family": "Opérations",
    "role": "Sonde d’évaluation",
    "image": "assets/bestiary/arc-assessor.webp",
    "behavior": "Il se pose près des relevés des Guetteurs. Une effraction appelle une escorte armée, dont des menaces aériennes.",
    "weak": "Les trois compartiments renferment les ressources. La machine n’a pas d’arme propre.",
    "opening": "Attends la fin de la descente puis force un compartiment pendant que le duo garde une voie de fuite.",
    "tactic": "Anticipe l’arrivée des renforts dès l’ouverture. Si l’objectif est la matrice, décide avant le raid combien de compartiments tenter.",
    "zone": "Opération Close Scrutiny au Barrage, en Ville enfouie, au Port spatial ou au Portail bleu.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu"
    ],
    "armor": "",
    "hp": "",
    "xp": null,
    "loot": [
      [
        "assessor_matrix",
        "Matrice d'Évaluateur"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "advanced_electrical_components",
        "Composants électriques avancés"
      ],
      [
        "arc_circuitry",
        "Câblage ARC"
      ],
      [
        "arc_coolant",
        "Liquide de refroidissement ARC"
      ],
      [
        "arc_flex_rubber",
        "Caoutchouc flexible ARC"
      ],
      [
        "arc_motion_core",
        "Processeur de mobilité ARC"
      ],
      [
        "arc_performance_steel",
        "Acier de performance ARC"
      ],
      [
        "arc_synthetic_resin",
        "Résine synthétique ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · ARC Assessor",
        "https://arcraiders.wiki/wiki/ARC_Assessor"
      ],
      [
        "Wiki · Opération Close Scrutiny",
        "https://arcraiders.wiki/wiki/Close_Scrutiny"
      ],
      [
        "Embark · Flashpoint",
        "https://arcraiders.com/fr/news/flashpoint-content-update"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/1/14/ARC_Assessor.png",
    "engagement": {
      "target": "Les trois compartiments",
      "signal": "Entre l’atterrissage et les renforts",
      "weapons": [],
      "operation": {
        "tool": "Outil de Raider",
        "reason": "Prépare l’effraction et réserve une ligne de repli si le Vaporisateur arrive. Le danger vient des machines de protection.",
        "related": [
          "vaporizer"
        ]
      }
    }
  },
  {
    "id": "baron-husk",
    "name": "Épave de Baron",
    "en": "Baron Husk",
    "aliases": [],
    "family": "Épaves",
    "role": "Vestige de la première vague",
    "image": "assets/bestiary/baron-husk.webp",
    "behavior": "Les Barons de la première vague subsistent comme épaves fouillables dans la Ceinture. Le site de récupération peut être piégé.",
    "weak": "Une ouverture à forcer dans la carcasse du marcheur à six pattes.",
    "opening": "Vérifie le pourtour et garde un chemin dégagé avant de finir l’effraction.",
    "tactic": "Confie au deuxième Raider la surveillance de l’extérieur. Les probabilités par matériau ne sont pas établies.",
    "zone": "Au Barrage, le marais abrite une carcasse. Une autre se trouve près des murs du Port spatial. Les Barons restent à leur place pendant le Cimetière d’épaves.",
    "maps": [
      "Champ de bataille du Barrage",
      "Port spatial",
      "Portail bleu"
    ],
    "armor": "",
    "hp": "",
    "xp": null,
    "loot": [
      [
        "arc_performance_steel",
        "Acier de performance ARC"
      ],
      [
        "arc_coolant",
        "Liquide de refroidissement ARC"
      ],
      [
        "arc_flex_rubber",
        "Caoutchouc flexible ARC"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "arc_circuitry",
        "Câblage ARC"
      ],
      [
        "arc_motion_core",
        "Processeur de mobilité ARC"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_synthetic_resin",
        "Résine synthétique ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ],
      [
        "burned_arc_circuitry",
        "Câblage ARC brûlé"
      ],
      [
        "damaged_arc_motion_core",
        "Processeur de mobilité ARC endommagé"
      ],
      [
        "damaged_arc_powercell",
        "Cellule d'énergie ARC endommagée"
      ],
      [
        "degraded_arc_rubber",
        "Caoutchouc ARC détérioré"
      ],
      [
        "dried_out_arc_resin",
        "Résine ARC desséchée"
      ],
      [
        "impure_arc_coolant",
        "Liquide de refroidissement ARC impur"
      ],
      [
        "rusty_arc_steel",
        "Acier ARC rouillé"
      ],
      [
        "tattered_arc_lining",
        "Doublure ARC en lambeaux"
      ]
    ],
    "sources": [
      [
        "Wiki · Baron Husk",
        "https://arcraiders.wiki/wiki/Baron_Husk"
      ],
      [
        "Wiki · Barons endormis",
        "https://arcraiders.wiki/wiki/Dormant_Barons"
      ],
      [
        "Wiki · Cimetière d’épaves",
        "https://arcraiders.wiki/wiki/Husk_Graveyard"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/7/70/ARC_Baron_Husk.png",
    "engagement": {
      "target": "La trappe de la carcasse",
      "signal": "Après reconnaissance du pourtour",
      "weapons": [],
      "operation": {
        "tool": "Outil de Raider",
        "reason": "Repère l’ouverture que signale l’interaction. Garde ton second angle libre pendant le bruit de l’effraction.",
        "related": []
      }
    }
  },
  {
    "id": "deforester-husk",
    "name": "Épave de Déforesteur",
    "en": "Deforester Husk",
    "aliases": [],
    "family": "Épaves",
    "role": "Énigme mécanique",
    "image": "assets/bestiary/deforester-husk.webp",
    "behavior": "Cette carcasse renferme deux mécanismes à alimenter et des obstacles de feu temporisés.",
    "weak": "Repère les étincelles au bas de l’anneau. Deux cellules d’énergie ARC permettent d’activer les étapes de l’énigme.",
    "opening": "Franchis chaque obstacle entre deux émissions de flammes. La deuxième alimentation libère l’accès à la salle de butin.",
    "tactic": "Vérifiez vos deux cellules d’énergie avant le départ. Le deuxième Raider peut surveiller l’entrée pendant la traversée.",
    "zone": "Portail bleu. Un site près de Maintenance Bunker et deux près d’Adorned Wreckage.",
    "maps": [
      "Portail bleu"
    ],
    "armor": "",
    "hp": "",
    "xp": null,
    "loot": [
      [
        "advanced_mechanical_components",
        "Composants mécaniques avancés"
      ],
      [
        "arc_flex_rubber",
        "Caoutchouc flexible ARC"
      ],
      [
        "arc_coolant",
        "Liquide de refroidissement ARC"
      ],
      [
        "arc_synthetic_resin",
        "Résine synthétique ARC"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "advanced_electrical_components",
        "Composants électriques avancés"
      ],
      [
        "arc_circuitry",
        "Câblage ARC"
      ],
      [
        "arc_motion_core",
        "Processeur de mobilité ARC"
      ],
      [
        "arc_performance_steel",
        "Acier de performance ARC"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "burned_arc_circuitry",
        "Câblage ARC brûlé"
      ],
      [
        "damaged_arc_powercell",
        "Cellule d'énergie ARC endommagée"
      ],
      [
        "degraded_arc_rubber",
        "Caoutchouc ARC détérioré"
      ],
      [
        "impure_arc_coolant",
        "Liquide de refroidissement ARC impur"
      ]
    ],
    "sources": [
      [
        "Wiki · Deforester Husk",
        "https://arcraiders.wiki/wiki/Deforester_Husk"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/c/cc/ARC_Deforester_Husk.png",
    "engagement": {
      "target": "L’anneau, puis les deux alimentations",
      "signal": "Entre les émissions de flammes",
      "weapons": [],
      "operation": {
        "tool": "Deux cellules d’énergie ARC",
        "reason": "Cherche les étincelles sous l’anneau pour trouver le passage. Garde une cellule pour chacune des deux alimentations.",
        "related": []
      }
    }
  },
  {
    "id": "arc-frigate",
    "name": "Frégate ARC",
    "en": "ARC Frigate",
    "aliases": [],
    "family": "Opérations",
    "role": "Vaisseau à aborder",
    "image": "assets/bestiary/arc-frigate.webp",
    "behavior": "Ses autocanons visent le sol. À bord, des Hydres et d’autres ARC protègent les commandes et les noyaux.",
    "weak": "Des composants jaunes commandent des plateformes. Les noyaux d’énergie permettent d’accéder à la cargaison.",
    "opening": "Monte sur un Récupérateur et perturbe-le. Progresse ensuite depuis la poupe en synchronisant les commandes.",
    "tactic": "Plusieurs commandes demandent de la coordination entre Raiders. Prévois le retour avant de fouiller. Les trappes sont désactivées pendant l’opération.",
    "zone": "Pendant la condition Frégate, sur les cartes extérieures listées. Aucun emplacement permanent à pointer.",
    "maps": [
      "Champ de bataille du Barrage",
      "Ville enfouie",
      "Port spatial",
      "Portail bleu",
      "Marées déchirées",
      "Col de Pendola"
    ],
    "armor": "",
    "hp": "",
    "xp": null,
    "loot": [
      [
        "frigate_diagnostic_node",
        "Nœud de diagnostic de Frégate"
      ],
      [
        "frigate_inductor",
        "Inducteur de Frégate"
      ],
      [
        "arc_data_module",
        "Module de données ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · ARC Frigate",
        "https://arcraiders.wiki/wiki/ARC_Frigate"
      ],
      [
        "Embark · Mise à jour 2.3",
        "https://arcraiders.com/news/live-update-2-3-0"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/0/02/ARC_Frigate_map_condition.png",
    "engagement": {
      "target": "Le Récupérateur, puis la poupe",
      "signal": "Au stationnement du drone",
      "weapons": [],
      "operation": {
        "tool": "Outil de Raider et coéquipiers",
        "reason": "Dans l’atrium inférieur, tire sur les composants jaunes du mur pour déployer les plateformes. Certains noyaux demandent trois Raiders aux commandes. Pour l’abordage, ouvre aussi la fiche du Récupérateur.",
        "related": [
          "arc-reclaimer",
          "hydra"
        ]
      }
    }
  },
  {
    "id": "harvester",
    "name": "Moissonneur",
    "en": "Harvester",
    "aliases": [],
    "family": "Opérations",
    "role": "Structure de récolte",
    "image": "assets/bestiary/harvester.webp",
    "behavior": "Gardé par une Reine, le Moissonneur purge périodiquement son intérieur avec du feu. Des avertissements annoncent la séquence.",
    "weak": "Trois noyaux de fusion alimentent le pilier central. Les cibles jaunes qui apparaissent après l’insertion contrôlent les récompenses.",
    "opening": "Rassemble les trois noyaux puis insère-les rapidement. Pendant la purge, quitte l’intérieur par une ouverture.",
    "tactic": "Répartissez recherche de noyaux et veille de la Reine. Les schémas Equalizer et Jupiter sont associés à l’énigme, et disposent aussi d’autres voies depuis la 2.3.0.",
    "zone": "Condition Moissonneur au Barrage, au Port spatial ou au Portail bleu.",
    "maps": [
      "Champ de bataille du Barrage",
      "Port spatial",
      "Portail bleu"
    ],
    "armor": "",
    "hp": "",
    "xp": null,
    "loot": [
      [
        "jupiter_blueprint",
        "Schéma de Jupiter"
      ],
      [
        "arc_powercell",
        "Cellule d'énergie ARC"
      ],
      [
        "arc_alloy",
        "Alliage ARC"
      ],
      [
        "burned_arc_circuitry",
        "Câblage ARC brûlé"
      ],
      [
        "impure_arc_coolant",
        "Liquide de refroidissement ARC impur"
      ],
      [
        "advanced_arc_powercell",
        "Cellule d'énergie ARC avancée"
      ],
      [
        "arc_circuitry",
        "Câblage ARC"
      ],
      [
        "arc_coolant",
        "Liquide de refroidissement ARC"
      ],
      [
        "arc_flex_rubber",
        "Caoutchouc flexible ARC"
      ],
      [
        "arc_motion_core",
        "Processeur de mobilité ARC"
      ],
      [
        "arc_performance_steel",
        "Acier de performance ARC"
      ],
      [
        "arc_synthetic_resin",
        "Résine synthétique ARC"
      ],
      [
        "arc_thermo_lining",
        "Doublure thermique ARC"
      ],
      [
        "equalizer_blueprint",
        "Schéma d'Égaliseur"
      ]
    ],
    "sources": [
      [
        "Wiki · Harvester",
        "https://arcraiders.wiki/wiki/Harvester"
      ],
      [
        "Embark · Mise à jour 2.3",
        "https://arcraiders.com/news/live-update-2-3-0"
      ],
      [
        "Embark · Correctif du Dolabra",
        "https://arcraiders.com/news/frozen-trail-2-0-update"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/e/e4/Harvester_map_condition.png",
    "engagement": {
      "target": "Les trois noyaux, puis les cibles jaunes",
      "signal": "Juste après les trois insertions",
      "weapons": [],
      "operation": {
        "tool": "Trois noyaux de fusion",
        "reason": "Ramasse les noyaux sur place. Après leur insertion, tire sur les douze cibles jaunes dans la salle. Embark confirme que le Dolabra peut aussi les détruire depuis la version 2.0.",
        "related": [
          "queen"
        ]
      }
    }
  },
  {
    "id": "emperor",
    "name": "Empereur",
    "en": "Emperor",
    "aliases": [],
    "family": "Épaves",
    "role": "Colosse échoué",
    "image": "assets/bestiary/emperor.webp",
    "behavior": "Le col de Pendola abrite un Empereur tombé. Son intérieur fortifié offre des salles à explorer, avec notamment des Hydres.",
    "weak": "Le conduit de passerelle est lié à l’accès de l’Empereur. Les dangers de l’épave comprennent son compacteur.",
    "opening": "Établis une ligne de repli avant de dépasser les premières salles. Les conteneurs de rang élevé se trouvent plus profondément depuis la 2.3.0.",
    "tactic": "Distingue la sortie d’accès et celle de récupération. Les capsules de Redirection peuvent fournir le schéma de clé, à une fréquence réduite.",
    "zone": "Col de Pendola, à l’intérieur et aux abords de l’Empereur échoué.",
    "maps": [
      "Col de Pendola"
    ],
    "armor": "",
    "hp": "",
    "xp": null,
    "loot": [
      [
        "emperor_modulator",
        "Modulateur d'Empereur"
      ],
      [
        "arc_conductive_coupler",
        "Coupleur conducteur ARC"
      ]
    ],
    "sources": [
      [
        "Wiki · Emperor",
        "https://arcraiders.wiki/wiki/Emperor_(lore)"
      ],
      [
        "Embark · Mise à jour 2.3",
        "https://arcraiders.com/news/live-update-2-3-0"
      ],
      [
        "Wiki · Exploration de l’Empereur",
        "https://arcraiders.wiki/wiki/Belly_Of_The_Beast"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/6/60/Emperor_Codex.png",
    "engagement": {
      "target": "L’accès par le conduit de passerelle",
      "signal": "Quand ton itinéraire de retour est libre",
      "weapons": [],
      "operation": {
        "tool": "Clé du conduit de passerelle",
        "reason": "Vérifie l’accès et repère le chemin du retour avant de chercher les conteneurs profonds. Les Hydres de l’épave défendent les passages.",
        "related": [
          "hydra"
        ]
      }
    }
  },
  {
    "id": "arc-orbiter",
    "name": "Orbiteur ARC",
    "en": "ARC Orbiter",
    "aliases": [],
    "family": "Opérations",
    "role": "Menace de fin de raid",
    "image": "assets/bestiary/arc-orbiter.webp",
    "behavior": "L’Orbiteur frappe la surface à la fin du compte à rebours. Son apparence reste inconnue, la photo montre ses projectiles.",
    "weak": "Aucune partie accessible depuis le sol. Sa présence se repère par les avertissements et les impacts.",
    "opening": "Les annonces radio arrivent notamment à dix, cinq et deux minutes. La fenêtre à utiliser est celle de l’extraction.",
    "tactic": "À la première alerte, vérifie la durée du détour et l’état des retours disponibles. Un bâtiment ne remplace pas une extraction quand le temps expire.",
    "zone": "Menace générale de fin de raid, sans point fixe ni carcasse à fouiller.",
    "maps": [],
    "armor": "",
    "hp": "",
    "xp": null,
    "loot": [],
    "sources": [
      [
        "Wiki · ARC Orbiter",
        "https://arcraiders.wiki/wiki/ARC_Orbiter"
      ]
    ],
    "original": "https://arcraiders.wiki/w/images/3/3c/ARC_Orbiter_-_Projectiles_01.png",
    "engagement": {
      "target": "La sortie encore accessible",
      "signal": "Dès les avertissements radio",
      "weapons": [],
      "operation": {
        "tool": "Itinéraire d’extraction",
        "reason": "Aucune partie de l’Orbiteur n’est accessible au tir. Regarde le temps restant, localise ton retour et garde la marge nécessaire pour l’activer.",
        "related": []
      }
    }
  }
];
window.BESTIARY_METHOD_SOURCES = {
  "GS": [
    "Guide de terrain",
    "Billy Givens · GameSpot",
    "31.03.2026",
    "https://www.gamespot.com/articles/arc-raiders-all-enemies-and-how-to-kill-them/1100-6536073/"
  ],
  "RB": [
    "Démonstration de joueur",
    "rl1975 · vidéo",
    "avant la 2.0",
    "https://www.reddit.com/r/ArcRaiders/comments/1tqim2q/how_to_kill_a_bastion_in_16_seconds_without/"
  ],
  "RD": [
    "Retour de joueur",
    "Even-Recipe7769 · démonstration et discussion",
    "avant la 2.0",
    "https://www.reddit.com/r/ArcRaiders/comments/1q4stfx/quick_and_easy_way_to_kill_a_bombardier_without/"
  ],
  "WL": [
    "Démonstration de joueur",
    "WILLingtonegotiate · vidéo",
    "avant la 2.0",
    "https://www.reddit.com/r/ArcRaiders/comments/1oskz0v/kill_any_leaper_in_10_seconds_with_blaze_grenades/"
  ],
  "QR": [
    "Retour de joueur",
    "Irex8 · récit et captures",
    "avant la 2.0",
    "https://www.reddit.com/r/ArcRaiders/comments/1qhlxob/queenmatriarch_damage_trial/"
  ],
  "P": [
    "Équilibrage officiel",
    "Embark · Frozen Trail",
    "2.0 · 08.10.2026",
    "https://arcraiders.com/news/frozen-trail-2-0-update"
  ],
  "P23": [
    "Correctif officiel",
    "Embark · notes de mise à jour",
    "2.3.0 · 27.10.2026",
    "https://arcraiders.com/news/live-update-2-3-0"
  ],
  "MIX": [
    "Dialogue de quête",
    "Shani · Mixed Signals, transcription du wiki",
    "31.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Mixed_Signals&oldid=44317#Dialog"
  ],
  "TM": [
    "Guide de terrain",
    "Sean Martin · PC Gamer",
    "29.04.2026",
    "https://www.pcgamer.com/games/third-person-shooter/arc-raiders-arc-turbine-location-kill/"
  ],
  "BG": [
    "Guide de terrain",
    "Joel Franey · GamesRadar+",
    "Frozen Trail · oct. 2026",
    "https://www.gamesradar.com/games/third-person-shooter/arc-raiders-bullies/"
  ],
  "VS": [
    "Retour de raid",
    "John Schutt · Shacknews",
    "02.04.2026",
    "https://www.shacknews.com/article/148557/how-to-beat-vaporizers-in-arc-raiders"
  ],
  "EC": [
    "Conseil officiel",
    "David et Oskar · Embark",
    "25.02.2026",
    "https://arcraiders.com/news/firefly-comet-tips-and-tricks"
  ],
  "EV": [
    "Conseil officiel",
    "Victor · Embark",
    "25.02.2026",
    "https://arcraiders.com/news/firefly-comet-tips-and-tricks"
  ],
  "EF": [
    "Conseil officiel",
    "Alexander · Embark",
    "25.02.2026",
    "https://arcraiders.com/news/firefly-comet-tips-and-tricks"
  ],
  "EF2": [
    "Conseil officiel",
    "Leon et Junsik · Embark",
    "25.02.2026",
    "https://arcraiders.com/news/firefly-comet-tips-and-tricks"
  ],
  "snitch": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Snitch",
    "rév. 09.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Snitch&oldid=42054#Combat_tips"
  ],
  "wasp": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Wasp",
    "rév. 09.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Wasp&oldid=42055#Combat_tips"
  ],
  "hornet": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Hornet",
    "rév. 09.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Hornet&oldid=42056#Combat_tips"
  ],
  "pop": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Pop",
    "rév. 13.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Pop&oldid=43167#Combat_tips"
  ],
  "fireball": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Fireball",
    "rév. 09.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Fireball&oldid=42060#Combat_tips"
  ],
  "tick": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Tick",
    "rév. 09.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Tick&oldid=42058#Combat_tips"
  ],
  "turret": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Turret",
    "rév. 20.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Turret&oldid=43431#Combat_tips"
  ],
  "rocketeer": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Rocketeer",
    "rév. 09.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Rocketeer&oldid=42073#Combat_tips"
  ],
  "leaper": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Leaper",
    "rév. 31.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Leaper&oldid=44212#Combat_tips"
  ],
  "bastion": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Bastion",
    "rév. 16.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Bastion&oldid=43346#Combat_tips"
  ],
  "bombardier": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Bombardier",
    "rév. 15.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Bombardier&oldid=43306#Combat_tips"
  ],
  "spotter": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Spotter",
    "rév. 09.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Spotter&oldid=42068#Combat_tips"
  ],
  "sentinel": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Sentinel",
    "rév. 09.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Sentinel&oldid=42062#Combat_tips"
  ],
  "arc-surveyor": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · ARC Surveyor",
    "rév. 09.10.2026",
    "https://arcraiders.wiki/w/index.php?title=ARC_Surveyor&oldid=42064#Combat_tips"
  ],
  "queen": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Queen",
    "rév. 09.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Queen&oldid=42076#Attack"
  ],
  "matriarch": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Matriarch",
    "rév. 22.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Matriarch&oldid=43665#Combat_tips"
  ],
  "shredder": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Shredder",
    "rév. 31.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Shredder&oldid=44050#Combat_tips"
  ],
  "comet": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Comet",
    "rév. 15.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Comet&oldid=43326#Combat_tips"
  ],
  "firefly": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Firefly",
    "rév. 09.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Firefly&oldid=42067#Combat_tips"
  ],
  "vaporizer": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Vaporizer",
    "rév. 09.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Vaporizer&oldid=42074#Combat_tips"
  ],
  "arc-turbine": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · ARC Turbine",
    "rév. 29.10.2026",
    "https://arcraiders.wiki/w/index.php?title=ARC_Turbine&oldid=43974#Combat_tips"
  ],
  "bully": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Bully",
    "rév. 28.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Bully&oldid=43960#Combat_tips"
  ],
  "skulker": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Skulker",
    "rév. 28.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Skulker&oldid=43961#Combat_tips"
  ],
  "hydra": [
    "Observations de joueurs",
    "Contributeurs ARC Raiders Wiki · Hydra",
    "rév. 28.10.2026",
    "https://arcraiders.wiki/w/index.php?title=Hydra&oldid=43959#Combat_tips"
  ]
};
