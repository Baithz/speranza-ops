/* Une seule liste pour les deux points d'entrée. La possession vient toujours du joueur actif. */
window.mountMissingShelf=function mountMissingShelf(before,currentMap=()=>null){
  const section=document.createElement('section');
  section.className='missing-shelf';
  const heading=document.createElement('h2'), toggle=document.createElement('button');
  const header=document.createElement('header'),list=document.createElement('div');
  list.className='missing-cards';
  list.id=before.closest('#maps-view')?'map-missing-items':'home-missing-items';
  toggle.type='button';toggle.setAttribute('aria-controls',list.id);
  header.append(heading,toggle);section.append(header,list);before.before(section);
  let expanded=false,previous='',lastRole='';
  const maps=window.RAID_MAP_DATA.maps;
  const shortNames={'dam-battleground':'Barrage','the-spaceport':'Port spatial','buried-city':'Ville enfouie','blue-gate':'Portail bleu','pendola-pass':'Pendola','riven-tides':'Riven Tides'};
  function render(){
    const role=AtlasProfiles.active(),map=currentMap(),collection=AtlasProfiles.snapshot();
    const signature=[role,map?.id,collection.owned.join(','),collection.pins.join(','),expanded].join('|');
    if(signature===previous)return;
    if(role!==lastRole){expanded=false;lastRole=role;}
    previous=signature;
    const missing=window.BLUEPRINTS.filter(item=>!collection.owned.includes(item.id));
    const preferred=new Set(collection.pins);
    missing.sort((a,b)=>Number(preferred.has(b.id))-Number(preferred.has(a.id))||a.position-b.position);
    section.hidden=!role;
    heading.textContent=missing.length?'Mes schémas manquants · '+missing.length:'Collection complète';
    toggle.hidden=missing.length<=3;
    toggle.setAttribute('aria-expanded',String(expanded));
    toggle.textContent=expanded?'Réduire la liste':'Voir les '+missing.length;
    const focusId=list.contains(document.activeElement)?document.activeElement.dataset.missingItem:'';
    list.replaceChildren();
    if(!missing.length){list.textContent='Tous les schémas de '+role+' sont acquis.';return;}
    for(const item of (expanded?missing:missing.slice(0,3))){
      const locations=(item.locations||[]).filter(l=>l.type==='raid'&&maps.some(m=>m.name===l.map));
      const place=locations.find(l=>l.map===map?.name)||locations[0];
      const raid=(item.routes||[]).some(r=>r.type==='raid');
      const destination=maps.find(m=>m.name===place?.map);
      const button=document.createElement('button'),picture=document.createElement('img');
      const copy=document.createElement('span'),name=document.createElement('strong'),hint=document.createElement('small');
      button.type='button';button.dataset.missingItem=item.id;
      picture.src=item.image;picture.alt='';picture.loading='lazy';
      name.textContent=item.name;
      hint.textContent=raid?'Localiser · '+(shortNames[destination?.id]||destination?.name||'Conditions de raid')+' ↗':(item.routes?.[0]?.title||'Voir la fiche')+' ↗';
      copy.append(name,hint);button.append(picture,copy);list.append(button);
      button.onclick=()=>{
        if(raid)window.openAtlasBlueprintMap(item.id,destination?.id,true);
        else window.openAtlasBlueprint(item.id);
      };
    }
    if(focusId)(list.querySelector('[data-missing-item="'+CSS.escape(focusId)+'"]')||toggle).focus({preventScroll:true});
  }
  toggle.onclick=()=>{expanded=!expanded;render();};
  window.addEventListener('atlas:profiles',render);
  render();
  return {section,refresh:render};
};
