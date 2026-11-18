// Les préférences de filtre ne contiennent que des identifiants de type. Aucune coordonnée n'entre dans ce stockage.
function createMapLegend(host, maps, types, groups, normalize, onChange, aliases) {
  const key = 'arc.speranza.poi-types.v1';
  const layout = host.querySelector('.rm-layout'), board = layout.querySelector('.rm-board');
  board.id = 'rm-current-board';
  const node = document.createElement('aside');
  node.className = 'rm-legend';
  node.id = 'rm-current-legend';
  node.setAttribute('aria-label', 'Filtres de la carte');
  node.innerHTML = `<div class="rm-legend-title"><span class="rm-kicker">LÉGENDE DU TERRAIN</span><h3>Filtres de carte</h3>
    <output data-legend-total></output></div>
    <label class="rm-kind-search">Type de repère<input type="search" data-kind-search placeholder="Caisse d’armes, trappe…" maxlength="100"></label>
    <span class="rm-preset-label">Sélections rapides</span>
    <div class="rm-presets" role="group" aria-label="Sélection rapide">
      <button type="button" data-preset="exit">↗ Sorties</button><button type="button" data-preset="weapons">▣ Armes</button>
      <button type="button" data-preset="arc">▲ ARC</button><button type="button" data-preset="breaches">◇ Brèches seules</button><button type="button" data-preset="default">Repères de départ</button>
    </div><div class="rm-kind-actions"><button type="button" data-preset="all">Tout afficher</button><button type="button" data-preset="none">Tout masquer</button></div>
    <div class="rm-kinds" data-kinds role="region" aria-label="Catégories et types de repères" tabindex="0"></div><details class="rm-legend-help"><summary>Comment lire les repères</summary><p class="rm-legend-foot">Les nombres indiquent les emplacements sur cet étage. Un chiffre sur un pictogramme regroupe des repères proches. Clique dessus pour les séparer.</p></details><button type="button" class="rm-legend-apply" data-legend-return>Revenir à la carte <span aria-hidden="true">→</span></button>`;
  board.before(node);
  for(const [preset,kind] of [['exit','extraction'],['weapons','weapon-case'],['arc','arc-rocketeer'],['breaches','security-locker']]){
    const b=node.querySelector('[data-preset="'+preset+'"]');
    const label=b.textContent.split(' ').slice(1).join(' ');
    b.innerHTML=window.MapPictos.html(kind)+' '+label;
  }
  const panes = document.createElement('div');
  panes.className = 'rm-pane-switch';
  panes.setAttribute('role','group'); panes.setAttribute('aria-label','Affichage de la cartographie');
  panes.innerHTML = `<button type="button" data-map-pane="map" aria-controls="${board.id}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16"/></svg>Carte</button><button type="button" data-map-pane="legend" aria-controls="${node.id}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h6m4 0h8M3 12h10m4 0h4M3 18h2m4 0h12"/><circle cx="11" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="7" cy="18" r="2"/></svg>Filtres <small data-pane-count></small></button>`;
  layout.prepend(panes);
  function showPane(pane,bringIntoView=false) {
    layout.dataset.mobilePane = pane;
    for (const b of panes.querySelectorAll('button')) b.setAttribute('aria-pressed',String(b.dataset.mapPane === pane));
    if (bringIntoView) {
      if (document.fullscreenElement === layout) layout.scrollTo({top:0,behavior:'instant'});
      else layout.scrollIntoView({block:'start',behavior:'instant'});
    }
  }
  showPane('map');
  panes.addEventListener('click', e=>{
    const b=e.target.closest('[data-map-pane]');
    if(b)showPane(b.dataset.mapPane,true);
  });
  node.querySelector('[data-legend-return]').onclick=()=>{
    showPane('map',true);
    panes.querySelector('[data-map-pane="map"]').focus({preventScroll:true});
  };
  host.ownerDocument.defaultView.addEventListener('hashchange', () => {
    if (host.hidden) showPane('map');
  });
  const full = board.querySelector('[data-full]');
  function fullscreenLabel() {
    const expanded = document.fullscreenElement === layout;
    full.title = expanded ? 'Quitter le plein écran' : 'Plein écran';
    full.setAttribute('aria-label',expanded ? full.title : 'Agrandir la carte en plein écran');
    full.setAttribute('aria-pressed',String(expanded));
  }
  fullscreenLabel(); layout.addEventListener('fullscreenchange',fullscreenLabel);
  const $ = selector => node.querySelector(selector);
  const inventories = new Map(maps.map(map => [map.id, new Set(map.points.map(p => p.kind))]));
  const weapons = new Set(['weapon-case', 'ammo-case', 'grenade-case', 'security-locker', 'combat-supplies']);
  let preferences = {};
  try {
    const stored = JSON.parse(localStorage.getItem(key));
    for (const [id, possible] of inventories) {
      if (Array.isArray(stored?.[id])) preferences[id] = stored[id].filter(k => possible.has(k));
    }
  } catch {}
  const expanded = new Set(['exit','sector']);
  let current, floor, selection = new Set(), counts = new Map(), rows = [], sections = [];
  function defaultKinds(id) {
    return [...inventories.get(id)].filter(k => k==='security-locker'||['exit','sector'].includes(types[k][0]));
  }
  function presetKinds(preset) {
    if(preset==='breaches')return inventories.get(current.id).has('security-locker')?['security-locker']:[];
    if (preset === 'default') return defaultKinds(current.id);
    return [...inventories.get(current.id)].filter(k =>
      preset === 'all' || (preset === 'weapons' ? weapons.has(k) : types[k][0] === preset));
  }
  function update() {
    const words = normalize($('[data-kind-search]').value).split(' ').filter(Boolean);
    let visible = 0, places = 0;
    for (const row of rows) {
      row.input.checked = selection.has(row.kind);
      if (row.input.checked) { visible++; places += counts.get(row.kind); }
      row.label.hidden = !words.every(w => row.words.includes(w));
    }
    for (const {group,box,button,disclosure,body,items} of sections) {
      const n = items.filter(row => row.input.checked).length;
      box.hidden = items.every(row => row.label.hidden);
      body.hidden = !words.length && !expanded.has(group);
      disclosure.setAttribute('aria-expanded',String(!body.hidden));
      button.setAttribute('aria-pressed', n === 0 ? 'false' : n === items.length ? 'true' : 'mixed');
      button.lastElementChild.textContent = n + '/' + items.length;
    }
    $('[data-no-kinds]').hidden = rows.some(row => !row.label.hidden);
    $('[data-legend-total]').textContent = visible + ' / ' + counts.size + ' types · ' + places.toLocaleString('fr-FR') + ' repères';
    panes.querySelector('[data-pane-count]').textContent = String(visible);
    for (const b of node.querySelectorAll('[data-preset]')) {
      const preset = b.dataset.preset;
      if(preset==='breaches')b.disabled=!counts.has('security-locker');
      const kinds = presetKinds(preset);
      const matches = (kinds.length > 0 || preset === 'none') && kinds.length === selection.size && kinds.every(k=>selection.has(k));
      b.setAttribute('aria-pressed',String(matches));
    }
  }
  function setFloor(map, layer) {
    if (map === current && layer === floor) return;
    if (map !== current) {
      selection = new Set(preferences[map.id] || defaultKinds(map.id));
      $('[data-kind-search]').value = '';
    }
    current = map; floor = layer; counts = new Map(); rows = []; sections = [];
    for (const p of map.points) if (p.layer === layer) counts.set(p.kind,(counts.get(p.kind) || 0) + 1);
    const list = $('[data-kinds]'); list.replaceChildren(); list.scrollTop = 0;
    for (const [group,[title,color,symbol]] of Object.entries(groups)) {
      const kinds = [...counts.keys()].filter(k => types[k][0] === group)
        .sort((a,b) => types[a][1].localeCompare(types[b][1],'fr'));
      if (!kinds.length) continue;
      const box = document.createElement('section');
      box.style.setProperty('--kind-color',color);
      const button = document.createElement('button');
      button.type = 'button'; button.dataset.layerGroup = group;
      button.className = 'rm-kind-group'; button.title = 'Afficher ou masquer toute la catégorie '+title;
      const sample={sector:'sector',exit:'extraction',loot:'field-crate',arc:'arc-rocketeer',access:'key',resource:'mushroom',quest:'quest'}[group];
      button.innerHTML=window.MapPictos.html(sample)+'<b></b><small></small>';
      button.children[1].textContent=title;
      const heading=document.createElement('div');heading.className='rm-family-head';
      const body=document.createElement('div');body.id='rm-types-'+group;
      const disclosure=document.createElement('button');disclosure.type='button';
      disclosure.dataset.expandGroup=group;disclosure.className='rm-expand-group';disclosure.title='Déplier ou replier les types de repères';
      disclosure.setAttribute('aria-label','Types de repères · '+title);disclosure.setAttribute('aria-controls',body.id);
      disclosure.innerHTML='<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg>';
      heading.append(button,disclosure);box.append(heading,body);
      const items = [];
      for (const kind of kinds) {
        const [,fr,en] = types[kind], label = document.createElement('label');
        const input = document.createElement('input'); input.type = 'checkbox'; input.dataset.kind = kind;
        const name = document.createElement('span'); name.textContent = fr;
        if (kinds.some(k => k !== kind && types[k][1] === fr)) name.textContent += ' · '+ en;
        const count = document.createElement('small'); count.textContent = counts.get(kind);
        label.title = en; label.append(input);label.insertAdjacentHTML('beforeend',window.MapPictos.html(kind));label.append(name,count);body.append(label);
        const row = {kind,input,label,words:normalize([fr,en,kind,title,aliases[kind]].join(' '))};
        items.push(row); rows.push(row);
      }
      sections.push({group,box,button,disclosure,body,items}); list.append(box);
    }
    const empty = document.createElement('p'); empty.dataset.noKinds = '';
    empty.textContent = 'Aucun type correspondant sur cet étage.'; list.append(empty);
    update();
  }
  function commit(action) {
    preferences[current.id] = [...selection];
    try { localStorage.setItem(key,JSON.stringify(preferences)); }
    catch { $('.rm-legend-foot').textContent = 'Stockage indisponible. Ces filtres s’appliquent pendant cette visite.'; }
    update(); onChange(action);
  }
  node.addEventListener('input',e => { if(e.target.matches('[data-kind-search]')) update(); });
  node.addEventListener('change',e => {
    const kind = e.target.dataset.kind;
    if (!kind) return;
    if (e.target.checked) selection.add(kind); else selection.delete(kind);
    commit();
  });
  node.addEventListener('click',e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.expandGroup) {
      const k=b.dataset.expandGroup;
      if(expanded.has(k))expanded.delete(k);else expanded.add(k);
      if ($('[data-kind-search]').value) $('[data-kind-search]').value='';
      update();return;
    }
    if (b.dataset.layerGroup) {
      const keys = [...counts.keys()].filter(k => types[k][0] === b.dataset.layerGroup);
      const remove = keys.every(k => selection.has(k));
      if(!remove)expanded.add(b.dataset.layerGroup);
      for (const k of keys) { if (remove) selection.delete(k); else selection.add(k); }
    } else if (b.dataset.preset) {
      selection = new Set(presetKinds(b.dataset.preset));
      if(!['all','none'].includes(b.dataset.preset))for(const k of selection)expanded.add(types[k][0]);
    } else return;
    if(b.dataset.preset==='breaches'&&innerWidth<=980&&document.fullscreenElement!==layout){
      showPane('map',true);
      panes.querySelector('[data-map-pane="map"]').focus({preventScroll:true});
    }
    commit(b.dataset.preset);
  });
  return {setFloor,refresh:update, includes: kind => selection.has(kind),
    setBreaches(on){
      if(on)selection.add('security-locker');else selection.delete('security-locker');
      commit('breach-toggle');
    }
  };
}
