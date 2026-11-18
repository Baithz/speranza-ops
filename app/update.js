/* Speranza Ops — annonce d'une nouvelle version.
   Le site demande à GitHub le numéro de la dernière version publiée, au plus une fois
   toutes les 6 heures, et propose le téléchargement si elle est plus récente.
   Rien n'est installé tout seul. La version en ligne, elle, est toujours à jour : pas d'annonce. */
(() => {
  'use strict';
  const O=window.OPS,{read,write,esc,actions}=O;
  const DEPOT='Baithz/speranza-ops',PAGE='https://github.com/'+DEPOT+'/releases/latest';
  const KEY='speranza.ops.update.v1',DELAI=6*3600000,PLUS_TARD=3*86400000;
  if(location.protocol!=='file:')return;
  const propre=v=>{const m=/^v?(\d{4})\.(\d{1,2})\.(\d{1,2})\.(\d{1,3})$/.exec(String(v||'').trim());return m?m.slice(1).map(Number):null;};
  const plusRecent=(a,b)=>{for(let i=0;i<4;i++){if(a[i]!==b[i])return a[i]>b[i];}return false;};
  let st={at:0,tag:'',muet:'',muetAt:0};try{Object.assign(st,JSON.parse(read(KEY))||{});}catch{}
  const save=()=>write(KEY,JSON.stringify(st));
  function annonce(){
    const ici=propre(window.OPS_RELEASE?.version),la=propre(st.tag);
    document.querySelector('.maj')?.remove();
    if(!ici||!la||!plusRecent(la,ici))return;
    if(st.muet===st.tag&&Date.now()-st.muetAt<PLUS_TARD)return;
    const bar=document.createElement('aside');bar.className='maj';bar.setAttribute('aria-label','Nouvelle version');
    bar.innerHTML='<p><b>Nouvelle version '+esc(la.join('.'))+'</b><span>Tu as la '+esc(ici.join('.'))+'. Ta collection est conservée.</span></p><a class="btn primary" href="'+PAGE+'" target="_blank" rel="noopener">Télécharger</a><button type="button" class="btn" data-act="maj-tard">Plus tard</button>';
    document.body.append(bar);
  }
  actions['maj-tard']=()=>{st.muet=st.tag;st.muetAt=Date.now();save();annonce();};
  async function verifier(){
    if(Date.now()-st.at<DELAI){annonce();return;}
    try{
      const r=await fetch('https://api.github.com/repos/'+DEPOT+'/releases/latest',{headers:{Accept:'application/vnd.github+json'}});
      st.at=Date.now();
      if(r.ok){const d=await r.json();if(propre(d?.tag_name))st.tag=String(d.tag_name);}
      save();
    }catch{}                       // hors ligne : on réessaiera au prochain lancement
    annonce();
  }
  window.addEventListener('DOMContentLoaded',()=>setTimeout(verifier,1500));
  O.update={verifier,_propre:propre,_plusRecent:plusRecent};
})();
