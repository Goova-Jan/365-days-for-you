const CACHE='bassam-365-v2';
const STATIC=['./','./index.html','./messages.js','./manifest.webmanifest','./apple-touch-icon.png','./icon-180.png','./icon-192.png','./icon-512.png','./assets/365-days-for-you-full.mp3'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(STATIC)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;

  const url=new URL(request.url);
  const isFreshFile=url.pathname.endsWith('/index.html') ||
                    url.pathname.endsWith('/messages.js') ||
                    url.pathname.endsWith('/sw.js') ||
                    url.pathname.endsWith('/');

  if(isFreshFile){
    event.respondWith(
      fetch(request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(request,copy));
          return response;
        })
        .catch(()=>caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>cached || fetch(request))
  );
});
