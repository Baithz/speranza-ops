(() => {
  'use strict';
  let host, api, session, point, frozen, cursor;
  const $=selector=>host.querySelector(selector);
  const area=()=>$('.rm-personal');
  const active=()=>!!session;
  const live=s=>s===session;
  const chartKey=chart=>chart.map+'/'+chart.layer;
  function publishPoint(value,center){
    api.setPoint(value,center);
    window.dispatchEvent(new CustomEvent('atlas:self-position',{detail:value?{...value}:null}));
  }
  function say(text){
    if($('[data-self-status]').textContent!==text)$('[data-self-status]').textContent=text;
  }
  function nearby(){
    if(!host||!point)return;
    const list=$('[data-self-near]');
    const points=api.nearby(point);
    const signature=JSON.stringify(points);
    if(list.dataset.signature===signature)return;
    const focused=list.contains(document.activeElement)?document.activeElement.dataset.nearId:null;
    list.dataset.signature=signature;list.replaceChildren();
    for(const p of points){
      const b=document.createElement('button');
      b.type='button';b.dataset.nearId=p.id;b.textContent=p.label+' · '+p.direction+' · '+p.grid;
      b.onclick=()=>{pauseFollow();api.focus(p.id);};list.append(b);
    }
    if(!list.children.length)list.textContent='Active une couche ou change ta recherche pour voir les repères proches.';
    if(focused)(Array.from(list.children).find(b=>b.dataset.nearId===focused)||list.firstElementChild||$('[data-self-center]')).focus({preventScroll:true});
  }
  function pauseFollow(){if(point&&session?.type==='live')$('[data-self-follow]').checked=false;}
  function paintState(){
    const s=session;
    host.toggleAttribute('data-self-active',!!s);
    $('[data-self-stop]').hidden=!s;
    $('[data-self-stop]').textContent=s?.type==='idle'?'Quitter le mode personnel':'Arrêter';
    $('[data-self-change]').hidden=!(s?.type==='live'&&s.ready);
    $('[data-self-still]').hidden=!frozen;
    $('[data-self-retake]').hidden=s?.type!=='live';
    $('[data-self-point]').hidden=!point;
    $('[data-self-center]').disabled=!point;
    $('[data-self-start]').disabled=!!s&&s.type==='live';
    const age=point?Math.max(0,Math.floor((Date.now()-point.time)/1000)):0;
    if(point?.fresh && age>=5){point.fresh=false;publishPoint(point,false);}
    const badge=$('[data-self-badge]');
    badge.dataset.state=point?.fresh?'live':point?'last':s?'waiting':'off';
    badge.textContent=point?(point.fresh?'Position lue':s?.type==='manual'?'Position manuelle':s?.type==='file'?'Sur la capture':'Dernière lecture')+' · '+api.grid(point)+' · '+(age<60?age+' s':Math.floor(age/60)+' min'):s?.waiting?'Flèche à identifier':s?.stream?'Fenêtre reliée · recherche de carte':s?.type==='live'?'Connexion en cours':s?'Mode personnel':'Fenêtre non reliée';
    if(point){
      const time=age<60?age+' s':Math.floor(age/60)+' min';
      const origin=s?.type==='manual'?'Placée manuellement':s?.type==='file'?'Lue sur la capture':point.fresh?'Position lue':'Dernière position lue';
      $('[data-self-time]').textContent=origin+' · '+api.grid(point)+' · il y a '+time;
    }
  }
  function discardPreview(){
    frozen?.close();frozen=null;
    const dialog=$('[data-self-dialog]');
    if(dialog.open)dialog.close();
    const c=$('[data-self-preview]');c.width=1;c.height=1;
  }
  function stop(message='Suivi arrêté.',keepPrivate=false){
    const s=session;session=null;
    if(s){
      clearTimeout(s.next);clearInterval(s.clock);
      for(const track of s.stream?.getTracks()||[])track.stop();
      if(s.video){s.video.pause();s.video.srcObject=null;}
      s.worker?.terminate();
      if(s.workerURL)URL.revokeObjectURL(s.workerURL);
      if(s.fileURL)URL.revokeObjectURL(s.fileURL);
    }
    discardPreview();point=null;publishPoint(null);
    const list=$('[data-self-near]');list.replaceChildren();delete list.dataset.signature;
    if(keepPrivate)session={type:'idle',chart:api.chart()};
    say(message);paintState();
  }
  function begin(type){
    stop('');
    const s={type,chart:api.chart(),waiting:false};
    session=s;if(type!=='idle')s.clock=setInterval(paintState,1000);
    $('[data-self-follow]').checked=true;
    const oldNotice=document.getElementById('duoNotice');if(oldNotice)oldNotice.hidden=true;
    paintState();return s;
  }
  function put(s,x,y){
    const first=!point;
    point={map:s.chart.map,layer:s.chart.layer,x,y,time:Date.now(),fresh:s.type==='live',source:s.type};
    publishPoint(point,first||$('[data-self-follow]').checked);
    nearby();paintState();
  }
  function stale(){
    if(point?.fresh){point.fresh=false;publishPoint(point,false);}
    paintState();
  }
  function later(s,delay=point?.fresh?420:850){
    clearTimeout(s.next);
    if(live(s)&&s.type==='live'&&!s.waiting)s.next=setTimeout(()=>scan(s),delay);
  }
  async function scan(s){
    if(!live(s)||s.waiting||s.busy)return;
    const source=s.video||s.image;
    if(s.video){
      const frameCount=s.video.getVideoPlaybackQuality?.().totalVideoFrames;
      if(s.stream.getVideoTracks()[0]?.muted || (frameCount>0 && s.lastFrame===frameCount)){
        if(point&&Date.now()-point.time>4500){stale();say('Image du jeu en pause. La dernière lecture reste indiquée.');}
        later(s);return;
      }
      s.lastFrame=frameCount;
    }
    const width=s.video?source.videoWidth:source.naturalWidth;
    const height=s.video?source.videoHeight:source.naturalHeight;
    if(!width||!height){later(s);return;}
    s.busy=true;
    try{
      const scale=Math.min(1,1080/width,1000/height);
      const image=await createImageBitmap(source,{resizeWidth:Math.max(1,Math.round(width*scale)),resizeHeight:Math.max(1,Math.round(height*scale)),resizeQuality:'medium'});
      if(!live(s)){image.close();return;}
      s.worker.postMessage({type:'scan',image,searchOthers:s.surveyReady},[image]);
    }catch{if(live(s))stop('Cette image ne peut pas être lue. Essaie une capture PNG ou le placement manuel.',true);}
  }
  function drawPreview(){
    if(!frozen)return;
    const c=$('[data-self-preview]'),ctx=c.getContext('2d');
    c.width=frozen.width;c.height=frozen.height;ctx.drawImage(frozen,0,0);
    if(cursor){
      const x=cursor.x*c.width,y=cursor.y*c.height;
      ctx.beginPath();ctx.arc(x,y,10,0,2*Math.PI);ctx.strokeStyle='#101919';ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle='#9fffe7';ctx.lineWidth=1;ctx.stroke();
    }
  }
  function preview(){
    if(!frozen)return;
    const d=$('[data-self-dialog]');
    drawPreview();if(!d.open)d.showModal();$('[data-self-preview]').focus();
  }
  function result(s,msg){
    if(!live(s)){msg.preview?.close();return;}
    if(msg.kind==='candidate-ready'){loadCandidate(s);return;}
    if(msg.kind==='chart'){
      const chart=s.charts.find(c=>chartKey(c)===msg.key);
      if(chart){point=null;publishPoint(null,false);s.chart=chart;api.adoptChart(chart);paintState();}
      return;
    }
    s.busy=false;
    if(s.retake){msg.preview?.close();s.retake=false;resetArrow(s);return;}
    switch(msg.kind){
      case 'ready': s.ready=true;paintState();say('Ouvre la carte du jeu pour reconnaître le terrain.');scan(s);return;
      case 'identify':
        discardPreview();frozen=msg.preview;cursor={x:.5,y:.5};s.waiting=true;
        stale();say(msg.reason==='jump'?'Le marqueur a changé brusquement de zone. Confirme ta flèche sur l’image.':msg.reason==='ambiguous'?'Deux flèches se ressemblaient. Confirme la tienne pour reprendre le suivi.':'Terrain reconnu · '+s.chart.name+'. Identifie ta flèche sur l’image figée.');paintState();
        $('[data-self-pick-note]').textContent='Clique au centre de ta flèche colorée sur le terrain. Le clavier permet aussi de la viser.';
        if(!document.querySelector('dialog[open]')&&!document.hidden)preview();
        return;
      case 'bad-pick':
        $('[data-self-pick-note]').textContent='Flèche non reconnue ici. Vise son centre, à l’écart de la légende et des panneaux.';
        say('Choisis ta flèche colorée dans la zone centrale du terrain.');return;
      case 'uncertain-pick':
        $('[data-self-pick-note]').textContent='Plusieurs symboles correspondent. Centre ta flèche seule en jeu et reprends une image, ou utilise le placement manuel.';
        say('Identification incertaine. Le suivi automatique attend ta confirmation.');return;
      case 'found':
        discardPreview();s.waiting=false;put(s,msg.x,msg.y);
        say(s.type==='file'?'Position retrouvée sur cette image.':'Ta position se met à jour lorsque la carte du jeu est lisible.');break;
      case 'no-map':
        stale();
        if(!s.surveyStarted){
          s.surveyStarted=true;s.candidates=s.charts.filter(c=>chartKey(c)!==chartKey(s.chart));
          say('Recherche du terrain et de l’étage parmi les plans locaux…');loadCandidate(s);
        }else if(s.surveyReady){
          say(s.type==='file'?'Cette image ne correspond pas suffisamment à un des plans. Essaie une capture de la carte ouverte avec plus de terrain visible.':'En attente de la carte du jeu. Rouvre-la pour obtenir une nouvelle lecture.');
        }
        break;
      case 'missing':case 'ambiguous':
        discardPreview();s.waiting=false;stale();
        say(msg.kind==='ambiguous'?'Plusieurs symboles se ressemblent. Centre ta flèche en jeu pour reprendre la lecture.':'Flèche non retrouvée. Ramène-la au milieu de la carte du jeu, hors des panneaux.');break;
      default:stop('La reconnaissance locale a échoué. Essaie une autre capture ou le placement manuel.',true);return;
    }
    paintState();later(s);
  }
  async function loadCandidate(s){
    if(!live(s))return;
    const chart=s.candidates.shift();
    if(!chart){
      s.surveyReady=true;s.lastFrame=null;
      if(!s.waiting&&!s.busy){clearTimeout(s.next);scan(s);}
      return;
    }
    try{
      const ref=new Image();ref.src=await window.atlasCleanImage(chart.image);await ref.decode();
      if(!live(s))return;
      const image=await createImageBitmap(ref);
      if(!live(s)){image.close();return;}
      s.worker.postMessage({type:'candidate',key:chartKey(chart),image},[image]);
    }catch{if(live(s))loadCandidate(s);}
  }
  async function prepare(s){
    const ref=new Image();ref.src=await window.atlasCleanImage(s.chart.image);await ref.decode();
    if(!live(s))return;
    const blob=new Blob([loadPositionFeatures.toString(),'\n(',runPositionEngine.toString(),')();'],{type:'text/javascript'});
    s.workerURL=URL.createObjectURL(blob);s.worker=new Worker(s.workerURL);
    s.worker.onmessage=e=>result(s,e.data);
    s.worker.onerror=()=>{if(live(s))stop('Analyse locale indisponible dans ce navigateur. Le placement manuel reste accessible.',true);};
    const image=await createImageBitmap(ref);
    if(!live(s)){image.close();return;}
    s.charts=api.charts();
    s.worker.postMessage({type:'reference',key:chartKey(s.chart),image},[image]);
    say('Préparation du plan de référence sur ton appareil…');
  }
  async function start(file){
    if(!window.Worker||!window.OffscreenCanvas||!window.createImageBitmap||(!file&&!navigator.mediaDevices?.getDisplayMedia)){
      stop('Capture indisponible ici. Essaie Chrome ou Edge sur PC, une image de carte ou le placement manuel.',true);return;
    }
    const s=begin(file?'file':'live');
    try{
      if(file){
        s.fileURL=URL.createObjectURL(file);s.image=new Image();s.image.src=s.fileURL;await s.image.decode();
      }else{
        say('Sélectionne la fenêtre ARC Raiders dans le sélecteur du navigateur.');
        const stream=await navigator.mediaDevices.getDisplayMedia({video:{displaySurface:'window',frameRate:{ideal:4,max:6}},audio:false,selfBrowserSurface:'exclude'});
        if(!live(s)){stream.getTracks().forEach(t=>t.stop());return;}
        s.stream=stream;
        const track=stream.getVideoTracks()[0];if(!track)throw Error();
        track.addEventListener('ended',()=>{if(live(s))stop('Le partage de fenêtre est terminé. Le mode personnel reste actif.',true);});
        s.video=document.createElement('video');s.video.muted=true;s.video.playsInline=true;s.video.srcObject=stream;await s.video.play();
      }
      if(live(s))await prepare(s);
    }catch(err){
      if(live(s))stop(err.name==='NotAllowedError'?'Partage annulé ou refusé. Tu peux réessayer ou te placer à la main.':'Fenêtre ou image illisible. Essaie une capture de la carte ouverte ou le placement manuel.',true);
    }
  }
  function identify(){
    if(!frozen||!cursor||!session?.waiting||session.busy)return;
    session.busy=true;
    session.worker.postMessage({type:'identify',...cursor});
  }
  function resetArrow(s){
    if(!s?.ready)return;
    if(s.busy){s.retake=true;return;}
    discardPreview();s.waiting=false;s.lastFrame=null;clearTimeout(s.next);
    s.worker.postMessage({type:'reset'});stale();
    say('Ouvre ta carte en jeu pour identifier ta flèche.');scan(s);
  }
  function mount(el,adapter){
    host=el;api=adapter;
    const box=document.createElement('section');box.className='rm-personal';
    box.innerHTML=`<div class="rm-self-body"><h3>Ma position</h3><p>Partage la fenêtre du jeu, ouvre la carte en raid et désigne ta flèche sur l’image. Le terrain et l’étage sont reconnus sur ton PC. Carte fermée, le dernier point garde l’heure de sa lecture. Les coéquipiers partagent chacun leur propre lecture. Les flèches indiquent une position, pas l’orientation du personnage.</p>
      <div data-self-point hidden><div class="rm-self-actions"><strong data-self-time></strong><button type="button" data-self-center>Recentrer sur moi</button><label><input type="checkbox" data-self-follow checked> Suivre ma position</label></div>
      <h4>Autour de moi</h4><p>Repères les plus proches parmi les couches ou les résultats affichés, à vol d’oiseau.</p><div data-self-near></div></div></div>
      <dialog data-self-dialog aria-label="Identifier ma propre flèche"><header><strong>Où est ta flèche sur cette capture ?</strong><button type="button" data-self-dismiss>Fermer</button></header>
      <p data-self-pick-note></p><canvas data-self-preview tabindex="0" aria-label="Capture figée. Clique sur ta flèche ou déplace le viseur avec les flèches du clavier, Maj pour accélérer, puis Entrée."></canvas>
      <div class="rm-self-actions"><button type="button" data-self-confirm>Valider le viseur</button><button type="button" data-self-retake>Reprendre une image</button></div></dialog>`;
    (el.querySelector('.rm-viewport') || el.querySelector('.rm-stage')).after(box);
    el.querySelector('.rm-boardhead').insertAdjacentHTML('afterend',`<section class="rm-signal" aria-label="Ma position"><div class="rm-signal-id"><span class="rm-kicker">MA POSITION</span><strong data-self-badge></strong></div>
      <div class="rm-self-actions"><button type="button" data-self-start>Relier ma fenêtre de jeu</button><button type="button" data-self-file-button>Lire une capture</button><input type="file" data-self-file accept="image/*" hidden><button type="button" data-self-manual>Placer à la main</button><button type="button" data-self-stop hidden>Arrêter le suivi</button><button type="button" data-self-still hidden>Identifier ma flèche</button><button type="button" data-self-change hidden>Réidentifier ma flèche</button></div><p data-self-status role="status"></p></section>`);
    $('[data-self-start]').onclick=()=>start(null);
    $('[data-self-file-button]').onclick=()=>$('[data-self-file]').click();
    $('[data-self-file]').onchange=e=>{const file=e.target.files[0];e.target.value='';if(file)start(file);};
    $('[data-self-stop]').onclick=()=>stop();
    $('[data-self-manual]').onclick=()=>{
      const s=begin('manual');s.placing=true;
      say('Clique sur ta position dans l’atlas. Au clavier, déplace la carte et appuie sur Entrée pour utiliser son centre.');api.focusCanvas();
    };
    $('[data-self-center]').onclick=()=>{if(point){$('[data-self-follow]').checked=true;publishPoint(point,true);}};
    $('[data-self-follow]').onchange=e=>{if(point&&e.target.checked)publishPoint(point,true);};
    $('[data-self-still]').onclick=preview;
    $('[data-self-change]').onclick=$('[data-self-retake]').onclick=()=>resetArrow(session);
    $('[data-self-dismiss]').onclick=()=>$('[data-self-dialog]').close();
    $('[data-self-confirm]').onclick=identify;
    const c=$('[data-self-preview]');
    c.onclick=e=>{
      const r=c.getBoundingClientRect();cursor={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};
      drawPreview();identify();
    };
    c.onkeydown=e=>{
      if(!frozen)return;
      const d=e.shiftKey?12:1, step={ArrowLeft:[-d,0],ArrowRight:[d,0],ArrowUp:[0,-d],ArrowDown:[0,d]}[e.key];
      if(step){cursor.x=Math.max(0,Math.min(1,cursor.x+step[0]/frozen.width));cursor.y=Math.max(0,Math.min(1,cursor.y+step[1]/frozen.height));drawPreview();e.preventDefault();}
      if(e.key==='Enter'){e.preventDefault();identify();}
    };
    say('Chaque joueur relie sa fenêtre pour partager sa position. Le partage se règle dans Escouade.');paintState();
  }
  function place(p){
    if(!session?.placing)return false;
    if(!(p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1)){say('Clique à l’intérieur du terrain.');return true;}
    session.placing=false;put(session,p.x,p.y);say('Position placée sur cet appareil.');return true;
  }
  function mapChanged(id,layer){
    if(session&&(session.chart.map!==id||session.chart.layer!==layer))stop('Plan changé. Le mode personnel reste actif. Relance le suivi sur ce terrain ou étage.',true);
  }
  function openPrivate(){
    if(!host)return;
    if(!session){begin('idle');say('Mode personnel actif. Choisis comment placer ton marqueur.');}
    paintState();
    const button=$('[data-self-start]');
    if(!button.disabled)button.focus({preventScroll:true});
    button.closest('.rm-signal').scrollIntoView({block:'nearest'});
  }
  window.addEventListener('pagehide',()=>{if(session)stop();});
  window.addEventListener('atlas:profiles',e=>{if(session&&e.detail?.reason==='profile')stop('Profil changé : relance ton suivi.');});
  window.AtlasSelf={mount,active,snapshot:()=>point?{...point}:null,diagnostics:()=>({mode:session?.type||'off',windowShared:!!session?.stream,position:point?{...point}:null}),place,mapChanged,pauseFollow,openPrivate,refreshNearby:nearby};
})();
