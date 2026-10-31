// Pagine da colorare: si sceglie un disegno, si tocca una zona per riempirla di colore
// oppure si usa il pennello. Il disegno resta salvato sul dispositivo per continuarlo dopo.
(function () {
  "use strict";

  var PAGINE = [
    { id: "copertina", nome: "Chiwinnie" }, { id: "crescita", nome: "Le fasi della crescita" },
    { id: "colori", nome: "I colori della natura" }, { id: "bosco", nome: "Nel bosco" },
    { id: "amici", nome: "Amici per sempre" }, { id: "spinaci", nome: "La razione quotidiana" },
    { id: "arrabbiato", nome: "Quando si arrabbia" }, { id: "volare", nome: "Volare nel cielo" }
  ];
  // colori morbidi da acquerello, compresi quelli dei Chiwinnie
  var COLORI = ["#b9a7e0", "#8a74c9", "#f3b3c8", "#e2789a", "#ffffff", "#9fc6ea", "#5f8fd0", "#a8d8a0",
    "#5fa865", "#f6dc7a", "#f2a65a", "#e5604f", "#c9925e", "#8a5a3c", "#9aa0a8", "#3d3d4a"];
  var CHIAVE = "chiwinnie-colora-";
  var SOGLIA_LINEA = 200; // sotto questa luminosità il pixel è una linea del disegno

  function carica(chiave) { try { return localStorage.getItem(chiave); } catch (e) { return null; } }
  function salva(chiave, v) { try { localStorage.setItem(chiave, v); } catch (e) { /* memoria piena: si continua senza salvare */ } }

  Minigiochi.colora = function (area, api) {
    var fermo = false, timerSalva = null;
    var stile = document.createElement("style");
    stile.textContent =
      ".colora{position:absolute;inset:0;background:#fbf4e8;display:flex;flex-direction:column;padding-top:max(64px,calc(env(safe-area-inset-top) + 54px))}" +
      ".colora-galleria{flex:1;overflow-y:auto;display:grid;grid-template-columns:repeat(2,1fr);gap:12px;padding:8px 14px 20px}" +
      ".colora-galleria button{border:3px solid #e9dcc6;background:white;border-radius:18px;padding:6px;font:inherit;font-weight:700;color:#4a3b30;cursor:pointer}" +
      ".colora-galleria img{width:100%;border-radius:12px;display:block;background:white}" +
      ".colora-tela{flex:1;position:relative;min-height:0;display:flex;align-items:center;justify-content:center;padding:4px}" +
      ".colora-tela canvas{max-width:100%;max-height:100%;background:white;border-radius:14px;box-shadow:0 6px 18px rgba(60,40,20,.18);touch-action:none}" +
      ".colora-barra{padding:8px 10px calc(10px + env(safe-area-inset-bottom));background:#fffaf2;box-shadow:0 -4px 14px rgba(0,0,0,.08)}" +
      ".colora-colori{display:flex;gap:6px;overflow-x:auto;padding-bottom:8px}" +
      ".colora-colori button{flex:none;width:38px;height:38px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px #e9dcc6;cursor:pointer}" +
      ".colora-colori button.scelto{box-shadow:0 0 0 3px #6a5aa3}" +
      ".colora-strumenti{display:flex;gap:6px;justify-content:space-between}" +
      ".colora-strumenti button{flex:1;font:inherit;font-weight:700;font-size:14px;border:0;border-radius:14px;padding:8px 4px;background:#f2e6d2;color:#4a3b30;cursor:pointer}" +
      ".colora-strumenti button.attivo{background:#6a5aa3;color:white}" +
      ".colora-strumenti button.fine{background:#7fae6e;color:white}";
    area.appendChild(stile);
    var radice = document.createElement("div");
    radice.className = "colora";
    area.appendChild(radice);
    api.info("🎨 Scegli un disegno");

    // ---------- galleria ----------
    function galleria() {
      radice.innerHTML = "<div class='colora-galleria'>" + PAGINE.map(function (p) {
        var salvato = carica(CHIAVE + p.id);
        return "<button data-id='" + p.id + "'><img src='img/colora/mini_" + p.id + ".png' alt=''>" + p.nome + (salvato ? " ✏️" : "") + "</button>";
      }).join("") + "</div>";
      radice.querySelector(".colora-galleria").addEventListener("click", function (e) {
        var b = e.target.closest("[data-id]");
        if (b) apri(PAGINE.filter(function (p) { return p.id === b.dataset.id; })[0]);
      });
      api.info("🎨 Scegli un disegno");
    }

    // ---------- foglio da colorare ----------
    function apri(pagina) {
      api.info("🎨 " + pagina.nome);
      radice.innerHTML =
        "<div class='colora-tela'><canvas></canvas></div>" +
        "<div class='colora-barra'><div class='colora-colori'>" +
        COLORI.map(function (c, i) { return "<button data-c='" + c + "' style='background:" + c + "'" + (i === 0 ? " class='scelto'" : "") + " aria-label='colore'></button>"; }).join("") +
        "</div><div class='colora-strumenti'>" +
        "<button data-s='riempi' class='attivo'>🪣 Riempi</button><button data-s='pennello'>🖌️ Pennello</button>" +
        "<button data-s='annulla'>↩️</button><button data-s='disegni'>🖼️</button><button data-s='fine' class='fine'>Finito!</button>" +
        "</div></div>";
      var tela = radice.querySelector("canvas"), ctx = tela.getContext("2d");
      var linee = new Image(), colore = COLORI[0], strumento = "riempi", storia = [];
      var W, H, colori, cctx, barriera;
      linee.onload = function () {
        W = linee.naturalWidth; H = linee.naturalHeight;
        tela.width = W; tela.height = H;
        // strato del colore (sotto) e mappa delle linee (barriere per il riempimento)
        colori = document.createElement("canvas"); colori.width = W; colori.height = H;
        cctx = colori.getContext("2d");
        cctx.fillStyle = "#ffffff"; cctx.fillRect(0, 0, W, H);
        var tmp = document.createElement("canvas"); tmp.width = W; tmp.height = H;
        var tctx = tmp.getContext("2d"); tctx.drawImage(linee, 0, 0);
        var px;
        try { px = tctx.getImageData(0, 0, W, H).data; }
        catch (err) { api.info("🎨 Apri il gioco da chiwinnie.com per colorare"); return; }
        barriera = new Uint8Array(W * H);
        for (var i = 0; i < W * H; i++) barriera[i] = px[i * 4] < SOGLIA_LINEA ? 1 : 0;
        var salvato = carica(CHIAVE + pagina.id);
        if (salvato) {
          var im = new Image();
          im.onload = function () { cctx.drawImage(im, 0, 0, W, H); disegna(); };
          im.src = salvato;
        }
        disegna();
      };
      linee.src = "img/colora/" + pagina.id + ".png";

      function disegna() {
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(colori, 0, 0);
        ctx.globalCompositeOperation = "multiply";   // le linee nere restano sopra il colore
        ctx.drawImage(linee, 0, 0);
        ctx.globalCompositeOperation = "source-over";
      }
      function ricorda() {
        storia.push(cctx.getImageData(0, 0, W, H));
        if (storia.length > 4) storia.shift();   // poche copie: le immagini sono grandi
      }
      function salvaPresto() {
        clearTimeout(timerSalva);
        timerSalva = setTimeout(function () { salva(CHIAVE + pagina.id, colori.toDataURL("image/jpeg", 0.8)); }, 800);
      }
      function punto(e) {
        var r = tela.getBoundingClientRect();
        return { x: Math.floor((e.clientX - r.left) / r.width * W), y: Math.floor((e.clientY - r.top) / r.height * H) };
      }
      function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }

      // riempimento a scansione di righe: si ferma sulle linee del disegno
      function riempi(x0, y0) {
        if (x0 < 0 || y0 < 0 || x0 >= W || y0 >= H) return;
        var start = y0 * W + x0;
        if (barriera[start]) return;
        ricorda();
        var img = cctx.getImageData(0, 0, W, H), d = img.data, c = rgb(colore);
        var fatto = new Uint8Array(W * H), pila = [start];
        function colora(i) { d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2]; d[i * 4 + 3] = 255; }
        while (pila.length) {
          var i = pila.pop(), y = (i / W) | 0, x = i - y * W;
          while (x > 0 && !barriera[i - 1] && !fatto[i - 1]) { i--; x--; }
          var sopra = false, sotto = false;
          while (x < W && !barriera[i] && !fatto[i]) {
            fatto[i] = 1; colora(i);
            if (y > 0) {
              var su = i - W;
              if (!barriera[su] && !fatto[su]) { if (!sopra) { pila.push(su); sopra = true; } } else sopra = false;
            }
            if (y < H - 1) {
              var giu = i + W;
              if (!barriera[giu] && !fatto[giu]) { if (!sotto) { pila.push(giu); sotto = true; } } else sotto = false;
            }
            i++; x++;
          }
        }
        // si colora anche un pixel sotto il bordo delle linee, così non restano aloni bianchi
        for (var k = W; k < W * H - W; k++) {
          if (barriera[k] && (fatto[k - 1] || fatto[k + 1] || fatto[k - W] || fatto[k + W])) colora(k);
        }
        cctx.putImageData(img, 0, 0);
        disegna(); salvaPresto();
        try { Suoni.sfx("coppia"); } catch (e) {}
      }

      // pennello
      var tratto = null;
      tela.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        var p = punto(e);
        if (strumento === "riempi") { riempi(p.x, p.y); return; }
        ricorda(); tratto = p;
        cctx.fillStyle = colore; cctx.beginPath(); cctx.arc(p.x, p.y, W * 0.012, 0, Math.PI * 2); cctx.fill(); disegna();
        try { tela.setPointerCapture(e.pointerId); } catch (err) {}
      });
      tela.addEventListener("pointermove", function (e) {
        if (!tratto) return;
        var p = punto(e);
        cctx.strokeStyle = colore; cctx.lineWidth = W * 0.024; cctx.lineCap = "round"; cctx.lineJoin = "round";
        cctx.beginPath(); cctx.moveTo(tratto.x, tratto.y); cctx.lineTo(p.x, p.y); cctx.stroke();
        tratto = p; disegna();
      });
      function fineTratto() { if (tratto) { tratto = null; salvaPresto(); } }
      tela.addEventListener("pointerup", fineTratto);
      tela.addEventListener("pointercancel", fineTratto);

      radice.querySelector(".colora-colori").addEventListener("click", function (e) {
        var b = e.target.closest("[data-c]"); if (!b) return;
        colore = b.dataset.c;
        radice.querySelectorAll(".colora-colori button").forEach(function (x) { x.classList.toggle("scelto", x === b); });
      });
      radice.querySelector(".colora-strumenti").addEventListener("click", function (e) {
        var b = e.target.closest("[data-s]"); if (!b) return;
        var s = b.dataset.s;
        if (s === "riempi" || s === "pennello") {
          strumento = s;
          radice.querySelectorAll("[data-s=riempi],[data-s=pennello]").forEach(function (x) { x.classList.toggle("attivo", x === b); });
        } else if (s === "annulla") {
          if (storia.length) { cctx.putImageData(storia.pop(), 0, 0); disegna(); salvaPresto(); }
        } else if (s === "disegni") {
          clearTimeout(timerSalva); salva(CHIAVE + pagina.id, colori.toDataURL("image/jpeg", 0.8));
          galleria();
        } else if (s === "fine") {
          clearTimeout(timerSalva); salva(CHIAVE + pagina.id, colori.toDataURL("image/jpeg", 0.8));
          // il disegno si può scaricare (sul sito; nella pagina di claude.ai i download sono bloccati)
          var link = null;
          try { link = tela.toDataURL("image/png"); } catch (err) {}
          fermo = true;
          api.fine({
            punti: 6, bottino: { petali: 2 }, titolo: "Che capolavoro!",
            messaggio: "Il tuo Chiwinnie è felicissimo del disegno e ti regala 2 petali." + (link ? "" : ""),
            immagine: link, nomeFile: "chiwinnie-" + pagina.id + ".png"
          });
        }
      });
    }

    galleria();
    return function () { fermo = true; clearTimeout(timerSalva); };
  };
})();
