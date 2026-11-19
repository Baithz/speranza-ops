/* Speranza Ops — Spawn ARC : points d'apparition des gros ARC, chronos de retour et
   vérification par les joueurs.
   • Positions : relevés communautaires des cartes (engine/maps-data.js).
   • Délais de référence (relevés de joueurs, non officiels) : Bastion 6 min, Bombardier 6 min,
     Artificier 7 min ; −15 % ou +10 % selon la condition de carte.
   • Chaque signalement (vu / vide / abattu) nourrit la fiabilité du point et le délai observé,
     et part vers l'escouade reliée, qui l'ajoute à ses propres comptes. */
(() => {
  'use strict';
  const O=window.OPS,{$,$$,esc,ico,read,write,actions,sched,mapById,MAPS}=O;
  const TYPES=[{id:'arc-bastion',arc:'bastion',ab:'Ba',sec:360,c:'#fa684d'},{id:'arc-rocketeer',arc:'rocketeer',ab:'Ar',sec:420,c:'#50dae4'},{id:'arc-bombardier',arc:'bombardier',ab:'Bo',sec:360,c:'#ffd456'},{id:'arc-leaper',arc:'leaper',ab:'Bd',sec:360,c:'#a78bfa'},
    // La Sentinelle ne revient pas une fois abattu : pas de chrono, seulement « abattu pour ce raid ».
    {id:'arc-sentinel',arc:'sentinel',ab:'Se',sec:0,once:true,c:'#7ee081'}];
  const FAST=['Raid nocturne','Tempête électromagnétique','Bunker caché'],SLOW=['Portail verrouillé','Vague de froid'];
  const SRC=[['Gamers Together · délais de retour','https://gamerstogether.cz/en/arc-raiders-enemy-respawn-times/'],['IGGM · points d’apparition fixes','https://www.iggm.com/news/arc-raiders-trials-best-maps-enemy-spawn-points-fastest-methods'],['TheGamer · Bastion et Bombardier','https://www.thegamer.com/arc-raiders-bombardier-bastion-cells-combat-strategies-best-weapons-loadout-guide-how-to/']];
  const typeOf=id=>TYPES.find(t=>t.id===id),tname=t=>O.arcById.get(t.arc)?.name||t.arc;
  const dur=s=>{s=Math.round(s);return Math.floor(s/60)+' min'+(s%60?' '+String(s%60).padStart(2,'0')+' s':'');};
  const KEY='speranza.ops.spawns.v1';
  let S={stats:{},live:{},ids:[]};try{const v=JSON.parse(read(KEY));if(v&&v.stats&&v.live)S=Object.assign(S,v);}catch{}
  const save=()=>write(KEY,JSON.stringify(S));
  // Reprise des relevés de l'ancien calcul : un retour mesuré était déjà une borne haute.
  for(const v of Object.values(S.stats||{}))if(Array.isArray(v.delays)){v.hi=[...(v.hi||[]),...v.delays].slice(-24);delete v.delays;}
  let ready=null;const data=()=>ready??=O.load('engine/maps-data.js').catch(()=>{});
  const cache=new Map();
  function points(mapId,type){
    const ck=mapId+'|'+type;if(cache.has(ck))return cache.get(ck);
    const m=window.RAID_MAP_DATA?.maps.find(x=>x.id===mapId);if(!m)return [];
    const places=m.points.filter(p=>['sector','label','areas'].includes(p[2])&&typeof p[4]==='string'&&p[4]),seen={};
    const list=m.points.filter(p=>p[2]===type).map((p,i)=>{
      let best=null,d=Infinity;for(const q of places){if(q[3]!==p[3])continue;const k=(q[0]-p[0])**2+(q[1]-p[1])**2;if(k<d){d=k;best=q;}}
      const place=best?best[4]:'Point '+(i+1);seen[place]=(seen[place]||0)+1;
      return {key:mapId+'|'+type+'|'+i,type,x:p[0]/100,y:p[1]/100,layer:p[3],floor:m.layers[p[3]]?.name||'',place,nth:seen[place]};
    });
    for(const p of list)p.label=seen[p.place]>1?p.place+' · '+p.nth:p.place;
    cache.set(ck,list);return list;
  }
  const mapsWith=()=>MAPS.filter(m=>TYPES.some(t=>points(m.id,t.id).length));
  function modifier(m,now=Date.now()){
    const ev=sched.active(m,now).map(e=>e.title),fast=ev.find(t=>FAST.includes(t)),slow=ev.find(t=>SLOW.includes(t));
    return fast?{f:.85,why:fast+' : retours 15 % plus rapides'}:slow?{f:1.1,why:slow+' : retours 10 % plus lents'}:{f:1,why:''};
  }
  const stat=k=>S.stats[k]??={seen:0,absent:0,lo:[],hi:[]};
  /* Délai de retour : on raisonne en bornes, pas en moyenne.
     Un relevé ne donne jamais le délai exact — on ne regarde pas au bon moment — mais il encadre :
       « vide » d secondes après l'avoir abattu  → le délai est PLUS GRAND que d      (borne basse)
       « vu »   d secondes après l'avoir abattu  → le délai est PLUS PETIT ou égal    (borne haute)
     En accumulant, l'intervalle se resserre seul et ne peut pas dériver comme une moyenne. */
  const K=4;                                   // poids de la référence tant qu'on a peu de relevés
  const quantile=(a,q)=>{if(!a.length)return null;const v=[...a].sort((x,y)=>x-y),i=(v.length-1)*q,b=Math.floor(i);return v[b]+(v[Math.ceil(i)]-v[b])*(i-b);};
  // Un relevé aberrant ne doit pas tout emporter : on borne à la moitié / deux fois et demie la référence.
  const borne=(d,t)=>Math.round(Math.min(Math.max(d,t.sec*.4),t.sec*2.5));
  function pool(type){                         // tous les points du même type, quand un point manque de relevés
    const lo=[],hi=[];
    for(const [k,v] of Object.entries(S.stats))if(k.split('|')[1]===type){lo.push(...(v.lo||[]));hi.push(...(v.hi||[]));}
    return {lo,hi};
  }
  // Bornes calculées par la base sur les relevés de tous les raiders.
  let duServeur={};
  async function chargerBornes(mapId){
    const b=await O.net?.bornes?.(mapId);
    if(b&&Object.keys(b).length){duServeur=Object.assign(duServeur,b);repaint();}
  }
  function fenetre(key){
    const [mapId,type]=key.split('|'),t=typeOf(type);
    const ref=t.sec*modifier(mapById(mapId)).f;
    if(!t||t.once||!t.sec)return {lo:0,hi:0,n:0,ref:0,source:'aucune'};
    const propre=S.stats[key]||{};let lo=propre.lo||[],hi=propre.hi||[],source='ce point';
    const srv=duServeur[key];
    if(lo.length+hi.length<3&&srv&&(srv.basse||srv.haute)){
      // La base ne renvoie pas les relevés un par un, mais les deux bornes déjà calculées.
      if(srv.basse)lo=[srv.basse];if(srv.haute)hi=[srv.haute];
      const bas=((srv.basse??0)*(srv.n||1)+K*ref*.9)/((srv.basse?(srv.n||1):0)+K);
      const haut=((srv.haute??0)*(srv.n||1)+K*ref*1.1)/((srv.haute?(srv.n||1):0)+K);
      return {lo:Math.round(Math.min(bas,haut)),hi:Math.round(Math.max(bas,haut)),n:srv.n||0,ref:Math.round(ref),source:'tous les raiders'};
    }
    if(lo.length+hi.length<3){const p=pool(type);if(p.lo.length+p.hi.length){lo=p.lo;hi=p.hi;source='ce type d’ARC';}else source='la référence';}
    const qlo=quantile(lo,.9),qhi=quantile(hi,.1);
    let bas=((qlo??0)*lo.length+K*ref*.9)/(lo.length+K);
    let haut=((qhi??0)*hi.length+K*ref*1.1)/(hi.length+K);
    if(bas>=haut){const m=(bas+haut)/2;bas=m*.88;haut=m*1.12;}   // relevés contradictoires : on élargit
    return {lo:Math.round(bas),hi:Math.round(haut),n:lo.length+hi.length,ref:Math.round(ref),source};
  }
  // Ce que le site attend d'un point : l'heure, et les deux bornes autour.
  const timerOf=key=>{const l=S.live[key],o=S.obs?.[key];
    return l&&!l.once?{at:l.at,lo:l.lo||0,hi:l.hi||l.lo||0}:o?{at:o.at,lo:0,hi:o.hi||0}:null;};
  const trust=key=>{const s=S.stats[key];if(!s||!(s.seen+s.absent))return null;return {pct:Math.round((s.seen+1)/(s.seen+s.absent+2)*100),n:s.seen+s.absent};};
  function prune(){const now=Date.now();let cut=false;for(const [k,l] of Object.entries(S.live))if(now-l.at>45*60000){delete S.live[k];cut=true;}if(cut)save();}
  // Applique un signalement, local ou reçu de l'escouade.
  function apply(r,remote=false){
    if(!r||typeof r.key!=='string'||!['seen','absent','kill','clear'].includes(r.kind)||S.ids.includes(r.id))return false;
    const [mapId,type,idx]=r.key.split('|');if(!mapById(mapId)||!typeOf(type)||!points(mapId,type)[Number(idx)])return false;
    const at=Math.min(Date.now(),Number(r.at)||Date.now()),st=stat(r.key),live=S.live[r.key];
    S.ids.push(r.id);if(S.ids.length>600)S.ids.splice(0,200);
    if(remote){const mine=raidOn(mapId,at);
      if(!(mine&&r.raid&&r.raid===mine.id)){            // pas le même raid : au mieux un avis pour l'historique
        if(r.kind!=='clear'&&!O.net?.on?.()){if(r.kind==='absent')st.absent++;else st.seen++;st.net=(st.net||0)+1;}
        save();return 'history';}
    }
    let net=null,ecart=null;const rd=raidOn(mapId,at),bk=rd?bucketAt(rd,at):null,obs=S.obs??={};
    const tally=i=>{if(bk===null)return;const b=(st.b??=[[0,0],[0,0],[0,0]])[bk];b[i]++;};
    const once=typeOf(type).once;
    if(r.kind==='kill'&&once){st.seen++;tally(0);net=['seen'];S.live[r.key]={at,lo:0,hi:0,once:true,told:true,by:String(r.by||'').slice(0,24)};}
    else if(r.kind==='kill'){const f=fenetre(r.key);st.seen++;tally(0);delete obs[r.key];net=['seen'];S.live[r.key]={at,lo:f.lo,hi:f.hi,by:String(r.by||'').slice(0,24),told:false};}
    else if(r.kind==='seen'){
      st.seen++;tally(0);delete obs[r.key];net=['seen'];
      // Revu après l'avoir abattu : le délai réel est au plus cet écart. Borne haute.
      if(live){const t=typeOf(type),d=(at-live.at)/1000;
        if(!once&&d>0){(st.hi??=[]).push(borne(d,t));st.hi=st.hi.slice(-24);net[1]=ecart=Math.round(d);}
        delete S.live[r.key];}
    }else if(r.kind==='absent'){if(!live){st.absent++;tally(1);net=['absent'];if(rd&&once)S.live[r.key]={at,lo:0,hi:0,once:true,told:true,empty:true};else if(rd&&!obs[r.key])obs[r.key]={at,hi:fenetre(r.key).hi};}
      // Toujours vide alors que le chrono tourne : le délai réel est plus grand que cet écart. Borne basse.
      else if(!live.once){const t=typeOf(type),d=(at-live.at)/1000;
        if(d>0){(st.lo??=[]).push(borne(d,t));st.lo=st.lo.slice(-24);ecart=Math.round(d);}
        if(at>live.at+(live.hi||0)*1000)live.late=true;}}
    else if(r.kind==='clear'){delete S.live[r.key];delete obs[r.key];}
    save();
    if(!remote){window.AtlasDuo?.send?.({t:'spawn',id:r.id,key:r.key,kind:r.kind,at,by:O.P.name(),raid:rd?.id||raidOn(mapId)?.id||null});
      if(rd?.code&&r.kind!=='clear')O.net?.gameSend?.({id:r.id,key:r.key,kind:r.kind,end:rd.endAt});if(r.kind!=='clear')O.net?.obs?.(r.key,r.kind,ecart,rd?Math.round(ageAt(rd,at)):0,rd?.code||'');}
    return true;
  }
  // Canal de partie : un signalement n'est retenu que si le raider annonce la même carte et la même heure de fin (à 45 s près).
  let gameN=0;
  function gameIn(m,at){
    if(!m||typeof m.key!=='string'||!['seen','absent','kill'].includes(m.kind))return;
    const rd=raidOn(m.key.split('|')[0]);if(!rd||!rd.code||Math.abs(Number(m.end)-rd.endAt)>45000)return;
    if(apply({id:String(m.id||'').slice(0,40),key:m.key,kind:m.kind,at,by:'un autre raider',raid:rd.id},true)===true)repaint();
  }
  function linkGame(){
    const N=O.net;if(!N?.game)return;const rd=raidOn(null),want=rd?.code||'';
    if(N.gameCode()!==want){gameN=0;N.game(want,{msg:gameIn,count:n=>{if(n!==gameN){gameN=n;repaint();}}});}
  }
  // Avis reçu du réseau d'entraide : il nourrit la fiabilité et les délais, pas les chronos (autre raid).
  function fromNet(m){
    if(!m||typeof m.key!=='string'||!['seen','absent'].includes(m.kind))return false;
    const [mapId,type,idx]=m.key.split('|');if(!mapById(mapId)||!typeOf(type)||!points(mapId,type)[Number(idx)])return false;
    const st=stat(m.key),ref=typeOf(type).sec||1e9,d=Number(m.d);
    const b=[0,1,2].includes(m.a)?(st.b??=[[0,0],[0,0],[0,0]])[m.a]:null;if(b)b[m.kind==='seen'?0:1]++;
    if(m.kind==='seen'){st.seen++;if(d>=ref*.5&&d<=ref*3){st.delays.push(Math.round(d));st.delays=st.delays.slice(-12);}}else st.absent++;
    st.net=(st.net||0)+1;save();return true;
  }
  const netLine=()=>{const N=O.net;if(!N||!N.usable)return '';
    return '<p class="sp-net" data-state="'+N.state()+'"><i class="duo-lamp" aria-hidden="true"></i>'+
      (N.on()?'Réseau d’entraide : '+esc(N.label())+(N.got()?' · '+N.got()+' avis reçus':'')+'. Tes signalements nourrissent l’historique des points, jamais tes chronos.'
             :'Réseau d’entraide : '+esc(N.label())+'.')+'</p>';};
  const report=(key,kind)=>apply({id:Date.now().toString(36)+Math.random().toString(36).slice(2,8),key,kind,at:Date.now(),by:O.P.name()});
  window.addEventListener('ops:squad-msg',e=>{const m=e.detail?.m;if(m?.t!=='spawn')return;
    if(m.kind==='sync'){
      const end=Number(m.endAt);if(!mapById(m.map)||typeof m.raid!=='string'||!(end>Date.now())||end>Date.now()+RAID*1000+5000)return;
      if(S.raid?.id===m.raid){const c=cleanCode(m.code);if(Math.abs(S.raid.endAt-end)>2000||(c&&c!==S.raid.code)){S.raid.endAt=end;if(c)S.raid.code=c;save();repaint();}return;}   // recalage du même raid
      if(S.declined===m.raid||S.invite?.id===m.raid)return;
      S.invite={id:m.raid,map:m.map,endAt:end,code:cleanCode(m.code),by:String(m.by||'Un coéquipier').slice(0,24)};save();
      O.toast(S.invite.by+' est en raid sur '+mapById(m.map).short+'. Si tu y es aussi, confirme dans Spawn ARC.');repaint();return;
    }
    const res=apply(m,true);if(res===true){if(m.kind==='kill')O.toast((m.by||'Un raider')+' a abattu : '+labelOf(m.key)+'.');repaint();}});
  const labelOf=key=>{const [mapId,type,i]=key.split('|'),p=points(mapId,type)[Number(i)];return tname(typeOf(type))+' · '+(p?.label||'');};
  const stateOf=(key,now)=>{const l=S.live[key];if(l?.once)return 'gone';
    const w=l?timerOf(key):(raidOn(key.split('|')[0],now)&&S.obs?.[key]?timerOf(key):null);
    if(!w)return 'idle';
    return now<w.at+w.lo*1000?'wait':now<=w.at+w.hi*1000?'window':'due';};
  const ORDER={wait:0,window:1,due:2,idle:3,gone:4},STATE={wait:'retour en cours',window:'vide, retour attendu',due:'peut être revenu',idle:'à vérifier',gone:'ne reviendra pas ce raid'};
  const badge=t=>'<span class="sp-badge" style="--c:'+t.c+'" aria-hidden="true">'+t.ab+'</span>';
  const whenOf=(key,now)=>{const w=timerOf(key);if(!w)return 0;return now<w.at+w.lo*1000?w.at+w.lo*1000:w.at+w.hi*1000;};
  function row(p,now){
    const l=S.live[p.key],st=stateOf(p.key,now),t=typeOf(p.type),tr=trust(p.key),f=t.once?null:fenetre(p.key);
    const rd=raidOn(p.key.split('|')[0],now),o=S.obs?.[p.key],pr=rd&&presence(p.key,rd,now),when=whenOf(p.key,now),nNet=S.stats[p.key]?.net||0;
    const pct=pr?pr.pct:tr&&tr.n>=3?tr.pct:null;
    const detail=(tr?tr.n+' avis sur tous les raids'+(nNet?', dont '+nNet+' d’autres raiders':''):'')+
      (f?'. Retour entre '+dur(f.lo)+' et '+dur(f.hi)+', d’après '+(f.n?f.n+' relevé'+(f.n>1?'s':'')+' sur '+f.source:'la référence'):'');
    const hist=pct!==null?'<small class="sp-hist" title="'+esc(detail)+'"><i class="sp-meter" aria-hidden="true"><i style="width:'+pct+'%"></i></i><b>'+pct+' %</b> présent'+(pr?' à ce stade':'')+' · '+(pr?pr.n:tr.n)+' avis</small>'
      :'<small class="sp-hist" title="'+esc(detail)+'">'+(tr?tr.n+' avis':'Pas encore d’avis')+'</small>';
    const atGame=x=>rd?'<small>'+(x>rd.endAt?'après la fin du raid':'à '+gameClock(rd,x)+' en jeu')+'</small>':'';
    const btn=(kind,label,title,cls='')=>'<button class="btn small'+cls+'" data-act="sp-rep" data-k="'+p.key+'" data-kind="'+kind+'"'+(title?' title="'+title+'"':'')+'>'+label+'</button>';
    const cancel='<button class="icon-btn" data-act="sp-rep" data-k="'+p.key+'" data-kind="clear" aria-label="Annuler" title="Annuler">×</button>';
    const three='<span class="sp-btns">'+btn('seen','Vu','Il est là')+btn('absent','Vide','Rien à cet endroit')+btn('kill','Abattu','Je viens de l’abattre')+'</span>';
    return '<li data-state="'+st+'" data-key="'+p.key+'">'+badge(t)+'<i class="sp-num" aria-hidden="true">'+(p.n||'')+'</i><div><b>'+esc(p.label)+(p.floor&&p.floor!=='Surface'?' <em>'+esc(p.floor)+'</em>':'')+'</b>'+hist+'</div>'+
      (st==='wait'?'<span class="hv-wait"><small>Pas avant</small><b class="mono" data-clock="'+when+'">'+O.mmss(when-now)+'</b>'+atGame(when)+'</span>'+cancel
      :st==='window'?'<span class="hv-wait open"><small>'+(l?'Fenêtre ouverte · avant':'Vide · retour avant')+'</small><b class="mono" data-clock="'+when+'">'+O.mmss(when-now)+'</b>'+atGame(when)+'</span>'+btn('seen','Vu','Il est revenu')+cancel
      :st==='gone'?'<em class="tag">Ne reviendra pas</em>'+cancel
      :st==='due'?'<em class="tag hot">'+(l?.late?'En retard':'Devrait être revenu')+'</em>'+three
      :three)+'</li>';
  }
  // Liste triée par urgence : ce qui bouge maintenant en haut, ce qui est hors jeu en bas.
  function rows(list,now){
    const sorted=list.map(p=>({p,st:stateOf(p.key,now)})).sort((a,b)=>ORDER[a.st]-ORDER[b.st]||whenOf(a.p.key,now)-whenOf(b.p.key,now));
    const groups=[['Chronos en cours',x=>x.st==='wait'||x.st==='window'],['Peut-être revenus',x=>x.st==='due'],['À vérifier',x=>x.st==='idle'],['Ne reviendront pas',x=>x.st==='gone']];
    return groups.map(([title,test])=>{const g=sorted.filter(test);return g.length?'<li class="sp-sep">'+title+' <b>'+g.length+'</b></li>'+g.map(x=>row(x.p,now)).join(''):'';}).join('');
  }
  // Ligne « chrono du jeu » : saisie du temps restant affiché en haut de l'écran du jeu.
  let editClock=false,sansChrono=false;
  function clockLine(mapId){
    const now=Date.now(),rd=raidOn(null,now),here=rd&&rd.map===mapId;
    if(S.invite&&S.invite.endAt<=now){delete S.invite;}
    const inv=S.invite?'<p class="sp-invite"><span><b>'+esc(S.invite.by)+'</b> est en raid sur '+esc(mapById(S.invite.map)?.short||'')+', reste <b class="mono" data-clock="'+S.invite.endAt+'">'+O.mmss(S.invite.endAt-now)+'</b>. Même partie ?</span><button class="btn small primary" data-act="sp-join">J’y suis</button><button class="btn small" data-act="sp-decline">Non</button></p>':'';
    const form=label=>'<label class="sp-sync"><span>'+label+'</span><input type="text" inputmode="numeric" autocomplete="off" maxlength="5" placeholder="mm:ss" aria-label="Temps restant affiché en jeu, minutes et secondes"><button type="button" class="btn small primary" data-act="sp-sync" data-map="'+mapId+'">Caler</button></label>';
    if(here)return '<div class="sp-clock" data-on>'+inv+
      '<p class="sp-time"><b class="mono" data-clock="'+rd.endAt+'" aria-label="Temps restant">'+O.mmss(rd.endAt-now)+'</b><span>restant<small>carte ouverte depuis <b class="mono" data-age="'+rd.endAt+'">'+O.mmss((RAID*1000)-(rd.endAt-now))+'</b></small></span><button class="link" data-act="sp-edit">Recaler</button><button class="link" data-act="sp-unsync">Arrêter</button></p>'+
      (editClock?form('Temps restant en jeu'):'')+
      (rd.code?'<p class="sp-game"><i class="duo-lamp" aria-hidden="true"></i><span>Partie <b class="mono">'+esc(rd.code.slice(0,5))+'…</b> · <b>'+gameN+'</b> raider'+(gameN>1?'s':'')+' du site</span><button class="link" data-act="sp-code-off">Retirer</button></p>'
        :'<label class="sp-codef"><span>Code de partie</span><input type="text" autocomplete="off" spellcheck="false" maxlength="40" placeholder="en bas de l’écran du jeu" aria-label="Code de partie affiché en bas de l’écran du jeu"><button type="button" class="btn small" data-act="sp-code">Relier</button></label>')+'</div>';
    return '<div class="sp-clock">'+inv+form(rd?'Autre raid en cours sur '+esc(mapById(rd.map)?.short||'')+'. Temps restant ici':'Temps restant en jeu')+'</div>';
  }
  const rule=(m,t)=>{const mod=modifier(m);if(t.once)return 'Référence : la '+esc(tname(t))+' ne revient pas une fois abattue. Un point vide le reste jusqu’à la fin du raid.';return 'Référence : retour '+dur(t.sec*mod.f)+' après l’élimination'+(mod.why?' ('+esc(mod.why)+')':'')+', bloqué tant qu’un Raider reste à moins de 50 à 150 m.'+(t.id==='arc-bombardier'?' Tant que le Bombardier vit, ses Observateurs reviennent chaque minute.':'');};

  /* ── Bloc « Gros ARC » de l'écran Sortie ── */
  let raidTab='arc-bastion',lastSync=0;
  // Chrono du jeu : un raid dure 30 min au compteur d'Embark, mais on y entre souvent en cours de route.
  // On cale donc le site sur le temps restant affiché en jeu ; tout le reste se calcule depuis cette heure de fin.
  const RAID=1800,BUCKETS=['0 à 10 min','10 à 20 min','20 à 30 min'];
  const raidOn=(mapId,now=Date.now())=>S.raid&&S.raid.endAt>now&&(!mapId||S.raid.map===mapId)?S.raid:null;
  const ageAt=(r,t)=>RAID-(r.endAt-t)/1000,bucketAt=(r,t)=>Math.max(0,Math.min(2,Math.floor(ageAt(r,t)/600)));
  const gameClock=(r,t)=>O.mmss(r.endAt-t);
  // Un raid a une identité (id). Les chronos ne valent que pour ceux qui ont déclaré être dans CE raid :
  // un coéquipier d'escouade parti sur une autre partie ne doit rien changer aux tiens.
  const newId=()=>'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  const syncMsg=()=>({t:'spawn',kind:'sync',id:'y'+Date.now().toString(36),raid:S.raid.id,map:S.raid.map,endAt:S.raid.endAt,code:S.raid.code||'',by:O.P.name()});
  const cleanCode=v=>{const c=String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'');return c.length>=6&&c.length<=40?c:'';};
  function setRaid(map,endAt,by,remote=false,id,code){
    const old=S.raid,same=old&&(id?old.id===id:old.map===map&&Math.abs(old.endAt-endAt)<90000);
    if(!same){const start=endAt-RAID*1000;             // autre raid : on ne garde que ce qui a été noté depuis son ouverture
      for(const k of Object.keys(S.live))if(S.live[k].at<start||!k.startsWith(map+'|'))delete S.live[k];S.obs={};}
    S.raid={id:id||(same&&old.id)||newId(),map,endAt,by:String(by||'').slice(0,24),code:cleanCode(code)||(same&&old.code)||''};delete S.invite;save();
    if(!remote)window.AtlasDuo?.send?.(syncMsg());
  }
  // Un raid s'arrête d'un seul coup : le chrono du jeu, les retours en cours et les délais mesurés.
  // Tant que ces trois-là vivaient séparément, les chronos continuaient après la sortie.
  function endRaid(mot){
    const quelquechose=S.raid||Object.keys(S.live).length||S.invite;
    delete S.raid;delete S.invite;S.live={};S.obs={};save();
    if(quelquechose){O.changed?.();repaint();if(mot)O.toast(mot);}
  }
  // Lancer une sortie cale le chrono sur la durée annoncée : plus besoin de le taper si on part du site.
  function startRaid(mapId,minutes){
    if(!mapById(mapId))return;
    endRaid();
    setRaid(mapId,Date.now()+Math.min(Math.max(Number(minutes)||30,1),RAID/60)*60000,O.P.name());
    S.raid.setAt=Date.now();save();curMap=mapId;repaint();
  }
  function parseClock(v){
    const t=String(v||'').trim().replace(/[^0-9:.,h ]/g,'');let m,sec;
    if(/[:.,h ]/.test(t)){[m,sec]=t.split(/[:.,h ]+/).map(Number);}else if(t.length>=3){m=Number(t.slice(0,-2));sec=Number(t.slice(-2));}else{m=Number(t);sec=0;}
    if(!Number.isFinite(m)||!Number.isFinite(sec||0)||t==='')return null;const total=m*60+(sec||0);
    return total>0&&total<=RAID&&(sec||0)<60?total:null;
  }
  // Estimation de présence à ce stade du raid : avis rangés par tranche de 10 min, lissage de Laplace.
  function presence(key,r,now){
    const b=S.stats[key]?.b?.[bucketAt(r,now)];if(!b||b[0]+b[1]<3)return null;
    return {pct:Math.round((b[0]+1)/(b[0]+b[1]+2)*100),n:b[0]+b[1]};
  }
  function raidPanel(plan){
    const m=mapById(plan.map),now=Date.now(),sets=TYPES.map(t=>({t,list:points(m.id,t.id)})).filter(x=>x.list.length);
    if(!sets.length)return '<section class="heavy"><h2>Gros ARC</h2><p class="fine">Aucun point de gros ARC n’est relevé sur cette carte.</p></section>';
    if(!sets.some(x=>x.t.id===raidTab))raidTab=sets[0].t.id;const cur=sets.find(x=>x.t.id===raidTab);
    return '<section class="heavy"><h2>Gros ARC <small>'+esc(m.short)+'</small></h2><div class="seg" role="radiogroup" aria-label="Type de gros ARC">'+sets.map(x=>{const run=x.list.filter(p=>stateOf(p.key,now)==='wait').length;return '<button role="radio" aria-checked="'+(x.t.id===raidTab)+'" data-act="sp-raidtab" data-v="'+x.t.id+'">'+esc(tname(x.t))+' <b>'+x.list.length+'</b>'+(run?'<i class="dot"></i>':'')+'</button>';}).join('')+'</div>'+
      clockLine(m.id)+'<ul class="hv-list">'+rows(cur.list,now)+'</ul>'+
      '<div class="row tight"><button class="link" data-act="sp-open" data-map="'+m.id+'">Ouvrir l’onglet Spawn ARC</button><button class="link" data-act="sp-about">D’où viennent ces chiffres ?</button></div></section>';
  }
  async function injectRaid(){
    const v=O.views.raid,plan=O.ops().plan;if(!v?.el||v.result||!plan)return;
    await data();if(!v.el.isConnected||O.ops().plan!==plan)return;
    $('.heavy',v.el)?.remove();
    if(plan.startedAt){const list=$('.live-list',v.el);if(!list)return;const last=[...list.querySelectorAll(':scope>h2')].at(-1);(last||list).insertAdjacentHTML(last?'beforebegin':'beforeend',raidPanel(plan));}
    else if((v.step||1)===3){
      const m=mapById(plan.map),mod=modifier(m),sets=TYPES.map(t=>({t,n:points(m.id,t.id).length})).filter(x=>x.n);if(!sets.length)return;
      $('.step>h2',v.el)?.insertAdjacentHTML('afterend','<section class="heavy brief-hv"><h3>Gros ARC sur cette carte</h3><div class="chips">'+sets.map(x=>'<button class="chip-btn" data-act="sp-open" data-map="'+m.id+'">'+ico('map')+esc(tname(x.t))+' · '+x.n+' point'+(x.n>1?'s':'')+(x.t.once?' · ne revient pas':' · retour '+dur(x.t.sec*mod.f))+'</button>').join('')+'</div></section>');
    }
  }
  const raid=O.views.raid,rr=raid.refresh;raid.refresh=function(){rr.apply(this,arguments);injectRaid();};
  // Démarrer, terminer ou annuler une sortie commande aussi les chronos de spawn.
  for(const nom of ['plan-start','plan-end','plan-cancel']){
    const avant=actions[nom];if(!avant)continue;
    actions[nom]=function(d,el){
      const resultat=avant.call(this,d,el),plan=O.ops().plan;
      if(nom==='plan-start'){if(plan?.startedAt)startRaid(plan.map,plan.minutes);}
      else if(!plan?.startedAt)endRaid();        // fin ou annulation confirmée
      return resultat;
    };
  }

  /* ── Onglet « Spawn ARC » de l'écran Cartes ── */
  let pane=null,curMap=read('speranza.ops.spawns.map'),filter='';
  function drawPane(){
    if(!pane)return;
    const avail=mapsWith();if(!avail.some(m=>m.id===curMap))curMap=(O.ops().plan&&avail.find(m=>m.id===O.ops().plan.map)||avail[0])?.id;
    const m=mapById(curMap),now=Date.now(),md=window.RAID_MAP_DATA.maps.find(x=>x.id===curMap),layer=md.layers[0];
    const all=TYPES.flatMap(t=>points(curMap,t.id)),list=all.filter(p=>!filter||p.type===filter),act=sched.active(m,now);
    all.forEach((p,i)=>p.n=i+1);
    if(O.net?.bornes&&!duServeur['_'+curMap]){duServeur['_'+curMap]=1;chargerBornes(curMap);}                 // même numéro sur le plan et dans la liste, quel que soit le filtre
    const running=all.filter(p=>stateOf(p.key,now)==='wait').length;
    const N=O.net,netChip=!N||!N.usable?'':'<span class="sp-netchip" data-state="'+N.state()+'" title="'+esc(N.label())+'"><i class="duo-lamp" aria-hidden="true"></i>Réseau · '+esc(N.on()?N.count()+' raider'+(N.count()>1?'s':''):N.label())+'</span>';
    pane.innerHTML='<div class="sp-map"><div class="sp-img" style="aspect-ratio:'+layer.width+'/'+layer.height+'"><img src="'+layer.image+'" alt="Plan de '+esc(m.name)+'">'+
        list.filter(p=>p.layer===0).map(p=>{const st=stateOf(p.key,now),t=typeOf(p.type),w=whenOf(p.key,now),name='Point '+p.n+' · '+tname(t)+' · '+p.label+' · '+STATE[st];
          return '<button class="sp-pin" data-act="sp-pick" data-k="'+p.key+'" data-state="'+st+'" style="left:'+p.x+'%;top:'+p.y+'%;--c:'+t.c+'" title="'+esc(name)+'" aria-label="'+esc(name)+'"><i class="sp-num" aria-hidden="true">'+p.n+'</i>'+(st==='gone'?'×':t.ab)+((st==='wait'||st==='window')?'<i class="mono" data-clock="'+w+'">'+O.mmss(w-now)+'</i>':'')+'</button>';}).join('')+'</div></div>'+
      '<div class="sp-side"><div class="sp-head"><label class="field inline">Carte<select data-act="sp-map">'+avail.map(x=>'<option value="'+x.id+'"'+(x.id===curMap?' selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select></label>'+
        '<div class="seg" role="radiogroup" aria-label="Type"><button role="radio" aria-checked="'+(!filter)+'" data-act="sp-filter" data-v="">Tous <b>'+all.length+'</b></button>'+TYPES.map(t=>{const n=points(curMap,t.id).length;return n?'<button role="radio" aria-checked="'+(filter===t.id)+'" data-act="sp-filter" data-v="'+t.id+'">'+badge(t)+esc(tname(t))+' <b>'+n+'</b></button>':'';}).join('')+'</div></div>'+
        clockLine(curMap)+
        (raidOn(curMap,now)||sansChrono?'<ul class="hv-list sp-list">'+rows(list,now)+'</ul>'
          :'<div class="sp-gate"><h3>Cale le chrono du jeu</h3>'+
           '<p>Le temps restant s’affiche en haut de ton écran dans ARC Raiders. Tape-le ici : le site saura depuis combien de temps la carte est ouverte, et te donnera chaque retour d’ARC à l’heure du jeu.</p>'+
           '<p class="fine">Un raid dure 30 minutes, mais on y entre souvent en cours de route — c’est pour ça qu’on ne peut pas le deviner.</p>'+
           '<button class="link" data-act="sp-skip">Je veux juste voir les points pour l’instant</button></div>')+
        '<div class="row tight sp-foot">'+netChip+'<button class="link" data-act="sp-about">D’où viennent ces chiffres ?</button><button class="link" data-act="sp-reset">Effacer mes signalements</button></div></div>';
  }
  function repaint(){
    prune();if(document.activeElement?.matches?.('.sp-sync input,.sp-codef input'))return;
    if(O.current()==='cartes'&&pane&&!pane.hidden&&$('#maps-view')?.dataset.pane==='spawn'){const top=$('.sp-list',pane)?.scrollTop||0;drawPane();const l=$('.sp-list',pane);if(l)l.scrollTop=top;}
    const s=$('.heavy:not(.brief-hv)',raid.el),plan=O.ops().plan;if(s&&plan?.startedAt)s.outerHTML=raidPanel(plan);
  }
  O.spawns={net:fromNet,raid:()=>raidOn(null),async mount(host){await data();if(!pane){pane=document.createElement('section');pane.className='spawn-pane';pane.setAttribute('aria-label','Spawn ARC');host.append(pane);
      // Survoler une ligne éclaire son point sur le plan, et inversement : on sait tout de suite de quel « Complexe de dômes » on parle.
      const lier=e=>{const n=e.target.closest?.('[data-key],[data-k]');const k=n?.dataset.key||n?.dataset.k||'';
        for(const el of pane.querySelectorAll('.sp-pin,.sp-list>li'))el.classList.toggle('lie',!!k&&(el.dataset.k===k||el.dataset.key===k));};
      pane.addEventListener('pointerover',lier);pane.addEventListener('focusin',lier);
      pane.addEventListener('pointerleave',()=>{for(const el of pane.querySelectorAll('.lie'))el.classList.remove('lie');});}const r=raidOn(null);if(r)curMap=r.map;drawPane();},open(map){if(map)curMap=map;},repaint};
  Object.assign(actions,{
    'sp-rep':d=>{
      if(!O.P.active()){O.P.choose();return;}
      if(!report(d.k,d.kind))return;
      O.toast(d.kind==='kill'?labelOf(d.k)+(S.live[d.k].once?' : abattu, il ne reviendra pas ce raid.':' : retour entre '+dur(S.live[d.k].lo)+' et '+dur(S.live[d.k].hi)+'.'):d.kind==='seen'?'Noté : présent. Merci.':d.kind==='absent'?'Noté : rien à cet endroit.':'Chrono annulé.');
      repaint();$('li[data-key="'+d.k+'"] button')?.focus({preventScroll:true});
    },
    'sp-sync':(d,el)=>{
      const inp=el.closest('.sp-sync').querySelector('input'),sec=parseClock(inp.value);
      if(!sec){O.toast('Tape le temps restant comme en jeu, par exemple 24:30 (30:00 au plus).');inp.focus();return;}
      setRaid(d.map,Date.now()+sec*1000,O.P.name());S.raid.setAt=Date.now();save();inp.blur();editClock=false;O.changed?.();
      O.toast('Chrono calé : reste '+O.mmss(sec*1000)+', carte ouverte depuis '+O.mmss((RAID-sec)*1000)+'.');repaint();
    },
    'sp-code':(d,el)=>{const inp=el.closest('.sp-codef').querySelector('input'),c=cleanCode(inp.value);
      if(!c||!S.raid){O.toast('Recopie le code affiché en bas de l’écran du jeu, par exemple p4967-8fkpz-x6mm2.');inp.focus();return;}
      S.raid.code=c;save();inp.blur();linkGame();window.AtlasDuo?.send?.(syncMsg());O.toast('Partie reliée. Les raiders qui tapent le même code partagent leurs chronos avec toi.');repaint();},
    'sp-skip':()=>{sansChrono=true;repaint();},
    'sp-code-off':()=>{if(S.raid){S.raid.code='';save();linkGame();repaint();}},
    'sp-join':()=>{const v=S.invite;if(!v)return;setRaid(v.map,v.endAt,v.by,true,v.id,v.code);curMap=v.map;O.toast('Tu partages maintenant les chronos de ce raid avec '+v.by+'.');repaint();},
    'sp-decline':()=>{if(S.invite){S.declined=S.invite.id;delete S.invite;save();repaint();}},
    'sp-edit':()=>{editClock=!editClock;repaint();if(editClock)$('.sp-sync input',pane)?.focus();},
    'sp-unsync':()=>endRaid('Chrono arrêté. Les retours d’ARC sont remis à zéro.'),
    'sp-raidtab':d=>{raidTab=d.v;repaint();},
    'sp-filter':d=>{filter=d.v;drawPane();},
    'sp-map':(d,el)=>{curMap=el.value;write('speranza.ops.spawns.map',curMap);drawPane();},
    'sp-pick':d=>{const li=$('.sp-list li[data-key="'+d.k+'"]');if(!li)return;li.scrollIntoView({block:'nearest'});li.setAttribute('data-flash','');setTimeout(()=>li.removeAttribute('data-flash'),1200);$('button',li)?.focus({preventScroll:true});},
    'sp-open':async d=>{curMap=d.map;await O.go('cartes');actions['maps-tab']({t:'spawn'});},

    'sp-reset':()=>{if(confirm('Effacer les signalements et délais observés enregistrés sur cet appareil ?')){S={stats:{},live:{},ids:[]};save();repaint();}},
    'sp-about':()=>O.openSheet('<h2>Spawn ARC : ce qu’on sait, ce qu’on mesure</h2>'+
      '<h3>Ce qui est connu</h3><ul class="plain"><li>Bastion, Artificier et Bombardier occupent des points fixes. Ceux du site viennent des cartes communautaires.</li><li>Le jeu ne publie aucun horaire d’apparition, et aucune source consultée ne décrit la première apparition du raid.</li><li>Délais de retour relevés par des joueurs : Bastion 6 min, Bombardier 6 min, Artificier 7 min.</li><li>Au terme du délai, l’apparition est bloquée si un Raider se trouve à environ 50 à 150 m.</li><li>Raid nocturne, Tempête électromagnétique, Bunker caché : 15 % plus rapide. Portail verrouillé, Vague de froid : 10 % plus lent.</li></ul>'+
      '<h3>Ce que le site calcule</h3><ul class="plain"><li><b>Fiabilité d’un point</b> : part des passages où l’ARC était bien là (« Vu » ou « Abattu ») sur l’ensemble des passages signalés.</li><li><b>Délais de référence</b> : Bastion, Bombardier et Bondisseur 6 min, Artificier 7 min, à partir de l’élimination. Le retour est bloqué tant qu’un Raider reste à moins de 50 à 150 m. Tant que le Bombardier vit, ses Observateurs reviennent chaque minute. Si tu entres en cours de raid, un point vide a pu être nettoyé avant toi : marque-le « Vide » pour obtenir son retour au plus tard.</li><li><b>Chrono du jeu</b> : un raid dure 30 min au compteur du jeu, mais on y entre souvent en cours de route. Tu tapes le temps restant affiché en jeu ; le site en déduit l’âge de la carte et donne chaque retour à l’heure du compteur du jeu. Le calage part vers ton escouade.</li><li><b>Bondisseur et Sentinelle</b> : le Bondisseur revient comme un Bastion (6 min de référence, certains joueurs relèvent plutôt 8). La Sentinelle ne revient pas : une fois abattue, son point reste vide jusqu’à la fin du raid.</li><li><b>Chrono après « Abattu »</b> : heure de l’élimination + délai de référence corrigé par l’événement en cours. Si le retour tombe après la fin du raid, c’est écrit.</li><li><b>Fenêtre après « Vide »</b> : l’ARC a été abattu avant ton passage, donc au plus tôt un délai entier avant. Son retour tombe au plus tard un délai après ton constat, sauf zone occupée.</li><li><b>Présence à ce stade du raid</b> : les avis sont rangés par tranche de 10 min de carte. À partir de 3 avis dans la tranche en cours, le site affiche la part de passages où l’ARC était là.</li><li><b>Délai observé</b> : quand un ARC abattu est revu, l’écart est enregistré. À partir de deux mesures, si le retour observé est plus court que la référence, c’est lui qui sert au chrono.</li><li><b>Escouade</b> : quand l’un de vous cale le chrono, les autres voient « Tu es dans la même partie ? ». Seuls ceux qui répondent « J’y suis » partagent les chronos de ce raid. Un coéquipier parti sur une autre partie ne change rien aux tiens.</li><li><b>Code de partie</b> : le jeu affiche un code en bas de l’écran. Si d’autres raiders de ta partie utilisent le site et tapent le même code, vous partagez vos chronos sans être dans la même escouade. Le site vérifie aussi la carte et l’heure de fin du raid. Embark ne documente pas ce code : s’il n’est pas commun aux joueurs d’une même partie, il ne reliera simplement personne.</li><li><b>Historique tous raids</b> : la ligne grise sous chaque point additionne les avis de toutes les parties, les tiennes et celles des autres. Elle dit si un point est souvent occupé, pas ce qui s’y passe maintenant.</li><li><b>Réseau d’entraide</b> : tous les raiders qui ouvrent le site partagent la même base, sans salon ni inscription. Seuls partent les avis qui comptent pour la fiabilité d’un point et les bornes de retour. Les chronos n’y passent pas : un ARC abattu dans un autre raid ne dit rien du tien. Ni pseudo, ni collection, ni position.</li></ul>'+
      '<p class="notice">Les délais de référence sont donnés comme vérifiés au 7 septembre 2026 et peuvent changer avec les patchs. Le chrono indique un « au plus tôt ».</p>'+
      '<h3>Sources</h3><ul class="plain">'+SRC.map(([l,u])=>'<li><a href="'+u+'" target="_blank" rel="noopener noreferrer">'+esc(l)+'</a></li>').join('')+'</ul>',{label:'Spawn ARC'})
  });
  setInterval(()=>{
    const now=Date.now();let hit=false;
    for(const [k,l] of Object.entries(S.live))if(!l.told&&!l.once&&l.at+(l.lo||0)*1000<=now){l.told=true;hit=true;O.toast(labelOf(k)+' : peut être revenu. Confirme quand tu le vois.');}
    if(S.raid&&S.raid.endAt<=now){endRaid('Fin du raid : chronos remis à zéro.');hit=true;}
    linkGame();
    if(S.raid&&now-lastSync>45000){lastSync=now;window.AtlasDuo?.send?.(syncMsg());}
    if(S.raid)for(const el of $$('[data-age]')){const t=O.mmss(RAID*1000-(Number(el.dataset.age)-now));if(el.textContent!==t)el.textContent=t;}
    if(hit){save();repaint();}
  },1000);
  document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches?.('.sp-sync input,.sp-codef input')){e.preventDefault();e.target.parentElement.querySelector('button').click();}});
  window.addEventListener('storage',e=>{if(e.key===KEY){try{S=JSON.parse(e.newValue)||S;}catch{}repaint();}});
  data().then(()=>{if(O.current()==='raid')injectRaid();});
})();
