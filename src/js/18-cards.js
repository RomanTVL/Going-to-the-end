function drawIntro() {
  const T = S.modeT, a = T < 2.3 ? 1 : 1 - (T - 2.3) / .7;
  ctx.fillStyle = `rgba(0,0,0,${clamp(a, 0, 1)})`; ctx.fillRect(0, 0, W, H);
  const k = clamp(a, 0, 1) * clamp(T / .4, 0, 1);
  if (LV.props.length) {
    ctx.save(); ctx.globalAlpha = .18 * k; ctx.translate(CX, H * .45); ctx.scale(3.2, 3.2);
    PROPS[LV.props[0]]({ ph: 0, n: 0, side: 0, s: 1 }, performance.now());
    ctx.restore();
  }
  // a film leader counting down behind the title card
  const cy = H * .45, n = clamp(3 - Math.floor(T / .8), 1, 3), sw = (T % .8) / .8;
  ctx.globalAlpha = .12 * k; ctx.strokeStyle = '#efe8dc'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(CX, cy, 170, 0, PI2); ctx.moveTo(CX - 230, cy); ctx.lineTo(CX + 230, cy); ctx.moveTo(CX, cy - 230); ctx.lineTo(CX, cy + 230); ctx.stroke();
  ctx.fillStyle = '#efe8dc'; ctx.globalAlpha = .06 * k;
  ctx.beginPath(); ctx.moveTo(CX, cy); ctx.arc(CX, cy, 170, -Math.PI / 2, -Math.PI / 2 + sw * PI2); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = .1 * k; ctx.font = `600 220px ${SERIF}`; ctx.textBaseline = 'middle'; ctx.fillText(String(n), CX, cy + 10); ctx.textBaseline = 'alphabetic';
  caption(`СЕАНС ${S.li + 1} ИЗ ${LEVELS.length}`, `500 12px ${MONO}`, H * .33, '#8e877c', k);
  ctx.shadowColor = LV.pal.accent; ctx.shadowBlur = 20;
  caption(LV.name, LV.fonts.head[0], H * .33 + 50, LV.pal.light ? '#ffffff' : LV.pal.film, k);
  ctx.shadowBlur = 0;
  caption(LV.genre, `italic 500 20px ${SERIF}`, H * .33 + 86, '#a59d92', k);
  caption(`ТАЙМЕР ${fmt(S.par)} · ЗВЁЗД ${stars.length}`, `500 12px ${MONO}`, H * .33 + 124, LV.pal.accent === '#2121ff' ? '#6f7cff' : LV.pal.accent, k);
  caption(introHint(), `500 11px ${MONO}`, H * .33 + 150, '#8e877c', k);
}
function introHint() {
  return {
    bullet: 'следи за красным лазером', walker: 'прыгай на грибы сверху', nail: 'гвозди блестят перед падением',
    redlight: 'двигайся, только пока кукла поёт', meteor: 'гравитация слабая, прыжки длинные', creeper: 'криперы взрывают слова',
    bludger: 'бладжеры отскакивают от краёв', chaser: 'не дай себя догнать', code: 'красный код падает столбами сверху', water: 'вода поднимается снизу',
    double: 'не стой на месте: ты догонишь себя', crew: 'предатель вспыхивает красным, прыжок сверху выкидывает', tetro: 'упавшая фигура становится платформой',
    flip: 'гирлянда мигает — сейчас перевернётся', rex: 'стакан дрожит — сейчас подбросит', dark: 'на свету они замирают', snap: 'перчатка светится — половина слов исчезнет', host: 'черепа плюются слезами крестом', leviathan: 'хватай пузыри, в воде можно грести прыжком',
  }[LV.hazard] || 'дойди до конца';
}

// a frame stuck in the gate melts from the dot outward, then the slate
function drawCut() {
  const T = S.cutT, b = S.burn;
  if (S.jump && T < .35) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); drawAnimatronic(CX, H / 2, 7 + T * 6, true, 0); return; }
  if (T >= .35) S.jump = 0;
  if (b && T < .55) {
    const r = 30 + (T / .55) * 900;
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(.55, 'rgba(0,0,0,1)');
    g.addColorStop(.7, 'rgba(255,248,225,.95)');
    g.addColorStop(.82, 'rgba(255,150,50,.85)');
    g.addColorStop(.92, 'rgba(120,30,0,.5)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  }
  const k = clamp((T - .45) / .2, 0, 1);
  if (k <= 0) return;
  caption('Стоп. Снято.', `italic 600 64px ${SERIF}`, H / 2 - 10, '#efe8dc', k);
  caption(S.cutWhy.toUpperCase(), `500 13px ${MONO}`, H / 2 + 26, '#8e877c', k);
  caption(`ДУБЛЬ ${S.take}`, `500 13px ${MONO}`, H / 2 + 52, CUT, k);
}

function drawClear() {
  const T = S.modeT, r = RUN.res[S.li];
  if (T < 1.1 || !r) return;
  const k = clamp((T - 1.1) / .8, 0, 1), ok = r.t <= r.par;
  // a ticket stub over the still-running film
  ctx.fillStyle = `rgba(6,5,8,${.86 * k})`; rr(28, H * .1, W - 56, 190, 10); ctx.fill();
  ctx.strokeStyle = `rgba(255,255,255,${.12 * k})`; ctx.lineWidth = 1; rr(28, H * .1, W - 56, 190, 10); ctx.stroke();
  ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.moveTo(40, H * .1 + 146); ctx.lineTo(W - 40, H * .1 + 146); ctx.stroke(); ctx.setLineDash([]);
  caption(`СЕАНС ${S.li + 1} ОКОНЧЕН`, `500 12px ${MONO}`, H * .1 + 36, '#a59d92', k);
  caption(LV.name, LV.fonts.head[0], H * .1 + 76, LV.pal.light ? '#ffffff' : LV.pal.film, k);
  // time against the timer as a bar
  const bw = 300, bx = CX - bw / 2, by = H * .1 + 104, f = clamp(r.t / (r.par * 1.6), 0, 1);
  ctx.globalAlpha = k; ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(bx, by, bw, 6);
  ctx.fillStyle = ok ? '#b9f27c' : CUT; ctx.fillRect(bx, by, bw * f, 6);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(bx + bw / 1.6 - 1, by - 4, 2, 14); ctx.globalAlpha = 1;
  caption(ok ? `${fmt(r.t)} — успел, таймер ${fmt(r.par)}` : `${fmt(r.t)} — опоздал на ${fmt(r.t - r.par)}`, `500 13px ${MONO}`, by + 34, ok ? '#b9f27c' : CUT, k);
  caption(`★ ${r.got} / ${r.total}`, `500 13px ${MONO}`, by + 58, LV.pal.star, k);
  if (T > 2.2) caption(`ПРОБЕЛ — СЛЕДУЮЩИЙ СЕАНС: ${LEVELS[S.li + 1].name.toUpperCase()}`, `500 11px ${MONO}`, H - 30, LV.pal.light ? '#1b1b3a' : '#a59d92', k);
}
