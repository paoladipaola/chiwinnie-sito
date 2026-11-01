// Aggiustatutto: nel Bosco Giardino qualcosa si è rotto e il Chiwinnie deve aggiustarlo.
// Tre passi, quattro scelte per passo: si sceglie tutta la combinazione, poi si prova.
// Se qualcosa va storto si vede che cosa (con una piccola disavventura) e si riprova: le scelte giuste restano.
(function () {
  function mescola(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function vibra(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }

  // o(emoji, testo, giusta?, cosa succede se è sbagliata)
  function o(e, t, ok, oops) { return { e: e, t: t, ok: !!ok, oops: oops || "" }; }
  var GUASTI = [
    { id: "tetto", img: "img/zona1/icone/casetta.png", titolo: "Il buco nel tetto",
      problema: "Stanotte è piovuto e dal tetto della casetta gocciola acqua sul letto!",
      passi: [
        { domanda: "Come sali sul tetto?", scelte: [o("🪜", "La scala", 1), o("🎈", "Un palloncino", 0, "Il palloncino vola via col Chiwinnie… e lo lascia cadere nel laghetto. Splash!"), o("🪑", "Una sedia traballante", 0, "La sedia traballa e il Chiwinnie finisce col sedere nell'orto!"), o("🦘", "Saltando fortissimo", 0, "Salta, salta, salta… ma il tetto è troppo alto!")] },
        { domanda: "Con cosa copri il buco?", scelte: [o("🪵", "Una tegola di corteccia", 1), o("🍂", "Una foglia secca", 0, "Alla prima pioggia la foglia si sbriciola: gocciola di nuovo!"), o("🍪", "Un biscotto", 0, "Il biscotto si inzuppa e arrivano tutte le formiche del bosco!"), o("📄", "Un foglio di carta", 0, "La carta si bagna e si scioglie come zucchero!")] },
        { domanda: "Come la fissi?", scelte: [o("🍯", "Con la resina di pino", 1), o("🫧", "Con le bolle di sapone", 0, "Le bolle fanno pop… e la tegola scivola giù!"), o("🍝", "Con gli spaghetti", 0, "Gli spaghetti scivolano via: la tegola cade in testa al Chiwinnie. Bonk!"), o("🎀", "Con un fiocco", 0, "Il fiocco è bellissimo, ma il vento si porta via tutto!")] }
      ], fatto: "Il tetto è come nuovo e il letto resta asciutto. Che bravo aggiustatutto!" },
    { id: "ponte", img: "img/zona1/icone/ponte.png", titolo: "Il ponticello traballa",
      problema: "Il ponticello sul ruscello scricchiola e traballa: un'asse si è rotta!",
      passi: [
        { domanda: "Cosa fai per prima cosa?", scelte: [o("🔍", "Guardi bene le assi", 1), o("🎵", "Canti una canzone al ponte", 0, "Il ponte ascolta volentieri… ma continua a traballare!"), o("🏃", "Ci corri sopra veloce", 0, "Crack! Il Chiwinnie si ritrova con una zampa nell'acqua!"), o("😴", "Fai un pisolino", 0, "Ronf… quando ti svegli il ponte traballa ancora!")] },
        { domanda: "Cosa ti serve?", scelte: [o("🪵", "Un'asse nuova", 1), o("🥖", "Un filone di pane", 0, "Il pane è buono, ma le anatre se lo mangiano in un attimo!"), o("🧸", "Un orsacchiotto", 0, "L'orsacchiotto è troppo morbido: ci si affonda dentro!"), o("🌾", "Un ciuffo d'erba", 0, "L'erba si piega appena ci metti la zampa!")] },
        { domanda: "Con quale attrezzo?", scelte: [o("🔨", "Martello e chiodi", 1), o("🥄", "Un cucchiaio", 0, "Tic, tic, tic… col cucchiaio ci vorrebbe un anno!"), o("🪶", "Una piuma", 0, "La piuma fa solo il solletico all'asse!"), o("🧦", "Un calzino", 0, "Il calzino non attacca niente… ed è pure bucato!")] }
      ], fatto: "Il ponticello è solido e non scricchiola più. Si può attraversare saltellando!" },
    { id: "altalena", img: "img/zona1/icone/altalena.png", titolo: "L'altalena rotta",
      problema: "Una corda dell'altalena si è spezzata e il sedile penzola storto.",
      passi: [
        { domanda: "Come arrivi al ramo?", scelte: [o("🪜", "Con la scala", 1), o("🐿️", "Ti fai portare dallo scoiattolo", 0, "Lo scoiattolo ci prova, ma il Chiwinnie è troppo morbidoso e pesante!"), o("🌀", "Girando su te stesso", 0, "Gira gira… e cade a terra con la testa che fa il girotondo!"), o("🪁", "Con un aquilone", 0, "L'aquilone si impiglia nel ramo pure lui!")] },
        { domanda: "Con cosa sostituisci la corda?", scelte: [o("🪢", "Una corda robusta", 1), o("🧶", "Un filo di lana", 0, "Appena ti siedi, il filo di lana si spezza. Patapum!"), o("🍝", "Uno spaghetto lungo", 0, "Lo spaghetto si rompe e una gazza se lo porta via!"), o("🌼", "Una catena di margherite", 0, "Bellissima… ma i fiori si staccano al primo dondolo!")] },
        { domanda: "Come la leghi?", scelte: [o("🔗", "Con un doppio nodo stretto", 1), o("🎀", "Con un fiocchetto", 0, "Il fiocchetto si scioglie al primo dondolo!"), o("🩹", "Con un cerotto", 0, "Il cerotto si stacca e l'altalena cade di nuovo storta!"), o("🍬", "Con una caramella", 0, "La caramella è appiccicosa, ma non abbastanza!")] }
      ], fatto: "L'altalena dondola dritta e va altissima. Wiii!" },
    { id: "lanterne", img: "img/zona1/icone/lanterne.png", titolo: "Le lanterne spente",
      problema: "Si fa buio e le lanterne del sentiero sono tutte spente!",
      passi: [
        { domanda: "Cosa manca nella lanterna?", scelte: [o("✨", "Una lucina nuova", 1), o("🧊", "Un cubetto di ghiaccio", 0, "Il ghiaccio fa freddo, non fa luce! E si scioglie pure."), o("🥕", "Una carota", 0, "Una carota nella lanterna? Il coniglio è contento, ma resta buio!"), o("🧦", "Un calzino", 0, "Il calzino non fa luce… e fa anche un po' di puzza!")] },
        { domanda: "Chi la può accendere?", scelte: [o("🐛", "Le lucciole amiche", 1), o("💨", "Soffiandoci dentro", 0, "Soffiando non si accende niente, anzi: si spegne tutto!"), o("🌧️", "Una nuvola di pioggia", 0, "Piove dentro la lanterna: tutto bagnato e sempre buio!"), o("🐌", "La lumaca", 0, "La lumaca è gentile ma arriverà… domani mattina!")] },
        { domanda: "Come la riappendi?", scelte: [o("🪝", "Al suo gancio", 1), o("🧈", "Con il burro", 0, "Il burro scivola e la lanterna cade nel prato!"), o("🎈", "Legata a un palloncino", 0, "La lanterna vola via nel cielo come una stella!"), o("🦶", "Tenendola col piede", 0, "Il Chiwinnie resta su una zampa tutta la notte. Che fatica!")] }
      ], fatto: "Il sentiero brilla di luci dorate. Le lucciole sono felicissime!" },
    { id: "orto", img: "img/zona1/icone/orto.png", titolo: "Gli spinaci appassiti",
      problema: "Gli spinaci dell'orto sono mosci e tristi. Il Chiwinnie ha fame!",
      passi: [
        { domanda: "Di cosa hanno bisogno prima di tutto?", scelte: [o("🚿", "Di acqua fresca", 1), o("🥤", "Di limonata", 0, "La limonata è troppo zuccherosa: arrivano le vespe!"), o("🧂", "Di sale", 0, "Il sale fa male alle piantine: si afflosciano ancora di più!"), o("🎶", "Di musica rock", 0, "Gli spinaci ballano un pochino… ma restano assetati!")] },
        { domanda: "Cosa metti nella terra?", scelte: [o("🍂", "Foglie e terriccio buono", 1), o("🍫", "Cioccolato", 0, "Il cioccolato si scioglie al sole e attira tutte le formiche!"), o("🪨", "Sassi", 0, "Con i sassi le radici non riescono a crescere!"), o("🧼", "Sapone", 0, "Bolle dappertutto! Le piantine fanno il bagno, ma non crescono.")] },
        { domanda: "Come gli dai più sole?", scelte: [o("✂️", "Poti i rami che fanno ombra", 1), o("🕶️", "Metti gli occhiali da sole all'orto", 0, "Gli spinaci con gli occhiali sono buffissimi… ma vedono ancora meno sole!"), o("☂️", "Apri un ombrellone", 0, "L'ombrellone fa ancora più ombra!"), o("🛏️", "Li copri con una coperta", 0, "Sotto la coperta è buio buio!")] }
      ], fatto: "Gli spinaci sono verdi e croccanti. Gnam, che pranzo!" },
    { id: "mulino", img: "img/zona2/icone/rusc_mulino.png", titolo: "Il mulino fermo",
      problema: "La ruota del mulino ad acqua si è fermata di colpo!", zona: "ruscello",
      passi: [
        { domanda: "Come arrivi alla ruota?", scelte: [o("🛶", "Con la barchetta", 1), o("🏊", "A nuoto", 0, "Brrr! L'acqua è gelida: il Chiwinnie diventa un batuffolo bagnato!"), o("🐸", "In groppa alla rana", 0, "La rana fa un salto enorme e il Chiwinnie vola nelle ninfee!"), o("🪁", "Con l'aquilone", 0, "Senza vento l'aquilone non si alza neanche un po'!")] },
        { domanda: "Cosa blocca la ruota?", scelte: [o("🪵", "Un ramo incastrato", 1), o("🐟", "Un pesce", 0, "Il pesce non c'entra niente: ti fa uno spruzzo e scappa!"), o("🌸", "Una ninfea", 0, "Le ninfee sono troppo leggere per fermare una ruota!"), o("🌙", "La luna", 0, "La luna è lassù in cielo, non dentro il mulino!")] },
        { domanda: "Come la fai ripartire?", scelte: [o("🤲", "Con una spinta gentile", 1), o("📣", "Urlandole contro", 0, "La ruota non ha orecchie: resta ferma e offesa!"), o("🎻", "Suonando il violino", 0, "Bella musica, ma la ruota non si muove!"), o("🍦", "Offrendole un gelato", 0, "Il gelato cade nel ruscello e se lo mangiano i pesci!")] }
      ], fatto: "La ruota gira di nuovo: splash, splash, splash! Il mulino macina felice." },
    { id: "arnie", img: "img/zona3/icone/coll_arnie.png", titolo: "Il tetto delle api",
      problema: "Il vento ha fatto cadere il tettuccio dell'arnia e le api sono preoccupate.", zona: "collina",
      passi: [
        { domanda: "Come ti avvicini?", scelte: [o("🐢", "Piano piano, in silenzio", 1), o("🏃", "Di corsa", 0, "Bzzz! Le api si spaventano e ronzano tutte intorno al Chiwinnie!"), o("🥁", "Suonando il tamburo", 0, "Bum bum! Le api si tappano le orecchie e si arrabbiano!"), o("🙈", "A occhi chiusi", 0, "Il Chiwinnie inciampa nella lavanda!")] },
        { domanda: "Cosa porti in regalo alle api?", scelte: [o("🌼", "Un mazzo di fiori", 1), o("🧀", "Un pezzo di formaggio", 0, "Le api non mangiano il formaggio: fanno una faccia schifata!"), o("🍕", "Una pizza", 0, "Pizza alle api? Arriva solo un topolino contentissimo!"), o("🧦", "Un calzino", 0, "Un calzino? Le api non sanno proprio cosa farci!")] },
        { domanda: "Come rimetti il tettuccio?", scelte: [o("👐", "Con delicatezza", 1), o("💥", "Sbattendolo forte", 0, "Bang! Le api saltano per lo spavento!"), o("🦵", "Con un calcio", 0, "Il tettuccio vola nel campo di girasoli!"), o("🎩", "Lanciandolo come un cappello", 0, "Il tettuccio atterra… in testa al Chiwinnie!")] }
      ], fatto: "Le api ronzano felici e regalano al Chiwinnie una goccia di miele!" },
    { id: "aquilone", img: "img/zona3/icone/coll_aquiloni.png", titolo: "L'aquilone impigliato",
      problema: "L'aquilone si è impigliato in cima alla grande quercia!", zona: "collina",
      passi: [
        { domanda: "Chi ti può aiutare lassù?", scelte: [o("🦉", "Il gufo", 1), o("🐌", "La lumaca", 0, "La lumaca parte decisa… arriverà in cima la prossima estate!"), o("🐟", "Un pesce", 0, "Un pesce sulla quercia? Non sa neanche arrampicarsi!"), o("🐄", "Una mucca", 0, "La mucca guarda l'albero e dice muuu. Non aiuta molto.")] },
        { domanda: "Con cosa lo sganci?", scelte: [o("🎣", "Una canna lunga", 1), o("🍌", "Una banana", 0, "La banana è troppo corta… e il gufo se la mangia!"), o("🥄", "Un cucchiaino", 0, "Il cucchiaino non arriva neanche al primo ramo!"), o("🧻", "La carta igienica", 0, "La carta si impiglia anche lei: ora l'albero sembra decorato!")] },
        { domanda: "Dove lo fai volare dopo?", scelte: [o("🌾", "Nel prato aperto", 1), o("🌳", "Sotto gli alberi", 0, "Zac! L'aquilone si impiglia di nuovo nei rami!"), o("🏠", "Dentro la casetta", 0, "In casa non c'è vento: l'aquilone resta per terra!"), o("🌧️", "Sotto la pioggia", 0, "L'aquilone si bagna e diventa pesante come una frittella!")] }
      ], fatto: "L'aquilone vola altissimo sopra la collina. Che spettacolo!" },
    { id: "mongolfiera", img: "img/zona4/icone/cielo_mongolfiera.png", titolo: "La mongolfiera sgonfia",
      problema: "La mongolfiera del Celeste si sta sgonfiando: c'è un buchino da qualche parte!", zona: "cielo",
      passi: [
        { domanda: "Come trovi il buchino?", scelte: [o("🫧", "Con acqua e sapone: guardi dove fa le bolle", 1), o("👃", "Annusando", 0, "Il Chiwinnie annusa tutto… ma l'aria non ha odore!"), o("🎧", "Ascoltando la musica", 0, "Bella canzone! Ma il buchino resta nascosto."), o("🙈", "Coprendoti gli occhi", 0, "Con gli occhi coperti non si trova proprio niente!")] },
        { domanda: "Con cosa lo chiudi?", scelte: [o("🧵", "Ago, filo e una toppa di stoffa", 1), o("🍕", "Una fetta di pizza", 0, "La pizza non tappa i buchi… e ora la mongolfiera profuma di pomodoro!"), o("🩴", "Una ciabatta", 0, "La ciabatta cade giù dalle nuvole. Ciao ciabatta!"), o("🌿", "Una foglia", 0, "La foglia vola via al primo soffio!")] },
        { domanda: "Come la rigonfi?", scelte: [o("🔥", "Con l'aria calda del bruciatore", 1), o("😮‍💨", "Soffiando tu", 0, "Fiuuu… a forza di soffiare il Chiwinnie diventa tutto rosso!"), o("🐘", "Chiedi all'elefante", 0, "L'elefante soffia così forte che la mongolfiera fa una capriola!"), o("❄️", "Con l'aria fredda", 0, "L'aria fredda pesa: la mongolfiera non si alza!")] }
      ], fatto: "La mongolfiera è gonfia e pronta a volare tra le nuvole!" },
    { id: "fontana", img: "img/zona4/icone/cielo_fontana.png", titolo: "La fontana muta",
      problema: "La fontana delle nuvole non zampilla più!", zona: "cielo",
      passi: [
        { domanda: "Dove guardi per prima cosa?", scelte: [o("🔍", "Dentro il beccuccio", 1), o("🌈", "Sull'arcobaleno", 0, "L'arcobaleno è bellissimo, ma la fontana resta muta!"), o("🛏️", "Sotto il letto", 0, "Sotto il letto ci sono solo calzini spaiati!"), o("🌙", "Sulla luna", 0, "La luna è troppo lontana: il Chiwinnie si stanca a metà strada!")] },
        { domanda: "Cosa c'è incastrato?", scelte: [o("⭐", "Una stellina caduta", 1), o("🐋", "Una balena", 0, "Una balena in una fontanella? Non ci starebbe mai!"), o("🎂", "Una torta", 0, "Nessuna torta, purtroppo… il Chiwinnie ci sperava!"), o("🚂", "Un trenino", 0, "Ciuf ciuf? No, nella fontana non ci sono treni!")] },
        { domanda: "Come la tiri fuori?", scelte: [o("🤏", "Con due dita, piano piano", 1), o("💣", "Con un gran botto", 0, "Bum! Spruzzi dappertutto e la stellina si incastra di più!"), o("🧲", "Con una calamita", 0, "Le stelline non sono di ferro: la calamita non le attira!"), o("🦖", "Chiamando un dinosauro", 0, "Il dinosauro ha le zampette troppo corte!")] }
      ], fatto: "La stellina torna in cielo e la fontana zampilla scintille d'argento!" }
  ];

  // Il palcoscenico di ogni guasto: lo sfondo, l'oggetto rotto e l'effetto che fa vedere il problema.
  var SCENE = {
    // rotto = il quadro con il guasto (dipinto apposta), fisso = lo stesso quadro aggiustato; senza "rotto" il guasto lo fanno vedere gli effetti
    // chiwi = dove sta il Chiwinnie [left, bottom] in %; fx = dove stanno gli effetti piccoli [left, top] in %
    tetto:       { fisso: "img/casa/interno.jpg", pos: "50% 18%", effetto: "pioggia", chiwi: [38, 6] },
    altalena:    { rotto: "img/aggiusta/altalena_rotto.jpg", fisso: "img/aggiusta/altalena.jpg", chiwi: [32, 2] },
    ponte:       { rotto: "img/aggiusta/ponte_rotto.jpg", fisso: "img/aggiusta/ponte.jpg", chiwi: [70, 10] },
    fontana:     { rotto: "img/aggiusta/fontana_rotto.jpg", fisso: "img/aggiusta/fontana.jpg", chiwi: [62, 2] },
    lanterne:    { fisso: "img/aggiusta/lanterne.jpg", effetto: "buio", chiwi: [64, 4] },
    orto:        { rotto: "img/aggiusta/orto_rotto.jpg", fisso: "img/aggiusta/orto.jpg", chiwi: [62, 2] },
    mulino:      { fisso: "img/aggiusta/mulino.jpg", effetto: "fermo", chiwi: [8, 2], fx: [64, 66] },
    arnie:       { rotto: "img/aggiusta/arnie_rotto.jpg", fisso: "img/aggiusta/arnie.jpg", chiwi: [72, 2] },
    aquilone:    { rotto: "img/aggiusta/aquilone_rotto.jpg", fisso: "img/aggiusta/aquilone.jpg", chiwi: [40, 2] },
    mongolfiera: { rotto: "img/aggiusta/mongolfiera_rotto.jpg", fisso: "img/aggiusta/mongolfiera.jpg", chiwi: [44, 2] }
  };
  // che disavventura mostrare per una scelta sbagliata: si capisce dalle parole della sua storia
  function tipoGuaio(t) {
    t = t.toLowerCase();
    if (/formiche/.test(t)) return "formiche";
    if (/bzzz|api /.test(t)) return "ronza";
    if (/vola via|vola nel|cielo come|capriola|vola col/.test(t)) return "vola";
    if (/splash|laghetto|nuoto|gelida|ninfee|ruscello/.test(t)) return "splash";
    if (/bonk|in testa/.test(t)) return "bonk";
    if (/bum|bang|botto/.test(t)) return "boom";
    if (/sedere|cade|patapum|inciampa|crack|girotondo|terra/.test(t)) return "cade";
    if (/vento|soffio|scivol|si stacca|si scioglie|si spezza|si rompe|sbriciola/.test(t)) return "vento";
    return "nulla";
  }
  function sparsi(box, simbolo, n, classe) {
    for (var i = 0; i < n; i++) {
      var e = document.createElement("i"); e.className = "fx " + classe; e.textContent = simbolo;
      e.style.left = (8 + Math.random() * 84) + "%"; e.style.animationDelay = (Math.random() * 1.2) + "s";
      box.appendChild(e);
    }
  }

  Minigiochi.aggiustatutto = function (area, api) {
    var aperte = api.zoneAperte || ["radura"], fatti = api.aggiustati || [];
    var possibili = GUASTI.filter(function (g) { return !g.zona || aperte.indexOf(g.zona) !== -1; });
    // prima i guasti mai aggiustati, poi si ricomincia
    var nuovi = possibili.filter(function (g) { return fatti.indexOf(g.id) === -1; });
    var G = mescola((nuovi.length ? nuovi : possibili).slice())[0];
    var S = SCENE[G.id];
    var passi = G.passi.map(function (p) { return { domanda: p.domanda, scelte: mescola(p.scelte.slice()) }; });
    var scelte = [null, null, null], bloccati = [false, false, false], passo = 0, tentativi = 0, finito = false, occupato = false, timers = [];
    var MAX = 3;
    function dopo(ms, f) { timers.push(setTimeout(f, ms)); }

    var box = document.createElement("div");
    box.className = "rompicapo aggiusta";
    // il palcoscenico resta sempre lo stesso; sotto cambiano le domande
    var stilePos = "object-position:" + (S.pos || "50% 50%");
    box.innerHTML = "<div class='palco problema-" + (S.effetto || "quadro") + "'>" +
      "<img class='palco-sfondo' src='" + (S.rotto || S.fisso) + "' alt='' style='" + stilePos + "'>" +
      (S.rotto ? "<img class='palco-fisso' src='" + S.fisso + "' alt='' style='" + stilePos + "'>" : "") +
      "<div class='palco-effetti'></div>" +
      "<div class='palco-attore' style='left:" + S.chiwi[0] + "%;bottom:" + S.chiwi[1] + "%'><div class='vestito'><img src='" + immagineChiwi(api.colore, "fronte") + "' alt=''><div class='look'></div></div><div class='palco-borsa'></div></div>" +
      "<div class='palco-fumetto'></div>" +
      "</div><div class='aggiusta-sotto'></div>";
    area.appendChild(box);
    var palco = box.querySelector(".palco"), effetti = box.querySelector(".palco-effetti"), sotto = box.querySelector(".aggiusta-sotto");
    if (window.Look && api.look) Look.disegna(box.querySelector(".palco-attore .look"), api.look);
    preparaProblema();

    function preparaProblema() {
      effetti.innerHTML = "";
      var e = S.effetto;
      if (e === "pioggia") {
        effetti.innerHTML = "<div class='buco'></div><div class='pozza'></div>";
        for (var i = 0; i < 9; i++) { var g = document.createElement("i"); g.className = "goccia"; g.style.left = (46 + Math.random() * 10) + "%"; g.style.animationDelay = (i * 0.17) + "s"; effetti.appendChild(g); }
      }
      if (e === "api") sparsi(effetti, "🐝", 5, "ape");
      var dove = S.fx ? " style='left:" + S.fx[0] + "%;top:" + S.fx[1] + "%'" : "";
      if (e === "impigliato") effetti.innerHTML = "<i class='fx aquilone-impigliato'" + dove + ">🪁</i>";
      if (e === "sgonfio") effetti.innerHTML = "<i class='fx sbuffo'" + dove + ">💨</i><i class='fx sbuffo s2'" + dove + ">💨</i>";
      if (e === "buio") effetti.innerHTML = "<div class='notte'></div>";
      if (e === "fermo") effetti.innerHTML = "<i class='fx ramo'" + dove + ">🪵</i>";
      fumetto({ quadro: { altalena: "La mia altalena si è rotta…", ponte: "Il ponticello è rotto!", fontana: "La fontana non zampilla più…",
        orto: "Poveri spinaci, sono tutti mosci…", arnie: "Il tetto delle api è caduto!", aquilone: "Il mio aquilone è lassù sull'albero!", mongolfiera: "La mongolfiera si sta sgonfiando!" }[G.id], pioggia: "Ploc… ploc… mi piove in testa!", traballa: "Aiuto, traballa tutto!", penzola: "La mia altalena è storta…", buio: "Che buio… ho un po' paura!",
        appassito: "Poveri spinaci, sono tristi…", fermo: "La ruota non gira più!", api: "Le api sono preoccupate…", impigliato: "Il mio aquilone è lassù!",
        sgonfio: "La mongolfiera perde aria!" }[e || "quadro"] || G.problema, 3500);
    }
    function fumetto(t, ms) {
      var f = palco.querySelector(".palco-fumetto"); f.textContent = t; f.classList.add("su");
      clearTimeout(f._t); f._t = setTimeout(function () { f.classList.remove("su"); }, ms || 2800);
    }
    // gli attrezzi scelti finora stanno accanto al Chiwinnie
    function borsa() {
      box.querySelector(".palco-borsa").innerHTML = scelte.map(function (s, i) {
        return s === null ? "" : "<span data-i='" + i + "'>" + passi[i].scelte[s].e + "</span>";
      }).join("");
    }
    function info() { api.info("🔧 " + (MAX - tentativi) + (MAX - tentativi === 1 ? " prova" : " prove")); }
    function pallini() {
      return "<div class='aggiusta-passi'>" + passi.map(function (p, i) {
        var s = scelte[i];
        return "<button data-p='" + i + "' class='" + (i === passo ? "ora " : "") + (bloccati[i] ? "giusto" : "") + "'>" + (s !== null ? p.scelte[s].e : i + 1) + "</button>";
      }).join("<span>›</span>") + "</div>";
    }
    function mostraPasso() {
      var p = passi[passo];
      sotto.innerHTML = "<h2>" + esc(G.titolo) + "</h2>" + pallini() +
        "<p class='domanda'>" + (passo + 1) + ". " + esc(p.domanda) + "</p><div class='aggiusta-scelte'>" +
        p.scelte.map(function (c, i) { return "<button data-s='" + i + "' class='" + (scelte[passo] === i ? "scelta" : "") + "'><b>" + c.e + "</b>" + esc(c.t) + "</button>"; }).join("") + "</div>";
    }
    function riepilogo() {
      sotto.innerHTML = "<h2>" + esc(G.titolo) + "</h2>" + pallini() + "<p class='domanda'>Ecco il piano. Funzionerà?</p>" +
        "<div class='azioni-pannello'><button class='btn verde' data-azione='prova'>🔧 Prova ad aggiustare!</button></div>";
    }
    sotto.addEventListener("click", function (e) {
      if (finito || occupato) return;
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.s !== undefined) {
        scelte[passo] = +b.dataset.s; Suoni.sfx("presa"); borsa();
        var prossimo = scelte.indexOf(null);
        if (prossimo === -1) riepilogo(); else { passo = prossimo; mostraPasso(); }
      } else if (b.dataset.p !== undefined) {
        var i = +b.dataset.p; if (bloccati[i]) return;
        passo = i; Suoni.sfx("gira"); mostraPasso();
      } else if (b.dataset.azione === "prova") prova();
      else if (b.dataset.azione === "riprova") { passo = scelte.indexOf(null); mostraPasso(); }
    });

    // ---------- la prova, passo per passo, tutta animata ----------
    function prova() {
      occupato = true; tentativi++; info();
      sotto.innerHTML = "<h2>" + esc(G.titolo) + "</h2><p class='domanda'>Il Chiwinnie si mette al lavoro… 🔨</p>";
      var i = 0;
      (function prossimo() {
        if (i >= 3) return dopo(300, vittoria);
        var c = passi[i].scelte[scelte[i]], attrezzo = box.querySelector(".palco-borsa [data-i='" + i + "']");
        palco.classList.add("al-lavoro");
        if (attrezzo) attrezzo.classList.add("usa");
        Suoni.sfx("gira");
        dopo(800, function () {
          if (c.ok) {
            bloccati[i] = true; brilla(); Suoni.sfx("presa");
            if (attrezzo) attrezzo.classList.add("fatto");
            i++; dopo(500, prossimo);
          } else guaio(i, c, attrezzo);
        });
      })();
    }
    function brilla() { sparsi(effetti, "✨", 4, "scintilla"); }
    function guaio(i, c, attrezzo) {
      var tipo = tipoGuaio(c.oops);
      palco.classList.remove("al-lavoro");
      palco.classList.add("guaio-" + tipo);
      if (tipo === "formiche") sparsi(effetti, "🐜", 7, "formica");
      if (tipo === "ronza") sparsi(effetti, "🐝", 6, "ape-arrabbiata");
      if (tipo === "splash") sparsi(effetti, "💦", 6, "spruzzo");
      if (tipo === "bonk") sparsi(effetti, "💫", 3, "stelline");
      if (tipo === "boom") sparsi(effetti, "💥", 3, "botto");
      if (tipo === "cade") sparsi(effetti, "⭐", 3, "stelline");
      if (tipo === "vento") sparsi(effetti, "🍃", 5, "foglia");
      if (tipo === "vola") { var pal = document.createElement("i"); pal.className = "fx in-volo"; pal.textContent = c.e; effetti.appendChild(pal); }
      if (attrezzo) attrezzo.classList.add("perso");
      fumetto(c.oops, 3200);
      Suoni.sfx("errore"); vibra(80);
      dopo(1900, function () {
        palco.className = "palco problema-" + (S.effetto || "quadro");
        preparaProblema();
        // le scelte sbagliate (e quelle dopo) si tolgono; quelle già provate e giuste restano
        passi.forEach(function (p, k) { if (!bloccati[k]) scelte[k] = null; });
        borsa(); occupato = false;
        if (tentativi >= MAX) return sconfitta(c.oops);
        var giusti = bloccati.filter(Boolean).length;
        sotto.innerHTML = "<h2>Oh no!</h2><div class='oops'>" + esc(c.oops) + "</div>" + pallini() +
          "<p class='domanda'>" + (giusti ? (giusti === 1 ? "Un passo era giusto" : giusti + " passi erano giusti") + ": restano col segno verde." : "Pensaci bene e riprova!") + "</p>" +
          "<div class='azioni-pannello'><button class='btn' data-azione='riprova'>Riprova (" + (MAX - tentativi) + ")</button></div>";
      });
    }
    function vittoria() {
      finito = true; Suoni.sfx("coppia"); vibra(40);
      palco.classList.remove("al-lavoro", "problema-" + (S.effetto || "quadro"));
      palco.classList.add("risolto", "risolto-" + (S.effetto || "quadro"));
      effetti.innerHTML = "";
      if (S.effetto === "api") sparsi(effetti, "🍯", 2, "scintilla");
      sparsi(effetti, "✨", 8, "scintilla");
      box.querySelector(".palco-borsa").innerHTML = "";
      fumetto("Evviva, aggiustato!", 3000);
      sotto.innerHTML = "<h2>" + esc(G.titolo) + "</h2><div class='evviva'>✨ " + esc(G.fatto) + "</div>";
      var primo = tentativi === 1;
      dopo(2600, function () {
        api.fine({
          punti: primo ? 20 : tentativi === 2 ? 14 : 10, completato: true, guasto: G.id, primoColpo: primo,
          bottino: { legnetti: 3, sassolini: 2, petali: primo ? 2 : 1, stelle: primo ? 1 : 0 },
          titolo: primo ? "Aggiustato al primo colpo!" : "Aggiustato!",
          messaggio: G.fatto + (primo ? " Al primo tentativo: una stella in regalo!" : "")
        });
      });
    }
    function sconfitta(oops) {
      finito = true;
      var giusto = passi.map(function (p) { var c = p.scelte.filter(function (x) { return x.ok; })[0]; return c.e + " " + c.t; });
      dopo(400, function () {
        api.fine({
          punti: 4, completato: false, bottino: { legnetti: 1 },
          titolo: "Quasi!",
          messaggio: "Il piano giusto era: " + giusto.join(" → ") + ". La prossima volta ce la fai!"
        });
      });
    }
    info(); mostraPasso();
    return function () { finito = true; timers.forEach(clearTimeout); };
  };
})();
