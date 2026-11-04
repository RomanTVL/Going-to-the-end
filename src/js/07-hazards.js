// ---------- hazards: each film throws something of its own ----------
// world hazards live in credit coordinates, screen hazards (screen: true) in frame coordinates
const CREW_COLORS = ['#c51111', '#132ed1', '#117f2d', '#ed54ba', '#ef7d0d', '#f5f557', '#38fedc', '#d6e0f0', '#6b2fbb'];
const TETRO = { I: [[0, 0], [1, 0], [2, 0], [3, 0]], O: [[0, 0], [1, 0], [0, 1], [1, 1]], T: [[0, 0], [1, 0], [2, 0], [1, 1]], S: [[1, 0], [2, 0], [0, 1], [1, 1]], Z: [[0, 0], [1, 0], [1, 1], [2, 1]], J: [[0, 0], [0, 1], [1, 1], [2, 1]], L: [[2, 0], [0, 1], [1, 1], [2, 1]] };
const TCOL = { I: '#00e5ff', O: '#ffd400', T: '#b44cff', S: '#3ddc4a', Z: '#ff3b3b', J: '#2f6bff', L: '#ff9a1f' };
const CELL = 18;
const progress = () => LV.rise ? riseProgress() : clamp(S.camY / (endTop || 1), 0, 1);
const solid = q => !q.gone && !q.off && !(q.dust > 0) && (!q.world || q.world === S.world);
const dotWorld = () => ({ x: S.p.x + PW / 2, y: S.p.y + PH / 2 });
const dotScreen = () => ({ x: S.p.x + PW / 2, y: S.p.y + PH / 2 - S.camY });
function platformsAhead(minDy, filter) {
  const p = S.p;
  return plats.filter(q => solid(q) && !q.end && !q.blink && !q.fragile && !q.block && q.top > p.y + minDy && q.top < S.camY + H - 50 && filter(q));
}

