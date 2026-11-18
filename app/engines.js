/* Speranza Ops — passerelle vers les moteurs hérités (engine/), chargés à la demande. */
(() => {
  'use strict';
  const O=window.OPS,{$,actions,chain,mapById,esc}=O,E='engine/',V='vendor/';
  const once=fn=>{let p;return ()=>p??=fn();};
  const mapsReady=once(async()=>{await chain([E+'maps-data.js',V+'jsfeat-worker.js',E+'position-engine.js',E+'position.js',E+'map-icons.js',E+'map-legend.js',E+'missing-shelf.js',E+'blueprint-hunt.js',E+'raid-fullscreen.js',E+'maps.js']);});
  const armoryReady=once(()=>chain([E+'armory-guide.js',E+'armory.js']));
  const studiesReady=once(async()=>{await armoryReady();await chain([V+'three.min.js',E+'wasp-model.js',V+'fflate.min.js',E+'model-archive.js',E+'model-library.js',E+'study-pose.js',E+'arc-dynamics.js',E+'flight-render.js',E+'combat-data.js',E+'combat-engine.js',E+'arc-combat.js',E+'studies.js']);});

  // Cartes : trois onglets logés dans le bandeau du haut. Plan (carte seule), Mes schémas manquants
  // (cartes de schémas, puis chasse sur le plan), Spawn ARC (points, chronos, signalements).
  const tabs=document.createElement('div');tabs.className='top-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Cartes');
  tabs.innerHTML='<button role="tab" data-act="maps-tab" data-t="plan">Plan</button><button role="tab" data-act="maps-tab" data-t="shelf">Mes schémas manquants</button><button role="tab" data-act="maps-tab" data-t="spawn">Spawn ARC</button>';
  $('.top-search').after(tabs);
  let shelf=null;
  function drawShelf(){
    if(!shelf)return;
    const miss=O.BP.filter(b=>!O.owned(b.id)),raidMaps=b=>O.MAPS.filter(m=>O.onMap(b,m));
    const found=miss.filter(b=>raidMaps(b).length),other=miss.filter(b=>!raidMaps(b).length);
    const card=b=>{const ms=raidMaps(b);return '<article class="card bp '+O.rarityClass(b.rarity)+'"><button class="o-card-main" data-act="'+(ms.length?'ms-hunt':'bp')+'" data-id="'+b.id+'"'+(ms.length?' data-map="'+ms[0].id+'"':'')+'><span class="art"><img src="'+b.image+'" alt="" loading="lazy" decoding="async"></span><b>'+O.esc(b.name)+'</b><small>'+O.esc(b.category)+' · '+O.esc(b.rarity)+'</small></button>'+
      '<div class="ms-maps">'+(ms.length?ms.map(m=>'<button class="chip-btn" data-act="ms-hunt" data-id="'+b.id+'" data-map="'+m.id+'">'+O.esc(m.short)+'</button>').join(''):'<span class="fine">Hors raid : recherche, quête ou projet</span>')+'</div></article>';};
    shelf.innerHTML='<div class="ms-back"><button class="btn" data-act="maps-tab" data-t="shelf">'+O.ico('chevron','flip')+'Tous mes schémas manquants</button></div>'+
      '<div class="ms-cards"><header class="view-head"><h1>Mes schémas manquants</h1><p>'+(miss.length?miss.length+' à trouver. Choisis un schéma, ou directement une carte sous son nom, pour voir où le chercher.':'Ta collection est complète.')+'</p></header>'+
      (found.length?'<div class="grid">'+found.map(card).join('')+'</div>':'')+(other.length?'<h2 class="ms-h">Hors raid</h2><div class="grid">'+other.map(card).join('')+'</div>':'')+'</div><div class="ms-quick"></div>';
    if($('#maps-view')?.dataset.sub==='quick')drawQuick();
  }
  // Carte rapide d'un schéma manquant : le plan, les lieux cités par les sources, la condition et quoi fouiller.
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const ALIAS={'site d assemblage des fusees':'assemblage des fusees','tour de communication':'communications'};
  let quick=null;
  function drawQuick(){
    const host=shelf?.querySelector('.ms-quick'),b=quick&&O.BP.find(x=>x.id===quick.id);if(!host||!b)return;
    const maps=O.MAPS.filter(m=>O.onMap(b,m)),m=maps.find(x=>x.id===quick.map||x.name===quick.map)||maps[0];
    if(!m){host.innerHTML='<p class="notice">Ce schéma ne se trouve pas en raid.</p>';return;}
    quick.map=m.id;
    const md=window.RAID_MAP_DATA.maps.find(x=>x.id===m.id),places=md.points.filter(p=>['sector','label','areas'].includes(p[2])&&p[4]);
    const locs=b.locations.filter(l=>l.type==='raid'&&norm(l.map)===norm(md.name)),spots=[],loose=[];
    for(const l of locs)for(const n of l.place.split(', ')){
      const base=norm(n.replace(/\s*\(.*?\)/g,'')),k=ALIAS[base]||base,note=(n.match(/\((.*?)\)/)||[])[1]||'',hits=places.filter(p=>[p[4],p[5]].some(x=>norm(x)===k));
      if(!hits.length){if(!loose.includes(n))loose.push(n);continue;}
      for(const p of hits){let sp=spots.find(x=>x.p===p);if(!sp)spots.push(sp={p,name:p[4],x:p[0]/100,y:p[1]/100,layer:p[3],notes:[]});if(note&&!sp.notes.includes(note))sp.notes.push(note);}
    }
    const layers=[...new Set(spots.map(x=>x.layer))].sort();if(!layers.includes(quick.layer))quick.layer=layers.length?layers.reduce((a,c)=>spots.filter(x=>x.layer===c).length>spots.filter(x=>x.layer===a).length?c:a):0;
    const layer=md.layers[quick.layer]||md.layers[0],live=O.sched.active(m).map(e=>e.title);
    const cond=l=>{const [c,box]=l.detail.split(' · '),on=c.split(' / ').filter(x=>live.includes(x));
      return '<div class="msq-loc"><p>'+c.split(' / ').map(x=>'<em class="tag'+(on.includes(x)?' hot':'')+'">'+esc(x)+(on.includes(x)?' · en cours':'')+'</em>').join(' ')+'</p>'+(box?'<p class="fine">À fouiller : '+esc(box.split(' • ').join(', '))+'</p>':'')+'</div>';};
    const seen=new Set(),conds=locs.filter(l=>!seen.has(l.detail)&&seen.add(l.detail));
    host.innerHTML='<div class="sp-map"><div class="sp-img" style="aspect-ratio:'+layer.width+'/'+layer.height+'"><img src="'+layer.image+'" alt="Plan de '+esc(m.name)+'">'+
        spots.map((x,i)=>x.layer===quick.layer?'<button class="sp-pin ms-pin" data-act="msq-pick" data-i="'+i+'" style="left:'+x.x+'%;top:'+x.y+'%" title="'+esc(x.name)+'" aria-label="'+esc(x.name)+'">'+(i+1)+'</button>':'').join('')+'</div></div>'+
      '<div class="sp-side"><div class="row tight"><button class="btn" data-act="maps-tab" data-t="shelf">'+O.ico('chevron','flip')+'Mes schémas manquants</button></div>'+
        '<div class="msq-bp '+O.rarityClass(b.rarity)+'"><img src="'+b.image+'" alt=""><div><b>'+esc(b.name)+'</b><small>'+esc(b.category)+' · '+esc(b.rarity)+'</small></div><button class="btn primary" data-act="msq-found" data-id="'+b.id+'">Trouvé</button></div>'+
        (maps.length>1?'<div class="seg msq-maps" role="radiogroup" aria-label="Carte">'+maps.map(x=>'<button role="radio" aria-checked="'+(x===m)+'" data-act="ms-hunt" data-id="'+b.id+'" data-map="'+x.id+'">'+esc(x.short)+'</button>').join('')+'</div>':'<p class="fine">'+esc(m.name)+'</p>')+
        (layers.length>1?'<div class="seg" role="radiogroup" aria-label="Étage">'+layers.map(i=>'<button role="radio" aria-checked="'+(i===quick.layer)+'" data-act="msq-layer" data-v="'+i+'">'+esc(md.layers[i]?.name||'Étage '+i)+'</button>').join('')+'</div>':'')+
        conds.map(cond).join('')+
        '<ol class="msq-list">'+spots.map((x,i)=>'<li><button data-act="msq-pick" data-i="'+i+'"><i>'+(i+1)+'</i><span><b>'+esc(x.name)+'</b>'+((x.notes.length||x.layer!==quick.layer)?'<small>'+esc([...x.notes,x.layer!==quick.layer?md.layers[x.layer]?.name:''].filter(Boolean).join(' · '))+'</small>':'')+'</span></button></li>').join('')+
          loose.map(n=>'<li class="loose"><span><b>'+esc(n)+'</b><small>'+(/^Fouille|^Butin |^Intercepter/.test(n)?'Pas de lieu précis':'Lieu sans repère sur ce plan')+'</small></span></li>').join('')+'</ol>'+
        '<div class="row tight"><button class="link" data-act="msq-full" data-id="'+b.id+'" data-map="'+m.id+'">Carte complète avec tous les repères</button><button class="link" data-act="bp" data-id="'+b.id+'">Fiche du schéma</button></div></div>';
  }
  O.register('cartes',{title:'Cartes',icon:'map',hostId:'maps-view',pos:3,
    async mount(el){await mapsReady();el.innerHTML='';window.RaidMaps.mount(el);el.insertAdjacentHTML('afterbegin','<h1 class="sr-only">Cartes</h1>');
      shelf=document.createElement('section');shelf.className='ms-pane';shelf.setAttribute('aria-label','Mes schémas manquants');el.prepend(shelf);
      await O.spawns?.mount(el);actions['maps-tab']({t:'plan'});window.AtlasDuo?.refresh();},
    refresh(){if($('#maps-view')?.dataset.pane==='shelf')drawShelf();O.spawns?.repaint();}});
  O.register('armurerie',{title:'Armurerie',short:'Armes',icon:'weapon',hostId:'armory-view',pos:7,async mount(el){await armoryReady();el.innerHTML='';window.Armory.mount(el);el.insertAdjacentHTML('afterbegin','<h1 class="sr-only">Armurerie</h1>');}});
  O.register('terrain',{title:'Guide de terrain',short:'Terrain',icon:'compass',hostId:'field-view',pos:8,async mount(el){await chain([E+'field.js']);el.innerHTML='';window.FieldGuide.mount(el);el.insertAdjacentHTML('afterbegin','<h1 class="sr-only">Guide de terrain</h1>');}});

  // Ouvert en fichier local, le navigateur interdit de lire les pixels des images du dossier :
  // le suivi de position reçoit donc une copie intégrée des plans, chargée à la première utilisation.
  window.atlasCleanImage=async path=>{if(location.protocol!=='file:')return path;try{await O.load(E+'map-refs.js');}catch{}return window.ATLAS_MAP_REFS?.[path]||path;};
  // Liens transversaux attendus par les moteurs.
  window.openAtlasMap=async(map,query='')=>{await O.go('cartes');actions['maps-tab']({t:'plan'});window.RaidMaps.explore(map,query);};
  window.openAtlasBlueprintMap=async(id,map)=>{quick={id,map,layer:-1};await O.go('cartes');actions['maps-tab']({t:'shelf',sub:'quick'});};
  window.openAtlasARC=id=>actions.arc({id});
  window.openAtlasBlueprint=id=>actions.bp({id});
  window.openAtlasLoot=id=>actions.loot({id});
  window.openAtlasWeapon=async id=>{await O.go('armurerie');window.Armory.openGuide(id);};
  window.openAtlasWasp=()=>actions.study({id:'wasp'});
  window.Bestiary={open:()=>true};
  window.LootDesk={has:n=>!!n,open:id=>actions.loot({id}),refresh(){}};

  Object.assign(actions,{
    'maps-tab':d=>{
      const el=$('#maps-view');if(!el)return;el.dataset.pane=d.t;el.dataset.sub=d.sub||'cards';
      for(const b of $('.top-tabs').querySelectorAll('[role=tab]'))b.setAttribute('aria-selected',String(b.dataset.t===d.t));
      if(d.t==='plan')el.querySelector('[data-hunt-mode="off"][aria-pressed="false"]')?.click();
      if(d.t==='shelf')drawShelf();
      if(d.t==='spawn')O.spawns?.repaint();
      window.scrollTo({top:0,behavior:'instant'});
    },
    'ms-hunt':d=>window.openAtlasBlueprintMap(d.id,d.map),
    'msq-layer':d=>{quick.layer=Number(d.v);drawQuick();},
    'msq-pick':d=>{for(const el of shelf.querySelectorAll('.ms-quick [data-i]')){const on=el.dataset.i===d.i;(el.closest('li')||el).toggleAttribute('data-on',on);}
      const s=shelf.querySelector('.msq-list li[data-on]');s?.scrollIntoView({block:'nearest'});},
    'msq-found':(d,el)=>{actions.own({id:d.id},el);actions['maps-tab']({t:'shelf'});},
    'msq-full':d=>{actions['maps-tab']({t:'shelf',sub:'hunt'});window.RaidMaps.openBlueprint(d.id,d.map,true);},
    openmap:d=>window.openAtlasMap(d.map),
    locate:d=>{O.closeSheet();window.openAtlasBlueprintMap(d.id,d.map,true);},
    weapon:d=>{O.closeSheet();window.openAtlasWeapon(d.id);},
    async study(d,el){
      if(d.id==='arc-frigate'||d.id==='emperor'){O.closeSheet();return O.go('operations',{op:d.id==='arc-frigate'?'frigate':'emperor',mode:'exterior'});}
      O.toast('Ouverture de l’atelier 3D…');
      try{
        await studiesReady();O.closeSheet();
        window.AtlasStudies.inspect(d.id,null);
        if(!$('dialog.as-dialog[open],dialog[open] .as-workbench'))O.toast('Pas encore de maquette 3D pour cet ARC.');
      }catch(err){console.error(err);O.toast('Atelier 3D indisponible : '+(err.message||err));}
    }
  });
  const idle=window.requestIdleCallback||(f=>setTimeout(f,1200));
  window.addEventListener('load',()=>idle(()=>mapsReady().then(()=>{}).catch(()=>{})));
})();
