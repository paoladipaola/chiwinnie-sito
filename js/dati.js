// Dati del gioco: materiali, costruzioni, livelli, sfide, identità della specie.
// Tutto ciò che si bilancia (costi, tempi, premi) sta qui.

var MATERIALI = {
  spinaci:   { nome: "Spinaci",   img: "img/spinaci.png" },
  petali:    { nome: "Petali",    img: "img/petali.png" },
  legnetti:  { nome: "Legnetti",  img: "img/legnetti.png" },
  sassolini: { nome: "Sassolini", img: "img/sassolini.png" },
  stelle:    { nome: "Stelle",    img: "img/stella.png" }
};
var ORDINE_MATERIALI = ["spinaci", "petali", "legnetti", "sassolini", "stelle"];

// Bastano per la prima casetta e un'aiuola; poi si gioca per guadagnare il resto.
var MATERIALI_INIZIALI = { spinaci: 6, petali: 4, legnetti: 11, sassolini: 3, stelle: 0 };

// Le zone del Bosco Giardino. Ogni zona è un quadro unico: si parte dalla versione vuota
// e ogni pezzo costruito compare esattamente dove il pittore l'ha messo.
// pos: [x, y, larghezza, altezza] del ritaglio, in % del quadro.
// tocco: rettangoli [x1, y1, x2, y2] in % dove il pezzo risponde al dito.
// bolla: dove compare la bolla dei materiali pronti.
var MINUTO = 60 * 1000;
var ZONE = [
  {
    id: "radura", nome: "La Radura", musica: "radura", sfondo: "img/zona1/vuota.jpg", cartella: "img/zona1/",
    descrizione: "Una radura nel bosco, dove il tuo Chiwinnie ha deciso di vivere.",
    // zona dove il Chiwinnie passeggia
    prato: { x1: 18, x2: 82, y1: 54, y2: 80 },
    pezzi: {
      casetta: {
        nome: "Casetta di muschio", livello: 1, costo: { legnetti: 8, sassolini: 2 }, xp: 20,
        pos: [35.87, 26.6, 45.83, 26.34], tocco: [[37.5, 33.5, 71.5, 52]],
        descrizione: "La casa del tuo Chiwinnie, con il tetto di muschio e le rose sui muri."
      },
      orto: {
        nome: "Orto di spinaci", livello: 1, costo: { legnetti: 3, spinaci: 3 }, xp: 12,
        pos: [9.83, 49.09, 38.8, 14.83], tocco: [[12, 50, 46, 62]], bolla: [29, 51],
        produce: { materiale: "spinaci", ogni: 2 * MINUTO, max: 5 },
        descrizione: "Gli spinaci crescono da soli: il tuo Chiwinnie non resterà mai a digiuno."
      },
      sentiero: {
        nome: "Sentiero di pietre", livello: 1, costo: { sassolini: 3 }, xp: 8, richiede: "casetta",
        pos: [40.89, 49.6, 19.73, 9.3], tocco: [[43, 51, 58, 58]],
        descrizione: "Pietre piatte dalla porta di casa fino al prato."
      },
      aiuole: {
        nome: "Aiuole fiorite", livello: 2, costo: { petali: 4 }, xp: 12,
        pos: [49.93, 52.11, 37.24, 13.3], tocco: [[52, 53, 85, 64]], bolla: [76, 53],
        produce: { materiale: "petali", ogni: 3 * MINUTO, max: 4 },
        descrizione: "Due aiuole piene di fiori. Ogni tanto lasciano cadere dei petali."
      },
      panchina: {
        nome: "Panchina", livello: 2, costo: { legnetti: 5 }, xp: 10,
        pos: [24.87, 62.61, 23.31, 10.79], tocco: [[27, 64, 46, 72]],
        descrizione: "Per riposarsi a guardare il giardino."
      },
      lanterne: {
        nome: "Lanterne di pietra", livello: 2, costo: { sassolini: 5, legnetti: 2 }, xp: 10,
        pos: [14.32, 59.63, 80.86, 25.22], tocco: [[16, 60.5, 27, 71.5], [83, 73, 93.5, 84]],
        descrizione: "Due lanterne antiche che si accendono al tramonto."
      },
      cestino: {
        nome: "Cestino dei fiori", livello: 3, costo: { petali: 5, legnetti: 3 }, xp: 15, richiede: "casetta",
        pos: [58.33, 45.09, 17.32, 10.79], tocco: [[60, 46, 74, 55]], ricarica: true,
        descrizione: "Il cestino dei fiori preferiti: il tuo Chiwinnie ci si riposa e recupera energia da solo."
      },
      altalena: {
        nome: "Altalena", livello: 3, costo: { legnetti: 8 }, xp: 12,
        pos: [16.34, 25.58, 16.86, 24.85], tocco: [[18, 26.5, 31.5, 49.5]],
        descrizione: "Appesa al ramo più forte del grande albero."
      },
      laghetto: {
        nome: "Laghetto delle ninfee", livello: 3, costo: { sassolini: 8, petali: 2 }, xp: 15,
        pos: [55.92, 63.63, 36.72, 17.26], tocco: [[57, 65, 90, 79]], bolla: [74, 66],
        produce: { materiale: "sassolini", ogni: 5 * MINUTO, max: 3 },
        descrizione: "Un piccolo stagno con le ninfee. Sulla riva si trovano sassolini lisci."
      },
      albero: {
        nome: "Ciliegio in fiore", livello: 4, costo: { petali: 6, sassolini: 3 }, xp: 15,
        pos: [67.45, 27.14, 32.55, 30.78], tocco: [[69, 33, 100, 49]], bolla: [85, 36],
        produce: { materiale: "legnetti", ogni: 4 * MINUTO, max: 3 },
        descrizione: "Un ciliegio sempre fiorito, con le rose bianche intorno. Lascia cadere rametti."
      },
      ponte: {
        nome: "Ponticello", livello: 4, costo: { legnetti: 12, sassolini: 4 }, xp: 18,
        pos: [6.38, 76.6, 48.31, 18.86], tocco: [[8, 78, 53, 94]],
        descrizione: "Un ponte di legno sopra il ruscello. Chissà dove porta…"
      },
      lampioni: {
        nome: "Lampioni", livello: 5, costo: { sassolini: 8, legnetti: 6, stelle: 2 }, xp: 18,
        pos: [0, 60.1, 61.2, 32.3], tocco: [[1, 63, 14, 91], [50.5, 61, 59.5, 89]],
        descrizione: "Lampioni di ferro con l'edera, per le passeggiate della sera."
      },
      funghi: {
        nome: "Funghi luminosi", livello: 5, costo: { petali: 8, stelle: 2 }, xp: 18,
        pos: [55.92, 78.6, 16.73, 11.3], tocco: [[56, 80, 70, 88.5]],
        descrizione: "Funghi magici che brillano piano, vicino al ruscello."
      },
      panchina2: {
        nome: "Panchina del ciliegio", livello: 6, costo: { legnetti: 8 }, xp: 12, richiede: "albero",
        pos: [70.9, 47.6, 16.21, 8.28], tocco: [[73, 48.5, 85, 55]],
        descrizione: "Una panchina all'ombra dei fiori di ciliegio."
      },
      siepe_sinistra: {
        nome: "Siepe di rose bianche", livello: 6, costo: { petali: 10, stelle: 3 }, xp: 20,
        pos: [0, 30.6, 19.66, 35.36], tocco: [[0, 31.5, 18, 64]],
        descrizione: "Rose bianche rampicanti e ortensie rosa sul lato del bosco."
      },
      siepe_destra: {
        nome: "Siepe di ortensie", livello: 6, costo: { petali: 10, stelle: 3 }, xp: 20,
        pos: [81.9, 56.1, 18.1, 19.84], tocco: [[84, 57, 100, 75]],
        descrizione: "Un'ondata di ortensie rosa e lilla vicino al laghetto."
      }
    }
  },
  {
    id: "ruscello", nome: "Il Ruscello", musica: "riva", sfondo: "img/zona2/vuota.jpg", cartella: "img/zona2/",
    descrizione: "Oltre il ponticello, il ruscello scende tra i sassi verso una cascata.",
    // due rive: il Chiwinnie passeggia su quella di destra o su quella di sinistra
    prati: [{ x1: 62, x2: 90, y1: 45, y2: 72 }, { x1: 8, x2: 26, y1: 60, y2: 74 }],
    pezzi: {
      rusc_mulino: {
        nome: "Mulino ad acqua", livello: 7, costo: { legnetti: 15, sassolini: 6 }, xp: 30,
        pos: [57.88, 17.08, 37.83, 25.36], tocco: [[60, 18, 94, 41]],
        descrizione: "Una casetta col tetto di muschio e la ruota che gira nel ruscello."
      },
      rusc_ponte: {
        nome: "Ponte di pietra", livello: 7, costo: { sassolini: 10 }, xp: 20,
        pos: [34.38, 41.61, 34.31, 10.83], tocco: [[37, 43, 66, 51]],
        descrizione: "Un piccolo ponte ad arco per passare da una riva all'altra."
      },
      rusc_orto: {
        nome: "Orto sul ruscello", livello: 7, costo: { legnetti: 5, spinaci: 4 }, xp: 15,
        pos: [68.36, 73.07, 31.64, 11.88], tocco: [[71, 74, 99, 83]], bolla: [85, 74],
        produce: { materiale: "spinaci", ogni: 2 * MINUTO, max: 6 },
        descrizione: "Un orto rialzato: con l'acqua vicina gli spinaci crescono ancora meglio."
      },
      rusc_sassi: {
        nome: "Passerella di sassi", livello: 8, costo: { sassolini: 8 }, xp: 15,
        pos: [27.86, 66.61, 35.81, 8.83], tocco: [[30, 68, 61, 74]], bolla: [46, 67],
        produce: { materiale: "sassolini", ogni: 4 * MINUTO, max: 4 },
        descrizione: "Sassi piatti per attraversare il ruscello saltellando."
      },
      rusc_molo: {
        nome: "Molo e barchetta", livello: 8, costo: { legnetti: 10 }, xp: 18,
        pos: [16.86, 52.58, 28.84, 9.85], tocco: [[19, 54, 44, 61]],
        descrizione: "Un piccolo molo di legno con una barchetta per le gite sull'acqua."
      },
      rusc_salice: {
        nome: "Salice piangente", livello: 8, costo: { petali: 8, sassolini: 4 }, xp: 20,
        pos: [0.33, 21.11, 38.35, 29.8], tocco: [[4, 24, 35, 48]], bolla: [20, 30],
        produce: { materiale: "legnetti", ogni: 4 * MINUTO, max: 4 },
        descrizione: "Un salice che accarezza l'acqua con i suoi rami lunghi."
      },
      rusc_lampioni: {
        nome: "Lampioni del ruscello", livello: 9, costo: { sassolini: 10, legnetti: 6, stelle: 2 }, xp: 20,
        pos: [19.4, 31.61, 64.78, 56.29], tocco: [[76, 33, 82, 44], [21, 60, 29, 77], [61, 61, 70, 86]],
        descrizione: "Tre lampioni di ferro che si specchiano nell'acqua."
      },
      rusc_panchina: {
        nome: "Panchina di pietra", livello: 9, costo: { sassolini: 6 }, xp: 12,
        pos: [68.82, 62.1, 18.36, 10.28], tocco: [[72, 64, 85, 71]],
        descrizione: "Per sedersi ad ascoltare il rumore dell'acqua."
      },
      rusc_ninfee: {
        nome: "Ninfee e fiori di loto", livello: 9, costo: { petali: 8, stelle: 1 }, xp: 18,
        pos: [16.34, 79.61, 29.3, 15.26], tocco: [[20, 82, 42, 93]], bolla: [31, 82],
        produce: { materiale: "petali", ogni: 3 * MINUTO, max: 5 },
        descrizione: "Ninfee galleggianti e fiori di loto rosa."
      },
      rusc_pergola: {
        nome: "Pergola di glicine", livello: 10, costo: { legnetti: 12, petali: 10, stelle: 2 }, xp: 25,
        pos: [68.88, 42.59, 31.12, 16.86], tocco: [[71, 44, 100, 58]],
        descrizione: "Una pergola coperta di grappoli di glicine viola."
      },
      rusc_lanterne: {
        nome: "Lanterne sull'acqua", livello: 10, costo: { petali: 8, stelle: 3 }, xp: 22, richiede: "rusc_molo",
        pos: [46.88, 52.58, 17.84, 9.85], tocco: [[49, 54, 62, 61]],
        descrizione: "Lanterne di carta che galleggiano piano sul ruscello."
      },
      rusc_iris: {
        nome: "Iris e canne", livello: 10, costo: { petali: 10 }, xp: 18,
        pos: [0, 77.11, 84.7, 21.84], tocco: [[0, 80, 20, 97], [55, 79, 82, 92]],
        descrizione: "Iris viola e canne che ondeggiano sulle rive."
      },
      rusc_amaca: {
        nome: "Amaca tra le betulle", livello: 11, costo: { legnetti: 10, stelle: 3 }, xp: 25,
        pos: [0, 42.59, 21.68, 38.37], tocco: [[0, 44, 20, 79]],
        descrizione: "Un'amaca appesa tra due betulle, per i sonnellini del pomeriggio."
      },
      rusc_ortensie: {
        nome: "Ortensie blu", livello: 11, costo: { petali: 14, stelle: 3 }, xp: 25,
        pos: [82.88, 56.58, 17.12, 17.37], tocco: [[85, 58, 100, 72]],
        descrizione: "Grandi cespugli di ortensie blu sulla riva."
      }
    }
  },
  {
    id: "collina", nome: "La Collina dei fiori", musica: "prato", sfondo: "img/zona3/vuota.jpg", cartella: "img/zona3/",
    descrizione: "Un prato in salita pieno di fiori, dove soffia sempre il vento.",
    prati: [{ x1: 10, x2: 88, y1: 46, y2: 92 }],
    pezzi: {
      coll_mulino: {
        nome: "Mulino a vento", livello: 11, costo: { legnetti: 18, sassolini: 8 }, xp: 35,
        pos: [38.35, 11.59, 26.82, 20.86], tocco: [[40, 12.5, 63.5, 31.5]],
        descrizione: "Un mulino con le pale di tela che girano al vento della collina."
      },
      coll_serra: {
        nome: "Serra di vetro", livello: 11, costo: { legnetti: 8, sassolini: 6, spinaci: 4 }, xp: 25,
        pos: [2.86, 33.58, 37.3, 16.86], tocco: [[4.5, 34.5, 38.5, 49.5]], bolla: [20, 36],
        produce: { materiale: "spinaci", ogni: 2 * MINUTO, max: 7 },
        descrizione: "Una piccola serra dove gli spinaci crescono anche d'inverno."
      },
      coll_sentiero: {
        nome: "Sentiero della collina", livello: 11, costo: { sassolini: 10 }, xp: 18,
        pos: [37.89, 59.59, 43.82, 21.84], tocco: [[39.5, 63, 70.5, 80.5]], bolla: [55, 66],
        produce: { materiale: "sassolini", ogni: 4 * MINUTO, max: 4 },
        descrizione: "Pietre piatte che scendono a serpentina lungo la collina."
      },
      coll_girasoli: {
        nome: "Campo di girasoli", livello: 12, costo: { petali: 10, spinaci: 4 }, xp: 22,
        pos: [39.84, 39.61, 32.36, 14.35], tocco: [[41.5, 40.5, 70, 53]], bolla: [56, 41],
        produce: { materiale: "petali", ogni: 3 * MINUTO, max: 6 },
        descrizione: "Girasoli alti che seguono il sole tutto il giorno."
      },
      coll_arnie: {
        nome: "Arnie colorate", livello: 12, costo: { legnetti: 10, petali: 6 }, xp: 20,
        pos: [23.37, 55.6, 34.83, 10.86], tocco: [[25, 56.5, 56.5, 65.5]],
        descrizione: "Tre casette dipinte per le api della collina."
      },
      coll_picnic: {
        nome: "Picnic sul prato", livello: 12, costo: { petali: 6, spinaci: 6 }, xp: 18,
        pos: [1.89, 68.6, 41.28, 11.85], tocco: [[3.5, 69.5, 41.5, 79.5]],
        descrizione: "Una coperta a quadretti, un cestino e il tè per due."
      },
      coll_quercia: {
        nome: "Grande quercia", livello: 13, costo: { petali: 12, sassolini: 6, stelle: 2 }, xp: 28,
        pos: [64.39, 12.1, 35.61, 31.36], tocco: [[66, 13, 100, 42.5]], bolla: [84, 22],
        produce: { materiale: "legnetti", ogni: 4 * MINUTO, max: 5 },
        descrizione: "Una quercia antica con la casetta per gli uccellini."
      },
      coll_lavanda: {
        nome: "Filari di lavanda", livello: 13, costo: { petali: 12 }, xp: 20,
        pos: [0, 47.6, 37.17, 15.84], tocco: [[0, 48.5, 33, 62.5]],
        descrizione: "File di lavanda viola che profumano tutta la collina."
      },
      coll_girandole: {
        nome: "Girandole", livello: 13, costo: { petali: 8, legnetti: 6 }, xp: 18,
        pos: [40.89, 78.6, 28.32, 13.34], tocco: [[42.5, 79.5, 61, 91]],
        descrizione: "Girandole colorate che girano a ogni soffio di vento."
      },
      coll_gazebo: {
        nome: "Gazebo bianco", livello: 14, costo: { legnetti: 16, petali: 10, stelle: 3 }, xp: 30,
        pos: [61.85, 40.59, 38.15, 21.84], tocco: [[69, 41.5, 95.5, 61.5]],
        descrizione: "Un gazebo di legno bianco circondato di fiori."
      },
      coll_rose: {
        nome: "Arco di rose", livello: 14, costo: { petali: 14, stelle: 2 }, xp: 25,
        pos: [68.36, 62.61, 31.64, 20.82], tocco: [[70, 63.5, 100, 82.5]],
        descrizione: "Un arco coperto di rose rosa rampicanti."
      },
      coll_panchina: {
        nome: "Panchina panoramica", livello: 14, costo: { legnetti: 10 }, xp: 18,
        pos: [59.9, 84.59, 34.31, 13.84], tocco: [[61.5, 85.5, 92.5, 97.5]],
        descrizione: "Da qui si vede tutto il Bosco Giardino."
      },
      coll_aquiloni: {
        nome: "Aquiloni", livello: 15, costo: { petali: 10, legnetti: 6, stelle: 3 }, xp: 28,
        pos: [4.36, 2.58, 36.33, 31.36], tocco: [[6, 3.5, 39, 22]],
        descrizione: "Due aquiloni che volano alti nel vento della collina."
      },
      coll_lanterne: {
        nome: "Lanterne di carta", livello: 15, costo: { petali: 12, stelle: 3 }, xp: 28,
        pos: [0, 77.58, 39.19, 22.42], tocco: [[0, 78.5, 37.5, 100]],
        descrizione: "Lanterne di carta appese che si accendono la sera."
      }
    }
  },
  {
    id: "cielo", nome: "Il Cielo del Celeste", musica: "nuvole", sfondo: "img/zona4/vuota.jpg", cartella: "img/zona4/",
    descrizione: "Sopra le nuvole, dove vola il rarissimo Chiwinnie Celeste.",
    prati: [{ x1: 14, x2: 86, y1: 47, y2: 94 }],
    pezzi: {
      cielo_nido: {
        nome: "Nido di piume", livello: 15, costo: { petali: 16, legnetti: 10 }, xp: 35,
        pos: [29.82, 41.06, 41.34, 17.37], tocco: [[31.5, 42, 69.5, 57.5]],
        descrizione: "Un grande nido di piume morbide: qui dorme il Chiwinnie Celeste."
      },
      cielo_arcobaleno: {
        nome: "Arcobaleno", livello: 15, costo: { petali: 12, sassolini: 6 }, xp: 28,
        pos: [4.88, 74.6, 42.32, 12.83], tocco: [[6.5, 75.5, 45.5, 86.5]], bolla: [26, 76],
        produce: { materiale: "petali", ogni: 3 * MINUTO, max: 7 },
        descrizione: "Un arcobaleno che spunta dalle nuvole e lascia cadere petali colorati."
      },
      cielo_giardino: {
        nome: "Giardino fluttuante", livello: 15, costo: { spinaci: 8, petali: 8 }, xp: 25,
        pos: [17.9, 9.59, 33.27, 12.86], tocco: [[19.5, 10.5, 49.5, 21.5]], bolla: [34, 11],
        produce: { materiale: "spinaci", ogni: 2 * MINUTO, max: 8 },
        descrizione: "Un giardino sospeso su una nuvola, pieno di fiori che brillano."
      },
      cielo_castello: {
        nome: "Castello di nuvole", livello: 16, costo: { sassolini: 16, legnetti: 12, stelle: 3 }, xp: 40,
        pos: [48.89, 64.61, 38.28, 16.82], tocco: [[52, 66, 82, 80]],
        descrizione: "Un piccolo castello di nuvole con le torri color pastello."
      },
      cielo_scala: {
        nome: "Scala di nuvole", livello: 16, costo: { sassolini: 10, petali: 6 }, xp: 25,
        pos: [35.87, 19.59, 31.32, 14.86], tocco: [[37.5, 20.5, 65.5, 33.5]], bolla: [52, 22],
        produce: { materiale: "sassolini", ogni: 4 * MINUTO, max: 5 },
        descrizione: "Gradini soffici che salgono verso le stelle."
      },
      cielo_isola: {
        nome: "Isola volante", livello: 16, costo: { legnetti: 12, petali: 8 }, xp: 25,
        pos: [4.88, 50.11, 24.28, 19.84], tocco: [[6.5, 51, 27.5, 69]], bolla: [17, 52],
        produce: { materiale: "legnetti", ogni: 4 * MINUTO, max: 5 },
        descrizione: "Un'isoletta che galleggia nell'aria con un ciliegio in fiore."
      },
      cielo_lanterne: {
        nome: "Lanterne volanti", livello: 17, costo: { petali: 12, stelle: 2 }, xp: 25,
        pos: [34.9, 57.59, 23.31, 17.84], tocco: [[36.5, 58.5, 56.5, 74.5]],
        descrizione: "Lanterne di carta che salgono piano verso il cielo."
      },
      cielo_fontana: {
        nome: "Fontana di stelle", livello: 17, costo: { sassolini: 12, stelle: 3 }, xp: 30,
        pos: [10.87, 29.11, 22.33, 14.83], tocco: [[12.5, 30, 31.5, 43]],
        descrizione: "Una fontana di luce che zampilla stelline."
      },
      cielo_stelle: {
        nome: "Festone di stelle", livello: 17, costo: { petali: 10, legnetti: 6 }, xp: 22,
        pos: [67.9, 32.09, 30.27, 14.86], tocco: [[69.5, 33, 96.5, 46]],
        descrizione: "Stelle d'oro appese tra due pali sottili."
      },
      cielo_ponte: {
        nome: "Ponte d'arcobaleno", livello: 18, costo: { petali: 14, sassolini: 8, stelle: 3 }, xp: 30,
        pos: [60.87, 52.11, 37.3, 9.85], tocco: [[62.5, 53, 96.5, 61]],
        descrizione: "Un piccolo arcobaleno che fa da ponte tra due nuvole."
      },
      cielo_altalena: {
        nome: "Altalena tra le nuvole", livello: 18, costo: { legnetti: 12, stelle: 3 }, xp: 28,
        pos: [70.9, 14.1, 26.3, 16.35], tocco: [[72.5, 15, 95.5, 29.5]],
        descrizione: "Un'altalena appesa a una nuvoletta."
      },
      cielo_campanelle: {
        nome: "Campanelle di cristallo", livello: 18, costo: { sassolini: 10, petali: 8 }, xp: 25,
        pos: [3.84, 16.61, 16.34, 14.35], tocco: [[5.5, 17.5, 18.5, 30]],
        descrizione: "Campanelle di cristallo che suonano con il vento."
      },
      cielo_mongolfiera: {
        nome: "Mongolfiera", livello: 19, costo: { legnetti: 16, petali: 12, stelle: 4 }, xp: 35,
        pos: [80.86, 66.61, 17.32, 13.34], tocco: [[82.5, 67.5, 96.5, 79]],
        descrizione: "Una mongolfiera a righe per esplorare il cielo."
      },
      cielo_luna: {
        nome: "Panchina della luna", livello: 19, costo: { sassolini: 14, petali: 14, stelle: 5 }, xp: 40,
        pos: [49.87, 2.58, 26.3, 14.35], tocco: [[51.5, 3.5, 74.5, 16]],
        descrizione: "Una panchina sotto una falce di luna, il posto più alto del Bosco Giardino."
      }
    }
  }
];

