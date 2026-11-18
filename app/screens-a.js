/* Speranza Ops — QG et Sortie (préparation, raid en cours, bilan). */
(() => {
  'use strict';
  const O=window.OPS,{$,$$,esc,ico,MAPS,mapById,BP,bpById,ARCS,owned,sched,left,clock,actions}=O;
  const plural=(n,one,many)=>n+' '+(n>1?many:one);
  const evChip=(e,now)=>e.start<=now
    ?'<span class="ev" data-kind="'+(e.major?'major':'minor')+'"><i class="dot"></i>'+esc(e.title)+' <b data-left="'+e.end+'">'+left(e.end)+'</b></span>'
    :'<span class="ev" data-kind="next">'+esc(e.title)+' à '+clock.format(e.start)+'</span>';
  // Schémas manquants qu'un événement en cours rend trouvables sur la carte.
  const eventTargets=(m,now=Date.now())=>{const set=new Map();for(const e of sched.active(m,now))for(const b of sched.unlocks(e))if(!owned(b.id))set.set(b.id,e);return set;};
  function best(){
    const now=Date.now();
    return MAPS.map(m=>{const miss=O.missingOn(m),hot=eventTargets(m,now);return {m,miss,hot,score:miss.length+hot.size*3+O.pins().filter(id=>miss.some(b=>b.id===id)).length*2};}).sort((a,b)=>b.score-a.score)[0];
  }

  /* ───────── QG ───────── */
  O.register('accueil',{title:'QG',icon:'qg',pos:1,
    mount(el){el.classList.add('qg');this.refresh();},
    show(){this.refresh();},minute(){if(!this.el.contains(document.activeElement))this.refresh();},
    refresh(){
      const el=this.el,now=Date.now(),plan=O.ops().plan,total=BP.length,have=BP.filter(b=>owned(b.id)).length,pct=Math.round(have/total*100);
      let hero;
      if(plan?.startedAt){
        const m=mapById(plan.map),end=plan.startedAt+plan.minutes*60000;
        hero='<section class="brief" style="--shot:url(\''+m.shot+'\')"><p class="brief-k">Sortie en cours</p><h1>'+esc(m.name)+'</h1><p class="brief-t">Temps restant <b class="mono" data-clock="'+end+'">'+O.mmss(end-now)+'</b> · '+plural(plan.targets.length-plan.found.length,'objectif restant','objectifs restants')+'.</p><div class="row"><button class="btn primary big" data-act="go" data-view="raid">Reprendre la sortie</button></div></section>';
      }else{
        const b=best(),m=b.m,act=sched.active(m,now);
        const why=!O.P.active()?'Choisis ton profil pour obtenir une recommandation.'
          :b.miss.length?(plural(b.miss.length,'schéma à trouver','schémas à trouver')+' sur cette carte.'+(b.hot.size?' '+esc(act.filter(e=>[...b.hot.values()].includes(e)).map(e=>e.title).join(', '))+' en cours : '+plural(b.hot.size,'schéma n’apparaît','schémas n’apparaissent')+' que pendant cet événement.':''))
          :'Ta collection est complète pour les cartes documentées. Sortie libre : butin et XP.';
        hero='<section class="brief" style="--shot:url(\''+m.shot+'\')"><p class="brief-k">Meilleure sortie maintenant</p><h1>'+esc(m.name)+'</h1><p class="brief-t">'+why+'</p>'+(act.length?'<p class="brief-ev">'+act.map(e=>evChip(e,now)).join('')+'</p>':'')+
          '<div class="row"><button class="btn primary big" data-act="prep" data-map="'+m.id+'">Préparer cette sortie</button><button class="btn big" data-act="openmap" data-map="'+m.id+'">'+ico('map')+'Ouvrir la carte</button></div></section>';
      }
      const st=sched.state(),stale=!sched.hasFuture(now);
      const feed=st==='live'?'Planning en direct':st==='loading'?'Chargement du planning…':stale?'Planning périmé':'Planning en mémoire';
      const rows=MAPS.map(m=>{
        const act=sched.active(m,now),nx=sched.next(m,now),miss=O.missingOn(m).length,hot=eventTargets(m,now).size;
        return '<button class="surf" data-act="prep" data-map="'+m.id+'"><img src="'+m.img+'" alt="" loading="lazy"><span class="surf-n"><b>'+esc(m.name)+'</b><small>'+(act.map(e=>evChip(e,now)).join('')||(nx?evChip(nx,now):'<span class="ev" data-kind="none">Conditions normales</span>'))+'</small></span><span class="surf-c'+(miss?'':' done')+'"><b>'+(miss||ico('check'))+'</b><small>'+(miss?'à trouver'+(hot?' · '+hot+' en événement':''):'complet')+'</small></span>'+ico('chevron')+'</button>';
      }).join('');
      const pinsHTML=O.pins().map(id=>bpById.get(id)).filter(b=>b&&!owned(b.id)).slice(0,5).map(b=>'<li><button data-act="bp" data-id="'+b.id+'"><img src="'+b.image+'" alt="" loading="lazy"><span>'+esc(b.name)+'</span>'+ico('chevron')+'</button></li>').join('');
      const j=O.ops().raids,last=j.at(-1),premier=have===0;
      // Collection vide : trois panneaux vides et un zéro n'aident personne. Une seule invitation.
      const debut='<section class="panel start"><h2>Commence par ta collection</h2>'+
        '<p>Ouvre l’écran <b>Schémas</b> dans ARC Raiders, fais une capture d’écran, dépose-la ici : le site lit ce que tu as déjà et saura quoi te conseiller. Trente secondes, une fois pour toutes.</p>'+
        '<div class="row"><button class="btn primary big" data-act="capture">Importer une capture</button><button class="btn" data-act="go" data-view="collection">Cocher à la main</button></div>'+
        '<p class="fine">Tout reste sur cet appareil tant que tu ne rejoins pas une escouade.</p></section>';
      el.innerHTML=hero+
        '<section class="panel surface"><header><h2>En surface</h2><p class="feed" data-state="'+(st==='live'?'live':stale?'stale':'mem')+'">'+feed+'<button class="icon-btn" data-act="sched-refresh" aria-label="Actualiser le planning" title="Actualiser le planning">'+ico('refresh')+'</button></p></header>'+
        (stale&&!premier?'<p class="notice">Le planning officiel n’a pas pu être récupéré. Les recommandations se basent en attendant sur ta collection.</p>':'')+'<div class="surf-list">'+rows+'</div></section>'+
        '<aside class="qg-side">'+(premier?debut:'')+'<section class="panel prog"'+(premier?' hidden':'')+'><div class="ring" style="--p:'+have/total+'"><b>'+pct+'<small>%</small></b></div><div><h2>Collection</h2><p>'+have+' schémas sur '+total+'. '+(total-have?'Il en reste '+(total-have)+'.':'Complète.')+'</p><button class="link" data-act="go" data-view="collection">Voir les schémas à trouver</button><button class="link" data-act="capture">Mettre à jour depuis une capture du jeu</button></div></section>'+
        (premier?'':'<section class="panel"><h2>Objectifs</h2>'+(pinsHTML?'<ul class="mini">'+pinsHTML+'</ul>':'<p class="fine">Marque un schéma comme objectif '+ico('star')+' pour qu’il soit présélectionné à chaque sortie.</p>')+'</section>'+
        '<section class="panel"><h2>Dernière sortie</h2>'+(last?'<p><b>'+esc(mapById(last.map)?.name||'')+'</b> · '+(last.result==='extract'?'extraction réussie':'abattu')+' · +'+last.xp+' XP</p>':'<p class="fine">Aucune sortie enregistrée pour ce profil.</p>')+'<button class="link" data-act="journal">Ouvrir le journal ('+j.length+')</button></section>')+'</aside>';
    }});

  /* ───────── Sortie ───────── */
  const draft=()=>{const o=O.ops();if(!o.plan){const b=best();o.plan={map:b.m.id,targets:null,minutes:30,startedAt:null,found:[]};}return o.plan;};
  const defaultTargets=m=>{const miss=O.missingOn(m),p=O.pins(),hot=eventTargets(m);const pick=miss.filter(b=>p.includes(b.id)||hot.has(b.id));return (pick.length?pick:miss.slice(0,4)).map(b=>b.id);};
  function weaponsFor(arcs){
    const tally=new Map();
    for(const a of arcs)for(const [w] of a.engagement?.weapons||[]){if(!window.ARMORY_DATA?.weapons[w])continue;if(!tally.has(w))tally.set(w,[]);tally.get(w).push(a.name);}
    return [...tally].sort((a,b)=>b[1].length-a[1].length).slice(0,4);
  }
  const place=(b,m)=>O.onMap(b,m)?.place||'';
  O.register('raid',{title:'Sortie',icon:'raid',pos:2,
    mount(){},show(p){if(p?.map){this.step=p.step||2;const o=O.ops();if(!o.plan?.startedAt){o.plan={map:p.map,targets:null,minutes:o.plan?.minutes||30,startedAt:null,found:[]};O.saveOps();}}this.result=null;this.refresh();},
    refresh(){
      if(this.result)return;
      const plan=draft();
      if(plan.startedAt)this.live(plan);else this.prep(plan);
    },
    reset(){this.result=null;this.step=1;},
    prep(plan){
      const m=mapById(plan.map)||MAPS[0],now=Date.now(),miss=O.missingOn(m),hot=eventTargets(m,now),step=this.step||1;
      if(!plan.targets)plan.targets=defaultTargets(m);
      plan.targets=plan.targets.filter(id=>miss.some(b=>b.id===id));
      const arcs=O.arcsOnMap(m),guns=weaponsFor(arcs),act=sched.active(m,now);
      const tabs=[['Carte',m.short],['Objectifs',plan.targets.length+' / '+miss.length],['Menaces',arcs.length+' ARC']];
      let body;
      if(step===1)body='<h2>Où vas-tu ?</h2><div class="map-pick" role="radiogroup" aria-label="Carte">'+MAPS.map(x=>{const n=O.missingOn(x).length,ev=sched.active(x,now);
          return '<button role="radio" aria-checked="'+(x===m)+'" data-act="plan-map" data-map="'+x.id+'" style="--shot:url(\''+x.shot+'\')"><b>'+esc(x.short)+'</b><small>'+(n?n+' à trouver':'complet')+'</small>'+(ev.length?'<i class="dot" data-kind="'+(ev.some(e=>e.major)?'major':'minor')+'" title="'+esc(ev.map(e=>e.title).join(', '))+'"></i>':'')+'</button>';}).join('')+'</div>'+
          (act.length?'<p class="step-ev">'+act.map(e=>evChip(e,now)).join('')+'</p>':'');
      else if(step===2)body='<h2>Que cherches-tu sur '+esc(m.short)+' ?</h2>'+
          (miss.length?'<div class="row tight"><button class="link" data-act="plan-all">Tout cocher</button><button class="link" data-act="plan-none">Tout décocher</button></div><ul class="targets">'+miss.map(b=>'<li><label class="target"><input type="checkbox" data-act="plan-target" data-id="'+b.id+'"'+(plan.targets.includes(b.id)?' checked':'')+'><img src="'+b.image+'" alt="" loading="lazy"><span><b>'+esc(b.name)+'</b><small>'+esc(place(b,m))+'</small></span>'+(hot.has(b.id)?'<em class="tag hot">Événement en cours</em>':O.pinned(b.id)?'<em class="tag">Objectif</em>':'')+'</label><button class="icon-btn" data-act="bp" data-id="'+b.id+'" aria-label="Fiche de '+esc(b.name)+'">'+ico('chevron')+'</button></li>').join('')+'</ul>'
            :'<p class="fine">Aucun schéma manquant sur cette carte. Sortie libre : butin et XP.</p>');
      else{
        const fams=[...new Set(arcs.map(a=>a.family))];
        body='<h2>Qui t’attend sur '+esc(m.short)+' ?</h2>'+
          (guns.length?'<h3>Armes qui couvrent le plus de menaces ici</h3><div class="guns">'+guns.map(([id,list])=>{const w=window.ARMORY_DATA.weapons[id];return '<button class="gun" data-act="weapon" data-id="'+id+'"><img src="'+w.img+'" alt="" loading="lazy"><span><b>'+esc(w.name)+'</b><small>Conseillée contre '+esc(list.slice(0,3).join(', '))+(list.length>3?' et '+(list.length-3)+' autres':'')+'</small></span></button>';}).join('')+'</div>':'')+
          fams.map(f=>'<h3>'+esc(f)+'</h3><div class="threats">'+arcs.filter(a=>a.family===f).map(a=>'<button class="threat" data-act="arc" data-id="'+a.id+'"><img src="'+a.image+'" alt="" loading="lazy"><b>'+esc(a.name)+'</b><small>'+esc(a.role)+'</small></button>').join('')+'</div>').join('');
      }
      this.el.innerHTML='<header class="view-head"><h1>Préparer une sortie</h1></header>'+
        '<div class="stepper" role="tablist" aria-label="Étapes">'+tabs.map(([t,v],i)=>'<button role="tab" aria-selected="'+(step===i+1)+'" data-act="plan-step" data-n="'+(i+1)+'"><span class="num">'+(i+1)+'</span><span><b>'+t+'</b><small>'+esc(v)+'</small></span></button>').join('')+'</div>'+
        '<section class="step" role="tabpanel">'+body+'</section>'+
        '<div class="launch">'+(step>1?'<button class="btn" data-act="plan-step" data-n="'+(step-1)+'">Retour</button>':'')+
        '<label class="field inline">Durée<select data-act="plan-min">'+[15,20,25,30,35,40].map(n=>'<option value="'+n+'"'+(n===plan.minutes?' selected':'')+'>'+n+' min</option>').join('')+'</select></label>'+
        (step<3?'<button class="btn quiet" data-act="plan-start">Lancer maintenant</button><button class="btn primary big" data-act="plan-step" data-n="'+(step+1)+'">Suivant : '+tabs[step][0]+'</button>':'<button class="btn primary big" data-act="plan-start">Lancer la sortie · '+esc(m.short)+'</button>')+'</div>';
      O.saveOps();
    },
    live(plan){
      const m=mapById(plan.map),end=plan.startedAt+plan.minutes*60000,now=Date.now(),arcs=O.arcsOnMap(m),act=sched.active(m,now);
      const list=plan.targets.map(id=>bpById.get(id)).filter(Boolean);
      this.el.innerHTML='<div class="live" style="--shot:url(\''+m.shot+'\')"><section class="live-clock"><p class="brief-k">Sortie en cours · '+esc(m.name)+'</p><div class="dial" data-ring="'+plan.startedAt+','+end+'"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" class="dial-track"/><circle cx="60" cy="60" r="54" class="dial-fill" pathLength="1"/></svg><b class="mono" data-clock="'+end+'" role="timer" aria-label="Temps restant">'+O.mmss(end-now)+'</b></div>'+
        (act.length?'<p class="brief-ev">'+act.map(e=>evChip(e,now)).join('')+'</p>':'')+
        '<div class="row center"><button class="btn" data-act="openmap" data-map="'+m.id+'">'+ico('map')+'Carte</button><button class="btn" data-act="plan-plus">+ 5 min</button></div></section>'+
        '<section class="live-list"><h2>Objectifs <small>'+plan.found.length+' / '+list.length+' trouvés</small></h2>'+(list.length?'<ul class="targets big">'+list.map(b=>'<li><label class="target"><input type="checkbox" data-act="plan-found" data-id="'+b.id+'"'+(plan.found.includes(b.id)?' checked':'')+'><img src="'+b.image+'" alt="" loading="lazy"><span><b>'+esc(b.name)+'</b><small>'+esc(place(b,m))+'</small></span></label><button class="btn small" data-act="locate" data-id="'+b.id+'" data-map="'+m.id+'">Localiser</button></li>').join('')+'</ul>':'<p class="fine">Sortie libre, sans objectif coché.</p>')+
        '<h2>Menaces sur place</h2><div class="threats compact">'+arcs.map(a=>'<button class="threat" data-act="arc" data-id="'+a.id+'"><img src="'+a.image+'" alt="" loading="lazy"><b>'+esc(a.name)+'</b></button>').join('')+'</div></section></div>'+
        '<div class="launch end"><button class="btn quiet" data-act="plan-cancel">Annuler la sortie</button><button class="btn danger big" data-act="plan-end" data-result="down">Abattu en surface</button><button class="btn success big" data-act="plan-end" data-result="extract">Extraction réussie</button></div>';
    },
    finish(result){
      const o=O.ops(),plan=o.plan,m=mapById(plan.map),end=Date.now(),before=O.rank();
      const found=result==='extract'?plan.found.filter(id=>!owned(id)):[];
      const lines=result==='extract'?[['Extraction réussie',100],...found.map(id=>[bpById.get(id).name,150]),...(plan.targets.length&&found.length===plan.targets.length?[['Tous les objectifs rapportés',100]]:[])]:[['Sortie tentée',25]];
      const xp=lines.reduce((n,l)=>n+l[1],0);
      for(const id of found)O.P.setOwned(id,true);
      o.raids.push({map:plan.map,start:plan.startedAt,end,result,found,targets:plan.targets.length,xp});o.xp+=xp;o.plan=null;O.saveOps();
      const after=O.rank();this.result=true;O.paintTop();
      this.el.innerHTML='<section class="debrief" data-result="'+result+'" style="--shot:url(\''+m.shot+'\')"><p class="brief-k">'+esc(m.name)+' · '+Math.max(1,Math.round((end-plan.startedAt)/60000))+' min en surface</p><h1>'+(result==='extract'?'Extraction réussie':'Abattu en surface')+'</h1>'+
        '<p class="brief-t">'+(result==='extract'?(found.length?plural(found.length,'schéma ajouté','schémas ajoutés')+' à ta collection.':'Rien de neuf pour la collection, mais tu es rentré.'):(plan.found.length?'Ce que tu portais est resté là-haut : la collection ne change pas.':'La surface gagne cette manche.'))+'</p>'+
        '<ul class="xp-lines">'+lines.map(([l,n],i)=>'<li style="--i:'+i+'"><span>'+esc(l)+'</span><b>+'+n+' XP</b></li>').join('')+'<li class="total" style="--i:'+lines.length+'"><span>Total</span><b>+'+xp+' XP</b></li></ul>'+
        (after.level>before.level?'<p class="promo">Promotion : niveau '+after.level+', '+esc(after.name)+'.</p>':'<div class="bar"><i style="width:'+after.pct+'%"></i></div><p class="fine">Niveau '+after.level+' · '+esc(after.name)+' · encore '+(after.to-o.xp)+' XP avant le niveau suivant.</p>')+
        '<div class="row"><button class="btn primary big" data-act="plan-again" data-map="'+m.id+'">Nouvelle sortie</button><button class="btn big" data-act="go" data-view="accueil">Retour au QG</button></div></section>';
      window.scrollTo({top:0,behavior:'instant'});$('h1',this.el).setAttribute('tabindex','-1');$('h1',this.el).focus({preventScroll:true});
    }});
  const raid=()=>O.views.raid,redraw=()=>{O.saveOps();O.paintTop();raid().refresh();};
  Object.assign(actions,{
    prep:d=>O.go('raid',{map:d.map}),
    'plan-map':d=>{const p=draft();p.map=d.map;p.targets=null;redraw();$('[data-act="plan-map"][aria-checked="true"]')?.focus({preventScroll:true});},
    'plan-target':(d,el)=>{const p=draft();p.targets=el.checked?[...new Set([...p.targets,d.id])]:p.targets.filter(x=>x!==d.id);O.saveOps();const c=$('.stepper [data-n="2"] small');if(c)c.textContent=p.targets.length+' / '+O.missingOn(mapById(p.map)).length;},
    'plan-step':d=>{raid().step=Number(d.n);raid().refresh();window.scrollTo({top:0,behavior:'instant'});$('.stepper [aria-selected="true"]')?.focus({preventScroll:true});},
    'plan-all':()=>{const p=draft();p.targets=O.missingOn(mapById(p.map)).map(b=>b.id);redraw();},
    'plan-none':()=>{draft().targets=[];redraw();},
    'plan-min':(d,el)=>{draft().minutes=Number(el.value);O.saveOps();},
    'plan-start':()=>{const p=draft();if(!p.targets)p.targets=defaultTargets(mapById(p.map));p.startedAt=Date.now();p.found=[];raid().step=1;redraw();window.scrollTo({top:0,behavior:'instant'});O.toast('Sortie lancée. Bonne chance, raider.');},
    'plan-plus':()=>{draft().minutes+=5;redraw();},
    'plan-found':(d,el)=>{const p=draft();p.found=el.checked?[...new Set([...p.found,d.id])]:p.found.filter(x=>x!==d.id);O.saveOps();const c=$('.live-list h2 small');if(c)c.textContent=p.found.length+' / '+p.targets.length+' trouvés';},
    'plan-cancel':()=>{if(confirm('Annuler cette sortie ? Elle ne sera pas inscrite au journal.')){const p=draft();p.startedAt=null;p.found=[];raid().step=1;redraw();}},
    'plan-end':d=>raid().finish(d.result),
    'plan-again':d=>{raid().result=null;O.go('raid',{map:d.map,step:1});}
  });
})();
