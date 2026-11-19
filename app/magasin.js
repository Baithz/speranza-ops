/* Speranza Ops — Raiders : avec qui jouer, et quoi échanger.
   Deux onglets sous un même toit, parce que c'est la même question posée deux fois :
   « qui peut m'aider ? ».
     • Escouades — « je cherche deux francophones pour farmer ce soir », avec une heure de fin.
     • Échanges  — je donne, j'échange ceci contre cela, je cherche.
   Trois choses le rendent utile plutôt que bavard :
     • le pseudo ARC Raiders complet est obligatoire, sinon personne ne se retrouve en jeu ;
     • le site compare chaque annonce à ta collection et remonte celles qui te concernent ;
     • on ne troque que des schémas et du butin, jamais d'argent réel.
   Sans base configurée, l'écran l'explique au lieu de tourner à vide. */
(() => {
  'use strict';
  const O=window.OPS,{$,$$,esc,norm,ico,BP,bpById,owned,actions,P,MAPS,mapById}=O;
  const LOOT=window.LOOT_DATA||{};
  const lootIds=Object.keys(LOOT).sort((a,b)=>LOOT[a].name.localeCompare(LOOT[b].name,'fr'));
  const nomDe=o=>o.t==='bp'?(bpById.get(o.id)?.name||o.id):(LOOT[o.id]?.name||o.id);
  /* Un nom seul ne dit rien à qui joue depuis une semaine : on montre l'objet.
     Les schémas ont leur propre image, le butin vit dans une planche de sprites commune. */
  const sprRows=Math.ceil(lootIds.length/16);
  const sprite=i=>i?.pos==null?'<span class="spr none" aria-hidden="true"></span>'
    :'<span class="spr" aria-hidden="true" style="background-position:'+((i.pos%16)*100/15)+'% '+(Math.floor(i.pos/16)*100/(sprRows-1))+'%"></span>';
  function visuel(o){
    const b=o.t==='bp'?bpById.get(o.id):null;
    return b?.image?'<img src="'+esc(b.image)+'" alt="" loading="lazy" decoding="async" onerror="this.closest(\'.mg-art\').classList.add(\'sans-image\');this.remove()">':sprite(o.t==='loot'?LOOT[o.id]:null);
  }
  const GENRES={don:'Don',echange:'Échange',recherche:'Recherche'};

  let liste=null,chargement=false,erreur='',filtre='pour-moi',q='',arret=null;
  let onglet=O.read('speranza.ops.raiders.onglet')||'escouades';
  // Brouillon de l'annonce en cours d'écriture, conservé tant que la feuille est ouverte.
  let projet={genre:'echange',donne:[],cherche:[],mot:''};

  const vue=()=>O.views.raiders;
  const clef=o=>o.t+':'+o.id;
  const dansListe=(l,o)=>l.some(x=>clef(x)===clef(o));

  async function charger(){
    if(chargement)return;chargement=true;erreur='';
    const r=await O.net?.annonces?.();
    chargement=false;
    if(r===null||r===undefined){erreur=O.net?.usable?'La base n’a pas répondu. Réessaie dans un instant.':'';liste=liste||[];}
    else liste=r;
    vue()?.refresh?.();
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

  /* Vignette d'objet : image, nom, et la rareté du schéma en liseré comme dans le mur.
     opts.manque marque ce qui te fait défaut ; opts.retirer transforme la vignette en bouton de retrait. */
  function vignette(o,opts={}){
    const b=o.t==='bp'?bpById.get(o.id):null,nom=nomDe(o);
    const act=opts.retirer?'mg-retirer':o.t==='bp'?'bp':'loot';
    const extra=opts.retirer?' data-c="'+opts.retirer+'" data-k="'+esc(clef(o))+'"':' data-id="'+esc(o.id)+'"';
    return '<button class="mg-obj'+(b?' '+O.rarityClass(b.rarity):' est-butin')+(opts.manque?' manque':'')+(opts.retirer?' a-retirer':'')+'"'+
      ' data-act="'+act+'"'+extra+' title="'+esc(nom)+(opts.manque?' — il te manque':'')+'" aria-label="'+esc(nom)+(opts.retirer?', retirer de la liste':'')+'">'+
      '<span class="mg-art">'+visuel(o)+(opts.retirer?'<span class="mg-x" aria-hidden="true">×</span>':'')+'</span>'+
      '<b>'+esc(nom)+'</b></button>';
  }

  function carte(a){
    const {ilDonne,ilVeut,score}=lire(a);
    const banniere=score===3?'<p class="mg-match parfait">'+ico('check')+'Échange parfait : il a ce qui te manque, et tu as ce qu’il cherche.</p>'
      :ilDonne.length?'<p class="mg-match">'+ico('check')+'Il propose '+ilDonne.length+' schéma'+(ilDonne.length>1?'s':'')+' qui te manque'+(ilDonne.length>1?'nt':'')+'.</p>'
      :ilVeut.length?'<p class="mg-match">'+ico('check')+'Tu as en trop ce qu’il cherche.</p>':'';
    const mesTrop=P.spare?.()||[];
    const col=(titre,l,vide,cherche)=>{
      const v=l.map(o=>vignette(o,{manque:o.t==='bp'&&(cherche?mesTrop.includes(o.id):!owned(o.id))}));
      const corps=v.length<=6?v.join('')
        :v.slice(0,5).join('')+'<details class="mg-plus-obj"><summary title="Voir les '+(v.length-5)+' autres">+'+(v.length-5)+'</summary></details>'+
          '<div class="mg-reste">'+v.slice(5).join('')+'</div>';
      return '<div><h4>'+titre+' <b>'+l.length+'</b></h4>'+(l.length?'<div class="mg-objets">'+corps+'</div>':'<p class="fine">'+vide+'</p>')+'</div>';};
    return '<article class="mg-card" data-genre="'+a.genre+'"'+(score?' data-match="'+score+'"':'')+'>'+banniere+
      '<header><span class="mg-genre" data-g="'+a.genre+'">'+GENRES[a.genre]+'</span><b class="mg-pseudo">'+esc(a.pseudo)+'</b><small>'+age(a.cree_le)+'</small></header>'+
      (a.mot?'<p class="mg-mot">'+esc(a.mot)+'</p>':'')+
      '<div class="mg-cols">'+
        (a.genre!=='recherche'?col('Il donne',a.donne,'—'):'')+
        (a.genre!=='don'?col(a.genre==='recherche'?'Il cherche':'Il veut en retour',a.cherche,'À discuter',true):'')+
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

  // Barre d'outils : elle change avec l'onglet, le reste de l'écran ne bouge pas.
  function outils(){
    return onglet==='echanges'
      ? '<div class="seg" role="radiogroup" aria-label="Filtre des annonces">'+FILTRES.map(([k,n])=>'<button role="radio" aria-checked="'+(filtre===k)+'" data-act="mg-filtre" data-v="'+k+'">'+n+'</button>').join('')+'</div>'+
        '<label class="search">'+ico('search')+'<input type="search" data-rd-q placeholder="Un schéma, un objet, un pseudo…" aria-label="Chercher dans les annonces" value="'+esc(q)+'"></label>'+
        '<button class="btn primary" data-act="mg-publier">'+ico('swap')+'Publier une annonce</button>'+
        '<button class="btn" data-act="mg-aide">Comment ça marche</button>'
      : outilsEscouades();
  }
  function entete(){
    const nE=(appels||[]).length,nA=(liste||[]).length;
    const tab=(k,nom,n)=>'<button role="tab" aria-selected="'+(onglet===k)+'" data-act="rd-onglet" data-v="'+k+'">'+nom+(n?' <b>'+n+'</b>':'')+'</button>';
    return '<header class="view-head"><h1>Raiders</h1><p>Avec qui jouer ce soir, et quoi échanger. Tout ce qui vient des autres joueurs est ici.</p></header>'+
      '<div class="rd-tabs" role="tablist" aria-label="Communauté">'+tab('escouades','Escouades',nE)+tab('echanges','Échanges',nA)+'</div>';
  }
  O.register('raiders',{title:'Raiders',short:'Raiders',icon:'people',pos:6.6,
    mount(el){el.classList.add('rd');this.refresh();
      charger();chargerAppels();
      if(!arret&&O.net?.suivreMagasin)O.net.suivreMagasin(()=>charger()).then(f=>arret=f);
      if(!arretAppels&&O.net?.suivreAppels)O.net.suivreAppels(()=>chargerAppels()).then(f=>arretAppels=f);
    },
    refresh(){
      const el=this.el;if(!el)return;
      el.innerHTML=entete()+'<div class="tools">'+outils()+'</div>'+
        '<p class="mg-erreur" role="status"'+(onglet==='echanges'&&erreur&&(liste||[]).length?'':' hidden')+'>'+esc(erreur)+'</p>'+
        '<div data-corps>'+(onglet==='echanges'?corps():corpsEscouades())+'</div>';
      const champ=$('[data-rd-q]',el);
      if(champ)champ.addEventListener('input',e=>{q=e.target.value;const c=$('[data-corps]',el);if(c)c.innerHTML=corps();});
    },
    show(){charger();chargerAppels();},
    minute(){if(onglet==='escouades'&&this.el&&!this.el.contains(document.activeElement))this.refresh();}});

  /* ── Choisir des objets ─────────────────────────────────────────────────
     Taper un nom suppose qu'on le connaisse, et la moitié du butin d'ARC Raiders porte
     un nom qu'on n'a jamais lu. On parcourt donc à l'œil : deux rayons, des familles,
     et des vignettes. La recherche ne fait que filtrer le rayon ouvert. */
  const FAMILLES_BP=[...new Set(BP.map(b=>b.category))].filter(Boolean).sort((a,b)=>a.localeCompare(b,'fr'));
  const FAMILLES_LOOT=[...new Set(lootIds.map(id=>LOOT[id].type))].filter(Boolean).sort((a,b)=>a.localeCompare(b,'fr'));
  // Rayon courant et filtres, par côté (donne / cherche).
  const rayon={donne:{t:'bp',fam:'',q:''},cherche:{t:'bp',fam:'',q:''}};

  function catalogue(cible){
    const r=rayon[cible],t=norm(r.q),mesTrop=P.spare?.()||[];
    let l=[];
    if(r.t==='bp'){
      let src=BP;
      if(r.fam==='__trop')src=BP.filter(b=>mesTrop.includes(b.id));
      else if(r.fam==='__manque')src=BP.filter(b=>!owned(b.id));
      else if(r.fam)src=BP.filter(b=>b.category===r.fam);
      l=src.filter(b=>!t||norm(b.name).includes(t)).map(b=>({t:'bp',id:b.id}));
    }else{
      let src=lootIds;
      if(r.fam)src=src.filter(id=>LOOT[id].type===r.fam);
      l=src.filter(id=>!t||norm(LOOT[id].name).includes(t)).map(id=>({t:'loot',id}));
    }
    return l;
  }

  function rayonHTML(cible){
    const r=rayon[cible],l=catalogue(cible);
    const fams=r.t==='bp'
      ? [['','Tous'],['__trop','Mes doublons'],['__manque','Ce qui me manque'],...FAMILLES_BP.map(f=>[f,f])]
      : [['','Tout'],...FAMILLES_LOOT.map(f=>[f,f])];
    const compte=k=>{const avant=r.fam;r.fam=k;const n=catalogue(cible).length;r.fam=avant;return n;};
    return '<div class="mg-rayon">'+
      '<div class="mg-rayon-haut">'+
        '<div class="seg" role="radiogroup" aria-label="Rayon">'+
          [['bp','Schémas'],['loot','Butin']].map(([k,nom])=>'<button role="radio" aria-checked="'+(r.t===k)+'" data-act="mg-rayon" data-c="'+cible+'" data-v="'+k+'">'+nom+'</button>').join('')+'</div>'+
        '<label class="search">'+ico('search')+'<input type="search" data-cherche="'+cible+'" placeholder="Filtrer par nom" aria-label="Filtrer les objets" value="'+esc(r.q)+'"></label>'+
      '</div>'+
      '<div class="mg-fams">'+fams.map(([k,nom])=>{const n=compte(k);
        return n||k===r.fam?'<button class="chip-btn'+(r.fam===k?' on':'')+'" data-act="mg-fam" data-c="'+cible+'" data-v="'+esc(k)+'" aria-pressed="'+(r.fam===k)+'">'+esc(nom)+' <b>'+n+'</b></button>':'';}).join('')+'</div>'+
      (l.length?'<div class="mg-objets mg-catalogue">'+l.slice(0,120).map(o=>proposable(o,cible)).join('')+'</div>'+
         (l.length>120?'<p class="fine mg-trop">'+(l.length-120)+' autres : affine avec le filtre ou une famille.</p>':'')
        :'<p class="fine mg-trop">Rien ici. Enlève le filtre, ou change de rayon.</p>')+
      '</div>';
  }
  const proposable=(o,cible)=>{const b=o.t==='bp'?bpById.get(o.id):null,pris=dansListe(projet[cible]||[],o);
    return '<button class="mg-obj'+(b?' '+O.rarityClass(b.rarity):' est-butin')+(pris?' pris':'')+'" data-act="mg-ajout" data-c="'+cible+'" data-t="'+o.t+'" data-id="'+esc(o.id)+'" title="'+esc(nomDe(o))+(pris?' — déjà choisi, touche pour retirer':'')+'" aria-pressed="'+pris+'" aria-label="'+(pris?'Retirer ':'Ajouter ')+esc(nomDe(o))+'">'+
      '<span class="mg-art">'+visuel(o)+'<span class="mg-plus" aria-hidden="true">'+(pris?'✓':'+')+'</span></span><b>'+esc(nomDe(o))+'</b></button>';};
  function bloc(cible,titre,aide){
    const l=projet[cible];
    return '<section class="mg-bloc"><h3>'+titre+' <b class="mg-n">'+l.length+'</b></h3><p class="fine">'+aide+'</p>'+
      '<div class="mg-panier"'+(l.length?' data-plein':'')+'>'+(l.length?'<div class="mg-objets">'+l.map(o=>vignette(o,{retirer:cible})).join('')+'</div>':'<span class="fine">Rien pour l’instant. Touche un objet ci-dessous pour l’ajouter.</span>')+'</div>'+
      rayonHTML(cible)+'</section>';
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
      '<div class="mg-actions"><button class="btn primary" data-act="mg-envoyer">Publier'+
        ((projet.donne.length+projet.cherche.length)?' <b>'+(projet.donne.length+projet.cherche.length)+' objet'+((projet.donne.length+projet.cherche.length)>1?'s':'')+'</b>':'')+
        '</button><button class="btn" data-act="close-sheet">Annuler</button></div>'+
      '<p class="fine">Le troc se fait en jeu, de la main à la main. Jamais d’argent réel : le site n’en demande ni n’en permet.</p>',
      {wide:true,label:'Publier une annonce'});
    for(const inp of $$('[data-cherche]'))inp.addEventListener('input',e=>{
      const c=e.target.dataset.cherche;rayon[c].q=e.target.value;
      const z=e.target.closest('.mg-rayon');if(!z)return;
      const neuf=document.createElement('div');neuf.innerHTML=rayonHTML(c);
      z.querySelector('.mg-fams').replaceWith(neuf.querySelector('.mg-fams'));
      const anc=z.querySelector('.mg-catalogue,.mg-trop'),nou=neuf.querySelector('.mg-catalogue,.mg-trop');
      if(anc&&nou)anc.replaceWith(nou);});
    const m=$('[data-mot]');if(m)m.addEventListener('input',e=>{projet.mot=e.target.value;});
  }


  /* ══ Escouades ══════════════════════════════════════════════════════════
     Le besoin que le site ne couvrait pas : trouver deux joueurs pour ce soir sans
     faire le tour de dix serveurs Discord. Un appel dit ce qu'on va faire, avec qui,
     dans quelle langue, et pour combien de temps il tient. Passé son heure, il disparaît
     tout seul : rien n'est plus décourageant qu'une annonce morte. */
  const STYLES=[['quetes','Quêtes','Avancer les contrats des marchands'],
    ['schemas','Schémas','Chercher des schémas précis'],
    ['butin','Butin','Remplir le sac et ressortir'],
    ['arc','Chasse aux ARC','Abattre du gros : Bastion, Bombardier, Turbine'],
    ['pvp','PvP','Chercher le combat entre raiders'],
    ['decouverte','Découverte','Apprendre la carte, sans pression']];
  const PLATEFORMES=[['peu-importe','Peu importe'],['pc','PC'],['playstation','PlayStation'],['xbox','Xbox']];
  const LANGUES=[['fr','Français'],['en','Anglais'],['peu-importe','Peu importe']];
  const NIVEAUX=[['tous','Tous niveaux'],['debutants','Débutants bienvenus'],['experimentes','Expérimentés']];
  const nomStyle=k=>STYLES.find(x=>x[0]===k)?.[1]||k;
  const nomDans=(l,k)=>l.find(x=>x[0]===k)?.[1]||k;

  let appels=null,chargeA=false,erreurA='',styleFiltre='',frSeul=false,arretAppels=null;
  const CLE_APPEL='speranza.ops.appel.v1';
  let brouillon={style:'quetes',places:2,plateforme:'peu-importe',langue:'fr',niveau:'tous',carte:'',minutes:120,mot:'',partageCode:true};
  try{Object.assign(brouillon,JSON.parse(O.read(CLE_APPEL))||{});}catch{}

  async function chargerAppels(){
    if(chargeA)return;chargeA=true;erreurA='';
    const r=await O.net?.appels?.();
    chargeA=false;
    if(r===null||r===undefined){erreurA=O.net?.usable?'La base n’a pas répondu.':'';appels=appels||[];}
    else appels=r;
    if(onglet==='escouades')vue()?.refresh?.();
  }

  const reste=a=>{const m=Math.round((Date.parse(a.expire_le)-Date.now())/60000);
    return m<1?'se termine':m<60?'encore '+m+' min':'encore '+Math.floor(m/60)+' h'+(m%60?' '+String(m%60).padStart(2,'0'):'');};

  function outilsEscouades(){
    const n=k=>(appels||[]).filter(a=>!k||a.style===k).length;
    return '<div class="seg" role="radiogroup" aria-label="Ce que l’escouade va faire"><button role="radio" aria-checked="'+(!styleFiltre)+'" data-act="es-style" data-v="">Tout <b>'+n()+'</b></button>'+
      STYLES.map(([k,nom])=>{const c=n(k);return c?'<button role="radio" aria-checked="'+(styleFiltre===k)+'" data-act="es-style" data-v="'+k+'">'+esc(nom)+' <b>'+c+'</b></button>':'';}).join('')+'</div>'+
      '<button class="chip-btn'+(frSeul?' on':'')+'" data-act="es-fr" aria-pressed="'+frSeul+'">Francophones</button>'+
      '<button class="btn primary" data-act="es-lancer">'+ico('people')+'Lancer un appel</button>'+
      '<button class="btn" data-act="es-aide">Comment ça marche</button>';
  }

  function carteAppel(a){
    const m=a.carte?mapById(a.carte):null;
    const mien=a.mien;
    const manque=m&&!mien?O.missingOn(m).length:0;
    const ligne=[nomDans(LANGUES,a.langue),nomDans(PLATEFORMES,a.plateforme),nomDans(NIVEAUX,a.niveau)].filter(Boolean);
    return '<article class="rd-appel" data-style="'+a.style+'"'+(mien?' data-mien':'')+'>'+
      (manque?'<p class="mg-match">'+ico('check')+'Il te manque '+manque+' schéma'+(manque>1?'s':'')+' sur '+esc(m.short||m.name)+'.</p>':'')+
      '<header><span class="rd-style">'+esc(nomStyle(a.style))+'</span><b class="mg-pseudo">'+esc(a.pseudo)+(mien?' <em class="rd-mien">ton appel</em>':'')+'</b>'+
        '<small class="rd-reste">'+esc(reste(a))+'</small></header>'+
      '<p class="rd-meta">'+ligne.map(esc).join(' · ')+(m?' · <b>'+esc(m.name)+'</b>':'')+'</p>'+
      (a.mot?'<p class="mg-mot">'+esc(a.mot)+'</p>':'')+
      '<p class="rd-places"><b>'+a.places+'</b> place'+(a.places>1?'s':'')+' libre'+(a.places>1?'s':'')+
        (a.code?' · <span class="rd-code">code d’escouade partagé</span>':'')+'</p>'+
      '<div class="row tight">'+
        (mien?'<button class="btn small danger" data-act="es-fermer" data-id="'+a.id+'">Clore mon appel</button>'
             :'<button class="btn small primary" data-act="es-rejoindre" data-id="'+a.id+'">Rejoindre</button>'+
              '<button class="btn small" data-act="mg-copier" data-g="'+esc(a.pseudo)+'">Copier le pseudo</button>')+
      '</div></article>';
  }

  function corpsEscouades(){
    if(!O.net?.usable)return '<div class="empty"><h2>Les escouades ne sont pas encore branchées</h2><p>Cette copie du site tourne sans base partagée : les appels ne peuvent ni partir ni arriver.</p></div>';
    if(erreurA&&!(appels||[]).length)return '<div class="empty"><h2>La base n’a pas répondu</h2><p>Les appels des autres raiders n’ont pas pu être chargés.</p><button class="btn primary" data-act="es-recharger">Réessayer</button></div>';
    if(appels===null)return '<div class="empty"><h2>On regarde qui cherche du monde…</h2></div>';
    let l=appels.filter(a=>(!styleFiltre||a.style===styleFiltre)&&(!frSeul||a.langue==='fr'));
    l=l.sort((x,y)=>(y.mien-x.mien)||Date.parse(y.cree_le)-Date.parse(x.cree_le));
    if(!l.length)return '<div class="empty"><h2>'+(styleFiltre||frSeul?'Personne sur ce filtre':'Aucun appel en cours')+'</h2>'+
      '<p>'+(styleFiltre||frSeul?'Enlève un filtre, ou lance le tien : il sera en tête.':'Lance le premier. Un appel tient une à six heures, puis disparaît tout seul — pas d’escouade fantôme.')+'</p>'+
      '<button class="btn primary" data-act="es-lancer">Lancer un appel</button></div>';
    return '<div class="mg-grid">'+l.map(carteAppel).join('')+'</div>';
  }

  /* ── Lancer un appel ── */
  function choix(nom,cle,options,aide){
    return '<section class="mg-bloc"><h3>'+nom+'</h3>'+(aide?'<p class="fine">'+aide+'</p>':'')+
      '<div class="seg" role="radiogroup" aria-label="'+esc(nom)+'">'+options.map(([k,label,sous])=>
        '<button role="radio" aria-checked="'+(String(brouillon[cle])===String(k))+'" data-act="es-champ" data-c="'+cle+'" data-v="'+k+'"'+(sous?' title="'+esc(sous)+'"':'')+'>'+esc(label)+'</button>').join('')+'</div></section>';
  }
  function formAppel(message=''){
    const pseudo=P.gameName?.()||'',code=window.AtlasDuo?.code?.()||'';
    const sous=STYLES.find(x=>x[0]===brouillon.style)?.[2]||'';
    O.openSheet('<h2>Lancer un appel</h2><p class="fine">Les autres raiders le verront tout de suite. Il disparaît de lui-même à l’heure que tu fixes.</p>'+
      choix('Ce que vous allez faire','style',STYLES.map(([k,n])=>[k,n]),sous)+
      choix('Places libres','places',[[2,'2 places'],[1,'1 place']],'Une escouade compte trois raiders, toi compris.')+
      choix('Langue','langue',LANGUES)+
      choix('Plateforme','plateforme',PLATEFORMES)+
      choix('Niveau','niveau',NIVEAUX)+
      choix('Durée de l’appel','minutes',[[60,'1 h'],[120,'2 h'],[240,'4 h'],[360,'6 h']],'Passé ce délai, l’appel s’efface. Personne ne répond à une annonce morte.')+
      '<section class="mg-bloc"><h3>Carte visée <small>facultatif</small></h3><p class="fine">Si tu la précises, le site dira aux autres combien de schémas il leur manque là-bas.</p>'+
        '<select data-act="es-carte" aria-label="Carte visée"><option value="">Peu importe</option>'+MAPS.map(m=>'<option value="'+m.id+'"'+(brouillon.carte===m.id?' selected':'')+'>'+esc(m.name)+'</option>').join('')+'</select></section>'+
      '<section class="mg-bloc"><h3>Un mot (facultatif)</h3><input type="text" data-mot-appel maxlength="160" placeholder="Micro bienvenu, on part dans 10 min…" value="'+esc(brouillon.mot)+'" aria-label="Un mot pour accompagner l’appel"></section>'+
      '<section class="mg-bloc"><h3>Ton pseudo en jeu</h3>'+
        (pseudo?'<p>Publié sous <b>'+esc(pseudo)+'</b>. <button class="link" data-act="mg-pseudo">Le changer</button></p>'
               :'<p class="notice">Il faut ton pseudo ARC Raiders complet pour qu’on puisse t’ajouter. <button class="link" data-act="mg-pseudo">L’indiquer</button></p>')+
        (code?'<label class="own"><input type="checkbox" data-act="es-partage"'+(brouillon.partageCode?' checked':'')+'><span>Partager aussi mon code d’escouade <b class="mono">'+esc(code.slice(0,4)+'-'+code.slice(4))+'</b> : ceux qui rejoignent verront vos positions et vos schémas sur le site.</span></label>'
              :'<p class="fine">Tu n’as pas d’escouade sur le site. Tu peux en créer une depuis le bouton Escouade en haut, pour partager aussi positions et schémas.</p>')+'</section>'+
      (message?'<p class="mg-erreur" role="alert">'+esc(message)+'</p>':'')+
      '<div class="mg-actions"><button class="btn primary" data-act="es-envoyer">Lancer l’appel</button><button class="btn" data-act="close-sheet">Annuler</button></div>',
      {wide:true,label:'Lancer un appel'});
    const m=$('[data-mot-appel]');if(m)m.addEventListener('input',e=>{brouillon.mot=e.target.value;});
  }

  Object.assign(actions,{
    'rd-onglet':d=>{onglet=d.v==='echanges'?'echanges':'escouades';O.write('speranza.ops.raiders.onglet',onglet);vue()?.refresh();},
    'es-style':d=>{styleFiltre=d.v;vue()?.refresh();},
    'es-fr':()=>{frSeul=!frSeul;vue()?.refresh();},
    'es-recharger':()=>{appels=null;vue()?.refresh();chargerAppels();},
    'es-lancer':()=>formAppel(),
    'es-champ':d=>{brouillon[d.c]=/^\d+$/.test(d.v)?Number(d.v):d.v;O.write(CLE_APPEL,JSON.stringify(brouillon));formAppel();},
    'es-carte':(d,el)=>{brouillon.carte=el.value;O.write(CLE_APPEL,JSON.stringify(brouillon));},
    'es-partage':(d,el)=>{brouillon.partageCode=el.checked;O.write(CLE_APPEL,JSON.stringify(brouillon));},
    'es-aide':()=>O.openSheet('<h2>Les escouades, en clair</h2>'+
      '<h3>Un appel, pas un salon</h3><p>Tu dis ce que tu vas faire, dans quelle langue, sur quelle plateforme et pour combien de temps. Les autres te trouvent en quelques secondes, sans rejoindre dix serveurs Discord.</p>'+
      '<h3>Pourquoi une heure de fin</h3><p>Un appel tient d’une à six heures, puis s’efface. Une annonce de la semaine dernière ne rend service à personne : mieux vaut une liste courte et vivante.</p>'+
      '<h3>Rejoindre</h3><p>« Rejoindre » copie le pseudo du raider pour que tu l’ajoutes en jeu. S’il a partagé son code d’escouade, le site te propose aussi de le rejoindre ici : vous verrez alors vos positions, vos chronos d’ARC et vos schémas en commun.</p>'+
      '<h3>Ce qui part de chez toi</h3><p>Ce que tu écris dans l’appel, et rien d’autre : ton pseudo en jeu, tes choix, ton mot, et ton code d’escouade si tu coches la case. Ni collection, ni position, ni adresse.</p>'+
      '<p class="notice">Deux appels ouverts au maximum, pour que la liste reste lisible par tous.</p>',{label:'Aide des escouades'}),
    async 'es-envoyer'(){
      const pseudo=P.gameName?.()||'';
      if(!P.gameOk?.(pseudo)){formAppel('Indique d’abord ton pseudo ARC Raiders complet, numéro compris.');P.askGame?.();return;}
      const code=brouillon.partageCode?(window.AtlasDuo?.code?.()||''):'';
      const r=await O.net.lancerAppel({...brouillon,pseudo,code});
      if(!r.ok){formAppel(r.mot);return;}
      O.closeSheet?.();O.toast('Appel lancé. Il s’effacera tout seul dans '+(brouillon.minutes<120?'1 h':Math.round(brouillon.minutes/60)+' h')+'.');
      O.write(CLE_APPEL,JSON.stringify(brouillon));chargerAppels();
    },
    async 'es-fermer'(d){
      if(!confirm('Clore cet appel ? Il disparaîtra de la liste.'))return;
      if(await O.net.majAppel(Number(d.id),{expire_le:new Date(Date.now()-1000).toISOString()})){O.toast('Appel clos.');chargerAppels();}
      else O.toast('La fermeture n’a pas abouti. Réessaie dans un instant.');
    },
    async 'es-rejoindre'(d){
      const a=(appels||[]).find(x=>String(x.id)===String(d.id));if(!a)return;
      const moi=P.gameName?.()||P.name?.()||'un raider';
      try{await navigator.clipboard.writeText(a.pseudo);O.toast('Pseudo copié : ajoute '+a.pseudo+' dans ARC Raiders.');}
      catch{O.toast('Ajoute '+a.pseudo+' dans ARC Raiders.');}
      if(a.code&&window.AtlasDuo?.join){
        if(confirm('Rejoindre aussi son escouade sur le site ? Vous verrez vos positions, vos chronos d’ARC et vos schémas en commun.\n\nTu quitteras ton escouade actuelle si tu en as une.')){
          if(window.AtlasDuo.join(a.code))O.toast('Escouade rejointe. Dis-lui que tu es '+moi+'.');
        }
      }
    },
    'mg-filtre':d=>{filtre=d.v;vue()?.refresh();},
    'mg-recharger':()=>{liste=null;vue()?.refresh();charger();},
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
      if(dansListe(projet[c],o)){projet[c]=projet[c].filter(x=>clef(x)!==clef(o));formulaire();return;}
      if(projet[c].length>=12){O.toast('Douze objets au maximum par côté.');return;}
      projet[c].push(o);formulaire();},
    'mg-rayon':d=>{const c=d.c==='cherche'?'cherche':'donne';rayon[c].t=d.v;rayon[c].fam='';rayon[c].q='';formulaire();},
    'mg-fam':d=>{const c=d.c==='cherche'?'cherche':'donne';rayon[c].fam=rayon[c].fam===d.v?'':d.v;formulaire();},
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

  window.addEventListener('atlas:profiles',()=>vue()?.refresh?.());
})();
