/* Coordonnées source : Y vers le haut. Les anciennes valeurs de coupe de l'Empereur sont inactives, ce ne sont pas des mesures. */
window.OPS_NAV={frigate:{
landing:{point:[-101,-26,0],cut:-19,span:110,level:'Arrière · amarrage',landmark:'Les deux passerelles à l’arrière du vaisseau.',reference:'frigate-gameplay/frigate-platform.png'},
lower:{point:[-38,-16,0],cut:-10,span:105,level:'Atrium · niveau bas',landmark:'Le puits central et les plateformes rétractables.',reference:'frigate-deck-detail.png'},
upper:{point:[-20,6,0],cut:12,span:125,level:'Atrium · coursives',landmark:'Les passerelles en W autour du vide central.',reference:'frigate-overview.png'},
top:{point:[20,18,0],cut:30,span:245,level:'Coque · pont supérieur',landmark:'Les crêtes longitudinales et les quatre propulseurs.',reference:'frigate-overview.png'},
cargo:{point:[138,-3,0],cut:7,span:103,level:'Avant · soute',landmark:'La charge suspendue et ses quatre loquets.',reference:'frigate-cargo-hall.png'},
inside:{point:[132,-10,40],cut:-3,span:95,level:'Avant · turbines',landmark:'Les grands ventilateurs derrière les salles latérales.',reference:'frigate-fan-tunnel.png'}},
emperor:{
door:{level:'Entrée · coque',landmark:'Une trappe ronde près de la prise du Conduit.',reference:'emperor-hatch-open.webp',cut:7},
ground:{level:'Entrée · tunnel',landmark:'Des boîtiers électriques dans un passage étroit.',reference:'emperor-electrified-boxes.webp',cut:5},
lift:{level:'Entrée · ascenseur',landmark:'Un grand puits cerclé de passerelles.',reference:'emperor-interior-ring-hall.webp',cut:17},
gas:{level:'Épreuve · compacteur',landmark:'Deux murs mobiles, du gaz et un creux central.',reference:'emperor-video-gas.png',cut:6},
above:{level:'Épreuve · passage haut',landmark:'Les corniches au-dessus du compacteur.',reference:'emperor-zipline.webp',cut:12},
hangar:{level:'Épreuve · conteneurs',landmark:'Un rail suspendu et des conteneurs au-dessus du vide.',reference:'emperor-video-cargo.png',cut:15},
chasm:{level:'Épreuve · descente',landmark:'Un puits dont les planchers sont découpés.',reference:'emperor-chasm-drop.webp',cut:19},
maze:{level:'Épreuve · labyrinthe',landmark:'Des cloisons hautes et des ouvertures latérales.',reference:'emperor-maze.webp',cut:4},
climb:{level:'Épreuve · montée',landmark:'Des échelles et des conteneurs électrifiés.',reference:'emperor-ladder-climb.webp',cut:16},
laser:{level:'Épreuve · lasers',landmark:'Des faisceaux rouges et des conteneurs qui les masquent.',reference:'emperor-laser-trap-room.webp',cut:6},
box:{level:'Épreuve · monte-charge',landmark:'Un conteneur mobile entre plusieurs corniches.',reference:'emperor-moving-container.webp',cut:16},
loot:{level:'Final · hangar',landmark:'Le conteneur effondré, les nœuds et les capsules.',reference:'emperor-loot-hangar.webp',cut:11},
exit:{level:'Sortie · hangar et passages bas',landmark:'La grande ouverture sur l’extérieur et les passages secondaires vers la neige.',reference:'emperor-exit-door-white-lights.webp',cut:7}}};
for(const[id,e]of Object.entries(window.OPS_EMPEROR_EVIDENCE||{}))if(window.OPS_NAV.emperor[id])window.OPS_NAV.emperor[id].landmark=e.landmark;
for(const [op,rooms]of Object.entries(window.OPS_NAV))for(const[id,r]of Object.entries(rooms)){r.id=id;r.point||=[0,0,0];r.span||=35;r.reference='research/operations-3d/references/'+(op==='emperor'?'emperor/':'')+r.reference;}
