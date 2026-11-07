// Service worker: permette di giocare anche senza internet.
// Al primo avvio salva i file principali; le immagini si salvano man mano che il gioco le usa.
// Quando si pubblica una nuova versione basta cambiare VERSIONE: i telefoni scaricano i file nuovi.
var VERSIONE = "chiwinnie-0.29.0";
var ESSENZIALI = [
  "./", "index.html", "manifest.webmanifest", "css/gioco.css",
  "js/dati.js", "js/audio.js", "js/minigiochi.js", "js/arcade.js", "js/colora.js", "js/rompicapi.js", "js/aggiustatutto.js", "js/casa.js", "js/missione.js", "js/giochini.js", "js/gioco.js",
  "icone/icona-192.png", "img/radura.jpg", "img/zona1/vuota.jpg",
  "img/spinaci.png", "img/petali.png", "img/legnetti.png", "img/sassolini.png", "img/stella.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSIONE).then(function (c) { return c.addAll(ESSENZIALI.map(function (u) { return new Request(u, { cache: "reload" }); })); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (nomi) {
      return Promise.all(nomi.filter(function (n) { return n !== VERSIONE; }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  // pagina e codice: prima la rete (così gli aggiornamenti arrivano subito), poi la copia salvata
  var codice = req.mode === "navigate" || /\.(html|js|css|webmanifest)$/.test(new URL(req.url).pathname);
  if (codice) {
    e.respondWith(
      // "no-cache": chiede sempre al sito se il file è cambiato, invece di usare una copia vecchia del browser
      fetch(req.url, { cache: "no-cache" }).then(function (r) {
        var copia = r.clone(); caches.open(VERSIONE).then(function (c) { c.put(req, copia); });
        return r;
      }).catch(function () { return caches.match(req).then(function (r) { return r || caches.match("index.html"); }); })
    );
    return;
  }
  // immagini: prima la copia salvata, altrimenti la rete (e la si salva per la prossima volta)
  e.respondWith(
    caches.match(req).then(function (salvata) {
      return salvata || fetch(req).then(function (r) {
        if (r.ok) { var copia = r.clone(); caches.open(VERSIONE).then(function (c) { c.put(req, copia); }); }
        return r;
      });
    })
  );
});
