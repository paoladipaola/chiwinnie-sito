// La casetta del Chiwinnie (dentro) e il guardaroba con gli accessori.
// Usa le funzioni del gioco che gioco.js mette in window.ChiwinnieCtx.
var Look = (function () {
  // disegna gli accessori indossati dentro "box" (che sta sopra l'immagine del Chiwinnie).
  // Ogni accessorio ha due posizioni: di fronte e di profilo (quando cammina); quelli del viso di profilo si nascondono.
  function disegna(box, look) {
    if (!box) return;
    look = look || {};
    box.innerHTML = ["schiena", "corpo", "collo", "viso", "testa"].map(function (posto) {
      var a = ACCESSORI[look[posto]]; if (!a) return "";
      var f = a.f;
      // di profilo la testa è più piccola e sta in alto a destra
      var sx = 86 + (f.x - 50) * 0.6, sy = (6 + (f.y * 4.2 - 8.4) * 0.6) / 1.98, sw = f.w * 1.08 * 0.6;
      if (posto === "collo") { sx -= 5; sy += 8; sw *= 0.8; }   // di profilo il collo è più indietro e più in basso
      if (posto === "schiena") { sx = 46; sy = 30; sw = f.w * 0.55; }   // mantello e ali sulla schiena, a metà del corpo
      return "<img class='acc " + posto + "' src='" + a.img + "' alt='' style='--fx:" + f.x + "%;--fy:" + f.y + "%;--fw:" + f.w + "%;--sx:" + sx.toFixed(1) + "%;--sy:" + sy.toFixed(1) + "%;--sw:" + sw.toFixed(1) + "%;--r:" + (f.r || 0) + "deg;--sc:" + (f.sy || 1) + "'>";
    }).join("");
  }
  return { disegna: disegna };
})();

