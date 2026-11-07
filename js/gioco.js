// Chiwinnie – Il Bosco Giardino
// Stato, imprinting, mondo da costruire, pannelli e sfide.
(function () {
  "use strict";

  var CHIAVE = "chiwinnie-gioco-v3";
  var CALO_ENERGIA_ORA = 5;          // l'energia scende piano anche quando non si gioca
  var RICARICA_CESTINO_ORA = 8;      // con il cestino dei fiori l'energia risale da sola
  var ENERGIA_PER_SPINACIO = 15;
  // i fiori sono il cibo speciale: meno energia, ma accendono l'energia dei fiori per un po'
  var PETALI_PER_FIORE = 3, ENERGIA_PER_FIORE = 10, DURATA_FIORI = 10 * 60 * 1000;

  // ---------- Utilità ----------
  function $(id) { return document.getElementById(id); }
  function scegli(a) { return a[Math.floor(Math.random() * a.length)]; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function vibra(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }

  function mostra(id) {
    document.querySelectorAll(".schermata").forEach(function (s) { s.classList.toggle("attiva", s.id === id); });
  }
  var timerToast;
  function avviso(msg, ms) { Suoni.sfx("errore"); toast(msg, ms); }
  function toast(msg, ms) {
    var t = $("toast"); t.textContent = msg; t.classList.add("su");
    clearTimeout(timerToast); timerToast = setTimeout(function () { t.classList.remove("su"); }, ms || 2400);
  }
  function coriandoli(x, y, simbolo, quanti) {
    for (var i = 0; i < (quanti || 6); i++) {
      var c = document.createElement("span");
      c.className = "coriandolo"; c.textContent = simbolo;
      c.style.left = (x - 20 + Math.random() * 40) + "px"; c.style.top = (y - 10 + Math.random() * 20) + "px";
      c.style.animationDelay = (i * 0.08) + "s";
      $("volanti").appendChild(c);
      setTimeout(function (el) { el.remove(); }, 1600, c);
    }
  }
  // Un'icona vola dal punto (x, y) al contatore del materiale in alto.
  function volaVerso(materiale, x, y) {
    var meta = document.querySelector('.risorsa[data-m="' + materiale + '"]');
    if (!meta) return;
    var r = meta.getBoundingClientRect();
    var img = document.createElement("img");
    img.src = MATERIALI[materiale].img; img.className = "volante";
    img.style.left = (x - 17) + "px"; img.style.top = (y - 17) + "px";
    $("volanti").appendChild(img);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { img.style.left = (r.left + 4) + "px"; img.style.top = (r.top + 2) + "px"; img.style.opacity = ".3"; });
    });
    setTimeout(function () { img.remove(); meta.classList.remove("salta"); void meta.offsetWidth; meta.classList.add("salta"); }, 820);
  }

  // ---------- Stato ----------
  var stato = null;
  function carica() { try { return JSON.parse(localStorage.getItem(CHIAVE)); } catch (e) { return null; } }
  function salva() { try { localStorage.setItem(CHIAVE, JSON.stringify(stato)); } catch (e) { /* senza memoria si gioca lo stesso */ } }

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function identitaDaChip(id) {
    var h = hash(id), hc = hash(id + ":cuore");
    return {
      id: id,
      fiore: FIORI[h % FIORI.length],
      carattere: CARATTERI[(h >>> 8) % CARATTERI.length],
      cuore: hc % 50 === 0 ? CUORE_RARO : CUORI[hc % CUORI.length]
    };
  }
  function nuovoCodice() {
    var c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "CHW-";
    for (var i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)];
    return s;
  }

  function livelloDa(xp) {
    var l = 1;
    while (l + 1 < LIVELLI_XP.length && xp >= LIVELLI_XP[l + 1]) l++;
    return l;
  }
  function aggiornaEnergia() {
    var adesso = Date.now();
    var ore = (adesso - stato.aggiornato) / 3600000;
    if (stato.costruiti && stato.costruiti.indexOf("cestino") !== -1) stato.energia = Math.min(100, stato.energia + ore * RICARICA_CESTINO_ORA);
    else stato.energia = Math.max(0, stato.energia - ore * CALO_ENERGIA_ORA);
    stato.aggiornato = adesso;
  }
  function brontolone() { return stato.energia < 20; }

  function puoPagare(costo) {
    return Object.keys(costo).every(function (m) { return (stato.materiali[m] || 0) >= costo[m]; });
  }
  function paga(costo) { Object.keys(costo).forEach(function (m) { stato.materiali[m] -= costo[m]; }); }
  function aggiungi(materiale, n) { stato.materiali[materiale] = (stato.materiali[materiale] || 0) + n; }

  function guadagnaXp(n) {
    var prima = stato.livello;
    stato.xp += n;
    stato.livello = livelloDa(stato.xp);
    if (stato.livello > prima) setTimeout(function () { livelloSuperato(stato.livello); }, 600);
  }
  function livelloSuperato(l) {
    var nuovi = [];
    ZONE.forEach(function (z) { if (z.pezzi) Object.keys(z.pezzi).forEach(function (k) { if (z.pezzi[k].livello === l) nuovi.push(z.pezzi[k].nome); }); });
    Object.keys(MINIGIOCHI).forEach(function (k) { if (MINIGIOCHI[k].livello === l) nuovi.push("il gioco " + MINIGIOCHI[k].nome); });
    apriPannello(
      "<div class='centro'><img src='img/stella.png' style='width:80px'><h2>Livello " + l + "!</h2>" +
      "<p>" + esc(stato.nome) + " è felicissimo: Wonni-wonni!</p>" +
      (nuovi.length ? "<p><b>Hai sbloccato:</b> " + nuovi.map(esc).join(", ") + "</p>" : "") +
      "<div class='azioni-pannello'><button class='btn' data-azione='chiudi'>Evviva!</button></div></div>"
    );
    coriandoli(window.innerWidth / 2, window.innerHeight / 2, "⭐", 10);
    vibra([40, 60, 40]);
    Suoni.sfx("livello");
    setTimeout(function () { Suoni.dici("Wii-chu!"); }, 900);
  }

  // ---------- Imprinting ----------
  var bozza = null;

  function iniziaImprinting(id) { bozza = identitaDaChip(id); preparaColori(); mostra("s-colore"); }
  $("btn-scan").addEventListener("click", function () { iniziaImprinting(nuovoCodice()); });

  function mostraColore(colore) {
    document.querySelectorAll("img[data-chiwi]").forEach(function (im) { im.src = immagineChiwi(colore, im.dataset.chiwi); });
  }
  function preparaColori() {
    $("scelta-colori").innerHTML = COLORI_CHIWI.map(function (c) {
      return "<button data-colore='" + c.id + "'><img src='" + immagineChiwi(c.id, "fronte") + "' alt=''>" + c.nome + "</button>";
    }).join("");
  }
  $("scelta-colori").addEventListener("click", function (e) {
    var b = e.target.closest("[data-colore]");
    if (!b) return;
    document.querySelectorAll("#scelta-colori button").forEach(function (x) { x.classList.toggle("scelto", x === b); });
    var c = COLORI_CHIWI.filter(function (x) { return x.id === b.dataset.colore; })[0];
    bozza.colore = c.id;
    $("nota-colore").textContent = "I Chiwinnie " + c.nome.toLowerCase() + " di solito sono " + c.carattere + ".";
    $("btn-colore").disabled = false;
    Suoni.sfx("magia");
  });
  $("btn-colore").addEventListener("click", function () {
    if (!bozza.colore) return;
    mostraColore(bozza.colore);
    mostra("s-risveglio");
  });

  (function abbraccio() {
    var anello = $("anello"), prog = $("anello-prog"), testo = $("anello-testo");
    var DURATA = 2200, CIRC = 276.5, inizio = 0, timer = null, fatto = false;
    function passo() {
      var p = Math.min(1, (Date.now() - inizio) / DURATA);
      prog.style.strokeDashoffset = CIRC * (1 - p);
      $("fumetto-risveglio").textContent = p > .75 ? "Tum-tum… tum-tum…" : p > .35 ? "Mmm…?" : "zzz… zzz…";
      if (p >= 1) {
        clearInterval(timer); fatto = true; testo.innerHTML = "✨<br>Si è svegliato!"; vibra([60, 80, 60]); Suoni.sfx("magia");
        setTimeout(function () { mostra("s-nome"); Suoni.dici("Chiii… winni?"); }, 900);
      }
    }
    anello.addEventListener("pointerdown", function (e) {
      e.preventDefault(); if (fatto) return;
      inizio = Date.now(); clearInterval(timer); timer = setInterval(passo, 30); testo.innerHTML = "💗<br>Continua…";
    });
    function su() {
      if (fatto) return;
      clearInterval(timer); prog.style.strokeDashoffset = CIRC; testo.innerHTML = "🤗<br>Tieni premuto"; $("fumetto-risveglio").textContent = "zzz… zzz…";
    }
    ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { anello.addEventListener(ev, su); });
    anello.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  })();

  $("btn-nome-bambino").addEventListener("click", function () {
    var n = $("nome-bambino").value.trim();
    if (!n) { avviso("Scrivi il tuo nome!"); return; }
    bozza.bambino = n;
    $("fumetto-patto").textContent = "Ciao " + n + "! Facciamo il patto delle zampette?";
    mostra("s-patto");
  });
  $("btn-patto").addEventListener("click", function (e) {
    vibra(120); coriandoli(e.clientX, e.clientY, "💗", 6); Suoni.sfx("coccola"); Suoni.dici("Pum-pum winni!");
    $("fumetto-patto").textContent = "Pum-pum winni! Adesso ci conosciamo!";
    setTimeout(function () { mostra("s-nome-chiwi"); }, 1100);
  });
  $("btn-nome-chiwi").addEventListener("click", function () {
    var n = $("nome-chiwi").value.trim();
    if (!n) { avviso("Scegli un nome per il tuo Chiwinnie!"); return; }
    bozza.nome = n;
    mostra("s-cuore");
    var cuore = $("cuore-riv");
    cuore.querySelector("path").setAttribute("fill", bozza.cuore.hex);
    setTimeout(function () { cuore.classList.add("visibile"); vibra(80); Suoni.sfx("magia"); }, 900);
    setTimeout(function () { Suoni.sfx("livello"); }, 1700);
    setTimeout(function () {
      $("testo-cuore").innerHTML =
        "<h2>" + esc(bozza.nome) + " ha il cuore " + bozza.cuore.nome + "!</h2>" +
        (bozza.cuore.raro ? "<p><b>Un cuore d'oro! Succede rarissimamente.</b></p>" : "") +
        "<p>Il suo fiore preferito è la <b>" + bozza.fiore + "</b> e ha un carattere <b>" + bozza.carattere + "</b>.</p>" +
        "<p>I nuvoloni del Nebbione si sono rubati i colori e tutti i suoi amici. Gioca, guadagna le lucine magiche ✨ e liberali, terra dopo terra!</p>" +
        "<button class='btn' id='btn-entra'>Andiamo nella radura!</button>";
      $("btn-entra").addEventListener("click", completaImprinting);
    }, 2300);
  });

  function completaImprinting() {
    var adesso = Date.now();
    stato = {
      versione: 3, id: bozza.id, nome: bozza.nome, bambino: bozza.bambino, colore: bozza.colore || "viola",
      fiore: bozza.fiore, carattere: bozza.carattere, cuore: bozza.cuore, nato: adesso,
      energia: 80, aggiornato: adesso, xp: 0, livello: 1,
      materiali: JSON.parse(JSON.stringify(MATERIALI_INIZIALI)),
      zona: "radura", costruiti: [], prod: {}, zoneComplete: [],
      sfideFatte: 0, sfidaDaRitirare: [],
      missione: { lucine: 0, liberati: [], storia: true, racconto4: true },
      record: { raccolta: 0, lucciole: 0, memoryMosse: 0, boscoCompleto: 0, boscoStelle: 0 },
      contatori: { raccolti: 0, pasti: 0, coccole: 0, memoryCompleti: 0, partite: 0 }
    };
    salva();
    apriMondo();
    setTimeout(function () {
      parla("Wii-chu! Costruiamo una casetta, poi salviamo i miei amici!", 4500);
      toast("Tocca 🏡 Arreda per iniziare", 3500);
    }, 800);
  }

  // ---------- Mondo: un quadro che si completa pezzo per pezzo ----------
  var mondo = $("mondo"), scena = $("scena");
  var PROPORZIONE = 1080 / 1934;   // larghezza / altezza del quadro
  var pan = null;                  // spostamento orizzontale della scena (px, sempre <= 0)

  // le terre nuove non hanno le icone a parte: si usa il disegno dell'arredo, che è già piccolo
  function iconaPezzo(z, k) { return z.cartella + (z.senzaIcone ? "" : "icone/") + k + ".png"; }
  function zonaCorrente() { return ZONE.filter(function (z) { return z.id === stato.zona; })[0] || ZONE[0]; }
  function fatto(k) { return stato.costruiti.indexOf(k) !== -1; }
  function totalePezzi(z) { return Object.keys(z.pezzi).length; }
  function costruitiIn(z) { return Object.keys(z.pezzi).filter(fatto).length; }

  // La scena copre lo schermo; se è più larga si può scorrere col dito.
  function adattaScena() {
    var vw = mondo.clientWidth, vh = mondo.clientHeight;
    var h = vh, w = h * PROPORZIONE;
    if (w < vw) { w = vw; h = w / PROPORZIONE; }
    scena.style.width = w + "px"; scena.style.height = h + "px";
    scena.style.top = Math.min(0, vh - h) / 2 + "px";
    var minPan = vw - w;
    if (pan === null) pan = minPan / 2;
    pan = Math.min(0, Math.max(minPan, pan));
    scena.style.left = pan + "px";
  }
  window.addEventListener("resize", function () { if (stato) adattaScena(); });

  var trascina = null;
  mondo.addEventListener("pointerdown", function (e) { trascina = { x: e.clientX, pan: pan, mosso: false }; });
  mondo.addEventListener("pointermove", function (e) {
    if (!trascina) return;
    var dx = e.clientX - trascina.x;
    if (Math.abs(dx) > 8) trascina.mosso = true;
    if (trascina.mosso) { pan = trascina.pan + dx; adattaScena(); }
  });
  window.addEventListener("pointerup", function () { setTimeout(function () { trascina = null; }, 0); });

  function apriMondo() {
    mostra("s-mondo");
    var z = zonaCorrente();
    Suoni.musica(new Date().getHours() >= 20 || new Date().getHours() < 7 ? "notte" : (z.musica || "radura"));
    aggiornaEnergia();
    if ($("sfondo").getAttribute("src") !== z.sfondo) $("sfondo").setAttribute("src", z.sfondo);
    $("chiwi-img").src = immagineChiwi(stato.colore, "fronte");
    Casa.aggiornaLook();
    adattaScena();
    Missione.apriMondo();
    disegnaTutto();
    if (!chiwiPos) { var pr = prati()[0]; chiwiPos = { x: (pr.x1 + pr.x2) / 2, y: (pr.y1 + pr.y2) / 2 }; }
    posizionaChiwi(chiwiPos.x, chiwiPos.y, true);
  }

  function disegnaTutto() {
    disegnaPezzi();
    disegnaHud();
    controllaSfide();
    Missione.disegna();
    var ora = new Date().getHours();
    mondo.classList.toggle("notte", ora >= 20 || ora < 7);
    salva();
  }

  function pronti(k) {
    var p = zonaCorrente().pezzi[k];
    if (!p.produce || !fatto(k)) return 0;
    return Math.min(p.produce.max, Math.floor((Date.now() - stato.prod[k]) / p.produce.ogni));
  }

  function disegnaPezzi(nuovo) {
    var z = zonaCorrente(), box = $("pezzi"), bolle = $("bolle");
    var chiavi = Object.keys(z.pezzi).sort(function (a, b) {
      var pa = z.pezzi[a].pos, pb = z.pezzi[b].pos;
      return (pa[1] + pa[3]) - (pb[1] + pb[3]);
    });
    chiavi.forEach(function (k, i) {
      var p = z.pezzi[k], el = box.querySelector('[data-k="' + k + '"]');
      if (fatto(k) && !el) {
        el = document.createElement("img");
        el.className = "pezzo" + (k === nuovo ? " nascita" : "");
        el.dataset.k = k; el.alt = "";
        el.src = z.cartella + k + ".png";
        el.style.left = p.pos[0] + "%"; el.style.top = p.pos[1] + "%";
        el.style.width = p.pos[2] + "%"; el.style.height = p.pos[3] + "%";
        el.style.zIndex = i + 1;
        box.appendChild(el);
      } else if (!fatto(k) && el) el.remove();
    });
    bolle.innerHTML = "";
    chiavi.forEach(function (k) {
      var p = z.pezzi[k], n = pronti(k);
      if (!n) return;
      var b = document.createElement("button");
      b.className = "bolla"; b.dataset.k = k;
      b.style.left = p.bolla[0] + "%"; b.style.top = p.bolla[1] + "%";
      b.innerHTML = "<img src='" + MATERIALI[p.produce.materiale].img + "' alt=''><b>" + n + "</b>";
      bolle.appendChild(b);
    });
    // ogni 3 minuti cade una stellina nel prato: basta toccarla
    var sc = stato.stellaCadente;
    if (!sc) sc = stato.stellaCadente = { t: Date.now() + STELLA_OGNI };
    if (Date.now() >= sc.t) {
      if (sc.x == null || sc.zona !== z.id) { var pr = z.prato || z.prati[Math.floor(Math.random() * z.prati.length)]; sc.zona = z.id; sc.x = pr.x1 + Math.random() * (pr.x2 - pr.x1); sc.y = pr.y1 + Math.random() * (pr.y2 - pr.y1); }
      var st = document.createElement("button");
      st.className = "bolla stellina"; st.dataset.k = "stella";
      st.style.left = sc.x + "%"; st.style.top = sc.y + "%";
      st.innerHTML = "<img src='img/stella.png' alt='Una stella'>";
      bolle.appendChild(st);
    }
  }

  function disegnaHud() {
    $("hud-nome").textContent = stato.nome;
    $("hud-livello").textContent = stato.livello;
    $("btn-casa").hidden = stato.costruiti.indexOf("casetta") === -1;
    var base = LIVELLI_XP[stato.livello], prossimo = LIVELLI_XP[stato.livello + 1] || (base + 400);
    $("barra-xp").style.width = Math.min(100, (stato.xp - base) / (prossimo - base) * 100) + "%";
    var en = $("barra-energia");
    en.style.width = Math.round(stato.energia) + "%";
    en.style.background = stato.energia < 20 ? "#e2504c" : stato.energia < 45 ? "#e8b64a" : "";
    $("avatar-img").src = immagineChiwi(stato.colore, brontolone() ? "brontolone" : stato.energia > 85 ? "felice" : "coccolone");
    $("risorse").innerHTML = ORDINE_MATERIALI.map(function (m) {
      return "<div class='risorsa' data-m='" + m + "'><img src='" + MATERIALI[m].img + "' alt='" + MATERIALI[m].nome + "'>" + (stato.materiali[m] || 0) + "</div>";
    }).join("");
    $("pallino-sfide").hidden = stato.sfidaDaRitirare.length === 0;
    var fa = fioriAttivi();
    chiwi.classList.toggle("radioso", !!fa);
    $("btn-avatar").classList.toggle("radioso", !!fa);
    $("hud-fiori").hidden = !fa;
    if (fa) $("hud-fiori").textContent = "✨ " + formatoTempo(stato.fioriFino - Date.now());
  }

  // Coordinate del tocco in % del quadro
  function percentuale(e) {
    var r = scena.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 };
  }
  function dentro(p, r) { return p.x >= r[0] && p.x <= r[2] && p.y >= r[1] && p.y <= r[3]; }
  function pezzoSotto(p) {
    var z = zonaCorrente(), trovato = null;
    Object.keys(z.pezzi).forEach(function (k) {
      if (fatto(k) && z.pezzi[k].tocco.some(function (r) { return dentro(p, r); })) trovato = k;
    });
    return trovato;
  }
  // il Chiwinnie cammina solo sul prato libero
  // una zona può avere più prati (per esempio le due rive del ruscello)
  function prati() { var z = zonaCorrente(); return z.prati || [z.prato]; }
  function dentroPrato(p, a) { return p.x >= a.x1 && p.x <= a.x2 && p.y >= a.y1 && p.y <= a.y2; }
  function puntoLibero(p) {
    return prati().some(function (a) { return dentroPrato(p, a); }) && !pezzoSotto(p);
  }
  function zonaAperta(i) { return zonaApertaIn(stato, i); }
  function vaiZona(id) {
    stato.zona = id; chiwiPos = null; pan = null;
    $("pezzi").innerHTML = ""; $("bolle").innerHTML = "";
    chiudiPannello();
    apriMondo();
    var z = zonaCorrente();
    setTimeout(function () { esclama("Chirri-wà!", costruitiIn(z) ? "che bello tornare qui!" : "un posto nuovo!"); }, 700);
    salva();
  }

  mondo.addEventListener("click", function (e) {
    if (trascina && trascina.mosso) return;
    var bolla = e.target.closest(".bolla");
    if (bolla) { raccogli(bolla.dataset.k, e); return; }
    if (e.target.closest("#chiwi")) { coccola(e); return; }
    var p = percentuale(e), k = pezzoSotto(p);
    if (k) { apriPannelloPezzo(k); return; }
    if (puntoLibero(p) && !brontolone()) { posizionaChiwi(p.x, p.y); Suoni.sfx("passo"); }
  });

  function raccogli(k, e) {
    if (k === "stella") {
      stato.stellaCadente = { t: Date.now() + STELLA_OGNI };
      aggiungi("stelle", 1);
      volaVerso("stelle", e.clientX, e.clientY);
      toast("⭐ Una stella caduta dal cielo! +1 stella");
      vibra(30); Suoni.sfx("stella");
      disegnaTutto(); salva();
      return;
    }
    var p = zonaCorrente().pezzi[k], n = pronti(k);
    if (!n) return;
    aggiungi(p.produce.materiale, fioriAttivi() ? n * 2 : n);
    if (fioriAttivi()) toast("✨ Energia dei fiori: raccolto doppio!");
    // il tempo avanzato oltre l'ultimo pezzo non si perde, tranne quando la produzione era ferma al massimo
    stato.prod[k] = n >= p.produce.max ? Date.now() : stato.prod[k] + n * p.produce.ogni;
    stato.contatori.raccolti++;
    Missione.evento("raccolto");
    for (var i = 0; i < Math.min(n, 4); i++) setTimeout(volaVerso, i * 120, p.produce.materiale, e.clientX, e.clientY);
    vibra(30);
    Suoni.sfx("raccogli");
    disegnaTutto();
  }

  function apriPannelloPezzo(k) {
    var z = zonaCorrente(), p = z.pezzi[k];
    var html = "<div class='centro'><img src='" + iconaPezzo(z, k) + "' style='height:120px;max-width:100%;object-fit:contain'><h2>" + esc(p.nome) + "</h2><p>" + esc(p.descrizione) + "</p>";
    if (p.produce) {
      var resto = p.produce.ogni - ((Date.now() - stato.prod[k]) % p.produce.ogni);
      html += "<p><b>Produce:</b> 1 <img src='" + MATERIALI[p.produce.materiale].img + "' style='width:22px;vertical-align:middle'> ogni " +
        Math.round(p.produce.ogni / MINUTO) + " minuti (massimo " + p.produce.max + "). Il prossimo tra " + formatoTempo(resto) + ".</p>";
    }
    if (p.ricarica) html += "<p><b>Ricarica:</b> " + esc(stato.nome) + " recupera energia da solo, anche quando non giochi.</p>";
    html += "<div class='azioni-pannello'>" + (k === "casetta" ? "<button class='btn verde' data-azione='entra-casa'>🏠 Entra in casa</button>" : "") +
      "<button class='btn' data-azione='chiudi'>Che bello!</button></div></div>";
    apriPannello(html);
  }
  function formatoTempo(ms) {
    var s = Math.ceil(ms / 1000), m = Math.floor(s / 60);
    return m + ":" + String(s % 60).padStart(2, "0");
  }

  function costruisci(k) {
    var z = zonaCorrente(), p = z.pezzi[k];
    if (fatto(k)) return;
    if (stato.livello < p.livello) { avviso("Si sblocca al livello " + p.livello + ". Gioca e completa le sfide per salire!", 2800); return; }
    if (p.richiede && !fatto(p.richiede)) { avviso("Prima serve: " + z.pezzi[p.richiede].nome); return; }
    if (!puoPagare(p.costo)) { avviso("Ti mancano dei materiali: guadagnali con i giochi!", 2800); return; }
    paga(p.costo);
    stato.costruiti.push(k);
    stato.prod[k] = Date.now();
    chiudiPannello();
    disegnaPezzi(k);
    guadagnaXp(p.xp);
    disegnaTutto();
    // scintille al centro del pezzo appena comparso
    var r = scena.getBoundingClientRect();
    var cx = r.left + (p.pos[0] + p.pos[2] / 2) / 100 * r.width, cy = r.top + (p.pos[1] + p.pos[3] / 2) / 100 * r.height;
    coriandoli(cx, cy, "✨", 10);
    setTimeout(function () { coriandoli(cx, cy - 20, "🌸", 6); }, 400);
    vibra(50);
    Suoni.sfx("costruisci");
    setTimeout(function () { Suoni.sfx("magia"); esclama("Nimmi-nimmi!", "Che bello!"); }, 700);
    toast(p.nome + "! +" + p.xp + " esperienza");
    Missione.evento("costruito");
    if (costruitiIn(z) === totalePezzi(z)) setTimeout(zonaCompletata, 2200);
  }

  function zonaCompletata() {
    var i = ZONE.indexOf(zonaCorrente()), prossima = ZONE[i + 1];
    if (stato.zoneComplete.indexOf(zonaCorrente().id) === -1) { stato.zoneComplete.push(zonaCorrente().id); aggiungi("stelle", 5); }
    salva();
    apriPannello(
      "<div class='centro'><img src='img/stella.png' style='width:90px'><h2>" + esc(zonaCorrente().nome) + " è completa!</h2>" +
      "<p>" + esc(stato.nome) + " non ha mai visto un posto così bello. Wonni-wonni!</p>" +
      (!prossima ? "<p><b>Hai arredato tutto il Bosco Giardino, dalla radura fino al cielo!</b> Ora il Chiwinnie Celeste ha un posto dove tornare.</p>" : "") +
      (prossima && zonaAperta(i + 1) ? "<div class='azioni-pannello'><button class='btn bianco' data-azione='chiudi'>Resto qui</button><button class='btn' data-azione='vai-zona' data-zona='" + prossima.id + "'>Vai a " + esc(prossima.nome) + "</button></div></div>"
        : "<p>Il quadro è tutto arredato: che meraviglia! Regalo: +5 ⭐</p><div class='azioni-pannello'><button class='btn' data-azione='apri-missione'>Il viaggio</button></div></div>")
    );
    coriandoli(window.innerWidth / 2, window.innerHeight / 2, "⭐", 14);
    Suoni.sfx("livello");
    setTimeout(function () { Suoni.dici("Wonni-wonni!"); }, 900);
  }

  // ---------- Il Chiwinnie nella radura ----------
  var chiwi = $("chiwi"), chiwiPos = null, timerFumetto, timerPasseggio;
  function posizionaChiwi(x, y, subito) {
    // si resta nel prato più vicino al punto scelto
    var a = prati().slice().sort(function (m, n) {
      function d(q) { var cx = Math.max(q.x1, Math.min(q.x2, x)), cy = Math.max(q.y1, Math.min(q.y2, y)); return (cx - x) * (cx - x) + (cy - y) * (cy - y); }
      return d(m) - d(n);
    })[0];
    x = Math.max(a.x1, Math.min(a.x2, x));
    y = Math.max(a.y1, Math.min(a.y2, y));
    if (chiwiPos && !subito) {
      // cammina di profilo alternando le due pose di corsa, poi si gira di nuovo verso di noi
      chiwi.classList.toggle("sinistra", x < chiwiPos.x);
      chiwi.classList.add("cammina");
      var passo = 0, img = $("chiwi-img");
      clearInterval(chiwi._passi);
      chiwi._passi = setInterval(function () { img.src = immagineChiwi(stato.colore, passo++ % 2 ? "corsa2" : "corsa1"); }, 160);
      clearTimeout(chiwi._stop);
      chiwi._stop = setTimeout(function () {
        clearInterval(chiwi._passi); chiwi._passi = null;
        chiwi.classList.remove("cammina", "sinistra");
        img.src = immagineChiwi(stato.colore, "fronte");
      }, 2200);
    }
    if (subito) { chiwi.style.transition = "none"; requestAnimationFrame(function () { chiwi.style.transition = ""; }); }
    chiwiPos = { x: x, y: y };
    chiwi.style.left = x + "%"; chiwi.style.top = y + "%";
    chiwi.style.zIndex = Math.round(y * 10) + 1;
  }
  // Il Chiwinnie dice ad alta voce una parola in chiwinnese; nel fumetto c'è anche la traduzione.
  function esclama(chiwinnese, italiano, ms) {
    var f = $("fumetto-mondo");
    f.textContent = chiwinnese + (italiano ? " (" + italiano + ")" : ""); f.classList.add("su");
    Suoni.dici(chiwinnese);
    clearTimeout(timerFumetto); timerFumetto = setTimeout(function () { f.classList.remove("su"); }, ms || 3000);
  }
  var ESCLAMAZIONI = [["Wii-chu!", "Ciao!"], ["Nimmi-nimmi!", "Che bello!"], ["Wonni-wonni!", "Ho tanta energia!"], ["Pum-pum winni!", "Siamo amici!"]];
  function parla(testo, ms) {
    var f = $("fumetto-mondo");
    f.textContent = testo; f.classList.add("su");
    Suoni.voce(testo);
    clearTimeout(timerFumetto); timerFumetto = setTimeout(function () { f.classList.remove("su"); }, ms || 2600);
  }
  function passeggia() {
    clearTimeout(timerPasseggio);
    timerPasseggio = setTimeout(passeggia, 6000 + Math.random() * 6000);
    if (!stato || !$("s-mondo").classList.contains("attiva")) return;
    aggiornaEnergia();
    if (brontolone()) { parla(scegli(FRASI.brontolone)); disegnaHud(); return; }
    var a = scegli(prati());
    for (var t = 0; t < 12; t++) {
      var p = { x: a.x1 + Math.random() * (a.x2 - a.x1), y: a.y1 + Math.random() * (a.y2 - a.y1) };
      if (puntoLibero(p)) { posizionaChiwi(p.x, p.y); break; }
    }
    if (Math.random() < .3) setTimeout(function () {
      var pensiero = Math.random() < .4 && Missione.frase();
      if (pensiero) parla(pensiero, 3200);
      else if (Math.random() < .4) { var e = scegli(ESCLAMAZIONI); esclama(e[0], e[1]); } else parla(scegli(FRASI.felice));
    }, 2300);
  }

  function coccola(e) {
    stato.contatori.coccole++;
    Missione.evento("coccola");
    coriandoli(e.clientX, e.clientY, "💗", 5);
    chiwi.classList.remove("salta"); void chiwi.offsetWidth; chiwi.classList.add("salta");
    vibra(25);
    Suoni.sfx("coccola");
    if (brontolone()) { parla("Le coccole mi piacciono… ma ho fame di spinaci!"); return; }
    if (stato.contatori.coccole % 3 === 0) esclama("Pum-pum winni!", "Siamo amici!"); else parla(scegli(FRASI.coccole));
    if (stato.contatori.coccole % 10 === 0) {
      aggiungi("petali", 1);
      setTimeout(function () { parla("Ti regalo un petalo!"); Suoni.sfx("raccogli"); volaVerso("petali", e.clientX, e.clientY); disegnaHud(); }, 700);
    }
    salva();
  }

  function fioriAttivi() { return stato && stato.fioriFino && Date.now() < stato.fioriFino; }
  function apriNutri() {
    aggiornaEnergia();
    var resto = fioriAttivi() ? formatoTempo(stato.fioriFino - Date.now()) : null;
    apriPannello(
      "<div class='centro'><h2>Che cosa gli dai?</h2><p>Energia di " + esc(stato.nome) + ": " + Math.round(stato.energia) + "/100</p></div>" +
      "<div class='griglia'>" +
      "<button class='voce' data-azione='mangia-spinaci'><img class='anteprima' src='img/spinaci.png' alt=''><h3>Spinaci</h3>" +
      "<div class='lucchetto'>Il cibo di tutti i giorni: +" + ENERGIA_PER_SPINACIO + " energia</div><div class='costo'><span><img src='img/spinaci.png' alt=''>1</span></div></button>" +
      "<button class='voce' data-azione='mangia-fiori'><img class='anteprima' src='img/petali.png' alt=''><h3>Fiori</h3>" +
      "<div class='lucchetto'>Energia speciale per 10 minuti: raccolto doppio nel giardino e +50% nei giochi</div><div class='costo'><span><img src='img/petali.png' alt=''>" + PETALI_PER_FIORE + "</span></div></button>" +
      "</div>" + (resto ? "<p class='nota centro'>✨ L'energia dei fiori è accesa ancora per " + resto + ".</p>" : "")
    );
  }
  function nutriFiori() {
    aggiornaEnergia();
    if ((stato.materiali.petali || 0) < PETALI_PER_FIORE) { avviso("Servono " + PETALI_PER_FIORE + " petali: le aiuole e i giochi te li danno!", 3000); return; }
    stato.materiali.petali -= PETALI_PER_FIORE;
    stato.energia = Math.min(100, stato.energia + ENERGIA_PER_FIORE);
    stato.fioriFino = Math.max(Date.now(), stato.fioriFino || 0) + DURATA_FIORI;
    stato.contatori.fiori = (stato.contatori.fiori || 0) + 1;
    chiudiPannello();
    Suoni.sfx("magia");
    var r = chiwi.getBoundingClientRect();
    coriandoli(r.left + r.width / 2, r.top + r.height / 3, "🌸", 8);
    setTimeout(function () { coriandoli(r.left + r.width / 2, r.top, "✨", 8); }, 300);
    esclama("Nimmi-nimmi!", "che profumo, mi sento magico!");
    vibra([30, 40, 30]);
    disegnaTutto();
  }
  function nutri() {
    aggiornaEnergia();
    if (stato.energia >= 98) { parla("Sono pienissimo! Wonni-wonni!"); return; }
    if (!stato.materiali.spinaci) {
      avviso("Non hai spinaci! Gioca alla Raccolta nel bosco o costruisci un orto.", 3200);
      parla("Grrr… niente spinaci?");
      return;
    }
    var eraBrontolone = brontolone();
    stato.materiali.spinaci--;
    stato.energia = Math.min(100, stato.energia + ENERGIA_PER_SPINACIO);
    stato.contatori.pasti++;
    Missione.evento("pasto");
    Suoni.sfx("pasto");
    var r = chiwi.getBoundingClientRect();
    coriandoli(r.left + r.width / 2, r.top + r.height / 3, "🥬", 4);
    if (eraBrontolone && !brontolone()) esclama("Gnam gnam! Wonni-wonni!", "sono tornato dolce come prima!");
    else esclama("Gnam gnam! Wonni-wonni!", "che buoni gli spinaci!");
    vibra(30);
    chiudiPannello();
    disegnaTutto();
  }
  $("btn-nutri").addEventListener("click", apriNutri);

  // ---------- Sfide ----------
  // le prossime tre sfide ancora da completare (in ordine), da mostrare nel pannello
  function sfideVisibili() {
    var lista = [], ritirate = stato.ritirate || [];
    var ordinate = SFIDE.map(function (s, i) { return i; }).sort(function (a, b) {
      var oa = SFIDE[a].ordine !== undefined ? SFIDE[a].ordine : a, ob = SFIDE[b].ordine !== undefined ? SFIDE[b].ordine : b;
      return oa - ob;
    });
    for (var n = 0; n < ordinate.length && lista.length < 3; n++) {
      var i = ordinate[n];
      if (ritirate.indexOf(i) === -1 && stato.sfidaDaRitirare.indexOf(i) === -1) lista.push(i);
    }
    return lista;
  }
  function controllaSfide() {
    // tutte le sfide si possono completare in qualunque momento, anche se non sono tra quelle in vista
    var ritirate = stato.ritirate || [];
    SFIDE.forEach(function (sf, i) {
      if (ritirate.indexOf(i) !== -1) return;
      if (stato.sfidaDaRitirare.indexOf(i) === -1 && SFIDE[i].verifica(stato)) {
        stato.sfidaDaRitirare.push(i);
        toast("⭐ Sfida completata: " + SFIDE[i].testo, 3000);
        Suoni.sfx("stella");
      }
    });
    $("pallino-sfide").hidden = stato.sfidaDaRitirare.length === 0;
  }
  function ritiraSfida(i) {
    var idx = stato.sfidaDaRitirare.indexOf(i);
    if (idx === -1) return;
    stato.sfidaDaRitirare.splice(idx, 1);
    aggiungi("stelle", SFIDE[i].stelle);
    guadagnaXp(SFIDE[i].xp);
    // Le sfide ritirate escono dalla lista: avanzano tutte quelle consecutive già fatte
    stato.ritirate = stato.ritirate || [];
    stato.ritirate.push(i);
    coriandoli(window.innerWidth / 2, window.innerHeight * .6, "⭐", 8);
    vibra(40);
    Suoni.sfx("magia");
    disegnaTutto();
    apriSfide();
  }

  // ---------- Pannelli ----------
  function apriPannello(html) {
    $("pannello-corpo").innerHTML = html;
    $("pannello").hidden = false; $("velo").hidden = false;
    $("pannello").scrollTop = 0;
  }
  function chiudiPannello() { $("pannello").hidden = true; $("velo").hidden = true; }
  $("velo").addEventListener("click", chiudiPannello);

  function htmlCosto(costo) {
    return "<div class='costo'>" + Object.keys(costo).map(function (m) {
      var manca = (stato.materiali[m] || 0) < costo[m];
      return "<span class='" + (manca ? "manca" : "") + "'><img src='" + MATERIALI[m].img + "' alt=''>" + costo[m] + "</span>";
    }).join("") + "</div>";
  }

  function apriCostruisci() {
    var z = zonaCorrente(), n = costruitiIn(z), tot = totalePezzi(z);
    var html = "<h2>Arreda: " + esc(z.nome) + "</h2>" +
      "<div class='barra' style='height:12px;margin:8px 0 4px'><div style='width:" + (n / tot * 100) + "%'></div></div>" +
      "<p class='nota' style='margin-top:0'>" + n + " pezzi su " + tot + ". Ogni pezzo ha già il suo posto nel quadro: scegli tu in che ordine farli comparire.</p><div class='griglia'>";
    var chiavi = Object.keys(z.pezzi).sort(function (a, b) {
      var fa = fatto(a) ? 1 : 0, fb = fatto(b) ? 1 : 0;
      return fa - fb || z.pezzi[a].livello - z.pezzi[b].livello;
    });
    chiavi.forEach(function (k) {
      var p = z.pezzi[k], giaFatto = fatto(k), bloccato = stato.livello < p.livello, manca = p.richiede && !fatto(p.richiede);
      var stato_ = giaFatto ? "<div class='lucchetto fatto'>✓ Fatto</div>"
        : bloccato ? "<div class='lucchetto'>Livello " + p.livello + "</div>"
        : manca ? "<div class='lucchetto'>Prima: " + esc(z.pezzi[p.richiede].nome) + "</div>"
        : htmlCosto(p.costo);
      html += "<button class='voce" + (giaFatto ? " fatta" : bloccato || manca ? " bloccata" : "") + "' data-azione='costruisci' data-chiave='" + k + "'>" +
        "<img class='anteprima' src='" + iconaPezzo(z, k) + "' alt=''><h3>" + esc(p.nome) + "</h3>" + stato_ + "</button>";
    });
    html += "</div><h3 style='margin-top:18px'>Le zone del Bosco Giardino</h3>";
    ZONE.forEach(function (zz, i) {
      var completa = stato.zoneComplete.indexOf(zz.id) !== -1, aperta = zonaAperta(i);
      var qui = zz.id === z.id, puoiAndare = aperta && zz.pezzi && !qui;
      html += "<div class='riga-sfida" + (completa ? " fatta" : "") + "'><div class='testo'>" + esc(zz.nome) +
        "<div class='nota'>" + esc(qui ? "Sei qui" + (completa ? " · completata!" : "") : completa ? "Completata!" : aperta ? (zz.inArrivo ? "Aperta! La stiamo dipingendo" : "Aperta") : "Si apre dopo la sfida finale: " + ZONE[i - 1].nome) + "</div></div>" +
        (puoiAndare ? "<button class='btn piccolo' data-azione='vai-zona' data-zona='" + zz.id + "'>Vai</button>" : "<div class='premio'>" + (completa ? "⭐" : aperta ? "🔓" : "🔒") + "</div>") + "</div>";
    });
    apriPannello(html);
  }

  function apriGiochi() {
    aggiornaEnergia();
    var html = "<h2>Giochi</h2><p>Ogni bella partita accende una <b>lucina magica ✨</b> (due se è perfetta): servono per liberare i Chiwinnie. Ogni gioco usa un po' dell'energia di " + esc(stato.nome) + ": se è stanco, dagli gli spinaci!</p><div class='griglia'>";
    Object.keys(MINIGIOCHI).forEach(function (k) {
      if (MINIGIOCHI[k].nascosto) return;
      var g = MINIGIOCHI[k], iz = g.zona ? ZONE.map(function (x) { return x.id; }).indexOf(g.zona) : 0;
      var chiusoZona = g.zona && !zonaAperta(iz), bloccato = stato.livello < g.livello || chiusoZona;
      html += "<button class='voce" + (bloccato ? " bloccata" : "") + "' data-azione='gioca' data-chiave='" + k + "'>" +
        "<img class='anteprima' src='" + g.img + "' alt=''><h3>" + esc(g.nome) + "</h3>" +
        (chiusoZona ? "<div class='lucchetto'>Si apre con " + esc(ZONE[iz].nome) + "</div>" : bloccato ? "<div class='lucchetto'>Livello " + g.livello + "</div>" : "<div class='costo'><span>" + (g.energia ? "⚡ " + g.energia : "senza energia") + "</span></div>") +
        "</button>";
    });
    html += "</div>";
    apriPannello(html);
  }

  // saltare una sfida costa qualche stella: una in più del premio
  function costoSalto(i) { return SFIDE[i].stelle + 1; }
  function saltaSfida(i) {
    var costo = costoSalto(i);
    if ((stato.materiali.stelle || 0) < costo) { avviso("Servono " + costo + " stelle per saltarla"); return; }
    aggiungi("stelle", -costo);
    stato.ritirate = stato.ritirate || [];
    stato.ritirate.push(i);
    Suoni.sfx("magia");
    salva(); disegnaTutto(); apriSfide();
  }
  function apriSfide() {
    controllaSfide();
    var html = "<h2>Sfide</h2><p>Completa le sfide per guadagnare stelle ed esperienza. Se una è troppo difficile puoi saltarla pagando qualche stella.</p>";
    // prima quelle completate da ritirare, poi le prossime tre da fare
    var vis = stato.sfidaDaRitirare.slice().sort(function (a, b) { return a - b; }).concat(sfideVisibili());
    if (!vis.length) html += "<p><b>Hai completato tutte le sfide! Presto ne arriveranno di nuove.</b></p>";
    vis.forEach(function (i) {
      var s = SFIDE[i], fatta = stato.sfidaDaRitirare.indexOf(i) !== -1, ritirata = (stato.ritirate || []).indexOf(i) !== -1;
      if (ritirata) return;
      var pr = !fatta && s.progresso ? s.progresso(stato) : null;
      html += "<div class='riga-sfida" + (fatta ? " fatta" : "") + "'><div class='testo'>" + esc(s.testo) +
        (pr ? "<div class='nota'>Il tuo record: " + Math.min(pr[0], pr[1]) + " / " + pr[1] + "</div>" : "") + "</div>" +
        "<div class='premio'>" + s.stelle + "<img src='img/stella.png' alt='stelle'></div>" +
        (fatta ? "<button class='btn piccolo verde' data-azione='ritira' data-i='" + i + "'>Ritira</button>"
               : "<button class='btn piccolo bianco salta' data-azione='salta' data-i='" + i + "' title='Salta la sfida'>Salta<br>−" + costoSalto(i) + "⭐</button>") + "</div>";
    });
    apriPannello(html);
  }

  function apriScheda() {
    aggiornaEnergia();
    var righe = [
      ["Nome", stato.nome], ["Amico di", stato.bambino], ["Cuore", stato.cuore.nome], ["Fiore preferito", stato.fiore],
      ["Carattere", stato.carattere], ["Livello", stato.livello], ["Pezzi costruiti", stato.costruiti.length],
      ["Nato il", new Date(stato.nato).toLocaleDateString("it-IT")], ["Codice peluche", stato.id]
    ];
    apriPannello(
      "<div class='centro'><img src='" + immagineChiwi(stato.colore, brontolone() ? "brontolone" : "felice") + "' style='width:110px;border-radius:50%;border:4px solid white;box-shadow:var(--ombra)'>" +
      "<h2>" + esc(stato.nome) + " <svg viewBox='0 0 32 29' width='24' style='vertical-align:middle'><path fill='" + stato.cuore.hex + "' d='M16 28 C 6 20 0 14 0 8 A 8 8 0 0 1 16 5 A 8 8 0 0 1 32 8 C 32 14 26 20 16 28 Z'/></svg></h2>" +
      "<p>Energia: " + Math.round(stato.energia) + "/100" + (brontolone() ? " — è brontolone, ha fame di spinaci!" : "") + "</p></div>" +
      "<div class='scheda'>" + righe.map(function (r) { return "<b>" + r[0] + "</b><span>" + esc(r[1]) + "</span>"; }).join("") + "</div>" +
      "<div class='azioni-pannello'><button class='btn verde' data-azione='apri-nutri'>🥬🌸 Dagli da mangiare</button></div>" +
      "<div class='azioni-pannello'><button class='btn piccolo bianco' data-azione='reset'>Area genitori: cancella tutto e ricomincia</button></div>"
    );
  }

  // un piccolo "tic" per ogni bottone
  document.addEventListener("click", function (e) {
    if (e.target.closest("button, .voce")) Suoni.sfx("tap");
  }, true);
  function disegnaAudio() { $("btn-audio").textContent = Suoni.muto() ? "🔇" : "🔊"; }
  $("btn-audio").addEventListener("click", function () { Suoni.impostaMuto(!Suoni.muto()); disegnaAudio(); });
  disegnaAudio();

  $("btn-costruisci").addEventListener("click", apriCostruisci);
  $("btn-giochi").addEventListener("click", apriGiochi);
  $("btn-sfide").addEventListener("click", apriSfide);
  $("btn-avatar").addEventListener("click", apriScheda);
  $("btn-casa").addEventListener("click", function () { Casa.apri(); });

  $("pannello").addEventListener("click", function (e) {
    var b = e.target.closest("[data-azione]");
    if (!b) return;
    var a = b.dataset.azione;
    if (a === "chiudi") chiudiPannello();
    else if (a === "costruisci") costruisci(b.dataset.chiave);
    else if (a === "vai-zona") vaiZona(b.dataset.zona);
    else if (a === "gioca") avviaMinigioco(b.dataset.chiave, { capitolo: b.dataset.capitolo });
    else if (a === "apri-giochi") apriGiochi();
    else if (a === "ritira") ritiraSfida(+b.dataset.i);
    else if (a === "salta") saltaSfida(+b.dataset.i);
    else if (a === "entra-casa") Casa.apri();
    else if (a === "apri-nutri") apriNutri();
    else if (a === "mangia-spinaci") nutri();
    else if (a === "mangia-fiori") nutriFiori();
    else if (a === "reset") {
      // la conferma è dentro il gioco: le finestre del browser non sempre sono disponibili
      apriPannello("<div class='centro'><h2>Cancellare tutto?</h2><p>" + esc(stato.nome) + ", la radura e tutti i progressi spariranno da questo dispositivo.</p>" +
        "<div class='azioni-pannello'><button class='btn bianco' data-azione='chiudi'>No, tieni tutto</button>" +
        "<button class='btn' data-azione='reset-si'>Sì, cancella</button></div></div>");
    }
    else if (a === "reset-si") {
      try { localStorage.removeItem(CHIAVE); } catch (err) {}
      location.reload();
    }
  });

  // ---------- Minigiochi ----------
  var fermaMinigioco = null, giocoCorrente = null;

  var opzioniGioco = {};
  function avviaMinigioco(k, opz) {
    var g = MINIGIOCHI[k];
    opzioniGioco = opz || {};
    var cap = opzioniGioco.capitolo ? capitoloDi(opzioniGioco.capitolo) : null;
    aggiornaEnergia();
    if (stato.livello < g.livello) { avviso("Si sblocca al livello " + g.livello); return; }
    if (g.zona) { var izz = ZONE.map(function (x) { return x.id; }).indexOf(g.zona); if (!zonaAperta(izz)) { avviso("Si apre quando arrivi a " + ZONE[izz].nome); return; } }
    if (g.energia > 0 && (brontolone() || stato.energia < g.energia)) {
      avviso(stato.nome + " è troppo stanco e brontolone: dagli gli spinaci!", 3000);
      chiudiPannello(); parla("Grrr… prima gli spinaci!");
      return;
    }
    chiudiPannello();
    giocoCorrente = k;
    $("app").classList.toggle("largo", !!g.arcade);   // l'avventura usa tutto lo schermo, anche in orizzontale
    mostra("s-minigioco");
    $("mg-titolo").textContent = cap ? Missione.nomeSentiero(cap.zona) : g.nome;
    Suoni.musica(k);
    $("mg-info").textContent = "⚡ " + g.energia;
    var area = $("mg-area");
    area.innerHTML = "<div class='" + (k === "lucciole" ? "notte-bosco" : g.arcade ? "sfondo-arcade" : "") + "'" + (g.arcade ? " style=\"background-image:url(img/" + (cap ? temaSentiero(cap) : k === "fuga" ? "bosco" : k) + "/sfondo.jpg)\"" : "") + "></div>" +
      "<div class='mg-intro'><img class='icona' src='" + g.img + "' alt=''><h2>" + esc(cap ? Missione.nomeSentiero(cap.zona) : g.nome) + "</h2><p>" + esc(g.descrizione) + "</p>" +
      "<button class='btn verde' id='mg-via'>Gioca!</button></div>";
    $("mg-via").addEventListener("click", function () {
      stato.energia -= g.energia;
      stato.contatori.partite++;
      salva();
      area.querySelector(".mg-intro").remove();
      fermaMinigioco = Minigiochi[k](area, {
        info: function (t) { $("mg-info").textContent = t; },
        fine: fineMinigioco,
        livello: stato.livello,
        colore: stato.colore,
        look: stato.look || {},
        aggiustati: stato.aggiustati || [],
        zoneAperte: ZONE.filter(function (z, i) { return zonaAperta(i); }).map(function (z) { return z.id; }),
        turbo: !!(g.arcade && fioriAttivi()),   // con l'energia dei fiori l'avventura parte con la supervelocità
        tema: cap ? temaSentiero(cap) : null, finale: !!(cap && cap.finale)
      });
    });
  }

  function fineMinigioco(ris) {
    fermaMinigioco = null;
    Suoni.sfx("fine");
    var k = giocoCorrente, g0 = MINIGIOCHI[k];
    if (fioriAttivi()) {
      Object.keys(ris.bottino).forEach(function (m) { if (m !== "stelle" && ris.bottino[m] > 0) ris.bottino[m] = Math.ceil(ris.bottino[m] * 1.5); });
      ris.messaggio = (ris.messaggio || "") + " ✨ Energia dei fiori: +50% di materiali!";
    }
    if (ris.completato) setTimeout(function () { Suoni.dici("Wii-chu!"); }, 800);
    // ogni partita finita (tranne i disegni da colorare) regala almeno una stella; le avventure arrivate in fondo una in più
    var stelleGioco = ris.bottino.stelle || 0;
    if (ris.completato && k !== "colora") {
      var bonus = g0.arcade ? 1 : (ris.bottino.stelle ? 0 : 1);
      if (bonus) { ris.bottino.stelle = (ris.bottino.stelle || 0) + bonus; ris.messaggio = (ris.messaggio || "") + " ⭐ Stella del traguardo!"; }
    }
    Object.keys(ris.bottino).forEach(function (m) { aggiungi(m, ris.bottino[m]); });
    var xp = Math.max(2, Math.round(ris.punti / 2));
    if (k === "raccolta") stato.record.raccolta = Math.max(+stato.record.raccolta || 0, ris.punti);
    if (k === "lucciole") stato.record.lucciole = Math.max(+stato.record.lucciole || 0, ris.punti);
    if (g0.arcade) {
      if (ris.completato) stato.record[k + "Completo"] = (stato.record[k + "Completo"] || 0) + 1;
      // arrivare in fondo alla Fuga vale anche per l'avventura di quel paesaggio (es. la porta d'oro del Cielo)
      if (ris.completato && ris.tema && ris.tema !== k) stato.record[ris.tema + "Completo"] = (stato.record[ris.tema + "Completo"] || 0) + 1;
      stato.record[k + "Stelle"] = Math.max(stato.record[k + "Stelle"] || 0, ris.stelleLivello || 0);
    }
    if (g0.rompicapo && ris.completato) {
      var c = stato.contatori;
      if (k === "sudoku") { c.sudokuCompleti = (c.sudokuCompleti || 0) + 1; if (stelleGioco) c.sudokuPerfetti = (c.sudokuPerfetti || 0) + 1; }
      if (k === "puzzle") { c.puzzleCompleti = (c.puzzleCompleti || 0) + 1; if (ris.difficile) c.puzzleDifficili = (c.puzzleDifficili || 0) + 1; }
      if (k === "aggiustatutto") {
        c.aggiustati = (c.aggiustati || 0) + 1; if (ris.primoColpo) c.aggiustatiPrimo = (c.aggiustatiPrimo || 0) + 1;
        stato.aggiustati = stato.aggiustati || []; if (stato.aggiustati.indexOf(ris.guasto) === -1) stato.aggiustati.push(ris.guasto);
      }
      if (k === "labirinto" && ris.difficile) c.labirintiDifficili = (c.labirintiDifficili || 0) + 1;
      if (k === "labirinto") { c.labirintiCompleti = (c.labirintiCompleti || 0) + 1; stato.record.labirintoPetali = Math.max(stato.record.labirintoPetali || 0, ris.bottino.petali || 0); }
    }
    if (k === "memory" && ris.completato) {
      stato.contatori.memoryCompleti++;
      if (!stato.record.memoryMosse || ris.mosse < stato.record.memoryMosse) stato.record.memoryMosse = ris.mosse;
    }
    if (k === "tris") stato.record.tris = Math.max(+stato.record.tris || 0, ris.punti);
    if (k === "conti" && ris.completato) { stato.contatori.contiCompleti = (stato.contatori.contiCompleti || 0) + 1; if (ris.perfetto) stato.contatori.contiPerfetti = (stato.contatori.contiPerfetti || 0) + 1; }
    if (k === "fuga" && ris.completato) stato.contatori.fughe = (stato.contatori.fughe || 0) + 1;
    guadagnaXp(xp);
    if (ris.sfida && ris.completato && opzioniGioco.capitolo) vittoria = opzioniGioco.capitolo;
    var lucine = Missione.evento("partita", {
      gioco: k, mosse: ris.mosse || 0, stelle: ris.bottino.stelle || 0, arcade: !!g0.arcade, rompicapo: !!g0.rompicapo, completato: !!ris.completato, bottino: ris.bottino,
      stelleLivello: ris.stelleLivello || 0, punti: ris.punti, file: ris.file || 0, giuste: ris.giuste || 0
    });
    controllaSfide();
    Casa.controllaPremi();
    salva();
    var g = MINIGIOCHI[k];
    var voci = Object.keys(ris.bottino).filter(function (m) { return ris.bottino[m] > 0; });
    var area = $("mg-area");
    var box = document.createElement("div");
    box.className = "mg-fine";
    box.innerHTML = "<h2>" + esc(ris.titolo || "Bravissimo!") + "</h2><p>" + esc(ris.messaggio || "") + "</p>" +
      "<div class='bottino'>" + (voci.length ? voci.map(function (m) { return "<span><img src='" + MATERIALI[m].img + "' alt=''>+" + ris.bottino[m] + "</span>"; }).join("") : "<span>Nessun materiale questa volta</span>") +
      "<span>+" + xp + " esp.</span>" + (lucine ? "<span class='lucine-vinte'>✨ +" + lucine + (lucine === 1 ? " lucina magica" : " lucine magiche") + "</span>" : "") + "</div>" +
      (ris.immagine ? "<p><a class='btn bianco piccolo' href='" + ris.immagine + "' download='" + esc(ris.nomeFile || "disegno.png") + "'>⬇ Scarica il disegno</a></p>" : "") +
      "<div class='azioni-pannello'>" + (!vittoria && k !== "sfida" && (g.energia === 0 || (stato.energia >= g.energia && !brontolone())) ? "<button class='btn bianco' id='mg-ancora'>Ancora!</button>" : "") +
      "<button class='btn verde' id='mg-torna'>Torna al giardino</button></div>";
    area.appendChild(box);
    if ($("mg-ancora")) $("mg-ancora").addEventListener("click", function () { avviaMinigioco(k); });
    if (k === "sfida" && !vittoria) {   // si può ritentare subito
      var ri = document.createElement("button"); ri.className = "btn bianco"; ri.textContent = "Riprova!";
      ri.addEventListener("click", function () { avviaMinigioco("sfida", opzioniGioco); });
      $("mg-torna").before(ri);
    }
    if (vittoria) $("mg-torna").textContent = "Apri il forziere!";
    $("mg-torna").addEventListener("click", tornaDalGioco);
  }
  var vittoria = null;   // il capitolo appena vinto: al ritorno si apre il forziere
  function tornaDalGioco() {
    if (fermaMinigioco) { fermaMinigioco(); fermaMinigioco = null; }
    $("mg-area").innerHTML = "";
    $("app").classList.remove("largo");
    apriMondo();
    if (vittoria) { var v = vittoria; vittoria = null; Missione.vittoria(v); return; }
    parla(brontolone() ? "Che fame… spinaci?" : "Che divertimento!");
  }
  $("mg-esci").addEventListener("click", tornaDalGioco);

  // ---------- Ciclo ----------
  setInterval(function () {
    if (!stato || !$("s-mondo").classList.contains("attiva")) return;
    aggiornaEnergia();
    disegnaPezzi();
    disegnaHud();
    salva();
  }, 5000);

  // ---------- Parola d'ordine ----------
  // Solo sul sito pubblico: tiene lontani i curiosi (non è una vera protezione, il codice è visibile).
  var CHIAVE_ACCESSO = "chiwinnie-accesso";
  var IMPRONTA_PAROLA = 3764433832; // hash("spinaci"): per cambiare parola, calcolare hash("nuova parola")
  function sitoPubblico() { return /chiwinnie\.com$|github\.io$/.test(location.hostname); }
  function accessoFatto() { try { return localStorage.getItem(CHIAVE_ACCESSO) === "1"; } catch (e) { return false; } }
  $("btn-parola").addEventListener("click", function () {
    var p = $("parola").value.trim().toLowerCase();
    if (hash(p) !== IMPRONTA_PAROLA) { avviso("Non è la parola giusta. Riprova!"); return; }
    try { localStorage.setItem(CHIAVE_ACCESSO, "1"); } catch (e) {}
    Suoni.sfx("magia");
    avvia();
  });

  // ---------- Avvio ----------
  if (sitoPubblico() && !accessoFatto()) { mostra("s-accesso"); }
  else avvia();
  function avvia() {
  stato = carica();
  var idUrl = new URLSearchParams(location.search).get("id");
  if (stato && stato.versione === 3) { apriMondo(); setTimeout(function () { parla("Wii-chu, " + stato.bambino + "!"); }, 600); }
  // chi inizia ascolta prima la storia del Nebbione, poi sveglia il Chiwinnie che è riuscito a scappare
  else if (idUrl) setTimeout(function () { Missione.racconta(null, function () { iniziaImprinting(idUrl.slice(0, 32)); }); }, 0);
  else { mostra("s-benvenuto"); setTimeout(function () { Missione.racconta(null); }, 0); }
  if (!stato) Suoni.musica("radura");
  passeggia();
  }

  // Gioco installabile e giocabile senza internet (solo quando è pubblicato su un sito)
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol) && !/claude\.ai|claudeusercontent/.test(location.hostname)) {
    try { navigator.serviceWorker.register("sw.js"); } catch (e) {}
  }

  // la casetta e il guardaroba (js/casa.js) usano queste funzioni del gioco
  Casa.avvia({
    stato: function () { return stato; }, salva: salva, toast: toast, avviso: avviso, esc: esc, vibra: vibra, coriandoli: coriandoli,
    mostra: mostra, apriPannello: apriPannello, chiudiPannello: chiudiPannello, apriMondo: apriMondo, aggiornaEnergia: aggiornaEnergia,
    disegnaHud: function () { disegnaTutto(); }
  });
  Missione.avvia({
    stato: function () { return stato; }, salva: salva, toast: toast, avviso: avviso, esc: esc, vibra: vibra, coriandoli: coriandoli,
    apriPannello: apriPannello, chiudiPannello: chiudiPannello, guadagnaXp: guadagnaXp, disegnaHud: function () { disegnaTutto(); },
    vaiZona: vaiZona, mostra: mostra, parla: parla
  });

  // Per provare il gioco più in fretta dalla console del browser
  window.chiwinnieDebug = {
    stato: function () { return stato; },
    materiali: function (n) { ORDINE_MATERIALI.forEach(function (m) { stato.materiali[m] = n; }); disegnaTutto(); },
    xp: function (n) { guadagnaXp(n); disegnaTutto(); },
    tutto: function () { Object.keys(zonaCorrente().pezzi).forEach(function (k) { if (!fatto(k)) { stato.costruiti.push(k); stato.prod[k] = Date.now(); } }); disegnaTutto(); }
  };
})();
