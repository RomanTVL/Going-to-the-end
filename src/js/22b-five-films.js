// ---------- five more films: the battle box, the boss cloud, the wanted level, the imps, the masked thugs ----------
// Mechanics plug in through MECH, extra background data through AMB, collectibles through TOKENS;
// hazards, props, backdrops and THE END gags extend the shared tables.

const MECH = {};
const AMB = {};
const TOKENS = {};

// ===== the battle box: every few seconds the frame shrinks to a white box and bones fly through it =====
const BOX_W = 230, BOX_H = 104;
MECH.battle = {
  hint: 'появилась рамка — прыгай через кости',
  reset() { S.battle = { phase: 'idle', t: 0, next: rand(3.5, 5), bones: [] }; },
  frozen: () => S.battle && S.battle.phase !== 'idle',
  update(dt) {
    const B = S.battle, p = S.p;
    B.t += dt;
    if (B.phase === 'idle') {
      B.next -= dt;
      if (B.next > 0) return;
      const g = p.ground;
      // only on a steady word with room above it for the whole box, well inside the frame
      const fy = g && g.top - S.camY;
      if (!g || g.sway || g.blink || g.fragile || g.end || g.block || fy < BOX_H + 70 || fy > H - 60) { B.next = .3; return; }
      const cx = clamp(p.x + PW / 2, BOX_W / 2 + 14, W - BOX_W / 2 - 14);
      Object.assign(B, { phase: 'box', t: 0, x0: cx - BOX_W / 2, x1: cx + BOX_W / 2, floor: g.top, ceil: g.top - BOX_H, ground: g, bones: [], spawn: .25, n: 0, len: 3.2 + 1.2 * progress() });
      sweep(200, 900, .25, .08, 'square');
    } else if (B.phase === 'box') {
      if (B.t > .5) { B.phase = 'fight'; B.t = 0; }
    } else if (B.phase === 'fight') {
      B.spawn -= dt;
      if (B.spawn <= 0 && B.t < B.len - .9) {
        B.spawn = rand(.62, .85);
        const fromL = B.n % 2 === 0;
        B.bones.push({ x: fromL ? B.x0 + 4 : B.x1 - 4, vx: (fromL ? 1 : -1) * rand(190, 235), high: Math.random() < .3 });
        B.n++;
      }
      for (const b of B.bones) b.x += b.vx * dt;
      B.bones = B.bones.filter(b => b.x > B.x0 - 2 && b.x < B.x1 + 2);
      // a white bone has to be jumped over; a blue bone only hurts if you move up into it
      const d = dotWorld();
      for (const b of B.bones) {
        if (Math.abs(d.x - b.x) > 8) continue;
        if (!b.high && d.y > B.floor - 28) { cut('Кость оказалась быстрее'); return; }
        if (b.high && d.y < B.floor - 20) { cut('Синяя кость: надо было стоять'); return; }
      }
      if (B.t > B.len) { B.phase = 'spare'; B.t = 0; tone(523, .2, .08, 0, 'square'); tone(784, .3, .08, .12, 'square'); }
    } else if (B.phase === 'spare' && B.t > .9) {
      B.phase = 'idle'; B.next = rand(4.5, 6.5) * (1 - .2 * progress());
    }
  },
  constrain(p) {
    const B = S.battle;
    if (!B || B.phase === 'idle' || B.phase === 'spare') return;
    p.x = clamp(p.x, B.x0 + 3, B.x1 - 3 - PW);
    if (p.y + PH > B.floor) { p.y = B.floor - PH; p.vy = 0; p.ground = B.ground; }
    if (p.y < B.ceil + 2) { p.y = B.ceil + 2; p.vy = Math.max(0, p.vy); }
  },
  draw() {
    const B = S.battle;
    if (!B || B.phase === 'idle' || S.mode !== 'play') return;
    const cam = S.camY, k = B.phase === 'box' ? clamp(B.t / .4, 0, 1) : B.phase === 'spare' ? 1 - clamp(B.t / .9, 0, 1) : 1;
    const x0 = B.x0, x1 = B.x1, y0 = B.ceil - cam, y1 = B.floor - cam + 6;
    ctx.fillStyle = `rgba(0,0,0,${.75 * k})`;
    ctx.fillRect(0, 0, W, y0); ctx.fillRect(0, y1, W, H - y1); ctx.fillRect(0, y0, x0, y1 - y0); ctx.fillRect(x1, y0, W - x1, y1 - y0);
    ctx.fillStyle = `rgba(0,0,0,${.88 * k})`; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.strokeStyle = `rgba(255,255,255,${k})`; ctx.lineWidth = 3; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    for (const b of B.bones) {
      const top = b.high ? y0 + 2 : y1 - 34, bot = b.high ? y1 - 28 : y1 - 4, c = b.high ? '#2fa8ff' : '#ffffff';
      ctx.fillStyle = c; ctx.fillRect(b.x - 3, top + 3, 6, bot - top - 6);
      for (const yy of [top + 3, bot - 3]) { circle(b.x - 3, yy, 3.5, c); circle(b.x + 3, yy, 3.5, c); }
    }
    ctx.textAlign = 'left'; ctx.font = `400 15px ${TINY}`;
    ctx.fillStyle = B.phase === 'spare' ? '#ffd23f' : '#ffffff'; ctx.globalAlpha = k;
    ctx.fillText(B.phase === 'spare' ? '* ПОЩАДИТЬ' : '* Кости приближаются.', x0 + 4, y1 + 24);
    ctx.fillStyle = '#ffffff'; ctx.fillText('HP 20/20', x1 - 78, y0 - 8);
    ctx.globalAlpha = 1;
    drawSoul(S.p.x + PW / 2, S.p.y + PH / 2 - cam);
  },
};
function drawSoul(x, y) {
  ctx.save(); ctx.translate(x, y);
  ctx.shadowColor = '#ff2a2a'; ctx.shadowBlur = 14; ctx.fillStyle = '#ff1a1a';
  ctx.beginPath(); ctx.moveTo(0, 6); ctx.bezierCurveTo(-11, -1, -7, -10, 0, -4); ctx.bezierCurveTo(7, -10, 11, -1, 0, 6); ctx.fill();
  ctx.restore();
}

