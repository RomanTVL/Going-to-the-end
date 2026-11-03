// ---------- state ----------
let S;
const keys = { left: false, right: false, jump: false };

function startLevel(i, mode = 'intro') {
  LV = LEVELS[i];
  layout();
  const cp = checkpoints[0];
  S = {
    mode, li: i, camY: 0, time: 0, clock: 0, take: 1, cp: 0, cutT: 0, cutWhy: '', modeT: 0, pauseFrom: null,
    burn: null, parts: [], rec: [], recT: 0, ghost: store.json('gtte-ghost-' + LV.key), par: LV.par || (LV.final ? FINAL_PAR : GUEST_PAR),
    hz: [], hzT: 2, amb: makeAmbient(), cues: new Set(), ending: null, shake: 0,
    rl: { phase: 'green', t: 0, dur: 2.8 }, water: 50, blood: [], splats: [],
    quick: RUN.kind === 'marathon', trace: [], since: 0, twin: null, oxy: 100, bubbles: [], bubT: .5, swimCD: 0, beep: 0,
    world: 'a', flipT: 3.4, rex: { next: 2.6, n: 0, warn: 0, lungeAt: 0, lunge: 0 }, night: freshNight(), snapT: 4, ripples: [], floaters: [], gag: null,
    p: { x: cp.x - PW / 2, y: cp.top - PH, vx: 0, vy: 0, ground: null, coyote: 0, buffer: 0, trail: [], squash: 0 },
  };
  mech('reset');
  hud();
}
// a film's own mechanic, if it has one: mech('update', dt), mech('draw', t) and so on
function mech(hook, ...args) { const M = MECH[LV.hazard]; return M && M[hook] ? M[hook](...args) : undefined; }

function makeAmbient() {
  const A = {};
  const many = (n, f) => Array.from({ length: n }, f);
  if (LV.back === 'caverns') {
    A.flies = many(6, () => ({ bx: rand(60, 480), by: rand(80, 580), ph: rand(0, 6), sp: rand(.7, 1.3) }));
    A.motes = many(30, () => ({ x: rand(0, W), y: rand(0, H), s: rand(8, 24) }));
    A.pillars = many(7, (_, i) => ({ x: i * 84 + rand(-20, 20), w: rand(24, 44), d: rand(.08, .2) }));
  }
  if (LV.back === 'space') {
    A.field = many(130, () => ({ x: rand(0, W), y: rand(0, H), d: rand(.05, .4), r: Math.random() < .1 ? 1.7 : .9 }));
    A.nebula = many(3, () => ({ x: rand(0, W), y: rand(0, H * 2), r: rand(140, 240), c: pick(['120,60,200', '255,110,60', '60,120,255']) }));
  }
  if (LV.back === 'sky') A.clouds = many(6, () => ({ x: rand(-60, W), y: rand(0, H), s: rand(.7, 1.4), d: rand(.1, .3) }));
  if (LV.back === 'blocky') {
    A.field = many(80, () => ({ x: Math.round(rand(0, W) / 3) * 3, y: Math.round(rand(0, H) / 3) * 3, d: rand(.05, .2), r: 3 }));
    A.clouds = many(5, () => ({ x: rand(-80, W), y: rand(0, H), w: rand(5, 9), d: rand(.1, .25) }));
  }
  if (LV.back === 'candles') A.candles = many(22, () => ({ x: rand(10, W - 10), y: rand(0, H), d: rand(.1, .45), ph: rand(0, 6) }));
  if (LV.back === 'rain') A.cols = many(36, (_, i) => ({ x: i * 15 + 4, y: rand(-H, H), sp: rand(60, 180), len: Math.floor(rand(8, 20)), seed: Math.floor(rand(0, 999)) }));
  if (LV.back === 'aurora') A.field = many(110, () => ({ x: rand(0, W), y: rand(0, H), d: rand(.03, .15), r: Math.random() < .08 ? 1.6 : .8 }));
  if (LV.back === 'maze') A.seed = Math.floor(rand(0, 1000));
  if (AMB[LV.back]) AMB[LV.back](A, many);
  if (LV.back === 'ship') A.windows = [{ x: 30, y: 140 }, { x: 440, y: 420 }];
  if (LV.back === 'well') A.pieces = many(6, () => ({ x: rand(30, W - 90), y: rand(0, H), k: pick(Object.keys(TETRO)), s: rand(.6, 1.4) }));
  if (LV.back === 'spores') A.spores = many(60, () => ({ x: rand(0, W), y: rand(0, H), s: rand(.4, 1.4) }));
  if (LV.back === 'jungle') A.leaves = many(18, () => ({ x: pick([rand(-30, 70), rand(470, 570)]), y: rand(0, H), d: rand(.08, .35), a: rand(-1, 1), s: rand(.6, 1.3) }));
  if (LV.back === 'cosmos') {
    A.field = many(120, () => ({ x: rand(0, W), y: rand(0, H), d: rand(.05, .35), r: Math.random() < .08 ? 1.7 : .9 }));
    A.nebula = many(3, () => ({ x: rand(0, W), y: rand(0, H * 2), r: rand(150, 260), c: pick(['150,70,220', '242,182,50', '90,60,200']) }));
  }
  if (LV.back === 'grime') { A.blots = many(9, () => ({ x: rand(0, W), y: rand(0, H), r: rand(20, 70), d: rand(.05, .2) })); A.flashAt = performance.now() + 3000; A.flashX = 90; }
  if (LV.back === 'basement') A.flies = many(4, () => ({ x: rand(30, W - 30), y: rand(40, H - 40), s: rand(.6, 1.4), ph: rand(0, 6) }));
  if (LV.back === 'abyss') { A.snow = many(70, () => ({ x: rand(0, W), y: rand(0, H), d: rand(.05, .3) })); A.school = many(3, () => ({ x: rand(0, W), y: rand(0, H), s: rand(.6, 1.2) })); }
  return A;
}

