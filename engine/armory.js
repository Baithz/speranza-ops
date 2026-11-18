/* Établi hors ligne. Les données et toutes les images de référence sont livrées avec l'atlas. */
(() => {
  'use strict';
  const {weapons, mods} = window.ARMORY_DATA;
  const storageKey = 'speranza.armory.v1';
  const roman = ['I', 'II', 'III', 'IV'];
  const slots = {muzzle:'Bouche', grip:'Poignée', magazine:'Chargeur', stock:'Crosse'};
  const categories = {'Assault Rifle':"Fusil d’assaut",'Battle Rifle':'Fusil de combat',SMG:'Mitraillette',Pistol:'Pistolet','Hand Cannon':'Arme de poing',Shotgun:'Fusil à pompe','Sniper Rifle':'Fusil de précision',LMG:'Fusil-mitrailleur',Special:'Arme spéciale'};
  const ammo = {'Light Ammo':'Légères','Medium Ammo':'Moyennes','Heavy Ammo':'Lourdes','Energy Clip':'Énergie','Shotgun Ammo':'Cartouches','Launcher Ammo':'Grenades'};
  const rarity = {Common:'Commun',Uncommon:'Inhabituel',Rare:'Rare',Epic:'Épique',Legendary:'Légendaire'};
  const modes = {'Fully-Automatic':'Automatique','Semi-Automatic':'Semi-automatique','2-Round Burst':'Rafale de 2','3-Round Burst':'Rafale de 3','Slide-Action':'À glissière','Single-Action':'Simple action','Double-Action':'Double action','Pump-Action':'À pompe','Break-Action':'À bascule','Bolt-Action':'À verrou','Lever-Action':'À levier'};
  const names = {verticalRecoil:'Recul vertical',horizontalRecoil:'Recul horizontal',adsSpeed:'Vitesse de visée',baseDispersion:'Dispersion initiale',bulletVelocity:'Vitesse du projectile',clipSize:'Capacité',dispersionRecoveryTime:'Temps de recentrage de la dispersion',distanceUntilFalloff:'Distance avant dégressivité',durabilityBurnRate:'Vitesse d’usure',equipTime:'Temps pour dégainer',fireDispersionGain:'Dispersion ajoutée par tir',fireDispersionMax:'Dispersion maximale',fireRate:'Cadence',noise:'Bruit du tir',recoilRecoveryTime:'Temps de récupération du recul',unequipTime:'Temps pour rengainer'};
  const tips = {dolabra:'Le tir libre et la visée produisent deux profils de faisceau. La fiche du wiki donne respectivement 50 et 40 dégâts. Leur portée dépend de la concentration du faisceau.',hullcracker:'Le projectile explose au contact d’un ARC. Le wiki donne 100 dégâts explosifs de référence.',rascal:'Le projectile explose au contact d’un ARC. Le wiki donne 75 dégâts explosifs de référence.',arpeggio:'La pause entre les rafales limite la cadence soutenue.',aphelion:'Le cycle de tir comprend une pause entre chaque rafale.',venator:'Un appui consomme une munition et libère deux projectiles.',bantam:'La cadence du revolver varie au fil des tirs.',rattler:'Le chargement se fait deux balles à la fois.',ferro:'Le rechargement entre chaque tir détermine la cadence réelle.',torrente:'La position accroupie facilite le contrôle du tir.'};
  const sortedWeapons = Object.keys(weapons).sort((a,b)=>weapons[a].name.localeCompare(weapons[b].name,'fr'));
  const fmt = (v,prec=1) => Number.isFinite(v) ? v.toLocaleString('fr-FR',{maximumFractionDigits:prec}) : '—';
  const esc = v => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const plain = o => o !== null && typeof o==='object' && !Array.isArray(o);
  const copy = x => JSON.parse(JSON.stringify(x));
  const defaultState = () => ({
    version:1, mode:'same', distance:30, target:'body', saved:[],
    builds:[{weapon:'tempest',tier:1,mods:{}},{weapon:'tempest',tier:1,mods:{magazine:'extended_medium_mag_ii',grip:'angled_grip_ii'}}],
    alternate:[{weapon:'rattler',tier:1,mods:{}},{weapon:'tempest',tier:1,mods:{magazine:'extended_medium_mag_ii',grip:'angled_grip_ii'}}]
  });
  let root, current = defaultState(), storageWarning = '', notice = '';
  const amplifications = [null,null];
  let guideId=null;
  let benchPage='builds';
  function benchPanels(){
    const names={builds:'Montages A et B',results:'Résultats',saved:'Enregistrés'};
    return '<div class="wa-pages" role="group" aria-label="Sections du banc">'+Object.entries(names).map(([id,label])=>
      '<button type="button" data-action="bench-page" data-page="'+id+'" aria-pressed="'+(benchPage===id)+'">'+label+'</button>').join('')+'</div>';
  }
  function showBenchPage(page){
    benchPage=page;
    for(const section of root.querySelectorAll('[data-bench-page]'))section.hidden=section.dataset.benchPage!==page;
    for(const button of root.querySelectorAll('[data-action="bench-page"]'))button.setAttribute('aria-pressed',String(button.dataset.page===page));
  }
  const owned = (o,k) => Object.prototype.hasOwnProperty.call(o,k);
  function validBuild(b) {
    if (!plain(b) || typeof b.weapon!=='string' || !owned(weapons,b.weapon) || !Number.isInteger(b.tier) || b.tier<1 || b.tier>weapons[b.weapon].tiers.length || !plain(b.mods)) return false;
    return Object.entries(b.mods).every(([slot,id])=>owned(weapons[b.weapon].slots,slot) && typeof id==='string' && weapons[b.weapon].slots[slot].includes(id));
  }
  const validDistance = v => Number.isInteger(v) && v>=0 && v<=250;
  const validTarget = v => ['body','head'].includes(v);
  const validMode = v => v===undefined || v==='same' || v==='free';
  function validPair(pair,mode) {
    return Array.isArray(pair) && pair.length===2 && pair.every(validBuild) &&
      (mode!=='same' || (pair[0].weapon===pair[1].weapon && pair[0].tier===pair[1].tier));
  }
  function validatePreset(p) {
    return plain(p) && typeof p.name==='string' && p.name.trim().length>0 && p.name.length<=60 &&
      validMode(p.mode) && validPair(p.builds,p.mode) &&
      (p.distance===undefined || validDistance(p.distance)) && (p.target===undefined || validTarget(p.target));
  }
  function validateState(s) {
    return plain(s) && s.version===1 && validMode(s.mode) && validPair(s.builds,s.mode) &&
      (s.alternate===undefined || validPair(s.alternate,s.mode==='same'?'free':'same')) &&
      validDistance(s.distance) && validTarget(s.target) && Array.isArray(s.saved) && s.saved.length<=100 && s.saved.every(validatePreset);
  }
  function decode(s) {return {...copy(s),mode:s.mode||'free'};}
  try {
    const raw=localStorage.getItem(storageKey);
    if (raw) { const saved=JSON.parse(raw); if (validateState(saved)) current=decode(saved); else storageWarning='Sauvegarde de l’armurerie illisible.'; }
  } catch {storageWarning='Le stockage local est indisponible. Utilise l’export de l’atlas.';}
  function persist() {
    try {localStorage.setItem(storageKey,JSON.stringify(current)); storageWarning='';}
    catch {storageWarning='Le navigateur refuse l’enregistrement. Exporte ton atlas pour garder tes montages.';}
  }
  function importState(s,write=true) {
    if (!validateState(s)) throw Error('Montages d’armes invalides.');
    current=decode(s); amplifications.fill(null); if(write)persist();else storageWarning=''; if(root) render(); return true;
  }
  function fitBuild(b,weapon,tier) {
    const compatible=weapons[weapon].slots;
    return {weapon,tier,mods:Object.fromEntries(Object.entries(b.mods).filter(([slot,id])=>compatible[slot]?.includes(id)))};
  }
  function switchMode(next) {
    if(next===current.mode) return;
    const previous=current.builds, ref=previous[0];
    current.builds=current.alternate || previous.map(b=>fitBuild(b,ref.weapon,ref.tier));
    current.alternate=previous;
    current.mode=next;
    amplifications.fill(null);
  }
  function changeReference(weapon,tier) {
    current.builds=current.builds.map(b=>fitBuild(b,weapon,tier));
    amplifications.fill(null);
  }
  function equipFromBlueprint(weapon,id=null) {
    if(!owned(weapons,weapon)) throw Error('Arme inconnue.');
    const slot=Object.keys(weapons[weapon].slots).find(k=>weapons[weapon].slots[k].includes(id));
    if(id && !slot) throw Error('Accessoire incompatible.');
    guideId=null;benchPage='builds';
    const a=current.builds[0];
    if(a.weapon!==weapon){
      if(current.mode==='same') changeReference(weapon,1);
      else current.builds[0]={weapon,tier:1,mods:{}};
    }
    if(slot)current.builds[0].mods[slot]=id;
    persist(); if(root)render();
  }
  function compute(b) {
    const w=weapons[b.weapon], t=w.tiers[b.tier-1], selected=Object.values(b.mods).map(id=>mods[id]);
    const effects=selected.flatMap(m=>m.effects);
    const bonus=stat=>effects.filter(e=>e.stat===stat).reduce((a,e)=>a+(e.direction==='down'?-1:1)*e.amount,0);
    const range=1+bonus('distanceUntilFalloff')/100;
    return {w,t,selected, mag:t.mag+bonus('clipSize'), mass:w.mass+selected.reduce((a,m)=>a+m.mass,0), rpm:t.rpm==null?null:t.rpm*(1+bonus('fireRate')/100), range,
      velocity:t.ballisticSpeed*(1+bonus('bulletVelocity')/100), draw:w.draw==null?null:w.draw*(1+bonus('equipTime')/100)};
  }
  function damage(model,distance,head) {
    const w=model.w;
    if (!w.curve || (head && w.head==null)) return null;
    const d=distance/model.range;
    let factor=w.curve.at(-1)[1];
    for(let i=1;i<w.curve.length;i++){
      const [x,y]=w.curve[i], [px,py]=w.curve[i-1];
      if(d<=x){factor=py+(y-py)*(d-px)/(x-px||1);break;}
    }
    return w.dmg*factor*(head?w.head:1);
  }
  const label = (id) => weapons[id].name;
  const wikilink = en => 'https://arcraiders.wiki/wiki/'+encodeURIComponent(en.replaceAll(' ','_'));
  const href = (url,title) => '<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(title)+' ↗</a>';
  const option = (value,text,selected) => '<option value="'+esc(value)+'"'+(selected?' selected':'')+'>'+esc(text)+'</option>';
  const over = text=>'<span class="wa-eyebrow">'+text+'</span>';
  const modeName = mode => mode==='same'?'Même arme':'Deux armes';
  const signed = (n,precision=2) => n===0?'0':(n>0?'+':'−')+fmt(Math.abs(n),precision);
  const valueOf = e => e.amount*(e.direction==='down'?-1:1);
  function weaponControls(b,index) {
    const shared=index==='shared', who=shared?'commune':'du montage '+(index?'B':'A');
    const w=weapons[b.weapon], attr=' data-build="'+index+'" ';
    const opts=sortedWeapons.map(id=>option(id,label(id)+(label(id).toLowerCase()!==weapons[id].en.toLowerCase()?' / '+weapons[id].en:''),id===b.weapon)).join('');
    const ranks=w.tiers.map((_,k)=>option(k+1,w.tiers.length===1?'Fixe':roman[k],b.tier===k+1)).join('');
    return '<div class="wa-choose"><label>'+over(shared?'Arme commune':'Arme')+'<select aria-label="Arme '+who+'"'+attr+'data-field="weapon">'+opts+'</select></label><label>'+over(shared?'Rang commun':'Rang')+'<select aria-label="Rang '+(shared?'commun':who)+'"'+attr+'data-field="tier" '+(w.tiers.length===1?'disabled':'')+'>'+ranks+'</select></label></div>';
  }
  function modeBar() {
    const same=current.mode==='same', b=current.builds[0], w=weapons[b.weapon];
    const buttons=['same','free'].map(m=>'<button data-action="mode" data-mode="'+m+'" type="button" aria-pressed="'+(m===current.mode)+'">'+modeName(m)+'</button>').join('');
    return '<section class="wa-mode-box"><div class="wa-mode-row"><div>'+over('PROTOCOLE DE COMPARAISON')+'<p>'+(same?'Isole l’effet des accessoires sur une arme de même rang.':'Équipe chaque arme et règle son rang indépendamment.')+'</p></div><div class="wa-modes" role="group" aria-label="Mode de comparaison">'+buttons+'</div></div>'+
      (same?'<div class="wa-reference"><div class="wa-ref-img"><span>+ &nbsp; REF / 01</span><img alt="'+esc(w.name)+'" src="'+w.img+'"></div><div class="wa-ref-controls">'+weaponControls(b,'shared')+'<p>'+esc(categories[w.cat])+' · '+esc(modes[w.mode])+' · Munitions '+esc((ammo[w.ammo]||w.ammo).toLowerCase())+'</p></div></div>':'')+'</section>';
  }
  function effectGroups() {
    const rows=new Map();
    for(const [side,b] of current.builds.entries()){
      for(const id of Object.values(b.mods)){
        for(const effect of mods[id].effects){
          if(!rows.has(effect.stat)) rows.set(effect.stat,[[],[]]);
          rows.get(effect.stat)[side].push({id,effect});
        }
      }
    }
    return rows;
  }
  function isolatedDelta() {
    const [a,b]=current.builds.map(compute);
    const rows=[
      ['Chargeur',a.mag,b.mag,'mun.',1],['Cadence',a.rpm,b.rpm,'c/min',1],
      ['Projectile',a.velocity,b.velocity,'m/s',1],['Dégainer',a.draw,b.draw,'s',-1],
      ['Poids',a.mass,b.mass,'kg',-1]
    ];
    const changed=rows.filter(([,left,right])=>Number.isFinite(left)&&Number.isFinite(right)&&Math.abs(right-left)>0.00001);
    const chips=changed.map(([name,left,right,unit,direction])=>{
      const diff=right-left, gain=diff*direction>0;
      return '<div data-compare-stat="'+name+'" class="wa-delta-chip '+(gain?'wa-gain':'wa-cost')+'"><span>'+name+'</span><strong>'+signed(diff)+' <small>'+unit+'</small></strong><em>'+(gain?'Gain':'Coût')+' · B − A</em></div>';
    }).join('');
    return '<div class="wa-delta-ribbon"><div>'+over('ÉCART B − A')+'<b>Mesures équipées</b></div>'+(chips||'<p>Capacité, cadence, vitesse, temps pour dégainer et poids comparables sont identiques. Les effets sur la maniabilité figurent ci-dessous.</p>')+'</div>';
  }
  function modAnalysis() {
    const groups=effectGroups();
    const order=['horizontalRecoil','verticalRecoil','baseDispersion','fireDispersionGain','fireDispersionMax','adsSpeed','dispersionRecoveryTime','recoilRecoveryTime'];
    const keys=[...order.filter(k=>groups.has(k)),...[...groups.keys()].filter(k=>!order.includes(k))];
    function row(stat) {
      const [a,b]=groups.get(stat), nodes=[...a,...b], sample=nodes[0].effect;
      const percent=sample.unit==='percent', unit=percent?' %':' mun.';
      const max=Math.max(1,...nodes.map(n=>n.effect.amount));
      const equal=a.length===b.length && a.map(n=>n.id).sort().join()===b.map(n=>n.id).sort().join();
      const known=a.length<=1 && b.length<=1;
      const delta=(b[0]?valueOf(b[0].effect):0)-(a[0]?valueOf(a[0].effect):0);
      const favorable=sample.benefit==='positive'?sample.direction==='up':sample.direction==='down';
      const deltaClass=delta===0?'':(delta>0)===favorable?'wa-gain':'wa-cost';
      const detail=(side,list)=>'<div class="wa-contribution"><span class="wa-side-label">'+side+'</span><div>'+ (list.length?
        list.map(n=>'<span class="wa-contrib-name">'+esc(mods[n.id].name)+'</span><span class="wa-contrib-fx '+(n.effect.benefit==='positive'?'wa-gain':'wa-cost')+'"><i style="--wa-pct:'+fmt(Math.round(n.effect.amount*100/max))+'%"></i><b>'+signed(valueOf(n.effect))+unit+'</b></span>').join(''):
        '<span class="wa-none">Sans modificateur</span>')+'</div></div>';
      let verdict='<span class="wa-stacking">Cumul non établi</span>';
      if(equal || (known&&delta===0)) verdict='<span class="wa-same">Identique</span>';
      else if(known) verdict='<span class="wa-mod-delta '+deltaClass+'">'+signed(delta)+(percent?' pt'+(Math.abs(delta)>1?'s':''):' mun.')+'<small>'+ (deltaClass==='wa-gain'?'Avantage B':'Contrepartie B')+'</small></span>';
      return '<div class="wa-influence-row"><div class="wa-influence-name">'+esc(names[stat]||stat)+'</div>'+detail('A',a)+detail('B',b)+'<div class="wa-influence-result">'+verdict+'</div></div>';
    }
    return '<section class="wa-influence"><div class="wa-influence-head"><div>'+over('DIAGNOSTIC DES ACCESSOIRES')+'<h3>Avantages et contreparties</h3></div><span class="wa-count">B − A</span></div>'+
      (keys.length?'<p>Les écarts en points comparent les bonus annoncés sur la même arme. Quand plusieurs pièces agissent sur une valeur, leurs effets sont détaillés séparément.</p><div class="wa-influence-table">'+keys.map(row).join('')+'</div>':
      '<p>Les deux configurations sont sans accessoire. Équipe une pièce sur A ou B pour afficher son effet, sa valeur et son éventuelle contrepartie.</p>')+'</section>';
  }
  const ico = (type) => {
    const d={muzzle:'M3 8h15v8H3z M6 8V5h12v3 M7 16v3h10v-3 M18 10h3v4h-3',grip:'M5 5h14v4h-6l2 10h-5L8 9H5z',magazine:'M7 3h11l-2 15-5 3-6-3z M8 6h8 M8 10h7 M7 14h7',stock:'M3 9h13l5-4v14l-5-5H9l-4 3H3z'};
    return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><path d="'+d[type]+'"/></svg>';
  };
  const matList = mats => mats.map(([k,n])=>fmt(n)+' × '+esc(k)).join(' · ');
  function effects(mod){
    return mods[mod].effects.map(e=>'<span class="wa-effect '+(e.benefit==='negative'?'cost':'gain')+'">'+esc(names[e.stat]||e.stat)+' <b>'+(e.direction==='down'?'−':'+')+fmt(e.amount)+(e.unit==='percent'?' %':'')+'</b></span>').join('');
  }
  function slotControl(b,i,slot) {
    const id=b.mods[slot], allowed=weapons[b.weapon].slots[slot];
    return '<label class="wa-slot"><span class="wa-slot-art">'+(id?'<img src="'+mods[id].img+'" alt="">':ico(slot))+'</span><span>'+over(slots[slot])+'<select aria-label="'+slots[slot]+' du montage '+(i?'B':'A')+'" data-build="'+i+'" data-field="'+slot+'">'+option('','Aucun accessoire',!id)+allowed.map(k=>option(k,mods[k].name,k===id)).join('')+'</select></span></label>';
  }
  function amped(b,i) {
    const w=weapons[b.weapon], initial=b.weapon+'_amplified';
    if (!w.amp[initial]) return '';
    const node=w.amp[amplifications[i]]?amplifications[i]:initial;
    const model=w.amp[node], cost=w.tiers.at(-1).next;
    return '<details class="wa-details wa-amp"><summary>Arbre d’amplification</summary><div>'+over('APRÈS LE RANG STANDARD')+'<p>Armurier et poste de recherche niveau 4. Passage en version amplifiée avec '+matList(cost)+'. Les choix en jeu sont permanents.</p><label>'+over('Branche à examiner')+'<select data-build="'+i+'" data-field="amp" aria-label="Branche amplifiée '+(i?'B':'A')+'">'+Object.entries(w.amp).map(([k,a])=>option(k,a.name,k===node)).join('')+'</select></label>'+ (model.choices.length?'<ul>'+model.choices.map(c=>'<li><b>'+esc(w.amp[c.to]?.name||'Évolution')+'</b><small>'+matList(c.cost)+(c.requires.length?' · Recherche requise — '+esc(c.requires.join(', ')):'')+'</small></li>').join('')+'</ul>':'<p>Fin de cette branche documentée.</p>')+'<small>Consultation des évolutions. Les calculs ci-dessous utilisent les armes standard.</small></div></details>';
  }
  function buildCard(b,i) {
    const model=compute(b), {w,t}=model, letter=i?'B':'A', chosen=Object.values(b.mods);
    const same=current.mode==='same';
    const stage='<div class="wa-stage"><span class="wa-stage-num">0'+(i+1)+'</span><span class="wa-cross">+</span><img src="'+w.img+'" alt="Vue de référence de '+esc(w.name)+'"><span class="wa-stage-id">FIG. '+letter+' / '+esc(w.en.toUpperCase())+'</span></div>';
    return '<article class="wa-card wa-'+letter+'"><header class="wa-card-head">'+over((same?'CONFIGURATION ':'MONTAGE ')+letter)+'<span>'+esc(same?w.name+' · '+(w.tiers.length===1?'Rang fixe':roman[b.tier-1]):rarity[w.rarity])+'</span></header>'+(same?'':stage)+'<div class="wa-body">'+(same?'':weaponControls(b,i))+'<div class="wa-metadata" '+(same?'hidden':'')+'>'+esc(categories[w.cat]||w.cat)+' <i></i> '+esc(modes[w.mode]||w.mode)+' <i></i> '+esc(ammo[w.ammo]||w.ammo)+'</div><div class="wa-slot-title">'+over('ACCESSOIRES')+'<span>'+String(chosen.length).padStart(2,'0')+' / '+String(Object.keys(w.slots).length).padStart(2,'0')+'</span></div><div class="wa-slots">'+Object.keys(slots).filter(s=>w.slots[s]?.length).map(s=>slotControl(b,i,s)).join('')+'</div>'+(!Object.keys(w.slots).length?'<p class="wa-muted">Cette arme ne possède aucun emplacement classique.</p>':'')+
    '<div class="wa-readouts"><div>'+over('Chargeur')+'<strong>'+fmt(model.mag)+' <small>mun.</small></strong></div><div>'+over('Cadence')+'<strong>'+fmt(model.rpm)+' <small>c/min</small></strong></div><div>'+over('Poids équipé')+'<strong>'+fmt(model.mass,2)+' <small>kg</small></strong></div></div>'+
    '<details class="wa-details"><summary>Effets et fabrication'+(chosen.length?' ('+chosen.length+')':'')+'</summary><div>'+(tips[b.weapon]?'<p>'+tips[b.weapon]+'</p>':'')+(w.starter.length?'<p><b>Fabrication de l’arme de base</b><small>'+matList(w.starter)+'</small></p>':'')+(chosen.length?chosen.map(id=>'<div class="wa-mod-info"><b>'+esc(mods[id].name)+'</b><div>'+effects(id)+'</div><small>'+(mods[id].recipe.length?'Armurier '+(mods[id].bench||'')+' · '+matList(mods[id].recipe):'Recette de fabrication non référencée.')+'</small></div>').join(''):'<p>Ajoute un accessoire pour afficher ses effets et ses matériaux.</p>')+href(wikilink(w.en),'Fiche illustrée du wiki')+' · '+href('https://arctracker.io/items/'+t.ref,'Données de l’arme')+'</div></details>'+amped(b,i)+(window.ARMORY_PROFILES?'<button type="button" class="wa-quick-guide" data-action="guide" data-guide="'+b.weapon+'">Fiche de combat · '+esc(w.name)+' ↗</button>':'')+'</div></article>';
  }
  function science() {
    const m=current.builds.map(compute), head=current.target==='head', d=current.distance;
    const dmg=m.map(x=>damage(x,d,head)), maximum=Math.max(1,...m.flatMap(x=>Array.from({length:51},(_,i)=>damage(x,i*5,head)||0)));
    const points=x=>Array.from({length:101},(_,i)=> (12+i*4.76).toFixed(1)+','+(98-83*(damage(x,i*2.5,head)||0)/maximum).toFixed(1)).join(' ');
    const graphs=m.map((x,i)=>x.w.curve?'<polyline class="line-'+i+'" vector-effect="non-scaling-stroke" points="'+points(x)+'"/>':'').join('');
    const stats=[['Dégâts à '+d+' m',dmg,' pts'],['Chargeur',m.map(x=>x.mag),' mun.'],['Cadence mécanique',m.map(x=>x.rpm),' c/min'],['Vitesse initiale',m.map(x=>x.w.curve?x.velocity:null),' m/s'],['Poids équipé',m.map(x=>x.mass),' kg'],['Dégainer',m.map(x=>x.draw),' s'],['Mult. tête',m.map(x=>x.w.curve?x.w.head:null),' ×'],['Mult. sur plaque ARC',m.map(x=>x.w.armor),' ×']];
    return '<div class="wa-lab-top"><div>'+over('03 / TÉLÉMÉTRIE')+'<h3>Profil balistique</h3></div><div class="wa-target" aria-label="Zone d’impact">'+['body','head'].map((t,k)=>'<button type="button" data-action="target" data-target="'+t+'" aria-pressed="'+(current.target===t)+'">'+(k?'Tête':'Torse')+'</button>').join('')+'</div></div><div class="wa-lab-layout"><div class="wa-chart"><div class="wa-chart-meta">'+over('DÉGÂTS THÉORIQUES / TIR')+'<b>'+fmt(d)+' m</b></div><div class="wa-svg-box"><span class="wa-scale">'+fmt(maximum)+' pts</span><span class="wa-zero">0</span><svg viewBox="0 0 500 110" preserveAspectRatio="none" role="img" aria-label="Courbes de dégâts en fonction de la distance"><path class="wa-lines" d="M12 15H488M12 43H488M12 70H488M12 98H488M12 8V98M107 8V98M202 8V98M298 8V98M393 8V98M488 8V98"/>'+graphs+'<path class="wa-cursor" vector-effect="non-scaling-stroke" d="M'+(12+d*1.904)+' 8V98"/></svg></div><div class="wa-axis"><span>0 m</span><span>125 m</span><span>250 m</span></div><label class="wa-range"><span>Distance d’engagement</span><input aria-label="Distance d’engagement en mètres" data-distance type="range" min="0" max="250" step="1" value="'+d+'"></label><div class="wa-legend">'+m.map((x,i)=>'<span class="wa-'+(i?'B':'A')+'"><i></i>'+(i?'B':'A')+' · '+esc(x.w.name)+'</span>').join('')+'</div></div><div class="wa-metrics">'+stats.map(([name,values,unit])=>{const max=Math.max(1,...values.map(v=>v||0));return '<div class="wa-metric"><div><span>'+esc(name)+'</span><b>'+fmt(values[0],2)+(values[0]==null?'':unit)+' <em>/</em> <i>'+fmt(values[1],2)+(values[1]==null?'':unit)+'</i></b></div>'+values.map((v,k)=>'<div class="wa-meter '+(k?'wa-B':'wa-A')+'"><i style="width:'+((v||0)*100/max).toFixed(2)+'%"></i></div>').join('')+'</div>';}).join('')+'</div></div><details class="wa-details"><summary>Hypothèses et données techniques</summary><div><p>La courbe interpole les coefficients de distance d’ARC Tracker. Elle suppose que tous les projectiles atteignent la zone choisie sur une cible sans bouclier. Un canon allongé décale la distance selon le pourcentage annoncé. Les explosifs anti-ARC et le faisceau variable du Dolabra sont hors modèle. Un tiret signale une valeur non comparable ou indisponible.</p><p>La cadence mécanique exclut les pauses, les rechargements et le délai entre les clics. La capacité, la vitesse initiale, le poids et le temps pour dégainer tiennent compte du montage. Les bonus de recul et de dispersion figurent accessoire par accessoire dans « Effets et fabrication ».</p>'+m.map((x,i)=>'<p><b>'+ (i?'B':'A')+' · '+esc(x.w.name)+'</b><small>Valeur de référence '+fmt(x.w.dmg)+' dégâts'+(x.w.pellets>1&&current.builds[i].weapon!=='dolabra'?' · '+x.w.pellets+' projectiles par tir':'')+' · Durée de vie indicative sans accessoire '+fmt(x.t.dur)+' tirs'+(tips[current.builds[i].weapon]?' · '+tips[current.builds[i].weapon]:'')+'</small></p>').join('')+'<p>Instantané balistique du 28 octobre 2026. Illustrations et univers du jeu © Embark Studios.</p>'+href('https://arctracker.io/developers/docs','API ARC Tracker')+' · '+href('https://arcraiders.wiki/wiki/Weapons','Wiki des armes')+' · '+href('https://arcraiders.wiki/wiki/Amplified_Weapons','Amplifications')+'</div></details>';
  }
  function guideTabs() {
    if(!window.ARMORY_PROFILES)return '';
    const tab=(action,text,selected)=>'<button type="button" data-action="'+action+'" aria-pressed="'+selected+'">'+text+'</button>';
    return '<div class="wa-guide-tabs" role="group" aria-label="Écran de l’armurerie">'+tab('bench','Banc d’essai',!guideId)+tab('guide','Fiches de combat',!!guideId)+'</div>';
  }
  function openGuide(id) {
    if(typeof id!=='string'||!owned(weapons,id)||!window.ARMORY_PROFILES?.[id])return false;
    guideId=id;
    if(root)render();
    return true;
  }
  function targetCard(id,advice) {
    const e=window.BESTIARY_DATA?.find(x=>x.id===id);
    if(!e)return '<article class="wa-target-card"><h4>'+esc(id)+'</h4><p>'+esc(advice)+'</p></article>';
    return '<article class="wa-target-card"><div class="wa-enemy-top"><img src="'+esc(e.image)+'" alt=""><div>'+over('CIBLE ARC')+'<h4>'+esc(e.name)+'</h4></div></div><p>'+esc(advice)+'</p><p class="wa-guide-zone"><b>Où la rencontrer</b> '+esc(e.zone)+'</p><button type="button" data-action="guide-enemy" data-enemy="'+esc(id)+'">Ouvrir le bestiaire ↗</button></article>';
  }
  function guideScreen() {
    const id=guideId, w=weapons[id], p=window.ARMORY_PROFILES[id], t=w.tiers[0], index=sortedWeapons.indexOf(id);
    const choose=sortedWeapons.map(key=>option(key,weapons[key].name+(weapons[key].name.toLowerCase()===weapons[key].en.toLowerCase()?'':' / '+weapons[key].en),key===id)).join('');
    const options=p.parts.map(id=>{
      const m=mods[id];
      return '<article class="wa-kit-piece"><img alt="" src="'+m.img+'"><div><h4>'+esc(m.name)+'</h4><div>'+effects(id)+'</div></div></article>';
    }).join('');
    const curve=w.curve?.slice(-2);
    const falloff=curve?'Entre '+fmt(curve[0][0])+' et '+fmt(curve[1][0])+' m, la courbe de référence baisse vers '+fmt(curve[1][1]*100)+' % des dégâts de base. La dispersion peut déjà te faire manquer des impacts avant cette distance.':'La courbe standard ne décrit pas les dégâts de cette arme. '+(tips[id]||'');
    const stat=(n,v)=>'<div><span>'+n+'</span><strong>'+esc(v)+'</strong></div>';
    const srcs=[href(wikilink(w.en),'Fiche '+w.en),href('https://arctracker.io/items/'+t.ref,'Balistique et compatibilités'),href('https://arcraiders.com/news/frozen-trail-2-0-update','Notes Embark · Frozen Trail')];
    for(const [enemy] of p.targets){
      const e=window.BESTIARY_DATA?.find(x=>x.id===enemy);
      if(e?.sources?.[0]?.[1])srcs.push(href(e.sources[0][1],'Anatomie · '+e.name));
    }
    return '<div class="wa-shell wa-guide">'+guideTabs()+
      '<div class="wa-guide-controls"><div>'+over('ARMURERIE / MANUEL DE TERRAIN')+'<h2>Fiches de combat</h2></div><div class="wa-choose-file"><button type="button" data-action="guide-prev" aria-label="Arme précédente">←</button><label>'+over('Choisir une arme')+'<select data-guide-weapon aria-label="Choisir une fiche d’arme">'+choose+'</select></label><button type="button" data-action="guide-next" aria-label="Arme suivante">→</button></div></div>'+
      '<section class="wa-guide-hero"><div class="wa-guide-copy">'+over('DOSSIER '+String(index+1).padStart(2,'0')+' / 26')+'<h3>'+esc(w.name)+'</h3><p>'+esc(p.role)+'</p><div class="wa-guide-tags"><span>'+esc(p.range)+'</span><span>'+esc(categories[w.cat]||w.cat)+'</span></div></div><div class="wa-guide-figure"><span aria-hidden="true">+</span><img src="'+w.img+'" alt="Arme '+esc(w.name)+'"><small>FIG. '+String(index+1).padStart(2,'0')+' / '+esc(w.en.toUpperCase())+'</small></div></section>'+
      '<div class="wa-guide-stats">'+stat('Munitions',ammo[w.ammo]||w.ammo)+stat('Mode de tir',modes[w.mode]||w.mode)+stat(w.tiers.length===1?'Chargeur fixe':'Chargeur au rang I',fmt(t.mag)+' mun.')+stat('Poids nu',fmt(w.mass)+' kg')+'</div>'+
      '<section class="wa-orders"><article>'+over('01 / POSITION')+'<h4>Choisir le terrain</h4><p>'+esc(p.terrain)+'</p></article><article>'+over('02 / OUVERTURE')+'<h4>Prendre le premier tir</h4><p>'+esc(p.opening)+'</p></article><article>'+over('03 / CONTACT RAIDER')+'<h4>Gérer le duel</h4><p>'+esc(p.raiders)+'</p></article></section>'+
      '<div class="wa-section-head">'+over('BRIEFING / ARC')+'<h3>Cibles et ouvertures</h3></div><div class="wa-enemies">'+p.targets.map(([e,tactic])=>targetCard(e,tactic)).join('')+'</div>'+
      '<section class="wa-guide-kit"><div>'+over('ARMURIER / PRÉPARATION')+'<h3>'+ (options?'Accessoires conseillés':'Configuration de série')+'</h3></div><p>'+esc(p.trade)+'</p>'+(options?'<div class="wa-kit-grid">'+options+'</div>':'')+'<div class="wa-kit-action"><button type="button" data-action="guide-try">Tester '+(options?'ce montage':'cette arme')+' dans A →</button><span>'+ (current.mode==='same'?'Mode « Même arme » actif. A et B partageront cette arme.':'Le montage B garde son arme et ses accessoires.')+'</span></div></section>'+
      '<section class="wa-guide-proof"><div>'+over('LECTURE BALISTIQUE')+'<p>'+esc(falloff)+'</p></div><div>'+over('SOURCES')+'<p>Les positions et les montages sont des propositions tactiques de l’atlas. Les zones décrivent des rencontres possibles. Données balistiques du 28 octobre 2026.</p><div>'+srcs.join(' · ')+'</div></div></section></div>';
  }
  function tryGuide() {
    const id=guideId, p=window.ARMORY_PROFILES[id], a=current.builds[0], tier=a.weapon===id?a.tier:1;
    if(current.mode==='same')changeReference(id,tier);
    const loadout={};
    for(const part of p.parts){
      const slot=Object.keys(weapons[id].slots).find(s=>weapons[id].slots[s].includes(part));
      if(slot)loadout[slot]=part;
    }
    current.builds[0]={weapon:id,tier,mods:loadout};guideId=null;benchPage='builds';
    notice='Montage du guide installé sur A.';persist();render();
  }
  function restock(){
    const r=root.querySelector('.wa-saved');
    r.innerHTML='<div>'+over('MÉMOIRE LOCALE')+'<h3>Montages enregistrés</h3></div><form data-save><input name="name" type="text" maxlength="60" required placeholder="Nom de la comparaison" aria-label="Nom de la comparaison"><button type="submit">Enregistrer A + B</button></form><div class="wa-presets">'+current.saved.map((p,i)=>'<div><span><b>'+esc(p.name)+'</b><small>'+modeName(p.mode)+' · '+esc(p.builds.map(b=>weapons[b.weapon].name).join(' / '))+(p.distance===undefined?'':' · '+p.distance+' m')+'</small></span><button type="button" data-action="load" data-index="'+i+'">Charger</button><button type="button" data-action="delete" data-index="'+i+'" aria-label="Supprimer '+esc(p.name)+'">×</button></div>').join('')+'</div>';
  }
  function render() {
    if(guideId){root.innerHTML=guideScreen();return;}
    const previous=new Map(Array.from(root.querySelectorAll('[data-compare-stat]'),el=>[el.dataset.compareStat,el.textContent]));
    const wasComparing=!!root.querySelector('.wa-delta-ribbon');
    const active=document.activeElement;
    const focus=active?.matches?.('[data-build][data-field]')?{i:active.dataset.build,f:active.dataset.field}:null;
    const open=[...root.querySelectorAll('details')].map(d=>d.open);
    root.innerHTML='<div class="wa-shell">'+guideTabs()+
      '<div class="wa-intro"><div><h2>Banc d’essai</h2><p>Équipe deux montages puis compare leurs résultats.</p></div></div>'+benchPanels()+
      '<div data-bench-page="builds">'+modeBar()+(current.mode==='same'?isolatedDelta():'')+
      '<div class="wa-builds">'+current.builds.map(buildCard).join('')+'</div><div class="wa-tools"><button type="button" data-action="clone">Dupliquer A vers B →</button><button type="button" data-action="swap">Échanger A et B</button><button type="button" data-action="bench-page" data-page="results">Voir les résultats →</button></div></div>'+
      '<div data-bench-page="results"><p class="wa-result-names"><b>A · '+esc(weapons[current.builds[0].weapon].name)+'</b> / <b>B · '+esc(weapons[current.builds[1].weapon].name)+'</b></p>'+
      (current.mode==='same'?modAnalysis():'')+'<section class="wa-lab">'+science()+'</section></div>'+
      '<section class="wa-saved" data-bench-page="saved"></section><p class="wa-notice" role="status" aria-live="polite"></p></div>';
    root.querySelectorAll('details').forEach((d,i)=>{d.open=!!open[i];});
    restock();showBenchPage(benchPage);showNotice();
    if(wasComparing&&!window.AtlasMotion?.reduced()){
      for(const el of root.querySelectorAll('[data-compare-stat]')){
        if(previous.get(el.dataset.compareStat)!==el.textContent)el.classList.add('wa-stat-changed');
      }
    }
    if(focus)root.querySelector('[data-build="'+focus.i+'"][data-field="'+focus.f+'"]')?.focus({preventScroll:true});
  }
  function showNotice(){ const el=root.querySelector('.wa-notice'); if(el)el.textContent=[notice,storageWarning].filter(Boolean).join(' '); }
  function handleClick(e){
    const btn=e.target.closest('[data-action]'); if(!btn||!root.contains(btn))return;
    const action=btn.dataset.action, idx=Number(btn.dataset.index);
    if(action==='bench-page'){
      const shortcut=!!btn.closest('[data-bench-page]');showBenchPage(btn.dataset.page);
      if(shortcut)root.querySelector('.wa-pages [aria-pressed="true"]')?.focus();
      return;
    }
    if(action==='bench'){guideId=null;render();root.querySelector('[data-action="bench"]')?.focus({preventScroll:true});return;}
    if(action==='guide'){openGuide(btn.dataset.guide||guideId||current.builds[0].weapon);root.querySelector('[data-action="guide"]')?.focus({preventScroll:true});return;}
    if(action==='guide-prev'||action==='guide-next'){
      const pos=(sortedWeapons.indexOf(guideId)+(action==='guide-next'?1:-1)+sortedWeapons.length)%sortedWeapons.length;
      openGuide(sortedWeapons[pos]);root.querySelector('[data-action="'+action+'"]')?.focus({preventScroll:true});return;
    }
    if(action==='guide-enemy'){window.openAtlasARC?.(btn.dataset.enemy);return;}
    if(action==='guide-try'){tryGuide();root.scrollIntoView({block:'start'});return;}
    if(action==='mode'){
      switchMode(btn.dataset.mode);
      notice='';
    }
    if(action==='clone'){current.builds[1]=copy(current.builds[0]);amplifications[1]=amplifications[0];notice='Montage A copié sur B.';}
    if(action==='swap'){current.builds.reverse();amplifications.reverse();notice='Montages échangés.';}
    if(action==='target'){current.target=btn.dataset.target;notice='';}
    if(action==='load'&&current.saved[idx]){
      benchPage='builds';
      const preset=current.saved[idx];
      switchMode(preset.mode||'free');
      current.builds=copy(preset.builds);
      if(preset.distance!==undefined)current.distance=preset.distance;
      if(preset.target!==undefined)current.target=preset.target;
      amplifications.fill(null);notice='Comparaison chargée.';
    }
    if(action==='delete'&&current.saved[idx]){current.saved.splice(idx,1);notice='Comparaison supprimée.';}
    persist();render();
    if(action==='load'){root.querySelector('.wa-pages [aria-pressed="true"]')?.focus();return;}
    const selector=action==='mode'?'[data-action="mode"][aria-pressed="true"]':action==='target'?'[data-action="target"][data-target="'+current.target+'"]':'[data-action="'+action+'"]';root.querySelector(selector)?.focus({preventScroll:true});
  }
  function handleChange(e){
    const el=e.target;
    if(el.matches('[data-guide-weapon]')){openGuide(el.value);root.querySelector('[data-guide-weapon]')?.focus({preventScroll:true});return;}
    if(el.matches('[data-distance]')){persist();showNotice();return;}
    if(!el.matches('[data-build][data-field]'))return;
    if(el.dataset.build==='shared'){
      const ref=current.builds[0], isWeapon=el.dataset.field==='weapon';
      changeReference(isWeapon?el.value:ref.weapon,isWeapon?1:Number(el.value));
      notice='';persist();render();return;
    }
    const i=Number(el.dataset.build), field=el.dataset.field, b=current.builds[i];
    if(field==='amp'){amplifications[i]=el.value;render();return;}
    if(field==='weapon'){current.builds[i]={weapon:el.value,tier:1,mods:{}};amplifications[i]=null;}
    else if(field==='tier')b.tier=Number(el.value);
    else if(el.value)b.mods[field]=el.value;
    else delete b.mods[field];
    notice='';persist();render();
  }
  function handleInput(e){
    if(!e.target.matches('[data-distance]'))return;
    const lab=root.querySelector('.wa-lab'), range=e.target, open=lab.querySelector('details')?.open;
    current.distance=Number(range.value);
    // Garde le curseur natif actif en place pendant tout le glissement.
    const scratch=document.createElement('div'); scratch.innerHTML=science();
    lab.querySelector('.wa-chart-meta').innerHTML=scratch.querySelector('.wa-chart-meta').innerHTML;
    lab.querySelector('.wa-svg-box').innerHTML=scratch.querySelector('.wa-svg-box').innerHTML;
    lab.querySelector('.wa-metrics').innerHTML=scratch.querySelector('.wa-metrics').innerHTML;
    lab.querySelector('details').open=open;
  }
  function handleSave(e){
    if(!e.target.matches('[data-save]'))return;e.preventDefault();
    const name=new FormData(e.target).get('name')?.trim();
    if(!name){notice='Donne un nom à cette comparaison.';showNotice();return;}
    const match=current.saved.findIndex(p=>p.name.toLowerCase()===name.toLowerCase()), preset={name,mode:current.mode,builds:copy(current.builds),distance:current.distance,target:current.target};
    if(match<0 && current.saved.length>=100){notice='La mémoire contient 100 comparaisons. Supprime-en une pour libérer une place.';showNotice();return;}
    if(match<0)current.saved.unshift(preset);else current.saved[match]=preset;
    notice=match<0?'Comparaison enregistrée.':'Comparaison mise à jour.';persist();restock();showNotice();
  }
  function mount(el){
    if(root!==el){
      if(root){root.removeEventListener('click',handleClick);root.removeEventListener('change',handleChange);root.removeEventListener('input',handleInput);root.removeEventListener('submit',handleSave);}
      root=el;
      root.addEventListener('click',handleClick);root.addEventListener('change',handleChange);root.addEventListener('input',handleInput);root.addEventListener('submit',handleSave);
    }
    render();
  }
  window.Armory={mount,openGuide,equipFromBlueprint,validateState,importState,exportState:()=>copy(current),storageKey,
    validateBuild:validBuild,
    calculate(build,distance=30){
      if(!validBuild(build) || !Number.isFinite(distance) || distance<0 || distance>250)return null;
      const model=compute(build);
      return {damage:damage(model,distance,false),magazine:model.mag,cadence:model.rpm,range:model.range,
        velocity:model.velocity,mass:model.mass,draw:model.draw,projectiles:model.w.pellets,
        armorMultiplier:model.w.armor,effects:copy(model.selected.flatMap(m=>m.effects.map(effect=>({...effect,label:names[effect.stat]||effect.stat}))))};
    }
  };
})();
