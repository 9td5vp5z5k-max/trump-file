const CACHE='trump-file-v05';
const CORE=['./','index.html','styles.css','app.js','manifest.webmanifest'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)))});
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.pathname.includes('/data/') && url.pathname.endsWith('.json')){
    e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(fetch(e.request).then(r=>{
    const x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r;
  }).catch(()=>caches.match(e.request)));
});
