// ---------- update ----------
function update(dt) {
  const p = S.p;
  if (S.mode === 'pause' || S.mode === 'menu') return;
  S.modeT += dt;
  S.shake = Math.max(0, S.shake - dt);
  for (const pl of plats) if (pl.gone && pl.goneT < 1) pl.goneT += dt * 1.4;
  S.ripples = S.ripples.filter(r => (r.t += dt) < .6);
  S.floaters = S.floaters.filter(f => (f.t += dt) < 1);
  if (S.mode === 'clear' && S.gag) updateGag(dt);
  S.parts = S.parts.filter(q => (q.t += dt) < q.life);
  for (const q of S.parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 500 * dt; }
  if (S.mode === 'cut') { S.cutT += dt; if (S.cutT > 1.45) respawn(); return; }
  if (S.mode === 'intro') { if (S.modeT > (S.quick ? 1.6 : 3)) play(); return; }
  // in the marathon the next reel is threaded on its own
  if (S.mode === 'clear' && RUN.kind === 'marathon' && !S.mdone && S.modeT > 2.6) { nextFilm(); return; }
  if (S.mode === 'ending') { updateEnding(dt); return; }
  S.clock += dt;

  // moving and blinking lines
  for (const pl of plats) {
    if (pl.sway) { const nx = pl.bx + pl.sway * Math.sin(S.clock * 1.25 + pl.phase); pl.dx = nx - pl.x; pl.x = nx; }
    if (pl.blink) pl.off = (S.clock + pl.phase) % pl.blink > pl.blink * .68;
  }

  if (S.mode === 'play') {
    S.time += dt;
    // credits roll faster the closer you get to the end, and stop once THE END is in the frame
    if (!mech('frozen')) S.camY = Math.min(S.camY + (44 + 52 * progress()) * (LV.speed || 1) * dt, endTop - H * .6);
  }

  const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  const target = S.mode === 'play' ? dir * SPEED : 0;
  p.vx += clamp(target - p.vx, -ACC * dt, ACC * dt);
  p.coyote = p.ground ? .09 : Math.max(0, p.coyote - dt);
  p.buffer = Math.max(0, p.buffer - dt);
  if (p.buffer > 0 && p.coyote > 0 && S.mode === 'play') {
    p.vy = -JUMP * (LV.jump || 1); p.buffer = 0; p.coyote = 0; p.ground = null;
  }
  // under water a jump in mid-air is a swimming stroke, and every stroke costs a little air
  S.swimCD = Math.max(0, S.swimCD - dt);
  if (LV.swim && S.mode === 'play' && !p.ground && p.buffer > 0 && S.swimCD <= 0) {
    p.vy = Math.min(p.vy, -JUMP * .52); p.buffer = 0; S.swimCD = .3; S.oxy -= 2.5;
    sweep(260, 420, .14, .05, 'sine'); burst(p.x + PW / 2, p.y + PH, 4, '#bfefff', 60, 3);
  }
  p.vy = Math.min(MAXFALL * (LV.fall || 1), p.vy + GRAV * (LV.grav || 1) * dt);

  // a swaying line carries whoever stands on it
  if (p.ground && p.ground.sway) p.x += p.ground.dx;
  const prevGround = p.ground, impact = p.vy;
  const prevBottom = S.prevBottom = p.y + PH;
  p.x = clamp(p.x + p.vx * dt, 0, W - PW);
  p.y += p.vy * dt;

  // one-way platforms: land on a word only while falling onto its top
  p.ground = null;
  if (p.vy >= 0) {
    let best = null;
    for (const pl of plats) {
      if (!solid(pl) || p.x + PW <= pl.x || p.x >= pl.x + pl.w) continue;
      if (prevBottom <= pl.top + .5 && p.y + PH >= pl.top && (!best || pl.top < best.top)) best = pl;
    }
    if (best) {
      p.y = best.top - PH; p.vy = 0; p.ground = best;
      if (!prevGround) {
        const k = clamp(impact / MAXFALL, 0, 1);
        p.squash = .3 + .7 * k;
        landNote(best, k);
        S.ripples.push({ x: p.x + PW / 2, y: best.top, t: 0, k });
        mech('land', best);
        if (k > .45) burst(p.x + PW / 2, p.y + PH, 5, LV.pal.dim, 60);
      }
    }
  }
  mech('constrain', p);
  p.squash = Math.max(0, p.squash - dt * 6);

  // in the doll's game everything freezes on red, the crumbling names too
  const frozen = LV.hazard === 'redlight' && S.rl.phase === 'red' || mech('frozen');
  if (p.ground && p.ground.fragile && !frozen) {
    p.ground.hold += dt;
    if (p.ground.hold > .5) { p.ground.gone = true; p.ground = null; noise(.18, .18, 1800); }
  }
  if (p.ground && p.ground.end && S.mode === 'play') { finishLevel(); return; }

  for (let i = S.cp + 1; i < checkpoints.length; i++) if (p.y > checkpoints[i].top) {
    S.cp = i;
    for (const s of stars) if (s.got) s.banked = true;
    tone(523.3, 1.2, .1);
    hud();
  }

  if (S.mode === 'play') {
    const cx = p.x + PW / 2, cy = p.y + PH / 2;
    for (const s of stars) if (!s.got && Math.hypot(s.x - cx, s.y - cy) < 16) {
      s.got = true;
      burst(s.x, s.y, 12, LV.pal.star, 150);
      S.floaters.push({ x: s.x, y: s.y, t: 0, text: '+1' });
      mech('collect', s);
      tone(1318.5, .5, .06); tone(1975.5, .7, .05, .08);
      hud();
    }
  }

  p.trail.unshift({ x: p.x + PW / 2, y: p.y + PH / 2 });
  if (p.trail.length > 20) p.trail.pop();

  updateHazards(dt);
  if (S.mode !== 'play') return;

  while (S.recT <= S.time) { S.rec.push(Math.round(p.x), Math.round(p.y)); S.recT += 1 / REC_HZ; }
  // the camera chases a falling dot, but slower than it falls: a short slip is forgiven, a long drop is not
  const floor = H - (LV.hazard === 'water' ? S.water : 0);
  const chaseLine = Math.min(H * .68, floor - 120);
  const low = p.y - S.camY - chaseLine;
  if (low > 0) S.camY = Math.min(S.camY + Math.min(low, 250 * dt), endTop - H * .6);
  const sy = p.y - S.camY;
  if (LV.hazard === 'rex' && S.rex.lunge > 0 && sy < jawDepth()) cut('Тебя съел тираннозавр');
  else if (sy + PH < -2) cut('Тебя унесло за верх кадра');
  else if (LV.hazard === 'water' && sy + PH > floor + 3) cut('Ты утонул');
  else if (sy > H + 2) cut('Ты выпал из кадра');
}