function play() {
  if (S.mode !== 'intro' && S.mode !== 'menu') return;
  S.mode = 'play'; S.modeT = 0;
  tone(392, 1.4, .14);
  if (LV.hazard === 'redlight') greenLight();
  hud();
}

function respawn() {
  const cp = checkpoints[S.cp];
  for (const pl of plats) if (pl.top >= cp.top - 1) { pl.gone = false; pl.hold = 0; pl.goneT = 0; }
  for (const s of stars) if (!s.banked) s.got = false;
  S.hz = []; S.hzT = 1.4; S.water = 50;
  S.trace = []; S.since = S.time; S.twin = null; S.oxy = 100; S.bubbles = [];
  S.world = 'a'; S.flipT = 3.4; S.rex = { next: 2.6, n: 0, warn: 0, lungeAt: 0, lunge: 0 }; S.night = freshNight(); S.snapT = 4;
  for (const pl of plats) pl.dust = 0;
  S.camY = Math.max(0, cp.top - H * .4);
  Object.assign(S.p, { x: cp.x - PW / 2, y: cp.top - PH, vx: 0, vy: 0, ground: null, coyote: 0, buffer: 0, trail: [], squash: 0 });
  S.mode = 'play';
  if (LV.hazard === 'redlight') greenLight();
  mech('reset');
  hud();
}

function cut(why) {
  if (S.mode !== 'play') return;
  // with cheats on, hazards pass through you; only leaving the frame still costs a take
  if (cheatGod() && !/кадра|кадр/.test(why)) return;
  S.mode = 'cut'; S.cutT = 0; S.cutWhy = why; S.take++;
  // where and why: for the evening's statistics and the death map
  if (RUN.deaths) RUN.deaths.push([S.li, +dotFrac().toFixed(3), why]);
  S.burn = { x: S.p.x + PW / 2, y: clamp(S.p.y - S.camY, 0, H) };
  noise(.5, .45, 900, 'lowpass');
  noise(.05, .3, 3000);
  hud();
}

function finishLevel() {
  const got = stars.filter(s => s.got).length;
  const r = { t: +S.time.toFixed(2), par: S.par, got, total: stars.length, takes: S.take };
  if (CHEAT.on) RUN.cheat = true;
  const best = store.json('gtte-best-' + LV.key);
  if (!RUN.cheat && (!best || S.time < best)) {
    store.set('gtte-best-' + LV.key, S.time.toFixed(2));
    store.set('gtte-ghost-' + LV.key, JSON.stringify(S.rec));
  }
  RUN.res[S.li] = r;
  if (RUN.kind === 'marathon') { marathonStep(); hud(); return; }
  if (LV.final) {
    S.mode = 'ending'; S.modeT = 0; S.ending = judge();
    S.endDot = { x: S.p.x + PW / 2, y: S.p.y + PH / 2 - S.camY };
    // a run with cheats does not open endings, so the list in the menu stays honest
    if (!RUN.cheat) {
      const seen = seenEndings();
      if (!seen.includes(S.ending)) store.set('gtte-endings', JSON.stringify([...seen, S.ending]));
      store.set('gtte-summary-' + S.ending, JSON.stringify(S.summary));
    }
    RUN = freshRun(RUN.kind);
  } else {
    S.mode = 'clear'; S.modeT = 0;
    S.gag = makeGag();
    RUN.li = S.li + 1;
    [523.3, 659.3, 784].forEach((f, i) => tone(f, 1.6, .08, i * .1));
  }
  saveRun();
  hud();
}
// how far down the film the dot is, 0 at the title and 1 at THE END
function dotFrac() {
  const a = checkpoints[0] ? checkpoints[0].top : 0;
  return clamp((S.p.y - a) / ((endTop - a) || 1), 0, 1);
}

// the verdict on the whole evening
function judge() {
  const res = RUN.res, fast = res.every(r => r.t <= r.par);
  const got = res.reduce((s, r) => s + r.got, 0), total = res.reduce((s, r) => s + r.total, 0);
  const pct = total ? got / total : 0;
  S.summary = { fast, got, total, time: res.reduce((s, r) => s + r.t, 0), inTime: res.filter(r => r.t <= r.par).length };
  if (fast && got === total) return 'full';
  if (fast && pct >= .5) return 'almost';
  if (!fast && pct < .5) return 'truck';
  return fast ? 'blind' : 'late';
}

function burst(x, y, n, color, speed = 120, size = 2) {
  if (REDUCED) n = Math.min(n, 4);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * PI2, v = speed * (.3 + Math.random() * .7);
    S.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: .5 + Math.random() * .4, t: 0, color, size });
  }
}
