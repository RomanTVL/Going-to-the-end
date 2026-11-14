// ---------- the secret films: every film at once, and the ascent back to the beginning ----------

const isExtra = key => { const L = LEVELS.find(L => L.key === key); return L && L.extra; };
function startExtra(key) {
  RUN = freshRun('special');
  if (CHEAT.on) RUN.cheat = true;
  reelChange(() => startLevel(LEVELS.findIndex(L => L.key === key), 'intro'));
}

// ===== every film at once: the look and the danger follow the section the dot is in =====
const LOOK = ['pal', 'back', 'props', 'starKind', 'sound', 'hazard', 'grav', 'jump', 'fall', 'swim', 'oxygen', 'wobble', 'sepia', 'chroma', 'soulHeart', 'deathTitle', 'deathFont', 'deathCol', 'speed'];
const lookOf = L => Object.fromEntries(LOOK.map(k => [k, L[k]]));
for (const L of LEVELS) if (L.sections) L.base = lookOf(L);

function enterSection(i, splice) {
  Object.assign(LV, i >= 0 ? lookOf(sections[i].L) : LV.base);
  S.sec = i;
  // a fresh danger for the new film; nothing carries over from the last one
  S.hz = []; S.hzT = 1.2; S.water = 50; S.trace = []; S.since = S.time; S.twin = null; S.oxy = 100; S.bubbles = [];
  S.world = 'a'; S.flipT = 3.4; S.rex = { next: 2.6, n: 0, warn: 0, lungeAt: 0, lunge: 0 }; S.night = freshNight(); S.snapT = 4;
  S.amb = makeAmbient();
  mech('reset');
  if (LV.hazard === 'redlight') greenLight();
  if (splice) { S.splice = .4; noise(.12, .3, 3200); }
  hud();
}
// sections only move forward, so a jump back over the border does not swap the film back
function sectionTick(dt) {
  S.splice = Math.max(0, (S.splice || 0) - dt);
  const y = S.p.y + PH;
  let i = -1;
  for (let k = 0; k < sections.length; k++) if (y >= sections[k].top) i = k;
  if (S.sec === null || S.sec === undefined) enterSection(i, false);
  else if (i > S.sec) enterSection(i, true);
}
// a splice going through the gate: a white frame, a strip of tape, a jolt
function drawSplice() {
  const k = S.splice / .4;
  ctx.fillStyle = `rgba(255,248,232,${.55 * k * k})`; ctx.fillRect(0, 0, W, H);
  const y = H * (1 - k) - 20;
  ctx.fillStyle = `rgba(255,250,240,${.5 * k})`; ctx.fillRect(0, y, W, 16);
  ctx.fillStyle = `rgba(0,0,0,${.6 * k})`; ctx.fillRect(0, y + 16, W, 3);
}

// THE END of the secret session: the letters flick through every film's type and colour
GAGS.mix = {
  init(g) { g.say = ''; g.films = LEVELS.filter(L => !L.final && !L.extra); },
  update(g, T) {
    const n = g.films.length, i = Math.floor(T * 7);
    if (i < n) {
      const L = g.films[i];
      g.letters.forEach(l => { l.font = L.fonts.end[0].replace(/\d+px/, `${Math.round(l.h * .95)}px`); l.tint = L.pal.accent; l.dy = Math.sin(T * 9 + l.x) * 3; });
      gcue(g, 'f' + i, 0, () => tone(LV.sound.base * Math.pow(2, (i % 12) / 12), .12, .05, 0, L.sound.wave));
    } else {
      g.letters.forEach(l => { l.font = l.font0 || l.font; l.tint = null; l.dy *= .9; });
      gcue(g, 'done', 0, () => [523.3, 659.3, 784, 1046.5].forEach((f, k) => tone(f, 1.4, .07, k * .09)));
    }
  },
  screen(g, T) {
    if (T < 3.6) return;
    const k = clamp((T - 3.6) / .6, 0, 1);
    caption('Весь вечер — за один сеанс', `italic 600 26px ${SERIF}`, g.top - S.camY - 46, '#efe8dc', k);
  },
};