const HZ = {
  bullet: {
    every: 1.0,
    spawn() {
      const d = dotWorld(), fromL = Math.random() < .5;
      const one = (left, y, warn) => S.hz.push({ type: 'bullet', x: left ? -40 : W + 40, y, vx: left ? 660 : -660, warn, t: 0 });
      one(fromL, d.y + pick([0, 0, -42, 42]), .8);
      // sometimes a second shot from the other side, a beat later
      if (Math.random() < .4) one(!fromL, d.y + pick([-46, 46]), 1.05);
    },
    step(h, dt) { if (h.live) h.x += h.vx * dt; },
    onLive() { noise(.09, .4, 1200); },
    hit: (h, d) => h.live && Math.abs(d.y - h.y) < 10 && Math.abs(d.x - h.x) < 22,
    dead: h => h.live && (h.x < -160 || h.x > W + 160),
    why: 'Тебя застрелили',
  },
  nail: {
    every: 1.05,
    spawn() {
      const d = dotWorld();
      S.hz.push({ type: 'nail', x: clamp(d.x + rand(-55, 55), 18, W - 18), y: 0, vy: 160, warn: .75, t: 0 });
      if (progress() > .4 && Math.random() < .35) S.hz.push({ type: 'nail', x: clamp(d.x + pick([-90, 90]), 18, W - 18), y: 0, vy: 160, warn: .95, t: 0 });
    },
    onLive(h) { h.y = S.camY - 50; tone(1760, .25, .05); },
    step(h, dt) { if (h.live) { h.vy += 1700 * dt; h.y += h.vy * dt; } },
    hit: (h, d) => h.live && Math.abs(d.x - h.x) < 11 && d.y > h.y - 92 && d.y < h.y + 6,
    dead: h => h.live && h.y > S.camY + H + 140,
    why: 'Гвоздь достал тебя',
  },
  meteor: {
    every: 1.0,
    spawn() {
      const d = dotWorld(), fromL = Math.random() < .5, sx = fromL ? -30 : W + 30, sy = S.camY + rand(10, 140);
      const tx = d.x + rand(-20, 20), ty = d.y, len = Math.hypot(tx - sx, ty - sy) || 1, v = rand(290, 360);
      S.hz.push({ type: 'meteor', x: sx, y: sy, vx: (tx - sx) / len * v, vy: (ty - sy) / len * v, warn: .7, t: 0, r: rand(15, 22), spin: rand(-3, 3) });
    },
    onLive() { noise(.5, .18, 400, 'lowpass'); },
    step(h, dt) { if (h.live) { h.x += h.vx * dt; h.y += h.vy * dt; } },
    hit: (h, d) => h.live && Math.hypot(d.x - h.x, d.y - h.y) < h.r + 4,
    dead: h => h.live && (h.x < -100 || h.x > W + 100 || h.y > S.camY + H + 100),
    why: 'В тебя попал метеорит',
  },
  walker: {
    every: 1.5,
    spawn() {
      if (S.hz.filter(h => h.type === 'walker' && h.alive).length >= 5) return;
      const taken = new Set(S.hz.filter(h => h.type === 'walker').map(h => h.pl));
      const c = platformsAhead(50, q => q.w >= 44 && !taken.has(q));
      if (!c.length) return;
      const pl = pick(c);
      S.hz.push({ type: 'walker', pl, rx: rand(0, pl.w - 20), dir: pick([-1, 1]), alive: true, sq: 0, warn: 0, t: 0, live: true });
    },
    step(h, dt) {
      if (!h.alive) { h.sq += dt; return; }
      if (h.pl.gone) { h.alive = false; return; }
      h.rx += h.dir * 48 * dt;
      if (h.rx < 0) { h.rx = 0; h.dir = 1; }
      if (h.rx > h.pl.w - 20) { h.rx = h.pl.w - 20; h.dir = -1; }
    },
    // landing on a mushroom squashes it, walking into one does not end well
    hit(h) {
      if (!h.alive) return false;
      const p = S.p, wx = h.pl.x + h.rx, wt = h.pl.top - 18;
      if (p.x + PW < wx + 2 || p.x > wx + 18 || p.y + PH < wt || p.y > h.pl.top) return false;
      if (p.vy > 0 && S.prevBottom <= wt + 8) {
        h.alive = false; p.vy = -JUMP * .62; p.ground = null; p.coyote = 0;
        sweep(400, 900, .15, .08); burst(wx + 10, wt + 6, 8, '#8b4a22', 110, 3); feat('stomp');
        return false;
      }
      return true;
    },
    dead: h => !h.alive && h.sq > .5 || h.pl.top < S.camY - 60,
    why: 'Гриб оказался сильнее',
  },
  creeper: {
    every: 1.7,
    spawn() {
      if (S.hz.filter(h => h.type === 'creeper').length >= 3) return;
      const c = platformsAhead(70, q => q.w >= 26);
      if (!c.length) return;
      const pl = pick(c);
      S.hz.push({ type: 'creeper', pl, rx: rand(2, pl.w - 20), state: 'idle', t: 0, warn: 0, live: true });
    },
    step(h) {
      h.x = h.pl.x + h.rx + 9; h.y = h.pl.top - 15;
      if (h.state === 'idle') {
        const d = dotWorld();
        if (Math.hypot(d.x - h.x, d.y - h.y) < 80) { h.state = 'hiss'; h.t = 0; noise(.9, .12, 3000); }
      } else if (h.state === 'hiss' && h.t > .95) {
        h.state = 'boom'; h.t = 0;
        noise(.9, .7, 500, 'lowpass'); noise(.3, .4, 2000);
        S.shake = .35;
        for (const q of plats) {
          if (q.end || q.gone) continue;
          const nx = clamp(h.x, q.x, q.x + q.w), ny = clamp(h.y, q.top, q.base);
          if (Math.hypot(nx - h.x, ny - h.y) < 66) { q.gone = true; if (S.p.ground === q) S.p.ground = null; }
        }
        burst(h.x, h.y, 26, '#5bd75b', 260, 4); burst(h.x, h.y, 16, '#cfcfcf', 200, 5);
        const d = dotWorld();
        if (S.mode === 'play' && Math.hypot(d.x - h.x, d.y - h.y) < 86) h.kill = true;
      }
    },
    hit: h => h.kill,
    dead: h => h.state === 'boom' && h.t > .5 || h.state === 'idle' && (h.pl.gone || h.pl.top < S.camY - 60),
    why: 'Крипер взорвался рядом',
  },
  bludger: {
    every: 2.0, screen: true,
    spawn() {
      const limit = 1 + Math.floor(progress() * 2.4);
      if (S.hz.filter(h => h.type === 'bludger').length >= limit) return;
      const v = rand(200, 250), a = rand(.5, 1.1) * (Math.random() < .5 ? 1 : -1);
      S.hz.push({ type: 'bludger', screen: true, x: rand(60, W - 60), y: 40, vx: Math.sin(a) * v, vy: Math.cos(a) * v, r: 15, warn: .9, t: 0 });
    },
    step(h, dt) {
      if (!h.live) return;
      h.x += h.vx * dt; h.y += h.vy * dt;
      let bounced = false;
      if (h.x < h.r) { h.x = h.r; h.vx = Math.abs(h.vx); bounced = true; }
      if (h.x > W - h.r) { h.x = W - h.r; h.vx = -Math.abs(h.vx); bounced = true; }
      if (h.y < h.r) { h.y = h.r; h.vy = Math.abs(h.vy); bounced = true; }
      if (h.y > H - h.r) { h.y = H - h.r; h.vy = -Math.abs(h.vy); bounced = true; }
      if (bounced) { noise(.06, .12, 600, 'lowpass'); h.vx *= 1.03; h.vy *= 1.03; }
    },
    hit: (h, d) => h.live && Math.hypot(d.x - h.x, d.y - h.y) < h.r + 5,
    dead: () => false,
    why: 'Бладжер не промахнулся',
  },
  chaser: {
    every: .5, screen: true,
    spawn() {
      if (S.hz.some(h => h.type === 'chaser')) return;
      const d = dotScreen(), x = d.x < CX ? W - 40 : 40, y = d.y < H / 2 ? H - 60 : 60;
      S.hz.push({ type: 'chaser', screen: true, x, y, ang: 0, warn: 1.1, t: 0, waka: 0 });
    },
    step(h, dt) {
      if (!h.live) return;
      const d = dotScreen(), dx = d.x - h.x, dy = d.y - h.y, len = Math.hypot(dx, dy) || 1;
      // it starts slow after every take and speeds up the longer it hunts
      const v = 52 + 42 * progress() + 2.5 * Math.min(h.t, 16);
      h.x += dx / len * v * dt; h.y += dy / len * v * dt; h.ang = Math.atan2(dy, dx);
      h.waka -= dt;
      if (h.waka <= 0) { h.waka = .3; sweep(h.flip ? 300 : 500, h.flip ? 500 : 300, .12, .05); h.flip = !h.flip; }
    },
    hit: (h, d) => h.live && Math.hypot(d.x - h.x, d.y - h.y) < 19,
    dead: () => false,
    why: 'Тебя съел обжора',
  },
  crew: {
    every: 1.3,
    spawn() {
      if (S.hz.filter(h => h.type === 'crew' && h.alive).length >= 5) return;
      const taken = new Set(S.hz.filter(h => h.type === 'crew').map(h => h.pl));
      const c = platformsAhead(50, q => q.w >= 40 && !taken.has(q));
      if (!c.length) return;
      const pl = pick(c);
      S.hz.push({ type: 'crew', pl, rx: rand(0, pl.w - 18), dir: pick([-1, 1]), imp: Math.random() < .38, col: pick(CREW_COLORS), flick: rand(.4, 1.4), alive: true, sq: 0, warn: 0, t: 0, live: true });
    },
    step(h, dt) {
      if (!h.alive) { h.sq += dt; return; }
      if (h.pl.gone) { h.alive = false; return; }
      h.rx += h.dir * 38 * dt;
      if (h.rx < 0) { h.rx = 0; h.dir = 1; }
      if (h.rx > h.pl.w - 18) { h.rx = h.pl.w - 18; h.dir = -1; }
      h.flick -= dt;
      if (h.flick < -.22) h.flick = rand(.8, 1.6);
    },
    // jump on anyone and they fly off; walk into the impostor and it is over
    hit(h) {
      if (!h.alive) return false;
      const p = S.p, wx = h.pl.x + h.rx, wt = h.pl.top - 22;
      if (p.x + PW < wx + 2 || p.x > wx + 16 || p.y + PH < wt || p.y > h.pl.top) return false;
      if (p.vy > 0 && S.prevBottom <= wt + 8) {
        h.alive = false; p.vy = -JUMP * .62; p.ground = null; p.coyote = 0;
        sweep(600, 200, .3, .08, 'triangle');
        S.floaters.push({ x: wx + 8, y: wt - 6, t: 0, text: h.imp ? 'был предателем' : 'не был предателем', col: h.imp ? CUT : '#9fe3ff' });
        feat('eject', h.imp);
        return false;
      }
      return h.imp;
    },
    dead: h => !h.alive && h.sq > .8 || h.pl.top < S.camY - 60,
    why: 'Тебя убил предатель',
  },
  tetro: {
    every: 1.45,
    spawn() {
      const d = dotWorld(), k = pick(Object.keys(TETRO)), cells = TETRO[k];
      const w = (Math.max(...cells.map(c => c[0])) + 1) * CELL;
      const x = clamp(Math.round((d.x + rand(-60, 60) - w / 2) / CELL) * CELL, 8, W - 8 - w);
      S.hz.push({ type: 'tetro', k, cells, x, y: 0, warn: .8, t: 0 });
    },
    onLive(h) { h.y = S.camY - 80; },
    step(h, dt) {
      if (!h.live || h.locked) return;
      const ny = h.y + 290 * dt;
      // lock onto the first word or block one of the cells lands on
      let lockY = null;
      for (const [cx, cy] of h.cells) {
        const x0 = h.x + cx * CELL, x1 = x0 + CELL, b0 = h.y + (cy + 1) * CELL, b1 = ny + (cy + 1) * CELL;
        for (const q of plats) {
          if (!solid(q) || x1 <= q.x || x0 >= q.x + q.w) continue;
          if (q.top >= b0 - .5 && q.top <= b1) { const y = q.top - (cy + 1) * CELL; if (lockY === null || y < lockY) lockY = y; }
        }
      }
      if (lockY === null) { h.y = ny; return; }
      h.y = lockY; h.locked = true;
      for (const [cx, cy] of h.cells) {
        const x = h.x + cx * CELL;
        plats.push({ text: '', font: '', size: CELL, x, bx: x, dx: 0, w: CELL, base: h.y + (cy + 1) * CELL, top: h.y + cy * CELL, color: TCOL[h.k], block: TCOL[h.k], hold: 0, gone: false, goneT: 0, off: false });
      }
      noise(.12, .35, 500, 'lowpass');
    },
    hit: (h, d) => h.live && !h.locked && h.cells.some(([cx, cy]) => d.x > h.x + cx * CELL - 4 && d.x < h.x + (cx + 1) * CELL + 4 && d.y > h.y + cy * CELL - 4 && d.y < h.y + (cy + 1) * CELL + 4),
    dead: h => h.locked || h.live && h.y > S.camY + H + 80,
    why: 'Тебя придавило фигурой',
  },
  host: {
    every: 2.6,
    spawn() {
      if (S.hz.filter(h => h.type === 'host').length >= 2) return;
      const c = platformsAhead(150, q => q.w >= 28);
      if (!c.length) return;
      const pl = pick(c);
      S.hz.push({ type: 'host', pl, rx: rand(4, pl.w - 22), t: 0, warn: 0, live: true, cd: rand(1.2, 1.8) });
    },
    step(h, dt) {
      h.x = h.pl.x + h.rx + 9; h.y = h.pl.top;
      h.cd -= dt;
      if (h.cd <= 0) {
        // a cross of tears: up, down, left and right
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, -1], [0, 1]]) S.hz.push({ type: 'tear', x: h.x, y: h.y - 14, vx: dx * 150, vy: dy * 150, r: 7, t: 0, warn: 0, live: true });
        h.cd = rand(2.8, 3.4) * (1 - .15 * progress());
        sweep(500, 180, .2, .07, 'triangle');
      }
    },
    hit: (h, d) => Math.abs(d.x - h.x) < 9 && d.y > h.y - 18 && d.y < h.y + 2,
    dead: h => h.pl.gone || h.pl.top < S.camY - 60,
    why: 'Череп оказался ближе, чем казалось',
  },
  tear: {
    step(h, dt) { h.x += h.vx * dt; h.y += h.vy * dt; },
    hit: (h, d) => Math.hypot(d.x - h.x, d.y - h.y) < h.r + 4,
    dead: h => h.t > 1.2,
    why: 'Тебя залили слезами',
  },
  leviathan: {
    every: 5.2, screen: true,
    spawn() {
      if (S.hz.some(h => h.type === 'leviathan')) return;
      const fromL = Math.random() < .5, d = dotScreen();
      S.hz.push({ type: 'leviathan', screen: true, fromL, x: fromL ? -80 : W + 80, y: clamp(d.y + rand(-40, 40), 90, H - 90), vx: fromL ? 450 : -450, warn: 1.5, t: 0, len: 380, pts: [] });
      // the roar comes first, the leviathan after
      sweep(90, 45, 1.4, .18, 'sawtooth'); noise(1.2, .2, 300, 'lowpass');
    },
    step(h, dt) {
      if (!h.live) return;
      h.x += h.vx * dt;
      leviathanPts(h);
    },
    hit: (h, d) => h.live && h.pts.some(([x, y, r]) => Math.hypot(d.x - x, d.y - y) < r * .8 + 4),
    dead: h => h.live && (h.fromL ? h.x - h.len > W + 60 : h.x + h.len < -60),
    why: 'Тебя проглотил левиафан',
  },
  code: {
    every: .95, screen: true,
    spawn() {
      const d = dotScreen();
      S.hz.push({ type: 'code', screen: true, x: clamp(Math.round((d.x + rand(-26, 26)) / 15) * 15 + 4, 12, W - 12), y: -20, warn: .85, t: 0, seed: Math.floor(rand(0, 99)) });
    },
    onLive() { sweep(1800, 200, .5, .05, 'sawtooth'); },
    step(h, dt) { if (h.live) h.y += 980 * dt; },
    hit: (h, d) => h.live && Math.abs(d.x - h.x) < 12 && d.y < h.y + 6 && d.y > h.y - 260,
    dead: h => h.live && h.y - 260 > H,
    why: 'Тебя стёр код',
  },
};