// ===== the boss cloud: rains on you, and its pink drops can be parried with a jump =====
MECH.boss = {
  hint: 'розовые капли можно отбить прыжком',
  reset() { S.bossC = { x: CX, vx: 70, next: 1.6, inhale: 0, dead: 0 }; S.parries = 0; },
  update(dt) {
    const C = S.bossC;
    C.x += C.vx * dt;
    if (C.x < 90 || C.x > W - 90) { C.vx *= -1; C.x = clamp(C.x, 90, W - 90); }
    C.next -= dt;
    C.inhale = C.next < .55 ? 1 - C.next / .55 : 0;
    if (C.next > 0) return;
    C.next = rand(1.2, 1.6) * (1 - .25 * progress());
    for (const a of [-.45, 0, .45]) S.hz.push({ type: 'drop', screen: true, x: C.x + a * 40, y: 104, vx: Math.sin(a) * 120, vy: 140, pink: Math.random() < .25, r: 8, t: 0, warn: 0, live: true });
    noise(.2, .25, 900, 'bandpass');
  },
  draw(t) {
    const C = S.bossC, k = C.dead ? Math.max(0, 1 - C.dead) : 1;
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = k; ctx.translate(C.x, 66 + Math.sin(t * .003) * 4);
    const s = 1 + .12 * C.inhale; ctx.scale(s, s);
    ctx.fillStyle = '#f6ecd6';
    for (const [x, y, r] of [[-46, 6, 26], [-20, -10, 32], [14, -14, 34], [44, 4, 26], [0, 14, 30], [-30, 18, 22], [30, 18, 22]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, PI2); ctx.fill(); }
    ctx.strokeStyle = 'rgba(60,40,20,.55)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, 4, 52, Math.PI * .1, Math.PI * .9); ctx.stroke();
    // pie-cut eyes and a mouth that opens to spit
    for (const ex of [-16, 16]) {
      ctx.fillStyle = '#1a120a'; ctx.beginPath(); ctx.ellipse(ex, -6, 7, 10, 0, 0, PI2); ctx.fill();
      ctx.fillStyle = '#f6ecd6'; ctx.beginPath(); ctx.moveTo(ex, -6); ctx.arc(ex, -6, 7, -1.2, -.6); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#5a2a1a'; ctx.beginPath(); ctx.ellipse(0, 14, 10, 3 + 9 * C.inhale, 0, 0, PI2); ctx.fill();
    if (C.dead) { ctx.fillStyle = 'rgba(120,180,255,.9)'; for (const ex of [-16, 16]) ctx.fillRect(ex - 1.5, 4, 3, 10 + C.dead * 30); }
    ctx.restore();
  },
};

// ===== the wanted level: stars climb with every bundle of cash; police cars drive the lines; a helicopter hunts =====
function addWantedStar() {
  const Wd = S.wanted;
  if (Wd.stars >= 5) return;
  Wd.stars++; Wd.flash = 1.2; feat('wanted', Wd.stars);
  sweep(700, 1100, .25, .06, 'square'); sweep(1100, 700, .25, .06, 'square');
}
MECH.police = {
  hint: 'каждая пачка денег — ещё звезда розыска',
  reset() { S.wanted = { stars: 1, clock: 0, heli: { x: CX, sx: CX, sy: H * .4 }, heat: 0, flash: 0 }; },
  collect() { addWantedStar(); },
  update(dt) {
    const Wd = S.wanted, d = dotScreen(), h = Wd.heli;
    Wd.clock += dt; Wd.flash = Math.max(0, Wd.flash - dt);
    if (Wd.clock > 10) { Wd.clock = 0; addWantedStar(); }
    if (Wd.stars < 3) { Wd.heat = 0; return; }
    // the helicopter drifts over the dot and its spotlight crawls towards it
    h.x += (d.x - h.x) * Math.min(1, dt * .8);
    const dx = d.x - h.sx, dy = d.y - h.sy, L = Math.hypot(dx, dy) || 1, v = 70 + 18 * Wd.stars;
    h.sx += dx / L * Math.min(L, v * dt); h.sy += dy / L * Math.min(L, v * dt);
    Wd.heat = L < 36 ? Wd.heat + dt : Math.max(0, Wd.heat - dt * .6);
    if (Wd.heat > .75) cut('Снайпер с вертолёта');
  },
  draw(t) {
    const Wd = S.wanted;
    if (!Wd) return;
    if (Wd.stars >= 3 && S.mode === 'play') {
      const h = Wd.heli;
      const g = ctx.createLinearGradient(h.x, 40, h.sx, h.sy);
      g.addColorStop(0, 'rgba(255,255,220,.05)'); g.addColorStop(1, `rgba(255,255,220,${.18 + Wd.heat * .3})`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(h.x - 6, 44); ctx.lineTo(h.x + 6, 44); ctx.lineTo(h.sx + 40, h.sy); ctx.lineTo(h.sx - 40, h.sy); ctx.closePath(); ctx.fill();
      ctx.fillStyle = `rgba(255,255,230,${.22 + Wd.heat * .5})`; ctx.beginPath(); ctx.ellipse(h.sx, h.sy, 38, 30, 0, 0, PI2); ctx.fill();
      ctx.fillStyle = '#10141c'; rr(h.x - 22, 26, 44, 18, 8); ctx.fill(); ctx.fillRect(h.x + 18, 31, 28, 4);
      ctx.strokeStyle = '#3a4252'; ctx.lineWidth = 2; ctx.beginPath(); const r = Math.sin(t * .06) * 34; ctx.moveTo(h.x - r, 22); ctx.lineTo(h.x + r, 22); ctx.stroke();
      circle(h.x - 12, 35, 3, Math.floor(t / 200) % 2 ? '#ff2a2a' : '#2f6bff');
    }
    // the wanted stars in the corner
    for (let i = 0; i < 5; i++) {
      const on = i < Wd.stars, blink = Wd.flash > 0 && i === Wd.stars - 1 && Math.floor(Wd.flash * 8) % 2;
      ctx.font = `400 20px ${SEYMOUR}`; ctx.textAlign = 'center';
      ctx.fillStyle = on && !blink ? '#ffffff' : 'rgba(255,255,255,.18)';
      ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
      ctx.fillText('★', W - 22 - i * 22, 30);
    }
    ctx.shadowBlur = 0;
    if (Wd.stars > 0 && S.mode === 'play') { ctx.fillStyle = Math.floor(performance.now() / 300) % 2 ? 'rgba(255,40,40,.06)' : 'rgba(40,90,255,.06)'; ctx.fillRect(0, 0, W, H); }
  },
};

// ===== the imps throw fireballs from the edges of the frame; barrels explode =====
MECH.imp = { hint: 'бесы светятся перед броском, бочки взрываются' };

// ===== the masked thugs: one hit kills them and one hit kills you; stomps chain into a combo =====
MECH.thug = {
  hint: 'прыжок сверху убивает, сбоку — убивают тебя',
  reset() { S.combo = 0; if (S.score === undefined) S.score = 0; },
  land() { S.combo = 0; },
  draw(t) {
    if (S.score === undefined) return;
    ctx.textAlign = 'left'; ctx.font = `400 18px ${PACIFICO}`;
    ctx.shadowColor = '#ff2ad8'; ctx.shadowBlur = 12; ctx.fillStyle = '#ffe14d';
    ctx.fillText(`${S.score}`, 16, 34);
    if (S.combo > 1) { ctx.fillStyle = '#00f0ff'; ctx.shadowColor = '#00f0ff'; ctx.fillText(`комбо x${S.combo}`, 16, 60); }
    ctx.shadowBlur = 0;
    // scanlines of a worn tape
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    for (let y = (t * .05) % 4; y < H; y += 4) ctx.fillRect(0, y, W, 1.5);
  },
};

// ---------- hazards of the five films ----------
Object.assign(HZ, {
  boss: { every: 99, spawn() {}, step() {}, hit: () => false, dead: () => true, why: '' },
  drop: {
    step(h, dt) { h.vy += 260 * dt; h.x += h.vx * dt; h.y += h.vy * dt; },
    hit(h, d) {
      if (Math.hypot(d.x - h.x, d.y - h.y) > h.r + 5) return false;
      if (h.pink && !S.p.ground) {
        // a parry: the pink drop is slapped away and throws you back up
        h.gone = true; S.p.vy = -JUMP * .75; S.p.coyote = 0;
        S.floaters.push({ x: S.p.x, y: S.p.y, t: 0, text: 'ПАРИРОВАНО!', col: '#ff8ab8' });
        tone(1046, .2, .1, 0, 'triangle'); tone(1568, .3, .08, .08, 'triangle');
        S.parries = (S.parries || 0) + 1; feat('parry', S.parries);
        return false;
      }
      return true;
    },
    dead: h => h.gone || h.y > H + 30,
    why: 'Тебя смыло дождём',
  },
  police: {
    every: 2.2,
    spawn() {
      const st = S.wanted.stars;
      if (Math.random() > .35 + .13 * st) return;
      let y;
      if (S.p.ground && Math.random() < .3) y = S.p.ground.top - 9;
      else { const c = platformsAhead(30, () => true); if (!c.length) return; y = pick(c).top - 9; }
      const fromL = Math.random() < .5;
      S.hz.push({ type: 'police', x: fromL ? -60 : W + 60, y, vx: (fromL ? 1 : -1) * (240 + 20 * st), warn: .9, t: 0 });
    },
    onLive() { sweep(900, 600, .4, .05, 'square'); },
    step(h, dt) { if (h.live) h.x += h.vx * dt; },
    hit: (h, d) => h.live && Math.abs(d.x - h.x) < 24 && Math.abs(d.y - h.y) < 11,
    dead: h => h.live && (h.x < -120 || h.x > W + 120),
    why: 'Тебя сбила полиция',
  },
  imp: {
    every: 1.75, screen: true,
    spawn() {
      const d = dotScreen(), fromL = Math.random() < .5;
      S.hz.push({ type: 'imp', screen: true, x: fromL ? 26 : W - 26, y: clamp(d.y + rand(-70, 50), 70, H - 60), fromL, warn: .85, t: 0 });
      if (Math.random() < .35 && S.hz.filter(h => h.type === 'barrel').length < 2) {
        const c = platformsAhead(80, q => q.w >= 26);
        if (c.length) { const pl = pick(c); S.hz.push({ type: 'barrel', pl, rx: rand(2, pl.w - 16), t: 0, warn: 0, live: true }); }
      }
    },
    onLive(h) {
      h.thrown = true;
      const d = dotScreen(), dx = d.x - h.x, dy = d.y - h.y, L = Math.hypot(dx, dy) || 1;
      S.hz.push({ type: 'fireball', screen: true, x: h.x, y: h.y, vx: dx / L * 245, vy: dy / L * 245, t: 0, warn: 0, live: true });
      noise(.3, .25, 600, 'lowpass');
    },
    step() {},
    hit: () => false,
    dead: h => h.t > h.warn + .5,
    why: '',
  },
  fireball: {
    step(h, dt) {
      h.x += h.vx * dt; h.y += h.vy * dt;
      for (const b of S.hz) {
        if (b.type !== 'barrel' || b.boom) continue;
        const bx = b.pl.x + b.rx + 8, by = b.pl.top - 12 - S.camY;
        if (Math.hypot(bx - h.x, by - h.y) < 20) { b.boom = true; h.gone = true; feat('chain'); }
      }
    },
    hit: (h, d) => Math.hypot(d.x - h.x, d.y - h.y) < 12,
    dead: h => h.gone || h.x < -40 || h.x > W + 40 || h.y < -40 || h.y > H + 40,
    why: 'Тебя поджарил бес',
  },
  barrel: {
    step(h) {
      if (!h.boom || h.exploded) return;
      h.exploded = true; h.t = 0;
      const x = h.pl.x + h.rx + 8, y = h.pl.top - 12;
      noise(.9, .7, 500, 'lowpass'); S.shake = .35;
      for (const q of plats) {
        if (q.end || q.gone) continue;
        const nx = clamp(x, q.x, q.x + q.w), ny = clamp(y, q.top, q.base);
        if (Math.hypot(nx - x, ny - y) < 66) { q.gone = true; if (S.p.ground === q) S.p.ground = null; }
      }
      burst(x, y, 30, '#ff7a1f', 260, 4); burst(x, y, 14, '#5bd75b', 160, 3);
      const d = dotWorld();
      if (S.mode === 'play' && Math.hypot(d.x - x, d.y - y) < 80) h.kill = true;
    },
    hit: h => h.kill,
    dead: h => h.exploded && h.t > .5 || !h.boom && (h.pl.gone || h.pl.top < S.camY - 60),
    why: 'Бочка взорвалась рядом',
  },
  thug: {
    every: 1.25,
    spawn() {
      if (S.hz.filter(h => h.type === 'thug' && h.alive).length >= 4) return;
      const taken = new Set(S.hz.filter(h => h.type === 'thug').map(h => h.pl));
      const c = platformsAhead(50, q => q.w >= 40 && !taken.has(q));
      if (!c.length) return;
      const pl = pick(c);
      S.hz.push({ type: 'thug', pl, rx: rand(0, pl.w - 14), dir: pick([-1, 1]), alive: true, sq: 0, t: 0, warn: 0, live: true, charge: 0 });
    },
    step(h, dt) {
      if (!h.alive) { h.sq += dt; return; }
      if (h.pl.gone) { h.alive = false; return; }
      // a thug on your line charges at you
      const d = dotWorld(), wx = h.pl.x + h.rx + 7;
      h.charge = Math.abs(d.y - (h.pl.top - 8)) < 16 && Math.abs(d.x - wx) < 150 ? 1 : 0;
      if (h.charge) h.dir = Math.sign(d.x - wx) || 1;
      h.rx += h.dir * (h.charge ? 140 : 50) * dt;
      if (h.rx < 0) { h.rx = 0; h.dir = 1; }
      if (h.rx > h.pl.w - 14) { h.rx = h.pl.w - 14; h.dir = -1; }
    },
    hit(h) {
      if (!h.alive) return false;
      const p = S.p, wx = h.pl.x + h.rx, wt = h.pl.top - 30;
      if (p.x + PW < wx + 1 || p.x > wx + 13 || p.y + PH < wt || p.y > h.pl.top) return false;
      if (p.vy > 0 && S.prevBottom <= wt + 12) {
        h.alive = false; p.vy = -JUMP * .65; p.ground = null; p.coyote = 0;
        S.combo = (S.combo || 0) + 1; S.score = (S.score || 0) + 100 * S.combo; feat('combo', S.combo);
        S.floaters.push({ x: wx + 7, y: wt - 4, t: 0, text: S.combo > 1 ? `x${S.combo}` : '+100', col: '#ff2ad8' });
        noise(.12, .5, 1500); burst(wx + 7, wt + 8, 10, '#c8102e', 140, 3);
        return false;
      }
      return true;
    },
    dead: h => !h.alive && h.sq > .6 || h.pl.top < S.camY - 60,
    why: 'Один удар — и всё',
  },
});

// how the new hazards look
const HZDRAW = {
  drop(h) {
    ctx.fillStyle = h.pink ? '#ff6fb0' : '#9fd0ff';
    if (h.pink) { ctx.shadowColor = '#ff6fb0'; ctx.shadowBlur = 12; }
    ctx.beginPath(); ctx.moveTo(h.x, h.y - h.r * 1.6); ctx.quadraticCurveTo(h.x + h.r, h.y, h.x, h.y + h.r); ctx.quadraticCurveTo(h.x - h.r, h.y, h.x, h.y - h.r * 1.6); ctx.fill();
  },
  police(h, t, cam, w) {
    if (!h.live) {
      const x = h.vx > 0 ? 6 : W - 6, red = Math.floor(t / 120) % 2;
      ctx.globalAlpha = .4 + .6 * w; ctx.shadowColor = red ? '#ff2a2a' : '#2f6bff'; ctx.shadowBlur = 18;
      circle(x, h.y, 7 + 4 * w, red ? '#ff2a2a' : '#2f6bff');
      return;
    }
    ctx.translate(h.x, h.y); ctx.scale(h.vx > 0 ? 1 : -1, 1);
    ctx.fillStyle = '#f2f2f2'; rr(-22, -6, 44, 12, 4); ctx.fill();
    ctx.fillStyle = '#10141c'; rr(-12, -12, 22, 8, 3); ctx.fill(); ctx.fillRect(-22, 0, 10, 6); ctx.fillRect(12, 0, 10, 6);
    ctx.fillStyle = '#a8d4f0'; ctx.fillRect(-8, -11, 7, 5); ctx.fillRect(1, -11, 7, 5);
    const red = Math.floor(t / 100) % 2;
    ctx.shadowColor = red ? '#ff2a2a' : '#2f6bff'; ctx.shadowBlur = 14;
    ctx.fillStyle = red ? '#ff2a2a' : '#2f6bff'; ctx.fillRect(-5, -15, 10, 3); ctx.shadowBlur = 0;
    circle(-13, 7, 4.5, '#111'); circle(13, 7, 4.5, '#111');
    ctx.fillStyle = '#fffbe6'; ctx.fillRect(20, -4, 3, 3);
  },
  imp(h, t, cam, w) {
    const s = h.fromL ? 1 : -1;
    ctx.translate(h.x, h.y); ctx.scale(s, 1);
    ctx.fillStyle = '#6b3a22';
    ctx.beginPath(); ctx.ellipse(-8, 6, 12, 18, 0, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.arc(-8, -16, 9, 0, PI2); ctx.fill();
    for (const sx of [-14, -2]) { ctx.beginPath(); ctx.moveTo(sx - 3, -22); ctx.lineTo(sx, -32); ctx.lineTo(sx + 3, -22); ctx.fill(); }
    circle(-5, -17, 2, '#ff3b1f'); circle(-11, -17, 2, '#ff3b1f');
    if (!h.thrown && h.t < h.warn + .05) {
      const r = 4 + 8 * w;
      ctx.shadowColor = '#ff7a1f'; ctx.shadowBlur = 20; circle(8, -2, r, '#ffb347'); circle(8, -2, r * .5, '#fff3c4'); ctx.shadowBlur = 0;
    }
  },
  fireball(h, t) {
    const g = ctx.createRadialGradient(h.x, h.y, 1, h.x, h.y, 14);
    g.addColorStop(0, '#fff3c4'); g.addColorStop(.4, '#ffb347'); g.addColorStop(1, 'rgba(255,60,20,0)');
    ctx.strokeStyle = 'rgba(255,120,40,.5)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(h.x - h.vx * .08, h.y - h.vy * .08); ctx.lineTo(h.x, h.y); ctx.stroke(); ctx.lineCap = 'butt';
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(h.x, h.y, 14, 0, PI2); ctx.fill();
  },
  barrel(h) {
    const x = h.pl.x + h.rx, y = h.pl.top;
    if (h.exploded) {
      const k = h.t / .5, g = ctx.createRadialGradient(x + 8, y - 12, 0, x + 8, y - 12, 90 * (.4 + k));
      g.addColorStop(0, `rgba(255,255,220,${Math.max(0, 1 - k)})`); g.addColorStop(.4, `rgba(255,140,40,${Math.max(0, .8 * (1 - k))})`); g.addColorStop(1, 'rgba(80,20,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 100, y - 120, 220, 220);
      return;
    }
    ctx.fillStyle = '#4a5a2a'; rr(x, y - 24, 16, 24, 3); ctx.fill();
    ctx.fillStyle = '#7fd04a'; ctx.fillRect(x, y - 20, 16, 3); ctx.fillRect(x, y - 8, 16, 3);
    ctx.fillStyle = 'rgba(120,255,80,.5)'; ctx.beginPath(); ctx.ellipse(x + 8, y - 24, 7, 2.5, 0, 0, PI2); ctx.fill();
  },
  thug(h, t) {
    const x = h.pl.x + h.rx + 7, y = h.pl.top;
    if (!h.alive) { ctx.globalAlpha = Math.max(0, 1 - h.sq * 1.6); ctx.fillStyle = '#c8102e'; ctx.beginPath(); ctx.ellipse(x, y - 2, 16, 4.5, 0, 0, PI2); ctx.fill(); ctx.fillStyle = '#f2f2f2'; ctx.fillRect(x - 11, y - 6, 22, 5); return; }
    const step = Math.floor(t / (h.charge ? 70 : 140)) % 2;
    ctx.translate(x, y); ctx.scale(h.dir < 0 ? -1 : 1, 1);
    ctx.shadowColor = h.charge ? '#ff2a2a' : 'rgba(0,0,0,.9)'; ctx.shadowBlur = h.charge ? 14 : 6;
    // legs, white suit, a pig-pink mask with a snout
    ctx.fillStyle = '#111'; ctx.fillRect(-5 + (step ? 1.5 : 0), -6, 4, 6); ctx.fillRect(1 - (step ? 1.5 : 0), -6, 4, 6);
    ctx.fillStyle = '#f4f4f4'; rr(-7, -20, 14, 15, 3); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-1, -19, 2, 9);
    ctx.fillStyle = '#ff8fb8'; ctx.beginPath(); ctx.arc(0, -26, 6.5, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-6, -30); ctx.lineTo(-4, -35); ctx.lineTo(-1.5, -31); ctx.fill();
    ctx.beginPath(); ctx.moveTo(6, -30); ctx.lineTo(4, -35); ctx.lineTo(1.5, -31); ctx.fill();
    ctx.fillStyle = '#e0648f'; ctx.beginPath(); ctx.ellipse(4, -25, 3, 2.4, 0, 0, PI2); ctx.fill();
    circle(-1.5, -28, 1.2, '#111'); circle(3, -28.5, 1.2, '#111');
    if (h.charge) { ctx.strokeStyle = '#a07850'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(6, -16); ctx.lineTo(15, -28); ctx.stroke(); ctx.lineCap = 'butt'; }
  },
};

// ---------- the backgrounds ----------
AMB.void = (A, many) => { A.dust = many(40, () => ({ x: rand(0, W), y: rand(0, H), d: rand(.05, .3) })); };
AMB.cartoon = (A, many) => { A.clouds = many(5, () => ({ x: rand(0, W), y: rand(0, H), s: rand(.6, 1.2), d: rand(.08, .2) })); };
AMB.city = (A, many) => {
  A.far = many(16, (_, i) => ({ x: i * 36, w: rand(26, 40), h: rand(120, 260), lit: many(18, () => Math.random() < .3) }));
  A.signs = many(4, () => ({ x: rand(20, W - 100), y: rand(0, H), c: pick(['#ff2ad8', '#00f0ff', '#ffe14d']), w: rand(50, 90), ph: rand(0, 6) }));
};
AMB.hellfire = (A, many) => { A.embers = many(50, () => ({ x: rand(0, W), y: rand(0, H), s: rand(.5, 1.5) })); };

Object.assign(BACK, {
  void(t, cam, k) {
    const g = ctx.createLinearGradient(0, H * .6, 0, H); g.addColorStop(0, 'rgba(60,0,80,0)'); g.addColorStop(1, 'rgba(60,0,80,.25)');
    ctx.globalAlpha = k; ctx.fillStyle = g; ctx.fillRect(0, H * .6, W, H * .4);
    for (const s of S.amb.dust) { ctx.globalAlpha = (.3 + Math.sin(t * .003 + s.x) * .2) * k; ctx.fillStyle = '#ffffff'; ctx.fillRect(s.x, wrapY(s.y - cam * s.d - t * .005), 1.5, 1.5); }
  },
  cartoon(t, cam, k) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3e2c18'); g.addColorStop(1, '#1e140a');
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = .08 * k; ctx.fillStyle = '#f6e8c6';
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W * (i / 9 + .05), H); ctx.lineTo(W * (i / 9 + .1), H); ctx.closePath(); ctx.fill(); }
    for (const c of S.amb.clouds) {
      const y = wrapY(c.y - cam * c.d);
      ctx.globalAlpha = .14 * k; ctx.fillStyle = '#f6e8c6';
      for (const [dx, dy, r] of [[-30, 0, 22], [0, -10, 28], [30, 0, 22]]) { ctx.beginPath(); ctx.arc(c.x + dx * c.s, y + dy * c.s, r * c.s, 0, PI2); ctx.fill(); }
    }
  },
  city(t, cam, k) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a0e16'); g.addColorStop(1, '#1a1030');
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const b of S.amb.far) {
      const bh = b.h, y = H - bh + ((cam * .05) % 40);
      ctx.globalAlpha = .9 * k; ctx.fillStyle = '#06080e'; ctx.fillRect(b.x, y, b.w, bh + 60);
      ctx.fillStyle = 'rgba(255,214,140,.55)';
      b.lit.forEach((on, i) => { if (on) ctx.fillRect(b.x + 4 + (i % 3) * 10, y + 8 + Math.floor(i / 3) * 16, 4, 6); });
    }
    for (const s of S.amb.signs) {
      const y = wrapY(s.y - cam * .2), on = Math.sin(t * .004 + s.ph) > -.85;
      ctx.globalAlpha = (on ? .7 : .15) * k; ctx.strokeStyle = s.c; ctx.lineWidth = 2; ctx.shadowColor = s.c; ctx.shadowBlur = on ? 12 : 0;
      rr(s.x, y, s.w, 18, 9); ctx.stroke(); ctx.shadowBlur = 0;
    }
  },
  hellfire(t, cam, k) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#120403'); g.addColorStop(1, '#3a0a04');
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = .6 * k; ctx.fillStyle = '#1a0503';
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 30) ctx.lineTo(x, H - 90 - Math.abs(Math.sin(x * .021 + 1)) * 110);
    ctx.lineTo(W, H); ctx.fill();
    const lg = ctx.createLinearGradient(0, H - 40, 0, H); lg.addColorStop(0, 'rgba(255,90,20,0)'); lg.addColorStop(1, `rgba(255,90,20,${.4 + .1 * Math.sin(t * .004)})`);
    ctx.globalAlpha = k; ctx.fillStyle = lg; ctx.fillRect(0, H - 40, W, 40);
    for (const e of S.amb.embers) { ctx.globalAlpha = .7 * k; ctx.fillStyle = '#ff9a3c'; ctx.fillRect(e.x + Math.sin(t * .002 + e.y) * 6, wrapY(e.y - t * .04 * e.s - cam * .2), 2, 2); }
  },
  synth(t, cam, k) {
    const pulse = .5 + .5 * Math.sin(t * .0045);
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#14001f'); g.addColorStop(.6, `rgb(${40 + 20 * pulse},0,${52 + 14 * pulse})`); g.addColorStop(1, '#5a0a52');
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // the striped sun and the grid running to the horizon
    const sy = H * .68;
    ctx.save(); ctx.beginPath(); ctx.arc(CX, sy, 90, Math.PI, PI2); ctx.clip();
    const sg = ctx.createLinearGradient(0, sy - 90, 0, sy); sg.addColorStop(0, '#ffe14d'); sg.addColorStop(1, '#ff2ad8');
    ctx.globalAlpha = .38 * k; ctx.fillStyle = sg; ctx.fillRect(CX - 90, sy - 90, 180, 90);
    ctx.fillStyle = '#14001f'; for (let i = 0; i < 6; i++) ctx.fillRect(CX - 90, sy - 30 + i * 6, 180, 1 + i * .7);
    ctx.restore();
    ctx.globalAlpha = .22 * k; ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 1;
    for (let i = -10; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(CX + i * 12, sy); ctx.lineTo(CX + i * 90, H); ctx.stroke(); }
    for (let i = 0; i < 8; i++) { const y = sy + Math.pow((i + (t * .0008) % 1) / 8, 2) * (H - sy); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  },
});