function finishSpecial(r) {
  if (LV.key === 'mix') {
    if (!RUN.cheat) store.set('gtte-mix-done', '1');
    award('secret');
    S.mode = 'clear'; S.modeT = 0; S.gag = makeGag();
    for (const l of S.gag.letters) l.font0 = l.font;
    [392, 523.3, 659.3, 784].forEach((f, i) => tone(f, 1.6, .08, i * .1));
  } else {
    if (!RUN.cheat) store.set('gtte-rise-done', '1');
    award('rise');
    S.mode = 'ending'; S.modeT = 0; S.ending = 'rise';
    S.endDot = { x: S.p.x + PW / 2, y: S.p.y + PH / 2 - S.camY };
    S.riseRes = r;
  }
}
function drawExtraClear() {
  const T = S.modeT, r = RUN.res[S.li];
  if (T < 4.4 || !r) return;
  const k = clamp((T - 4.4) / .8, 0, 1);
  ctx.fillStyle = `rgba(6,5,8,${.86 * k})`; rr(28, H * .1, W - 56, 170, 10); ctx.fill();
  caption('СЕКРЕТНЫЙ СЕАНС ПРОЙДЕН', `500 12px ${MONO}`, H * .1 + 36, '#ffd23f', k);
  caption(fmt(r.t), `600 52px ${SERIF}`, H * .1 + 92, '#efe8dc', k);
  caption(Tf('{0} {1} · ★ {2} / {3}', r.takes - 1, plural(r.takes - 1, 'ДУБЛЬ', 'ДУБЛЯ', 'ДУБЛЕЙ'), r.got, r.total), `500 12px ${MONO}`, H * .1 + 122, '#efe8dc', k);
  caption('ОТКРЫТО: ВОСХОЖДЕНИЕ', `500 12px ${MONO}`, H * .1 + 150, CUT, k);
  if (T > 5.4) caption('ПРОБЕЛ — В МЕНЮ', `500 11px ${MONO}`, H - 30, '#a59d92', k);
}

// ===== the ascent =====
// the level is laid out top down as usual; then THE END at the bottom becomes the start
// and the title at the top becomes the goal, and the checkpoints count upwards
function riseLayout() {
  const start = plats.filter(q => q.end), title = plats.filter(q => q.glow && !q.end && q.top < checkpoints[0].top + 2);
  for (const q of start) { q.end = false; q.start = true; }
  for (const q of title) q.end = true;
  endTop = Math.min(...title.map(q => q.top));
  const startTop = Math.min(...start.map(q => q.top));
  // a line that is the only way up must not be thrown down at you
  const perRow = new Map();
  for (const q of plats) perRow.set(q.base, (perRow.get(q.base) || 0) + 1);
  for (const q of plats) q.solo = perRow.get(q.base) === 1;
  checkpoints.shift();
  checkpoints.reverse();
  // the dot starts on THE, not in the gap between the two words
  checkpoints.unshift({ name: 'THE END', top: startTop, x: start[0].x + start[0].w / 2 });
}
const riseProgress = () => { const a = checkpoints[0].top, b = endTop; return clamp((a - (S.p.y + PH)) / ((a - b) || 1), 0, 1); };

MECH.rise = {
  hint: 'вверх! снизу поднимается лава',
  frozen: () => true,
  reset() {
    const cp = checkpoints[S.cp];
    S.camY = cp.top - H * .62;
    S.lava = cp.top + 230;
    // the words above the checkpoint are back, the ones below are already lava
    for (const pl of plats) if (pl.top <= cp.top + 1) { pl.gone = false; pl.hold = 0; pl.goneT = 0; pl.crack = 0; pl.regrow = 0; }
    S.rumble = 0;
  },
  update(dt) {
    const p = S.p, prog = riseProgress();
    // the camera keeps the dot low in the frame, so the way up is in view
    const target = p.y - H * .6, top = p.y - S.camY < H * .3 ? 6 : 3;
    S.camY += (target - S.camY) * Math.min(1, top * dt);
    // the lava never lags far behind
    const gap = S.lava - (p.y + PH);
    S.lava -= (24 + 22 * prog) * (gap > H * .36 ? 3 : 1) * dt;
    if (p.y + PH > S.lava - 2) { cut('Тебя догнала лава'); return; }
    // everything you stand on gives way
    const g = p.ground;
    if (g && !g.start && !g.end) {
      g.crack = (g.crack || 0) + dt;
      if (g.crack > .75) { g.gone = true; g.regrow = 2.4; p.ground = null; noise(.2, .22, 700, 'lowpass'); burst(p.x + PW / 2, g.top, 6, '#7a5a48', 90, 2.5); }
    }
    // a fallen line comes back a little later, so the way up never closes for good
    for (const pl of plats) {
      if (pl.back > 0) pl.back = Math.max(0, pl.back - dt);
      if (pl.regrow > 0 && (pl.regrow -= dt) <= 0) { pl.gone = false; pl.goneT = 0; pl.crack = 0; pl.back = .5; }
    }
    S.rumble -= dt;
    if (S.rumble <= 0) { S.rumble = rand(2.5, 4); S.shake = .25; noise(.6, .18, 120, 'lowpass'); }
  },
  draw(t) {
    const y = S.lava - S.camY;
    if (y > H + 40) return;
    // the glow climbs ahead of the lava
    const glow = ctx.createLinearGradient(0, y - 220, 0, y);
    glow.addColorStop(0, 'rgba(255,90,20,0)'); glow.addColorStop(1, 'rgba(255,90,20,.35)');
    ctx.fillStyle = glow; ctx.fillRect(0, y - 220, W, 220);
    const g = ctx.createLinearGradient(0, y, 0, y + 160);
    g.addColorStop(0, '#ffd23f'); g.addColorStop(.08, '#ff7a1f'); g.addColorStop(.4, '#c22a08'); g.addColorStop(1, '#3a0802');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 12) ctx.lineTo(x, y + Math.sin(x * .03 + t * .004) * 4 + Math.sin(x * .011 - t * .002) * 3);
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    // bubbles that pop on the surface
    for (let i = 0; i < 9; i++) {
      const ph = (t * .0006 + i * .37) % 1, bx = (i * 61 + 30) % W;
      circle(bx, y + 6 + (1 - ph) * 30, 3 + 3 * ph, `rgba(255,220,120,${.7 * (1 - ph)})`);
    }
  },
};

