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

  // ---------- Musica generativa ----------
  // Ogni tema: tempo, accordi (note MIDI), bassi, scala per la melodia, densità delle note.
  var TEMI = {
    radura: {
      bpm: 74, densita: 0.45, melodia: 0.22, ottava: 72,
      accordi: [[53, 57, 60, 64], [55, 59, 62, 64], [52, 55, 59, 62], [57, 60, 64, 67], [50, 53, 57, 60], [55, 59, 62, 65], [48, 52, 55, 59], [48, 52, 55, 59]],
      bassi: [41, 43, 40, 45, 38, 43, 36, 36],
      scala: [0, 2, 4, 7, 9]
    },
    raccolta: {
      bpm: 116, densita: 0.75, melodia: 0.35, ottava: 72,
      accordi: [[48, 52, 55, 60], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]],
      bassi: [36, 43, 45, 41],
      scala: [0, 2, 4, 7, 9]
    },
    bosco: {
      bpm: 108, densita: 0.7, melodia: 0.4, ottava: 72,
      accordi: [[53, 57, 60, 65], [55, 59, 62, 67], [52, 55, 59, 64], [57, 60, 64, 69], [50, 53, 57, 62], [55, 59, 62, 67], [53, 57, 60, 64], [55, 59, 62, 65]],
      bassi: [41, 43, 40, 45, 38, 43, 41, 43],
      scala: [0, 2, 4, 7, 9]
    },
    memory: {
      bpm: 92, densita: 0.55, melodia: 0.25, ottava: 74,
      accordi: [[50, 53, 57, 62], [55, 59, 62, 67], [48, 52, 55, 60], [57, 60, 64, 69]],
      bassi: [38, 43, 36, 45],
      scala: [0, 2, 4, 7, 9]
    },
    lucciole: {
      bpm: 58, densita: 0.3, melodia: 0.3, ottava: 79,
      accordi: [[50, 53, 57, 64], [46, 50, 53, 57], [53, 57, 60, 64], [48, 52, 55, 62]],
      bassi: [38, 34, 41, 36],
      scala: [0, 2, 5, 7, 9]
    }
  };
  var temaVoluto = null, temaAttivo = null, passo = 0, prossimoTempo = 0, timer = null;

  function avviaTema(nome) {
    temaAttivo = TEMI[nome];
    passo = 0;
    prossimoTempo = ctx.currentTime + 0.15;
    musicaGain.gain.cancelScheduledValues(ctx.currentTime);
    musicaGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    musicaGain.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 1.5);
    clearInterval(timer);
    timer = setInterval(programma, 25);
  }
  function programma() {
    if (!temaAttivo || !ctx) return;
    var T = temaAttivo, ottavo = 60 / T.bpm / 2;
    while (prossimoTempo < ctx.currentTime + 0.12) {
      var battuta = Math.floor(passo / 8) % T.accordi.length, dentro = passo % 8;
      var accordo = T.accordi[battuta], t = prossimoTempo;
      if (dentro === 0) {
        tappeto(t, accordo, ottavo * 8.4, 0.05);
        basso(t, T.bassi[battuta], ottavo * 6, 0.22);
      }
      if (dentro === 4 && Math.random() < 0.5) basso(t, T.bassi[battuta] + 7, ottavo * 3, 0.12);
      // arpeggio: note dell'accordo un'ottava sopra, più fitte nei temi vivaci
      if (Math.random() < T.densita) {
        pizzico(t, accordo[(dentro + battuta) % accordo.length] + 12, ottavo * 6, 0.07);
      }
      // melodia: note della scala pentatonica, a volte
      if ((dentro === 0 || dentro === 3 || dentro === 6) && Math.random() < T.melodia) {
        var radice = T.bassi[battuta] % 12;
        var m = T.ottava + ((radice + caso(T.scala)) % 12);
        pizzico(t, m, ottavo * 10, 0.09);
      }
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
  function voce(testo) {
    if (!ctx || ctx.state !== "running" || muto) return;
    var sillabe = Math.min(10, Math.max(2, Math.round(String(testo).replace(/[^a-zàèéìòù]/gi, "").length / 3)));
    var base = caso([74, 76, 77]), t = ctx.currentTime + 0.02;
    for (var i = 0; i < sillabe; i++) {
      var m = base + caso([0, 2, 4, 5, 7]) - (i === sillabe - 1 ? 3 : 0);
      var dur = 0.07 + Math.random() * 0.04;
      tono(t, nota(m), nota(m + caso([-1, 1, 2])), dur, 0.07, "triangle");
      t += dur + 0.025;
    }
  }

  function impostaMuto(v) {
    muto = v;
    try { localStorage.setItem(CHIAVE_MUTO, v ? "1" : "0"); } catch (e) {}
    if (ctx) master.gain.setTargetAtTime(v ? 0 : 0.9, ctx.currentTime, 0.1);
  }

  return {
    musica: musica, sfx: sfx, voce: voce,
    muto: function () { return muto; },
    impostaMuto: impostaMuto
  };
})();
