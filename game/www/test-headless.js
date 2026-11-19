'use strict';
const fs = require('fs'), path = require('path');
(0, eval)(fs.readFileSync(path.join(__dirname, 'game.js'), 'utf8'));
const P = globalThis.KatanaProto;
const g = P.createGame();
const ctx = new Proxy({}, {
  get(t, k) {
    if (k === 'canvas') return { width: 480, height: 270 };
    if (k === 'measureText') return () => ({ width: 8 });
    if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
    return () => {};
  },
  set() { return true; }
});

let prevX = 0;
function room() { return P.LEVEL[Math.min(g.room, P.LEVEL.length - 1)]; }
function supported(x, y) {
  const R = room();
  for (const b of R.blocks) if (x >= b.x && x <= b.x + b.w && y >= b.y - 2 && y <= b.y + b.h + 2) return true;
  return false;
}
function hazardAhead(x, y) {
  const R = room();
  for (const s of R.spikes) if (x > s.x - 6 && x < s.x + s.w + 6 && y > s.y - 6) return true;
  return false;
}
function bot() {
  if (g.dlg.active) { g.input.attack = true; return; }
  const p = g.player;
  if (!p || p.dead) return;
  const R = room();
  g.input.right = true;
  const footY = p.y + p.h + 3;
  const near = supported(p.x + p.w + 6, footY);
  if (p.onGround && !near) { g.input.jump = true; g.input.dash = true; }
  // 撞墙/台阶：水平没动就跳
  if (p.onGround && p.x - prevX < 0.25) { g.input.jump = true; g.input.dash = false; }
  // 空中下落且脚下无支撑 → 冲刺续命
  if (!p.onGround && p.vy > 40 && !supported(p.x + p.w / 2, p.y + p.h + 26)) g.input.dash = true;
  if (p.onGround && hazardAhead(p.x + p.w + 14, footY)) { g.input.jump = true; g.input.dash = true; }
  for (const e of g.enemies) {
    if (!e.alive) continue;
    const d = e.x - p.x;
    if (Math.abs(d) < 30 && Math.sign(d) === (p.face > 0 ? 1 : -1)) g.input.attack = true;
  }
  for (const b of g.bullets) if (Math.abs(b.x - p.x) < 36) g.input.parry = true;
}

let frames = 0, errors = [], roomTimes = {}, maxRoom = 0;
for (let i = 0; i < 60000 && !g.won; i++) {
  try {
    bot(); const beforeX = g.player ? g.player.x : 0; g.step(); g.draw(ctx); prevX = beforeX; frames++;
    maxRoom = Math.max(maxRoom, g.room);
    if (!roomTimes[g.room]) roomTimes[g.room] = i;
  } catch (e) {
    errors.push('frame ' + i + ': ' + (e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : e));
    if (errors.length > 2) break;
  }
}
const res = g.info();
console.log(JSON.stringify({ frames, won: res.won, maxRoom, room: res.room, deaths: res.deaths,
  kills: res.kills, parries: res.parries, errors }, null, 1));
process.exit(errors.length ? 1 : 0);