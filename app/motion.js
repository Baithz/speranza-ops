/* Speranza Ops — mouvement : la page réagit à la souris, au clic et au défilement.
   Tout passe par des transformations et des variables CSS : aucune mise en page ne bouge,
   aucun contenu n'est masqué en attendant une animation. Coupé si « animations réduites »
   ou si le réglage « Effets de mouvement » est décoché. */
(() => {
  'use strict';
  const O=window.OPS,{$,$$,read,write,actions}=O,root=document.documentElement;
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const on=()=>read('speranza.ops.motion')!=='off'&&!O.reduced();
  const sync=()=>root.toggleAttribute('data-motion',on());
  sync();new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-reduce-motion']});
  actions['motion-fx']=(d,el)=>{write('speranza.ops.motion',el.checked?'on':'off');sync();};
  O.motionOn=on;

  /* Souris : halo d'ambiance, relief des cartes, profondeur du bandeau */
  const TILT='.card,.threat,.gun,.surf,.pl-node,.map-pick button,.op-pick button,.stepper [role=tab]';
  let px=0,py=0,frame=0,tilted=null;
  function paint(){
    frame=0;
    root.style.setProperty('--mx',px+'px');root.style.setProperty('--my',py+'px');
    const hero=$('.view:not([hidden]) :is(.brief,.debrief,.live)');
    if(hero){const r=hero.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){hero.style.setProperty('--hx',((px-r.left)/r.width-.5).toFixed(3));hero.style.setProperty('--hy',((py-r.top)/r.height-.5).toFixed(3));}}
    if(tilted){const r=tilted.getBoundingClientRect(),x=(px-r.left)/r.width,y=(py-r.top)/r.height,k=Math.min(1,160/Math.max(r.width,r.height));
      tilted.style.setProperty('--rx',((.5-y)*7*k).toFixed(2)+'deg');tilted.style.setProperty('--ry',((x-.5)*9*k).toFixed(2)+'deg');
      tilted.style.setProperty('--gx',(x*100).toFixed(1)+'%');tilted.style.setProperty('--gy',(y*100).toFixed(1)+'%');}
  }
  function untilt(){if(tilted){tilted.removeAttribute('data-tilt');for(const k of ['--rx','--ry','--gx','--gy'])tilted.style.removeProperty(k);tilted=null;}}
  document.addEventListener('pointermove',e=>{
    if(!on()||!fine.matches||e.pointerType!=='mouse'){untilt();return;}
    px=e.clientX;py=e.clientY;
    const t=e.target.closest?.(TILT)||null;
    if(t!==tilted){untilt();tilted=t;t?.setAttribute('data-tilt','');}
    if(!frame)frame=requestAnimationFrame(paint);
  },{passive:true});
  document.addEventListener('pointerleave',untilt);window.addEventListener('blur',untilt);

  /* Clic : onde depuis le point touché */
  document.addEventListener('pointerdown',e=>{
    if(!on())return;
    const t=e.target.closest?.('.btn,.card,.surf,.threat,.gun,.pl-node,.loot-row,.dock a,.map-pick button,.op-pick button,.seg button,.tabs [role=tab],.stepper [role=tab],.chip-btn');
    if(!t||t.disabled)return;
    const r=t.getBoundingClientRect(),w=document.createElement('span'),size=Math.max(r.width,r.height)*2.2;
    w.className='ripple';w.style.cssText='left:'+(e.clientX-r.left)+'px;top:'+(e.clientY-r.top)+'px;width:'+size+'px;height:'+size+'px';
    const host=document.createElement('span');host.className='ripple-host';host.append(w);t.append(host);
    w.addEventListener('animationend',()=>host.remove(),{once:true});setTimeout(()=>host.remove(),900);
  },{passive:true});

  /* Défilement : entrée des éléments, profondeur du bandeau, barre du haut */
  const REVEAL='.card,.surf,.loot-row,.panel,.step,.threat,.gun,.pl-node,.targets li,.kit-list li';
  const seen=new WeakSet();let batch=[],batchFrame=0;
  const io=new IntersectionObserver(entries=>{
    for(const en of entries){
      if(!en.isIntersecting)continue;io.unobserve(en.target);
      if(on()&&en.target.isConnected)batch.push(en.target);
    }
    if(batch.length&&!batchFrame)batchFrame=requestAnimationFrame(()=>{
      batchFrame=0;
      batch.sort((a,b)=>{const p=a.getBoundingClientRect(),q=b.getBoundingClientRect();return p.top-q.top||p.left-q.left;}).slice(0,40)
        .forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(18px) scale(.97)'},{opacity:1,transform:'none'}],{duration:420,delay:Math.min(i*28,360),easing:'cubic-bezier(.2,.75,.2,1)',fill:'backwards'}));
      batch=[];
    });
  },{rootMargin:'0px 0px -4% 0px'});
  let scanFrame=0;
  const scan=()=>{scanFrame=0;for(const el of $$(REVEAL,$('#stage')))if(!seen.has(el)&&!el.closest('[hidden]')){seen.add(el);io.observe(el);}};
  new MutationObserver(()=>{if(!scanFrame)scanFrame=requestAnimationFrame(scan);}).observe($('#stage'),{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
  scan();
  let sFrame=0;
  const onScroll=()=>{sFrame=0;const y=scrollY;root.style.setProperty('--sy',Math.min(y,600).toFixed(0));$('.top').toggleAttribute('data-scrolled',y>8);};
  window.addEventListener('scroll',()=>{if(!sFrame)sFrame=requestAnimationFrame(onScroll);},{passive:true});onScroll();

  /* Chiffres qui montent quand ils changent */
  const nums=new WeakMap();
  function count(el){
    const m=el.textContent.trim().match(/^(\d+)(.*)$/s);if(!m)return;
    const to=Number(m[1]),from=nums.get(el)??0;nums.set(el,to);
    if(!on()||from===to||to>9999)return;
    const tail=el.innerHTML.replace(/^\s*\d+/,''),t0=performance.now(),dur=600;
    const tick=t=>{const k=Math.min(1,(t-t0)/dur),v=Math.round(from+(to-from)*(1-Math.pow(1-k,3)));if(!el.isConnected)return;el.innerHTML=v+tail;if(k<1)requestAnimationFrame(tick);};
    el.innerHTML=from+tail;requestAnimationFrame(tick);
  }
  const countAll=()=>{if(O.current()==='accueil')for(const el of $$('#v-accueil .ring b, #v-accueil .surf-c b'))count(el);};
  const original=O.views.accueil.refresh;O.views.accueil.refresh=function(){original.call(this);countAll();};
})();
