// ---------- the five endings ----------
const ENDING_LEN = { truck: 11.8, late: 9.6, blind: 9.4, almost: 9.8, full: 13.2 };
const skyline = Array.from({ length: 24 }, (_, i) => ({ x: i * 24 - 6, w: 20 + Math.random() * 10, h: 40 + Math.random() * 110, lit: Array.from({ length: 12 }, () => Math.random() < .35) }));

function cue(id, at, fn) { if (S.modeT >= at && !S.cues.has(id)) { S.cues.add(id); fn(); } }
// the dot leaps off THE END and hangs in the air in slow motion
const IMPACT = 2.45;
function truckDot(T) {
  const d0 = S.endDot, tau = T < .35 ? T : .35 + (Math.min(T, IMPACT) - .35) * .16;
  return { x: d0.x + 60 * tau, y: d0.y - 560 * tau + 520 * tau * tau };
}
function truckFront(T) {
  const hit = truckDot(IMPACT);
  if (T < 1.55) return -60;
  if (T < IMPACT) { const k = (T - 1.55) / (IMPACT - 1.55); return -60 + (hit.x + 8 + 60) * k * k; }
  if (T < IMPACT + .12) return hit.x + 8;          // a heartbeat of hit-stop
  return hit.x + 8 + (T - IMPACT - .12) * 1500;
}
function updateEnding(dt) {
  const e = S.ending;
  if (e === 'truck') {
    cue('horn', 1.55, horn);
    cue('crash', IMPACT, () => {
      noise(1.2, .85, 1400, 'lowpass'); noise(.35, .5, 3000); S.shake = .6;
      const d = truckDot(IMPACT);
      // a cartoon burst of blood, mostly carried along with the truck
      S.blood = Array.from({ length: 110 }, () => ({ x: d.x, y: d.y, vx: rand(-120, 760), vy: rand(-420, 200), r: rand(1.5, 5.5), t: 0, life: rand(.6, 1.6) }));
      S.splats = Array.from({ length: 11 }, (_, i) => ({ x: d.x + rand(30, 300), y: d.y + rand(-140, 160), r: rand(6, 20), drip: rand(20, 80), t0: IMPACT + .08 + i * .025 }));
      S.splats.push({ x: rand(440, 510), y: rand(40, 110), r: 34, drip: 120, t0: IMPACT + .2 }, { x: rand(30, 90), y: rand(560, 630), r: 26, drip: 60, t0: IMPACT + .26 });
    });
    for (const b of S.blood) { b.t += dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 900 * dt; }
  }
  if (e === 'late') for (let i = 1; i < 9; i++) cue('tick' + i, i, () => noise(.03, .25, 4000));
  if (e === 'blind') cue('whoosh', .1, () => noise(1.8, .25, 700, 'bandpass'));
  if (e === 'almost') cue('lights', 1, () => tone(392, 2.5, .08));
  if (e === 'full') {
    [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => cue('arp' + i, .3 + i * .28, () => tone(261.6 * Math.pow(2, s / 12), 1.4, .08)));
    cue('flare', 2.4, () => noise(.8, .3, 6000));
    [0, 4, 7, 12].forEach((s, i) => cue('dawn' + i, 3.4 + i * .5, () => tone(196 * Math.pow(2, s / 12), 3.5, .07)));
    cue('begin', 8.6, () => [0, 4, 7, 11, 14].forEach((s, i) => tone(392 * Math.pow(2, s / 12), 3, .06, i * .09)));
  }
  if (e === 'life') updateLifeEnding();
  if (e === 'rise') updateRiseEnding();
  cue('message', ENDING_LEN[e] - 2.6, () => tone(523.3, 2.2, .1));
}

