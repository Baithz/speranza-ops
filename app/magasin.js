/* Speranza Ops — Magasin d'échange.
   Les raiders se laissent des annonces : je donne, j'échange ceci contre cela, je cherche.
   Trois choses le rendent utile plutôt que bavard :
     • le pseudo ARC Raiders complet est obligatoire, sinon personne ne se retrouve en jeu ;
     • le site compare chaque annonce à ta collection et remonte celles qui te concernent ;
     • on ne troque que des schémas et du butin, jamais d'argent réel.
   Sans base configurée, l'écran l'explique au lieu de tourner à vide. */
(() => {
  'use strict';
  const O=window.OPS,{$,$$,esc,norm,ico,BP,bpById,owned,actions,P}=O;
  const LOOT=window.LOOT_DATA||{};
  const lootIds=Object.keys(LOOT).sort((a,b)=>LOOT[a].name.localeCompare(LOOT[b].name,'fr'));
  const nomDe=o=>o.t==='bp'?(bpById.get(o.id)?.name||o.id):(LOOT[o.id]?.name||o.id);
  const GENRES={don:'Don',echange:'Échange',recherche:'Recherche'};

  let liste=null,chargement=false,erreur='',filtre='pour-moi',q='',arret=null;
  // Brouillon de l'annonce en cours d'écriture, conservé tant que la feuille est ouverte.
  let projet={genre:'echange',donne:[],cherche:[],mot:''};

  const vueMagasin=()=>O.views.magasin;
  const clef=o=>o.t+':'+o.id;
  const dansListe=(l,o)=>l.some(x=>clef(x)===clef(o));

  async function charger(){
    if(chargement)return;chargement=true;erreur='';
    const r=await O.net?.annonces?.();
    chargement=false;
    if(r===null||r===undefined){erreur=O.net?.usable?'La base n’a pas répondu. Réessaie dans un instant.':'';liste=liste||[];}
    else liste=r;
    vueMagasin()?.refresh?.();
  }

  /* Ce qui rend une annonce intéressante pour toi, et rien d'autre : on ne compare que les
     schémas, parce que le site ne connaît pas ton inventaire de butin. */
  function lire(a){
    const mesTrop=P.spare?.()||[];
    const ilDonne=a.donne.filter(o=>o.t==='bp'&&!owned(o.id));
    const ilVeut=a.cherche.filter(o=>o.t==='bp'&&mesTrop.includes(o.id));
    return {ilDonne,ilVeut,score:(ilDonne.length?2:0)+(ilVeut.length?1:0)};
  }
  const age=t=>{const m=Math.round((Date.now()-Date.parse(t))/60000);
    return m<2?'à l’instant':m<60?'il y a '+m+' min':m<1440?'il y a '+Math.round(m/60)+' h':'il y a '+Math.round(m/1440)+' j';};

  function puce(o,classe=''){
    const i=o.t==='loot'?LOOT[o.id]:null;
    return '<button class="chip-btn '+classe+'" data-act="'+(o.t==='bp'?'bp':'loot')+'" data-id="'+esc(o.id)+'">'+esc(nomDe(o))+'</button>';
  }

  function carte(a){
    const {ilDonne,ilVeut,score}=lire(a);
    const banniere=score===3?'<p class="mg-match parfait">'+ico('check')+'Échange parfait : il a ce qui te manque, et tu as ce qu’il cherche.</p>'
      :ilDonne.length?'<p class="mg-match">'+ico('check')+'Il propose '+ilDonne.length+' schéma'+(ilDonne.length>1?'s':'')+' qui te manque'+(ilDonne.length>1?'nt':'')+'.</p>'
      :ilVeut.length?'<p class="mg-match">'+ico('check')+'Tu as en trop ce qu’il cherche.</p>':'';
    const col=(titre,l,vide)=>'<div><h4>'+titre+' <b>'+l.length+'</b></h4>'+(l.length?'<div class="chips">'+l.map(o=>puce(o,(o.t==='bp'&&!owned(o.id)?'manque':''))).join('')+'</div>':'<p class="fine">'+vide+'</p>')+'</div>';
    return '<article class="mg-card" data-genre="'+a.genre+'"'+(score?' data-match="'+score+'"':'')+'>'+banniere+
      '<header><span class="mg-genre" data-g="'+a.genre+'">'+GENRES[a.genre]+'</span><b class="mg-pseudo">'+esc(a.pseudo)+'</b><small>'+age(a.cree_le)+'</small></header>'+
      (a.mot?'<p class="mg-mot">'+esc(a.mot)+'</p>':'')+
      '<div class="mg-cols">'+
        (a.genre!=='recherche'?col('Il donne',a.donne,'—'):'')+
        (a.genre!=='don'?col(a.genre==='recherche'?'Il cherche':'Il veut en retour',a.cherche,'À discuter'):'')+
      '</div>'+
      '<div class="row tight">'+
        (a.mienne?'<button class="btn small danger" data-act="mg-fermer" data-id="'+a.id+'">Retirer mon annonce</button>'
                 :'<button class="btn small primary" data-act="mg-contact" data-id="'+a.id+'">Copier le message</button>'+
                  '<button class="btn small" data-act="mg-copier" data-g="'+esc(a.pseudo)+'">Copier le pseudo</button>')+
      '</div></article>';
  }

  const FILTRES=[['pour-moi','Pour toi'],['tout','Tout'],['don','Dons'],['echange','Échanges'],['recherche','Recherches'],['moi','Mes annonces']];
  function filtrer(){
    const l=liste||[],t=norm(q);
    let r=l.filter(a=>filtre==='moi'?a.mienne:filtre==='tout'||filtre==='pour-moi'?true:a.genre===filtre);
    if(filtre==='pour-moi')r=r.filter(a=>lire(a).score>0);
    if(t)r=r.filter(a=>norm(a.pseudo).includes(t)||norm(a.mot||'').includes(t)||[...a.donne,...a.cherche].some(o=>norm(nomDe(o)).includes(t)));
    return r.sort((x,y)=>lire(y).score-lire(x).score||Date.parse(y.cree_le)-Date.parse(x.cree_le));
  }

  function corps(){
    if(!O.net?.usable)return '<div class="empty"><h2>Le magasin n’est pas encore branché</h2><p>Cette copie du site tourne sans base partagée : les annonces ne peuvent ni partir ni arriver. Tout le reste fonctionne normalement.</p></div>';
    if(erreur&&!(liste||[]).length)return '<div class="empty"><h2>La base n’a pas répondu</h2><p>Les annonces des autres raiders n’ont pas pu être chargées. Ça arrive quand la connexion coupe un instant.</p><button class="btn primary" data-act="mg-recharger">Réessayer</button></div>';
    if(liste===null)return '<div class="empty"><h2>Ouverture du magasin…</h2><p>On récupère les annonces des autres raiders.</p></div>';
    const r=filtrer();
    if(!r.length)return '<div class="empty"><h2>'+(filtre==='pour-moi'?'Rien qui te concerne pour l’instant':filtre==='moi'?'Tu n’as aucune annonce ouverte':'Aucune annonce ici')+'</h2>'+
      '<p>'+(filtre==='pour-moi'?'Aucune annonce ne propose un schéma qui te manque. Regarde « Tout », ou publie ce que tu as en trop.':'Publie la première : c’est ce qui fait vivre le magasin.')+'</p>'+
      '<button class="btn primary" data-act="mg-publier">Publier une annonce</button></div>';
    return '<div class="mg-grid">'+r.map(carte).join('')+'</div>';
  }

  O.register('magasin',{title:'Magasin d’échange',short:'Magasin',icon:'swap',pos:6.6,
    mount(el){
      el.innerHTML='<header class="view-head"><h1>Magasin d’échange</h1><p>Ce que les raiders donnent, cherchent ou échangent. Les annonces qui te concernent remontent d’elles-mêmes.</p></header>'+
        '<div class="tools"><div class="seg" role="radiogroup" aria-label="Filtre">'+FILTRES.map(([k,n])=>'<button role="radio" aria-checked="'+(filtre===k)+'" data-act="mg-filtre" data-v="'+k+'">'+n+'</button>').join('')+'</div>'+
        '<label class="search">'+ico('search')+'<input type="search" data-mg-q placeholder="Un schéma, un objet, un pseudo…" aria-label="Chercher dans les annonces" value="'+esc(q)+'"></label>'+
        '<button class="btn primary" data-act="mg-publier">'+ico('swap')+'Publier une annonce</button>'+
        '<button class="btn" data-act="mg-aide">Comment ça marche</button></div>'+
        '<p class="mg-erreur" role="status" hidden></p><div data-corps></div>';
      el.querySelector('[data-mg-q]').addEventListener('input',e=>{q=e.target.value;this.refresh();});
      charger();
      if(!arret&&O.net?.suivreMagasin)O.net.suivreMagasin(()=>charger()).then(f=>arret=f);
    },
    refresh(){
      const el=this.el;if(!el)return;
      for(const b of $$('[data-act="mg-filtre"]',el))b.setAttribute('aria-checked',String(b.dataset.v===filtre));
      const e=$('.mg-erreur',el);if(e){const doublon=erreur&&!(liste||[]).length;e.hidden=!erreur||doublon;e.textContent=erreur;}
      const c=$('[data-corps]',el);if(c)c.innerHTML=corps();
    },
    show(){charger();}});

  /* ── Écrire une annonce ─────────────────────────────────────────────────── */
  function choixRapides(cible){
    const trop=(P.spare?.()||[]).map(id=>({t:'bp',id})),manque=BP.filter(b=>!owned(b.id)).slice(0,40).map(b=>({t:'bp',id:b.id}));
    const l=cible==='donne'?trop:manque;
    if(!l.length)return cible==='donne'
      ? '<p class="fine">Tu n’as marqué aucun schéma en trop. Dans Schémas, touche « En trop » sur tes doublons : ils apparaîtront ici en un clic.</p>'
      : '<p class="fine">Ta collection est complète : rien à demander côté schémas.</p>';
    return '<div class="chips">'+l.map(o=>'<button class="chip-btn" data-act="mg-ajout" data-c="'+cible+'" data-t="bp" data-id="'+esc(o.id)+'">'+esc(nomDe(o))+'</button>').join('')+'</div>';
  }
  function resultats(cible,texte){
    const t=norm(texte);if(t.length<2)return '';
    const bps=BP.filter(b=>norm(b.name).includes(t)).slice(0,8).map(b=>({t:'bp',id:b.id}));
    const lts=lootIds.filter(id=>norm(LOOT[id].name).includes(t)).slice(0,8).map(id=>({t:'loot',id}));
    const l=[...bps,...lts];
    return l.length?'<div class="chips">'+l.map(o=>'<button class="chip-btn" data-act="mg-ajout" data-c="'+cible+'" data-t="'+o.t+'" data-id="'+esc(o.id)+'">'+esc(nomDe(o))+'<small>'+(o.t==='bp'?'schéma':'butin')+'</small></button>').join('')+'</div>':'<p class="fine">Rien à ce nom.</p>';
  }
  function bloc(cible,titre,aide){
    const l=projet[cible];
    return '<section class="mg-bloc"><h3>'+titre+'</h3><p class="fine">'+aide+'</p>'+
      '<div class="mg-panier">'+(l.length?l.map(o=>'<button class="chip-btn on" data-act="mg-retirer" data-c="'+cible+'" data-k="'+esc(clef(o))+'">'+esc(nomDe(o))+' ×</button>').join(''):'<span class="fine">Rien pour l’instant.</span>')+'</div>'+
      '<label class="search"><input type="search" data-cherche="'+cible+'" placeholder="Chercher un schéma ou un objet" aria-label="Chercher un objet à ajouter"></label>'+
      '<div data-res="'+cible+'"></div>'+
      '<details class="mg-sug"><summary>'+(cible==='donne'?'Mes schémas en trop':'Ce qui me manque')+'</summary>'+choixRapides(cible)+'</details></section>';
  }
  function formulaire(message=''){
    const g=projet.genre,pseudo=P.gameName?.()||'';
    O.openSheet('<h2>Publier une annonce</h2>'+
      '<div class="seg" role="radiogroup" aria-label="Genre d’annonce">'+Object.entries(GENRES).map(([k,n])=>'<button role="radio" aria-checked="'+(g===k)+'" data-act="mg-genre" data-v="'+k+'">'+n+'</button>').join('')+'</div>'+
      '<p class="fine">'+(g==='don'?'Tu donnes, sans rien attendre. C’est ce qui circule le plus vite.'
        :g==='echange'?'Tu donnes quelque chose et tu demandes quelque chose en retour.'
        :'Tu cherches, et tu proposes de discuter de la contrepartie.')+'</p>'+
      (g!=='recherche'?bloc('donne','Ce que tu donnes','Tes doublons de schémas, ou du butin dont tu n’as plus l’usage.'):'')+
      (g!=='don'?bloc('cherche',g==='echange'?'Ce que tu réclames en échange':'Ce que tu cherches','Ce qui te manque. Les autres verront si leur annonce te concerne.'):'')+
      '<section class="mg-bloc"><h3>Un mot (facultatif)</h3><input type="text" data-mot maxlength="160" placeholder="Dispo ce soir, échange sur Portail bleu…" value="'+esc(projet.mot)+'" aria-label="Un mot pour accompagner l’annonce"></section>'+
      '<section class="mg-bloc"><h3>Ton pseudo en jeu</h3>'+
        (pseudo?'<p>Publié sous <b>'+esc(pseudo)+'</b>. <button class="link" data-act="mg-pseudo">Le changer</button></p>'
               :'<p class="notice">Il faut ton pseudo ARC Raiders complet, numéro à quatre chiffres compris — sinon personne ne peut te retrouver en jeu. <button class="link" data-act="mg-pseudo">L’indiquer</button></p>')+'</section>'+
      (message?'<p class="mg-erreur" role="alert">'+esc(message)+'</p>':'')+
      '<div class="row"><button class="btn primary" data-act="mg-envoyer">Publier</button><button class="btn" data-act="close-sheet">Annuler</button></div>'+
      '<p class="fine">Le troc se fait en jeu, de la main à la main. Jamais d’argent réel : le site n’en demande ni n’en permet.</p>',
      {wide:true,label:'Publier une annonce'});
    for(const inp of $$('[data-cherche]'))inp.addEventListener('input',e=>{
      const c=e.target.dataset.cherche,z=$('[data-res="'+c+'"]');if(z)z.innerHTML=resultats(c,e.target.value);});
    const m=$('[data-mot]');if(m)m.addEventListener('input',e=>{projet.mot=e.target.value;});
  }

  Object.assign(actions,{
    'mg-filtre':d=>{filtre=d.v;vueMagasin()?.refresh();},
    'mg-recharger':()=>{liste=null;vueMagasin()?.refresh();charger();},
    'mg-aide':()=>O.openSheet('<h2>Le magasin, en clair</h2>'+
      '<h3>Trois annonces possibles</h3><ul class="plain">'+
      '<li><b>Don</b> — tu as un doublon, tu le donnes. Rien à rendre.</li>'+
      '<li><b>Échange</b> — tu donnes ceci, tu réclames cela. Les deux côtés sont écrits, personne ne découvre le prix après coup.</li>'+
      '<li><b>Recherche</b> — tu cherches, la contrepartie se discute en jeu.</li></ul>'+
      '<h3>Pourquoi le pseudo avec son numéro</h3><p>Dans ARC Raiders un joueur s’appelle <b>Pseudo#1234</b>. Sans ces quatre chiffres, celui qui veut te rendre un schéma tombe sur un homonyme. C’est pour ça qu’il est obligatoire pour publier.</p>'+
      '<h3>Ce que le site compare</h3><p>Chaque annonce est confrontée à ta collection : « Pour toi » ne garde que celles qui proposent un schéma qui te manque, ou qui cherchent un schéma que tu as marqué en trop. Le butin n’est pas comparé, parce que le site ne connaît pas ton inventaire.</p>'+
      '<h3>Ce qui part de chez toi</h3><p>Uniquement ce que tu écris dans l’annonce : ton pseudo en jeu, les objets listés et ton mot. Ni collection complète, ni position, ni adresse.</p>'+
      '<h3>Durée de vie</h3><p>Une annonce reste ouverte 21 jours, ou jusqu’à ce que tu la retires. Dix ouvertes au maximum par raider.</p>'+
      '<p class="notice">Le troc se fait en jeu, de la main à la main. Aucun échange contre de l’argent réel n’est permis ici : ni le site ni Embark ne le couvrent, et c’est le meilleur moyen de se faire arnaquer.</p>',{label:'Aide du magasin'}),
    'mg-publier':()=>{projet={genre:'echange',donne:[],cherche:[],mot:''};formulaire();},
    'mg-genre':d=>{projet.genre=d.v;formulaire();},
    'mg-ajout':d=>{const c=d.c==='cherche'?'cherche':'donne',o={t:d.t,id:d.id};
      if(projet[c].length>=12){O.toast('Douze objets au maximum par côté.');return;}
      if(!dansListe(projet[c],o))projet[c].push(o);formulaire();},
    'mg-retirer':d=>{const c=d.c==='cherche'?'cherche':'donne';projet[c]=projet[c].filter(o=>clef(o)!==d.k);formulaire();},
    'mg-pseudo':()=>{P.askGame?.();},
    async 'mg-envoyer'(){
      const pseudo=P.gameName?.()||'';
      if(!P.gameOk?.(pseudo)){formulaire('Indique d’abord ton pseudo ARC Raiders complet, numéro compris.');P.askGame?.();return;}
      const r=await O.net.publier({pseudo,genre:projet.genre,donne:projet.donne,cherche:projet.cherche,mot:projet.mot});
      if(!r.ok){formulaire(r.mot);return;}
      O.closeSheet?.();O.toast('Annonce publiée. Elle est visible par tous les raiders du site.');
      projet={genre:'echange',donne:[],cherche:[],mot:''};charger();
    },
    async 'mg-fermer'(d){
      if(!confirm('Retirer cette annonce du magasin ?'))return;
      if(await O.net.fermer(Number(d.id))){O.toast('Annonce retirée.');charger();}
      else O.toast('Le retrait n’a pas abouti. Réessaie dans un instant.');
    },
    'mg-copier':async d=>{try{await navigator.clipboard.writeText(d.g);O.toast('Pseudo copié : cherche-le dans ARC Raiders.');}catch{O.toast('Copie impossible ici.');}},
    async 'mg-contact'(d){
      const a=(liste||[]).find(x=>String(x.id)===String(d.id));if(!a)return;
      const noms=l=>l.map(nomDe).join(', ');
      const moi=P.gameName?.()||P.name?.()||'un raider';
      const txt=a.genre==='don'?'Salut '+a.pseudo+' ! Ton don sur Speranza Ops m’intéresse : '+noms(a.donne)+'. Je suis '+moi+' en jeu.'
        :a.genre==='recherche'?'Salut '+a.pseudo+' ! Tu cherches '+noms(a.cherche)+' sur Speranza Ops : je peux t’aider. Je suis '+moi+' en jeu.'
        :'Salut '+a.pseudo+' ! Ton échange sur Speranza Ops m’intéresse : tu donnes '+noms(a.donne)+' contre '+noms(a.cherche)+'. Je suis '+moi+' en jeu.';
      try{await navigator.clipboard.writeText(txt);O.toast('Message copié. Ajoute-le en jeu, le pseudo est dedans.');}catch{O.toast('Copie impossible ici.');}
    }
  });

  window.addEventListener('atlas:profiles',()=>vueMagasin()?.refresh?.());
})();