// ---------- the props ----------
Object.assign(PROPS, {
  bone(pr) {
    ctx.rotate(pr.ph); ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(-18, -3, 36, 6);
    for (const x of [-18, 18]) { circle(x, -4, 5, '#f2f2f2'); circle(x, 4, 5, '#f2f2f2'); }
  },
  soulheart(pr, t) { ctx.scale(2.2, 2.2); drawSoul(0, Math.sin(t * .003 + pr.ph) * 2); },
  savestar(pr, t) {
    ctx.rotate(t * .001 + pr.ph); ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 16; ctx.fillStyle = '#ffd23f';
    ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 4 : 16; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill(); ctx.shadowBlur = 0;
  },
  whitedog(pr, t) {
    ctx.fillStyle = '#f2f2f2'; ctx.beginPath(); ctx.ellipse(0, 8, 18, 9, 0, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-16, 0, 9, 8, 0, 0, PI2); ctx.fill(); ctx.fillRect(-26, -4, 6, 10);
    circle(-18, -1, 1.3, '#111'); circle(-24, 2, 1.6, '#111');
    ctx.fillStyle = '#9a9a9a'; ctx.font = `400 10px ${TINY}`; ctx.fillText('z', 6 + Math.sin(t * .003) * 3, -10);
  },
  mug(pr, t) {
    ctx.rotate(Math.sin(t * .004 + pr.ph) * .12);
    ctx.fillStyle = '#f6ecd6'; rr(-16, -14, 32, 34, 8); ctx.fill();
    ctx.strokeStyle = '#f6ecd6'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(18, 3, 8, -1.2, 1.2); ctx.stroke();
    ctx.fillStyle = '#e8432a'; ctx.fillRect(-16, -14, 32, 6);
    ctx.strokeStyle = '#e8432a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(4, -14); ctx.lineTo(10, -30); ctx.stroke();
    for (const ex of [-6, 6]) { ctx.fillStyle = '#1a120a'; ctx.beginPath(); ctx.ellipse(ex, 0, 3, 5, 0, 0, PI2); ctx.fill(); }
    ctx.strokeStyle = '#1a120a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 8, 6, .3, Math.PI - .3); ctx.stroke();
  },
  dice(pr) {
    ctx.rotate(.2 + pr.ph * .1); ctx.fillStyle = '#f6ecd6'; rr(-16, -16, 32, 32, 6); ctx.fill();
    for (const [x, y] of [[-8, -8], [8, 8], [0, 0], [8, -8], [-8, 8]]) circle(x, y, 2.6, '#1a120a');
  },
  flower(pr, t) {
    ctx.strokeStyle = '#3d6b2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 30); ctx.quadraticCurveTo(Math.sin(t * .003) * 8, 10, 0, 0); ctx.stroke();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + t * .0006; ctx.fillStyle = '#e8432a'; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 12, Math.sin(a) * 12, 7, 4, a, 0, PI2); ctx.fill(); }
    circle(0, 0, 9, '#f2c14e'); circle(-3, -1, 1.5, '#1a120a'); circle(3, -1, 1.5, '#1a120a');
  },
  palm(pr, t) {
    ctx.strokeStyle = '#1a1020'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 50); ctx.quadraticCurveTo(8, 10, 0, -20); ctx.stroke();
    ctx.fillStyle = '#1a1020';
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .5 + Math.sin(t * .001 + i) * .05; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 20, -20 + Math.sin(a) * 12, 22, 5, a, 0, PI2); ctx.fill(); }
  },
  sportscar() {
    ctx.fillStyle = '#c8102e'; ctx.beginPath(); ctx.moveTo(-34, 6); ctx.lineTo(-30, -4); ctx.lineTo(-10, -6); ctx.lineTo(0, -14); ctx.lineTo(18, -14); ctx.lineTo(30, -4); ctx.lineTo(36, 0); ctx.lineTo(36, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a8d4f0'; ctx.beginPath(); ctx.moveTo(2, -12); ctx.lineTo(16, -12); ctx.lineTo(24, -5); ctx.lineTo(-4, -5); ctx.closePath(); ctx.fill();
    circle(-20, 7, 6, '#111'); circle(22, 7, 6, '#111'); circle(-20, 7, 2.5, '#aaa'); circle(22, 7, 2.5, '#aaa');
  },
  cone() {
    ctx.fillStyle = '#ff7a1f'; ctx.beginPath(); ctx.moveTo(-12, 18); ctx.lineTo(0, -20); ctx.lineTo(12, 18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f2f2f2'; ctx.fillRect(-7, -2, 14, 5); ctx.fillRect(-4.5, -12, 9, 4);
    ctx.fillStyle = '#ff7a1f'; ctx.fillRect(-16, 16, 32, 5);
  },
  demonskull(pr, t) {
    ctx.fillStyle = '#d8c8a8';
    ctx.beginPath(); ctx.moveTo(-14, -6); ctx.quadraticCurveTo(-30, -24, -22, -40); ctx.quadraticCurveTo(-18, -24, -8, -14); ctx.fill();
    ctx.beginPath(); ctx.moveTo(14, -6); ctx.quadraticCurveTo(30, -24, 22, -40); ctx.quadraticCurveTo(18, -24, 8, -14); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 17, 0, PI2); ctx.fill(); ctx.fillRect(-10, 12, 20, 10);
    ctx.shadowColor = '#ff3b1f'; ctx.shadowBlur = 10 + 4 * Math.sin(t * .006 + pr.ph);
    circle(-7, -2, 4.5, '#ff3b1f'); circle(7, -2, 4.5, '#ff3b1f'); ctx.shadowBlur = 0;
    ctx.fillStyle = '#1a0a05'; for (let i = -2; i <= 2; i++) ctx.fillRect(i * 4 - 1, 14, 2, 8);
  },
  shotgun() {
    ctx.rotate(-.3);
    ctx.fillStyle = '#2a2a2a'; ctx.fillRect(-36, -5, 50, 4); ctx.fillRect(-36, 0, 50, 4);
    ctx.fillStyle = '#6b4226'; ctx.beginPath(); ctx.moveTo(14, -6); ctx.lineTo(40, -2); ctx.lineTo(42, 12); ctx.lineTo(18, 6); ctx.closePath(); ctx.fill();
    ctx.fillRect(-10, 4, 16, 5);
  },
  barrelp(pr, t) {
    ctx.fillStyle = '#4a5a2a'; rr(-14, -22, 28, 44, 4); ctx.fill();
    ctx.fillStyle = '#7fd04a'; ctx.fillRect(-14, -14, 28, 4); ctx.fillRect(-14, 10, 28, 4);
    ctx.shadowColor = '#7fd04a'; ctx.shadowBlur = 10 + 4 * Math.sin(t * .004);
    ctx.fillStyle = 'rgba(140,255,80,.7)'; ctx.beginPath(); ctx.ellipse(0, -22, 12, 4, 0, 0, PI2); ctx.fill(); ctx.shadowBlur = 0;
  },
  animalmask(pr) {
    ctx.fillStyle = '#f2f2f2'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 22, 0, 0, PI2); ctx.fill();
    ctx.fillStyle = '#e3242b'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-8 + i * 8, -22, 6, 0, PI2); ctx.fill(); }
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(14, -2); ctx.lineTo(28, 2); ctx.lineTo(14, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e3242b'; ctx.beginPath(); ctx.ellipse(14, 12, 4, 6, 0, 0, PI2); ctx.fill();
    circle(6, -6, 3, '#111');
  },
  vhs() {
    ctx.fillStyle = '#141414'; rr(-26, -16, 52, 32, 3); ctx.fill();
    ctx.fillStyle = '#f2f2f2'; ctx.fillRect(-20, -12, 40, 10);
    ctx.fillStyle = '#ff2ad8'; ctx.fillRect(-20, -8, 40, 2);
    ctx.fillStyle = '#2a2a2a'; ctx.fillRect(-16, 2, 32, 10);
    circle(-8, 7, 4, '#f2f2f2'); circle(8, 7, 4, '#f2f2f2');
  },
});

