(() => {
  'use strict';
  const records=window.ATLAS_PACKED_MODELS;
  let currentId, current;
  function get(id){
    if(!Object.hasOwn(records,id))return null;
    if(currentId===id)return current;
    const binary=atob(records[id]), bytes=new Uint8Array(binary.length);
    for(let i=0;i<bytes.length;i++)bytes[i]=binary.charCodeAt(i);
    const model=JSON.parse(new TextDecoder().decode(window.fflate.gunzipSync(bytes)));
    current=model;currentId=id;
    return model;
  }
  window.AtlasModelLibrary={get,has:id=>Object.hasOwn(records,id)};
  for(const id of ['bastion','rocketeer'])Object.defineProperty(window,'ATLAS_'+id.toUpperCase()+'_MESH',{get:()=>get(id)});
})();
