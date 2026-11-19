'use strict';
/* 程序化音频引擎（零素材）：混响 + 压缩 + 分层刀声 + 五声音阶拨弦 BGM + 雨声底噪 */
(function (global) {
  var AC = global.AudioContext || global.webkitAudioContext;
  var ac = null, master = null, comp = null, reverb = null, wet = null, ready = false;
  var rainNode = null, musicTimer = null, noteCache = {};

  function makeImpulse(seconds, decay) {
    var rate = ac.sampleRate, len = Math.floor(rate * seconds);
    var buf = ac.createBuffer(2, len, rate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  function noiseBuffer(seconds, brown) {
    var rate = ac.sampleRate, len = Math.floor(rate * seconds);
    var buf = ac.createBuffer(1, len, rate), d = buf.getChannelData(0);
    var last = 0;
    for (var i = 0; i < len; i++) {
      var w = Math.random() * 2 - 1;
      if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else d[i] = w;
    }
    return buf;
  }

  function pluckBuffer(freq, seconds) {
    var key = Math.round(freq) + ':' + seconds;
    if (noteCache[key]) return noteCache[key];
    var rate = ac.sampleRate, len = Math.floor(rate * seconds);
    var n = Math.max(2, Math.floor(rate / freq));
    var buf = ac.createBuffer(1, len, rate), d = buf.getChannelData(0);
    var line = new Float32Array(n);
    for (var i = 0; i < n; i++) line[i] = Math.random() * 2 - 1;
    var idx = 0, prev = 0;
    for (var s = 0; s < len; s++) {
      var cur = line[idx];
      var out = (cur + prev) * 0.5 * 0.996;
      prev = cur;
      line[idx] = out;
      idx = (idx + 1) % n;
      d[s] = out;
    }
    noteCache[key] = buf;
    return buf;
  }

  function ensure() {
    if (!AC) return false;
    if (!ac) {
      try { ac = new AC(); } catch (e) { return false; }
      comp = ac.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 24; comp.ratio.value = 4;
      comp.attack.value = 0.003; comp.release.value = 0.25;
      master = ac.createGain(); master.gain.value = 0.8;
      reverb = ac.createConvolver(); reverb.buffer = makeImpulse(1.6, 2.6);
      wet = ac.createGain(); wet.gain.value = 0.32;
      master.connect(comp); master.connect(reverb); reverb.connect(wet); wet.connect(comp);
      comp.connect(ac.destination);
      ready = true;
    }
    if (ac.state === 'suspended') { try { ac.resume(); } catch (e) {} }
    return true;
  }

  function env(node, t, a, d, peak) {
    var g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    node.connect(g);
    return g;
  }

  function burst(freqLow, freqHigh, dur, peak, q) {
    var t = ac.currentTime;
    var src = ac.createBufferSource(); src.buffer = noiseBuffer(dur + 0.05, false);
    var bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q || 1.6;
    bp.frequency.setValueAtTime(freqHigh, t);
    bp.frequency.exponentialRampToValueAtTime(freqLow, t + dur);
    src.connect(bp);
    env(bp, t, 0.002, dur, peak).connect(master);
    src.start(t); src.stop(t + dur + 0.06);
  }

  function tone(freq, freqEnd, dur, peak, type) {
    var t = ac.currentTime;
    var o = ac.createOscillator(); o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    env(o, t, 0.004, dur, peak).connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  var PENTA = [0, 2, 4, 7, 9]; // 宫商角徵羽（D 调）
  function noteFreq(step) {
    var oct = Math.floor(step / 5), deg = PENTA[((step % 5) + 5) % 5];
    return 146.83 * Math.pow(2, (deg + oct * 12) / 12); // D3 起
  }

  function startMusic() {
    if (musicTimer) return;
    var step = 0;
    musicTimer = setInterval(function () {
      if (!ready || ac.state !== 'running') return;
      var t = ac.currentTime + 0.05;
      // 拨弦
      if (Math.random() < 0.62) {
        var n = step + (Math.random() < 0.3 ? 5 : 0);
        var f = noteFreq(n);
        var src = ac.createBufferSource(); src.buffer = pluckBuffer(f, 2.4);
        var g = ac.createGain(); g.gain.value = 0.10 + Math.random() * 0.05;
        var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
        src.connect(lp); lp.connect(g); g.connect(master);
        src.start(t);
      }
      // 低音持续
      if (step % 8 === 0) {
        var o = ac.createOscillator(); o.type = 'sine';
        o.frequency.value = noteFreq(0) / 2;
        var g2 = ac.createGain();
        g2.gain.setValueAtTime(0.0001, t);
        g2.gain.exponentialRampToValueAtTime(0.05, t + 0.4);
        g2.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
        o.connect(g2); g2.connect(master); o.start(t); o.stop(t + 3.3);
      }
      step++;
    }, 620);
  }

  function startRain() {
    if (rainNode) return;
    var t = ac.currentTime;
    var src = ac.createBufferSource(); src.buffer = noiseBuffer(3, true); src.loop = true;
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
    var g = ac.createGain(); g.gain.value = 0.055;
    var lfo = ac.createOscillator(); lfo.frequency.value = 0.09;
    var lg = ac.createGain(); lg.gain.value = 0.02;
    lfo.connect(lg); lg.connect(g.gain);
    src.connect(lp); lp.connect(g); g.connect(master);
    src.start(t); lfo.start(t);
    rainNode = src;
  }

  var api = {
    unlock: function () {
      if (!ensure()) return;
      startRain(); startMusic();
    },
    slash: function (combo) {
      if (!ensure()) return;
      combo = combo || 1;
      burst(700 + combo * 120, 4200 + combo * 700, 0.16 + combo * 0.02, 0.5, 1.8);
      burst(300, 1600, 0.30, 0.18, 0.9);
      tone(2400 + combo * 240, 900, 0.10, 0.10, 'triangle');
      tone(120, 60, 0.12, combo >= 3 ? 0.34 : 0.2, 'sine');
    },
    hit: function () {
      if (!ensure()) return;
      burst(220, 2400, 0.13, 0.55, 1.2);
      tone(150, 52, 0.28, 0.55, 'sine');
      tone(320, 120, 0.16, 0.22, 'triangle');
    },
    parry: function () {
      if (!ensure()) return;
      var t = ac.currentTime;
      [520, 780, 1170, 1560].forEach(function (f, i) {
        var o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        var g = ac.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.16 / (i + 1), t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + 1.45);
      });
      burst(2000, 5200, 0.09, 0.30, 2.4);
    },
    die: function () {
      if (!ensure()) return;
      tone(220, 40, 0.55, 0.42, 'sawtooth');
      burst(120, 900, 0.4, 0.3, 0.8);
    },
    squelch: function () {
      if (!ensure()) return;
      burst(500, 2600, 0.09, 0.26, 2.0);
    }
  };
  global.ChenDaoAudio = api;
})(typeof window !== 'undefined' ? window : globalThis);
