/* Références Pendola observées. Les positions et dimensions des salles ne sont pas déduites ici. */
(() => {
  'use strict';
  const frame=(seconds,label,alt)=>({
    file:'emperor-pendola/raiderlogic-'+seconds+'.png',label,alt,
    credit:'RaiderLogic · '+Math.floor(seconds/60).toString().padStart(2,'0')+':'+(seconds%60).toString().padStart(2,'0'),
    source:'https://www.youtube.com/watch?v=JLBVTdaahLQ&t='+seconds+'s'
  });
  window.OPS_EMPEROR_EVIDENCE={
    outside:{title:'La coque à Pendola',location:'Extérieur · vue d’ensemble',
      landmark:'La grande ouverture circulaire sous la traverse, les pylônes et les membres effondrés.',
      constraint:'Raccorder chaque ouverture à son volume intérieur avant de détailler la coque.',
      unresolved:'Arrière, attaches cachées, profondeur et échelle absolue restent à relever.',
      frames:[{file:'emperor/emperor-exterior-wide.webp',label:'Vue d’ensemble',alt:'Empereur effondré dans la neige à Pendola, grande traverse et ouverture ronde',credit:'Gamer Guides',source:'https://gamer-guides.com/arc-raiders/emperor/'},frame(131,'Vue rapprochée','Coque de l’Empereur à Pendola ; un schéma du vidéaste recouvre une partie de l’image')],
      related:['door','loot','exit']},
    door:{title:'La trappe d’entrée',location:'Entrée · au pied de la coque',
      landmark:'Un passage rond épais et son vantail déporté sur des bras articulés.',
      constraint:'Modéliser le seuil, la profondeur de l’encadrement et le débattement du vantail.',
      unresolved:'Le diamètre et la course des bras ne sont pas encore mesurés.',
      frames:[frame(26,'Trappe ouverte','Passage circulaire ouvert à la base de l’Empereur et bras de son vantail'),{file:'emperor/emperor-door.webp',label:'Depuis l’extérieur',alt:'Trappe d’entrée de l’Empereur près de la prise du Conduit',credit:'Arc Raiders Hub',source:'https://arcraidershub.com/guides/fallen-emperor-guide'}],
      related:['outside','ground']},
    ground:{title:'Le tunnel d’accès',location:'Entrée · passage des boîtiers',
      landmark:'Les boîtiers électriques, le passage longitudinal et ses bords surélevés.',
      constraint:'Conserver une continuité praticable entre la trappe et le puits.',
      unresolved:'Largeur utile et raccord exact au puits à mesurer sur plusieurs vues.',
      frames:[frame(48,'Boîtiers','Tunnel intérieur avec boîtiers électriques et bords surélevés'),frame(66,'Autre instant','Tunnel d’accès éclairé par les éléments rouges du mécanisme')],
      related:['door','lift']},
    lift:{title:'Le puits central',location:'Intérieur · circulation verticale',
      landmark:'Un mât central, une plateforme annulaire et des ouvertures dans la paroi courbe.',
      constraint:'Séparer le mécanisme mobile des paliers et conserver les ouvertures à chaque hauteur.',
      unresolved:'Hauteurs des paliers, course et dimensions du puits à établir.',
      frames:[frame(116,'Au niveau du sol','Plateforme annulaire autour du mât central, paroi courbe et passage rond'),frame(140,'Vers le haut','Dessous de la plateforme du puits central et ouvertures de la paroi'),frame(165,'Puits en hauteur','Vue ascendante du puits et de son mécanisme')],
      related:['ground']},
    loot:{title:'Le hangar final',location:'Final · cargaison inclinée',
      landmark:'La grande cargaison inclinée, la paroi cylindrique et l’ouverture lumineuse.',
      constraint:'Le volume du hangar doit tenir dans la coque et conserver le passage autour de la cargaison.',
      unresolved:'Correspondance précise avec le corps intact et encombrement des mécanismes à vérifier.',
      frames:[frame(1520,'Cargaison et ouverture','Cargaison inclinée dans le hangar, ouverture circulaire vers l’extérieur'),frame(1570,'Vers le plafond','Partie haute de la cargaison, mécanismes et plafond du hangar'),frame(1480,'Anneau mécanique','Anneau mécanique et objets au sol dans le hangar final')],
      related:['outside','exit']},
    exit:{title:'Les sorties de l’épave',location:'Sortie · hangar et passages bas',
      landmark:'La grande ouverture sur l’extérieur et les passages secondaires vers la neige.',
      constraint:'Relier les sorties à de vrais seuils, conduits et dénivelés ; garder le terrain séparé.',
      unresolved:'Ne pas supposer que toutes les portes sont ouvertes dans chaque raid.',
      frames:[frame(2020,'Grande ouverture','Raider au bord de la grande ouverture, terrain enneigé très en dessous'),frame(2040,'Porte du hangar','Porte rectangulaire périphérique du hangar, avec lumières blanches'),frame(2065,'Passage bas','Débouché entre les parois de la coque, au niveau de la neige')],
      related:['loot','outside']}
  };
})();
