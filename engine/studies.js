(() => {
  'use strict';
  const specimens = {
    wasp: {number:'01', name:'Guêpe', sub:'Drone de patrouille', image:'assets/bestiary/wasp-study.webp',
      aspect:910/640, box:[.12,.13,.87,.91], model:()=>window.ATLAS_WASP_MESH},
    bastion: {number:'02', name:'Bastion', sub:'Marcheur blindé', image:'assets/bestiary/bastion-study.webp',
      aspect:1210/791, box:[.13,.16,.82,.91], model:()=>window.ATLAS_BASTION_MESH},
    rocketeer: {number:'03', name:'Rocketeer', sub:'Artificier · drone lourd', image:'assets/bestiary/rocketeer-study.webp',
      aspect:1235/825, box:[.09,.09,.94,.90], model:()=>window.ATLAS_ROCKETEER_MESH}
  };
  const featured = Object.keys(specimens);
  const entries = new Map(window.BESTIARY_DATA.map(e=>[e.id,e]));
  for(const e of entries.values()){
    if(specimens[e.id] || !window.AtlasModelLibrary.has(e.id))continue;
    specimens[e.id]={number:String(Object.keys(specimens).length+1).padStart(2,'0'),name:e.name,
      sub:e.role,image:e.image,aspect:1.65,box:[.12,.12,.88,.87],model:()=>window.AtlasModelLibrary.get(e.id)};
  }
  const escape = value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number = index=>String(index+1).padStart(2,'0');
  const reduced = ()=>window.AtlasMotion?.reduced() ?? matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (n,min,max)=>Math.min(max,Math.max(min,n));
  const clock = sec=>sec.toFixed(1).replace('.',',')+' s';
  const targetType=p=>p.kind || (/^(thruster|inlet|knee|canister|heart|brow)/.test(p.id) ? 'weak' : 'part');
  const cube='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5m-9 5v10M7 5l9 5"/></svg>';
  let dialog, session, returnFocus;
  function choices(current,placeholder=false){
    const families=new Map();
    for(const [id,s] of Object.entries(specimens)){
      const family=entries.get(id).family;
      if(!families.has(family))families.set(family,[]);
      families.get(family).push([id,s]);
    }
    return (placeholder?'<option value="">Choisir une machine…</option>':'')+[...families].map(([family,rows])=>
      `<optgroup label="${escape(family)}">${rows.sort((a,b)=>a[1].name.localeCompare(b[1].name,'fr')).map(([id,s])=>
        `<option value="${id}" ${s===current?'selected':''}>${escape(s.name)}</option>`).join('')}</optgroup>`).join('');
  }

  function catalogue() {
    return `<section class="as-index" aria-label="Maquettes 3D du bestiaire">
      <header><h3>Identifier en 3D</h3><label class="as-choose">Les ${Object.keys(specimens).length} dossiers<select data-study-launch aria-label="Choisir une machine en 3D">${choices(null,true)}</select></label></header>
      <div class="as-posters">${featured.map(id=>[id,specimens[id]]).map(([id,s])=>`<button type="button" class="as-poster" data-study-open="${id}" aria-label="Ouvrir l’étude 3D de ${s.name}">
        <img src="${s.image}" alt=""><span class="as-badge">${cube} 3D</span>
        <span class="as-poster-text"><small>SUJET ${s.number}</small><b>${s.name}</b></span><span class="as-arrow" aria-hidden="true">↗</span></button>`).join('')}</div></section>`;
  }
  function dossier(id) {
    return Object.hasOwn(specimens,id) ? `<button type="button" class="as-dossier" data-study-open="${id}">${cube} Examiner en 3D <span>Comparer au jeu ↗</span></button>` : '';
  }
  function ensureDialog() {
    if(dialog)return;
    dialog=document.createElement('dialog');dialog.className='as-dialog';dialog.setAttribute('aria-labelledby','as-title');
    document.body.append(dialog);
    dialog.addEventListener('close',()=>{
      session?.dispose();session=null;
      dialog.replaceChildren();
      if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
      else document.querySelector('.as-index button')?.focus({preventScroll:true});
    });
    dialog.addEventListener('click',e=>{
      if(e.target.closest('[data-as-close]')){dialog.close();return;}
      if(e.target!==dialog)return;
      const b=dialog.getBoundingClientRect();
      if(e.clientX<b.left||e.clientY<b.top||e.clientX>b.right||e.clientY>b.bottom)dialog.close();
    });
    window.addEventListener('hashchange',()=>{if(dialog.open&&location.hash!=='#bestiaire')dialog.close();});
  }

  function template(spec, study, entry) {
    const combatant=!['Opérations','Épaves'].includes(entry.family);
    const hasWeak=study.points.some(p=>targetType(p)==='weak');
    const hasParts=study.points.some(p=>targetType(p)==='part');
    const phenomenon=entry.id==='arc-orbiter';
    const pins = study.points.map((p,i)=>`<button type="button" class="as-pin" data-as-pin="${escape(p.id)}" aria-label="${number(i)} · ${escape(p.label)}" title="${escape(p.label)}">${number(i)}</button>`).join('');
    const list = study.points.map((p,i)=>`<button type="button" data-as-target="${escape(p.id)}" data-type="${targetType(p)}" aria-pressed="false"><em>${number(i)}</em>${escape(p.label)}</button>`).join('');
    return `<div class="as-workbench">
      <header class="as-top"><div><div class="as-kicker"><i></i> RECONNAISSANCE / SUJET ${spec.number}</div>
        <h2 id="as-title">${spec.name}</h2><p>${spec.sub}</p></div>
        <div class="as-tools"><label>Spécimen<select aria-label="Changer de spécimen" data-as-specimen>${choices(spec)}</select></label>
        <button type="button" class="as-close" data-as-close aria-label="Fermer l’étude">✕</button></div></header>
      <div class="as-bar"><div class="as-switch" role="group" aria-label="Présentation">
        <button type="button" data-as-mode="model" aria-pressed="true">${cube} Maquette 3D</button>
        <button type="button" data-as-mode="exploded" aria-pressed="false">Vue éclatée</button>
        <button type="button" data-as-mode="compare" aria-pressed="false">◫ Comparer au jeu</button>
        ${combatant?'<button type="button" data-as-mode="combat" aria-pressed="false">Tirs & dégâts</button>':''}</div>
        <button type="button" data-as-align title="Retrouver la caméra et la pose de la photographie">↺ Vue de référence</button></div>
      <div class="as-pair"><figure class="as-photo" hidden><div class="as-image"><img src="${spec.image}" alt="Capture du jeu montrant ${spec.name}"></div>
        <figcaption><span>01 / JEU</span><a href="${escape(entry.original)}" target="_blank" rel="noopener">Capture originale ↗</a></figcaption></figure>
        <figure class="as-model"><div class="as-stage" data-as-stage tabindex="0" role="group" aria-label="Maquette de ${spec.name}. Glisser ou utiliser les flèches pour tourner. Touches plus et moins pour zoomer.">
          <div class="as-cross" aria-hidden="true"></div><canvas data-stage-ground aria-hidden="true"></canvas><canvas data-stage-model aria-hidden="true"></canvas><canvas data-stage-fx aria-hidden="true"></canvas>
          <div data-as-pins>${pins}</div><span class="as-angle" aria-hidden="true"></span></div>
          <figcaption><span>02 / BLENDER</span><span class="as-drag">Glisser pour tourner</span><span class="as-zoom"><button type="button" data-as-out aria-label="Éloigner la maquette">−</button><button type="button" data-as-in aria-label="Rapprocher la maquette">+</button></span></figcaption></figure></div>
      <div class="as-burst" hidden><label for="as-separate">${phenomenon?'Séparer les étapes observées':'Écartement des pièces'}</label><input type="range" id="as-separate" min="0" max="100" value="100"><output for="as-separate">100 %</output></div>
      <div class="as-timeline"><button type="button" data-as-play></button><div class="as-track"><label for="as-time">Séquence <b data-as-phase></b></label>
        <input type="range" id="as-time" data-as-time value="0" min="0" max="${study.duration}" step="0.01" aria-label="Position dans l’animation"></div><output data-as-clock>0,0 s</output></div>
      <div class="as-phases" role="group" aria-label="Aller à une phase de mouvement">${(study.phases||[]).map((phase,i)=>`<button type="button" data-as-phase-index="${i}"><i></i>${escape(phase.label)}</button>`).join('')}</div>
      ${combatant?`<div class="as-actions"><button type="button" data-as-attack>Voir l’attaque</button><button type="button" data-as-break>Rupture de la pièce</button><button type="button" data-as-destroy>Destruction</button><button type="button" data-as-restore>Restaurer</button><span class="as-action-note" role="status">Séquences de présentation · Choisis une pièce pour isoler sa rupture.</span></div><div data-as-lab hidden></div>`:''}
      <section class="as-targets"><div class="as-target-head"><h3>${hasWeak?'Points faibles':phenomenon?'Indices observables':'Points d’intérêt'}</h3><button type="button" data-as-marks aria-pressed="true">Masquer les repères</button></div>
        <div class="as-anatomy-filter" role="group" aria-label="Type de repères" ${hasWeak&&hasParts?'':'hidden'}><button type="button" data-as-type="weak" aria-pressed="true">Cibles vulnérables</button><button type="button" data-as-type="part" aria-pressed="false">Autres organes</button></div>
        <div class="as-choice" role="group" aria-label="Choisir une pièce de la machine">${list}</div>
        <div class="as-intel" role="status"><i aria-hidden="true">⌖</i><div><strong data-as-label>Choisis une pièce</strong><p data-as-tip>Chaque numéro suit sa pièce en mouvement. Sélectionne un repère pour examiner son angle de tir.</p></div></div></section>
      <footer class="as-foot"><span>${escape(study.scope || 'Reconstitution de l’Atlas d’après les vues du jeu. L’éclaté illustre la position des pièces.')}</span>
        <a href="${escape(entry.sources[0][1])}" target="_blank" rel="noopener">Fiche de référence ↗</a></footer>
    </div>`;
  }

  function inspect(id, opener) {
    const spec=specimens[id], model=spec?.model();
    if(!model?.study)return;
    ensureDialog();
    const entry=window.BESTIARY_DATA.find(e=>e.id===id);
    if(opener)returnFocus=opener;
    session?.dispose();session=null;
    if(!document.querySelector(`[data-bc-id="${id}"][aria-pressed="true"]`))window.Bestiary.open(id);
    dialog.innerHTML=template(spec,model.study,entry);
    if(!dialog.open)dialog.showModal();
    dialog.scrollTop=0;
    try{session=mountStudy(spec,model);}
    catch(error){
      console.error('Atelier 3D :',error);
      dialog.innerHTML=`<div class="as-workbench"><header class="as-top"><h2 id="as-title">${spec.name}</h2><button data-as-close aria-label="Fermer l’étude">Fermer ×</button></header>
        <div class="as-image"><img src="${spec.image}" alt="Capture du jeu"></div>
        <section class="as-targets"><h3>Lecture de la capture</h3><p>Le rendu 3D est indisponible dans cette fenêtre.</p><p>${escape(entry.weak)}</p><a href="${escape(entry.original)}" target="_blank" rel="noopener">Capture originale ↗</a></section></div>`;
    }
    (dialog.querySelector(!opener?'[data-as-specimen]':'[data-as-close]') || dialog.querySelector('[data-as-close]')).focus({preventScroll:true});
  }

  function mountStudy(spec,model) {
    const scope=new AbortController(), options={signal:scope.signal};
    const $=sel=>dialog.querySelector(sel), $$=sel=>[...dialog.querySelectorAll(sel)];
    const study=model.study, camera=study.camera, stage=$('[data-as-stage]');
    const isStatic=study.frames.length<=2 && entries.get($('[data-as-specimen]').value)?.family==='Épaves';
    const anchors=new Map($$('[data-as-pin]').map(node=>[node.dataset.asPin,node]));
    const points=new Map(study.points.map(p=>[p.id,p]));
    const state={time:0,yaw:camera.yaw,pitch:camera.pitch,roll:camera.roll||0,zoom:1,hits:new Set(),reference:null,explode:0};
    const engine=createFlightRenderer(stage,anchors,model);
    state.battle={clock:0,impacts:[],scars:[],broken:{},deathAt:null};
    const battle=state.battle;
    let laboratory=null;
    let play=!isStatic&&!reduced(), marks=true, mode='model', group='weak', selected=null, raf=0, previous=null, tween=null, inView=true;
    let visiblePhase=-1;
    const pointers=new Map();
    let tapStart=null;
    const reference={box:study.referenceBox||study.photoBox||spec.box,aspect:spec.aspect};
    const photo=$('.as-photo img');
    function photoSize(){if(photo.naturalWidth)reference.aspect=photo.naturalWidth/photo.naturalHeight;}
    photoSize();photo.addEventListener('load',photoSize,options);
    let separation=1;
    const phaseButtons=$$('[data-as-phase-index]'), timeline=$('[data-as-time]');

    function draw() {
      engine.draw(state);
      const angle=Math.round((state.yaw*180/Math.PI%360+360)%360);
      $('.as-angle').textContent=String(angle).padStart(3,'0')+'°';
      timeline.value=state.time;
      $('[data-as-clock]').textContent=clock(state.time);
      let active=-1;
      (study.phases||[]).forEach((phase,i)=>{if(state.time>=phase.time)active=i;});
      if(active!==visiblePhase){
        visiblePhase=active;
        $('[data-as-phase]').textContent=study.phases?.[active]?.label || '';
        phaseButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===active)));
      }
    }
    function wake() {
      if(!raf && inView && !document.hidden && dialog.open)raf=requestAnimationFrame(tick);
    }
    function tick(now) {
      raf=0;
      if(!inView||document.hidden){previous=null;return;}
      const elapsed=previous===null ? 0 : (now-previous)/1000;
      if(previous!==null && elapsed < (engine.kind==='canvas' ? 1/24 : 1/50)){wake();return;}
      previous=now;
      battle.clock+=Math.min(.15,elapsed);
      battle.impacts=battle.impacts.filter(hit=>battle.clock-hit.at<1.5);
      if(play)state.time=(state.time+Math.min(.15,elapsed))%study.duration;
      const target=mode==='exploded'?separation:0;
      const opening=Math.abs(target-state.explode)>.002;
      state.explode=opening&&!reduced()?state.explode+(target-state.explode)*Math.min(1,.12+elapsed*8):target;
      if(tween){
        const t=clamp((now-tween.start)/370,0,1), ease=1-(1-t)**3;
        state.yaw=tween.fromYaw+tween.dy*ease;
        state.pitch=tween.fromPitch+tween.dp*ease;
        state.roll=tween.fromRoll*(1-ease);
        if(t===1)tween=null;
      }
      draw();
      const falling=Object.values(battle.broken).some(at=>battle.clock-at<4);
      const dying=battle.deathAt!==null && battle.clock-battle.deathAt<4;
      if(play||tween||opening||falling||dying||battle.impacts.length)wake();else previous=null;
    }
    function setPlay(on){
      play=on;previous=null;
      const button=$('[data-as-play]');
      button.setAttribute('aria-pressed',String(on));
      button.textContent=on?'Ⅱ Pause':'▷ Animer';
      if(on)wake();
    }
    function showMarks(on){
      marks=on;state.marks=on;
      $('[data-as-pins]').hidden=!on;
      const b=$('[data-as-marks]');b.setAttribute('aria-pressed',String(on));b.textContent=on?'Masquer les repères':'Afficher les repères';
      draw();
    }
    function filterAnatomy(kind){
      group=kind;
      for(const b of $$('[data-as-type]'))b.setAttribute('aria-pressed',String(b.dataset.asType===kind));
      for(const b of $$('[data-as-target]'))b.hidden=b.dataset.type!==kind;
      for(const [id,b] of anchors)b.hidden=targetType(points.get(id))!==kind;
      clearSelection();draw();
    }
    function clearSelection(){
      selected=null;state.activePin=null;
      for(const b of $$('[data-as-target],[data-as-pin]'))b.setAttribute('aria-pressed','false');
      $('[data-as-label]').textContent='Choisis une pièce';
      $('[data-as-tip]').textContent=group==='weak'?'Sélectionne un numéro pour voir où viser et à quel moment.':'Sélectionne un numéro pour examiner cette partie et lire la consigne de terrain.';
    }
    function selectPoint(id){
      const p=points.get(id);if(!p)return;
      selected=id;state.activePin=id;showMarks(true);setPlay(false);
      if(Number.isFinite(p.time))state.time=clamp(p.time,0,study.duration);
      const view=p.view||camera;
      const dy=Math.atan2(Math.sin(view.yaw-state.yaw),Math.cos(view.yaw-state.yaw));
      tween={start:performance.now(),fromYaw:state.yaw,fromPitch:state.pitch,fromRoll:state.roll,dy,dp:view.pitch-state.pitch};
      if(reduced()){state.yaw+=dy;state.pitch=view.pitch;state.roll=0;tween=null;}
      state.zoom=mode==='exploded'?.78:mode==='model'?1.07:1;
      for(const b of $$('[data-as-target],[data-as-pin]'))b.setAttribute('aria-pressed',String((b.dataset.asTarget||b.dataset.asPin)===selected));
      $('[data-as-label]').textContent=p.label;$('[data-as-tip]').textContent=p.text;
      draw();wake();
    }
    function resetPose(){
      tween=null;state.yaw=camera.yaw;state.pitch=camera.pitch;state.roll=camera.roll||0;state.zoom=mode==='exploded'?.76:1;state.time=0;
      setPlay(false);clearSelection();draw();
    }
    function changeMode(value){
      restoreBattle();
      mode=value;dialog.dataset.presentation=mode;state.reference=mode==='compare'?reference:null;
      $('.as-photo').hidden=mode!=='compare';
      $('.as-burst').hidden=mode!=='exploded';
      $('.as-timeline').hidden=isStatic||mode==='exploded'||mode==='combat';$('.as-phases').hidden=isStatic||mode==='exploded'||mode==='combat';
      $('.as-targets').hidden=mode==='combat';
      if(mode==='combat' && !laboratory) {
        laboratory=window.AtlasArcLab.mount($('[data-as-lab]'),$('[data-as-specimen]').value,model,{
          reset:restoreBattle,select:selectPoint,hit:receiveHit,breakPart,destroy:destroyMachine,
          destroyed:()=>battle.deathAt!==null
        });
      }
      laboratory?.setActive(mode==='combat');
      laboratory?.reset();
      if(mode!=='exploded')state.explode=0;
      for(const b of $$('[data-as-mode]'))b.setAttribute('aria-pressed',String(b.dataset.asMode===mode));
      showMarks(mode!=='compare');engine.size();resetPose();wake();
    }
    function zoom(factor){state.zoom=clamp(state.zoom*factor,.65,1.85);draw();}
    function restoreBattle(){
      battle.impacts=[];battle.scars=[];battle.broken={};battle.deathAt=null;state.attacks=true;
      if($('.as-action-note'))$('.as-action-note').textContent='Séquences de présentation · Choisis une pièce pour isoler sa rupture.';
      draw();
    }
    function receiveHit(point,weapon){
      setPlay(false);
      const explosive=['hullcracker','rascal'].includes(weapon);
      if(!reduced())battle.impacts.push({at:battle.clock,group:point.group,position:point.position,explosive});
      battle.scars.push({group:point.group,position:point.position});
      if(battle.scars.length>32)battle.scars.shift();
      draw();wake();
    }
    function breakPart(point){
      setPlay(false);
      const name=point.group;
      if(!name)return;
      battle.broken[name]=battle.clock;
      const hierarchy=study.parents||{};
      for(const child of Object.keys(hierarchy)){
        let ancestor=child;
        const visited=new Set();
        while(hierarchy[ancestor]&&!visited.has(ancestor)){
          visited.add(ancestor);ancestor=hierarchy[ancestor];
          if(ancestor===name){battle.broken[child]=battle.clock;break;}
        }
      }
      // Les quatre ensembles de rotors utilisent des groupes rigides séparés portant le même suffixe.
      const arm=/^(?:arm|nacelle|rotor)([FR][LR])$/.exec(name);
      if(arm)for(const part of model.parts)if(part.group.endsWith(arm[1]))battle.broken[part.group]=battle.clock;
      receiveHit(point,'hullcracker');
      if(reduced())battle.clock+=3;
      $('.as-action-note').textContent='Rupture de présentation · '+point.label;
      draw();wake();
    }
    function destroyMachine(){
      setPlay(false);battle.deathAt=battle.clock;
      for(const [i,name] of [...new Set(model.parts.map(p=>p.group))].entries()){
        if(!/body|hull|core|base/.test(name)&&i%2===0)battle.broken[name]=battle.clock;
      }
      if(reduced())battle.clock+=3.5;
      $('.as-action-note').textContent='Destruction de présentation · Restaurer pour reprendre l’inspection.';
      draw();wake();
    }
    dialog.addEventListener('click',event=>{
      const b=event.target.closest('button');if(!b)return;
      if(b.dataset.asMode){if(mode!==b.dataset.asMode)changeMode(b.dataset.asMode);return;}
      if(b.dataset.asType){if(group!==b.dataset.asType)filterAnatomy(b.dataset.asType);return;}
      if(b.hasAttribute('data-as-play')){setPlay(!play);return;}
      if(b.hasAttribute('data-as-restore')){if(mode==='combat')laboratory?.reset();else restoreBattle();return;}
      if(b.hasAttribute('data-as-destroy')){if(mode==='exploded')changeMode('model');destroyMachine();return;}
      if(b.hasAttribute('data-as-break')){
        if(mode==='exploded')changeMode('model');
        breakPart(points.get(selected)||study.points.find(p=>targetType(p)==='weak')||study.points[0]);return;
      }
      if(b.hasAttribute('data-as-attack')){
        if(mode!=='model')changeMode('model');restoreBattle();
        state.time=study.combat?.window?.[0]??study.effects?.[0]?.start??study.phases?.[1]?.time??0;
        if(reduced())state.time+=.2;else setPlay(true);
        draw();return;
      }
      if(b.hasAttribute('data-as-align')){resetPose();return;}
      if(b.hasAttribute('data-as-marks')){showMarks(!marks);return;}
      if(b.hasAttribute('data-as-in')){zoom(1.17);return;}
      if(b.hasAttribute('data-as-out')){zoom(1/1.17);return;}
      if(b.dataset.asPin||b.dataset.asTarget){selectPoint(b.dataset.asPin||b.dataset.asTarget);return;}
      if(b.hasAttribute('data-as-phase-index')){
        tween=null;setPlay(false);clearSelection();state.time=study.phases[Number(b.dataset.asPhaseIndex)].time;draw();
      }
    },options);
    $('[data-as-specimen]').addEventListener('change',e=>inspect(e.target.value),options);
    $('#as-separate').addEventListener('input',e=>{
      separation=Number(e.target.value)/100;state.explode=separation;
      $('.as-burst output').textContent=e.target.value+' %';draw();
    },options);
    timeline.addEventListener('input',()=>{tween=null;setPlay(false);clearSelection();state.time=Number(timeline.value);draw();},options);
    stage.addEventListener('keydown',e=>{
      if(e.target!==stage)return;
      if(e.key==='ArrowRight')state.yaw+=.13;
      else if(e.key==='ArrowLeft')state.yaw-=.13;
      else if(e.key==='ArrowUp')state.pitch=clamp(state.pitch+.12,-1.45,1.45);
      else if(e.key==='ArrowDown')state.pitch=clamp(state.pitch-.12,-1.45,1.45);
      else if(e.key==='+'||e.key==='=')zoom(1.17);
      else if(e.key==='-')zoom(1/1.17);
      else if(e.key==='Home')resetPose();
      else return;
      tween=null;e.preventDefault();draw();
    },options);
    stage.addEventListener('pointerdown',e=>{
      if(e.target.closest('button')||e.button!==0)return;
      tween=null;pointers.set(e.pointerId,[e.clientX,e.clientY]);stage.setPointerCapture(e.pointerId);
      tapStart={x:e.clientX,y:e.clientY,time:performance.now(),moved:false};
    },options);
    const pinchDistance=()=>{const [a,b]=pointers.values();return Math.hypot(a[0]-b[0],a[1]-b[1]);};
    stage.addEventListener('pointermove',e=>{
      const old=pointers.get(e.pointerId);if(!old)return;
      if(tapStart && Math.hypot(e.clientX-tapStart.x,e.clientY-tapStart.y)>6)tapStart.moved=true;
      const distance=pointers.size===2?pinchDistance():0;
      pointers.set(e.pointerId,[e.clientX,e.clientY]);
      if(distance){zoom(pinchDistance()/Math.max(1,distance));return;}
      state.yaw-=(e.clientX-old[0])*.009;state.pitch=clamp(state.pitch+(e.clientY-old[1])*.008,-1.45,1.45);draw();
    },options);
    stage.addEventListener('lostpointercapture',e=>pointers.delete(e.pointerId),options);
    stage.addEventListener('pointerup',e=>{
      if(mode==='combat'&&tapStart&&!tapStart.moved&&performance.now()-tapStart.time<450){
        const hit=engine.pick?.(e.clientX,e.clientY);if(hit)laboratory?.fire(hit);
      }
      tapStart=null;
    },options);
    stage.addEventListener('wheel',e=>{
      if(document.activeElement!==stage&&!e.ctrlKey)return;
      e.preventDefault();zoom(Math.exp(-e.deltaY*.001));
    },{signal:scope.signal,passive:false});
    const resize=new ResizeObserver(()=>{engine.size();draw();});resize.observe(stage);
    const observer=new IntersectionObserver(([e])=>{inView=e.isIntersecting;previous=null;if(inView)wake();});
    observer.observe(stage);
    stage.addEventListener('flight-redraw',()=>{draw();wake();},options);
    document.addEventListener('visibilitychange',()=>{previous=null;if(!document.hidden)wake();},options);
    const motionSetting=new MutationObserver(()=>{if(reduced())setPlay(false);});
    motionSetting.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduce-motion']});
    dialog.dataset.presentation='model';state.marks=true;
    $('.as-timeline').hidden=isStatic;$('.as-phases').hidden=isStatic;
    filterAnatomy(study.points.some(p=>targetType(p)==='weak')?'weak':'part');setPlay(play);
    return {dispose(){laboratory?.dispose();scope.abort();cancelAnimationFrame(raf);observer.disconnect();resize.disconnect();motionSetting.disconnect();engine.dispose();}};
  }
  window.AtlasStudies={catalogue,dossier,inspect};
})();
