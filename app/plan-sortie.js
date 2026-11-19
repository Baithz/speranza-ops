/* Speranza Ops — « Qu'est-ce qu'on fait ce soir ? »
   Le site savait déjà répondre à « qu'est-ce qu'il me manque » et « où le trouver ».
   Il manquait la question que se pose un joueur qui lance le jeu : avec le temps que j'ai,
   le nombre qu'on est et ce que je veux avancer, où est-ce que je pars, et pour y faire quoi ?

   Tout vient des données déjà présentes : ta collection, tes quêtes, les événements de carte
   et les points d'ARC relevés. Rien n'est inventé ; ce qui manque est dit comme tel. */
(() => {
  'use strict';
  const O=window.OPS,{$,$$,esc,ico,read,write,MAPS,mapById,mapByName,BP,owned,actions,sched}=O;

  const BUTS=[['schemas','Schémas','Compléter ta collection'],
    ['quetes','Quêtes','Avancer les contrats des marchands'],
    ['butin','Butin','Remplir le sac et ressortir'],
    ['arc','Chasse aux ARC','Abattre du gros et récupérer ses pièces']];
  const EFFECTIFS=[[1,'Solo'],[2,'Duo'],[3,'Trio']];
  const DUREES=[[20,'20 min'],[45,'45 min'],[90,'1 h 30']];

  const CLE='speranza.ops.plan-sortie.v1';
  let etat={but:'schemas',effectif:1,duree:45,ouvert:false,resultat:null};
  try{Object.assign(etat,JSON.parse(read(CLE))||{},{ouvert:false,resultat:null});}catch{}
  const garder=()=>write(CLE,JSON.stringify({but:etat.but,effectif:etat.effectif,duree:etat.duree}));

  /* Les événements de carte qui changent vraiment ce qu'on va chercher. Le site connaît leurs
     noms français ; on ne garde que ceux dont l'effet est documenté côté butin ou côté ARC. */
  const BONUS={schemas:['Tempête électromagnétique','Portail verrouillé','Raid nocturne','Bunker caché'],
    butin:['Fouille du littoral','Cimetière de carcasses','Butin de la tour de lancement','Sondes de prospection','Floraisons luxuriantes','Ville aux oiseaux'],
    arc:['Matriarche','Récolteur','Frégate ARC','Raid nocturne'],
    quetes:[]};

  const evenements=(m,now)=>sched.active(m,now).map(e=>e.title);
  const coupDePouce=(m,but,now)=>evenements(m,now).filter(t=>(BONUS[but]||[]).includes(t));

  /* ── Choix de la carte, selon ce que tu veux avancer ── */
  function schemasPar(m){return O.missingOn(m);}
  function quetesPar(m){
    const Q=window.OPS_QUESTS;if(!Q)return [];
    const faits=O.ops().quetes||{};
    const faite=id=>faits[id]==='done',ouverte=q=>!q.apres?.length||q.apres.every(faite);
    return Q.liste.filter(q=>!faite(q.id)&&ouverte(q)&&(q.cartes||[]).some(c=>c===m.id||mapByName(c)===m));
  }
  function arcsPar(m){
    const d=window.RAID_MAP_DATA?.maps.find(x=>x.id===m.id);
    if(!d)return 0;
    const gros=['arc-bastion','arc-bombardier','arc-rocketeer','arc-leaper','arc-turbine','arc-matriarch','arc-queen','arc-comet','arc-shredder'];
    return d.points.filter(p=>gros.includes(p[2])).length;
  }

  function classer(but,now){
    return MAPS.map(m=>{
      const pouce=coupDePouce(m,but,now);
      let note=0,detail='';
      if(but==='schemas'){const l=schemasPar(m);note=l.length;detail=l.length?l.length+' schéma'+(l.length>1?'s':'')+' à trouver ici':'aucun schéma manquant documenté ici';}
      else if(but==='quetes'){const l=quetesPar(m);note=l.length*2;detail=l.length?l.length+' quête'+(l.length>1?'s':'')+' faisable'+(l.length>1?'s':'')+' ici':'aucune quête rattachée à cette carte';}
      else if(but==='arc'){const n=arcsPar(m);note=n/4;detail=n?n+' points de gros ARC relevés':'pas de gros ARC relevé ici';}
      else{const n=O.missingOn(m).length;note=n/3;detail='fouille libre';}
      note+=pouce.length*(but==='butin'?6:3);
      return {m,note,detail,pouce};
    }).sort((a,b)=>b.note-a.note);
  }

  /* ── Les étapes du plan : des lieux réels, tirés des mêmes données que le reste du site ── */
  const COMBIEN={20:3,45:5,90:7};
  function etapes(but,m,combien){
    const out=[];
    if(but==='schemas'||but==='butin'){
      const vus=new Set();
      for(const b of O.missingOn(m)){
        const loc=(b.locations||[]).find(l=>mapByName(l.map)===m);
        const lieu=loc?String(loc.place).split(',')[0].trim():'';
        if(!lieu||vus.has(lieu))continue;
        vus.add(lieu);
        out.push({lieu,quoi:b.name,act:'bp',id:b.id});
        if(out.length>=combien)break;
      }
    }
    if(but==='quetes'){
      for(const q of quetesPar(m).slice(0,combien))
        out.push({lieu:q.repere||q.objectifs?.[0]||'Sur la carte',quoi:q.nom,act:'qt-open',id:q.id});
    }
    if(but==='arc'){
      const d=window.RAID_MAP_DATA?.maps.find(x=>x.id===m.id);
      if(d){
        const noms={'arc-bastion':'Bastion','arc-bombardier':'Bombardier','arc-rocketeer':'Artificier','arc-leaper':'Bondisseur','arc-turbine':'Turbine ARC','arc-matriarch':'Matriarche','arc-queen':'Reine','arc-comet':'Comète','arc-shredder':'Déchiqueteuse'};
        const places=d.points.filter(p=>['sector','label','areas'].includes(p[2])&&typeof p[4]==='string'&&p[4]);
        const compte={};
        for(const p of d.points.filter(p=>noms[p[2]])){
          let best=null,dist=Infinity;
          for(const q of places){if(q[3]!==p[3])continue;const k=(q[0]-p[0])**2+(q[1]-p[1])**2;if(k<dist){dist=k;best=q;}}
          const lieu=best?best[4]:'Point relevé';
          (compte[lieu]??=new Set()).add(noms[p[2]]);
        }
        for(const [lieu,set] of Object.entries(compte).sort((a,b)=>b[1].size-a[1].size).slice(0,combien))
          out.push({lieu,quoi:[...set].join(', '),act:'sp-open',id:m.id});
      }
    }
    return out;
  }

  /* Le conseil qui change selon l'effectif et le temps : c'est là que le site cesse d'être
     une encyclopédie pour devenir un copilote. */
  function conseil(but,effectif,duree,m,pouce){
    const l=[];
    if(duree===20)l.push('Vingt minutes, c’est une sortie et pas deux : entre, prends ce que tu es venu chercher, extrais-toi. Ne reste pas pour le dernier conteneur.');
    else if(duree===45)l.push('Quarante-cinq minutes couvrent un raid entier plus le temps de vider ton sac à Speranza. Prévois de sortir vers les dix minutes restantes.');
    else l.push('Une heure trente, c’est trois sorties. Change de point d’entrée à chaque fois : la carte se vide là où tu es passé.');
    if(effectif===1){
      if(but==='arc')l.push('Seul, un Bastion ou un Bombardier coûte plus de munitions qu’il ne rapporte. Vise l’Artificier isolé, ou attends d’être deux.');
      else l.push('Seul, le silence vaut une arme : le Mouchard appelle des renforts dès qu’il t’entend tirer.');
    }else if(effectif===2)l.push('À deux, l’un fixe l’ARC pendant que l’autre tire le point faible. C’est ce qui fait tomber un Bastion sans y laisser un chargeur entier.');
    else l.push('À trois, les gros ARC deviennent rentables, et vous pouvez tenir deux extractions différentes si ça tourne mal.');
    if(pouce.length)l.push('En ce moment sur cette carte : '+pouce.join(', ')+'. C’est le moment d’y aller plutôt que demain.');
    return l;
  }

  function calculer(){
    const now=Date.now(),rangs=classer(etat.but,now),premier=rangs[0];
    if(!premier)return null;
    if(premier.note<=0)return {vide:true,but:etat.but};
    return {m:premier.m,detail:premier.detail,pouce:premier.pouce,
      etapes:etapes(etat.but,premier.m,COMBIEN[etat.duree]||5),
      conseils:conseil(etat.but,etat.effectif,etat.duree,premier.m,premier.pouce),
      suivantes:rangs.slice(1,3).filter(r=>r.note>0)};
  }

  /* ── Rendu ── */
  const seg=(label,cle,options)=>'<div class="ps-champ"><span>'+label+'</span><div class="seg" role="radiogroup" aria-label="'+esc(label)+'">'+
    options.map(([v,nom,sous])=>'<button role="radio" aria-checked="'+(String(etat[cle])===String(v))+'" data-act="ps-champ" data-c="'+cle+'" data-v="'+v+'"'+(sous?' title="'+esc(sous)+'"':'')+'>'+esc(nom)+'</button>').join('')+'</div></div>';

  const RIEN={schemas:['Ta collection est complète sur les cartes documentées.','Rien à aller chercher côté schémas : choisis plutôt le butin ou les quêtes.'],
    quetes:['Aucune quête faisable n’est rattachée à une carte précise en ce moment.','Soit tu les as toutes faites, soit celles qui restent attendent une quête précédente. L’écran Quêtes te dira laquelle.'],
    butin:['Rien ne ressort pour le butin en ce moment.','Aucun événement de butin n’est actif sur les cartes suivies.'],
    arc:['Les points de gros ARC ne sont pas chargés.','Ouvre l’onglet Spawn ARC d’une carte une fois, puis réessaie.']};
  function resultatHTML(r){
    if(!r)return '';
    if(r.vide){const[t,p]=RIEN[r.but]||['Rien à proposer.',''];
      return '<div class="ps-plan ps-rien" role="status"><p><b>'+esc(t)+'</b></p><p class="fine">'+esc(p)+'</p>'+
        '<div class="row tight">'+(r.but==='quetes'?'<button class="btn small" data-act="go" data-view="quetes">Ouvrir les quêtes</button>':'')+
        (r.but==='schemas'?'<button class="btn small" data-act="go" data-view="collection">Ouvrir mes schémas</button>':'')+'</div></div>';}
    const ev=sched.active(r.m,Date.now());
    return '<div class="ps-plan" role="status">'+
      '<div class="ps-tete" style="--shot:url(\''+r.m.shot+'\')"><div><p class="ps-k">Ta sortie</p><h3>'+esc(r.m.name)+'</h3>'+
        '<p class="ps-why">'+esc(r.detail)+(r.pouce.length?' · <b>'+esc(r.pouce.join(', '))+'</b>':ev.length?' · '+esc(ev.map(e=>e.title).join(', ')):'')+'</p></div>'+
        '<div class="row tight"><button class="btn primary" data-act="prep" data-map="'+r.m.id+'">Préparer cette sortie</button><button class="btn" data-act="openmap" data-map="'+r.m.id+'">'+ico('map')+'Voir le plan</button></div></div>'+
      (r.etapes.length?'<ol class="ps-etapes">'+r.etapes.map(e=>'<li><b>'+esc(e.lieu)+'</b><span>'+esc(e.quoi)+'</span>'+
          (e.act==='bp'?'<button class="link" data-act="bp" data-id="'+esc(e.id)+'">Voir le schéma</button>':
           e.act==='sp-open'?'<button class="link" data-act="sp-open" data-map="'+esc(e.id)+'">Voir les points</button>':'')+'</li>').join('')+'</ol>'
        :'<p class="fine ps-vide">Le site n’a pas de lieu précis à te donner pour cet objectif sur cette carte. Pars au jugé, et marque ce que tu trouves : les prochains plans s’en serviront.</p>')+
      '<ul class="ps-conseils">'+r.conseils.map(c=>'<li>'+esc(c)+'</li>').join('')+'</ul>'+
      (r.suivantes.length?'<p class="fine">Sinon : '+r.suivantes.map(s=>'<button class="link" data-act="prep" data-map="'+s.m.id+'">'+esc(s.m.name)+'</button>').join(' · ')+'</p>':'')+
      '</div>';
  }

  function blocHTML(){
    const but=BUTS.find(b=>b[0]===etat.but);
    return '<section class="ps" aria-labelledby="psTitre">'+
      '<div class="ps-haut"><h2 id="psTitre">Qu’est-ce qu’on fait ce soir ?</h2>'+
        (etat.ouvert?'<button class="link" data-act="ps-fermer">Replier</button>':'')+'</div>'+
      (etat.ouvert
        ? '<div class="ps-champs">'+seg('Ton objectif','but',BUTS.map(([v,n,s])=>[v,n,s]))+seg('Vous êtes','effectif',EFFECTIFS)+seg('Temps devant toi','duree',DUREES)+'</div>'+
          '<p class="fine ps-sous">'+esc(but?.[2]||'')+'</p>'+
          '<div class="row"><button class="btn primary big" data-act="ps-calc">'+ico('compass')+'Trouve-moi une sortie</button></div>'+
          resultatHTML(etat.resultat)
        : '<p>Dis-moi ce que tu veux avancer, combien vous êtes et le temps que tu as. Je te donne une carte, un itinéraire et de quoi t’y préparer.</p>'+
          '<div class="row"><button class="btn primary" data-act="ps-ouvrir">'+ico('compass')+'Préparer ma soirée</button></div>')+
      '</section>';
  }

  function dessiner(){
    const v=O.views.accueil;if(!v?.el||v.el.hidden)return;
    const place=$('.ps',v.el);
    if(place)place.outerHTML=blocHTML();
    else{const hero=$('.brief',v.el);if(hero)hero.insertAdjacentHTML('afterend',blocHTML());else v.el.insertAdjacentHTML('afterbegin',blocHTML());}
  }

  const accueil=O.views.accueil,avant=accueil.refresh;
  accueil.refresh=function(){avant.apply(this,arguments);dessiner();};

  Object.assign(actions,{
    'ps-ouvrir':()=>{etat.ouvert=true;dessiner();$('.ps .seg button[aria-checked=true]')?.focus({preventScroll:true});},
    'ps-fermer':()=>{etat.ouvert=false;etat.resultat=null;dessiner();},
    'ps-champ':d=>{etat[d.c]=/^\d+$/.test(d.v)?Number(d.v):d.v;garder();if(etat.resultat)etat.resultat=calculer();dessiner();},
    async 'ps-calc'(){
      // Les points d'ARC vivent dans les données de carte : on ne les charge que si on en a besoin.
      if(etat.but==='arc'&&!window.RAID_MAP_DATA)await O.load('engine/maps-data.js').catch(()=>{});
      if(etat.but==='quetes'&&!window.OPS_QUESTS)await O.load('engine/quests-data.js').catch(()=>{});
      etat.resultat=calculer();dessiner();
      $('.ps-plan',O.views.accueil.el)?.scrollIntoView({block:'nearest',behavior:'smooth'});
    }
  });
})();