function lines(T, rows, color, glow) {
  for (const [t0, text, font, y, col] of rows) {
    const k = clamp((T - t0) / .8, 0, 1);
    if (k <= 0) continue;
    if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 8; }
    caption(text, font, y, col || color, k);
    ctx.shadowBlur = 0;
  }
}
function endingStats(T, at, color, y = H - 92) {
  const s = S.summary;
  if (T > at) caption(`ВРЕМЯ ${fmt(s.time)} · В ГРАФИКЕ ${s.inTime}/${EVENING} · ★ ${s.got}/${s.total}`, `500 12px ${MONO}`, y, color, clamp((T - at) / .8, 0, 1));
  if (T > at + 1) caption(S.replay ? 'ПРОБЕЛ — НАЗАД' : 'ПРОБЕЛ — СТАТИСТИКА ВЕЧЕРА', `500 12px ${MONO}`, y + 30, color, clamp((T - at - 1) / .8, 0, 1));
}
const MOTTO = 'ТОРОПИСЬ ЖИТЬ. ЖИЗНЬ ОДНА.';

function drawSplat(s, T) {
  const k = clamp((T - s.t0) / .12, 0, 1);
  if (k <= 0) return;
  // the stains soften once the words arrive, so they can be read
  ctx.globalAlpha = 1 - .72 * clamp((T - 3.5) / .8, 0, 1);
  ctx.fillStyle = '#9d0012';
  ctx.beginPath(); ctx.arc(s.x, s.y, s.r * k, 0, PI2); ctx.fill();
  for (let i = 0; i < 6; i++) { const a = i * 1.1 + s.r, d = s.r * (1 + .4 * (i % 3)); circle(s.x + Math.cos(a) * d * k, s.y + Math.sin(a) * d * k, s.r * .28 * k, '#9d0012'); }
  const drip = s.drip * clamp((T - s.t0 - .2) / 3, 0, 1);
  if (drip > 0) { ctx.fillRect(s.x - s.r * .18, s.y, s.r * .36, drip); circle(s.x, s.y + drip, s.r * .26, '#9d0012'); }
  ctx.globalAlpha = 1;
}

