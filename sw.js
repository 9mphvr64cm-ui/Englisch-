
const CACHE='english-trainer-365-v7-comm-ops';
const ASSETS=['./','index.html','style.css','app.js','data.js','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.url.includes('api.mymemory.translated.net') || e.request.url.includes('api.dictionaryapi.dev')) return;
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
