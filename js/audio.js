// Suoni e musica, generati al momento con la Web Audio API: nessun file audio da scaricare.
// Suoni.musica("radura"|"raccolta"|"memory"|"lucciole"|null), Suoni.sfx(nome), Suoni.voce(testo).
var Suoni = (function () {
  "use strict";

  var CHIAVE_MUTO = "chiwinnie-audio-muto";
  var ctx = null, master, bus, riverbero, musicaGain, sfxGain;
  var muto = false;
  try { muto = localStorage.getItem(CHIAVE_MUTO) === "1"; } catch (e) {}

  function nota(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function caso(a) { return a[Math.floor(Math.random() * a.length)]; }

  function crea() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = muto ? 0 : 0.9;
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    // riverbero "da bosco": rumore che si spegne piano
    riverbero = ctx.createConvolver();
    var durata = 2.8, len = ctx.sampleRate * durata, imp = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) {
      var d = imp.getChannelData(c);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    riverbero.buffer = imp;
    var rGain = ctx.createGain(); rGain.gain.value = 0.32;
    riverbero.connect(rGain); rGain.connect(master);
    bus = ctx.createGain(); bus.connect(master); bus.connect(riverbero);
    musicaGain = ctx.createGain(); musicaGain.gain.value = 0.32; musicaGain.connect(bus);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.55; sfxGain.connect(bus);
    return true;
  }

  // Il browser permette l'audio solo dopo un gesto: si sblocca al primo tocco.
  function sblocca() {
    if (!ctx && !crea()) return;
    if (ctx.state === "suspended") ctx.resume();
    if (temaVoluto && !temaAttivo) avviaTema(temaVoluto);
  }
  document.addEventListener("pointerdown", sblocca, true);
  document.addEventListener("visibilitychange", function () {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });

  // ---------- Strumenti ----------
  // Carillon / arpa: due sinusoidi con attacco rapido e coda lunga
  function pizzico(t, m, dur, vol, dest) {
    var f = nota(m);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    [[1, 1], [2, 0.25], [3.01, 0.08]].forEach(function (p) {
      var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f * p[0];
      var og = ctx.createGain(); og.gain.value = p[1];
      o.connect(og); og.connect(g); o.start(t); o.stop(t + dur + 0.05);
    });
    g.connect(dest || musicaGain);
  }
  // Pad morbido per gli accordi
  function tappeto(t, note, dur, vol) {
    var g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + dur * 0.35);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    note.forEach(function (m, i) {
      var o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = nota(m); o.detune.value = (i % 2 ? 6 : -6);
      o.connect(lp); o.start(t); o.stop(t + dur + 0.05);
    });
    lp.connect(g); g.connect(musicaGain);
  }
  function basso(t, m, dur, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = nota(m);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(musicaGain); o.start(t); o.stop(t + dur + 0.05);
  }
  function tono(t, f1, f2, dur, vol, tipo, dest) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo || "sine";
    o.frequency.setValueAtTime(f1, t);
    if (f2 !== f1) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || sfxGain); o.start(t); o.stop(t + dur + 0.05);
  }
  function rumore(t, dur, vol, filtro, freq, q) {
    var len = Math.max(1, Math.floor(ctx.sampleRate * dur)), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var s = ctx.createBufferSource(); s.buffer = buf;
    var f = ctx.createBiquadFilter(); f.type = filtro || "lowpass"; f.frequency.value = freq || 800; f.Q.value = q || 1;
    var g = ctx.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t); s.stop(t + dur);
  }

  // ---------- Musica ----------
  // Ogni tema ha un giro di accordi maggiore, un ritornello (motivo) che si ripete e un ritmo.
  // giro: [distanza dalla tonica, "M" maggiore | "m" minore]; motivo: 16 ottavi, numeri = gradi della scala pentatonica.
  var PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
  var I_V_vi_IV = [[0, "M"], [7, "M"], [9, "m"], [5, "M"]];
  var TEMI = {
    // le zone (casa base): allegre ma tranquille
    radura:   { bpm: 100, chiave: 60, giro: I_V_vi_IV, ritmo: "saltellante", shaker: 0.03,
                motivo: [4, null, 3, 2, 3, 4, 6, null, 5, null, 4, 3, 4, null, null, null] },
    riva:     { bpm: 92, chiave: 62, giro: [[0, "M"], [5, "M"], [0, "M"], [7, "M"]], ritmo: "fluido",
                motivo: [2, 3, 4, null, 6, null, 5, 4, 3, null, 2, 3, 4, null, null, null] },
    prato:    { bpm: 112, chiave: 55, giro: [[0, "M"], [5, "M"], [7, "M"], [0, "M"]], ritmo: "saltellante", shaker: 0.04,
                motivo: [5, 5, 6, null, 5, 4, 3, null, 4, 4, 5, null, 3, null, null, null] },
    nuvole:   { bpm: 90, chiave: 64, giro: [[0, "M"], [4, "m"], [5, "M"], [7, "M"]], ritmo: "fluido", brillio: true,
                motivo: [5, null, 4, null, 3, 4, 5, null, 6, null, 5, null, 3, null, null, null] },
    notte:    { bpm: 76, chiave: 65, giro: [[0, "M"], [9, "m"], [5, "M"], [7, "M"]], ritmo: "dolce", brillio: true,
                motivo: [4, null, null, 5, 6, null, null, null, 5, null, 4, null, 3, null, null, null] },
    // le avventure: vivaci, con il ritmo
    bosco:    { bpm: 128, chiave: 55, giro: I_V_vi_IV, ritmo: "saltellante", batteria: true,
                motivo: [5, null, 5, 6, 7, null, 6, 5, 4, null, 4, 5, 6, null, 5, null] },
    ruscello: { bpm: 122, chiave: 62, giro: [[0, "M"], [7, "M"], [5, "M"], [7, "M"]], ritmo: "fluido", batteria: true,
                motivo: [4, 5, 6, null, 6, 5, 4, null, 5, 6, 7, null, 6, null, null, null] },
    collina:  { bpm: 132, chiave: 57, giro: [[0, "M"], [5, "M"], [7, "M"], [5, "M"]], ritmo: "saltellante", batteria: true,
                motivo: [5, 6, 7, 6, 5, null, 3, null, 4, 5, 6, 5, 4, null, null, null] },
    cielo:    { bpm: 118, chiave: 64, giro: [[0, "M"], [9, "m"], [5, "M"], [7, "M"]], ritmo: "fluido", batteria: true, brillio: true,
                motivo: [5, null, 6, 5, 4, null, 3, null, 4, null, 5, 4, 3, null, null, null] },
    raccolta: { bpm: 120, chiave: 60, giro: I_V_vi_IV, ritmo: "saltellante", batteria: true,
                motivo: [4, 4, 5, null, 4, 3, 2, null, 3, 3, 4, null, 2, null, null, null] },
    memory:   { bpm: 104, chiave: 65, giro: I_V_vi_IV, ritmo: "saltellante", shaker: 0.025,
                motivo: [4, null, 5, null, 6, null, 5, 4, 3, null, 4, null, 2, null, null, null] }
  };
  TEMI.lucciole = TEMI.notte;
  var temaVoluto = null, temaAttivo = null, passo = 0, prossimoTempo = 0, timer = null;

  // marimba: legno morbido, nota breve e rotonda
  function marimba(t, m, vol) {
    var f = nota(m), g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    [[1, 1], [4, 0.12]].forEach(function (p) {
      var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f * p[0];
      var og = ctx.createGain(); og.gain.value = p[1]; o.connect(og); og.connect(g); o.start(t); o.stop(t + 0.4);
    });
    g.connect(musicaGain);
  }
  // flauto: la voce della melodia, con un piccolo vibrato
  function flauto(t, m, dur, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain(), vib = ctx.createOscillator(), vg = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = "triangle"; o.frequency.value = nota(m); lp.type = "lowpass"; lp.frequency.value = 2600;
    vib.frequency.value = 5.5; vg.gain.value = nota(m) * 0.006; vib.connect(vg); vg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.03);
    g.gain.setValueAtTime(vol, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(musicaGain);
    o.start(t); vib.start(t); o.stop(t + dur + 0.05); vib.stop(t + dur + 0.05);
  }
  function cassa(t) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
    g.gain.setValueAtTime(0.32, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g); g.connect(musicaGain); o.start(t); o.stop(t + 0.18);
  }
  function maracas(t, vol) {
    var len = Math.floor(ctx.sampleRate * 0.05), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = buf; f.type = "highpass"; f.frequency.value = 6000; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(musicaGain); s.start(t);
  }

  function avviaTema(nome) {
    temaAttivo = TEMI[nome];
    if (!temaAttivo) return;
    passo = 0;
    prossimoTempo = ctx.currentTime + 0.15;
    musicaGain.gain.cancelScheduledValues(ctx.currentTime);
    musicaGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    musicaGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1.2);
    clearInterval(timer);
    timer = setInterval(programma, 25);
  }
  function programma() {
    if (!temaAttivo || !ctx) return;
    var T = temaAttivo, ottavo = 60 / T.bpm / 2;
    while (prossimoTempo < ctx.currentTime + 0.12) {
      var t = prossimoTempo, dentro = passo % 8, battuta = Math.floor(passo / 8);
      var acc = T.giro[battuta % T.giro.length], radice = T.chiave + acc[0];
      var triade = acc[1] === "m" ? [0, 3, 7] : [0, 4, 7];
      // accordo morbido sotto, all'inizio di ogni battuta
      if (dentro === 0) tappeto(t, triade.map(function (x) { return radice + x; }), ottavo * 8.2, T.ritmo === "dolce" ? 0.05 : 0.035);
      // basso: tonica sui tempi forti, quinta in levare
      if (dentro === 0 || dentro === 4) basso(t, radice - 12, ottavo * 3, 0.24);
      if (T.ritmo === "saltellante" && dentro === 6) basso(t, radice - 5, ottavo * 1.5, 0.14);
      // accompagnamento
      if (T.ritmo === "saltellante") {
        var alberti = [0, 2, 1, 2, 0, 2, 1, 2];
        marimba(t, radice + 12 + triade[alberti[dentro]], dentro % 2 ? 0.07 : 0.09);
      } else if (T.ritmo === "fluido") {
        var su = [0, 1, 2, 3, 2, 1, 2, 3], note = [triade[0], triade[1], triade[2], 12];
        pizzico(t, radice + 12 + note[su[dentro]], ottavo * 4, 0.06);
      } else if (dentro % 2 === 0) {
        pizzico(t, radice + 12 + triade[(dentro / 2) % 3], ottavo * 8, 0.05);
      }
      // ritornello: si ripete ogni due battute; ogni tanto un'ottava sopra
      var giro2 = Math.floor(passo / 16), mi = passo % 16, grado = T.motivo[mi];
      if (grado !== null && grado !== undefined && giro2 % 4 !== 3) {
        var lung = 1; while (mi + lung < 16 && (T.motivo[mi + lung] === null) && lung < 3) lung++;
        var mn = T.chiave + 12 + PENTA[grado];
        if (giro2 % 4 === 2 && mn < 80) mn += 12;   // la variazione un'ottava sopra, ma senza diventare stridula
        flauto(t, mn, ottavo * lung * 0.95, T.ritmo === "dolce" ? 0.06 : 0.075);
      }
      // ritmo delle avventure
      if (T.batteria) {
        if (dentro === 0 || dentro === 4) cassa(t);
        if (dentro % 2 === 1) maracas(t, 0.05);
      } else if (T.shaker && dentro % 2 === 1) maracas(t, T.shaker);
      // scintille nel cielo e di sera
      if (T.brillio && dentro === 7 && Math.random() < 0.5) pizzico(t, T.chiave + 36 + caso(PENTA.slice(0, 5)), 0.8, 0.035);
      prossimoTempo += ottavo;
      passo++;
    }
  }

  function musica(nome) {
    if (nome === temaVoluto) return;
    temaVoluto = nome;
    if (!ctx || ctx.state !== "running") { temaAttivo = null; return; }
    if (!nome) {
      musicaGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      temaAttivo = null; setTimeout(function () { if (!temaVoluto) clearInterval(timer); }, 900);
      return;
    }
    // dissolvenza dal tema precedente al nuovo
    musicaGain.gain.cancelScheduledValues(ctx.currentTime);
    musicaGain.gain.setValueAtTime(musicaGain.gain.value, ctx.currentTime);
    musicaGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    temaAttivo = null;
    setTimeout(function () { if (temaVoluto === nome) avviaTema(nome); }, 550);
  }

  // ---------- Effetti ----------
  var EFFETTI = {
    tap: function (t) { tono(t, 900, 700, 0.06, 0.12); },
    errore: function (t) { tono(t, 330, 300, 0.14, 0.18, "triangle"); tono(t + 0.13, 262, 240, 0.2, 0.18, "triangle"); },
    costruisci: function (t) {
      rumore(t, 0.12, 0.5, "lowpass", 400); tono(t, 180, 90, 0.15, 0.4);
      [72, 76, 79, 84, 88].forEach(function (m, i) { pizzico(t + 0.08 + i * 0.06, m, 0.8, 0.12, sfxGain); });
    },
    raccogli: function (t) { tono(t, 520, 900, 0.1, 0.3); pizzico(t + 0.07, 91, 0.6, 0.14, sfxGain); },
    coccola: function (t) {
      // fusa: un ronzio basso che pulsa, e un piccolo "mrrp"
      var o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = "sawtooth"; o.frequency.value = 48; lp.type = "lowpass"; lp.frequency.value = 300;
      lfo.frequency.value = 22; lg.gain.value = 0.12;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.14, t + 0.1); g.gain.linearRampToValueAtTime(0.0001, t + 0.7);
      lfo.connect(lg); lg.connect(g.gain); o.connect(lp); lp.connect(g); g.connect(sfxGain);
      o.start(t); lfo.start(t); o.stop(t + 0.75); lfo.stop(t + 0.75);
      tono(t + 0.05, 520, 820, 0.16, 0.12, "triangle");
    },
    pasto: function (t) {
      for (var i = 0; i < 3; i++) { rumore(t + i * 0.13, 0.07, 0.35, "bandpass", 1800, 2); tono(t + i * 0.13, 300, 220, 0.08, 0.1); }
      tono(t + 0.42, 600, 900, 0.18, 0.12, "triangle");
    },
    livello: function (t) {
      [60, 64, 67, 72, 76, 79, 84].forEach(function (m, i) { pizzico(t + i * 0.09, m, 1.4, 0.16, sfxGain); });
      tono(t + 0.65, nota(72), nota(72), 0.8, 0.08, "triangle");
    },
    stella: function (t) { pizzico(t, 84, 1, 0.16, sfxGain); pizzico(t + 0.12, 91, 1.2, 0.16, sfxGain); },
    magia: function (t) { for (var i = 0; i < 9; i++) pizzico(t + i * 0.05, 84 + caso([0, 2, 4, 7, 9, 12]), 0.9, 0.08, sfxGain); },
    presa: function (t) { pizzico(t, caso([79, 81, 84, 86, 88]), 0.4, 0.15, sfxGain); },
    pigna: function (t) { tono(t, 140, 55, 0.25, 0.45); rumore(t, 0.15, 0.4, "lowpass", 300); },
    gira: function (t) { rumore(t, 0.09, 0.18, "highpass", 2500); },
    coppia: function (t) { pizzico(t, 79, 0.7, 0.14, sfxGain); pizzico(t + 0.1, 86, 0.9, 0.14, sfxGain); },
    lucciola: function (t) { pizzico(t, caso([86, 88, 91, 93, 96]), 1.2, 0.13, sfxGain); },
    fine: function (t) { [72, 76, 79, 84].forEach(function (m, i) { pizzico(t + i * 0.12, m, 1.2, 0.14, sfxGain); }); },
    passo: function (t) { rumore(t, 0.05, 0.08, "lowpass", 600); },
    rimbalzo: function (t) { tono(t, 220, 880, 0.22, 0.35, "triangle"); pizzico(t + 0.12, 88, 0.6, 0.12, sfxGain); }
  };
  function sfx(nome) {
    if (!ctx || ctx.state !== "running" || muto || !EFFETTI[nome]) return;
    EFFETTI[nome](ctx.currentTime + 0.01);
  }

  // Il chiwinnese: una sillaba cantata per ogni pezzetto di frase, come un uccellino
  // Cinguettii disattivati insieme alla voce. Per riattivarli: CINGUETTII_ATTIVI = true.
  var CINGUETTII_ATTIVI = false;
  function voce(testo) {
    if (!CINGUETTII_ATTIVI || !ctx || ctx.state !== "running" || muto) return;
    var sillabe = Math.min(10, Math.max(2, Math.round(String(testo).replace(/[^a-zàèéìòù]/gi, "").length / 3)));
    var base = caso([74, 76, 77]), t = ctx.currentTime + 0.02;
    for (var i = 0; i < sillabe; i++) {
      var m = base + caso([0, 2, 4, 5, 7]) - (i === sillabe - 1 ? 3 : 0);
      var dur = 0.07 + Math.random() * 0.04;
      tono(t, nota(m), nota(m + caso([-1, 1, 2])), dur, 0.07, "triangle");
      t += dur + 0.025;
    }
  }

  // Parole in chiwinnese dette ad alta voce con una vocina acuta (voce sintetica del telefono).
  // pron: come va letta perché la voce italiana la pronunci bene.
  var PRONUNCIA = {
    "Wii-chu!": "uìi ciù!", "Nimmi-nimmi!": "nìmmi nìmmi!", "Wonni-wonni!": "uònni uònni!",
    "Pum-pum winni!": "pum pum uìnni!", "Chirri-wà!": "chìrri uà!", "Chiii… winni?": "ciìi... uìnni?",
    "Gnam gnam! Wonni-wonni!": "gnam gnam! uònni uònni!", "Prrr… Pum-pum winni!": "prrr... pum pum uìnni!"
  };
  var vocina = null;
  function scegliVoce() {
    if (!("speechSynthesis" in window)) return null;
    var voci = window.speechSynthesis.getVoices() || [];
    var it = voci.filter(function (v) { return /^it/i.test(v.lang); });
    // le voci più adatte a una vocina, se ci sono (Mac e iPhone); altrimenti la prima italiana
    var preferite = ["Flo", "Sandy", "Shelley", "Alice"];
    for (var i = 0; i < preferite.length; i++) {
      var v = it.filter(function (x) { return x.name.indexOf(preferite[i]) === 0; })[0];
      if (v) return v;
    }
    return it[0] || null;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = function () { vocina = scegliVoce(); };
  // Voce sintetica disattivata: per ora risultava fastidiosa. Per riattivarla basta mettere VOCE_ATTIVA = true.
  var VOCE_ATTIVA = false;
  function dici(parola) {
    if (muto || !VOCE_ATTIVA) return;
    var testo = PRONUNCIA[parola] || parola;
    if (!("speechSynthesis" in window) || !window.SpeechSynthesisUtterance) { voce(parola); return; }
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(testo);
      vocina = vocina || scegliVoce();
      if (vocina) u.voice = vocina;
      u.lang = "it-IT"; u.pitch = 2; u.rate = 1.15; u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch (e) { voce(parola); }
  }

  function impostaMuto(v) {
    muto = v;
    try { localStorage.setItem(CHIAVE_MUTO, v ? "1" : "0"); } catch (e) {}
    if (ctx) master.gain.setTargetAtTime(v ? 0 : 0.9, ctx.currentTime, 0.1);
  }

  return {
    musica: musica, sfx: sfx, voce: voce, dici: dici,
    muto: function () { return muto; },
    impostaMuto: impostaMuto
  };
})();
