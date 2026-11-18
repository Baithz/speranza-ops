/* Speranza Ops — bouton « Mes sites » en bas du rail et fenêtre des autres sites de Baithz. */
(() => {
  'use strict';
  const O=window.OPS,{$,actions}=O;
  const SITES=[
    {name:'KARN',by:'NutriFactum',url:'https://www.nutrifactum.baithz-labs.eu/',img:'assets/sites/nutrifactum.webp',text:'Nutrition, entraînement et récupération dans un même plan quotidien.'},
    {name:'MageKorp',by:'Logiciels métier',url:'https://magekorp.com/fr/',img:'assets/sites/magekorp.webp',text:'Applications métier à héberger soi-même : MageStock, MageTicket, MageStats.'}
  ];
  const dialog=document.createElement('dialog');dialog.id='sitesDialog';dialog.setAttribute('aria-labelledby','sitesTitle');
  dialog.innerHTML='<div class="pd"><button class="pd-x" data-act="sites-close" aria-label="Fermer">×</button><h2 id="sitesTitle">Les autres sites de Baithz</h2><ul class="sites">'+
    SITES.map(s=>'<li><a href="'+s.url+'" target="_blank" rel="noopener"><img src="'+s.img+'" alt="" width="64" height="64"><span><b>'+s.name+' <small>'+s.by+'</small></b><span>'+s.text+'</span><em>'+new URL(s.url).host.replace(/^www\./,'')+'</em></span></a></li>').join('')+
    '</ul><p class="fine">Chaque lien s’ouvre dans un nouvel onglet.</p></div>';
  document.body.append(dialog);
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  Object.assign(actions,{sites:()=>{$('.dock')?.removeAttribute('data-more');if(!dialog.open)dialog.showModal();},'sites-close':()=>dialog.close()});
  // core.js réécrit le rail : le bouton est remis en dernière position à chaque fois.
  const links=$('.dock-links');
  function place(){
    if(!links||links.lastElementChild?.classList.contains('dock-sites'))return;
    links.querySelector('.dock-sites')?.remove();
    const b=document.createElement('button');b.type='button';b.className='dock-sites';b.dataset.act='sites';b.title='Les autres sites de Baithz';
    b.innerHTML='<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><path d="M14 20l6-6M15.5 14H20v4.5"/></svg><span>Mes sites</span>';
    links.append(b);$('.dock').style.setProperty('--extras',links.querySelectorAll('a.extra').length);
  }
  if(links){new MutationObserver(place).observe(links,{childList:true});place();}
})();
