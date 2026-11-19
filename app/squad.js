/* Escouade : chacun crée la sienne ou en rejoint une avec un code. Trois raiders au plus.
   Échanges entre navigateurs : pseudo, schémas acquis et en trop, repères, spawns, chrono du raid. */
(() => {
'use strict';
const O=window.OPS,{$,esc,read,write,P,actions}=O,known=new Set(O.BP.map(b=>b.id));
const codeKey='speranza.ops.squad.code',ALPHA='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const cleanCode=v=>{const c=String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');return c.length===8&&[...c].every(x=>ALPHA.includes(x))?c:'';};
const showCode=c=>c?c.slice(0,4)+'-'+c.slice(4):'';
let code=cleanCode(read(codeKey)),slots=[];
const setSlots=()=>{slots=code?[1,2,3].map(i=>'speranza-ops-sq-'+code.toLowerCase()+'-'+i):[];};setSlots();
const memKey='speranza.ops.squad.members.v2',slotKey='speranza.ops.squad.slot',onKey='speranza.ops.squad.on',followKey='speranza.ops.squad.follow',shareKey='speranza.ops.squad.share-position',colors=['#7ce9ef','#f4c36d','#ca9bff'];
let members={};try{const m=JSON.parse(read(memKey));if(m&&m.code===code&&m.list&&typeof m.list==='object')members=m.list;}catch{}
const saveMembers=()=>write(memKey,JSON.stringify({code,list:members}));
let peer=null,mySlot=-1,state='off',signal='off',generation=0,tries=0,retry=0,restart=0,loading=null,lastPing=null,errorCode='',localPoint=null,sequence=0;
const conns=new Map(),pending=new Map(),remote=new Map(),lastSeen=new Map(),versions=new Map(),lastSequence=new Map();
const enabled=()=>read(onKey)!=='off',sharing=()=>read(shareKey)!=='off',online=()=>[...conns.values()].filter(c=>c.open).length;
const group=()=>{let n=2166136261;for(const c of slots.join('|'))n=Math.imul(n^c.charCodeAt(0),16777619);return (n>>>0).toString(16).padStart(8,'0').toUpperCase();};
const hello=()=>({t:'hello',v:2,app:window.OPS_RELEASE?.version,name:P.name(),game:P.gameName(),owned:P.owned(),spare:P.spare()});
const broadcast=m=>{for(const c of conns.values())if(c.open)try{c.send(m);}catch{}};
const changed=()=>window.dispatchEvent(new CustomEvent('atlas:squad-positions'));
const age=p=>Math.max(0,Date.now()-p.time);
function positions(){return [...remote].filter(([i])=>conns.get(i)?.open).map(([slot,p])=>({...p,slot,color:colors[slot],name:members[slot]?.name||'Raider '+(slot+1),fresh:p.source==='live'&&p.fresh&&age(p)<5000}));}
function validPoint(p){
 if(!p||!O.mapById(p.map)||!Number.isInteger(p.layer)||p.layer<0||p.layer>4||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>1||p.y<0||p.y>1)return false;
 const map=window.RAID_MAP_DATA?.maps.find(m=>m.id===p.map);if(map&&!map.layers[p.layer])return false;
 return ['live','manual','file'].includes(p.source)&&typeof p.fresh==='boolean'&&Number.isFinite(p.ageMs)&&p.ageMs>=0&&p.ageMs<=86400000;
}
function positionPacket(){const p=localPoint;return {t:'position',v:2,seq:++sequence,point:sharing()&&p?{map:p.map,layer:p.layer,x:p.x,y:p.y,source:p.source||'manual',fresh:!!p.fresh,ageMs:Math.min(86400000,age(p))}:null};}
const status=()=>!P.active()?'Choisis ton profil.':!code?'Pas encore d’escouade.':state==='off'?'Escouade en pause.':state==='connecting'?'Connexion…':state==='full'?'Cette escouade est complète : trois raiders y sont déjà.':state==='error'?'Connexion impossible pour l’instant. Nouvel essai en cours.':online()?(online()+1)+' raiders reliés.':'En attente de tes coéquipiers.';
function paint(){
 const b=$('#duoOpen'),n=online();b.dataset.state=state==='on'?(n?'linked':'waiting'):state;b.innerHTML='<i class="duo-lamp" aria-hidden="true"></i><span>Escouade'+(state==='on'?' '+(n+1)+'/3':'')+'</span>';b.setAttribute('aria-label','Escouade : '+status());
 const radio=document.querySelector('[data-duo-map]');if(radio)radio.textContent='Escouade · '+(state==='on'?(n?(n+1)+' reliés':'en attente'):'hors ligne');
 if(dialog.open)drawDialog();changed();
}
function receive(slot,m){
 if(!m||typeof m!=='object')return;lastSeen.set(slot,Date.now());if(m.t==='heartbeat')return;
 if(m.t==='spawn'){window.dispatchEvent(new CustomEvent('ops:squad-msg',{detail:{slot,m}}));return;}
 if(m.t==='hello'||m.t==='col'){
  if(!Array.isArray(m.owned)||m.owned.length>known.size||!m.owned.every(id=>known.has(id)))return;
  const name=String(m.name||'').replace(/\s+/g,' ').trim().slice(0,24)||'Raider '+(slot+1);
  const sp=Array.isArray(m.spare)&&m.spare.length<=known.size&&m.spare.every(id=>known.has(id))?[...new Set(m.spare)]:[];
  members[slot]={name,owned:[...new Set(m.owned)],spare:sp,at:Date.now()};versions.set(slot,{protocol:m.v===2?2:1,app:String(m.app||'ancienne version').slice(0,32)});saveMembers();O.changed();paint();
 }else if(m.t==='position'){
  if(m.v!==2||!Number.isSafeInteger(m.seq)||m.seq<0||m.seq<=(lastSequence.get(slot)??-1))return;
  if(m.point!==null&&!validPoint(m.point))return;lastSequence.set(slot,m.seq);
  if(m.point===null)remote.delete(slot);else remote.set(slot,{map:m.point.map,layer:m.point.layer,x:m.point.x,y:m.point.y,source:m.point.source,fresh:m.point.fresh,time:Date.now()-m.point.ageMs});paint();
 }else if(m.t==='ping'){
  const text=window.RaidMaps?.describePing?.(m.point);if(!text)return;
  const who=members[slot]?.name||'Raider '+(slot+1);lastPing={point:m.point,who};window.RaidMaps.markPing(m.point,who);
  if(read(followKey)!=='off'&&O.current()==='cartes'&&!document.querySelector('dialog[open]')&&!window.AtlasSelf?.active?.())window.RaidMaps.revealPing(m.point,who);
  notice(who+' signale : '+text,true);
 }
}
function accept(conn,token){
 const slot=slots.indexOf(conn.peer);if(slot<0||slot===mySlot||token!==generation){conn.close();return;}
 const cleanup=()=>{if(pending.get(slot)?.conn===conn)pending.delete(slot);if(conns.get(slot)===conn){conns.delete(slot);remote.delete(slot);lastSequence.delete(slot);lastSeen.delete(slot);paint();}};
 conn.on('open',()=>{if(token!==generation){conn.close();return;}const old=conns.get(slot);if(old&&old!==conn&&old.open){conn.close();return;}pending.delete(slot);conns.set(slot,conn);lastSeen.set(slot,Date.now());lastSequence.delete(slot);try{conn.send(hello());conn.send(positionPacket());}catch{}paint();});
 conn.on('data',m=>{if(token===generation&&conns.get(slot)===conn)receive(slot,m);});conn.on('close',cleanup);conn.on('error',()=>{conn.close();cleanup();});
}
function reach(){
 if(!peer||peer.destroyed||peer.disconnected||state!=='on')return;
 for(let i=0;i<slots.length;i++){
  // Un seul initiateur par paire : pas de canaux simultanés en concurrence.
  if(i<=mySlot||conns.get(i)?.open)continue;const wait=pending.get(i);if(wait&&Date.now()-wait.at<12000)continue;
  if(wait){pending.delete(i);try{wait.conn.close();}catch{}}
  try{const c=peer.connect(slots[i],{reliable:true,serialization:'json'});pending.set(i,{conn:c,at:Date.now()});accept(c,generation);}catch{}
 }
}
function scheduleStart(){clearTimeout(restart);if(enabled())restart=setTimeout(start,10000);}
function dispose(){
 generation++;clearInterval(retry);clearTimeout(restart);for(const c of conns.values())try{c.close();}catch{}for(const p of pending.values())try{p.conn.close();}catch{}
 conns.clear();pending.clear();remote.clear();lastSeen.clear();lastSequence.clear();const old=peer;peer=null;try{old?.destroy();}catch{}
}
function stop(){dispose();state='off';signal='off';paint();}
async function start(){
 if(!enabled()||!P.active()||slots.length!==3||peer||state==='connecting')return;
 const token=++generation;state='connecting';signal='connecting';errorCode='';paint();
 try{await (loading??=O.load('vendor/peerjs.min.js'));}catch{loading=null;if(token!==generation)return;state='error';errorCode='library';paint();scheduleStart();return;}
 if(token!==generation||!enabled())return;const saved=Number(read(slotKey));mySlot=Number.isInteger(saved)&&saved>=0&&saved<slots.length?saved:0;tries=0;open(token);
}
function open(token){
 const p=peer=new window.Peer(slots[mySlot],{debug:0,...(window.OPS_SQUAD?.peerOptions||{})});
 p.on('open',()=>{if(token!==generation||p!==peer)return;state='on';signal='on';errorCode='';write(slotKey,String(mySlot));paint();reach();clearInterval(retry);retry=setInterval(reach,4000);});
 p.on('connection',c=>accept(c,token));
 p.on('disconnected',()=>{if(token!==generation||p!==peer)return;signal='reconnecting';paint();clearTimeout(restart);restart=setTimeout(()=>{if(token!==generation||p!==peer)return;try{p.reconnect();}catch{dispose();state='error';paint();scheduleStart();}},3000);});
 p.on('error',err=>{
  if(token!==generation||p!==peer)return;if(err.type==='peer-unavailable')return;errorCode=String(err.type||'network').slice(0,48);
  if(err.type==='unavailable-id'){peer=null;p.destroy();if(++tries>=slots.length){state='full';signal='off';paint();scheduleStart();return;}mySlot=(mySlot+1)%slots.length;open(token);return;}
  if(state!=='on'){dispose();state='error';signal='off';paint();scheduleStart();}else{signal='error';paint();}
 });
}
function ping(point){if(!online()){notice('Repère non envoyé : aucun autre raider relié.');return;}broadcast({t:'ping',point});notice('Repère envoyé à l’escouade.');}
let noticeTimer;function notice(text,reveal=false){const box=$('#duoNotice');$('#duoNoticeText').textContent=text;$('#duoReveal').hidden=!reveal;box.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>box.hidden=true,reveal?20000:5000);}
$('#duoDismiss').onclick=()=>$('#duoNotice').hidden=true;
$('#duoReveal').onclick=async()=>{if(!lastPing)return;$('#duoNotice').hidden=true;await window.openAtlasMap(lastPing.point.map);window.RaidMaps.revealPing(lastPing.point,lastPing.who);};
function positionText(p){if(!p)return 'Position non partagée';return (p.source==='manual'?'Placement manuel':p.source==='file'?'Capture importée':p.fresh&&age(p)<5000?'Position lue':'Dernière lecture')+' · '+(O.mapById(p.map)?.short||p.map)+' · étage '+p.layer+' · '+Math.floor(age(p)/1000)+' s';}
const dialog=document.createElement('dialog');dialog.id='squadDialog';dialog.setAttribute('aria-labelledby','squadTitle');document.body.append(dialog);
function drawDialog(){
 const focus=dialog.contains(document.activeElement)?document.activeElement.dataset.act:null,typed=dialog.querySelector('#squadCode')?.value||'';
 let body;
 if(!code){
  body='<p>Crée ton escouade et donne le code à tes coéquipiers, ou rejoins la leur. Trois raiders au plus.</p>'+
   '<div class="row"><button class="btn primary" data-act="squad-create">Créer mon escouade</button></div>'+
   '<label class="pd-new">Rejoindre avec un code<span><input type="text" id="squadCode" maxlength="9" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD-2345"><button type="button" class="btn" data-act="squad-join">Rejoindre</button></span></label>';
 }else{
  const rows=slots.map((_,i)=>{const me=i===mySlot,m=me?{name:P.name(),game:P.gameName(),owned:P.owned(),spare:P.spare()}:members[i],live=me?state==='on':!!conns.get(i)?.open;
   return '<li data-live="'+live+'"><i class="dot" style="background:'+colors[i]+'"></i><div><b>'+esc(m?.name||'Place libre')+(me?' (toi)':'')+'</b><small>'+esc(m?(live?'Relié':'Hors ligne')+' · '+(m.owned?.length||0)+' schémas'+(m.spare?.length?' · '+m.spare.length+' en trop':''):'En attente')+'</small></div></li>';}).join('');
  body='<p role="status">'+esc(status())+'</p>'+
   '<div class="sq-code"><span>Code de l’escouade</span><b>'+showCode(code)+'</b><button class="btn small" data-act="squad-copy">Copier</button></div>'+
   '<ul class="squad">'+rows+'</ul>'+
   '<div class="row"><button class="btn primary" data-act="trade">Échanges</button><button class="btn" data-act="compare">Comparer les schémas</button>'+(state==='error'||state==='full'?'<button class="btn" data-act="squad-retry">Réessayer</button>':'')+'</div>'+
   '<label class="own"><input type="checkbox" data-act="squad-follow"'+(read(followKey)!=='off'?' checked':'')+'><span>Centrer ma carte sur les repères reçus</span></label>'+
   '<p><button class="link" data-act="squad-leave">Quitter l’escouade</button></p>';
 }
 dialog.innerHTML='<div class="pd"><button class="pd-x" data-act="squad-close" aria-label="Fermer">×</button><h2 id="squadTitle">Escouade</h2>'+body+(O.net?.box?.()||'')+'</div>';
 const inp=dialog.querySelector('#squadCode');if(inp){inp.value=typed;if(focus==='squad-join'||document.activeElement===document.body&&typed)inp.focus();}
 if(focus)[...dialog.querySelectorAll('[data-act]')].find(x=>x.dataset.act===focus)?.focus({preventScroll:true});
}
function useCode(next){
 stop();code=next;if(code)write(codeKey,code);else try{localStorage.removeItem(codeKey);}catch{}
 setSlots();members={};saveMembers();mySlot=-1;try{localStorage.removeItem(slotKey);}catch{}
 versions.clear();O.changed();if(code){write(onKey,'on');start();}paint();
}
Object.assign(actions,{'squad-close':()=>dialog.close(),'squad-follow':(d,el)=>write(followKey,el.checked?'on':'off'),'squad-retry':()=>{stop();start();},
 'squad-create':()=>{const r=crypto.getRandomValues(new Uint8Array(8));useCode([...r].map(x=>ALPHA[x%32]).join(''));O.toast('Escouade créée. Donne le code à tes coéquipiers.');},
 'squad-join':()=>{const inp=dialog.querySelector('#squadCode'),c=cleanCode(inp?.value);if(!c){O.toast('Code incomplet : 8 caractères, comme ABCD-2345.');inp?.focus();return;}useCode(c);O.toast('Escouade rejointe.');},
 'squad-leave':()=>{if(confirm('Quitter cette escouade ? Tu pourras la rejoindre à nouveau avec son code.'))useCode('');},
 'squad-copy':async()=>{try{await navigator.clipboard.writeText(showCode(code));O.toast('Code copié : '+showCode(code));}catch{O.toast('Code : '+showCode(code));}}});
