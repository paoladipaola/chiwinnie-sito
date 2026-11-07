// Giochini: il Tris di fiori (tre in fila) e gli Indovinelli dei numeri.
// Come gli altri minigiochi: ricevono (area, api) e restituiscono una funzione che li ferma.
(function () {
  function mescola(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function intero(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function scegli(a) { return a[Math.floor(Math.random() * a.length)]; }
  function vibra(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }

  // ================= Tris di fiori =================
  // Si scambiano due simboli vicini: tre o più uguali in fila spariscono e dall'alto ne cadono di nuovi.
  // Come nei giochi di caramelle: quattro in fila fanno nascere una girandola (pulisce la riga o la colonna),
  // una L o una T una bomba di fiori (scoppia tutto intorno), cinque in fila un arcobaleno (scambiato con un
  // simbolo fa sparire tutti quelli uguali). Due speciali scambiati fra loro si combinano.
  var TIPI = ["spinaci", "petali", "legnetti", "sassolini", "stella", "lucciola"];
  var NOMI = { spinaci: "spinaci", petali: "petali", legnetti: "legnetti", sassolini: "sassolini", stella: "stelline", lucciola: "lucciole" };
  function imgTipo(t) { return t === "stella" ? "img/stella.png" : t === "lucciola" ? "img/lucciola.png" : MATERIALI[t].img; }
  var LIVELLI_TRIS = {
    facile:    { tipi: 5, mosse: 25, obiettivi: 2, quanti: 14 },
    medio:     { tipi: 6, mosse: 22, obiettivi: 3, quanti: 15 },
    difficile: { tipi: 6, mosse: 20, obiettivi: 3, quanti: 24 }
  };
  var N = 7;
  var SPECIALI = { girandola: "img/tris/girandola.png", bomba: "img/tris/bomba.png", arcobaleno: "img/tris/arcobaleno.png" };

  function tris(area, api) {
    var fermato = false, timers = [];
    function dopo(ms, fn) { timers.push(setTimeout(function () { if (!fermato) fn(); }, ms)); }
    SceltaLivello(area, "tris-gioco", "Quanto difficile?", [
      { id: "facile", nome: "Facile", nota: "5 simboli · 25 mosse" },
      { id: "medio", nome: "Medio", nota: "6 simboli · 22 mosse", bianco: true },
      { id: "difficile", nome: "Difficile", nota: "tanti da raccogliere · 20 mosse", bianco: true }
    ], gioca, api);

    function gioca(box, liv) {
      var L = LIVELLI_TRIS[liv], tipi = TIPI.slice(0, L.tipi);
      var mosse = L.mosse, punti = 0, file = 0, occupato = false, finito = false, ultimoTocco = Date.now();
      var presi = {}; TIPI.forEach(function (t) { presi[t] = 0; });
      var obiettivi = mescola(tipi.slice()).slice(0, L.obiettivi).map(function (t) { return { t: t, n: L.quanti }; });
      box.innerHTML = "<div class='tris-obiettivi'></div><div class='tris-tavola'></div><div class='tris-legenda'><span><img src='img/tris/girandola.png' alt=''>4 in fila</span><span><img src='img/tris/bomba.png' alt=''>a L o T</span><span><img src='img/tris/arcobaleno.png' alt=''>5 in fila</span></div><p class='spiega'>Trascina un simbolo verso quello vicino. Prova a scambiare due speciali!</p>";
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
      function disegnaTessera(x) {
        var el = x.el;
        el.className = "tris-t" + (x.sp ? " sp-" + x.sp + (x.dir ? " " + x.dir : "") : "");
        if (x.sp === "arcobaleno") el.innerHTML = "<img src='" + SPECIALI.arcobaleno + "' alt=''>";
        else if (x.sp === "bomba") el.innerHTML = "<img src='" + SPECIALI.bomba + "' alt=''><img class='segno' src='" + imgTipo(x.t) + "' alt=''>";
        else if (x.sp === "girandola") el.innerHTML = "<img class='dietro' src='" + SPECIALI.girandola + "' alt=''><img src='" + imgTipo(x.t) + "' alt=''>";
        else el.innerHTML = "<img src='" + imgTipo(x.t) + "' alt=''>";
      }
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

      // ---- effetti speciali da vedere ----
      function centro(p) { return { x: (p[1] + 0.5) * 100 / N, y: (p[0] + 0.5) * 100 / N }; }
      function effetto(classe, stile, ms) {
        var el = document.createElement("div"); el.className = "tris-fx " + classe; el.style.cssText = stile;
        tav.appendChild(el); dopo(ms || 650, function () { el.remove(); });
        return el;
      }
      function raggio(p, dir) {
        var q = centro(p);
        if (dir === "riga") effetto("raggio riga", "top:" + q.y + "%;");
        else effetto("raggio colonna", "left:" + q.x + "%;");
      }
      function onda(p, quanto) {
        var q = centro(p), d = (quanto * 2 + 1) * 100 / N;
        effetto("onda", "left:" + q.x + "%;top:" + q.y + "%;width:" + d + "%;height:" + d + "%;", 700);
      }
      var COLORI = { spinaci: "#6fae4e", petali: "#f3a6b6", legnetti: "#b07a4a", sassolini: "#9aa3ad", stella: "#ffd23f", lucciola: "#d7ff6a" };
      var scintilleOra = 0;
      function scintille(p, t) {
        if (scintilleOra > 36) return;
        var q = centro(p);
        for (var i = 0; i < 3; i++) {
          scintilleOra++;
          var a = Math.random() * 6.28, d = 30 + Math.random() * 40;
          var el = effetto("scintilla", "left:" + q.x + "%;top:" + q.y + "%;background:" + (COLORI[t] || "#fff") + ";--dx:" + Math.cos(a) * d + "px;--dy:" + Math.sin(a) * d + "px;", 600);
        }
        dopo(600, function () { scintilleOra = 0; });
      }
      function scritta(testo, p) {
        var q = p ? centro(p) : { x: 50, y: 45 };
        q.x = Math.max(30, Math.min(70, q.x)); q.y = Math.max(12, q.y);
        effetto("tris-scritta", "left:" + q.x + "%;top:" + q.y + "%;", 1100).textContent = testo;
      }

      // ---- trovare le file (anche a L e a T) ----
      function tipoDi(x) { return x && x.sp !== "arcobaleno" ? x.t : null; }
      function trovaGruppi() {
        var runs = [];
        for (var r = 0; r < N; r++) for (var c = 0; c < N;) {
          var t = tipoDi(g[r][c]), k = c;
          while (t && k + 1 < N && tipoDi(g[r][k + 1]) === t) k++;
          if (t && k - c >= 2) { var cs = []; for (var x = c; x <= k; x++) cs.push([r, x]); runs.push({ celle: cs, dir: "riga" }); }
          c = k + 1;
        }
        for (var c2 = 0; c2 < N; c2++) for (var r2 = 0; r2 < N;) {
          var t2 = tipoDi(g[r2][c2]), k2 = r2;
          while (t2 && k2 + 1 < N && tipoDi(g[k2 + 1][c2]) === t2) k2++;
          if (t2 && k2 - r2 >= 2) { var cs2 = []; for (var y = r2; y <= k2; y++) cs2.push([y, c2]); runs.push({ celle: cs2, dir: "colonna" }); }
          r2 = k2 + 1;
        }
        // le file che si toccano diventano un gruppo solo (così si riconoscono la L e la T)
        var capo = runs.map(function (x, i) { return i; }), dove = {};
        function trova(i) { while (capo[i] !== i) i = capo[i] = capo[capo[i]]; return i; }
        runs.forEach(function (run, i) {
          run.celle.forEach(function (p) {
            var k = p[0] + "," + p[1];
            if (dove[k] !== undefined) capo[trova(i)] = trova(dove[k]); else dove[k] = i;
          });
        });
        var gruppi = {};
        runs.forEach(function (run, i) { var c = trova(i); (gruppi[c] = gruppi[c] || { runs: [], celle: {} }).runs.push(run); run.celle.forEach(function (p) { gruppi[c].celle[p[0] + "," + p[1]] = p; }); });
        return Object.keys(gruppi).map(function (k) {
          var gr = gruppi[k]; gr.celle = Object.keys(gr.celle).map(function (q) { return gr.celle[q]; }); return gr;
        });
      }
      // che speciale nasce da un gruppo: 5 in fila arcobaleno, L o T bomba, 4 in fila girandola
      function specialeDi(gr) {
        var lungo = Math.max.apply(null, gr.runs.map(function (x) { return x.celle.length; }));
        var righe = gr.runs.some(function (x) { return x.dir === "riga"; }), colonne = gr.runs.some(function (x) { return x.dir === "colonna"; });
        if (lungo >= 5) return { sp: "arcobaleno" };
        if (righe && colonne) return { sp: "bomba" };
        if (lungo === 4) return { sp: "girandola", dir: gr.runs[0].dir };
        return null;
      }
      function scambia(a, b) { var t = g[a[0]][a[1]]; g[a[0]][a[1]] = g[b[0]][b[1]]; g[b[0]][b[1]] = t; }
      function scambioSpeciale(a, b) {
        var x = g[a[0]][a[1]], y = g[b[0]][b[1]];
        return x && y && (x.sp === "arcobaleno" || y.sp === "arcobaleno" || (x.sp && y.sp));
      }
      function mossaPossibile() {
        for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
          var vicini = [[r, c + 1], [r + 1, c]];
          for (var i = 0; i < 2; i++) {
            var v = vicini[i]; if (v[0] >= N || v[1] >= N) continue;
            if (scambioSpeciale([r, c], v)) return [[r, c], v];
            scambia([r, c], v); var ok = trovaGruppi().length > 0; scambia([r, c], v);
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
        } while ((trovaGruppi().length || !mossaPossibile()) && tent < 200);
        for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) posa(c, r, g[r][c].el);
      }
      function piuComune() {
        var n = {}, meglio = null;
        g.forEach(function (riga) { riga.forEach(function (x) { var t = tipoDi(x); if (t) { n[t] = (n[t] || 0) + 1; if (!meglio || n[t] > n[meglio]) meglio = t; } }); });
        return meglio;
      }

      // ---- togliere le tessere: gli speciali presi dentro scoppiano e ne fanno scoppiare altri ----
      function togli(celle, nascite, poi) {
        var via = {}, coda = [], protette = {}, speciali = 0;
        nascite.forEach(function (n) { protette[n.p[0] + "," + n.p[1]] = true; });
        function aggiungi(p) {
          if (p[0] < 0 || p[1] < 0 || p[0] >= N || p[1] >= N) return;
          var k = p[0] + "," + p[1], x = g[p[0]][p[1]];
          if (!x || via[k] || protette[k]) return;
          via[k] = p;
          if (x.sp && !x.forza) coda.push(p);
        }
        celle.forEach(aggiungi);
        while (coda.length) {
          var p = coda.shift(), x = g[p[0]][p[1]];
          speciali++; vibra(25);
          if (x.sp === "girandola") {
            raggio(p, x.dir); Suoni.sfx("magia");
            for (var i = 0; i < N; i++) aggiungi(x.dir === "riga" ? [p[0], i] : [i, p[1]]);
          } else if (x.sp === "bomba") {
            onda(p, 1); Suoni.sfx("pigna");
            for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) aggiungi([p[0] + dr, p[1] + dc]);
          } else if (x.sp === "arcobaleno") {
            var col = x.colore || piuComune(); Suoni.sfx("stella");
            effetto("lampo", "", 600);
            for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) if (tipoDi(g[r][c]) === col) aggiungi([r, c]);
          }
        }
        var forte = speciali || celle.length > 8, ritardo = forte ? 330 : 0;
        Object.keys(via).forEach(function (k) { var p = via[k]; if (forte) g[p[0]][p[1]].el.classList.add("colpita"); });
        dopo(ritardo, function () {
          Object.keys(via).forEach(function (k) {
            var p = via[k], x = g[p[0]][p[1]];
            if (!x) return;
            if (x.sp !== "arcobaleno") presi[x.t]++;
            punti += x.sp ? 3 : 1;
            scintille(p, x.t);
            x.el.classList.add("via");
            (function (el) { dopo(240, function () { el.remove(); }); })(x.el);
            g[p[0]][p[1]] = null;
          });
          nascite.forEach(function (n) {
            var x = g[n.p[0]][n.p[1]];
            presi[x.t]++; punti += 4;
            x.sp = n.sp; x.dir = n.dir || null;
            if (n.sp === "arcobaleno") x.t = "arcobaleno";
            disegnaTessera(x); x.el.classList.add("nasce");
            scritta(n.sp === "arcobaleno" ? "Arcobaleno!" : n.sp === "bomba" ? "Bomba di fiori!" : "Girandola!", n.p);
          });
          Suoni.sfx(nascite.length ? "stella" : speciali ? "magia" : "presa");
          disegnaObiettivi();
          dopo(250, function () { cadi(); dopo(320, poi); });
        });
      }
      // caduta: ogni colonna si compatta verso il basso e dall'alto arrivano simboli nuovi
      function cadi() {
        for (var c = 0; c < N; c++) {
          var giu = N - 1;
          for (var r = N - 1; r >= 0; r--) if (g[r][c]) { if (r !== giu) { g[giu][c] = g[r][c]; g[r][c] = null; posa(c, giu, g[giu][c].el); } giu--; }
          for (var k = giu, n = 1; k >= 0; k--, n++) g[k][c] = nuovaTessera(scegli(tipi), c, k, -n);
        }
      }

      // ---- risolvere: togliere le file, far cadere, ripetere (ogni giro della catena vale di più) ----
      var catena = 0;
      var BRAVO = ["", "", "Bravo!", "Fantastico!", "Magico!", "Wii-chu!"];
      function risolvi(dove, poi) {
        var gruppi = trovaGruppi();
        if (!gruppi.length) { poi(); return; }
        catena++;
        if (catena >= 2) { scritta(BRAVO[Math.min(catena, 5)]); punti += catena; }
        var celle = [], nascite = [];
        gruppi.forEach(function (gr) {
          file++;
          celle = celle.concat(gr.celle);
          var s = specialeDi(gr); if (!s) return;
          // lo speciale nasce dove hai mosso, se è nel gruppo; la bomba nell'incrocio; altrimenti a metà
          function libera(p) { return !g[p[0]][p[1]].sp; }
          var mossa = gr.celle.filter(function (p) { return libera(p) && dove && dove.some(function (d) { return d[0] === p[0] && d[1] === p[1]; }); })[0];
          var incrocio = s.sp === "bomba" ? gr.runs[0].celle.filter(function (p) { return libera(p) && gr.runs.slice(1).some(function (x) { return x.celle.some(function (q) { return q[0] === p[0] && q[1] === p[1]; }); }); })[0] : null;
          var lunga = gr.runs.slice().sort(function (a, b) { return b.celle.length - a.celle.length; })[0].celle;
          var qui = mossa || incrocio || lunga.filter(libera)[Math.floor(lunga.filter(libera).length / 2)];
          if (qui) nascite.push({ p: qui, sp: s.sp, dir: s.dir });
        });
        togli(celle, nascite, function () { risolvi(null, poi); });
      }

      // ---- scambiare due speciali (o un arcobaleno con qualcosa): combinazioni ----
      function combina(a, b, poi) {
        var x = g[a[0]][a[1]], y = g[b[0]][b[1]], celle = [a, b];
        catena = 0;
        if (x.sp !== "arcobaleno" && y.sp === "arcobaleno") { var t = x; x = y; y = t; var q = a; a = b; b = q; }
        if (x.sp === "arcobaleno" && y.sp === "arcobaleno") {
          // due arcobaleni: si pulisce tutto!
          scritta("Super arcobaleno!"); effetto("lampo grande", "", 800);
          x.forza = y.forza = true;
          for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) celle.push([r, c]);
          return togli(celle, [], poi);
        }
        if (x.sp === "arcobaleno") {
          var col = y.t;
          x.forza = true; effetto("lampo", "", 600);
          if (!y.sp) {
            // arcobaleno + simbolo: spariscono tutti quelli di quel tipo
            for (var r2 = 0; r2 < N; r2++) for (var c2 = 0; c2 < N; c2++) if (tipoDi(g[r2][c2]) === col) celle.push([r2, c2]);
            return togli(celle, [], poi);
          }
          // arcobaleno + speciale: tutti quelli di quel tipo diventano quello speciale, poi scoppiano
          scritta(y.sp === "bomba" ? "Pioggia di bombe!" : "Mille girandole!");
          for (var r3 = 0; r3 < N; r3++) for (var c3 = 0; c3 < N; c3++) {
            var z = g[r3][c3];
            if (tipoDi(z) === col) { z.sp = y.sp; z.dir = y.sp === "girandola" ? (Math.random() < 0.5 ? "riga" : "colonna") : null; disegnaTessera(z); z.el.classList.add("nasce"); celle.push([r3, c3]); }
          }
          Suoni.sfx("stella");
          return dopo(450, function () { togli(celle, [], poi); });
        }
        // due speciali insieme
        x.forza = y.forza = true;
        var giri = x.sp === "girandola" && y.sp === "girandola" ? 0 : x.sp === "bomba" && y.sp === "bomba" ? 2 : 1;
        if (x.sp === "bomba" && y.sp === "bomba") {
          scritta("Bombona!"); onda(b, 2); Suoni.sfx("pigna");
          for (var dr = -2; dr <= 2; dr++) for (var dc = -2; dc <= 2; dc++) celle.push([b[0] + dr, b[1] + dc]);
        } else {
          // girandola + girandola: una croce; girandola + bomba: una croce larga tre
          scritta(giri ? "Girandola gigante!" : "Croce di girandole!"); Suoni.sfx("magia");
          for (var d = -giri; d <= giri; d++) {
            var rr = b[0] + d, cc = b[1] + d;
            if (rr >= 0 && rr < N) { raggio([rr, b[1]], "riga"); for (var i = 0; i < N; i++) celle.push([rr, i]); }
            if (cc >= 0 && cc < N) { raggio([b[0], cc], "colonna"); for (var j = 0; j < N; j++) celle.push([j, cc]); }
          }
        }
        vibra(60);
        togli(celle, [], poi);
      }

      // per le prove dalla console: chiwinnieTris.metti(r, c, "bomba") e chiwinnieTris.prova([r,c],[r,c+1])
      window.chiwinnieTris = {
        griglia: function () { return g.map(function (riga) { return riga.map(function (x) { return x ? (x.sp ? x.sp[0].toUpperCase() : "") + x.t.slice(0, 2) : "--"; }).join(" "); }).join("\n"); },
        metti: function (r, c, sp, dir, t) { var x = g[r][c]; if (t) x.t = t; x.sp = sp || null; x.dir = dir || (sp === "girandola" ? "riga" : null); if (sp === "arcobaleno") x.t = "arcobaleno"; disegnaTessera(x); },
        prova: function (a, b) { prova(a, b); }, presi: presi
      };

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
      function dopoMossa() {
        if (!mossaPossibile()) { rimescola(); api.info("Rimescolo!"); }
        occupato = false;
        controllaFine();
      }
      function prova(a, b) {
        if (occupato || finito) return;
        if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) !== 1) return;
        occupato = true; evidenzia(null); ultimoTocco = Date.now();
        tav.querySelectorAll(".suggerita").forEach(function (x) { x.classList.remove("suggerita"); });
        var speciale = scambioSpeciale(a, b);
        scambia(a, b); posa(a[1], a[0], g[a[0]][a[1]].el); posa(b[1], b[0], g[b[0]][b[1]].el);
        Suoni.sfx("tap");
        dopo(200, function () {
          if (speciale) {
            mosse--; disegnaObiettivi();
            // dopo lo scambio l'arcobaleno (o lo speciale mosso) è in b
            return combina(a, b, function () { catena = 0; risolvi(null, dopoMossa); });
          }
          if (!trovaGruppi().length) {
            // niente fila: tornano al loro posto
            scambia(a, b); posa(a[1], a[0], g[a[0]][a[1]].el); posa(b[1], b[0], g[b[0]][b[1]].el);
            Suoni.sfx("errore"); vibra(30);
            dopo(200, function () { occupato = false; });
            return;
          }
          mosse--; disegnaObiettivi();
          catena = 0;
          risolvi([a, b], dopoMossa);
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
    ], gioca, api);

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