// Esperienza necessaria per raggiungere ogni livello (indice = livello).
var LIVELLI_XP = [0, 0, 30, 80, 150, 250, 380, 550, 760, 1000, 1300, 1650, 2050, 2500, 3000, 3600, 4300, 5100, 6000, 7000];

var MINIGIOCHI = {
  bosco: {
    nome: "Avventura nel Bosco", img: "img/bosco/corsa1.png", livello: 1, energia: 20, arcade: true,
    descrizione: "Il Chiwinnie corre nel bosco! Tocca lo schermo per saltare: tenendo premuto salti più in alto. Prendi i materiali, rimbalza sui funghi, schiaccia le pigne saltandoci sopra, evita i rovi e le buche. In fondo ti aspetta il cestino dei fiori. Ci sono 3 stelle nascoste!"
  },
  ruscello: {
    nome: "Avventura nel Ruscello", img: "img/ruscello/pesce.png", livello: 1, zona: "ruscello", energia: 20, arcade: true,
    descrizione: "Il Chiwinnie salta di riva in riva! Usa ninfee e sassi per attraversare l'acqua, rimbalza sui fiori di loto e attento ai pesci che saltano (saltandoci sopra rimbalzi). In fondo ti aspetta la barchetta. Ci sono 3 stelle nascoste!"
  },
  collina: {
    nome: "Avventura sulla Collina", img: "img/collina/soffione.png", livello: 1, zona: "collina", energia: 20, arcade: true,
    descrizione: "Il Chiwinnie corre tra i fiori della collina! Sali sulle balle di fieno, vola sulle nuvolette con i soffioni, salta il fieno che rotola e attento ai cardi spinosi. In fondo ti aspetta la girandola gigante. Ci sono 3 stelle nascoste!"
  },
  cielo: {
    nome: "Avventura nel Cielo", img: "img/cielo/molla.png", livello: 1, zona: "cielo", energia: 20, arcade: true,
    descrizione: "Il Chiwinnie corre sulle nuvole! Salta sui ponti d'arcobaleno sopra il vuoto, rimbalza sulle molle a stella ed evita le nuvolette di tuono. In fondo ti aspetta la porta d'oro. Ci sono 3 stelle nascoste!"
  },
  colora: {
    nome: "Pagine da colorare", img: "img/colora/mini_copertina.png", livello: 1, energia: 0,
    descrizione: "Scegli un disegno del Chiwinnie e coloralo: tocca una zona per riempirla di colore, oppure usa il pennello. Il disegno resta salvato e puoi continuarlo quando vuoi."
  },
  raccolta: {
    nome: "Raccolta nel bosco", img: "img/spinaci.png", livello: 1, energia: 20,
    descrizione: "Prendi spinaci, legnetti e sassolini che cadono dagli alberi. Attento alle pigne!"
  },
  memory: {
    nome: "Memory dei fiori", img: "img/petali.png", livello: 2, energia: 15,
    descrizione: "Trova le coppie prima che finisca il tempo. Ogni coppia vale petali."
  },
  lucciole: {
    nome: "Lucciole", img: "img/lucciola.png", livello: 4, energia: 15,
    descrizione: "È sera nel bosco: tocca le lucciole prima che si spengano."
  },
  sudoku: {
    nome: "Sudoku dei fiori", img: "img/stella.png", livello: 2, energia: 10, rompicapo: true,
    descrizione: "Una griglia 4×4 con spinaci, petali, stelle e lucciole. Tocca una casella vuota e scegli il simbolo: in ogni riga, in ogni colonna e in ogni quadrato ogni simbolo va una volta sola."
  },
  puzzle: {
    nome: "Puzzle del Bosco", img: "img/puzzle/radura.jpg", livello: 3, energia: 10, rompicapo: true,
    descrizione: "Un quadro del Bosco Giardino si è mescolato! Tocca le tessere vicine al buco per farle scorrere e rimetti il disegno in ordine. Ogni zona che apri aggiunge un quadro nuovo."
  },
  aggiustatutto: {
    nome: "Aggiustatutto", img: "img/zona1/icone/casetta.png", livello: 2, energia: 10, rompicapo: true,
    descrizione: "Qualcosa si è rotto nel Bosco Giardino! Aiuta il Chiwinnie a scegliere cosa fare in tre passi, con quattro idee per passo. Poi prova il tuo piano: se qualcosa va storto scopri cosa è successo e riprovi. Hai 3 prove."
  },
  labirinto: {
    nome: "Labirinto delle siepi", img: "img/spinaci.png", livello: 3, energia: 10, rompicapo: true,
    descrizione: "Porta il Chiwinnie al cestino degli spinaci tra le siepi. Scorri il dito o usa le frecce: corre da solo fino al prossimo incrocio. Raccogli i 5 petali lungo la strada!"
  },
  fuga: {
    nome: "Fuga dal Nebbione", img: "img/bosco/corsa2.png", livello: 2, energia: 20, arcade: true,
    descrizione: "Il Nebbione ti insegue! Corri più veloce che puoi in una lunga avventura che cambia ogni volta: salta le buche, schiaccia i nebbiolini grigi saltandoci sopra e prendi i superpoteri. Se il Nebbione ti raggiunge perdi un cuore. In fondo ti aspetta una lucina!"
  },
  tris: {
    nome: "Tris di fiori", img: "img/petali.png", livello: 2, energia: 10,
    descrizione: "Scambia due simboli vicini per metterne tre uguali in fila: spariscono e ne cadono di nuovi. Con quattro in fila nasce un soffione che pulisce tutta la riga! Raccogli quello che chiede il Chiwinnie prima che finiscano le mosse."
  },
  conti: {
    nome: "Indovinelli dei numeri", img: "img/stella.png", livello: 1, energia: 0, rompicapo: true,
    descrizione: "Il Chiwinnie ha dieci indovinelli con i numeri: conta, aggiungi, togli e scopri la regola. Scegli la risposta giusta tra quattro. Non serve energia: è un gioco per far lavorare la testa!"
  }
};

