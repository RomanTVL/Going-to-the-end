// ---------- hazards on screen ----------
function drawTruckSide(front, ground, beam) {
  // a heavy truck seen from the side, nose to the right
  ctx.save(); ctx.translate(front, ground);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(-250, 6, 290, 10, 0, 0, PI2); ctx.fill();
  // trailer
  const tg = ctx.createLinearGradient(0, -190, 0, -30);
  tg.addColorStop(0, '#d9d6cf'); tg.addColorStop(1, '#9b978f');
  ctx.fillStyle = tg; ctx.fillRect(-520, -190, 340, 162);
  ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 2;
  for (let x = -510; x < -190; x += 22) { ctx.beginPath(); ctx.moveTo(x, -186); ctx.lineTo(x, -32); ctx.stroke(); }
  ctx.fillStyle = '#2a2a2a'; ctx.fillRect(-520, -30, 340, 10);
  // cab
  ctx.fillStyle = '#b3121b';
  ctx.beginPath(); ctx.moveTo(-176, -20); ctx.lineTo(-176, -170); ctx.quadraticCurveTo(-176, -184, -160, -184);
  ctx.lineTo(-40, -184); ctx.quadraticCurveTo(-12, -180, -6, -150); ctx.lineTo(4, -60); ctx.lineTo(4, -20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7d0a10'; ctx.fillRect(-176, -64, 180, 8);
  ctx.fillStyle = '#a8d4f0'; ctx.beginPath(); ctx.moveTo(-90, -170); ctx.lineTo(-38, -170); ctx.quadraticCurveTo(-20, -166, -16, -146); ctx.lineTo(-12, -112); ctx.lineTo(-90, -112); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(-84, -164, 30, 6);
  ctx.strokeStyle = '#7d0a10'; ctx.lineWidth = 2; ctx.strokeRect(-150, -150, 50, 80);
  // grille, bumper and headlight
  ctx.fillStyle = '#d6d6d6'; ctx.fillRect(-2, -96, 10, 64);
  ctx.fillStyle = '#9a9a9a'; for (let y = -92; y < -36; y += 8) ctx.fillRect(-2, y, 10, 3);
  ctx.fillStyle = '#c9c9c9'; ctx.fillRect(-20, -30, 34, 14);
  ctx.fillStyle = '#fffbe6'; ctx.shadowColor = '#fff3b0'; ctx.shadowBlur = 24; ctx.fillRect(2, -56, 9, 14); ctx.shadowBlur = 0;
  if (beam) {
    const bg = ctx.createLinearGradient(10, 0, 220, 0); bg.addColorStop(0, 'rgba(255,248,200,.55)'); bg.addColorStop(1, 'rgba(255,248,200,0)');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(10, -56); ctx.lineTo(240, -110); ctx.lineTo(240, 10); ctx.lineTo(10, -42); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#3a3a3a'; ctx.fillRect(-182, -200, 8, 60);
  // wheels
  for (const wx of [-460, -400, -250, -130, -40]) {
    circle(wx, -14, 26, '#121212'); circle(wx, -14, 12, '#8a8a8a'); circle(wx, -14, 4, '#3a3a3a');
  }
  ctx.restore();
}

function drawCreeper(x, y, hissT) {
  const hiss = hissT >= 0, sw = hiss ? 1 + .12 * hissT + .05 * Math.sin(hissT * 40) : 1;
  ctx.save(); ctx.translate(x + 9, y); ctx.scale(sw, sw); ctx.translate(-9, 0);
  const flash = hiss && Math.floor(hissT * 8) % 2 === 0;
  const g = ['#4fbf3a', '#3d9c2c', '#64d24a', '#2f7d22'];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) px(c * 4.5, -30 + r * 4.5, 4.5, 4.5, flash ? '#ffffff' : g[(r * 3 + c * 5) % 4]);
  if (!flash) { px(4.5, -25.5, 3, 3, '#0a0a0a'); px(10.5, -25.5, 3, 3, '#0a0a0a'); px(7.5, -21, 3, 6, '#0a0a0a'); px(4.5, -18, 3, 4, '#0a0a0a'); px(10.5, -18, 3, 4, '#0a0a0a'); }
  px(0, -3, 7, 3, flash ? '#fff' : '#2f7d22'); px(11, -3, 7, 3, flash ? '#fff' : '#2f7d22');
  ctx.restore();
}
function leviathanPts(h) {
  const dir = Math.sign(h.vx);
  h.pts = [];
  for (let i = 0; i <= 26; i++) { const k = i / 26; h.pts.push([h.x - dir * h.len * k, h.y + Math.sin(k * 5 - h.t * 7) * 20 * k, (1 - k * .78) * 26]); }
}
function drawLeviathan(h, dir) {
  ctx.save();
  for (let i = h.pts.length - 1; i >= 0; i--) {
    const [x, y, r] = h.pts[i];
    const g = ctx.createRadialGradient(x, y - r * .4, 1, x, y, r);
    g.addColorStop(0, '#5c6b6a'); g.addColorStop(1, '#1d2626');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI2); ctx.fill();
    if (i % 3 === 0) { ctx.shadowColor = '#ff9a3c'; ctx.shadowBlur = 8; circle(x, y - r * .55, 2.4, '#ffb347'); ctx.shadowBlur = 0; }
  }
  // head with four mandibles
  ctx.translate(h.x, h.y); ctx.scale(dir, 1);
  ctx.fillStyle = '#3a4646'; ctx.beginPath(); ctx.ellipse(8, 0, 34, 22, 0, 0, PI2); ctx.fill();
  ctx.strokeStyle = '#2a3232'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  const open = 6 + Math.sin(h.t * 20) * 4;
  for (const [ay, sg] of [[-14, -1], [-6, -1], [6, 1], [14, 1]]) { ctx.beginPath(); ctx.moveTo(30, ay); ctx.lineTo(54, ay + sg * open); ctx.stroke(); }
  ctx.lineCap = 'butt';
  ctx.shadowColor = '#ff9a3c'; ctx.shadowBlur = 14; circle(18, -9, 3.5, '#ffb347'); circle(18, 9, 3.5, '#ffb347'); ctx.shadowBlur = 0;
  ctx.restore();
}
function drawCrewmate(x, y, col, dir, sc, red, t, walk) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * sc, sc);
  const st = walk ? Math.sin(t * .02) * 2.2 : 0;
  ctx.fillStyle = col;
  rr(-10, -16, 5, 10, 2); ctx.fill();
  rr(-6, -22, 14, 18, 7); ctx.fill();
  ctx.fillRect(-5, -6 + Math.max(0, st), 5, 6); ctx.fillRect(2, -6 + Math.max(0, -st), 5, 6);
  ctx.fillStyle = 'rgba(0,0,0,.28)'; rr(-10, -16, 5, 10, 2); ctx.fill(); ctx.fillRect(-6, -8, 14, 2);
  ctx.fillStyle = red ? '#ff2a2a' : '#9fe3ff';
  if (red) { ctx.shadowColor = '#ff2a2a'; ctx.shadowBlur = 10; }
  rr(1, -19, 9, 6, 3); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillRect(3, -18, 4, 1.6);
  ctx.restore();
}
function drawBlock(x, y, c, s = CELL) {
  ctx.fillStyle = c; ctx.fillRect(x, y, s, s);
  ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fillRect(x, y, s, 3); ctx.fillRect(x, y, 3, s);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x, y + s - 3, s, 3); ctx.fillRect(x + s - 3, y, 3, s);
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x + 5, y + 5, s - 10, s - 10);
}
function drawAnimatronic(x, y, s, lit, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (lit) {
    ctx.fillStyle = '#6b4226';
    circle(-14, -16, 7, '#6b4226'); circle(14, -16, 7, '#6b4226');
    ctx.beginPath(); ctx.ellipse(0, 0, 20, 19, 0, 0, PI2); ctx.fill();
    ctx.fillStyle = '#c9a07a'; ctx.beginPath(); ctx.ellipse(0, 8, 11, 8, 0, 0, PI2); ctx.fill();
    circle(0, 3, 3, '#1a1a1a');
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-10, -30, 20, 4); ctx.fillRect(-6, -42, 12, 12);
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-6, 12); ctx.lineTo(6, 12); ctx.stroke();
  }
  // eyes glow in the dark either way
  ctx.shadowColor = '#fff6c8'; ctx.shadowBlur = 12;
  const blink = Math.sin(t * .003 + x) > .97;
  if (!blink) { circle(-7, -4, 2.6, '#fffbe6'); circle(7, -4, 2.6, '#fffbe6'); }
  ctx.restore();
}

