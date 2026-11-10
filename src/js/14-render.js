// ---------- render ----------
const grain = document.createElement('canvas');
grain.width = grain.height = 160;
{
  const g = grain.getContext('2d'), img = g.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  g.putImageData(img, 0, 0);
}
const grainPat = ctx.createPattern(grain, 'repeat');

function drawText(pl, alpha, dy = 0, jitter = 0) {
  ctx.globalAlpha = alpha;
  ctx.font = pl.font;
  // cartoon films wobble like rubber, the neon film splits its colours like a worn tape
  if (LV.wobble) dy += Math.sin(performance.now() * .004 + pl.x * .05) * 1.6;
  if (LV.pal.shadow) { ctx.fillStyle = LV.pal.shadow; ctx.fillText(pl.text, pl.x + jitter + 2, pl.base + dy + 2); }
  if (LV.chroma) { const a0 = ctx.globalAlpha; ctx.globalAlpha = a0 * .55; ctx.fillStyle = '#ff2ad8'; ctx.fillText(pl.text, pl.x + jitter - 1, pl.base + dy); ctx.fillStyle = '#00f0ff'; ctx.fillText(pl.text, pl.x + jitter + 1, pl.base + dy); ctx.globalAlpha = a0; }
  if (LV.pal.outline && (pl.glow || pl.size >= 26)) {
    // red outlined titles, the way that show sets its name
    ctx.shadowColor = LV.pal.outline; ctx.shadowBlur = 12; ctx.strokeStyle = LV.pal.outline; ctx.lineWidth = 1.6;
    ctx.strokeText(pl.text, pl.x + jitter, pl.base + dy); ctx.fillStyle = 'rgba(10,6,10,.9)'; ctx.fillText(pl.text, pl.x + jitter, pl.base + dy);
    return;
  }
  ctx.fillStyle = pl.color;
  ctx.fillText(pl.text, pl.x + jitter, pl.base + dy);
}
// lines of text centred on the frame; a fifth item draws a button frame around the line
const PAUSE_BTN = { x0: CX - 150, x1: CX + 150, y0: H / 2 + 42, y1: H / 2 + 78 };
function drawWords(c, words) {
  c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.globalAlpha = 1;
  for (const [text, font, y, color, box] of words) {
    c.font = font; c.fillStyle = color; c.fillText(text, CX, y);
    if (box) { c.strokeStyle = 'rgba(239,232,220,.55)'; c.lineWidth = 1.2; c.strokeRect(PAUSE_BTN.x0 + .5, PAUSE_BTN.y0 + .5, PAUSE_BTN.x1 - PAUSE_BTN.x0, PAUSE_BTN.y1 - PAUSE_BTN.y0); }
  }
}
function caption(text, font, y, color, alpha = 1) {
  ctx.globalAlpha = alpha; ctx.font = font; ctx.fillStyle = color; ctx.fillText(text, CX, y); ctx.globalAlpha = 1;
}

