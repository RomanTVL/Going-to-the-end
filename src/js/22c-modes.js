// ---------- modes: reel changes between films and the marathon ----------

// ===== a reel change: the last frame is pulled up through the gate and the next reel runs in =====
const reelShot = document.createElement('canvas');
reelShot.width = cv.width; reelShot.height = cv.height;
let REEL = null;
function reelChange(fn) {
  reelShot.getContext('2d').drawImage(cv, 0, 0);
  REEL = { at: performance.now() };
  noise(.35, .22, 2400, 'bandpass'); sweep(140, 60, .3, .06, 'sawtooth');
  fn();
}
function drawReel(t) {
  if (!REEL) return;
  // the frame's timestamp can be a little older than the key press that started the change
  const k = Math.max(0, (t - REEL.at) / 620);
  if (k >= 1) { REEL = null; return; }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const e = k * k * (3 - 2 * k), off = -e * (H + 60);
  // motion blur: the old frame smeared along the pull
  ctx.globalAlpha = 1; ctx.drawImage(reelShot, 0, off, W, H);
  if (!REDUCED) { ctx.globalAlpha = .35; ctx.drawImage(reelShot, 0, off + 26 * (1 - k), W, H); ctx.globalAlpha = .18; ctx.drawImage(reelShot, 0, off + 60 * (1 - k), W, H); }
  ctx.globalAlpha = 1;
  // the frame line between the two reels, with a splice of tape
  const fl = off + H;
  ctx.fillStyle = '#050405'; ctx.fillRect(0, fl, W, 60);
  ctx.fillStyle = 'rgba(255,248,225,.16)'; ctx.fillRect(0, fl + 24, W, 12);
  // sprocket holes on both edges racing past
  for (const x of [0, W - 22]) {
    ctx.fillStyle = '#0b0909'; ctx.fillRect(x, 0, 22, H);
    for (let y = (-k * 900) % 34; y < H; y += 34) { ctx.fillStyle = '#2a2424'; rr(x + 5, y, 12, 18, 3); ctx.fill(); }
  }
  // a hot flash as the splice crosses the lamp
  const f = Math.max(0, 1 - Math.abs(k - .55) / .12);
  if (f > 0) { ctx.fillStyle = `rgba(255,246,225,${.5 * f})`; ctx.fillRect(0, 0, W, H); }
}
// the projectionist's cue marks: a burnt circle in the top right corner, twice, just before the change
function drawCueMarks(T, at) {
  for (const a of [at, at + .8]) {
    if (T < a || T > a + .12) continue;
    const x = W - 46, y = 46;
    ctx.fillStyle = 'rgba(10,8,8,.92)'; ctx.beginPath();
    for (let i = 0; i <= 18; i++) { const ang = i / 18 * PI2, r = 15 + Math.sin(i * 2.7) * 2.2; ctx.lineTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r); }
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,170,.5)'; ctx.lineWidth = 1.5; ctx.stroke();
  }
}

// ===== the marathon: every film back to back on one clock =====
function startMarathon() {
  RUN = freshRun('marathon');
  if (CHEAT.on) RUN.cheat = true;
  reelChange(() => startLevel(0, 'intro'));
}
function marathonStep() {
  S.mode = 'clear'; S.modeT = 0; S.gag = makeGag();
  [523.3, 659.3, 784].forEach((f, i) => tone(f, 1.6, .08, i * .1));
  if (!LV.final) { RUN.li = S.li + 1; return; }
  const r = RUN.res.filter(Boolean), M = S.mdone = {
    time: r.reduce((s, x) => s + x.t, 0), deaths: r.reduce((s, x) => s + x.takes - 1, 0),
    got: r.reduce((s, x) => s + x.got, 0), total: r.reduce((s, x) => s + x.total, 0), best: +store.get('gtte-marathon-best') || 0,
  };
  if (!RUN.cheat && (!M.best || M.time < M.best)) { store.set('gtte-marathon-best', M.time.toFixed(2)); M.record = true; }
}
// the clock the marathon runs on: every finished film plus the one on screen
function marathonTime() { let s = S.time; for (let i = 0; i < S.li; i++) if (RUN.res[i]) s += RUN.res[i].t; return s; }
function nextFilm() { reelChange(() => startLevel(RUN.li, 'intro')); }

// ===== cards drawn over a finished film in the special modes =====
function drawMarathonClear() {
  const T = S.modeT;
  if (S.mdone) {
    const M = S.mdone, k = clamp((T - 1.2) / .8, 0, 1);
    if (k <= 0) return;
    ctx.fillStyle = `rgba(6,5,8,${.88 * k})`; rr(28, H * .12, W - 56, 230, 10); ctx.fill();
    caption('МАРАФОН ОКОНЧЕН', `500 12px ${MONO}`, H * .12 + 36, '#a59d92', k);
    caption(fmt(M.time), `600 64px ${SERIF}`, H * .12 + 104, M.time <= EVENING * GUEST_PAR ? '#b9f27c' : CUT, k);
    caption(M.record ? 'НОВЫЙ РЕКОРД' : M.best ? `РЕКОРД ${fmt(M.best)}` : '', `500 12px ${MONO}`, H * .12 + 132, '#ffd23f', k);
    caption(`${EVENING} ФИЛЬМОВ · ${M.deaths} ${plural(M.deaths, 'ДУБЛЬ', 'ДУБЛЯ', 'ДУБЛЕЙ')} · ★ ${M.got} / ${M.total}`, `500 12px ${MONO}`, H * .12 + 166, '#efe8dc', k);
    if (T > 2.4) caption('ПРОБЕЛ — В МЕНЮ', `500 11px ${MONO}`, H * .12 + 206, '#a59d92', k);
    return;
  }
  // between films: one line under the gag, then the cue marks and the change
  const r = RUN.res[S.li], k = clamp((T - .6) / .5, 0, 1);
  if (r) caption(`${S.li + 1} / ${EVENING} · ${fmt(r.t)} · ★ ${r.got}/${r.total} · ДАЛЬШЕ: ${LEVELS[S.li + 1].name.toUpperCase()}`, `500 11px ${MONO}`, H - 30, LV.pal.light ? '#1b1b3a' : '#d8d0c4', k);
  drawCueMarks(T, 1.5);
}
