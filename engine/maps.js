(() => {
  'use strict';
  const data = window.RAID_MAP_DATA;
  const icons=window.MapPictos;
  if (!data) return;
  const groups = {
    sector:['Secteurs','#e9e4c8','◆'], exit:['Sorties','#a6f1bd','↗'], loot:['Butin','#ffd675','▪'],
    arc:['ARC','#ff977c','▲'], access:['Accès','#94cfe1','✣'], resource:['Ressources','#bee3a0','●'], quest:['Quêtes','#dac4ee','!']
  };
  const mapAliases = {'barrage':'dam-battleground','dam-battlegrounds':'dam-battleground','dam':'dam-battleground','spaceport':'the-spaceport','pendola':'pendola-pass','blue gate':'blue-gate','portail':'blue-gate'};
  const shortNames = {'dam-battleground':'Barrage','the-spaceport':'Port spatial','buried-city':'Ville enfouie','blue-gate':'Portail bleu','stella-montis':'Stella Montis','riven-tides':'Riven Tides','pendola-pass':'Col de Pendola'};
  const terrainCovers={
    'dam-battleground':'assets/maps/nav-dam-battleground.webp','the-spaceport':'assets/maps/nav-the-spaceport.webp',
    'buried-city':'assets/maps/nav-buried-city.webp','blue-gate':'assets/maps/nav-blue-gate.webp',
    'stella-montis':'assets/maps/nav-stella-montis.webp','riven-tides':'assets/maps/nav-riven-tides.webp','pendola-pass':'assets/maps/nav-pendola-pass.webp'
  };
  const terrainTitle=m=>m.id==='riven-tides'?'Littoral de Riven Tides':m.name;
  const knownArc = new Set('snitch wasp hornet pop fireball tick turret rocketeer leaper bastion bombardier spotter sentinel arc-surveyor queen matriarch shredder comet firefly vaporizer arc-turbine bully skulker hydra arc-reclaimer wasp-husk arc-probe arc-courier rocketeer-husk arc-assessor baron-husk deforester-husk arc-frigate harvester emperor arc-orbiter'.split(' '));
  const arcAliases = {'arc-assesor':'arc-assessor','arc-wasp-husk':'wasp-husk','arc-rocketeer-husk':'rocketeer-husk','arc-baron-husk':'baron-husk','harvester-event':'harvester','frigate-cargo':'arc-frigate'};
  const extras = {'arc-assesor':'assessor évaluateur','arc-leaper':'bondisseur','arc-probe':'sonde','arc-courier':'coursier','arc-wasp-husk':'carcasse guêpe'};
  const descriptions = {
    sector:'Le repère situe le secteur. Les conteneurs présents se consultent avec la couche Butin.',
    exit:'Point de sortie répertorié. Vérifie sa disponibilité sur la carte du raid et les conditions d’ouverture.',
    loot:'Emplacement de fouille signalé. Le contenu et la disponibilité peuvent varier d’un raid à l’autre.',
    arc:'Présence ou passage signalé. Une patrouille peut se déplacer. Vérifie la condition de carte avant de partir.',
    access:'Point de passage ou interaction du décor. Les accès verrouillés peuvent nécessiter une clé ou un mécanisme.',
    resource:'Position de collecte signalée. L’objet peut déjà avoir été ramassé pendant le raid.',
    quest:'Emplacement associé à un objectif de quête. Vérifie l’étape active avant de t’y rendre.'
  };
  const typeNotes = {
    'security-locker':'Casier à ouvrir avec la compétence Brèche de sécurité. Les repères indiquent des emplacements possibles. La présence du casier varie selon le raid.',
    'first-wave-cache':'Cherche ces caches pendant un Ouragan. Approche-toi pour écouter leur signal.',
    'flash-freeze-hatch':'Abri de Pendola utilisable pendant le gel soudain. Rejoins-le quand la tempête approche.',
    'hatch-extract':'Trappe d’extraction de Raider. Prévois une clé et vérifie que la condition du raid autorise son ouverture.',
    'roof-hatch':'Trappe de toit reliant deux espaces du bâtiment.',
    'arc-wasp-husk':'Épave de Guêpe déjà neutralisée, à fouiller sur place.',
    'arc-rocketeer-husk':'Épave d’Artificier déjà neutralisé.',
    'arc-baron-husk':'Carcasse d’un Baron, repérable depuis les abords du secteur.'
  };
  const norm = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const breachKind='security-locker';
  const breachLocations={
    'inside staff room':'Salle du personnel','control room':'Salle de contrôle','on the roof':'Toit',
    'in the attic':'Grenier','attic':'Grenier','first floor':'Niveau 1','second floor':'Niveau 2',
    '3rd floor':'Niveau 3','6th floor':'Niveau 6','underground':'Sous-sol',
    'underground locked cellar':'Sous-sol, cave verrouillée','on top of crane':'Sommet de la grue',
    'behind breached door':'Derrière la porte à forcer','in crane control room':'Cabine de commande de la grue',
    'in the key room':'Pièce à clé','key room 208':'Chambre 208, accès à clé'
  };
  extras[breachKind]='brèche de sécurité brèches de sécurité casier de sécurité casiers de sécurité security breach security breaches security lockers';
  const breachTerms=new Set(['breche','breches','breche de securite','breches de securite','casier de securite','casiers de securite','security locker','security lockers','security breach','security breaches']);
  const maps = data.maps.map(m=>{
    const index = new Map();
    const points = m.points.map(([x,y,kind,layer,label,alias,height,locked,oldPosition])=>{
      const [group,fr,en] = data.types[kind];
      let name=label||fr;
      if(kind===breachKind){
        name=label&&norm(label)!=='security breach'?fr+' · '+(breachLocations[norm(label)]||label):fr;
      }
      // Un itinéraire enregistré garde l'identifiant d'origine du relevé, même après un nouvel enregistrement de la carte.
      const [idX,idY]=oldPosition||[x,y];
      const base = [idX.toString(36),idY.toString(36),kind,layer].join('.');
      let id=base, collision=1;
      while (index.has(id)) id=base+'.'+collision++;
      const p={id,x:x/10000,y:y/10000,kind,group,layer,name,height:height||'',locked:!!locked,alias:alias||'',fr,en};
      if(oldPosition)p.previous={x:idX/10000,y:idY/10000};
      p.words=norm([name,label,alias,fr,en,kind,groups[group][0],extras[kind]].join(' '));
      index.set(id,p);
      return p;
    });
    const breachesPerFloor=m.layers.map((_,i)=>points.filter(p=>p.kind===breachKind&&p.layer===i).length);
    return {...m,points,index,breachesPerFloor};
  });
  const findMap = value => {
    const key=norm(value), alias=mapAliases[key]||mapAliases[value];
    return maps.find(m=>m.id===alias||[m.id,m.name,m.en,shortNames[m.id]].some(n=>norm(n)===key));
  };
  const emptyState=()=>({version:1,routes:{}});
  const storageKey='arc.speranza.raidmaps.v1';
  const chartKey='arc.speranza.lastChart.v1';
  let lastChart=null;
  try{
    const choice=JSON.parse(localStorage.getItem(chartKey));
    if(choice&&Number.isInteger(choice.layer)&&maps.find(m=>m.id===choice.id)?.layers[choice.layer])lastChart=choice;
  }catch{}
  let saved=emptyState(), writeOK=true;
  function validateState(v){
    if(!v||v.version!==1||!v.routes||Array.isArray(v.routes)||typeof v.routes!=='object') return false;
    return Object.entries(v.routes).every(([key,ids])=>{
      const m=maps.find(m=>m.id===key);
      return !!m && Array.isArray(ids) && ids.length<=24 && new Set(ids).size===ids.length && ids.every(id=>typeof id==='string' && m.index.has(id));
    });
  }
  try { const s=JSON.parse(localStorage.getItem(storageKey)||'null'); if(validateState(s)) saved=s; } catch { writeOK=false; }
  const clone = v=>JSON.parse(JSON.stringify(v));
  function saveRoutes(){
    try{localStorage.setItem(storageKey,JSON.stringify(saved));writeOK=true;}catch{writeOK=false;}
    window.dispatchEvent(new CustomEvent('raidmaps:change'));
  }
  let host, canvas, ctx, bgImage, observer, frame=0, drawn=[], pointList=[], filtered=[];
  let current=maps[0], layer=0, selected=null, query='', limit=24, zoom=1, cx=.5, cy=.5, message='';
  let legend, hunt, externalQuery=false, view={x:0,y:0,w:1,h:1,width:1,height:1};
  const pointers=new Map();
  let gesture=null, dragging=false, moved=false;
  let duoMarker=null, canvasPingTimer=0;
  let selfPoint=null;
  let table=false, bearing=-18, tilt=0, yaw=0, transition=null;
  let cursorOnStage=null;
  let canvasType=18, badgeType=16, markerSize=40;
  function readingMetrics(){
    const rootSize=parseFloat(getComputedStyle(document.documentElement).fontSize)||20;
    canvasType=Math.max(16,rootSize*.9);badgeType=Math.max(16,rootSize*.8);markerSize=Math.max(38,rootSize*2);
  }
  const personal=()=>!!window.AtlasSelf?.active();
  const $ = sel=>host?.querySelector(sel);
  const html = (sel,str)=>{const el=$(sel);if(el)el.innerHTML=str;};
  const route = ()=>saved.routes[current.id] || [];
  const panelSource = ()=>layer===1&&current.id==='blue-gate'?'https://arcraiders.wiki/wiki/File:Blue_Gate_Underground_Map.jpg':current.source;
  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
  const format = n=>n.toLocaleString('fr-FR');
  function sortedResults(){
    const search=norm(query),words=search.split(' ').filter(Boolean),securitySearch=breachTerms.has(search);
    const order=['sector','exit','arc','loot','access','resource','quest'];
    filtered=current.points.filter(p=>{
      if(p.layer!==layer)return false;
      if(securitySearch)return p.kind===breachKind;
      const visible=hunt?.active()&&p.kind!==breachKind?hunt.includes(p):(externalQuery||legend.includes(p.kind));
      return visible&&words.every(w=>p.words.includes(w));
    });
    pointList=[...filtered].sort((a,b)=>order.indexOf(a.group)-order.indexOf(b.group)||a.name.localeCompare(b.name,'fr')||a.y-b.y);
  }
  function markerGrid(p){
    const col='ABCDEFGHIJ'[Math.min(9,Math.floor(p.x*10))];
    return col+Math.min(10,Math.floor(p.y*10)+1);
  }
  function pingPoi(map,point){
    const poi=map?.index.get(point.poi);
    if(!poi||poi.layer!==point.layer)return null;
    const samePosition=pos=>pos&&pos.x===point.x&&pos.y===point.y;
    return samePosition(poi)||samePosition(poi.previous)?poi:null;
  }
  function describePing(point){
    if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y)||point.x<0||point.x>1||point.y<0||point.y>1)return null;
    const map=maps.find(m=>m.id===point.map);
    if(!map||!Number.isInteger(point.layer)||!map.layers[point.layer])return null;
    const poi=pingPoi(map,point);
    return (poi?.name||'Position libre')+' · '+map.name+' · '+map.layers[point.layer].name+' · '+markerGrid(poi||point);
  }
  function markPing(point,who){
    const poi=point&&pingPoi(findMap(point.map),point);
    duoMarker=point?{...point,x:poi?.x??point.x,y:poi?.y??point.y,who}:null;queueDraw();
  }
  function revealPing(point,who){
    if(personal())return;
    if(!describePing(point))return;
    if(document.querySelector('#maps-view').hidden||current.id!==point.map)window.openAtlasMap(point.map);
    if(layer!==point.layer)changeFloor(point.layer);
    const poi=pingPoi(current,point);
    if(poi)focusPoint(poi);
    else {selected=null;zoom=Math.max(2.8,zoom);cx=point.x;cy=point.y;renderDetail();renderResults();}
    markPing(point,who);status(who+' · '+describePing(point));
  }
  function outboundPoint(point){
    return {map:current.id,layer,x:point.x,y:point.y,poi:point.id||''};
  }
  function floorName(p){return current.layers[p.layer].name+(p.height?' · '+p.height:'');}
  function arcFor(p){
    const raw=arcAliases[p.kind]||p.kind;
    if(knownArc.has(raw))return raw;
    const slug=raw.replace(/^arc-/,'');
    return knownArc.has(slug)?slug:p.name==='Empereur à l’arrêt'?'emperor':null;
  }
  function status(msg){message=msg;if($('[data-status]'))$('[data-status]').textContent=msg;}
  function renderBreaches(){
    const button=$('[data-breach-toggle]'),count=current.breachesPerFloor[layer];
    const other=current.breachesPerFloor.findIndex(n=>n>0);
    const onlySearch=breachTerms.has(norm(query));
    const words=norm(query).split(' ').filter(Boolean);
    const matchesSearch=!words.length||current.points.some(p=>p.kind===breachKind&&p.layer===layer&&words.every(w=>p.words.includes(w)));
    const visible=count>0&&(legend.includes(breachKind)||onlySearch||externalQuery)&&matchesSearch;
    button.disabled=!count&&other<0;
    button.setAttribute('aria-pressed',String(visible));
    const caption=count?(visible?'Affichées':'Masquées')+' · '+count:
      other<0?'Aucun emplacement répertorié':'Voir '+current.layers[other].name+' · '+current.breachesPerFloor[other];
    button.querySelector('small').textContent=caption;
    button.title=count?(visible?'Masquer':'Afficher')+' les casiers de sécurité sur cet étage':caption;
  }
  function renderMapTools(){
    if(lastChart?.id!==current.id||lastChart.layer!==layer){
      lastChart={id:current.id,layer};
      try{localStorage.setItem(chartKey,JSON.stringify(lastChart));}catch{}
    }
    const art=$('.rm-terrain-art');
    if(art&&art.dataset.chart!==current.id+'/'+layer){art.dataset.chart=current.id+'/'+layer;art.src=current.layers[layer].image;}
    html('[data-map-pick]',maps.map(m=>'<option value="'+m.id+'" '+(m===current?'selected':'')+'>'+esc(shortNames[m.id])+'</option>').join(''));
    const header=$('[data-active-terrain]');if(header)header.textContent=terrainTitle(current);
    for(const choice of host.querySelectorAll('[data-terrain]')){
      const active=choice.dataset.terrain===current.id;choice.setAttribute('aria-checked',String(active));choice.tabIndex=active?0:-1;
    }
    html('[data-floors]',current.layers.map((l,i)=>'<button type="button" data-floor="'+i+'" aria-pressed="'+(i===layer)+'">'+esc(l.name)+'</button>').join(''));
    legend.setFloor(current,layer);
    renderBreaches();
    const counter=$('[data-total]');if(counter) counter.textContent=format(current.points.length)+' repères · '+current.layers.length+' plan'+(current.layers.length>1?'s':'');
    const src=$('[data-source]');if(src){src.href=panelSource();src.textContent=layer===1&&current.id==='blue-gate'?'Plan des souterrains · Cartotect':'Repères et fond · Raider vodič';}
    const breachCredit=$('[data-breach-credit]');
    breachCredit.hidden=!current.breachSource;
    if(current.breachSource){breachCredit.href=current.breachSource.url;breachCredit.textContent='Brèches de sécurité · '+current.breachSource.label+' ↗';}
    $('[data-frame-credit]').hidden=current.id!=='pendola-pass';
    const info=$('[data-source-info]');if(info)info.textContent='Relevé communautaire du '+current.survey.split('-').reverse().join('.')+'. Les positions sont indicatives.';
    const search=$('[data-search]');if(search&&search.value!==query)search.value=query;
    const hub=$('[data-hub]');if(hub)hub.href=current.hub;
    window.AtlasSelf?.mapChanged(current.id,layer);
    hunt?.refresh();
  }
  function renderResults(){
    sortedResults();
    const cnt=$('[data-count]');if(cnt)cnt.textContent=format(pointList.length)+' résultat'+(pointList.length>1?'s':'');
    const hasQuery=!!norm(query);
    const mode=$('[data-search-mode]');if(mode)mode.textContent=externalQuery&&hasQuery?'Lieu ouvert depuis une fiche · tous les types sont recherchés. Efface la recherche pour retrouver tes filtres.':'Lieux correspondant aux types cochés sur cet étage.';
    if(mode&&breachTerms.has(norm(query)))mode.textContent='Emplacements de brèches de sécurité répertoriés sur cet étage.';
    const list=pointList.slice(0,limit);
    html('[data-list]',list.length?list.map(p=>'<button type="button" class="rm-list-point" data-poi="'+esc(p.id)+'" aria-pressed="'+(p===selected)+'">'+icons.html(p.kind)+'<span>'+esc(p.name)+'</span><small>'+markerGrid(p)+'</small></button>').join(''):'<p class="rm-empty">Aucun repère sur ce plan. Essaie une autre couche, un nom anglais ou un autre niveau.</p>');
    const more=$('[data-more]');if(more){more.hidden=limit>=pointList.length;more.textContent='Afficher '+Math.min(24,pointList.length-limit)+' repères de plus';}
    window.AtlasSelf?.refreshNearby();
    queueDraw();
  }
  function renderDetail(){
    const p=selected;
    const el=$('[data-detail]');if(!el) return;el.hidden=!p;
    if(!p){el.innerHTML='<span class="rm-kicker">LECTURE DU TERRAIN</span><h4>Choisis un repère</h4><p>Clique sur le plan ou choisis un résultat pour préparer une étape.</p>';return;}
    const labels=groups[p.group], arc=arcFor(p);
    el.innerHTML='<span class="rm-kicker" style="color:'+labels[1]+'">'+labels[0]+' / '+(p.name!==p.fr&&p.group!=='sector'?esc(p.fr)+' / ':'')+markerGrid(p)+'</span><h4 class="rm-poi-heading">'+icons.html(p.kind)+esc(p.name)+'</h4><div class="rm-sub">'+esc(floorName(p))+(p.alias?' · '+esc(p.alias):'')+(p.locked?' · Zone verrouillée':'')+'</div><p>'+esc(typeNotes[p.kind]||descriptions[p.group])+'</p><div class="rm-detail-actions"><button type="button" data-route-toggle class="rm-accent">'+(route().includes(p.id)?'Retirer de l’itinéraire':'＋ Ajouter une étape')+'</button>'+(arc&&typeof window.openAtlasARC==='function'?'<button type="button" data-open-arc="'+arc+'">Fiche ARC ↗</button>':'')+'</div>';
  }
  function renderRoute(){
    html('[data-route]',route().length?route().map((id,i)=>{
      const p=current.index.get(id);
      return '<li><button class="rm-route-name" type="button" data-poi="'+esc(id)+'"><b>'+String(i+1).padStart(2,'0')+'</b>'+icons.html(p.kind)+'<span>'+esc(p.name)+'<small>'+esc(floorName(p))+' · '+markerGrid(p)+'</small></span></button><button type="button" data-up="'+esc(id)+'" title="Monter cette étape" aria-label="Monter '+esc(p.name)+'" '+(!i?'disabled':'')+'>↑</button><button type="button" data-remove="'+esc(id)+'" title="Retirer cette étape" aria-label="Retirer '+esc(p.name)+'">×</button></li>';
    }).join(''):'<li class="rm-empty">Ajoute un lieu de fouille et une sortie pour tracer ton premier parcours.</li>');
    const size=$('[data-route-size]');if(size)size.textContent=route().length+' / 24';
    const note=$('[data-route-note]');if(note)note.textContent=writeOK?'Enregistrement local · segments indicatifs, à adapter aux obstacles.':'Stockage local indisponible · utilise l’export JSON de l’atlas.';
    queueDraw();
  }
  function layout(){
    const rect=canvas.getBoundingClientRect(), l=current.layers[layer];
    const width=Math.max(1,rect.width), height=Math.max(1,rect.height);
    const angle=yaw*Math.PI/180,co=Math.cos(angle),si=Math.sin(angle);
    const squash=Math.cos(tilt*48*Math.PI/180);
    const spanX=l.width*Math.abs(co)+l.height*Math.abs(si);
    const spanY=(l.width*Math.abs(si)+l.height*Math.abs(co))*squash;
    const base=Math.min((width-16*tilt)/spanX,(height-24*tilt)/spanY);
    const w=base*l.width*zoom,h=base*l.height*zoom;
    if(!tilt){
      cx=w>width?clamp(cx,width/(2*w),1-width/(2*w)):.5;
      cy=h>height?clamp(cy,height/(2*h),1-height/(2*h)):.5;
    }else if(zoom<=1){cx=cy=.5;}
    else{cx=clamp(cx,0,1);cy=clamp(cy,0,1);}
    const a=w*co,b=w*si*squash,c=-h*si,d=h*co*squash;
    view={width,height,w,h,a,b,c,d,x:width/2-cx*a-cy*c,y:height/2-cx*b-cy*d};
  }
  const at=p=>({x:view.x+view.a*p.x+view.c*p.y,y:view.y+view.b*p.x+view.d*p.y});
  function mapDelta(dx,dy){
    const {a,b,c,d}=view,det=a*d-b*c;
    return {x:(d*dx-c*dy)/det,y:(a*dy-b*dx)/det};
  }
  const onMap=(px,py)=>mapDelta(px-view.x,py-view.y);
  function setProjection(isTable,angle=bearing){
    table=isTable;bearing=angle;
    const endTilt=table?1:0,endYaw=table?bearing:0;
    transition={start:performance.now(),fromTilt:tilt,fromYaw:yaw,endTilt,endYaw};
    host.dataset.projection=table?'table':'plan';
    for(const b of host.querySelectorAll('[data-projection-mode]'))b.setAttribute('aria-pressed',String((b.dataset.projectionMode==='table')===table));
    $('[data-orbit-controls]').hidden=!table;
    $('[data-bearing-value]').textContent=bearing+'°';
    $('[data-bearing]').value=bearing;
    tip(null);queueDraw();
  }
  function updateProjection(){
    if(!transition)return;
    const t=transition;
    const fraction=window.AtlasMotion?.reduced()?1:clamp((performance.now()-t.start)/320,0,1);
    const eased=1-(1-fraction)**3;
    tilt=t.fromTilt+(t.endTilt-t.fromTilt)*eased;yaw=t.fromYaw+(t.endYaw-t.fromYaw)*eased;
    if(fraction>=1)transition=null;
  }
  function plate(){
    const corners=[at({x:0,y:0}),at({x:1,y:0}),at({x:1,y:1}),at({x:0,y:1})];
    if(tilt>.001){
      const depth=13*tilt;
      corners.forEach((p,i)=>{
        const q=corners[(i+1)%4];if(q.x>=p.x)return;
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.lineTo(q.x,q.y+depth);ctx.lineTo(p.x,p.y+depth);ctx.closePath();
        ctx.fillStyle=i===2?'#29464b':'#172e34';ctx.fill();ctx.strokeStyle='#48676a';ctx.lineWidth=1;ctx.stroke();
      });
    }
    ctx.beginPath();corners.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();
    if(tilt>.001){ctx.strokeStyle='#7ca5a1';ctx.lineWidth=2;ctx.stroke();}
    ctx.clip();
  }
  function glyph(x,y,p,focus){
    const size=markerSize+(focus?9:0);
    ctx.drawImage(icons.tile(p.kind).canvas,x-size/2,y-size/2,size,size);
    if(focus){ctx.beginPath();ctx.arc(x,y,size/2+1,0,Math.PI*2);ctx.strokeStyle='#fcf9ed';ctx.lineWidth=2;ctx.stroke();}
  }
  function collectVisible(width,height,stops) {
    const radius=markerSize+14, cells=new Map(), buckets=[];
    const excluded=new Set(stops);if(selected)excluded.add(selected);
    // Le regroupement à l'écran fonctionne aussi quand la table est tournée ou inclinée.
    for(const p of filtered){
      if(excluded.has(p))continue;
      const pos=at(p);if(pos.x<0||pos.y<0||pos.x>width||pos.y>height)continue;
      const x=Math.floor(pos.x/radius),y=Math.floor(pos.y/radius);
      let match=null,closest=radius*radius;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        const bucket=cells.get((y+dy)*10000+x+dx);
        if(!bucket)continue;
        for(const b of bucket){
          if((p.kind===breachKind)!==(b.kind===breachKind))continue;
          const d=(b.x-pos.x)**2+(b.y-pos.y)**2;
          if(d<closest){closest=d;match=b;}
        }
      }
      if(match){match.members.push(p);if(match.kind!==p.kind)match.mixed=true;}
      else {
        const b={x:pos.x,y:pos.y,members:[p],kind:p.kind,mixed:false};
        const key=y*10000+x;if(cells.has(key))cells.get(key).push(b);else cells.set(key,[b]);
        buckets.push(b);
      }
    }
    return buckets;
  }
  function clusterGlyph(b) {
    const {x,y,members}=b,n=members.length;
    let representative=members[0];
    if(b.mixed){
      const counts=new Map();let most=0;
      for(const p of members){
        const count=(counts.get(p.kind)||0)+1;counts.set(p.kind,count);
        if(count>most || (count===most && p.group==='exit')){representative=p;most=count;}
      }
      b.kinds=counts.size;
    }
    b.representative=representative;
    glyph(x,y,representative,false);
    const label=String(n);ctx.font='700 '+badgeType+'px system-ui';
    const w=ctx.measureText(label).width+9,h=badgeType+7,left=x+markerSize*.14,top=y-markerSize*.58;
    ctx.fillStyle='#112023';ctx.strokeStyle=b.mixed?'#bde9ed':'#f5d596';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.roundRect(left,top,w,h,4);ctx.fill();ctx.stroke();
    ctx.fillStyle='#fff7d9';ctx.textAlign='center';ctx.fillText(label,left+w/2,top+badgeType+1);
    b.badge={x:left+w/2,y:top+h/2};
  }
  function inspectCluster(b){
    const ps=b.members;tip(null);selected=null;window.AtlasSelf?.pauseFollow();
    const avg=ps.reduce((a,p)=>({x:a.x+p.x,y:a.y+p.y}),{x:0,y:0});
    cx=avg.x/ps.length;cy=avg.y/ps.length;zoom=Math.min(8,zoom*1.85);queueDraw();renderResults();
    $('[data-detail]').hidden=false;
    html('[data-detail]','<span class="rm-kicker">GROUPE DE REPÈRES</span><h4>'+format(ps.length)+' emplacements proches</h4><p>Choisis un emplacement pour ouvrir sa fiche et l’ajouter au parcours.</p><div class="rm-cluster-items">'+ps.map(p=>'<button type="button" data-poi="'+esc(p.id)+'">'+icons.html(p.kind)+'<span>'+esc(p.name)+'</span><small>'+markerGrid(p)+'</small></button>').join('')+'</div>');
    status('Groupe ouvert · '+format(ps.length)+' emplacements.');
    host.dispatchEvent(new CustomEvent('raidmaps:focused',{detail:'point'}));
  }
  function draw(){
    frame=0;if(!host?.isConnected||!canvas||canvas.getBoundingClientRect().width<2)return;
    updateProjection();readingMetrics();
    layout();const {x,y,w,h,width,height}=view, ratio=Math.min(2,window.devicePixelRatio||1);
    if(canvas.width!==Math.round(width*ratio)||canvas.height!==Math.round(height*ratio)){canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);}
    ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
    ctx.fillStyle=tilt?'#101d22':'#10171c';ctx.fillRect(0,0,width,height);
    if(tilt){
      ctx.beginPath();ctx.strokeStyle='rgba(134,185,180,'+(.10*tilt)+')';ctx.lineWidth=1;
      for(let gx=0;gx<width;gx+=28){ctx.moveTo(gx,0);ctx.lineTo(gx,height);}
      for(let gy=0;gy<height;gy+=28){ctx.moveTo(0,gy);ctx.lineTo(width,gy);}ctx.stroke();
    }
    ctx.save();plate();ctx.save();
    ctx.transform(view.a/w,view.b/w,view.c/h,view.d/h,x,y);
    if(bgImage?.complete&&bgImage.naturalWidth)ctx.drawImage(bgImage,0,0,w,h);
    ctx.strokeStyle='rgba(221,245,239,.13)';ctx.lineWidth=.6;
    for(let i=1;i<10;i++){ctx.beginPath();ctx.moveTo(i*w/10,0);ctx.lineTo(i*w/10,h);ctx.moveTo(0,i*h/10);ctx.lineTo(w,i*h/10);ctx.stroke();}
    ctx.restore();
    hunt?.paint(ctx,at,view,markerSize,canvasType);
    const stops=route().map(id=>current.index.get(id));ctx.strokeStyle='#ffcc75';ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();
    stops.forEach((p,i)=>{if(p.layer!==layer)return;const pos=at(p);if(i&&stops[i-1].layer===layer)ctx.lineTo(pos.x,pos.y);else ctx.moveTo(pos.x,pos.y);});ctx.stroke();ctx.setLineDash([]);
    drawn=[];const labels=[];
    const buckets=collectVisible(width,height,stops);
    function drawBucket(b){
      const p=b.members[0];
      if(b.members.length>1){clusterGlyph(b);drawn.push([b,b.x,b.y],[b,b.badge.x,b.badge.y]);}
      else{glyph(b.x,b.y,p,false);drawn.push([p,b.x,b.y]);if(p.group==='sector'&&zoom>=1.45)labels.push([p,b.x,b.y]);}
    }
    for(const b of buckets)if(b.kind!==breachKind)drawBucket(b);
    ctx.font='600 '+canvasType+'px system-ui';ctx.textAlign='left';let occupied=[];
    for(const [p,px,py] of labels){const name=p.name,wid=ctx.measureText(name).width+12,left=px+markerSize/2+3,top=py-canvasType*.7,h=canvasType*1.4;
      if(left+wid>width-3||occupied.some(a=>Math.abs(a.y-top)<h+4 && left<a.x+a.w && left+wid>a.x))continue;
      ctx.fillStyle='rgba(12,22,24,.95)';ctx.fillRect(left,top,wid,h);ctx.fillStyle='#fff8df';ctx.fillText(name,left+6,top+canvasType);occupied.push({x:left,y:top,w:wid});
    }
    for(const b of buckets)if(b.kind===breachKind)drawBucket(b);
    for(const [i,p] of stops.entries()){
      if(p.layer!==layer)continue;
      const pos=at(p),top=pos.y-tilt*12;
      ctx.fillStyle='#f5bd64';if(tilt)ctx.fillRect(pos.x-1,top,2,pos.y-top);
      glyph(pos.x,top,p,p===selected);
      const badgeX=pos.x+markerSize*.3,badgeY=top-markerSize*.3;
      ctx.fillStyle='#f5bd64';ctx.beginPath();ctx.arc(badgeX,badgeY,badgeType*.8,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#16201a';ctx.lineWidth=1.5;ctx.stroke();
      ctx.fillStyle='#16201a';ctx.font='700 '+badgeType+'px monospace';ctx.textAlign='center';
      ctx.fillText(i+1,badgeX,badgeY+badgeType*.35);drawn.push([p,pos.x,top],[p,pos.x,pos.y],[p,badgeX,badgeY]);
    }
    if(selected&&selected.layer===layer){
      const pos=at(selected),numbered=stops.includes(selected),lift=tilt*(numbered?12:19);
      if(lift&&!numbered){ctx.strokeStyle='#f4ead1';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(pos.x,pos.y);ctx.lineTo(pos.x,pos.y-lift);ctx.stroke();}
      if(!numbered)glyph(pos.x,pos.y-lift,selected,true);
      drawn.push([selected,pos.x,pos.y],[selected,pos.x,pos.y-lift]);
      if(tilt>.85){
        ctx.font='600 '+canvasType+'px system-ui';ctx.textAlign='left';
        const size=Math.min(width-12,ctx.measureText(selected.name).width+12),offset=markerSize/2+5;
        const left=clamp(pos.x+offset+size<width?pos.x+offset:pos.x-offset-size,6,width-size-6);
        const top=pos.y-lift-canvasType*.7;
        ctx.fillStyle='#102323f5';ctx.fillRect(left,top,size,canvasType*1.4);
        let text=selected.name;
        while(text.length>1&&ctx.measureText(text).width>size-12)text=text.slice(0,-2)+'…';
        ctx.fillStyle='#fff1c5';ctx.fillText(text,left+6,top+canvasType);
      }
    }
    if(hunt?.active())drawn.push(...hunt.paint(ctx,at,view,markerSize,canvasType,true));
    if(!personal()&&duoMarker?.map===current.id&&duoMarker.layer===layer){
      const pos=at(duoMarker);ctx.textAlign='center';ctx.font='700 '+canvasType+'px system-ui';
      ctx.beginPath();ctx.arc(pos.x,pos.y,16,0,Math.PI*2);ctx.strokeStyle='#16221b';ctx.lineWidth=5;ctx.stroke();
      ctx.strokeStyle='#83f5c2';ctx.lineWidth=2;ctx.stroke();
      const width=ctx.measureText(duoMarker.who).width+12;
      ctx.fillStyle='#173e31';ctx.fillRect(pos.x-width/2,pos.y-canvasType-24,width,canvasType+8);
      ctx.fillStyle='#cbffe0';ctx.fillText(duoMarker.who,pos.x,pos.y-21);
    }
    for(const p of window.AtlasDuo?.positions?.()||[]){
      if(p.map!==current.id||p.layer!==layer)continue;
      raiderArrow(p,p.name,p.color,p.fresh);
    }
    if(selfPoint&&selfPoint.map===current.id&&selfPoint.layer===layer){
      const {x:px,y:py}=at(selfPoint),fresh=selfPoint.fresh;
      ctx.fillStyle=fresh?'#6ef5f0':'#bbc9c9';ctx.strokeStyle='#101f26';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(px,py-11);ctx.lineTo(px+9,py+9);ctx.lineTo(px,py+5);ctx.lineTo(px-9,py+9);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.arc(px,py,13,0,Math.PI*2);ctx.strokeStyle=fresh?'#6ef5f0':'#bbc9c9';ctx.lineWidth=1.5;ctx.stroke();
      ctx.font='700 '+canvasType+'px system-ui';ctx.textAlign='center';
      const labelWidth=ctx.measureText('MOI').width+12;
      ctx.fillStyle='#172b31';ctx.fillRect(px-labelWidth/2,py-canvasType-24,labelWidth,canvasType+8);ctx.fillStyle='#e3ffff';
      ctx.fillText('MOI',px,py-21);
    }
    ctx.restore();
    const zoomText=$('[data-zoom-value]');if(zoomText)zoomText.textContent=zoom.toLocaleString('fr-FR',{minimumFractionDigits:1,maximumFractionDigits:1})+'×';
    $('.rm-compass').style.setProperty('--north',Math.atan2(-view.c,view.d)+'rad');
    updateReadout();
    if(selected){
      const pos=at(selected),halo=$('.rm-selection-halo');
      halo.style.left=pos.x+'px';halo.style.top=pos.y-tilt*(stops.includes(selected)?12:19)+'px';
    }
    if(transition)queueDraw();
  }
  function queueDraw(){if(!frame)frame=requestAnimationFrame(draw);}
  function raiderArrow(p,name,color,fresh){
    const {x,y}=at(p);ctx.save();ctx.globalAlpha=fresh||p.source==='manual'?.95:.55;ctx.fillStyle=color;ctx.strokeStyle='#0b111a';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(x,y-12);ctx.lineTo(x+10,y+10);ctx.lineTo(x,y+5);ctx.lineTo(x-10,y+10);ctx.closePath();ctx.fill();ctx.stroke();
    const seconds=Math.max(0,Math.floor((Date.now()-p.time)/1000)),text=name+(fresh?'':p.source==='manual'?' · manuel':' · '+seconds+' s');
    ctx.font='700 '+canvasType+'px system-ui';ctx.textAlign='center';const w=ctx.measureText(text).width+12;ctx.fillStyle='#15232e';ctx.fillRect(x-w/2,y+17,w,canvasType+8);ctx.fillStyle=color;ctx.fillText(text,x,y+canvasType+18);ctx.restore();
  }
  function squadReadout(){
    if(!host)return;const box=$('[data-squad-positions]');if(!box)return;const ps=window.AtlasDuo?.positions?.()||[];
    const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    box.innerHTML='<b>Positions de l’escouade</b> '+(ps.length?ps.map(p=>'<span style="--raider-color:'+p.color+'">▲ '+esc(p.name)+' · '+esc(findMap(p.map)?.name||p.map)+' / '+esc(findMap(p.map)?.layers[p.layer]?.name||String(p.layer))+' · '+(p.source==='manual'?'manuel':p.fresh?'lecture récente':'dernière lecture '+Math.floor((Date.now()-p.time)/1000)+' s')+'</span>').join(''):'<span>Les coéquipiers apparaîtront ici après avoir relié leur fenêtre ou placé leur position.</span>');
    queueDraw();
  }
  window.addEventListener('atlas:squad-positions',squadReadout);
  function updateReadout(){
    const point=cursorOnStage?onMap(cursorOnStage.x,cursorOnStage.y):{x:cx,y:cy};
    const text=point.x>=0&&point.x<=1&&point.y>=0&&point.y<=1?(cursorOnStage?'Viseur · ':'Centre · ')+markerGrid(point):'Hors du plan';
    const readout=$('[data-grid-readout]');if(readout.textContent!==text)readout.textContent=text;
  }
  function fillFullscreen(){
    if(!canvas||table||document.fullscreenElement!==$('.rm-layout'))return;
    layout();
    zoom=clamp(Math.max(zoom,zoom*view.width/view.w,zoom*view.height/view.h),1,8);
    queueDraw();
  }
  function resetView(fill=true){cx=.5;cy=.5;zoom=1;if(fill)fillFullscreen();queueDraw();}
  function frameBreaches(){
    const points=current.points.filter(p=>p.layer===layer&&p.kind===breachKind);
    if(!points.length)return;
    zoom=1;layout();
    const positions=points.map(at);
    const xs=positions.map(p=>p.x),ys=positions.map(p=>p.y);
    const left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);
    const center=onMap((left+right)/2,(top+bottom)/2);
    const padding=markerSize*2;
    zoom=clamp(Math.min((view.width-padding)/Math.max(1,right-left),(view.height-padding)/Math.max(1,bottom-top)),1,5);
    cx=center.x;cy=center.y;queueDraw();
  }
  function changeZoom(z,anchorX,anchorY){
    layout();const ax=anchorX??view.width/2,ay=anchorY??view.height/2,anchor=onMap(ax,ay);
    zoom=clamp(z,1,8);layout();const offset=mapDelta(ax-view.width/2,ay-view.height/2);
    cx=anchor.x-offset.x;cy=anchor.y-offset.y;layout();queueDraw();
  }
  function loadImage(){
    const image=new Image();bgImage=image;image.onload=()=>{if(image===bgImage)queueDraw();};
    image.onerror=()=>{if(image===bgImage)status('Le fond local n’a pas pu être ouvert. Les repères restent disponibles.');};
    image.src=current.layers[layer].image;
  }
  function changeFloor(i){
    if(i<0||i>=current.layers.length)return;layer=i;selected=null;limit=24;resetView();loadImage();renderMapTools();renderResults();renderDetail();status('');
  }
  function focusPoint(p,center=true){
    if(!p)return;
    if(layer!==p.layer)changeFloor(p.layer);
    selected=p;
    if(center){zoom=Math.max(2.8,zoom);cx=p.x;cy=p.y;}
    renderDetail();renderResults();
    if(!window.AtlasMotion?.reduced()){
      const halo=$('.rm-selection-halo');
      halo.getAnimations().forEach(a=>a.cancel());
      halo.animate([{opacity:.9,transform:'translate(-50%,-50%) scale(.6)'},{opacity:0,transform:'translate(-50%,-50%) scale(2)'}],{duration:380,easing:'ease-out'});
    }
    status(p.name+' · '+floorName(p)+' · quadrillage '+markerGrid(p));
    host.dispatchEvent(new CustomEvent('raidmaps:focused',{detail:'point'}));
  }
  function setSearch(value,external=false){
    query=String(value||'').slice(0,140);externalQuery=external&&!!norm(query);limit=24;const words=norm(query).split(' ').filter(Boolean);
    const hits=words.length?current.points.filter(p=>(externalQuery||(p.layer===layer&&legend.includes(p.kind)))&&words.every(w=>p.words.includes(w))):[];
    if(selected && (!externalQuery&&!legend.includes(selected.kind)||!words.every(w=>selected.words.includes(w))))selected=null;
    if(externalQuery&&hits.length&&!hits.some(p=>p.layer===layer)){layer=hits[0].layer;selected=null;resetView();loadImage();}
    renderMapTools();renderResults();renderDetail();
    return hits;
  }
  function openMap(id,term='',startLayer=0){
    const m=findMap(id);if(!m)return false;
    current=m;layer=Number.isInteger(startLayer)&&m.layers[startLayer]?startLayer:0;query='';limit=24;selected=null;
    if(!host){pending={id:m.id,term};return true;}
    resetView();loadImage();legend.setFloor(current,layer);const hits=setSearch(term,true);
    if(term&&hits.length===1){focusPoint(hits[0]);}
    if(term&&!hits.length){
      const text=String(term).split(/[·,;(]/)[0].trim();
      const fallback=text&&text!==term?setSearch(text,true):[];
      if(fallback.length){focusPoint(fallback[0]);}
      else{setSearch('');status('Aucun repère local nommé « '+term+' ». La carte complète est affichée.');}
    }else if(term&&hits.length>1){status(format(hits.length)+' repères correspondent à « '+term+' ».');}
    else if(!term)status('');
    renderRoute();return true;
  }
  let pending=null;
  function changeRoute(action,id){
    if(!current.index.has(id))return;
    const ids=[...route()],i=ids.indexOf(id);
    if(action==='add'&&i<0){if(ids.length===24){status('L’itinéraire contient déjà 24 étapes.');return;}ids.push(id);}
    if(action==='remove'&&i>=0)ids.splice(i,1);
    if(action==='up'&&i>0)[ids[i],ids[i-1]]=[ids[i-1],ids[i]];
    saved.routes[current.id]=ids;
    saveRoutes();renderRoute();renderDetail();status((action==='add'?'Étape ajoutée':action==='up'?'Ordre modifié':'Étape retirée')+' · '+ids.length+' étape'+(ids.length>1?'s':''));
  }
  function pick(x,y){
    let hit=null,dist=markerSize/2+5;
    for(let i=drawn.length-1;i>=0;i--){const [p,px,py]=drawn[i],d=Math.hypot(x-px,y-py);if(d<dist){hit=p;dist=d;}}
    return hit;
  }
  let lastTip=null;
  function tip(p,x,y){
    const el=$('[data-tip]');if(!el)return;
    el.hidden=!p;
    if(p){
      if(lastTip!==p){
        if(p.huntZone){
          el.innerHTML='<span>Zone '+p.number+' · '+esc(p.name)+' · '+p.items.length+' schéma(s) · cliquer pour préparer la fouille</span>';
        }else if(p.members){
          el.innerHTML=icons.html(p.representative.kind)+'<span>'+p.members.length+' repères · '+(p.mixed?p.kinds+' types':esc(p.representative.fr))+' · cliquer pour détailler</span>';
        }else el.innerHTML=icons.html(p.kind)+'<span>'+esc(p.name)+(p.name!==p.fr&&p.group!=='sector'?' · '+esc(p.fr):'')+' · '+markerGrid(p)+'</span>';
      }
      el.style.left=clamp(x+12,4,view.width-el.offsetWidth-5)+'px';el.style.top=clamp(y-el.offsetHeight-16,4,view.height-el.offsetHeight-5)+'px';}lastTip=p;
  }
  function interactions(){
    host.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.hasAttribute('data-breach-toggle')){
        let enable=b.getAttribute('aria-pressed')!=='true';
        if(!current.breachesPerFloor[layer]){
          const other=current.breachesPerFloor.findIndex(n=>n>0);
          if(other<0)return;
          changeFloor(other);enable=true;
        }
        legend.setBreaches(enable);
        if(enable){window.AtlasSelf?.pauseFollow();frameBreaches();}
        status(enable?current.breachesPerFloor[layer]+' emplacements de brèches répertoriés sur ce plan.':'Brèches masquées.');
        return;
      }
      if(b.dataset.terrain){if(current.id!==b.dataset.terrain)openMap(b.dataset.terrain);return;}
      if(b.dataset.projectionMode)setProjection(b.dataset.projectionMode==='table');
      if(b.hasAttribute('data-north'))setProjection(true,0);
      if(b.closest('[data-list],[data-route],.rm-controls')||b.hasAttribute('data-fit'))window.AtlasSelf?.pauseFollow();
      if(b.hasAttribute('data-duo-map'))document.getElementById('duoOpen').click();
      if(b.dataset.floor!==undefined)changeFloor(+b.dataset.floor);
      if(b.dataset.poi){
        const wasPrivate=personal();
        const p=current.index.get(b.dataset.poi);focusPoint(p);
        if(p&&!wasPrivate&&!personal())window.AtlasDuo?.ping(outboundPoint(p));
      }
      if(b.hasAttribute('data-more')){limit+=24;renderResults();}
      if(b.dataset.zoom){changeZoom(zoom*(b.dataset.zoom==='in'?1.5:1/1.5));}
      if(b.hasAttribute('data-fit'))resetView(false);
      if(b.hasAttribute('data-full')){
        const board=$('.rm-layout');
        if(document.fullscreenElement===board)document.exitFullscreen().catch(()=>{});
        else if(board.requestFullscreen)board.requestFullscreen().catch(()=>status('Le mode plein écran est indisponible dans cette vue.'));
        else status('Le mode plein écran est indisponible dans cette vue.');
      }
      if(b.hasAttribute('data-route-toggle')&&selected)changeRoute(route().includes(selected.id)?'remove':'add',selected.id);
      if(b.dataset.up)changeRoute('up',b.dataset.up);
      if(b.dataset.remove)changeRoute('remove',b.dataset.remove);
      if(b.dataset.openArc)window.openAtlasARC?.(b.dataset.openArc);
      if(b.hasAttribute('data-clear-search')){setSearch('');status('');$('[data-search]').focus();}
      if(!b.isConnected){
        for(const key of ['floor','layerGroup','poi','up','remove']){
          if(b.dataset[key]===undefined)continue;
          const replacement=host.querySelector('[data-'+key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+'="'+CSS.escape(b.dataset[key])+'"]');
          replacement?.focus({preventScroll:true});break;
        }
      }
    });
    host.addEventListener('input',e=>{
      if(e.target.matches('[data-search]')){setSearch(e.target.value);status('');}
      if(e.target.matches('[data-bearing]'))setProjection(true,Number(e.target.value));
    });
    host.addEventListener('change',e=>{if(e.target.matches('[data-map-pick]'))openMap(e.target.value);});
    canvas.addEventListener('wheel',e=>{e.preventDefault();window.AtlasSelf?.pauseFollow();const rect=canvas.getBoundingClientRect();changeZoom(zoom*Math.exp(-e.deltaY*.0014),e.clientX-rect.left,e.clientY-rect.top);},{passive:false});
    const coords=e=>{const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
    function startGesture(){
      const coords=[...pointers.values()];layout();
      if(coords.length===1){gesture={sx:coords[0].x,sy:coords[0].y,cx,cy};}
      else if(coords.length===2){const [a,b]=coords;gesture={pinch:true,dist:Math.max(4,Math.hypot(a.x-b.x,a.y-b.y)),zoom,anchor:onMap((a.x+b.x)/2,(a.y+b.y)/2)};moved=true;window.AtlasSelf?.pauseFollow();}
    }
    canvas.addEventListener('pointerleave',()=>{tip(null);cursorOnStage=null;queueDraw();});
    canvas.addEventListener('dblclick',e=>{clearTimeout(canvasPingTimer);const pos=coords(e);changeZoom(zoom*1.65,pos.x,pos.y);});
    canvas.addEventListener('pointerdown',e=>{tip(null);if(e.button!==0&&e.pointerType==='mouse')return;canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,coords(e));if(pointers.size===1)moved=false;dragging=true;startGesture();});
    canvas.addEventListener('pointermove',e=>{
      if(!dragging){if(e.pointerType==='mouse'){
        const pos=coords(e);cursorOnStage=pos;
        tip(pick(pos.x,pos.y),pos.x,pos.y);updateReadout();
      }return;}
      cursorOnStage=null;
      if(!pointers.has(e.pointerId)||!gesture)return;pointers.set(e.pointerId,coords(e));const pts=[...pointers.values()];
      if(pts.length===1&&!gesture.pinch){
        const a=pts[0],dx=a.x-gesture.sx,dy=a.y-gesture.sy,delta=mapDelta(dx,dy);
        moved=moved||Math.hypot(dx,dy)>4;if(moved)window.AtlasSelf?.pauseFollow();
        cx=gesture.cx-delta.x;cy=gesture.cy-delta.y;
      }
      else if(pts.length===2&&gesture.pinch){
        const [a,b]=pts;zoom=clamp(gesture.zoom*Math.hypot(a.x-b.x,a.y-b.y)/gesture.dist,1,8);layout();
        const offset=mapDelta((a.x+b.x-view.width)/2,(a.y+b.y-view.height)/2);
        cx=gesture.anchor.x-offset.x;cy=gesture.anchor.y-offset.y;
      }
      queueDraw();
    });
    function end(e,cancelled){
      if(!pointers.has(e.pointerId))return;
      const pos=coords(e);pointers.delete(e.pointerId);
      if(!pointers.size){
        if(!moved&&!cancelled){
          const raw=outboundPoint(onMap(pos.x,pos.y));
          if(window.AtlasSelf?.place(raw)){dragging=false;gesture=null;return;}
          const hit=pick(pos.x,pos.y);if(hit?.huntZone){hunt.select(hit.id,false);dragging=false;gesture=null;return;}
          if(hit?.members){inspectCluster(hit);dragging=false;gesture=null;return;}
          if(hit){window.AtlasSelf?.pauseFollow();focusPoint(hit,false);}
          const point=hit?outboundPoint(hit):raw;
          if(!personal()&&window.AtlasDuo?.active()&&describePing(point)){
            clearTimeout(canvasPingTimer);canvasPingTimer=setTimeout(()=>{if(!personal())window.AtlasDuo.ping(point);},300);
          }
        }
        dragging=false;gesture=null;
      }
      else startGesture();
    }
    canvas.addEventListener('pointerup',e=>end(e,false));canvas.addEventListener('pointercancel',e=>end(e,true));
    canvas.addEventListener('keydown',e=>{
      const delta=48;
      if(e.key==='Enter'&&window.AtlasSelf?.place(outboundPoint({x:cx,y:cy}))){e.preventDefault();return;}
      if(e.key==='+'||e.key==='=')changeZoom(zoom*1.5);
      else if(e.key==='-')changeZoom(zoom/1.5);
      else if(e.key==='Home')resetView(false);
      else if(['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(e.key)){
        const offset=mapDelta((Number(e.key==='ArrowRight')-Number(e.key==='ArrowLeft'))*delta,(Number(e.key==='ArrowDown')-Number(e.key==='ArrowUp'))*delta);
        cx+=offset.x;cy+=offset.y;
      }
      else return;
      window.AtlasSelf?.pauseFollow();e.preventDefault();queueDraw();
    });
  }
  window.addEventListener('raidmaps:icons',()=>{if(host)queueDraw();});
  // Les préférences de lecture globales agrandissent aussi le texte et les cibles dans le canevas.
  new MutationObserver(()=>{if(host)queueDraw();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-reading','style','class']});
  function mount(el){
    if(host===el&&el.querySelector('[data-map-pick]')){queueDraw();return;}
    observer?.disconnect();host=el;
    el.innerHTML='<section class="raid-maps"><header class="rm-head"><div><span class="rm-kicker">RECONNAISSANCE / 07 TERRAINS</span><h2>Cartographie</h2><p>Choisis un terrain et trace ton itinéraire entre deux points de fouille.</p></div><label class="rm-map-select">Terrain<select data-map-pick></select></label></header><div class="rm-layout"><section class="rm-board" aria-label="Table de reconnaissance"><div class="rm-viewport"><div class="rm-boardhead"><span class="rm-kicker">TABLE TACTIQUE</span><span data-total></span><button type="button" class="duo-map-radio" data-duo-map aria-haspopup="dialog">Duo · Partager mes repères</button></div><div class="rm-stage"><canvas tabindex="0" aria-label="Plan interactif. Flèches pour déplacer, plus et moins pour zoomer. Les repères sont aussi dans la liste." ></canvas><div class="rm-tip" data-tip hidden aria-hidden="true"></div><div class="rm-floor" data-floors aria-label="Niveau affiché"></div><div class="rm-compass" aria-hidden="true">▲<i>N</i></div><div class="rm-controls"><button type="button" data-zoom="out" aria-label="Dézoomer">−</button><span data-zoom-value>1,0×</span><button type="button" data-zoom="in" aria-label="Zoomer">+</button><button type="button" data-fit title="Recentrer" aria-label="Afficher toute la carte">⌖</button><button type="button" data-full title="Plein écran" aria-label="Agrandir la carte en plein écran">⛶</button></div></div></div><div class="rm-toolbar" data-filters aria-label="Couches de repères"></div><div class="rm-attribution"><a class="rm-calendar" href="https://arcraiders.com/map-conditions" target="_blank" rel="noopener">Calendrier officiel des conditions par région · en ligne ↗</a><span data-source-info></span> <a data-source target="_blank" rel="noopener"></a> · <a data-hub target="_blank" rel="noopener">ARC Raiders Hub</a>. Fonds et symboles de jeu © Embark. <a href="https://arcraiders.wiki/wiki/Category:ARC_icons" target="_blank" rel="noopener">Symboles ARC</a> et <a href="https://arcraiders.wiki/wiki/Category:Icons" target="_blank" rel="noopener">icônes d’interface</a> via ARC Raiders Wiki. Les autres pictogrammes ont été dessinés pour l’atlas. <a href="https://arcraiders.wiki/wiki/File:Pendola_Pass_Map_Blank.png" target="_blank" rel="noopener">Wiki</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>.</div></section><aside class="rm-sidebar"><div class="rm-detail" data-detail></div><section class="rm-index"><div class="rm-bar"><h4>Index des repères</h4><small data-count></small></div><div class="rm-search"><input data-search type="search" placeholder="Lieu, conteneur, ARC…" aria-label="Rechercher un repère" maxlength="140"><button type="button" data-clear-search aria-label="Effacer la recherche">×</button></div><p class="rm-search-note" data-search-mode></p><div class="rm-results" data-list></div><button type="button" class="rm-more" data-more>Afficher plus</button></section></aside></div><section class="rm-path"><div class="rm-bar"><div><span class="rm-kicker">PARCOURS PERSONNEL</span><h3>Mon itinéraire</h3></div><small data-route-size></small></div><ol data-route></ol><p data-route-note></p></section><p class="rm-status" data-status role="status"></p></section>';
    const bar=document.createElement('div');bar.className='rm-viewbar';
    bar.innerHTML='<div class="rm-view-switch" role="group" aria-label="Projection de la carte"><button type="button" data-projection-mode="plan" aria-pressed="true">Plan 2D</button><button type="button" data-projection-mode="table" aria-pressed="false">Table 3D</button></div><div data-orbit-controls hidden><label>Rotation <input type="range" data-bearing min="-45" max="45" value="-18" aria-label="Rotation de la table en degrés"></label><output data-bearing-value>−18°</output><button type="button" data-north>Nord ↑</button></div>';
    el.querySelector('.rm-stage').before(bar);
    el.querySelector('.rm-stage').insertAdjacentHTML('beforeend','<span class="rm-selection-halo" aria-hidden="true"></span><span class="rm-grid-readout" data-grid-readout aria-hidden="true"></span>');
    const levelbar=document.createElement('div');levelbar.className='rm-levelbar';
    levelbar.append(el.querySelector('[data-floors]'));el.querySelector('.rm-stage').before(levelbar);
    levelbar.insertAdjacentHTML('beforeend','<button type="button" class="rm-breach-toggle" data-breach-toggle aria-pressed="false">'+icons.html(breachKind)+'<span>Brèches de sécurité</span><small></small></button>');
    const mapTools=document.createElement('div');mapTools.className='rm-map-tools';
    mapTools.append(el.querySelector('[data-grid-readout]'),el.querySelector('.rm-controls'));el.querySelector('.rm-stage').after(mapTools);
    const head=el.querySelector('.rm-head');
    head.insertAdjacentHTML('afterbegin','<img class="rm-terrain-art" alt="" decoding="async">');
    head.querySelector('h2').innerHTML='<button type="button" class="rm-fold-terrains" aria-controls="terrain-strip" aria-expanded="true"><span>Choisir un terrain</span><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 15 7-7 7 7"/></svg></button>';
    head.querySelector('p').remove();
    const select=head.querySelector('.rm-map-select');select.classList.add('rm-native-picker');
    select.setAttribute('aria-hidden','true');select.querySelector('select').tabIndex=-1;
    const strip=document.createElement('div');strip.className='rm-terrain-strip';strip.setAttribute('role','radiogroup');strip.setAttribute('aria-label','Terrains de raid');
    strip.innerHTML=maps.map((m,i)=>'<button type="button" role="radio" data-terrain="'+m.id+'" aria-label="'+esc(terrainTitle(m))+'"><img src="'+terrainCovers[m.id]+'" alt=""><small>'+String(i+1).padStart(2,'0')+'</small><span>'+esc(terrainTitle(m))+'</span></button>').join('');
    head.after(strip);
    strip.id='terrain-strip';
    const fold=head.querySelector('.rm-fold-terrains');
    function setChooser(open){
      strip.hidden=!open;fold.setAttribute('aria-expanded',String(open));
      fold.querySelector('span').textContent=open?'Choisir un terrain':'Changer de terrain';
      fold.setAttribute('aria-label',open?'Replier les sept terrains':'Afficher les sept terrains');
    }
    let unfolded=true;try{unfolded=localStorage.getItem('speranza.cartes.chooser')!=='closed';}catch{}
    setChooser(unfolded);
    fold.onclick=()=>{setChooser(strip.hidden);try{localStorage.setItem('speranza.cartes.chooser',strip.hidden?'closed':'open');}catch{}};
    strip.onkeydown=e=>{
      const b=e.target.closest('[data-terrain]');if(!b)return;
      const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];if(!keys.includes(e.key))return;
      const buttons=[...strip.children],i=buttons.indexOf(b);
      const j=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1)+buttons.length)%buttons.length;
      e.preventDefault();buttons[j].focus({preventScroll:true});buttons[j].click();
    };
    el.querySelector('.rm-boardhead .rm-kicker').outerHTML='<h3 class="rm-active-title" data-active-terrain></h3>';
    const attribution=el.querySelector('.rm-attribution'),sources=document.createElement('details');
    attribution.insertAdjacentHTML('beforeend',' <a data-breach-credit hidden target="_blank" rel="noopener"></a> <a data-frame-credit hidden href="https://arcraidershub.com/maps/pendola-pass/pendola-pass.json" target="_blank" rel="noopener">Cadrage de Pendola · ARC Raiders Hub ↗</a>');
    sources.className='rm-sources';sources.innerHTML='<summary>Sources de la carte et calendrier</summary>';attribution.replaceWith(sources);sources.append(attribution);
    el.querySelector('[data-filters]').remove();
    legend=createMapLegend(el,maps,data.types,groups,norm,action=>{
      const breachAction=action==='breaches'||action==='breach-toggle';
      setSearch(externalQuery||breachAction||breachTerms.has(norm(query))?'':query);status('');
      if(action==='breaches'){window.AtlasSelf?.pauseFollow();frameBreaches();}
    },extras);
    canvas=el.querySelector('.rm-stage canvas');ctx=canvas.getContext('2d');interactions();observer=new ResizeObserver(()=>queueDraw());observer.observe(canvas);
    hunt=window.createBlueprintHunt(el,{
      maps,chart:()=>({map:current,layer}),refresh:renderResults,refreshLegend:()=>legend.refresh(),clearSearch:()=>setSearch(''),
      openMap,floor:changeFloor,addRoute:id=>changeRoute('add',id),hasRoute:id=>route().includes(id),
      focusZone(z,center){
        window.AtlasSelf?.pauseFollow();
        if(z.layer!==layer)changeFloor(z.layer);
        selected=null;renderDetail();
        if(center){cx=z.x;cy=z.y;zoom=Math.min(4,Math.max(2,1/(z.radius*7)));}
        status('Zone '+z.number+' · '+z.name+' · '+floorName(z));queueDraw();
        host.dispatchEvent(new CustomEvent('raidmaps:focused',{detail:'zone'}));
      }
    });
    window.AtlasSelf?.mount(el,{
      chart:()=>({map:current.id,layer,image:current.layers[layer].image,name:current.name+' · '+current.layers[layer].name}),
      charts:()=>maps.flatMap(m=>m.layers.map((l,i)=>({map:m.id,layer:i,image:l.image,name:m.name+' · '+l.name}))),
      adoptChart:chart=>openMap(chart.map,'',chart.layer),
      setPoint(point,center){
        selfPoint=point;
        if(center&&point){cx=point.x;cy=point.y;zoom=Math.max(2.8,zoom);}
        queueDraw();
      },
      nearby(point){
        const ratio=current.layers[layer].height/current.layers[layer].width;
        return filtered.map(p=>({p,d:Math.hypot(p.x-point.x,(p.y-point.y)*ratio)})).sort((a,b)=>a.d-b.d).slice(0,4).map(({p})=>{
          const angle=Math.atan2((p.y-point.y)*ratio,p.x-point.x);
          const direction=['E','SE','S','SO','O','NO','N','NE'][(Math.round(angle/(Math.PI/4))+8)%8];
          return {id:p.id,label:p.name,grid:markerGrid(p),direction};
        });
      },
      focus:id=>focusPoint(current.index.get(id)),
      grid:markerGrid,
      focusCanvas:()=>canvas.focus()
    });
    const privateBody=el.querySelector('.rm-self-body'),privateIntro=privateBody?.querySelector('p'),privateHeading=privateBody?.querySelector('h3');
    const squad=document.createElement('div');squad.className='rm-squad-positions';squad.dataset.squadPositions='';squad.setAttribute('aria-label','Positions des coéquipiers');el.querySelector('.rm-signal').after(squad);squadReadout();
    if(privateIntro&&privateHeading){
      const help=document.createElement('details');help.className='rm-position-help';
      const title=document.createElement('summary');title.textContent=privateHeading.textContent+' · mode d’emploi';
      privateHeading.replaceWith(help);help.append(title,privateIntro);
    }
    const signal=el.querySelector('.rm-signal');
    if(signal){
      const actions=signal.querySelector('.rm-self-actions');actions.id='rm-private-actions';
      const button=document.createElement('button');button.type='button';button.className='rm-private-toggle';
      button.textContent='Options';button.setAttribute('aria-label','Options de ma position');
      button.setAttribute('aria-controls',actions.id);button.setAttribute('aria-expanded','false');signal.dataset.controlsOpen='false';
      signal.querySelector('.rm-signal-id').after(button);
      button.onclick=()=>{
        const open=signal.dataset.controlsOpen!=='true';
        signal.dataset.controlsOpen=String(open);button.setAttribute('aria-expanded',String(open));
      };
    }
    const next=pending;pending=null;
    openMap(next?.id||lastChart?.id||current.id,next?.term||'',next?0:lastChart?.layer||0);
    hunt.restore();
    window.mountRaidFullscreen(el,fillFullscreen);
    window.AtlasDuo?.refresh();
  }
  window.RaidMaps={
    mount,openMap,explore(id,term=''){hunt?.disable();return openMap(id,term);},openBlueprint:(id,map,reveal)=>hunt?.open(id,map,reveal),describePing,markPing,revealPing,count:id=>id?(findMap(id)?.points.length||0):maps.reduce((n,m)=>n+m.points.length,0),
    exportState:()=>clone(saved),validateState,importState(v,write=true){
      if(!validateState(v))throw Error('Itinéraires ou repères inconnus.');
      saved=clone(v);if(write)saveRoutes();else writeOK=true;
      if(host){renderRoute();renderDetail();}return true;
    },storageKey
  };
})();
