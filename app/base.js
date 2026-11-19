/* Speranza Ops — la base partagée.
   Remplace le relais public ntfy.sh : plus de salons de 100 raiders, plus de case à cocher.
   Tout raider qui ouvre le site participe, sans compte à créer et sans rien donner de personnel :
   Supabase lui attribue une identité anonyme, et seuls partent les avis de spawn.
   Si la base n'est pas configurée, le site fonctionne exactement comme avant, en local. */
(() => {
  'use strict';
  const O=window.OPS,{esc,ico}=O;
  const CFG=window.OPS_BASE||{},PRET=!!(CFG.url&&CFG.cle);
  let client=null,chargement=null,session=null,etat=PRET?'off':'absent',recus=0,actifs=0,canal=null,codePartie='';
  const ecoute=new Set();
  const prevenir=()=>{for(const f of ecoute)try{f();}catch{}};

  async function connecter(){
    if(client)return client;
    if(!PRET)return null;
    if(chargement)return chargement;
    chargement=(async()=>{
      try{
        await O.load('vendor/supabase.js');
        client=window.supabase.createClient(CFG.url,CFG.cle,{auth:{persistSession:true,autoRefreshToken:true}});
        const {data}=await client.auth.getSession();
        session=data.session||(await client.auth.signInAnonymously()).data?.session;
        if(!session)throw new Error('identité refusée');
        etat='on';compter();prevenir();
        return client;
      }catch(e){etat='erreur';client=null;prevenir();return null;}
      finally{chargement=null;}
    })();
    return chargement;
  }

  /* ── Envoi d'un avis ──────────────────────────────────────────────────────
     key = « carte|genre|index ». etat : vu / vide / abattu.
     age = secondes depuis l'ouverture de la carte, ecart = secondes depuis l'élimination. */
  async function avis(key,etatAvis,age,ecart,partie){
    const c=await connecter();if(!c)return false;
    const [carte,type,idx]=String(key).split('|');
    const genre=({'arc-bastion':'bastion','arc-rocketeer':'artificier','arc-bombardier':'bombardier','arc-leaper':'bondisseur','arc-sentinel':'sentinelle'})[type];
    if(!genre||!carte||idx===undefined)return false;
    const ligne={carte:carte.slice(0,40),point:(type+'|'+idx).slice(0,60),genre,etat:etatAvis,
      age_carte:Math.max(0,Math.min(2400,Math.round(age||0)))};
    if(ecart>0&&ecart<=3600)ligne.ecart=Math.round(ecart);
    if(partie)ligne.partie=String(partie).slice(0,24);
    const {error}=await c.from('avis').insert(ligne);
    if(error)return false;
    return true;
  }

  /* ── Bornes de retour, calculées par la base sur les relevés de tous ── */
  const cacheBornes=new Map();
  async function bornes(carte){
    const c=await connecter();if(!c)return null;
    const frais=cacheBornes.get(carte);
    if(frais&&Date.now()-frais.at<300000)return frais.data;
    const {data,error}=await c.from('bornes').select('point,genre,basse,haute,n_basse,n_haute').eq('carte',carte);
    if(error)return null;
    const par={};for(const l of data)par[carte+'|'+l.point]={basse:l.basse,haute:l.haute,n:(l.n_basse||0)+(l.n_haute||0)};
    cacheBornes.set(carte,{at:Date.now(),data:par});
    return par;
  }

  async function compter(){
    const c=await connecter();if(!c)return;
    const {data,error}=await c.rpc('actifs');
    if(!error&&Number.isFinite(data)){actifs=data;prevenir();}
  }

  /* ── Canal de partie : les raiders qui tapent le même code se voient en direct ── */
  async function partie(code){
    const c=await connecter();
    codePartie=String(code||'').slice(0,24);
    if(canal){c?.removeChannel(canal);canal=null;}
    if(!c||!codePartie)return;
    canal=c.channel('partie:'+codePartie)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'avis',filter:'partie=eq.'+codePartie},({new:l})=>{
        if(!l||l.auteur===session?.user?.id)return;       // pas ses propres avis
        recus++;
        const [type,idx]=String(l.point).split('|');
        O.spawns?.net?.({id:'b'+l.id,key:l.carte+'|'+type+'|'+idx,kind:l.etat==='vu'?'seen':l.etat==='vide'?'absent':'kill',
          end:null,at:Date.parse(l.cree_le)||Date.now()});
        prevenir();
      }).subscribe();
  }

  /* ── Ce que l'écran Escouade affiche : un état, pas un choix ── */
  const libelle=()=>!PRET?'Base non configurée':etat==='on'?(actifs?actifs+' raider'+(actifs>1?'s':'')+' actif'+(actifs>1?'s':'')+' cette heure':'Relié'):etat==='erreur'?'Injoignable':'Connexion…';
  function box(){
    return '<section class="net-box" aria-labelledby="netTitle"><h3 id="netTitle">Réseau d’entraide</h3>'+
      '<p class="net-state" data-state="'+(etat==='on'?'on':etat==='erreur'?'error':'off')+'" role="status"><i class="duo-lamp" aria-hidden="true"></i>'+esc(libelle())+
      (recus?' · '+recus+' avis reçu'+(recus>1?'s':''):'')+'</p>'+
      '<p class="fine">'+(PRET
        ? 'Tu y participes dès que tu ouvres le site : chaque « Vu », « Vide » ou « Abattu » aide les autres à savoir quand un ARC revient. Rien d’autre ne part — ni pseudo, ni collection, ni position.'
        : 'Le partage entre raiders n’est pas encore branché sur cette copie du site. Tout fonctionne en local.')+'</p></section>';
  }

  O.net={
    box,usable:PRET,on:()=>etat==='on',state:()=>etat==='on'?'on':etat==='erreur'?'error':'off',
    count:()=>actifs,label:libelle,got:()=>recus,
    game:partie,gameCode:()=>codePartie,gameCount:()=>actifs,
    gameSend:()=>true,                       // l'insertion suffit : la base diffuse elle-même
    obs:(key,kind,d,age,partieEnCours)=>{avis(key,kind==='seen'?'vu':kind==='absent'?'vide':'abattu',age,d,partieEnCours);},
    bornes,ecoute:f=>{ecoute.add(f);return ()=>ecoute.delete(f);},connecter
  };
  O.base={pret:PRET,client:()=>client,identite:()=>session?.user?.id||null};
  if(PRET)addEventListener('DOMContentLoaded',()=>setTimeout(connecter,1200));
})();
