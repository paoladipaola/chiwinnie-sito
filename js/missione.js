// Il viaggio: la storia che fa da cornice a tutto il gioco.
// Il Giardino magico dei Chiwinnie è fatto di tante terre. Un giorno i nuvoloni carichi di pioggia del Nebbione
// si sono rubati i colori e tutti i Chiwinnie, tranne quello del giocatore.
// In ogni terra (CAPITOLI in dati.js) ci sono tre amici prigionieri: si liberano con le lucine magiche ✨,
// che si guadagnano giocando ai minigiochi. Liberati tutti, si parte per la terra dopo con un'avventura arcade
// (il sentiero), che finisce con un forziere. Dopo l'ultima terra il sentiero è la battaglia finale:
// tutti i Chiwinnie insieme fanno un arcobaleno che investe il Nebbione e lo dirada.
// Le stelle servono ad arredare: è la parte tranquilla, non serve per andare avanti.
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
    if (!s.missione.racconto4) { s.missione.racconto4 = true; s.missione.storia = false; }   // il cartone nuovo: lo vedono tutti una volta
    // chi giocava già tiene aperte le zone che aveva completato
    if (!s.viaggio) s.viaggio = { battuti: [], vecchie: (s.zoneComplete || []).slice(), visti: [] };
    return s;
  }

  // ---------- le terre del viaggio ----------
  function iZona(id) { return ZONE.map(function (z) { return z.id; }).indexOf(id); }
  function aperto(c) { return zonaApertaIn(dati(), iZona(c.zona)); }
  function vinto(c) { return forziereAperto(dati(), c.zona); }   // il sentiero verso la terra dopo è stato fatto
  function amiciDi(c) { return AMICI.filter(function (a) { return a.zona === c.zona; }); }
  function libero(a) { return dati().missione.liberati.indexOf(a.id) !== -1; }
  function liberi(c) { return amiciDi(c).filter(libero).length; }
  function tuttiLiberi(c) { return amiciDi(c).every(libero); }
  function pronto(c) { return aperto(c) && !vinto(c) && tuttiLiberi(c); }   // si può partire per il sentiero
  function dopo(c) { return CAPITOLI[CAPITOLI.indexOf(c) + 1] || null; }
  // "La Radura" → "della Radura", "Il Ruscello" → "del Ruscello"
  function diTerra(nome) { return nome.replace(/^La /, "della ").replace(/^Il /, "del ").replace(/^Le /, "delle ").replace(/^I /, "dei "); }
  function numero(c) { return CAPITOLI.indexOf(c) + 1; }
  function capitoloCorrente() {
    var g = CAPITOLI.filter(function (c) { return aperto(c) && !vinto(c); });
    return g.filter(function (c) { return c.zona === dati().zona; })[0] || g[0] || null;
  }
  // il prossimo amico da liberare: il più economico ancora prigioniero nella terra in corso
  function prossimoAmico() {
    var c = capitoloCorrente(); if (!c) return null;
    return amiciDi(c).filter(function (a) { return !libero(a); }).sort(function (x, y) { return x.lucine - y.lucine; })[0] || null;
  }
  function puoLiberare() { var a = prossimoAmico(); return !!a && dati().missione.lucine >= a.lucine; }
  function nomeSentiero(c) { var d = dopo(c); return c.finale ? "Battaglia finale" : d ? "Il sentiero per " + nomeCapitolo(d).replace(/^(La|Il|Le|I|Lo|Gli) /, function (x) { return x.toLowerCase(); }) : "Il sentiero"; }
  // il prossimo passo da fare, in una riga
  function prossimoPasso(c) {
    var a = prossimoAmico();
    if (a) return (dati().missione.lucine >= a.lucine ? "Libera " : "Salva ") + a.nome;
    return nomeSentiero(c) + "!";
  }

  // feste in fila, così i messaggi non si coprono a vicenda
  var coda = [], inCoda = false;
  function festa(fn) { coda.push(fn); if (!inCoda) prossimaFesta(); }
  function prossimaFesta() {
    var fn = coda.shift();
    if (!fn) { inCoda = false; return; }
    inCoda = true; fn(); setTimeout(prossimaFesta, 2600);
  }

  // ogni partita ai minigiochi regala lucine magiche: una se va bene, due se va benissimo
  function evento(tipo, d) {
    var s = stato(); if (!s || tipo !== "partita") return 0;
    dati();
    var n = lucinePartita(d);
    if (n) { s.missione.lucine += n; C.salva(); disegna(); }
    return n;
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
  var mostrato = null;   // la terra aperta nel pannello
  function apri(zona) {
    var s = dati();
    var c = (zona && capitoloDi(zona)) || (mostrato && capitoloDi(mostrato)) || capitoloCorrente();
    var fine = forziereAperto(s, "cielo");
    var html = "<div class='missione-testa'>" + nebbione(fine) + "<div><h2>" + (fine ? "Il Giardino è salvo!" : "Il viaggio di " + C.esc(s.nome)) + "</h2>" +
      "<p>" + (fine ? "Con l'arcobaleno di tutti i Chiwinnie il Nebbione si è diradato: ora è una nuvola rosa e buona che fa piovere petali." :
        "I nuvoloni del Nebbione si sono rubati i colori e i Chiwinnie. Libera gli amici di ogni terra con le lucine magiche ✨, poi parti per la terra dopo!") + "</p></div></div>" +
      "<div class='missione-conto'><span>🫧 Liberati <b>" + s.missione.liberati.length + "/" + AMICI.length + "</b></span><span class='lucine'>✨ <b>" + s.missione.lucine + "</b> lucine</span></div>";
    if (c) html += terraHtml(c);
    // la mappa del Giardino magico
    html += "<h3 class='titoletto'>La mappa del Giardino magico</h3><div class='mappa-viaggio'>";
    CAPITOLI.forEach(function (k) {
      var ap = aperto(k), vi = vinto(k), qui = c && k === c;
      html += "<button class='tappa" + (vi ? " vinta" : ap ? " aperta" : " chiusa") + (qui ? " qui" : "") + "'" + (ap ? " data-azione='vedi-capitolo' data-capitolo='" + k.zona + "'" : "") + ">" +
        "<span class='numero'>" + (vi ? "⭐" : ap ? numero(k) : "🔒") + "</span>" +
        "<span class='nome'><b>" + C.esc(nomeCapitolo(k)) + "</b><small>" + (vi ? "Tutti salvi!" : ap ? liberi(k) + " amici liberi su " + amiciDi(k).length : "Avvolta dai nuvoloni") + "</small></span>" +
        "<span class='mini'>" + amiciDi(k).map(function (a) { return "<i class='" + (libero(a) ? "si" : "") + "' style='background-image:url(" + immagineChiwi(a.colore, "felice") + ")'></i>"; }).join("") + "</span></button>";
    });
    html += "<div class='tappa finale" + (fine ? " vinta" : "") + "'><span class='numero'>" + (fine ? "🌈" : "🏰") + "</span><span class='nome'><b>Il Castello delle nuvole</b><small>" + (fine ? "Il Nebbione è diventato buono!" : "La battaglia finale") + "</small></span></div>";
    html += "</div>" + (TERRE_IN_ARRIVO.length ? "<h3 class='titoletto'>Le terre da scoprire</h3><p class='nota'>Il Giardino magico è grande: queste terre le stiamo ancora dipingendo.</p><div class='terre-arrivo'>" +
      TERRE_IN_ARRIVO.map(function (t) { return "<span>🎨 " + C.esc(t) + "</span>"; }).join("") + "</div>" : "") +
      "<div class='azioni-pannello'><button class='btn bianco' data-azione='rileggi-storia'>🎬 Rivedi il cartone</button></div>";
    C.apriPannello(html);
    vestiTutti($("pannello-corpo"));
  }

  function terraHtml(c) {
    var s = dati(), v = vinto(c), d = dopo(c);
    var html = "<div class='capitolo" + (v ? " vinto" : "") + "'><div class='capitolo-testa' style='background-image:url(" + ZONE[iZona(c.zona)].cartella + "finale.jpg)'>" +
      "<small>Terra " + numero(c) + "</small><b>" + C.esc(nomeCapitolo(c)) + "</b></div>" +
      "<p class='capitolo-arrivo'>" + C.esc(tuttiLiberi(c) ? c.fine : c.arrivo) + "</p>";
    // gli amici da liberare
    html += "<div class='passo" + (tuttiLiberi(c) ? " fatto" : "") + "'><h4><i>1</i> Libera gli amici <span>" + liberi(c) + "/" + amiciDi(c).length + "</span></h4><div class='bolle-amici'>";
    amiciDi(c).forEach(function (a) {
      var li = libero(a), basta = s.missione.lucine >= a.lucine;
      html += "<div class='amico-bolla" + (li ? " libero" : basta ? " prossimo" : " chiuso") + "' data-amico='" + a.id + "'>" +
        "<div class='bolla-nebbia'>" + htmlChiwi(a) + (li ? "" : "<img class='bolla-img' src='img/nebbione/bolla.png' alt=''>") + "</div>" +
        "<b>" + C.esc(a.nome) + "</b>" +
        (li ? "<small>È liber" + (a.femmina ? "a" : "o") + "!</small>" :
          "<button class='btn piccolo" + (basta ? " verde" : " bianco") + "' data-azione='libera' data-amico='" + a.id + "'>Libera · " + a.lucine + " ✨</button>") +
        "</div>";
    });
    html += "</div>" + (tuttiLiberi(c) ? "" : "<p class='nota'>Le lucine magiche ✨ si guadagnano giocando ai minigiochi: una per ogni bella partita, due se è perfetta.</p>" +
      "<div class='azioni-pannello'><button class='btn piccolo' data-azione='apri-giochi'>Gioca e prendi le lucine</button></div>") + "</div>";
    // il sentiero verso la terra dopo
    html += v ? "<div class='sfida-finale vinta'>⭐ " + (c.finale ? "Battaglia vinta!" : "Sentiero fatto: " + C.esc(d ? nomeCapitolo(d) : "") + " è aperta.") + "</div>" :
      "<button class='sfida-finale" + (pronto(c) ? " pronta" : "") + "'" + (pronto(c) ? " data-azione='gioca' data-chiave='sfida' data-capitolo='" + c.zona + "'" : " disabled") + ">" + nebbione() +
      "<span><b>" + C.esc(nomeSentiero(c)) + "</b><small>" + (pronto(c) ? (c.finale ? "Tutti gli amici sono pronti: andiamo!" : "Corri fino alla terra dopo, il Nebbione ti insegue!") : "Si apre quando hai liberato tutti gli amici") + "</small></span></button>";
    return html + "</div>";
  }

  function libera(id) {
    var s = dati(), a = AMICI.filter(function (x) { return x.id === id; })[0];
    if (!a || libero(a)) return;
    var c = capitoloDi(a.zona); if (!c || !aperto(c)) return;
    if (s.missione.lucine < a.lucine) { C.avviso("Servono " + a.lucine + " lucine ✨: giocando ai minigiochi le guadagni!", 2800); return; }
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
      var tutti = tuttiLiberi(c);
      C.apriPannello("<div class='centro liberato'><div class='amico-grande'>" + htmlChiwi(a) + "</div>" +
        "<h2>" + C.esc(a.nome) + (a.femmina ? " è libera!" : " è libero!") + "</h2><p class='fumetto'>Wii-chu! Grazie, " + C.esc(s.bambino || "amico") + "! Resto qui " +
        (a.zona === "radura" ? "nella Radura" : "in " + C.esc(nomeZona(a.zona))) + ". Tieni, un regalo per te!</p>" +
        "<p><b>" + C.esc(regalo) + "</b></p>" +
        (tutti ? "<p><b>Hai liberato tutti gli amici " + C.esc(diTerra(nomeCapitolo(c))) + "!</b> Ora si parte: " + C.esc(nomeSentiero(c)) + ".</p>" : "") +
        "<div class='azioni-pannello'><button class='btn verde' data-azione='apri-missione'>" + (tutti ? "Si parte!" : "Continua") + "</button></div></div>");
      vestiTutti($("pannello-corpo"));
    }, 900);
  }

  // ---------- alla fine del sentiero: il forziere ----------
  function vittoria(zona) {
    var s = dati(), c = capitoloDi(zona);
    if (!c || vinto(c)) return;
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
    C.apriPannello("<div class='centro forziere-box'><h2>" + (c.finale ? "Il grande forziere!" : "Il forziere del sentiero!") + "</h2>" +
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
  // dopo il forziere si arriva nella terra nuova
  function dopoForziere(zona) {
    var c = capitoloDi(zona); C.chiudiPannello();
    if (c) C.guadagnaXp(c.finale ? 200 : 80);   // qui, così il pannello del livello nuovo non copre il forziere
    var d = c && !c.finale ? dopo(c) : null;
    if (!d) { apri(); return; }
    dati().viaggio.visti.push(d.zona);
    // sulla mappa i nuvoloni si diradano e il lucchetto si apre, poi si entra nella terra nuova
    Mappa.apri({ sblocca: d.zona, poi: function () { C.vaiZona(d.zona); setTimeout(function () { arrivo(d, true); }, 400); } });
  }

  // ---------- il film: scene a tutto schermo che si muovono da sole ----------
  // ogni scena: img, testo, buio (sfondo scuro), moto (zoom, destra, sinistra, su), nebbia (true: nebbia che passa, "via": nebbia che si dirada),
  // amici (Chiwinnie da far comparire), arcobaleno (la scena finale), ultima (testo del bottone finale),
  // temporale (il cielo si scurisce e arrivano i nuvoloni), grigio (colori rubati), pioggia, nuvolone, rapiti (gli amici volano via),
  // dissolvi (un'altra immagine che compare piano piano sopra la prima).
  function film(scene, poi) {
    var box = document.createElement("div");
    box.id = "racconto"; box.className = "film";
    document.getElementById("app").appendChild(box);
    var i = 0, timer = null, finito = false;
    function scena() {
      clearTimeout(timer);
      var p = scene[i], ritaglio = /\.png$/.test(p.img || "");
      box.className = "film" + (p.buio ? " buio" : "");
      box.innerHTML = "<div class='racconto-quadro " + (ritaglio ? "ritaglio" : "moto-" + (p.moto || ["zoom", "destra", "sinistra", "su"][i % 4])) +
        (p.temporale ? " temporale" : "") + (p.grigio ? " grigio" : "") + (p.rapiti ? " rapiti" : "") + "'>" +
        (p.arcobaleno ? arcobalenoHtml() : "<img src='" + p.img + "' alt=''>") +
        (p.dissolvi ? "<img class='dissolvenza' src='" + p.dissolvi + "' alt=''>" : "") +
        (p.temporale || p.pioggia ? "<div class='pioggia'></div>" : "") +
        (p.temporale || p.nuvolone ? "<div class='nuvoloni'><img src='img/nebbione/nebbione.png' alt=''><i></i><i></i><i></i></div>" : "") +
        (p.nebbia ? "<div class='nebbia-film" + (p.nebbia === "via" ? " via" : "") + "'><i></i><i></i><i></i></div>" : "") +
        (p.amici ? "<div class='film-amici'>" + p.amici.map(function (a, k) { return "<div style='--k:" + k + ";animation-delay:" + (0.6 + k * 0.25) + "s'>" + htmlChiwi(a) + "</div>"; }).join("") + "</div>" : "") +
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

  // il cartone iniziale: si vede prima di ogni cosa (prima di svegliare il Chiwinnie) e si può rivedere dal viaggio
  function racconta(nome, poi) {
    var chi = nome ? "<b>" + C.esc(nome) + "</b>" : "uno solo";
    var colore = (stato() && stato().colore) || "viola";
    film([
      { img: "img/zona1/finale.jpg", moto: "zoom", musica: "radura", testo: "C'era una volta il <b>Giardino magico dei Chiwinnie</b>, dove tanti Chiwinnie morbidi e colorati vivevano felici e contenti." },
      { img: "img/zona2/finale.jpg", moto: "destra", testo: "Il Giardino è un mondo fatto di tante terre: la Radura, il Ruscello, la foresta delle lucciole, il deserto dei fiori di cactus, le colline di panna, la città di pietre preziose…" },
      { img: "img/zona3/finale.jpg", moto: "su", testo: "…e ancora le isole fluttuanti, le terre del nord, i cappelli di fata. In ogni terra i Chiwinnie giocavano, ridevano e guardavano le lucciole insieme." },
      { img: "img/castello/rosa.jpg", moto: "castello", testo: "Lassù nel cielo c'era il <b>Castello delle nuvole</b>, dove le nuvole rosa sono gentili e carine.", amici: AMICI.slice(0, 6) },
      { img: "img/castello/rosa.jpg", moto: "castello-fermo", temporale: true, dissolvi: "img/castello/temporale.jpg", musica: "notte", suono: "errore", durata: 6500,
        testo: "Ma proprio lì, all'improvviso, il cielo si scurì. Pesanti nuvoloni carichi di pioggia si addensarono sopra il castello…" },
      { img: "img/zona1/finale.jpg", moto: "zoom", grigio: true, pioggia: true, nuvolone: true, testo: "Il <b>Nebbione</b> e i suoi nuvoloni si rubarono tutti i colori, tutta la bellezza del Giardino…" },
      { img: "img/nebbione/storia.jpg", moto: "zoom", grigio: true, pioggia: true, amici: AMICI, rapiti: true, durata: 6500, testo: "…e infine si rubarono anche i Chiwinnie, chiusi in bolle di nebbia e nascosti in ogni terra." },
      { img: immagineChiwi(colore, "corsa1"), buio: true, testo: "Tutti… tranne " + chi + "." },
      { img: "img/lucciola.png", buio: true, testo: "Salva tutti i Chiwinnie con le <b>lucine magiche ✨</b> e riporta i colori nel Giardino magico!", ultima: nome ? "Andiamo!" : "Comincia!" }
    ], function () { var s = stato(); if (s) { dati(); s.missione.storia = true; C.salva(); } if (poi) poi(); });
  }
  function storia() { var s = stato(); C.chiudiPannello(); racconta(s && s.nome, function () { if (s) apri(); }); }

  // l'arrivo in una terra nuova
  function arrivo(c, giaVisto) {
    var s = dati();
    if (!giaVisto) { s.viaggio.visti.push(c.zona); C.salva(); }
    film([
      { img: ZONE[iZona(c.zona)].cartella + "finale.jpg", nebbia: true, moto: "zoom", testo: "<b>Terra " + numero(c) + " · " + C.esc(nomeCapitolo(c)) + "</b><br>" + C.esc(c.arrivo), amici: amiciDi(c), ultima: "Liberiamoli!" }
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
      { img: "img/castello/temporale.jpg", moto: "castello", pioggia: true, nuvolone: true, musica: "notte", suono: "errore", testo: "Sei arrivato al Castello delle nuvole, avvolto dai nuvoloni. Il Nebbione gonfia le guance: «Nessuno porterà i colori quassù!»" },
      { img: immagineChiwi(s.colore, "corsa1"), buio: true, testo: "Ma " + C.esc(s.nome) + " non è più solo. Da tutte le terre del Giardino arrivano di corsa gli amici liberati…" },
      { arcobaleno: true, buio: true, durata: 8500, musica: "nuvole", testo: "Tutti i Chiwinnie si prendono per la zampetta e insieme fanno un enorme <b>arcobaleno</b>, che investe il Nebbione!" },
      { img: "img/nebbione/nebbione_buono.png", testo: "I nuvoloni si diradano. Al posto del Nebbione c'è una nuvola rosa e buona: «Che colori! Non li avevo mai visti così da vicino…»" },
      { img: "img/castello/rosa.jpg", moto: "su", nebbia: "via", testo: "I colori tornano in tutto il Giardino magico! Il Castello delle nuvole è di nuovo rosa, e ogni sera tutti i Chiwinnie guardano le lucciole insieme.", amici: AMICI, ultima: "Che festa!" }
    ], poi);
  }

  // ---------- nel giardino: l'indicatore del viaggio e gli amici liberati ----------
  function disegna() {
    var s = stato(); if (!s || !$("btn-missione")) return;
    dati();
    var b = $("btn-missione"), c = capitoloCorrente(), fine = forziereAperto(s, "cielo");
    var a = prossimoAmico(), evidente = puoLiberare() || (c && pronto(c));
    b.classList.toggle("pronta", !!evidente);
    b.innerHTML = nebbione(fine) +
      (c ? "<span><small>" + C.esc(nomeCapitolo(c)) + "</small>" + C.esc(prossimoPasso(c)) + "</span><span class='lucine'>✨ " + (a ? Math.min(s.missione.lucine, a.lucine) + "/" + a.lucine : s.missione.lucine) + "</span>"
         : "<span>" + (fine ? "Giardino salvo! 🌈" : "Nuove terre in arrivo!") + "</span>") +
      "<span class='conta'>" + s.missione.liberati.length + "/" + AMICI.length + "</span>" + (evidente ? "<i class='pallino'></i>" : "");
    // le terre restano sempre a colori pieni (niente più effetto sbiadito)
    var n = $("nebbia-mondo"); if (n) n.style.opacity = 0;
    var sc = $("scena"); if (sc) sc.style.filter = "";
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
    dati(); disegna();
    // chi aveva già un Chiwinnie prima della missione vede la storia una volta, a tutto schermo
    if (document.getElementById("racconto")) return;
    if (!s.missione.storia) { s.missione.storia = true; setTimeout(function () { racconta(s.nome, function () { apri(); }); }, 900); return; }
    // la prima volta in una terra: la scena di arrivo
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
      else if (a === "rileggi-storia") storia();
    });
    passeggiata();
  }

  // il Chiwinnie ogni tanto pensa ai suoi amici
  function frase() {
    var s = stato(); if (!s) return null;
    var c = capitoloCorrente(), a = prossimoAmico(); if (!c) return null;
    if (pronto(c)) return c.finale ? "Tutti insieme al Castello delle nuvole!" : "Tutti liberi! Partiamo per la terra dopo!";
    if (puoLiberare()) return "Abbiamo abbastanza lucine! Liberiamo " + a.nome + "!";
    return scegli(["Mi manca " + a.nome + "… dove l'avrà portato il Nebbione?", "Giochiamo: ogni bella partita accende una lucina!", "Brrr, sento i nuvoloni là in fondo…", "Con le lucine apriamo le bolle di nebbia!"]);
  }

  window.Missione = {
    avvia: function (ctx) { C = ctx; collega(); if ($("s-mondo").classList.contains("attiva")) apriMondo(); },
    terre: { aperto: aperto, vinto: vinto, amiciDi: amiciDi, libero: libero, numero: numero, capitoloCorrente: capitoloCorrente, puoLiberare: puoLiberare, pronto: pronto },
    evento: evento, apri: apri, apriMondo: apriMondo, disegna: disegna, storia: storia, racconta: racconta, vittoria: vittoria, film: film,
    frase: frase, nebbione: nebbione, nomeSentiero: function (zona) { var c = capitoloDi(zona); return c ? nomeSentiero(c) : ""; }
  };
})();
