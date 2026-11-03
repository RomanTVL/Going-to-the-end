// ---------- after THE END: the film goes on, and something happens to the words THE END ----------
function makeGag() {
  const ends = plats.filter(q => q.end), letters = [];
  for (const pl of ends) {
    ctx.font = pl.font;
    // place each letter by the width of the text before it, so kerning and spacing stay as set
    [...pl.text].forEach((ch, i) => {
      const x = pl.x + ctx.measureText(pl.text.slice(0, i)).width, w = ctx.measureText(pl.text.slice(0, i + 1)).width - (x - pl.x);
      letters.push({ ch, x, w, base: pl.base, font: pl.font, color: pl.color, dx: 0, dy: 0, vx: 0, vy: 0, a: 1, rot: 0, sc: 1, tint: null, word: ends.indexOf(pl), h: pl.size });
    });
  }
  const g = { letters, x0: Math.min(...letters.map(l => l.x)), x1: Math.max(...letters.map(l => l.x + l.w)), base: ends[0].base, top: Math.min(...ends.map(q => q.top)), size: ends[0].size, cues: new Set(), say: '', sayCol: null, fx: [] };
  const G = GAGS[LV.key];
  if (G && G.init) G.init(g);
  return g;
}
function gcue(g, id, at, fn) { if (S.modeT >= at && !g.cues.has(id)) { g.cues.add(id); fn(); } }
function updateGag(dt) {
  const g = S.gag, G = GAGS[LV.key];
  if (G && G.update) G.update(g, S.modeT, dt);
  for (const l of g.letters) { l.dx += l.vx * dt; l.dy += l.vy * dt; }
}
function drawLetters(g) {
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  for (const l of g.letters) {
    if (l.a <= .01) continue;
    ctx.save(); ctx.globalAlpha = l.a; ctx.translate(l.x + l.w / 2 + l.dx, l.base + l.dy); ctx.rotate(l.rot); ctx.scale(l.sc, l.sc);
    ctx.font = l.font;
    if (LV.pal.outline) { ctx.shadowColor = LV.pal.outline; ctx.shadowBlur = 14; ctx.strokeStyle = LV.pal.outline; ctx.lineWidth = 2; ctx.strokeText(l.ch, 0, 0); }
    else { ctx.shadowColor = LV.pal.light ? 'rgba(0,0,0,.3)' : 'rgba(255,240,210,.55)'; ctx.shadowBlur = 18; }
    if (LV.pal.shadow) { ctx.fillStyle = LV.pal.shadow; ctx.fillText(l.ch, 2, 2); }
    ctx.fillStyle = l.tint || (LV.pal.outline ? 'rgba(10,6,10,.9)' : l.color);
    if (l.split > 0) {
      // a letter cut in two: the top half slides away, the bottom half stays
      const cutY = -l.h * .5, k = l.split;
      ctx.save(); ctx.beginPath(); ctx.rect(-l.w, cutY, l.w * 2, l.h); ctx.clip(); ctx.fillText(l.ch, 0, 0); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(-l.w, -l.h * 1.4, l.w * 2, l.h * .9); ctx.clip(); ctx.translate(k * 40, -k * 30); ctx.rotate(-k * .5); ctx.fillText(l.ch, 0, 0); ctx.restore();
    } else ctx.fillText(l.ch, 0, 0);
    ctx.restore();
  }
  ctx.textAlign = 'left';
}
function drawGagWorld(t) {
  const g = S.gag, G = GAGS[LV.key];
  if (G && G.under) G.under(g, S.modeT, t);
  drawLetters(g);
  if (G && G.over) G.over(g, S.modeT, t);
}
function drawGagScreen(t) {
  const g = S.gag, G = GAGS[LV.key];
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (G && G.screen) G.screen(g, S.modeT, t);
  if (g.say && S.modeT > (g.sayAt || 1.6)) {
    const k = clamp((S.modeT - (g.sayAt || 1.6)) / .6, 0, 1);
    ctx.shadowColor = '#000'; ctx.shadowBlur = 10;
    caption(g.say, g.sayFont || `italic 600 26px ${SERIF}`, g.top - S.camY - 46, g.sayCol || (LV.pal.light ? '#ffffff' : LV.pal.film), k);
    ctx.shadowBlur = 0;
  }
}
const letterAt = (g, i) => g.letters[clamp(i, 0, g.letters.length - 1)];
const midY = g => g.base - g.size * .35;

