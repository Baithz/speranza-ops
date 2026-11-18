(() => {
  "use strict";

  const STORAGE = "arc.atlas.field.v1";
  const sources = {
    frozen: ["Embark · Frozen Trail 2.0", "https://arcraiders.com/news/frozen-trail-2-0-update"],
    update: ["Embark · 2.3.0", "https://arcraiders.com/news/live-update-2-3-0"],
    wind: ["Embark · Survivre à l’ouragan", "https://arcraiders.com/news/surviving-the-hurricane-map-condition"],
    rotations: ["Embark · Calendrier par région", "https://arcraiders.com/map-conditions"],
    trials: ["Embark · Épreuves de la saison 6", "https://arcraiders.com/news/trials-season-6"],
    shields: ["Wiki · Expériences sur les boucliers", "https://arcraiders.wiki/wiki/Shields#Damage_Calculation"],
    heavy: ["Wiki · Bouclier lourd", "https://arcraiders.wiki/wiki/Heavy_Shield"],
    night: ["Wiki · Raid nocturne", "https://arcraiders.wiki/wiki/Night_Raid"],
    cold: ["Wiki · Col de Pendola", "https://arcraiders.wiki/wiki/Pendola_Pass"],
    snitch: ["Wiki · Snitch", "https://arcraiders.wiki/wiki/Snitch#Combat_tips"],
    rocket: ["Wiki · Rocketeer", "https://arcraiders.wiki/wiki/Rocketeer#Combat_tips"],
    bastion: ["Wiki · Bastion", "https://arcraiders.wiki/wiki/Bastion#Combat_tips"],
    research: ["Wiki · Recettes de recherche", "https://arcraiders.wiki/wiki/Research_Points"],
    blueprints: ["Wiki · Schémas et conteneurs", "https://arcraiders.wiki/wiki/Blueprints"],
  };
  const articles = [
    { group: "Combat", proof: "Observation collective", title: "Le dernier point de bouclier",
      stamp: "01 / CHARGE", big: "1", unit: "point de charge",
      lead: "Le tir qui vide un bouclier encore actif bénéficie de toute sa réduction de dégâts.",
      body: "Sur un tir au torse, la charge baisse de la valeur brute du coup. Les PV perdus dépendent du pourcentage absorbé. Avec 5 de charge sur un bouclier léger, un coup de 35 enlève 21 PV et vide la jauge. Le coup suivant enlève 35 PV si le bouclier reste vide.",
      action: "Dans le simulateur, compare un bouclier léger à 1 puis à 0 de charge pour le même impact. Cette différence peut changer le choix entre un soin et une recharge à couvert.",
      refs: ["shields"], tool: "impact" },
    { group: "Butin", proof: "Officiel", title: "Six armes, plusieurs conditions",
      stamp: "02 / SCHÉMAS", big: "06", unit: "schémas concernés",
      lead: "Bobcat, Dolabra, Equalizer, Jupiter, Tempest et Vulcano peuvent tomber pendant toute condition majeure.",
      body: "La version 2.3.0 a élargi leur disponibilité et légèrement réduit la fréquence du groupe. Embark ne publie pas de pourcentage par arme. Le calendrier officiel indique la carte et la région des prochaines conditions.",
      action: "Si deux de ces armes te manquent, choisis une condition majeure où ton duo sait déjà s’extraire. Note le parcours et les schémas effectivement ramenés dans le journal.",
      refs: ["update", "rotations"], tool: "routes" },
    { group: "Extraction", proof: "Observation collective", title: "Le piège de la trappe nocturne",
      stamp: "03 / EXTRACTION", big: "0", unit: "trappe active la nuit",
      lead: "Pendant un raid nocturne, les trappes de Raider sont désactivées et moins de points de retour restent ouverts.",
      body: "Une clé de trappe ne fournit donc aucune sortie de secours dans cette condition. Le wiki rapporte aussi davantage de butin et d’ARC dans les zones convoitées, notamment autour des pièces verrouillées.",
      action: "Ouvre la carte avant la première fouille et désigne un point de retour à voix haute. Place ta dernière zone de fouille du côté de cette sortie.",
      refs: ["night"] },
    { group: "Météo", proof: "Officiel", title: "Lire le vent avant de lancer",
      stamp: "04 / OURAGAN", big: "↗", unit: "trajectoire déviée",
      lead: "L’ouragan agit sur les projectiles lancés, les fumigènes, le gaz et même les sauts.",
      body: "Le vent arrière accélère la progression. Face au vent, tu avances moins vite et consommes plus d’endurance. À découvert, les débris érodent le bouclier et ses étincelles peuvent trahir ta position.",
      action: "Repère le sens des rafales avant de traverser. Privilégie le couvert au vent pour soigner un allié et prévois où la fumée va dériver.",
      refs: ["wind"] },
    { group: "Combat", proof: "Officiel", title: "Ouvrir le blindage à l’explosif",
      stamp: "05 / BLINDAGE", big: ">50", unit: "% de dégâts en plus sur plaque¹",
      lead: "Frozen Trail a renforcé les armes explosives comme le Hullcracker contre les plaques de blindage ARC.",
      body: "¹ Comparé à l’ancienne formule, Embark annonce plus de 50 % de dégâts supplémentaires sur les plaques, mais environ 30 % de moins sur les pièces fragiles. Ces écarts décrivent un changement d’équilibrage, pas un multiplicateur à appliquer à chaque tir.",
      action: "Répartissez les rôles. Le premier Raider ouvre le blindage. Le second conserve ses munitions pour la pièce exposée.",
      refs: ["frozen"] },
    { group: "Butin", proof: "Officiel", title: "Où fouiller la Reine",
      stamp: "06 / CARCASSE", big: "02", unit: "boss concernés",
      lead: "Sur la Reine et la Matriarche, le butin de rang élevé se trouve désormais dans les morceaux de pattes.",
      body: "Une plaque d’armure de patte peut toujours contenir du matériel. Depuis Frozen Trail, les récompenses supérieures ont été déplacées vers les pièces qu’elle protégeait.",
      action: "Pendant le combat, marque la position de la patte détachée. Si la zone devient disputée, fouille cette pièce en premier.",
      refs: ["frozen"] },
    { group: "Combat", proof: "Observation collective", title: "Interrompre un Snitch",
      stamp: "07 / ALERTE", big: "03", unit: "appels du drone",
      lead: "D’après les observations du wiki, les renforts sont assurés dès le début du troisième appel.",
      body: "Le Snitch n’est pas armé, mais il peut notamment attirer un Rocketeer. Ses propulseurs ne sont pas blindés. En casser plusieurs le déstabilise et peut provoquer sa chute.",
      action: "Décidez ensemble avant de tirer. Si vous l’engagez, concentrez vos tirs sur ses propulseurs dès le premier signal.",
      refs: ["snitch"] },
    { group: "Combat", proof: "Observation collective", title: "Faire tomber un Rocketeer",
      stamp: "08 / PROPULSION", big: "02", unit: "propulseurs à détruire",
      lead: "Un Rocketeer privé de deux propulseurs tombe. La hauteur de chute détermine si le choc peut l’achever.",
      body: "Les faces supérieures des propulseurs sont exposées. Ses lasers de visée passent du jaune au rouge avant le tir. Les explosions touchent aussi autour du point d’impact.",
      action: "Marquez deux propulseurs à concentrer depuis un couvert solide. Reculez du bord au moment de la salve.",
      refs: ["rocket"] },
    { group: "Combat", proof: "Observation collective", title: "Ouvrir le dos d’un Bastion",
      stamp: "09 / POINT FAIBLE", big: "↘", unit: "angle arrière",
      lead: "Le cylindre jaune à l’arrière masque une seconde cible vulnérable.",
      body: "Sa destruction soulève la plaque arrière. Les articulations jaunes des pattes peuvent également étourdir le Bastion quand elles cèdent.",
      action: "En duo, attendez que sa mitrailleuse soit engagée vers un couvert. Le Raider sur le flanc vise le cylindre, puis la pièce qui apparaît derrière.",
      refs: ["bastion"] },
    { group: "Butin", proof: "Officiel", title: "Pendola change entre deux sorties",
      stamp: "10 / PENDOLA", big: "↻", unit: "valeur variable",
      lead: "Au col de Pendola, la valeur de certaines zones peut varier d’un raid à l’autre.",
      body: "Le type de butin reste stable. Une zone résidentielle reste résidentielle même si sa valeur change. Un bon résultat isolé renseigne peu sur le rendement habituel du parcours.",
      action: "Compare deux trajets visant la même cible. Comptabilise aussi le temps des sorties sans trouvaille et des extractions ratées.",
      refs: ["frozen"], tool: "routes" },
    { group: "Survie", proof: "Officiel", title: "Préparer l’adrénaline",
      stamp: "11 / ENDURANCE", big: "01", unit: "effet à la fois",
      lead: "Depuis la 2.3.0, une injection d’adrénaline s’utilise même à endurance maximale.",
      body: "Une nouvelle injection rafraîchit la durée de l’effet en cours. L’intensité ne se cumule pas.",
      action: "Prends la première dose juste avant une longue traversée. Garde la deuxième pour la fin de la fenêtre ou pour le trajet du retour.",
      refs: ["update"] },
    { group: "Extraction", proof: "Officiel", title: "Guider son duo à terre",
      stamp: "12 / SECOURS", big: "↗", unit: "gondole de Pendola",
      lead: "Un Raider à terre peut encore consulter la carte. Dans la gondole balistique, son saignement s’arrête.",
      body: "La carte accessible à terre a été ajoutée avec Frozen Trail. L’arrêt de la perte de PV dans la gondole a été corrigé en 2.3.0. Cette règle concerne la cabine de Pendola.",
      action: "À terre, annonce au partenaire le trajet jusqu’à la gondole pendant qu’il surveille les angles. Rejoins l’intérieur de la cabine.",
      refs: ["frozen", "update"] },
    { group: "Météo", proof: "Observation collective", title: "Repérer l’abri au col",
      stamp: "13 / GEL", big: "❄", unit: "gel soudain",
      lead: "Le gel soudain fait partie du col de Pendola et peut toucher une zone pendant la sortie.",
      body: "Le wiki le décrit comme une version plus sévère de la vague de froid. Quand ta zone est touchée, il faut gagner un abri pour se protéger.",
      action: "Repère le prochain abri avant chaque fouille en extérieur. Si le froid gagne ton secteur, contourne les détours vers les conteneurs isolés.",
      refs: ["cold"] },
    { group: "Butin", proof: "Données communautaires", title: "Rechercher une recette à l’avant-poste",
      stamp: "14 / RECHERCHE", big: "III", unit: "niveaux de station",
      lead: "Une partie des schémas possède une recette de recherche chiffrée.",
      body: "Pour le schéma du Bantam, le wiki indique une station de niveau 1, 3 000 points de recherche et 8 modules de Hornet. Les points proviennent de l’étude d’objets de recherche trouvés en surface.",
      action: "Vérifie la recette de ton schéma manquant avant d’échanger des matériaux. Consacre une poche aux composants encore absents.",
      refs: ["research"] },
    { group: "Butin", proof: "Observation collective", title: "Fouiller par famille de conteneurs",
      stamp: "15 / CONTENEURS", big: "⌕", unit: "fouille ciblée",
      lead: "Le wiki associe généralement les schémas médicaux aux conteneurs médicaux et les explosifs à l’industriel.",
      body: "Les conteneurs de sécurité sont une piste pour les augmentations. Certaines recettes ont cependant leurs propres restrictions de carte, d’événement ou de quête.",
      action: "Choisis le schéma précis dans la collection avant d’élargir le parcours. Sur place, commence par ses conteneurs indiqués.",
      refs: ["blueprints"] },
    { group: "Butin", proof: "Officiel", title: "Arbitrer entre entrée et profondeur",
      stamp: "16 / EMPEREUR", big: "↓", unit: "progression intérieure",
      lead: "Les conteneurs proches de l’entrée de l’Empereur donnent des récompenses de rang inférieur à celles du fond.",
      body: "Embark a également rééquilibré la Frégate en faveur des zones profondes. Pour le schéma de clé de l’Empereur, les capsules de Redirection restent une piste, avec une fréquence abaissée.",
      action: "Sépare deux objectifs dans ton carnet. Une sortie pour la clé et une sortie pour le butin intérieur demandent des trajets et des durées différents.",
      refs: ["update"], tool: "routes" },
    { group: "Survie", proof: "Données communautaires", title: "Le compromis du bouclier lourd",
      stamp: "17 / ÉQUIPEMENT", big: "90", unit: "charge de base",
      lead: "Le bouclier lourd absorbe 52,5 % d’un impact lorsqu’il est actif et réduit de 10 % la vitesse de déplacement de base.",
      body: "La fiche de l’objet confirme les valeurs actuelles. Le patch 2.3.0 a porté sa charge de 80 à 90. À l’établi d’équipement niveau 2, la recette demande une tige d’alimentation et deux convertisseurs de tension.",
      action: "Avant de l’emporter, vérifie la compatibilité de ton augmentation et compare la rafale attendue dans le simulateur.",
      refs: ["heavy", "update"], tool: "impact" },
  ];

  const fresh = () => ({version: 1, names: ["Route A", "Route B"], runs: []});
  const validNumber = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;
  const badSave = () => new Error("Le journal de sorties contient des données invalides.");
  function validate(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.names) || value.names.length !== 2 ||
        !value.names.every(n => typeof n === "string" && n.trim() && n.length <= 48) ||
        !Array.isArray(value.runs) || value.runs.length > 20000) throw badSave();
    const ids = new Set();
    const runs = value.runs.map(r => {
      if (!r || typeof r.id !== "string" || !/^[\w-]{1,80}$/.test(r.id) || ids.has(r.id) ||
          !validNumber(r.route, 0, 1) || !validNumber(r.minutes, 1, 240) || !validNumber(r.items, 0, 999) ||
          typeof r.escaped !== "boolean" || !validNumber(r.at, 0, 8640000000000000)) throw badSave();
      ids.add(r.id);
      return {id:r.id, route:r.route, minutes:r.minutes, items:r.items, escaped:r.escaped, at:r.at};
    });
    return {version: 1, names: value.names.map(n => n.trim()), runs};
  }
  let memory = fresh();
  let storageError = "";
  let unsaved = false;
  function read() {
    if (unsaved) return memory;
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) memory = validate(JSON.parse(raw));
    } catch {
      storageError = "Le journal local n’a pas pu être chargé. Utilise la sauvegarde de l’atlas pour conserver tes relevés.";
    }
    return memory;
  }
  function persist(value) {
    const checked = validate(value);
    memory = checked;
    try { localStorage.setItem(STORAGE, JSON.stringify(checked)); unsaved=false; storageError = ""; }
    catch { unsaved=true; storageError = "Stockage du navigateur indisponible. Exporte la sauvegarde avant de fermer l’atlas."; }
  }
  read();
  const escape = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fr = new Intl.NumberFormat("fr-FR", {maximumFractionDigits: 2});
  const date = new Intl.DateTimeFormat("fr-FR", {day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"});
  const refs = ids => ids.map(id => `<a href="${sources[id][1]}" target="_blank" rel="noopener noreferrer">${sources[id][0]} <span aria-hidden="true">↗</span></a>`).join("");
  const tabs = [["notes","Fiches terrain"],["impact","Simulateur d’impacts"],["routes","Journal de sorties"]];
  const groups = ["Toutes", "Combat", "Butin", "Extraction", "Météo", "Survie"];
  const shields = {
    light: {name:"Léger", cap:40, mitigation:.4},
    medium:{name:"Moyen", cap:70, mitigation:.425},
    heavy: {name:"Lourd", cap:90, mitigation:.525},
  };
  const sim = {type:"light", charge:40, damage:35, shots:2};
  const idOf = a => articles.indexOf(a);
  let section = "notes", group = "Toutes", active = 0, host = null, showAll = false;
  function drawNotes() {
    const visible = articles.filter(a => group === "Toutes" || a.group === group);
    const current = articles[active];
    const num = a => String(idOf(a) + 1).padStart(2,"0");
    return `<div class="fg-filters" role="group" aria-label="Famille de fiches">${groups.map(g => `<button type="button" data-group="${g}" aria-pressed="${g === group}">${g}</button>`).join("")}</div>
      <div class="fg-reader">
        <div class="fg-index"><div class="fg-micro">INDEX DE POCHE <span>${String(visible.length).padStart(2,"0")}</span></div>
          <div class="fg-index-items">${visible.map(a => `<button type="button" data-article="${idOf(a)}" aria-pressed="${a === current}"><i>${num(a)}</i><span>${a.title}</span></button>`).join("")}</div>
          <label class="fg-compact-choice">Choisir une fiche<select data-article-select>${visible.map(a => `<option value="${idOf(a)}" ${a === current ? "selected" : ""}>${num(a)} · ${a.title}</option>`).join("")}</select></label>
        </div>
        <article class="fg-sheet">
          <div class="fg-sheet-head"><span class="fg-micro">FICHE ${current.stamp}</span><span class="fg-tag ${current.proof === "Officiel" ? "fg-official" : ""}">${current.proof}</span></div>
          <div class="fg-story"><div><h3>${current.title}</h3><p class="fg-lead">${current.lead}</p></div><div class="fg-figure"><b>${current.big}</b><span>${current.unit}</span></div></div>
          <p>${current.body}</p><div class="fg-action"><b>En sortie</b><p>${current.action}</p></div>
          <div class="fg-refs">${refs(current.refs)}</div>
          ${current.tool ? `<button type="button" data-section="${current.tool}" class="fg-link">Ouvrir ${current.tool === "impact" ? "le simulateur" : "le journal"} <span aria-hidden="true">→</span></button>` : ""}
        </article>
      </div>`;
  }
  function impactResults() {
    let health = 100, charge = sim.charge;
    const armor = shields[sim.type];
    const impacts = [];
    for (let i=1; i<=sim.shots && health>0; i++) {
      const protectedHit = charge > 0;
      const taken = sim.damage * (protectedHit ? 1-armor.mitigation : 1);
      health = Math.max(0, Math.round((health - taken) * 10000) / 10000);
      charge = Math.max(0, charge - sim.damage);
      impacts.push({health, charge, protectedHit, taken});
    }
    return `<div class="fg-micro">TÉLÉMÉTRIE <span>ESTIMATION</span></div><h3>${health > 0 ? "Raider en vie" : "Raider à terre"}</h3>
      <div class="fg-gauges"><div><span>PV restants <b>${fr.format(health)} / 100</b></span><progress aria-label="PV restants" max="100" value="${health}"></progress></div>
      <div><span>Charge restante <b>${fr.format(charge)} / ${armor.cap}</b></span><progress aria-label="Charge restante" max="${armor.cap}" value="${charge}"></progress></div></div>
      <div class="fg-impacts">${impacts.map((r,i) => `<div><i>${String(i+1).padStart(2,"0")}</i><span>${r.protectedHit ? "Bouclier actif" : "Torse exposé"}</span><strong>−${fr.format(r.taken)} PV</strong></div>`).join("")}</div>
      ${health <= 0 ? `<small>Simulation arrêtée à l’impact ${impacts.length}.</small>` : ""}`;
  }
  function slider(key,label,min,max) {
    return `<label class="fg-slider"><span>${label} <output>${sim[key]}</output></span><input type="range" data-slider="${key}" min="${min}" max="${max}" value="${sim[key]}"></label>`;
  }
  function drawImpact() {
    const armor = shields[sim.type];
    return `<div class="fg-workbench"><section class="fg-control"><div class="fg-micro">CALCUL / 01</div><h3>Impacts au torse</h3><p>Pars de 100 PV et règle une série de coups identiques. La charge se vide impact après impact.</p>
      <label class="fg-label">Bouclier<select data-shield>${Object.entries(shields).map(([key,s]) => `<option value="${key}" ${key === sim.type ? "selected" : ""}>${s.name} · ${fr.format(s.mitigation*100)} % de réduction</option>`).join("")}</select></label>
      ${slider("charge","Charge initiale",0,armor.cap)}${slider("damage","Dégâts bruts par impact",1,100)}${slider("shots","Nombre d’impacts",1,12)}
      </section><section class="fg-readout" data-impact-result aria-live="polite">${impactResults()}</section></div>
      <div class="fg-method"><b>Hypothèses du calcul</b><p>Chaque coup au torse profite de la réduction si la charge est positive au début du tir. Le bouclier perd les dégâts bruts du coup. Durabilité suffisante, sans soin, bonus, multiplicateur de tête ni effet de distance. Les PV affichés sont arrondis à deux décimales.</p><div class="fg-refs">${refs(["shields","heavy","update"])}</div></div>`;
  }
  function aggregate(runs) {
    const totals = {minutes:0, items:0, escaped:0};
    runs.forEach(r => { totals.minutes += r.minutes; totals.items += r.items; totals.escaped += Number(r.escaped); });
    return {...totals, n:runs.length, rate:runs.length ? totals.items * 60 / totals.minutes : null};
  }
  function drawRoutes() {
    const {names,runs} = memory;
    const stats = [0,1].map(i => aggregate(runs.filter(r=>r.route===i)));
    const max = Math.max(1, ...stats.map(s => s.rate || 0));
    const sorted = [...runs].reverse();
    return `<div class="fg-route-intro"><h3>Deux trajets, une même cible.</h3><p>Choisis un objet ou un groupe de schémas commun aux deux routes. Inclus chaque sortie, même les tentatives sans butin. Le rendement mesure les objets rapportés par heure passée sur le terrain.</p></div>
      <div class="fg-duo">${stats.map((s,i)=>`<div class="fg-route-card"><div class="fg-micro">ROUTE ${i===0?"A":"B"} <span>${s.n} SORTIE${s.n>1?"S":""}</span></div><label class="fg-route-name"><span>Nom du trajet</span><input type="text" maxlength="48" data-name="${i}" value="${escape(names[i])}" aria-label="Nom de la route ${i===0?"A":"B"}"></label><div class="fg-score"><strong>${s.rate===null?"—":fr.format(s.rate)}</strong> objet${s.rate !== null && s.rate>1 ? "s" : ""}/h</div><div class="fg-track" aria-hidden="true"><i style="width:${(s.rate || 0)*100/max}%"></i></div><div class="fg-route-meta"><span><b>${s.items}</b> rapporté(s)</span><span><b>${s.minutes}</b> min</span><span><b>${s.n ? fr.format(s.escaped*100/s.n)+" %" : "—"}</b> extractions</span></div></div>`).join("")}</div>
      <form class="fg-entry" data-entry><h4>Consigner une sortie</h4><div class="fg-form-row"><label>Trajet<select name="route">${names.map((n,i)=>`<option value="${i}">${escape(n)}</option>`).join("")}</select></label><label>Durée (min)<input type="number" name="minutes" min="1" max="240" step="1" required placeholder="12"></label><label>Objets cibles rapportés<input type="number" name="items" min="0" max="999" step="1" required value="0"></label><label>Issue<select name="escaped"><option value="1">Extraction réussie</option><option value="0">Raider éliminé</option></select></label><button type="submit" class="fg-primary">Enregistrer</button></div><small>Compte les objets réellement revenus à Speranza, y compris ceux de la poche sécurisée.</small></form>
      <div class="fg-log"><div class="fg-micro">RELEVÉS DU DUO <span>${runs.length}</span></div>${runs.length ? `<div class="fg-log-rows">${(showAll ? sorted : sorted.slice(0,6)).map(r=>`<div><time>${date.format(r.at)}</time><b>${escape(names[r.route])}</b><span>${r.minutes} min · ${r.items} objet(s) · ${r.escaped?"extrait":"éliminé"}</span><button type="button" data-remove="${r.id}" aria-label="Supprimer le relevé du ${date.format(r.at)}">Supprimer</button></div>`).join("")}</div>${sorted.length>6 ? `<button type="button" data-history class="fg-link">${showAll?"Afficher les 6 derniers":"Afficher tous les relevés"}</button>`:""}` : "<p>Tes deux séries sont vierges. Enregistre une sortie pour commencer la comparaison.</p>"}</div>
      <div class="fg-method"><b>Lecture des résultats</b><p>Rendement = 60 × objets rapportés ÷ total des minutes, échecs compris. Le pourcentage d’extractions exprime le retour du Raider. Une différence sur quelques sorties peut tenir au hasard, au matériel ou aux conditions de carte. Ces relevés personnels ne mesurent pas le taux de butin du jeu.</p></div>`;
  }
  function renderBody() {
    if (!host || !host.querySelector("[data-fg-body]")) return;
    host.querySelectorAll(".fg-tabs button").forEach(b => b.setAttribute("aria-pressed",String(b.dataset.section === section)));
    host.querySelector("[data-fg-body]").innerHTML = section === "notes" ? drawNotes() : section === "impact" ? drawImpact() : drawRoutes();
    host.querySelector("[data-fg-status]").textContent = storageError;
  }
  function setRouteName(input) {
    const value = input.value.trim(), route = Number(input.dataset.name);
    const state = read();
    if (!value) { input.value=state.names[route]; return; }
    const names = [...state.names]; names[route]=value;
    persist({...state,names});
    input.value = value;
    host.querySelectorAll('select[name="route"] option')[route].textContent = value;
    const visible = [...memory.runs].reverse();
    host.querySelectorAll(".fg-log-rows > div > b").forEach((label,i) => {label.textContent=memory.names[visible[i].route];});
    host.querySelector("[data-fg-status]").textContent=storageError || "Nom du trajet enregistré.";
  }
  function mount(el) {
    host = el;
    el.innerHTML = `<div class="fg"><header class="fg-heading"><div><div class="fg-micro">SPERANZA / DOCUMENTATION TERRAIN</div><h2>Guide de terrain</h2><p>Consulte une mécanique, simule un échange de tirs ou compare tes propres trajets de fouille.</p></div><div class="fg-edition">ÉDITION TERRAIN <b>03.11.26</b></div></header><nav class="fg-tabs" aria-label="Outils du guide">${tabs.map(([id,n],i)=>`<button type="button" data-section="${id}"><i>0${i+1}</i> ${n}</button>`).join("")}</nav><div data-fg-status role="status"></div><div data-fg-body></div></div>`;
    renderBody();
    el.querySelector(".fg").addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.section) {
        section = b.dataset.section; renderBody();
        if (!b.closest(".fg-tabs")) el.querySelector(`.fg-tabs [data-section="${section}"]`).focus();
      } else if (b.dataset.group) {
        group = b.dataset.group;
        if (group !== "Toutes" && articles[active].group !== group) active = articles.findIndex(a => a.group === group);
        renderBody(); el.querySelector(`[data-group="${group}"]`).focus({preventScroll:true});
      } else if (b.dataset.article !== undefined) {
        const position = el.querySelector(".fg-index-items").scrollTop;
        active = Number(b.dataset.article); renderBody();
        el.querySelector(".fg-index-items").scrollTop = position;
        el.querySelector(`[data-article="${active}"]`).focus({preventScroll:true});
      } else if (b.dataset.remove) {
        const state=read();
        persist({...state,runs:state.runs.filter(r=>r.id !== b.dataset.remove)}); renderBody();
        el.querySelector("[data-fg-status]").textContent = storageError || "Relevé supprimé.";
      } else if (b.hasAttribute("data-history")) {showAll=!showAll; renderBody(); el.querySelector("[data-history]")?.focus({preventScroll:true});}
    });
    el.querySelector(".fg").addEventListener("change", e => {
      const input=e.target;
      if (input.hasAttribute("data-shield")) {sim.type=input.value;sim.charge=shields[sim.type].cap;renderBody();el.querySelector("[data-shield]").focus({preventScroll:true});}
      else if (input.hasAttribute("data-article-select")) {active=Number(input.value);renderBody();el.querySelector("[data-article-select]").focus({preventScroll:true});}
      else if (input.hasAttribute("data-name")) setRouteName(input);
    });
    el.querySelector(".fg").addEventListener("input", e => {
      const input=e.target;
      if (!input.dataset.slider) return;
      sim[input.dataset.slider] = Number(input.value);
      input.closest("label").querySelector("output").textContent=input.value;
      el.querySelector("[data-impact-result]").innerHTML=impactResults();
    });
    el.querySelector(".fg").addEventListener("submit", e => {
      if (!e.target.hasAttribute("data-entry")) return;
      e.preventDefault();
      const f = new FormData(e.target), now=Date.now();
      const run = {id:globalThis.crypto?.randomUUID?.() || `r${now}-${Math.random().toString(36).slice(2)}`,route:Number(f.get("route")),minutes:Number(f.get("minutes")),items:Number(f.get("items")),escaped:f.get("escaped")==="1",at:now};
      const state=read();
      try {persist({...state,runs:[...state.runs,run]});}
      catch {el.querySelector("[data-fg-status]").textContent="Sortie invalide ou journal plein.";return;}
      renderBody();
      el.querySelector('select[name="route"]').value=String(run.route);
      el.querySelector("[data-fg-status]").textContent=storageError || "Sortie enregistrée.";
    });
  }
  window.FieldGuide = {
    mount,
    exportState: () => validate(memory),
    validateState: validate,
    storageKey: STORAGE,
    importState(value,write=true) {
      if(write)persist(value);else{memory=validate(value);unsaved=false;storageError="";}
      renderBody();
    },
  };
  window.addEventListener("storage", e=>{
    if (e.key !== STORAGE || unsaved) return;
    try {memory=e.newValue ? validate(JSON.parse(e.newValue)) : fresh();storageError="";}
    catch {storageError="Le journal modifié dans l’autre onglet est illisible.";}
    if (section==="routes") renderBody();
  });
})();