function drawHazards(t, cam) {
  for (const h of S.hz) {
    const w = clamp(h.t / (h.warn || 1), 0, 1);
    ctx.save();
    if (h.screen) ctx.translate(0, cam);
    if (HZDRAW[h.type]) { HZDRAW[h.type](h, t, cam, w); ctx.restore(); continue; }
    if (h.type === 'bullet') {
      if (!h.live) {
        // laser sight across the frame, then a crosshair where the shot comes from
        ctx.globalAlpha = .3 + .6 * w * (REDUCED ? 1 : .6 + .4 * Math.sin(t * .05));
        ctx.fillStyle = LV.pal.accent; ctx.fillRect(0, h.y - 1, W, 2);
        ctx.strokeStyle = LV.pal.accent; ctx.lineWidth = 2;
        const cx = h.vx > 0 ? 30 : W - 30, r = 14 - 4 * w;
        ctx.beginPath(); ctx.arc(cx, h.y, r, 0, PI2); ctx.moveTo(cx - 22, h.y); ctx.lineTo(cx + 22, h.y); ctx.moveTo(cx, h.y - 22); ctx.lineTo(cx, h.y + 22); ctx.stroke();
      } else {
        const dir = Math.sign(h.vx);
        const g = ctx.createLinearGradient(h.x - dir * 120, 0, h.x, 0);
        g.addColorStop(0, 'rgba(255,220,160,0)'); g.addColorStop(1, 'rgba(255,220,160,.85)');
        ctx.fillStyle = g; ctx.fillRect(Math.min(h.x, h.x - dir * 120), h.y - 2, 120, 4);
        ctx.shadowColor = '#ffb347'; ctx.shadowBlur = 16;
        const bg = ctx.createLinearGradient(0, h.y - 5, 0, h.y + 5); bg.addColorStop(0, '#fff2c6'); bg.addColorStop(1, '#c48a1a');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.ellipse(h.x, h.y, 13, 5, 0, 0, PI2); ctx.fill();
      }
    } else if (h.type === 'nail') {
      if (!h.live) {
        const s = 6 + 8 * w;
        ctx.globalAlpha = .4 + .6 * w; ctx.fillStyle = '#e8f4ff';
        ctx.fillRect(h.x - s, cam + 16, s * 2, 2); ctx.fillRect(h.x - 1, cam + 16 - s, 2, s * 2);
        ctx.globalAlpha = .14 * w; ctx.fillRect(h.x - 2, cam, 4, H);
      } else {
        ctx.translate(h.x, h.y - 12 * 1.7);
        ctx.shadowColor = 'rgba(200,230,255,.8)'; ctx.shadowBlur = 10;
        drawNail(1.7, '#eef3fa');
      }
    } else if (h.type === 'meteor') {
      if (!h.live) {
        ctx.globalAlpha = .4 + .6 * w;
        circle(clamp(h.x, 12, W - 12), clamp(h.y, cam + 12, cam + H - 12), 5 + 6 * w, LV.pal.accent);
      } else {
        const tx = h.x - h.vx * .3, ty = h.y - h.vy * .3;
        const g = ctx.createLinearGradient(tx, ty, h.x, h.y);
        g.addColorStop(0, 'rgba(255,122,61,0)'); g.addColorStop(1, 'rgba(255,190,110,.95)');
        ctx.strokeStyle = g; ctx.lineWidth = h.r * 1.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(h.x, h.y); ctx.stroke(); ctx.lineCap = 'butt';
        ctx.translate(h.x, h.y); ctx.rotate(h.t * h.spin);
        const rg = ctx.createRadialGradient(-h.r * .3, -h.r * .3, 1, 0, 0, h.r);
        rg.addColorStop(0, '#ffe2b0'); rg.addColorStop(.5, '#b45a1e'); rg.addColorStop(1, '#4a1c08');
        ctx.fillStyle = rg; ctx.beginPath();
        for (let i = 0; i < 9; i++) { const a = i / 9 * PI2, r = h.r * (.82 + .18 * Math.sin(i * 2.3)); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.closePath(); ctx.fill();
        circle(h.r * .25, h.r * .1, h.r * .18, 'rgba(60,20,5,.6)');
      }
    } else if (h.type === 'walker') {
      const x = h.pl.x + h.rx, y = h.pl.top;
      if (!h.alive) { ctx.globalAlpha = Math.max(0, 1 - h.sq * 2); ctx.fillStyle = '#8b4a22'; ctx.beginPath(); ctx.ellipse(x + 10, y - 3, 12, 4, 0, 0, PI2); ctx.fill(); }
      else {
        const step = Math.floor(t / 140) % 2;
        ctx.fillStyle = '#1a0f08'; ctx.fillRect(x + (step ? 1 : 3), y - 4, 7, 4); ctx.fillRect(x + (step ? 12 : 10), y - 4, 7, 4);
        ctx.fillStyle = '#f2d2a2'; ctx.fillRect(x + 5, y - 9, 10, 6);
        ctx.fillStyle = '#9b5420'; ctx.beginPath(); ctx.ellipse(x + 10, y - 11, 11, 9, 0, Math.PI, PI2); ctx.lineTo(x + 21, y - 8); ctx.lineTo(x - 1, y - 8); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillRect(x + 5, y - 15, 4, 5); ctx.fillRect(x + 11, y - 15, 4, 5);
        ctx.fillStyle = '#000'; ctx.fillRect(x + (h.dir > 0 ? 7 : 5), y - 13, 2, 3); ctx.fillRect(x + (h.dir > 0 ? 13 : 11), y - 13, 2, 3);
        ctx.fillRect(x + 4, y - 17, 5, 1.5); ctx.fillRect(x + 11, y - 17, 5, 1.5);
      }
    } else if (h.type === 'creeper') {
      const x = h.pl.x + h.rx, y = h.pl.top;
      if (h.state === 'boom') {
        const k = h.t / .5;
        const g = ctx.createRadialGradient(x + 9, y - 15, 0, x + 9, y - 15, 90 * (.4 + k));
        g.addColorStop(0, `rgba(255,255,255,${Math.max(0, 1 - k)})`); g.addColorStop(.4, `rgba(255,200,120,${Math.max(0, .8 * (1 - k))})`); g.addColorStop(1, 'rgba(120,120,120,0)');
        ctx.fillStyle = g; ctx.fillRect(x - 100, y - 120, 220, 220);
      } else drawCreeper(x, y, h.state === 'hiss' ? h.t : -1);
    } else if (h.type === 'bludger') {
      if (!h.live) { ctx.globalAlpha = w; ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(h.x, h.y, h.r * (2 - w), 0, PI2); ctx.stroke(); }
      else {
        ctx.globalAlpha = .25; circle(h.x - h.vx * .05, h.y - h.vy * .05, h.r, '#3a3a3a'); ctx.globalAlpha = 1;
        const g = ctx.createRadialGradient(h.x - 5, h.y - 5, 1, h.x, h.y, h.r);
        g.addColorStop(0, '#9a9a9a'); g.addColorStop(.6, '#3a3a3a'); g.addColorStop(1, '#111');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, PI2); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(h.x, h.y, h.r * .65, .4, 2.6); ctx.stroke();
      }
    } else if (h.type === 'chaser') {
      ctx.globalAlpha = h.live ? 1 : w * .6;
      ctx.translate(h.x, h.y); ctx.rotate(h.ang || 0);
      const m = h.live ? Math.abs(Math.sin(t * .02)) * .9 + .05 : .5;
      ctx.shadowColor = '#ffe14d'; ctx.shadowBlur = 18;
      ctx.fillStyle = '#ffe14d'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 21, m * .5, PI2 - m * .5); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0; circle(3, -11, 2.6, '#000');
    } else if (h.type === 'crew') {
      const x = h.pl.x + h.rx + 8, y = h.pl.top;
      if (!h.alive) { const k = h.sq / .8; ctx.globalAlpha = Math.max(0, 1 - k); ctx.translate(x, y - k * 160); ctx.rotate(k * 9); drawCrewmate(0, 0, h.col, h.dir, 1, h.imp, t, false); }
      else drawCrewmate(x, y, h.col, h.dir, 1, h.imp && h.flick < 0, t, true);
    } else if (h.type === 'tetro') {
      if (!h.live) {
        // the ghost of the piece at the top of the frame and the column it will fall down
        const ws = (Math.max(...h.cells.map(c => c[0])) + 1) * CELL;
        ctx.globalAlpha = .1 * w; ctx.fillStyle = TCOL[h.k]; ctx.fillRect(h.x, cam, ws, H);
        ctx.globalAlpha = .3 + .6 * w; ctx.strokeStyle = TCOL[h.k]; ctx.lineWidth = 2;
        for (const [cx, cy] of h.cells) ctx.strokeRect(h.x + cx * CELL + 1, cam + 10 + cy * CELL + 1, CELL - 2, CELL - 2);
      } else if (!h.locked) {
        ctx.shadowColor = TCOL[h.k]; ctx.shadowBlur = 14;
        for (const [cx, cy] of h.cells) drawBlock(h.x + cx * CELL, h.y + cy * CELL, TCOL[h.k]);
      }
    } else if (h.type === 'host') {
      const x = h.x, y = h.y, charge = h.cd < .9, sw = charge ? 1 + .15 * Math.sin(h.t * 40) : 1;
      ctx.translate(x, y); ctx.scale(sw, sw);
      ctx.fillStyle = '#5a3a2a'; ctx.beginPath(); ctx.ellipse(0, -2, 14, 5, 0, 0, PI2); ctx.fill();
      ctx.fillStyle = '#d8d0c0'; ctx.beginPath(); ctx.arc(0, -14, 11, Math.PI, PI2); ctx.lineTo(11, -4); ctx.lineTo(-11, -4); ctx.closePath(); ctx.fill();
      circle(-4, -13, 3, charge ? '#ff2a2a' : '#1a1a1a'); circle(4, -13, 3, charge ? '#ff2a2a' : '#1a1a1a');
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-5, -7, 10, 2);
    } else if (h.type === 'tear') {
      const g = ctx.createRadialGradient(h.x - 2, h.y - 2, 1, h.x, h.y, h.r);
      g.addColorStop(0, '#ffb0b0'); g.addColorStop(1, '#a8001a');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, PI2); ctx.fill();
    } else if (h.type === 'leviathan') {
      const dir = h.vx > 0 ? 1 : -1;
      if (!h.live) {
        // two orange eyes at the edge of the frame before it comes
        const ex = h.fromL ? 14 : W - 14, a = .35 + .65 * w * (Math.random() < .9 ? 1 : .3);
        ctx.globalAlpha = a; ctx.shadowColor = '#ff9a3c'; ctx.shadowBlur = 16;
        circle(ex, h.y - 7, 4, '#ffb347'); circle(ex, h.y + 7, 4, '#ffb347');
        ctx.globalAlpha = .12 * w; ctx.fillStyle = '#ff9a3c'; ctx.fillRect(0, h.y - 30, W, 60);
      } else drawLeviathan(h, dir);
    } else if (h.type === 'code') {
      ctx.font = `500 16px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (!h.live) {
        ctx.globalAlpha = .12 + .32 * w; ctx.fillStyle = '#ff2a2a'; ctx.fillRect(h.x - 10, 0, 20, H);
        ctx.fillStyle = '#ff6a6a';
        ctx.globalAlpha = .4 + .5 * w;
        for (let i = 0; i < 5; i++) ctx.fillText(GLYPHS[(h.seed + i + Math.floor(t / 90)) % GLYPHS.length], h.x, 14 + i * 18);
      } else {
        for (let i = 0; i < 16; i++) {
          const y = h.y - i * 17;
          if (y < -20 || y > H + 20) continue;
          ctx.globalAlpha = i === 0 ? 1 : .9 * (1 - i / 16);
          ctx.fillStyle = i === 0 ? '#ffffff' : '#ff3b3b';
          if (i === 0) { ctx.shadowColor = '#ff2a2a'; ctx.shadowBlur = 16; } else ctx.shadowBlur = 0;
          ctx.fillText(GLYPHS[(h.seed + i * 5 + Math.floor(t / 60)) % GLYPHS.length], h.x, y);
        }
      }
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// the doll and her song: drawn over the credits at the top of the frame
function drawDoll() {
  const R = S.rl, facing = R.phase === 'red' ? 1 : R.phase === 'turn' ? clamp(R.t / .45, 0, 1) : 0;
  const sx = Math.cos(facing * Math.PI);
  ctx.save(); ctx.translate(CX, 46);
  ctx.fillStyle = '#ff8a1e'; ctx.beginPath(); ctx.moveTo(-14, 10); ctx.lineTo(14, 10); ctx.lineTo(22, 46); ctx.lineTo(-22, 46); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd43b'; ctx.fillRect(-12, 8, 24, 10);
  ctx.fillStyle = '#f2f2f2'; ctx.fillRect(-12, 46, 8, 10); ctx.fillRect(4, 46, 8, 10);
  ctx.scale(Math.max(.08, Math.abs(sx)), 1);
  const front = facing > .5;
  ctx.fillStyle = '#121212';
  ctx.beginPath(); ctx.arc(0, -8, 17, 0, PI2); ctx.fill();
  circle(-17, 0, 6, '#121212'); circle(17, 0, 6, '#121212');
  if (front) {
    ctx.fillStyle = '#f6d3b8'; ctx.beginPath(); ctx.ellipse(0, -4, 13, 13, 0, 0, PI2); ctx.fill();
    ctx.fillStyle = '#121212'; ctx.fillRect(-13, -17, 26, 7);
    const red = R.phase === 'red';
    for (const ex of [-5, 5]) {
      if (red) { ctx.shadowColor = '#ff2a2a'; ctx.shadowBlur = 10; }
      circle(ex, -4, 2.6, red ? '#ff2a2a' : '#121212');
      ctx.shadowBlur = 0;
    }
    circle(-8, 1, 2.2, 'rgba(255,120,140,.6)'); circle(8, 1, 2.2, 'rgba(255,120,140,.6)');
    ctx.fillStyle = '#c0392b'; ctx.fillRect(-2, 4, 4, 1.5);
  }
  ctx.restore();
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const green = R.phase === 'green';
  caption(green ? 'ТИШЕ ЕДЕШЬ…' : 'СТОП', `700 12px ${UNB}`, 122, green ? '#7fe0c8' : '#ff2a7a', green ? .8 : 1);
  if (R.phase === 'red') {
    const g = ctx.createRadialGradient(CX, H / 2, H * .3, CX, H / 2, H * .75);
    g.addColorStop(0, 'rgba(255,42,122,0)'); g.addColorStop(1, 'rgba(255,42,122,.22)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
}


// rising bubbles and the oxygen gauge in the corner of the frame
function drawOxygen(t) {
  for (const b of S.bubbles) {
    ctx.globalAlpha = .9; ctx.strokeStyle = 'rgba(210,245,255,.85)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, PI2); ctx.stroke();
    ctx.fillStyle = 'rgba(160,230,255,.15)'; ctx.fill();
    circle(b.x - b.r * .35, b.y - b.r * .35, b.r * .22, 'rgba(255,255,255,.8)');
  }
  const o = clamp(S.oxy / 100, 0, 1), low = S.oxy < 30, cx = 38, cy = 38;
  ctx.globalAlpha = 1;
  ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.arc(cx, cy, 20, 0, PI2); ctx.stroke();
  ctx.strokeStyle = low ? (Math.sin(t * .02) > 0 ? '#ff4a3d' : '#ff9a3c') : '#7fe6ff';
  ctx.beginPath(); ctx.arc(cx, cy, 20, -Math.PI / 2, -Math.PI / 2 + o * PI2); ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `700 11px ${EXO}`; ctx.fillStyle = '#d9f7ff';
  ctx.fillText('O₂', cx, cy - 4); ctx.font = `500 10px ${EXO}`; ctx.fillText(String(Math.max(0, Math.round(S.oxy))), cx, cy + 8);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  if (low) {
    const g = ctx.createRadialGradient(CX, H / 2, H * .3, CX, H / 2, H * .8);
    g.addColorStop(0, 'rgba(0,20,40,0)'); g.addColorStop(1, `rgba(0,10,30,${.5 * (1 - o / .3)})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
}

