// La mappa del Giardino magico: è la pagina iniziale del gioco.
// Dal basso verso l'alto: la Casa del Chiwinnie e il Parco dei Giochi, poi le terre una dopo l'altra lungo il sentiero
// di lucine, fino al Castello delle nuvole. Le terre ancora prigioniere dei nuvoloni hanno il lucchetto;
// quelle aperte si possono visitare tutte le volte che si vuole.
// Usa le funzioni del gioco che gioco.js passa in Mappa.avvia(ctx) e quelle del viaggio (Missione.terre).
var Mappa = (function () {
  var C = null;
  function $(id) { return document.getElementById(id); }
  function stato() { return C ? C.stato() : null; }

  // colore del cielo/prato dietro a ogni terra: lo sfondo sfuma dall'una all'altra
  var COLORI = { radura: "#cfe6a6", ruscello: "#bfe3d6", collina: "#e6efb2", foresta: "#b3acdc", isole: "#cde4f6", nord: "#eef2fa",
    deserto: "#f5e2c2", fata: "#efe3d2", panna: "#fadbe6", gemme: "#dcd0f2", cielo: "#f7dbe9" };
  // le terre vanno a zig-zag, come un sentiero che sale
  var ZIG = [50, 27, 70, 33, 69, 29, 66, 31, 70, 34, 64];
  var PASSO = 168, BASSO = 150, ALTO = 560;

  var nodi = [], inAttesa = null;   // {id, x (%), y (px dall'alto), ...}

  function posizioni(H) {
    var n = CAPITOLI.length, lista = [];
    CAPITOLI.forEach(function (c, i) { lista.push({ tipo: "terra", c: c, id: c.zona, x: ZIG[i % ZIG.length], y: H - BASSO - 170 - i * PASSO }); });
    var cima = lista[n - 1].y;
    lista.push({ tipo: "castello", id: "castello", x: 50, y: cima - 200 });
    lista.push({ tipo: "crea", id: "crea", x: 50, y: cima - 360 });
    return lista;
  }
  function altezza() { return BASSO + 170 + (CAPITOLI.length - 1) * PASSO + 200 + 160 + ALTO / 2 + 40; }

  // il percorso fra due punti: una curva morbida che sale
  function curva(a, b, W) {
    var ax = a.x / 100 * W, bx = b.x / 100 * W, my = (a.y + b.y) / 2;
    return "M" + ax.toFixed(1) + "," + a.y + " C" + ax.toFixed(1) + "," + my + " " + bx.toFixed(1) + "," + my + " " + bx.toFixed(1) + "," + b.y;
  }

  function apri(opz) {
    opz = opz || {};
    if (!C) { inAttesa = opz; return; }   // il gioco la chiede prima di aver passato le sue funzioni
    var s = stato(); if (!s) return;
    var T = Missione.terre;
    C.chiudiPannello();
    C.mostra("s-mappa");
    Suoni.musica("radura");
    var tela = $("mappa-tela"), W = tela.clientWidth || 380, H = altezza();
    tela.style.height = H + "px";
    nodi = posizioni(H);
    var sblocca = opz.sblocca || null;

    // lo sfondo: una sfumatura che passa per i colori di tutte le terre
    function pc(y) { return (y / H * 100).toFixed(1) + "%"; }
    var stops = ["#fff0f5 0%", "#fde6ef " + pc(nodi[nodi.length - 2].y)];
    nodi.slice(0, CAPITOLI.length).reverse().forEach(function (n) { stops.push((COLORI[n.id] || "#e8f0d0") + " " + pc(n.y)); });
    stops.push("#b9dc95 100%");
    tela.style.background = "linear-gradient(to bottom, " + stops.join(", ") + ")";

    // il primo punto chiuso: lì sopra stanno i nuvoloni del Nebbione
    var primaChiusa = null;
    nodi.forEach(function (n) { if (!primaChiusa && n.tipo === "terra" && (!T.aperto(n.c) || n.id === sblocca)) primaChiusa = n; });
    var fine = forziereAperto(s, "cielo");

    var html = "";
    // nuvolette e lucciole decorative
    for (var i = 0; i < 14; i++) {
      var y = 90 + i * (H - 200) / 14, sx = i % 2 ? 76 + (i * 7) % 18 : -6 + (i * 5) % 14;
      html += "<img class='mappa-nuvola' src='img/cielo/nuvola.png' alt='' style='left:" + sx + "%;top:" + y.toFixed(0) + "px;animation-delay:-" + (i * 1.7) + "s'>";
    }
    for (i = 0; i < 26; i++) html += "<i class='mappa-lucciola' style='left:" + ((i * 37) % 96 + 2) + "%;top:" + (((i * 113) % (H - 120)) + 60) + "px;animation-delay:-" + (i * 0.6).toFixed(1) + "s'></i>";
    if (primaChiusa && !fine) html += "<div class='mappa-nuvoloni' style='height:" + (primaChiusa.y + 90) + "px'></div>";

    // il sentiero di lucine
    var punti = [{ x: 50, y: H - BASSO + 10 }].concat(nodi.slice(0, CAPITOLI.length + 1));
    var svg = "<svg class='mappa-sentiero' width='" + W + "' height='" + H + "' viewBox='0 0 " + W + " " + H + "'>";
    for (i = 1; i < punti.length; i++) {
      var dest = punti[i], ok = dest.tipo === "castello" ? fine : T.aperto(dest.c);
      var cls = dest.id === sblocca ? "chiuso diventa" : ok ? "fatto" : "chiuso";
      svg += "<path class='" + cls + "' d='" + curva(punti[i - 1], dest, W) + "'/>";
    }
    svg += "<path class='chiuso' d='" + curva(nodi[nodi.length - 2], nodi[nodi.length - 1], W) + "'/>";
    html += svg + "</svg>";

    // la Casa e il Parco dei Giochi, all'inizio del sentiero
    var casa = s.costruiti.indexOf("casetta") !== -1;
    html += "<button class='mappa-posto casa" + (casa ? "" : " chiusa") + "' data-mappa='casa' style='left:24%;top:" + (H - BASSO - 30) + "px'>" +
      "<img src='img/mappa/casa.png' alt=''><span class='nome'>La casa di " + C.esc(s.nome) + "</span></button>";
    html += "<button class='mappa-posto parco' data-mappa='parco' style='left:76%;top:" + (H - BASSO - 30) + "px'>" +
      "<img src='img/mappa/parco.png' alt=''><span class='nome'>Il Parco dei Giochi</span></button>";

    // le terre
    var cor = T.capitoloCorrente();
    nodi.forEach(function (n) {
      if (n.tipo === "terra") {
        var c = n.c, ap = T.aperto(c) && n.id !== sblocca, vi = T.vinto(c), qui = cor && cor === c;
        var amici = T.amiciDi(c).map(function (a) { return "<i class='" + (T.libero(a) ? "si" : "") + "' style='background-image:url(" + immagineChiwi(a.colore, "felice") + ")'></i>"; }).join("");
        var libera = qui && T.puoLiberare(), via = qui && T.pronto(c);
        html += "<button class='isola" + (ap ? (vi ? " vinta" : " aperta") : " chiusa") + (qui ? " corrente" : "") + (n.id === sblocca ? " da-sbloccare" : "") + "' data-mappa='" + n.id + "' style='left:" + n.x + "%;top:" + n.y + "px'>" +
          "<span class='tondo'><img src='img/mappa/" + n.id + ".webp' alt=''></span>" +
          "<span class='nebbia'></span>" +
          "<span class='badge'>" + (vi ? "⭐" : ap ? T.numero(c) : "🔒") + "</span>" +
          (libera ? "<span class='fumetto-mappa'>🫧 Libera!</span>" : via ? "<span class='fumetto-mappa'>" + (c.finale ? "🌈 Battaglia!" : "🏃 Sentiero!") + "</span>" : "") +
          "<span class='nome'>" + C.esc(nomeCapitolo(c)) + "</span>" +
          "<span class='amici'>" + amici + "</span></button>";
      } else if (n.tipo === "castello") {
        var apc = T.aperto(CAPITOLI[CAPITOLI.length - 1]);
        html += "<button class='isola castello" + (fine ? " vinta" : apc ? " aperta" : " chiusa") + "' data-mappa='castello' style='left:" + n.x + "%;top:" + n.y + "px'>" +
          "<span class='tondo'><img src='img/mappa/castello.webp' alt=''></span><span class='nebbia'></span>" +
          "<span class='badge'>" + (fine ? "🌈" : apc ? "🏰" : "🔒") + "</span>" +
          "<span class='nome'>Il Castello delle nuvole</span></button>";
      } else {
        html += "<button class='isola crea chiusa' data-mappa='crea' style='left:" + n.x + "%;top:" + n.y + "px'>" +
          "<span class='tondo'><b>🎨</b></span><span class='badge'>" + (fine ? "✨" : "🔒") + "</span><span class='nome'>Crea il tuo livello<small>Presto!</small></span></button>";
      }
    });
    // il Nebbione che sorveglia la prima terra chiusa (alla fine è buono e sta vicino al castello)
    if (fine) html += "<img class='mappa-nebbione buono' src='img/nebbione/nebbione_buono.png' alt='' style='left:72%;top:" + (nodi[CAPITOLI.length].y - 40) + "px'>";
    else if (primaChiusa) html += "<img class='mappa-nebbione' src='img/nebbione/nebbione.png' alt='' style='left:" + (primaChiusa.x > 50 ? 20 : 80) + "%;top:" + (primaChiusa.y + 6) + "px'>";

    // il Chiwinnie del giocatore, sulla terra dove si trova
    html += "<div id='mappa-chiwi'><div class='vestito'><img src='" + immagineChiwi(s.colore, "fronte") + "' alt=''><div class='look' id='mappa-chiwi-look'></div></div></div>";
    tela.innerHTML = html;
    Look.disegna($("mappa-chiwi-look"), s.look || {});
    var dove = nodo(s.zona) || nodo("radura");
    metti(dove, true);

    // la testa: lucine e amici liberati
    $("mappa-lucine").textContent = s.missione.lucine;
    $("mappa-liberati").textContent = s.missione.liberati.length + "/" + AMICI.length;
    $("mappa-avatar-img").src = immagineChiwi(s.colore, "felice");

    // si parte guardando il Chiwinnie (o la terra che si sta per aprire)
    var guarda = sblocca ? nodo(sblocca) : dove;
    var sc = $("mappa-scorri");
    requestAnimationFrame(function () { sc.scrollTop = Math.max(0, guarda.y - sc.clientHeight * 0.55); });

    if (sblocca) sbloccaTerra(sblocca, opz.poi);
  }

  function nodo(id) { return nodi.filter(function (n) { return n.id === id; })[0] || null; }
  function metti(n, subito) {
    var m = $("mappa-chiwi"); if (!m || !n) return;
    m.classList.toggle("subito", !!subito);
    m.style.left = n.x + "%"; m.style.top = (n.y - 24) + "px";
  }
  // il Chiwinnie salta da una terra all'altra
  function cammina(n, poi) {
    var m = $("mappa-chiwi"); if (!m) { if (poi) poi(); return; }
    var da = parseFloat(m.style.left);
    m.classList.add("salta-mappa"); m.classList.toggle("sinistra", n.x < da);
    metti(n);
    Suoni.sfx("passo");
    setTimeout(function () { m.classList.remove("salta-mappa", "sinistra"); if (poi) poi(); }, 1100);
  }

  // dopo il sentiero: i nuvoloni si diradano, il lucchetto si apre e il Chiwinnie corre nella terra nuova
  function sbloccaTerra(id, poi) {
    var el = document.querySelector(".isola[data-mappa='" + id + "']"), n = nodo(id);
    setTimeout(function () {
      document.querySelectorAll(".mappa-sentiero .diventa").forEach(function (p) { p.classList.add("fatto"); });
      document.querySelectorAll(".mappa-nebbione, .mappa-nuvoloni").forEach(function (x) { x.classList.add("scappa"); });
      if (el) { el.classList.remove("chiusa"); el.classList.add("aperta", "sblocco"); el.querySelector(".badge").textContent = Missione.terre.numero(n.c); }
      Suoni.sfx("magia"); C.vibra([30, 40, 60]);
      var r = el && el.getBoundingClientRect();
      if (r) { C.coriandoli(r.left + r.width / 2, r.top + r.height / 2, "✨", 14); setTimeout(function () { C.coriandoli(r.left + r.width / 2, r.top + r.height / 2, "🌸", 8); }, 300); }
      setTimeout(function () { cammina(n, function () { setTimeout(function () { if (poi) poi(); }, 500); }); }, 1300);
    }, 900);
  }

  function entra(id) {
    var n = nodo(id), s = stato(), T = Missione.terre;
    var el = document.querySelector("[data-mappa='" + id + "']");
    if (id === "casa") {
      if (s.costruiti.indexOf("casetta") === -1) { C.avviso("Prima costruisci la casetta nella Radura! 🏡", 2800); scuoti(el); return; }
      C.tornaA("mappa"); Casa.apri(); return;
    }
    if (id === "parco") { C.tornaA("mappa"); C.apriGiochi(); return; }
    if (id === "crea") { C.toast(forziereAperto(s, "cielo") ? "Qui potrai inventare la tua terra: la stiamo preparando! 🎨" : "Si apre dopo il Castello delle nuvole… 🎨", 3000); scuoti(el); return; }
    if (id === "castello") {
      var ultimo = CAPITOLI[CAPITOLI.length - 1];
      if (!T.aperto(ultimo)) { C.avviso("Il Castello delle nuvole è l'ultima tappa del viaggio!", 2800); scuoti(el); return; }
      C.tornaA("mappa"); Missione.apri(ultimo.zona); return;
    }
    if (!n) return;
    if (!T.aperto(n.c)) {
      var prima = CAPITOLI[CAPITOLI.indexOf(n.c) - 1];
      C.avviso("Avvolta dai nuvoloni! Libera gli amici " + (prima ? nomeCapitolo(prima).replace(/^La /, "della ").replace(/^Il /, "del ").replace(/^Le /, "delle ").replace(/^I /, "dei ") : "") + " e corri sul sentiero per aprirla.", 3200);
      scuoti(el); return;
    }
    // il Chiwinnie ci salta sopra, poi si entra
    var chiwi = $("mappa-chiwi"), giaQui = s.zona === id;
    function dentro() { if (el) el.classList.add("entra"); setTimeout(function () { C.vaiZona(id); }, 450); }
    if (giaQui || !chiwi) dentro(); else cammina(n, dentro);
  }
  function scuoti(el) { if (!el) return; el.classList.remove("scuoti"); void el.offsetWidth; el.classList.add("scuoti"); }

  function avvia(ctx) {
    C = ctx;
    $("mappa-tela").addEventListener("click", function (e) {
      var b = e.target.closest("[data-mappa]"); if (!b) return;
      entra(b.dataset.mappa);
    });
    $("mappa-avatar").addEventListener("click", function () { C.apriScheda(); });
    $("mappa-viaggio").addEventListener("click", function () { C.tornaA("mappa"); Missione.apri(); });
    if (inAttesa) { var o = inAttesa; inAttesa = null; apri(o); }
  }

  return { avvia: avvia, apri: apri };
})();
