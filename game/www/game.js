'use strict';
/* 原创原型：刀客「陈霜」—— 第一关（3 房间）+ 刀光特效系统
   素材全部程序化绘制/合成，未使用任何原作资源 */
(function (global) {
  var W = 480, H = 270, DT = 1 / 60;
  var GROUND = 232;
  function rect(x, y, w, h) { return { x: x, y: y, w: w, h: h }; }
  function hit(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  var LEVEL = [
    { // 1 教学：移动/跳/砍
      name: '一 · 雨夜巷口', hint: 'A/D 移动　空格 跳　J 挥刀',
      lines: ['雨下了一夜。', '巷口的灯还亮着，像在等人。', '刀在鞘里，等一个理由。'],
      blocks: [rect(0, GROUND, 480, 40), rect(0, 0, 12, 270), rect(468, 0, 12, 270),
               rect(300, 190, 70, 12)],
      spikes: [],
      enemies: [{ type: 'guard', x: 350, y: GROUND - 16, range: 80 }],
      exit: rect(452, GROUND - 40, 16, 40), start: { x: 40, y: GROUND - 16 }
    },
    { // 2 教学：冲刺越断口
      name: '二 · 断桥', hint: 'Shift 冲刺越过断口，掉下去就是死',
      lines: ['桥断了。', '对面有人背对着我，没有回头。'],
      blocks: [rect(0, GROUND, 208, 40), rect(252, GROUND, 228, 40),
               rect(0, 0, 12, 270), rect(468, 0, 12, 270),
               rect(70, 196, 56, 12), rect(300, 176, 60, 12)],
      spikes: [rect(208, 252, 44, 18)],
      enemies: [{ type: 'guard', x: 360, y: GROUND - 16, range: 50 }],
      exit: rect(452, GROUND - 40, 16, 40), start: { x: 40, y: GROUND - 16 }
    },
    { // 3 压迫：双兵夹击
      name: '三 · 茶棚', hint: '一刀一个，别被两面夹住',
      lines: ['茶棚里还温着一壶酒。', '可惜今晚没人想好好喝。'],
      blocks: [rect(0, GROUND, 480, 40), rect(0, 0, 12, 270), rect(468, 0, 12, 270),
               rect(120, 188, 76, 12), rect(296, 164, 76, 12)],
      spikes: [],
      enemies: [{ type: 'guard', x: 150, y: GROUND - 16, range: 60 },
                { type: 'guard', x: 360, y: GROUND - 16, range: 60 }],
      exit: rect(452, GROUND - 40, 16, 40), start: { x: 36, y: GROUND - 16 }
    },
    { // 4 组合：枪手必须化劲
      name: '四 · 石阶', hint: 'K 在命中前 6 帧接住子弹 = 化劲反打',
      lines: ['石阶上站着个抬枪的人。', '他的呼吸很稳——稳得让我想试一次。'],
      blocks: [rect(0, GROUND, 480, 40), rect(0, 0, 12, 270), rect(468, 0, 12, 270),
               rect(120, 208, 60, 24), rect(180, 184, 60, 24), rect(310, 168, 64, 12)],
      spikes: [],
      enemies: [{ type: 'shooter', x: 440, y: GROUND - 18, range: 0 },
                { type: 'guard', x: 250, y: GROUND - 16, range: 70 }],
      exit: rect(452, GROUND - 40, 16, 40), start: { x: 30, y: GROUND - 16 }
    },
    { // 5 节奏：柱间枪火
      name: '五 · 灯笼阵', hint: '用柱子卡视线，化劲比硬冲快',
      lines: ['一排灯笼，把影子拉得很长。', '灯柱挡得住子弹，挡不住人。'],
      blocks: [rect(0, GROUND, 480, 40), rect(0, 0, 12, 270), rect(468, 0, 12, 270)],
      covers: [rect(118, 150, 16, 82), rect(238, 150, 16, 82), rect(358, 150, 16, 82)],
      spikes: [],
      enemies: [{ type: 'shooter', x: 440, y: GROUND - 18, range: 0 },
                { type: 'shooter', x: 300, y: GROUND - 18, range: 0 },
                { type: 'guard', x: 170, y: GROUND - 16, range: 40 }],
      exit: rect(452, GROUND - 40, 16, 40), start: { x: 28, y: GROUND - 16 }
    },
    { // 6 精英：3 血 + 突进前摇
      name: '六 · 守夜人', hint: '精英要三刀；它闪光后 0.4 秒会突进',
      lines: ['守夜人：「你不该回来。」', '我：「门没锁。」'], speaker: '守夜人',
      blocks: [rect(0, GROUND, 480, 40), rect(0, 0, 12, 270), rect(468, 0, 12, 270),
               rect(190, 182, 90, 12), rect(60, 150, 54, 10)],
      spikes: [],
      enemies: [{ type: 'elite', x: 400, y: GROUND - 20, range: 0 },
                { type: 'guard', x: 150, y: GROUND - 16, range: 45 }],
      exit: rect(452, GROUND - 40, 16, 40), start: { x: 28, y: GROUND - 16 }
    },
    { // 7 收尾
      name: '七 · 月洞门', hint: '最后一间：一刀定生死',
      lines: ['月洞门就在前面。', '刀上还有血。雨会替我洗掉。'],
      blocks: [rect(0, GROUND, 480, 40), rect(0, 0, 12, 270), rect(468, 0, 12, 270),
               rect(104, 196, 70, 12), rect(210, 168, 70, 12), rect(330, 196, 70, 12)],
      spikes: [],
      enemies: [{ type: 'elite', x: 400, y: GROUND - 20, range: 0 },
                { type: 'shooter', x: 300, y: GROUND - 18, range: 0 },
                { type: 'guard', x: 190, y: GROUND - 16, range: 50 }],
      exit: rect(452, GROUND - 40, 16, 40), start: { x: 24, y: GROUND - 16 }
    }
  ];

  // ---------- 原创像素画系统（全部自绘，未使用任何原作素材） ----------
  var PAL = { '.': null, k: '#080a10', w: '#dfe8f5', W: '#ffffff', d: '#9fb0c8',
              r: '#ff3d68', R: '#8e1f38', c: '#7ee0ff', C: '#2d7f9e',
              g: '#39445c', G: '#5d7196', y: '#ffd166', b: '#1b2230', e: '#ff4d6d' };
  function drawSprite(ctx, rows, x, y, flip, tint) {
    var h = rows.length;
    for (var ry = 0; ry < h; ry++) {
      var line = rows[ry];
      for (var rx = 0; rx < line.length; rx++) {
        var ch = line.charAt(rx);
        var col = PAL[ch];
        if (!col) continue;
        ctx.fillStyle = tint || col;
        var px = flip ? (x + line.length - 1 - rx) : (x + rx);
        ctx.fillRect(px, y + ry, 1, 1);
      }
    }
  }
  var SPR = {
    player: [[
      '...kkkk...',
      '..kwwwwk..',
      '..kwWWwk..',
      '..kweek...',
      '..kwwwwk..',
      '..rrrrrr..',
      '.rwwwwwwr.',
      '.kwwwwwwk.',
      '..kwwwwk..',
      '..k.ww.k..',
      '..k.ww.k..',
      '....ww....',
      '...kkkk...',
      '...k..k...',
      '..kk..kk..',
      '..........'
    ], [
      '...kkkk...',
      '..kwwwwk..',
      '..kwWWwk..',
      '..kweek...',
      '..kwwwwk..',
      '..rrrrrr..',
      '.rwwwwwwr.',
      '.kwwwwwwk.',
      '..kwwwwk..',
      '..k.ww.k..',
      '..k.ww....',
      '....ww....',
      '...kkkk...',
      '..k....k..',
      '.kk....kk.',
      '..........'
    ]],
    guard: [[
      '..gggggg..',
      '.gGGGGGGg.',
      '.gGGGGGGg.',
      '.ggeGGegg.',
      '.gGGGGGGg.',
      '.gGGGGGGg.',
      '..gggggg..',
      '..gGGGGg..',
      '..gGGGGg..',
      '..gGGGGg..',
      '..g.gg.g..',
      '..g.gg.g..',
      '....gg....',
      '...kkkk...',
      '...k..k...',
      '..kk..kk..'
    ]],
    shooter: [[
      '...bbbb...',
      '..bCCCCb..',
      '.bCCCCCCb.',
      '.bCyCCyCb.',
      '.bCCCCCCb.',
      '..bCCCCb..',
      '..bCCCCb..',
      '..bCCCCb..',
      '..b.bb.b..',
      '..b.bb.b..',
      '....bb....',
      '...kkkk...',
      '...k..k...',
      '..kk..kk..',
      '..........',
      '..........'
    ]]
  };

  // ---------- 合成音效（WebAudio，无任何素材） ----------
  function makeSfx() {
    if (global.ChenDaoAudio) return global.ChenDaoAudio;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return { unlock: function(){}, slash: function(){}, hit: function(){}, parry: function(){}, die: function(){}, squelch: function(){} };
    var ac = null, master = null;
    function ensure() {
      if (!ac) { ac = new AC(); master = ac.createGain(); master.gain.value = 0.25; master.connect(ac.destination); }
      if (ac.state === 'suspended') { try { ac.resume(); } catch (e) {} }
      return ac;
    }
    function noiseBuffer(ac, dur) {
      var n = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      return b;
    }
    return {
      unlock: function () { ensure(); },
      slash: function (combo) {
        var a = ensure(); if (!a) return;
        var t = a.currentTime, src = a.createBufferSource(); src.buffer = noiseBuffer(a, 0.14);
        var bp = a.createBiquadFilter(); bp.type = 'bandpass';
        bp.frequency.setValueAtTime(3200 + combo * 500, t);
        bp.frequency.exponentialRampToValueAtTime(520, t + 0.12);
        bp.Q.value = 2.2;
        var g = a.createGain(); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        src.connect(bp); bp.connect(g); g.connect(master); src.start(t); src.stop(t + 0.15);
      },
      hit: function () {
        var a = ensure(); if (!a) return; var t = a.currentTime;
        var o = a.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(180, t);
        o.frequency.exponentialRampToValueAtTime(60, t + 0.12);
        var g = a.createGain(); g.gain.setValueAtTime(0.55, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.17);
      },
      parry: function () {
        var a = ensure(); if (!a) return; var t = a.currentTime;
        [880, 1320, 1760].forEach(function (f, i) {
          var o = a.createOscillator(); o.type = 'sine'; o.frequency.value = f;
          var g = a.createGain(); g.gain.setValueAtTime(0.22 / (i + 1), t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.5);
        });
      },
      die: function () {
        var a = ensure(); if (!a) return; var t = a.currentTime;
        var o = a.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(300, t);
        o.frequency.exponentialRampToValueAtTime(48, t + 0.45);
        var g = a.createGain(); g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.5);
      },
      squelch: function () {
        var a = ensure(); if (!a) return; var t = a.currentTime;
        var src = a.createBufferSource(); src.buffer = noiseBuffer(a, 0.08);
        var lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
        var g = a.createGain(); g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        src.connect(lp); lp.connect(g); g.connect(master); src.start(t);
      }
    };
  }

  var SKY = (function () {
    var arr = [], x = 0;
    while (x < 520) {
      var w = 18 + Math.floor(Math.random() * 26), h = 40 + Math.floor(Math.random() * 80);
      arr.push({ x: x, w: w, h: h, neon: Math.random() < 0.5 });
      x += w + 6 + Math.floor(Math.random() * 12);
    }
    return arr;
  })();

  // ---------- 古中国武侠场景（原创，程序化绘制） ----------
  function hash1(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  function drawMountains(ctx, off, baseY, color, seed) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(-40, H);
    for (var x = -40; x <= W + 40; x += 14) {
      var t = (x + off) * 0.012 + seed * 3.1;
      var yv = baseY - 18 - (Math.sin(t) * 11 + Math.sin(t * 2.3 + 1.2) * 7 + Math.sin(t * 4.1 + 2.4) * 4);
      ctx.lineTo(x, yv);
    }
    ctx.lineTo(W + 40, H); ctx.closePath(); ctx.fill();
  }

  function drawPagoda(ctx, x, baseY, sc, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = '#0a1018';
    for (var tier = 0; tier < 4; tier++) {
      var w = (26 - tier * 4) * sc, y = baseY - tier * 15 * sc;
      ctx.beginPath();
      ctx.moveTo(x - w * 0.62, y);
      ctx.quadraticCurveTo(x - w * 0.3, y - 4 * sc, x, y - 7 * sc);
      ctx.quadraticCurveTo(x + w * 0.3, y - 4 * sc, x + w * 0.62, y);
      ctx.quadraticCurveTo(x + w * 0.2, y + 3 * sc, x - w * 0.62, y);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(x - w * 0.42, y, w * 0.84, 15 * sc);
    }
    ctx.fillRect(x - 1.2 * sc, baseY - 4 * 15 * sc - 14 * sc, 2.4 * sc, 14 * sc);
    ctx.restore();
  }

  function drawRoof(ctx, x, y, w, h, col, alpha) {
    ctx.save(); ctx.globalAlpha = alpha;
    // 墙体
    ctx.fillStyle = '#0b1119';
    ctx.fillRect(x + 3, y, w - 6, 40);
    // 窗格（暖光）
    ctx.fillStyle = 'rgba(255,190,110,0.13)';
    for (var wx = x + 11; wx < x + w - 14; wx += 17) ctx.fillRect(wx, y + 9, 8, 10);
    // 屋檐（上翘的翼角）
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x - 9, y + 2);
    ctx.quadraticCurveTo(x + w * 0.10, y - h * 0.55, x + w * 0.5, y - h);
    ctx.quadraticCurveTo(x + w * 0.90, y - h * 0.55, x + w + 9, y + 2);
    ctx.lineTo(x + w + 2, y + 5);
    ctx.quadraticCurveTo(x + w * 0.5, y - h * 0.42, x - 2, y + 5);
    ctx.closePath(); ctx.fill();
    // 正脊
    ctx.strokeStyle = 'rgba(120,150,175,0.35)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x + w * 0.5, y - h - 1); ctx.lineTo(x + w * 0.5, y - h - 7); ctx.stroke();
    // 瓦线
    ctx.strokeStyle = 'rgba(90,120,145,0.18)'; ctx.lineWidth = 1;
    for (var wx2 = x + 6; wx2 < x + w - 4; wx2 += 7) {
      ctx.beginPath(); ctx.moveTo(wx2, y + 3); ctx.lineTo(wx2 + (x + w / 2 - wx2) * 0.06, y - h * 0.72); ctx.stroke();
    }
    ctx.restore();
  }

  function drawRoofs(ctx, off, baseY, sc, alpha) {
    var step = 92 * sc;
    var start = -((off % step) + step);
    for (var k = 0; k < 8; k++) {
      var x = start + k * step;
      if (x > W + 90) break;
      var h = (16 + hash1(k) * 12) * sc;
      drawRoof(ctx, x, baseY - hash1(k + 7) * 8, 64 * sc, h, '#0c131c', alpha);
    }
  }

  function drawBamboo(ctx, off, baseY, t) {
    for (var i = 0; i < 6; i++) {
      var lane = i < 3 ? -1 : 1;
      var bx = lane < 0 ? (18 + i * 26) : (W - 18 - (i - 3) * 26);
      bx -= (off * (lane < 0 ? 0.5 : 0.7)) % 40;
      var hgt = 120 + hash1(i) * 70;
      var sway = Math.sin(t * 1.1 + i) * 2.0;
      ctx.strokeStyle = 'rgba(78,128,100,' + (0.14 + hash1(i + 3) * 0.14) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx, baseY);
      ctx.quadraticCurveTo(bx + sway, baseY - hgt * 0.55, bx + sway * 2.4, baseY - hgt);
      ctx.stroke();
      ctx.lineWidth = 1;
      for (var seg = 1; seg < 7; seg++) {
        var sy = baseY - hgt * (seg / 7);
        ctx.beginPath(); ctx.moveTo(bx + sway * seg / 7 - 2.5, sy); ctx.lineTo(bx + sway * seg / 7 + 2.5, sy); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(96,156,118,0.22)';
      for (var lf = 0; lf < 3; lf++) {
        var ly = baseY - hgt * (0.72 + lf * 0.09);
        var lx = bx + sway * 1.8;
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 11, ly - 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx - 9, ly - 2); ctx.stroke();
      }
    }
  }
  function drawLantern(ctx, x, y, t, i) {
    var sway = Math.sin(t * 1.6 + i * 1.3) * 2.6;
    // 挂绳
    ctx.strokeStyle = 'rgba(120,90,60,0.55)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x + sway, y - 4); ctx.stroke();
    // 光晕
    var gl = ctx.createRadialGradient(x + sway, y, 1, x + sway, y, 26);
    gl.addColorStop(0, 'rgba(255,170,90,0.30)');
    gl.addColorStop(1, 'rgba(255,150,70,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x + sway, y, 26, 0, 6.283); ctx.fill();
    // 灯身
    ctx.fillStyle = 'rgba(214,72,54,0.92)';
    ctx.beginPath(); ctx.ellipse(x + sway, y, 6, 7.5, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = 'rgba(255,210,140,0.55)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(x + sway, y, 6, 7.5, 0, 0, 6.283); ctx.stroke();
    // 流苏
    ctx.strokeStyle = 'rgba(255,196,120,0.6)';
    ctx.beginPath(); ctx.moveTo(x + sway, y + 7.5); ctx.lineTo(x + sway, y + 12); ctx.stroke();
  }

  function drawBanner(ctx, x, y, ch, t, seed) {
    var sway = Math.sin(t * 1.5 + seed * 2.1) * 2.4;
    ctx.strokeStyle = 'rgba(90,70,50,0.55)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 4); ctx.stroke();
    ctx.fillStyle = 'rgba(150,38,40,0.85)';
    ctx.beginPath();
    ctx.moveTo(x, y + 4);
    ctx.lineTo(x + 13 + sway, y + 7);
    ctx.lineTo(x + 12 + sway, y + 34);
    ctx.lineTo(x, y + 31);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(240,225,200,0.75)';
    ctx.font = '9px monospace';
    ctx.fillText(ch, x + 3 + sway * 0.5, y + 21);
  }

  // ---------- 大号角色绘制（20×32，手绘矢量像素） ----------
  function drawPlayerBig(ctx, p, t) {
    var cx = p.x + p.w / 2, foot = p.y + p.h;
    var left = cx - 10, top = foot - 32;
    var ph = Math.floor(t * 14) % 2;
    // 描边（先画一圈深色，让角色在暗底上分离）
    ctx.fillStyle = 'rgba(2,4,8,0.85)';
    ctx.fillRect(left + 3, top + 11, 14, 15);
    ctx.fillRect(left + 6, top + 1, 9, 10);
    // 影子
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.ellipse(cx, foot + 1, 9, 3, 0, 0, 6.283); ctx.fill();
    // 腿
    ctx.fillStyle = '#101823';
    var l1 = ph ? 1 : 3, l2 = ph ? 3 : 1;
    ctx.fillRect(left + 6, top + 24, 4, 8 - l1);
    ctx.fillRect(left + 11, top + 24, 4, 8 - l2);
    // 鞋
    ctx.fillRect(left + 5, top + 31 - l1, 5, 2);
    ctx.fillRect(left + 11, top + 31 - l2, 5, 2);
    // 长袍
    ctx.fillStyle = '#1c2839';
    ctx.fillRect(left + 4, top + 12, 12, 14);
    ctx.fillStyle = '#2b3d55';
    ctx.fillRect(left + 4, top + 12, 2, 14);
    ctx.fillStyle = 'rgba(180,215,245,0.10)';
    ctx.fillRect(left + 14, top + 12, 2, 14);
    // 腰带
    ctx.fillStyle = '#a8293f';
    ctx.fillRect(left + 4, top + 18, 12, 3);
    // 围巾（拖尾，随风与速度摆动）
    var sway = Math.sin(t * 9) * 1.6 - p.vx * 0.03;
    ctx.fillStyle = '#ff3d68';
    ctx.fillRect(left + 5, top + 11, 10, 3);
    ctx.fillRect(left + 2 + (p.face > 0 ? -3 : 11) + sway * 0.3, top + 12, 6, 2);
    ctx.fillStyle = 'rgba(255,61,104,0.55)';
    ctx.fillRect(left + 1 + (p.face > 0 ? -6 : 13) + sway, top + 13, 5, 2);
    // 头
    ctx.fillStyle = '#e6d6c4';
    ctx.fillRect(left + 7, top + 4, 6, 7);
    ctx.fillStyle = '#f4e7d8';
    ctx.fillRect(left + 8, top + 5, 3, 5);
    // 发 + 发髻
    ctx.fillStyle = '#0c131c';
    ctx.fillRect(left + 6, top + 2, 8, 4);
    ctx.fillRect(left + 9, top - 1, 3, 3);
    ctx.fillRect(left + (p.face > 0 ? 6 : 12), top + 4, 2, 4);
    // 眼
    ctx.fillStyle = '#0b0f16';
    ctx.fillRect(left + (p.face > 0 ? 11 : 8), top + 7, 1, 1);
    // 刀（攻击时挥出，平时收在身侧）
    if (p.atkT > 0) {
      ctx.strokeStyle = 'rgba(232,248,255,0.95)'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + p.face * 3, top + 16);
      ctx.lineTo(cx + p.face * 24, top + 9);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(126,224,255,0.55)'; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx + p.face * 3, top + 16);
      ctx.lineTo(cx + p.face * 18, top + 11);
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(150,180,205,0.55)'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - p.face * 5, top + 20);
      ctx.lineTo(cx - p.face * 13, top + 13);
      ctx.stroke();
    }
  }

  function drawGuardBig(ctx, e, t, dead) {
    var cx = e.x + e.w / 2, foot = e.y + e.h, left = cx - 11, top = foot - 32;
    var col = dead ? '#ffffff' : '#2b3648';
    var rim = dead ? '#ffffff' : '#46597a';
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.ellipse(cx, foot + 1, 9, 3, 0, 0, 6.283); ctx.fill();
    // 腿/靴
    ctx.fillStyle = dead ? '#ffffff' : '#1a2231';
    ctx.fillRect(left + 7, top + 25, 4, 7);
    ctx.fillRect(left + 12, top + 25, 4, 7);
    // 甲胄
    ctx.fillStyle = col;
    ctx.fillRect(left + 4, top + 11, 14, 15);
    ctx.fillStyle = rim;
    ctx.fillRect(left + 4, top + 11, 14, 2);
    ctx.fillRect(left + 16, top + 13, 2, 13);
    // 肩甲
    ctx.fillRect(left + 1, top + 12, 4, 5);
    ctx.fillRect(left + 17, top + 12, 4, 5);
    // 头盔
    ctx.fillStyle = dead ? '#ffffff' : '#39465c';
    ctx.fillRect(left + 6, top + 3, 10, 8);
    ctx.fillStyle = dead ? '#ffffff' : '#586f96';
    ctx.fillRect(left + 6, top + 3, 10, 2);
    // 面具眼缝（红光）
    ctx.fillStyle = dead ? '#ffffff' : '#ff3d52';
    ctx.fillRect(left + (e.dir > 0 ? 12 : 7), top + 7, 3, 2);
    // 长枪
    ctx.strokeStyle = dead ? '#ffffff' : 'rgba(150,175,200,0.7)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left + 4, top + 26);
    ctx.lineTo(left + (e.dir > 0 ? 24 : -2), top + 2);
    ctx.stroke();
  }

  function drawShooterBig(ctx, e, t, dead) {
    var cx = e.x + e.w / 2, foot = e.y + e.h, left = cx - 10, top = foot - 30;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.ellipse(cx, foot + 1, 8, 3, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = dead ? '#ffffff' : '#1a2231';
    ctx.fillRect(left + 7, top + 23, 4, 7);
    ctx.fillRect(left + 12, top + 23, 4, 7);
    // 长袍
    ctx.fillStyle = dead ? '#ffffff' : '#332b47';
    ctx.fillRect(left + 4, top + 10, 13, 14);
    ctx.fillStyle = dead ? '#ffffff' : '#4a3f63';
    ctx.fillRect(left + 4, top + 10, 13, 2);
    // 斗笠
    ctx.fillStyle = dead ? '#ffffff' : '#1e2634';
    ctx.beginPath();
    ctx.moveTo(left + 1, top + 9);
    ctx.lineTo(left + 10, top + 2);
    ctx.lineTo(left + 20, top + 9);
    ctx.closePath(); ctx.fill();
    // 眼（橙光）
    ctx.fillStyle = dead ? '#ffffff' : '#ffb057';
    ctx.fillRect(left + (e.dir > 0 ? 12 : 7), top + 11, 3, 2);
    // 火铳
    ctx.fillStyle = dead ? '#ffffff' : '#6b7789';
    var dirx = e.dir > 0 ? 1 : -1;
    ctx.fillRect(cx + (dirx > 0 ? 1 : -11), top + 14, 10, 3);
  }

  // ---------- 前景遮挡层（制造纵深） ----------
  function drawForeground(ctx, g, f) {
    var px = g.player ? g.player.x : 0;
    var t = g.time;
    // 顶部檐影
    ctx.fillStyle = 'rgba(3,5,8,0.92)';
    ctx.beginPath();
    ctx.moveTo(-10, -10); ctx.lineTo(W + 10, -10);
    ctx.lineTo(W + 10, 14);
    for (var x = W + 10; x >= -10; x -= 40) {
      ctx.quadraticCurveTo(x - 20, 34 + Math.sin((x + px * 0.5) * 0.05) * 3, x - 40, 14);
    }
    ctx.closePath(); ctx.fill();
    // 近景竹（快速视差，深色剪影）
    for (var i = 0; i < 2; i++) {
      var bx = (i === 0 ? 16 : W - 24) - ((px * 0.45) % 60);
      var sway = Math.sin(t * 1.3 + i * 2) * 3.5;
      ctx.strokeStyle = 'rgba(3,6,9,0.92)'; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(bx, H + 10);
      ctx.quadraticCurveTo(bx + sway, H - 100, bx + sway * 2.6, H - 235);
      ctx.stroke();
      // 竹节
      ctx.lineWidth = 2;
      for (var seg = 0; seg < 7; seg++) {
        var sy = H - 20 - seg * 30;
        var sxx = bx + sway * (seg / 7) * 2;
        ctx.beginPath(); ctx.moveTo(sxx - 5, sy); ctx.lineTo(sxx + 5, sy); ctx.stroke();
      }
      // 竹叶（成簇）
      ctx.lineWidth = 3;
      for (var lc = 0; lc < 4; lc++) {
        var ly = H - 120 - lc * 30;
        var lx0 = bx + sway * (1 + lc * 0.2);
        var dirSign = lc % 2 === 0 ? 1 : -1;
        for (var lf = 0; lf < 3; lf++) {
          ctx.beginPath();
          ctx.moveTo(lx0, ly);
          ctx.quadraticCurveTo(lx0 + dirSign * (14 + lf * 4), ly - 8 - lf * 3, lx0 + dirSign * (26 + lf * 6), ly - 2 + lf * 2);
          ctx.stroke();
        }
      }
    }
    // 前景薄雾（分离层次）
    var fg2 = ctx.createLinearGradient(0, H - 46, 0, H);
    fg2.addColorStop(0, 'rgba(150,180,205,0)');
    fg2.addColorStop(1, 'rgba(150,180,205,0.10)');
    ctx.fillStyle = fg2; ctx.fillRect(0, H - 46, W, 46);
  }

  // ---------- 地面纹理 / 灯笼光池 / 雨花 ----------
  function drawGroundFx(ctx, g, f, R) {
    var t = g.time;
    // 灯笼在地上的暖光池
    for (var li = 0; li < 4; li++) {
      var lx = 44 + li * 132 - (((g.player ? g.player.x : 0) * 0.12) % 132);
      var pg = ctx.createRadialGradient(lx, GROUND + 2, 1, lx, GROUND + 2, 46);
      pg.addColorStop(0, 'rgba(255,170,90,0.10)');
      pg.addColorStop(1, 'rgba(255,150,70,0)');
      ctx.fillStyle = pg;
      ctx.save();
      ctx.beginPath(); ctx.ellipse(lx, GROUND + 4, 46, 12, 0, 0, 6.283); ctx.fill();
      ctx.restore();
    }
    // 石板缝
    ctx.fillStyle = 'rgba(6,10,14,0.55)';
    var off = ((g.player ? g.player.x : 0) % 34);
    for (var sx = -off; sx < W; sx += 34) ctx.fillRect(sx, GROUND + 6, 1, 34);
    ctx.fillRect(0, GROUND + 22, W, 1);
    // 雨花
    for (var rs = 0; rs < 6; rs++) {
      var rx = (hash1(Math.floor(t * 12) + rs * 7) * W) | 0;
      var ry = GROUND - 1 - (hash1(rs * 3 + Math.floor(t * 12)) * 3);
      ctx.strokeStyle = 'rgba(180,215,240,0.22)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(rx - 2, ry); ctx.lineTo(rx + 2, ry); ctx.stroke();
    }
  }

  function drawEliteBig(ctx, e, t, dead) {
    var cx = e.x + e.w / 2, foot = e.y + e.h, left = cx - 12, top = foot - 34;
    var glow = (!dead && e.tele > 0) ? (0.35 + 0.45 * Math.sin(t * 40)) : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.ellipse(cx, foot + 1, 11, 3.5, 0, 0, 6.283); ctx.fill();
    if (glow > 0) {
      var gl = ctx.createRadialGradient(cx, top + 16, 2, cx, top + 16, 34);
      gl.addColorStop(0, 'rgba(255,70,90,' + glow * 0.5 + ')');
      gl.addColorStop(1, 'rgba(255,70,90,0)');
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(cx, top + 16, 34, 0, 6.283); ctx.fill();
    }
    ctx.fillStyle = dead ? '#ffffff' : '#151c28';
    ctx.fillRect(left + 6, top + 26, 5, 8);
    ctx.fillRect(left + 13, top + 26, 5, 8);
    // 甲
    ctx.fillStyle = dead ? '#ffffff' : '#2e3c52';
    ctx.fillRect(left + 3, top + 11, 18, 17);
    ctx.fillStyle = dead ? '#ffffff' : '#4c6386';
    ctx.fillRect(left + 3, top + 11, 18, 3);
    ctx.fillRect(left + 18, top + 14, 3, 14);
    // 肩甲（带尖）
    ctx.fillStyle = dead ? '#ffffff' : '#41536f';
    ctx.beginPath(); ctx.moveTo(left - 2, top + 15); ctx.lineTo(left + 5, top + 9); ctx.lineTo(left + 5, top + 17); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(left + 26, top + 15); ctx.lineTo(left + 19, top + 9); ctx.lineTo(left + 19, top + 17); ctx.closePath(); ctx.fill();
    // 头盔 + 红缨
    ctx.fillStyle = dead ? '#ffffff' : '#3a4a63';
    ctx.fillRect(left + 6, top + 2, 12, 9);
    ctx.fillStyle = dead ? '#ffffff' : '#b32a3f';
    ctx.fillRect(left + 10, top - 4, 4, 6);
    // 双眼
    ctx.fillStyle = dead ? '#ffffff' : (glow > 0 ? '#ffdd66' : '#ff3d52');
    ctx.fillRect(left + (e.dir > 0 ? 13 : 7), top + 6, 4, 2);
    // 长刀
    ctx.strokeStyle = dead ? '#ffffff' : 'rgba(190,215,240,0.85)'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(left + (e.dir > 0 ? 20 : 4), top + 22);
    ctx.lineTo(left + (e.dir > 0 ? 34 : -10), top + 6);
    ctx.stroke();
    // 血条
    if (!dead && e.hpMax > 1) {
      var bw = 26, bx = cx - bw / 2, by = top - 10;
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(bx, by, bw, 3);
      ctx.fillStyle = '#ff4d6d'; ctx.fillRect(bx, by, bw * (e.hp / e.hpMax), 3);
    }
  }

  // ---------- 精致背景（5 层视差 + 大气透视 + 光照） ----------
  // ---------- 街面道具（让画面“有人住过”） ----------
  function drawStreetProps(ctx, g, px, t) {
    var items = [
      { k: 'barrel', x: 60 }, { k: 'crate', x: 96 }, { k: 'post', x: 140 },
      { k: 'barrel', x: 236 }, { k: 'well', x: 300 }, { k: 'crate', x: 372 },
      { k: 'barrel', x: 420 }
    ];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var x = it.x - ((px * 0.9) % 480);
      if (x < -40) x += 480;
      if (x > W + 40) x -= 480;
      var gy = GROUND + 2;
      if (it.k === 'barrel') {
        ctx.fillStyle = '#1a212b';
        ctx.fillRect(x - 5, gy - 13, 10, 13);
        ctx.fillStyle = '#232c39';
        ctx.beginPath(); ctx.ellipse(x, gy - 13, 5, 2, 0, 0, 6.283); ctx.fill();
        ctx.strokeStyle = 'rgba(140,175,205,0.12)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - 5, gy - 9); ctx.lineTo(x + 5, gy - 9); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 5, gy - 5); ctx.lineTo(x + 5, gy - 5); ctx.stroke();
      } else if (it.k === 'crate') {
        ctx.fillStyle = '#1c242e'; ctx.fillRect(x - 7, gy - 14, 14, 14);
        ctx.strokeStyle = 'rgba(150,185,215,0.13)'; ctx.lineWidth = 1;
        ctx.strokeRect(x - 7.5, gy - 14.5, 15, 15);
        ctx.beginPath(); ctx.moveTo(x - 7, gy - 14); ctx.lineTo(x + 7, gy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 7, gy - 14); ctx.lineTo(x - 7, gy); ctx.stroke();
      } else if (it.k === 'post') {
        ctx.fillStyle = '#141b24'; ctx.fillRect(x - 2, gy - 30, 4, 30);
        var gl = ctx.createRadialGradient(x, gy - 32, 1, x, gy - 32, 26);
        gl.addColorStop(0, 'rgba(255,170,90,0.28)');
        gl.addColorStop(1, 'rgba(255,150,70,0)');
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, gy - 32, 26, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(214,72,54,0.95)';
        ctx.beginPath(); ctx.ellipse(x, gy - 32, 5, 6, 0, 0, 6.283); ctx.fill();
      } else if (it.k === 'well') {
        ctx.fillStyle = '#10161e';
        ctx.beginPath(); ctx.ellipse(x, gy - 4, 13, 5, 0, 0, 6.283); ctx.fill();
        ctx.fillStyle = '#0a0f15';
        ctx.beginPath(); ctx.ellipse(x, gy - 5, 9, 3.4, 0, 0, 6.283); ctx.fill();
        ctx.strokeStyle = 'rgba(150,185,215,0.14)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(x, gy - 4, 13, 5, 0, 0, 6.283); ctx.stroke();
      }
    }
  }

  function drawBuilding(ctx, x, gy, w, h, shade, warm) {
    // 墙体
    ctx.fillStyle = shade.wall;
    ctx.fillRect(x, gy - h, w, h);
    // 墙面木纹
    ctx.strokeStyle = 'rgba(140,180,210,0.045)';
    ctx.lineWidth = 1;
    for (var i = 3; i < w; i += 6) {
      ctx.beginPath(); ctx.moveTo(x + i, gy - h + 4); ctx.lineTo(x + i, gy); ctx.stroke();
    }
    // 檐下阴影
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x, gy - h, w, 5);
    // 窗（暖光 + 光晕）
    var wy = gy - h + 12;
    for (var wx = x + 8; wx < x + w - 14; wx += 18) {
      var glow = warm * (0.55 + 0.45 * Math.sin(wx * 0.7));
      ctx.fillStyle = 'rgba(255,196,120,' + (0.10 + glow * 0.10) + ')';
      ctx.fillRect(wx - 1, wy - 1, 12, 12);
      ctx.fillStyle = 'rgba(255,206,140,' + (0.20 + glow * 0.25) + ')';
      ctx.fillRect(wx, wy, 10, 9);
      ctx.strokeStyle = 'rgba(20,14,10,0.75)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(wx + 5, wy); ctx.lineTo(wx + 5, wy + 9); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(wx, wy + 4); ctx.lineTo(wx + 10, wy + 4); ctx.stroke();
    }
    // 屋顶：平脊 + 两端上翘的翼角
    var rh = Math.max(9, h * 0.30);
    var eave = 13;
    var topY = gy - h - rh;
    ctx.fillStyle = shade.roof;
    ctx.beginPath();
    ctx.moveTo(x - eave, gy - h + 7);
    ctx.quadraticCurveTo(x - eave + 9, gy - h - rh * 0.62, x + w * 0.30, topY);
    ctx.lineTo(x + w * 0.70, topY);
    ctx.quadraticCurveTo(x + w + eave - 9, gy - h - rh * 0.62, x + w + eave, gy - h + 7);
    ctx.lineTo(x + w * 0.5, gy - h + 13);
    ctx.closePath(); ctx.fill();
    // 檐口厚度
    ctx.strokeStyle = 'rgba(140,180,215,0.13)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - eave + 2, gy - h + 8);
    ctx.quadraticCurveTo(x + w * 0.5, gy - h + 14, x + w + eave - 2, gy - h + 8);
    ctx.stroke();
    // 檐角上挑
    ctx.strokeStyle = shade.ridge; ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x - eave, gy - h + 7); ctx.lineTo(x - eave - 3, gy - h + 1); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w + eave, gy - h + 7); ctx.lineTo(x + w + eave + 3, gy - h + 1); ctx.stroke();
    // 瓦垄
    ctx.strokeStyle = shade.tile; ctx.lineWidth = 1;
    for (var tx = x - 2; tx < x + w + 3; tx += 5) {
      ctx.beginPath();
      ctx.moveTo(tx, gy - h + 3);
      ctx.lineTo(tx + (x + w / 2 - tx) * 0.30, gy - h - rh * 0.72);
      ctx.stroke();
    }
    // 屋脊 + 脊饰
    ctx.strokeStyle = shade.ridge; ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x + 2, gy - h - rh * 0.94);
    ctx.quadraticCurveTo(x + w * 0.5, gy - h - rh * 1.12, x + w - 2, gy - h - rh * 0.94);
    ctx.stroke();
    ctx.fillStyle = shade.ridge;
    ctx.fillRect(x + w * 0.5 - 1, gy - h - rh * 1.20, 2, 6);
    // 月光边缘
    ctx.strokeStyle = 'rgba(150,215,255,0.16)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - eave, gy - h + 2);
    ctx.quadraticCurveTo(x + w * 0.5, gy - h - rh * 1.06, x + w + eave, gy - h + 2);
    ctx.stroke();
  }

  function drawBackdrop2(ctx, g, f, R) {
    var t = g.time, px = g.player ? g.player.x : 0;
    // 1. 天幕
    var sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#02050a');
    sky.addColorStop(0.45, '#081220');
    sky.addColorStop(0.75, '#0e1b28');
    sky.addColorStop(1, '#16232f');
    ctx.fillStyle = sky; ctx.fillRect(-40, -40, W + 80, H + 80);
    // 星
    for (var st = 0; st < 46; st++) {
      var sx = (hash1(st) * W * 1.4 - px * 0.01) % W;
      if (sx < 0) sx += W;
      var sy = hash1(st + 90) * 120;
      var tw = 0.25 + 0.35 * Math.abs(Math.sin(t * (0.6 + hash1(st + 12)) + st));
      ctx.fillStyle = 'rgba(200,225,255,' + tw + ')';
      ctx.fillRect(sx, sy, 1, 1);
    }
    // 2. 月 + 光晕 + 光柱
    var mx = 372, my = 46;
    var halo = ctx.createRadialGradient(mx, my, 2, mx, my, 76);
    halo.addColorStop(0, 'rgba(226,240,255,0.30)');
    halo.addColorStop(0.4, 'rgba(200,225,255,0.10)');
    halo.addColorStop(1, 'rgba(200,225,255,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(mx, my, 76, 0, 6.283); ctx.fill();
    ctx.fillStyle = 'rgba(242,248,255,0.96)'; ctx.beginPath(); ctx.arc(mx, my, 11, 0, 6.283); ctx.fill();
    ctx.fillStyle = 'rgba(210,228,246,0.5)'; ctx.beginPath(); ctx.arc(mx - 3, my + 3, 2, 0, 6.283); ctx.fill();
    // 月光柱
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var shaft = ctx.createLinearGradient(mx, my, mx - 150, H);
    shaft.addColorStop(0, 'rgba(150,200,255,0.055)');
    shaft.addColorStop(1, 'rgba(150,200,255,0)');
    ctx.fillStyle = shaft;
    ctx.beginPath();
    ctx.moveTo(mx - 14, my); ctx.lineTo(mx + 16, my);
    ctx.lineTo(mx - 90, H); ctx.lineTo(mx - 170, H);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    // 3. 远山三层（越远越蓝越淡）
    drawMountains(ctx, px * 0.02, 100, 'rgba(11,18,28,0.95)', 0);
    ctx.fillStyle = 'rgba(30,50,75,0.16)'; ctx.fillRect(0, 60, W, 80);
    drawMountains(ctx, px * 0.045, 122, 'rgba(16,26,38,0.95)', 1);
    ctx.fillStyle = 'rgba(30,50,75,0.12)'; ctx.fillRect(0, 80, W, 80);
    drawMountains(ctx, px * 0.07, 146, 'rgba(22,34,48,0.95)', 2);
    // 4. 远塔
    drawPagoda(ctx, 104 - ((px * 0.03) % 620), 148, 0.92, 0.7);
    // 5. 楼群三排（远/中/近）
    var rows = [
      { sp: 0.06, base: 172, sc: 0.72, shade: { wall: '#080e15', roof: '#060b11', tile: 'rgba(80,120,155,0.08)', ridge: 'rgba(100,140,175,0.14)' }, warm: 0.35, haze: 0.26 },
      { sp: 0.13, base: 232, sc: 0.95, shade: { wall: '#0c141d', roof: '#080e15', tile: 'rgba(100,140,175,0.12)', ridge: 'rgba(125,165,200,0.20)' }, warm: 0.8, haze: 0.0 }
    ];
    for (var ri = 0; ri < rows.length; ri++) {
      var row = rows[ri];
      var stepB = 88 * row.sc;
      var startB = -((px * row.sp) % stepB) - stepB;
      for (var bi = 0; bi < 9; bi++) {
        var bx = startB + bi * stepB;
        if (bx > W + 100) break;
        var bw = (54 + hash1(bi * 7 + ri * 31) * 40) * row.sc;
        var bh = (34 + hash1(bi * 13 + ri * 17) * 40) * row.sc;
        drawBuilding(ctx, bx, row.base, bw, bh, row.shade, row.warm);
      }
      if (row.haze > 0) {
        var hz = ctx.createLinearGradient(0, row.base - 120, 0, row.base + 10);
        hz.addColorStop(0, 'rgba(26,44,66,' + row.haze + ')');
        hz.addColorStop(1, 'rgba(26,44,66,0)');
        ctx.fillStyle = hz; ctx.fillRect(0, row.base - 120, W, 130);
      }
      // 该层雾
      ctx.fillStyle = 'rgba(120,150,175,' + (0.03 + ri * 0.015) + ')';
      ctx.fillRect(0, row.base - 40, W, 44);
    }
    // 6. 竹林
    drawBamboo(ctx, px * 0.13, 198, t);
    // 7. 灯笼
    for (var li = 0; li < 5; li++) {
      var lx = 30 + li * 108 - ((px * 0.12) % 108);
      drawLantern(ctx, lx, 66 + (li % 2) * 18, t, li);
    }
    // 8. 地面湿光（倒影）
    var groundG = ctx.createLinearGradient(0, GROUND - 6, 0, GROUND + 30);
    groundG.addColorStop(0, 'rgba(120,170,215,0.10)');
    groundG.addColorStop(1, 'rgba(120,170,215,0)');
    ctx.fillStyle = groundG; ctx.fillRect(0, GROUND - 6, W, 36);
    for (var pl = 0; pl < 4; pl++) {
      var lx2 = 30 + pl * 108 - ((px * 0.12) % 108);
      var pg2 = ctx.createRadialGradient(lx2, GROUND + 3, 1, lx2, GROUND + 3, 34);
      pg2.addColorStop(0, 'rgba(255,170,90,0.12)');
      pg2.addColorStop(1, 'rgba(255,150,70,0)');
      ctx.fillStyle = pg2;
      ctx.beginPath(); ctx.ellipse(lx2, GROUND + 4, 34, 8, 0, 0, 6.283); ctx.fill();
    }
    // 8.5 街面道具
    drawStreetProps(ctx, g, px, t);
    // 9. 落叶 / 余烬 / 雨
    for (var lf = 0; lf < 18; lf++) {
      var ph = hash1(lf);
      var ly = ((t * (16 + ph * 24) + lf * 37) % (H + 40)) - 20;
      var lx3 = ((lf * 53 + Math.sin(t * 1.2 + lf) * 16 - px * 0.25) % (W + 60) + W + 60) % (W + 60) - 30;
      ctx.fillStyle = 'rgba(150,170,110,' + (0.10 + ph * 0.14) + ')';
      ctx.fillRect(lx3, ly, 2, 1);
    }
    for (var em = 0; em < 14; em++) {
      var ep = hash1(em + 40);
      var ey = H - ((t * (26 + ep * 36) + em * 51) % (H - 40));
      var ex = ((em * 97 + Math.sin(t * 0.85 + em) * 12 - px * 0.18) % W + W) % W;
      ctx.fillStyle = 'rgba(255,170,90,' + (0.09 + ep * 0.14) + ')';
      ctx.fillRect(ex, ey, 1, 1);
    }
    ctx.strokeStyle = 'rgba(160,200,235,0.16)'; ctx.lineWidth = 1;
    for (var rq2 = 0; rq2 < f.rain.length; rq2++) {
      var rqq = f.rain[rq2];
      ctx.beginPath(); ctx.moveTo(rqq.x, rqq.y); ctx.lineTo(rqq.x - 1.5, rqq.y + rqq.len); ctx.stroke();
    }
  }

  function drawBackdrop(ctx, g, f, R) {
    var t = g.time, px = g.player ? g.player.x : 0;
    // 天幕
    var sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#04070d');
    sky.addColorStop(0.5, '#0a141f');
    sky.addColorStop(1, '#15202c');
    ctx.fillStyle = sky; ctx.fillRect(-40, -40, W + 80, H + 80);
    // 月
    var mx = 372, my = 50;
    var halo = ctx.createRadialGradient(mx, my, 3, mx, my, 70);
    halo.addColorStop(0, 'rgba(226,240,255,0.26)');
    halo.addColorStop(1, 'rgba(226,240,255,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(mx, my, 70, 0, 6.283); ctx.fill();
    ctx.fillStyle = 'rgba(240,247,255,0.95)'; ctx.beginPath(); ctx.arc(mx, my, 12, 0, 6.283); ctx.fill();
    // 远山三层
    drawMountains(ctx, px * 0.02, 104, 'rgba(14,22,34,0.95)', 0);
    drawMountains(ctx, px * 0.045, 126, 'rgba(20,31,45,0.95)', 1);
    drawMountains(ctx, px * 0.07, 150, 'rgba(27,41,57,0.95)', 2);
    // 塔
    drawPagoda(ctx, 112 - ((px * 0.03) % 560), 150, 1.0, 0.85);
    // 竹林（远景，屋脊之后不再遮挡）
    drawBamboo(ctx, px * 0.12, 176, t);
    // 屋脊两层
    drawRoofs(ctx, px * 0.10, 152, 0.85, 0.92);
    drawRoofs(ctx, px * 0.20, 182, 1.0, 1.0);
    // 酒旗
    drawBanner(ctx, 176 - ((px * 0.18) % 260), 96, '酒', t, 0);
    drawBanner(ctx, 392 - ((px * 0.18) % 300), 104, '武', t, 1);
    // 雾带
    var mist = ctx.createLinearGradient(0, 140, 0, 236);
    mist.addColorStop(0, 'rgba(150,180,200,0)');
    mist.addColorStop(0.55, 'rgba(150,180,200,0.09)');
    mist.addColorStop(1, 'rgba(150,180,200,0)');
    ctx.fillStyle = mist; ctx.fillRect(0, 140, W, 96);
    // 灯笼
    for (var li = 0; li < 4; li++) {
      var lx = 44 + li * 132 - ((px * 0.12) % 132);
      drawLantern(ctx, lx, 74 + (li % 2) * 16, t, li);
    }
    // 落叶
    for (var lf = 0; lf < 16; lf++) {
      var ph = hash1(lf);
      var ly = ((t * (18 + ph * 26) + lf * 37) % (H + 40)) - 20;
      var lx2 = ((lf * 53 + Math.sin(t * 1.3 + lf) * 18 - px * 0.25) % (W + 60) + W + 60) % (W + 60) - 30;
      ctx.fillStyle = 'rgba(150,170,110,' + (0.12 + ph * 0.16) + ')';
      ctx.fillRect(lx2, ly, 2, 1);
    }
    // 余烬
    for (var em = 0; em < 12; em++) {
      var ep = hash1(em + 40);
      var ey = H - ((t * (30 + ep * 40) + em * 51) % (H - 40));
      var ex = ((em * 97 + Math.sin(t * 0.9 + em) * 12 - px * 0.18) % W + W) % W;
      ctx.fillStyle = 'rgba(255,170,90,' + (0.10 + ep * 0.16) + ')';
      ctx.fillRect(ex, ey, 1, 1);
    }
    // 雨
    ctx.strokeStyle = 'rgba(160,200,235,0.18)'; ctx.lineWidth = 1;
    for (var ri = 0; ri < f.rain.length; ri++) {
      var rq = f.rain[ri];
      ctx.beginPath(); ctx.moveTo(rq.x, rq.y); ctx.lineTo(rq.x - 1.5, rq.y + rq.len); ctx.stroke();
    }
  }

  function createGame(opts) {
    opts = opts || {};
    var g = {
      room: 0, deaths: 0, parries: 0, kills: 0, time: 0, slow: 0,
      msg: '', msgT: 0, won: false,
      input: { left: false, right: false, jump: false, attack: false, parry: false, dash: false, restart: false },
      player: null, enemies: [], bullets: [], particles: [],
      fx: { shake: 0, zoom: 1, zoomT: 1, hitstop: 0, flash: 0, flashCol: '#ffffff',
            arcs: [], trails: [], sparks: [], rings: [], lines: [], rain: [], combo: 0, comboT: 0,
            tint: 0, tintCol: '#ff3d68', letterbox: 0, kickX: 0, kickY: 0, dark: 0 },
      sfx: makeSfx(),
      dlg: { active: false, queue: [], i: 0, shown: 0, t: 0, name: '' },
      seen: {}, best: null
    };

    function resetRoom() {
      var R = LEVEL[g.room];
      g.player = { x: R.start.x, y: R.start.y, w: 9, h: 16, vx: 0, vy: 0, face: 1, onGround: false,
                   dashT: 0, dashCd: 0, atkT: 0, atkCd: 0, parryT: 0, parryCd: 0, dead: 0,
                   coyoteT: 0, jumpBuf: 0, atkBuf: 0 };
      g.enemies = R.enemies.map(function (e) {
        var hp = e.type === 'elite' ? 3 : 1;
        return { type: e.type, x: e.x, y: e.y,
                 w: e.type === 'elite' ? 16 : 12,
                 h: e.type === 'shooter' ? 18 : (e.type === 'elite' ? 26 : 16),
                 vx: 0, dir: -1, range: e.range, homeX: e.x, cd: 1.0 + Math.random() * 0.6,
                 hp: hp, hpMax: hp, tele: 0, lunge: 0, lungeDir: 1, burst: 0, burstT: 0,
                 alive: true, deadT: 0 };
      });
      g.bullets = []; g.particles = [];
      g.slow = 0; g.msg = R.hint; g.msgT = 4;
      if (R.lines && !g.seen[g.room]) { g.seen[g.room] = true; say(R.lines, R.speaker || ''); }
      g.fx.arcs = []; g.fx.trails = []; g.fx.sparks = []; g.fx.rings = []; g.fx.lines = [];
      g.fx.combo = 0; g.fx.comboT = 0; g.fx.hitstop = 0; g.fx.letterbox = 0;
      g.fx.rain = [];
      for (var ri0 = 0; ri0 < 70; ri0++) g.fx.rain.push({ x: rnd(0, W), y: rnd(0, H), v: rnd(170, 280), len: rnd(3, 9) });
    }

    function tryMove(p, dx, dy, blocks) {
      p.x += dx;
      for (var i = 0; i < blocks.length; i++) { var b = blocks[i]; if (hit(p, b)) { if (dx > 0) p.x = b.x - p.w; else if (dx < 0) p.x = b.x + b.w; } }
      p.y += dy; p.onGround = false;
      for (var j = 0; j < blocks.length; j++) { var c = blocks[j]; if (hit(p, c)) { if (dy > 0) { p.y = c.y - p.h; p.onGround = true; } else if (dy < 0) { p.y = c.y + c.h; } } }
    }

    function sparks(x, y, n, col, spread) {
      for (var i = 0; i < n; i++) {
        var a = rnd(-Math.PI, Math.PI), s = rnd(40, spread || 220);
        g.fx.sparks.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40,
                           life: rnd(0.18, 0.5), lifeMax: 0.5, col: col, w: rnd(1, 2.5) });
      }
    }
    function addArc(x, y, r, a0, a1, life, col, thick) {
      g.fx.arcs.push({ x: x, y: y, r: r, a0: a0, a1: a1, life: life, lifeMax: life, col: col || '#dff3ff', thick: thick || 3 });
    }
    function addTrail(x, y, w, h, face) { g.fx.trails.push({ x: x, y: y, w: w, h: h, face: face, life: 0.16, lifeMax: 0.16 }); }
    function addRing(x, y, r, life, col) { g.fx.rings.push({ x: x, y: y, r: r, life: life, lifeMax: life, col: col || '#7ee0ff' }); }
    function addLines(n, col) {
      for (var i = 0; i < n; i++) {
        var a = rnd(-Math.PI, Math.PI), d = rnd(120, 300), sp = rnd(260, 520);
        g.fx.lines.push({ x: W / 2 + Math.cos(a) * d, y: H / 2 + Math.sin(a) * d,
                          vx: -Math.cos(a) * sp, vy: -Math.sin(a) * sp, life: rnd(0.12, 0.28), lifeMax: 0.28, col: col || '#e8f6ff' });
      }
    }
    function zoomPunch(v) { g.fx.zoomT = v; }
    function say(lines, name) {
      if (!lines || !lines.length) return;
      g.dlg.active = true; g.dlg.queue = lines.slice(); g.dlg.i = 0; g.dlg.shown = 0; g.dlg.t = 0;
      g.dlg.name = name || '';
    }
    function advanceDlg() {
      var d = g.dlg, cur = d.queue[d.i] || '';
      if (d.shown < cur.length) { d.shown = cur.length; return; }
      d.i++; d.shown = 0; d.t = 0;
      if (d.i >= d.queue.length) { d.active = false; d.queue = []; d.i = 0; }
    }
    function dieCinematic() {
      g.slow = Math.max(g.slow, 0.75);
      g.fx.letterbox = 0.55;
      g.fx.dark = 0.10;
      zoomPunch(1.05);
      g.fx.tint = 0.16; g.fx.tintCol = '#ff3d68';
      g.sfx.die();
    }


    function doAttack(p) {
      var combo = g.fx.comboT > 0 ? (g.fx.combo % 3) + 1 : 1;
      g.fx.combo = combo; g.fx.comboT = 0.42;
      p.atkT = 0.13; p.atkCd = 0.19;
      var cx = p.x + p.w / 2, cy = p.y + p.h / 2;
      var base = p.face > 0 ? 0 : Math.PI;
      if (combo === 1) {           // 斜下劈
        addArc(cx, cy, 34, base - 1.30, base + 0.60, 0.22, '#eaf8ff', 3);
        addArc(cx, cy, 25, base - 1.20, base + 0.50, 0.17, '#9fe8ff', 2);
      } else if (combo === 2) {    // 反手上撩
        addArc(cx, cy, 35, base + 0.50, base - 1.30, 0.22, '#fff2c8', 3);
        addArc(cx, cy, 26, base + 0.40, base - 1.20, 0.17, '#ffd166', 2);
      } else {                     // 突刺
        addArc(cx, cy, 40, base - 0.20, base + 0.20, 0.20, '#ffe0e6', 3.5);
        addLines(6, '#ffd0d8'); addArc(cx + p.face * 10, cy, 15, base - 0.75, base + 0.75, 0.16, '#ffffff', 2);
        g.fx.shake = Math.max(g.fx.shake, 7); zoomPunch(1.045);
      }
      g.fx.shake = Math.max(g.fx.shake, combo === 3 ? 6 : 4);
      p.vx = p.face * (combo === 3 ? 190 : 120);   // 刀带人走
      g.sfx.slash(combo);
    }

    function damageEnemy(e) {
      e.hp--;
      if (e.hp <= 0) { doKill(e); return; }
      // 未死：小顿帧 + 白闪 + 击退
      e.flash = 0.12;
      e.x += (g.player.face > 0 ? 4 : -4);
      sparks(e.x + e.w / 2, e.y + e.h / 2, 7, '#ffd166', 200);
      g.fx.hitstop = Math.max(g.fx.hitstop, 5);
      g.fx.shake = Math.max(g.fx.shake, 7);
      g.sfx.hit();
    }

    function doKill(e) {
      e.alive = false; e.deadT = 0.32; g.kills++;
      var cx = e.x + e.w / 2, cy = e.y + e.h / 2;
      sparks(cx, cy, 16, e.type === 'shooter' ? '#ffb057' : '#cfe4ff', 260);
      sparks(cx, cy, 8, '#ff3d68', 180);
      addLines(12, '#ffffff');
      g.fx.hitstop = Math.max(g.fx.hitstop, 7);
      g.fx.flash = 0.055; g.fx.flashCol = '#ffffff';
      g.fx.tint = 0.10; g.fx.tintCol = '#ff3d68';
      g.fx.shake = Math.max(g.fx.shake, 13); zoomPunch(1.09); g.fx.letterbox = 0.18;
      g.fx.kickX = (g.player ? -g.player.face : 1) * 3.4; g.fx.kickY = -1.2;
      g.fx.hitstop = Math.max(g.fx.hitstop, 7 + g.fx.combo * 2);
      g.fx.dark = 0.028;
      if (g.slow <= 0) g.slow = 0.07;
      g.sfx.hit();
    }

    g.step = function () {
      if (g.won) return;
      if (g.dlg.active) {
        var dd = g.dlg, cur = dd.queue[dd.i] || '';
        dd.t += DT;
        dd.shown = Math.min(cur.length, dd.shown + DT * 42);
        var i0 = g.input;
        if (i0.jump || i0.attack || i0.parry || i0.dash) {
          i0.jump = i0.attack = i0.parry = i0.dash = false;
          advanceDlg();
        } else if (dd.shown >= cur.length && dd.t > cur.length / 42 + 2.4) {
          advanceDlg();
        }
        decayFX(DT);
        return;
      }
      var R = LEVEL[g.room], p = g.player, inp = g.input;
      var f = g.fx;
      g.time += DT;
      if (g.msgT > 0) g.msgT -= DT;
      if (f.comboT > 0) f.comboT -= DT;
      if (f.tint > 0) f.tint -= DT * 2.6;

      // 顿帧：冻结玩法，但特效继续衰减
      if (f.hitstop > 0) { f.hitstop--; decayFX(DT); return; }

      var dt = DT * (g.slow > 0 ? 0.35 : 1);
      if (g.slow > 0) g.slow -= DT;

      if (inp.restart) { inp.restart = false; g.deaths++; resetRoom(); return; }
      if (p.dead > 0) {
        p.dead -= DT;
        if (p.dead <= 0) resetRoom();
        decayFX(DT);
        return;
      }

      var acc = 900, maxv = 105;
      if (p.dashT > 0) { p.vx = 240 * p.face; p.dashT -= DT; addTrail(p.x, p.y, p.w, p.h, p.face); }
      else {
        if (inp.left) { p.vx -= acc * dt; p.face = -1; }
        if (inp.right) { p.vx += acc * dt; p.face = 1; }
        if (!inp.left && !inp.right) p.vx *= Math.pow(0.001, dt);
        p.vx = Math.max(-maxv, Math.min(maxv, p.vx));
      }
      // 跳跃缓冲 + 土狼时间
      if (inp.jump) { p.jumpBuf = 0.10; inp.jump = false; }
      if (p.jumpBuf > 0) p.jumpBuf -= DT;
      if (p.coyoteT > 0) p.coyoteT -= DT;
      if (p.jumpBuf > 0 && (p.onGround || p.coyoteT > 0)) {
        p.vy = -265; p.onGround = false; p.coyoteT = 0; p.jumpBuf = 0;
      }
      p.vy += 800 * dt; if (p.vy > 420) p.vy = 420;
      if (inp.dash && p.dashCd <= 0) { p.dashT = 0.10; p.dashCd = 0.55; g.fx.shake = Math.max(g.fx.shake, 3); }
      inp.dash = false;
      if (p.dashCd > 0) p.dashCd -= DT;
      // 攻击缓冲
      if (inp.attack) { p.atkBuf = 0.10; inp.attack = false; }
      if (p.atkBuf > 0) p.atkBuf -= DT;
      if (p.atkBuf > 0 && p.atkCd <= 0) { doAttack(p); p.atkBuf = 0; }
      if (p.atkCd > 0) p.atkCd -= DT;
      if (p.atkT > 0) { p.atkT -= DT; addTrail(p.x, p.y, p.w, p.h, p.face); }
      if (inp.parry && p.parryCd <= 0) { p.parryT = 0.16; p.parryCd = 0.30; }
      inp.parry = false;
      if (p.parryCd > 0) p.parryCd -= DT;
      if (p.parryT > 0) p.parryT -= DT;

      var wasAir = !p.onGround;
      tryMove(p, p.vx * dt, p.vy * dt, R.blocks);
      if (p.onGround) { p.coyoteT = 0.08; }
      if (p.onGround && wasAir && p.vy > 150) {
        for (var du = 0; du < 7; du++) {
          g.fx.sparks.push({ x: p.x + p.w / 2 + rnd(-6, 6), y: p.y + p.h - 1,
            vx: rnd(-70, 70), vy: rnd(-40, -8), life: rnd(0.14, 0.3), lifeMax: 0.3, col: 'rgba(160,175,190,1)', w: 1.5 });
        }
      }
      if (p.y > 300) { p.dead = 0.01; g.deaths++; dieCinematic(); }

      if (p.atkT > 0) {
        var hb = { x: p.face > 0 ? p.x + p.w : p.x - 15, y: p.y + 1, w: 15, h: 13 };
        for (var i = 0; i < g.enemies.length; i++) {
          var e = g.enemies[i];
          if (e.alive && hit(hb, { x: e.x, y: e.y, w: e.w, h: e.h })) damageEnemy(e);
        }
        for (var k = 0; k < g.bullets.length; k++) {
          var b = g.bullets[k];
          if (hit(hb, { x: b.x - 2, y: b.y - 2, w: 8, h: 8 })) {
            b.dead = true; sparks(b.x, b.y, 8, '#ffd166', 200); g.sfx.squelch();
          }
        }
      }

      for (var ei = 0; ei < g.enemies.length; ei++) {
        var en = g.enemies[ei];
        if (!en.alive) { if (en.deadT > 0) en.deadT -= DT; continue; }
        if (en.flash > 0) en.flash -= DT;

        if (en.type === 'guard') {
          en.x += en.dir * 26 * dt;
          if (en.x < en.homeX - en.range) { en.x = en.homeX - en.range; en.dir = 1; }
          if (en.x > en.homeX + en.range) { en.x = en.homeX + en.range; en.dir = -1; }
          for (var wi = 0; wi < R.blocks.length; wi++) {
            var wb = R.blocks[wi];
            if (hit({ x: en.x, y: en.y, w: en.w, h: en.h }, wb)) { en.dir *= -1; en.x += en.dir * 2; break; }
          }
          en.y = GROUND - en.h;
          for (var bi = 0; bi < R.blocks.length; bi++) {
            var bb = R.blocks[bi];
            if (bb.y < GROUND && hit({ x: en.x, y: en.y + 2, w: en.w, h: en.h }, bb)) en.y = bb.y - en.h;
          }
        } else if (en.type === 'shooter') {
          en.cd -= dt;
          var dxs = p.x - en.x;
          en.dir = dxs > 0 ? 1 : -1;
          if (en.burst > 0) {
            en.burstT -= dt;
            if (en.burstT <= 0) {
              en.burst--; en.burstT = 0.16;
              g.bullets.push({ x: en.x + (en.dir > 0 ? en.w : 0), y: en.y + 7, vx: 160 * en.dir, vy: 0, dead: false });
              sparks(en.x + en.w / 2, en.y + 7, 2, '#ffb057', 80);
            }
          } else if (en.cd <= 0 && Math.abs(dxs) < 330) {
            en.cd = 2.2; en.burst = 3; en.burstT = 0;
          }
        } else if (en.type === 'elite') {
          var dxe = p.x - en.x;
          if (en.tele > 0) {
            en.tele -= dt;
            if (en.tele <= 0) { en.lunge = 0.20; en.lungeDir = dxe > 0 ? 1 : -1; g.fx.shake = Math.max(g.fx.shake, 4); }
          } else if (en.lunge > 0) {
            en.lunge -= dt;
            en.x += en.lungeDir * 300 * dt;
            en.dir = en.lungeDir;
            addTrail(en.x, en.y, en.w, en.h, en.dir);
          } else {
            en.cd -= dt;
            if (Math.abs(dxe) < 150 && en.cd <= 0) { en.tele = 0.42; en.cd = 2.4; }
            else if (Math.abs(dxe) > 40) { en.x += (dxe > 0 ? 1 : -1) * 42 * dt; en.dir = dxe > 0 ? 1 : -1; }
          }
          en.y = GROUND - en.h;
          for (var bj = 0; bj < R.blocks.length; bj++) {
            var eb = R.blocks[bj];
            if (eb.y < GROUND && hit({ x: en.x, y: en.y + 2, w: en.w, h: en.h }, eb)) en.y = eb.y - en.h;
          }
        }

        // 接触即死
        if (hit(p, { x: en.x, y: en.y, w: en.w, h: en.h })) {
          p.dead = 0.35; g.deaths++; g.fx.hitstop = 6; g.fx.shake = 10;
          g.fx.flash = 0.08; g.fx.flashCol = '#ff3d68';
          sparks(p.x, p.y, 14, '#ff5c7a', 240); dieCinematic();
        }
      }

      // 地刺
      for (var sp = 0; sp < R.spikes.length; sp++) {
        if (hit(p, R.spikes[sp])) {
          p.dead = 0.3; g.deaths++; g.fx.hitstop = 5; g.fx.shake = 8;
          sparks(p.x, p.y, 12, '#ff5c7a', 220); dieCinematic();
        }
      }

      for (var m = 0; m < g.bullets.length; m++) {
        var bu = g.bullets[m];
        if (bu.dead) continue;
        bu.x += bu.vx * dt;
        var box = { x: bu.x - 2, y: bu.y - 2, w: 8, h: 8 };
        if (p.parryT > 0 && hit({ x: p.x - 6, y: p.y - 4, w: p.w + 12, h: p.h + 8 }, box)) {
          bu.dead = true; g.parries++; g.slow = 0.45;
          g.msg = '化劲！'; g.msgT = 0.9;
          addRing(bu.x, bu.y, 3, 0.42, '#7ee0ff'); addRing(bu.x, bu.y, 1, 0.3, '#ffffff');
          sparks(bu.x, bu.y, 14, '#7ee0ff', 240); addLines(5, '#7ee0ff');
          g.fx.hitstop = 5; g.fx.shake = 7; g.fx.flash = 0.05; g.fx.flashCol = '#7ee0ff';
          g.sfx.parry();
          var best = null, bd = 1e9;
          for (var q = 0; q < g.enemies.length; q++) {
            var ee = g.enemies[q];
            if (!ee.alive) continue;
            var d2 = Math.abs(ee.x - bu.x);
            if (d2 < bd) { bd = d2; best = ee; }
          }
          if (best) g.bullets.push({ x: bu.x, y: bu.y, vx: (best.x > bu.x ? 420 : -420), vy: 0, dead: false, friendly: true });
          continue;
        }
        if (hit(p, box)) {
          p.dead = 0.35; g.deaths++; g.fx.hitstop = 6; g.fx.shake = 10;
          g.fx.flash = 0.08; g.fx.flashCol = '#ff3d68'; bu.dead = true;
          sparks(p.x, p.y, 12, '#ff5c7a', 240); dieCinematic();
        }
        for (var fi = 0; fi < g.enemies.length; fi++) {
          var fe = g.enemies[fi];
          if (fe.alive && hit(box, { x: fe.x, y: fe.y, w: fe.w, h: fe.h })) { doKill(fe); bu.dead = true; }
        }
        var covs = R.covers || [];
        for (var bj2 = 0; bj2 < covs.length; bj2++) {
          var blk = covs[bj2];
          if (hit(box, blk)) { bu.dead = true; sparks(bu.x, bu.y, 4, '#ffd166', 120); break; }
        }
        for (var bj3 = 0; bj3 < R.blocks.length; bj3++) {
          var blk3 = R.blocks[bj3];
          if (hit(box, blk3)) { bu.dead = true; sparks(bu.x, bu.y, 4, '#ffd166', 120); break; }
        }
        if (bu.x < -20 || bu.x > W + 20) bu.dead = true;
      }
      g.bullets = g.bullets.filter(function (b) { return !b.dead; });
      updateParticles(DT); decayFX(DT);

      if (hit(p, R.exit)) {
        g.room++;
        if (g.room >= LEVEL.length) {
          g.won = true; g.msg = '第一关通过'; addLines(14, '#9ff2c0'); g.fx.flash = 0.1;
          var rec = { time: Math.round(g.time * 10) / 10, deaths: g.deaths, kills: g.kills, parries: g.parries };
          g.best = rec;
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              var prev = JSON.parse(window.localStorage.getItem('chendao_best') || 'null');
              if (!prev || rec.time < prev.time) window.localStorage.setItem('chendao_best', JSON.stringify(rec));
              else g.best = prev;
            }
          } catch (e2) {}
        }
        else resetRoom();
      }
    };

    function updateParticles(dt) {
      for (var i = 0; i < g.particles.length; i++) { var q = g.particles[i]; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 260 * dt; q.life -= dt; }
      g.particles = g.particles.filter(function (q) { return q.life > 0; });
    }

    function decayFX(dt) {
      var f = g.fx;
      f.kickX *= 0.80; f.kickY *= 0.80;
      if (f.dark > 0) f.dark -= dt;
      for (var ri = 0; ri < f.rain.length; ri++) {
        var rp = f.rain[ri];
        rp.y += rp.v * dt * (g.slow > 0 ? 0.4 : 1);
        if (rp.y > H) { rp.y = -10; rp.x = rnd(0, W); }
      }
      if (f.letterbox > 0) f.letterbox -= dt;
      f.shake *= 0.90; if (f.shake < 0.05) f.shake = 0;
      f.zoom += (f.zoomT - f.zoom) * 0.25;
      f.zoomT += (1 - f.zoomT) * 0.12;
      if (f.flash > 0) f.flash -= dt * 1.6;
      for (var i = 0; i < f.arcs.length; i++) f.arcs[i].life -= dt;
      for (var t = 0; t < f.trails.length; t++) f.trails[t].life -= dt;
      for (var s = 0; s < f.sparks.length; s++) { var sp = f.sparks[s]; sp.x += sp.vx * dt; sp.y += sp.vy * dt; sp.vy += 420 * dt; sp.life -= dt; }
      for (var r = 0; r < f.rings.length; r++) { var rg = f.rings[r]; rg.r += 140 * dt; rg.life -= dt; }
      for (var l = 0; l < f.lines.length; l++) { var ln = f.lines[l]; ln.x += ln.vx * dt; ln.y += ln.vy * dt; ln.life -= dt; }
      f.arcs = f.arcs.filter(function (a) { return a.life > 0; });
      f.trails = f.trails.filter(function (a) { return a.life > 0; });
      f.sparks = f.sparks.filter(function (a) { return a.life > 0; });
      f.rings = f.rings.filter(function (a) { return a.life > 0; });
      f.lines = f.lines.filter(function (a) { return a.life > 0; });
    }

    g.draw = function (ctx) {
      var R = LEVEL[Math.min(g.room, LEVEL.length - 1)];
      var f = g.fx;
      ctx.save();
      // 相机震动 + 缩放冲击
      var sx = (Math.random() - 0.5) * f.shake * 2, sy = (Math.random() - 0.5) * f.shake * 2;
      ctx.translate(W / 2 + sx + f.kickX, H / 2 + sy + f.kickY); ctx.scale(f.zoom, f.zoom); ctx.translate(-W / 2, -H / 2);

      drawBackdrop2(ctx, g, f, R);

      for (var i = 0; i < R.blocks.length; i++) {
        var b = R.blocks[i];
        ctx.fillStyle = '#1a2330'; ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = '#2b3a4c'; ctx.fillRect(b.x, b.y, b.w, 2);
        ctx.fillStyle = 'rgba(95,208,168,0.10)'; ctx.fillRect(b.x, b.y + 2, b.w, 1);
        ctx.fillStyle = 'rgba(4,8,12,0.45)';
        for (var sx = 18; sx < b.w - 4; sx += 26) ctx.fillRect(b.x + sx, b.y + 3, 1, b.h - 3);
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(b.x, b.y + b.h - 2, b.w, 2);
      }
      // 灯柱（只挡子弹）
      var covDraw = R.covers || [];
      for (var ci = 0; ci < covDraw.length; ci++) {
        var cv = covDraw[ci];
        ctx.fillStyle = '#10161f'; ctx.fillRect(cv.x, cv.y, cv.w, cv.h);
        ctx.fillStyle = '#2b3a4c'; ctx.fillRect(cv.x, cv.y, 2, cv.h);
        var lgl = ctx.createRadialGradient(cv.x + cv.w / 2, cv.y + 6, 1, cv.x + cv.w / 2, cv.y + 6, 24);
        lgl.addColorStop(0, 'rgba(255,170,90,0.32)');
        lgl.addColorStop(1, 'rgba(255,150,70,0)');
        ctx.fillStyle = lgl; ctx.beginPath(); ctx.arc(cv.x + cv.w / 2, cv.y + 6, 24, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(214,72,54,0.95)';
        ctx.beginPath(); ctx.ellipse(cv.x + cv.w / 2, cv.y + 6, 5, 6.5, 0, 0, 6.283); ctx.fill();
      }
      // 地刺
      for (var spi = 0; spi < R.spikes.length; spi++) {
        var sk = R.spikes[spi];
        ctx.fillStyle = '#0a0f16'; ctx.fillRect(sk.x, sk.y + sk.h - 4, sk.w, 4);
        for (var kk = 0; kk < sk.w; kk += 9) {
          ctx.fillStyle = '#8ea6bf';
          ctx.beginPath();
          ctx.moveTo(sk.x + kk, sk.y + sk.h - 2);
          ctx.lineTo(sk.x + kk + 4.5, sk.y);
          ctx.lineTo(sk.x + kk + 9, sk.y + sk.h - 2);
          ctx.closePath(); ctx.fill();
        }
      }
      // 出口：月洞门 + 灯火
      var eg = ctx.createRadialGradient(R.exit.x + R.exit.w / 2, R.exit.y + R.exit.h / 2, 2,
                                        R.exit.x + R.exit.w / 2, R.exit.y + R.exit.h / 2, 40);
      eg.addColorStop(0, 'rgba(255,200,120,0.55)');
      eg.addColorStop(1, 'rgba(255,180,90,0)');
      ctx.fillStyle = eg; ctx.fillRect(R.exit.x - 22, R.exit.y - 22, R.exit.w + 44, R.exit.h + 44);
      ctx.fillStyle = 'rgba(14,10,8,0.92)'; ctx.fillRect(R.exit.x - 3, R.exit.y - 5, R.exit.w + 6, R.exit.h + 5);
      ctx.fillStyle = 'rgba(255,196,120,' + (0.55 + 0.25 * Math.sin(g.time * 5)) + ')';
      ctx.fillRect(R.exit.x, R.exit.y, R.exit.w, R.exit.h);
      ctx.fillStyle = 'rgba(214,72,54,0.9)'; ctx.fillRect(R.exit.x + R.exit.w / 2 - 1.5, R.exit.y - 9, 3, 4);

      // 残影
      for (var t = 0; t < f.trails.length; t++) {
        var tr = f.trails[t], a = tr.life / tr.lifeMax;
        ctx.globalAlpha = a * 0.35;
        ctx.fillStyle = '#7ee0ff';
        ctx.fillRect(tr.x, tr.y + 3, tr.w, tr.h - 3);
      }
      ctx.globalAlpha = 1;

      // 敌人
      for (var ei = 0; ei < g.enemies.length; ei++) {
        var e = g.enemies[ei];
        if (!e.alive && e.deadT <= 0) continue;
        var alpha = e.alive ? 1 : Math.max(0, e.deadT / 0.32);
        ctx.globalAlpha = alpha;
        if (e.type === 'guard') drawGuardBig(ctx, e, g.time, !e.alive);
        else if (e.type === 'elite') drawEliteBig(ctx, e, g.time, !e.alive);
        else drawShooterBig(ctx, e, g.time, !e.alive);
        ctx.globalAlpha = 1;
      }
      // 子弹
      for (var bi = 0; bi < g.bullets.length; bi++) {
        var bu = g.bullets[bi];
        ctx.fillStyle = bu.friendly ? '#7ee0ff' : '#ffd166';
        ctx.fillRect(bu.x - 2, bu.y - 2, 4, 4);
        if (bu.friendly) { ctx.fillStyle = 'rgba(126,224,255,0.35)'; ctx.fillRect(bu.x - 6, bu.y - 1, 12, 2); }
      }

      // 玩家
      var p = g.player;
      if (!p.dead) {
        drawPlayerBig(ctx, p, g.time);
        if (p.parryT > 0) {
          ctx.strokeStyle = 'rgba(126,224,255,0.9)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(p.x + p.w / 2, p.y + p.h / 2, 18, 0, 6.283); ctx.stroke();
        }
      }
      // ===== 刀光（加色混合） =====
      ctx.globalCompositeOperation = 'lighter';
      for (var ai = 0; ai < f.arcs.length; ai++) {
        var arc = f.arcs[ai], la = Math.max(0, arc.life / arc.lifeMax);
        var ccw = arc.a1 < arc.a0;
        // （不使用扇形填充，避免糊住角色）
        // 外缘高光
        ctx.globalAlpha = la * 0.95;
        ctx.strokeStyle = arc.col; ctx.lineWidth = arc.thick * (0.5 + la * 0.8);
        ctx.beginPath(); ctx.arc(arc.x, arc.y, arc.r * (1.02 - 0.06 * la), arc.a0, arc.a1, ccw); ctx.stroke();
        // 内层拖影
        ctx.globalAlpha = la * 0.45;
        ctx.lineWidth = arc.thick * 2.6;
        ctx.beginPath(); ctx.arc(arc.x, arc.y, arc.r * 0.66, arc.a0, arc.a1, ccw); ctx.stroke();
        // 刀锋核心亮线（细白线，贴着弧走）
        ctx.globalAlpha = la * 0.85;
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(arc.x, arc.y, arc.r * 0.88, arc.a0 * 0.96, arc.a1 * 0.96, ccw); ctx.stroke();
        // 贯穿扫掠亮线（“唰”的主体）
        ctx.globalAlpha = la * 0.75;
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(arc.x + Math.cos(arc.a0) * arc.r * 0.45, arc.y + Math.sin(arc.a0) * arc.r * 0.45);
        ctx.lineTo(arc.x + Math.cos(arc.a1) * arc.r, arc.y + Math.sin(arc.a1) * arc.r);
        ctx.stroke();
        // 刀尖亮点
        ctx.globalAlpha = la * 0.9;
        ctx.fillStyle = '#ffffff';
        var tipA = ccw ? arc.a0 : arc.a1;
        ctx.fillRect(arc.x + Math.cos(tipA) * arc.r - 1.5, arc.y + Math.sin(tipA) * arc.r - 1.5, 3, 3);
      }
      for (var si = 0; si < f.sparks.length; si++) {
        var sk = f.sparks[si], sl = Math.max(0, sk.life / sk.lifeMax);
        ctx.globalAlpha = sl; ctx.fillStyle = sk.col;
        ctx.fillRect(sk.x, sk.y, sk.w * sl + 0.5, sk.w * sl + 0.5);
      }
      for (var ri = 0; ri < f.rings.length; ri++) {
        var rg = f.rings[ri], rl = Math.max(0, rg.life / rg.lifeMax);
        ctx.globalAlpha = rl * 0.9; ctx.strokeStyle = rg.col; ctx.lineWidth = 2 * rl + 0.5;
        ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r, 0, 6.283); ctx.stroke();
      }
      for (var li = 0; li < f.lines.length; li++) {
        var ln = f.lines[li], ll = Math.max(0, ln.life / ln.lifeMax);
        ctx.globalAlpha = ll * 0.8; ctx.strokeStyle = ln.col; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(ln.x, ln.y); ctx.lineTo(ln.x - ln.vx * 0.05, ln.y - ln.vy * 0.05); ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.restore();

      // 全屏色调 + 闪白
      if (f.tint > 0) {
        var vg = ctx.createRadialGradient(W / 2, H / 2, 110, W / 2, H / 2, 240);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, f.tintCol);
        ctx.globalAlpha = Math.min(0.20, f.tint * 1.3);
        ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
      if (f.dark > 0) { ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(0, 0, W, H); }
      if (f.flash > 0) { ctx.fillStyle = f.flashCol; ctx.globalAlpha = Math.min(0.5, f.flash * 5); ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      if (g.slow > 0) { ctx.fillStyle = 'rgba(126,224,255,0.07)'; ctx.fillRect(0, 0, W, H); }

      drawGroundFx(ctx, g, f, R);
      drawForeground(ctx, g, f);

      // CRT 扫描线
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      for (var sl = 0; sl < H; sl += 2) ctx.fillRect(0, sl, W, 1);
      // 击杀电影黑边
      if (f.letterbox > 0) {
        var lb = Math.min(18, f.letterbox * 150);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, lb);
        ctx.fillRect(0, H - lb, W, lb);
      }
      // 对白面板
      if (g.dlg.active) {
        var dl = g.dlg, curLine = dl.queue[dl.i] || '';
        var shownTxt = curLine.slice(0, Math.floor(dl.shown));
        ctx.fillStyle = 'rgba(4,6,10,0.86)'; ctx.fillRect(10, H - 66, W - 20, 52);
        ctx.strokeStyle = 'rgba(180,200,220,0.22)'; ctx.lineWidth = 1;
        ctx.strokeRect(10.5, H - 65.5, W - 21, 51);
        if (dl.name) { ctx.fillStyle = '#ffd166'; ctx.font = '9px monospace'; ctx.fillText(dl.name, 20, H - 53); }
        ctx.fillStyle = '#e8eef7'; ctx.font = '10px monospace';
        var wrapped = [];
        for (var wi2 = 0; wi2 < shownTxt.length; wi2 += 40) wrapped.push(shownTxt.slice(wi2, wi2 + 40));
        for (var wl = 0; wl < wrapped.length && wl < 3; wl++) ctx.fillText(wrapped[wl], 20, H - 41 + wl * 12);
        ctx.fillStyle = 'rgba(150,170,190,0.65)'; ctx.font = '8px monospace';
        ctx.fillText('空格/J 继续', W - 92, H - 20);
      }
      // HUD
      var CN = ['一','二','三','四','五','六','七','八','九','十'];
      var rn = CN[Math.min(g.room, 9)] || (g.room + 1);
      // 左上角面板
      ctx.fillStyle = 'rgba(6,9,14,0.55)';
      ctx.fillRect(8, 10, 152, 46);
      ctx.fillStyle = 'rgba(255,209,102,0.85)';
      ctx.fillRect(8, 10, 2, 46);
      ctx.fillStyle = 'rgba(232,238,247,0.92)'; ctx.font = '10px monospace';
      ctx.fillText('陈霜', 16, 24);
      ctx.fillStyle = 'rgba(150,170,190,0.75)'; ctx.font = '9px monospace';
      ctx.fillText('第一关 · 雨夜', 40, 24);
      ctx.fillStyle = '#ffd166'; ctx.font = '9px monospace';
      ctx.fillText(rn + ' / ' + CN[LEVEL.length - 1], 16, 39);
      ctx.fillStyle = 'rgba(200,215,235,0.72)';
      ctx.fillText(R.name, 40, 39);
      if (g.msgT > 0 && g.msg) {
        ctx.fillStyle = 'rgba(160,180,200,' + Math.min(0.85, g.msgT * 0.5) + ')';
        ctx.font = '9px monospace';
        ctx.fillText(g.msg, 16, 51);
      }
      // 底部状态条
      if (!g.dlg.active) {
        ctx.fillStyle = 'rgba(6,9,14,0.45)';
        ctx.fillRect(8, H - 26, W - 16, 18);
        ctx.fillStyle = 'rgba(232,238,247,0.85)'; ctx.font = '9px monospace';
        ctx.fillText('死亡 ' + g.deaths, 16, H - 13);
        ctx.fillStyle = 'rgba(255,209,102,0.75)';
        ctx.fillText('击杀 ' + g.kills, 84, H - 13);
        ctx.fillStyle = 'rgba(126,224,255,0.85)';
        ctx.fillText('化劲 ' + g.parries, 152, H - 13);
        ctx.fillStyle = 'rgba(255,61,104,0.85)';
        ctx.fillText('连斩 ' + g.fx.combo, 220, H - 13);
        ctx.fillStyle = 'rgba(150,170,190,0.55)';
        ctx.fillText('R 重来', W - 60, H - 13);
      }
      if (g.won) {
        ctx.fillStyle = 'rgba(0,0,0,0.80)'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ffd166'; ctx.font = '16px monospace'; ctx.fillText('第一关 · 完', W / 2 - 52, 92);
        ctx.fillStyle = 'rgba(232,238,247,0.9)'; ctx.font = '10px monospace'; ctx.fillText('雨停了。', W / 2 - 22, 112);
        ctx.fillStyle = 'rgba(200,215,235,0.85)';
        ctx.fillText('用时   ' + (Math.round(g.time * 10) / 10) + ' 秒', W / 2 - 96, 146);
        ctx.fillText('击杀   ' + g.kills, W / 2 - 96, 162);
        ctx.fillText('化劲   ' + g.parries, W / 2 - 96, 178);
        ctx.fillText('死亡   ' + g.deaths, W / 2 - 96, 194);
        if (g.best) ctx.fillText('最佳   ' + g.best.time + ' 秒', W / 2 + 4, 146);
        ctx.fillStyle = 'rgba(150,170,190,0.8)'; ctx.font = '9px monospace';
        ctx.fillText('按 R 再战一次', W / 2 - 34, 226);
      }
    };

    g.showcase = function () {
      var p = g.player;
      p.x = 210; p.y = GROUND - 16; p.face = 1; p.atkT = 0.1;
      if (g.enemies[0]) { g.enemies[0].alive = false; g.enemies[0].deadT = 0.3; g.enemies[0].x = 236; g.enemies[0].y = GROUND - 16; }
      addArc(214, 226, 34, -1.30, 0.60, 0.22, '#eaf8ff', 3);
      addArc(214, 226, 25, -1.20, 0.50, 0.17, '#9fe8ff', 2);
      addArc(218, 224, 40, -0.20, 0.20, 0.20, '#ffe0e6', 3.5);
      sparks(236, 224, 20, '#cfe4ff', 260);
      sparks(236, 224, 10, '#ff3d68', 200);
      addLines(10, '#ffffff');
      g.fx.shake = 7; g.fx.zoom = 1.06; g.fx.zoomT = 1.06;
      g.fx.flash = 0.012; g.fx.flashCol = '#ffffff'; g.fx.tint = 0.10; g.fx.tintCol = '#ff3d68';
      g.fx.combo = 3;
      for (var i = 0; i < 4; i++) addTrail(p.x - 6 * i, p.y, p.w, p.h, p.face);
    };

    g.info = function () {
      return { room: g.room, deaths: g.deaths, kills: g.kills, parries: g.parries, won: g.won,
               combo: g.fx.combo, arcs: g.fx.arcs.length, sparks: g.fx.sparks.length,
               hitstop: g.fx.hitstop, shake: Math.round(g.fx.shake),
               player: g.player ? { x: Math.round(g.player.x), y: Math.round(g.player.y), dead: !!g.player.dead } : null,
               enemies: g.enemies.filter(function (e) { return e.alive; }).length, bullets: g.bullets.length };
    };

    resetRoom();
    return g;
  }

  global.KatanaProto = { createGame: createGame, W: W, H: H, DT: DT, LEVEL: LEVEL };
})(typeof window !== 'undefined' ? window : globalThis);