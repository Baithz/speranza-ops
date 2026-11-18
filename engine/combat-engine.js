/* Calculs hors ligne. Chaque durée est une estimation de scénario ; aucun état du joueur n'est écrit ici. */
(() => {
  'use strict';
  const data=window.ARC_COMBAT_DATA;
  const copy=value=>JSON.parse(JSON.stringify(value));
  const finite=Number.isFinite;
  const own=(o,k)=>Object.hasOwn(o,k);
  const plain=o=>o!==null && typeof o==='object' && !Array.isArray(o);
  const source=(label,url)=>({label,url});
  const unique=list=>[...new Map(list.map(s=>[s.url,s])).values()];
  const has=(o,k)=>own(o,k) && o[k]!==undefined && o[k]!==null && o[k]!=='';
  const enemies=()=>Object.values(data.enemies).map(copy);

  function readBuilds(){
    if(window.Armory?.exportState)return copy(window.Armory.exportState().builds);
    try{
      const saved=JSON.parse(localStorage.getItem('speranza.armory.v1'));
      if(window.Armory?.validateState(saved))return copy(saved.builds);
    }catch{}
    return [];
  }

  function timingFor(model,weapon,build,target){
    const tier=weapon.tiers[build.tier-1];
    const boost=1+model.effects.filter(e=>e.stat==='fireRate').reduce((n,e)=>n+(e.direction==='down'?-1:1)*e.amount,0)/100;
    const cadence=model.cadence ?? (finite(tier.rpm)?tier.rpm*boost:null);
    const loop=tier.looping;
    const reload=has(target,'reloadSeconds')?target.reloadSeconds:loop
      ?loop.entrySec+Math.ceil(model.magazine/loop.perLoop)*loop.loopSec+loop.exitSec:tier.reload;
    const cooldown=tier.cooldown || 0;
    const burst=tier.burst || 1;
    let gap=burst===1 && cooldown>0?cooldown:cadence>0?60/cadence:null;
    let windup=0,windupEach='none';
    const firing=tier.firing;
    const aimed=target.stance!=='hip';
    if(firing?.kind==='beam'){
      windup=firing.firstShotDelaySec;
      windupEach='magazine';
    }
    if(firing?.kind==='railgun'){
      windup=firing.chargeSec+(aimed?0:firing.hipExtraSec || 0);
      windupEach='shot';
    }
    if(firing?.kind==='doubleAction'){
      windup=aimed?firing.triggerDelayAimedSec:firing.triggerDelaySec;
      windupEach='shot';
      if(aimed)gap=Math.max(gap,firing.aimedSettleSec || 0);
    }
    return {cadence,reload,gap,burst,cooldown:burst>1?cooldown:0,windup,windupEach,
      reloadKind:loop?'rounds':'magazine',status:'estimated',source:'https://arctracker.io/ballistics'};
  }

  // L'intervalle de tir précède le rechargement, comme dans le modèle ARC Tracker cité.
  // Le premier chargeur est plein, et aucun intervalle ne suit le dernier impact.
  function sequence(shots,magazine,timing){
    if(!finite(shots) || shots<1 || shots>100000 || !finite(timing.gap))return null;
    let elapsed=0,withinBurst=0,rounds=magazine,reloads=0;
    const times=[];
    for(let i=0;i<shots;i++){
      if(timing.windupEach==='shot' || timing.windupEach==='magazine' && rounds===magazine)elapsed+=timing.windup;
      if(times.length<200)times.push(elapsed);
      if(i===shots-1)break;
      elapsed+=timing.gap;
      withinBurst++;
      if(timing.burst>1 && withinBurst===timing.burst){elapsed+=timing.cooldown;withinBurst=0;}
      rounds--;
      if(rounds===0){
        if(!finite(timing.reload))return null;
        elapsed+=timing.reload;rounds=magazine;withinBurst=0;reloads++;
      }
    }
    return {time:elapsed,reloads,shotTimes:times,sequenceTruncated:shots>times.length};
  }

  function evaluate(build,target={}){
    const result={damage:null,nominalDamage:null,magazine:null,cadence:null,reload:null,shots:null,time:null,
      magazines:null,reloads:null,projectiles:null,perProjectile:null,health:null,healthStatus:'unknown',
      status:'invalid',caveats:[],assumptions:[],sources:[],provenance:{damage:'unknown',health:'unknown',timing:'unknown'},
      damageTarget:'hull',timing:null,shotTimes:[],sequenceTruncated:false};
    if(!plain(target) || !window.Armory?.validateBuild(build)){
      result.caveats.push('Choisis un montage valide de l’armurerie.');return result;
    }
    const enemy=typeof target.enemyId==='string' && own(data.enemies,target.enemyId)?data.enemies[target.enemyId]:null;
    const zone=target.zone || 'exposed',distance=target.distance ?? 30;
    if(!enemy || !enemy.zones.includes(zone) || !finite(distance) || distance<0 || distance>250){
      result.caveats.push('Vérifie la cible, sa zone disponible et une distance entre 0 et 250 m.');return result;
    }
    for(const key of ['health','armorHealth','reloadSeconds','weakMultiplier','armorResistance','resistance']){
      if(!has(target,key))continue;
      const value=target[key];
      const valid=finite(value) && (['armorResistance','resistance'].includes(key)?value>=-1 && value<=1
        :key==='reloadSeconds'?value>=0 && value<=120:value>0 && value<=1000000);
      if(!valid){result.caveats.push('Hypothèse numérique invalide · '+key);return result;}
    }
    const part=has(target,'partId')?enemy.parts.find(p=>p.id===target.partId):null;
    if(has(target,'partId') && (!part || part.zone!==zone)){
      result.caveats.push('Ce composant ne correspond pas à la zone choisie.');return result;
    }
    const model=window.Armory.calculate(build,distance),weapon=data.weapons[build.weapon];
    const tier=weapon.tiers[build.tier-1],timing=timingFor(model,weapon,build,target);
    Object.assign(result,{status:'estimate',enemyId:enemy.id,zone,distance,magazine:model.magazine,
      cadence:timing.cadence,reload:timing.reload,timing,projectiles:model.projectiles});
    result.sources=unique([...enemy.sources,source('ARC Tracker · arme et rang','https://arctracker.io/items/'+tier.ref),
      source('ARC Tracker · calcul balistique','https://arctracker.io/ballistics')]);
    result.damageTarget=zone==='armor'?'plate':zone==='weak' || part?'component':'hull';
    result.provenance.timing=has(target,'reloadSeconds')?'assumption':'community-model';
    result.assumptions.push('Tous les projectiles touchent la même zone à distance fixe. Le premier chargeur est plein.');
    result.caveats.push('Le temps calculé exclut les déplacements, la visée, les fenêtres de vulnérabilité, les ratés et le trajet des projectiles.');
    if(model.projectiles>1)result.caveats.push('Les dégâts par tir incluent déjà les '+model.projectiles+' projectiles. La dispersion peut réduire le total touché.');
    if(has(target,'reloadSeconds'))result.assumptions.push('Rechargement complet saisi manuellement, identique après chaque chargeur.');
    if(timing.reloadKind==='rounds')result.caveats.push('Chaque rechargement modélisé remplit entièrement l’arme. Les animations de chargement individuel sont estimées.');
    result.caveats.push(enemy.health.note);
    if(['matriarch','vaporizer'].includes(enemy.id))result.assumptions.push('Bouclier d’énergie abaissé et ligne de tir libre.');
    const special=data.special[build.weapon];
    if(special){
      result.referenceDamage=target.stance!=='hip' && special.aimedDamage?special.aimedDamage:special.referenceDamage;
      result.status='partial';result.caveats.push(special.note);
      result.sources.push(source('Wiki · '+special.label,special.source));
      result.caveats.push('Le calcul d’impact par pièce est indisponible pour cette arme. La valeur de référence est présentée séparément.');
      return result;
    }
    let base=model.damage;
    if(!finite(base)){result.status='partial';result.caveats.push('Courbe balistique indisponible pour cette arme.');return result;}
    let multiplier=1,resistance=0;
    result.nominalDamage=zone==='armor'?base*model.armorMultiplier:base;
    result.provenance.damage='ballistic-model';
    if(zone==='armor'){
      multiplier=model.armorMultiplier;
      if(!part && !has(target,'armorResistance') && !has(target,'resistance')){
        result.status='partial';
        result.caveats.push('La valeur nominale multiplie le tir par la perforation de l’arme. Renseigne la résistance physique de la plaque pour estimer les dégâts réellement subis.');
        result.caveats.push('Les PV de la machine ne servent pas de seuil de rupture à une plaque.');
        return result;
      }
      resistance=has(target,'armorResistance')?target.armorResistance:has(target,'resistance')?target.resistance:part.resistance;
      result.caveats.push('Le calcul vise une seule plaque. Le transfert des dégâts à la carcasse et les autres pièces touchées restent inconnus.');
    }else if(zone==='weak'){
      if(!part && !has(target,'weakMultiplier')){
        result.status='partial';result.caveats.push('Le bonus de cette zone faible n’est pas chiffré. Renseigne un multiplicateur hypothétique pour comparer les montages.');
        return result;
      }
      multiplier=(has(target,'weakMultiplier')?target.weakMultiplier:1)*(tier.weakMultiplier || 1);
      resistance=has(target,'resistance')?target.resistance:part?.resistance || 0;
      result.caveats.push('Le multiplicateur de tête contre un Raider n’est pas utilisé pour les points faibles ARC.');
    }else{
      resistance=has(target,'resistance')?target.resistance:part?.resistance || 0;
      if(!part && !has(target,'resistance'))result.assumptions.push('Carcasse découverte, sans résistance physique supplémentaire.');
    }
    for(const [key,label] of [['health','PV'],['armorHealth','PV de plaque'],['weakMultiplier','Bonus faible'],['armorResistance','Résistance de plaque'],['resistance','Résistance physique']]){
      if(has(target,key))result.assumptions.push(label+' saisi · '+target[key]);
    }
    if(part){
      result.partId=part.id;result.sources.push(source('Wiki · anatomie du Bondisseur',part.source));
      result.caveats.push('Seuil et résistance publiés pour cette pièce du Bondisseur. Sa destruction ne garantit pas la destruction de la machine.');
    }
    result.damage=base*multiplier*(1-resistance);
    result.perProjectile=result.damage/model.projectiles;
    result.provenance.damage=['weakMultiplier','armorResistance','resistance'].some(k=>has(target,k))
      ?'assumption':part?'community-anatomy':'ballistic-model';
    const customHealth=zone==='armor' && has(target,'armorHealth')?target.armorHealth:has(target,'health')?target.health:null;
    const health=customHealth ?? part?.health ?? (zone==='exposed'?enemy.health.value:null);
    result.health=health;
    result.healthStatus=customHealth!==null?'assumption':part?'reported':zone==='exposed'?enemy.health.status:'unknown';
    result.provenance.health=result.healthStatus;
    if(result.damage<=0){
      result.status='blocked';result.caveats.push('Cette résistance absorbe entièrement le tir.');return result;
    }
    if(!finite(health)){
      result.status='partial';
      result.caveats.push(zone==='exposed'?'Un seuil de PV manuel permet de calculer un scénario.':'Renseigne les PV de cette pièce pour estimer sa rupture.');
      return result;
    }
    result.shots=Math.max(1,Math.ceil(health/result.damage-1e-9));
    result.magazines=Math.ceil(result.shots/result.magazine);
    result.reloads=result.magazines-1;
    const schedule=sequence(result.shots,result.magazine,timing);
    if(schedule)Object.assign(result,schedule);
    else {result.status='partial';result.caveats.push('Durée indisponible pour cette séquence.');}
    result.sources=unique(result.sources);
    return result;
  }
  window.AtlasCombat={evaluate,enemies,readBuilds,scheduleShots:sequence,version:1};
})();