function drawEnding(t) {
  const T = S.modeT, e = S.ending, big = `italic 600 34px ${SERIF}`, mid = `italic 500 21px ${SERIF}`, motto = `600 22px ${MONO}`;
  const y0 = H * .26;
  if (e === 'truck') {
    // anime white-out: the dot hangs in the air in slow motion, the frame bleaches, a truck comes from the left
    const white = clamp((T - .3) / 1.7, 0, 1);
    ctx.fillStyle = `rgba(255,255,255,${.94 * white})`; ctx.fillRect(0, 0, W, H);
    const d = truckDot(T);
    if (T < IMPACT && !REDUCED) {
      ctx.strokeStyle = `rgba(0,0,0,${.22 * white})`; ctx.lineWidth = 1;
      for (let i = 0; i < 56; i++) {
        const a = i / 56 * PI2 + Math.sin(i * 7.1) * .05, r0 = 70 + (i * 37 % 90) + (t * .3 % 50);
        ctx.beginPath(); ctx.moveTo(d.x + Math.cos(a) * r0, d.y + Math.sin(a) * r0); ctx.lineTo(d.x + Math.cos(a) * 800, d.y + Math.sin(a) * 800); ctx.stroke();
      }
    }
    if (T < IMPACT + .05) {
      ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 10;
      circle(d.x, d.y, 6, '#fffaf0'); ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(d.x, d.y, 6, 0, PI2); ctx.stroke();
      ctx.shadowBlur = 0;
    }
    const hit = truckDot(IMPACT), front = truckFront(T);
    if (T > 1.5 && front < W + 600) {
      if (!REDUCED) { ctx.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 10; i++) ctx.fillRect(front - 700 - i * 40, hit.y - 120 + i * 18, 260, 2); }
      drawTruckSide(front, hit.y + 74, T < IMPACT);
    }
    for (const s of S.splats) drawSplat(s, T);
    for (const b of S.blood) {
      if (b.t > b.life) continue;
      ctx.globalAlpha = 1 - b.t / b.life; circle(b.x, b.y, b.r, b.r > 4 ? '#9d0012' : '#c4001c');
    }
    ctx.globalAlpha = 1;
    if (T > IMPACT && T < IMPACT + .25) { ctx.fillStyle = `rgba(255,255,255,${.8 * (1 - (T - IMPACT) / .25)})`; ctx.fillRect(0, 0, W, H); }
    lines(T, [
      [4.0, 'Тебя сбил грузовик.', big, y0],
      [5.2, 'Ты слишком долго смотрел чужие титры', mid, y0 + 48],
      [5.8, 'и почти ничего не успел собрать.', mid, y0 + 76],
      [7.2, 'Перерождения в другом мире не будет.', mid, y0 + 124],
      [8.8, MOTTO, motto, y0 + 196, '#c4001c'],
    ], '#141414', '#ffffff');
    endingStats(T, 9.8, '#555555');
  } else if (e === 'late') {
    // the hall empties around you
    ctx.fillStyle = `rgba(0,0,0,${clamp(T / 1.5, 0, .85)})`; ctx.fillRect(0, 0, W, H);
    const rise = ease(clamp(T / 2.5, 0, 1));
    ctx.fillStyle = '#16110f';
    for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) {
      const x = 20 + i * 58 + (r % 2) * 29, y = H - 40 - r * 46 + (1 - rise) * 160;
      rr(x, y, 44, 60, 10); ctx.fill();
    }
    lines(T, [
      [1.6, 'Ты собрал почти всё, что видел.', big, y0],
      [3.0, 'Но смотрел слишком долго.', mid, y0 + 48],
      [4.2, 'Зал опустел. Сеанс давно закончился.', mid, y0 + 76],
      [6.4, MOTTO, motto, y0 + 150, CUT],
    ], '#efe8dc');
    endingStats(T, 7.4, '#8e877c', y0 + 210);
  } else if (e === 'blind') {
    // everything rushes past
    ctx.fillStyle = `rgba(0,0,0,${clamp(T / 1.2, 0, .85)})`; ctx.fillRect(0, 0, W, H);
    if (!REDUCED) for (let i = 0; i < 40; i++) {
      const y = (i * 53.7) % H, x = ((t * (1.2 + (i % 5) * .4) + i * 97) % (W + 300)) - 150;
      ctx.fillStyle = `rgba(239,232,220,${.08 + (i % 3) * .05})`; ctx.fillRect(x, y, 140, 1.5);
    }
    lines(T, [
      [1.4, 'Ты успел на каждый сеанс.', big, y0],
      [2.8, 'Но пробежал мимо почти всех звёзд.', mid, y0 + 48],
      [4.2, 'Спешить жить — не значит не смотреть.', mid, y0 + 76],
      [6.2, MOTTO, motto, y0 + 150, CUT],
    ], '#efe8dc');
    endingStats(T, 7.2, '#8e877c');
  } else if (e === 'almost') {
    // house lights up, warm and plain
    const L = clamp((T - .8) / 2, 0, 1);
    ctx.fillStyle = `rgba(242,234,220,${L})`; ctx.fillRect(0, 0, W, H);
    const s = S.summary, miss = s.total - s.got;
    lines(T, [
      [2.0, 'Свет в зале включили.', big, y0],
      [3.2, 'Ты успел. Почти все звёзды — с тобой.', mid, y0 + 48],
      [4.4, `${miss} ${plural(miss, 'осталась', 'остались', 'остались')} в темноте.`, mid, y0 + 76],
      [5.4, 'Вернуться за ними нельзя: жизнь одна.', mid, y0 + 104],
      [6.6, 'ТОРОПИСЬ ЖИТЬ.', motto, y0 + 170, '#b5291f'],
    ], '#1a1416');
    endingStats(T, 7.6, '#7a7166');
  } else if (e === 'full') {
    drawFull(t, T);
  } else if (e === 'life') {
    drawLifeEnding(t, T);
  } else if (e === 'rise') {
    drawRiseEnding(t, T);
  }
}

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? few : many;
}