// Sfide: si vedono tre alla volta, nell'ordine della lista (o secondo "ordine", se c'è).
// Le sfide nuove vanno sempre in fondo: il salvataggio ricorda le sfide fatte per posizione.
// "verifica" riceve lo stato e dice se la sfida è completata.
function costruito(s, id) { return s.costruiti.indexOf(id) !== -1; }
function quantiCostruiti(s) { return s.costruiti.length; }
var SFIDE = [
  { testo: "Costruisci la casetta per il tuo Chiwinnie", stelle: 2, xp: 15, verifica: function (s) { return costruito(s, "casetta"); } },
  { testo: "Pianta l'orto di spinaci", stelle: 1, xp: 10, verifica: function (s) { return costruito(s, "orto"); } },
  { testo: "Arriva al cestino nell'Avventura nel Bosco", stelle: 2, xp: 20, verifica: function (s) { return (s.record.boscoCompleto || 0) >= 1; } },
  { testo: "Raccogli 3 volte quello che produce il giardino", stelle: 1, xp: 10, progresso: function (s) { return [s.contatori.raccolti, 3]; }, verifica: function (s) { return s.contatori.raccolti >= 3; } },
  { testo: "Fai fiorire le aiuole", stelle: 1, xp: 10, verifica: function (s) { return costruito(s, "aiuole"); } },
  { testo: "Dai gli spinaci al tuo Chiwinnie 5 volte", stelle: 1, xp: 10, progresso: function (s) { return [s.contatori.pasti, 5]; }, verifica: function (s) { return s.contatori.pasti >= 5; } },
  { testo: "Completa il Memory dei fiori", stelle: 2, xp: 20, verifica: function (s) { return s.contatori.memoryCompleti >= 1; } },
  { testo: "Arreda la radura con 6 pezzi", stelle: 2, xp: 20, progresso: function (s) { return [quantiCostruiti(s), 6]; }, verifica: function (s) { return quantiCostruiti(s) >= 6; } },
  { testo: "Trova tutte e 3 le stelle nascoste nel Bosco", stelle: 3, xp: 30, progresso: function (s) { return [s.record.boscoStelle || 0, 3]; }, verifica: function (s) { return (s.record.boscoStelle || 0) >= 3; } },
  { testo: "Costruisci il laghetto delle ninfee", stelle: 1, xp: 15, verifica: function (s) { return costruito(s, "laghetto"); } },
  { testo: "Appendi l'altalena al grande albero", stelle: 1, xp: 15, verifica: function (s) { return costruito(s, "altalena"); } },
  { testo: "Prendi 15 lucciole in una partita", stelle: 2, xp: 20, progresso: function (s) { return [+s.record.lucciole || 0, 15]; }, verifica: function (s) { return (+s.record.lucciole || 0) >= 15; } },
  { testo: "Pianta il ciliegio in fiore", stelle: 2, xp: 15, verifica: function (s) { return costruito(s, "albero"); } },
  { testo: "Costruisci il ponticello", stelle: 2, xp: 15, verifica: function (s) { return costruito(s, "ponte"); } },
  { testo: "Completa il Memory in meno di 20 mosse", stelle: 2, xp: 20, verifica: function (s) { return s.record.memoryMosse > 0 && s.record.memoryMosse < 20; } },
  { testo: "Arreda la radura con 12 pezzi", stelle: 3, xp: 30, progresso: function (s) { return [quantiCostruiti(s), 12]; }, verifica: function (s) { return quantiCostruiti(s) >= 12; } },
  { testo: "Accendi i lampioni", stelle: 2, xp: 20, verifica: function (s) { return costruito(s, "lampioni"); } },
  { testo: "Completa la Radura", stelle: 5, xp: 50, verifica: function (s) { return quantiCostruiti(s) >= Object.keys(ZONE[0].pezzi).length; } },
  { testo: "Costruisci il mulino ad acqua", stelle: 2, xp: 25, verifica: function (s) { return costruito(s, "rusc_mulino"); } },
  { testo: "Arriva alla barchetta nell'Avventura nel Ruscello", stelle: 2, xp: 25, verifica: function (s) { return (s.record.ruscelloCompleto || 0) >= 1; } },
  { testo: "Trova tutte e 3 le stelle del Ruscello", stelle: 3, xp: 35, verifica: function (s) { return (s.record.ruscelloStelle || 0) >= 3; } },
  { testo: "Completa il Ruscello", stelle: 5, xp: 60, verifica: function (s) { return Object.keys(ZONE[1].pezzi).every(function (k) { return costruito(s, k); }); } },
  { testo: "Costruisci il mulino a vento", stelle: 2, xp: 30, verifica: function (s) { return costruito(s, "coll_mulino"); } },
  { testo: "Arriva alla girandola nell'Avventura sulla Collina", stelle: 2, xp: 30, verifica: function (s) { return (s.record.collinaCompleto || 0) >= 1; } },
  { testo: "Trova tutte e 3 le stelle della Collina", stelle: 3, xp: 40, verifica: function (s) { return (s.record.collinaStelle || 0) >= 3; } },
  { testo: "Completa la Collina dei fiori", stelle: 5, xp: 70, verifica: function (s) { return Object.keys(ZONE[2].pezzi).every(function (k) { return costruito(s, k); }); } },
  { testo: "Costruisci il nido di piume del Celeste", stelle: 2, xp: 35, verifica: function (s) { return costruito(s, "cielo_nido"); } },
  { testo: "Arriva alla porta d'oro nell'Avventura nel Cielo", stelle: 2, xp: 35, verifica: function (s) { return (s.record.cieloCompleto || 0) >= 1; } },
  { testo: "Trova tutte e 3 le stelle del Cielo", stelle: 3, xp: 45, verifica: function (s) { return (s.record.cieloStelle || 0) >= 3; } },
  { testo: "Completa il Cielo del Celeste", stelle: 10, xp: 100, verifica: function (s) { return Object.keys(ZONE[3].pezzi).every(function (k) { return costruito(s, k); }); } },
  { testo: "Risolvi il Sudoku dei fiori", stelle: 2, xp: 15, ordine: 6.5, verifica: function (s) { return (s.contatori.sudokuCompleti || 0) >= 1; } },
  { testo: "Rimetti in ordine il Puzzle del Bosco", stelle: 2, xp: 15, ordine: 7.5, verifica: function (s) { return (s.contatori.puzzleCompleti || 0) >= 1; } },
  { testo: "Esci dal Labirinto delle siepi", stelle: 2, xp: 15, ordine: 8.5, verifica: function (s) { return (s.contatori.labirintiCompleti || 0) >= 1; } },
  { testo: "Risolvi 3 Sudoku senza errori", stelle: 3, xp: 30, ordine: 15.5, progresso: function (s) { return [s.contatori.sudokuPerfetti || 0, 3]; }, verifica: function (s) { return (s.contatori.sudokuPerfetti || 0) >= 3; } },
  { testo: "Completa il Puzzle difficile da 16 tessere", stelle: 3, xp: 30, ordine: 16.5, verifica: function (s) { return (s.contatori.puzzleDifficili || 0) >= 1; } },
  { testo: "Prendi tutti e 5 i petali nel Labirinto", stelle: 2, xp: 20, ordine: 17.5, progresso: function (s) { return [s.record.labirintoPetali || 0, 5]; }, verifica: function (s) { return (s.record.labirintoPetali || 0) >= 5; } },
  { testo: "Aggiusta 3 cose con l'Aggiustatutto", stelle: 2, xp: 20, ordine: 9.5, progresso: function (s) { return [s.contatori.aggiustati || 0, 3]; }, verifica: function (s) { return (s.contatori.aggiustati || 0) >= 3; } },
  { testo: "Aggiusta 3 cose al primo colpo", stelle: 3, xp: 30, ordine: 18.5, progresso: function (s) { return [s.contatori.aggiustatiPrimo || 0, 3]; }, verifica: function (s) { return (s.contatori.aggiustatiPrimo || 0) >= 3; } },
  { testo: "Esci dal Labirinto nella nebbia", stelle: 3, xp: 30, ordine: 19.5, verifica: function (s) { return (s.contatori.labirintiDifficili || 0) >= 1; } }
];

