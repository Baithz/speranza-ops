/* Sauvegardes portables complètes. Ni profil de navigateur, ni cookies, ni données d'autres sites. */
(() => {
  'use strict';
  const allowed=k=>typeof k==='string'&&/^(speranza|baithz)\./.test(k)&&k.length<240;
  const portable=k=>allowed(k)&&k!=='speranza.ops.squad.slot';
  const indexKey='speranza.ops.profiles.v1',MAX=128*1024*1024;
  let pending=null,busy=false;
  function database(){return new Promise((ok,no)=>{
    const r=indexedDB.open('speranza-ops',1);
    r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('shots'))r.result.createObjectStore('shots');};
    r.onsuccess=()=>ok(r.result);r.onerror=()=>no(Error('Les captures personnelles ne sont pas accessibles.'));r.onblocked=()=>no(Error('Ferme les autres onglets Speranza et réessaie.'));
  });}
  async function shots(){const db=await database();try{return await new Promise((ok,no)=>{
    const tx=db.transaction('shots','readonly'),store=tx.objectStore('shots'),keys=store.getAllKeys(),values=store.getAll();
    tx.oncomplete=()=>ok(keys.result.map((key,i)=>({key,value:values.result[i]})));tx.onerror=tx.onabort=()=>no(Error('Lecture des captures impossible.'));
  });}finally{db.close();}}
  const dataURL=blob=>new Promise((ok,no)=>{const f=new FileReader();f.onload=()=>ok(f.result);f.onerror=()=>no(Error('Capture illisible.'));f.readAsDataURL(blob);});
  async function snapshot(){
    const keys={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(portable(k))keys[k]=localStorage.getItem(k);}
    const images=[];for(const {key,value} of await shots()){
      if(!(value instanceof Blob))throw Error('Une capture stockée a un format inconnu.');
      images.push({key,data:await dataURL(value)});
    }
    return {format:'speranza-ops',version:2,appVersion:window.OPS_RELEASE?.version,savedAt:new Date().toISOString(),profile:window.AtlasProfiles?.name(),keys,shots:images};
  }
  function validate(d){
    if(!d||d.format!=='speranza-ops'||![1,2].includes(d.version)||!d.keys||Array.isArray(d.keys)||typeof d.keys!=='object')throw Error('Sauvegarde Speranza Ops incompatible.');
    const entries=Object.entries(d.keys);if(entries.length>4000||entries.some(([k,v])=>!allowed(k)||typeof v!=='string'||v.length>16e6))throw Error('Réglages invalides dans la sauvegarde.');
    for(const [k,v] of entries){
      if(k===indexKey){const p=JSON.parse(v);if(!Array.isArray(p?.list)||p.list.some(x=>!x||typeof x.id!=='string'||typeof x.name!=='string')||new Set(p.list.map(x=>x.id)).size!==p.list.length)throw Error('Liste de profils invalide.');}
      if(k.startsWith('speranza.ops.col.v1.')){const c=JSON.parse(v);if(!Array.isArray(c?.owned)||!Array.isArray(c.pins)||c.owned.some(x=>typeof x!=='string')||c.pins.some(x=>typeof x!=='string')||!c.notes||Array.isArray(c.notes)||typeof c.notes!=='object')throw Error('Collection invalide.');}
    }
    const images=d.version===2?d.shots:[];if(!Array.isArray(images)||images.length>500)throw Error('Liste de captures invalide.');
    const seen=new Set();for(const p of images){if(!p||typeof p.key!=='string'||p.key.length>240||seen.has(p.key)||typeof p.data!=='string'||p.data.length>18e6||!/^data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/]*={0,2}$/.test(p.data))throw Error('Capture invalide.');seen.add(p.key);}
    if(JSON.stringify(d).length>MAX)throw Error('Sauvegarde trop volumineuse (128 Mo maximum).');
    return {...d,keys:Object.fromEntries(entries.filter(([k])=>portable(k))),shots:images};
  }
  function mergeValue(key,current,incoming){
    if(current===null)return incoming;
    if(key===indexKey){const a=JSON.parse(current),b=JSON.parse(incoming),list=[...a.list];for(const p of b.list)if(!list.some(x=>x.id===p.id))list.push(p);return JSON.stringify({active:a.active||b.active,list});}
    if(key.startsWith('speranza.ops.col.v1.')){const a=JSON.parse(current),b=JSON.parse(incoming);return JSON.stringify({...b,...a,owned:[...new Set([...b.owned,...a.owned])],pins:[...new Set([...b.pins,...a.pins])],spare:[...new Set([...(b.spare||[]),...(a.spare||[])])],notes:{...b.notes,...a.notes}});}
    return current;
  }
  function decode(p){const [head,body]=p.data.split(','),bytes=Uint8Array.from(atob(body),c=>c.charCodeAt(0));return {key:p.key,value:new Blob([bytes],{type:head.slice(5,head.indexOf(';'))})};}
  async function restore(raw,mode='merge'){
    if(!['merge','replace'].includes(mode))throw Error('Mode de restauration inconnu.');
    const d=validate(raw),incoming=d.shots.map(decode),prior=new Map(),existing=new Set((await shots()).map(p=>p.key));
    const planned=Object.entries(d.keys).map(([k,v])=>{const old=localStorage.getItem(k);prior.set(k,old);return [k,mode==='merge'?mergeValue(k,old,v):v];});
    const images=incoming.filter(p=>mode==='replace'||!existing.has(p.key));const db=await database();
    try{
      for(const [k,v] of planned)localStorage.setItem(k,v);
      if(images.length)await new Promise((ok,no)=>{const t=db.transaction('shots','readwrite'),s=t.objectStore('shots');for(const p of images)s.put(p.value,p.key);t.oncomplete=ok;t.onerror=t.onabort=()=>no(Error('Écriture des captures impossible.'));});
    }catch(error){
      for(const k of prior.keys())localStorage.removeItem(k);for(const [k,v] of prior)if(v!==null)localStorage.setItem(k,v);throw error;
    }finally{db.close();}
    return {keys:planned.length,shots:images.length};
  }
  function download(d,label='sauvegarde'){
    const url=URL.createObjectURL(new Blob([JSON.stringify(d)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='speranza-ops-'+label+'-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
  }
  async function exportFile(){try{download(await snapshot());OPS.toast('Sauvegarde complète exportée, captures comprises.');}catch(e){OPS.toast('Sauvegarde impossible : '+e.message);}}
  function updateHelp(){OPS.openSheet('<h2>Mettre le site à jour</h2><p>Version installée : <b>'+OPS.esc(window.OPS_RELEASE.version)+'</b></p><ol><li>Exporte une sauvegarde complète ci-dessous.</li><li>Ferme les onglets Speranza Ops.</li><li>Décompresse le paquet de mise à jour, lance « Mettre à jour.cmd » et sélectionne <b>ton dossier Speranza_Ops actuel</b>.</li><li>Rouvre le site au même emplacement, avec le même navigateur.</li></ol><p>Le programme remplace les fichiers du site et garde la clé de ton escouade ainsi que les fichiers ajoutés personnellement. Les anciens fichiers remplacés sont sauvegardés dans le dossier Sauvegardes.</p><p>Si tu changes de dossier, de navigateur ou de PC, restaure ton fichier de sauvegarde. Les données du navigateur ne sont pas dans le ZIP du site.</p><button class="btn primary" data-act="export">Exporter ma sauvegarde complète</button>',{label:'Mise à jour'});}
  function importFile(){
    const input=document.createElement('input');input.type='file';input.accept='application/json,.json';input.oncancel=()=>{if(!OPS.P.active())OPS.P.choose();};input.onchange=async()=>{
      try{const f=input.files[0];if(!f)return;if(f.size>MAX)throw Error('128 Mo maximum.');pending=validate(JSON.parse(await f.text()));
        let profiles=[];try{profiles=JSON.parse(pending.keys[indexKey]||'{}').list||[];}catch{}
        OPS.openSheet('<h2>Restaurer une sauvegarde</h2><p>'+Object.keys(pending.keys).length+' entrées et '+pending.shots.length+' captures personnelles.</p><p>'+profiles.map(p=>OPS.esc(p.name)).join(' · ')+'</p><p><b>Ajouter sans écraser</b> réunit les collections et conserve les notes, réglages et captures actuels en cas de conflit. <b>Remplacer</b> restaure les valeurs du fichier. Une sauvegarde de l’état actuel sera téléchargée avant modification.</p><div class="row"><button class="btn primary" data-act="backup-restore" data-mode="merge">Ajouter sans écraser</button><button class="btn" data-act="backup-restore" data-mode="replace">Remplacer avec ce fichier</button></div>',{label:'Restaurer une sauvegarde'});
      }catch(e){pending=null;OPS.toast('Restauration impossible : '+e.message);if(!OPS.P.active())OPS.P.choose();}
    };input.click();
  }
  window.OPSBackup={snapshot,validate,restore,exportFile,importFile,updateHelp};
  Object.assign(OPS.actions,{export:exportFile,import:importFile,'update-help':updateHelp,'backup-restore':async d=>{
    if(!pending||busy)return;busy=true;
    try{download(await snapshot(),'avant-restauration');await restore(pending,d.mode);pending=null;location.reload();}catch(e){OPS.toast('Restauration annulée : '+e.message);}finally{busy=false;}
  }});
})();
