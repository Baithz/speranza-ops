/* Speranza Ops — Réseau d'entraide (jusqu'à 100 raiders).
   Désactivé par défaut. Une fois rejoint, le site échange par un relais public (ntfy.sh) :
   • un « je suis là » anonyme toutes les 6 min, pour compter les raiders reliés ;
   • les signalements de spawn qui comptent pour la fiabilité d'un point (vu / vide / délai mesuré).
   Rien d'autre : ni pseudo, ni collection, ni position. Les chronos restent sur l'escouade,
   car chaque raid est une instance à part. Les messages sont chiffrés (AES-GCM) avec la clé
   livrée dans network-config.js. */
(() => {
  'use strict';
  const O=window.OPS,{$,esc,read,write,actions}=O,C=window.OPS_NETWORK||{};
  const KEY='speranza.ops.net.v1',MAX=C.max||100,ROOMS=C.rooms||10,HI=6*60000,WINDOW=13*60000,GAP=4000,DAILY=180,VOTE=20*60000;
  let st={on:false,u:'',room:1,lastId:'',lastTime:0,day:'',sent:0,ids:[],got:0};
  try{Object.assign(st,JSON.parse(read(KEY))||{});}catch{}
  if(!st.u){st.u=[...crypto.getRandomValues(new Uint8Array(8))].map(b=>b.toString(16).padStart(2,'0')).join('');}
  const save=()=>write(KEY,JSON.stringify(st));
  const usable=!!(C.topic&&C.key&&window.crypto?.subtle&&window.EventSource&&window.fetch);
  let es=null,state='off',offset=0,retry=0,retryT=0,hiT=0,pauseUntil=0,lastSend=0,queue=[],pumpT=0,paintT=0,readyAt=0,lastSig='';
  const peers=new Map(),votes=new Map(),burst=new Map();
  const now=()=>Date.now()+offset;
  // Salons de 100 : quand le salon est plein à l'arrivée, on passe au suivant. Chacun garde ensuite le sien.
  const topic=()=>C.topic+(st.room>1?'-'+st.room:'');
  let seated=false;
  const count=()=>{const t=now();let n=0;for(const [u,at] of peers){if(t-at>WINDOW)peers.delete(u);else n++;}return n+(state==='on'||state==='full'?1:0);};

  // Chiffrement
  let keyP=null;
  const b64=a=>btoa(String.fromCharCode(...a)),unb=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const key=()=>keyP??=crypto.subtle.importKey('raw',unb(C.key),'AES-GCM',false,['encrypt','decrypt']);
  async function seal(o){const iv=crypto.getRandomValues(new Uint8Array(12)),ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(),new TextEncoder().encode(JSON.stringify(o))));const out=new Uint8Array(12+ct.length);out.set(iv);out.set(ct,12);return b64(out);}
  async function open(s){const a=unb(s);return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:a.slice(0,12)},await key(),a.slice(12))));}

  // Envoi : file d'attente, 1 message toutes les 4 s, plafond quotidien, pause si le relais sature.
  const today=()=>new Date().toISOString().slice(0,10);
  function budget(){if(st.day!==today()){st.day=today();st.sent=0;}return st.sent<DAILY;}
  function push(tp,o){if(queue.length>=20)queue.shift();queue.push({tp,o});pump();return true;}
  function send(o){return state==='on'&&push(topic(),o);}
  function pump(){
    clearTimeout(pumpT);if(!queue.length)return;
    const t=Date.now(),wait=Math.max(pauseUntil-t,lastSend+GAP-t,0);
    if(wait>0){pumpT=setTimeout(pump,wait+50);return;}
    if(!budget()){queue=[];return;}
    const {tp,o}=queue.shift();lastSend=t;st.sent++;save();
    seal(Object.assign({v:1,u:st.u},o)).then(body=>fetch(C.relay+'/'+tp,{method:'POST',body})).then(r=>{
      if(r.status===429){pauseUntil=Date.now()+(Number(r.headers.get('Retry-After'))*1000||15*60000);paint();}
    }).catch(()=>{}).finally(()=>{if(queue.length)pumpT=setTimeout(pump,GAP);});
  }
  const hello=()=>{if(state==='on')send({t:'hi'});};

  // Réception
  async function receive(d){
    if(!d||d.event!=='message'||typeof d.message!=='string')return;
    if(d.time<st.lastTime||st.ids.includes(d.id))return;
    st.ids.push(d.id);if(st.ids.length>400)st.ids.splice(0,150);st.lastId=d.id;st.lastTime=d.time;
    let m;try{m=await open(d.message);}catch{save();return;}
    if(!m||m.v!==1||typeof m.u!=='string'||m.u.length>32){save();return;}
    const at=d.time*1000;
    if(m.u!==st.u&&at>(peers.get(m.u)||0))peers.set(m.u,at);
    if(m.t==='obs'&&m.u!==st.u&&typeof m.k==='string'&&m.k.length<80){
      // Un avis par raider et par point toutes les 20 min, 30 avis par heure au plus.
      const vk=m.u+'|'+m.k,b=(burst.get(m.u)||[]).filter(x=>at-x<3600000);
      if(at-(votes.get(vk)||0)>=VOTE&&b.length<30){
        votes.set(vk,at);b.push(at);burst.set(m.u,b);
        if(O.spawns?.net?.({key:m.k,kind:m.s,d:m.d,a:m.a})){st.got++;}
      }
    }
    save();paint();
  }
  function connect(){
    if(es){es.close();es=null;}
    if(!st.on||!usable)return;
    state='connecting';paint();
    const fresh=st.lastId&&Date.now()/1000-st.lastTime<11*3600;
    es=new EventSource(C.relay+'/'+topic()+'/sse?since='+(fresh?st.lastId:'12h'));
    const sync=e=>{try{const d=JSON.parse(e.data);if(d.time)offset=d.time*1000-Date.now();}catch{}};
    es.addEventListener('open',e=>{
      sync(e);retry=0;readyAt=Date.now()+6000;
      // On laisse 6 s au relais pour rejouer les présences avant de décider si le réseau est plein.
      const mine=es;setTimeout(()=>{
        if(es!==mine||!st.on)return;
        if(!seated&&count()>=MAX){
          if(st.room<ROOMS){st.room++;st.lastId='';st.lastTime=0;st.ids=[];save();peers.clear();votes.clear();connect();return;}
          state='full';paint();return;
        }
        seated=true;state='on';paint();hello();
      },6000);
    });
    es.addEventListener('keepalive',e=>{sync(e);if(state==='full'&&count()<MAX){seated=true;state='on';hello();}paint();});
    es.onmessage=e=>{try{receive(JSON.parse(e.data));}catch{}};
    es.onerror=()=>{if(!es)return;es.close();es=null;state='lost';paint();clearTimeout(retryT);retryT=setTimeout(connect,Math.min(15000*2**retry++,300000));};
  }
  function join(){st.on=true;save();connect();clearInterval(hiT);hiT=setInterval(()=>{if(!document.hidden)hello();paint();},HI);}
  function leave(){queue=queue.filter(x=>x.tp!==topic());seated=false;st.room=1;st.lastId='';st.lastTime=0;st.ids=[];st.on=false;save();clearInterval(hiT);clearTimeout(retryT);if(es){es.close();es=null;}state='off';peers.clear();paint();}

  // Canal de partie : les raiders qui tapent le même code de partie partagent leurs chronos.
  // Le code seul ne suffit pas : spawns.js vérifie aussi la carte et l'heure de fin du raid.
  const G={code:'',es:null,peers:new Map(),seen:new Set(),on:null,retry:0,t:0,hi:0};
  const fnv=(str,h)=>{for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0');};
  const gtopic=()=>C.topic+'-g'+fnv(G.code,2166136261)+fnv(G.code+'|'+C.key,40389);
  const gcount=()=>{const t=now();let n=1;for(const [u,at] of G.peers){if(t-at>7*60000)G.peers.delete(u);else n++;}return n;};
  function gconnect(){
    if(G.es){G.es.close();G.es=null;}if(!G.code||!usable)return;
    const mine=G.es=new EventSource(C.relay+'/'+gtopic()+'/sse?since=40m');
    mine.addEventListener('open',e=>{try{const d=JSON.parse(e.data);if(d.time)offset=d.time*1000-Date.now();}catch{}G.retry=0;push(gtopic(),{t:'hi'});});
    mine.onmessage=async e=>{
      let d,m;try{d=JSON.parse(e.data);if(d.event!=='message'||G.seen.has(d.id))return;G.seen.add(d.id);m=await open(d.message);}catch{return;}
      if(G.es!==mine||!m||m.v!==1||typeof m.u!=='string'||m.u===st.u)return;
      const at=d.time*1000;if(at>(G.peers.get(m.u)||0))G.peers.set(m.u,at);
      if(m.t==='g')G.on?.msg?.(m,at-offset);
      G.on?.count?.(gcount());
    };
    mine.onerror=()=>{if(G.es!==mine)return;mine.close();G.es=null;clearTimeout(G.t);G.t=setTimeout(gconnect,Math.min(15000*2**G.retry++,120000));};
  }
  function game(code,on){
    code=String(code||'');if(code===G.code){G.on=on||G.on;return;}
    clearTimeout(G.t);clearInterval(G.hi);if(G.es){G.es.close();G.es=null;}
    queue=queue.filter(x=>!G.code||x.tp!==gtopic());
    G.code=code;G.on=on||null;G.peers.clear();G.seen.clear();G.retry=0;
    if(code){gconnect();G.hi=setInterval(()=>{if(!document.hidden&&G.es)push(gtopic(),{t:'hi'});G.on?.count?.(gcount());},3*60000);}
  }

  // Affichage
  const label=()=>!usable?'Indisponible ici':state==='on'?(Date.now()<pauseUntil?'Relié · envoi en pause quelques minutes':(st.room>1?'Salon '+st.room+' · ':'')+count()+' raider'+(count()>1?'s':'')+' relié'+(count()>1?'s':'')):state==='full'?'Tous les salons sont pleins : tu reçois sans émettre':state==='connecting'?'Connexion…':state==='lost'?'Injoignable pour l’instant, nouvel essai en cours':'Non rejoint';
  function box(){
    return '<section class="net-box" aria-labelledby="netTitle"><h3 id="netTitle">Réseau d’entraide <small>salons de '+MAX+' raiders</small></h3>'+
      '<p class="net-state" data-state="'+state+'" role="status"><i class="duo-lamp" aria-hidden="true"></i>'+esc(label())+(st.got?' · '+st.got+' signalement'+(st.got>1?'s':'')+' reçu'+(st.got>1?'s':''):'')+'</p>'+
      '<label class="own"><input type="checkbox" data-act="net-on"'+(st.on?' checked':'')+(usable?'':' disabled')+'><span>Rejoindre le réseau</span></label>'+
      '<p class="fine">Des avis de spawn anonymes, partagés entre raiders. Ni pseudo, ni schémas.</p></section>';
  }
  function paint(){
    clearTimeout(paintT);paintT=setTimeout(()=>{
      const b=$('#duoOpen');
      if(b){const show=state==='on'||state==='full';
        // Attributs plutôt qu'un élément : squad.js réécrit le contenu du bouton à chaque rafraîchissement.
        if(show)b.dataset.netN=String(count());else delete b.dataset.netN;
        b.dataset.net=state;b.title=show?'Réseau d’entraide : '+label():'';
        const al=b.getAttribute('aria-label')||'Escouade',base=al.split(' · Réseau')[0],want=show?base+' · Réseau d’entraide : '+label():base;if(al!==want)b.setAttribute('aria-label',want);}
      const dlg=$('#squadDialog');
      if(dlg?.open){const old=dlg.querySelector('.net-box'),foc=old?.contains(document.activeElement);
        const t=document.createElement('template');t.innerHTML=box();const el=t.content.firstElementChild;
        if(old)old.replaceWith(el);else dlg.querySelector('.pd')?.append(el);
        if(foc)el.querySelector('input')?.focus({preventScroll:true});}
      const sig=state+count()+'/'+st.got+(Date.now()<pauseUntil);if(sig!==lastSig){lastSig=sig;if(!document.activeElement?.matches?.('.spawn-pane select'))O.spawns?.repaint?.();}
    },400);
  }
  // squad.js réécrit le bouton et la fenêtre : on y remet le réseau à chaque fois.
  const watch=(el,test)=>el&&new MutationObserver(()=>{if(test())paint();}).observe(el,{childList:true});
  window.addEventListener('DOMContentLoaded',()=>{
    watch($('#duoOpen'),()=>(state==='on'||state==='full')&&!($('#duoOpen').getAttribute('aria-label')||'').includes('Réseau'));
    $('#duoOpen')?.addEventListener('click',()=>setTimeout(paint,0));
    if(st.on)join();else paint();
  });
  window.addEventListener('beforeunload',()=>{if(es)es.close();if(G.es)G.es.close();});
  actions['net-on']=(d,el)=>{el.checked?join():leave();O.toast(el.checked?'Réseau d’entraide rejoint.':'Réseau d’entraide quitté.');};
  O.net={
    box,usable,on:()=>st.on,state:()=>state,count,label,got:()=>st.got,
    // Appelé par spawns.js pour chaque signalement local qui a compté.
    game,gameCode:()=>G.code,gameCount:gcount,gameSend:o=>!!(G.code&&G.es)&&push(gtopic(),Object.assign({t:'g'},o)),
    obs:(key,kind,d,a)=>send(Object.assign({t:'obs',k:key,s:kind},d?{d}:{},a!=null?{a}:{})),
    _test:{seal,open,receive}
  };
})();