// the doll at the end of the field: move only while she sings
function greenLight() { S.rl = { phase: 'green', t: 0, dur: rand(2.8, 4) }; [392, 392, 440, 392, 523.3, 494].forEach((f, i) => tone(f, .25, .06, i * .17, 'triangle')); }
function updateRedLight(dt) {
  const R = S.rl;
  R.t += dt;
  if (R.phase === 'green' && R.t > R.dur) { R.phase = 'turn'; R.t = 0; tone(880, .15, .1, 0, 'square'); tone(880, .15, .1, .2, 'square'); }
  else if (R.phase === 'turn' && R.t > .55) { R.phase = 'red'; R.t = 0; R.dur = rand(1, 1.5) * (1 + .2 * progress()); }
  else if (R.phase === 'red') {
    const p = S.p, moved = Math.abs(p.vx) > 14 || !p.ground || keys.left || keys.right || p.buffer > 0;
    if (R.t > .15 && moved && S.mode === 'play') { noise(.12, .5, 900); noise(.6, .3, 300, 'lowpass'); cut('Выбыл: ты пошевелился'); return; }
    if (R.t > R.dur) greenLight();
  }
}


// the double walks your own path a second behind you: stand still and you meet yourself
function updateDouble() {
  const d = dotWorld(), D = 1.35 - .35 * progress();
  S.trace.push({ t: S.time, x: d.x, y: d.y });
  while (S.trace.length > 2 && S.trace[1].t <= S.time - D) S.trace.shift();
  S.twin = S.time - S.since >= D ? S.trace[0] : null;
  if (S.twin && Math.hypot(S.twin.x - d.x, S.twin.y - d.y) < 8) cut('Ты встретил себя');
}