// Identità della specie (dal concept book): fiore e carattere assegnati insieme dal chip,
// colore del cuore rivelato al primo incontro. L'oro è rarissimo.
var FIORI = ["peonia", "margherita", "campanula", "tulipano", "girasole", "rosa", "ibisco"];
var CARATTERI = ["vivace", "allegro", "curioso", "tranquillo", "sognatore", "coraggioso"];
var CUORI = [
  { nome: "rosa", hex: "#f28fab" }, { nome: "rosso", hex: "#e2504c" }, { nome: "arancione", hex: "#f39a3d" },
  { nome: "giallo", hex: "#f2c94c" }, { nome: "verde", hex: "#6fbf73" }, { nome: "azzurro", hex: "#6ec3e8" },
  { nome: "blu", hex: "#4f6fd6" }, { nome: "viola", hex: "#9b6ad6" }
];
var CUORE_RARO = { nome: "oro", hex: "#d4a72c", raro: true };

// I colori naturali dei Chiwinnie (dal concept book): il giocatore sceglie il suo.
var COLORI_CHIWI = [
  { id: "viola", nome: "Viola", carattere: "calmi e sognatori" },
  { id: "rosa", nome: "Rosa", carattere: "affettuosi e allegri" },
  { id: "bianco", nome: "Bianco", carattere: "dolci e coccoloni" },
  { id: "blu", nome: "Blu", carattere: "curiosi e intelligenti" },
  { id: "verde", nome: "Verde", carattere: "tranquilli e saggi" }
];
function immagineChiwi(colore, nome) { return "img/chiwi/" + (colore || "viola") + "/" + nome + (/felice|coccolone|brontolone/.test(nome) ? ".jpg" : ".png"); }