(function () {
  var C = null;          // contesto del gioco
  var timers = [];
  var MINUTO = 60000;
  var PAUSA_LETTO = 10 * MINUTO, PAUSA_BISCOTTO = 4 * MINUTO;
  // punti della stanza, in % del quadro
  var POSTI = {
    tappeto: { x: 48, y: 86 }, letto: { x: 21, y: 74 }, tavolo: { x: 50, y: 81 }, armadio: { x: 72, y: 86 }, camino: { x: 64, y: 82 }
  };
  function $(id) { return document.getElementById(id); }
  function stato() { return C ? C.stato() : null; }

  function pronto(chiave, pausa) { var t = (stato().casa || {})[chiave] || 0; return Date.now() - t >= pausa; }
  function segna(chiave) { var s = stato(); s.casa = s.casa || {}; s.casa[chiave] = Date.now(); }
  function minutiA(chiave, pausa) { return Math.ceil((pausa - (Date.now() - ((stato().casa || {})[chiave] || 0))) / MINUTO); }

  // ---------- il Chiwinnie nella stanza ----------
  var pos = null;
  function vai(p, poi) {
    var el = $("casa-chiwi"), img = $("casa-chiwi-img");
    timers.forEach(clearTimeout); timers = [];
    // se stava già camminando (o dormendo) si ferma e riparte da qui
    clearInterval(el._passi);
    el.classList.remove("dorme", "cammina", "sinistra");
    $("casa-stanza").classList.remove("sera");
    img.src = immagineChiwi(stato().colore, "fronte");
    if (pos && (Math.abs(pos.x - p.x) > 1 || Math.abs(pos.y - p.y) > 1)) {
      el.classList.toggle("sinistra", p.x < pos.x);
      el.classList.add("cammina");
      var n = 0;
      clearInterval(el._passi);
      el._passi = setInterval(function () { img.src = immagineChiwi(stato().colore, n++ % 2 ? "corsa2" : "corsa1"); }, 160);
      timers.push(setTimeout(function () {
        clearInterval(el._passi); el.classList.remove("cammina", "sinistra");
        img.src = immagineChiwi(stato().colore, "fronte");
        if (poi) poi();
      }, 1500));
    } else if (poi) timers.push(setTimeout(poi, 50));
    pos = { x: p.x, y: p.y };
    el.style.left = p.x + "%"; el.style.top = p.y + "%";
  }
  function dice(testo, ms) {
    var f = $("casa-fumetto"); f.textContent = testo; f.classList.add("su");
    clearTimeout(f._t); f._t = setTimeout(function () { f.classList.remove("su"); }, ms || 2600);
  }

  // ---------- azioni ----------
  function riposa() {
    if (!pronto("letto", PAUSA_LETTO)) { vai(POSTI.letto, function () { dice("Non ho sonno… riprova tra " + minutiA("letto", PAUSA_LETTO) + " minuti!"); }); return; }
    vai(POSTI.letto, function () {
      // si infila sotto le coperte: compare il quadro con il Chiwinnie che dorme nel letto (del suo colore)
      var el = $("casa-chiwi"), stanza = $("casa-stanza");
      $("casa-dorme").src = "img/casa/dorme/" + (stato().colore || "viola") + ".jpg";
      el.classList.add("dorme"); stanza.classList.add("sera");
      Suoni.sfx("magia");
      timers.push(setTimeout(function () {
        stanza.classList.remove("sera"); el.classList.remove("dorme");
        C.aggiornaEnergia(); var s = stato(); s.energia = Math.min(100, s.energia + 25); segna("letto");
        C.salva(); C.disegnaHud();
        dice("Che bella dormita! +25 energia ⚡", 3000); C.vibra(30);
      }, 6000));
    });
  }
  function biscotto() {
    if (!pronto("biscotto", PAUSA_BISCOTTO)) { vai(POSTI.tavolo, function () { dice("Pancia piena! Il prossimo biscotto tra " + minutiA("biscotto", PAUSA_BISCOTTO) + " minuti."); }); return; }
    vai(POSTI.tavolo, function () {
      Suoni.sfx("pasto");
      var el = $("casa-chiwi"); el.classList.add("salta"); timers.push(setTimeout(function () { el.classList.remove("salta"); }, 600));
      C.aggiornaEnergia(); var s = stato(); s.energia = Math.min(100, s.energia + 10); segna("biscotto");
      C.salva(); C.disegnaHud();
      dice("Gnam! Biscotto ai petali! +10 energia ⚡");
      C.coriandoli(window.innerWidth / 2, window.innerHeight * 0.5, "🍪", 6);
    });
  }
  function camino() { vai(POSTI.camino, function () { dice("Che bel calduccio… frrr frrr"); Suoni.sfx("coccola"); }); }

  // ---------- guardaroba ----------
  function possiede(k) { var s = stato(); return ACCESSORI[k].gratis || (s.armadio || []).indexOf(k) !== -1; }
  function prezzoTesto(p) { return Object.keys(p).map(function (m) { return p[m] + " " + (m === "stelle" ? "⭐" : "🌸"); }).join(" + "); }
  function apriArmadio() {
    controllaPremi(true);
    var s = stato(), look = s.look || {};
    var html = "<h2>Il guardaroba</h2><p>Tocca un vestito o un accessorio per metterlo o toglierlo: uno per la testa, il viso, il collo, il corpo e la schiena.</p>" +
      "<div class='armadio-anteprima'><div class='vestito'><img src='" + immagineChiwi(s.colore, "fronte") + "' alt=''><div class='look' id='armadio-look'></div></div></div>" +
      "<div class='griglia armadio'>";
    Object.keys(ACCESSORI).forEach(function (k) {
      var a = ACCESSORI[k], mio = possiede(k), addosso = look[a.posto] === k;
      html += "<button class='voce" + (addosso ? " addosso" : "") + (mio ? "" : " bloccata") + "' data-azione='armadio' data-acc='" + k + "'>" +
        "<img class='anteprima' src='" + a.img + "' alt=''><h3>" + C.esc(a.nome) + "</h3>" +
        (addosso ? "<div class='costo'><span>✓ Lo indossa</span></div>" : mio ? "<div class='costo'><span>Mettilo</span></div>" :
          a.speciale ? "<div class='lucchetto'>🏆 " + C.esc(a.speciale) + "</div>" : "<div class='costo'><span>" + prezzoTesto(a.prezzo) + "</span></div>") +
        "</button>";
    });
    html += "</div>";
    C.apriPannello(html);
    Look.disegna($("armadio-look"), look);
  }
  function toccaAccessorio(k) {
    var s = stato(), a = ACCESSORI[k];
    s.look = s.look || {}; s.armadio = s.armadio || [];
    if (!possiede(k)) {
      if (a.speciale) { C.avviso("È un premio speciale: " + a.speciale + "!", 2800); return; }
      var manca = Object.keys(a.prezzo).some(function (m) { return (s.materiali[m] || 0) < a.prezzo[m]; });
      if (manca) { C.avviso("Ti servono " + prezzoTesto(a.prezzo) + ": guadagnali con i giochi!", 2800); return; }
      Object.keys(a.prezzo).forEach(function (m) { s.materiali[m] -= a.prezzo[m]; });
      s.armadio.push(k);
      Suoni.sfx("magia"); C.toast("👗 Nuovo nel guardaroba: " + a.nome + "!", 2500);
    }
    s.look[a.posto] = s.look[a.posto] === k ? null : k;
    C.salva(); C.disegnaHud(); aggiornaLook();
    apriArmadio();
  }
  // i premi speciali arrivano da soli quando si raggiunge l'obiettivo
  function controllaPremi(silenzioso) {
    var s = stato(); if (!s) return;
    s.armadio = s.armadio || [];
    Object.keys(ACCESSORI).forEach(function (k) {
      var a = ACCESSORI[k];
      if (a.vinto && s.armadio.indexOf(k) === -1 && a.vinto(s)) {
        s.armadio.push(k);
        if (!silenzioso) { C.toast("🏆 Premio speciale: " + a.nome + "! Lo trovi nel guardaroba.", 3500); Suoni.sfx("stella"); }
      }
    });
  }
  function aggiornaLook() {
    var s = stato(); if (!s) return;
    Look.disegna($("chiwi-look"), s.look);
    Look.disegna($("casa-look"), s.look);
  }

  // ---------- la stanza ----------
  function apri() {
    var s = stato();
    C.chiudiPannello();
    C.mostra("s-casa");
    Suoni.musica("casa");
    $("casa-chiwi-img").src = immagineChiwi(s.colore, "fronte");
    aggiornaLook();
    pos = null; vai(POSTI.tappeto);
    dice("Benvenuto nella mia casetta!");
  }
  function esci() {
    timers.forEach(clearTimeout); timers = [];
    clearInterval($("casa-chiwi")._passi);
    C.apriMondo();
  }

  function collega() {
    $("casa-esci").addEventListener("click", esci);
    $("casa-stanza").addEventListener("click", function (e) {
      var zona = e.target.closest("[data-casa]");
      if (zona) { var a = zona.dataset.casa; if (a === "letto") riposa(); else if (a === "tavolo") biscotto(); else if (a === "armadio") vai(POSTI.armadio, apriArmadio); else if (a === "camino") camino(); return; }
      // toccando il pavimento il Chiwinnie va lì
      var r = $("casa-tela").getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top) / r.height * 100;
      if (y > 74) vai({ x: Math.max(12, Math.min(88, x)), y: Math.min(95, y) });
    });
    $("casa-azioni").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var a = b.dataset.casa;
      if (a === "letto") riposa(); else if (a === "tavolo") biscotto(); else if (a === "armadio") vai(POSTI.armadio, apriArmadio);
      else if (a === "mangia") vai(POSTI.tavolo, C.apriNutri);
    });
    $("pannello").addEventListener("click", function (e) {
      var b = e.target.closest("[data-azione='armadio']"); if (b) toccaAccessorio(b.dataset.acc);
    });
  }

  window.Casa = {
    avvia: function (ctx) { C = ctx; collega(); },
    apri: apri, dice: dice, apriArmadio: apriArmadio, aggiornaLook: aggiornaLook, controllaPremi: controllaPremi
  };
})();
