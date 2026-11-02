// Giochini: il Tris di fiori (tre in fila) e gli Indovinelli dei numeri.
// Come gli altri minigiochi: ricevono (area, api) e restituiscono una funzione che li ferma.
(function () {
  function mescola(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function intero(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function scegli(a) { return a[Math.floor(Math.random() * a.length)]; }
  function vibra(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }

  // ================= Tris di fiori =================
  // Si scambiano due simboli vicini: tre o più uguali in fila spariscono e dall'alto ne cadono di nuovi.
  // Quattro in fila fanno nascere un soffione: quando sparisce pulisce tutta la sua riga (o colonna).
  var TIPI = ["spinaci", "petali", "legnetti", "sassolini", "stella", "lucciola"];
  var NOMI = { spinaci: "spinaci", petali: "petali", legnetti: "legnetti", sassolini: "sassolini", stella: "stelline", lucciola: "lucciole" };
  function imgTipo(t) { return t === "stella" ? "img/stella.png" : t === "lucciola" ? "img/lucciola.png" : MATERIALI[t].img; }
  var LIVELLI_TRIS = {
    facile:    { tipi: 5, mosse: 25, obiettivi: 2, quanti: 14 },
    medio:     { tipi: 6, mosse: 22, obiettivi: 3, quanti: 15 },
    difficile: { tipi: 6, mosse: 20, obiettivi: 3, quanti: 24 }
  };
  var N = 7;

  function tris(area, api) {
    var fermato = false, timers = [];
    function dopo(ms, fn) { timers.push(setTimeout(function () { if (!fermato) fn(); }, ms)); }
    SceltaLivello(area, "tris-gioco", "Quanto difficile?", [
      { id: "facile", nome: "Facile", nota: "5 simboli · 25 mosse" },
      { id: "medio", nome: "Medio", nota: "6 simboli · 22 mosse", bianco: true },
      { id: "difficile", nome: "Difficile", nota: "tanti da raccogliere · 20 mosse", bianco: true }
    ], gioca);

    function gioca(box, liv) {
      var L = LIVELLI_TRIS[liv], tipi = TIPI.slice(0, L.tipi);
      var mosse = L.mosse, punti = 0, file = 0, occupato = false, finito = false, ultimoTocco = Date.now();
      var presi = {}; TIPI.forEach(function (t) { presi[t] = 0; });
      var obiettivi = mescola(tipi.slice()).slice(0, L.obiettivi).map(function (t) { return { t: t, n: L.quanti }; });
      box.innerHTML = "<div class='tris-obiettivi'></div><div class='tris-tavola'></div><p class='spiega'>Trascina un simbolo verso quello vicino (o tocca prima l'uno e poi l'altro).</p>";
      var tav = box.querySelector(".tris-tavola"), ob = box.querySelector(".tris-obiettivi");
      var g = [];   // g[r][c] = { t, el, sp }

      function disegnaObiettivi() {
        ob.innerHTML = obiettivi.map(function (o) {
          var fatto = presi[o.t] >= o.n;
          return "<span class='" + (fatto ? "fatto" : "") + "'><img src='" + imgTipo(o.t) + "' alt=''>" + (fatto ? "✓" : Math.max(0, o.n - presi[o.t])) + "</span>";
        }).join("") + "<span class='mosse'>Mosse <b>" + mosse + "</b></span>";
        api.info("🌼 " + punti);
      }
      function posa(c, r, el) { el.style.left = (c * 100 / N) + "%"; el.style.top = (r * 100 / N) + "%"; }
      function nuovaTessera(t, c, r, daRiga) {
        var el = document.createElement("div");
        el.className = "tris-t"; el.style.width = el.style.height = (100 / N) + "%";
        el.innerHTML = "<img src='" + imgTipo(t) + "' alt=''>";
        el.dataset.c = c;
        if (daRiga !== undefined) { el.style.transition = "none"; posa(c, daRiga, el); tav.appendChild(el); void el.offsetWidth; el.style.transition = ""; }
        else tav.appendChild(el);
        posa(c, r, el);
        return { t: t, el: el, sp: null };
      }
      // griglia iniziale senza file già fatte
      for (var r = 0; r < N; r++) {
        g[r] = [];
        for (var c = 0; c < N; c++) {
          var t;
          do { t = scegli(tipi); } while ((c >= 2 && g[r][c - 1].t === t && g[r][c - 2].t === t) || (r >= 2 && g[r - 1][c].t === t && g[r - 2][c].t === t));
          g[r][c] = nuovaTessera(t, c, r);
        }
      }
      if (!mossaPossibile()) rimescola();
      disegnaObiettivi();

      // ---- trovare le file ----
      function file3() {
        var gruppi = [];
        for (var r = 0; r < N; r++) for (var c = 0; c < N;) {
          var k = c; while (k + 1 < N && g[r][k + 1] && g[r][c] && g[r][k + 1].t === g[r][c].t) k++;
          if (k - c >= 2) { var cs = []; for (var x = c; x <= k; x++) cs.push([r, x]); gruppi.push({ celle: cs, dir: "riga" }); }
          c = k + 1;
        }
        for (var c2 = 0; c2 < N; c2++) for (var r2 = 0; r2 < N;) {
          var k2 = r2; while (k2 + 1 < N && g[k2 + 1][c2] && g[r2][c2] && g[k2 + 1][c2].t === g[r2][c2].t) k2++;
          if (k2 - r2 >= 2) { var cs2 = []; for (var y = r2; y <= k2; y++) cs2.push([y, c2]); gruppi.push({ celle: cs2, dir: "colonna" }); }
          r2 = k2 + 1;
        }
        return gruppi;
      }
      function scambia(a, b) { var t = g[a[0]][a[1]]; g[a[0]][a[1]] = g[b[0]][b[1]]; g[b[0]][b[1]] = t; }
      function mossaPossibile() {
        for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
          var vicini = [[r, c + 1], [r + 1, c]];
          for (var i = 0; i < 2; i++) {
            var v = vicini[i]; if (v[0] >= N || v[1] >= N) continue;
            scambia([r, c], v); var ok = file3().length > 0; scambia([r, c], v);
            if (ok) return [[r, c], v];
          }
        }
        return null;
      }
      function rimescola() {
        var tutte = []; g.forEach(function (riga) { riga.forEach(function (x) { tutte.push(x); }); });
        var tent = 0;
        do {
          mescola(tutte);
          for (var i = 0; i < tutte.length; i++) g[Math.floor(i / N)][i % N] = tutte[i];
          tent++;
        } while ((file3().length || !mossaPossibile()) && tent < 200);
        for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) posa(c, r, g[r][c].el);
      }

      // ---- risolvere: togliere le file, far cadere, ripetere ----
      function risolvi(dove, poi) {
        var gruppi = file3();
        if (!gruppi.length) { poi(); return; }
        var via = {}, nascite = [];
        gruppi.forEach(function (gr) {
          file++;
          gr.celle.forEach(function (p) { via[p[0] + "," + p[1]] = p; });
          if (gr.celle.length >= 4) {
            // il soffione nasce dove hai mosso, se è nella fila, altrimenti a metà
            var qui = gr.celle.filter(function (p) { return dove && dove.some(function (d) { return d[0] === p[0] && d[1] === p[1]; }); })[0] || gr.celle[Math.floor(gr.celle.length / 2)];
            nascite.push({ p: qui, t: g[qui[0]][qui[1]].t, dir: gr.dir });
          }
        });
        // i soffioni presi dentro una fila puliscono la loro riga o colonna
        var daGuardare = Object.keys(via).map(function (k) { return via[k]; });
        while (daGuardare.length) {
          var p = daGuardare.pop(), x = g[p[0]][p[1]];
          if (x && x.sp && !x.scoppiato) {
            x.scoppiato = true; Suoni.sfx("magia");
            for (var i = 0; i < N; i++) {
              var q = x.sp === "riga" ? [p[0], i] : [i, p[1]], kq = q[0] + "," + q[1];
              if (!via[kq]) { via[kq] = q; daGuardare.push(q); }
            }
          }
        }
        nascite.forEach(function (n) { delete via[n.p[0] + "," + n.p[1]]; });
        Object.keys(via).forEach(function (k) {
          var p = via[k], x = g[p[0]][p[1]];
          if (!x) return;
          presi[x.t]++; punti++;
          x.el.classList.add("via");
          (function (el) { dopo(220, function () { el.remove(); }); })(x.el);
          g[p[0]][p[1]] = null;
        });
        nascite.forEach(function (n) {
          var x = g[n.p[0]][n.p[1]];
          x.sp = n.dir; x.el.classList.add("soffione", n.dir);
          presi[x.t]++; punti += 2;
        });
        Suoni.sfx(nascite.length ? "stella" : "presa");
        disegnaObiettivi();
        dopo(230, function () {
          // caduta: ogni colonna si compatta verso il basso e dall'alto arrivano simboli nuovi
          for (var c = 0; c < N; c++) {
            var giu = N - 1;
            for (var r = N - 1; r >= 0; r--) if (g[r][c]) { if (r !== giu) { g[giu][c] = g[r][c]; g[r][c] = null; posa(c, giu, g[giu][c].el); } giu--; }
            for (var k = giu, n = 1; k >= 0; k--, n++) g[k][c] = nuovaTessera(scegli(tipi), c, k, -n);
          }
          dopo(260, function () { risolvi(null, poi); });
        });
      }

      // ---- comandi ----
      var scelta = null, inizio = null;
      function cellaDa(e) {
        var t = e.target.closest(".tris-t"); if (!t) return null;
        for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) if (g[r][c] && g[r][c].el === t) return [r, c];
        return null;
      }
      function evidenzia(p) {
        tav.querySelectorAll(".scelta").forEach(function (x) { x.classList.remove("scelta"); });
        if (p) g[p[0]][p[1]].el.classList.add("scelta");
      }
      function prova(a, b) {
        if (occupato || finito) return;
        if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) !== 1) return;
        occupato = true; evidenzia(null); ultimoTocco = Date.now();
        tav.querySelectorAll(".suggerita").forEach(function (x) { x.classList.remove("suggerita"); });
        scambia(a, b); posa(a[1], a[0], g[a[0]][a[1]].el); posa(b[1], b[0], g[b[0]][b[1]].el);
        Suoni.sfx("tap");
        dopo(200, function () {
          if (!file3().length) {
            // niente fila: tornano al loro posto
            scambia(a, b); posa(a[1], a[0], g[a[0]][a[1]].el); posa(b[1], b[0], g[b[0]][b[1]].el);
            Suoni.sfx("errore"); vibra(30);
            dopo(200, function () { occupato = false; });
            return;
          }
          mosse--; disegnaObiettivi();
          risolvi([a, b], function () {
            if (!mossaPossibile()) { rimescola(); api.info("Rimescolo!"); }
            occupato = false;
            controllaFine();
          });
        });
      }
      tav.addEventListener("pointerdown", function (e) {
        var p = cellaDa(e); if (!p || occupato) return;
        inizio = { p: p, x: e.clientX, y: e.clientY };
        try { tav.setPointerCapture(e.pointerId); } catch (err) {}
      });
      tav.addEventListener("pointermove", function (e) {
        if (!inizio) return;
        var dx = e.clientX - inizio.x, dy = e.clientY - inizio.y, soglia = tav.clientWidth / N * 0.35;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < soglia) return;
        var p = inizio.p, q = Math.abs(dx) > Math.abs(dy) ? [p[0], p[1] + (dx > 0 ? 1 : -1)] : [p[0] + (dy > 0 ? 1 : -1), p[1]];
        inizio = null; scelta = null;
        if (q[0] >= 0 && q[0] < N && q[1] >= 0 && q[1] < N) prova(p, q);
      });
      tav.addEventListener("pointerup", function () {
        if (!inizio) return;
        var p = inizio.p; inizio = null;
        if (scelta && (scelta[0] !== p[0] || scelta[1] !== p[1])) {
          var a = scelta; scelta = null;
          if (Math.abs(a[0] - p[0]) + Math.abs(a[1] - p[1]) === 1) prova(a, p); else { scelta = p; evidenzia(p); }
        } else if (scelta) { scelta = null; evidenzia(null); }
        else { scelta = p; evidenzia(p); }
      });

      // dopo un po' che non si gioca, il Chiwinnie suggerisce una mossa
      var aiuto = setInterval(function () {
        if (fermato || finito || occupato || Date.now() - ultimoTocco < 7000) return;
        var m = mossaPossibile(); if (!m) return;
        g[m[0][0]][m[0][1]].el.classList.add("suggerita"); g[m[1][0]][m[1][1]].el.classList.add("suggerita");
        ultimoTocco = Date.now();
      }, 1000);
      timers.push({ intervallo: aiuto });

      function controllaFine() {
        var vinto = obiettivi.every(function (o) { return presi[o.t] >= o.n; });
        if (!vinto && mosse > 0) return;
        finito = true;
        var b = { spinaci: Math.floor(presi.spinaci / 5), petali: Math.floor(presi.petali / 5) + Math.floor(presi.lucciola / 6),
          legnetti: Math.floor(presi.legnetti / 5), sassolini: Math.floor(presi.sassolini / 5), stelle: 0 };
        if (vinto) { b.petali += 3 + mosse; b.stelle = mosse >= 5 || liv === "difficile" ? 1 : 0; }
        if (vinto) tav.classList.add("vinto");
        dopo(vinto ? 900 : 500, function () {
          api.fine({
            punti: Math.round(punti / 3) + (vinto ? 10 : 0), completato: vinto, file: file, bottino: b,
            titolo: vinto ? "Tris riuscito!" : "Mosse finite!",
            messaggio: vinto ? "Hai raccolto tutto quello che chiedeva il Chiwinnie con " + mosse + (mosse === 1 ? " mossa" : " mosse") + " di avanzo, e fatto " + file + " file!" + (b.stelle ? " Una stella in regalo!" : "")
              : "Hai fatto " + file + " file e quello che hai raccolto resta tuo. Riprova!"
          });
        });
      }
    }
    return function () {
      fermato = true;
      timers.forEach(function (t) { if (t && t.intervallo) clearInterval(t.intervallo); else clearTimeout(t); });
    };
  }

  // ================= Indovinelli dei numeri =================
  // Dieci domande, quattro risposte. Tre livelli: piccoli (contare e aggiungere con le figure),
  // medi (fino a 20, sequenze, doppi), grandi (tabelline, divisioni, problemi in due passi).
  var ROBA = [
    { k: "spinaci", uno: "spinacio", tanti: "spinaci", img: "img/spinaci.png" },
    { k: "petali", uno: "petalo", tanti: "petali", img: "img/petali.png" },
    { k: "legnetti", uno: "legnetto", tanti: "legnetti", img: "img/legnetti.png" },
    { k: "sassolini", uno: "sassolino", tanti: "sassolini", img: "img/sassolini.png" },
    { k: "lucciole", uno: "lucciola", tanti: "lucciole", img: "img/lucciola.png", f: true },
    { k: "stelle", uno: "stella", tanti: "stelle", img: "img/stella.png", f: true }
  ];
  function amico() { return scegli(["Pimpi", "Mirtillo", "Nuvoletta", "Ciuffo", "Lulù", "Stellina", "Brillo", "Bubù"]); }
  function figure(n, img, via) {
    var h = "";
    for (var i = 0; i < n; i++) h += "<img src='" + img + "' alt=''" + (via && i >= n - via ? " class='via'" : "") + ">";
    return "<div class='figure'>" + h + "</div>";
  }
  function quanti(n, r) { return n + " " + (n === 1 ? r.uno : r.tanti); }

  var DOMANDE = {
    piccoli: [
      function () { var r = scegli(ROBA), n = intero(2, 9); return { q: (r.f ? "Quante " : "Quanti ") + r.tanti + " vedi?", fig: figure(n, r.img), a: n }; },
      function () { var r = scegli(ROBA), a = intero(1, 5), b = intero(1, 4);
        return { q: "Il Chiwinnie ha " + quanti(a, r) + " e ne trova " + (b === 1 ? (r.f ? "un'altra" : "un altro") : (r.f ? "altre " : "altri ") + b) + ". " + (r.f ? "Quante" : "Quanti") + " ne ha adesso?", fig: figure(a, r.img) + "<b>+</b>" + figure(b, r.img), a: a + b }; },
      function () { var r = scegli(ROBA.slice(4)), a = intero(3, 8), b = intero(1, a - 1);
        return { q: "Ci sono " + quanti(a, r) + ". " + b + (b === 1 ? " vola via" : " volano via") + ". Quante ne restano?", fig: figure(a, r.img, b), a: a - b }; },
      function () { var s = intero(1, 6); return { q: "Che numero viene dopo?", seq: [s, s + 1, s + 2], a: s + 3 }; },
      function () { var a = intero(1, 5), b = intero(1, 4); return { q: "Quanto fa " + a + " + " + b + "?", fig: figure(a, "img/petali.png") + "<b>+</b>" + figure(b, "img/petali.png"), a: a + b }; },
      function () { var r = scegli(ROBA.slice(0, 4)), a = intero(4, 9), b = intero(1, 3);
        return { q: amico() + " ha " + quanti(a, r) + " e ne regala " + b + " al Chiwinnie. Quanti gliene restano?", fig: figure(a, r.img, b), a: a - b }; }
    ],
    medi: [
      function () { var r = scegli(ROBA.slice(0, 4)), a = intero(6, 12), b = intero(3, 8);
        return { q: "Il Chiwinnie raccoglie " + quanti(a, r) + " la mattina e " + b + " il pomeriggio. Quanti in tutto?", a: a + b }; },
      function () { var r = scegli(ROBA.slice(0, 4)), a = intero(11, 20), b = intero(3, 9);
        return { q: "Per il ponticello servono " + b + " " + r.tanti + ". Il Chiwinnie ne aveva " + a + ". Quanti gliene restano?", a: a - b }; },
      function () { var p = scegli([2, 2, 5, 10]), s = p * intero(0, 3); return { q: "Che numero manca?", seq: [s, s + p, s + 2 * p], a: s + 3 * p }; },
      function () { var r = scegli(ROBA.slice(0, 4)), a = intero(3, 9), n = amico();
        return { q: n + " ha " + quanti(a, r) + ". Il Chiwinnie ne ha il doppio. Quanti ne ha il Chiwinnie?", a: a * 2 }; },
      function () { var a = intero(3, 9), c = intero(a + 3, 18); return { q: "Che numero manca?  " + a + " + ? = " + c, a: c - a }; },
      function () { var r = scegli(ROBA.slice(0, 4)), a = intero(4, 10), b = a + intero(2, 7), n = amico();
        return { q: "Il Chiwinnie ha " + quanti(a, r) + ", " + n + " ne ha " + b + ". Quanti ne ha in più " + n + "?", a: b - a }; },
      function () { var a = intero(2, 5); return { q: "Ogni Chiwinnie ha 2 orecchie. Quante orecchie hanno " + a + " Chiwinnie?", a: a * 2 }; }
    ],
    grandi: [
      function () { var a = intero(3, 9), b = intero(3, 9); return { q: "Ogni aiuola ha " + a + " fiori. Quanti fiori ci sono in " + b + " aiuole?", a: a * b }; },
      function () { var p = intero(2, 6), t = p * intero(3, 8), r = scegli(ROBA.slice(0, 4));
        return { q: "Il Chiwinnie divide " + t + " " + r.tanti + " tra " + p + " amici, in parti uguali. Quanti ne riceve ognuno?", a: t / p }; },
      function () { var a = intero(12, 30), b = intero(4, 10), c = intero(3, 12);
        return { q: "Il Chiwinnie ha " + a + " legnetti. Ne usa " + b + " per la casetta e poi ne trova " + c + ". Quanti ne ha adesso?", a: a - b + c }; },
      function () { var s = intero(1, 4), m = scegli([2, 3]); return { q: "Scopri la regola: che numero viene dopo?", seq: [s, s * m, s * m * m], a: s * m * m * m }; },
      function () { var b = intero(2, 9), c = b * intero(2, 9); return { q: "Che numero manca?  ? × " + b + " = " + c, a: c / b }; },
      function () { var a = 2 * intero(5, 25); return { q: "Qual è la metà di " + a + "?", a: a / 2 }; },
      function () { var s = intero(20, 40), p = scegli([3, 4]); return { q: "Il Nebbione si allontana: che numero viene dopo?", seq: [s, s - p, s - 2 * p], a: s - 3 * p }; },
      function () { var z = intero(2, 4), p = intero(3, 6); return { q: "In ogni zona vivono " + p + " Chiwinnie. Quanti Chiwinnie ci sono in " + z + " zone, più il tuo?", a: z * p + 1 }; }
    ]
  };
  function risposte(a) {
    var s = {}; s[a] = true;
    var vicini = mescola([a + 1, a - 1, a + 2, a - 2, a + 10, a - 10, a + 3, a * 2, a + 5].filter(function (x) { return x >= 0 && x !== a; }));
    var out = [a];
    for (var i = 0; i < vicini.length && out.length < 4; i++) if (!s[vicini[i]]) { s[vicini[i]] = true; out.push(vicini[i]); }
    return mescola(out);
  }

  function conti(area, api) {
    var fermato = false, timers = [];
    function dopo(ms, fn) { timers.push(setTimeout(function () { if (!fermato) fn(); }, ms)); }
    SceltaLivello(area, "conti-gioco", "Chi gioca?", [
      { id: "piccoli", nome: "Piccoli", nota: "contare e aggiungere, con le figure" },
      { id: "medi", nome: "Medi", nota: "fino a 20, sequenze e doppi", bianco: true },
      { id: "grandi", nome: "Grandi", nota: "tabelline, divisioni e problemi", bianco: true }
    ], gioca);

    function gioca(box, liv) {
      var TOT = 10, i = 0, giuste = 0, errori = 0, sbagliata = false, usate = [];
      function prossima() {
        if (i >= TOT) return fine();
        // niente due domande dello stesso tipo di fila
        var tipi = DOMANDE[liv].map(function (f, k) { return k; }).filter(function (k) { return k !== usate[usate.length - 1]; });
        var k = scegli(tipi); usate.push(k);
        var d = DOMANDE[liv][k](); sbagliata = false;
        box.innerHTML = "<div class='conti-passi'>" + Array.from({ length: TOT }, function (_, n) { return "<i class='" + (n < i ? "fatto" : n === i ? "ora" : "") + "'></i>"; }).join("") + "</div>" +
          "<div class='conti-carta'><img class='conti-chiwi' src='" + immagineChiwi(api.colore, "fronte") + "' alt=''>" +
          "<p class='conti-domanda'>" + d.q + "</p>" + (d.fig || "") +
          (d.seq ? "<div class='sequenza'>" + d.seq.map(function (x) { return "<span>" + x + "</span>"; }).join("") + "<span class='buco'>?</span></div>" : "") +
          "</div><div class='conti-risposte'>" + risposte(d.a).map(function (x) { return "<button class='btn bianco' data-v='" + x + "'>" + x + "</button>"; }).join("") + "</div>";
        api.info("✅ " + giuste + " / " + TOT);
        box.querySelector(".conti-risposte").addEventListener("click", function (e) {
          var b = e.target.closest("button"); if (!b || b.disabled) return;
          if (+b.dataset.v === d.a) {
            b.classList.add("giusta"); Suoni.sfx(sbagliata ? "presa" : "stella");
            if (!sbagliata) giuste++;
            var buco = box.querySelector(".sequenza .buco"); if (buco) { buco.textContent = d.a; buco.classList.add("giusta"); }
            box.querySelectorAll(".conti-risposte button").forEach(function (x) { x.disabled = true; });
            i++; api.info("✅ " + giuste + " / " + TOT);
            dopo(900, prossima);
          } else {
            b.disabled = true; b.classList.add("sbagliata"); sbagliata = true; errori++;
            Suoni.sfx("errore"); vibra(30);
          }
        });
      }
      function fine() {
        var perfetto = giuste === TOT;
        api.fine({
          punti: giuste * 2, completato: true, giuste: giuste, perfetto: perfetto,
          bottino: { petali: giuste, sassolini: Math.floor(giuste / 2), stelle: perfetto ? 1 : 0 },
          titolo: perfetto ? "Tutte giuste!" : giuste >= 7 ? "Bravissimo!" : "Ben fatto!",
          messaggio: giuste + " risposte giuste al primo colpo su " + TOT + "." + (perfetto ? " Una stella in regalo!" : " Con 10 su 10 vinci una stella.")
        });
      }
      prossima();
    }
    return function () { fermato = true; timers.forEach(clearTimeout); };
  }

  Minigiochi.tris = tris;
  Minigiochi.conti = conti;
})();
