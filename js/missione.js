// La grande missione: liberare i dodici Chiwinnie che il Nebbione ha chiuso nelle bolle di nebbia.
// Le lucine per aprire le bolle si guadagnano con le missioni rapide (tre alla volta, facili, sempre nuove).
// Gli amici liberati vivono nel giardino, nella loro zona.
// Usa le funzioni del gioco che gioco.js passa in Missione.avvia(ctx).
(function () {
  var C = null;
  function $(id) { return document.getElementById(id); }
  function stato() { return C ? C.stato() : null; }
  function scegli(a) { return a[Math.floor(Math.random() * a.length)]; }

  // il Nebbione: una nuvola grigia e brontolona (alla fine della storia diventa buono e prende i colori)
  function nebbione(buono) {
    var c1 = buono ? "#fde7f0" : "#b9bcc6", c2 = buono ? "#fff6c9" : "#9a9eaa", occhi = "#3c3f4a";
    return "<svg class='nebbione" + (buono ? " buono" : "") + "' viewBox='0 0 120 84' aria-hidden='true'>" +
      "<g fill='" + c2 + "'><circle cx='28' cy='50' r='22'/><circle cx='92' cy='50' r='22'/><circle cx='60' cy='60' r='24'/></g>" +
      "<g fill='" + c1 + "'><circle cx='34' cy='42' r='22'/><circle cx='60' cy='32' r='28'/><circle cx='86' cy='42' r='22'/><rect x='24' y='42' width='72' height='26' rx='13'/></g>" +
      (buono
        ? "<path d='M44 40 q5 -6 10 0 M66 40 q5 -6 10 0' stroke='" + occhi + "' stroke-width='3.5' fill='none' stroke-linecap='round'/>" +
          "<path d='M50 52 q10 9 20 0' stroke='" + occhi + "' stroke-width='3.5' fill='none' stroke-linecap='round'/>" +
          "<circle cx='42' cy='50' r='4' fill='#f7a8bf'/><circle cx='78' cy='50' r='4' fill='#f7a8bf'/>"
        : "<path d='M41 33 l14 5 M79 33 l-14 5' stroke='" + occhi + "' stroke-width='4' stroke-linecap='round'/>" +
          "<circle cx='50' cy='44' r='5' fill='" + occhi + "'/><circle cx='70' cy='44' r='5' fill='" + occhi + "'/>" +
          "<circle cx='51.5' cy='42.5' r='1.6' fill='#fff'/><circle cx='71.5' cy='42.5' r='1.6' fill='#fff'/>" +
          "<path d='M52 58 q8 -6 16 0' stroke='" + occhi + "' stroke-width='3.5' fill='none' stroke-linecap='round'/>") +
      "</svg>";
  }

  // ---------- dati salvati ----------
  function dati() {
    var s = stato();
    if (!s.missione) s.missione = { lucine: 0, liberati: [], storia: false };
    if (!s.missioni) s.missioni = { grado: 1, attive: [], fatte: 0 };
    return s;
  }
  function prossimoAmico() { var s = dati(); return AMICI.filter(function (a) { return s.missione.liberati.indexOf(a.id) === -1; })[0] || null; }
  function puoLiberare() { var a = prossimoAmico(); return !!a && dati().missione.lucine >= a.lucine; }

  // ---------- missioni rapide ----------
  function obiettivo(m, grado) { return m.n[Math.min(grado - 1, m.n.length - 1)]; }
  function testo(m, n) { return (n > 1 && m.testoN ? m.testoN : m.testo).replace("{n}", n); }
  function giocoAperto(k) {
    var s = stato(), g = MINIGIOCHI[k];
    if (!g || s.livello < g.livello) return false;
    if (!g.zona) return true;
    var i = ZONE.map(function (z) { return z.id; }).indexOf(g.zona);
    return i === 0 || s.zoneComplete.indexOf(ZONE[i - 1].id) !== -1;
  }
  function nuovaMissione(escluse) {
    var s = dati();
    var buone = MISSIONI.filter(function (m) {
      if (escluse.indexOf(m.id) !== -1) return false;
      if (m.gioco && !giocoAperto(m.gioco)) return false;
      if (m.ev === "raccolto" && !s.costruiti.some(function (k) { return ZONE.some(function (z) { return z.pezzi && z.pezzi[k] && z.pezzi[k].produce; }); })) return false;
      return true;
    });
    var m = scegli(buone.length ? buone : MISSIONI.filter(function (x) { return !x.gioco; }));
    return { id: m.id, n: obiettivo(m, s.missioni.grado), fatti: 0 };
  }
  function riempi() {
    var s = dati(), att = s.missioni.attive;
    var prima = [].concat(s.missioni.ultima || []);   // le missioni appena finite non tornano subito
    while (att.length < 3) att.push(nuovaMissione(att.map(function (a) { return a.id; }).concat(prima)));
  }
  function def(id) { return MISSIONI.filter(function (m) { return m.id === id; })[0]; }

  // feste in fila, così i messaggi non si coprono a vicenda
  var coda = [], inCoda = false;
  function festa(fn) { coda.push(fn); if (!inCoda) prossimaFesta(); }
  function prossimaFesta() {
    var fn = coda.shift();
    if (!fn) { inCoda = false; return; }
    inCoda = true; fn(); setTimeout(prossimaFesta, 2600);
  }

  function evento(tipo, d) {
    var s = stato(); if (!s) return;
    dati(); riempi();
    d = d || {};
    var g = s.missioni.grado;
    s.missioni.attive.forEach(function (a) {
      if (a.fatti >= a.n) return;
      var m = def(a.id); if (!m || m.ev !== tipo) return;
      var piu = m.conta ? m.conta(d) : 1;
      if (!piu) return;
      a.fatti = Math.min(a.n, a.fatti + piu);
      if (a.fatti >= a.n) {
        var p = premioMissione(g);
        s.missione.lucine += p.lucine;
        Object.keys(p.materiali).forEach(function (k) { s.materiali[k] = (s.materiali[k] || 0) + p.materiali[k]; });
        C.guadagnaXp(p.xp);
        s.missioni.fatte = (s.missioni.fatte || 0) + 1;
        festa(function () {
          C.toast("✨ Missione compiuta: " + testo(m, a.n) + "! +1 lucina", 2500);
          Suoni.sfx("stella"); C.coriandoli(window.innerWidth / 2, window.innerHeight * 0.35, "✨", 8);
        });
      }
    });
    // la fuga dal Nebbione, se arrivi in fondo, regala sempre una lucina
    if (tipo === "partita" && d.gioco === "fuga" && d.completato) {
      s.missione.lucine++;
      festa(function () { C.toast("✨ Sei sfuggito al Nebbione! +1 lucina", 2500); Suoni.sfx("magia"); });
    }
    if (s.missioni.attive.every(function (a) { return a.fatti >= a.n; })) saliGrado();
    C.salva(); disegna();
  }
  function saliGrado() {
    var s = dati(), g = s.missioni.grado, p = premioGrado(g);
    s.missione.lucine += p.lucine;
    Object.keys(p.materiali).forEach(function (k) { s.materiali[k] = (s.materiali[k] || 0) + p.materiali[k]; });
    s.materiali.stelle = (s.materiali.stelle || 0) + p.stelle;
    s.missioni.grado = g + 1;
    s.missioni.ultima = s.missioni.attive.map(function (a) { return a.id; });
    s.missioni.attive = [];
    riempi();
    festa(function () {
      C.toast("🏅 Grado " + (g + 1) + "! Regalo: +" + p.lucine + " lucine, materiali e " + p.stelle + " ⭐", 3200);
      Suoni.sfx("livello"); C.coriandoli(window.innerWidth / 2, window.innerHeight * 0.4, "🏅", 10);
      C.disegnaHud();
    });
  }
  // cambiare una missione che non piace costa una stella
  function cambia(i) {
    var s = dati();
    if ((s.materiali.stelle || 0) < 1) { C.avviso("Serve 1 stella per cambiare missione"); return; }
    s.materiali.stelle--;
    var via = s.missioni.attive[i];
    s.missioni.attive[i] = nuovaMissione(s.missioni.attive.map(function (a) { return a.id; }));
    if (via) s.missioni.ultima = via.id;
    Suoni.sfx("magia");
    C.salva(); C.disegnaHud(); apri();
  }

  // ---------- la bolla da aprire ----------
  function htmlChiwi(a, cls) {
    return "<div class='vestito " + (cls || "") + "'><img src='" + immagineChiwi(a.colore, "fronte") + "' alt=''><div class='look' data-look='" + a.id + "'></div></div>";
  }
  function vestiTutti(box) {
    box.querySelectorAll("[data-look]").forEach(function (el) {
      var a = AMICI.filter(function (x) { return x.id === el.dataset.look; })[0];
      if (a) Look.disegna(el, a.look);
    });
  }
  function nomeZona(id) { var z = ZONE.filter(function (x) { return x.id === id; })[0]; return z ? z.nome : ""; }

  function apri() {
    var s = dati(); riempi();
    var liberi = s.missione.liberati.length, tutti = liberi === AMICI.length, prossimo = prossimoAmico();
    var html = "<div class='missione-testa'>" + nebbione(tutti) + "<div><h2>" + (tutti ? "Il Bosco è salvo!" : "La grande missione") + "</h2>" +
      "<p>" + (tutti ? "Hai liberato tutti i Chiwinnie e il Nebbione è diventato buono: ora è una nuvola rosa che fa piovere petali." :
        "Il Nebbione ha chiuso " + AMICI.length + " Chiwinnie in bolle di nebbia. Ogni bolla si apre con le lucine ✨: guadagnale con le missioni!") + "</p></div></div>" +
      "<div class='missione-conto'><span>🫧 Liberati <b>" + liberi + "/" + AMICI.length + "</b></span><span class='lucine'>✨ <b>" + s.missione.lucine + "</b> lucine</span></div>";

    // missioni rapide
    html += "<h3 class='titoletto'>Missioni · grado " + s.missioni.grado + "</h3><p class='nota'>Finisci tutte e tre per salire di grado e ricevere un regalo grande.</p>";
    s.missioni.attive.forEach(function (a, i) {
      var m = def(a.id), fatta = a.fatti >= a.n;
      html += "<div class='riga-sfida missione" + (fatta ? " fatta" : "") + "'><div class='testo'>" + C.esc(testo(m, a.n)) +
        "<div class='barretta'><div style='width:" + Math.round(a.fatti / a.n * 100) + "%'></div></div><div class='nota'>" + (fatta ? "Fatta! ✓" : a.fatti + " / " + a.n) + "</div></div>" +
        "<div class='premio'>+1 ✨</div>" +
        (fatta ? "" : "<button class='btn piccolo bianco salta' data-azione='cambia-missione' data-i='" + i + "' title='Cambia missione'>Cambia<br>−1⭐</button>") + "</div>";
    });

    // gli amici nelle bolle
    html += "<h3 class='titoletto'>Gli amici da liberare</h3><div class='bolle-amici'>";
    AMICI.forEach(function (a) {
      var libero = s.missione.liberati.indexOf(a.id) !== -1, ilProssimo = prossimo && prossimo.id === a.id;
      html += "<div class='amico-bolla" + (libero ? " libero" : ilProssimo ? " prossimo" : " chiuso") + "' data-amico='" + a.id + "'>" +
        "<div class='bolla-nebbia'>" + htmlChiwi(a) + "</div>" +
        "<b>" + (libero || ilProssimo ? C.esc(a.nome) : "?") + "</b>" +
        (libero ? "<small>" + C.esc(nomeZona(a.zona)) + "</small>" :
          ilProssimo ? "<button class='btn piccolo" + (s.missione.lucine >= a.lucine ? " verde" : " bianco") + "' data-azione='libera' data-amico='" + a.id + "'>Libera · " + a.lucine + " ✨</button>" :
          "<small>" + a.lucine + " ✨</small>") +
        "</div>";
    });
    html += "</div><p class='nota centro'>Gli amici liberati vanno a vivere nella loro zona del Bosco Giardino e ti portano un regalo.</p>";
    C.apriPannello(html);
    vestiTutti($("pannello-corpo"));
  }

  function libera(id) {
    var s = dati(), a = prossimoAmico();
    if (!a || a.id !== id) return;
    if (s.missione.lucine < a.lucine) { C.avviso("Ti servono " + a.lucine + " lucine: completa le missioni!", 2800); return; }
    s.missione.lucine -= a.lucine;
    var el = document.querySelector(".amico-bolla[data-amico='" + id + "']");
    if (el) el.classList.add("scoppia");
    Suoni.sfx("magia"); C.vibra([30, 40, 60]);
    setTimeout(function () {
      s.missione.liberati.push(a.id);
      Object.keys(a.regalo).forEach(function (k) { s.materiali[k] = (s.materiali[k] || 0) + a.regalo[k]; });
      C.salva(); C.disegnaHud(); disegna();
      Suoni.sfx("livello");
      C.coriandoli(window.innerWidth / 2, window.innerHeight * 0.45, "🫧", 10);
      setTimeout(function () { C.coriandoli(window.innerWidth / 2, window.innerHeight * 0.4, "💗", 8); }, 300);
      var regalo = Object.keys(a.regalo).map(function (k) { return "+" + a.regalo[k] + " " + MATERIALI[k].nome.toLowerCase(); }).join(", ");
      var finita = s.missione.liberati.length === AMICI.length;
      if (finita) s.materiali.stelle = (s.materiali.stelle || 0) + 20;
      C.apriPannello("<div class='centro liberato'><div class='amico-grande'>" + htmlChiwi(a) + "</div>" +
        "<h2>" + C.esc(a.nome) + (a.femmina ? " è libera!" : " è libero!") + "</h2><p class='fumetto'>Wii-chu! Grazie, " + C.esc(s.bambino || "amico") + "! Vado a vivere " +
        (a.zona === "radura" ? "nella Radura" : "in " + C.esc(nomeZona(a.zona))) + ". Tieni, un regalo per te!</p>" +
        "<p><b>" + C.esc(regalo) + "</b></p>" +
        (finita ? "<div class='missione-testa'>" + nebbione(true) + "<p><b>Hai liberato tutti i Chiwinnie!</b> Il Nebbione ha visto tutti quei colori ed è diventato una nuvola rosa e buona. Ti regala 20 stelle ⭐</p></div>" : "") +
        "<div class='azioni-pannello'><button class='btn verde' data-azione='apri-missione'>Continua la missione</button></div></div>");
      vestiTutti($("pannello-corpo"));
    }, 900);
  }

  // ---------- la storia, la prima volta ----------
  function storia() {
    var s = dati();
    s.missione.storia = true; C.salva();
    C.apriPannello("<div class='centro storia'>" + nebbione(false) +
      "<h2>Il Nebbione!</h2>" +
      "<p>Una notte, sul Bosco Giardino è arrivato il <b>Nebbione</b>: una grande nuvola grigia e brontolona che non sopporta i colori.</p>" +
      "<p>Ha soffiato forte forte e ha chiuso <b>dodici Chiwinnie</b> in bolle di nebbia, sparse per il bosco.</p>" +
      "<p>Solo la luce può aprirle. Completa le missioni, raccogli le <b>lucine ✨</b> e libera tutti gli amici di " + C.esc(s.nome) + "!</p>" +
      "<div class='azioni-pannello'><button class='btn verde' data-azione='apri-missione'>Iniziamo!</button></div></div>");
  }

  // ---------- nel giardino: il bottone della missione e gli amici liberati ----------
  function disegna() {
    var s = stato(); if (!s || !$("btn-missione")) return;
    dati();
    var b = $("btn-missione");
    b.innerHTML = nebbione(s.missione.liberati.length === AMICI.length) + "<span>Amici <b>" + s.missione.liberati.length + "/" + AMICI.length + "</b></span><span class='lucine'>✨ " + s.missione.lucine + "</span>" +
      (puoLiberare() ? "<i class='pallino'></i>" : "");
    disegnaAmici();
  }

  var timerAmici = null;
  function praticello() {
    var z = ZONE.filter(function (x) { return x.id === stato().zona; })[0] || ZONE[0];
    return z.prati || [z.prato];
  }
  function puntoACaso() {
    var a = scegli(praticello());
    return { x: a.x1 + Math.random() * (a.x2 - a.x1), y: a.y1 + Math.random() * (a.y2 - a.y1) };
  }
  function disegnaAmici() {
    var s = stato(), box = $("amici"); if (!box) return;
    var qui = AMICI.filter(function (a) { return s.missione.liberati.indexOf(a.id) !== -1 && a.zona === s.zona; });
    var ids = qui.map(function (a) { return a.id; }).join(",");
    if (box.dataset.ids === ids + "|" + s.zona) return;
    box.dataset.ids = ids + "|" + s.zona;
    box.innerHTML = "";
    qui.forEach(function (a) {
      var el = document.createElement("div");
      el.className = "chiwi-mondo amico"; el.dataset.amico = a.id;
      el.innerHTML = "<div class='fumetto-mondo'></div>" + htmlChiwi(a);
      var p = puntoACaso();
      el.style.left = p.x + "%"; el.style.top = p.y + "%"; el.style.zIndex = Math.round(p.y * 10);
      el._pos = p;
      box.appendChild(el);
      Look.disegna(el.querySelector(".look"), a.look);
      el.addEventListener("click", function (e) {
        e.stopPropagation();
        var f = el.querySelector(".fumetto-mondo");
        f.textContent = a.nome + ": " + scegli(["Wii-chu! Grazie di avermi liberato!", "Nimmi-nimmi! Che bello qui!", "Pum-pum winni!", "Il Nebbione non mi prende più!", "Giochiamo insieme?"]);
        f.classList.add("su"); clearTimeout(f._t); f._t = setTimeout(function () { f.classList.remove("su"); }, 2600);
        el.classList.remove("salta"); void el.offsetWidth; el.classList.add("salta");
        Suoni.sfx("coccola");
      });
    });
  }
  // ogni tanto un amico fa due passi
  function passeggiata() {
    clearTimeout(timerAmici);
    timerAmici = setTimeout(passeggiata, 3500 + Math.random() * 3000);
    if (!stato() || !$("s-mondo").classList.contains("attiva")) return;
    var tutti = document.querySelectorAll("#amici .amico");
    if (!tutti.length) return;
    var el = tutti[Math.floor(Math.random() * tutti.length)], a = AMICI.filter(function (x) { return x.id === el.dataset.amico; })[0];
    var p = puntoACaso(), img = el.querySelector(".vestito > img"), passo = 0;
    el.classList.toggle("sinistra", p.x < el._pos.x); el.classList.add("cammina");
    clearInterval(el._passi);
    el._passi = setInterval(function () { img.src = immagineChiwi(a.colore, passo++ % 2 ? "corsa2" : "corsa1"); }, 160);
    setTimeout(function () { clearInterval(el._passi); el.classList.remove("cammina", "sinistra"); img.src = immagineChiwi(a.colore, "fronte"); }, 2200);
    el._pos = p; el.style.left = p.x + "%"; el.style.top = p.y + "%"; el.style.zIndex = Math.round(p.y * 10);
  }

  function apriMondo() {
    var s = stato(); if (!s) return;
    dati(); riempi(); disegna();
    // la storia del Nebbione si racconta quando la casetta è pronta
    if (!s.missione.storia && s.costruiti.indexOf("casetta") !== -1) setTimeout(function () { if ($("pannello").hidden) storia(); }, 1500);
  }

  function collega() {
    $("btn-missione").addEventListener("click", apri);
    $("pannello").addEventListener("click", function (e) {
      var b = e.target.closest("[data-azione]"); if (!b) return;
      var a = b.dataset.azione;
      if (a === "apri-missione") apri();
      else if (a === "libera") libera(b.dataset.amico);
      else if (a === "cambia-missione") cambia(+b.dataset.i);
    });
    passeggiata();
  }

  window.Missione = {
    avvia: function (ctx) { C = ctx; collega(); if ($("s-mondo").classList.contains("attiva")) apriMondo(); },
    evento: evento, apri: apri, apriMondo: apriMondo, disegna: disegna, storia: storia,
    nebbione: nebbione
  };
})();
