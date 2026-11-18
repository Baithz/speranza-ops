/* Planning officiel Embark, servi au site en ligne.
   Même lecture et mêmes refus que relais.py, mais côté serveur : plus besoin de lancer
   Python ou PowerShell sur sa machine. La réponse est mise en cache 10 minutes par Vercel.
   Lecture seule, une seule adresse appelée, aucune donnée du joueur. */
'use strict';

const SOURCE = 'https://arcraiders.com/fr/map-conditions';
const REGIONS = ['north-america', 'brazil', 'east-asia', 'oceania'];
const TAILLE_MAX = 8388608;

const nomValide = v => typeof v === 'string' && v.trim() !== '' && v.length <= 120;
const heureValide = v => Number.isSafeInteger(v) && v > 946684800000 && v < 7258118400000;

/* Lit le tableau nommé dans le flux de Next, en acceptant tableaux imbriqués et crochets entre guillemets. */
function lireTableau(texte, cle) {
  const marque = new RegExp('"' + cle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"\\s*:\\s*(?=\\[)').exec(texte);
  if (!marque) throw new Error('Tableau absent : ' + cle);
  const debut = marque.index + marque[0].length;
  let niveau = 0, entreGuillemets = false;
  for (let pos = debut; pos < texte.length; pos++) {
    const c = texte[pos];
    if (entreGuillemets) {
      if (c === '\\') pos++;
      else if (c === '"') entreGuillemets = false;
    } else if (c === '"') entreGuillemets = true;
    else if (c === '[') niveau++;
    else if (c === ']' && --niveau === 0) return JSON.parse(texte.slice(debut, pos + 1));
  }
  throw new Error('Tableau incomplet : ' + cle);
}

/* Transforme la page d'Embark en planning vérifié. Lève une erreur si le format a changé. */
function convertir(html) {
  const morceaux = html.match(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g) || [];
  const flux = morceaux.map(m => JSON.parse(/\[1,("(?:[^"\\]|\\.)*")\]/.exec(m)[1])).join('');
  const conditions = lireTableau(flux, 'conditionItems');
  const planning = lireTableau(flux, 'liveEntries');
  if (conditions.length < 1 || planning.length < 1 || planning.length > 16000) throw new Error('Planning vide ou taille inattendue.');
  const types = {};
  for (const ligne of conditions) {
    if (!ligne || typeof ligne !== 'object' || !nomValide(ligne.name) || (ligne.type !== 'major' && ligne.type !== 'minor')) throw new Error('Condition non reconnue.');
    types[ligne.name] = ligne.type;
  }
  const entrees = [];
  for (const ligne of planning) {
    if (!ligne || typeof ligne !== 'object' || !nomValide(ligne.conditionName) || !Object.hasOwn(types, ligne.conditionName) || !nomValide(ligne.mapDisplayName)) throw new Error('Condition ou carte absente.');
    const debut = ligne.startTimestamp, fin = ligne.endTimestamp;
    if (!heureValide(debut) || !heureValide(fin) || fin <= debut) throw new Error('Horaire Europe incorrect.');
    // Certaines occurrences globales (ex. Redirection) n'ont pas de variantes : le site
    // d'Embark utilise alors les horaires de base, et nous aussi.
    const variantes = ligne.regionTimestamps;
    const liste = variantes && typeof variantes === 'object' && !Array.isArray(variantes) ? variantes : null;
    if (variantes != null && variantes !== '$undefined' && !liste) throw new Error('Liste de régions incorrecte.');
    const regions = {};
    for (const region of REGIONS) {
      if (!liste || !Object.hasOwn(liste, region)) continue;
      const paire = liste[region];
      if (!Array.isArray(paire) || paire.length !== 2 || !heureValide(paire[0]) || !heureValide(paire[1]) || paire[1] <= paire[0]) throw new Error('Horaire régional incorrect.');
      regions[region] = [paire[0], paire[1]];
    }
    entrees.push({ conditionName: ligne.conditionName, mapDisplayName: ligne.mapDisplayName, startTimestamp: debut, endTimestamp: fin, regionTimestamps: regions });
  }
  return { version: 1, fetchedAt: Date.now(), types, entries: entrees };
}

/* Seule requête vers l'extérieur : une adresse fixe, sans redirection ni paramètre. */
async function telecharger() {
  const stop = AbortSignal.timeout(9000);
  const reponse = await fetch(SOURCE, { redirect: 'error', signal: stop, headers: { 'User-Agent': 'Speranza-Ops/1.0', Accept: 'text/html' } });
  if (!reponse.ok) throw new Error('réponse ' + reponse.status);
  const brut = await reponse.arrayBuffer();
  if (brut.byteLength > TAILLE_MAX) throw new Error('page trop lourde');
  return new TextDecoder('utf-8').decode(brut);
}

module.exports = async (requete, reponse) => {
  reponse.setHeader('X-Content-Type-Options', 'nosniff');
  // Donnée publique en lecture seule : le site local (file://) peut l'appeler aussi.
  reponse.setHeader('Access-Control-Allow-Origin', '*');
  reponse.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  if (requete.method === 'OPTIONS') return reponse.status(204).end();
  if (requete.method !== 'GET' && requete.method !== 'HEAD') {
    reponse.setHeader('Cache-Control', 'no-store');
    return reponse.status(405).json({ error: 'method' });
  }
  let html;
  try {
    html = await telecharger();
  } catch {
    reponse.setHeader('Cache-Control', 'public, s-maxage=45');
    return reponse.status(502).json({ error: 'upstream_network', message: 'Le site officiel Embark est indisponible.', source: SOURCE, retryAfterSeconds: 45 });
  }
  try {
    const planning = convertir(html);
    // Vercel garde la réponse 10 minutes, et sert l'ancienne pendant qu'il la rafraîchit.
    reponse.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');
    return reponse.status(200).json(planning);
  } catch {
    reponse.setHeader('Cache-Control', 'public, s-maxage=45');
    return reponse.status(502).json({ error: 'upstream_format', message: 'Le format du planning officiel a changé.', source: SOURCE, retryAfterSeconds: 45 });
  }
};

module.exports.convertir = convertir;
