// Minigiochi. Ognuno riceve l'area di gioco e un'api { info(testo), fine(risultato), livello }
// e restituisce una funzione che lo ferma. Il risultato è
// { punti, bottino: { materiale: quantità }, titolo, messaggio, ... }.
var Minigiochi = (function () {
  "use strict";

  function carica(src) { var i = new Image(); i.src = src; return i; }
  function caso(a, b) { return a + Math.random() * (b - a); }

  // ---------- Raccolta nel bosco ----------
  function raccolta(area, api) {
    var DURATA = 30;
    var canvas = document.createElement("canvas");
    area.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var W, H;
    function misura() {
      W = area.clientWidth; H = area.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    misura();

    var img = {
      sfondo: carica("img/radura.jpg"), chiwi: carica(immagineChiwi(api.colore, "fronte")),
      spinaci: carica("img/spinaci.png"), legnetti: carica("img/legnetti.png"),
      sassolini: carica("img/sassolini.png"), petali: carica("img/petali.png"), pigna: carica("img/pigna.png")
    };
    var tipi = [
      { k: "spinaci", p: 38 }, { k: "legnetti", p: 24 }, { k: "sassolini", p: 14 }, { k: "petali", p: 6 }, { k: "pigna", p: 18 }
    ];
    function tipoCasuale(t) {
      // col passare del tempo le pigne diventano un po' più frequenti
      var extraPigne = t * 0.5;
      var tot = tipi.reduce(function (s, x) { return s + x.p + (x.k === "pigna" ? extraPigne : 0); }, 0);
      var r = Math.random() * tot;
      for (var i = 0; i < tipi.length; i++) {
        r -= tipi[i].p + (tipi[i].k === "pigna" ? extraPigne : 0);
        if (r <= 0) return tipi[i].k;
      }
      return "spinaci";
    }

    var chiwi = { x: W / 2, w: Math.min(120, W * 0.26) };
    var oggetti = [], scritte = [];
    var punti = 0, bottino = { spinaci: 0, legnetti: 0, sassolini: 0, petali: 0 };
    var inizio = performance.now(), ultimo = inizio, prossimo = 0, stordito = 0, finito = false, raf;

    function muovi(e) {
      var r = canvas.getBoundingClientRect();
      chiwi.x = Math.max(chiwi.w / 2, Math.min(W - chiwi.w / 2, e.clientX - r.left));
    }
    canvas.addEventListener("pointerdown", muovi);
    canvas.addEventListener("pointermove", muovi);
    window.addEventListener("resize", misura);

    function disegnaCover(im) {
      if (!im.complete || !im.naturalWidth) return;
      var s = Math.max(W / im.naturalWidth, H / im.naturalHeight);
      var w = im.naturalWidth * s, h = im.naturalHeight * s;
      ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
    }

    function ciclo(ora) {
      if (finito) return;
      var dt = Math.min(0.05, (ora - ultimo) / 1000); ultimo = ora;
      var t = (ora - inizio) / 1000;
      var resta = Math.max(0, DURATA - t);
      api.info("⏱ " + Math.ceil(resta) + "  ·  " + punti + " punti");

      // nuovi oggetti: sempre più spesso e sempre più veloci
      prossimo -= dt;
      if (prossimo <= 0) {
        var k = tipoCasuale(t);
        var dim = k === "pigna" ? 44 : 50;
        oggetti.push({ k: k, x: caso(dim, W - dim), y: -dim, v: H * caso(0.28, 0.36) * (1 + t / 40), dim: dim, rot: caso(-1, 1) });
        prossimo = Math.max(0.32, 0.75 - t * 0.014);
      }

      var cy = H - 40 - chiwi.w * 1.08; // linea di presa (la pancia del Chiwinnie)
      oggetti.forEach(function (o) {
        o.y += o.v * dt;
        if (!o.preso && o.y > cy && o.y < cy + 50 && Math.abs(o.x - chiwi.x) < chiwi.w * 0.5) {
          o.preso = true;
          if (o.k === "pigna") {
            punti = Math.max(0, punti - 2); stordito = 0.6; Suoni.sfx("pigna");
            scritte.push({ x: o.x, y: cy, t: 0, s: "-2", c: "#e2504c" });
            try { navigator.vibrate && navigator.vibrate(80); } catch (e) {}
          } else {
            punti++; bottino[o.k]++; Suoni.sfx("presa");
            scritte.push({ x: o.x, y: cy, t: 0, s: "+1", c: "#3d7a2e" });
          }
        }
      });
      oggetti = oggetti.filter(function (o) { return !o.preso && o.y < H + 60; });

      // disegno
      ctx.clearRect(0, 0, W, H);
      disegnaCover(img.sfondo);
      ctx.fillStyle = "rgba(255,250,240,.15)"; ctx.fillRect(0, 0, W, H);
      oggetti.forEach(function (o) {
        var im = img[o.k];
        if (!im.complete) return;
        var r = im.naturalHeight / im.naturalWidth;
        ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot * Math.sin((ora / 400) + o.x));
        ctx.drawImage(im, -o.dim / 2, -o.dim * r / 2, o.dim, o.dim * r);
        ctx.restore();
      });
      if (stordito > 0) stordito -= dt;
      if (img.chiwi.complete) {
        var ch = chiwi.w * img.chiwi.naturalHeight / img.chiwi.naturalWidth;
        ctx.save();
        if (stordito > 0) { ctx.globalAlpha = 0.6 + 0.4 * Math.sin(ora / 40); }
        ctx.drawImage(img.chiwi, chiwi.x - chiwi.w / 2, H - 30 - ch, chiwi.w, ch);
        ctx.restore();
      }
      scritte.forEach(function (s) {
        s.t += dt;
        ctx.globalAlpha = Math.max(0, 1 - s.t);
        ctx.fillStyle = s.c; ctx.font = "800 26px 'Baloo 2', sans-serif"; ctx.textAlign = "center";
        ctx.fillText(s.s, s.x, s.y - s.t * 60);
        ctx.globalAlpha = 1;
      });
      scritte = scritte.filter(function (s) { return s.t < 1; });

      if (resta <= 0) { termina(); return; }
      raf = requestAnimationFrame(ciclo);
    }
    raf = requestAnimationFrame(ciclo);

    function termina() {
      finito = true; cancelAnimationFrame(raf);
      window.removeEventListener("resize", misura);
      api.fine({
        punti: punti, bottino: bottino,
        titolo: punti >= 25 ? "Raccolta strepitosa!" : punti >= 15 ? "Bravissimo!" : "Ben fatto!",
        messaggio: "Hai fatto " + punti + (punti === 1 ? " punto." : " punti.") + (punti < 15 ? " Prova a evitare le pigne!" : "")
      });
    }
    return function () { finito = true; cancelAnimationFrame(raf); window.removeEventListener("resize", misura); };
  }

  // ---------- Memory dei fiori ----------
  function memory(area, api) {
    var DURATA = 60;
    var figure = ["spinaci", "petali", "legnetti", "sassolini", "stella", "lucciola"];
    var mazzo = figure.concat(figure).sort(function () { return Math.random() - 0.5; });
    var griglia = document.createElement("div");
    griglia.className = "memory";
    griglia.innerHTML = mazzo.map(function (f, i) {
      return "<div class='carta-mem' data-i='" + i + "'><div class='dentro'><div class='faccia retro'></div><div class='faccia fronte'><img src='img/" + f + ".png' alt=''></div></div></div>";
    }).join("");
    area.appendChild(griglia);

    var girate = [], trovate = 0, mosse = 0, bloccato = false, finito = false;
    var inizio = Date.now();
    var timer = setInterval(aggiorna, 250);
    function aggiorna() {
      var resta = Math.max(0, DURATA - (Date.now() - inizio) / 1000);
      api.info("⏱ " + Math.ceil(resta) + "  ·  " + mosse + " mosse");
      if (resta <= 0) termina(false);
    }
    aggiorna();

    griglia.addEventListener("click", function (e) {
      var c = e.target.closest(".carta-mem");
      if (!c || bloccato || finito || c.classList.contains("girata") || c.classList.contains("trovata")) return;
      c.classList.add("girata");
      Suoni.sfx("gira");
      girate.push(c);
      if (girate.length < 2) return;
      mosse++;
      var a = girate[0], b = girate[1];
      if (mazzo[a.dataset.i] === mazzo[b.dataset.i]) {
        setTimeout(function () { a.classList.add("trovata"); b.classList.add("trovata"); }, 300);
        girate = []; trovate++;
        setTimeout(function () { Suoni.sfx("coppia"); }, 250);
        try { navigator.vibrate && navigator.vibrate(30); } catch (err) {}
        if (trovate === figure.length) setTimeout(function () { termina(true); }, 700);
      } else {
        bloccato = true;
        setTimeout(function () { a.classList.remove("girata"); b.classList.remove("girata"); girate = []; bloccato = false; }, 800);
      }
      aggiorna();
    });

    function termina(completato) {
      if (finito) return;
      finito = true; clearInterval(timer);
      var resta = Math.max(0, DURATA - (Date.now() - inizio) / 1000);
      var petali = trovate + (completato ? 3 : 0) + (completato && resta > 20 ? 2 : 0);
      api.fine({
        punti: trovate * 3 + (completato ? 6 : 0), bottino: { petali: petali, stelle: completato && mosse < 16 ? 1 : 0 },
        completato: completato, mosse: mosse,
        titolo: completato ? "Tutte le coppie!" : "Tempo scaduto!",
        messaggio: completato ? "Ce l'hai fatta in " + mosse + " mosse." + (mosse < 16 ? " Memoria da campione: una stella in regalo!" : "") : "Hai trovato " + trovate + " coppie su " + figure.length + "."
      });
    }
    return function () { finito = true; clearInterval(timer); };
  }

  // ---------- Lucciole ----------
  function lucciole(area, api) {
    var DURATA = 30;
    var punti = 0, finito = false, inizio = Date.now(), timers = [];
    var timer = setInterval(aggiorna, 250);
    function aggiorna() {
      var resta = Math.max(0, DURATA - (Date.now() - inizio) / 1000);
      api.info("⏱ " + Math.ceil(resta) + "  ·  " + punti + " lucciole");
      if (resta <= 0) termina();
    }
    function nuova(extra) {
      if (finito) return;
      var t = (Date.now() - inizio) / 1000;
      var el = document.createElement("div");
      el.className = "lucciola";
      el.innerHTML = "<img src='img/lucciola.png' alt=''>";
      el.style.left = caso(12, 88) + "%"; el.style.top = caso(18, 85) + "%";
      area.appendChild(el);
      var vita = Math.max(750, 1500 - t * 25);
      el.addEventListener("pointerdown", function () {
        if (el.classList.contains("presa")) return;
        el.classList.add("presa"); punti++; aggiorna(); Suoni.sfx("lucciola");
        try { navigator.vibrate && navigator.vibrate(20); } catch (e) {}
        setTimeout(function () { el.remove(); }, 400);
      });
      timers.push(setTimeout(function () { if (!el.classList.contains("presa")) { el.style.transition = "opacity .25s"; el.style.opacity = "0"; setTimeout(function () { el.remove(); }, 260); } }, vita));
      if (extra) return;   // la lucciola in più non ne fa nascere altre: prima si moltiplicavano all'infinito e il telefono si bloccava
      timers.push(setTimeout(nuova, Math.max(320, 700 - t * 13) * caso(0.7, 1.2)));
      // a volte ne arrivano due insieme
      if (t > 10 && Math.random() < 0.25) timers.push(setTimeout(nuova, 150, true));
    }
    nuova();
    function termina() {
      if (finito) return;
      finito = true; clearInterval(timer); timers.forEach(clearTimeout);
      api.fine({
        punti: punti, bottino: { sassolini: Math.floor(punti / 2), petali: Math.floor(punti / 5) },
        titolo: punti >= 20 ? "Cacciatore di lucciole!" : "Che bella serata!",
        messaggio: "Hai preso " + punti + " lucciole."
      });
    }
    return function () { finito = true; clearInterval(timer); timers.forEach(clearTimeout); };
  }

  return { raccolta: raccolta, memory: memory, lucciole: lucciole };
})();