var FRASI = {
  felice: ["Wii-chu!", "Nimmi-nimmi! Che bello vederti!", "Wonni-wonni! Ho tanta energia!", "Costruiamo qualcosa?", "Che bella la nostra radura!"],
  coccole: ["Prrr… prrr…", "Ancora coccole!", "Pum-pum winni, siamo amici!"],
  brontolone: ["Grrrmpf… ho fame di spinaci!", "Niente spinaci, niente giochi!", "Brrr… sono un po' brontolone…"],
  pasto: ["Gnam gnam! Spinaci, che bontà!", "Wonni-wonni! Mi torna l'energia!"]
};

// Guardaroba: accessori da indossare, uno per posto (testa, viso, collo, corpo, schiena: la schiena sta dietro al Chiwinnie).
// f = posizione sulla posa di fronte, in % dell'immagine: x e y del centro, w larghezza, r rotazione, sy schiacciamento.
// Si comprano con petali o stelle; quelli "speciali" si vincono soltanto.
var ACCESSORI = {
  fiocco:          { nome: "Fiocco rosa",        posto: "testa", img: "img/casa/accessori/fiocco.png",          f: { x: 70, y: 6, w: 26, r: 18 }, gratis: true },
  papillon:        { nome: "Papillon lilla",     posto: "collo", img: "img/casa/accessori/papillon.png",        f: { x: 50, y: 37, w: 22 }, gratis: true },
  collana:         { nome: "Collana di margherite", posto: "collo", img: "img/casa/accessori/collana.png",      f: { x: 50, y: 41, w: 46 }, prezzo: { petali: 25 } },
  coroncina_fiori: { nome: "Coroncina di fiori", posto: "testa", img: "img/casa/accessori/coroncina_fiori.png", f: { x: 50, y: 6, w: 50, sy: 0.45 }, prezzo: { petali: 30 } },
  cappello_paglia: { nome: "Cappello di paglia", posto: "testa", img: "img/casa/accessori/cappello_paglia.png", f: { x: 50, y: 1, w: 66 }, prezzo: { petali: 40 } },
  occhiali:        { nome: "Occhiali tondi",     posto: "viso",  img: "img/casa/accessori/occhiali.png",        f: { x: 50, y: 20, w: 40 }, prezzo: { stelle: 5 } },
  sciarpa:         { nome: "Sciarpa a righe",    posto: "collo", img: "img/casa/accessori/sciarpa.png",         f: { x: 50, y: 46, w: 64 }, prezzo: { stelle: 8 } },
  corona:          { nome: "Corona d'oro",       posto: "testa", img: "img/casa/accessori/corona.png",          f: { x: 50, y: 2, w: 32 },
                     speciale: "Completa la Radura", vinto: function (s) { return Object.keys(ZONE[0].pezzi).every(function (k) { return s.costruiti.indexOf(k) !== -1; }); } },
  cappello_mago:   { nome: "Cappello da mago",   posto: "testa", img: "img/casa/accessori/cappello_mago.png",   f: { x: 50, y: -8, w: 46 },
                     speciale: "Aggiusta 5 cose con l'Aggiustatutto", vinto: function (s) { return (s.contatori.aggiustati || 0) >= 5; } },
  berretto_lana:   { nome: "Berretto di lana",   posto: "testa", img: "img/casa/accessori/berretto_lana.png",   f: { x: 50, y: 3, w: 46 }, prezzo: { petali: 35 } },
  basco:           { nome: "Basco da pittore",   posto: "testa", img: "img/casa/accessori/basco.png",           f: { x: 45, y: 5, w: 52, r: -12 }, prezzo: { petali: 45 } },
  cuffie:          { nome: "Cuffie musicali",    posto: "testa", img: "img/casa/accessori/cuffie.png",          f: { x: 50, y: 19, w: 60 }, prezzo: { stelle: 7 } },
  occhiali_cuore:  { nome: "Occhiali a cuore",   posto: "viso",  img: "img/casa/accessori/occhiali_cuore.png",  f: { x: 50, y: 20, w: 44 }, prezzo: { stelle: 6 } },
  campanellino:    { nome: "Collare col campanellino", posto: "collo", img: "img/casa/accessori/campanellino.png", f: { x: 50, y: 39, w: 36 }, prezzo: { petali: 20 } },
  grembiule:       { nome: "Grembiule a fiori",  posto: "corpo", img: "img/casa/accessori/grembiule.png",       f: { x: 50, y: 63, w: 50 }, prezzo: { petali: 30 } },
  tutu:            { nome: "Tutù rosa",          posto: "corpo", img: "img/casa/accessori/tutu.png",            f: { x: 50, y: 76, w: 86 }, prezzo: { petali: 35 } },
  mantello:        { nome: "Mantello da supereroe", posto: "schiena", img: "img/casa/accessori/mantello.png",   f: { x: 50, y: 52, w: 124 },
                     speciale: "Arriva in fondo a tutte e 4 le avventure", vinto: function (s) { return ["bosco", "ruscello", "collina", "cielo"].every(function (k) { return (s.record[k + "Completo"] || 0) > 0; }); } },
  ali_fata:        { nome: "Ali di fata",        posto: "schiena", img: "img/casa/accessori/ali_fata.png",      f: { x: 50, y: 38, w: 118 },
                     speciale: "Trova tutte e 3 le stelle del Cielo", vinto: function (s) { return (s.record.cieloStelle || 0) >= 3; } }
};


