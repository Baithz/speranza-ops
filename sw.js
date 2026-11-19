/* Speranza Ops — petit service worker.
   Il ne sert qu'à deux choses : rendre le site installable comme application, et le garder
   ouvrable quand la connexion lâche en plein raid. Le réseau passe toujours en premier :
   une version fraîche écrase le cache, jamais l'inverse. Les gros dossiers (images, moteurs,
   modèles) ne sont pas mis en cache : ils sont déjà gardés par le navigateur. */
const VERSION = 'speranza-v1';
const COQUE = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(COQUE)));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(noms => Promise.all(noms.filter(n => n !== VERSION).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));   // prend la main sur les pages déjà ouvertes, une fois installé
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  // Le planning et la base ne se mettent jamais en cache : ce sont des données du moment.
  if (/\/api\//.test(r.url)) return;
  e.respondWith(
    fetch(r).then(rep => {
      if (rep.ok && /\.(html|css|js|webmanifest)$/.test(new URL(r.url).pathname))
        caches.open(VERSION).then(c => c.put(r, rep.clone()));
      return rep;
    }).catch(() => caches.match(r).then(x => {
      if (x) return x;
      // Hors ligne et rien en cache : on ne renvoie la page d'accueil que pour une navigation.
      // La renvoyer à la place d'un .js donnerait une erreur de syntaxe incompréhensible.
      if (r.mode === 'navigate') return caches.match('./index.html');
      return Response.error();
    }))
  );
});
