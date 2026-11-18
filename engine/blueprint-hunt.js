/* Les priorités de recherche sont des occasions documentées, jamais des taux de butin estimés. */
(() => {
  'use strict';
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const items=window.BLUEPRINTS, byId=new Map(items.map(i=>[i.id,i]));
  const aliases={'site d assemblage des fusees':'Assemblage des fusées','tour de communication':'Communications'};
  const containerKinds={
    'Commode':['drawers','drawer'],'Tiroir d’étagère':['drawers','drawer'],'Bureau':['desk'],"Bureau d'entrepôt":['desk'],
    'Placard de cuisine':['cupboard','cupboards'],'Placard':['cupboard','cupboards'],'Réfrigérateur':['fridge'],
    'Boîte de munitions':['ammo-case'],'Tube à grenades':['grenade-case'],"Caisse d'armes":['weapon-case'],
    'Sac médical':['medical-bag'],'Cache de Raider':['raider-cache'],'Cache de Raider de la Première Vague':['first-wave-cache'],
    'Cache de Raider gelée':['frozen-raider-cache'],'Sac à dos usé':['backpack'],'Androïde':['androids'],
    'Bus':['bus'],'Voiture':['car'],'Moissonneur':['harvester-event'],'Évaluateur ARC':['arc-assesor']
  };
  const kindIndex=new Map(Object.entries(containerKinds).map(([label,kinds])=>[norm(label),kinds]));
  const special=new Set(['first-wave-cache','harvester-event','arc-assesor']);
  const majorConditions=new Set(['Tempête électromagnétique','Portail verrouillé','Raid nocturne','Ouragan','Bunker caché','Examen minutieux','Frégate ARC']);
  const conditionNames=['Toutes les conditions','Sans condition spéciale',...majorConditions,'Récolteur','Matriarche','Vague de froid'];
  const grid=p=>'ABCDEFGHIJ'[Math.min(9,Math.floor(p.x*10))]+Math.min(10,Math.floor(p.y*10)+1);
  const owned=id=>window.AtlasProfiles?.has(id,window.AtlasProfiles.active())===true;
  const scoped=(route,map)=>route.map?.split(/\s*•\s*/).some(n=>norm(n)===norm(map.name));
  function permitted(route,condition){
    if(!condition||condition==='Toutes les conditions')return true;
    if(route.condition==='Toutes conditions')return true;
    if(route.condition==='Toute condition majeure active')return majorConditions.has(condition);
    return route.condition?.split(' / ').includes(condition);
  }
  function kindsFor(route,condition){
    return [...new Set((route.containers||'').split(' • ').flatMap(c=>kindIndex.get(norm(c))||[]))].filter(k=>
      k!=='first-wave-cache'||!condition||condition==='Toutes les conditions'||condition==='Ouragan').filter(k=>
      k!=='frozen-raider-cache'||!condition||condition==='Toutes les conditions'||condition==='Vague de froid');
  }
  function namedPlaces(item,map,route){
    return (item.locations||[]).filter(l=>l.type==='raid'&&norm(l.map)===norm(map.name)&&l.detail.startsWith(route.condition))
      .flatMap(l=>l.place.split(', ').map(name=>({name,source:l.source}))).filter(p=>!/^Fouille|^Butin |^Intercepter|^Conditions majeures/.test(p.name));
  }
  function matchPlace(map,name){
    const base=norm(name.replace(/\s*\(.*?\)/g,'')), full=norm(name);
    const candidates=map.points.filter(p=>p.group==='sector');
    let hits=candidates.filter(p=>[p.name,p.alias].some(n=>norm(n)===full||norm(n)===base));
    // Seulement des alias explicites et sans ambiguïté. Une pharmacie absente n'est pas toute la place.
    if(!hits.length&&aliases[base])hits=candidates.filter(p=>norm(p.name)===norm(aliases[base]));
    return hits;
  }
  function build(map,target='missing',condition='Toutes les conditions'){
    const chosen=target==='missing'?items.filter(i=>!owned(i.id)):target==='all'?items:byId.has(target)?[byId.get(target)]:[];
    const areas=new Map(), broad=[],unlocated=[],alternatives=[];
    const add=(anchor,entry,label,kind='sector',members=[])=>{
      const key=kind+':'+anchor.id;
      if(!areas.has(key))areas.set(key,{id:key,huntZone:true,anchor,x:anchor.x,y:anchor.y,layer:anchor.layer,name:label,kind,entries:[],members:[],radius:.065});
      const z=areas.get(key);
      if(!z.entries.some(e=>e.item.id===entry.item.id&&e.route===entry.route))z.entries.push(entry);
      for(const p of members)if(!z.members.includes(p))z.members.push(p);
    };
    for(const item of chosen){
      for(const route of item.routes||[]){
        if(route.type!=='raid'){alternatives.push({item,route});continue;}
        if(!permitted(route,condition))continue;
        if(route.condition==='Toute condition majeure active'){broad.push({item,route});continue;}
        if(!scoped(route,map))continue;
        const entry={item,route,kinds:kindsFor(route,condition)};
        const places=namedPlaces(item,map,route);
        if(places.length){
          for(const place of places){
            const matches=matchPlace(map,place.name);
            if(!matches.length){unlocated.push({...entry,place:place.name,source:place.source});continue;}
            for(const anchor of matches)add(anchor,{...entry,place:place.name,source:place.source},anchor.name);
          }
        }else if(entry.kinds.length===1&&special.has(entry.kinds[0])){
          const points=map.points.filter(p=>p.kind===entry.kinds[0]);
          const remaining=new Set(points);
          while(remaining.size){
            const seed=[...remaining][0],members=[...remaining].filter(p=>p.layer===seed.layer&&Math.hypot(p.x-seed.x,p.y-seed.y)<.12);
            members.forEach(p=>remaining.delete(p));
            const center={x:members.reduce((n,p)=>n+p.x,0)/members.length,y:members.reduce((n,p)=>n+p.y,0)/members.length};
            const anchor=members.reduce((a,p)=>Math.hypot(p.x-center.x,p.y-center.y)<Math.hypot(a.x-center.x,a.y-center.y)?p:a);
            const near=map.points.filter(p=>p.group==='sector'&&p.layer===anchor.layer).map(p=>({p,d:Math.hypot(p.x-center.x,p.y-center.y)})).sort((a,b)=>a.d-b.d)[0];
            const label=(entry.kinds[0]==='first-wave-cache'?'Caches Première Vague':anchor.name)+(near&&near.d<.16?' · '+near.p.name:' · '+grid(anchor));
            add(anchor,entry,label,'target',members);
          }
          if(!points.length)unlocated.push({...entry,place:route.containers,source:route.source});
        }else broad.push(entry);
      }
    }
    const zones=[...areas.values()];
    for(const z of zones){
      z.items=[...new Map(z.entries.map(e=>[e.item.id,e.item])).values()];
      if(z.kind==='sector'){
        const kinds=new Set(z.entries.flatMap(e=>e.kinds));
        const aspect=map.layers[z.layer].height/map.layers[z.layer].width;
        z.members=map.points.filter(p=>p.layer===z.layer&&kinds.has(p.kind)&&Math.hypot(p.x-z.x,(p.y-z.y)*aspect)<=z.radius);
      }else z.radius=Math.max(.045,...z.members.map(p=>Math.hypot(p.x-z.x,(p.y-z.y)*map.layers[z.layer].height/map.layers[z.layer].width)+.015));
      z.conditions=[...new Set(z.entries.map(e=>e.route.condition))];
    }
    zones.sort((a,b)=>b.items.length-a.items.length||b.members.length-a.members.length||a.name.localeCompare(b.name,'fr')||a.layer-b.layer);
    zones.forEach((z,i)=>z.number=i+1);
    return {zones,broad,unlocated,alternatives,chosen};
  }
  window.BlueprintSearch={build,kindsFor,matchPlace,permitted};

  window.createBlueprintHunt=(host,api)=>{
    let active=false,target='missing',condition='Toutes les conditions',selectedId='',result,revision='',expanded=false;
    try{
      const preference=JSON.parse(localStorage.getItem('speranza.maps.hunt.target'));
      if(preference&&(['missing','all'].includes(preference.target)||byId.has(preference.target)))target=preference.target;
      if(preference&&conditionNames.includes(preference.condition))condition=preference.condition;
    }catch{}
    function remember(){try{localStorage.setItem('speranza.maps.hunt.target',JSON.stringify({target,condition}));}catch{}}
    const layout=host.querySelector('.rm-layout'),board=host.querySelector('.rm-board');
    const shelf=window.mountMissingShelf(host.querySelector('.rm-head'),()=>api.chart().map);
    const controls=document.createElement('section');controls.className='rh-controls';
    controls.setAttribute('aria-label','Recherche de schémas sur la carte');
    controls.innerHTML=`<div class="rh-heading"><div><span class="rm-kicker">OBJECTIF DE RAID</span><h3>Où chercher mes schémas ?</h3></div><div class="rh-mode" role="group" aria-label="Mode de la carte"><button type="button" data-hunt-mode="off" aria-pressed="true">Tous les repères</button><button type="button" data-hunt-mode="on" aria-pressed="false">⌖ Chasse aux schémas</button></div></div><p data-hunt-intro>Affiche les secteurs documentés pour tes schémas manquants et les conteneurs à y fouiller.</p><div class="rh-selectors" data-hunt-controls hidden><label>Schéma recherché<select data-hunt-item></select></label><label>Condition prévue<select data-hunt-condition>${conditionNames.map(c=>'<option>'+esc(c)+'</option>').join('')}</select></label><p class="rh-method">Les numéros donnent un ordre de recherche, pas une probabilité de drop. Conditions à vérifier avant le départ.</p></div>`;
    layout.prepend(controls);
    const panel=document.createElement('aside');panel.className='rh-panel';panel.hidden=true;panel.id='rm-hunt-zones';panel.setAttribute('aria-label','Zones où chercher les schémas');
    panel.innerHTML='<div class="rh-panel-head"><span class="rm-kicker">COMMENCER PAR…</span><h3>Zones de recherche</h3><p data-hunt-count role="status"></p></div><div data-hunt-zones></div><button type="button" data-hunt-more hidden>Autres zones</button><div data-hunt-empty></div><details class="rh-explain"><summary>Pourquoi cet ordre ?</summary><p>Une zone passe devant si elle concerne davantage de tes schémas recherchés, puis si le relevé comporte plus de repères de fouille de types correspondants à proximité. Le halo montre les abords du lieu : il ne délimite ni un bâtiment ni une table de loot.</p><p>Les conteneurs sont des positions signalées, pas des apparitions garanties. Un même type de meuble peut appartenir à plusieurs familles de butin. Certains meubles et étages intérieurs ne sont pas détaillés. Aucun taux de drop par zone n’est publié dans les sources utilisées.</p></details><button type="button" class="rh-return" data-hunt-return>Revenir à la carte →</button>';
    board.before(panel);
    const strip=document.createElement('div');strip.className='rh-map-key';strip.hidden=true;
    strip.innerHTML='<span><b>01</b> Secteur à fouiller</span><span><i></i> Caches / objectif ciblé</span><span data-hunt-floor-note></span><button type="button" data-hunt-advice hidden>Conseils de fouille ↓</button>';
    board.querySelector('.rm-map-tools').after(strip);
    const detail=document.createElement('section');detail.className='rh-detail';detail.hidden=true;detail.setAttribute('aria-label','Conseils de fouille du secteur');
    host.querySelector('.rm-sidebar').prepend(detail);
    const destinationNote=document.createElement('section');
    destinationNote.className='rh-destination';destinationNote.tabIndex=-1;destinationNote.hidden=true;
    destinationNote.setAttribute('aria-label','Schéma et lieu de fouille');
    board.querySelector('.rm-stage').before(destinationNote);
    const $=s=>host.querySelector(s);
    function itemOptions(){
      const value=target;
      $('[data-hunt-item]').innerHTML='<option value="missing">Mes schémas manquants · '+items.filter(i=>!owned(i.id)).length+'</option><option value="all">Tous les schémas</option>'+items.slice().sort((a,b)=>a.name.localeCompare(b.name,'fr')).map(i=>'<option value="'+esc(i.id)+'">'+esc(i.name)+(owned(i.id)?' · acquis':'')+'</option>').join('');
      $('[data-hunt-item]').value=value;
    }
    function setActive(on){
      active=on;layout.dataset.hunt=String(on);panel.hidden=!on;strip.hidden=!on;
      $('[data-hunt-controls]').hidden=!on;$('[data-hunt-intro]').hidden=on;
      for(const b of controls.querySelectorAll('[data-hunt-mode]'))b.setAttribute('aria-pressed',String((b.dataset.huntMode==='on')===on));
      const switcher=$('[data-map-pane="legend"]');
      switcher.setAttribute('aria-controls',on?panel.id:'rm-current-legend');
      switcher.setAttribute('aria-label',on?'Zones de recherche':'Filtres de carte');
      // Conserve le comportement du panneau mobile et ses écouteurs.
      for(const n of switcher.childNodes)if(n.nodeType===3)n.textContent=on?'Zones ':'Filtres ';
      detail.hidden=!on||!selectedId;
      destinationNote.hidden=!on||!byId.has(target);
      if(on){api.clearSearch();refresh();}else {api.refreshLegend();api.refresh();}
      try{localStorage.setItem('speranza.maps.hunt',on?'on':'off');}catch{}
    }
    function entryHTML(e){
      const names=e.route.containers?.split(' • ')||[];
      const steps=selected()?.kind==='target'?(e.route.steps||[]).slice(0,3):[];
      return '<article class="rh-item"><button type="button" data-hunt-blueprint="'+esc(e.item.id)+'"><img src="'+esc(e.item.image)+'" alt="" loading="lazy"><span>'+esc(e.item.name)+'<small>'+esc(e.route.condition)+'</small></span><span aria-hidden="true">↗</span></button><p><b>À fouiller :</b> '+esc(names.join(', ')||'Butin signalé dans ce secteur')+'</p>'+(e.place&&e.place!==selected()?.name?'<p class="rh-meta">Sous-zone indiquée : '+esc(e.place)+'</p>':'')+(steps.length?'<ol>'+steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol>':'')+'<a href="'+esc(e.route.source)+'" target="_blank" rel="noopener">Source du schéma ↗</a>'+(e.source&&e.source!==e.route.source?' · <a href="'+esc(e.source)+'" target="_blank" rel="noopener">Carte source ↗</a>':'')+'</article>';
    }
    function selected(){return result?.zones.find(z=>z.id===selectedId);}
    function renderDetail(){
      const z=selected();detail.hidden=!active||!z;if(!z)return;
      const map=api.chart().map,types=new Map();
      for(const p of z.members)types.set(p.kind,(types.get(p.kind)||0)+1);
      const locked=z.members.filter(p=>p.locked).length;
      detail.innerHTML='<header><span class="rh-number">'+String(z.number).padStart(2,'0')+'</span><div><span class="rm-kicker">'+esc(map.layers[z.layer].name)+' · '+grid(z)+'</span><h3>'+esc(z.name)+'</h3></div></header><p>'+ (z.kind==='target'?'Cherche les objectifs signalés dans ce secteur. Leur disponibilité dépend de la condition du raid.':'Fouille les bâtiments de ce secteur en ciblant les conteneurs indiqués ci-dessous.')+'</p><div class="rh-actions"><button type="button" data-hunt-route '+(api.hasRoute(z.anchor.id)?'disabled':'')+'>'+(api.hasRoute(z.anchor.id)?'Secteur déjà dans l’itinéraire':'＋ Ajouter le secteur à mon itinéraire')+'</button><button type="button" data-hunt-containers '+(!z.members.length?'disabled':'')+'>Voir '+(z.members.length===1?'le repère':('les '+z.members.length+' repères'))+' de fouille</button></div>'+(z.members.length?'<div class="rh-containers">'+[...types].map(([kind,n])=>'<span>'+window.MapPictos.html(kind)+esc(window.RAID_MAP_DATA.types[kind][1])+' <b>'+n+'</b></span>').join('')+'</div><p class="rh-meta">'+z.members.length+' repère'+(z.members.length>1?'s':'')+' à contrôler sur ce plan'+(locked?' · '+locked+' en zone verrouillée':'')+'. Vérifie les accès et les étages sur place.</p>':'<p class="rh-meta">Les meubles recherchés ne sont pas positionnés précisément dans ce relevé. Le halo situe uniquement le secteur.</p>')+'<div class="rh-item-grid">'+z.entries.map(entryHTML).join('')+'</div><div class="rh-poi-list" data-hunt-pois hidden></div>';
    }
    function render(){
      if(!result)return;
      const {map,layer}=api.chart(),zones=result.zones.filter(z=>z.layer===layer),others=result.zones.length-zones.length;
      const item=byId.get(target),zone=selected();
      destinationNote.hidden=!active||!item;
      if(!destinationNote.hidden){
        const entry=zone?.entries.find(e=>e.item.id===target)||result.broad[0]||result.unlocated[0];
        const place=zone?zone.name+' · '+map.layers[zone.layer].name+' · '+grid(zone):map.name;
        const guidance=entry?[entry.route.condition,entry.route.containers].filter(Boolean).join(' · '):'Choisis une zone ou consulte la fiche pour les autres moyens d’obtention.';
        destinationNote.innerHTML='<img alt="" src="'+esc(item.image)+'"><div><strong>'+esc(item.name)+'</strong><b>'+esc(place)+'</b><p>'+esc(guidance)+'</p></div>';
      }
      $('[data-hunt-count]').textContent=zones.length+' zone'+(zones.length>1?'s':'')+' sur ce plan'+(others?' · '+others+' sur un autre niveau':'');
      if(active)$('[data-pane-count]').textContent=zones.length;
      $('[data-hunt-floor-note]').textContent=selected()?'Sélection : '+selected().name:'Choisis un numéro pour préparer ta fouille';
      $('[data-hunt-advice]').hidden=!selected();
      const shown=expanded?zones:zones.slice(0,4);
      $('[data-hunt-zones]').innerHTML=shown.map(z=>'<button type="button" class="rh-zone" data-hunt-zone="'+esc(z.id)+'" aria-pressed="'+(selectedId===z.id)+'"><b class="rh-number">'+String(z.number).padStart(2,'0')+'</b><span><strong>'+esc(z.name)+'</strong><small class="rh-examples">'+esc(z.items.slice(0,2).map(i=>i.name).join(' · '))+(z.items.length>2?' +'+(z.items.length-2):'')+'</small><small>'+z.items.length+' schéma'+(z.items.length>1?'s':'')+' · '+(z.members.length?z.members.length+' repère'+(z.members.length>1?'s':'')+' de fouille':'secteur documenté')+'</small><em>'+esc(z.conditions.length===1?z.conditions[0]:'Conditions variables selon le schéma')+'</em></span><span aria-hidden="true">↗</span></button>').join('');
      $('[data-hunt-more]').hidden=zones.length<=4;$('[data-hunt-more]').textContent=expanded?'Réduire la liste':'Voir les '+(zones.length-4)+' autres zones';
      let extra='';
      if(!result.chosen.length)extra='<p>Ta collection est complète. Choisis « Tous les schémas » pour préparer une fouille pour ton duo.</p>';
      else if(!zones.length)extra='<p>Aucune zone précise documentée sur ce plan pour cette sélection.</p>';
      if(others)extra+='<div class="rh-floor-links">'+[...new Set(result.zones.filter(z=>z.layer!==layer).map(z=>z.layer))].map(l=>'<button type="button" data-hunt-floor="'+l+'">'+esc(map.layers[l].name)+' · '+result.zones.filter(z=>z.layer===l).length+' zones →</button>').join('')+'</div>';
      if(result.broad.length){
        const rows=[...new Map(result.broad.map(e=>[e.item.id+'|'+e.route.condition,e])).values()];
        extra+='<details class="rh-wide" '+(!result.zones.length?'open':'')+'><summary>'+new Set(rows.map(e=>e.item.id)).size+' schémas sans zone privilégiée</summary><p>La source décrit une carte entière ou une condition de raid. Aucun bâtiment ne peut être présenté comme meilleur.</p>'+rows.map(e=>'<div><button type="button" data-hunt-blueprint="'+esc(e.item.id)+'">'+esc(e.item.name)+' ↗</button><p>'+esc(e.route.condition)+' · '+esc(e.route.containers)+'</p></div>').join('')+'</details>';
      }
      if(result.unlocated.length)extra+='<details class="rh-wide"><summary>Lieux non positionnés sur ce plan</summary><p>Ces pistes existent dans les fiches, mais leurs coordonnées précises manquent.</p>'+[...new Map(result.unlocated.map(e=>[e.place,e])).values()].map(e=>'<a href="'+esc(e.source)+'" target="_blank" rel="noopener">'+esc(e.place)+' ↗</a>').join('')+'</details>';
      if(!result.zones.length&&target!=='missing'&&target!=='all'){
        const item=byId.get(target),dest=api.maps.filter(m=>(item.routes||[]).some(r=>r.type==='raid'&&scoped(r,m)&&permitted(r,condition))&&m.id!==map.id);
        extra+=dest.map(m=>'<button type="button" data-hunt-map="'+m.id+'">Chercher sur '+esc(m.name)+' →</button>').join('');
        if(result.alternatives.length)extra+='<p>Autres moyens d’obtenir ce schéma : '+esc([...new Set(result.alternatives.map(e=>e.route.title))].join(', '))+'.</p><button type="button" data-hunt-blueprint="'+esc(target)+'">Voir la fiche et les étapes ↗</button>';
      }
      $('[data-hunt-empty]').innerHTML=extra;
      renderDetail();
    }
    function refresh(force=false){
      shelf.refresh();
      const {map}=api.chart();const key=map.id+'|'+target+'|'+condition+'|'+window.AtlasProfiles?.owned().join(',');
      if(key!==revision||force){revision=key;result=build(map,target,condition);if(!result.zones.some(z=>z.id===selectedId))selectedId='';}
      render();api.refresh();
    }
    function select(id,center=true){
      const z=result?.zones.find(z=>z.id===id);if(!z)return;
      selectedId=id;api.focusZone(z,center);render();
      if(innerWidth<=980)$('[data-map-pane="map"]').click();
      api.refresh();
    }
    host.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.dataset.huntMode)setActive(b.dataset.huntMode==='on');
      if(b.dataset.huntZone)select(b.dataset.huntZone);
      if(b.hasAttribute('data-hunt-more')){expanded=!expanded;render();}
      if(b.dataset.huntFloor!==undefined)api.floor(+b.dataset.huntFloor);
      if(b.dataset.huntMap)api.openMap(b.dataset.huntMap);
      if(b.dataset.huntBlueprint)window.openAtlasBlueprint?.(b.dataset.huntBlueprint);
      if(b.hasAttribute('data-hunt-return'))$('[data-map-pane="map"]').click();
      if(b.hasAttribute('data-hunt-advice')){detail.tabIndex=-1;detail.focus({preventScroll:true});detail.scrollIntoView({block:'start',behavior:window.AtlasMotion?.reduced()?'instant':'smooth'});}
      if(b.hasAttribute('data-hunt-route')&&selected())api.addRoute(selected().anchor.id);
      if(b.hasAttribute('data-hunt-containers')&&selected()){
        const list=$('[data-hunt-pois]');list.hidden=!list.hidden;
        list.innerHTML=selected().members.map(p=>'<button type="button" data-poi="'+esc(p.id)+'">'+window.MapPictos.html(p.kind)+'<span>'+esc(p.name)+' · '+grid(p)+(p.height?' · '+esc(p.height):'')+'</span></button>').join('');
        b.textContent=list.hidden?'Voir '+(selected().members.length===1?'le repère':'les '+selected().members.length+' repères')+' de fouille':'Masquer les repères de fouille';
      }
    });
    controls.addEventListener('change',e=>{
      if(e.target.matches('[data-hunt-item]')){target=e.target.value;selectedId='';expanded=false;remember();refresh();}
      if(e.target.matches('[data-hunt-condition]')){condition=e.target.value;selectedId='';remember();refresh();}
    });
    window.addEventListener('atlas:profiles',()=>{itemOptions();refresh(true);});
    window.addEventListener('raidmaps:change',()=>renderDetail());
    itemOptions();$('[data-hunt-condition]').value=condition;
    return {
      active:()=>active,disable:()=>setActive(false),refresh,selected,
      includes(p){return !active||p.group==='exit'||(result?.zones.some(z=>z.layer===p.layer&&z.members.includes(p)))||p.id===selected()?.anchor.id;},
      select,
      open(id,map,reveal=false){
        if(!byId.has(id))return;target=id;condition='Toutes les conditions';selectedId='';itemOptions();$('[data-hunt-condition]').value=condition;
        const item=byId.get(id),current=api.chart().map;
        const destination=map||((item.routes||[]).some(r=>r.type==='raid'&&scoped(r,current))?current.id:api.maps.find(m=>(item.routes||[]).some(r=>r.type==='raid'&&scoped(r,m)))?.id);
        remember();if(destination)api.openMap(destination);setActive(true);
        if(reveal){
          if(result.zones.length)select(result.zones[0].id);
          else if(innerWidth<=980)$('[data-map-pane="map"]').click();
          requestAnimationFrame(()=>{
            destinationNote.focus({preventScroll:true});
            destinationNote.scrollIntoView({block:'start',behavior:'instant'});
          });
        }
      },
      restore(){try{if(localStorage.getItem('speranza.maps.hunt')==='on')setActive(true);}catch{}},
      paint(ctx,at,view,size,font,labels=false){
        if(!active||!result)return [];
        const hits=[],{map,layer}=api.chart(),aspect=map.layers[layer].height/map.layers[layer].width;
        for(const z of result.zones.filter(z=>z.layer===layer)){
          const p=at(z),r=z.radius,hot=z.id===selectedId,color=z.kind==='target'?'#88ede0':'#ffcc75';
          if(!labels){
            ctx.save();ctx.transform(view.a,view.b,view.c,view.d,view.x,view.y);ctx.translate(z.x,z.y);ctx.scale(1,1/aspect);
            const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,z.kind==='target'?'#38cbbb55':'#f5a62b60');g.addColorStop(1,'#00000000');
            ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
            ctx.strokeStyle=color;ctx.lineWidth=hot?.003:.0015;ctx.setLineDash([.005,.004]);ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();ctx.restore();
          }else if(p.x>0&&p.x<view.width&&p.y>0&&p.y<view.height){
            const half=size*.6;ctx.fillStyle=hot?color:'#15241ff5';ctx.strokeStyle=color;ctx.lineWidth=hot?3:2;
            ctx.beginPath();ctx.roundRect(p.x-half,p.y-half,half*2,half*2,8);ctx.fill();ctx.stroke();
            ctx.fillStyle=hot?'#13221c':color;ctx.font='700 '+font+'px system-ui';ctx.textAlign='center';ctx.fillText(String(z.number).padStart(2,'0'),p.x,p.y+font*.35);
            hits.push([z,p.x,p.y]);
          }
        }
        return hits;
      }
    };
  };
})();