// ---------- La grande missione ----------
// Il Nebbione, una nuvola grigia e brontolona che non sopporta i colori, ha chiuso dodici Chiwinnie
// in bolle di nebbia. Ogni bolla si apre con le lucine, che si guadagnano con le missioni.
// Gli amici liberati vanno a vivere nella loro zona e portano un regalo.
var AMICI = [
  { id: "pimpi",     nome: "Pimpi", femmina: true,     colore: "rosa",   look: { testa: "fiocco" },          zona: "radura",   lucine: 2, regalo: { petali: 8 } },
  { id: "mirtillo",  nome: "Mirtillo",  colore: "blu",    look: { viso: "occhiali" },         zona: "radura",   lucine: 2, regalo: { legnetti: 8 } },
  { id: "nuvoletta", nome: "Nuvoletta", femmina: true, colore: "bianco", look: { collo: "papillon" },        zona: "radura",   lucine: 3, regalo: { sassolini: 6, stelle: 1 } },
  { id: "ciuffo",    nome: "Ciuffo",    colore: "verde",  look: { testa: "cappello_paglia" }, zona: "ruscello", lucine: 3, regalo: { spinaci: 8, petali: 6 } },
  { id: "lulu",      nome: "Lulù", femmina: true,      colore: "viola",  look: { collo: "collana" },         zona: "ruscello", lucine: 3, regalo: { legnetti: 10 } },
  { id: "fagiolo",   nome: "Fagiolo",   colore: "verde",  look: { testa: "berretto_lana" },   zona: "ruscello", lucine: 4, regalo: { sassolini: 8, stelle: 1 } },
  { id: "stellina",  nome: "Stellina", femmina: true,  colore: "rosa",   look: { testa: "coroncina_fiori" }, zona: "collina",  lucine: 4, regalo: { petali: 12, stelle: 1 } },
  { id: "brillo",    nome: "Brillo",    colore: "blu",    look: { testa: "cuffie" },          zona: "collina",  lucine: 4, regalo: { legnetti: 12 } },
  { id: "pervinca",  nome: "Pervinca", femmina: true,  colore: "viola",  look: { testa: "basco" },           zona: "collina",  lucine: 5, regalo: { sassolini: 10, stelle: 2 } },
  { id: "bubu",      nome: "Bubù",      colore: "bianco", look: { collo: "sciarpa" },         zona: "cielo",    lucine: 5, regalo: { petali: 15, stelle: 2 } },
  { id: "zenzero",   nome: "Zenzero",   colore: "verde",  look: { collo: "campanellino" },    zona: "cielo",    lucine: 5, regalo: { legnetti: 15, sassolini: 10 } },
  { id: "tobia",     nome: "Tobia",     colore: "blu",    look: { testa: "corona" },          zona: "cielo",    lucine: 6, regalo: { stelle: 5 } }
];