dialog.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='squadCode'){e.preventDefault();actions['squad-join']();}});
dialog.addEventListener('click',e=>{if(e.target===dialog||e.target.closest('[data-act=compare],[data-act=trade]'))dialog.close();});$('#duoOpen').onclick=()=>{drawDialog();if(!dialog.open)dialog.showModal();};
let sendTimer;
window.addEventListener('atlas:profiles',({detail})=>{if(detail?.reason==='profile'){localPoint=null;broadcast(positionPacket());if(!P.active()){stop();return;}if(!peer)start();}clearTimeout(sendTimer);sendTimer=setTimeout(()=>broadcast({...hello(),t:'col'}),400);paint();});
window.addEventListener('atlas:self-position',({detail})=>{localPoint=detail?{...detail}:null;broadcast(positionPacket());paint();});
window.addEventListener('online',()=>{if(!peer){state='off';start();}else reach();});
window.addEventListener('pagehide',()=>{broadcast({t:'position',v:2,seq:++sequence,point:null});dispose();});
setInterval(()=>{for(const [slot,c] of conns){if(versions.get(slot)?.protocol!==1&&Date.now()-(lastSeen.get(slot)||0)>30000){c.close();conns.delete(slot);remote.delete(slot);paint();}}broadcast({t:'heartbeat',v:2});},5000);
setInterval(()=>{if(remote.size)changed();},1000);
window.AtlasDuo={send:broadcast,active:()=>state==='on',ping,refresh:paint,collectionStatus:status,join:v=>{const c=cleanCode(v);if(!c)return false;useCode(c);return true;},members:()=>slots.map((_,i)=>i===mySlot?null:members[i]&&{...members[i],live:!!conns.get(i)?.open}).filter(m=>m&&Array.isArray(m.owned)),code:()=>code,positions,diagnostics:()=>({state,signal,group:group(),slot:mySlot,connected:online(),sharing:sharing(),version:window.OPS_RELEASE?.version,error:errorCode,peers:[...conns].map(([slot,c])=>({slot,open:c.open,name:members[slot]?.name,version:versions.get(slot),position:positionText(remote.get(slot))}))})};
paint();window.addEventListener('load',()=>setTimeout(start,1000));
})();
