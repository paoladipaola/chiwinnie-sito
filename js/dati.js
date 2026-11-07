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
    id: "foresta", nome: "La foresta delle lucciole", musica: "notte", sfondo: "img/zona5/vuota.jpg", cartella: "img/zona5/", senzaIcone: true,
    descrizione: "Una foresta dove è sempre notte e la luce la fanno le lucciole.",
    prati: [{ x1: 26, x2: 74, y1: 64, y2: 84 }],
    pezzi: {
      for_casetta: {
        nome: "Casetta nel tronco", livello: 12, costo: { legnetti: 14, sassolini: 6 }, xp: 30,
        pos: [2, 49.22, 22, 14.78], tocco: [[3.8, 50.4, 22.2, 63.3]],
        descrizione: "Una casetta rotonda dentro un vecchio tronco, con la finestra che brilla."
      },
      for_barattoli: {
        nome: "Barattoli di lucciole", livello: 12, costo: { legnetti: 6, petali: 6 }, xp: 20,
        pos: [23, 53.08, 8, 9.92], tocco: [[23.6, 53.9, 30.4, 62.5]],
        descrizione: "Barattoli pieni di lucciole appesi a un palo: fanno luce tutta la notte."
      },
      for_funghi: {
        nome: "Cerchio di funghi blu", livello: 12, costo: { petali: 10 }, xp: 20,
        pos: [38, 64.32, 24, 8.68], tocco: [[39.9, 65.0, 60.1, 72.6]],
        descrizione: "Un cerchio magico di funghi che brillano di blu."
      },
      for_panchina: {
        nome: "Panchina di muschio", livello: 13, costo: { sassolini: 10 }, xp: 18,
        pos: [7, 66.83, 16, 8.17], tocco: [[8.3, 67.5, 21.7, 74.6]],
        descrizione: "Una panchina di pietra coperta di muschio morbido e fiorellini."
      },
      for_fiore: {
        nome: "Il grande fiore lucente", livello: 13, costo: { petali: 12, stelle: 2 }, xp: 24,
        pos: [63, 55.37, 11, 8.63], tocco: [[63.9, 56.1, 73.1, 63.6]], bolla: [68.5, 57.4],
        produce: { materiale: "petali", ogni: 3 * MINUTO, max: 5 },
        descrizione: "Un fiore gigante che si apre di notte e lascia cadere petali luminosi."
      },
      for_amaca: {
        nome: "Amaca delle lucciole", livello: 13, costo: { legnetti: 10, petali: 6 }, xp: 22,
        pos: [37, 52.35, 25, 7.65], tocco: [[39.0, 53.0, 60.0, 59.6]],
        descrizione: "Un'amaca a righe tra due pali con le lucine: per dondolarsi sotto le stelle."
      },
      for_laghetto: {
        nome: "Laghetto delle ninfee", livello: 14, costo: { sassolini: 10, petali: 6 }, xp: 24,
        pos: [23, 76.54, 18, 6.46], tocco: [[24.4, 77.1, 39.6, 82.7]],
        descrizione: "Un piccolo laghetto blu con le ninfee rosa."
      },
      for_legna: {
        nome: "Legnetti e copertina", livello: 14, costo: { legnetti: 12 }, xp: 22,
        pos: [82, 72.04, 13, 7.96], tocco: [[83.0, 72.7, 94.0, 79.6]], bolla: [88.5, 74.0],
        produce: { materiale: "legnetti", ogni: 3 * MINUTO, max: 5 },
        descrizione: "Una catasta di legnetti con la copertina e la lanterna: qui si trovano sempre legnetti."
      },
      for_ceppo: {
        nome: "Tavolino del tè", livello: 14, costo: { legnetti: 8, sassolini: 6, stelle: 2 }, xp: 26,
        pos: [59, 72.56, 15, 7.44], tocco: [[60.2, 73.2, 72.8, 79.6]],
        descrizione: "Un vecchio ceppo diventato tavolino, con le tazzine di ghianda e la teiera."
      },
      for_cartello: {
        nome: "Cartello del bosco", livello: 15, costo: { legnetti: 8 }, xp: 16,
        pos: [73, 66.27, 7, 8.73], tocco: [[73.6, 67.0, 79.4, 74.6]],
        descrizione: "Un cartello con tre frecce: indica la strada per tutte le terre del Giardino."
      },
      for_sentiero: {
        nome: "Sentiero delle lanterne", livello: 15, costo: { sassolini: 14, stelle: 2 }, xp: 28,
        pos: [40, 79.42, 26, 8.58], tocco: [[42.1, 80.1, 63.9, 87.6]], bolla: [53.0, 81.4],
        produce: { materiale: "sassolini", ogni: 4 * MINUTO, max: 4 },
        descrizione: "Sassi piatti con le lanterne di carta, per non perdersi di notte."
      },
      for_cespuglio: {
        nome: "Cespuglio di bacche", livello: 15, costo: { petali: 8, spinaci: 6 }, xp: 22,
        pos: [74, 81.56, 15, 7.44], tocco: [[75.2, 82.2, 87.8, 88.6]], bolla: [81.5, 83.6],
        produce: { materiale: "spinaci", ogni: 2 * MINUTO, max: 6 },
        descrizione: "Un cespuglio di bacche blu e rosa: al Chiwinnie piacciono quasi come gli spinaci!"
      },
      for_altalena: {
        nome: "Altalena di rampicanti", livello: 16, costo: { legnetti: 14, stelle: 3 }, xp: 30,
        pos: [77, 51.63, 18, 14.37], tocco: [[78.4, 52.8, 93.6, 65.3]],
        descrizione: "Un'altalena appesa a un arco di foglie e fiorellini luminosi."
      },
      for_ponte: {
        nome: "Ponticello delle lanterne", livello: 16, costo: { legnetti: 16, sassolini: 8, stelle: 3 }, xp: 34,
        pos: [2, 87.78, 25, 8.22], tocco: [[4.0, 88.4, 25.0, 95.6]],
        descrizione: "Un ponticello di legno sul ruscello, con le lanterne sulle ringhiere."
      }
    }
  },
  {
    id: "isole", nome: "Le isole fluttuanti", musica: "nuvole", sfondo: "img/zona6/vuota.jpg", cartella: "img/zona6/", senzaIcone: true,
    descrizione: "Isolette di prato che galleggiano nel cielo, con le cascate che cadono tra le nuvole.",
    prati: [{ x1: 10, x2: 90, y1: 56, y2: 62 }],
    pezzi: {
      isl_casetta: {
        nome: "Casetta sull'isola", livello: 15, costo: { legnetti: 14, sassolini: 8 }, xp: 30,
        pos: [4, 46.39, 20, 12.61], tocco: [[5.6, 47.4, 22.4, 58.4]],
        descrizione: "Una casetta bianca con il tetto rosso, sull'isola più grande."
      },
      isl_orto: {
        nome: "Orto volante", livello: 15, costo: { legnetti: 8, spinaci: 6 }, xp: 20,
        pos: [6, 56.71, 16, 7.29], tocco: [[7.3, 57.3, 20.7, 63.6]], bolla: [14.0, 58.7],
        produce: { materiale: "spinaci", ogni: 2 * MINUTO, max: 6 },
        descrizione: "Un orto di carote, lattughe e spinaci: cresce benissimo vicino al cielo."
      },
      isl_panchina: {
        nome: "Panchina azzurra", livello: 15, costo: { legnetti: 8 }, xp: 16,
        pos: [45, 55.07, 12, 5.43], tocco: [[46.0, 55.5, 56.0, 60.2]],
        descrizione: "Una panchina col cuscino, per guardare le nuvole passare."
      },
      isl_albero: {
        nome: "Albero dei frutti rosa", livello: 16, costo: { petali: 12, sassolini: 4 }, xp: 24,
        pos: [26, 46.35, 17, 10.65], tocco: [[27.4, 47.2, 41.6, 56.5]],
        descrizione: "Un albero pieno di frutti rosa e rotondi."
      },
      isl_laghetto: {
        nome: "Laghetto con la cascatella", livello: 16, costo: { sassolini: 12, petali: 4 }, xp: 24,
        pos: [34, 57.99, 17, 6.51], tocco: [[35.4, 58.5, 49.6, 64.2]], bolla: [42.5, 60.0],
        produce: { materiale: "sassolini", ogni: 4 * MINUTO, max: 4 },
        descrizione: "Un laghetto con una piccola cascata e due ninfee: sul fondo si trovano sassolini lisci."
      },
      isl_telescopio: {
        nome: "Cannocchiale", livello: 16, costo: { sassolini: 8, stelle: 2 }, xp: 22,
        pos: [22, 53.96, 7, 9.04], tocco: [[22.6, 54.7, 28.4, 62.5]],
        descrizione: "Un cannocchiale d'ottone per guardare le altre isole."
      },
      isl_arnia: {
        nome: "Arnia delle api", livello: 16, costo: { legnetti: 8, petali: 6 }, xp: 20,
        pos: [68, 54.97, 7, 5.53], tocco: [[68.6, 55.4, 74.4, 60.2]],
        descrizione: "Una casetta gialla per le api amiche delle isole."
      },
      isl_faro: {
        nome: "Piccolo faro", livello: 17, costo: { sassolini: 14, stelle: 2 }, xp: 26,
        pos: [60, 50.35, 10, 6.15], tocco: [[60.8, 50.8, 69.2, 56.2]],
        descrizione: "Un faro a righe che fa luce alle isole quando passano le nuvole."
      },
      isl_mulino: {
        nome: "Mulino a vento", livello: 17, costo: { legnetti: 16, sassolini: 6 }, xp: 30,
        pos: [76, 46.01, 18, 11.99], tocco: [[77.4, 47.0, 92.6, 57.4]], bolla: [85.0, 48.0],
        produce: { materiale: "legnetti", ogni: 3 * MINUTO, max: 5 },
        descrizione: "Un mulino bianco che gira con il vento del cielo."
      },
      isl_aquilone: {
        nome: "Staccionata con l'aquilone", livello: 17, costo: { legnetti: 10, petali: 6 }, xp: 22,
        pos: [84, 49.93, 12, 13.07], tocco: [[85.0, 51.0, 95.0, 62.3]],
        descrizione: "Un aquilone colorato legato alla staccionata: vola sempre."
      },
      isl_giardino: {
        nome: "Giardino sull'isoletta", livello: 17, costo: { petali: 16, stelle: 2 }, xp: 26,
        pos: [59, 8.59, 26, 6.61], tocco: [[61.1, 9.1, 82.9, 14.9]], bolla: [72.0, 10.6],
        produce: { materiale: "petali", ogni: 3 * MINUTO, max: 5 },
        descrizione: "Un'isoletta tutta fiorita che lascia cadere petali."
      },
      isl_ponte: {
        nome: "Ponte di corda", livello: 18, costo: { legnetti: 14, stelle: 2 }, xp: 28,
        pos: [38, 14.56, 20, 4.44], tocco: [[39.6, 14.9, 56.4, 18.8]],
        descrizione: "Un ponte di corda tra due isolette lassù."
      },
      isl_altalena: {
        nome: "Altalena della nuvola", livello: 18, costo: { legnetti: 10, stelle: 3 }, xp: 30,
        pos: [6, 31.32, 14, 14.68], tocco: [[7.1, 32.5, 18.9, 45.3]],
        descrizione: "Un'altalena appesa a una nuvola morbida."
      },
      isl_mongolfiera: {
        nome: "Mongolfiera a righe", livello: 18, costo: { petali: 14, legnetti: 10, stelle: 3 }, xp: 34,
        pos: [74, 24.83, 14, 19.17], tocco: [[75.1, 26.4, 86.9, 43.0]],
        descrizione: "Una mongolfiera a righe per fare il giro delle isole."
      }
    }
  },
  {
    id: "nord", nome: "Le terre del nord", musica: "casa", sfondo: "img/zona7/vuota.jpg", cartella: "img/zona7/", senzaIcone: true,
    descrizione: "Una terra di neve soffice, con l'aurora nel cielo e il lago ghiacciato.",
    prati: [{ x1: 24, x2: 74, y1: 62, y2: 86 }],
    pezzi: {
      nor_casetta: {
        nome: "Baita di legno", livello: 16, costo: { legnetti: 18, sassolini: 6 }, xp: 32,
        pos: [28, 49.25, 24, 13.75], tocco: [[29.9, 50.4, 50.1, 62.3]],
        descrizione: "Una baita calda con il camino acceso e la neve sul tetto."
      },
      nor_legna: {
        nome: "Catasta di legna", livello: 16, costo: { legnetti: 6 }, xp: 16,
        pos: [20, 63.09, 9, 4.91], tocco: [[20.7, 63.5, 28.3, 67.8]], bolla: [24.5, 65.1],
        produce: { materiale: "legnetti", ogni: 3 * MINUTO, max: 5 },
        descrizione: "La legna per il camino: qui se ne trova sempre un po'."
      },
      nor_pupazzo: {
        nome: "Pupazzo di neve", livello: 16, costo: { petali: 8 }, xp: 18,
        pos: [45, 62.75, 10, 7.75], tocco: [[45.8, 63.4, 54.2, 70.1]],
        descrizione: "Un pupazzo di neve sorridente con la sciarpa rossa e il naso di carota."
      },
      nor_igloo: {
        nome: "Igloo", livello: 17, costo: { sassolini: 14, petali: 6 }, xp: 28,
        pos: [55, 56.52, 20, 5.48], tocco: [[56.6, 57.0, 73.4, 61.7]], bolla: [65.0, 58.5],
        produce: { materiale: "sassolini", ogni: 4 * MINUTO, max: 4 },
        descrizione: "Una casetta di blocchi di neve, calda dentro."
      },
      nor_cioccolata: {
        nome: "Chiosco della cioccolata", livello: 17, costo: { legnetti: 10, petali: 8 }, xp: 26,
        pos: [16, 74.23, 15, 9.77], tocco: [[17.2, 75.0, 29.8, 83.5]], bolla: [23.5, 76.2],
        produce: { materiale: "spinaci", ogni: 2 * MINUTO, max: 6 },
        descrizione: "Cioccolata calda con i marshmallow per tutti! E qualche spinacino per il Chiwinnie."
      },
      nor_renna: {
        nome: "Cartello della renna", livello: 17, costo: { legnetti: 8 }, xp: 16,
        pos: [60, 62.39, 6, 6.61], tocco: [[60.5, 62.9, 65.5, 68.7]],
        descrizione: "Un cartello di legno a forma di renna sorridente."
      },
      nor_lanterna: {
        nome: "Lanterna di neve", livello: 17, costo: { sassolini: 8, petali: 4 }, xp: 18,
        pos: [71, 63.61, 6, 5.89], tocco: [[71.5, 64.1, 76.5, 69.2]],
        descrizione: "Palle di neve una sull'altra con una candela dentro."
      },
      nor_falo: {
        nome: "Falò con i tronchetti", livello: 18, costo: { legnetti: 12, sassolini: 8 }, xp: 28,
        pos: [28, 69.28, 19, 6.72], tocco: [[29.5, 69.8, 45.5, 75.7]],
        descrizione: "Un falò dentro un cerchio di sassi, con i tronchetti per sedersi al caldo."
      },
      nor_slitta: {
        nome: "Slitta rossa", livello: 18, costo: { legnetti: 12, stelle: 2 }, xp: 26,
        pos: [55, 72.18, 15, 3.82], tocco: [[56.2, 72.5, 68.8, 75.8]],
        descrizione: "Una slitta rossa con la copertina a righe, pronta per scivolare."
      },
      nor_sci: {
        nome: "Rastrelliera degli sci", livello: 18, costo: { legnetti: 10, stelle: 2 }, xp: 22,
        pos: [6, 70.28, 7, 6.72], tocco: [[6.6, 70.8, 12.4, 76.7]],
        descrizione: "Sci e bastoncini colorati per scendere dalle colline di neve."
      },
      nor_pino: {
        nome: "Pino con le lucine", livello: 18, costo: { petali: 14, stelle: 2 }, xp: 26,
        pos: [78, 48.74, 12, 14.26], tocco: [[79.0, 49.9, 89.0, 62.3]], bolla: [84.0, 50.7],
        produce: { materiale: "petali", ogni: 3 * MINUTO, max: 5 },
        descrizione: "Un pino innevato con le lucine e la stella in cima."
      },
      nor_altalena: {
        nome: "Altalena del ghiaccio", livello: 19, costo: { legnetti: 12, stelle: 3 }, xp: 30,
        pos: [40, 73.94, 13, 9.56], tocco: [[41.0, 74.7, 52.0, 83.0]],
        descrizione: "Un'altalena con il cuscino di lana e i ghiaccioli sulla trave."
      },
      nor_panchina: {
        nome: "Panchina dei pattini", livello: 19, costo: { legnetti: 10, sassolini: 6, stelle: 2 }, xp: 26,
        pos: [36, 84.87, 12, 5.63], tocco: [[37.0, 85.3, 47.0, 90.2]],
        descrizione: "Una panchina sul lago ghiacciato, con i pattini appesi."
      },
      nor_ponte: {
        nome: "Ponticello innevato", livello: 19, costo: { legnetti: 16, sassolini: 10, stelle: 3 }, xp: 34,
        pos: [4, 88.89, 20, 6.61], tocco: [[5.6, 89.4, 22.4, 95.2]],
        descrizione: "Un ponticello sul lago ghiacciato, con le lanterne sui pali."
      }
    }
  },
  {
    id: "deserto", nome: "Il deserto dei fiori di cactus", musica: "prato", sfondo: "img/zona8/vuota.jpg", cartella: "img/zona8/", senzaIcone: true,
    descrizione: "Un deserto caldo e gentile, dove i cactus sono pieni di fiori.",
    prati: [{ x1: 30, x2: 76, y1: 66, y2: 92 }],
    pezzi: {
      des_casa: {
        nome: "Casetta di argilla", livello: 18, costo: { sassolini: 14, legnetti: 8 }, xp: 32,
        pos: [30, 54.73, 19, 11.27], tocco: [[31.5, 55.6, 47.5, 65.4]],
        descrizione: "Una casetta tonda di argilla calda, con la porta blu e un cactus sul tetto."
      },
      des_vasi: {
        nome: "Vasi con i cactus", livello: 18, costo: { sassolini: 8, petali: 4 }, xp: 18,
        pos: [66, 65.85, 10, 6.15], tocco: [[66.8, 66.3, 75.2, 71.7]],
        descrizione: "Tre vasi di terracotta con dentro piccoli cactus fioriti."
      },
      des_bancarella: {
        nome: "Bancarella della frutta", livello: 18, costo: { legnetti: 10, petali: 6 }, xp: 24,
        pos: [33, 64.89, 14, 8.11], tocco: [[34.1, 65.5, 45.9, 72.6]], bolla: [40.0, 66.9],
        produce: { materiale: "spinaci", ogni: 2 * MINUTO, max: 6 },
        descrizione: "Arance, datteri, meloni e fichi: e per il Chiwinnie anche qualche spinacino."
      },
      des_tenda: {
        nome: "Tenda a righe", livello: 19, costo: { petali: 14, legnetti: 8 }, xp: 28,
        pos: [53, 56.7, 20, 7.8], tocco: [[54.6, 57.3, 71.4, 64.1]],
        descrizione: "Una tenda colorata con le bandierine e il tappeto all'ingresso."
      },
      des_pozzo: {
        nome: "Pozzo di pietra", livello: 19, costo: { sassolini: 14 }, xp: 24,
        pos: [80, 57.52, 9, 6.98], tocco: [[80.7, 58.1, 88.3, 64.2]],
        descrizione: "Un pozzo con il tettuccio e il secchio: l'acqua più fresca del deserto."
      },
      des_fontana: {
        nome: "Fontana di piastrelle", livello: 19, costo: { sassolini: 12, stelle: 2 }, xp: 26,
        pos: [50, 65.68, 12, 6.82], tocco: [[51.0, 66.2, 61.0, 72.2]], bolla: [56.0, 67.7],
        produce: { materiale: "sassolini", ogni: 4 * MINUTO, max: 4 },
        descrizione: "Una fontana rotonda di piastrelle turchesi."
      },
      des_fiori: {
        nome: "Fiori del deserto", livello: 19, costo: { petali: 10 }, xp: 18,
        pos: [46, 88.63, 16, 5.37], tocco: [[47.3, 89.1, 60.7, 93.7]], bolla: [54.0, 90.6],
        produce: { materiale: "petali", ogni: 3 * MINUTO, max: 5 },
        descrizione: "Fiorellini e piante grasse tra i sassolini lisci."
      },
      des_oasi: {
        nome: "Oasi con le palme", livello: 20, costo: { sassolini: 10, petali: 10, stelle: 2 }, xp: 32,
        pos: [32, 71.75, 26, 9.25], tocco: [[34.1, 72.5, 55.9, 80.5]],
        descrizione: "Un laghetto turchese con due palme: il posto più fresco del deserto."
      },
      des_carretto: {
        nome: "Carretto dei tappeti", livello: 20, costo: { legnetti: 14, petali: 6 }, xp: 26,
        pos: [62, 72.9, 14, 6.1], tocco: [[63.1, 73.4, 74.9, 78.7]], bolla: [69.0, 74.9],
        produce: { materiale: "legnetti", ogni: 3 * MINUTO, max: 5 },
        descrizione: "Un carretto pieno di tappeti colorati e melograni."
      },
      des_lanterna: {
        nome: "Lanterna di vetri colorati", livello: 20, costo: { sassolini: 8, stelle: 2 }, xp: 22,
        pos: [22, 71.56, 5, 7.44], tocco: [[22.4, 72.2, 26.6, 78.6]],
        descrizione: "Una lanterna di vetri rossi, verdi e blu che brilla la sera."
      },
      des_castello: {
        nome: "Castello di sabbia", livello: 20, costo: { sassolini: 10, petali: 4 }, xp: 22,
        pos: [24, 84.11, 13, 5.89], tocco: [[25.0, 84.6, 36.0, 89.7]],
        descrizione: "Un castello di sabbia con le conchiglie, il secchiello e la paletta."
      },
      des_ombrellone: {
        nome: "Ombrellone con i cuscini", livello: 21, costo: { petali: 12, stelle: 2 }, xp: 26,
        pos: [62, 79.92, 13, 7.08], tocco: [[63.0, 80.5, 74.0, 86.6]],
        descrizione: "Un ombrellone a righe sopra un tappeto con due cuscini."
      },
      des_amaca: {
        nome: "Amaca tra le palme", livello: 21, costo: { legnetti: 12, stelle: 3 }, xp: 30,
        pos: [40, 81.07, 20, 6.93], tocco: [[41.6, 81.6, 58.4, 87.7]],
        descrizione: "Un'amaca a righe tra due palme, per dondolarsi al sole."
      },
      des_cactus: {
        nome: "Grande cactus fiorito", livello: 21, costo: { petali: 16, sassolini: 6, stelle: 3 }, xp: 34,
        pos: [82, 84.11, 11, 8.89], tocco: [[82.9, 84.8, 92.1, 92.6]],
        descrizione: "Un cactus alto alto con le braccia piene di fiori rosa."
      }
    }
  },
  {
    id: "fata", nome: "I cappelli di fata", musica: "prato", sfondo: "img/zona9/vuota.jpg", cartella: "img/zona9/", senzaIcone: true,
    descrizione: "Una valle di camini di roccia a forma di cappello, con le mongolfiere che volano all'alba.",
    prati: [{ x1: 28, x2: 72, y1: 66, y2: 92 }],
    pezzi: {
      fat_casa: {
        nome: "Casetta nel cappello di fata", livello: 19, costo: { sassolini: 16, legnetti: 10 }, xp: 34,
        pos: [62, 57.43, 22, 14.57], tocco: [[63.8, 58.6, 82.2, 71.3]],
        descrizione: "Una casetta scavata in un camino di roccia a forma di cappello, con le finestrelle fiorite."
      },
      fat_scala: {
        nome: "Scalinata di pietra", livello: 19, costo: { sassolini: 10 }, xp: 18,
        pos: [14, 63.34, 11, 9.66], tocco: [[14.9, 64.1, 24.1, 72.5]],
        descrizione: "Una scalinata di pietra chiara con i vasetti di fiori sugli scalini."
      },
      fat_lavanda: {
        nome: "Cespugli di lavanda", livello: 19, costo: { petali: 10 }, xp: 20,
        pos: [46, 63.92, 15, 7.08], tocco: [[47.2, 64.5, 59.8, 70.6]], bolla: [53.5, 65.9],
        produce: { materiale: "petali", ogni: 3 * MINUTO, max: 5 },
        descrizione: "Lavanda profumata, con le farfalle che ci girano intorno."
      },
      fat_tappeti: {
        nome: "Bancarella dei tappeti", livello: 20, costo: { legnetti: 10, petali: 10 }, xp: 26,
        pos: [30, 63.45, 14, 7.55], tocco: [[31.1, 64.1, 42.9, 70.6]],
        descrizione: "Tappeti colorati appesi e arrotolati, tutti diversi."
      },
      fat_pozzo: {
        nome: "Pozzo antico", livello: 20, costo: { sassolini: 12 }, xp: 22,
        pos: [34, 80.88, 11, 5.12], tocco: [[34.9, 81.3, 44.1, 85.7]], bolla: [39.5, 82.9],
        produce: { materiale: "sassolini", ogni: 4 * MINUTO, max: 4 },
        descrizione: "Un vecchio pozzo di pietra con la manovella e il secchiello."
      },
      fat_ponte: {
        nome: "Ponticello di pietra", livello: 20, costo: { sassolini: 14, stelle: 2 }, xp: 26,
        pos: [24, 76.54, 20, 3.46], tocco: [[25.6, 76.8, 42.4, 79.8]],
        descrizione: "Un ponte ad arco di pietre chiare con le piantine sopra."
      },
      fat_te: {
        nome: "Tavolino del tè", livello: 20, costo: { legnetti: 8, petali: 10 }, xp: 26,
        pos: [47, 72.94, 17, 6.56], tocco: [[48.4, 73.5, 62.6, 79.2]],
        descrizione: "Un tavolino basso con la teiera, i bicchierini e i cuscini ricamati."
      },
      fat_vigna: {
        nome: "Filare di uva", livello: 21, costo: { legnetti: 12, spinaci: 6 }, xp: 26,
        pos: [66, 74.04, 19, 4.96], tocco: [[67.5, 74.4, 83.5, 78.8]], bolla: [75.5, 76.0],
        produce: { materiale: "spinaci", ogni: 2 * MINUTO, max: 6 },
        descrizione: "Grappoli d'uva viola sui pali di legno. E sotto, qualche spinacino!"
      },
      fat_ceramiche: {
        nome: "Angolo delle ceramiche", livello: 21, costo: { sassolini: 10, petali: 8 }, xp: 26,
        pos: [74, 79.18, 13, 6.82], tocco: [[75.0, 79.7, 86.0, 85.7]],
        descrizione: "Vasi, ciotole e piatti dipinti a mano."
      },
      fat_fontana: {
        nome: "Fontanella nella roccia", livello: 21, costo: { sassolini: 12, stelle: 2 }, xp: 28,
        pos: [24, 86.97, 13, 7.03], tocco: [[25.0, 87.5, 36.0, 93.6]],
        descrizione: "Una fontanella scavata nella pietra, con l'edera intorno."
      },
      fat_terrazza: {
        nome: "Terrazza dei gerani", livello: 21, costo: { sassolini: 12, petali: 12, stelle: 2 }, xp: 30,
        pos: [46, 86.59, 20, 6.41], tocco: [[47.6, 87.1, 64.4, 92.7]],
        descrizione: "Una terrazza di pietra piena di vasi di gerani rossi e rosa."
      },
      fat_altalena: {
        nome: "Altalena dell'albicocco", livello: 22, costo: { legnetti: 14, stelle: 3 }, xp: 30,
        pos: [80, 83.06, 17, 11.94], tocco: [[81.4, 84.0, 95.6, 94.4]], bolla: [88.5, 85.1],
        produce: { materiale: "legnetti", ogni: 3 * MINUTO, max: 5 },
        descrizione: "Un grande albicocco con l'altalena: dai rami cadono legnetti."
      },
      fat_lanterne: {
        nome: "Albero delle lanterne", livello: 22, costo: { petali: 14, stelle: 3 }, xp: 32,
        pos: [3, 74.65, 17, 12.35], tocco: [[4.4, 75.6, 18.6, 86.4]],
        descrizione: "Un albero pieno di lanternine colorate che brillano."
      },
      fat_mongolfiere: {
        nome: "Mongolfiere dell'alba", livello: 22, costo: { petali: 16, legnetti: 12, stelle: 4 }, xp: 38,
        pos: [30, 30.11, 22, 11.89], tocco: [[31.8, 31.1, 50.2, 41.4]],
        descrizione: "Tre mongolfiere a righe che volano sopra la valle all'alba."
      }
    }
  },
  {
    id: "panna", nome: "Le colline di panna", musica: "radura", sfondo: "img/zona10/vuota.jpg", cartella: "img/zona10/", senzaIcone: true,
    descrizione: "Colline di panna montata, lecca-lecca giganti e un fiume di cioccolato.",
    prati: [{ x1: 28, x2: 80, y1: 74, y2: 90 }],
    pezzi: {
      pan_casetta: {
        nome: "Casetta di pan di zenzero", livello: 20, costo: { legnetti: 16, petali: 10 }, xp: 34,
        pos: [52, 64.3, 20, 10.7], tocco: [[53.6, 65.2, 70.4, 74.5]],
        descrizione: "Una casetta di biscotto con la glassa sul tetto e i bottoni di zucchero."
      },
      pan_lecca: {
        nome: "Albero dei lecca-lecca", livello: 20, costo: { petali: 12 }, xp: 22,
        pos: [31, 65.3, 12, 9.2], tocco: [[32.0, 66.0, 42.0, 74.0]],
        descrizione: "Un albero tutto di lecca-lecca colorati."
      },
      pan_fontana: {
        nome: "Fontana cupcake", livello: 20, costo: { sassolini: 10, petali: 8 }, xp: 26,
        pos: [42, 72.64, 10, 7.86], tocco: [[42.8, 73.3, 51.2, 80.1]],
        descrizione: "Una fontana a forma di cupcake da cui scende latte alla fragola."
      },
      pan_staccionata: {
        nome: "Staccionata di bastoncini", livello: 20, costo: { legnetti: 10 }, xp: 20,
        pos: [62, 72.76, 15, 7.24], tocco: [[63.2, 73.3, 75.8, 79.6]], bolla: [69.5, 74.8],
        produce: { materiale: "legnetti", ogni: 3 * MINUTO, max: 5 },
        descrizione: "Una staccionata di bastoncini di zucchero a righe bianche e rosse."
      },
      pan_fragola: {
        nome: "Casetta fragola", livello: 21, costo: { petali: 14, sassolini: 6 }, xp: 28,
        pos: [84, 73.95, 11, 7.55], tocco: [[84.9, 74.6, 94.1, 81.1]], bolla: [89.5, 76.0],
        produce: { materiale: "spinaci", ogni: 2 * MINUTO, max: 6 },
        descrizione: "Una fragola gigante con la porticina: e dentro ci sono anche gli spinaci!"
      },
      pan_panchina: {
        nome: "Sedia di biscotto", livello: 21, costo: { legnetti: 8, petali: 6 }, xp: 20,
        pos: [30, 78.83, 9, 6.67], tocco: [[30.7, 79.4, 38.3, 85.2]],
        descrizione: "Una sedia fatta di due biscotti con le gocce di cioccolato."
      },
      pan_ciambella: {
        nome: "Laghetto ciambella", livello: 21, costo: { sassolini: 12, petali: 10 }, xp: 30,
        pos: [46, 81.56, 17, 5.94], tocco: [[47.4, 82.0, 61.6, 87.2]],
        descrizione: "Un laghetto dentro una ciambella rosa con gli zuccherini, e una paperella di gelatina."
      },
      pan_gommose: {
        nome: "Giardino delle gommose", livello: 21, costo: { petali: 10, sassolini: 6 }, xp: 24,
        pos: [64, 87.14, 16, 6.36], tocco: [[65.3, 87.6, 78.7, 93.2]], bolla: [72.0, 89.1],
        produce: { materiale: "petali", ogni: 3 * MINUTO, max: 5 },
        descrizione: "Fiori di gelatina e caramelle gommose che crescono sulla panna."
      },
      pan_waffle: {
        nome: "Tavolino waffle", livello: 21, costo: { legnetti: 10, stelle: 2 }, xp: 26,
        pos: [48, 86.13, 11, 6.87], tocco: [[48.9, 86.7, 58.1, 92.7]],
        descrizione: "Un tavolino di waffle con fragole e panna, e due sgabelli cupcake."
      },
      pan_ponte: {
        nome: "Ponte di cioccolato", livello: 22, costo: { legnetti: 14, sassolini: 8, stelle: 2 }, xp: 30,
        pos: [6, 79.11, 19, 5.89], tocco: [[7.5, 79.6, 23.5, 84.7]],
        descrizione: "Un ponte di cioccolato e wafer sul fiume di cioccolata."
      },
      pan_macaron: {
        nome: "Sentiero di macaron", livello: 22, costo: { sassolini: 14, stelle: 2 }, xp: 28,
        pos: [26, 85.87, 18, 10.13], tocco: [[27.4, 86.7, 42.6, 95.5]], bolla: [35.0, 87.9],
        produce: { materiale: "sassolini", ogni: 4 * MINUTO, max: 4 },
        descrizione: "Macaron colorati per attraversare il fiume di cioccolato."
      },
      pan_altalena: {
        nome: "Altalena marshmallow", livello: 22, costo: { legnetti: 12, stelle: 3 }, xp: 30,
        pos: [71, 78.49, 11, 9.51], tocco: [[71.9, 79.3, 81.1, 87.5]],
        descrizione: "Un'altalena con il seggiolino di marshmallow e le corde di liquirizia."
      },
      pan_gelati: {
        nome: "Chiosco dei gelati", livello: 22, costo: { legnetti: 12, petali: 12, stelle: 2 }, xp: 32,
        pos: [84, 86.06, 13, 7.44], tocco: [[85.0, 86.7, 96.0, 93.1]],
        descrizione: "Gelato alla fragola, al limone e ai mirtilli, con i coni croccanti."
      },
      pan_torta: {
        nome: "Torre di torta", livello: 22, costo: { petali: 18, sassolini: 10, stelle: 4 }, xp: 40,
        pos: [78, 64.2, 13, 10.8], tocco: [[79.0, 65.1, 90.0, 74.5]],
        descrizione: "Una torta a tre piani con le fragole e la bandierina in cima."
      }
    }
  },
  {
    id: "gemme", nome: "La città di pietre preziose", musica: "nuvole", sfondo: "img/zona11/vuota.jpg", cartella: "img/zona11/", senzaIcone: true,
    descrizione: "Una città scintillante fatta di gemme e cristalli, con l'arcobaleno nel cielo.",
    prati: [{ x1: 26, x2: 70, y1: 66, y2: 90 }],
    pezzi: {
      gem_casa: {
        nome: "Casetta di cristallo", livello: 21, costo: { sassolini: 18, petali: 10 }, xp: 36,
        pos: [38, 53.34, 18, 11.16], tocco: [[39.4, 54.2, 54.6, 63.9]],
        descrizione: "Una casetta di cristalli rosa e lilla con le finestre che brillano."
      },
      gem_lampione: {
        nome: "Lampione di cristallo", livello: 21, costo: { sassolini: 8 }, xp: 18,
        pos: [37, 59.98, 4, 11.52], tocco: [[37.3, 60.9, 40.7, 70.9]],
        descrizione: "Un lampione trasparente con una gemma che fa luce."
      },
      gem_fontana: {
        nome: "Fontana di zaffiro", livello: 21, costo: { sassolini: 14, stelle: 2 }, xp: 28,
        pos: [45, 67.02, 13, 5.48], tocco: [[46.0, 67.5, 57.0, 72.2]],
        descrizione: "Una fontana blu zaffiro piena di gemme che luccicano nell'acqua."
      },
      gem_albero: {
        nome: "Albero di smeraldi", livello: 22, costo: { petali: 12, sassolini: 8 }, xp: 28,
        pos: [25, 67.68, 12, 9.82], tocco: [[26.0, 68.5, 36.0, 77.0]], bolla: [31.0, 69.7],
        produce: { materiale: "spinaci", ogni: 2 * MINUTO, max: 6 },
        descrizione: "Un albero con le foglie di smeraldo. Ai suoi piedi crescono gli spinaci!"
      },
      gem_torre: {
        nome: "Torre di ametista", livello: 22, costo: { sassolini: 16, stelle: 2 }, xp: 32,
        pos: [22, 50.82, 8, 16.18], tocco: [[22.6, 52.1, 29.4, 66.2]],
        descrizione: "Una torre viola di ametista con un balconcino."
      },
      gem_bancarella: {
        nome: "Bancarella delle gemme", livello: 22, costo: { legnetti: 12, petali: 8 }, xp: 28,
        pos: [63, 74.8, 13, 7.7], tocco: [[64.0, 75.4, 75.0, 82.1]], bolla: [69.5, 76.8],
        produce: { materiale: "legnetti", ogni: 3 * MINUTO, max: 5 },
        descrizione: "Rubini, smeraldi e zaffiri in tante cassettine."
      },
      gem_giardino: {
        nome: "Giardino di fiori di vetro", livello: 22, costo: { petali: 14 }, xp: 24,
        pos: [49, 82.09, 15, 6.41], tocco: [[50.2, 82.6, 62.8, 88.2]], bolla: [56.5, 84.1],
        produce: { materiale: "petali", ogni: 3 * MINUTO, max: 5 },
        descrizione: "Fiori di vetro colorato che brillano al sole."
      },
      gem_carrello: {
        nome: "Carrello della miniera", livello: 23, costo: { legnetti: 12, sassolini: 10 }, xp: 28,
        pos: [29, 84.76, 12, 5.74], tocco: [[30.0, 85.2, 40.0, 90.2]], bolla: [35.0, 86.8],
        produce: { materiale: "sassolini", ogni: 4 * MINUTO, max: 4 },
        descrizione: "Un carrello pieno di pietre preziose sulle rotaie."
      },
      gem_panchina: {
        nome: "Panchina di diamante", livello: 23, costo: { sassolini: 14, stelle: 2 }, xp: 30,
        pos: [38, 80.16, 12, 4.34], tocco: [[39.0, 80.5, 49.0, 84.3]],
        descrizione: "Una panchina di diamante con un cuscino rosa morbido."
      },
      gem_ponte: {
        nome: "Ponte di rubini", livello: 23, costo: { sassolini: 16, stelle: 3 }, xp: 32,
        pos: [52, 73.42, 17, 4.08], tocco: [[53.4, 73.7, 67.6, 77.3]],
        descrizione: "Un ponte ad arco fatto di rubini rossi."
      },
      gem_scrigno: {
        nome: "Negozio portagioie", livello: 23, costo: { petali: 16, legnetti: 10, stelle: 2 }, xp: 32,
        pos: [76, 68.49, 12, 8.01], tocco: [[77.0, 69.1, 87.0, 76.1]],
        descrizione: "Un negozio a forma di scrigno pieno di collane e anelli."
      },
      gem_arco: {
        nome: "Arco di topazio", livello: 24, costo: { sassolini: 14, petali: 10, stelle: 3 }, xp: 34,
        pos: [65, 83.73, 10, 6.77], tocco: [[65.8, 84.3, 74.2, 90.2]],
        descrizione: "Un arco di topazi dorati che luccicano."
      },
      gem_scala: {
        nome: "Scala di acquamarina", livello: 24, costo: { sassolini: 12, stelle: 3 }, xp: 30,
        pos: [77, 87.21, 8, 7.29], tocco: [[77.6, 87.8, 84.4, 94.1]],
        descrizione: "Una scala di cristallo azzurro che sale verso il cielo."
      },
      gem_laghetto: {
        nome: "Laghetto arcobaleno", livello: 24, costo: { sassolini: 16, petali: 16, stelle: 4 }, xp: 40,
        pos: [33, 91.64, 18, 6.36], tocco: [[34.4, 92.1, 49.6, 97.7]],
        descrizione: "Un laghetto con l'acqua di tutti i colori, circondato da gemme."
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
var LIVELLI_XP = [0, 0, 30, 80, 150, 240, 350, 480, 630, 800, 1000, 1220, 1470, 1750, 2060, 2400, 2780, 3200, 3660, 4160, 4700, 5300, 6000, 6800, 7700];
// ogni quanto cade una stellina nel giardino
var STELLA_OGNI = 3 * 60000;

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
  sfida: {
    nome: "Il sentiero", img: "img/nebbione/nebbione.png", livello: 1, energia: 0, arcade: true, nascosto: true,
    descrizione: "Il sentiero verso la terra dopo! È l'avventura più lunga: corri, salta i nebbiolini e non farti prendere dal Nebbione. In fondo ti aspetta un forziere."
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
  { testo: "Completa il Cielo del Celeste", stelle: 10, xp: 100, verifica: function (s) { return Object.keys(zonaId("cielo").pezzi).every(function (k) { return costruito(s, k); }); } },
  { testo: "Risolvi il Sudoku dei fiori", stelle: 2, xp: 15, ordine: 6.5, verifica: function (s) { return (s.contatori.sudokuCompleti || 0) >= 1; } },
  { testo: "Rimetti in ordine il Puzzle del Bosco", stelle: 2, xp: 15, ordine: 7.5, verifica: function (s) { return (s.contatori.puzzleCompleti || 0) >= 1; } },
  { testo: "Esci dal Labirinto delle siepi", stelle: 2, xp: 15, ordine: 8.5, verifica: function (s) { return (s.contatori.labirintiCompleti || 0) >= 1; } },
  { testo: "Risolvi 3 Sudoku senza errori", stelle: 3, xp: 30, ordine: 15.5, progresso: function (s) { return [s.contatori.sudokuPerfetti || 0, 3]; }, verifica: function (s) { return (s.contatori.sudokuPerfetti || 0) >= 3; } },
  { testo: "Completa il Puzzle difficile da 16 tessere", stelle: 3, xp: 30, ordine: 16.5, verifica: function (s) { return (s.contatori.puzzleDifficili || 0) >= 1; } },
  { testo: "Prendi tutti e 5 i petali nel Labirinto", stelle: 2, xp: 20, ordine: 17.5, progresso: function (s) { return [s.record.labirintoPetali || 0, 5]; }, verifica: function (s) { return (s.record.labirintoPetali || 0) >= 5; } },
  { testo: "Aggiusta 3 cose con l'Aggiustatutto", stelle: 2, xp: 20, ordine: 9.5, progresso: function (s) { return [s.contatori.aggiustati || 0, 3]; }, verifica: function (s) { return (s.contatori.aggiustati || 0) >= 3; } },
  { testo: "Aggiusta 3 cose al primo colpo", stelle: 3, xp: 30, ordine: 18.5, progresso: function (s) { return [s.contatori.aggiustatiPrimo || 0, 3]; }, verifica: function (s) { return (s.contatori.aggiustatiPrimo || 0) >= 3; } },
  { testo: "Esci dal Labirinto nella nebbia", stelle: 3, xp: 30, ordine: 19.5, verifica: function (s) { return (s.contatori.labirintiDifficili || 0) >= 1; } },
  // le sfide nuove vanno sempre in fondo: il salvataggio ricorda le sfide per posizione
  { testo: "Completa la foresta delle lucciole", stelle: 8, xp: 80, ordine: 29.5, verifica: function (s) { return Object.keys(zonaId("foresta").pezzi).every(function (k) { return costruito(s, k); }); } },
  { testo: "Completa le isole fluttuanti", stelle: 8, xp: 85, ordine: 29.7, verifica: function (s) { return Object.keys(zonaId("isole").pezzi).every(function (k) { return costruito(s, k); }); } },
  { testo: "Completa le terre del nord", stelle: 8, xp: 90, ordine: 29.8, verifica: function (s) { return Object.keys(zonaId("nord").pezzi).every(function (k) { return costruito(s, k); }); } },
  { testo: "Completa il deserto dei fiori di cactus", stelle: 8, xp: 95, ordine: 29.85, verifica: function (s) { return Object.keys(zonaId("deserto").pezzi).every(function (k) { return costruito(s, k); }); } },
  { testo: "Completa i cappelli di fata", stelle: 8, xp: 100, ordine: 29.9, verifica: function (s) { return Object.keys(zonaId("fata").pezzi).every(function (k) { return costruito(s, k); }); } },
  { testo: "Completa le colline di panna", stelle: 8, xp: 105, ordine: 29.95, verifica: function (s) { return Object.keys(zonaId("panna").pezzi).every(function (k) { return costruito(s, k); }); } },
  { testo: "Completa la città di pietre preziose", stelle: 8, xp: 110, ordine: 29.97, verifica: function (s) { return Object.keys(zonaId("gemme").pezzi).every(function (k) { return costruito(s, k); }); } }
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
  { id: "verde", nome: "Verde", carattere: "tranquilli e saggi" },
  { id: "arcobaleno", nome: "Arcobaleno", carattere: "rarissimi e pieni di fantasia" }
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
                     speciale: "Nel forziere della Radura", vinto: function (s) { return forziereAperto(s, "radura"); } },
  cappello_mago:   { nome: "Cappello da mago",   posto: "testa", img: "img/casa/accessori/cappello_mago.png",   f: { x: 50, y: -8, w: 46 },
                     speciale: "Nel forziere del Ruscello", vinto: function (s) { return forziereAperto(s, "ruscello"); } },
  berretto_lana:   { nome: "Berretto di lana",   posto: "testa", img: "img/casa/accessori/berretto_lana.png",   f: { x: 50, y: 3, w: 46 }, prezzo: { petali: 35 } },
  basco:           { nome: "Basco da pittore",   posto: "testa", img: "img/casa/accessori/basco.png",           f: { x: 45, y: 5, w: 52, r: -12 }, prezzo: { petali: 45 } },
  cuffie:          { nome: "Cuffie musicali",    posto: "testa", img: "img/casa/accessori/cuffie.png",          f: { x: 50, y: 19, w: 60 }, prezzo: { stelle: 7 } },
  occhiali_cuore:  { nome: "Occhiali a cuore",   posto: "viso",  img: "img/casa/accessori/occhiali_cuore.png",  f: { x: 50, y: 20, w: 44 }, prezzo: { stelle: 6 } },
  campanellino:    { nome: "Collare col campanellino", posto: "collo", img: "img/casa/accessori/campanellino.png", f: { x: 50, y: 39, w: 36 }, prezzo: { petali: 20 } },
  grembiule:       { nome: "Grembiule a fiori",  posto: "corpo", img: "img/casa/accessori/grembiule.png",       f: { x: 50, y: 63, w: 50 }, prezzo: { petali: 30 } },
  tutu:            { nome: "Tutù rosa",          posto: "corpo", img: "img/casa/accessori/tutu.png",            f: { x: 50, y: 76, w: 86 }, prezzo: { petali: 35 } },
  mantello:        { nome: "Mantello da supereroe", posto: "schiena", img: "img/casa/accessori/mantello.png",   f: { x: 50, y: 52, w: 124 },
                     speciale: "Nel forziere del Cielo", vinto: function (s) { return forziereAperto(s, "cielo"); } },
  ali_fata:        { nome: "Ali di fata",        posto: "schiena", img: "img/casa/accessori/ali_fata.png",      f: { x: 50, y: 38, w: 118 },
                     speciale: "Nel forziere della Collina", vinto: function (s) { return forziereAperto(s, "collina"); } }
};


// ---------- La grande missione ----------
// Il Nebbione, una nuvola grigia e brontolona che non sopporta i colori, ha chiuso dodici Chiwinnie
// in bolle di nebbia. Ogni bolla si apre con le lucine, che si guadagnano con le missioni.
// Gli amici liberati vanno a vivere nella loro zona e portano un regalo.
// Ogni amico si libera con le lucine magiche (lucine), che si guadagnano giocando ai minigiochi.
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
  { id: "lumino",    nome: "Lumino",    colore: "bianco", look: { collo: "campanellino" },    zona: "foresta",  lucine: 4, regalo: { legnetti: 12, petali: 8 } },
  { id: "mora",      nome: "Mora", femmina: true,      colore: "viola",  look: { testa: "coroncina_fiori" }, zona: "foresta", lucine: 5, regalo: { petali: 14, stelle: 1 } },
  { id: "brezza",    nome: "Brezza", femmina: true,    colore: "verde",  look: { viso: "occhiali_cuore" },  zona: "foresta",  lucine: 5, regalo: { sassolini: 10, stelle: 2 } },
  { id: "piuma",     nome: "Piuma", femmina: true,     colore: "rosa",   look: { testa: "cappello_paglia" }, zona: "isole", lucine: 5, regalo: { petali: 14, stelle: 1 } },
  { id: "zefiro",    nome: "Zefiro",    colore: "blu",    look: { collo: "sciarpa" },         zona: "isole",    lucine: 5, regalo: { legnetti: 14, sassolini: 8 } },
  { id: "trottola",  nome: "Trottola", femmina: true,  colore: "arcobaleno", look: { viso: "occhiali" }, zona: "isole",  lucine: 5, regalo: { spinaci: 10, stelle: 2 } },
  { id: "brina",     nome: "Brina", femmina: true,     colore: "bianco", look: { collo: "sciarpa" },         zona: "nord",     lucine: 5, regalo: { sassolini: 12, stelle: 1 } },
  { id: "pinolo",    nome: "Pinolo",    colore: "verde",  look: { testa: "berretto_lana" },   zona: "nord",     lucine: 6, regalo: { legnetti: 16, petali: 8 } },
  { id: "aurora",    nome: "Aurora", femmina: true,    colore: "viola",  look: { corpo: "tutu" },            zona: "nord",     lucine: 6, regalo: { petali: 16, stelle: 2 } },
  { id: "dattero",   nome: "Dattero",   colore: "verde",  look: { testa: "cappello_paglia" }, zona: "deserto",  lucine: 6, regalo: { spinaci: 12, petali: 10 } },
  { id: "zaffera",   nome: "Zaffera", femmina: true,   colore: "rosa",   look: { viso: "occhiali_cuore" },  zona: "deserto",  lucine: 6, regalo: { petali: 18, stelle: 2 } },
  { id: "cactino",   nome: "Cactino",   colore: "blu",    look: { testa: "cuffie" },          zona: "deserto",  lucine: 6, regalo: { sassolini: 14, stelle: 2 } },
  { id: "nocciola",  nome: "Nocciola", femmina: true,  colore: "viola",  look: { testa: "basco" },           zona: "fata",     lucine: 6, regalo: { petali: 18, stelle: 2 } },
  { id: "pistacchio", nome: "Pistacchio", colore: "verde", look: { collo: "papillon" },         zona: "fata",     lucine: 7, regalo: { legnetti: 18, sassolini: 10 } },
  { id: "anice",     nome: "Anice", femmina: true,     colore: "bianco", look: { testa: "fiocco" },          zona: "fata",     lucine: 7, regalo: { spinaci: 14, stelle: 2 } },
  { id: "meringa",   nome: "Meringa", femmina: true,   colore: "bianco", look: { testa: "coroncina_fiori" }, zona: "panna",  lucine: 7, regalo: { petali: 20, stelle: 2 } },
  { id: "biscotto",  nome: "Biscotto",  colore: "blu",    look: { collo: "campanellino" },    zona: "panna",    lucine: 7, regalo: { legnetti: 20, spinaci: 10 } },
  { id: "caramella", nome: "Caramella", femmina: true, colore: "arcobaleno", look: { testa: "fiocco" }, zona: "panna",    lucine: 8, regalo: { sassolini: 16, stelle: 3 } },
  { id: "gemma",     nome: "Gemma", femmina: true,     colore: "viola",  look: { testa: "fiocco" },          zona: "gemme",    lucine: 8, regalo: { petali: 22, stelle: 3 } },
  { id: "rubino",    nome: "Rubino",    colore: "rosa",   look: { testa: "cappello_paglia" }, zona: "gemme",    lucine: 8, regalo: { sassolini: 20, legnetti: 12 } },
  { id: "zaffiro",   nome: "Zaffiro",   colore: "blu",    look: { collo: "sciarpa" },         zona: "gemme",    lucine: 8, regalo: { spinaci: 16, stelle: 3 } },
  { id: "bubu",      nome: "Bubù",      colore: "bianco", look: { collo: "sciarpa" },         zona: "cielo",    lucine: 5, regalo: { petali: 15, stelle: 2 } },
  { id: "zenzero",   nome: "Zenzero",   colore: "verde",  look: { collo: "campanellino" },    zona: "cielo",    lucine: 5, regalo: { legnetti: 15, sassolini: 10 } },
  { id: "tobia",     nome: "Tobia",     colore: "arcobaleno", look: { testa: "corona" },          zona: "cielo",    lucine: 6, regalo: { stelle: 5 } }
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
function premioMissione(grado) { return { lucine: 1, xp: 8 + grado * 2, materiali: { petali: 2 + grado, legnetti: 2 + grado, stelle: 1 } }; }
function premioGrado(grado) { return { lucine: 2, materiali: { legnetti: 5 + grado * 2, sassolini: 3 + grado, petali: 5 + grado * 2, spinaci: 4 }, stelle: grado % 3 === 0 ? 2 : 1 }; }

// ---------- Il viaggio ----------
// Il Giardino magico dei Chiwinnie è fatto di tante terre. In ogni terra il Nebbione ha nascosto tre amici:
// si liberano con le lucine magiche guadagnate giocando ai minigiochi. Liberati tutti, si parte per la terra
// dopo con un'avventura arcade (il sentiero), e alla fine del sentiero c'è un forziere.
// Dopo l'ultima terra, il sentiero è la battaglia finale verso il Castello delle nuvole.
// Le stelle invece servono ad arredare: è la parte tranquilla del gioco, non serve per andare avanti.
var CAPITOLI = [
  { zona: "radura", tema: "bosco", accessorio: "corona", premio: { stelle: 8, petali: 20, legnetti: 20, sassolini: 10 },
    arrivo: "La Radura ha perso i suoi colori. Qui il Nebbione ha nascosto Pimpi, Mirtillo e Nuvoletta.",
    fine: "Pimpi, Mirtillo e Nuvoletta sono liberi e la Radura è di nuovo piena di colori!" },
  { zona: "ruscello", tema: "ruscello", accessorio: "cappello_mago", premio: { stelle: 10, petali: 25, legnetti: 25, sassolini: 15 },
    arrivo: "Lungo il Ruscello l'acqua non brilla più. Il Nebbione ha chiuso nelle bolle Ciuffo, Lulù e Fagiolo.",
    fine: "Il Ruscello torna a cantare: Ciuffo, Lulù e Fagiolo sono salvi!" },
  { zona: "collina", tema: "collina", accessorio: "ali_fata", premio: { stelle: 12, petali: 30, legnetti: 25, sassolini: 20 },
    arrivo: "Sulla Collina i fiori sono chiusi e grigi. Qui sono prigionieri Stellina, Brillo e Pervinca.",
    fine: "Tutti i fiori della Collina si aprono insieme: Stellina, Brillo e Pervinca sono liberi!" },
  { zona: "foresta", tema: "foresta", premio: { stelle: 12, petali: 30, legnetti: 30, sassolini: 20 },
    arrivo: "Nella foresta delle lucciole le lucine si sono spente. Qui il Nebbione ha nascosto Lumino, Mora e Brezza.",
    fine: "Le lucciole si riaccendono tutte insieme: Lumino, Mora e Brezza sono liberi!" },
  { zona: "isole", tema: "isole", premio: { stelle: 14, petali: 35, legnetti: 30, sassolini: 25 },
    arrivo: "Le isole fluttuanti sono grigie e le cascate non brillano più. Qui il Nebbione ha nascosto Piuma, Zefiro e Trottola.",
    fine: "Le cascate tornano a brillare tra le nuvole: Piuma, Zefiro e Trottola sono liberi!" },
  { zona: "nord", tema: "nord", premio: { stelle: 15, petali: 35, legnetti: 35, sassolini: 25 },
    arrivo: "Nelle terre del nord l'aurora si è spenta e la neve è tutta grigia. Qui il Nebbione ha nascosto Brina, Pinolo e Aurora.",
    fine: "L'aurora torna a danzare nel cielo: Brina, Pinolo e Aurora sono liberi!" },
  { zona: "deserto", tema: "deserto", premio: { stelle: 16, petali: 40, legnetti: 35, sassolini: 30 },
    arrivo: "Nel deserto i fiori dei cactus si sono chiusi e la sabbia è grigia. Qui il Nebbione ha nascosto Dattero, Zaffera e Cactino.",
    fine: "Tutti i cactus fioriscono insieme: Dattero, Zaffera e Cactino sono liberi!" },
  { zona: "fata", tema: "fata", premio: { stelle: 18, petali: 40, legnetti: 40, sassolini: 30 },
    arrivo: "Nella valle dei cappelli di fata le mongolfiere non volano più e la roccia è grigia. Qui il Nebbione ha nascosto Nocciola, Pistacchio e Anice.",
    fine: "Le mongolfiere tornano a volare all'alba: Nocciola, Pistacchio e Anice sono liberi!" },
  { zona: "panna", tema: "panna", premio: { stelle: 20, petali: 45, legnetti: 40, sassolini: 35 },
    arrivo: "Sulle colline di panna i dolci hanno perso il loro colore e il cioccolato non profuma più. Qui il Nebbione ha nascosto Meringa, Biscotto e Caramella.",
    fine: "Torna il profumo di fragola e cioccolato: Meringa, Biscotto e Caramella sono liberi!" },
  { zona: "gemme", tema: "gemme", premio: { stelle: 22, petali: 50, legnetti: 45, sassolini: 40 },
    arrivo: "Nella città di pietre preziose le gemme hanno smesso di brillare. Qui il Nebbione ha nascosto Gemma, Rubino e Zaffiro.",
    fine: "Tutte le gemme tornano a scintillare: Gemma, Rubino e Zaffiro sono liberi!" },
  { zona: "cielo", tema: "cielo", temaFinale: "castello", accessorio: "mantello", finale: true, premio: { stelle: 30, petali: 50, legnetti: 50, sassolini: 40 },
    arrivo: "Lassù nel Cielo, vicino al Castello delle nuvole, il Nebbione tiene le ultime bolle: Bubù, Zenzero e Tobia.",
    fine: "Tutti i Chiwinnie sono liberi! Ora si va al Castello delle nuvole: è il momento della battaglia finale." }
];
// le terre del Giardino magico che stiamo ancora dipingendo: si vedono nella mappa
var TERRE_IN_ARRIVO = [];
// le lucine magiche guadagnate con una partita: una se va bene, due se va benissimo
function lucinePartita(d) {
  if (!d || d.gioco === "colora" || d.gioco === "sfida") return 0;
  var bene = d.completato || (d.punti || 0) >= 10, benissimo = (d.stelle || 0) > 0 || (d.stelleLivello || 0) >= 3;
  return bene ? (benissimo ? 2 : 1) : 0;
}
// il paesaggio dell'avventura del sentiero: quello della terra dove si sta andando
function temaSentiero(c) { var d = CAPITOLI[CAPITOLI.indexOf(c) + 1]; return c.finale ? (c.temaFinale || c.tema) : !d ? c.tema : d.tema; }
function zonaId(id) { return ZONE.filter(function (z) { return z.id === id; })[0]; }
function capitoloDi(zona) { return CAPITOLI.filter(function (c) { return c.zona === zona; })[0] || null; }
function nomeCapitolo(c) { if (c.nome) return c.nome; var z = ZONE.filter(function (x) { return x.id === c.zona; })[0]; return z ? z.nome : ""; }
function forziereAperto(s, zona) { return !!(s.viaggio && s.viaggio.battuti && s.viaggio.battuti.indexOf(zona) !== -1); }
// una zona è aperta se il capitolo prima è stato vinto (o, per chi giocava già, se la zona prima era stata completata)
function zonaApertaIn(s, i) {
  if (i <= 0) return true;
  var prima = ZONE[i - 1].id, v = s.viaggio || {}, z = ZONE[i];
  if (forziereAperto(s, prima) || (v.vecchie || []).indexOf(prima) !== -1) return true;
  // quando si aggiunge una terra nuova nel mezzo, chi era già più avanti non perde le zone dove ha giocato
  return !!z && ((z.pezzi && Object.keys(z.pezzi).some(function (k) { return (s.costruiti || []).indexOf(k) !== -1; })) ||
    AMICI.some(function (a) { return a.zona === z.id && ((s.missione || {}).liberati || []).indexOf(a.id) !== -1; }));
}
