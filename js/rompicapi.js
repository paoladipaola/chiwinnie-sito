// Rompicapi: sudoku dei fiori, puzzle scorrevole e labirinto.
// Come gli altri minigiochi: ricevono (area, api) e restituiscono una funzione che li ferma.
(function () {
  function caso(a, b) { return a + Math.random() * (b - a); }
  function mescola(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function vibra(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }
  function tempoDa(inizio) { return Math.floor((Date.now() - inizio) / 1000); }
  function orologio(s) { return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }

  // ---------- Sudoku dei fiori ----------
  // Ogni riga, ogni colonna e ogni riquadro ha ogni simbolo una volta sola.
  // Facile e medio: 4×4 con riquadri 2×2. Difficile: 6×6 con riquadri 2×3 e sei simboli.
  var SIMBOLI = ["spinaci", "petali", "stella", "lucciola", "legnetti", "sassolini"];
  var LIVELLI_SUDOKU = {
    facile:    { N: 4, br: 2, bc: 2, dati: 9 },
    medio:     { N: 4, br: 2, bc: 2, dati: 6 },
    difficile: { N: 6, br: 2, bc: 3, dati: 14 }
  };

  // sceltaLivello: piccola schermata con i bottoni Facile / Medio / Difficile
  function sceltaLivello(area, classe, testo, voci, via) {
    var box = document.createElement("div");
    box.className = "rompicapo scelta " + classe;
    box.innerHTML = "<div class='carta-livelli'><p class='spiega'>" + testo + "</p><div class='livelli'>" +
      voci.map(function (v) { return "<button class='btn" + (v.bianco ? " bianco" : "") + "' data-l='" + v.id + "'>" + v.nome + "<small>" + v.nota + "</small></button>"; }).join("") +
      "</div></div>";
    area.appendChild(box);
    box.querySelector(".livelli").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      box.innerHTML = ""; box.classList.remove("scelta"); via(box, b.dataset.l);
    });
    return box;
  }

  function sudoku(area, api) {
    var fermato = false, timer = null;
    sceltaLivello(area, "sudoku-gioco", "Quanto difficile?", [
      { id: "facile", nome: "Facile", nota: "4×4 · tanti aiuti" },
      { id: "medio", nome: "Medio", nota: "4×4 · pochi aiuti", bianco: true },
      { id: "difficile", nome: "Difficile", nota: "6×6 · sei simboli", bianco: true }
    ], gioca);

    function gioca(box, liv) {
      var L = LIVELLI_SUDOKU[liv], N = L.N, BR = L.br, BC = L.bc;
      function puoStare(g, i, j, v) {
        for (var k = 0; k < N; k++) if (g[i][k] === v || g[k][j] === v) return false;
        var bi = i - i % BR, bj = j - j % BC;
        for (var a = bi; a < bi + BR; a++) for (var b = bj; b < bj + BC; b++) if (g[a][b] === v) return false;
        return true;
      }
      // riempie la griglia (in ordine casuale) e conta le soluzioni fino a "max"
      function risolvi(g, max, casuale) {
        for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) if (g[i][j] === null) {
          var n = 0, vals = Array.from({ length: N }, function (_, k) { return k; });
          if (casuale) mescola(vals);
          for (var x = 0; x < N; x++) {
            var v = vals[x];
            if (!puoStare(g, i, j, v)) continue;
            g[i][j] = v; n += risolvi(g, max - n, casuale);
            if (n >= max) return n;
            g[i][j] = null;
          }
          return n;
        }
        return 1;
      }
      var g = Array.from({ length: N }, function () { return new Array(N).fill(null); });
      risolvi(g, 1, true);
      var celle = mescola(Array.from({ length: N * N }, function (_, i) { return i; })), messi = N * N;
      celle.forEach(function (n) {
        if (messi <= L.dati) return;
        var i = Math.floor(n / N), j = n % N, v = g[i][j];
        g[i][j] = null;
        var prova = g.map(function (r) { return r.slice(); });
        if (risolvi(prova, 2, false) !== 1) g[i][j] = v; else messi--;
      });
      var fissa = g.map(function (r) { return r.map(function (v) { return v !== null; }); });

      box.innerHTML = "<p class='spiega'>Ogni riga, colonna e riquadro ha " + (N === 4 ? "i quattro" : "i sei") + " simboli una volta sola.</p>" +
        "<div class='sudoku n" + N + "'></div><div class='tavolozza n" + N + "'>" +
        SIMBOLI.slice(0, N).map(function (s, v) { return "<button data-v='" + v + "'><img src='img/" + s + ".png' alt=''></button>"; }).join("") +
        "<button data-v='x' class='gomma'>✕</button></div>";
      var griglia = box.querySelector(".sudoku"), scelta = null, errori = 0, finito = false, inizio = Date.now();
      griglia.style.gridTemplateColumns = griglia.style.gridTemplateRows = "repeat(" + N + ", minmax(0, 1fr))";

      function disegna() {
        var h = "";
        for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
          var v = g[i][j], cls = ["cella"];
          if (fissa[i][j]) cls.push("fissa");
          if (scelta && scelta[0] === i && scelta[1] === j) cls.push("scelta");
          if (j % BC === BC - 1 && j < N - 1) cls.push("dx"); if (i % BR === BR - 1 && i < N - 1) cls.push("giu");
          h += "<button class='" + cls.join(" ") + "' data-i='" + i + "' data-j='" + j + "'>" + (v !== null ? "<img src='img/" + SIMBOLI[v] + ".png' alt=''>" : "") + "</button>";
        }
        griglia.innerHTML = h;
      }
      function info() { api.info("⏱ " + orologio(tempoDa(inizio)) + (errori ? "  ·  " + errori + " ops" : "")); }
      timer = setInterval(info, 500); info(); disegna();

      griglia.addEventListener("click", function (e) {
        var c = e.target.closest(".cella"); if (!c || finito) return;
        var i = +c.dataset.i, j = +c.dataset.j;
        if (fissa[i][j]) { Suoni.sfx("gira"); return; }
        scelta = [i, j]; Suoni.sfx("gira"); disegna();
      });
      box.querySelector(".tavolozza").addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b || !scelta || finito) return;
        var i = scelta[0], j = scelta[1];
        if (b.dataset.v === "x") { g[i][j] = null; disegna(); return; }
        var v = +b.dataset.v;
        g[i][j] = null;
        if (!puoStare(g, i, j, v)) {
          // il simbolo c'è già nella riga, nella colonna o nel riquadro: non si mette
          errori++; Suoni.sfx("errore"); vibra(60); info();
          var cella = griglia.querySelector("[data-i='" + i + "'][data-j='" + j + "']");
          cella.classList.add("ops"); setTimeout(function () { cella.classList.remove("ops"); }, 500);
          return;
        }
        g[i][j] = v; Suoni.sfx("presa"); vibra(15);
        // passa da sola alla prossima casella vuota
        scelta = null;
        for (var n = 0; n < N * N && !scelta; n++) { var a = Math.floor(n / N), bb = n % N; if (g[a][bb] === null) scelta = [a, bb]; }
        disegna();
        if (!scelta) termina();
      });

      function termina() {
        finito = true; clearInterval(timer);
        var s = tempoDa(inizio), perfetto = errori === 0, peso = { facile: 1, medio: 1.5, difficile: 3 }[liv];
        griglia.classList.add("risolto"); Suoni.sfx("coppia");
        setTimeout(function () {
          if (fermato) return;
          api.fine({
            punti: Math.round((16 - Math.min(10, errori * 2)) * peso) + (s < 60 ? 6 : 0), completato: true, difficile: liv === "difficile",
            bottino: { petali: Math.round(3 * peso), sassolini: Math.round(2 * peso), stelle: perfetto ? (liv === "difficile" ? 2 : 1) : 0 },
            titolo: perfetto ? "Sudoku perfetto!" : "Sudoku risolto!",
            messaggio: "Ce l'hai fatta in " + orologio(s) + "." + (perfetto ? " Nessun errore: " + (liv === "difficile" ? "due stelle" : "una stella") + " in regalo!" : "")
          });
        }, 900);
      }
    }
    return function () { fermato = true; clearInterval(timer); };
  }

  // ---------- Puzzle scorrevole ----------
  // Un quadro del Bosco Giardino diviso in tessere: si fanno scorrere nel buco finché il disegno torna giusto.
  var QUADRI = { radura: "img/puzzle/radura.jpg", ruscello: "img/puzzle/ruscello.jpg", collina: "img/puzzle/collina.jpg", cielo: "img/puzzle/cielo.jpg" };

  function puzzle(area, api) {
    var aperte = (api.zoneAperte || ["radura"]).filter(function (z) { return QUADRI[z]; });
    var box = document.createElement("div");
    box.className = "rompicapo puzzle-gioco";
    box.innerHTML = "<p class='spiega'>Scegli il quadro e quante tessere.</p><div class='quadri'>" +
      aperte.map(function (z) { return "<button data-z='" + z + "'><img src='" + QUADRI[z] + "' alt=''></button>"; }).join("") +
      "</div><div class='livelli'><button class='btn' data-l='facile'>Facile<small>9 tessere · poco mescolato</small></button>" +
      "<button class='btn bianco' data-l='medio'>Medio<small>9 tessere</small></button><button class='btn bianco' data-l='difficile'>Difficile<small>16 tessere</small></button></div>";
    area.appendChild(box);
    var quadro = aperte[aperte.length - 1], fermato = false, timer = null;
    function evidenzia() { box.querySelectorAll(".quadri button").forEach(function (b) { b.classList.toggle("scelto", b.dataset.z === quadro); }); }
    evidenzia();
    box.querySelector(".quadri").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { quadro = b.dataset.z; evidenzia(); Suoni.sfx("gira"); } });
    box.querySelector(".livelli").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) gioca(b.dataset.l); });

    function gioca(liv) {
      var N = liv === "difficile" ? 4 : 3, img = QUADRI[quadro];
      box.innerHTML = "<div class='tavola" + (liv === "facile" ? " numeri" : "") + "'></div><div class='sotto'><img class='modello' src='" + img + "' alt=''>" +
        "<span>Rimetti in ordine il quadro! Le tessere al posto giusto si illuminano.</span><button class='btn piccolo bianco aiuto'>🔢 Aiuto</button></div>";
      box.querySelector(".aiuto").addEventListener("click", function () { tavola.classList.toggle("numeri"); });
      var tavola = box.querySelector(".tavola");
      // pos[k] = casella dove sta la tessera k; l'ultima tessera è il buco
      var pos = Array.from({ length: N * N }, function (_, i) { return i; }), buco = N * N - 1, mosse = 0, finito = false, inizio = Date.now();
      function vicine(c) { var r = Math.floor(c / N), k = c % N, v = []; if (r > 0) v.push(c - N); if (r < N - 1) v.push(c + N); if (k > 0) v.push(c - 1); if (k < N - 1) v.push(c + 1); return v; }
      // si mescola con mosse vere, così il puzzle è sempre risolvibile
      var prima = -1;
      // il livello facile è mescolato appena: si risolve in poche mosse
      var giri = liv === "facile" ? 8 : N * N * 18;
      for (var m = 0; m < giri || pos.every(function (p, i) { return p === i; }); m++) {
        var v = vicine(pos[buco]).filter(function (c) { return c !== prima; });
        var dove = v[Math.floor(Math.random() * v.length)], k = pos.indexOf(dove);
        prima = pos[buco]; pos[k] = pos[buco]; pos[buco] = dove;
      }
      var tessere = pos.map(function (_, k) {
        var t = document.createElement("button");
        t.className = "tessera" + (k === buco ? " buco" : "");
        t.style.width = t.style.height = (100 / N) + "%";
        t.style.backgroundImage = "url(" + img + ")";
        t.style.backgroundSize = (N * 100) + "%";
        t.style.backgroundPosition = (k % N) * 100 / (N - 1) + "% " + Math.floor(k / N) * 100 / (N - 1) + "%";
        t.dataset.k = k;
        t.innerHTML = "<i>" + (k + 1) + "</i>";
        tavola.appendChild(t);
        return t;
      });
      function metti() { tessere.forEach(function (t, k) { t.style.left = (pos[k] % N) * 100 / N + "%"; t.style.top = Math.floor(pos[k] / N) * 100 / N + "%"; t.classList.toggle("giusta", pos[k] === k && k !== buco); }); }
      function info() { api.info("⏱ " + orologio(tempoDa(inizio)) + "  ·  " + mosse + " mosse"); }
      metti(); info(); timer = setInterval(info, 500);
      tavola.addEventListener("click", function (e) {
        var t = e.target.closest(".tessera"); if (!t || finito) return;
        var k = +t.dataset.k;
        if (vicine(pos[buco]).indexOf(pos[k]) === -1) return;
        var c = pos[k]; pos[k] = pos[buco]; pos[buco] = c; mosse++;
        Suoni.sfx("gira"); metti(); info();
        if (pos.every(function (p, i) { return p === i; })) termina();
      });
      function termina() {
        finito = true; clearInterval(timer);
        tessere[buco].classList.remove("buco"); tavola.classList.add("risolto"); Suoni.sfx("coppia"); vibra(40);
        var s = tempoDa(inizio), bravo = mosse <= (liv === "facile" ? 25 : N === 3 ? 60 : 200);
        setTimeout(function () {
          if (fermato) return;
          api.fine({
            punti: (liv === "facile" ? 8 : N === 3 ? 12 : 24) + (bravo ? 6 : 0), completato: true, difficile: N === 4,
            bottino: { legnetti: liv === "facile" ? 2 : N === 3 ? 3 : 6, petali: liv === "facile" ? 1 : N === 3 ? 2 : 4, stelle: bravo && liv !== "facile" ? 1 : 0 },
            titolo: N === 4 ? "Puzzle difficile completato!" : "Quadro rimesso a posto!",
            messaggio: "Ce l'hai fatta in " + mosse + " mosse e " + orologio(s) + "." + (bravo ? " Pochissime mosse: una stella in regalo!" : "")
          });
        }, 1200);
      }
    }
    return function () { fermato = true; clearInterval(timer); };
  }

  // ---------- Labirinto ----------
  // Il Chiwinnie deve arrivare al cestino degli spinaci tra le siepi. Si guida scorrendo il dito o con le frecce.
  var LIVELLI_LABIRINTO = {
    facile:    { C: 6, giri: true, nebbia: false },
    medio:     { C: 9, giri: false, nebbia: false },
    difficile: { C: 11, giri: false, nebbia: true }   // nella nebbia si vede solo vicino al Chiwinnie
  };
  function labirinto(area, api) {
    var ferma = null, scelta = sceltaLivello(area, "labirinto-gioco", "Quanto difficile?", [
      { id: "facile", nome: "Facile", nota: "piccolo, tante strade" },
      { id: "medio", nome: "Medio", nota: "grande, una sola strada", bianco: true },
      { id: "difficile", nome: "Difficile", nota: "gigante, nella nebbia", bianco: true }
    ], function (box, liv) { box.remove(); ferma = labirintoGioca(area, api, liv); });
    return function () { if (ferma) ferma(); };
  }
  function labirintoGioca(area, api, liv) {
    var LL = LIVELLI_LABIRINTO[liv], C = LL.C;
    var box = document.createElement("div");
    box.className = "rompicapo labirinto-gioco";
    box.innerHTML = "<canvas></canvas><div class='frecce'><button data-d='su'>▲</button><button data-d='sx'>◀</button><button data-d='giu'>▼</button><button data-d='dx'>▶</button></div>";
    area.appendChild(box);
    var cv = box.querySelector("canvas"), ctx = cv.getContext("2d");
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = box.clientWidth - 32, H = box.clientHeight - 250;   // spazio per titolo e frecce
    var R = Math.max(C, Math.min(Math.round(C * 1.6), Math.round(C * H / W)));
    var lato = Math.floor(Math.min((W - 16) / C, (H - 8) / R));
    cv.width = C * lato * dpr; cv.height = R * lato * dpr; cv.style.width = C * lato + "px"; cv.style.height = R * lato + "px";
    ctx.scale(dpr, dpr);

    // muri: per ogni casella, aperta verso [su, dx, giu, sx]
    var aperto = Array.from({ length: R * C }, function () { return [false, false, false, false]; });
    var DIR = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    (function scava() {
      var visto = new Array(R * C).fill(false), pila = [0]; visto[0] = true;
      while (pila.length) {
        var c = pila[pila.length - 1], r = Math.floor(c / C), k = c % C;
        var opz = [0, 1, 2, 3].filter(function (d) { var rr = r + DIR[d][0], kk = k + DIR[d][1]; return rr >= 0 && rr < R && kk >= 0 && kk < C && !visto[rr * C + kk]; });
        if (!opz.length) { pila.pop(); continue; }
        var d = opz[Math.floor(Math.random() * opz.length)], n = (r + DIR[d][0]) * C + k + DIR[d][1];
        aperto[c][d] = true; aperto[n][(d + 2) % 4] = true; visto[n] = true; pila.push(n);
      }
    })();
    // qualche passaggio in più, così ci sono più strade
    for (var x = 0; LL.giri && x < R * C / 8; x++) {
      var c0 = Math.floor(Math.random() * R * C), d0 = Math.random() < 0.5 ? 1 : 2, r0 = Math.floor(c0 / C), k0 = c0 % C;
      if ((d0 === 1 && k0 < C - 1) || (d0 === 2 && r0 < R - 1)) { var n0 = c0 + (d0 === 1 ? 1 : C); aperto[c0][d0] = true; aperto[n0][(d0 + 2) % 4] = true; }
    }
    var arrivo = R * C - 1;
    var petali = mescola(Array.from({ length: R * C - 2 }, function (_, i) { return i + 1; })).slice(0, 5);

    function carica(src) { var im = new Image(); im.src = src; return im; }
    var I = { chiwi: carica(immagineChiwi(api.colore, "fronte")), cesto: carica("img/spinaci.png"), petalo: carica("img/petali.png") };
    var dove = 0, vis = { r: 0, k: 0 }, coda = [], presi = 0, finito = false, inizio = Date.now(), raf = 0, tempo = 0, ultimo = performance.now();

    function muovi(d) {
      if (finito) return;
      // si scivola lungo il corridoio fino al primo incrocio: meno tocchi per i più piccoli
      var c = coda.length ? coda[coda.length - 1] : dove, passi = 0;
      while (aperto[c][d] && passi < 30) {
        var r = Math.floor(c / C), k = c % C; c = (r + DIR[d][0]) * C + k + DIR[d][1]; coda.push(c); passi++;
        var uscite = aperto[c].filter(Boolean).length;
        if (uscite !== 2 || c === arrivo || petali.indexOf(c) !== -1) break;
        if (!aperto[c][d]) { var altra = [0, 1, 2, 3].filter(function (dd) { return aperto[c][dd] && dd !== (d + 2) % 4; })[0]; d = altra; }
      }
      if (!passi) { Suoni.sfx("gira"); return; }
      Suoni.sfx("presa");
    }
    box.querySelector(".frecce").addEventListener("pointerdown", function (e) {
      var b = e.target.closest("button"); if (!b) return; e.preventDefault();
      muovi({ su: 0, dx: 1, giu: 2, sx: 3 }[b.dataset.d]);
    });
    var tocco = null;
    cv.addEventListener("pointerdown", function (e) { tocco = [e.clientX, e.clientY]; });
    cv.addEventListener("pointerup", function (e) {
      if (!tocco) return;
      var dx = e.clientX - tocco[0], dy = e.clientY - tocco[1]; tocco = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
      muovi(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
    });
    function tasto(e) { var d = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[e.key]; if (d !== undefined) { e.preventDefault(); muovi(d); } }
    window.addEventListener("keydown", tasto);

    function ciclo(ora) {
      var dt = Math.min(0.05, (ora - ultimo) / 1000); ultimo = ora; tempo += dt;
      // il Chiwinnie va verso la prossima casella della coda
      if (coda.length) {
        var t = coda[0], tr = Math.floor(t / C), tk = t % C, v = 9 * dt;
        vis.r += Math.max(-v, Math.min(v, tr - vis.r)); vis.k += Math.max(-v, Math.min(v, tk - vis.k));
        if (Math.abs(vis.r - tr) < 0.01 && Math.abs(vis.k - tk) < 0.01) {
          vis.r = tr; vis.k = tk; dove = coda.shift();
          var ip = petali.indexOf(dove);
          if (ip !== -1) { petali.splice(ip, 1); presi++; Suoni.sfx("lucciola"); vibra(20); }
          if (dove === arrivo) { coda = []; termina(); }
        }
      }
      disegna();
      api.info("⏱ " + orologio(tempoDa(inizio)) + "  ·  🌸 " + presi);
      if (!finito) raf = requestAnimationFrame(ciclo);
    }
    function disegna() {
      var w = C * lato, h = R * lato;
      ctx.fillStyle = "#eef3d6"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e3ebc4";
      for (var c = 0; c < R * C; c++) if ((Math.floor(c / C) + c % C) % 2) ctx.fillRect((c % C) * lato, Math.floor(c / C) * lato, lato, lato);
      // siepi
      ctx.strokeStyle = "#5f9a4c"; ctx.lineWidth = Math.max(5, lato * 0.16); ctx.lineCap = "round";
      ctx.beginPath();
      for (c = 0; c < R * C; c++) {
        var x = (c % C) * lato, y = Math.floor(c / C) * lato;
        if (!aperto[c][0]) { ctx.moveTo(x, y); ctx.lineTo(x + lato, y); }
        if (!aperto[c][3]) { ctx.moveTo(x, y); ctx.lineTo(x, y + lato); }
        if (c % C === C - 1 && !aperto[c][1]) { ctx.moveTo(x + lato, y); ctx.lineTo(x + lato, y + lato); }
        if (Math.floor(c / C) === R - 1 && !aperto[c][2]) { ctx.moveTo(x, y + lato); ctx.lineTo(x + lato, y + lato); }
      }
      ctx.stroke();
      ctx.strokeStyle = "#7db866"; ctx.lineWidth = Math.max(2, lato * 0.06); ctx.stroke();
      // petali e cestino
      petali.forEach(function (p, i) {
        var s = lato * 0.5, ox = (p % C + 0.5) * lato, oy = (Math.floor(p / C) + 0.5) * lato + Math.sin(tempo * 3 + i) * 2;
        if (I.petalo.complete) ctx.drawImage(I.petalo, ox - s / 2, oy - s / 2, s, s);
      });
      var sc = lato * 0.8 * (1 + Math.sin(tempo * 4) * 0.05);
      if (I.cesto.complete) ctx.drawImage(I.cesto, (C - 0.5) * lato - sc / 2, (R - 0.5) * lato - sc / 2, sc, sc);
      var sz = lato * 0.95;
      if (I.chiwi.complete) ctx.drawImage(I.chiwi, (vis.k + 0.5) * lato - sz / 2, (vis.r + 0.5) * lato - sz / 2 - 2, sz, sz);
      if (LL.nebbia && !finito) {
        // nebbia: si vede solo un cerchio intorno al Chiwinnie (e il cestino brilla da lontano)
        var cx = (vis.k + 0.5) * lato, cy = (vis.r + 0.5) * lato, rg = ctx.createRadialGradient(cx, cy, lato * 1.4, cx, cy, lato * 2.8);
        rg.addColorStop(0, "rgba(245, 240, 250, 0)"); rg.addColorStop(1, "rgba(236, 230, 244, 0.97)");
        ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 0.6 + Math.sin(tempo * 3) * 0.3;
        if (I.cesto.complete) ctx.drawImage(I.cesto, (C - 0.5) * lato - sc / 2, (R - 0.5) * lato - sc / 2, sc, sc);
        ctx.globalAlpha = 1;
      }
    }
    raf = requestAnimationFrame(ciclo);
    // per le prove: window.chiwinnieLabirinto.passo(dt) fa avanzare il gioco anche a schermo nascosto
    window.chiwinnieLabirinto = { info: function () { return { dove: dove, vis: vis, coda: coda.slice(), C: C, R: R, aperto: aperto, petali: petali.slice() }; }, muovi: muovi, passo: function (dt) { ultimo = performance.now() - dt * 1000; cancelAnimationFrame(raf); ciclo(performance.now()); } };

    function termina() {
      finito = true; window.removeEventListener("keydown", tasto);
      Suoni.sfx("coppia"); vibra(40);
      var s = tempoDa(inizio), veloce = s <= 20 + C * R * 0.6, peso = { facile: 1, medio: 2, difficile: 3 }[liv];
      setTimeout(function () {
        disegna();
        api.fine({
          punti: 10 * peso + presi * 2 + (veloce ? 6 : 0), completato: true, difficile: liv === "difficile",
          bottino: { sassolini: 2 * peso, legnetti: 2 * peso, petali: presi, stelle: veloce && presi === 5 ? (liv === "facile" ? 0 : 1) : 0 },
          titolo: "Fuori dal labirinto!",
          messaggio: "Arrivato al cestino in " + orologio(s) + " con " + presi + " petali." + (veloce && presi === 5 && liv !== "facile" ? " Tutti i petali e velocissimo: una stella in regalo!" : presi < 5 ? " Prova a prendere tutti e 5 i petali!" : "")
        });
      }, 500);
    }
    return function () { finito = true; cancelAnimationFrame(raf); window.removeEventListener("keydown", tasto); };
  }

  Minigiochi.sudoku = sudoku;
  Minigiochi.puzzle = puzzle;
  Minigiochi.labirinto = labirinto;
  window.SceltaLivello = sceltaLivello;   // la usano anche gli altri giochini
})();
