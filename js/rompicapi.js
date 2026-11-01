// Rompicapi: sudoku dei fiori, puzzle scorrevole e labirinto.
// Come gli altri minigiochi: ricevono (area, api) e restituiscono una funzione che li ferma.
(function () {
  function caso(a, b) { return a + Math.random() * (b - a); }
  function mescola(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function vibra(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }
  function tempoDa(inizio) { return Math.floor((Date.now() - inizio) / 1000); }
  function orologio(s) { return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }

  // ---------- Sudoku dei fiori (4×4) ----------
  // Ogni riga, ogni colonna e ogni quadrato 2×2 ha i quattro simboli una volta sola.
  var SIMBOLI = ["spinaci", "petali", "stella", "lucciola"];

  function soluzioneCasuale() {
    var g = [[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]];
    var simb = mescola([0, 1, 2, 3]);
    // si scambiano righe dentro la stessa fascia, le fasce tra loro, e lo stesso per le colonne
    function ordine() { var f = mescola([[0, 1], [2, 3]]); return [].concat(mescola(f[0].slice()), mescola(f[1].slice())); }
    var r = ordine(), c = ordine(), trasposta = Math.random() < 0.5, out = [];
    for (var i = 0; i < 4; i++) {
      out.push([]);
      for (var j = 0; j < 4; j++) { var v = trasposta ? g[c[j]][r[i]] : g[r[i]][c[j]]; out[i].push(simb[v]); }
    }
    return out;
  }
  function puoStare(g, i, j, v) {
    for (var k = 0; k < 4; k++) if (g[i][k] === v || g[k][j] === v) return false;
    var bi = i - i % 2, bj = j - j % 2;
    for (var a = bi; a < bi + 2; a++) for (var b = bj; b < bj + 2; b++) if (g[a][b] === v) return false;
    return true;
  }
  function contaSoluzioni(g, max) {
    for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) if (g[i][j] === null) {
      var n = 0;
      for (var v = 0; v < 4; v++) if (puoStare(g, i, j, v)) {
        g[i][j] = v; n += contaSoluzioni(g, max - n); g[i][j] = null;
        if (n >= max) return n;
      }
      return n;
    }
    return 1;
  }

  function sudoku(area, api) {
    var sol = soluzioneCasuale();
    var dati = api.livello < 5 ? 9 : api.livello < 10 ? 7 : 6;   // quanti simboli già messi
    var g = sol.map(function (r) { return r.slice(); });
    var celle = mescola(Array.from({ length: 16 }, function (_, i) { return i; })), messi = 16;
    celle.forEach(function (n) {
      if (messi <= dati) return;
      var i = Math.floor(n / 4), j = n % 4, v = g[i][j];
      g[i][j] = null;
      if (contaSoluzioni(g, 2) !== 1) g[i][j] = v; else messi--;
    });
    var fissa = g.map(function (r) { return r.map(function (v) { return v !== null; }); });

    var box = document.createElement("div");
    box.className = "rompicapo sudoku-gioco";
    box.innerHTML = "<p class='spiega'>Ogni riga, colonna e quadrato ha i quattro simboli una volta sola.</p>" +
      "<div class='sudoku'></div><div class='tavolozza'>" +
      SIMBOLI.map(function (s, v) { return "<button data-v='" + v + "'><img src='img/" + s + ".png' alt=''></button>"; }).join("") +
      "<button data-v='x' class='gomma'>✕</button></div>";
    area.appendChild(box);
    var griglia = box.querySelector(".sudoku"), scelta = null, errori = 0, finito = false, inizio = Date.now();

    function disegna() {
      var h = "";
      for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) {
        var v = g[i][j], cls = ["cella"];
        if (fissa[i][j]) cls.push("fissa");
        if (scelta && scelta[0] === i && scelta[1] === j) cls.push("scelta");
        if (j === 1) cls.push("dx"); if (i === 1) cls.push("giu");
        h += "<button class='" + cls.join(" ") + "' data-i='" + i + "' data-j='" + j + "'>" + (v !== null ? "<img src='img/" + SIMBOLI[v] + ".png' alt=''>" : "") + "</button>";
      }
      griglia.innerHTML = h;
    }
    function info() { api.info("⏱ " + orologio(tempoDa(inizio)) + (errori ? "  ·  " + errori + " ops" : "")); }
    var timer = setInterval(info, 500); info(); disegna();

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
        // il simbolo c'è già nella riga, nella colonna o nel quadrato: si mostra dove e non si mette
        errori++; Suoni.sfx("errore"); vibra(60); info();
        var cella = griglia.querySelector("[data-i='" + i + "'][data-j='" + j + "']");
        cella.classList.add("ops"); setTimeout(function () { cella.classList.remove("ops"); }, 500);
        return;
      }
      g[i][j] = v; Suoni.sfx("presa"); vibra(15);
      // passa da sola alla prossima casella vuota
      scelta = null;
      for (var n = 0; n < 16 && !scelta; n++) { var a = Math.floor(n / 4), bb = n % 4; if (g[a][bb] === null) scelta = [a, bb]; }
      disegna();
      if (!scelta) termina();
    });

    function termina() {
      finito = true; clearInterval(timer);
      var s = tempoDa(inizio), perfetto = errori === 0;
      griglia.classList.add("risolto"); Suoni.sfx("coppia");
      setTimeout(function () {
        api.fine({
          punti: 16 - errori * 2 + (s < 60 ? 6 : 0), completato: true, bottino: { petali: 3, sassolini: 2, stelle: perfetto ? 1 : 0 },
          titolo: perfetto ? "Sudoku perfetto!" : "Sudoku risolto!",
          messaggio: "Ce l'hai fatta in " + orologio(s) + "." + (perfetto ? " Nessun errore: una stella in regalo!" : "")
        });
      }, 900);
    }
    return function () { finito = true; clearInterval(timer); };
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
      "</div><div class='azioni-pannello'><button class='btn' data-n='3'>Facile · 9</button><button class='btn bianco' data-n='4'>Difficile · 16</button></div>";
    area.appendChild(box);
    var quadro = aperte[aperte.length - 1], fermato = false, timer = null;
    function evidenzia() { box.querySelectorAll(".quadri button").forEach(function (b) { b.classList.toggle("scelto", b.dataset.z === quadro); }); }
    evidenzia();
    box.querySelector(".quadri").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { quadro = b.dataset.z; evidenzia(); Suoni.sfx("gira"); } });
    box.querySelector(".azioni-pannello").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) gioca(+b.dataset.n); });

    function gioca(N) {
      var img = QUADRI[quadro];
      box.innerHTML = "<div class='tavola'></div><div class='sotto'><img class='modello' src='" + img + "' alt=''><span>Rimetti in ordine il quadro!</span></div>";
      var tavola = box.querySelector(".tavola");
      // pos[k] = casella dove sta la tessera k; l'ultima tessera è il buco
      var pos = Array.from({ length: N * N }, function (_, i) { return i; }), buco = N * N - 1, mosse = 0, finito = false, inizio = Date.now();
      function vicine(c) { var r = Math.floor(c / N), k = c % N, v = []; if (r > 0) v.push(c - N); if (r < N - 1) v.push(c + N); if (k > 0) v.push(c - 1); if (k < N - 1) v.push(c + 1); return v; }
      // si mescola con mosse vere, così il puzzle è sempre risolvibile
      var prima = -1;
      for (var m = 0; m < N * N * 18; m++) {
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
        var s = tempoDa(inizio), bravo = mosse <= (N === 3 ? 60 : 200);
        setTimeout(function () {
          if (fermato) return;
          api.fine({
            punti: (N === 3 ? 12 : 24) + (bravo ? 6 : 0), completato: true, difficile: N === 4,
            bottino: { legnetti: N === 3 ? 3 : 6, petali: N === 3 ? 2 : 4, stelle: bravo ? 1 : 0 },
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
  function labirinto(area, api) {
    var C = 6 + Math.min(3, Math.floor(api.livello / 4));
    var box = document.createElement("div");
    box.className = "rompicapo labirinto-gioco";
    box.innerHTML = "<canvas></canvas><div class='frecce'><button data-d='su'>▲</button><button data-d='sx'>◀</button><button data-d='giu'>▼</button><button data-d='dx'>▶</button></div>";
    area.appendChild(box);
    var cv = box.querySelector("canvas"), ctx = cv.getContext("2d");
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = box.clientWidth - 32, H = box.clientHeight - 250;   // spazio per titolo e frecce
    var R = Math.max(C, Math.min(C + 4, Math.round(C * H / W)));
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
    for (var x = 0; x < R * C / 8; x++) {
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
    }
    raf = requestAnimationFrame(ciclo);
    // per le prove: window.chiwinnieLabirinto.passo(dt) fa avanzare il gioco anche a schermo nascosto
    window.chiwinnieLabirinto = { info: function () { return { dove: dove, vis: vis, coda: coda.slice(), C: C, R: R, aperto: aperto, petali: petali.slice() }; }, muovi: muovi, passo: function (dt) { ultimo = performance.now() - dt * 1000; cancelAnimationFrame(raf); ciclo(performance.now()); } };

    function termina() {
      finito = true; window.removeEventListener("keydown", tasto);
      Suoni.sfx("coppia"); vibra(40);
      var s = tempoDa(inizio), veloce = s <= 30 + C * 5;
      setTimeout(function () {
        disegna();
        api.fine({
          punti: 10 + presi * 2 + (veloce ? 6 : 0), completato: true,
          bottino: { sassolini: 2, legnetti: 2, petali: presi, stelle: veloce && presi === 5 ? 1 : 0 },
          titolo: "Fuori dal labirinto!",
          messaggio: "Arrivato al cestino in " + orologio(s) + " con " + presi + " petali." + (veloce && presi === 5 ? " Tutti i petali e velocissimo: una stella in regalo!" : presi < 5 ? " Prova a prendere tutti e 5 i petali!" : "")
        });
      }, 500);
    }
    return function () { finito = true; cancelAnimationFrame(raf); window.removeEventListener("keydown", tasto); };
  }

  Minigiochi.sudoku = sudoku;
  Minigiochi.puzzle = puzzle;
  Minigiochi.labirinto = labirinto;
})();