Object.assign(HZ, {
  // the ascent throws two things down at you: a credit line from above, or a chunk of the frame
  rise: {
    every: 2.1,
    spawn() {
      const p = S.p;
      const above = plats.filter(q => solid(q) && !q.end && !q.start && !q.glow && !q.solo && q.top < p.y - 60 && q.top > S.camY + 20);
      if (above.length && Math.random() < .55) {
        const q = pick(above);
        S.hz.push({ type: 'fallword', q, x: q.x, y: q.base, vy: 0, rot: 0, spin: rand(-1.5, 1.5), warn: .6, t: 0 });
      } else {
        const x = clamp(p.x + rand(-140, 140), 30, W - 30);
        S.hz.push({ type: 'chunk', x, y: S.camY - 30, vy: 60, r: rand(12, 20), rot: rand(0, 6), spin: rand(-3, 3), warn: .8, t: 0, pts: Array.from({ length: 7 }, (_, i) => .7 + Math.random() * .5) });
      }
    },
    step() {}, hit: () => false, dead: () => true, why: '',
  },
  fallword: {
    onLive(h) { h.q.gone = true; h.q.goneT = 1; h.q.regrow = 3.2; noise(.25, .25, 900, 'lowpass'); },
    step(h, dt) { if (!h.live) return; h.vy += 900 * dt; h.y += h.vy * dt; h.rot += h.spin * dt; },
    hit(h, d) {
      if (!h.live) return false;
      const q = h.q, dy = h.y - q.base;
      return d.x > q.x && d.x < q.x + q.w && d.y > q.top + dy && d.y < q.base + dy + 4;
    },
    dead: h => h.live && h.y > S.lava + 40,
    why: 'Тебя накрыло титрами',
  },
  chunk: {
    step(h, dt) { if (!h.live) return; h.vy += 700 * dt; h.y += h.vy * dt; h.rot += h.spin * dt; },
    hit: (h, d) => h.live && Math.hypot(d.x - h.x, d.y - h.y) < h.r * .85 + 4,
    dead: h => h.live && h.y > S.lava + 40,
    why: 'Тебя завалило обломками',
  },
});
Object.assign(HZDRAW, {
  fallword(h, t) {
    const q = h.q;
    if (!h.live) {
      // the line shakes loose before it drops
      ctx.font = q.font; ctx.fillStyle = CUT; ctx.globalAlpha = .9;
      ctx.fillText(q.text, q.x + (Math.random() - .5) * 4, q.base + (Math.random() - .5) * 2);
      return;
    }
    ctx.translate(q.x + q.w / 2, h.y); ctx.rotate(h.rot);
    ctx.font = q.font; ctx.fillStyle = q.color; ctx.textAlign = 'center';
    ctx.fillText(q.text, 0, 0); ctx.textAlign = 'left';
  },
  chunk(h, t, cam, w) {
    if (!h.live) {
      // dust trickles from where the chunk will come loose
      ctx.fillStyle = 'rgba(190,160,140,.7)';
      for (let i = 0; i < 6; i++) ctx.fillRect(h.x + Math.sin(i * 3.1 + t * .02) * 8, cam + ((t * .25 + i * 30) % 90), 2, 4);
      return;
    }
    ctx.translate(h.x, h.y); ctx.rotate(h.rot);
    ctx.fillStyle = '#3a2a26'; ctx.beginPath();
    h.pts.forEach((k, i) => { const a = i / h.pts.length * PI2; ctx.lineTo(Math.cos(a) * h.r * k, Math.sin(a) * h.r * k); });
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,120,40,.6)'; ctx.lineWidth = 1.5; ctx.stroke();
  },
});
AMB.collapse = (A, many) => {
  A.embers = many(60, () => ({ x: rand(0, W), y: rand(0, H), s: rand(.5, 1.6) }));
  A.cracks = many(7, () => ({ x: rand(20, W - 20), y: rand(0, H * 3), len: rand(60, 160), a: rand(-.6, .6) }));
};
BACK.collapse = (t, cam, k) => {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#07030a'); g.addColorStop(.7, '#1c0806'); g.addColorStop(1, '#4a1206');
  ctx.globalAlpha = k; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // the screen itself is cracking
  ctx.strokeStyle = 'rgba(255,120,40,.25)'; ctx.lineWidth = 1.2;
  for (const c of S.amb.cracks) {
    const y = ((c.y - cam * .3) % (H * 3) + H * 3) % (H * 3) - H;
    ctx.beginPath(); ctx.moveTo(c.x, y);
    for (let i = 1; i <= 5; i++) ctx.lineTo(c.x + Math.sin(i * 2.3 + c.a) * 14 + i * c.a * 10, y + i * c.len / 5);
    ctx.stroke();
  }
  for (const e of S.amb.embers) { ctx.globalAlpha = .7 * k; ctx.fillStyle = '#ff9a3c'; ctx.fillRect(e.x + Math.sin(t * .002 + e.y) * 6, wrapY(e.y + t * .05 * e.s - cam * .2), 2, 2); }
  ctx.globalAlpha = 1;
};

