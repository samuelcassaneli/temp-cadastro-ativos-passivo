const CACHE_NAME = 'gerenciador-ativos-v3'; // Versão incrementada para forçar a atualização do cache

// Lista de arquivos para cache, agora incluindo o dashboard.html
const urlsToCache = [
  './',
  './index.html',
  './dashboard.html', // Adicionado para cache
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
  'https://unpkg.com/dexie@3/dist/dexie.js',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css',
  'https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Instala o Service Worker e armazena os arquivos em cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        // Usamos addAll para garantir que o SW só instale se todos os assets forem cacheados.
        // Adicionamos um catch para depurar falhas de cache.
        return cache.addAll(urlsToCache).catch(error => {
            console.error('Falha ao adicionar arquivos ao cache:', error);
            throw error;
        });
      })
  );
});

// Intercepta as requisições e serve os arquivos do cache se disponíveis
self.addEventListener('fetch', event => {
    // Apenas para requisições GET. Outros métodos (POST, etc.) não são cacheados.
    if (event.request.method !== 'GET') {
        return;
    }
  
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
                // Se o recurso estiver no cache, retorna ele.
                // Se não, busca na rede, retorna para o navegador e adiciona uma cópia ao cache.
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    // Verificação para garantir que temos uma resposta válida antes de cachear.
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
                return response || fetchPromise;
            });
        })
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
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});