/* Speranza Ops — profils libres. Remplace l'ancien module à deux pseudos fixes.
   Chaque profil a son pseudo, sa collection, ses objectifs et ses notes, sur cet appareil.
   L'API window.AtlasProfiles reste celle qu'attendent les moteurs (cartes, chasse aux schémas). */
(() => {
  'use strict';
  const items=window.BLUEPRINTS,ids=items.map(i=>i.id),known=new Set(ids);
  const read=k=>{try{return localStorage.getItem(k);}catch{return null;}};
  const write=(k,v)=>{try{localStorage.setItem(k,v);return true;}catch{return false;}};
  const drop=k=>{try{localStorage.removeItem(k);}catch{}};
  const indexKey='speranza.ops.profiles.v1',colKey=id=>'speranza.ops.col.v1.'+id;
  const cleanName=n=>String(n??'').replace(/\s+/g,' ').trim().slice(0,24);
  const cleanGame=v=>String(v??'').replace(/[\u0000-\u001f]/g,'').trim().slice(0,32);
  const validIds=a=>Array.isArray(a)&&a.every(id=>known.has(id));
  const storedIds=a=>Array.isArray(a)&&a.every(id=>typeof id==='string');
  let index={active:null,list:[]};const cache=new Map();
  try{const v=JSON.parse(read(indexKey));if(v&&Array.isArray(v.list))index={active:v.active,list:v.list.filter(p=>p&&typeof p.id==='string'&&cleanName(p.name)).map(p=>({id:p.id,name:cleanName(p.name),game:cleanGame(p.game)}))};}catch{}
  const blank=()=>({owned:[],pins:[],spare:[],notes:{},savedAt:null});
  function load(id){
    if(cache.has(id))return cache.get(id);
    let d=blank();
    try{const v=JSON.parse(read(colKey(id)));if(v&&storedIds(v.owned)&&storedIds(v.pins)&&v.notes&&!Array.isArray(v.notes)&&typeof v.notes==='object')d={owned:[...new Set(v.owned)],pins:[...new Set(v.pins)],spare:storedIds(v.spare)?[...new Set(v.spare)]:[],notes:v.notes,savedAt:v.savedAt||null};}catch{}
    cache.set(id,d);return d;
  }
  const store=id=>write(colKey(id),JSON.stringify(cache.get(id)));
  const saveIndex=()=>write(indexKey,JSON.stringify(index));
  // Reprise des deux profils de l'ancien atlas, s'ils existent dans ce navigateur.
  if(read(indexKey)===null){
    for(const name of ['MadGix','Baithz']){
      try{
        const old=JSON.parse(read('speranza.collections.v4.'+name));
        if(!old||typeof old.bits!=='string'||old.bits.length!==ids.length)continue;
        index.list.push({id:name,name});
        cache.set(name,{spare:[],owned:ids.filter((_,i)=>old.bits[i]==='1'),pins:validIds(old.pins)?old.pins:[],notes:old.notes&&typeof old.notes==='object'?old.notes:{},savedAt:old.savedAt||null});
        store(name);
      }catch{}
    }
    const was=read('speranza.collections.v4.active');
    index.active=index.list.some(p=>p.id===was)?was:(index.list[0]?.id||null);
    if(index.list.length)saveIndex();
  }
  if(!index.list.some(p=>p.id===index.active))index.active=index.list[0]?.id||null;
  const active=()=>index.active;
  const name=(id=index.active)=>index.list.find(p=>p.id===id)?.name||'';
  // Pseudo tel qu'il s'affiche dans ARC Raiders : c'est lui qui permet de se retrouver en jeu
  // pour un échange. Les noms d'Embark acceptent espaces, accents et chiffres.
  const gameName=(id=index.active)=>index.list.find(p=>p.id===id)?.game||'';
  function setGameName(raw){
    const p=index.list.find(p=>p.id===index.active);if(!p)return false;
    const g=cleanGame(raw);if(raw&&!g&&String(raw).trim())return false;
    if(g)p.game=g;else delete p.game;
    saveIndex();emit(p.id,'game');return true;
  }
  const emit=(changedRole,reason)=>window.dispatchEvent(new CustomEvent('atlas:profiles',{detail:{role:index.active,changedRole,reason}}));
  const owned=(id=index.active)=>id?load(id).owned.filter(x=>known.has(x)):[];
  const has=(bp,id=index.active)=>!!id&&load(id).owned.includes(bp);
  const snapshot=(id=index.active)=>{const d=id?load(id):blank();return {owned:d.owned.filter(x=>known.has(x)),pins:d.pins.filter(x=>known.has(x)),notes:{...d.notes},savedAt:d.savedAt};};
  function setOwned(bp,value){
    const id=index.active;if(!id||!known.has(bp)||typeof value!=='boolean')return false;
    const d=load(id),on=d.owned.includes(bp);if(on===value)return true;
    d.owned=value?[...d.owned,bp]:d.owned.filter(x=>x!==bp);d.savedAt=new Date().toISOString();
    const ok=store(id);emit(id,'owned');return ok;
  }
  // Schémas en trop : exemplaires en double, proposés à l'échange.
  const spare=(id=index.active)=>id?(load(id).spare||[]).filter(x=>known.has(x)):[];
  function setSpare(bp,value){
    const id=index.active;if(!id||!known.has(bp)||typeof value!=='boolean')return false;
    const d=load(id);d.spare??=[];if(d.spare.includes(bp)===value)return true;
    d.spare=value?[...d.spare,bp]:d.spare.filter(x=>x!==bp);d.savedAt=new Date().toISOString();
    const ok=store(id);emit(id,'spare');return ok;
  }
  // Remplace toute la collection d'un coup (import par capture).
  function replaceOwned(list){
    const id=index.active;if(!id||!validIds(list))return false;
    const d=load(id);d.owned=[...new Set([...list,...d.owned.filter(x=>!known.has(x))])];d.savedAt=new Date().toISOString();
    const ok=store(id);emit(id,'owned');return ok;
  }
  function savePrivate(m){
    const id=index.active;if(!id||!validIds(m.pins)||!m.notes||typeof m.notes!=='object')return false;
    const d=load(id);d.pins=[...new Set([...m.pins,...d.pins.filter(x=>!known.has(x))])];d.notes={...m.notes};d.savedAt=new Date().toISOString();return store(id);
  }
  function create(raw){
    const n=cleanName(raw);if(!n)return null;
    if(index.list.some(p=>p.name.toLowerCase()===n.toLowerCase()))return null;
    const id='p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    index.list.push({id,name:n});cache.set(id,blank());store(id);index.active=id;saveIndex();emit(id,'profile');return id;
  }
  function select(id){if(!index.list.some(p=>p.id===id))return;index.active=id;saveIndex();emit(id,'profile');}
  function rename(raw){
    const n=cleanName(raw),p=index.list.find(p=>p.id===index.active);
    if(!p||!n||index.list.some(o=>o!==p&&o.name.toLowerCase()===n.toLowerCase()))return false;
    p.name=n;saveIndex();emit(p.id,'rename');return true;
  }
  function remove(){
    const id=index.active;if(!id)return;
    index.list=index.list.filter(p=>p.id!==id);cache.delete(id);drop(colKey(id));drop('speranza.ops.v1.'+id);
    index.active=index.list[0]?.id||null;saveIndex();emit(index.active,'profile');
    if(!index.active)choose();
  }

  /* ── Fenêtre de choix / création ── */
  const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dialog=document.createElement('dialog');dialog.id='profileDialog';dialog.setAttribute('aria-labelledby','profileDialogTitle');document.body.append(dialog);
  function draw(error=''){
    const first=!index.list.length;
    dialog.innerHTML='<form method="dialog" class="pd">'+(first?'':'<button class="pd-x" value="close" aria-label="Fermer">×</button>')+
      '<h2 id="profileDialogTitle">'+(first?'Bienvenue à Speranza':'Qui joue ?')+'</h2>'+
      (first?'<p>Choisis ton pseudo de raider. Ta collection, tes objectifs et ton journal seront rangés sous ce nom, sur cet appareil.</p>':'<div class="pd-list">'+index.list.map(p=>'<button type="button" data-pick="'+esc(p.id)+'" aria-pressed="'+(p.id===index.active)+'"><b>'+esc(p.name)+'</b><small>'+load(p.id).owned.length+' / '+ids.length+' schémas</small></button>').join('')+'</div>')+
      '<label class="pd-new">'+(first?'Ton pseudo':'Nouveau profil')+'<span><input type="text" id="profileName" maxlength="24" autocomplete="off" placeholder="Pseudo" aria-describedby="profileError"><button type="button" data-create class="btn primary">Créer</button></span></label>'+(first?'<button type="button" class="btn" data-restore>J’ai déjà une sauvegarde</button>':'')+
      '<p id="profileError" class="pd-error" role="alert">'+esc(error)+'</p></form>';
  }
  function choose(){draw();if(!dialog.open)dialog.showModal();(index.list.length?dialog.querySelector('[aria-pressed="true"]'):dialog.querySelector('input'))?.focus();}
  const submit=()=>{
    const v=dialog.querySelector('#profileName').value;
    if(!cleanName(v)){draw('Écris un pseudo (24 caractères au plus).');dialog.querySelector('input').focus();return;}
    if(!create(v)){draw('Ce pseudo existe déjà sur cet appareil.');dialog.querySelector('input').focus();return;}
    dialog.close();
  };
  dialog.addEventListener('click',e=>{
    const pick=e.target.closest('[data-pick]');
    if(pick){select(pick.dataset.pick);dialog.close();}
    else if(e.target.closest('[data-create]'))submit();
    else if(e.target.closest('[data-restore]')){dialog.close();window.OPSBackup?.importFile();}
    else if(e.target===dialog&&index.list.length)dialog.close();
  });
  dialog.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='profileName'){e.preventDefault();submit();}});
  dialog.addEventListener('cancel',e=>{if(!index.active)e.preventDefault();});
  window.addEventListener('storage',e=>{if(e.key&&e.key.startsWith('speranza.ops.col.v1.')){cache.delete(e.key.slice(20));emit(e.key.slice(20),'storage');}});

  window.AtlasProfiles={active,name,gameName,setGameName,list:()=>index.list.map(p=>({...p})),owned,has,snapshot,setOwned,spare,setSpare,replaceOwned,savePrivate,create,select,rename,remove,choose,
    compare:()=>window.OPS?.actions.compare?.(),lastReceived:()=>null};
  if(!index.active)window.addEventListener('DOMContentLoaded',choose,{once:true});
  if(!index.active&&document.readyState!=='loading')choose();
})();
