/* Déplace les commandes en direct dans le tiroir. Remettre les mêmes éléments conserve leurs sélections et leurs écouteurs. */
window.mountRaidFullscreen=function mountRaidFullscreen(host,fillMap){
  const layout=host.querySelector('.rm-layout');
  const drawer=document.createElement('aside');
  drawer.className='fs-drawer';drawer.id='raid-fullscreen-menu';
  drawer.setAttribute('aria-label','Menu de la carte en plein écran');
  drawer.innerHTML='<header><label>Terrain<select data-fs-terrain></select></label><button type="button" data-fs-close-menu aria-label="Fermer le menu">×</button></header><div class="fs-tabs" role="group" aria-label="Outils de la carte"></div><div class="fs-pages"></div><footer></footer>';
  const launch=document.createElement('button');
  launch.type='button';launch.className='fs-drawer-toggle';launch.textContent='☰ Menu carte';
  launch.setAttribute('aria-controls',drawer.id);
  const sections=new Map(),slots=[];
  const controls={
    Plan:['.rm-levelbar','.rm-viewbar','.rm-sources'],
    Repères:['.rm-legend'],
    Schémas:['.missing-shelf','.rh-controls','.rh-destination','.rh-panel','.rh-detail','.rh-map-key'],
    Lieux:['[data-detail]','.rm-index'],
    Parcours:['.rm-path'],
    Position:['.rm-signal','.rm-personal','[data-duo-map]']
  };
  for(const title of Object.keys(controls)){
    const page=document.createElement('section'),tab=document.createElement('button');
    page.hidden=true;page.setAttribute('aria-label',title);
    tab.type='button';tab.textContent=title;tab.dataset.fsTab=title;
    tab.onclick=()=>choose(title);
    drawer.querySelector('.fs-tabs').append(tab);drawer.querySelector('.fs-pages').append(page);
    sections.set(title,{page,tab});
  }
  layout.append(drawer,launch);
  const picker=drawer.querySelector('[data-fs-terrain]');
  for(const map of RAID_MAP_DATA.maps)picker.add(new Option(map.name,map.id));
  picker.onchange=()=>window.RaidMaps.openMap(picker.value);
  const actual=host.querySelector('[data-map-pick]');
  new MutationObserver(()=>{picker.value=actual.value;}).observe(actual,{childList:true});
  function choose(title,changeMode=true){
    for(const [name,{page,tab}] of sections){page.hidden=name!==title;tab.setAttribute('aria-pressed',String(name===title));}
    const mode=title==='Schémas'?'on':title==='Repères'?'off':null;
    const change=mode&&host.querySelector('[data-hunt-mode="'+mode+'"]');
    if(changeMode&&change&&change.getAttribute('aria-pressed')!=='true')change.click();
    drawer.querySelector('.fs-pages').scrollTop=0;
  }
  function opened(value){
    layout.toggleAttribute('data-fs-menu',value);
    launch.setAttribute('aria-expanded',String(value));
    if(!value&&drawer.contains(document.activeElement))launch.focus();
  }
  launch.onclick=()=>{opened(true);picker.focus();};
  drawer.querySelector('[data-fs-close-menu]').onclick=()=>opened(false);
  function move(selector,destination){
    const node=host.querySelector(selector);
    if(!node)return;
    const slot=document.createComment('raid fullscreen');
    node.before(slot);slots.push({slot,node});destination.append(node);
  }
  function enter(){
    if(slots.length)return;
    move('[data-breach-toggle]',drawer.querySelector('header'));
    for(const [title,names] of Object.entries(controls))for(const name of names)move(name,sections.get(title).page);
    move('.rm-map-tools',drawer.querySelector('footer'));
    host.querySelector('[data-full]').textContent='Quitter';
    picker.value=actual.value;
    choose(layout.dataset.hunt==='true'?'Schémas':'Repères');
    opened(innerWidth>=760);
    (innerWidth>=760?picker:launch).focus({preventScroll:true});
    fillMap();
  }
  function leave(){
    for(const {node,slot} of slots.reverse())slot.replaceWith(node);
    slots.length=0;layout.removeAttribute('data-fs-menu');
    host.querySelector('[data-full]').textContent='⛶';
    if(!host.hidden)host.querySelector('[data-full]').focus({preventScroll:true});
  }
  document.addEventListener('fullscreenchange',()=>{
    if(document.fullscreenElement===layout)enter();else if(slots.length)leave();
  });
  window.addEventListener('hashchange',()=>{
    if(document.fullscreenElement===layout&&host.hidden)document.exitFullscreen().catch(()=>{});
  });
  layout.addEventListener('click',event=>{
    if(document.fullscreenElement!==layout)return;
    if(event.target.closest('[data-hunt-zone],[data-poi],[data-self-manual],[data-preset=breaches],[data-breach-toggle]')&&innerWidth<760)opened(false);
    if(event.target.closest('[data-hunt-advice]')){choose('Schémas');opened(true);}
  });
  host.addEventListener('raidmaps:focused',event=>{
    if(document.fullscreenElement!==layout)return;
    if(event.detail==='zone')choose('Schémas');
    if(event.detail==='point')choose('Lieux',false);
  });
};
