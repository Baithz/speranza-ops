/* Speranza Ops — Schémas, ARC, Butin et leurs fiches. */
(() => {
  'use strict';
  const O=window.OPS,{$,$$,esc,norm,ico,MAPS,mapById,mapByName,BP,bpById,ARCS,arcById,owned,actions}=O;
  const LOOT=window.LOOT_DATA,lootIds=Object.keys(LOOT).sort((a,b)=>LOOT[a].name.localeCompare(LOOT[b].name,'fr'));
  const lootByName=new Map(lootIds.map(id=>[norm(LOOT[id].name),id]));
  const sprRows=Math.ceil(lootIds.length/16);
  const spr=i=>i?.pos==null?'<span class="spr none" aria-hidden="true"></span>':'<span class="spr" aria-hidden="true" style="background-position:'+((i.pos%16)*100/15)+'% '+(Math.floor(i.pos/16)*100/(sprRows-1))+'%"></span>';
  const num=n=>n==null?'—':Number(n).toLocaleString('fr-FR',{maximumFractionDigits:2});
  const link=(url,label)=>{try{const u=new URL(url);return u.protocol==='https:'?'<a href="'+esc(u.href)+'" target="_blank" rel="noopener noreferrer">'+esc(label)+'</a>':esc(label);}catch{return esc(label);}};
  const matLine=(name,q)=>{const id=lootByName.get(norm(name));return '<li>'+(id?'<button class="mat" data-act="loot" data-id="'+id+'">'+spr(LOOT[id])+'<span>'+esc(name)+'</span><b>× '+q+'</b></button>':'<span class="mat"><span class="spr none"></span><span>'+esc(name)+'</span><b>× '+q+'</b></span>')+'</li>';};
  const keepFocus=(el,fn)=>{const a=document.activeElement,key=el.contains(a)&&a.dataset?.act?'[data-act="'+a.dataset.act+'"][data-id="'+a.dataset.id+'"]':null;fn();if(key)(el.querySelector(key)||el.querySelector('[data-act]'))?.focus({preventScroll:true});};

  /* ───────── Schémas ───────── */
  const kinds={raid:'En raid',recherche:'Recherche','projet':'Projet','quête':'Quête',pass:'Pass',dlc:'DLC','épreuves':'Épreuves'};
  const cats=[...new Set(BP.map(b=>b.category))].sort((a,b)=>a.localeCompare(b,'fr'));
  const isSpare=id=>O.P.spare().includes(id);
  const bpCard=b=>'<article class="card bp '+O.rarityClass(b.rarity)+(owned(b.id)?' is-owned':'')+'"><button class="o-card-main" data-act="bp" data-id="'+b.id+'"><span class="art"><img src="'+b.image+'" alt="" loading="lazy" decoding="async"></span><b>'+esc(b.name)+'</b><small>'+esc(b.category)+' · '+esc(b.rarity)+'</small></button>'+
    '<div class="card-foot"><label class="own"><input type="checkbox" data-act="own" data-id="'+b.id+'"'+(owned(b.id)?' checked':'')+'><span>Acquis</span></label>'+(owned(b.id)?'<button class="spare-btn" data-act="spare" data-id="'+b.id+'" aria-pressed="'+isSpare(b.id)+'" title="J’en ai un en double, à échanger">En trop</button>':'<button class="icon-btn star" data-act="pin" data-id="'+b.id+'" aria-pressed="'+O.pinned(b.id)+'" aria-label="Objectif : '+esc(b.name)+'" title="Marquer comme objectif">'+ico('star')+'</button>')+'</div></article>';
  const bpTile=b=>{const a=owned(b.id);
    return '<button class="bp-tile '+O.rarityClass(b.rarity)+(a?' is-owned':'')+'" data-act="bp" data-id="'+b.id+'" aria-label="'+esc(b.name)+' — '+(a?'acquis':'à trouver')+'" title="'+esc(b.name)+'">'+
      '<img src="'+b.image+'" alt="" loading="lazy" decoding="async">'+
      (isSpare(b.id)?'<span class="bp-mark" aria-hidden="true">'+ico('pack')+'</span>':O.pinned(b.id)?'<span class="bp-mark" aria-hidden="true">'+ico('star')+'</span>':'')+
      '<span class="bp-tile-name">'+esc(b.name)+'</span></button>';};
  // Le mur : tout le catalogue d'un coup d'œil, rangé par catégorie. Ce qu'on a est en couleur.
  const bpWall=list=>{
    const parCat=new Map();
    for(const b of list)(parCat.get(b.category)??parCat.set(b.category,[]).get(b.category)).push(b);
    return '<div class="bp-wall">'+[...parCat.entries()].sort((x,y)=>x[0].localeCompare(y[0],'fr')).map(([cat,items])=>{
      const a=items.filter(b=>owned(b.id)).length,pct=Math.round(a/items.length*100);
      return '<section class="bp-cat"><div class="bp-cat-head"><h2>'+esc(cat)+'</h2><b class="mono">'+a+' / '+items.length+'</b>'+
        '<span class="bp-bar" role="img" aria-label="'+pct+' % acquis"><i style="width:'+pct+'%"></i></span></div>'+
        '<div class="bp-tiles">'+items.map(bpTile).join('')+'</div></section>';}).join('')+'</div>';};
  O.register('collection',{title:'Schémas',icon:'layers',pos:4,f:{state:'all',mode:'mur',cat:'',map:'',q:''},
    mount(el){
      el.innerHTML='<header class="view-head with-action"><div><h1>Schémas</h1><p data-count></p></div><div class="row tight"><button class="btn primary" data-act="trade">Échanges</button><button class="btn" data-act="capture">Importer une capture</button></div></header>'+
        '<div class="tools"><div class="seg" role="radiogroup" aria-label="Affichage">'+[['mur','Mur'],['liste','Fiches']].map(([v,l])=>'<button role="radio" data-act="bp-mode" data-v="'+v+'">'+l+'</button>').join('')+'</div>'+
        '<div class="seg" role="radiogroup" aria-label="État">'+[['missing','À trouver'],['owned','Acquis'],['spare','En trop'],['all','Tous']].map(([v,l])=>'<button role="radio" data-act="bp-state" data-v="'+v+'">'+l+' <b></b></button>').join('')+'</div>'+
        '<label class="search">'+ico('search')+'<input type="search" data-search placeholder="Nom, lieu, conteneur…" aria-label="Rechercher un schéma"><kbd>/</kbd></label>'+
        '<select data-f="cat" aria-label="Catégorie"><option value="">Toutes les catégories</option>'+cats.map(c=>'<option>'+esc(c)+'</option>').join('')+'</select>'+
        '<select data-f="map" aria-label="Carte"><option value="">Toutes les cartes</option>'+MAPS.map(m=>'<option value="'+m.id+'">'+esc(m.name)+'</option>').join('')+'</select></div><div class="grid" data-grid></div>';
      $('[data-search]',el).addEventListener('input',e=>{this.f.q=e.target.value;this.refresh();});
      el.addEventListener('change',e=>{const k=e.target.dataset.f;if(k){this.f[k]=e.target.value;this.refresh();}});
    },
    show(p){if(p){Object.assign(this.f,p);$('[data-f=map]',this.el).value=this.f.map;$('[data-f=cat]',this.el).value=this.f.cat;}this.refresh();},
    refresh(){
      const f=this.f,el=this.el,q=norm(f.q).split(/\s+/).filter(Boolean),m=mapById(f.map);
      const base=BP.filter(b=>(!f.cat||b.category===f.cat)&&(!m||O.onMap(b,m))&&(!q.length||q.every(t=>(b._t??=norm([b.name,b.en,b.category,...(b.locations||[]).flatMap(l=>[l.map,l.place,l.detail])].join(' '))).includes(t))));
      const n={missing:base.filter(b=>!owned(b.id)).length,owned:base.filter(b=>owned(b.id)).length,spare:base.filter(b=>isSpare(b.id)).length,all:base.length};
      for(const b of $$('[data-act="bp-state"]',el)){b.setAttribute('aria-checked',String(b.dataset.v===f.state));$('b',b).textContent=n[b.dataset.v];}
      const list=base.filter(b=>f.state==='all'||(f.state==='spare'?isSpare(b.id):owned(b.id)===(f.state==='owned')));
      const tout=BP.filter(b=>owned(b.id)).length;
      $('[data-count]',el).textContent=tout+' acquis sur '+BP.length+' · il en reste '+(BP.length-tout);
      for(const b of $$('[data-act="bp-mode"]',el))b.setAttribute('aria-checked',String(b.dataset.v===f.mode));
      $('[data-grid]',el).className=f.mode==='mur'?'wall':'grid';
      keepFocus(el,()=>{$('[data-grid]',el).innerHTML=(list.length&&f.mode==='mur'?bpWall(list):list.map(bpCard).join(''))||(f.state==='spare'?'<div class="empty"><h2>Aucun schéma en trop</h2><p>Dans « Acquis », touche « En trop » sur ceux que tu as en double. Ton escouade verra ce que tu peux donner.</p><button class="btn" data-act="bp-state" data-v="owned">Voir mes schémas acquis</button></div>':'<div class="empty"><h2>'+(f.state==='missing'&&!f.q&&!f.cat&&!f.map?'Collection complète':'Aucun schéma ici')+'</h2><p>'+(f.state==='missing'?'Rien à trouver avec ces filtres.':'Change un filtre ou efface la recherche.')+'</p><button class="btn" data-act="bp-reset">Tout afficher</button></div>');});
    }});
  Object.assign(actions,{
    'bp-state':d=>{const v=O.views.collection;v.f.state=d.v;v.refresh();},
    'bp-mode':d=>{const v=O.views.collection;v.f.mode=d.v;v.refresh();},
    'bp-reset':()=>{const v=O.views.collection;v.f={state:'all',cat:'',map:'',q:''};$('[data-search]',v.el).value='';$$('select',v.el).forEach(s=>s.value='');v.refresh();},
    bp(d){
      const b=bpById.get(String(d.id).replace(/_blueprint$/,''));if(!b)return;
      const step=s=>{const k=s.indexOf(' — ');if(k<1)return esc(s);const m=mapByName(s.slice(0,k));return (m?'<button class="chip-btn" data-act="locate" data-id="'+b.id+'" data-map="'+m.id+'">'+ico('map')+esc(m.name)+'</button>':'<b>'+esc(s.slice(0,k))+'</b>')+' '+esc(s.slice(k+3));};
      const routes=(b.routes||[]).map(r=>'<article class="o-route"><h4>'+esc(r.title)+' <em class="tag">'+esc(kinds[r.type]||r.type)+'</em></h4>'+(r.condition?'<p><b>Condition :</b> '+esc(r.condition)+'</p>':'')+(r.containers?'<p><b>Conteneurs :</b> '+esc(r.containers)+'</p>':'')+(r.steps?.length?'<ul>'+r.steps.map(s=>'<li>'+step(s)+'</li>').join('')+'</ul>':'')+(r.source?'<p class="fine">'+link(r.source,'Source')+'</p>':'')+'</article>').join('');
      const note=O.P.snapshot().notes[b.id]||'';
      O.openSheet('<div class="sheet-hero '+O.rarityClass(b.rarity)+'"><img src="'+b.image+'" alt=""></div><p class="o-kicker">'+esc(b.category)+' · '+esc(b.rarity)+(b.bench?' · '+esc(b.bench)+(b.level?' niv. '+b.level:''):'')+'</p><h2>'+esc(b.name)+'</h2><p class="fine">'+esc(b.en)+'</p>'+
        '<div class="row"><label class="own big"><input type="checkbox" data-act="own-sheet" data-id="'+b.id+'"'+(owned(b.id)?' checked':'')+'><span>Je l’ai</span></label><button class="btn" data-act="pin-sheet" data-id="'+b.id+'" aria-pressed="'+O.pinned(b.id)+'">'+ico('star')+(O.pinned(b.id)?'Objectif':'Marquer comme objectif')+'</button>'+(owned(b.id)?'<button class="btn" data-act="spare-sheet" data-id="'+b.id+'" aria-pressed="'+isSpare(b.id)+'">'+(isSpare(b.id)?'En trop : oui':'J’en ai un en trop')+'</button>':'')+'</div>'+
        (b.description?'<p>'+esc(b.description)+'</p>':'')+
        '<div data-tabs><div class="tabs" role="tablist"><button role="tab" data-act="tab" data-t="find" aria-selected="true">Où le trouver</button><button role="tab" data-act="tab" data-t="make" aria-selected="false">Fabrication</button><button role="tab" data-act="tab" data-t="note" aria-selected="false">Ma note</button></div>'+
        '<div data-panel="find">'+(routes||'<p class="fine">Aucun lieu documenté pour ce schéma.</p>')+'</div>'+
        '<div data-panel="make" hidden>'+(b.craft?.length?'<h3>Fabrication</h3><ul class="mats">'+b.craft.map(c=>matLine(c.name,c.quantity)).join('')+'</ul>':'<p class="fine">Aucune recette répertoriée.</p>')+
        (b.research?'<h3>Recherche à l’Avant-poste</h3><p>Station de niveau '+b.research.level+' · '+num(b.research.points)+' points</p><ul class="mats">'+b.research.materials.map(c=>matLine(c.name,c.quantity)).join('')+'</ul>':'')+'</div>'+
        '<div data-panel="note" hidden><textarea class="note" data-note="'+b.id+'" maxlength="1500" placeholder="Un coin précis, une astuce, un rappel…" aria-label="Note personnelle">'+esc(note)+'</textarea></div></div>',{label:b.name});
      $('[data-note]').addEventListener('input',e=>{const s=O.P.snapshot();if(e.target.value)s.notes[b.id]=e.target.value;else delete s.notes[b.id];O.P.savePrivate({pins:s.pins,notes:s.notes});});
    },
    'own-sheet':(d,el)=>O.setOwned(d.id,el.checked),
    'pin-sheet':d=>{O.togglePin(d.id);actions.bp(d);},
    'spare-sheet':d=>{actions.spare(d);actions.bp(d);}
  });

  /* ───────── ARC ───────── */
  const families=[...new Set(ARCS.map(a=>a.family))];
  O.register('bestiaire',{title:'ARC',icon:'arc',pos:5,f:{fam:'',map:'',q:''},
    mount(el){
      el.innerHTML='<header class="view-head"><h1>ARC</h1><p>'+ARCS.length+' machines. Ouvre une fiche pour le point faible, l’ouverture et les armes conseillées.</p></header>'+
        '<div class="tools"><div class="seg" role="radiogroup" aria-label="Famille"><button role="radio" data-act="arc-fam" data-v="">Toutes</button>'+families.map(f=>'<button role="radio" data-act="arc-fam" data-v="'+esc(f)+'">'+esc(f)+'</button>').join('')+'</div>'+
        '<label class="search">'+ico('search')+'<input type="search" data-search placeholder="Guêpe, Queen, tourelle…" aria-label="Rechercher un ARC"><kbd>/</kbd></label>'+
        '<select data-f="map" aria-label="Carte"><option value="">Toutes les cartes</option>'+MAPS.map(m=>'<option value="'+m.id+'">'+esc(m.name)+'</option>').join('')+'</select></div><div class="grid arcs" data-grid></div>';
      $('[data-search]',el).addEventListener('input',e=>{this.f.q=e.target.value;this.refresh();});
      el.addEventListener('change',e=>{if(e.target.dataset.f){this.f.map=e.target.value;this.refresh();}});
    },
    show(){this.refresh();},
    refresh(){
      const f=this.f,q=norm(f.q),m=mapById(f.map);
      for(const b of $$('[data-act="arc-fam"]',this.el))b.setAttribute('aria-checked',String(b.dataset.v===f.fam));
      const list=ARCS.filter(a=>(!f.fam||a.family===f.fam)&&(!m||O.arcsOnMap(m).includes(a))&&(!q||norm([a.name,a.en,a.role,...(a.aliases||[])].join(' ')).includes(q)));
      $('[data-grid]',this.el).innerHTML=list.map(a=>'<button class="card arc" data-act="arc" data-id="'+a.id+'"><span class="art"><img src="'+a.image+'" alt="" loading="lazy" decoding="async"></span><b>'+esc(a.name)+'</b><small>'+esc(a.role)+'</small><span class="arc-stats"><span>'+esc(a.hp||'?')+' PV</span><span>'+esc(a.armor||'')+'</span></span></button>').join('')||'<div class="empty"><h2>Aucun ARC à ce nom</h2><p>Essaie le nom anglais ou retire un filtre.</p></div>';
    }});
  Object.assign(actions,{
    'go-op':d=>O.go('operations',{op:d.op}),
    'arc-fam':d=>{const v=O.views.bestiaire;v.f.fam=d.v;v.refresh();},
    arc(d){
      const a=arcById.get(d.id);if(!a)return;
      const W=window.ARMORY_DATA?.weapons||{};
      const block=(t,x)=>x?'<section class="fact"><h3>'+t+'</h3><p>'+esc(x)+'</p></section>':'';
      const guns=(a.engagement?.weapons||[]).filter(([id])=>W[id]).map(([id,t])=>'<button class="gun" data-act="weapon" data-id="'+id+'"><img src="'+W[id].img+'" alt="" loading="lazy"><span><b>'+esc(W[id].name)+'</b><small>'+esc(t)+'</small></span></button>').join('');
      const methods=(a.methods||[]).map(m=>'<article class="o-route"><h4>'+esc(m.title)+' <em class="tag">'+esc(m.effect)+'</em></h4><p>'+esc(m.action)+'</p>'+(m.limit?'<p class="fine"><b>Limite :</b> '+esc(m.limit)+'</p>':'')+'</article>').join('');
      const loot=(a.loot||[]).map(([id,n])=>LOOT[id]?'<button class="chip-btn" data-act="loot" data-id="'+id+'">'+spr(LOOT[id])+esc(n)+'</button>':'<span class="chip-btn">'+esc(n)+'</span>').join('');
      const maps=(a.maps||[]).map(mapByName).filter(Boolean).map(m=>'<button class="chip-btn" data-act="prep" data-map="'+m.id+'">'+ico('map')+esc(m.name)+'</button>').join('');
      O.openSheet('<div class="sheet-hero dark"><img src="'+a.image+'" alt="'+esc(a.name)+', capture du jeu"></div><p class="o-kicker">'+esc(a.family)+' · '+esc(a.role)+'</p><h2>'+esc(a.name)+'</h2><p class="fine">'+esc(a.en)+'</p>'+
        '<div class="stats"><div><b>'+esc(a.hp||'?')+'</b><span>points de vie</span></div><div><b>'+esc(a.armor||'—')+'</b><span>blindage</span></div><div><b>'+esc(a.xp??'—')+'</b><span>XP en jeu</span></div></div>'+
        '<div class="row"><button class="btn primary" data-act="study" data-id="'+a.id+'">'+ico('cube')+'Étude 3D</button>'+(a.id==='emperor'||a.id==='arc-frigate'?'<button class="btn" data-act="go-op" data-op="'+(a.id==='emperor'?'emperor':'frigate')+'">'+ico('ops')+'Dossier d’opération</button>':'')+'</div>'+
        '<div data-tabs><div class="tabs" role="tablist"><button role="tab" data-act="tab" data-t="fight" aria-selected="true">Combat</button><button role="tab" data-act="tab" data-t="gear" aria-selected="false">Armes et techniques</button><button role="tab" data-act="tab" data-t="loot" aria-selected="false">Butin et lieux</button></div>'+
        '<div data-panel="fight">'+block('Point faible',a.weak)+block('Quand tirer',a.opening)+block('Tactique',a.tactic)+block('Comportement',a.behavior)+block('Où il rôde',a.zone)+'</div>'+
        '<div data-panel="gear" hidden>'+(guns?'<h3>Armes conseillées'+(a.engagement?.target?' <small>cible : '+esc(a.engagement.target)+'</small>':'')+'</h3><div class="guns col">'+guns+'</div>':'')+(methods?'<h3>Techniques de terrain</h3>'+methods:'')+(!guns&&!methods?'<p class="fine">Rien de documenté pour cet ARC.</p>':'')+'</div>'+
        '<div data-panel="loot" hidden>'+(loot?'<h3>Ce qu’il lâche</h3><div class="chips">'+loot+'</div>':'')+(maps?'<h3>Préparer une sortie là où il se trouve</h3><div class="chips">'+maps+'</div>':'')+
        '<p class="fine">'+(a.sources||[]).map(([l,u])=>link(u,l)).join(' · ')+'</p></div></div>',{wide:true,label:a.name});
    }
  });

  /* ───────── Butin ───────── */
  const demand=new Map(),recipes=new Map();
  for(const b of BP)for(const [idx,req] of [[demand,b.research?.materials],[recipes,b.craft]])for(const mat of req||[]){const id=lootByName.get(norm(mat.name));if(!id)continue;if(!idx.has(id))idx.set(id,[]);idx.get(id).push({b,q:mat.quantity});}
  const needs=id=>(demand.get(id)||[]).filter(r=>!owned(r.b.id));
  const value=parts=>Object.entries(parts||{}).reduce((n,[k,q])=>n+(LOOT[k]?.price||0)*q,0);
  function verdict(id){
    const i=LOOT[id],n=needs(id);
    if(n.length)return ['keep','À garder','Demandé par '+(n.length>1?n.length+' recherches de schémas manquants':'la recherche de « '+n[0].b.name+' »')+'.'];
    if(i.uses?.length)return ['ask','Demandé à Speranza','Réclamé par '+i.uses.length+' quête'+(i.uses.length>1?'s, améliorations ou projets':', amélioration ou projet')+' : vérifie si c’est déjà fait.'];
    const rv=value(i.recycle);
    if(i.price!=null&&rv>i.price)return ['recycle','À recycler','Les pièces valent '+num(rv)+' crédits, contre '+num(i.price)+' à la vente.'];
    return ['sell','À vendre',i.price!=null?'Rien ne le réclame ; '+num(i.price)+' crédits pièce.':'Aucun usage répertorié.'];
  }
  const types=[...new Set(lootIds.map(id=>LOOT[id].type))].sort((a,b)=>a.localeCompare(b,'fr'));
  O.register('butin',{title:'Butin',icon:'pack',pos:6,f:{q:'',type:'',v:''},limit:60,
    mount(el){
      el.innerHTML='<header class="view-head"><h1>Butin</h1><p>Garder, recycler ou vendre : le verdict tient compte de tes schémas manquants.</p></header>'+
        '<div class="tools"><label class="search wide">'+ico('search')+'<input type="search" data-search placeholder="Pilote de Guêpe, ressort, alliage…" aria-label="Rechercher un objet"><kbd>/</kbd></label>'+
        '<select data-f="type" aria-label="Famille"><option value="">Toutes les familles</option>'+types.map(t=>'<option>'+esc(t)+'</option>').join('')+'</select>'+
        '<select data-f="v" aria-label="Verdict"><option value="">Tous les verdicts</option><option value="keep">À garder</option><option value="ask">Demandé à Speranza</option><option value="recycle">À recycler</option><option value="sell">À vendre</option></select></div><p class="count" data-count role="status"></p><div class="loot-list" data-grid></div>';
      $('[data-search]',el).addEventListener('input',e=>{this.f.q=e.target.value;this.limit=60;this.refresh();});
      el.addEventListener('change',e=>{const k=e.target.dataset.f;if(k){this.f[k]=e.target.value;this.limit=60;this.refresh();}});
    },
    show(){this.refresh();},
    refresh(){
      const f=this.f,q=norm(f.q).split(/\s+/).filter(Boolean);
      const list=lootIds.filter(id=>{const i=LOOT[id];return (!f.type||i.type===f.type)&&q.every(t=>(i._t??=norm(id+' '+i.name+' '+i.en+' '+i.locations.join(' '))).includes(t))&&(!f.v||verdict(id)[0]===f.v);});
      $('[data-count]',this.el).textContent=list.length+' objet'+(list.length>1?'s':'');
      $('[data-grid]',this.el).innerHTML=list.slice(0,this.limit).map(id=>{const i=LOOT[id],v=verdict(id);return '<button class="loot-row" data-act="loot" data-id="'+id+'">'+spr(i)+'<span><b>'+esc(i.name)+'</b><small>'+esc(i.type)+'</small></span><em class="tag v-'+v[0]+'">'+v[1]+'</em><span class="price">'+num(i.price)+' <small>cr.</small></span></button>';}).join('')+
        (list.length>this.limit?'<button class="btn more" data-act="loot-more">Afficher les '+(list.length-this.limit)+' suivants</button>':'')||'<div class="empty"><h2>Aucun objet à ce nom</h2><p>Essaie le nom anglais ou change de famille.</p></div>';
    }});
  Object.assign(actions,{
    'loot-more':()=>{const v=O.views.butin;v.limit+=120;v.refresh();},
    loot(d){
      const id=Object.hasOwn(LOOT,d.id)?d.id:lootByName.get(norm(d.id));const i=LOOT[id];if(!i){O.toast('Objet inconnu : '+d.id);return;}
      const v=verdict(id),parts=p=>Object.keys(p||{}).length?'<ul class="mats">'+Object.entries(p).map(([k,q])=>matLine(LOOT[k]?.name||k,q)).join('')+'</ul>':'<p class="fine">Rien de répertorié.</p>';
      const bps=l=>l.map(({b,q})=>'<li><button class="mat" data-act="bp" data-id="'+b.id+'"><img src="'+b.image+'" alt=""><span>'+esc(b.name)+(owned(b.id)?' <small>(acquis)</small>':'')+'</span><b>× '+q+'</b></button></li>').join('');
      O.openSheet('<div class="loot-head">'+spr(i)+'<div><p class="o-kicker">'+esc(i.type)+'</p><h2>'+esc(i.name)+'</h2><p class="fine">'+esc(i.en)+(i.locations.length?' · '+esc(i.locations.join(', ')):'')+'</p></div></div>'+
        '<p class="verdict v-'+v[0]+'"><b>'+v[1]+'</b> '+esc(v[2])+'</p>'+
        '<div class="stats"><div><b>'+num(i.price)+'</b><span>crédits à la vente</span></div><div><b>'+num(value(i.recycle))+'</b><span>valeur recyclée</span></div><div><b>'+num(i.mass)+'</b><span>kg</span></div><div><b>'+num(i.stack)+'</b><span>par pile</span></div></div>'+
        '<h3>Recyclage à Speranza</h3>'+parts(i.recycle)+'<h3>Démantèlement en surface</h3>'+parts(i.salvage)+
        (demand.get(id)?.length?'<h3>Recherches de schémas</h3><ul class="mats">'+bps(demand.get(id))+'</ul>':'')+
        (recipes.get(id)?.length?'<h3>Fabrications</h3><ul class="mats">'+bps(recipes.get(id))+'</ul>':'')+
        (i.uses?.length?'<h3>Demandé à Speranza</h3><ul class="uses">'+i.uses.map(([k,t,q,u])=>'<li><em class="tag">'+esc(k)+'</em> '+link(u,t)+' <b>× '+q+'</b></li>').join('')+'</ul>':''),{label:i.name});
    }
  });
})();