// air runs out under water; bubbles rising from the bottom of the frame refill it
function updateOxygen(dt) {
  S.oxy -= (5.5 + 2.5 * progress()) * dt;
  S.bubT -= dt;
  if (S.bubT <= 0) { S.bubT = rand(.6, 1.1); S.bubbles.push({ x: rand(30, W - 30), y: H + 20, r: rand(9, 13), ph: rand(0, 6) }); }
  for (const b of S.bubbles) { b.y -= 75 * dt; b.x += Math.sin(b.y * .03 + b.ph) * .7; }
  const d = dotScreen();
  S.bubbles = S.bubbles.filter(b => {
    if (Math.hypot(b.x - d.x, b.y - d.y) < b.r + 7) {
      S.oxy = Math.min(100, S.oxy + 36);
      tone(988, .18, .07); tone(1318, .2, .05, .06);
      burst(b.x, b.y + S.camY, 8, '#bfefff', 90, 3);
      return false;
    }
    return b.y > -30;
  });
  S.beep -= dt;
  if (S.oxy < 30 && S.beep <= 0) { S.beep = .8; tone(1046, .12, .08, 0, 'square'); }
  if (S.oxy <= 0) cut('Кончился кислород');
}

// the upside-down: every few seconds the world flips, and words of the other world stop holding you
function updateFlip(dt) {
  S.flipT -= dt;
  if (S.flipT < .8 && !S.flipWarn) { S.flipWarn = true; tone(1046, .1, .06, 0, 'square'); tone(1046, .1, .06, .2, 'square'); tone(1046, .1, .06, .4, 'square'); }
  if (S.flipT <= 0) {
    S.world = S.world === 'a' ? 'b' : 'a'; S.flipWarn = false;
    S.flipT = rand(3.2, 4.2) * (1 - .15 * progress());
    sweep(S.world === 'b' ? 300 : 120, S.world === 'b' ? 80 : 300, .5, .08, 'sawtooth'); S.shake = .25;
    if (S.p.ground && !solid(S.p.ground)) S.p.ground = null;
  }
}