// the sea rises from the bottom of the frame
function drawWater(t) {
  const top = H - S.water;
  const wave = x => top + Math.sin(x * .03 + t * .003) * 5 + Math.sin(x * .07 - t * .005) * 2;
  const g = ctx.createLinearGradient(0, top, 0, H);
  g.addColorStop(0, 'rgba(30,90,150,.82)'); g.addColorStop(1, 'rgba(2,10,24,.97)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 12) ctx.lineTo(x, wave(x));
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(220,240,255,.7)'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = 0; x <= W; x += 12) ctx.lineTo(x, wave(x));
  ctx.stroke();
  for (let i = 0; i < 14; i++) { const bx = (i * 61 + t * .01) % W, by = H - ((t * .04 + i * 47) % S.water); circle(bx, by, 1.5 + (i % 3), 'rgba(200,230,255,.3)'); }
}

const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };

// the projector's beam from the top of the frame, with dust floating in it
const motes = Array.from({ length: 40 }, () => ({ x: rand(-1, 1), y: rand(0, 1), s: rand(.3, 1) }));
function drawBeam(t, k) {
  if (REDUCED) return;
  const light = LV.pal.light;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgba(255,244,220,${(light ? .08 : .06) * k})`); g.addColorStop(1, 'rgba(255,244,220,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(CX - 40, 0); ctx.lineTo(CX + 40, 0); ctx.lineTo(CX + 300, H); ctx.lineTo(CX - 300, H); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff6e0';
  for (const m of motes) {
    const y = ((m.y * H + t * .008 * m.s) % H), x = CX + m.x * (40 + 260 * y / H) + Math.sin(t * .001 + m.y * 9) * 6;
    ctx.globalAlpha = .25 * k * m.s; ctx.fillRect(x, y, 1.4, 1.4);
  }
  ctx.globalAlpha = 1;
}
// a gentle grade in each film's own colour
function drawGrade() {
  ctx.save(); ctx.globalCompositeOperation = 'soft-light';
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(.5, 'rgba(0,0,0,0)'); g.addColorStop(1, hexA(LV.pal.accent, .35));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// the garland that warns of a flip, and the tint of the other side
function drawFlip(t) {
  if (S.world === 'b') { ctx.fillStyle = 'rgba(40,70,160,.16)'; ctx.fillRect(0, 0, W, H); }
  const cols = ['#ff3b3b', '#ffd23f', '#3ddc4a', '#2f9bff', '#ff8ab8'];
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let x = 0; x <= W; x += 10) ctx.lineTo(x, 10 + Math.sin(x * .03) * 5);
  ctx.stroke();
  for (let i = 0; i < 14; i++) {
    const x = 18 + i * 37, y = 14 + Math.sin(x * .03) * 5;
    const on = S.flipWarn ? Math.floor(t / 90 + i) % 2 === 0 : (S.world === 'b' ? (i + Math.floor(t / 600)) % 3 === 0 : true);
    ctx.shadowColor = cols[i % 5]; ctx.shadowBlur = on ? 14 : 0;
    ctx.fillStyle = on ? cols[i % 5] : '#333'; ctx.beginPath(); ctx.ellipse(x, y + 5, 3.5, 5.5, 0, 0, PI2); ctx.fill();
  }
  ctx.shadowBlur = 0;
  if (S.flipWarn) caption(S.world === 'a' ? 'ИЗНАНКА БЛИЗКО' : 'ВОЗВРАЩАЕМСЯ', `400 13px ${YESEVA}`, 44, '#e3242b', .6 + .4 * Math.sin(t * .03));
}

// the jaw along the top of the frame and the glass of water in the corner
function drawRex(t) {
  const R = S.rex, d = jawDepth(), shake = R.warn ? Math.sin(t * .1) * 2 : 0;
  ctx.fillStyle = '#2c3a22';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 14 + d); ctx.lineTo(0, 14 + d); ctx.fill();
  ctx.fillStyle = '#efe6cf';
  for (let x = 6; x < W; x += 22) { ctx.beginPath(); ctx.moveTo(x, 12 + d); ctx.lineTo(x + 11, 12 + d); ctx.lineTo(x + 5.5, 26 + d + (x % 44 ? 0 : 6)); ctx.closePath(); ctx.fill(); }
  if (R.lungeAt > 0 || d > 0) { ctx.shadowColor = '#ffb02e'; ctx.shadowBlur = 14; circle(60, 8 + d * .4, 5, '#ffb02e'); circle(60, 8 + d * .4, 2, '#1a1a1a'); ctx.shadowBlur = 0; }
  // the glass: ripples before every stomp
  const gx = W - 38, gy = 64;
  ctx.fillStyle = 'rgba(200,230,255,.18)'; ctx.strokeStyle = 'rgba(220,240,255,.6)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(gx - 13, gy - 18); ctx.lineTo(gx + 13, gy - 18); ctx.lineTo(gx + 10, gy + 16); ctx.lineTo(gx - 10, gy + 16); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(120,180,230,.5)'; ctx.fillRect(gx - 11, gy - 6, 22, 21);
  if (R.warn) for (let i = 0; i < 3; i++) { ctx.strokeStyle = `rgba(255,255,255,${.8 - i * .25})`; ctx.beginPath(); ctx.ellipse(gx + shake, gy - 6, 3 + i * 3 + (t * .02 % 3), 1 + i * .6, 0, 0, PI2); ctx.stroke(); }
}

// darkness with a torch around the dot; the robots' eyes always show
function drawNight(t) {
  const N = S.night, d = dotScreen(), r = torchR();
  for (const b of N.bots) if (b.lit) drawAnimatronic(b.x, b.y, 1, true, t);
  const g = ctx.createRadialGradient(d.x, d.y, r * .35, d.x, d.y, r);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${N.off > 0 ? .97 : .9})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const b of N.bots) if (!b.lit) drawAnimatronic(b.x, b.y, 1, false, t);
  ctx.textAlign = 'left'; ctx.font = `700 12px ${UMONO}`; ctx.fillStyle = N.off > 0 ? '#ff4a3d' : '#9a9282';
  ctx.fillText(N.off > 0 ? 'СВЕТ: НЕТ' : 'СВЕТ: ЕСТЬ', 14, H - 14);
  const hour = Math.floor(progress() * 6);
  ctx.textAlign = 'right'; ctx.fillStyle = '#9a9282'; ctx.fillText(`${hour || 12}:00`, W - 14, H - 14);
  ctx.textAlign = 'center';
}

// the gauntlet at the top: its stones light up one by one before a snap
function drawGauntlet(t) {
  const k = S.snapWarn ? clamp((.9 - S.snapT) / .9, 0, 1) : 0;
  ctx.save(); ctx.translate(CX, 34); ctx.scale(.8, .8);
  ctx.globalAlpha = .5 + .5 * k;
  PROPS.gauntlet({ ph: 0, n: 0 }, t * (1 + k * 4));
  ctx.restore();
  if (k > 0) { ctx.fillStyle = `rgba(242,182,50,${.12 * k})`; ctx.fillRect(0, 0, W, H); }
}
