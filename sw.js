const CACHE_NAME = 'gerenciador-ativos-v2'; // Mudei a versão para forçar a atualização

// CAMINHOS CORRIGIDOS para GitHub Pages
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css',
  'https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Instala o Service Worker e armazena os arquivos em cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercepta as requisições e serve os arquivos do cache se disponíveis
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      }
    )
  );
});

// Limpa caches antigos ao ativar uma nova versão do SW
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});