// Missioni rapide: tre alla volta, facili, sempre nuove. Finite tutte e tre si sale di grado.
// ev = l'evento che le fa avanzare; conta(dati) = di quanto avanzano; n = obiettivo per grado (l'ultimo vale da lì in poi);
// gioco = serve che quel gioco sia già aperto.
var MISSIONI = [
  { id: "partite",   testo: "Gioca {n} partite a un gioco qualsiasi", ev: "partita", n: [2, 3, 3, 4, 5] },
  { id: "petali",    testo: "Raccogli {n} petali giocando", ev: "partita", conta: function (d) { return d.bottino.petali || 0; }, n: [8, 12, 15, 20, 25] },
  { id: "spinaci",   testo: "Raccogli {n} spinaci giocando", ev: "partita", conta: function (d) { return d.bottino.spinaci || 0; }, n: [6, 10, 12, 15, 20] },
  { id: "legnetti",  testo: "Raccogli {n} legnetti giocando", ev: "partita", conta: function (d) { return d.bottino.legnetti || 0; }, n: [6, 8, 10, 14, 18] },
  { id: "avventura", testo: "Arriva in fondo a un'avventura", testoN: "Arriva in fondo a {n} avventure", ev: "partita", conta: function (d) { return d.arcade && d.completato ? 1 : 0; }, n: [1, 1, 2, 2, 3] },
  { id: "stelle",    testo: "Trova {n} stelle nascoste nelle avventure", ev: "partita", conta: function (d) { return d.arcade ? d.stelleLivello || 0 : 0; }, n: [1, 2, 3, 4, 5] },
  { id: "rompicapi", testo: "Risolvi {n} rompicapi", ev: "partita", conta: function (d) { return d.rompicapo && d.completato ? 1 : 0; }, n: [1, 2, 2, 3, 4] },
  { id: "tris",      testo: "Fai {n} file nel Tris di fiori", ev: "partita", gioco: "tris", conta: function (d) { return d.gioco === "tris" ? d.file || 0 : 0; }, n: [15, 25, 35, 45, 60] },
  { id: "conti",     testo: "Rispondi giusto a {n} indovinelli dei numeri", ev: "partita", gioco: "conti", conta: function (d) { return d.gioco === "conti" ? d.giuste || 0 : 0; }, n: [5, 8, 10, 15, 20] },
  { id: "fuga",      testo: "Scappa dal Nebbione fino in fondo", ev: "partita", gioco: "fuga", conta: function (d) { return d.gioco === "fuga" && d.completato ? 1 : 0; }, n: [1] },
  { id: "memory",    testo: "Completa {n} Memory dei fiori", ev: "partita", gioco: "memory", conta: function (d) { return d.gioco === "memory" && d.completato ? 1 : 0; }, n: [1, 1, 2] },
  { id: "lucciole",  testo: "Prendi {n} lucciole in tutto", ev: "partita", gioco: "lucciole", conta: function (d) { return d.gioco === "lucciole" ? d.punti || 0 : 0; }, n: [10, 15, 20, 30] },
  { id: "pasti",     testo: "Dai da mangiare {n} volte al tuo Chiwinnie", ev: "pasto", n: [2, 3, 3, 4] },
  { id: "raccolti",  testo: "Raccogli {n} volte quello che produce il giardino", ev: "raccolto", n: [2, 3, 4, 5] },
  { id: "coccole",   testo: "Fai {n} coccole al tuo Chiwinnie", ev: "coccola", n: [5, 8, 10, 12] },
  { id: "arreda",    testo: "Arreda un pezzo nuovo", testoN: "Arreda {n} pezzi nuovi", ev: "costruito", n: [1, 1, 2] }
];
// premio di ogni missione e del grado (crescono un po' a ogni grado)
function premioMissione(grado) { return { lucine: 1, xp: 8 + grado * 2, materiali: { petali: 2 + grado, legnetti: 2 + grado } }; }
function premioGrado(grado) { return { lucine: 2, materiali: { legnetti: 5 + grado * 2, sassolini: 3 + grado, petali: 5 + grado * 2, spinaci: 4 }, stelle: grado % 3 === 0 ? 2 : 1 }; }
