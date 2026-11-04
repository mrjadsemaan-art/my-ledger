const V="hesabati-v7";
const FILES=["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// Online: take the newest version (waits at most 2.5s). Offline or slow: use the saved copy.
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith((async()=>{
    const cache=await caches.open(V);
    const hit=await caches.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request,{cache:"no-cache"}).then(r=>{if(r&&r.ok)cache.put(e.request,r.clone());return r});
    if(!hit)return net;
    const timeout=new Promise(res=>setTimeout(()=>res(null),2500));
    try{const r=await Promise.race([net,timeout]);return r||hit}catch(_){return hit}
  })());
});