// the ascent's ending: up into the projector's light
Object.assign(ENDING_LEN, { rise: 11 });
function updateRiseEnding() {
  cue('lamp', .3, () => noise(1.6, .25, 5000));
  [0, 5, 7, 12, 17, 19, 24].forEach((s, i) => cue('up' + i, .6 + i * .3, () => tone(220 * Math.pow(2, s / 12), 2.6, .07)));
}
function drawRiseEnding(t, T) {
  const d = S.endDot, k = ease(clamp(T / 2.6, 0, 1));
  // the beam from the projector widens until it fills the frame
  ctx.fillStyle = `rgba(0,0,0,${.5 * clamp(T, 0, 1)})`; ctx.fillRect(0, 0, W, H);
  const beam = ctx.createLinearGradient(0, 0, 0, H);
  beam.addColorStop(0, `rgba(255,250,235,${.95 * k})`); beam.addColorStop(1, `rgba(255,240,210,${.15 * k})`);
  ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(CX - 30 - 260 * k, 0); ctx.lineTo(CX + 30 + 260 * k, 0); ctx.lineTo(CX + 80 + 300 * k, H); ctx.lineTo(CX - 80 - 300 * k, H); ctx.closePath(); ctx.fill();
  const r = ease(clamp((T - .8) / 2.4, 0, 1)), x = d.x + (CX - d.x) * r, y = d.y + (-20 - d.y) * r;
  ctx.shadowColor = '#fff6df'; ctx.shadowBlur = 30; circle(x, y, 6, '#ffffff'); ctx.shadowBlur = 0;
  const white = clamp((T - 3) / 1, 0, 1);
  if (white > 0) { ctx.fillStyle = `rgba(250,246,238,${white})`; ctx.fillRect(0, 0, W, H); }
  const rr_ = S.riseRes || { t: S.time, takes: S.take };
  lines(T, [
    [4.0, 'Восхождение.', `italic 600 40px ${SERIF}`, H * .3],
    [5.2, 'Ты прошёл все титры обратно —', `italic 500 21px ${SERIF}`, H * .3 + 46],
    [5.8, 'до самого начала.', `italic 500 21px ${SERIF}`, H * .3 + 74],
    [7.0, 'Дальше титров нет. Дальше — жизнь.', `italic 500 21px ${SERIF}`, H * .3 + 120],
    [8.2, MOTTO, `600 22px ${MONO}`, H * .3 + 186, '#b5291f'],
    [9.2, Tf('ВРЕМЯ {0} · {1} {2}', fmt(rr_.t), rr_.takes - 1, plural(rr_.takes - 1, 'ДУБЛЬ', 'ДУБЛЯ', 'ДУБЛЕЙ')), `500 12px ${MONO}`, H - 92, '#6a5a50'],
    [10, 'ПРОБЕЛ — В МЕНЮ', `500 12px ${MONO}`, H - 62, '#6a5a50'],
  ], '#1a1416');
}
