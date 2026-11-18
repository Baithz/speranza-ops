/* Poste Opérations : un modèle, un lieu, une action. */
(() => {
  'use strict';
  const O=window.OPS,{$,$$,esc,ico,read,write,actions}=O,D=window.OPS_DOSSIERS,N=window.OPS_NAV;
  const key=()=>'speranza.ops.navigation.v2.'+(window.AtlasProfiles.active()||'solo');
  const defaults=()=>({op:'frigate',node:{frigate:'landing',emperor:'door'},here:{frigate:null,emperor:null},steps:{},mode:'exterior'});
  let st,host,viewer,epoch=0,dialog,shotURL,loadedOp=null,loadingOp=null,emperor,emperorLoading=false;
  function restore(){st=defaults();try{const v=JSON.parse(read(key())||'null');if(v){st={...st,...v,node:{...st.node,...v.node},here:{...st.here,...v.here}};for(const op of ['frigate','emperor']){if(!N[op][st.node[op]])st.node[op]=Object.keys(N[op])[0];if(!N[op][st.here[op]])st.here[op]=null;}if(!D[st.op])st.op='frigate';if(!['exterior','cut','plan','inside','reference'].includes(st.mode))st.mode='exterior';}else{const old=JSON.parse(read('speranza.ops.dossier.v1')||'null');if(old?.node)for(const op of ['frigate','emperor'])if(N[op][old.node[op]])st.node[op]=old.node[op];}}catch{st=defaults();}}
  restore();const save=()=>write(key(),JSON.stringify(st));
  const node=()=>D[st.op].nodes.find(n=>n.id===st.node[st.op]),meta=()=>N[st.op][st.node[st.op]];
  const count=n=>Math.min(Number(st.steps[st.op+'.'+n.id])||0,n.do.length);
  const button=(act,text,extra='',cls='')=>`<button type="button" class="${cls}" data-act="${act}" ${extra}>${text}</button>`;
  function mount(el){host=el;host.classList.add('ops-cockpit');host.innerHTML=`
    <header class="oc-header"><div><p class="oc-eyebrow">Speranza / Opérations</p><h1>Reconnaître. Avancer. Extraire.</h1></div><div class="oc-head-actions">${button('op-info','Préparation & sources','', 'btn small')}${button('op-reset','Nouvelle sortie','', 'btn small')}</div></header>
    <div class="oc-op-switch" aria-label="Choisir une opération">${['frigate','emperor'].map(op=>button('op-pick',D[op].name,`data-v="${op}" aria-pressed="false"`)).join('')}<span class="oc-operation-note"></span></div>
    <div class="oc-workspace"><aside class="oc-route"><div class="oc-route-title"><h2>Se repérer</h2><span class="oc-route-count"></span></div><p class="oc-route-help"></p><nav class="oc-zones" aria-label="Zones de l’opération"></nav><div class="oc-route-foot"><span class="oc-dot"></span><span>Position déclarée par toi</span></div></aside>
    <section class="oc-center" aria-label="Exploration du modèle"><div class="oc-toolbar"><div class="oc-modes" aria-label="Mode d’exploration">${[['exterior','Extérieur'],['cut','Coupe'],['plan','Plan'],['inside','Intérieur'],['reference','Référence']].map(([m,l])=>button('op-mode',l,`data-v="${m}" aria-pressed="false"`)).join('')}</div>${button('op-focus',ico('compass'), 'aria-label="Recentrer la vue" title="Recentrer la vue"','oc-recenter')}</div>
    <div class="oc-location"><span class="oc-location-label"></span><b class="oc-location-name"></b></div>
    <div class="oc-canvas"><div class="oc-viewer"></div><figure class="oc-reference" hidden><div class="oc-reference-angles" aria-label="Vues de la zone" hidden></div><img alt="Référence documentée de la zone sélectionnée"><figcaption></figcaption></figure><div class="oc-loading" role="status"></div><div class="oc-orientation"><span>↑ HAUT</span><b class="oc-orientation-text"></b></div><p class="oc-gesture">Glisser : tourner · Molette : zoom · Flèches : déplacer</p></div>
    <div class="oc-cutbar"><label for="ops-cut">Hauteur de coupe</label><input id="ops-cut" type="range" min="-42" max="42" step=".5"><output for="ops-cut"></output>${button('op-cut-zone','Coupe de la zone','','oc-text-button')}</div>
    <div class="oc-mechanisms"><div><b>Mécanismes</b><small>Démonstration · mouvements synchronisés</small></div>${button('op-play','▶','aria-label="Lancer la démonstration" aria-pressed="false"','oc-play')}<input aria-label="État des mécanismes" type="range" id="ops-phase" min="0" max="100" value="0"><output for="ops-phase">0 %</output></div><p class="oc-fidelity"></p></section>
    <aside class="oc-guidance" aria-label="Action de la zone sélectionnée"><div class="oc-guidance-content"></div></aside></div>`;
    host.addEventListener('input',e=>{if(e.target.id==='ops-cut'){viewer?.setCut(Number(e.target.value));$('output[for="ops-cut"]',host).textContent=Number(e.target.value).toFixed(1)+' m';}if(e.target.id==='ops-phase'){viewer?.animate(Number(e.target.value)/100);$('output[for="ops-phase"]',host).textContent=e.target.value+' %';}});
    dialog=document.createElement('dialog');dialog.className='oc-dialog';dialog.setAttribute('aria-label','Détails de l’opération');document.body.append(dialog);dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  }
  async function model(){const ticket=++epoch,op=st.op;viewer?.dispose();viewer=null;loadedOp=null;loadingOp=op;const status=$('.oc-loading',host);if(op==='emperor'){loadingOp=null;status.hidden=true;return;}status.hidden=false;status.innerHTML='<span class="oc-spinner"></span><b>Assemblage du modèle…</b><small>Géométrie, textures et mécanismes</small>';
    try{await O.load('engine/operations-viewer.js');await O.load('engine/operations-'+op+'-assets.js');if(ticket!==epoch)return;const v=new window.OperationViewer($('.oc-viewer',host));viewer=v;await v.load(op,window.OPS_3D_ASSETS[op]);if(ticket!==epoch){v.dispose();return;}loadedOp=op;loadingOp=null;status.hidden=true;v.onPhase=p=>{const val=Math.round(p*100);$('#ops-phase',host).value=val;$('output[for="ops-phase"]',host).textContent=val+' %';};setMode();if(host.hidden)v.suspend();}
    catch(err){if(ticket!==epoch)return;loadingOp=null;console.error(err);status.innerHTML='<b>Vue 3D indisponible</b><small>Le guide et les références restent accessibles.</small>'+button('op-retry','Réessayer','','btn')+button('op-mode','Voir la référence','data-v="reference"','btn');}}
  async function emperorModel(container){
    if(emperor){emperor.resume();return;}
    if(emperorLoading)return;emperorLoading=true;
    container.innerHTML='<div class="em4-start" role="status"><span class="oc-spinner"></span><p>Chargement de l’étude de l’Empereur…</p></div>';
    try{const version='?v='+window.OPS_RELEASE.version;await O.load('engine/emperor-operation.js'+version);await O.load('engine/emperor-operation-assets.js'+version);emperor=new window.EmperorOperation(container,window.OPS_EMPEROR_V04);container.emperorOperation=emperor;await emperor.ready;if(host.hidden||st.op!=='emperor')emperor.suspend();}
    catch(error){console.error(error);container.innerHTML='<div class="em4-start"><p>L’étude de l’Empereur n’a pas pu être chargée.</p>'+button('op-retry','Réessayer','','btn')+'</div>';}
    finally{emperorLoading=false;}
  }
  function refresh(){if(!host)return;
    let construction=$('.oc-construction',host);
    if(!construction){construction=document.createElement('section');construction.className='oc-construction oc-emperor';construction.setAttribute('aria-label','Empereur : modèle et références en construction');$('.oc-workspace',host).before(construction);}
    const building=st.op==='emperor';construction.hidden=!building;$('.oc-workspace',host).hidden=building;$('.oc-head-actions',host).hidden=building;
    for(const b of $$('[data-act="op-pick"]',host))b.setAttribute('aria-pressed',String(b.dataset.v===st.op));
    if(building){epoch++;viewer?.dispose();viewer=null;loadedOp=null;loadingOp=null;dialog?.close();$('.oc-operation-note',host).textContent='Étude v04 · en construction';emperorModel(construction);save();return;}
    emperor?.suspend();
    const d=D[st.op],n=node(),m=meta(),at=count(n),here=st.here[st.op];
    for(const b of $$('.oc-modes button',host)){b.disabled=st.op==='emperor'&&b.dataset.v!=='reference';b.title=b.disabled?'Coque et passages de Pendola en reconstruction':'';}
    for(const b of $$('[data-act="op-pick"]',host))b.setAttribute('aria-pressed',String(b.dataset.v===st.op));
    $('.oc-operation-note',host).textContent=st.op==='frigate'?'Abordage en équipe · cargaison ARC':'Col de Pendola · épave & épreuves';
    $('.oc-route-help',host).textContent=st.op==='frigate'?'Choisis le repère que tu vois en jeu.':'Reconnais ta salle : l’ordre des épreuves varie.';
    $('.oc-route-count',host).textContent=d.nodes.filter(x=>count(x)===x.do.length).length+' / '+d.nodes.length;
    $('.oc-zones',host).innerHTML=d.nodes.map((x,i)=>button('op-node',`<span class="oc-zone-index">${count(x)===x.do.length?'✓':String(i+1).padStart(2,'0')}</span><span><b>${esc(x.name)}</b><small>${here===x.id?'● Tu es ici':esc(N[st.op][x.id].level.split(' · ')[0])}</small></span>`, `data-id="${x.id}" aria-pressed="${x.id===n.id}" ${here===x.id?'data-here':''}`,'oc-zone')).join('');
    const active=here===n.id;$('.oc-location-label',host).textContent=active?'● Position déclarée':'Zone consultée';$('.oc-location-name',host).textContent=m.level;
    $('.oc-guidance-content',host).innerHTML=`<p class="oc-eyebrow">${active?'Tu es ici':'Repère visuel'}</p><h2>${esc(n.name)}</h2><p class="oc-landmark">${esc(m.landmark)}</p>${button('op-here',active?'✓ Position confirmée':'Je suis ici',`aria-pressed="${active}"`,'oc-here')}<div class="oc-objective"><div class="oc-objective-label"><span>${at<n.do.length?'À FAIRE MAINTENANT':'ZONE TERMINÉE'}</span><b>${Math.min(at+1,n.do.length)} / ${n.do.length}</b></div><h3>${esc(at<n.do.length?n.do[at]:'Repère le prochain passage et confirme ta nouvelle position.')}</h3>${at<n.do.length?button('op-complete','Fait · action suivante '+ico('chevron'),'','oc-next'):button('op-next-zone',st.op==='emperor'?'Choisir la salle suivante':'Zone suivante '+ico('chevron'),'','oc-next')}${at>0?button('op-undo','Revenir à l’action précédente','','oc-undo'):''}</div>${n.warn?.length?'<p class="oc-warning">'+ico('more')+esc(n.warn[0])+'</p>':''}${n.gear?.length?'<p class="oc-gear"><b>Équipement utile</b>'+n.gear.map(esc).join(' · ')+'</p>':''}<div class="oc-detail-buttons">${button('op-detail','Tout voir sur cette zone '+ico('chevron'),'','oc-text-button')}${button('op-mode','Comparer au jeu','data-v="reference"','oc-text-button')}</div>`;
    $('.oc-fidelity',host).textContent=st.op==='frigate'?'Géométrie source · build 2.00 · révision récente des portes à vérifier':'Références de Pendola · coque et passages 3D non validés';
    $('.oc-orientation-text',host).textContent=st.op==='frigate'?'AVANT : SOUTE · ARRIÈRE : AMARRAGE':'MODULE DE SALLE · ORDRE VARIABLE';
    showReference();
    if(loadedOp!==st.op&&loadingOp!==st.op)model();setMode();save();
  }
  function showReference(index=0){
    const entry=st.op==='emperor'?window.OPS_EMPEROR_EVIDENCE?.[node().id]:null;
    const frames=entry?.frames||[],f=frames[index]||frames[0],bar=$('.oc-reference-angles',host),img=$('.oc-reference img',host),caption=$('.oc-reference figcaption',host);
    bar.hidden=frames.length<2;bar.innerHTML=frames.map((x,i)=>button('op-reference',esc(x.label),`data-v="${i}" aria-pressed="${i===index}"`)).join('');
    img.src=f?'research/operations-3d/references/'+f.file:meta().reference;img.alt=f?.alt||'Référence : '+node().name;
    if(f)caption.innerHTML=esc('Capture de jeu · '+f.credit)+' · <a href="'+esc(f.source)+'" target="_blank" rel="noopener noreferrer">Source ↗</a>';
    else caption.textContent=st.op==='emperor'?'Capture documentée · Arc Raiders Hub / Gamer Guides / RaiderLogic':'Référence · '+(node().id==='landing'?'TopsideGamer, capture de jeu':'visualiseur ARC Tracker');
  }
  function setMode(){const mode=st.mode,m=meta();for(const b of $$('[data-act="op-mode"]',host))b.setAttribute('aria-pressed',String(b.dataset.v===mode));const ref=mode==='reference';$('.oc-reference',host).hidden=!ref;$('.oc-viewer',host).hidden=ref;$('.oc-gesture',host).hidden=ref;$('.oc-orientation',host).hidden=ref;$('.oc-cutbar',host).hidden=!['cut','plan'].includes(mode);$('.oc-mechanisms',host).hidden=ref;if(ref)$('.oc-loading',host).hidden=true;const cut=$('#ops-cut',host);cut.min=st.op==='frigate'?-42:0;cut.max=st.op==='frigate'?42:26;cut.value=m.cut;$('output[for="ops-cut"]',host).textContent=m.cut.toFixed(1)+' m';if(viewer&&loadedOp===st.op){if(ref)viewer.suspend();else{viewer.resume();viewer.setView(mode,m);}}}
  const db=new Promise(ok=>{try{const r=indexedDB.open('speranza-ops',1);r.onupgradeneeded=()=>r.result.createObjectStore('shots');r.onsuccess=()=>ok(r.result);r.onerror=()=>ok(null);}catch{ok(null);}});
  const tx=async(mode,fn)=>{const d=await db;if(!d)return null;return new Promise(ok=>{const t=d.transaction('shots',mode),q=fn(t.objectStore('shots'));t.oncomplete=()=>ok(q.result);t.onerror=()=>ok(null);});};
  async function showShot(){const box=$('.oc-shot',dialog);if(!box)return;const k=box.dataset.key,blob=await tx('readonly',s=>s.get(k));if(!box.isConnected)return;if(shotURL)URL.revokeObjectURL(shotURL);box.innerHTML=blob?`<img src="${shotURL=URL.createObjectURL(blob)}" alt="Ta capture de cette salle">${button('op-shot-del','Retirer ma capture','','btn small')}`:'<label class="btn small">Ajouter ma capture<input type="file" accept="image/*" data-ops-shot hidden></label>';}
  document.addEventListener('change',async e=>{if(!e.target.matches?.('[data-ops-shot]'))return;const f=e.target.files[0];if(!f?.type.startsWith('image/'))return;if(f.size>12e6){O.toast('12 Mo au maximum.');return;}const k=$('.oc-shot',dialog)?.dataset.key;await tx('readwrite',s=>s.put(f,k));showShot();});
  function details(kind){const d=D[st.op],n=node();let body;
    if(kind==='zone')body=`<p>${esc(n.what)}</p><ol>${n.do.map((x,i)=>'<li'+(i<count(n)?' class="oc-done"':'')+'>'+esc(x)+'</li>').join('')}</ol>${(n.warn||[]).map(x=>'<p class="oc-warning">'+esc(x)+'</p>').join('')}<div class="oc-shot" data-key="${st.op+'.'+n.id}"></div>`;
    else body=`<h3>À emporter</h3><dl>${d.kit.map(([a,b])=>'<dt>'+esc(a)+'</dt><dd>'+esc(b)+'</dd>').join('')}</dl><h3>À savoir</h3>${d.alerts.map(x=>'<p>'+esc(x)+'</p>').join('')}<h3>Butin</h3><p>${d.loot.map(esc).join(' · ')}</p><h3>Références et précision</h3><p>${st.op==='frigate'?'513 composants et textures issus de l’export public ARC Tracker, build 2.00.0. Les matériaux ont été adaptés au rendu web. Certaines dépendances et animations sont des démonstrations ; la révision 2.3 des portes reste à comparer.':'La maquette intacte reste non validée. La reconstruction doit maintenant confronter la forme du marcheur à la coque et aux passages réellement jouables de Pendola. Les captures montrent les accès, le puits central, le hangar et ses sorties.'}</p><ul>${st.op==='emperor'?'<li><a href="research/operations-3d/emperor-pendola.html" target="_blank" rel="noopener">Pendola : coque, accès et passages des Raiders</a></li><li><a href="research/operations-3d/emperor-intact.html" target="_blank" rel="noopener">Étude visuelle de l’Empereur intact</a></li><li><a href="research/operations-3d/emperor-study.html" target="_blank" rel="noopener">Maquette 3D des volumes · non validée</a></li>':''}${d.sources.map(([l,u])=>`<li><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(l)}</a></li>`).join('')}<li><a href="research/operations-3d/RECHERCHE_3D.md" target="_blank">Dossier de recherche local</a></li></ul><p>La position est déclarée manuellement ; aucune connexion au raid.</p>`;
    dialog.innerHTML=`<header><h2>${kind==='zone'?esc(n.name):'Préparer · '+esc(d.name)}</h2>${button('op-close','×','aria-label="Fermer les détails"','oc-close')}</header><div class="oc-dialog-body">${body}</div>`;dialog.showModal();showShot();}
  O.register('operations',{title:'Opérations',short:'Opés',icon:'ops',pos:6.5,mount,show(p){if(p?.op&&D[p.op])st.op=p.op;if(p?.mode)st.mode=p.mode;refresh();},refresh(){if(host&&!host.hidden&&loadedOp===st.op)return;refresh();},hide(){viewer?.suspend();emperor?.suspend();dialog?.close();},reset(){epoch++;viewer?.dispose();viewer=null;loadedOp=null;loadingOp=null;emperor?.suspend();emperor?.reset();restore();if(host&&!host.hidden)refresh();}});
  Object.assign(actions,{
    'op-pick':d=>{if(!D[d.v]||d.v===st.op)return;st.op=d.v;st.mode='exterior';refresh();},
    'op-node':d=>{if(!N[st.op][d.id])return;st.node[st.op]=d.id;if(st.mode==='exterior')st.mode='cut';refresh();},
    'op-mode':d=>{st.mode=st.op==='emperor'?'reference':d.v;setMode();save();},'op-here':()=>{st.here[st.op]=node().id;refresh();},
    'op-reference':d=>showReference(Number(d.v)),
    'op-complete':()=>{st.steps[st.op+'.'+node().id]=count(node())+1;refresh();},'op-undo':()=>{st.steps[st.op+'.'+node().id]=Math.max(0,count(node())-1);refresh();},
    'op-next-zone':()=>{if(st.op==='emperor'){$('.oc-zones button',host)?.focus();O.toast('Choisis la salle que tu reconnais dans la liste.');return;}const nodes=D.frigate.nodes,i=nodes.indexOf(node());st.node.frigate=nodes[i+1]?.id||'cargo';st.mode='cut';refresh();},
    'op-reset':()=>{for(const n of D[st.op].nodes)delete st.steps[st.op+'.'+n.id];st.here[st.op]=null;st.node[st.op]=D[st.op].nodes[0].id;st.mode='exterior';viewer?.animate(0);refresh();O.toast('Nouvelle sortie prête.');},
    'op-retry':()=>location.reload(),'op-focus':()=>viewer?.focus(),'op-cut-zone':()=>setMode(),
    'op-play':()=>{if(!viewer)return;viewer.playing=!viewer.playing;const b=$('[data-act="op-play"]',host);b.textContent=viewer.playing?'Ⅱ':'▶';b.setAttribute('aria-pressed',String(viewer.playing));b.setAttribute('aria-label',viewer.playing?'Mettre en pause':'Lancer la démonstration');},
    'op-info':()=>details('info'),'op-detail':()=>details('zone'),'op-close':()=>dialog.close(),
    'op-shot-del':async()=>{await tx('readwrite',s=>s.delete($('.oc-shot',dialog).dataset.key));showShot();}
  });
})();