function render(t) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.globalAlpha = 1;
  const P = LV.pal;
  ctx.fillStyle = P.bg;
  ctx.fillRect(0, 0, W, H);
  if (S.mode === 'menu') { drawMenu(t); finish(t); drawReel(t); return; }
  const p = S.p, cam = S.camY;
  const still = S.mode === 'pause';
  const flick = REDUCED || still ? 1 : .95 + .05 * Math.random();
  // after THE END of a guest film the world keeps going; only the finale fades into its ending
  const fade = S.mode === 'ending' ? clamp(S.modeT / 1.6, 0, 1) : 0;
  if (S.shake > 0 && !REDUCED) ctx.translate((Math.random() - .5) * 14 * S.shake, (Math.random() - .5) * 14 * S.shake);

  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  if (LV.back) BACK[LV.back](t, cam, 1 - fade);
  ctx.globalAlpha = 1;
  drawBeam(t, 1 - fade);

  ctx.save();
  ctx.translate(0, -cam);
  drawProps(t, cam);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  for (const d of deco) {
    if (d.base - cam < -40 || d.base - cam > H + 100) continue;
    ctx.globalAlpha = .8 * flick * (1 - fade); ctx.font = d.font; ctx.fillStyle = d.color; ctx.fillText(d.text, d.x, d.base);
  }
  const dx0 = p.x + PW / 2, dy0 = p.y + PH / 2;
  for (const pl of plats) {
    const sy = pl.base - cam;
    if (sy < -40 || sy > H + 120) continue;
    if (pl.block) { ctx.globalAlpha = 1; drawBlock(pl.x, pl.top, pl.block); continue; }
    if (pl.end && S.gag) continue;
    let a = flick * (pl.end ? 1 : 1 - fade);
    // the other world's words, and words turned to dust
    if (pl.world && pl.world !== S.world) a *= .16;
    if (pl.dust > 0) a *= clamp((pl.dust - 2.7) / .5, 0, 1);
    else if (pl.back > 0) a *= 1 - pl.back / .5;
    if (a <= .01) continue;
    if (pl.gone) {
      if (pl.goneT >= 1) continue;
      drawText(pl, a * (1 - pl.goneT), pl.goneT * pl.goneT * 160);
      continue;
    }
    if (pl.blink) {
      // a dying bulb: stutters just before it goes dark
      const ph = (S.clock + pl.phase) % pl.blink;
      if (pl.off) a *= .12;
      else if (ph > pl.blink * .52 && !REDUCED && !still) a *= Math.random() < .5 ? .35 : 1;
    }
    const standing = p.ground === pl;
    const shake = pl.fragile && pl.hold > 0 && !REDUCED ? (Math.random() - .5) * 3 * (pl.hold / .5) : 0;
    if (pl.fragile) a *= .62 + .1 * Math.sin(t * .006 + pl.x);
    // words light up as the dot comes near them
    const near = Math.max(0, 1 - Math.hypot(pl.x + pl.w / 2 - dx0, pl.top - dy0) / 110);
    if (pl.glow || standing || near > 0) { ctx.shadowColor = P.light ? 'rgba(0,0,0,.25)' : P.glowCol || 'rgba(255,240,210,.55)'; ctx.shadowBlur = standing ? 16 : pl.glow ? 18 : 12 * near; }
    drawText(pl, a, 0, shake);
    ctx.shadowBlur = 0;
    if (pl.fragile) {
      // a dashed hairline under a name that will not hold you for long
      ctx.globalAlpha = a * .6; ctx.fillStyle = P.dim;
      for (let x = pl.x; x < pl.x + pl.w; x += 6) ctx.fillRect(x + shake, pl.base + 5, 3, 1.2);
    }
  }

  for (const s of stars) {
    if (s.got || s.y - cam < -30 || s.y - cam > H + 30) continue;
    ctx.globalAlpha = (.8 + .2 * Math.sin(t * .006 + s.y)) * (1 - fade);
    drawCollectible(s.x, s.y + (REDUCED ? 0 : Math.sin(t * .003 + s.x) * 2.5), t, s.L || LV);
  }
  ctx.globalAlpha = 1;

  drawHazards(t, cam);
  if (S.mode === 'clear' && S.gag) drawGagWorld(t);

  // your double, a second behind
  if (S.twin && S.mode === 'play') {
    const j = REDUCED ? 0 : (Math.random() - .5) * 2;
    ctx.globalAlpha = Math.random() < .1 ? .4 : .95;
    ctx.shadowColor = P.accent; ctx.shadowBlur = 18;
    circle(S.twin.x + j, S.twin.y, 7, 'rgba(255,95,162,.35)');
    circle(S.twin.x + j, S.twin.y, 3.5, '#1a1a12');
    ctx.strokeStyle = P.accent; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(S.twin.x + j, S.twin.y, 7, 0, PI2); ctx.stroke();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }

  // the ghost of your best take
  if (S.ghost && (S.mode === 'play' || S.mode === 'cut')) {
    const i = Math.floor(S.time * REC_HZ) * 2;
    if (i + 1 < S.ghost.length) {
      ctx.globalAlpha = .35; ctx.strokeStyle = P.film; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(S.ghost[i] + PW / 2, S.ghost[i + 1] + PH / 2, 5, 0, PI2); ctx.stroke();
    }
  }

  for (const q of S.parts) {
    ctx.globalAlpha = 1 - q.t / q.life; ctx.fillStyle = q.color;
    ctx.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size, q.size);
  }
  // rings where the dot lands, and +1 over collected stars
  for (const r of S.ripples) {
    const k = r.t / .6;
    ctx.globalAlpha = (1 - k) * (.35 + .4 * r.k); ctx.strokeStyle = P.light ? '#ffffff' : P.film; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(r.x, r.y, 6 + 30 * k, 1.5 + 5 * k, 0, 0, PI2); ctx.stroke();
  }
  for (const f of S.floaters) {
    ctx.globalAlpha = 1 - f.t; ctx.fillStyle = f.col || P.star; ctx.font = `600 ${f.text.length > 3 ? 11 : 14}px ${MONO}`; ctx.textAlign = 'center';
    ctx.fillText(f.text, f.x, f.y - 10 - f.t * 30); ctx.textAlign = 'left';
  }
  ctx.globalAlpha = 1;

  // the dot
  const hideDot = S.mode === 'cut' || S.mode === 'ending' && (S.ending === 'truck' || S.ending === 'full' && S.modeT > 2.4);
  if (!hideDot) {
    p.trail.forEach((q, i) => {
      ctx.globalAlpha = .25 * (1 - i / p.trail.length);
      ctx.fillStyle = P.light ? '#ffffff' : P.film;
      ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(1, 4 - i * .15), 0, PI2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    // the dot: a soft halo tinted by the film, a hot core; a red heart in the film about mercy
    const sq = p.squash, cx = p.x + PW / 2, cy = p.y + PH / 2 + sq * 2;
    if (LV.soulHeart) drawSoul(cx, cy); else {
    // after one life has been lived, the dot is gold
    const gold = golden(), tint = gold ? '#ffc93a' : P.accent;
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, gold ? 30 : 24);
    halo.addColorStop(0, gold ? 'rgba(255,214,100,.6)' : P.light ? 'rgba(255,255,255,.55)' : 'rgba(255,246,225,.42)'); halo.addColorStop(.45, hexA(tint, gold ? .25 : .14)); halo.addColorStop(1, hexA(tint, 0));
    ctx.fillStyle = halo; ctx.fillRect(cx - 30, cy - 30, 60, 60);
    ctx.shadowColor = gold ? '#ffb300' : P.light ? 'rgba(0,0,0,.5)' : '#fff3d6'; ctx.shadowBlur = 16; ctx.fillStyle = gold ? '#ffd23f' : '#fffaf0';
    ctx.beginPath(); ctx.ellipse(cx, cy, 5 * (1 + .45 * sq), 5 * (1 - .4 * sq), 0, 0, PI2); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx - 1.2, cy - 1.4, 1.6, 0, PI2); ctx.fill();
    }
  }
  ctx.restore();

  if (LV.hazard === 'water' && S.mode !== 'ending') drawWater(t);
  if (LV.oxygen && S.mode !== 'ending') drawOxygen(t);
  if (LV.hazard === 'redlight' && (S.mode === 'play' || S.mode === 'pause' || S.mode === 'cut')) drawDoll();
  const live = S.mode === 'play' || S.mode === 'pause' || S.mode === 'cut';
  if (LV.hazard === 'flip' && S.mode !== 'ending') drawFlip(t);
  if (LV.hazard === 'rex' && live) drawRex(t);
  if (LV.hazard === 'dark' && live) drawNight(t);
  if (LV.hazard === 'snap' && live) drawGauntlet(t);
  if (S.mode !== 'ending') mech('draw', t);
  if (S.mode === 'clear' && S.gag) drawGagScreen(t);
  drawGrade();
  if (S.splice > 0) drawSplice();
  if (LV.sepia) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(190,140,80,.35)'; ctx.fillRect(0, 0, W, H); ctx.restore(); }

  // frame edges warm up red as you drift towards them
  if (S.mode === 'play') {
    const sy = p.y - cam, floor = H - (LV.hazard === 'water' ? S.water : 0);
    const top = clamp(1 - sy / 140, 0, 1), bot = clamp(1 - (floor - sy - PH) / 140, 0, 1);
    if (top > 0) { const g = ctx.createLinearGradient(0, 0, 0, 90); g.addColorStop(0, `rgba(255,74,61,${.45 * top})`); g.addColorStop(1, 'rgba(255,74,61,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 90); }
    if (bot > 0) { const g = ctx.createLinearGradient(0, floor, 0, floor - 90); g.addColorStop(0, `rgba(255,74,61,${.45 * bot})`); g.addColorStop(1, 'rgba(255,74,61,0)'); ctx.fillStyle = g; ctx.fillRect(0, floor - 90, W, 90); }
  }

  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (S.mode === 'ending') { drawEnding(t); finish(t, true); drawReel(t); return; }
  finish(t, P.light);
  if (S.mode === 'intro') drawIntro();
  if (S.mode === 'cut') drawCut();
  if (S.mode === 'over') drawOver();
  if (S.mode === 'clear') drawClear();
  if (S.mode === 'pause') {
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, W, H);
    const words = [['Пауза', `italic 500 44px ${SERIF}`, H / 2 - 16, '#efe8dc'], ['ПЛЁНКА ОСТАНОВЛЕНА · P — ПРОДОЛЖИТЬ', `500 12px ${MONO}`, H / 2 + 14, '#8e877c'],
      [RUN.kind === 'life' ? 'В МЕНЮ · Q · ЖИЗНЬ ЗАКОНЧИТСЯ' : 'В МЕНЮ · Q', `500 13px ${MONO}`, PAUSE_BTN.y1 - 12, '#efe8dc', true]];
    // with the blur on, the words go on a layer above it, so they stay sharp
    if (!fxPauseWords(words)) drawWords(ctx, words);
  }
  drawReel(t);
}

// film grain, a stray scratch and the vignette
function finish(t, light) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.save();
  ctx.globalAlpha = light ? .05 : .07;
  ctx.globalCompositeOperation = light ? 'multiply' : 'screen';
  if (S.mode !== 'pause') ctx.translate(Math.random() * 160, Math.random() * 160);
  ctx.fillStyle = grainPat; ctx.fillRect(-160, -160, W + 320, H + 320);
  ctx.restore();
  if (!REDUCED && S.mode !== 'pause' && Math.random() < .02) { ctx.fillStyle = 'rgba(239,232,220,.18)'; ctx.fillRect(Math.random() * W, 0, 1, H); }
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${light ? .25 : .7})`);
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
}