// every star of the evening flies home, the dot becomes the sun, and the end turns into a beginning
function drawFull(t, T) {
  const p = S.p, dot = { x: p.x + PW / 2, y: p.y + PH / 2 - S.camY };
  const n = S.summary.total;
  if (T < 2.6) {
    ctx.fillStyle = `rgba(0,0,0,${clamp(T / 1, 0, .7)})`; ctx.fillRect(0, 0, W, H);
    ctx.font = `500 16px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const k = ease(clamp((T - i * (1.6 / n)) / .9, 0, 1));
      if (k >= 1) continue;
      const a = i * 2.399, R = 420 * (1 - k);
      ctx.globalAlpha = .9; ctx.fillStyle = '#fff6df'; ctx.shadowColor = '#fff1c8'; ctx.shadowBlur = 10;
      ctx.fillText('★', dot.x + Math.cos(a + k * 2) * R, dot.y + Math.sin(a + k * 2) * R);
    }
    ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic';
    const glow = 6 + 30 * clamp(T / 2.4, 0, 1);
    ctx.shadowColor = '#fff1c8'; ctx.shadowBlur = glow * 2; ctx.fillStyle = '#fffaf0';
    ctx.beginPath(); ctx.arc(dot.x, dot.y, 5 + glow * .25, 0, PI2); ctx.fill(); ctx.shadowBlur = 0;
    return;
  }
  // dawn
  const k = ease(clamp((T - 2.6) / 4, 0, 1));
  const mix = (a, b) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
  const top = mix([6, 7, 20], [70, 120, 190]), bot = mix([20, 12, 30], [255, 183, 110]);
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, `rgb(${top})`); sky.addColorStop(1, `rgb(${bot})`);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  const flash = clamp(1 - (T - 2.6) / .6, 0, 1);
  const sunY = H * .78 - (H * .3) * k, sunR = 12 + 46 * k;
  const sg = ctx.createRadialGradient(CX, sunY, 0, CX, sunY, sunR * 3);
  sg.addColorStop(0, 'rgba(255,250,235,1)'); sg.addColorStop(.33, 'rgba(255,236,190,.9)'); sg.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(CX, sunY, sunR * 3, 0, PI2); ctx.fill();
  // the city wakes up
  for (const b of skyline) {
    const bh = b.h * (.6 + .4 * k);
    ctx.fillStyle = '#120c14'; ctx.fillRect(b.x, H - bh, b.w, bh);
    ctx.fillStyle = `rgba(255,214,140,${.8 * (1 - k * .6)})`;
    b.lit.forEach((on, i) => { if (on && (i % 3) * 14 + 8 < bh - 8) ctx.fillRect(b.x + 4 + (i % 2) * 8, H - bh + 8 + Math.floor(i / 2) * 14, 4, 6); });
  }
  if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash})`; ctx.fillRect(0, 0, W, H); }
  const ink = '#1a1416';
  lines(T, [
    [4.0, 'Ты успел всё.', `italic 600 34px ${SERIF}`, H * .18],
    [5.0, `Все ${n} ${plural(n, 'звезда', 'звезды', 'звёзд')} — с тобой.`, `italic 500 21px ${SERIF}`, H * .18 + 40],
  ], ink);
  // GOING TO THE END → GOING TO THE BEGINNING
  if (T > 6.6) {
    const a = clamp((T - 6.6) / .8, 0, 1), font = `600 34px ${SERIF}`, y = H * .38;
    ctx.font = font;
    const head = 'GOING TO THE ', hw = ctx.measureText(head).width;
    const typed = 'BEGINNING'.slice(0, Math.floor(clamp((T - 8.6) / 1.2, 0, 1) * 9));
    const tail = T < 8.6 ? 'END' : typed;
    const total = hw + ctx.measureText(tail || 'END').width, x0 = CX - total / 2;
    ctx.globalAlpha = a; ctx.fillStyle = ink; ctx.textAlign = 'left';
    ctx.fillText(head, x0, y);
    if (T < 8.6) {
      ctx.fillText('END', x0 + hw, y);
      const s = clamp((T - 7.8) / .5, 0, 1), ew = ctx.measureText('END').width;
      if (s > 0) { ctx.fillStyle = CUT; ctx.fillRect(x0 + hw - 2, y - 12, (ew + 4) * s, 3); }
    } else {
      ctx.fillStyle = '#b5291f'; ctx.fillText(tail, x0 + hw, y);
    }
    ctx.globalAlpha = 1; ctx.textAlign = 'center';
  }
  lines(T, [[10.4, MOTTO, `600 22px ${MONO}`, H * .38 + 56, '#b5291f']], ink);
  endingStats(T, 11.2, '#3a2a24');
}