// ---------- the collectibles ----------
Object.assign(TOKENS, {
  savestar(t) { ctx.rotate(t * .002); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 3 : 10; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill(); },
  cash() { ctx.rotate(-.2); ctx.fillStyle = '#5bd75b'; rr(-11, -6, 22, 12, 2); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#1a5a1a'; ctx.font = `700 10px ${DAYS}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 1); },
  vial(t) { ctx.fillStyle = '#4fd1ff'; ctx.beginPath(); ctx.arc(0, 3, 7, 0, PI2); ctx.fill(); ctx.fillRect(-2.5, -9, 5, 8); ctx.shadowBlur = 0; ctx.fillStyle = '#e8e8e8'; ctx.fillRect(-3.5, -11, 7, 3); },
  vhs() { ctx.fillStyle = '#141414'; rr(-10, -7, 20, 14, 2); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#ff2ad8'; ctx.fillRect(-7, -5, 14, 4); circle(-4, 3, 2, '#f2f2f2'); circle(4, 3, 2, '#f2f2f2'); },
});

// ---------- what happens to THE END ----------
Object.assign(GAGS, {
  soul: {
    init(g) { g.say = ''; },
    update(g, T) { g.letters.forEach((l, i) => { if (T > .3 + i * .15) l.tint = '#ffd23f'; }); gcue(g, 'spare', .3, () => [523, 659, 784].forEach((f, i) => tone(f, .25, .08, i * .1, 'square'))); },
    over(g, T, t) {
      // the battle menu pops up above THE END with MERCY picked, then the line types itself out
      const labels = ['БИТЬ', 'ГОВОРИТЬ', 'ВЕЩИ', 'ПОЩАДА'], y = g.top - 50, w = 104, k = clamp((T - .8) / .3, 0, 1);
      if (!k) return;
      ctx.globalAlpha = k;
      const line = '* Ты пощадил титры.', n = Math.floor(clamp((T - 1.3) * 18, 0, line.length));
      ctx.fillStyle = '#ffffff'; ctx.font = `400 18px ${TINY}`; ctx.textAlign = 'left'; ctx.fillText(line.slice(0, n), CX - 2 * w - 6, y - 18);
      labels.forEach((s, i) => {
        const x = CX - 2 * w - 6 + i * (w + 4), sel = i === 3;
        ctx.strokeStyle = sel ? '#ffd23f' : '#ff7a1f'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, 26);
        ctx.fillStyle = sel ? '#ffd23f' : '#ff7a1f'; ctx.font = `400 13px ${TINY}`; ctx.textAlign = 'center'; ctx.fillText(s, x + w / 2 + (sel ? 6 : 0), y + 18);
        if (sel) drawSoul(x + 12, y + 13);
      });
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    },
  },
  cup: {
    init(g) { g.say = ''; },
    update(g, T, dt) {
      if (S.bossC) S.bossC.dead = Math.min(1.5, (S.bossC.dead || 0) + dt * .6);
      g.letters.forEach((l, i) => { l.dy = Math.sin(T * 6 + i) * 6; l.rot = Math.sin(T * 5 + i) * .1; });
      gcue(g, 'ko', .5, () => { noise(.3, .5, 600, 'lowpass'); [392, 523, 659, 784].forEach((f, i) => tone(f, .35, .08, i * .08, 'triangle')); });
    },
    screen(g, T) {
      if (T < .5) return;
      const k = clamp((T - .5) / .25, 0, 1), s = 3 - 2 * ease(k);
      ctx.save(); ctx.translate(CX, H * .48); ctx.scale(s, s); ctx.globalAlpha = k;
      ctx.font = `400 64px ${LOBSTER}`; ctx.textAlign = 'center';
      ctx.fillStyle = '#1a120a'; ctx.fillText('НОКАУТ!', 4, 4); ctx.fillStyle = '#e8432a'; ctx.fillText('НОКАУТ!', 0, 0);
      ctx.restore();
    },
  },
  wanted: {
    init(g) { g.say = ''; },
    update(g, T) {
      const Wd = S.wanted;
      if (Wd) for (let i = 0; i < 5; i++) gcue(g, 'star' + i, .6 + i * .3, () => { Wd.stars = Math.max(0, Wd.stars - 1); tone(880 - i * 60, .12, .06, 0, 'square'); });
      gcue(g, 'done', .4, () => [392, 494, 587, 784].forEach((f, i) => tone(f, .5, .08, i * .12, 'sawtooth')));
    },
    screen(g, T) {
      if (T < .4) return;
      const k = clamp((T - .4) / .4, 0, 1);
      ctx.shadowColor = '#000'; ctx.shadowBlur = 8;
      caption('МИССИЯ ВЫПОЛНЕНА', `400 30px ${SEYMOUR}`, H * .48, '#ffd23f', k);
      caption('+ УВАЖЕНИЕ', `400 16px ${DAYS}`, H * .48 + 30, '#ffffff', k);
      ctx.shadowBlur = 0;
    },
  },
  hell: {
    init(g) { g.say = 'Рви и мечи'; g.sayAt = 2.2; g.saw = g.x0 - 60; },
    update(g, T, dt) {
      if (T < .3) return;
      g.saw += 220 * dt;
      gcue(g, 'rev', .3, () => noise(1.8, .25, 1200, 'bandpass'));
      for (const l of g.letters) { l.h = g.size; if (g.saw > l.x + l.w / 2) l.split = Math.min(1, (l.split || 0) + dt * 2.5); }
      if (Math.random() < .5 && g.saw < g.x1 + 30) S.parts.push({ x: g.saw, y: midY(g), vx: rand(-80, 80), vy: rand(-160, -40), life: .5, t: 0, color: pick(['#ff9a3c', '#ffd23f']), size: 2 });
    },
    over(g, T, t) {
      if (T < .3 || g.saw > g.x1 + 120) return;
      const y = midY(g), j = Math.sin(t * .2) * 1.5;
      ctx.fillStyle = '#c9ced6'; rr(g.saw - 6, y - 5 + j, 70, 10, 5); ctx.fill();
      ctx.fillStyle = '#1a1a1a'; for (let x = 0; x < 70; x += 6) ctx.fillRect(g.saw - 6 + x, y - 7 + j, 3, 2);
      ctx.fillStyle = '#ff7a1f'; rr(g.saw - 44, y - 14 + j, 40, 26, 5); ctx.fill();
    },
  },
  neon: {
    init(g) { g.say = 'Уровень зачищен'; g.sayAt = 1.6; g.sayCol = '#00f0ff'; },
    update(g, T) {
      const cols = ['#ff2ad8', '#00f0ff', '#ffe14d', '#ffffff'];
      g.letters.forEach((l, i) => { l.tint = cols[(i + Math.floor(T * 8)) % cols.length]; l.dx = (Math.random() - .5) * 3; });
      gcue(g, 'beat', .2, () => [0, .25, .5, .75].forEach(w => noise(.08, .4, 120, 'lowpass')));
    },
    screen(g, T) {
      ctx.shadowColor = '#ff2ad8'; ctx.shadowBlur = 16;
      caption(`СЧЁТ ${S.score || 0}`, `400 34px ${PACIFICO}`, g.top - S.camY - 96, '#ffe14d', clamp(T / .4, 0, 1));
      ctx.shadowBlur = 0;
    },
  },
});