// the dinosaur park: the ground shakes before every stomp, and the jaw at the top bites now and then
function jawDepth() { const L = S.rex.lunge; return L > 0 ? 130 * Math.sin(clamp((.6 - L) / .6, 0, 1) * Math.PI) : 0; }
function updateRex(dt) {
  const R = S.rex, p = S.p;
  R.next -= dt;
  if (R.next < .6 && !R.warn) { R.warn = 1; noise(.4, .3, 120, 'lowpass'); }
  if (R.next <= 0) {
    R.warn = 0; R.n++;
    R.next = rand(2.3, 3.2) * (1 - .2 * progress());
    noise(.5, .7, 90, 'lowpass'); S.shake = .4;
    if (p.ground) { p.vy = -380; p.ground = null; }
    for (const q of plats) if (q.fragile && !q.gone && q.top - S.camY > 0 && q.top - S.camY < H) q.hold += .25;
    if (R.n % 3 === 0) { R.lungeAt = 1; sweep(140, 50, 1, .2, 'sawtooth'); }
  }
  if (R.lungeAt > 0) { R.lungeAt -= dt; if (R.lungeAt <= 0) R.lunge = .6; }
  if (R.lunge > 0) R.lunge -= dt;
}

// the night shift: a torch around the dot, and robots that only move in the dark
function freshNight() { return { off: 0, nextOff: rand(4, 6), bots: [{ x: 30, y: H - 40 }, { x: W - 30, y: 40 }], third: false, flick: 0 }; }
function torchR() { const N = S.night; return N.off > 0 ? 34 : 128 - (N.nextOff < .7 && Math.random() < .5 ? 60 : 0); }
function updateNight(dt) {
  const N = S.night;
  if (S.mode === 'clear') { N.off = 0; return; }
  N.nextOff -= dt;
  if (N.nextOff < .7 && N.nextOff > 0 && Math.random() < .2) noise(.05, .08, 4000);
  if (N.nextOff <= 0) { N.off = .7; N.nextOff = rand(4.5, 6.5) * (1 - .15 * progress()); noise(.3, .3, 200, 'lowpass'); }
  if (N.off > 0) N.off -= dt;
  if (!N.third && progress() > .5) { N.third = true; N.bots.push({ x: W - 30, y: H - 40 }); }
  const d = dotScreen(), r = torchR(), v = 62 + 30 * progress();
  for (const b of N.bots) {
    const dist = Math.hypot(d.x - b.x, d.y - b.y);
    b.lit = dist < r * .95;
    // in the dark they come closer; caught in the torch they back away
    const sp = b.lit ? -32 : v;
    b.x = clamp(b.x + (d.x - b.x) / dist * sp * dt, 10, W - 10); b.y = clamp(b.y + (d.y - b.y) / dist * sp * dt, 10, H - 10);
    if (dist < 17) { S.jump = 1; cut('Тебя поймал аниматроник'); return; }
  }
}

