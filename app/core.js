/* Speranza Ops — noyau : données, profil, planning, navigation, recherche, panneaux.
   Les écrans (app/*.js) s'enregistrent avec OPS.register(). Les moteurs hérités
   (cartes, armurerie, guide, 3D, duo) restent dans engine/ et ne sont chargés
   qu'à la demande : voir app/engines.js. */
(() => {
  'use strict';
  const $=(q,r=document)=>r.querySelector(q), $$=(q,r=document)=>[...r.querySelectorAll(q)];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=v=>String(v??'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’']/g,' ').toLowerCase();
  const read=k=>{try{return localStorage.getItem(k);}catch{return null;}};
  const write=(k,v)=>{try{localStorage.setItem(k,v);return true;}catch{return false;}};
  const root=document.documentElement;

  /* ── Pictogrammes ── */
  const paths={
    qg:'<path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z"/>',
    raid:'<circle cx="12" cy="12" r="8"/><path d="M12 1v6m0 10v6M1 12h6m10 0h6"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>',
    arc:'<path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z"/><path d="M8 11h.01M16 11h.01M9 16h6"/>',
    pack:'<path d="m3 7 9-4 9 4v11l-9 4-9-4V7Zm0 0 9 4 9-4M12 11v11"/>',
    map:'<path d="m2 5 6-2 8 3 6-2v15l-6 2-8-3-6 2V5Zm6-2v15M16 6v15"/>',
    weapon:'<path d="M3 8h14v2h5v2h-7l-2 4h-3l1-4H8l-3 4H2l2-6H2V8Zm8 0V6h4v2"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5 5-3Z"/>',
    search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>', check:'<path d="m4 12 5 5L20 6"/>', more:'<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>',
    pin:'<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.800 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
    chevron:'<path d="m9 5 7 7-7 7"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    cube:'<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 10 9-5M12 12v10M12 12 3 7"/>', refresh:'<path d="M20 11a8 8 0 1 0-2 6m2 3v-6h-6"/>',
    ops:'<path d="M2 14h20l-3 5H5l-3-5Zm4 0V9h12v5M9 9V5h6v4M12 5V2"/>',
    star:'<path d="m12 3 2.700 5.800 6.300.800-4.600 4.400 1.200 6.300L12 17.200 6.400 20.300l1.200-6.300L3 9.600l6.300-.8L12 3Z"/>',
    swap:'<path d="M4 8h12l-3-3m3 3-3 3M20 16H8l3-3m-3 3 3 3"/>',
    people:'<circle cx="9" cy="8" r="3"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 14.3A5.5 5.5 0 0 1 21.5 20"/>'
  };
  const ico=(n,cls='')=>'<svg class="i '+cls+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[n]||'')+'</svg>';

  /* ── Données ── */
  const MAPS=[
    {id:'dam-battleground',name:'Champ de bataille du Barrage',short:'Barrage',en:'Dam Battlegrounds',alias:['Barrage']},
    {id:'the-spaceport',name:'Port spatial',short:'Port spatial',en:'The Spaceport'},
    {id:'buried-city',name:'Ville enfouie',short:'Ville enfouie',en:'Buried City'},
    {id:'blue-gate',name:'Portail bleu',short:'Portail bleu',en:'The Blue Gate'},
    {id:'stella-montis',name:'Stella Montis',short:'Stella Montis',en:'Stella Montis'},
    {id:'riven-tides',name:'Riven Tides',short:'Riven Tides',en:'Riven Tides'},
    {id:'pendola-pass',name:'Col de Pendola',short:'Pendola',en:'Pendola Pass'}
  ];
  for(const m of MAPS){m.img='assets/maps/nav-'+m.id+'.webp';m.shot=new URL(m.img,document.baseURI).href;}
  const mapById=id=>MAPS.find(m=>m.id===id);
  const mapByName=n=>MAPS.find(m=>m.name===n||m.alias?.includes(n)||m.en===n||m.en.replace(/^The /,'')===n);
  const BP=window.BLUEPRINTS, bpById=new Map(BP.map(b=>[b.id,b]));
  const ARCS=window.BESTIARY_DATA, arcById=new Map(ARCS.map(a=>[a.id,a]));
  const P=window.AtlasProfiles;
  const owned=id=>P.has(id);
  const pins=()=>P.snapshot().pins;
  const pinned=id=>pins().includes(id);
  const onMap=(b,m)=>(b.locations||[]).find(l=>l.type==='raid'&&mapByName(l.map)===m);
  const bpOnMap=m=>BP.filter(b=>onMap(b,m));
  const missingOn=m=>bpOnMap(m).filter(b=>!owned(b.id));
  const arcsOnMap=m=>ARCS.filter(a=>(a.maps||[]).some(n=>mapByName(n)===m));
  const rarityClass=r=>({'Commun':'r0','Peu commun':'r1','Rare':'r2','Épique':'r3','Légendaire':'r4',Common:'r0',Uncommon:'r1',Rare2:'r2',Epic:'r3',Legendary:'r4'}[r]||'r0');

  /* ── Signaux ── */
  let refreshFrame=0;
  const changed=()=>{if(!refreshFrame)refreshFrame=requestAnimationFrame(()=>{refreshFrame=0;paintTop();views[current]?.refresh?.();});};
  function setOwned(id,v){const ok=P.setOwned(id,v);toast(ok?(v?'Schéma ajouté à ta collection.':'Schéma remis dans les schémas à trouver.'):'Stockage indisponible : exporte une sauvegarde dans Réglages.');return ok;}
  function togglePin(id){
    const s=P.snapshot(),on=s.pins.includes(id);
    s.pins=on?s.pins.filter(x=>x!==id):[...s.pins,id];
    P.savePrivate({pins:s.pins,notes:s.notes});toast(on?'Objectif retiré.':'Objectif ajouté : il sera proposé à ta prochaine sortie.');changed();
  }
  window.addEventListener('atlas:profiles',e=>{if(e.detail?.reason==='profile'||e.detail?.reason==='restore'){loadOps();for(const k of order)if(views[k].reset)views[k].reset();}changed();});

  /* ── Progression du raider ── */
  const RANKS=['Recrue','Éclaireur','Pilleur','Raider','Récupérateur','Traqueur d’ARC','Vétéran','Spécialiste','Élite de Speranza','Légende de Speranza'];
  const need=n=>150*n*(n+1);
  let ops;
  const opsKey=()=>'speranza.ops.v1.'+(P.active()||'solo');
  function loadOps(){ops={xp:0,raids:[],plan:null};try{Object.assign(ops,JSON.parse(read(opsKey())||'{}'));}catch{}}
  const saveOps=()=>write(opsKey(),JSON.stringify(ops));
  function rank(xp=ops.xp){let n=0;while(xp>=need(n+1))n++;return {level:n+1,name:RANKS[Math.min(n,RANKS.length-1)],from:need(n),to:need(n+1),pct:Math.round((xp-need(n))/(need(n+1)-need(n))*100)};}
  loadOps();

  /* ── Planning des événements de surface ── */
  const sched=(()=>{
    const feed=location.protocol==='file:'?'http://127.0.0.1:41783/schedule':'/api/planning',cacheKey='speranza.conditions.cache.v1',regionKey='speranza.conditions.region.v1';
    const names={'ARC Frigate':'Frégate ARC','Beachcombing':'Fouille du littoral','Bird City':'Ville aux oiseaux','Close Scrutiny':'Examen minutieux','Cold Snap':'Vague de froid','Electromagnetic Storm':'Tempête électromagnétique','Harvester':'Récolteur','Hidden Bunker':'Bunker caché','Hurricane':'Ouragan','Launch Tower Loot':'Butin de la tour de lancement','Locked Gate':'Portail verrouillé','Matriarch':'Matriarche','Night Raid':'Raid nocturne','Prospecting Probes':'Sondes de prospection','Redirection':'Redirection','Uncovered Caches':'Caches dévoilées','Lush Blooms':'Floraison abondante','Husk Graveyard':'Cimetière de carcasses','Flashpoint':'Point chaud','Queen':'Reine','Sandstorm':'Tempête de sable','Fog':'Brouillard','Heat Wave':'Vague de chaleur','Blizzard':'Blizzard','Solar Flare':'Éruption solaire'};
    const regions={europe:'Europe','north-america':'Amérique du Nord',brazil:'Brésil','east-asia':'Asie de l’Est',oceania:'Océanie'};
    const valid=s=>s?.version===1&&Number.isSafeInteger(s.fetchedAt)&&s.types&&Array.isArray(s.entries)&&s.entries.length>0&&s.entries.length<10000&&
      s.entries.every(e=>typeof e?.conditionName==='string'&&typeof e.mapDisplayName==='string'&&Number.isSafeInteger(e.startTimestamp)&&e.endTimestamp>e.startTimestamp);
    let data=window.ATLAS_TIMETABLE,events=[],state='memory',region=read(regionKey);
    if(!Object.hasOwn(regions,region))region='europe';
    try{const c=JSON.parse(read(cacheKey));if(valid(c)&&(!valid(data)||c.fetchedAt>=data.fetchedAt))data=c;}catch{}
    function index(){
      events=[];if(!valid(data))return;const seen=new Set();
      for(const e of data.entries){
        const t=e.regionTimestamps?.[region]??[e.startTimestamp,e.endTimestamp];
        if(!Array.isArray(t)||t.length!==2||!(t[1]>t[0]))continue;
        const map=mapByName(e.mapDisplayName);if(!map)continue;
        const k=e.conditionName+'|'+map.id+'|'+t[0];if(seen.has(k))continue;seen.add(k);
        events.push({start:t[0],end:t[1],map,title:names[e.conditionName]||e.conditionName,major:data.types[e.conditionName]==='major'});
      }
      events.sort((a,b)=>a.start-b.start);
    }
    index();
    // Schémas que cet événement rend trouvables sur cette carte (d'après les parcours « raid » documentés).
    function unlocks(ev){
      return BP.filter(b=>(b.routes||[]).some(r=>r.type==='raid'&&(r.condition==='Toute condition majeure active'?ev.major:(r.condition||'').split(' / ').includes(ev.title))&&(r.map||'').split(/\s*•\s*/).some(n=>mapByName(n)===ev.map)));
    }
    async function refresh(){
      if(state==='loading')return;state='loading';changed();
      const ctrl=new AbortController(),dog=setTimeout(()=>ctrl.abort(),12000);
      try{
        const res=await fetch(feed,{signal:ctrl.signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
        if(!res.ok)throw 0;const d=await res.json();if(!valid(d))throw 0;
        if(!valid(data)||d.fetchedAt>=data.fetchedAt){data=d;write(cacheKey,JSON.stringify(d));index();}
        state='live';
      }catch{state='offline';}finally{clearTimeout(dog);changed();}
    }
    return {
      active:(m,now=Date.now())=>events.filter(e=>(!m||e.map===m)&&e.start<=now&&now<e.end),
      next:(m,now=Date.now())=>events.find(e=>(!m||e.map===m)&&e.start>now&&e.start<now+24*3600000),
      hasFuture:(now=Date.now())=>events.some(e=>e.end>now),
      unlocks,refresh,state:()=>state,fetchedAt:()=>valid(data)?data.fetchedAt:0,
      regions,region:()=>region,setRegion(r){if(Object.hasOwn(regions,r)){region=r;write(regionKey,r);index();changed();}}
    };
  })();
  const clock=new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit'});
  const left=(t,now=Date.now())=>{const n=Math.max(0,Math.ceil((t-now)/60000));return n>=60?Math.floor(n/60)+' h '+String(n%60).padStart(2,'0'):n+' min';};
  const mmss=ms=>{const s=Math.max(0,Math.round(ms/1000));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');};
  // Horloges vivantes : tout élément [data-left] ou [data-clock] se met à jour seul.
  setInterval(()=>{
    const now=Date.now();
    for(const el of $$('[data-clock]')){const t=mmss(Number(el.dataset.clock)-now);if(el.textContent!==t)el.textContent=t;}
    for(const el of $$('[data-ring]')){const [a,b]=el.dataset.ring.split(',').map(Number);el.style.setProperty('--p',Math.max(0,Math.min(1,(b-now)/(b-a))).toFixed(4));}
  },500);
  setInterval(()=>{for(const el of $$('[data-left]'))el.textContent=left(Number(el.dataset.left));if(views[current]?.minute)views[current].minute();paintTop();},30000);

  /* ── Chargement paresseux ── */
  const loaded=new Map();
  const load=src=>{if(!loaded.has(src))loaded.set(src,new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>ko(Error('Chargement impossible : '+src));document.head.append(s);}));return loaded.get(src);};
  const chain=async list=>{for(const src of list)await load(src);};

  /* ── Navigation ── */
  const views={},order=[];let current='';
  const main=$('#stage');
  function register(id,def){views[id]=def;order.push(id);}
  async function go(id,param){
    if(!views[id])id='accueil';
    if(location.hash.slice(1)!==id){history.pushState(null,'','#'+id);}
    await show(id,param);
  }
  async function show(id,param){
    if(!views[id])id='accueil';
    const v=views[id],previous=current;current=id;
    if(previous&&previous!==id)views[previous]?.hide?.();
    closeSheet();$('#palette').open&&$('#palette').close();$('.dock').removeAttribute('data-more');
    for(const a of $$('[data-tab]')){if(a.dataset.tab===id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
    document.title=v.title+' — Speranza Ops';
    if(!v.el){
      v.el=document.createElement('section');v.el.id=v.hostId||('v-'+id);v.el.className='view'+(v.hostId?' module-view':'');v.el.setAttribute('aria-label',v.title);
      main.append(v.el);
    }
    for(const k of order)if(views[k].el)views[k].el.hidden=k!==id;
    if(!v.ready){
      v.el.innerHTML='<p class="loading" role="status">Chargement de « '+esc(v.title)+' »…</p>';
      try{await v.mount(v.el);v.ready=true;}
      catch(err){console.error(err);v.el.innerHTML='<div class="empty"><h2>Cet écran n’a pas pu se charger</h2><p>'+esc(err.message||err)+'</p><button class="btn" data-act="reload">Recharger la page</button></div>';return;}
    }
    await v.show?.(param);
    if(previous!==id){window.scrollTo({top:0,behavior:'instant'});if(previous)main.focus({preventScroll:true});}
    if(previous&&previous!==id&&!reduced())v.el.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:220,easing:'cubic-bezier(.2,.7,.2,1)'});
  }
  window.addEventListener('hashchange',()=>show(location.hash.slice(1)));
  window.addEventListener('popstate',()=>show(location.hash.slice(1)));

  /* ── Animations & lecture ── */
  const sysMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const syncMotion=()=>root.toggleAttribute('data-reduce-motion',sysMotion.matches||read('speranza.motion')==='reduced');
  const reduced=()=>root.hasAttribute('data-reduce-motion');
  window.AtlasMotion={reduced};syncMotion();sysMotion.addEventListener('change',syncMotion);
  const sizes=['normal','large','xl'];
  const setReading=s=>{root.dataset.reading=sizes.includes(s)?s:'normal';};
  setReading(read('speranza.reading.v1'));
  const top=$('.top');
  new ResizeObserver(()=>root.style.setProperty('--mast-height',Math.ceil(top.getBoundingClientRect().height)+'px')).observe(top);

  /* ── Bandeau supérieur ── */
  function paintTop(){
    const r=rank();
    $('#rankChip').innerHTML='<span class="rank-ring" style="--p:'+r.pct/100+'"><b>'+r.level+'</b></span><span class="rank-txt"><strong>'+esc(r.name)+'</strong><small>'+ops.xp+' XP</small></span>';
    $('#rankChip').setAttribute('aria-label','Niveau '+r.level+', '+r.name+', '+ops.xp+' XP. Ouvrir le journal des sorties');
    $('#profileOpen').textContent=P.name()||'Profil';$('#profileOpen').setAttribute('aria-label','Changer de profil'+(P.name()?' · '+P.name():''));
    const pill=$('#livePill'),plan=ops.plan;
    const game=window.OPS?.spawns?.raid?.();
    if(game){
      // Chrono calé sur le jeu : c'est lui qui fait foi, partout dans le site.
      pill.hidden=false;pill.dataset.kind='raid';pill.dataset.go='cartes';pill.innerHTML=ico('raid')+'<span>Raid · '+esc(mapById(game.map)?.short||'')+'</span><b data-clock="'+game.endAt+'">'+mmss(game.endAt-Date.now())+'</b>';
    }else if(plan?.startedAt){
      const end=plan.startedAt+plan.minutes*60000;
      pill.hidden=false;pill.dataset.kind='raid';pill.innerHTML=ico('raid')+'<span>Sortie en cours</span><b data-clock="'+end+'">'+mmss(end-Date.now())+'</b>';pill.dataset.go='raid';
    }else{
      const now=sched.active(),ev=now.find(e=>e.major)||now[0];
      pill.hidden=!ev;if(ev){pill.dataset.kind=ev.major?'major':'minor';pill.dataset.go='accueil';pill.innerHTML='<i class="dot"></i><span>'+esc(ev.title)+' · '+esc(ev.map.short)+'</span><b data-left="'+ev.end+'">'+left(ev.end)+'</b>';}
    }
  }

  /* ── Panneau latéral ── */
  const sheet=$('#sheet');let sheetReturn=null;
  function openSheet(html,{wide=false,label='Détail'}={}){
    if(!sheet.open)sheetReturn=document.activeElement;
    sheet.classList.toggle('wide',wide);sheet.setAttribute('aria-label',label);
    sheet.innerHTML='<button class="sheet-x" data-act="close-sheet" aria-label="Fermer">'+ico('close')+'</button><div class="sheet-in">'+html+'</div>';
    if(!sheet.open)sheet.showModal();
    sheet.scrollTop=0;$('.sheet-x',sheet).focus({preventScroll:true});
  }
  function closeSheet(){if(sheet.open)sheet.close();}
  sheet.addEventListener('close',()=>{if(sheetReturn?.isConnected)sheetReturn.focus({preventScroll:true});sheetReturn=null;});
  for(const d of [sheet,$('#palette')])d.addEventListener('click',e=>{if(e.target===d)d.close();});

  /* ── Messages ── */
  let toastTimer;
  function toast(msg){const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{t.hidden=true;},3600);}

  /* ── Actions déclaratives : <button data-act="nom" …> ── */
  const actions={
    go:d=>go(d.view,d.param),
    'close-sheet':closeSheet,
    reload:()=>location.reload(),
    own:(d,el)=>{setOwned(d.id,el.type==='checkbox'?el.checked:!owned(d.id));},
    pin:d=>togglePin(d.id),
    palette:()=>openPalette(),
    settings:()=>openSettings(),
    journal:()=>openJournal(),
    pill:(d)=>go(d.go||'accueil'),
    tab:(d,el)=>{const box=el.closest('[data-tabs]');if(!box)return;for(const b of $$('[data-act="tab"]',box))b.setAttribute('aria-selected',String(b===el));for(const pn of $$('[data-panel]',box))pn.hidden=pn.dataset.panel!==d.t;},
    more:()=>{const k=$('.dock');k.toggleAttribute('data-more');$('#dockMore').setAttribute('aria-expanded',String(k.hasAttribute('data-more')));},
    'sched-refresh':()=>sched.refresh()
  };
  document.addEventListener('click',e=>{
    const el=e.target.closest?.('[data-act]');
    if(!el||el.matches('input[type=checkbox],select'))return;
    const fn=actions[el.dataset.act];if(!fn)return;
    if(el.tagName==='A')e.preventDefault();
    fn(el.dataset,el,e);
  });
  document.addEventListener('change',e=>{const el=e.target.closest?.('[data-act]');if(el&&el.matches('input[type=checkbox],select'))actions[el.dataset.act]?.(el.dataset,el,e);});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('.dock'))$('.dock').removeAttribute('data-more');});

  /* ── Recherche globale ── */
  let directory=null,poiIndexed=false;
  function buildDirectory(){
    directory=[];
    const add=(label,kind,alias,run,icon)=>directory.push({label,kind,icon,terms:norm(label+' '+(alias||'')+' '+kind),run});
    for(const id of order)add(views[id].title,'Écran','',()=>go(id),views[id].icon);
    for(const m of MAPS)add(m.name,'Carte',m.en,()=>window.openAtlasMap(m.id),'map');
    for(const a of ARCS)add(a.name,'ARC',a.en+' '+(a.aliases||[]).join(' '),()=>actions.arc({id:a.id}),'arc');
    for(const b of BP)add(b.name,owned(b.id)?'Schéma acquis':'Schéma à trouver',b.en,()=>actions.bp({id:b.id}),'layers');
    for(const [id,w] of Object.entries(window.ARMORY_DATA?.weapons||{}))add(w.name,'Arme',w.en+' '+w.cat,()=>window.openAtlasWeapon(id),'weapon');
    for(const [id,i] of Object.entries(window.LOOT_DATA||{}))add(i.name,'Butin',i.en,()=>actions.loot({id}),'pack');
    indexPOI();
  }
  function indexPOI(){
    if(!directory||poiIndexed||!window.RAID_MAP_DATA)return;poiIndexed=true;
    for(const m of window.RAID_MAP_DATA.maps){const seen=new Set();
      for(const p of m.points){if(!['label','sector'].includes(p[2])||!p[4]||seen.has(p[4]))continue;seen.add(p[4]);
        directory.push({label:p[4],kind:'Lieu · '+m.name,icon:'pin',terms:norm(p[4]+' '+(p[5]||'')+' '+m.name),run:()=>window.openAtlasMap(m.id,p[4])});}}
  }
  const palette=$('#palette');let hits=[];
  function openPalette(){
    if(!directory)buildDirectory();else indexPOI();
    palette.innerHTML='<div class="pal"><label class="pal-in">'+ico('search')+'<input type="search" id="palQ" placeholder="Un ARC, une arme, un schéma, un lieu, un objet…" autocomplete="off" aria-label="Rechercher partout" aria-controls="palHits"><kbd>Échap</kbd></label><div id="palHits" class="pal-hits" role="listbox" aria-label="Résultats"></div><p class="pal-foot">↑ ↓ pour choisir · Entrée pour ouvrir</p></div>';
    if(!palette.open)palette.showModal();
    const input=$('#palQ'),box=$('#palHits');let sel=0;
    const draw=()=>{
      const q=norm(input.value.trim()),tok=q.split(/\s+/).filter(Boolean);
      const score=h=>norm(h.label)===q?0:norm(h.label).startsWith(q)?1:2;
      hits=(q?directory.filter(h=>tok.every(t=>h.terms.includes(t))).sort((a,b)=>score(a)-score(b)||a.label.localeCompare(b.label,'fr')):directory.filter(h=>h.kind==='Écran')).slice(0,40);
      sel=0;
      box.innerHTML=hits.map((h,i)=>'<button type="button" role="option" data-hit="'+i+'" aria-selected="'+(i===0)+'">'+ico(h.icon||'chevron')+'<span>'+esc(h.label)+'</span><small>'+esc(h.kind)+'</small></button>').join('')||'<p class="empty-line">Rien à ce nom. Essaie le nom anglais ou un mot plus court.</p>';
    };
    const mark=()=>{$$('[data-hit]',box).forEach((b,i)=>{b.setAttribute('aria-selected',String(i===sel));if(i===sel)b.scrollIntoView({block:'nearest'});});};
    const run=i=>{const h=hits[i];if(!h)return;palette.close();h.run();};
    input.oninput=draw;
    input.onkeydown=e=>{
      if(e.key==='ArrowDown'){e.preventDefault();sel=Math.min(hits.length-1,sel+1);mark();}
      else if(e.key==='ArrowUp'){e.preventDefault();sel=Math.max(0,sel-1);mark();}
      else if(e.key==='Enter'){e.preventDefault();run(sel);}
    };
    box.onclick=e=>{const b=e.target.closest('[data-hit]');if(b)run(Number(b.dataset.hit));};
    draw();input.focus();
  }

  /* ── Réglages & journal ── */
  function openSettings(){
    const motion=read('speranza.motion')==='reduced'?'reduced':'system',size=root.dataset.reading;
    openSheet('<h2>Réglages</h2>'+
      '<section class="set"><h3>Profil</h3><p>Tu joues en tant que <b>'+esc(P.name()||'—')+'</b>.</p><div class="row"><button class="btn" data-act="profile">Changer ou créer un profil</button><button class="btn" data-act="profile-rename">Renommer</button><button class="btn" data-act="capture">Importer une capture du jeu</button><button class="btn" data-act="compare">Comparer avec l’escouade</button><button class="btn danger" data-act="profile-delete">Supprimer ce profil</button></div></section>'+
      '<section class="set"><h3>Lecture</h3><div class="seg" role="radiogroup" aria-label="Taille du texte">'+[['normal','Normale'],['large','Grande'],['xl','Très grande']].map(([v,l])=>'<button role="radio" aria-checked="'+(size===v)+'" data-act="reading" data-v="'+v+'">'+l+'</button>').join('')+'</div>'+
      '<label class="own"><input type="checkbox" data-act="motion-fx"'+(read('speranza.ops.motion')!=='off'?' checked':'')+'><span>Effets de mouvement (souris, clic, défilement)</span></label><label class="field">Animations<select data-act="motion"><option value="system"'+(motion==='system'?' selected':'')+'>Selon l’appareil</option><option value="reduced"'+(motion==='reduced'?' selected':'')+'>Réduites</option></select></label></section>'+
      '<section class="set"><h3>Événements de surface</h3><label class="field">Région des serveurs<select data-act="region">'+Object.entries(sched.regions).map(([k,v])=>'<option value="'+k+'"'+(k===sched.region()?' selected':'')+'>'+v+'</option>').join('')+'</select></label><p class="fine">Le planning en direct vient du relais local : lance « Ouvrir Speranza Ops.cmd » dans le dossier du site.</p></section>'+
      '<section class="set"><h3>Sauvegarde et mise à jour</h3><p class="fine">Profils, collections, notes, journal, montages, parcours et captures personnelles. Exporte une sauvegarde avant une mise à jour ou un changement d’appareil.</p><div class="row"><button class="btn" data-act="export">Exporter un fichier</button><button class="btn" data-act="import">Restaurer un fichier</button></div><p><button class="btn" data-act="update-help">Mettre le site à jour sans perdre mes données</button></p><input type="file" id="importFile" accept="application/json,.json" hidden></section>'+
      '<section class="set"><h3>Sources</h3><p class="fine">Données communautaires : ARC Tracker, ARC Raiders Wiki, RaidTheory, arc.luxxxmaximus.com, arcraidershub.com, MetaForge. Site de fans, sans lien avec Embark Studios. Polices Barlow et IBM Plex Mono sous licence OFL.</p></section>',{label:'Réglages'});
  }
  Object.assign(actions,{
    profile:()=>{closeSheet();P.choose();},
    'profile-rename':()=>{const n=prompt('Nouveau pseudo (24 caractères au plus) :',P.name());if(n===null)return;if(P.rename(n)){toast('Profil renommé.');openSettings();}else toast('Pseudo vide ou déjà utilisé sur cet appareil.');},
    'profile-delete':()=>{if(P.active()&&confirm('Supprimer le profil « '+P.name()+' », sa collection, ses objectifs et son journal ? Cette action est définitive.')){closeSheet();P.remove();toast('Profil supprimé.');}},
    compare(){actions.trade({tab:'cmp'});},
    // Échanges : ce que chacun a en trop face à ce qui manque à l'autre, puis le tableau comparatif.
    trade(d={}){
      const others=window.AtlasDuo?.members?.()||[],mine=P.spare(),code=window.AtlasDuo?.code?.(),tab=d.tab==='cmp'?'cmp':'swap';
      const chip=(b,act,label)=>'<li><button class="link" data-act="bp" data-id="'+b.id+'">'+esc(b.name)+'</button>'+(act?'<button class="btn small" data-act="'+act+'" data-id="'+b.id+'">'+label+'</button>':'')+'</li>';
      const blocks=others.map(m=>{
        const get=BP.filter(b=>!owned(b.id)&&(m.spare||[]).includes(b.id)),give=BP.filter(b=>mine.includes(b.id)&&!m.owned.includes(b.id)),n=Math.min(get.length,give.length);
        return '<section class="trade"><h3>'+esc(m.name)+' <small>'+(m.live?'relié':'hors ligne')+'</small></h3>'+
          (m.game?'<p class="trade-game">En jeu : <b>'+esc(m.game)+'</b> <button class="btn small" data-act="copy-game" data-g="'+esc(m.game)+'">Copier le pseudo</button></p>':'<p class="trade-game fine">Il n’a pas encore indiqué son pseudo en jeu.</p>')+
          (n?'<p class="trade-deal">Échange possible : <b>'+n+' contre '+n+'</b></p>':'')+
          '<div class="trade-cols"><div><h4>Il peut te donner <b>'+get.length+'</b></h4>'+(get.length?'<ul>'+get.map(b=>chip(b,'trade-got','Reçu')).join('')+'</ul>':'<p class="fine">Rien de ce qui te manque dans ses schémas en trop.</p>')+'</div>'+
          '<div><h4>Tu peux lui donner <b>'+give.length+'</b></h4>'+(give.length?'<ul>'+give.map(b=>chip(b,'trade-gave','Donné')).join('')+'</ul>':'<p class="fine">Rien de ce qui lui manque dans tes schémas en trop.</p>')+'</div></div></section>';}).join('');
      const swap=(others.length?blocks:'<p class="notice">'+(code?'Aucun coéquipier n’a encore partagé ses schémas.':'Crée ou rejoins une escouade pour voir les échanges possibles.')+' <button class="link" data-act="squad-open">Ouvrir Escouade</button></p>')+
        '<section class="trade"><h3>Mes schémas en trop <small>'+mine.length+'</small></h3>'+(mine.length?'<ul class="trade-mine">'+BP.filter(b=>mine.includes(b.id)).map(b=>chip(b,'trade-gave','Retirer')).join('')+'</ul>':'<p class="fine">Aucun pour l’instant. Dans Schémas, touche « En trop » sur ceux que tu as en double.</p>')+
        '<div class="row"><button class="btn" data-act="spare-pick">Marquer mes schémas en trop</button><button class="btn" data-act="trade-copy">Copier ma liste</button></div></section>'+
        '<section class="trade"><h3>Mon pseudo en jeu</h3><p class="fine">Celui qui s’affiche dans ARC Raiders, avec son numéro à quatre chiffres. C’est ce numéro qui permet aux autres de t’ajouter sans se tromper de raider.</p>'+
        '<label class="field inline"><span class="sr-only">Pseudo ARC Raiders</span><input type="text" data-game maxlength="32" autocomplete="off" spellcheck="false" placeholder="Raider#1234" value="'+esc(P.gameName())+'"><button class="btn primary" data-act="game-save">Enregistrer</button></label>'+
        (P.gameName()&&!P.gameOk?.(P.gameName())?'<p class="notice">Il manque le numéro à quatre chiffres. Sans lui, personne ne peut t’ajouter en jeu.</p>':'')+'</section>';
      const cols=[{name:P.name()+' (toi)',has:id=>owned(id)},...others.map(m=>({name:m.name,has:id=>m.owned.includes(id)}))];
      const cmp=(others.length?'<div class="stats">'+cols.map(c=>'<div><b>'+BP.filter(b=>c.has(b.id)).length+'</b><span>'+esc(c.name)+'</span></div>').join('')+'</div>':'')+
        '<div class="cmp-wrap"><table class="cmp"><thead><tr><th scope="col">Schéma</th>'+cols.map(c=>'<th scope="col">'+esc(c.name)+'</th>').join('')+'</tr></thead><tbody>'+BP.map(b=>'<tr><th scope="row"><button class="link" data-act="bp" data-id="'+b.id+'">'+esc(b.name)+'</button></th>'+cols.map(c=>'<td data-on="'+c.has(b.id)+'">'+(c.has(b.id)?'✓':'—')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
      openSheet('<h2>Échanges de schémas</h2><div data-tabs><div class="tabs" role="tablist"><button role="tab" data-act="tab" data-t="swap" aria-selected="'+(tab==='swap')+'">Échanges</button><button role="tab" data-act="tab" data-t="cmp" aria-selected="'+(tab==='cmp')+'">Comparer</button></div>'+
        '<div data-panel="swap"'+(tab==='swap'?'':' hidden')+'>'+swap+'</div><div data-panel="cmp"'+(tab==='cmp'?'':' hidden')+'>'+cmp+'</div></div>',{wide:true,label:'Échanges de schémas'});
    },
    'game-save':()=>{const i=$('[data-game]');if(!i)return;const v=i.value.trim();
      if(v&&!P.gameOk?.(v)){toast('Écris-le comme en jeu, avec son numéro : Raider#1234.');i.focus();return;}
      if(P.setGameName(v)){toast(P.gameName()?'Pseudo en jeu enregistré : '+P.gameName():'Pseudo en jeu retiré.');actions.trade();}
      else toast('Ce pseudo ne passe pas. Essaie sans caractère spécial.');},
    'copy-game':async d=>{try{await navigator.clipboard.writeText(d.g);toast('Pseudo copié : cherche-le dans ARC Raiders.');}catch{toast('Copie impossible ici.');}},
    'trade-got':d=>{setOwned(d.id,true);actions.trade();},
    'trade-gave':d=>{P.setSpare(d.id,false);actions.trade();},
    'trade-copy':async()=>{
      const names=l=>l.map(b=>b.name).join(', ')||'rien',txt='Schémas ARC Raiders — '+(P.gameName()||P.name())+'\nEn trop : '+names(BP.filter(b=>P.spare().includes(b.id)))+'\nJe cherche : '+names(BP.filter(b=>!owned(b.id)));
      try{await navigator.clipboard.writeText(txt);toast('Liste copiée : colle-la où tu veux.');}catch{toast('Copie impossible ici.');}
    },
    'spare-pick':()=>{closeSheet();go('collection',{state:'owned'});},
    'squad-open':()=>{closeSheet();document.getElementById('duoOpen')?.click();},
    spare:(d,el)=>{const on=!P.spare().includes(d.id);P.setSpare(d.id,on);toast(on?'Noté en trop : visible par ton escouade.':'Retiré des schémas en trop.');},
    reading:d=>{setReading(d.v);write('speranza.reading.v1',d.v);openSettings();},
    motion:(d,el)=>{write('speranza.motion',el.value);syncMotion();},
    region:(d,el)=>sched.setRegion(el.value),
    export:()=>{
      const keys={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('speranza.')||k.startsWith('baithz.'))keys[k]=localStorage.getItem(k);}}catch{}
      const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({format:'speranza-ops',version:1,savedAt:new Date().toISOString(),profile:P.name(),keys})],{type:'application/json'}));
      a.download='speranza-ops-'+(P.name()||'profil').replace(/[^\w-]+/g,'_')+'-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('Sauvegarde exportée.');
    },
    import:()=>{
      const f=$('#importFile');f.onchange=async()=>{
        try{
          const file=f.files[0];if(!file)return;if(file.size>16e6)throw Error('Le fichier dépasse 16 Mo.');
          const d=JSON.parse(await file.text());
          if(d?.format!=='speranza-ops'||typeof d.keys!=='object')throw Error('Ce fichier n’est pas une sauvegarde Speranza Ops.');
          const entries=Object.entries(d.keys).filter(([k,v])=>/^(speranza|baithz)\./.test(k)&&typeof v==='string');
          if(!confirm('Restaurer '+entries.length+' réglages enregistrés le '+new Date(d.savedAt).toLocaleString('fr-FR')+' ? Les données actuelles de ce navigateur seront remplacées.'))return;
          for(const [k,v] of entries)localStorage.setItem(k,v);location.reload();
        }catch(err){toast('Restauration impossible : '+(err.message||err));}
      };f.click();
    }
  });
  function openJournal(){
    const r=rank(),raids=[...ops.raids].reverse(),ok=ops.raids.filter(x=>x.result==='extract').length;
    openSheet('<h2>'+esc(r.name)+'</h2><p class="lead">Niveau '+r.level+' · '+ops.xp+' XP. Encore '+(r.to-ops.xp)+' XP avant « '+esc(RANKS[Math.min(r.level,RANKS.length-1)])+' ».</p><div class="bar"><i style="width:'+r.pct+'%"></i></div>'+
      '<div class="stats"><div><b>'+ops.raids.length+'</b><span>sorties</span></div><div><b>'+ok+'</b><span>extractions</span></div><div><b>'+(ops.raids.length?Math.round(ok/ops.raids.length*100)+' %':'—')+'</b><span>de réussite</span></div><div><b>'+ops.raids.reduce((n,x)=>n+(x.result==='extract'?x.found.length:0),0)+'</b><span>schémas rapportés</span></div></div>'+
      '<h3>Journal des sorties</h3>'+(raids.length?'<ul class="log">'+raids.slice(0,40).map(x=>{const m=mapById(x.map);return '<li data-result="'+x.result+'"><span class="log-res">'+(x.result==='extract'?'Extraction':'Abattu')+'</span><div><b>'+esc(m?.name||x.map)+'</b><small>'+new Date(x.end).toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})+' · '+Math.max(1,Math.round((x.end-x.start)/60000))+' min'+(x.found.length?' · '+x.found.map(id=>esc(bpById.get(id)?.name||id)).join(', '):'')+'</small></div><em>+'+x.xp+' XP</em></li>';}).join('')+'</ul>':'<p class="fine">Aucune sortie enregistrée. Prépare la première depuis l’écran Sortie : chaque extraction rapporte de l’XP.</p><button class="btn primary" data-act="go" data-view="raid">Préparer une sortie</button>'),{label:'Journal des sorties'});
  }

  /* ── Clavier ── */
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&String(e.key).toLowerCase()==='k'){e.preventDefault();openPalette();return;}
    if(e.ctrlKey||e.metaKey||e.altKey||e.defaultPrevented)return;
    if(e.target.closest?.('input,select,textarea,[contenteditable="true"],canvas,[role=application]')||$('dialog[open]'))return;
    if(e.key==='/'){e.preventDefault();const f=$('[data-search]',views[current]?.el||document);if(f)f.focus();else openPalette();return;}
    const n=Number(e.key);if(Number.isInteger(n)&&n>=1&&n<=order.length){e.preventDefault();go(order[n-1]);}
  });

  // Groupes de boutons radio : flèches pour changer, comme un vrai groupe natif.
  document.addEventListener('keydown',e=>{
    const g=e.target.closest?.('[role=radiogroup]');if(!g||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
    const list=$$('[role=radio]',g),i=list.indexOf(e.target);if(i<0)return;
    e.preventDefault();const n=list[(i+(e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1)+list.length)%list.length],act=n.dataset.act,v=n.dataset.v??n.dataset.map;
    n.click();($$('[role=radio][data-act="'+act+'"]').find(b=>(b.dataset.v??b.dataset.map)===v)||n).focus({preventScroll:true});
  });
  window.OPS={$,$$,esc,norm,ico,read,write,MAPS,mapById,mapByName,BP,bpById,ARCS,arcById,P,owned,pins,pinned,togglePin,setOwned,onMap,bpOnMap,missingOn,arcsOnMap,rarityClass,
    sched,clock,left,mmss,ops:()=>ops,saveOps,rank,RANKS,register,go,show,views,current:()=>current,openSheet,closeSheet,toast,actions,load,chain,changed,reduced,paintTop,
    start(){
      order.sort((a,b)=>views[a].pos-views[b].pos);
      $('.dock-links').innerHTML=order.map((id,i)=>'<a href="#'+id+'" data-tab="'+id+'" data-act="go" data-view="'+id+'" class="'+(i>3?'extra':'')+'" title="'+esc(views[id].title)+' ('+(i+1)+')">'+ico(views[id].icon)+'<span>'+esc(views[id].short||views[id].title)+'</span></a>').join('');
      paintTop();show(location.hash.slice(1)||'accueil');
      sched.refresh();setInterval(()=>sched.refresh(),10*60000);
    }};
})();
