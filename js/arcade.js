// Livelli arcade a scorrimento. Il Chiwinnie corre da solo verso destra:
// si tocca lo schermo per saltare (tenendo premuto salta più in alto).
// Si aggiunge a Minigiochi con la stessa interfaccia degli altri giochi.
(function () {
  "use strict";

  var ALTEZZA = 600;          // altezza del mondo visibile, in unità di gioco
  var TERRA_Y = 470;          // quota del prato
  var GRAVITA = 2400, SALTO = 860, RIMBALZO = 1250, CADUTA_MAX = 1150;

  // Ogni mondo arcade ha il suo tema: grafica, piattaforme, trampolino, ostacoli e traguardo.
  var TEMI = {
    bosco: {
      cartella: "img/bosco/", terreno: { img: "terreno.png", h: 92, su: 22 }, colTerra: "#a96d40", nebbia: "150,180,120",
      piatt: { tronco: { img: "tronco.png", top: 0.36 }, pietra: { img: "pietra.png", top: 0.3 } },
      trampolino: { img: "fungo.png", w: 112, h: 105, top: 78 }, ostacolo: { img: "rovo.png", w: 96, h: 82 },
      rotolante: { img: "../pigna.png" }, traguardo: { img: "cestino.png", w: 120, h: 128 },
      arrivo: "Sei arrivato al cestino!", perfetto: "Bosco perfetto: tutte le stelle!"
    },
    ruscello: {
      cartella: "img/ruscello/", terreno: { img: "terreno.png", h: 150, su: 42 }, colTerra: "#b99063", nebbia: "150,190,200", acqua: true,
      piatt: { ninfea: { img: "ninfea.png", top: 0.5 }, sasso: { img: "sasso.png", top: 0.22 } },
      trampolino: { img: "loto.png", w: 124, h: 76, top: 56 }, pesce: { img: "pesce.png", w: 72, h: 66 },
      traguardo: { img: "barca.png", w: 160, h: 98 },
      arrivo: "Sei arrivato alla barchetta!", perfetto: "Ruscello perfetto: tutte le stelle!"
    },
    collina: {
      cartella: "img/collina/", terreno: { img: "terreno.png", h: 120, su: 34 }, colTerra: "#c99048", nebbia: "190,215,160",
      piatt: { fieno: { img: "fieno.png", top: 0.1 }, nuvola: { img: "nuvola.png", top: 0.32 } },
      trampolino: { img: "soffione.png", w: 76, h: 150, top: 120 }, ostacolo: { img: "cardo.png", w: 80, h: 106 },
      rotolante: { img: "fieno.png" }, traguardo: { img: "girandola.png", w: 96, h: 162 },
      arrivo: "Sei arrivato alla girandola!", perfetto: "Collina perfetta: tutte le stelle!"
    },
    cielo: {
      cartella: "img/cielo/", terreno: { img: "terreno.png", h: 92, su: 14 }, colTerra: "#f6e1e4", nebbia: "245,215,225",
      piatt: { arcobaleno: { img: "arcobaleno.png", top: 0.18 }, ponte: { img: "ponte.png", top: 0.4 }, nuvola: { img: "nuvola.png", top: 0.3 } },
      trampolino: { img: "molla.png", w: 92, h: 88, top: 70 }, ostacolo: { img: "temporale.png", w: 96, h: 78 },
      traguardo: { img: "porta.png", w: 120, h: 158 },
      arrivo: "Sei arrivato alla porta d'oro!", perfetto: "Cielo perfetto: tutte le stelle!"
    }
  };

  function carica(src) { var i = new Image(); i.src = src; return i; }

  // ---------- Il livello del Bosco ----------
  // Si costruisce avanzando con un cursore x, pezzo dopo pezzo.
  function livelloBosco() {
    var L = nuovoLivello();
    var x = 0;
    function terra(lung) { L.terreno.push([x, x + lung]); x += lung; }
    function buco(lung) { x += lung; }
    function fila(k, n, x0, y, passo) { for (var i = 0; i < n; i++) L.oggetti.push({ x: x0 + i * (passo || 60), y: y, k: k }); }
    function arco(k, n, x0, y, larg, alt) {
      for (var i = 0; i < n; i++) {
        var t = n === 1 ? .5 : i / (n - 1);
        L.oggetti.push({ x: x0 + t * larg, y: y - Math.sin(t * Math.PI) * alt, k: k });
      }
    }
    function piatt(tipo, px, py, w) { L.piattaforme.push({ tipo: tipo, x: px, y: py, w: (w || (tipo === "tronco" ? 230 : 200)) + 30 }); }

    // 1. partenza tranquilla
    terra(1000); fila("spinaci", 5, 380, TERRA_Y - 50);
    // 2. prima piccola buca
    var b = x; buco(150); arco("legnetti", 4, b - 60, TERRA_Y - 80, 270, 110);
    // 3. primo rovo
    terra(800); L.rovi.push({ x: x - 450 }); arco("spinaci", 3, x - 520, TERRA_Y - 90, 140, 90);
    fila("petali", 3, x - 250, TERRA_Y - 50);
    // 4. scala di piattaforme sopra il prato
    var s = x; terra(1000);
    piatt("tronco", s + 120, 370); fila("legnetti", 3, s + 160, 330);
    piatt("pietra", s + 430, 280); fila("sassolini", 3, s + 460, 240);
    L.stelle.push({ x: s + 700, y: 180 });
    piatt("tronco", s + 680, 330, 200);
    // 5. una pigna che rotola
    var p = x; terra(900); L.pigne.push({ x: p + 600 }); fila("spinaci", 4, p + 200, TERRA_Y - 50);
    // 6. il fungo e il grande salto
    L.funghi.push({ x: x - 80 });
    b = x; buco(380); arco("petali", 6, b - 40, TERRA_Y - 230, 420, 150);
    // 7. rovi e pigne
    p = x; terra(1100); L.rovi.push({ x: p + 300 }); L.rovi.push({ x: p + 720 });
    L.pigne.push({ x: p + 1000 });
    arco("legnetti", 3, p + 240, TERRA_Y - 90, 140, 80); arco("sassolini", 3, p + 660, TERRA_Y - 90, 140, 80);
    // 8. isole sospese sopra una lunga buca
    b = x; terra(140); buco(1050);
    piatt("pietra", b + 260, 400); fila("spinaci", 2, b + 300, 360);
    piatt("tronco", b + 560, 340); fila("petali", 3, b + 590, 300);
    piatt("pietra", b + 880, 400); fila("sassolini", 2, b + 920, 360);
    L.stelle.push({ x: b + 690, y: 190 });
    // 9. il sentiero delle pigne
    p = x; terra(1300);
    L.pigne.push({ x: p + 700 }); L.pigne.push({ x: p + 1050 }); L.pigne.push({ x: p + 1400 });
    fila("petali", 6, p + 150, TERRA_Y - 50, 70); fila("spinaci", 4, p + 750, TERRA_Y - 140, 70);
    // 10. buche ravvicinate
    buco(170); terra(450); L.rovi.push({ x: x - 230 }); buco(200);
    arco("legnetti", 4, x - 260, TERRA_Y - 90, 260, 100);
    // 11. il fungo segreto e la terza stella
    p = x; terra(1400);
    L.funghi.push({ x: p + 260 });
    piatt("tronco", p + 470, 230, 240); fila("sassolini", 3, p + 500, 190);
    L.stelle.push({ x: p + 820, y: 120 });
    piatt("pietra", p + 760, 250, 200);
    fila("spinaci", 5, p + 900, TERRA_Y - 50);
    // 12. arrivo con una pioggia di petali
    p = x; terra(1300);
    arco("petali", 7, p + 100, TERRA_Y - 60, 600, 140);
    L.traguardo = p + 900;
    return unisciTerreno(L);
  }

  function nuovoLivello() { return { terreno: [], piattaforme: [], funghi: [], rovi: [], pigne: [], pesci: [], nebbiolini: [], oggetti: [], stelle: [], traguardo: 0 }; }

  // ---------- La Fuga dal Nebbione ----------
  // Un'avventura lunga che cambia ogni volta: si mettono in fila tanti pezzi di percorso scelti a caso,
  // sempre più difficili, con il tema di una delle zone già aperte.
  function livelloFuga(T, LUNGHEZZA) {
    var L = nuovoLivello();
    var x = 0, tipiP = Object.keys(T.piatt);
    function terra(lung) { L.terreno.push([x, x + lung]); x += lung; }
    function buco(lung) { x += lung; }
    function fila(k, n, x0, y, passo) { for (var i = 0; i < n; i++) L.oggetti.push({ x: x0 + i * (passo || 60), y: y, k: k }); }
    function arco(k, n, x0, y, larg, alt) {
      for (var i = 0; i < n; i++) { var t = n === 1 ? .5 : i / (n - 1); L.oggetti.push({ x: x0 + t * larg, y: y - Math.sin(t * Math.PI) * alt, k: k }); }
    }
    function piatt(px, py, w) { L.piattaforme.push({ tipo: tipiP[Math.floor(Math.random() * tipiP.length)], x: px, y: py, w: (w || 200) + 30 }); }
    function roba() { return ["spinaci", "petali", "legnetti", "sassolini", "petali"][Math.floor(Math.random() * 5)]; }
    function nemico(px) {
      // rovi o pigne dove il tema li ha; altrimenti un nebbiolino
      if (T.ostacolo && Math.random() < 0.5) L.rovi.push({ x: px });
      else if (T.rotolante && Math.random() < 0.6) L.pigne.push({ x: px + 300 });
      else L.nebbiolini.push({ x: px, y0: TERRA_Y - 75, fase: Math.random() * 6 });
    }
    var PEZZI = [
      // una buca da saltare, con un arco di materiali sopra
      function (d) { var b = x, lung = 150 + Math.round(d * 60); buco(lung); arco(roba(), 4, b - 50, TERRA_Y - 90, lung + 100, 100);
        if (T.pesce && lung > 170) L.pesci.push({ x: b + lung / 2, fase: Math.random() * 6 }); terra(500 + Math.round(Math.random() * 300)); },
      // un ostacolo sul prato
      function () { var p = x; terra(800); nemico(p + 420); arco(roba(), 3, p + 360, TERRA_Y - 100, 140, 80); fila(roba(), 3, p + 120, TERRA_Y - 50); },
      // scala di piattaforme sopra il prato
      function () { var p = x; terra(1000); piatt(p + 120, 370); fila(roba(), 3, p + 160, 330); piatt(p + 430, 280); fila(roba(), 3, p + 460, 240); piatt(p + 700, 330, 180); },
      // isole sospese sopra una lunga buca
      function () { terra(300); var b = x; buco(950);
        piatt(b + 180, 400); fila(roba(), 2, b + 220, 360); piatt(b + 470, 340); fila(roba(), 3, b + 500, 300); piatt(b + 760, 400); fila(roba(), 2, b + 800, 360); terra(400); },
      // il trampolino e il grande salto
      function () { terra(600); L.funghi.push({ x: x - 80 }); var b = x; buco(380); arco("petali", 6, b - 40, TERRA_Y - 230, 420, 150); terra(500); },
      // i nebbiolini del Nebbione
      function (d) { var p = x; terra(1100);
        L.nebbiolini.push({ x: p + 380, y0: TERRA_Y - 70, fase: Math.random() * 6 });
        L.nebbiolini.push({ x: p + 800, y0: d > 0.5 ? TERRA_Y - 80 : TERRA_Y - 170, fase: Math.random() * 6 });
        fila(roba(), 4, p + 520, TERRA_Y - 50); },
      // due ostacoli di fila
      function () { var p = x; terra(1100); nemico(p + 350); nemico(p + 800); fila(roba(), 3, p + 500, TERRA_Y - 50); },
      // prato per riprendere fiato, pieno di petali
      function () { var p = x; terra(800); arco("petali", 6, p + 100, TERRA_Y - 60, 500, 120); }
    ];
    terra(1000); fila("spinaci", 5, 380, TERRA_Y - 50);
    var ultimo = -1, stelle = [0.2, 0.5, 0.8];
    while (x < LUNGHEZZA) {
      var d = x / LUNGHEZZA, k;
      do { k = Math.floor(Math.random() * PEZZI.length); } while (k === ultimo || (d < 0.15 && (k === 3 || k === 6)));
      ultimo = k;
      var prima = x;
      PEZZI[k](d);
      // le tre stelle nascoste, in alto sopra il percorso
      if (stelle.length && d >= stelle[0]) { stelle.shift(); L.stelle.push({ x: prima + (x - prima) / 2, y: 210 }); }
    }
    terra(1300); arco("petali", 7, x - 1200, TERRA_Y - 60, 600, 140);
    L.traguardo = x - 400;
    return unisciTerreno(L);
  }

  // ---------- Il livello del Ruscello ----------
  // Rive e acqua: si salta su ninfee e sassi, i pesci saltano fuori dall'acqua, i fiori di loto fanno da trampolino.
  function livelloRuscello() {
    var L = nuovoLivello();
    var x = 0;
    function terra(lung) { L.terreno.push([x, x + lung]); x += lung; }
    function acqua(lung) { x += lung; }
    function fila(k, n, x0, y, passo) { for (var i = 0; i < n; i++) L.oggetti.push({ x: x0 + i * (passo || 60), y: y, k: k }); }
    function arco(k, n, x0, y, larg, alt) {
      for (var i = 0; i < n; i++) { var t = n === 1 ? .5 : i / (n - 1); L.oggetti.push({ x: x0 + t * larg, y: y - Math.sin(t * Math.PI) * alt, k: k }); }
    }
    function piatt(tipo, px, py, w) { L.piattaforme.push({ tipo: tipo, x: px, y: py, w: (w || (tipo === "ninfea" ? 200 : 170)) + 30 }); }
    function pesce(px, fase) { L.pesci.push({ x: px, fase: fase || 0 }); }

    // 1. la riva
    terra(900); fila("spinaci", 5, 360, TERRA_Y - 50);
    // 2. il primo ruscelletto, con un pesce
    var b = x; acqua(170); pesce(b + 85, 0); arco("sassolini", 3, b - 30, TERRA_Y - 110, 230, 90);
    // 3. riva con fiori
    terra(650); fila("petali", 4, x - 500, TERRA_Y - 50, 70);
    // 4. il sentiero delle ninfee
    b = x; acqua(900);
    piatt("ninfea", b + 140, 462); fila("spinaci", 2, b + 180, 420);
    piatt("ninfea", b + 400, 452); fila("petali", 3, b + 420, 410);
    piatt("ninfea", b + 660, 462); fila("sassolini", 2, b + 700, 420);
    L.stelle.push({ x: b + 500, y: 240 });
    pesce(b + 330, 1.2); pesce(b + 600, 2.6);
    // 5. riva lunga
    var p = x; terra(800); fila("legnetti", 4, p + 200, TERRA_Y - 50); arco("spinaci", 3, p + 480, TERRA_Y - 90, 140, 80);
    // 6. il fiore di loto e il grande salto
    L.funghi.push({ x: x - 80 });
    b = x; acqua(380); arco("petali", 6, b - 40, TERRA_Y - 230, 420, 150); pesce(b + 190, 0.6);
    // 7. rive corte e pesci
    terra(500); b = x; acqua(160); pesce(b + 80, 1.8); terra(520); fila("sassolini", 4, x - 420, TERRA_Y - 50);
    // 8. i sassi nel ruscello
    b = x; acqua(1000);
    piatt("sasso", b + 110, 458); piatt("sasso", b + 330, 440); piatt("sasso", b + 550, 422); piatt("sasso", b + 780, 450);
    fila("legnetti", 2, b + 140, 418); fila("spinaci", 2, b + 360, 400); fila("petali", 2, b + 580, 382); fila("sassolini", 2, b + 810, 410);
    L.stelle.push({ x: b + 635, y: 205 });
    pesce(b + 260, 0.3); pesce(b + 480, 1.5); pesce(b + 700, 2.4);
    // 9. riva tranquilla
    p = x; terra(1000); fila("petali", 6, p + 150, TERRA_Y - 50, 70); fila("spinaci", 4, p + 650, TERRA_Y - 130, 70);
    // 10. il loto segreto e la terza stella
    p = x; terra(1300);
    L.funghi.push({ x: p + 260 });
    piatt("sasso", p + 470, 240, 220); fila("sassolini", 3, p + 500, 200);
    L.stelle.push({ x: p + 800, y: 115 });
    piatt("ninfea", p + 740, 260, 210);
    fila("spinaci", 5, p + 900, TERRA_Y - 50);
    // 11. l'ultimo salto e l'arrivo alla barchetta
    b = x; acqua(200); pesce(b + 100, 0.9);
    p = x; terra(1300); arco("petali", 7, p + 100, TERRA_Y - 60, 600, 140);
    L.traguardo = p + 900;
    return unisciTerreno(L);
  }

  // ---------- Il livello della Collina dei fiori ----------
  // Si sale e si scende tra balle di fieno e nuvolette; i soffioni lanciano in alto, i cardi pungono, il fieno rotola.
  function livelloCollina() {
    var L = nuovoLivello();
    var x = 0;
    function terra(lung) { L.terreno.push([x, x + lung]); x += lung; }
    function buco(lung) { x += lung; }
    function fila(k, n, x0, y, passo) { for (var i = 0; i < n; i++) L.oggetti.push({ x: x0 + i * (passo || 60), y: y, k: k }); }
    function arco(k, n, x0, y, larg, alt) {
      for (var i = 0; i < n; i++) { var t = n === 1 ? .5 : i / (n - 1); L.oggetti.push({ x: x0 + t * larg, y: y - Math.sin(t * Math.PI) * alt, k: k }); }
    }
    function piatt(tipo, px, py, w) { L.piattaforme.push({ tipo: tipo, x: px, y: py, w: (w || (tipo === "fieno" ? 130 : 200)) + 30 }); }

    // 1. il prato in fiore
    terra(900); fila("petali", 5, 360, TERRA_Y - 50);
    // 2. scalini di fieno
    var p = x; terra(900);
    piatt("fieno", p + 150, 410); piatt("fieno", p + 360, 350); piatt("fieno", p + 570, 290);
    fila("legnetti", 2, p + 170, 370); fila("spinaci", 2, p + 380, 310); fila("sassolini", 2, p + 590, 250);
    L.stelle.push({ x: p + 780, y: 150 });
    // 3. il primo cardo e una buca
    terra(500); L.rovi.push({ x: x - 250 }); arco("spinaci", 3, x - 320, TERRA_Y - 100, 140, 90);
    var b = x; buco(170); arco("petali", 4, b - 50, TERRA_Y - 90, 270, 100);
    // 4. il fieno che rotola giù dalla collina
    p = x; terra(1100); L.pigne.push({ x: p + 650 }); L.pigne.push({ x: p + 1000 });
    fila("legnetti", 4, p + 200, TERRA_Y - 50); fila("petali", 3, p + 700, TERRA_Y - 140, 70);
    // 5. il soffione e il volo sulle nuvole
    L.funghi.push({ x: x - 90 });
    b = x; buco(1000);
    piatt("nuvola", b + 220, 330); piatt("nuvola", b + 500, 290); piatt("nuvola", b + 780, 350);
    fila("spinaci", 3, b + 240, 290); fila("petali", 3, b + 520, 250); fila("sassolini", 2, b + 800, 310);
    L.stelle.push({ x: b + 640, y: 120 });
    // 6. cardi in fila
    p = x; terra(1000); L.rovi.push({ x: p + 300 }); L.rovi.push({ x: p + 650 });
    arco("sassolini", 3, p + 240, TERRA_Y - 90, 140, 80); arco("legnetti", 3, p + 590, TERRA_Y - 90, 140, 80);
    // 7. buche e fieno
    buco(180); terra(600); L.pigne.push({ x: x - 100 }); buco(200);
    arco("petali", 4, x - 260, TERRA_Y - 90, 260, 100);
    // 8. il soffione segreto e la terza stella
    p = x; terra(1400);
    L.funghi.push({ x: p + 250 });
    piatt("nuvola", p + 460, 220, 230); fila("sassolini", 3, p + 500, 180);
    L.stelle.push({ x: p + 820, y: 110 });
    piatt("fieno", p + 780, 260, 140);
    fila("spinaci", 5, p + 900, TERRA_Y - 50);
    // 9. discesa finale verso la girandola
    p = x; terra(1300); arco("petali", 7, p + 100, TERRA_Y - 60, 600, 140);
    L.traguardo = p + 900;
    return unisciTerreno(L);
  }

  // ---------- Il livello del Cielo ----------
  // Si corre sulle nuvole: ponti d'arcobaleno sopra il vuoto, molle a stella, nuvolette di tuono da evitare.
  function livelloCielo() {
    var L = nuovoLivello();
    var x = 0;
    function terra(lung) { L.terreno.push([x, x + lung]); x += lung; }
    function vuoto(lung) { x += lung; }
    function fila(k, n, x0, y, passo) { for (var i = 0; i < n; i++) L.oggetti.push({ x: x0 + i * (passo || 60), y: y, k: k }); }
    function arco(k, n, x0, y, larg, alt) {
      for (var i = 0; i < n; i++) { var t = n === 1 ? .5 : i / (n - 1); L.oggetti.push({ x: x0 + t * larg, y: y - Math.sin(t * Math.PI) * alt, k: k }); }
    }
    function piatt(tipo, px, py, w) { L.piattaforme.push({ tipo: tipo, x: px, y: py, w: (w || (tipo === "nuvola" ? 190 : 230)) + 30 }); }

    // 1. sulle nuvole
    terra(900); fila("petali", 5, 360, TERRA_Y - 50);
    // 2. il primo ponte d'arcobaleno
    var b = x; vuoto(420); piatt("arcobaleno", b + 90, 440, 240); fila("spinaci", 3, b + 120, 400);
    // 3. nuvole e tuoni
    var p = x; terra(900); L.rovi.push({ x: p + 350 }); L.rovi.push({ x: p + 700 });
    arco("sassolini", 3, p + 290, TERRA_Y - 100, 140, 90); arco("legnetti", 3, p + 640, TERRA_Y - 100, 140, 90);
    // 4. la scala di nuvolette
    b = x; vuoto(1050);
    piatt("nuvola", b + 120, 420); piatt("nuvola", b + 360, 360); piatt("nuvola", b + 600, 300); piatt("ponte", b + 820, 380, 220);
    fila("petali", 2, b + 150, 380); fila("spinaci", 2, b + 390, 320); fila("sassolini", 2, b + 630, 260); fila("legnetti", 2, b + 850, 340);
    L.stelle.push({ x: b + 690, y: 120 });
    // 5. la molla a stella e il grande salto
    terra(700); L.funghi.push({ x: x - 80 });
    b = x; vuoto(400); arco("petali", 6, b - 40, TERRA_Y - 230, 440, 150);
    // 6. tuoni ravvicinati
    p = x; terra(1000); L.rovi.push({ x: p + 300 }); L.rovi.push({ x: p + 560 }); L.rovi.push({ x: p + 820 });
    fila("spinaci", 3, p + 380, TERRA_Y - 150, 60); fila("petali", 3, p + 640, TERRA_Y - 150, 60);
    // 7. arcobaleni sopra il vuoto
    b = x; vuoto(950);
    piatt("arcobaleno", b + 110, 430, 220); piatt("ponte", b + 420, 380, 220); piatt("arcobaleno", b + 720, 430, 200);
    fila("sassolini", 3, b + 140, 390); fila("legnetti", 3, b + 450, 340); fila("spinaci", 2, b + 750, 390);
    L.stelle.push({ x: b + 530, y: 170 });
    // 8. la molla segreta e la terza stella
    p = x; terra(1400);
    L.funghi.push({ x: p + 260 });
    piatt("nuvola", p + 470, 230, 220); fila("sassolini", 3, p + 500, 190);
    L.stelle.push({ x: p + 820, y: 110 });
    piatt("arcobaleno", p + 760, 250, 200);
    L.rovi.push({ x: p + 1080 });
    fila("spinaci", 4, p + 900, TERRA_Y - 50);
    // 9. verso la porta d'oro
    b = x; vuoto(180);
    p = x; terra(1300); arco("petali", 7, p + 100, TERRA_Y - 60, 600, 140);
    L.traguardo = p + 900;
    return unisciTerreno(L);
  }

  // I tratti di prato che si toccano diventano uno solo (niente righe tra un tratto e l'altro)
  function unisciTerreno(L) {
    var uniti = [];
    L.terreno.sort(function (a, b) { return a[0] - b[0]; }).forEach(function (s) {
      var ultimo = uniti[uniti.length - 1];
      if (ultimo && s[0] <= ultimo[1] + 1) ultimo[1] = Math.max(ultimo[1], s[1]);
      else uniti.push([s[0], s[1]]);
    });
    L.terreno = uniti;
    return L;
  }

  // La seconda parte del livello: il percorso riparte poco prima del traguardo, più veloce.
  // Le stelle nascoste restano solo nella prima parte.
  function raddoppia(L) {
    var off = L.traguardo - 300;
    function sposta(arr) { return arr.map(function (e) { var c = {}; for (var k in e) c[k] = e[k]; c.x += off; c.seconda = true; return c; }); }
    L.terreno = L.terreno.concat(L.terreno.map(function (s) { return [s[0] + off, s[1] + off]; }));
    L.piattaforme = L.piattaforme.concat(sposta(L.piattaforme));
    L.funghi = L.funghi.concat(sposta(L.funghi));
    L.rovi = L.rovi.concat(sposta(L.rovi));
    L.pigne = L.pigne.concat(sposta(L.pigne));
    L.pesci = L.pesci.concat(sposta(L.pesci));
    L.oggetti = L.oggetti.concat(sposta(L.oggetti));
    L.meta = off;
    L.traguardo += off;
    unisciTerreno(L);
    return mettiPoteri(L, ["super", "calamita", "ali", "super", "calamita"], [0.16, 0.34, 0.52, 0.7, 0.86]);
  }
  // bolle dei superpoteri, sempre sopra un tratto di terra
  function mettiPoteri(L, tipi, posti) {
    L.poteri = posti.map(function (f, i) {
      var x = L.traguardo * f;
      for (var t = 0; t < 40 && !L.terreno.some(function (s) { return x > s[0] + 60 && x < s[1] - 60; }); t++) x += 50;
      return { x: x, y: TERRA_Y - 70, tipo: tipi[i] };   // all'altezza del Chiwinnie che corre: si prende senza saltare
    });
    return L;
  }
  var POTERI = {
    super: { icona: "⚡", nome: "Supervelocità", durata: 9, colore: "#ffd23f" },
    calamita: { icona: "🧲", nome: "Calamita", durata: 10, colore: "#ff7aa8" },
    ali: { icona: "🪶", nome: "Doppio salto", durata: 12, colore: "#8fd3ff" }
  };

  // ---------- Motore ----------
  function avventura(area, api, crea, T, fuga, tema) {
    var L = fuga ? crea() : raddoppia(crea());
    L.poteri = L.poteri || [];
    L.nebbiolini = L.nebbiolini || [];
    // nella fuga il Nebbione insegue: "distanza" è quanto è lontano dietro al Chiwinnie
    var distanza = 420, DISTANZA_MAX = 520, DISTANZA_SUPER = 1300;   // con la supervelocità si può staccarlo molto di più
    var canvas = document.createElement("canvas");
    area.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var cw, ch, scala, vistaW, vistaH, alzo;
    var LARGHEZZA_MINIMA = 490;   // in verticale si allarga la visuale per vedere la strada in anticipo
    function misura() {
      cw = area.clientWidth; ch = area.clientHeight;
      canvas.width = cw * dpr; canvas.height = ch * dpr;
      scala = Math.min(ch / ALTEZZA, cw / LARGHEZZA_MINIMA);
      vistaW = cw / scala; vistaH = ch / scala;
      alzo = vistaH - ALTEZZA;      // spazio di cielo in più sopra il livello
    }
    misura();
    window.addEventListener("resize", misura);

    var I = {
      sfondo: carica(T.cartella + "sfondo.jpg"), terreno: carica(T.cartella + T.terreno.img),
      fungo: carica(T.cartella + T.trampolino.img), cestino: carica(T.cartella + T.traguardo.img),
      rovo: T.ostacolo ? carica(T.cartella + T.ostacolo.img) : null,
      pigna: T.rotolante ? carica(T.cartella + T.rotolante.img) : null,
      pesce: T.pesce ? carica(T.cartella + T.pesce.img) : null,
      corsa1: carica(immagineChiwi(api.colore, "corsa1")), corsa2: carica(immagineChiwi(api.colore, "corsa2")),
      salto: carica(immagineChiwi(api.colore, "salto")), caduta: carica(immagineChiwi(api.colore, "caduta")),
      stella: carica("img/stella.png"),
      nebbiolino: carica("img/nebbione/nebbiolino.png"), nebbione: carica("img/nebbione/nebbione.png"),
      spinaci: carica("img/spinaci.png"), legnetti: carica("img/legnetti.png"),
      sassolini: carica("img/sassolini.png"), petali: carica("img/petali.png")
    };

    var chiwi = { x: 140, y: TERRA_Y, vy: 0, aTerra: true, coyote: 0, tenuto: 0, invulnerabile: 0, schiaccia: 0, spinta: 1 };
    var velocita = 300, cuori = fuga ? 4 : 3, punti = 0, stelleTrovate = 0, controllo = 140;
    var bottino = { spinaci: 0, legnetti: 0, sassolini: 0, petali: 0, stelle: 0 };
    var premuto = false, buffer = 0, finito = false, arrivato = 0, pausa = 0, raf, ultimo = performance.now(), tempo = 0;
    var scintille = [], scritte = [];
    var potere = null;   // { tipo, fino }
    function attivo(tipo) { return potere && potere.tipo === tipo && tempo < potere.fino; }
    function attiva(tipo, durata) {
      potere = { tipo: tipo, fino: tempo + (durata || POTERI[tipo].durata) };
      if (fuga && tipo === "super") { distanza = Math.min(DISTANZA_SUPER, Math.max(distanza, DISTANZA_MAX) + 150); scritta(chiwi.x, chiwi.y - 160, "Ciao ciao, Nebbione!", "#6b6f7c"); }
      chiwi.doppio = false;
      Suoni.sfx("livello");
      scritta(chiwi.x + 40, chiwi.y - 120, POTERI[tipo].icona + " " + POTERI[tipo].nome + "!", "#b5651d");
      brilla(chiwi.x, chiwi.y - 40, 24, POTERI[tipo].colore);
    }
    L.pigne.forEach(function (p) { p.y = TERRA_Y; p.vy = 0; p.attiva = false; p.rot = 0; });
    L.funghi.forEach(function (f) { f.boing = 0; });
    Object.keys(T.piatt).forEach(function (k) { I[k] = carica(T.cartella + T.piatt[k].img); });

    // comandi: dito o tastiera
    function giu(e) { if (e) e.preventDefault(); premuto = true; buffer = 0.13; }
    function su() { premuto = false; }
    canvas.addEventListener("pointerdown", giu);
    window.addEventListener("pointerup", su);
    function tasto(e) {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") { e.preventDefault(); if (e.type === "keydown") { if (!premuto) giu(); } else su(); }
    }
    window.addEventListener("keydown", tasto); window.addEventListener("keyup", tasto);

    function suTerra(x) { return L.terreno.some(function (s) { return x >= s[0] && x <= s[1]; }); }
    function colpito() {
      if (chiwi.invulnerabile > 0 || attivo("super")) return;
      // un rimbalzo bello alto: dà il tempo di recuperare invece di far cadere nella buca
      cuori--; chiwi.invulnerabile = 1.8; chiwi.vy = -720; chiwi.aTerra = false; chiwi.spinta = 1.25;
      Suoni.sfx("pigna");
      try { navigator.vibrate && navigator.vibrate(90); } catch (e) {}
      if (cuori <= 0) termina(false);
    }
    function scritta(x, y, s, c) { scritte.push({ x: x, y: y, s: s, c: c || "#3d7a2e", t: 0 }); }
    function brilla(x, y, n, col) {
      for (var i = 0; i < n; i++) scintille.push({ x: x, y: y, vx: (Math.random() - .5) * 300, vy: -Math.random() * 300, t: 0, col: col || "#fff6b0" });
    }

    function aggiorna(dt) {
      tempo += dt;
      if (pausa > 0) { pausa -= dt; return; }
      if (arrivato) { chiwi.x += velocita * 0.5 * dt; arrivato += dt; if (arrivato > 1.6) termina(true); return; }
      velocita = fuga ? Math.min(410, 290 + chiwi.x / 300) : Math.min(chiwi.x > (L.meta || 1e9) ? 360 : 345, 300 + chiwi.x / 400);
      var turbo = attivo("super") ? 1.7 : 1;
      chiwi.x += velocita * chiwi.spinta * turbo * dt;
      if (fuga) {
        // il Nebbione si avvicina piano piano; i salti sui trampolini e la supervelocità lo lasciano indietro
        // con la supervelocità si stacca di più (fino a DISTANZA_SUPER); dopo, il vantaggio in più si consuma piano
        var tetto = attivo("super") ? DISTANZA_SUPER : DISTANZA_MAX;
        var piu = velocita * (chiwi.spinta * (attivo("super") ? 2.6 : 1) - 1) * dt;
        distanza = distanza + piu - (distanza > DISTANZA_MAX ? 45 : 14) * dt;
        if (piu > 0) distanza = Math.min(Math.max(tetto, distanza - piu), distanza);
        if (distanza < 40) {
          distanza = 420;
          if (!(chiwi.invulnerabile > 0)) {
            scritta(chiwi.x, chiwi.y - 130, "Brrr, il Nebbione!", "#6b6f7c");
            colpito();
            if (finito) return;
          }
        }
      }
      if (potere && tempo >= potere.fino) potere = null;
      buffer -= dt; chiwi.coyote -= dt; chiwi.invulnerabile -= dt; chiwi.schiaccia -= dt;

      // salto (con un piccolo margine sia prima sia dopo il bordo)
      if (buffer > 0 && (chiwi.aTerra || chiwi.coyote > 0)) {
        chiwi.vy = -SALTO; chiwi.aTerra = false; chiwi.coyote = 0; buffer = 0; chiwi.tenuto = 0;
        Suoni.sfx("tap");
      } else if (buffer > 0 && attivo("ali") && !chiwi.doppio) {
        // la piuma: un secondo salto in aria
        chiwi.vy = -SALTO * 0.92; chiwi.doppio = true; buffer = 0; chiwi.tenuto = 0;
        brilla(chiwi.x, chiwi.y, 10, "#cfeeff"); Suoni.sfx("tap");
      }
      var g = GRAVITA;
      if (premuto && chiwi.vy < 0 && chiwi.tenuto < 0.26) { g *= 0.42; chiwi.tenuto += dt; }
      chiwi.vy = Math.min(CADUTA_MAX, chiwi.vy + g * dt);
      var prima = chiwi.y;
      chiwi.y += chiwi.vy * dt;

      // atterraggi: prato e piattaforme si attraversano da sotto, si atterra solo da sopra
      var eraATerra = chiwi.aTerra;
      chiwi.aTerra = false;
      if (chiwi.vy >= 0) {
        if (prima <= TERRA_Y && chiwi.y >= TERRA_Y && suTerra(chiwi.x)) { chiwi.y = TERRA_Y; chiwi.vy = 0; chiwi.aTerra = true; controllo = chiwi.x; }
        L.piattaforme.forEach(function (p) {
          // si atterra anche appena oltre il bordo: i salti perdonano un po'
          if (prima <= p.y && chiwi.y >= p.y && chiwi.x > p.x - 25 && chiwi.x < p.x + p.w + 25) { chiwi.y = p.y; chiwi.vy = 0; chiwi.aTerra = true; }
        });
      }
      // funghi: sono trampolini, basta toccarli per fare un salto altissimo
      L.funghi.forEach(function (f) {
        var top = TERRA_Y - T.trampolino.top;
        if (f.boing <= 0 && Math.abs(chiwi.x - f.x) < 50 && chiwi.y > top - 10 && chiwi.vy >= -200) {
          chiwi.y = Math.min(chiwi.y, top); chiwi.vy = -RIMBALZO; chiwi.tenuto = 0.3; chiwi.aTerra = false; f.boing = 0.5; chiwi.spinta = 1.6;
          Suoni.sfx("rimbalzo"); brilla(f.x, top, 8, "#ffc6dc");
        }
      });
      // con la supervelocità si corre anche sopra le buche, su una scia d'arcobaleno
      if (attivo("super") && chiwi.vy >= 0 && prima <= TERRA_Y + 2 && chiwi.y >= TERRA_Y) {
        chiwi.y = TERRA_Y; chiwi.vy = 0; chiwi.aTerra = true;
        if (!suTerra(chiwi.x)) chiwi.arcobaleno = 0.4;
      }
      if (eraATerra && !chiwi.aTerra) chiwi.coyote = 0.1;
      if (chiwi.aTerra) { chiwi.spinta = 1; chiwi.doppio = false; }
      if (chiwi.arcobaleno > 0) chiwi.arcobaleno -= dt;

      // caduto in una buca: si perde un cuore e si riparte dall'ultimo prato
      if (chiwi.y > ALTEZZA + 120) {
        cuori--; Suoni.sfx("errore");
        if (cuori <= 0) { termina(false); return; }
        // si riparte a terra, un bel po' prima del bordo, così c'è spazio per prendere la rincorsa
        var seg = L.terreno.filter(function (s) { return controllo >= s[0] && controllo <= s[1]; })[0] || L.terreno[0];
        var primaX = chiwi.x;
        chiwi.x = Math.max(seg[0] + 40, Math.min(controllo, seg[1]) - 320);
        if (fuga) distanza = Math.max(150, distanza - Math.max(0, primaX - chiwi.x) * 0.5);
        chiwi.y = TERRA_Y; chiwi.vy = 0; chiwi.aTerra = true; chiwi.invulnerabile = 1.8; pausa = 0.6; chiwi.spinta = 1;
        L.funghi.forEach(function (f) { f.boing = 0; });
      }

      // rovi
      L.rovi.forEach(function (r) {
        if (r.via || !(Math.abs(chiwi.x - r.x) < 42 && chiwi.y > TERRA_Y - 55)) return;
        if (attivo("super")) { r.via = true; punti += 2; bottino.petali++; scritta(r.x, TERRA_Y - 90, "+2"); brilla(r.x, TERRA_Y - 40, 12, "#ffd23f"); Suoni.sfx("pigna"); }
        else colpito();
      });
      // pigne: rotolano verso il Chiwinnie; saltandoci sopra si schiacciano
      L.pigne.forEach(function (p) {
        if (p.via) return;
        if (!p.attiva && p.x - chiwi.x < vistaW * 0.9) p.attiva = true;
        if (!p.attiva) return;
        p.x -= 150 * dt; p.rot -= 150 * dt / 24;
        if (!suTerra(p.x)) { p.vy += GRAVITA * dt; p.y += p.vy * dt; if (p.y > ALTEZZA + 100) p.via = true; return; }
        var dx = Math.abs(chiwi.x - p.x), dy = (p.y - 24) - (chiwi.y - 30);
        if (dx < 46 && Math.abs(dy) < 50) {
          if (attivo("super")) {
            p.via = true; punti += 2; bottino.petali++; scritta(p.x, p.y - 60, "+2"); brilla(p.x, p.y - 20, 12, "#ffd23f"); Suoni.sfx("presa");
          } else if (chiwi.vy > 0 && chiwi.y < p.y - 20) {
            p.via = true; chiwi.vy = -620; chiwi.schiaccia = 0.2;
            bottino.petali++; punti += 2; scritta(p.x, p.y - 60, "+2"); brilla(p.x, p.y - 20, 10, "#d9a066");
            Suoni.sfx("presa");
          } else colpito();
        }
      });
      // pesci: saltano fuori dall'acqua e ricadono; saltandoci sopra si rimbalza
      L.pesci.forEach(function (p) {
        p.alto = Math.max(0, Math.sin(tempo * 1.9 + p.fase)) * 230;
        p.y = TERRA_Y + 14 - p.alto;
        if (p.via || p.alto < 30) return;
        var dx = Math.abs(chiwi.x - p.x), dy = p.y - (chiwi.y - 30);
        if (dx < 40 && Math.abs(dy) < 42) {
          if (attivo("super")) {
            p.fase += 2; punti += 2; bottino.petali++; scritta(p.x, p.y - 50, "+2"); brilla(p.x, p.y, 10, "#ffd23f"); Suoni.sfx("rimbalzo");
          } else {
            // i pesci sono amici: toccarli fa sempre rimbalzare in avanti, oltre l'acqua
            chiwi.vy = -700; chiwi.aTerra = false; chiwi.spinta = Math.max(chiwi.spinta, 1.3); chiwi.schiaccia = 0.2; p.fase += 2; bottino.petali++; punti += 2;
            scritta(p.x, p.y - 50, "+2"); brilla(p.x, p.y, 10, "#bfe3ff"); Suoni.sfx("rimbalzo");
          }
        }
      });
      // nebbiolini: nuvolette grigie che fluttuano; saltandoci sopra fanno "puff"
      L.nebbiolini.forEach(function (n) {
        if (n.via) return;
        if (!n.attivo && n.x - chiwi.x < vistaW * 0.8) n.attivo = true;
        if (n.attivo) n.x -= 50 * dt;
        n.y = n.y0 + Math.sin(tempo * 2.2 + n.fase) * 30;
        var dx = Math.abs(chiwi.x - n.x), dy = n.y - (chiwi.y - 35);
        if (dx < 46 && Math.abs(dy) < 46) {
          if (attivo("super") || (chiwi.vy > 0 && chiwi.y - 35 < n.y - 8)) {
            n.via = true; n.puff = 0.01; punti += 2; bottino.petali++;
            if (!attivo("super")) { chiwi.vy = -650; chiwi.schiaccia = 0.2; }
            distanza = Math.min(DISTANZA_MAX, distanza + 50);
            scritta(n.x, n.y - 50, "Puff! +2"); brilla(n.x, n.y, 14, "#d9dce4"); Suoni.sfx("presa");
          } else colpito();
        }
        if (n.puff) n.puff += dt;
      });
      // la calamita attira i materiali vicini, e anche le stelle (che stanno più in alto: le prende da più lontano)
      if (attivo("calamita")) {
        L.oggetti.forEach(function (o) {
          if (o.preso) return;
          var dx = chiwi.x - o.x, dy = (chiwi.y - 35) - o.y;
          if (dx * dx + dy * dy < 260 * 260) { o.x += dx * Math.min(1, dt * 7); o.y += dy * Math.min(1, dt * 7); }
        });
        L.stelle.forEach(function (st) {
          if (st.presa) return;
          var dx = chiwi.x - st.x, dy = (chiwi.y - 35) - st.y;
          if (dx * dx + dy * dy < 420 * 420) { st.x += dx * Math.min(1, dt * 6); st.y += dy * Math.min(1, dt * 6); }
        });
      }
      L.poteri.forEach(function (pw) {
        if (pw.preso) return;
        if (Math.abs(chiwi.x - pw.x) < 50 && Math.abs((chiwi.y - 35) - pw.y) < 60) { pw.preso = true; attiva(pw.tipo); }
      });
      // oggetti da raccogliere
      L.oggetti.forEach(function (o) {
        if (o.preso) return;
        if (Math.abs(chiwi.x - o.x) < 42 && Math.abs((chiwi.y - 35) - o.y) < 52) {
          o.preso = true; bottino[o.k]++; punti++;
          scritta(o.x, o.y - 30, "+1"); brilla(o.x, o.y, 5); Suoni.sfx("presa");
        }
      });
      L.stelle.forEach(function (s) {
        if (s.presa) return;
        if (Math.abs(chiwi.x - s.x) < 55 && Math.abs((chiwi.y - 35) - s.y) < 60) {
          s.presa = true; stelleTrovate++; bottino.stelle++; punti += 5;
          scritta(s.x, s.y - 40, "⭐ " + stelleTrovate + "/3", "#c98a12"); brilla(s.x, s.y, 18, "#ffe27a"); Suoni.sfx("stella");
        }
      });
      L.funghi.forEach(function (f) { if (f.boing > 0) f.boing -= dt; });
      // traguardo
      if (chiwi.x >= L.traguardo - 40 && !arrivato) {
        arrivato = 0.001; Suoni.sfx("livello"); brilla(L.traguardo, TERRA_Y - 120, 30, "#ffd1e0");
      }
      api.info("❤️".repeat(Math.max(0, cuori)) + "  ⭐ " + stelleTrovate + "/3  ·  " + punti + (potere ? "  " + POTERI[potere.tipo].icona + " " + Math.ceil(potere.fino - tempo) : ""));
    }

    // ---------- Disegno ----------
    function img(im, x, y, w, h) { if (im.complete && im.naturalWidth) ctx.drawImage(im, x, y, w, h); }
    function larghezzaDa(im, h) { return im.naturalWidth ? im.naturalWidth / im.naturalHeight * h : h; }

    // una nuvoletta grigia (i nebbiolini e i bordi del Nebbione)
    function nuvolina(x, y, sc, alfa, faccia) {
      ctx.save(); ctx.globalAlpha = Math.max(0, alfa); ctx.translate(x, y); ctx.scale(sc, sc);
      // il nebbiolino dipinto, se l'immagine è pronta
      if (faccia && I.nebbiolino.complete && I.nebbiolino.naturalWidth) { ctx.drawImage(I.nebbiolino, -48, -38, 96, 75); ctx.restore(); return; }
      if (!faccia) {
        // il bordo del Nebbione: sbuffi di nebbia morbida, senza contorni
        [[-20, 8, 34], [20, 6, 32], [0, -10, 38]].forEach(function (c) {
          var g = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], c[2]);
          g.addColorStop(0, "rgba(170,174,186,.85)"); g.addColorStop(0.6, "rgba(185,189,200,.55)"); g.addColorStop(1, "rgba(200,204,214,0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c[0], c[1], c[2], 0, Math.PI * 2); ctx.fill();
        });
        ctx.restore(); return;
      }
      ctx.fillStyle = "#a7abb6";
      ctx.beginPath(); ctx.arc(-18, 6, 18, 0, Math.PI * 2); ctx.arc(18, 6, 18, 0, Math.PI * 2); ctx.arc(0, -6, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#c4c7d0";
      ctx.beginPath(); ctx.arc(-6, -12, 13, 0, Math.PI * 2); ctx.fill();
      if (faccia) {
        ctx.fillStyle = "#3c3f4a";
        ctx.beginPath(); ctx.arc(-8, 0, 4, 0, Math.PI * 2); ctx.arc(8, 0, 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#3c3f4a"; ctx.lineWidth = 3; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(-14, -9); ctx.lineTo(-3, -5); ctx.moveTo(14, -9); ctx.lineTo(3, -5); ctx.stroke();
      }
      ctx.restore();
    }

    function disegna() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      ctx.setTransform(dpr * scala, 0, 0, dpr * scala, 0, 0);
      var cam = chiwi.x - vistaW * 0.28;
      // cielo dietro a tutto, per lo spazio in più dei telefoni in verticale
      var cielo = ctx.createLinearGradient(0, 0, 0, vistaH);
      cielo.addColorStop(0, "#a9cbe6"); cielo.addColorStop(1, "#e9eccd");
      ctx.fillStyle = cielo; ctx.fillRect(0, 0, vistaW, vistaH);
      ctx.translate(0, alzo);

      // sfondo che scorre lento, ripetuto a specchio per non vedere giunture
      if (I.sfondo.naturalWidth) {
        var sh = ALTEZZA * 0.92 + alzo + 10, sw = larghezzaDa(I.sfondo, sh), off = (cam * 0.25) % (sw * 2);
        for (var i = -1; i < Math.ceil(vistaW / sw) + 2; i++) {
          var sx = i * sw - off;
          var sy = ALTEZZA * 0.92 - sh;
          // i riquadri si sovrappongono di 2 unità per non lasciare una riga chiara tra uno e l'altro
          if (((i % 2) + 2) % 2 === 1) { ctx.save(); ctx.translate(sx + sw + 1, 0); ctx.scale(-1, 1); ctx.drawImage(I.sfondo, 0, sy, sw + 2, sh); ctx.restore(); }
          else ctx.drawImage(I.sfondo, sx - 1, sy, sw + 2, sh);
        }
        // sotto lo sfondo, una nebbiolina verde per legare il prato
        var fondo = ALTEZZA * 0.92;
        var grad = ctx.createLinearGradient(0, fondo - 120, 0, ALTEZZA);
        grad.addColorStop(0, "rgba(" + T.nebbia + ",0)"); grad.addColorStop(1, "rgba(" + T.nebbia + ",1)");
        ctx.fillStyle = grad; ctx.fillRect(0, fondo - 120, vistaW, ALTEZZA - fondo + 120);
      }
      ctx.save(); ctx.translate(-cam, 0);

      // il ruscello: acqua che scorre sotto le rive
      if (T.acqua) {
        var liv = TERRA_Y + 12;
        var gacqua = ctx.createLinearGradient(0, liv, 0, ALTEZZA);
        gacqua.addColorStop(0, "#a9d8e8"); gacqua.addColorStop(1, "#5e9fc0");
        ctx.fillStyle = gacqua; ctx.fillRect(cam - 10, liv, vistaW + 20, ALTEZZA - liv + 40);
        ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 3;
        for (var ri = 0; ri < 14; ri++) {
          var rx = cam + ((ri * 137 - tempo * 60) % (vistaW + 200) + vistaW + 200) % (vistaW + 200) - 100, ry = liv + 14 + (ri % 4) * 22;
          ctx.beginPath(); ctx.moveTo(rx, ry); ctx.quadraticCurveTo(rx + 20, ry - 5, rx + 40, ry); ctx.stroke();
        }
      }

      // prato: striscia d'erba ripetuta e terra sotto
      var th = T.terreno.h, tw = larghezzaDa(I.terreno, th);
      L.terreno.forEach(function (s) {
        if (s[1] < cam - 50 || s[0] > cam + vistaW + 50) return;
        ctx.fillStyle = T.colTerra; ctx.fillRect(s[0] + 2, TERRA_Y - T.terreno.su + th * 0.6, s[1] - s[0] - 4, ALTEZZA);
        // della striscia si usa solo la parte centrale, e un pezzo sì e uno no è ribaltato: così le giunture non si vedono
        var nw = I.terreno.naturalWidth, nh = I.terreno.naturalHeight, x0 = nw * 0.05, usa = nw * 0.9, twu = tw * 0.9;
        for (var x = s[0], n = 0; x < s[1]; x += twu - 2, n++) {
          var w = Math.min(twu, s[1] - x);
          if (!nw) break;
          if (n % 2) { ctx.save(); ctx.translate(x + w, 0); ctx.scale(-1, 1); ctx.drawImage(I.terreno, x0 + usa - usa * (w / twu), 0, usa * (w / twu), nh, 0, TERRA_Y - T.terreno.su, w, th); ctx.restore(); }
          else ctx.drawImage(I.terreno, x0, 0, usa * (w / twu), nh, x, TERRA_Y - T.terreno.su, w, th);
        }
      });
      // piattaforme
      L.piattaforme.forEach(function (p) {
        if (p.x > cam + vistaW || p.x + p.w < cam) return;
        var im = I[p.tipo], h = p.w / (im.naturalWidth / im.naturalHeight || 3);
        img(im, p.x, p.y - h * T.piatt[p.tipo].top, p.w, h);
      });
      // funghi
      L.funghi.forEach(function (f) {
        var s = f.boing > 0 ? 1 + Math.sin(f.boing * 30) * 0.08 : 1;
        var h = T.trampolino.h / s, w = T.trampolino.w * s;
        img(I.fungo, f.x - w / 2, TERRA_Y + 8 - h, w, h);
      });
      if (I.rovo) L.rovi.forEach(function (r) { if (!r.via) img(I.rovo, r.x - T.ostacolo.w / 2, TERRA_Y + 8 - T.ostacolo.h, T.ostacolo.w, T.ostacolo.h); });
      L.pesci.forEach(function (p) {
        if (p.alto < 8) return;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.cos(tempo * 1.9 + p.fase) * -0.6);
        img(I.pesce, -T.pesce.w / 2, -T.pesce.h / 2, T.pesce.w, T.pesce.h); ctx.restore();
      });
      L.nebbiolini.forEach(function (n) {
        if ((n.via && (!n.puff || n.puff > 0.4)) || n.x < cam - 80 || n.x > cam + vistaW + 80) return;
        nuvolina(n.x, n.y, n.via ? 1 + n.puff * 3 : 1, n.via ? 1 - n.puff * 2.5 : 1, true);
      });
      L.pigne.forEach(function (p) {
        if (p.via || !I.pigna) return;
        ctx.save(); ctx.translate(p.x, p.y - 26); ctx.rotate(p.rot); img(I.pigna, -24, -26, 48, 54); ctx.restore();
      });
      var bob = Math.sin(tempo * 4) * 5;
      L.oggetti.forEach(function (o) {
        if (o.preso || o.x < cam - 40 || o.x > cam + vistaW + 40) return;
        img(I[o.k], o.x - 21, o.y - 21 + bob, 42, 42);
      });
      L.stelle.forEach(function (s) {
        if (s.presa) return;
        ctx.save(); ctx.globalAlpha = 0.35 + 0.2 * Math.sin(tempo * 5);
        ctx.fillStyle = "#fff3a0"; ctx.beginPath(); ctx.arc(s.x, s.y + bob, 48, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        img(I.stella, s.x - 32, s.y - 32 + bob, 64, 64);
      });
      // bolle dei superpoteri
      L.poteri.forEach(function (pw) {
        if (pw.preso || pw.x < cam - 60 || pw.x > cam + vistaW + 60) return;
        var py = pw.y + Math.sin(tempo * 3 + pw.x) * 8, P = POTERI[pw.tipo];
        ctx.save();
        ctx.globalAlpha = 0.85; ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.strokeStyle = P.colore; ctx.lineWidth = 5;
        ctx.shadowColor = P.colore; ctx.shadowBlur = 18;
        ctx.beginPath(); ctx.arc(pw.x, py, 34, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.font = "38px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(P.icona, pw.x, py + 2);
        ctx.restore();
      });
      img(I.cestino, L.traguardo - T.traguardo.w / 2, TERRA_Y + 10 - T.traguardo.h, T.traguardo.w, T.traguardo.h);

      // il Chiwinnie
      // scia d'arcobaleno sotto i piedi quando si corre sopra le buche
      if (chiwi.arcobaleno > 0) {
        ["#ff9aa2", "#ffd59a", "#fff3a0", "#b5ead7", "#a0c4ff", "#cdb4f6"].forEach(function (c, i) {
          ctx.fillStyle = c; ctx.globalAlpha = 0.8; ctx.fillRect(chiwi.x - 160, TERRA_Y + 2 + i * 5, 200, 5);
        });
        ctx.globalAlpha = 1;
      }
      if (attivo("super")) {
        brilla(chiwi.x - 30, chiwi.y - 30 - Math.random() * 40, 1, Math.random() < .5 ? "#ffd23f" : "#ffffff");
        // lineette di velocità
        ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 3;
        for (var li = 0; li < 4; li++) { var ly = chiwi.y - 20 - li * 18; ctx.beginPath(); ctx.moveTo(chiwi.x - 70 - li * 10, ly); ctx.lineTo(chiwi.x - 120 - li * 10, ly); ctx.stroke(); }
      }
      var posa = !chiwi.aTerra ? (chiwi.vy < 0 ? I.salto : I.caduta) : (Math.floor(tempo * (attivo("super") ? 16 : 9)) % 2 ? I.corsa1 : I.corsa2);
      if (!(chiwi.invulnerabile > 0 && Math.floor(tempo * 14) % 2)) {
        var ph = posa === I.corsa1 || posa === I.corsa2 ? 74 : 92, pw = larghezzaDa(posa, ph);
        var sq = chiwi.schiaccia > 0 ? 0.85 : 1;
        if (potere) { ctx.save(); ctx.shadowColor = POTERI[potere.tipo].colore; ctx.shadowBlur = 28; }
        img(posa, chiwi.x - pw / 2, chiwi.y - ph * sq + 4, pw, ph * sq);
        if (potere) ctx.restore();
        if (attivo("ali")) { ctx.font = "30px sans-serif"; ctx.textAlign = "center"; ctx.fillText("🪶", chiwi.x - pw / 2, chiwi.y - ph + 10); }
      }
      // scintille e scritte
      scintille.forEach(function (p) {
        p.t += 1 / 60; p.x += p.vx / 60; p.y += p.vy / 60; p.vy += 600 / 60;
        ctx.globalAlpha = Math.max(0, 1 - p.t * 1.4); ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      scintille = scintille.filter(function (p) { return p.t < 0.8; });
      scritte.forEach(function (s) {
        s.t += 1 / 60;
        ctx.globalAlpha = Math.max(0, 1 - s.t); ctx.fillStyle = s.c;
        ctx.font = "800 30px 'Baloo 2', sans-serif"; ctx.textAlign = "center";
        ctx.fillText(s.s, s.x, s.y - s.t * 50);
      });
      ctx.globalAlpha = 1;
      scritte = scritte.filter(function (s) { return s.t < 1; });
      if (fuga) {
        // il Nebbione: un muro di nebbia grigia che arriva da sinistra, con due occhi brontoloni
        var bordo = Math.max(cam + 26, chiwi.x - 20 - distanza * 0.5);   // disegnato un po' più vicino di quanto è: si vede arrivare
        var gn = ctx.createLinearGradient(bordo - 160, 0, bordo + 30, 0);
        gn.addColorStop(0, "rgba(150,154,166,.95)"); gn.addColorStop(1, "rgba(150,154,166,0)");
        ctx.fillStyle = gn; ctx.fillRect(cam - 10, -alzo, bordo + 40 - cam, ALTEZZA + alzo);
        for (var nb = 0; nb < 6; nb++) nuvolina(bordo - 40 + Math.sin(tempo * 1.5 + nb) * 12, 80 + nb * 85, 1.5, 0.85, false);
        if (bordo > cam + 60 && I.nebbione.naturalWidth) {
          // il Nebbione in persona, che si affaccia dalla nebbia
          var nw = 190, nh = nw * I.nebbione.naturalHeight / I.nebbione.naturalWidth;
          img(I.nebbione, bordo - nw * 0.75, TERRA_Y - 300 + Math.sin(tempo * 2) * 10, nw, nh);
        }
      }
      ctx.restore();

      // barra del superpotere attivo
      if (potere) {
        var P2 = POTERI[potere.tipo], rest = Math.max(0, (potere.fino - tempo) / P2.durata);
        ctx.setTransform(dpr * scala, 0, 0, dpr * scala, 0, dpr * scala * alzo);
        ctx.fillStyle = "rgba(255,250,242,.85)"; ctx.fillRect(20, 70 - alzo + 0, 220, 26);
        ctx.fillStyle = P2.colore; ctx.fillRect(52, 78 - alzo, 180 * Math.min(1, rest), 10);
        ctx.font = "20px sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#4a3b30";
        ctx.fillText(P2.icona, 26, 83 - alzo);
      }
      // barra di avanzamento in basso
      ctx.setTransform(dpr * scala, 0, 0, dpr * scala, 0, dpr * scala * alzo);
      var prog = Math.min(1, chiwi.x / L.traguardo);
      ctx.fillStyle = "rgba(255,250,242,.8)"; ctx.fillRect(20, ALTEZZA - 22, vistaW - 40, 8);
      ctx.fillStyle = "#e8b64a"; ctx.fillRect(20, ALTEZZA - 22, (vistaW - 40) * prog, 8);
    }

    function ciclo(ora) {
      if (finito) return;
      var dt = Math.min(0.033, (ora - ultimo) / 1000); ultimo = ora;
      aggiorna(dt);
      if (!finito) disegna();
      raf = requestAnimationFrame(ciclo);
    }
    if (api.turbo) attiva("super", 5);
    raf = requestAnimationFrame(ciclo);
    // per i test dalla console
    window.chiwinnieArcade = { chiwi: chiwi, livello: L, info: function () { return { cuori: cuori, punti: punti, stelle: stelleTrovate, arrivato: !!arrivato, nebbione: Math.round(distanza) }; }, premi: giu, lascia: su, potere: function () { return potere; }, avvicina: function (d) { distanza = d; }, passo: function (dt) { if (!finito) { aggiorna(dt); if (!finito) disegna(); } } };

    function pulisci() {
      finito = true; cancelAnimationFrame(raf);
      window.removeEventListener("resize", misura);
      window.removeEventListener("pointerup", su);
      window.removeEventListener("keydown", tasto); window.removeEventListener("keyup", tasto);
    }
    function termina(arrivo) {
      if (finito) return;
      pulisci();
      if (arrivo) { bottino.spinaci += 2; bottino.legnetti += 2; }
      api.fine({
        punti: punti + (arrivo ? 10 : 0), bottino: bottino, completato: arrivo, stelleLivello: stelleTrovate, tema: tema,
        titolo: fuga ? (arrivo ? "Sei sfuggito al Nebbione!" : "Il Nebbione ti ha preso!") : arrivo ? (stelleTrovate === 3 ? T.perfetto : T.arrivo) : "Che peccato!",
        messaggio: arrivo ? "Hai raccolto " + punti + " cose e trovato " + stelleTrovate + (stelleTrovate === 1 ? " stella" : " stelle") + " su 3. Bonus arrivo: +2 spinaci e +2 legnetti."
          : "I cuori sono finiti, ma tutto quello che hai raccolto resta tuo. Riprova!"
      });
    }
    return pulisci;
  }

  Minigiochi.bosco = function (area, api) { return avventura(area, api, livelloBosco, TEMI.bosco); };
  Minigiochi.ruscello = function (area, api) { return avventura(area, api, livelloRuscello, TEMI.ruscello); };
  Minigiochi.collina = function (area, api) { return avventura(area, api, livelloCollina, TEMI.collina); };
  Minigiochi.cielo = function (area, api) { return avventura(area, api, livelloCielo, TEMI.cielo); };
  // la Fuga sceglie a caso il paesaggio fra le zone già aperte
  Minigiochi.fuga = function (area, api) {
    var temi = ["bosco"].concat((api.zoneAperte || []).filter(function (z) { return TEMI[z]; }));
    var tema = temi[Math.floor(Math.random() * temi.length)], T = TEMI[tema];
    var L = function () { return mettiPoteri(livelloFuga(T, 30000), ["super", "calamita", "ali", "super", "ali", "calamita", "super"], [0.1, 0.22, 0.36, 0.5, 0.64, 0.77, 0.9]); };
    return avventura(area, api, L, T, true, tema);
  };
  // la sfida finale di un capitolo: una Fuga più lunga nel paesaggio della zona, con il Nebbione alle calcagna
  Minigiochi.sfida = function (area, api) {
    var tema = TEMI[api.tema] ? api.tema : "bosco", T = TEMI[tema];
    var lungo = api.finale ? 42000 : 36000;
    var L = function () { return mettiPoteri(livelloFuga(T, lungo), ["super", "calamita", "ali", "super", "ali", "calamita", "super", "ali"], [0.08, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.92]); };
    var fine = api.fine;
    var api2 = Object.assign({}, api, {
      fine: function (ris) {
        ris.sfida = true; ris.tema = null;   // la sfida finale non conta come avventura del paesaggio
        ris.titolo = ris.completato ? (api.finale ? "Sei arrivato al Castello!" : "Hai scacciato il Nebbione!") : "Il Nebbione ti ha preso!";
        ris.messaggio = ris.completato ? (api.finale ? "Ora tocca a tutti i Chiwinnie insieme…" : "La lanterna si è accesa e il Nebbione è scappato!")
          : "Non arrenderti: tutto quello che hai raccolto resta tuo. Riprova!";
        fine(ris);
      }
    });
    return avventura(area, api2, L, T, true, tema);
  };
})();
