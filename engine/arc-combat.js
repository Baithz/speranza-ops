/* Le laboratoire utilise les mêmes calculs d'armes et d'accessoires que
   l'établi. Une fracture de présentation ne fournit jamais une valeur de santé inconnue. */
window.AtlasArcLab = (() => {
  'use strict';
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = value => Number.isFinite(value) ? value.toLocaleString('fr-FR',{maximumFractionDigits:1}) : '—';
  const slots = {muzzle:'Bouche',grip:'Poignée',magazine:'Chargeur',stock:'Crosse'};
  const roman = ['I','II','III','IV'];
  let drafts = null;

  function mount(host, enemyId, model, controls) {
    const catalogue = window.ARMORY_DATA;
    const scope = new AbortController();
    const events = {signal:scope.signal};
    const enemy = window.AtlasCombat.enemies().find(item=>item.id===enemyId);
    if(!enemy) return {dispose(){scope.abort();}};
    function surfacePoint(group,id,label){
      const bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
      for(const part of model.parts){
        if(part.group!==group)continue;
        for(let i=0;i<part.positions.length;i++){
          const axis=i%3;bounds.min[axis]=Math.min(bounds.min[axis],part.positions[i]);bounds.max[axis]=Math.max(bounds.max[axis],part.positions[i]);
        }
      }
      return {id,group,label,position:[(bounds.min[0]+bounds.max[0])/2,(bounds.min[1]+bounds.max[1])/2,bounds.max[2]]};
    }
    const hullGroup=model.parts.find(part=>/^(body|core|hull|coque|chassis)$/.test(part.group))?.group || model.parts[0].group;
    const hull=surfacePoint(hullGroup,'lab-hull','Corps exposé');
    const partGroups={'face-plate':'facePlate','leg-plate':'carterG1','leg-inside':'jambeG1','upper-leg':'brasG1','lower-leg':'jambeG1',core:'core'};
    const measuredPoints=enemy.parts.filter(part=>model.parts.some(mesh=>mesh.group===partGroups[part.id])).map(part=>
      ({...surfacePoint(partGroups[part.id],'measured:'+part.id,part.label),partId:part.id}));
    const points = [hull,...model.study.points,...measuredPoints];
    let builds = structuredClone(drafts || window.AtlasCombat.readBuilds());
    if(builds.length!==2)builds=[{weapon:'anvil',tier:1,mods:{}},{weapon:'anvil',tier:1,mods:{}}];
    let selected = 0, total = 0, shots = 0, burst = null, lastFire = -Infinity;
    let rounds=0, reloadTimer=null, finished=false;
    const settings = {enemyId,zone:'exposed',distance:30};
    const names = Object.keys(catalogue.weapons).sort((a,b)=>catalogue.weapons[a].name.localeCompare(catalogue.weapons[b].name,'fr'));
    let results = [];
    let target = hull;

    function buildCard(build,index) {
      const weapon = catalogue.weapons[build.weapon];
      return `<article class="ac-build" data-build-panel="${index}">
        <header><b>${index?'B':'A'}</b><img src="${weapon.img}" alt=""><span>${esc(weapon.name)} ${roman[build.tier-1]}</span></header>
        <div class="ac-equipment"><label>Arme<select data-weapon="${index}">${names.map(id=>`<option value="${id}" ${id===build.weapon?'selected':''}>${esc(catalogue.weapons[id].name)}</option>`).join('')}</select></label>
        <label>Rang<select data-tier="${index}">${weapon.tiers.map((_,i)=>`<option value="${i+1}" ${build.tier===i+1?'selected':''}>${roman[i]}</option>`).join('')}</select></label></div>
        <div class="ac-attachments">${Object.entries(weapon.slots).map(([slot,ids])=>`<label>${slots[slot]||esc(slot)}<select data-mod="${index}" data-slot="${slot}"><option value="">Sans accessoire</option>${ids.map(id=>`<option value="${id}" ${build.mods[slot]===id?'selected':''}>${esc(catalogue.mods[id].name)}</option>`).join('')}</select></label>`).join('')}</div>
        <div class="ac-result" data-result="${index}"></div></article>`;
    }
    host.innerHTML=`<section class="ac-lab" aria-label="Simulateur d’armes contre ${esc(enemy.name)}">
      <header class="ac-heading"><div><span>ESSAI BALISTIQUE</span><h3>Préparer le bon montage.</h3><p>Compare tes armes sur ${esc(enemy.name)}, puis teste leurs impacts sur la maquette.</p></div><button type="button" data-ac-import>Importer mes montages A/B</button></header>
      <div class="ac-target-config"><label>Point d’impact<select data-ac-point>${points.map(p=>`<option value="${esc(p.id)}" ${p===target?'selected':''}>${esc(p.label)}</option>`).join('')}</select></label>
      <label>Surface touchée<select data-ac-zone>${enemy.zones.map(zone=>`<option value="${zone}">${{exposed:'Corps exposé',armor:'Plaque de blindage',weak:'Composant vulnérable'}[zone]}</option>`).join('')}${enemy.parts.length?'<optgroup label="Composants documentés">'+enemy.parts.map(part=>`<option value="part:${part.id}">${esc(part.label)}</option>`).join('')+'</optgroup>':''}</select></label>
      <label>Distance <span><input data-ac-distance type="number" min="0" max="250" step="1" value="30"> m</span></label></div>
      <p class="ac-surface-note">Choisis la surface correspondant à ton tir. Le repère situe la pièce sur la maquette.</p>
      <div class="ac-builds">${builds.map(buildCard).join('')}</div>
      <div class="ac-comparison" data-ac-difference></div>
      <details class="ac-assumptions"><summary>Préciser une résistance ou un multiplicateur mesuré</summary>
        <p>Les champs vides utilisent les données disponibles. Une valeur saisie devient une hypothèse pour les deux montages.</p>
        <div><label>PV de la cible<input type="number" min="1" max="1000000" step="1" data-ac-assumption="health" placeholder="Selon les sources"></label>
        <label>Bonus du point faible ×<input type="number" min="0.01" max="100" step="0.01" data-ac-assumption="weakMultiplier" placeholder="Inconnu"></label>
        <label>PV de la plaque<input type="number" min="1" max="1000000" step="1" data-ac-assumption="armorHealth" placeholder="Inconnu"></label>
        <label>Résistance de la plaque (0 à 1)<input type="number" min="0" max="1" step="0.01" data-ac-assumption="armorResistance" placeholder="Inconnue"></label>
        <label>Rechargement (secondes)<input type="number" min="0.01" max="120" step="0.1" data-ac-assumption="reloadSeconds" placeholder="Selon les sources"></label></div>
      </details>
      <details class="ac-evidence"><summary>Hypothèses et sources du calcul</summary><div data-ac-evidence></div></details>
    </section>`;
    const stageTools = document.createElement('section');
    stageTools.className='ac-firebar';
    stageTools.setAttribute('aria-label','Essayer le montage sur la maquette');
    stageTools.innerHTML=`<div class="ac-fire-select" role="group" aria-label="Montage utilisé"><button type="button" data-ac-use="0" aria-pressed="true">Montage A</button><button type="button" data-ac-use="1" aria-pressed="false">Montage B</button></div>
      <div class="ac-trigger"><button type="button" data-ac-fire>Tirer</button><button type="button" data-ac-burst>Tester un chargeur</button><button type="button" data-ac-reload>Recharger</button><button type="button" data-ac-reset>Réinitialiser</button></div>
      <div class="ac-health" data-ac-health hidden><span data-ac-health-label></span><div role="progressbar" aria-label="Résistance restante de la cible" aria-valuemin="0"><i></i></div></div>
      <p data-ac-score role="status">0 tir · Choisis ta surface et ton montage.</p>`;
    host.closest('.as-workbench').querySelector('.as-pair').after(stageTools);
    const find = selector=>host.querySelector(selector);
    const bar = selector=>stageTools.querySelector(selector);
    function showHealth(){
      const health=results[selected]?.health;
      const valid=Number.isFinite(health)&&health>0;
      bar('[data-ac-health]').hidden=!valid;
      if(!valid)return;
      const remaining=Math.max(0,health-total);
      const track=bar('[role=progressbar]');
      track.setAttribute('aria-valuemax',String(health));track.setAttribute('aria-valuenow',String(remaining));
      track.querySelector('i').style.width=(remaining/health*100)+'%';
      bar('[data-ac-health-label]').textContent=`${results[selected].damageTarget==='hull'?'Machine':'Pièce'} · ${fmt(remaining)} / ${fmt(health)} PV`;
    }

    function stopBurst() {
      clearTimeout(burst);burst=null;
      bar('[data-ac-burst]').textContent='Tester un chargeur';
    }
    function reset() {
      stopBurst();clearTimeout(reloadTimer);reloadTimer=null;finished=false;
      rounds=results[selected]?.magazine||0;shots=0;total=0;lastFire=-Infinity;
      bar('[data-ac-reload]').textContent='Recharger';
      bar('[data-ac-score]').textContent='0 tir · Cible restaurée.';
      controls.reset();
      showHealth();
    }
    function update() {
      stopBurst();
      results=builds.map(build=>window.AtlasCombat.evaluate(build,settings));
      rounds=results[selected]?.magazine||0;
      showHealth();
      drafts=structuredClone(builds);
      for(const [index,result] of results.entries()) {
        const stats=[['Dégâts / tir',result.damage],['Tirs nécessaires',result.shots],['Temps théorique',result.time,' s'],['Capacité',result.magazine],['Cadence',result.cadence,' /min'],['Recharges',result.reloads]];
        find(`[data-result="${index}"]`).innerHTML='<dl>'+stats.map(([label,value,unit=''])=>`<div><dt>${label}</dt><dd>${fmt(value)}${Number.isFinite(value)?unit:''}</dd></div>`).join('')+'</dl>'+
          `<p class="ac-calculation-state">${Object.values(result.provenance).includes('assumption')?'Avec tes hypothèses':result.status==='estimate'?'Estimation documentée':result.status==='invalid'?'Montage à vérifier':'Données partielles'}</p>`;
        const effects=window.Armory.calculate(builds[index],settings.distance).effects;
        if(effects.length)find(`[data-result="${index}"]`).insertAdjacentHTML('beforeend','<div class="ac-mod-effects">'+effects.map(effect=>
          `<span>${esc(effect.label)} <b>${effect.direction==='down'?'−':'+'}${fmt(effect.amount)}${effect.unit==='percent'?' %':''}</b></span>`).join('')+'</div>');
        if(Number.isFinite(result.referenceDamage))find(`[data-result="${index}"]`).insertAdjacentHTML('beforeend',
          `<p class="ac-reference">${fmt(result.referenceDamage)} dégâts de référence publiés. L’impact reçu par chaque pièce reste à mesurer.</p>`);
      }
      const [a,b]=results;
      let comparison='Les valeurs manquantes restent ouvertes tant que la résistance de la cible est inconnue.';
      if(Number.isFinite(a.damage)&&Number.isFinite(b.damage)) {
        comparison=Math.abs(a.damage-b.damage)<.001?'Les deux montages infligent les mêmes dégâts par tir à cette distance.':
          `Le montage ${a.damage>b.damage?'A':'B'} inflige ${fmt(Math.abs(a.damage-b.damage))} dégâts supplémentaires par tir sur cette surface.`;
        if(a.magazine!==b.magazine)comparison+=` Capacité de ${fmt(a.magazine)} contre ${fmt(b.magazine)} munitions.`;
      }
      find('[data-ac-difference]').textContent=comparison;
      const notes=[...new Set(results.flatMap(r=>[...r.caveats,...r.assumptions]))];
      const sources=new Map(results.flatMap(r=>r.sources).map(s=>[s.url,s]));
      find('[data-ac-evidence]').innerHTML='<p>Statistiques contrôlées le '+esc(window.ARC_COMBAT_DATA.checked)+'.</p><ul>'+notes.map(note=>`<li>${esc(note)}</li>`).join('')+'</ul><div class="ac-source-links">'+[...sources.values()].map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`).join('')+'</div>';
      const note=settings.zone==='armor'?'Le calcul concerne la plaque touchée. Son épuisement ouvre la pièce protégée.':settings.zone==='weak'?'Le calcul concerne le composant. Sa résistance et son bonus peuvent nécessiter une mesure.':'Le calcul concerne le corps exposé. Les valeurs de temps supposent que chaque tir touche.';
      find('.ac-surface-note').textContent=note;
    }
    function fire(hit,scheduled=false) {
      const now=performance.now();
      const result=results[selected];
      const spacing=Number.isFinite(result.cadence)?60000/result.cadence:250;
      if(!scheduled && now-lastFire<spacing*.95 || controls.destroyed() || finished || reloadTimer)return;
      if(rounds<=0){bar('[data-ac-score]').textContent='Chargeur vide · Recharge pour continuer le même essai.';stopBurst();return;}
      lastFire=now;shots++;rounds--;
      if(Number.isFinite(result.damage))total+=result.damage;
      controls.hit(hit||target,builds[selected].weapon);
      let report=`${shots} tir${shots>1?'s':''} · ${fmt(rounds)} en chargeur · ${Number.isFinite(result.damage)?fmt(total)+' dégâts calculés':'Impact visualisé · dégâts inconnus'}`;
      if(Number.isFinite(result.health)&&Number.isFinite(result.damage)) {
        const remaining=Math.max(0,result.health-total);
        report+=` · ${fmt(remaining)} PV restants`;
        if(remaining===0){
          finished=true;stopBurst();
          if(result.damageTarget==='hull')controls.destroy();
          else controls.breakPart(points.find(point=>point.partId===settings.partId && point.partId)||target);
          report+=' · Seuil calculé atteint';
        }
      }
      bar('[data-ac-score]').textContent=report;
      showHealth();
    }
    function changeBuilds() {
      const container=find('.ac-builds');container.innerHTML=builds.map(buildCard).join('');
      reset();update();
    }
    host.addEventListener('change',event=>{
      const input=event.target;
      if(input.hasAttribute('data-weapon')){
        const index=Number(input.dataset.weapon);builds[index]={weapon:input.value,tier:1,mods:{}};
        changeBuilds();find(`[data-weapon="${index}"]`).focus({preventScroll:true});return;
      }
      if(input.hasAttribute('data-tier')){
        const index=Number(input.dataset.tier);builds[index].tier=Number(input.value);
        const weapon=catalogue.weapons[builds[index].weapon];
        find(`[data-build-panel="${index}"] header span`).textContent=weapon.name+' '+roman[builds[index].tier-1];
      }
      if(input.hasAttribute('data-mod')){
        const build=builds[Number(input.dataset.mod)];
        if(input.value)build.mods[input.dataset.slot]=input.value;else delete build.mods[input.dataset.slot];
      }
      if(input.hasAttribute('data-ac-point')){
        target=points.find(p=>p.id===input.value);controls.select(target.id);
        const weak=target.kind==='weak'||/^(thruster|inlet|knee|canister|heart|brow)/.test(target.id);
        if(target===hull || weak&&enemy.zones.includes('weak')){
          settings.zone=target===hull?'exposed':'weak';delete settings.partId;
          find('[data-ac-zone]').value=settings.zone;
        }
        if(target.partId){
          const part=enemy.parts.find(part=>part.id===target.partId);
          settings.zone=part.zone;settings.partId=part.id;find('[data-ac-zone]').value='part:'+part.id;
        }
      }
      if(input.hasAttribute('data-ac-zone')){
        const part=enemy.parts.find(part=>'part:'+part.id===input.value);
        if(part){settings.zone=part.zone;settings.partId=part.id;target=points.find(p=>p.partId===part.id)||target;}
        else{
          settings.zone=input.value;delete settings.partId;
          if(settings.zone==='exposed')target=hull;
          if(settings.zone==='weak')target=model.study.points.find(p=>p.kind==='weak'||/^(thruster|inlet|knee|canister|heart|brow)/.test(p.id))||target;
        }
        find('[data-ac-point]').value=target.id;controls.select(target.id);
      }
      if(input.hasAttribute('data-ac-distance')){
        settings.distance=Math.round(Math.max(0,Math.min(250,Number(input.value)||0)));input.value=settings.distance;
      }
      if(input.hasAttribute('data-ac-assumption')){
        if(input.value && input.validity.valid)settings[input.dataset.acAssumption]=Number(input.value);
        else delete settings[input.dataset.acAssumption];
      }
      reset();update();
    },events);
    host.addEventListener('click',event=>{
      if(event.target.closest('[data-ac-import]')){const imported=window.AtlasCombat.readBuilds();if(imported.length===2){builds=imported;changeBuilds();}}
    },events);
    stageTools.addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button)return;
      if(button.hasAttribute('data-ac-use')){
        selected=Number(button.dataset.acUse);reset();
        for(const option of stageTools.querySelectorAll('[data-ac-use]'))option.setAttribute('aria-pressed',String(Number(option.dataset.acUse)===selected));
      }
      if(button.hasAttribute('data-ac-fire'))fire();
      if(button.hasAttribute('data-ac-reset'))reset();
      if(button.hasAttribute('data-ac-reload')){
        const seconds=results[selected].reload;
        if(!Number.isFinite(seconds)){bar('[data-ac-score]').textContent='Durée inconnue · Précise un temps de rechargement dans les hypothèses.';return;}
        if(reloadTimer || finished)return;
        stopBurst();button.textContent='Rechargement…';
        reloadTimer=setTimeout(()=>{
          reloadTimer=null;rounds=results[selected].magazine;button.textContent='Recharger';
          bar('[data-ac-score]').textContent=`${shots} tirs · ${fmt(rounds)} munitions disponibles · ${fmt(total)} dégâts calculés`;
        },seconds*1000);
      }
      if(button.hasAttribute('data-ac-burst')){
        if(burst){stopBurst();return;}
        const result=results[selected];
        if(reloadTimer || finished || rounds<=0)return;
        const capacity=Math.min(150,Math.max(1,Math.ceil(rounds)));
        if(!result.timing)return;
        const schedule=window.AtlasCombat.scheduleShots(capacity,capacity,result.timing);
        if(!schedule)return;
        let index=0;
        const shootNext=()=>{
          fire(undefined,true);index++;
          if(index>=schedule.shotTimes.length||controls.destroyed()||finished){stopBurst();return;}
          const wait=(schedule.shotTimes[index]-schedule.shotTimes[index-1])*1000;
          burst=setTimeout(shootNext,Math.max(30,wait));
        };
        button.textContent='Arrêter le chargeur';
        burst=setTimeout(shootNext,schedule.shotTimes[0]*1000);
      }
    },events);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stopBurst();},events);
    update();
    return {
      fire,reset,
      setActive(active){host.hidden=!active;stageTools.hidden=!active;if(!active){stopBurst();clearTimeout(reloadTimer);reloadTimer=null;}},
      dispose(){stopBurst();clearTimeout(reloadTimer);scope.abort();stageTools.remove();}
    };
  }
  return {mount};
})();
