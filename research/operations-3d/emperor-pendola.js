(() => {
  'use strict';
  const data=window.OPS_EMPEROR_EVIDENCE,el=id=>document.getElementById(id);
  let active='outside',angle=0;
  const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);return b;};
  function showFrame(i){
    angle=i;const f=data[active].frames[i];el('reference').src='references/'+f.file;el('reference').alt=f.alt;
    el('credit').textContent='Capture de jeu · '+f.credit;el('source').href=f.source;
    [...el('angles').children].forEach((b,k)=>b.setAttribute('aria-pressed',String(k===i)));
  }
  function select(id,updateHash=true){
    if(!Object.hasOwn(data,id))id='outside';active=id;const d=data[id];
    for(const key of ['title','location','landmark','constraint','unresolved'])el(key).textContent=d[key];
    [...el('places').children].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===id)));
    el('angles').replaceChildren(...d.frames.map((f,i)=>button(f.label,()=>showFrame(i))));
    el('related').replaceChildren(...d.related.map(k=>button(data[k].title,()=>select(k))));
    showFrame(0);if(updateHash)history.replaceState(null,'','#'+id);
  }
  for(const [id,d]of Object.entries(data)){const b=button(d.title,()=>select(id));b.dataset.id=id;el('places').append(b);}
  el('reference').addEventListener('error',()=>{el('credit').textContent='Capture indisponible · ouvrir la source ci-contre';});
  addEventListener('hashchange',()=>select(location.hash.slice(1),false));
  select(location.hash.slice(1),false);
})();