const GAGS = {
  agent: {
    init(g) { g.say = 'Контракт выполнен'; g.holes = []; },
    update(g, T) {
      [.35, .7, 1.05].forEach((at, i) => gcue(g, 'shot' + i, at, () => {
        const l = pick(g.letters); g.holes.push({ x: l.x + l.w / 2 + rand(-8, 8), y: midY(g) + rand(-g.size * .2, g.size * .2), t0: at });
        noise(.1, .5, 1200); l.vx = rand(-40, 40); S.shake = .2;
      }));
      for (const l of g.letters) { l.vx *= .85; l.dx *= .9; }
    },
    over(g, T) {
      for (const h of g.holes) {
        const k = clamp((T - h.t0) / .08, 0, 1);
        if (T - h.t0 < .1) { ctx.globalAlpha = 1 - (T - h.t0) * 10; circle(h.x, h.y, 26, '#fff3c4'); }
        ctx.globalAlpha = 1; circle(h.x, h.y, 5 * k, '#0a0a0a');
        ctx.strokeStyle = 'rgba(30,30,30,.8)'; ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) { const a = i * 1.05 + h.x; ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(h.x + Math.cos(a) * 12 * k, h.y + Math.sin(a) * 12 * k); ctx.stroke(); }
      }
    },
  },
  plumber: {
    init(g) { g.say = 'Курс пройден!'; g.sayAt = 1.8; },
    update(g, T) {
      [1.5, 1.85, 2.2, 2.6].forEach((at, i) => gcue(g, 'fw' + i, at, () => {
        const x = rand(80, W - 80), y = S.camY + rand(80, 200);
        burst(x, y, 30, pick(['#ff3b3b', '#ffd23f', '#3ddc4a', '#ffffff']), 220, 3); noise(.4, .3, 800, 'lowpass');
      }));
      gcue(g, 'flag', .1, () => sweep(900, 300, 1.2, .06, 'square'));
    },
    under(g, T) {
      const x = g.x1 + 30, top = g.top - 170;
      ctx.fillStyle = '#7fe07f'; ctx.fillRect(x - 2, top, 4, g.base - top);
      circle(x, top - 4, 6, '#3ddc4a');
      const fy = top + 10 + (g.base - top - 50) * ease(clamp(T / 1.2, 0, 1));
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x - 2, fy); ctx.lineTo(x - 34, fy + 14); ctx.lineTo(x - 2, fy + 28); ctx.fill();
      ctx.fillStyle = '#3ddc4a'; circle(x - 14, fy + 14, 5, '#3ddc4a');
    },
  },
  hollow: {
    init(g) { g.say = 'Королевство помнит тебя'; g.flies = g.letters.map((l, i) => ({ x: i % 2 ? -40 : W + 40, y: S.camY + rand(0, H), tx: l.x + l.w / 2, ty: g.top - 6, ph: rand(0, 6), d: rand(.3, 1) })); },
    update(g, T, dt) { for (const f of g.flies) { const k = clamp((T - f.d) / 2, 0, 1); f.cx = f.x + (f.tx - f.x) * ease(k) + Math.sin(T * 3 + f.ph) * 20 * (1 - k); f.cy = f.y + (f.ty - f.y) * ease(k) + Math.cos(T * 2 + f.ph) * 30 * (1 - k); } },
    over(g, T, t) { for (const f of g.flies) if (f.cx !== undefined) drawButterfly(f.cx, f.cy, t * (f.cx === f.tx ? .3 : 1), f.ph); },
  },
  crew: {
    init(g) {
      g.say = 'Красный был предателем.'; g.sayAt = 2.4; g.sayCol = '#ff6a6a';
      g.mates = ['#c51111', '#132ed1', '#117f2d', '#ed54ba', '#f5f557'].map((c, i) => ({ col: c, x: i % 2 ? -30 - i * 20 : W + 30 + i * 20, tx: g.x0 + (g.x1 - g.x0) * (i + .5) / 5, y: g.top, vy: 0, rot: 0, gone: false }));
    },
    update(g, T, dt) {
      gcue(g, 'meet', .2, () => { tone(880, .3, .1, 0, 'square'); tone(660, .3, .1, .3, 'square'); });
      for (const m of g.mates) m.x += (m.tx - m.x) * Math.min(1, dt * 3);
      gcue(g, 'eject', 2, () => sweep(500, 80, 1.2, .1, 'sawtooth'));
      const red = g.mates[0];
      if (T > 2) { red.vy -= 900 * dt; red.y += red.vy * dt; red.rot += dt * 8; }
    },
    over(g, T, t) {
      g.mates.forEach((m, i) => {
        if (i === 0 && T > 2) { ctx.save(); ctx.translate(m.x, m.y - 14); ctx.rotate(m.rot); drawCrewmate(0, 14, m.col, 1, 1.4, true, t, false); ctx.restore(); }
        else drawCrewmate(m.x, m.y, m.col, 1, 1.4, false, t, Math.abs(m.x - m.tx) > 2);
      });
    },
    screen(g, T) { if (T > .2 && T < 1.9) caption('АВАРИЙНОЕ СОБРАНИЕ', `700 24px ${ROUND}`, H * .5, '#ff3b3b', Math.floor(T * 6) % 2 ? .4 : 1); },
  },
  squid: {
    init(g) { g.say = 'Игрок 456 прошёл'; g.sayCol = '#ff8ab8'; g.conf = []; },
    update(g, T, dt) {
      if (T < 2.8 && Math.random() < .7) g.conf.push({ x: rand(0, W), y: S.camY - 10, vy: rand(80, 160), r: rand(0, 6), c: pick(['#ff2a7a', '#7fe0c8', '#ffd23f', '#ffffff']) });
      for (const c of g.conf) { c.y += c.vy * dt; c.r += dt * 6; }
      gcue(g, 'yay', .3, () => [523, 659, 784, 1046].forEach((f, i) => tone(f, .4, .07, i * .1, 'triangle')));
    },
    over(g) { for (const c of g.conf) { ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.r); ctx.fillStyle = c.c; ctx.fillRect(-4, -2, 8, 4); ctx.restore(); } },
  },
  orbit: {
    init(g) { g.say = 'Взлёт разрешён'; },
    update(g, T, dt) {
      g.letters.forEach((l, i) => {
        if (T < .3 + i * .14) return;
        l.vy -= 700 * dt;
        if (Math.random() < .6) S.parts.push({ x: l.x + l.w / 2 + l.dx + rand(-6, 6), y: l.base + l.dy + 4, vx: rand(-20, 20), vy: rand(60, 140), life: .5, t: 0, color: pick(['#ff7a3d', '#ffd23f', '#ffffff']), size: 3 });
      });
      gcue(g, 'ign', .3, () => noise(2, .25, 300, 'lowpass'));
    },
  },
  blocks: {
    init(g) { g.say = 'Линия! +100'; g.sayAt = 1.3; g.sayCol = '#00e5ff'; },
    update(g, T) {
      for (const l of g.letters) l.tint = T < 1 && Math.floor(T * 8) % 2 ? '#ffffff' : null;
      gcue(g, 'clear', 1, () => { tone(1046, .2, .1, 0, 'square'); tone(1318, .3, .1, .1, 'square'); for (const l of g.letters) l.a = 0; for (let i = 0; i < 20; i++) burst(rand(g.x0, g.x1), midY(g), 2, pick(Object.values(TCOL)), 160, 5); });
    },
    over(g, T) { if (T > .9 && T < 1.25) { const k = (T - .9) / .35; ctx.globalAlpha = 1 - k; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, g.top - 10, W, g.base - g.top + 20); ctx.globalAlpha = 1; } },
  },
  cube: {
    init(g) { g.say = 'Ш-ш-ш… бум.'; g.sayAt = 2.4; g.cx = W + 20; },
    update(g, T, dt) {
      if (T < 1.3) g.cx += (g.x1 - 30 - g.cx) * Math.min(1, dt * 2);
      gcue(g, 'hiss', 1.3, () => noise(.9, .15, 3000));
      gcue(g, 'boom', 2.2, () => {
        noise(.9, .8, 500, 'lowpass'); S.shake = .5;
        for (const l of g.letters) { l.vx = rand(-260, 260); l.vy = rand(-520, -220); l.spin = rand(-8, 8); }
        burst(g.cx, g.top, 40, '#5bd75b', 300, 5);
      });
      if (T > 2.2) for (const l of g.letters) { l.vy += 1100 * dt; l.rot += (l.spin || 0) * dt; l.a = Math.max(0, l.a - dt * .5); }
    },
    over(g, T) {
      if (T < 2.2) drawCreeper(g.cx, g.top, T > 1.3 ? T - 1.3 : -1);
      else if (T < 2.7) { const k = (T - 2.2) / .5; ctx.globalAlpha = 1 - k; circle(g.cx + 9, g.top - 15, 40 + 120 * k, '#fff3c4'); ctx.globalAlpha = 1; }
    },
  },
  club: {
    init(g) { g.say = 'Где мой разум?'; g.sayAt = 2.2; g.n = 0; },
    update(g, T, dt) {
      // the credits above come down like buildings
      if (T > .3 && Math.random() < .5) {
        const c = plats.filter(q => !q.end && !q.fall && q.base - S.camY > -20 && q.base - S.camY < g.top - S.camY - 20);
        if (c.length) { const q = pick(c); q.fall = { vy: 0 }; }
      }
      for (const q of plats) if (q.fall) { q.fall.vy += 700 * dt; q.base += q.fall.vy * dt; q.top += q.fall.vy * dt; if (Math.random() < .2) S.parts.push({ x: q.x + rand(0, q.w), y: q.base, vx: rand(-30, 30), vy: rand(-40, 0), life: .8, t: 0, color: '#6b6a52', size: 3 }); }
      gcue(g, 'rumble', .3, () => noise(2.5, .3, 120, 'lowpass'));
    },
  },
  upside: {
    init(g) { g.say = 'Ты видел изнанку'; g.sayAt = 2.2; g.sayCol = '#ff4a4a'; },
    update(g, T, dt) {
      g.letters.forEach((l, i) => { const k = clamp((T - .3 - i * .12) / .4, 0, 1); l.rot = Math.PI * ease(k); l.tint = k > .5 ? '#ff3b3b' : null; });
      gcue(g, 'flip', .3, () => sweep(300, 60, 1.5, .1, 'sawtooth'));
    },
    screen(g, T) { if (Math.random() < .08 && T < 2.5) { ctx.fillStyle = 'rgba(255,40,40,.2)'; ctx.fillRect(0, 0, W, H); } },
  },
  wizard: {
    init(g) { g.say = 'Вингардиум левиоса!'; },
    update(g, T) {
      g.letters.forEach((l, i) => { l.dy = -30 * ease(clamp(T / 1.2, 0, 1)) + Math.sin(T * 3 + i) * 6; l.rot = Math.sin(T * 2 + i) * .08; });
      if (Math.random() < .5) S.parts.push({ x: rand(g.x0, g.x1), y: g.base - rand(0, g.size), vx: rand(-20, 20), vy: rand(-60, -20), life: .9, t: 0, color: '#ffd75e', size: 2 });
      gcue(g, 'spell', .2, () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, .6, .05, i * .12)));
    },
    over(g, T, t) {
      const a = T * 3, x = (g.x0 + g.x1) / 2 + Math.cos(a) * (g.x1 - g.x0) * .6, y = midY(g) - 30 + Math.sin(a * 2) * 30;
      drawCollectible(x, y, t);
    },
  },
  dino: {
    init(g) { g.say = 'Жизнь найдёт путь'; g.sayAt = 2.3; },
    update(g, T, dt) {
      [.3, 1, 1.7].forEach((at, i) => gcue(g, 'stomp' + i, at, () => { noise(.5, .8, 90, 'lowpass'); S.shake = .45; for (const l of g.letters) l.vy = -rand(180, 320); }));
      for (const l of g.letters) { l.vy += 1200 * dt; if (l.dy > 0) { l.dy = 0; l.vy = 0; } }
      gcue(g, 'roar', 2.2, () => sweep(160, 50, 1.4, .2, 'sawtooth'));
    },
  },
  deep: {
    init(g) { g.say = 'Левиафан сыт'; g.sayAt = 2.6; g.lev = { x: -80, y: midY(g), vx: 330, len: 380, t: 0, pts: [] }; },
    update(g, T, dt) {
      const L = g.lev;
      if (T < .3) return;
      L.t += dt; L.x += L.vx * dt; leviathanPts(L);
      for (const l of g.letters) if (l.a > 0 && L.x > l.x + l.w / 2) { l.a = 0; burst(l.x + l.w / 2, midY(g), 8, '#bfefff', 80, 3); sweep(300, 120, .2, .06, 'sine'); }
      gcue(g, 'roar', .3, () => sweep(90, 45, 1.4, .18, 'sawtooth'));
    },
    over(g, T) { if (T > .3) drawLeviathan(g.lev, 1); },
  },
  basement: {
    init(g) { g.say = 'Слёзы кончились'; g.sayAt = 2.4; g.drops = []; },
    update(g, T, dt) {
      if (T < 2.2 && Math.random() < .8) g.drops.push({ x: rand(g.x0, g.x1), y: S.camY - 10, vy: rand(260, 360) });
      for (const d of g.drops) {
        d.y += d.vy * dt;
        if (!d.hit && d.y > g.top) { d.hit = true; const l = g.letters.find(q => d.x >= q.x && d.x <= q.x + q.w); if (l) l.tint = '#9fd0ff'; burst(d.x, g.top, 3, '#9fd0ff', 60, 2); }
      }
      g.drops = g.drops.filter(d => !d.hit);
    },
    over(g) { ctx.fillStyle = 'rgba(120,180,255,.9)'; for (const d of g.drops) { ctx.beginPath(); ctx.ellipse(d.x, d.y, 3, 5, 0, 0, PI2); ctx.fill(); } },
  },
  night: {
    init(g) { g.say = ''; },
    update(g, T) {
      gcue(g, 'dark', .1, () => noise(.3, .3, 200, 'lowpass'));
      gcue(g, 'chime', 1.6, () => [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, .5, .08, i * .18, 'triangle')));
      gcue(g, 'cheer', 2.6, () => noise(1.5, .25, 1500, 'bandpass'));
    },
    screen(g, T, t) {
      if (T < 1.6) {
        ctx.fillStyle = 'rgba(0,0,0,.92)'; ctx.fillRect(0, 0, W, H);
        drawAnimatronic(W * .25, H * .55, 1.2, false, t); drawAnimatronic(W * .75, H * .5, 1.2, false, t);
      } else {
        const k = clamp((T - 1.6) / .5, 0, 1);
        ctx.shadowColor = '#ffdd55'; ctx.shadowBlur = 20;
        caption('6:00', `700 72px ${UMONO}`, H * .42, '#ffffff', k);
        caption('УТРО', `700 28px ${UMONO}`, H * .42 + 36, '#ffdd55', k);
        ctx.shadowBlur = 0;
      }
    },
  },
  chomp: {
    init(g) { g.say = 'Вака-вака'; g.sayAt = 2.6; g.sayCol = '#ffe14d'; g.px = g.x0 - 70; g.waka = 0; },
    update(g, T, dt) {
      if (T < .3) return;
      g.px += 170 * dt; g.waka -= dt;
      if (g.waka <= 0 && g.px < g.x1 + 40) { g.waka = .22; sweep(g.flip ? 300 : 500, g.flip ? 500 : 300, .1, .06); g.flip = !g.flip; }
      for (const l of g.letters) if (l.a > 0 && g.px > l.x + l.w / 2) l.a = 0;
    },
    over(g, T, t) {
      if (T < .3) return;
      const y = midY(g), m = Math.abs(Math.sin(t * .02)) * .9 + .05;
      ctx.shadowColor = '#ffe14d'; ctx.shadowBlur = 18; ctx.fillStyle = '#ffe14d';
      ctx.beginPath(); ctx.moveTo(g.px, y); ctx.arc(g.px, y, g.size * .42, m * .5, PI2 - m * .5); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
      circle(g.px + 4, y - g.size * .22, 3, '#000');
      // frightened ghosts follow
      for (let i = 1; i <= 2; i++) {
        const x = g.px - 70 * i;
        ctx.fillStyle = '#2121ff'; ctx.beginPath(); ctx.arc(x, y - 4, 16, Math.PI, PI2); ctx.lineTo(x + 16, y + 14); ctx.lineTo(x - 16, y + 14); ctx.fill();
        ctx.fillStyle = '#ffb8ae'; ctx.fillRect(x - 7, y - 8, 4, 4); ctx.fillRect(x + 3, y - 8, 4, 4);
      }
    },
  },
  snap: {
    init(g) { g.say = 'Идеально сбалансировано'; g.sayAt = 2.2; },
    update(g, T, dt) {
      gcue(g, 'snap', .5, () => { noise(.08, .7, 2500); noise(.8, .2, 400, 'lowpass'); });
      if (T > .6) for (const l of g.letters) if (l.word === 0) {
        l.a = Math.max(0, l.a - dt * .8); l.dx += dt * 20;
        if (l.a > 0 && Math.random() < .7) S.parts.push({ x: l.x + l.dx + rand(0, l.w), y: l.base - rand(0, g.size * .7), vx: rand(30, 110), vy: rand(-40, 10), life: rand(.8, 1.5), t: 0, color: pick(['#8a6a52', '#6b5040', '#b49478']), size: 2 });
      }
    },
  },
  code: {
    init(g) { g.say = 'Конец — это тоже код'; g.sayAt = 2.2; g.sayCol = '#9dffb6'; },
    update(g, T, dt) {
      if (T < .9) for (const l of g.letters) { l.dx = (Math.random() - .5) * 6; l.tint = Math.random() < .3 ? '#00ff6a' : null; }
      gcue(g, 'fall', .9, () => { sweep(1800, 200, .8, .06, 'sawtooth'); g.letters.forEach((l, i) => { l.vy = 40 + i * 30; }); });
      if (T > .9) for (const l of g.letters) { l.vy += 600 * dt; l.tint = '#00ff6a'; l.a = Math.max(0, l.a - dt * .6); if (Math.random() < .5) S.parts.push({ x: l.x + l.w / 2 + l.dx, y: l.base + l.dy - g.size * .5, vx: 0, vy: 120, life: .6, t: 0, color: '#00ff6a', size: 3 }); }
    },
  },
  liner: {
    init(g) { g.say = 'Я король мира!'; g.sayAt = .8; g.water = 0; },
    update(g, T, dt) {
      g.water = Math.min(H * .55, g.water + dt * 110);
      const surf = S.camY + H - g.water;
      for (const l of g.letters) if (l.base + l.dy - g.size * .3 > surf) { l.vy = 30; l.a = Math.max(0, l.a - dt * .35); if (Math.random() < .2) S.parts.push({ x: l.x + l.w / 2, y: l.base + l.dy - g.size * .5, vx: rand(-10, 10), vy: -80, life: .7, t: 0, color: '#cfefff', size: 3 }); }
    },
    screen(g, T, t) {
      const top = H - g.water;
      const grd = ctx.createLinearGradient(0, top, 0, H); grd.addColorStop(0, 'rgba(30,90,150,.75)'); grd.addColorStop(1, 'rgba(2,10,24,.95)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 12) ctx.lineTo(x, top + Math.sin(x * .03 + t * .003) * 5);
      ctx.lineTo(W, H); ctx.fill();
    },
  },
};