// the snap: half of the words on screen turn to dust and come back a few seconds later
function updateSnap(dt) {
  S.snapT -= dt;
  if (S.snapT < .9 && !S.snapWarn) { S.snapWarn = true; tone(392, .5, .06, 0, 'sine'); tone(523, .5, .06, .25, 'sine'); }
  if (S.snapT <= 0) {
    S.snapWarn = false; S.snapT = rand(3.8, 5) * (1 - .15 * progress());
    noise(.08, .6, 2500); noise(.6, .2, 400, 'lowpass');
    const vis = plats.filter(q => !q.end && !q.glow && !q.gone && !(q.dust > 0) && q.base - S.camY > 0 && q.top - S.camY < H && checkpoints.every(c => c.top !== q.top));
    for (const q of vis) if (Math.random() < .5) {
      q.dust = 3.2;
      for (let i = 0; i < 10; i++) S.parts.push({ x: q.x + Math.random() * q.w, y: q.top + Math.random() * (q.base - q.top), vx: rand(20, 90), vy: rand(-30, 10), life: rand(.8, 1.6), t: 0, color: pick(['#8a6a52', '#6b5040', '#b49478']), size: 2 });
      if (S.p.ground === q) S.p.ground = null;
    }
  }
}

function updateHazards(dt) {
  if (LV.sections && S.mode === 'play') sectionTick(dt);
  const type = LV.hazard, H_ = HZ[type];
  if (S.mode === 'play' && type === 'redlight') updateRedLight(dt);
  if (S.mode === 'play' && type === 'water') S.water = Math.min(330, S.water + (7 + 11 * progress()) * dt);
  if (S.mode === 'play' && type === 'double') { updateDouble(); if (S.mode !== 'play') return; }
  if (S.mode === 'play' && LV.oxygen) { updateOxygen(dt); if (S.mode !== 'play') return; }
  if (S.mode === 'play' && type === 'flip') updateFlip(dt);
  if (S.mode === 'play' && type === 'rex') updateRex(dt);
  if ((S.mode === 'play' || S.mode === 'clear') && type === 'dark') { updateNight(dt); if (S.mode === 'cut') return; }
  if (S.mode === 'play' && type === 'snap') updateSnap(dt);
  if (type === 'snap') for (const q of plats) if (q.dust > 0) { q.dust -= dt; if (q.dust <= 0) { q.dust = 0; q.back = .5; } } else if (q.back > 0) q.back -= dt;
  if (S.mode === 'play') { mech('update', dt); if (S.mode !== 'play') return; }
  if (!H_ || !H_.spawn) return;
  if (S.mode === 'play') {
    S.hzT -= dt;
    if (S.time > 1.8 && S.hzT <= 0) {
      H_.spawn();
      S.hzT = H_.every * (1 - .42 * progress()) * (1 - .015 * S.li) + Math.random() * .35;
    }
  }
  for (const h of S.hz) {
    h.t += dt;
    if (!h.live && h.t >= h.warn) { h.live = true; if (HZ[h.type].onLive) HZ[h.type].onLive(h); }
    HZ[h.type].step(h, dt);
  }
  if (S.mode === 'play') {
    const dw = dotWorld(), ds = dotScreen();
    for (const h of S.hz) if (HZ[h.type].hit(h, h.screen ? ds : dw)) { cut(HZ[h.type].why); return; }
  }
  S.hz = S.hz.filter(h => h.t < 30 && !HZ[h.type].dead(h));
}
