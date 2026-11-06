// Il viaggio: la storia che fa da cornice a tutto il gioco.
// Il Nebbione ha chiuso dodici Chiwinnie in bolle di nebbia. Ogni zona è un capitolo (vedi CAPITOLI in dati.js):
// si liberano i suoi tre amici superando le loro prove, si arreda il quadro, si riempie la lanterna di lucine
// e si affronta la sfida finale. Vinta la sfida si apre il forziere e il sentiero verso la zona dopo.
// Alla fine, nel Castello del Nebbione, tutti i Chiwinnie insieme fanno l'arcobaleno che scaccia la nebbia.
// Gli amici liberati restano a vivere nella loro zona.
// Usa le funzioni del gioco che gioco.js passa in Missione.avvia(ctx).
(function () {
  var C = null;
  function $(id) { return document.getElementById(id); }
  function stato() { return C ? C.stato() : null; }
  function scegli(a) { return a[Math.floor(Math.random() * a.length)]; }

  // il Nebbione: una nuvola grigia e brontolona (alla fine della storia diventa buono e rosa)
  function nebbione(buono) {
    return "<img class='nebbione" + (buono ? " buono" : "") + "' src='img/nebbione/nebbione" + (buono ? "_buono" : "") + ".png' alt=''>";
  }

  // ---------- dati salvati ----------
  function dati() {
    var s = stato();
    if (!s.missione) s.missione = { lucine: 0, liberati: [], storia: false };
    if (!s.missione.racconto2) { s.missione.racconto2 = true; s.missione.storia = false; }   // la storia ora è a tutto schermo: la rivedono tutti una volta
    if (!s.missione.racconto3) { s.missione.racconto3 = true; s.missione.storia = false; }   // il prologo animato: lo vedono tutti una volta
    if (!s.missione.prove) s.missione.prove = [];
    if (!s.missioni) s.missioni = { grado: 1, attive: [], fatte: 0 };
    // chi giocava già tiene aperte le zone che aveva completato
    if (!s.viaggio) s.viaggio = { battuti: [], vecchie: (s.zoneComplete || []).slice(), visti: [] };
    return s;
  }

  // ---------- i capitoli ----------
  function iZona(id) { return ZONE.map(function (z) { return z.id; }).indexOf(id); }
  function giocabili() { return CAPITOLI.filter(function (c) { return c.zona; }); }
  function aperto(c) {
    var s = dati();
    if (!c.zona) return false;
    if (c.finale) return forziereAperto(s, c.dopo);
    return zonaApertaIn(s, iZona(c.zona));
  }
  function vinto(c) { return !!c.zona && forziereAperto(dati(), c.zona); }
  function amiciDi(c) { return c.finale ? AMICI : AMICI.filter(function (a) { return a.zona === c.zona; }); }
  function libero(a) { return dati().missione.liberati.indexOf(a.id) !== -1; }
  function provaFatta(a) { return dati().missione.prove.indexOf(a.id) !== -1; }
  function arredi(c) {
    var z = ZONE[iZona(c.zona)];
    if (!z || !z.pezzi) return { fatti: 0, tot: 0, serve: 0 };
    var k = Object.keys(z.pezzi), fatti = k.filter(function (x) { return dati().costruiti.indexOf(x) !== -1; }).length;
    return { fatti: fatti, tot: k.length, serve: Math.ceil(k.length / 2) };
  }
  // i tre passi del capitolo
  function passi(c) {
    var s = dati(), am = amiciDi(c), ar = c.finale ? null : arredi(c);
    return {
      amici: am.every(libero), liberi: am.filter(libero).length, quanti: am.length,
      arredi: !ar || ar.fatti >= ar.serve, ar: ar,
      lanterna: s.missione.lucine >= c.lanterna
    };
  }
  function pronto(c) { var p = passi(c); return aperto(c) && !vinto(c) && p.amici && p.arredi && p.lanterna; }
  function capitoloCorrente() {
    var g = giocabili().filter(function (c) { return aperto(c) && !vinto(c); });
    // prima quello della zona dove si trova il Chiwinnie, poi il primo ancora da vincere
    return g.filter(function (c) { return c.zona === dati().zona; })[0] || g[0] || null;
  }
  function numero(c) { return CAPITOLI.indexOf(c) + 1; }
  // l'amico da liberare per primo: uno con la prova già superata, altrimenti il primo ancora prigioniero
  function prossimoAmico() {
    var c = capitoloCorrente(); if (!c) return null;
    var dentro = amiciDi(c).filter(function (a) { return !libero(a); });
    return dentro.filter(provaFatta)[0] || dentro[0] || null;
  }
  function puoLiberare() { var a = prossimoAmico(); return !!a && provaFatta(a); }
  // il prossimo passo da fare, in una riga
  function prossimoPasso(c) {
    if (!c) return "Il Bosco è salvo!";
    var p = passi(c), a = prossimoAmico();
    if (vinto(c)) return "Capitolo vinto!";
    if (!p.amici && a) return provaFatta(a) ? "Libera " + a.nome + "!" : "Salva " + a.nome + ": " + giocoNome(a.prova.gioco);
    if (!p.arredi) return "Arreda il quadro: " + p.ar.fatti + "/" + p.ar.serve;
    if (!p.lanterna) return "Riempi la lanterna: ✨ " + dati().missione.lucine + "/" + c.lanterna;
    return c.finale ? "Battaglia finale!" : "Sfida finale!";
  }
  function giocoNome(k) { return MINIGIOCHI[k] ? MINIGIOCHI[k].nome : k; }

  // ---------- missioni rapide ----------
  function obiettivo(m, grado) { return m.n[Math.min(grado - 1, m.n.length - 1)]; }
  function testo(m, n) { return (n > 1 && m.testoN ? m.testoN : m.testo).replace("{n}", n); }
  function giocoAperto(k) {
    var s = stato(), g = MINIGIOCHI[k];
    if (!g || s.livello < g.livello) return false;
    if (!g.zona) return true;
    return zonaApertaIn(s, iZona(g.zona));
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
          C.toast("✨ Missione compiuta: " + testo(m, a.n) + "! +1 lucina e +1 ⭐", 2500);
          Suoni.sfx("stella"); C.coriandoli(window.innerWidth / 2, window.innerHeight * 0.35, "✨", 8);
        });
      }
    });
    // le prove degli amici: un minigioco con un obiettivo
    if (tipo === "partita") {
      AMICI.forEach(function (a) {
        var c = capitoloDi(a.zona);
        if (libero(a) || provaFatta(a) || !c || !aperto(c) || a.prova.gioco !== d.gioco || !a.prova.ok(d)) return;
        s.missione.prove.push(a.id);
        festa(function () {
          C.toast("🫧 Prova superata! Ora puoi liberare " + a.nome + "!", 3000);
          Suoni.sfx("magia"); C.coriandoli(window.innerWidth / 2, window.innerHeight * 0.35, "🫧", 8);
        });
      });
    }
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

  // ---------- gli amici ----------
  function htmlChiwi(a, cls) {
    return "<div class='vestito " + (cls || "") + "'><img src='" + immagineChiwi(a.colore, "fronte") + "' alt=''><div class='look' data-look='" + a.id + "'></div></div>";
  }
  function vestiTutti(box) {
    box.querySelectorAll("[data-look]").forEach(function (el) {
      var a = AMICI.filter(function (x) { return x.id === el.dataset.look; })[0];
      if (a) Look.disegna(el, a.look);
      else if (el.dataset.look === "io") Look.disegna(el, stato().look || {});
    });
  }
  function nomeZona(id) { var z = ZONE.filter(function (x) { return x.id === id; })[0]; return z ? z.nome : ""; }

  // ---------- il pannello del viaggio ----------
  var mostrato = null;   // il capitolo aperto nel pannello
  function apri(zona) {
    var s = dati(); riempi();
    var c = (zona && capitoloDi(zona)) || (mostrato && capitoloDi(mostrato)) || capitoloCorrente();
    var tutti = s.missione.liberati.length === AMICI.length, fine = forziereAperto(s, "castello");
    var html = "<div class='missione-testa'>" + nebbione(fine) + "<div><h2>" + (fine ? "Il Bosco è salvo!" : "Il viaggio di " + C.esc(s.nome)) + "</h2>" +
      "<p>" + (fine ? "Con l'arcobaleno di tutti i Chiwinnie il Nebbione si è diradato: ora è una nuvola rosa e buona che fa piovere petali." :
        "Il Nebbione ha chiuso " + AMICI.length + " Chiwinnie in bolle di nebbia, sparse nei quadri del Bosco. Liberali tutti, quadro dopo quadro, fino al suo castello!") + "</p></div></div>" +
      "<div class='missione-conto'><span>🫧 Liberati <b>" + s.missione.liberati.length + "/" + AMICI.length + "</b></span><span class='lucine'>✨ <b>" + s.missione.lucine + "</b> lucine</span></div>";
    if (c) html += capitoloHtml(c);
    // la mappa del viaggio
    html += "<h3 class='titoletto'>La mappa del viaggio</h3><div class='mappa-viaggio'>";
    CAPITOLI.forEach(function (k) {
      var ap = aperto(k), vi = vinto(k), qui = c && k === c;
      var am = k.zona && !k.finale ? amiciDi(k) : [];
      html += "<button class='tappa" + (vi ? " vinta" : ap ? " aperta" : k.inArrivo ? " arrivo" : " chiusa") + (qui ? " qui" : "") + "'" + (ap || vi ? " data-azione='vedi-capitolo' data-capitolo='" + k.zona + "'" : "") + ">" +
        "<span class='numero'>" + (vi ? "⭐" : k.inArrivo ? "🎨" : ap ? numero(k) : "🔒") + "</span>" +
        "<span class='nome'><b>" + C.esc(nomeCapitolo(k)) + "</b><small>" + (vi ? "Vinto!" : k.inArrivo ? "La stiamo dipingendo" : ap ? (k.finale ? "Battaglia finale" : "In corso") : "Nascosto nella nebbia") + "</small></span>" +
        "<span class='mini'>" + am.map(function (a) { return "<i class='" + (libero(a) ? "si" : "") + "' style='background-image:url(" + immagineChiwi(a.colore, "felice") + ")'></i>"; }).join("") + "</span></button>";
    });
    html += "</div>";
    // missioni rapide
    html += "<h3 class='titoletto'>Missioni rapide · grado " + s.missioni.grado + "</h3><p class='nota'>Ogni missione accende una lucina ✨ nella lanterna. Finisci tutte e tre per salire di grado e ricevere un regalo grande.</p>";
    s.missioni.attive.forEach(function (a, i) {
      var m = def(a.id), fatta = a.fatti >= a.n;
      html += "<div class='riga-sfida missione" + (fatta ? " fatta" : "") + "'><div class='testo'>" + C.esc(testo(m, a.n)) +
        "<div class='barretta'><div style='width:" + Math.round(a.fatti / a.n * 100) + "%'></div></div><div class='nota'>" + (fatta ? "Fatta! ✓" : a.fatti + " / " + a.n) + "</div></div>" +
        "<div class='premio'>+1 ✨ +1 ⭐</div>" +
        (fatta ? "" : "<button class='btn piccolo bianco salta' data-azione='cambia-missione' data-i='" + i + "' title='Cambia missione'>Cambia<br>−1⭐</button>") + "</div>";
    });
    html += "<p class='nota centro'>Le lucine arrivano anche dalle sfide, da ogni livello nuovo e da ogni quadro arredato.</p>" +
      "<div class='azioni-pannello'><button class='btn bianco' data-azione='rileggi-storia'>🎬 Rivedi la storia</button></div>";
    C.apriPannello(html);
    vestiTutti($("pannello-corpo"));
  }

  function capitoloHtml(c) {
    var s = dati(), p = passi(c), v = vinto(c);
    var html = "<div class='capitolo" + (v ? " vinto" : "") + "'><div class='capitolo-testa' style='background-image:url(" + (c.finale ? "img/zona4/finale.jpg" : ZONE[iZona(c.zona)].cartella + "finale.jpg") + ")'>" +
      "<small>Capitolo " + numero(c) + "</small><b>" + C.esc(nomeCapitolo(c)) + "</b></div>" +
      "<p class='capitolo-arrivo'>" + C.esc(v ? (c.fine || "Capitolo vinto!") : c.arrivo) + "</p>";
    if (!c.finale) {
      // 1. gli amici
      html += "<div class='passo" + (p.amici ? " fatto" : "") + "'><h4><i>1</i> Libera gli amici <span>" + p.liberi + "/" + p.quanti + "</span></h4><div class='bolle-amici'>";
      amiciDi(c).forEach(function (a) {
        var li = libero(a), pf = provaFatta(a), g = MINIGIOCHI[a.prova.gioco], presto = g && s.livello < g.livello;
        html += "<div class='amico-bolla" + (li ? " libero" : pf ? " prossimo" : " chiuso") + "' data-amico='" + a.id + "'>" +
          "<div class='bolla-nebbia'>" + htmlChiwi(a) + (li ? "" : "<img class='bolla-img' src='img/nebbione/bolla.png' alt=''>") + "</div>" +
          "<b>" + C.esc(a.nome) + "</b>" +
          (li ? "<small>È liber" + (a.femmina ? "a" : "o") + "!</small>" :
            pf ? "<button class='btn piccolo verde' data-azione='libera' data-amico='" + a.id + "'>Liberal" + (a.femmina ? "a" : "o") + "!</button>" :
            "<small class='prova'>" + C.esc(a.prova.testo) + "</small>" +
            (presto ? "<small>Livello " + g.livello + "</small>" : "<button class='btn piccolo bianco' data-azione='gioca' data-chiave='" + a.prova.gioco + "'>Gioca</button>")) +
          "</div>";
      });
      html += "</div></div>";
      // 2. il quadro
      html += "<div class='passo" + (p.arredi ? " fatto" : "") + "'><h4><i>2</i> Arreda il quadro <span>" + Math.min(p.ar.fatti, p.ar.serve) + "/" + p.ar.serve + "</span></h4>" +
        "<p class='nota'>Ogni arredo dirada un po' la nebbia. Ne servono almeno " + p.ar.serve + " su " + p.ar.tot + ".</p>" +
        (p.arredi || s.zona === c.zona ? "" : "<button class='btn piccolo bianco' data-azione='vai-zona' data-zona='" + c.zona + "'>Vai al quadro</button>") + "</div>";
    } else {
      html += "<div class='passo" + (p.amici ? " fatto" : "") + "'><h4><i>1</i> Tutti i Chiwinnie liberi <span>" + p.liberi + "/" + p.quanti + "</span></h4>" +
        "<p class='nota'>Per la battaglia finale servono tutti gli amici: insieme faranno l'arcobaleno!</p></div>";
    }
    // 3. la lanterna
    html += "<div class='passo" + (p.lanterna || v ? " fatto" : "") + "'><h4><i>" + (c.finale ? 2 : 3) + "</i> Riempi la lanterna <span>✨ " + Math.min(s.missione.lucine, c.lanterna) + "/" + c.lanterna + "</span></h4>" +
      "<div class='barretta oro'><div style='width:" + Math.min(100, Math.round(s.missione.lucine / c.lanterna * 100)) + "%'></div></div>" +
      "<p class='nota'>La luce delle lucine scaccia il Nebbione. Si guadagnano con le missioni rapide qui sotto.</p></div>";
    // la sfida finale
    html += v ? "<div class='sfida-finale vinta'>⭐ Sfida vinta! Il forziere è stato aperto.</div>" :
      "<button class='sfida-finale" + (pronto(c) ? " pronta" : "") + "'" + (pronto(c) ? " data-azione='gioca' data-chiave='sfida' data-capitolo='" + c.zona + "'" : " disabled") + ">" + nebbione() +
      "<span><b>" + (c.finale ? "Battaglia finale" : "Sfida finale") + "</b><small>" + (pronto(c) ? "Sei pronto: andiamo!" : "Si apre quando hai fatto tutti i passi") + "</small></span></button>";
    return html + "</div>";
  }

  function libera(id) {
    var s = dati(), a = AMICI.filter(function (x) { return x.id === id; })[0];
    if (!a || libero(a)) return;
    if (!provaFatta(a)) { C.avviso("Prima supera la prova: " + a.prova.testo, 2800); return; }
    var el = document.querySelector(".amico-bolla[data-amico='" + id + "']");
    if (el) el.classList.add("scoppia");
    Suoni.sfx("magia"); C.vibra([30, 40, 60]);
    setTimeout(function () {
      s.missione.liberati.push(a.id);
      Object.keys(a.regalo).forEach(function (k) { s.materiali[k] = (s.materiali[k] || 0) + a.regalo[k]; });
      s.missione.lucine++;
      C.salva(); C.disegnaHud(); disegna();
      Suoni.sfx("livello");
      C.coriandoli(window.innerWidth / 2, window.innerHeight * 0.45, "🫧", 10);
      setTimeout(function () { C.coriandoli(window.innerWidth / 2, window.innerHeight * 0.4, "💗", 8); }, 300);
      var regalo = Object.keys(a.regalo).map(function (k) { return "+" + a.regalo[k] + " " + MATERIALI[k].nome.toLowerCase(); }).join(", ");
      C.apriPannello("<div class='centro liberato'><div class='amico-grande'>" + htmlChiwi(a) + "</div>" +
        "<h2>" + C.esc(a.nome) + (a.femmina ? " è libera!" : " è libero!") + "</h2><p class='fumetto'>Wii-chu! Grazie, " + C.esc(s.bambino || "amico") + "! Resto qui " +
        (a.zona === "radura" ? "nella Radura" : "in " + C.esc(nomeZona(a.zona))) + " ad aiutarti. Tieni, un regalo per te!</p>" +
        "<p><b>" + C.esc(regalo) + " e una lucina ✨</b></p>" +
        "<div class='azioni-pannello'><button class='btn verde' data-azione='apri-missione'>Continua il viaggio</button></div></div>");
      vestiTutti($("pannello-corpo"));
    }, 900);
  }

  // ---------- la vittoria: il forziere ----------
  function vittoria(zona) {
    var s = dati(), c = capitoloDi(zona);
    if (!c || vinto(c)) return;
    s.missione.lucine = Math.max(0, s.missione.lucine - c.lanterna);
    s.viaggio.battuti.push(c.zona);
    Object.keys(c.premio).forEach(function (k) { s.materiali[k] = (s.materiali[k] || 0) + c.premio[k]; });
    Casa.controllaPremi(true);   // l'accessorio speciale del forziere
    C.salva(); disegna();
    if (c.finale) { finale(function () { forziere(c); }); return; }
    forziere(c);
  }
  function forziere(c) {
    var acc = c.accessorio && ACCESSORI[c.accessorio];
    var voci = Object.keys(c.premio).map(function (k) { return "<span><img src='" + MATERIALI[k].img + "' alt=''>+" + c.premio[k] + "</span>"; }).join("");
    C.apriPannello("<div class='centro forziere-box'><h2>" + (c.finale ? "Il grande forziere!" : "Il forziere del capitolo!") + "</h2>" +
      "<div class='forziere' data-azione='apri-forziere'><div class='coperchio'></div><div class='cassa'></div><div class='luce'></div></div>" +
      "<p class='nota' id='forziere-nota'>Toccalo per aprirlo!</p>" +
      "<div class='forziere-dentro' hidden><div class='bottino'>" + voci + "</div>" +
      (acc ? "<div class='forziere-acc'><img src='" + acc.img + "' alt=''><b>" + C.esc(acc.nome) + "</b><small>Nuovo nel guardaroba!</small></div>" : "") +
      "<div class='azioni-pannello'><button class='btn verde' data-azione='dopo-forziere' data-capitolo='" + c.zona + "'>Evviva!</button></div></div></div>");
  }
  function apriForziere() {
    var f = document.querySelector(".forziere"); if (!f || f.classList.contains("aperto")) return;
    f.classList.add("aperto");
    Suoni.sfx("livello"); C.vibra([40, 60, 80]);
    C.coriandoli(window.innerWidth / 2, window.innerHeight * 0.4, "⭐", 16);
    setTimeout(function () { C.coriandoli(window.innerWidth / 2, window.innerHeight * 0.4, "✨", 12); }, 400);
    var n = $("forziere-nota"); if (n) n.hidden = true;
    var d = document.querySelector(".forziere-dentro"); if (d) setTimeout(function () { d.hidden = false; }, 500);
  }
  // dopo il forziere: la nebbia se ne va e si apre il sentiero verso il capitolo dopo
  function dopoForziere(zona) {
    var c = capitoloDi(zona); C.chiudiPannello();
    if (c) C.guadagnaXp(c.finale ? 200 : 80);   // qui, così il pannello del livello nuovo non copre il forziere
    if (!c || c.finale) { apri(); return; }
    var prossimo = giocabili()[giocabili().indexOf(c) + 1];
    var scene = [
      { img: ZONE[iZona(c.zona)].cartella + "finale.jpg", nebbia: "via", testo: c.fine, amici: amiciDi(c) }
    ];
    if (prossimo) scene.push({ img: prossimo.finale ? "img/nebbione/nebbione.png" : ZONE[iZona(prossimo.zona)].cartella + "vuota.jpg", buio: prossimo.finale, nebbia: true, moto: "destra",
      testo: "Si apre il sentiero: <b>Capitolo " + numero(prossimo) + " · " + C.esc(nomeCapitolo(prossimo)) + "</b>. " + C.esc(prossimo.arrivo), ultima: "Andiamo!" });
    film(scene, function () {
      if (prossimo && !prossimo.finale) { dati().viaggio.visti.push(prossimo.zona); C.vaiZona(prossimo.zona); }
      else apri(prossimo && prossimo.zona);
    });
  }

  // ---------- il film: scene a tutto schermo che si muovono da sole ----------
  // ogni scena: img, testo, buio (sfondo scuro), moto (zoom, destra, sinistra, su), nebbia (true: nebbia che passa, "via": nebbia che si dirada),
  // amici (Chiwinnie da far comparire), arcobaleno (la scena finale), ultima (testo del bottone finale).
  function film(scene, poi) {
    var box = document.createElement("div");
    box.id = "racconto"; box.className = "film";
    document.getElementById("app").appendChild(box);
    var i = 0, timer = null, finito = false;
    function scena() {
      clearTimeout(timer);
      var p = scene[i], ritaglio = /\.png$/.test(p.img || "");
      box.className = "film" + (p.buio ? " buio" : "");
      box.innerHTML = "<div class='racconto-quadro " + (ritaglio ? "ritaglio" : "moto-" + (p.moto || ["zoom", "destra", "sinistra", "su"][i % 4])) + "'>" +
        (p.arcobaleno ? arcobalenoHtml() : "<img src='" + p.img + "' alt=''>") +
        (p.nebbia ? "<div class='nebbia-film" + (p.nebbia === "via" ? " via" : "") + "'><i></i><i></i><i></i></div>" : "") +
        (p.amici ? "<div class='film-amici'>" + p.amici.map(function (a, k) { return "<div style='animation-delay:" + (0.6 + k * 0.25) + "s'>" + htmlChiwi(a) + "</div>"; }).join("") + "</div>" : "") +
        "</div>" +
        "<div class='racconto-testo'><p>" + p.testo + "</p><div class='racconto-punti'>" + scene.map(function (x, k) { return "<i" + (k === i ? " class='ora'" : "") + "></i>"; }).join("") + "</div>" +
        "<div class='azioni-pannello'>" + (i < scene.length - 1 ? "<button class='btn bianco' data-r='salta'>Salta</button>" : "") +
        "<button class='btn verde' data-r='avanti'>" + (i === scene.length - 1 ? (p.ultima || "Andiamo!") : "Avanti") + "</button></div></div>";
      vestiTutti(box);
      if (p.musica) Suoni.musica(p.musica);
      Suoni.sfx(p.suono || (p.buio ? "magia" : "tap"));
      if (p.arcobaleno) avviaArcobaleno(box);
      // le scene vanno avanti da sole; l'ultima aspetta il bottone
      if (i < scene.length - 1) timer = setTimeout(avanti, p.durata || 4200 + p.testo.replace(/<[^>]+>/g, "").length * 45);
    }
    function avanti() { if (finito) return; if (i < scene.length - 1) { i++; scena(); } else fine(); }
    function fine() { if (finito) return; finito = true; clearTimeout(timer); box.remove(); if (poi) poi(); }
    box.addEventListener("click", function (e) {
      var b = e.target.closest("[data-r]");
      if (b && b.dataset.r === "salta") return fine();
      if (b || e.target.closest(".racconto-quadro")) avanti();
    });
    scena();
    return box;
  }

  // il prologo: si vede all'inizio del gioco (prima di svegliare il Chiwinnie) e si può rivedere dal viaggio
  function racconta(nome, poi) {
    var chi = nome ? "<b>" + C.esc(nome) + "</b>" : "un piccolo Chiwinnie";
    var colore = (stato() && stato().colore) || "viola";
    film([
      { img: "img/zona1/finale.jpg", moto: "zoom", musica: "radura", testo: "Nel Bosco Giardino vivevano tanti Chiwinnie, morbidi e colorati. Di giorno giocavano tra i fiori, e la sera guardavano le lucciole tutti insieme." },
      { img: "img/zona3/finale.jpg", moto: "su", testo: "Il Bosco era grande: c'erano il Ruscello, la Collina dei fiori e, lassù, il Cielo del Celeste." },
      { img: "img/nebbione/nebbione.png", buio: true, nebbia: true, musica: "notte", suono: "errore", testo: "Ma una notte arrivò il <b>Nebbione</b>: una grande nuvola grigia e brontolona che non sopporta i colori." },
      { img: "img/nebbione/storia.jpg", moto: "zoom", nebbia: true, testo: "Soffiò forte forte e chiuse <b>dodici Chiwinnie</b> in bolle di nebbia. Poi le nascose nei quadri del Bosco, uno più lontano dell'altro." },
      { img: immagineChiwi(colore, "corsa1"), buio: true, testo: "Solo uno riuscì a scappare: " + chi + ". Corse tutta la notte e arrivò nella Radura, stanchissimo." },
      { img: "img/zona2/vuota.jpg", moto: "destra", nebbia: true, testo: "Comincia il viaggio: <b>quadro dopo quadro</b>, libera gli amici, ridai colore al Bosco e affronta il Nebbione alla fine di ogni capitolo." },
      { img: "img/lucciola.png", buio: true, testo: "Le bolle di nebbia si aprono solo con la luce. Raccogli le <b>lucine ✨</b>: alla fine, tutti insieme, farete un arcobaleno!", ultima: nome ? "Andiamo!" : "Svegliamolo!" }
    ], function () { var s = stato(); if (s) { dati(); s.missione.storia = true; C.salva(); } if (poi) poi(); });
  }
  function storia() { var s = stato(); C.chiudiPannello(); racconta(s && s.nome, function () { if (s) apri(); }); }

  // arrivo in un capitolo nuovo
  function arrivo(c) {
    var s = dati();
    s.viaggio.visti.push(c.zona); C.salva();
    film([
      { img: ZONE[iZona(c.zona)].cartella + "vuota.jpg", nebbia: true, moto: "zoom", testo: "<b>Capitolo " + numero(c) + " · " + C.esc(nomeCapitolo(c)) + "</b><br>" + C.esc(c.arrivo), amici: amiciDi(c), ultima: "Liberiamoli!" }
    ], function () { apri(c.zona); });
  }

  // ---------- il finale: la battaglia e l'arcobaleno di tutti i Chiwinnie ----------
  function arcobalenoHtml() {
    var s = stato();
    return "<div class='battaglia'><img class='neb-cattivo' src='img/nebbione/nebbione.png' alt=''><img class='neb-buono' src='img/nebbione/nebbione_buono.png' alt=''>" +
      "<div class='arco'></div><div class='raggio'></div><div class='squadra'>" + AMICI.map(function (a) { return htmlChiwi(a); }).join("") + "</div>" +
      "<div class='vestito io'><img src='" + immagineChiwi(s.colore, "fronte") + "' alt=''><div class='look' data-look='io'></div></div></div>";
  }
  function avviaArcobaleno(box) {
    var b = box.querySelector(".battaglia"); if (!b) return;
    setTimeout(function () { b.classList.add("arrivano"); Suoni.sfx("presa"); }, 300);
    setTimeout(function () { b.classList.add("arco-su"); Suoni.sfx("magia"); C.vibra([30, 30, 30, 30, 120]); }, 3200);
    setTimeout(function () { b.classList.add("diradato"); Suoni.sfx("livello"); C.coriandoli(window.innerWidth / 2, window.innerHeight * 0.3, "🌈", 14); }, 5200);
  }
  function finale(poi) {
    var s = stato();
    film([
      { img: "img/nebbione/nebbione.png", buio: true, nebbia: true, musica: "notte", suono: "errore", testo: "Sei arrivato in cima al Castello del Nebbione. Lui gonfia le guance: «Nessuno porterà i colori quassù!»" },
      { img: immagineChiwi(s.colore, "corsa1"), buio: true, testo: "Ma " + C.esc(s.nome) + " non è più solo. Da tutti i quadri del Bosco arrivano di corsa gli amici liberati…" },
      { arcobaleno: true, buio: true, durata: 8500, musica: "nuvole", testo: "Tutti i Chiwinnie si prendono per la zampetta e insieme fanno un enorme <b>arcobaleno</b>, che investe il Nebbione!" },
      { img: "img/nebbione/nebbione_buono.png", testo: "La nebbia si dirada. Al suo posto c'è una nuvola rosa e buona: «Che colori! Non li avevo mai visti così da vicino…»" },
      { img: "img/zona4/finale.jpg", moto: "su", nebbia: "via", testo: "Il Bosco Giardino è salvo! Ora il Nebbione buono fa piovere petali, e ogni sera tutti i Chiwinnie guardano le lucciole insieme.", amici: AMICI, ultima: "Che festa!" }
    ], poi);
  }

  // ---------- nel giardino: l'indicatore del viaggio e gli amici liberati ----------
  function disegna() {
    var s = stato(); if (!s || !$("btn-missione")) return;
    dati();
    var b = $("btn-missione"), c = capitoloCorrente(), fine = forziereAperto(s, "castello");
    var evidente = puoLiberare() || (c && pronto(c));
    b.classList.toggle("pronta", !!evidente);
    b.innerHTML = nebbione(fine) +
      (c ? "<span><small>Cap. " + numero(c) + " · " + C.esc(nomeCapitolo(c)) + "</small>" + C.esc(prossimoPasso(c)) + "</span><span class='lucine'>✨ " + s.missione.lucine + "</span>"
         : "<span>" + (fine ? "Bosco salvo! 🌈" : "Nuovi quadri in arrivo!") + "</span>") +
      "<span class='conta'>" + s.missione.liberati.length + "/" + AMICI.length + "</span>" + (evidente ? "<i class='pallino'></i>" : "");
    // la nebbia del quadro si dirada a ogni arredo e sparisce con la sfida finale
    var n = $("nebbia-mondo"), cz = capitoloDi(s.zona);
    if (n) {
      var ar = cz && !cz.finale ? arredi(cz) : null;
      n.style.opacity = !cz || vinto(cz) || !ar || !ar.tot ? 0 : 0.35 + 0.65 * (1 - ar.fatti / ar.tot);
    }
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
    // chi aveva già un Chiwinnie prima della missione vede la storia una volta, a tutto schermo
    if (document.getElementById("racconto")) return;
    if (!s.missione.storia) { s.missione.storia = true; setTimeout(function () { racconta(s.nome, function () { apri(); }); }, 900); return; }
    // la prima volta in un capitolo: la scena di arrivo
    var c = capitoloDi(s.zona);
    if (c && !vinto(c) && s.viaggio.visti.indexOf(c.zona) === -1) setTimeout(function () { if (!document.getElementById("racconto")) arrivo(c); }, 700);
  }

  function collega() {
    $("btn-missione").addEventListener("click", function () { mostrato = null; apri(); });
    $("pannello").addEventListener("click", function (e) {
      var b = e.target.closest("[data-azione]"); if (!b) return;
      var a = b.dataset.azione;
      if (a === "apri-missione") { mostrato = null; apri(); }
      else if (a === "vedi-capitolo") { mostrato = b.dataset.capitolo; apri(); }
      else if (a === "libera") libera(b.dataset.amico);
      else if (a === "apri-forziere") apriForziere();
      else if (a === "dopo-forziere") dopoForziere(b.dataset.capitolo);
      else if (a === "cambia-missione") cambia(+b.dataset.i);
      else if (a === "rileggi-storia") storia();
    });
    passeggiata();
  }

  // lucine guadagnate fuori dalle missioni (sfide, livelli, zone)
  function regalaLucine(n, perche) {
    var s = stato(); if (!s) return;
    dati(); s.missione.lucine += n; C.salva(); disegna();
    festa(function () { C.toast("✨ +" + n + (n === 1 ? " lucina" : " lucine") + (perche ? " " + perche : "") + "!", 2400); Suoni.sfx("stella"); });
  }
  // il Chiwinnie ogni tanto pensa ai suoi amici
  function frase() {
    var s = stato(); if (!s) return null;
    var c = capitoloCorrente(), a = prossimoAmico(); if (!c) return null;
    if (pronto(c)) return "Siamo pronti! Affrontiamo il Nebbione!";
    if (puoLiberare()) return "Hai superato la prova! Liberiamo " + a.nome + "!";
    if (!a) return scegli(["Riempiamo la lanterna di lucine!", "Brrr, sento il Nebbione là in fondo…", "Ancora qualche arredo e la nebbia sparisce!"]);
    return scegli(["Mi manca " + a.nome + "… dove l'avrà portato il Nebbione?", "Per liberare " + a.nome + " giochiamo a " + giocoNome(a.prova.gioco) + "!", "Brrr, sento il Nebbione là in fondo…", "Con la luce apriamo le bolle di nebbia!"]);
  }

  window.Missione = {
    avvia: function (ctx) { C = ctx; collega(); if ($("s-mondo").classList.contains("attiva")) apriMondo(); },
    evento: evento, apri: apri, apriMondo: apriMondo, disegna: disegna, storia: storia, racconta: racconta, vittoria: vittoria, film: film,
    regalaLucine: regalaLucine, frase: frase,
    nebbione: nebbione
  };
})();
