/* Speranza Ops — Quêtes des marchands.
   L'écran sert à répondre à une seule question : qu'est-ce que je peux avancer maintenant,
   et sur quelle carte. L'avancement est noté par le joueur ; le jeu ne le dit pas au site. */
(() => {
  'use strict';
  const O=window.OPS,{$,$$,esc,ico,norm,actions,mapById,MAPS}=O;
  let ready=null;const data=()=>ready??=O.load('engine/quests-data.js').catch(()=>{});
  const Q=()=>window.OPS_QUESTS||{liste:[],marchands:[],sources:[]};
  // L'avancement vit avec le reste du profil : il suit le joueur et part dans sa sauvegarde.
  const etats=()=>O.ops().quetes??={};
  const etat=id=>etats()[id]||'todo';
  const compte=l=>l.filter(q=>etat(q.id)==='done').length;
  const nomDe=id=>Q().liste.find(q=>q.id===id)?.nom||id;
  // Les notes personnelles vivent avec celles des schémas, préfixées pour ne pas s'y mélanger.
  const cleNote=id=>'quete:'+id;
  const note=id=>O.P.snapshot().notes[cleNote(id)]||'';
  // Une quête est « ouverte » si tout ce qui la précède est fait. Sans prérequis connu, elle l'est.
  const ouverte=q=>!q.apres?.length||q.apres.every(a=>etat(a)==='done');

  function carte(q){
    const e=etat(q.id),bloquee=e!=='done'&&!ouverte(q);
    const cartes=q.cartes.map(id=>mapById(id)).filter(Boolean);
    return '<article class="qt" data-etat="'+e+'"'+(bloquee?' data-bloquee':'')+' data-id="'+q.id+'">'+
      '<header><h3>'+esc(q.nom)+'</h3>'+
        (cartes.length?'<p class="qt-maps">'+cartes.map(m=>'<button class="chip-btn" data-act="qt-map" data-map="'+m.id+'">'+ico('map')+esc(m.short)+'</button>').join('')+'</p>'
          :'<p class="qt-maps"><em class="tag">Toute carte</em></p>')+'</header>'+
      (q.objectifs?.length?'<ul class="qt-obj">'+q.objectifs.map(o=>'<li>'+esc(o)+'</li>').join('')+'</ul>':'')+
      (q.recompenses?.length?'<p class="qt-rec"><b>Récompense</b> '+q.recompenses.map(esc).join(' · ')+'</p>':'')+
      (q.astuce?'<p class="qt-tip">'+ico('star')+'<span>'+esc(q.astuce)+(q.source?' <a href="'+q.source+'" target="_blank" rel="noopener">source</a>':'')+'</span></p>':'')+
      (note(q.id)?'<p class="qt-note"><b>Ma note</b> '+esc(note(q.id))+'</p>':'')+
      (bloquee?'<p class="qt-lock">'+ico('clock')+'S’ouvre après '+q.apres.map(a=>'<b>'+esc(nomDe(a))+'</b>').join(' et ')+'</p>':'')+
      '<div class="qt-do">'+
        '<button class="btn small'+(e==='done'?' primary':'')+'" data-act="qt-state" data-id="'+q.id+'" data-v="'+(e==='done'?'todo':'done')+'">'+(e==='done'?'Faite':'Marquer faite')+'</button>'+
        (e==='done'?'':'<button class="btn small" data-act="qt-state" data-id="'+q.id+'" data-v="'+(e==='doing'?'todo':'doing')+'" aria-pressed="'+(e==='doing')+'">'+(e==='doing'?'En cours':'Je m’y mets')+'</button>')+
        (q.repere?'<button class="btn small" data-act="qt-plan" data-id="'+q.id+'">'+ico('map')+'Voir sur le plan</button>':'')+
        '<button class="link" data-act="qt-note" data-id="'+q.id+'">'+(note(q.id)?'Modifier ma note':'Noter une astuce')+'</button>'+
      '</div></article>';
  }

  O.register('quetes',{title:'Quêtes',short:'Quêtes',icon:'star',pos:5,f:{marchand:'',carte:'',q:'',cacher:false,partout:false},
    async mount(el){
      await data();
      el.innerHTML='<header class="view-head"><h1>Quêtes</h1><p data-count></p></header>'+
        '<div class="tools">'+
          '<div class="seg" role="radiogroup" aria-label="Marchand"><button role="radio" data-act="qt-trader" data-v="">Tous</button>'+
          Q().marchands.filter(t=>Q().liste.some(q=>q.marchand===t.id)).map(t=>'<button role="radio" data-act="qt-trader" data-v="'+t.id+'">'+esc(t.nom)+' <b></b></button>').join('')+'</div>'+
          '<label class="search">'+ico('search')+'<input type="search" data-search placeholder="Nom, objectif, récompense…" aria-label="Rechercher une quête"><kbd>/</kbd></label>'+
          '<select data-f="carte" aria-label="Carte"><option value="">Toutes les cartes</option>'+MAPS.map(m=>'<option value="'+m.id+'">'+esc(m.name)+'</option>').join('')+'</select>'+
          '<label class="field inline"><input type="checkbox" data-f="cacher"><span>Cacher les quêtes faites</span></label>'+
        '<button class="btn small" data-act="qt-partout" data-partout hidden></button>'+
        '</div><div data-grid></div>'+
        '<div class="row tight"><button class="link" data-act="qt-about">D’où viennent ces quêtes ?</button></div>';
      $('[data-search]',el).addEventListener('input',e=>{this.f.q=e.target.value;this.refresh();});
      el.addEventListener('change',e=>{const k=e.target.dataset.f;if(!k)return;
        this.f[k]=e.target.type==='checkbox'?e.target.checked:e.target.value;this.refresh();});
      this.refresh();
    },
    show(p){if(p?.carte){this.f.carte=p.carte;const s=$('[data-f=carte]',this.el);if(s)s.value=p.carte;}this.refresh();},
    refresh(){
      const el=this.el;if(!el||!$('[data-grid]',el))return;
      const f=this.f,mots=norm(f.q).split(/\s+/).filter(Boolean),tout=Q().liste;
      for(const b of $$('[data-act="qt-trader"]',el)){b.setAttribute('aria-checked',String(b.dataset.v===f.marchand));
        const n=b.querySelector('b');if(n)n.textContent=compte(tout.filter(q=>q.marchand===b.dataset.v))+'/'+tout.filter(q=>q.marchand===b.dataset.v).length;}
      // Filtrer sur une carte doit montrer ce qui se joue LÀ. Les quêtes de toute carte
      // noieraient le résultat : on les compte à part et on les ajoute sur demande.
      const partout=tout.filter(q=>!q.cartes.length&&(!f.marchand||q.marchand===f.marchand)).length;
      const liste=tout.filter(q=>(!f.marchand||q.marchand===f.marchand)
        &&(!f.carte||q.cartes.includes(f.carte)||(f.partout&&!q.cartes.length))
        &&(!f.cacher||etat(q.id)!=='done')
        &&(!mots.length||mots.every(t=>(q._t??=norm([q.nom,q.en,...(q.objectifs||[]),...(q.recompenses||[])].join(' '))).includes(t))));
      const fait=compte(tout);
      const manquants=Q().marchands.filter(t=>!tout.some(q=>q.marchand===t.id)).map(t=>t.nom);
      $('[data-count]',el).textContent=fait+' quête'+(fait>1?'s':'')+' faite'+(fait>1?'s':'')+' sur '+tout.length+
        (f.carte?' · filtrées sur '+mapById(f.carte).name:'')+(manquants.length?' · '+manquants.join(', ')+' à venir':'');
      const bout=$('[data-partout]',el);
      if(bout){bout.hidden=!f.carte;bout.setAttribute('aria-pressed',String(!!f.partout));
        bout.textContent=(f.partout?'Masquer':'Ajouter')+' les '+partout+' quêtes faisables partout';}
      const groupes=Q().marchands.map(t=>{
        const g=liste.filter(q=>q.marchand===t.id);if(!g.length)return '';
        const ouvertes=g.filter(q=>etat(q.id)!=='done'&&ouverte(q)),bloquees=g.filter(q=>etat(q.id)!=='done'&&!ouverte(q)),faites=g.filter(q=>etat(q.id)==='done');
        const n=tout.filter(q=>q.marchand===t.id),pct=Math.round(compte(n)/n.length*100);
        const bloc=(titre,items)=>items.length?'<h3 class="qt-sep">'+titre+' <b>'+items.length+'</b></h3><div class="qt-grid">'+items.map(carte).join('')+'</div>':'';
        return '<section class="qt-trader"><div class="bp-cat-head"><h2>'+esc(t.nom)+'</h2><small>'+esc(t.role)+'</small>'+
          '<b class="mono">'+compte(n)+' / '+n.length+'</b><span class="bp-bar" role="img" aria-label="'+pct+' % fait"><i style="width:'+pct+'%"></i></span></div>'+
          bloc('À faire maintenant',ouvertes)+bloc('Plus tard',bloquees)+bloc('Faites',faites)+'</section>';
      }).join('');
      $('[data-grid]',el).innerHTML=groupes||'<div class="empty"><h2>Aucune quête ici</h2><p>Change de marchand, de carte, ou efface la recherche.</p></div>';
    }});

  Object.assign(actions,{
    'qt-trader':d=>{const v=O.views.quetes;v.f.marchand=d.v;v.refresh();},
    'qt-map':d=>O.go('cartes',{map:d.map}),
    'qt-partout':()=>{const v=O.views.quetes;v.f.partout=!v.f.partout;v.refresh();},
    // Le plan du site sait déjà où sont les dépôts, les carcasses et les repères de quête.
    'qt-plan':d=>{
      const q=Q().liste.find(x=>x.id===d.id);if(!q?.repere)return;
      const carte=q.cartes[0]||O.ops().plan?.map||MAPS[0].id;
      if(window.openAtlasMap)window.openAtlasMap(carte,q.repere);
      else O.go('cartes',{map:carte});
    },
    'qt-note':d=>{
      const q=Q().liste.find(x=>x.id===d.id);if(!q)return;
      O.openSheet('<h2>'+esc(q.nom)+'</h2><p class="fine">Ce que tu notes ici reste dans ton profil, et part dans ta sauvegarde.</p>'+
        '<label class="field"><span>Ton astuce pour cette quête</span>'+
        '<textarea class="note" data-qnote maxlength="800" placeholder="Le coin exact, la porte à prendre, le piège à éviter…" aria-label="Astuce personnelle">'+esc(note(d.id))+'</textarea></label>'+
        '<div class="row"><a class="btn" href="https://duckduckgo.com/?q='+encodeURIComponent('ARC Raiders quête '+q.nom+(q.en?' '+q.en:'')+' guide')+'" target="_blank" rel="noopener">Chercher un guide en ligne</a></div>',{label:'Astuce — '+q.nom});
      const t=$('[data-qnote]');
      t.addEventListener('input',()=>{const s=O.P.snapshot();
        if(t.value.trim())s.notes[cleNote(d.id)]=t.value;else delete s.notes[cleNote(d.id)];
        O.P.savePrivate({pins:s.pins,notes:s.notes});});
      t.addEventListener('blur',()=>O.views.quetes.refresh());
    },
    'qt-state':(d,el)=>{
      const v=O.views.quetes,avant=etat(d.id);
      if(d.v==='todo')delete etats()[d.id];else etats()[d.id]=d.v;
      O.saveOps();
      // L'animation ne décore pas : elle montre ce qui vient de changer de place.
      const n=el?.closest('.qt');if(n&&!O.reduced())n.animate([{transform:'scale(1)'},{transform:'scale(.97)'},{transform:'scale(1)'}],{duration:200});
      v.refresh();
      if(d.v==='done'&&avant!=='done'){
        const suite=Q().liste.filter(q=>q.apres?.includes(d.id)&&ouverte(q));
        O.toast(suite.length?'Quête faite. Ça ouvre : '+suite.map(q=>q.nom).join(', ')+'.':'Quête faite.');
      }
    },
    'qt-about':()=>O.openSheet('<h2>D’où viennent ces quêtes ?</h2>'+
      '<p>Les noms et les objectifs sont ceux affichés en jeu. Les données ont été rassemblées à partir de plusieurs sources publiques et recoupées : elles sont <b>incomplètes</b> et peuvent contenir des erreurs.</p>'+
      '<p>Seules les quêtes de Shani sont renseignées pour l’instant. Les autres marchands arrivent.</p>'+
      '<p>L’enchaînement n’est indiqué que lorsqu’il est établi. Quand on ne sait pas, le site ne dit rien plutôt que d’inventer un ordre.</p>'+
      '<h3>Sources</h3><ul class="plain">'+Q().sources.map(([n,u])=>'<li><a href="'+u+'" target="_blank" rel="noopener">'+esc(n)+'</a></li>').join('')+'</ul>',{label:'Sources des quêtes'})
  });
})();
