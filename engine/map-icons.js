// Pictogrammes de carte réutilisables. La même tuile en cache sert au canevas de la carte et à chaque équivalent HTML.
// Game symbols © Embark Studios AB, from https://arcraiders.wiki/wiki/Category:ARC_icons and Category:Icons.
// Les contours propres à l'atlas sont tracés sur une grille de 24 unités. Les couleurs de catégorie s'appliquent uniformément.
(() => {
  'use strict';
  const gameNames='ARC_Assessor ARC_Baron_Husk ARC_Bastion ARC_Bombardier ARC_Bully ARC_Comet ARC_Fireball ARC_Firefly ARC_Harvester ARC_Hornet ARC_Hydra ARC_Leaper ARC_Matriarch ARC_Pop ARC_Queen ARC_Rocketeer ARC_Sentinel ARC_Shredder ARC_Skulker ARC_Snitch ARC_Surveyor ARC_Tick ARC_Turbine ARC_Turret ARC_Vaporizer ARC_Wasp Raider_Hatch_Active AmmoBox Grenade Key Medical Padlock Quest Info Weapon Beachcombing Electrical Raider Security Security_Breach Customization_Backpack Nature UncoveredCaches'.split(' ');
  const game = new Map();
  for(const [i,name] of gameNames.entries())game.set(name.toLowerCase().replaceAll('_','-'),i);
  const alias={
    'arc-assesor':'arc-assessor',turret:'arc-turret',sentinel:'arc-sentinel','harvester-event':'arc-harvester',
    'hatch-extract':'raider-hatch-active','ammo-case':'ammobox','grenade-case':'grenade','medical-bag':'medical','weapon-case':'weapon',
    'locked-room':'padlock','electrical-box':'electrical','raider-spawn':'raider','security-locker':'security-breach',
    backpack:'customization-backpack','raider-cache':'uncoveredcaches','dam-staff-room-key':'key','dam-testing-annex-key':'key',
    'metal-detectors':'metal-detector','mountaineers-detector':'metal-detector',cupboards:'cupboard',drawers:'drawer',areas:'sector',label:'sector',
    'arc-wasp-husk':'husk-wasp','arc-rocketeer-husk':'husk-rocketeer','arc-husk':'husk','loose-loot-electrical':'wire',
    'moss-fertilizer-farm':'fertilizer','zipline-elevator':'cable-lift','quest-with-trace':'footsteps',
    'quest-observatory':'telescope','quest-nomad-recordings':'cassette','quest-reduced-rubble':'rubble','quest-explore-pendola':'mountain',
    'quest-armored-transports':'trailer','quest-bees':'bee','quest-back-on-top':'flag','quest-nomads':'tent','quest-fallen-arc':'husk',
    'quest-first-foothold':'flag','formicai-hills':'mountain','victory-ridge':'mountain','raider-camp':'tent','red-lakes':'lake'
  };
  const paths={
    sector:'M3 5l6-2 6 3 6-2v15l-6 2-6-3-6 2z M9 3v15m6-12v15',
    extraction:'M11 3H4v18h7m-2-9h12m-5-5 5 5-5 5',
    'airshaft-extract':'M5 21V11m14 10V11M5 15h14M8 8l4-5 4 5m-4-5v10',
    'metro-extract':'M5 14V6q0-3 3-3h8q3 0 3 3v8q0 3-3 3H8q-3 0-3-3z M5 10h14M8 14h1m6 0h1M8 17l-3 4m11-4 3 4',
    'metro-entrance':'M3 20V11a9 9 0 0118 0v9 M7 18h3v-3h3v-3h3V9h3',
    'roof-hatch':'M2 12l10-9 10 9M5 12v9h14v-9 M8 15h8m-6 0v4',
    'flash-freeze-hatch':'M5 17h14l3 4H2z M12 2v12m-5-9 10 6m0-6L7 11',
    'arc-probe':'M10 3h4l2 12-4 4-4-4z M12 19v3M9 12l-5 7m11-7 5 7',
    'arc-courier':'M4 9l8-6 8 6-2 7H6z M4 9l8 3 8-3m-8 3v4M7 17l-3 4m13-4 3 4',
    'husk':'M2 18l4-9 4 2 4-7 3 9 5 5z M12 9l-2 5 4-1-1 5',
    'husk-wasp':'M2 11l4-5 4 2-1 4H4l-2-1m11-3 6-2 3 5-5 3-4-1m-2 4 3-6m-8 9h12',
    'husk-rocketeer':'M3 14l4-7 5 2-3 3 4 1-3 3H6z M13 8l3-3 5 7-5 3-1-4M5 20h14',
    androids:'M6 7h12v9H6z M9 11h1m4 0h1 M9 17l-3 4m9-4 3 4m-6-14V3',
    antenna:'M12 8v13m-5 0h10M8 5a6 6 0 000 8m8-8a6 6 0 010 8M5 2a10 10 0 000 14m14-14a10 10 0 010 14',
    agave:'M12 21 3 9l7 4 2-11 3 11 6-4z',
    apricot:'M12 8c-8-5-13 9-4 12 5 3 12-2 12-7 0-4-3-7-8-5z M12 8q0-5 5-6m-6 9q-3 3-2 6',
    'archive-box':'M3 6h18v4H3z M5 10v10h14V10M9 14h6',
    'battery-terminal':'M3 7h15v12H3z M18 11h3v5h-3M10 9l-3 5h6l-3 4',
    'black-box':'M3 7h18v13H3z M7 11h3v5H7zm7 0h4m-4 4h4 M6 7V4h4',
    box:'M3 7l9-4 9 4v11l-9 4-9-4z M3 7l9 4 9-4m-9 4v11',
    'breach-room':'M4 21V3h12v5m-2 12H4M20 7l-7 7 3 4 6-7m-11 6-3 3',
    'buried-item':'M2 17h20M3 21h18M7 14l-3-4 9-7 4 5-7 6',
    bus:'M3 17V6q0-2 2-2h14q2 0 2 2v11H3z M3 12h18M8 5v7m6-7v7M5 18v2m13-2v2M6 15h2m8 0h2',
    button:'M4 11h16v9H4z M8 11V8a4 4 0 018 0v3',
    camera:'M3 6h13v11H3z M16 9l5-3v11l-5-3',
    candleberry:'M12 3q4 5-2 12 M12 7l5 2 M8 13a3 3 0 100 6 3 3 0 000-6z M16 10a3 3 0 100 6 3 3 0 000-6z',
    'capsule-delivery-terminal':'M4 15v6h16v-6 M12 2v13m-5-5 5 5 5-5',
    'capsule-request-terminal':'M4 15v6h16v-6 M12 15V2M7 7l5-5 5 5',
    car:'M3 12l3-6h12l3 6v5H3z M3 12h18M6 17v3m12-3v3m-12-6h2m8 0h2',
    'combat-supplies':'M3 9h18v11H3z M7 8V5h10v3M7 11v6m5-6v6m5-6v6',
    cupboard:'M4 3h16v18H4z M12 3v18m-4-11v3m8-3v3',
    desk:'M2 8h20v3H2z M4 11v10m15-10v10m-6-10v6h6m-4-3h2',
    drawbridge:'M2 18h5l9-10m4-5v18M3 12V5m0 1 11 5',
    drawer:'M3 4h18v16H3z M3 12h18M9 8h6m-6 8h6',
    fertilizer:'M8 3h8l-2 4q7 6 5 13H5q-2-7 5-13z M9 7h6m-3 10v-5m0 3 3-2',
    'field-crate':'M2 7h20v13H2z M2 11h20M6 6v14m12-14v14',
    'field-depot':'M2 9l10-6 10 6 M4 10v11h16V10 M8 20v-8h8v8m-8-5h8',
    'first-wave-cache':'M3 10h18v10H3z M5 10V6h14v4M7 15l3-2 3 3 4-3',
    fridge:'M6 2h12v20H6z M6 10h12m-9-6v3m0 6v4',
    'frigate-cargo':'M2 12h20l-4 7H7z M5 11V6h6v5m1 0V8h6v3',
    'frozen-raider-cache':'M3 12h18v9H3z M12 2v12m-5-9 10 6m0-6L7 11',
    'fuel-cell':'M5 6h14v15H5z M8 6V3h8v3 M12 9q-6 6 0 8 6-2 0-8z',
    'garbage-bins':'M3 6h18M6 6l1 15h10l1-15M9 6V3h6v3m-5 4v7m4-7v7',
    generator:'M3 8h18v10H3z M6 8V5h7v3m-6 3h3v4H7zm8 0h3m-3 4h3m-12 4v2m12-2v2',
    'great-mullein':'M12 22V4m0 9-5-3 1 4 4 2m0-5 5-3-1 5-4 2m-2-7V4q2-4 4 0v4z',
    ladder:'M6 2v20M18 2v20M6 5h12M6 11h12M6 17h12',
    lemon:'M3 16q0-6 6-10 6-3 9-2l3-1-1 5q-5 12-13 12l-4 1z',
    lockers:'M3 3h18v18H3z M12 3v18M6 6h3m6 0h3M6 9h3m6 0h3m-6 3v3',
    'loose-loot':'M2 8l5-3 5 3-5 3z M2 8v6l5 3 5-3V8m3 5 3-2 4 3-4 3-3-2m0 0v3l3 3 4-3v-4',
    wire:'M3 20l8-8m-3-2 6-6 6 6-6 6z M15 5l3-3m0 6 4-4',
    'metal-crate':'M3 6h18v14H3z M3 10h18M5 18l5-6m9 6-5-6',
    'metal-detector':'M6 3l6 3-3 4m3-4 5 12M8 19q0-3 6-3t7 3q0 3-7 3t-6-3z',
    mine:'M3 17l3-5h12l3 5-2 3H5z M12 5v5m-7-2 3 3m11-3-3 3',
    moss:'M3 18q-1-7 5-6 0-8 6-6 3 0 4 4 6 0 3 8z M8 16l2-3m3 2 2-4',
    mushroom:'M2 13q0-10 10-10t10 10z M10 13l-1 7q3 2 6 0l-1-7',
    nest:'M2 11l10 6 10-6-4 8H6z M7 12q-1-8 3-7t2 9m1-3q3-6 5-3',
    olive:'M10 15q0-9 10-12m-5 6q-6 1-7-5 6 0 7 5 M8 13q4-4 6 1 0 6-5 7-6 0-1-8z',
    piano:'M3 4h18v15H3z M3 11h18m-14 0v8m5-8v8m5-8v8M5 20v2m14-2v2',
    'prickly-pear':'M9 21v-7C2 15 2 5 6 6q3 0 3 5V6c0-6 6-6 6 0v6c0-5 5-7 6-3q0 7-6 7v5z',
    'scissor-lift':'M2 20h20M5 16l13-8H5l13 8z M3 7V3m0 4h18V3M3 4h18',
    search:'M3 10a7 7 0 1114 0 7 7 0 01-14 0z M15 15l7 7',
    'search-electrical':'M3 10a7 7 0 1114 0 7 7 0 01-14 0z M15 15l7 7M11 6l-3 5h4l-2 3',
    'seed-box':'M3 11h18v10H3z M12 16V8m0 1q-7 0-6-6 6 0 6 6zm0-1q3-6 7-4-1 5-7 6',
    'seed-vault':'M3 3h18v18H3zM6 6h12v12H6z M10 15q-1-7 6-7 0 6-6 7z',
    'ship-model':'M2 16h20l-5 5H7z M12 14V2l7 11h-7m-2-8-5 8h5',
    'shipping-container':'M2 6h20v13H2z M6 8v9m4-9v9m4-9v9m4-9v9',
    shutters:'M3 4h18v17H3z M5 7h14M5 10h14M5 13h14M5 16h14',
    'snow-pile':'M2 18l4-6 4-1 4-5 8 12z M11 11l3 1 2-2',
    suitcase:'M4 7h16v14H4z M9 7V3h6v4M7 9v10m10-10v10',
    'supply-call-station':'M3 16h18v5H3z M12 16v-6m-6-6q2 9 10 7l-9-9z M14 3q5 0 6 6',
    'supply-drop':'M2 9q1-7 10-7t10 7l-5-1-5 1-5-1z M3 10l6 7m11-7-5 7m-3-7v7m-4 0h8v5H8z',
    swamp:'M2 19q3-4 7-1t8 0l5-1M7 16V6m-3 1 3 3m9 6V8l3-3',
    'the-dam':'M3 3h7l6 15h5v3H3z M4 7h7m-7 4h8m-8 4h9',
    toolbox:'M3 8h18v12H3z M8 8V4h8v4M3 12h18m-10 0v3h2v-3',
    trailer:'M2 5h16v12H2z M18 10h3l1 5v2h-4 M4 19a2 2 0 104 0 2 2 0 00-4 0m12 0a2 2 0 104 0 2 2 0 00-4 0',
    'wicker-basket':'M2 10h20l-4 11H6z M6 10l6-8 6 8m-9 3 1 5m5-5-1 5',
    zipline:'M2 8l20-6M13 5v5m-3 0h6m-3 0-1 7m-5 3 5-3 4 4',
    'cable-lift':'M2 7l20-5M12 5v4m-8 1h16v10H4z M8 12v5m5-5v5',
    flag:'M5 22V3q4-3 8 0t7 0v10q-4 3-8 0t-7 0',
    mountain:'M2 20l8-13 3 4 3-7 6 16z M7 13l3 1 2-2',
    tent:'M2 20 12 3l10 17z M8 20l4-8 4 8',
    lake:'M2 9q3-4 7-1t8 0l5-1M2 14q3-4 7-1t8 0l5-1M2 19q3-4 7-1t8 0l5-1',
    telescope:'M3 11l15-8 4 7-15 8z M11 16v4m0-4-5 6m5-6 5 6',
    cassette:'M2 5h20v14H2z M6 10a2 2 0 104 0 2 2 0 00-4 0m8 0a2 2 0 104 0 2 2 0 00-4 0M6 18l2-3h8l2 3',
    footsteps:'M5 3q5-3 6 4l-2 4-4-1z M5 13h4v3H5z M15 9q5-3 5 3l-1 5-4-1z M15 19h3v3h-3z',
    bee:'M6 13q1-7 8-5t5 8q-6 8-12 2l-4-2z M9 9l6 9m-2-11 5 7M10 7q-3-7 3-5l2 5',
    rubble:'M2 20l4-6 5 2 3-3 8 7z M5 11l3-6 5 2-2 6z M16 5l2-2 3 2-3 3z'
  };
  const colors={sector:'#e9e4c8',exit:'#a6f1bd',loot:'#ffd675',arc:'#ff977c',access:'#94cfe1',resource:'#bee3a0',quest:'#dac4ee'};
  const families=Object.keys(colors);
  const fallback={sector:'sector',exit:'extraction',loot:'box',arc:'arc-sentinel',access:'key',resource:'nature',quest:'quest'};
  const cache=new Map(), outlines=new Map();
  const sheet=new Image();
  sheet.onload=()=>{
    cache.clear();
    window.dispatchEvent(new Event('raidmaps:icons'));
  };
  sheet.src='assets/maps/poi-game-icons.webp';
  document.documentElement.style.setProperty('--rm-game-icon-image','url("'+sheet.src+'")');
  function symbol(kind,group) {
    const k=alias[kind]||kind;
    return game.has(k)||Object.hasOwn(paths,k)?k:fallback[group]||'info';
  }
  function tile(kind) {
    if(cache.has(kind))return cache.get(kind);
    const group=window.RAID_MAP_DATA.types[kind]?.[0]||kind;
    const s=symbol(kind,group), color=colors[group]||'#dcece4';
    const c=document.createElement('canvas');c.width=c.height=128;
    const g=c.getContext('2d');g.scale(128/72,128/72);
    // La bande contient les sept teintes de catégorie, pour des avant-plans identiques en file:// et en HTML assemblé.
    if(game.has(s) && sheet.complete && sheet.naturalWidth){
      const i=game.get(s),row=families.indexOf(group)*6+Math.floor(i/8);
      g.drawImage(sheet,i%8*64,row*64,64,64,12,12,48,48);
    }else {
      const path=paths[s]||paths.sector;
      if(!outlines.has(path))outlines.set(path,new Path2D(path));
      g.save();g.translate(11,11);g.scale(50/24,50/24);g.strokeStyle=color;g.lineWidth=1.9;g.lineJoin=g.lineCap='round';g.stroke(outlines.get(path));g.restore();
    }
    g.globalCompositeOperation='destination-over';g.beginPath();g.arc(36,36,30.8,0,Math.PI*2);g.fillStyle='#101719';g.fill();g.strokeStyle=color;g.lineWidth=4;g.stroke();
    g.beginPath();g.arc(36,36,34.3,0,Math.PI*2);g.fillStyle='#080c0e';g.fill();g.globalCompositeOperation='source-over';
    if(kind==='security-locker'){
      g.globalCompositeOperation='destination-over';
      g.beginPath();g.roundRect(2.5,2.5,67,67,10);g.fillStyle='#211a31';g.fill();
      g.strokeStyle='#e3beff';g.lineWidth=4;g.stroke();
      g.globalCompositeOperation='source-over';
    }
    const entry={canvas:c,symbol:s,game:game.has(s)};
    cache.set(kind,entry);return entry;
  }
  function html(kind) {
    const group=window.RAID_MAP_DATA.types[kind]?.[0]||kind;
    const s=symbol(kind,group),color=colors[group]||'#dcece4';
    let artwork;
    if(game.has(s)){
      const i=game.get(s),sx=(i%8)*100/7,sy=(families.indexOf(group)*6+Math.floor(i/8))*100/41;
      artwork='<i style="background-position:'+sx+'% '+sy+'%"></i>';
    }else {
      artwork='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9"><path d="'+paths[s]+'"></path></svg>';
    }
    return '<span class="rm-picto" style="--poi-color:'+color+'" data-kind-icon="'+kind+'" aria-hidden="true">'+artwork+'</span>';
  }
  window.MapPictos={tile,html,group:colors,ready:()=>sheet.complete&&sheet.naturalWidth>0};
})();
