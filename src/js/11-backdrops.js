// ---------- screen-space backdrops that sit behind the credits ----------
const GLYPHS = '0123456789ZXJQ$#@%&ЖЯЮЭЙФ';
function wrapY(y) { return ((y % H) + H) % H; }
const BACK = {
  ship(t, cam, k) {
    // inside a spaceship: wall panels and two windows onto the stars
    ctx.globalAlpha = .55 * k;
    const off = -((cam * .25) % 120);
    for (let y = off - 120; y < H + 120; y += 120) for (let x = 0; x < W; x += 135) {
      ctx.fillStyle = '#121a30'; rr(x + 4, y + 4, 127, 112, 6); ctx.fill();
      ctx.fillStyle = '#1e2844'; circle(x + 12, y + 12, 2, '#1e2844'); circle(x + 123, y + 12, 2, '#1e2844');
    }
    for (const wdw of S.amb.windows) {
      const y = wrapY(wdw.y - cam * .25);
      ctx.globalAlpha = .8 * k; ctx.fillStyle = '#02030a'; rr(wdw.x, y, 70, 46, 18); ctx.fill();
      ctx.save(); rr(wdw.x, y, 70, 46, 18); ctx.clip();
      for (let i = 0; i < 12; i++) circle(wdw.x + ((i * 37 + t * .03) % 70), y + (i * 19) % 46, .9, '#ffffff');
      ctx.restore();
      ctx.strokeStyle = '#3a4a70'; ctx.lineWidth = 3; rr(wdw.x, y, 70, 46, 18); ctx.stroke();
    }
  },
  well(t, cam, k) {
    // the well of a falling-block game: a grid between brick walls
    ctx.globalAlpha = .12 * k; ctx.strokeStyle = '#3a4a8a'; ctx.lineWidth = 1;
    const off = -((cam * .5) % CELL);
    for (let x = 0; x <= W; x += CELL) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = off; y <= H; y += CELL) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.globalAlpha = .5 * k;
    for (let y = off - CELL; y < H + CELL; y += CELL) { drawBlock(0, y, '#3a3f5c', CELL); drawBlock(W - CELL, y, '#3a3f5c', CELL); }
    ctx.globalAlpha = .12 * k;
    for (const pc of S.amb.pieces) {
      const y = wrapY(pc.y + t * .02 * pc.s - cam * .15);
      for (const [cx, cy] of TETRO[pc.k]) drawBlock(pc.x + cx * 14, y + cy * 14, TCOL[pc.k], 14);
    }
  },
  spores(t, cam, k) {
    const up = S.world === 'b';
    ctx.globalAlpha = k;
    if (up) {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1426'); g.addColorStop(1, '#1a0a14');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (Math.random() < .015) { ctx.fillStyle = 'rgba(255,40,40,.18)'; ctx.fillRect(0, 0, W, H); }
    }
    for (const m of S.amb.spores) {
      ctx.globalAlpha = (up ? .7 : .2) * k; ctx.fillStyle = up ? '#f2e8ff' : '#c9b8a8';
      ctx.fillRect(m.x + Math.sin(t * .001 + m.y) * 8, wrapY(m.y - t * .02 * m.s - cam * .2), 1.8, 1.8);
    }
  },
  jungle(t, cam, k) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b2414'); g.addColorStop(1, '#030b06');
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const l of S.amb.leaves) {
      const y = wrapY(l.y - cam * l.d);
      ctx.globalAlpha = (.35 + l.d) * k; ctx.fillStyle = l.d > .2 ? '#0e3a1c' : '#0a2a14';
      ctx.save(); ctx.translate(l.x, y); ctx.rotate(l.a + Math.sin(t * .0008 + l.y) * .05);
      ctx.beginPath(); ctx.ellipse(0, 0, 70 * l.s, 18 * l.s, 0, 0, PI2); ctx.fill(); ctx.restore();
    }
    ctx.globalAlpha = .07 * k; ctx.fillStyle = '#cfe8c8';
    for (let i = 0; i < 3; i++) ctx.fillRect(0, wrapY(i * 230 + t * .01 - cam * .1), W, 60);
  },
  office(t, cam, k) {
    // a pizzeria office: checkered floor and a poster on the wall
    ctx.globalAlpha = .18 * k;
    const off = -((cam * .3) % 40);
    for (let y = off; y < H; y += 40) for (let x = 0; x < W; x += 40) if (((x + y - off) / 40) % 2 === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, 40, 40); }
    ctx.globalAlpha = .25 * k; ctx.fillStyle = '#c0392b'; rr(40, wrapY(120 - cam * .1), 90, 120, 4); ctx.fill();
    ctx.fillStyle = '#f5c542'; ctx.font = `700 14px ${UMONO}`; ctx.textAlign = 'center'; ctx.fillText('ПРАЗДНУЙ!', 85, wrapY(120 - cam * .1) + 24); ctx.textAlign = 'left';
  },
  cosmos(t, cam, k) {
    for (const n of S.amb.nebula) {
      const y = ((n.y - cam * .05) % (H * 2) + H * 2) % (H * 2) - H * .5;
      const g = ctx.createRadialGradient(n.x, y, 0, n.x, y, n.r);
      g.addColorStop(0, `rgba(${n.c},.2)`); g.addColorStop(1, `rgba(${n.c},0)`);
      ctx.globalAlpha = k; ctx.fillStyle = g; ctx.fillRect(n.x - n.r, y - n.r, n.r * 2, n.r * 2);
    }
    for (const s of S.amb.field) { ctx.globalAlpha = (.35 + s.d * 1.5) * k; ctx.fillStyle = s.r > 1.2 ? '#f2b632' : '#efe6ff'; ctx.fillRect(s.x, wrapY(s.y - cam * s.d), s.r, s.r); }
  },
  grime(t, cam, k) {
    // a bare bulb over a basement fight, grime, a stray single frame and the reel-change cue mark
    const flick = Math.random() < .03 ? .4 : 1;
    const g = ctx.createRadialGradient(CX, -40, 0, CX, -40, 520);
    g.addColorStop(0, `rgba(230,220,150,${.16 * flick})`); g.addColorStop(1, 'rgba(230,220,150,0)');
    ctx.globalAlpha = k; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const b of S.amb.blots) { ctx.globalAlpha = .18 * k; circle(b.x, wrapY(b.y - cam * b.d), b.r, '#262a14'); }
    const A = S.amb;
    if (t > A.flashAt) {
      if (t < A.flashAt + 70) {
        // the twenty-fifth frame
        ctx.globalAlpha = .32 * k; ctx.fillStyle = '#f4f0d8';
        const x = A.flashX;
        circle(x, 250, 22, '#f4f0d8'); rr(x - 34, 276, 68, 150, 22); ctx.fill();
      } else { A.flashAt = t + rand(3500, 6500); A.flashX = pick([90, 450]); }
    }
    const pr = progress();
    if ((pr > .44 && pr < .456) || (pr > .87 && pr < .886)) {
      ctx.globalAlpha = .75; ctx.strokeStyle = '#f4f0d8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(W - 46, 46, 16, 0, PI2); ctx.stroke(); circle(W - 46, 46, 11, 'rgba(20,20,10,.8)');
    }
  },
  basement(t, cam, k) {
    // stone floor tiles of a damp basement
    const cell = 64, off = -((cam * .3) % cell);
    for (let r = -1; r < H / cell + 2; r++) {
      const ry = Math.floor((cam * .3) / cell) + r;
      for (let c = 0; c < W / cell + 1; c++) {
        const hsh = Math.sin((ry * 41 + c * 23) * 12.9898) * 43758.5453, v = hsh - Math.floor(hsh);
        ctx.globalAlpha = (.28 + v * .2) * k; ctx.fillStyle = v < .5 ? '#2a1a10' : '#24160d';
        rr(c * cell + 3 + v * 4, r * cell + off + 3, cell - 6 - v * 6, cell - 6, 10); ctx.fill();
        if (v > .93) { ctx.globalAlpha = .35 * k; circle(c * cell + 30, r * cell + off + 30, 14 + v * 6, '#4a0a0a'); }
      }
    }
    for (const f of S.amb.flies) {
      const x = f.x + Math.sin(t * .01 * f.s + f.ph) * 24, y = f.y + Math.cos(t * .013 * f.s + f.ph) * 18;
      ctx.globalAlpha = .7 * k; circle(x, y, 2.6, '#0a0a0a');
      ctx.globalAlpha = .4 * k; ctx.fillStyle = '#ddd'; ctx.fillRect(x - 4, y - 3 - Math.abs(Math.sin(t * .1)) * 2, 3, 2); ctx.fillRect(x + 1, y - 3 - Math.abs(Math.sin(t * .1)) * 2, 3, 2);
    }
  },
  abyss(t, cam, k) {
    // light from the surface fades the deeper you go
    const d = progress(), mix = (a, b) => a.map((v, i) => Math.round(v + (b[i] - v) * d));
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `rgb(${mix([14, 92, 112], [4, 30, 44])})`); g.addColorStop(1, `rgb(${mix([3, 34, 48], [1, 8, 14])})`);
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = .06 * k * (1 - d * .7); ctx.fillStyle = '#d9f7ff';
    for (let i = 0; i < 5; i++) {
      const x = 60 + i * 110 + Math.sin(t * .0004 + i) * 30;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 40, 0); ctx.lineTo(x + 140, H); ctx.lineTo(x + 60, H); ctx.closePath(); ctx.fill();
    }
    for (const m of S.amb.snow) { ctx.globalAlpha = .35 * k; ctx.fillStyle = '#cfefff'; ctx.fillRect(m.x + Math.sin(t * .001 + m.y) * 6, wrapY(m.y - cam * m.d + t * .006), 1.6, 1.6); }
    for (const f of S.amb.school) {
      const x = ((f.x + t * .03 * f.s) % (W + 200)) - 100, y = wrapY(f.y - cam * .1);
      ctx.globalAlpha = .25 * k; ctx.fillStyle = '#012632';
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(x - i * 14, y + (i % 2) * 8, 7, 3, 0, 0, PI2); ctx.fill(); }
    }
  },
  noir(t, cam, k) {
    // light through venetian blinds and a red glow from below
    ctx.save(); ctx.globalAlpha = .045 * k; ctx.fillStyle = '#ffffff';
    ctx.translate(0, -(cam * .15) % 60);
    ctx.rotate(-.35);
    for (let y = -400; y < 1100; y += 60) ctx.fillRect(-300, y, 1200, 22);
    ctx.restore();
    const g = ctx.createLinearGradient(0, H, 0, H * .5);
    g.addColorStop(0, 'rgba(208,20,44,.16)'); g.addColorStop(1, 'rgba(208,20,44,0)');
    ctx.globalAlpha = k; ctx.fillStyle = g; ctx.fillRect(0, H * .5, W, H * .5);
  },
  sky(t, cam, k) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#5c94fc'); g.addColorStop(1, '#8fb8ff');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = .55 * k;
    for (const c of S.amb.clouds) {
      const y = wrapY(c.y - cam * c.d);
      ctx.save(); ctx.translate((c.x + t * .01 * c.s) % (W + 120) - 60, y); ctx.scale(c.s * 1.4, c.s * 1.4); PROPS.cloud8(); ctx.restore();
    }
    ctx.globalAlpha = .22 * k; ctx.fillStyle = '#2f9e44';
    ctx.beginPath(); ctx.ellipse(90, H + 30, 140, 90, 0, Math.PI, PI2); ctx.ellipse(420, H + 50, 170, 110, 0, Math.PI, PI2); ctx.fill();
  },
  caverns(t, cam, k) {
    const A = S.amb;
    ctx.fillStyle = '#0a1426';
    for (const p of A.pillars) {
      ctx.globalAlpha = .55 * k;
      const top = wrapY(-cam * p.d) - H;
      for (let o = 0; o < 3; o++) { rr(p.x, top + o * H, p.w, H * .8, [p.w / 2, p.w / 2, 0, 0]); ctx.fill(); }
    }
    ctx.globalAlpha = .12 * k; ctx.fillStyle = '#9fc8ff';
    for (let i = 0; i < 40; i++) { const x = (i * 97 + t * .02) % W, y = wrapY(i * 53 + t * .45); ctx.fillRect(x, y, 1, 14); }
    for (const m of A.motes) {
      ctx.globalAlpha = .3 * k; ctx.fillStyle = '#bfe0ff';
      ctx.fillRect(m.x + Math.sin(t * .001 + m.y) * 4, wrapY(m.y - t * .001 * m.s - cam * .3), 1.6, 1.6);
    }
    if (!REDUCED && k > .05) for (const f of A.flies) {
      const x = f.bx + Math.sin(t * .0005 * f.sp + f.ph) * 110;
      const y = ((f.by + Math.sin(t * .0008 * f.sp + f.ph * 2) * 60 - t * .01 * f.sp) % (H + 40) + H + 40) % (H + 40) - 20;
      ctx.globalAlpha = .95 * k; drawButterfly(x, y, t, f.ph);
    }
  },
  stairs(t, cam, k) {
    // the pastel stairways from the show, faint behind the credits
    ctx.globalAlpha = .1 * k; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const y0 = wrapY(i * 140 - cam * .2) - 60, x0 = i % 2 ? 40 : 300;
      ctx.strokeStyle = i % 2 ? '#ff6fa8' : '#7fe0c8';
      ctx.beginPath(); ctx.moveTo(x0, y0);
      for (let s = 0; s < 8; s++) { ctx.lineTo(x0 + s * 26 + 26, y0 + s * 14); ctx.lineTo(x0 + s * 26 + 26, y0 + s * 14 + 14); }
      ctx.stroke();
    }
    ctx.globalAlpha = .07 * k; ctx.fillStyle = '#ff2a7a'; ctx.fillRect(0, 0, W, H);
  },
  space(t, cam, k) {
    for (const n of S.amb.nebula) {
      const y = ((n.y - cam * .05) % (H * 2) + H * 2) % (H * 2) - H * .5;
      const g = ctx.createRadialGradient(n.x, y, 0, n.x, y, n.r);
      g.addColorStop(0, `rgba(${n.c},.14)`); g.addColorStop(1, `rgba(${n.c},0)`);
      ctx.globalAlpha = k; ctx.fillStyle = g; ctx.fillRect(n.x - n.r, y - n.r, n.r * 2, n.r * 2);
    }
    for (const s of S.amb.field) { ctx.globalAlpha = (.35 + s.d * 1.5) * k; ctx.fillStyle = '#fff6dc'; ctx.fillRect(s.x, wrapY(s.y - cam * s.d), s.r, s.r); }
  },
  blocky(t, cam, k) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#081226'); g.addColorStop(1, '#16305a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const s of S.amb.field) { ctx.globalAlpha = (.4 + Math.sin(t * .002 + s.x) * .2) * k; px(s.x, wrapY(s.y - cam * s.d), 3, 3, '#ffffff'); }
    ctx.globalAlpha = .9 * k;
    const my = wrapY(80 - cam * .03);
    px(410, my, 48, 48, '#f2f2e6'); px(418, my + 8, 10, 10, '#d8d8c8'); px(436, my + 26, 12, 8, '#d8d8c8');
    ctx.globalAlpha = .18 * k;
    for (const c of S.amb.clouds) { const y = wrapY(c.y - cam * c.d); px((c.x + t * .008) % (W + 160) - 80, y, c.w * 12, 14, '#ffffff'); }
  },
  candles(t, cam, k) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0d0717'); g.addColorStop(1, '#1d1030');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const c of S.amb.candles) {
      const y = wrapY(c.y - cam * c.d + Math.sin(t * .0015 + c.ph) * 5), s = .5 + c.d;
      ctx.globalAlpha = .55 * k;
      px(c.x - 2 * s, y, 4 * s, 16 * s, '#efe4c8');
      const fl = 1 + .15 * Math.sin(t * .02 + c.ph);
      const fg = ctx.createRadialGradient(c.x, y - 4 * s, 0, c.x, y - 4 * s, 14 * s * fl);
      fg.addColorStop(0, 'rgba(255,214,120,.9)'); fg.addColorStop(1, 'rgba(255,170,60,0)');
      ctx.globalAlpha = .8 * k; ctx.fillStyle = fg; ctx.fillRect(c.x - 16 * s, y - 20 * s, 32 * s, 32 * s);
    }
    // castle on the horizon
    ctx.globalAlpha = .4 * k; ctx.fillStyle = '#05030a';
    const base = H - 30;
    [[30, 90, 26], [70, 130, 30], [120, 70, 22], [380, 110, 28], [420, 160, 24], [470, 90, 30]].forEach(([x, h, w]) => {
      ctx.fillRect(x, base - h, w, h + 30);
      ctx.beginPath(); ctx.moveTo(x - 4, base - h); ctx.lineTo(x + w / 2, base - h - 30); ctx.lineTo(x + w + 4, base - h); ctx.fill();
    });
    ctx.fillRect(0, base, W, 30);
  },
  maze(t, cam, k) {
    // neon maze walls scrolling behind the credits
    ctx.globalAlpha = .32 * k; ctx.strokeStyle = '#2121ff'; ctx.lineWidth = 3;
    const cell = 54, off = -((cam * .25) % cell), seed = S.amb.seed;
    for (let r = -1; r < H / cell + 2; r++) {
      const ry = Math.floor((cam * .25) / cell) + r;
      for (let c = 0; c < W / cell + 1; c++) {
        const h = Math.sin((ry * 31 + c * 17 + seed) * 12.9898) * 43758.5453, v = h - Math.floor(h);
        const x = c * cell, y = r * cell + off;
        if (v < .35) { rr(x + 8, y + 8, cell - 16, 10, 5); ctx.stroke(); }
        else if (v < .6) { rr(x + 8, y + 8, 10, cell - 16, 5); ctx.stroke(); }
        else if (v < .7) { ctx.globalAlpha = .5 * k; circle(x + cell / 2, y + cell / 2, 2, '#ffb8ae'); ctx.globalAlpha = .32 * k; }
      }
    }
  },
  rain(t, cam, k) {
    ctx.font = `500 14px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const c of S.amb.cols) {
      const head = ((c.y + t * .001 * c.sp * 6) % (H + 300)) - 100;
      for (let i = 0; i < c.len; i++) {
        const y = head - i * 16;
        if (y < -10 || y > H + 10) continue;
        const ch = GLYPHS[(c.seed + i * 7 + Math.floor(t / 180)) % GLYPHS.length];
        ctx.globalAlpha = (i === 0 ? .3 : .16 * (1 - i / c.len)) * k;
        ctx.fillStyle = i === 0 ? '#9dffb6' : '#00a844';
        ctx.fillText(ch, c.x, y);
      }
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  },
  aurora(t, cam, k) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#020612'); g.addColorStop(1, '#0a1a33');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const s of S.amb.field) { ctx.globalAlpha = (.4 + s.d * 2) * k; ctx.fillStyle = '#ffffff'; ctx.fillRect(s.x, wrapY(s.y - cam * s.d), s.r, s.r); }
    ctx.globalAlpha = .14 * k;
    for (let band = 0; band < 2; band++) {
      ctx.fillStyle = band ? '#4fd1a8' : '#4fa3ff';
      ctx.beginPath(); ctx.moveTo(0, 120 + band * 60);
      for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 110 + band * 60 + Math.sin(x * .02 + t * .0006 + band) * 30);
      for (let x = W; x >= 0; x -= 20) ctx.lineTo(x, 170 + band * 60 + Math.sin(x * .025 + t * .0005 + band) * 26);
      ctx.fill();
    }
  },
};
function drawButterfly(x, y, t, ph) {
  const flap = Math.abs(Math.sin(t * .012 + ph));
  ctx.save(); ctx.translate(x, y);
  ctx.shadowColor = 'rgba(90,180,255,.9)'; ctx.shadowBlur = 12;
  ctx.fillStyle = 'rgba(110,190,255,.9)';
  for (const sd of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(sd * 6 * flap, -3, 7 * flap + .5, 8, sd * .5, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sd * 5 * flap, 6, 5 * flap + .5, 5, -sd * .4, 0, PI2); ctx.fill();
  }
  ctx.shadowBlur = 0; ctx.fillStyle = '#dff0ff'; ctx.fillRect(-.8, -6, 1.6, 13);
  ctx.restore();
}
