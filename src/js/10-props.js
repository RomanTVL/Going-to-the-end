// ---------- props: drawn around (0, 0) at roughly 80 px tall ----------
const PROPS = {
  vent() {
    ctx.fillStyle = '#3a4150'; rr(-24, -15, 48, 30, 5); ctx.fill();
    ctx.fillStyle = '#1a1e26'; for (let i = 0; i < 5; i++) ctx.fillRect(-19, -11 + i * 5, 38, 2.6);
    ctx.fillStyle = '#5b6578'; circle(-20, -11, 1.5, '#5b6578'); circle(20, -11, 1.5, '#5b6578'); circle(-20, 11, 1.5, '#5b6578'); circle(20, 11, 1.5, '#5b6578');
  },
  crewmate(pr, t) { drawCrewmate(0, 14, CREW_COLORS[pr.n % CREW_COLORS.length], pr.side ? -1 : 1, 2, false, t, false); },
  ebutton(pr, t) {
    ctx.fillStyle = '#7d8798'; ctx.beginPath(); ctx.ellipse(0, 10, 26, 9, 0, 0, PI2); ctx.fill();
    ctx.fillStyle = 'rgba(160,220,255,.25)'; ctx.beginPath(); ctx.ellipse(0, 0, 20, 16, 0, Math.PI, PI2); ctx.fill();
    ctx.shadowColor = '#ff2a2a'; ctx.shadowBlur = 8 + 6 * Math.sin(t * .006);
    ctx.fillStyle = '#e01b1b'; ctx.beginPath(); ctx.ellipse(0, 4, 13, 8, 0, Math.PI, PI2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#e8eef5'; ctx.font = `700 7px ${ROUND}`; ctx.textAlign = 'center'; ctx.fillText('СБОР', 0, 16);
  },
  tpiece(pr, t) {
    const k = Object.keys(TETRO)[pr.n % 7];
    ctx.rotate(Math.sin(t * .0008 + pr.ph) * .4);
    for (const [cx, cy] of TETRO[k]) drawBlock(cx * 14 - 28, cy * 14 - 14, TCOL[k], 14);
  },
  dome(pr) {
    // onion domes on the horizon of the puzzle's cover
    const cols = ['#e3262f', '#2f9e44', '#f5c542', '#2f6bff'];
    ctx.fillStyle = '#7a5a40'; ctx.fillRect(-30, 10, 60, 30);
    [[-18, 4, .7], [0, -6, 1], [18, 4, .7]].forEach(([x, y, k], i) => {
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
      ctx.fillStyle = cols[(i + pr.n) % 4];
      ctx.beginPath(); ctx.moveTo(0, -30); ctx.bezierCurveTo(16, -18, 18, -2, 10, 8); ctx.lineTo(-10, 8); ctx.bezierCurveTo(-18, -2, -16, -18, 0, -30); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, -6); ctx.quadraticCurveTo(0, -16, 8, -6); ctx.stroke();
      ctx.fillStyle = '#e8c35a'; ctx.fillRect(-1, -40, 2, 10); ctx.fillRect(-4, -36, 8, 2);
      ctx.restore();
    });
  },
  lights(pr, t) {
    ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-40, -10); ctx.quadraticCurveTo(0, 22, 40, -10); ctx.stroke();
    const cols = ['#ff3b3b', '#ffd23f', '#3ddc4a', '#2f9bff', '#ff8ab8'];
    for (let i = 0; i < 5; i++) {
      const u = (i + .5) / 5, x = -40 + 80 * u, y = -10 + 32 * u * (1 - u) * 2 + 4;
      const on = Math.sin(t * .004 * (1 + i * .3) + pr.ph + i) > -.3 || S.flipWarn;
      ctx.shadowColor = cols[i]; ctx.shadowBlur = on ? 14 : 0;
      ctx.fillStyle = on ? cols[i] : '#3a3a3a'; ctx.beginPath(); ctx.ellipse(x, y + 4, 3.5, 5.5, 0, 0, PI2); ctx.fill();
    }
    ctx.shadowBlur = 0;
  },
  bike(pr) {
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(-18, 10, 13, 0, PI2); ctx.arc(22, 10, 13, 0, PI2); ctx.stroke();
    ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-18, 10); ctx.lineTo(-2, -8); ctx.lineTo(14, -8); ctx.lineTo(22, 10); ctx.moveTo(-2, -8); ctx.lineTo(4, 10); ctx.lineTo(-18, 10); ctx.moveTo(14, -8); ctx.lineTo(12, -16); ctx.stroke();
    ctx.strokeStyle = '#1a1a1a'; ctx.beginPath(); ctx.moveTo(6, -16); ctx.lineTo(18, -16); ctx.moveTo(-6, -12); ctx.lineTo(2, -12); ctx.stroke();
  },
  waffle() {
    ctx.fillStyle = '#d8a042'; rr(-20, -20, 40, 40, 8); ctx.fill();
    ctx.fillStyle = '#a8701e'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) ctx.fillRect(-16 + i * 9, -16 + j * 9, 6, 6);
  },
  fern(pr, t) {
    ctx.strokeStyle = '#2e6b2a'; ctx.lineWidth = 2;
    for (let k = -2; k <= 2; k++) {
      const a = -Math.PI / 2 + k * .32 + Math.sin(t * .0012 + pr.ph + k) * .05;
      ctx.beginPath(); ctx.moveTo(0, 30);
      const ex = Math.cos(a) * 60, ey = 30 + Math.sin(a) * 60;
      ctx.quadraticCurveTo(ex * .4, 30 + (ey - 30) * .6, ex, ey); ctx.stroke();
      ctx.fillStyle = '#3d8a36';
      for (let i = 2; i < 10; i++) { const u = i / 10, x = ex * u, y = 30 + (ey - 30) * u; ctx.beginPath(); ctx.ellipse(x, y, 7 * (1 - u) + 2, 2.4, a + 1.2, 0, PI2); ctx.ellipse(x, y, 7 * (1 - u) + 2, 2.4, a - 1.2, 0, PI2); ctx.fill(); }
    }
  },
  amber(pr, t) {
    ctx.shadowColor = '#ffb02e'; ctx.shadowBlur = 12 + 4 * Math.sin(t * .004 + pr.ph);
    const g = ctx.createRadialGradient(-5, -6, 2, 0, 0, 22); g.addColorStop(0, '#ffe08a'); g.addColorStop(1, '#c46a00');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -22); ctx.bezierCurveTo(18, -14, 18, 16, 0, 20); ctx.bezierCurveTo(-18, 16, -18, -14, 0, -22); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = '#3a1e00'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-6, 2); ctx.lineTo(6, -2); ctx.moveTo(0, 0); ctx.lineTo(-4, -8); ctx.moveTo(0, 0); ctx.lineTo(5, -8); ctx.moveTo(-2, 1); ctx.lineTo(-6, 8); ctx.moveTo(2, 0); ctx.lineTo(6, 7); ctx.stroke();
  },
  footprint() {
    ctx.fillStyle = 'rgba(30,20,10,.75)';
    ctx.beginPath(); ctx.ellipse(0, 10, 13, 16, 0, 0, PI2); ctx.fill();
    for (const [x, y, a] of [[-14, -14, -.4], [0, -22, 0], [14, -14, .4]]) { ctx.beginPath(); ctx.ellipse(x, y, 5, 13, a, 0, PI2); ctx.fill(); }
  },
  fan(pr, t) {
    ctx.fillStyle = '#4a4a4a'; ctx.fillRect(-3, 10, 6, 22); ctx.fillRect(-14, 30, 28, 5);
    ctx.save(); ctx.rotate(t * .03);
    ctx.fillStyle = 'rgba(120,120,120,.85)'; for (let i = 0; i < 3; i++) { ctx.rotate(PI2 / 3); ctx.beginPath(); ctx.ellipse(0, -9, 5, 10, 0, 0, PI2); ctx.fill(); }
    ctx.restore();
    ctx.strokeStyle = '#6a6a6a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 20, 0, PI2); ctx.stroke();
    for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(i * .785) * 20, Math.sin(i * .785) * 20); ctx.stroke(); }
  },
  cupcake(pr, t) {
    ctx.fillStyle = '#e8a0b8'; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.lineTo(10, 20); ctx.lineTo(-10, 20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff6fa8'; ctx.beginPath(); ctx.arc(0, -2, 16, Math.PI, PI2); ctx.fill();
    circle(-6, -8, 2.4, '#ffffff'); circle(6, -8, 2.4, '#ffffff'); circle(-6, -8, 1.2, '#1a1a1a'); circle(6, -8, 1.2, '#1a1a1a');
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, -3, 5, .2, Math.PI - .2); ctx.stroke();
    ctx.fillStyle = '#f2f0e6'; ctx.fillRect(-1.5, -26, 3, 9);
    ctx.shadowColor = '#ffdd55'; ctx.shadowBlur = 10; circle(0, -28, 2.5 + Math.random(), '#ffdd55'); ctx.shadowBlur = 0;
  },
  phone() {
    ctx.fillStyle = '#2a2a2a'; rr(-22, -6, 44, 22, 5); ctx.fill();
    ctx.fillStyle = '#1a1a1a'; rr(-26, -16, 52, 10, 5); ctx.fill();
    ctx.fillStyle = '#5a5a5a'; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) circle(-8 + i * 8, 2 + j * 7, 2, '#5a5a5a');
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(22, 8); ctx.bezierCurveTo(40, 14, 30, 30, 44, 34); ctx.stroke();
  },
  gauntlet(pr, t) {
    ctx.fillStyle = '#c9952a';
    rr(-14, -6, 28, 30, 6); ctx.fill();
    for (let i = 0; i < 4; i++) { rr(-13 + i * 7, -24, 6, 20, 3); ctx.fill(); }
    rr(-22, 0, 8, 16, 3); ctx.fill();
    ctx.fillStyle = '#e8b84a'; ctx.fillRect(-14, 8, 28, 3);
    const stones = ['#2f6bff', '#e3262f', '#b44cff', '#3ddc4a', '#ffd23f', '#ff8a1e'];
    stones.forEach((c, i) => { ctx.shadowColor = c; ctx.shadowBlur = 8 + 4 * Math.sin(t * .005 + i); circle(i < 5 ? -10 + i * 5 : 0, i < 5 ? -18 + (i === 2 ? -2 : 0) : 2, i < 5 ? 2 : 4, c); });
    ctx.shadowBlur = 0;
  },
  shield() {
    for (const [r, c] of [[26, '#c0392b'], [20, '#f2f2f2'], [14, '#c0392b'], [9, '#2f4fa8']]) circle(0, 0, r, c);
    ctx.fillStyle = '#f2f2f2'; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 3.2 : 8; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fill();
  },
  hammer() {
    ctx.rotate(-.5);
    ctx.fillStyle = '#7a5230'; ctx.fillRect(-2.5, -4, 5, 40);
    ctx.fillStyle = '#5e3e22'; for (let y = 0; y < 36; y += 5) ctx.fillRect(-2.5, y, 5, 2);
    const g = ctx.createLinearGradient(-18, -20, 18, 0); g.addColorStop(0, '#d8dde6'); g.addColorStop(1, '#7d8696');
    ctx.fillStyle = g; rr(-18, -20, 36, 18, 3); ctx.fill();
  },
  bulb(pr, t) {
    ctx.strokeStyle = '#2a2a22'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(0, -14); ctx.stroke();
    ctx.fillStyle = '#3a3a30'; ctx.fillRect(-4, -16, 8, 8);
    const on = Math.sin(t * .013 + pr.ph) > -.9 || Math.random() < .5;
    if (on) {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 60); g.addColorStop(0, 'rgba(255,236,170,.35)'); g.addColorStop(1, 'rgba(255,236,170,0)');
      ctx.fillStyle = g; ctx.fillRect(-60, -60, 120, 120);
    }
    ctx.fillStyle = on ? '#fff1b8' : '#6b6a52'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 10, 0, 0, PI2); ctx.fill();
    ctx.strokeStyle = 'rgba(160,110,20,.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3, 2); ctx.lineTo(-1, -3); ctx.lineTo(1, 2); ctx.lineTo(3, -3); ctx.stroke();
  },
  soap(pr) {
    ctx.rotate((pr.n % 2 ? -1 : 1) * .25);
    const g = ctx.createLinearGradient(0, -12, 0, 12); g.addColorStop(0, '#ffb3d1'); g.addColorStop(1, '#e05592');
    ctx.fillStyle = g; rr(-24, -12, 48, 24, 9); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.45)'; rr(-18, -9, 22, 5, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(140,30,80,.35)'; ctx.lineWidth = 1; rr(-16, -5, 32, 12, 5); ctx.stroke();
  },
  fist() {
    ctx.fillStyle = '#d9a989'; rr(-18, -14, 36, 30, 9); ctx.fill();
    ctx.fillStyle = '#c08a6a'; for (let i = 0; i < 4; i++) rr(-17 + i * 9, -18, 8, 12, 4), ctx.fill();
    ctx.fillStyle = '#f2f0e6'; ctx.fillRect(-19, -2, 38, 6); ctx.fillRect(-19, 8, 38, 5);
    ctx.fillStyle = '#8a1c1c'; circle(-8, -12, 2, '#8a1c1c'); circle(5, -13, 1.6, '#8a1c1c');
  },
  poop() {
    ctx.fillStyle = '#5a3a1e';
    ctx.beginPath(); ctx.ellipse(0, 12, 22, 9, 0, 0, PI2); ctx.fill();
    ctx.fillStyle = '#6e4826'; ctx.beginPath(); ctx.ellipse(0, 2, 16, 8, 0, 0, PI2); ctx.fill();
    ctx.fillStyle = '#80552e'; ctx.beginPath(); ctx.ellipse(0, -7, 10, 6, 0, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-3, -11); ctx.quadraticCurveTo(2, -20, 5, -12); ctx.fill();
  },
  bomb(pr, t) {
    circle(0, 4, 15, '#1b1b1b'); circle(-5, -1, 4, 'rgba(255,255,255,.25)');
    ctx.fillStyle = '#3a3a3a'; ctx.fillRect(-4, -14, 8, 6);
    ctx.strokeStyle = '#c9a25a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -14); ctx.quadraticCurveTo(6, -24, 12, -22); ctx.stroke();
    if (Math.sin(t * .03 + pr.ph) > 0) { ctx.shadowColor = '#ffcf4a'; ctx.shadowBlur = 10; circle(12, -22, 3, '#ffcf4a'); ctx.shadowBlur = 0; }
  },
  key() {
    ctx.rotate(-.6); ctx.fillStyle = '#e8b93a';
    ctx.beginPath(); ctx.arc(0, -16, 8, 0, PI2); ctx.fill(); circle(0, -16, 3.5, '#120b07');
    ctx.fillStyle = '#e8b93a'; ctx.fillRect(-2, -8, 4, 28); ctx.fillRect(2, 12, 7, 3); ctx.fillRect(2, 18, 5, 3);
  },
  tearface(pr, t) {
    ctx.fillStyle = '#f2d7c4'; ctx.beginPath(); ctx.ellipse(0, 18, 11, 12, 0, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -4, 18, 0, PI2); ctx.fill();
    circle(-7, -6, 4.5, '#111'); circle(7, -6, 4.5, '#111');
    circle(-8, -8, 1.4, '#fff'); circle(6, -8, 1.4, '#fff');
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 8, 5, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    ctx.fillStyle = 'rgba(120,180,255,.9)';
    for (const sx of [-7, 7]) { const k = (t * .002 + pr.ph + (sx > 0 ? .5 : 0)) % 1; ctx.beginPath(); ctx.ellipse(sx, -1 + k * 24, 2.2, 3.2, 0, 0, PI2); ctx.fill(); }
  },
  kelp(pr, t) {
    ctx.strokeStyle = '#2f7d4e'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      ctx.beginPath(); ctx.moveTo(-8 + k * 8, 60);
      for (let y = 60; y > -60; y -= 12) ctx.lineTo(-8 + k * 8 + Math.sin(y * .05 + t * .0015 + pr.ph + k) * (8 + (60 - y) * .08), y);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,214,90,.8)'; for (let k = 0; k < 4; k++) circle(Math.sin(t * .002 + k) * 10, -40 + k * 22, 2.4, 'rgba(255,214,90,.75)');
    ctx.lineCap = 'butt';
  },
  lifepod(pr, t) {
    ctx.rotate(.2);
    const g = ctx.createLinearGradient(-22, 0, 22, 0); g.addColorStop(0, '#d8d8d0'); g.addColorStop(1, '#8a8a84');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-18, 26); ctx.lineTo(-22, -10); ctx.quadraticCurveTo(0, -36, 22, -10); ctx.lineTo(18, 26); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff8a1e'; ctx.fillRect(-21, 2, 42, 7);
    circle(0, -12, 6, '#3a6e8a');
    if (Math.sin(t * .006 + pr.ph) > .6) { ctx.shadowColor = '#ff5a3c'; ctx.shadowBlur = 12; circle(0, -28, 3, '#ff5a3c'); ctx.shadowBlur = 0; }
  },
  seamoth() {
    ctx.fillStyle = '#e9edf0'; ctx.beginPath(); ctx.ellipse(0, 4, 26, 14, 0, 0, PI2); ctx.fill();
    ctx.fillStyle = 'rgba(140,220,255,.7)'; ctx.beginPath(); ctx.ellipse(10, 0, 13, 11, 0, 0, PI2); ctx.fill();
    ctx.fillStyle = '#ff8a1e'; ctx.fillRect(-26, 8, 18, 4);
    ctx.fillStyle = 'rgba(255,248,200,.35)'; ctx.beginPath(); ctx.moveTo(24, 2); ctx.lineTo(70, -12); ctx.lineTo(70, 18); ctx.closePath(); ctx.fill();
  },
  coral(pr) {
    ctx.strokeStyle = pr.n % 2 ? '#ff6fa8' : '#b86bff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    const branch = (x, y, a, l, d) => { if (d > 3) return; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke(); branch(x2, y2, a - .5, l * .7, d + 1); branch(x2, y2, a + .45, l * .7, d + 1); };
    branch(0, 34, -Math.PI / 2, 24, 0);
    ctx.lineCap = 'butt';
  },
  tie(pr, t) {
    ctx.rotate(Math.sin(t * .0012 + pr.ph) * .07);
    const g = ctx.createLinearGradient(-10, 0, 10, 0);
    g.addColorStop(0, '#8e0a1c'); g.addColorStop(.5, '#e0172f'); g.addColorStop(1, '#8e0a1c');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-8, -40); ctx.lineTo(8, -40); ctx.lineTo(5, -28); ctx.lineTo(-5, -28); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-5, -28); ctx.lineTo(5, -28); ctx.lineTo(11, 30); ctx.lineTo(0, 44); ctx.lineTo(-11, 30); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 2;
    for (let k = -30; k < 50; k += 10) { ctx.beginPath(); ctx.moveTo(-12, k); ctx.lineTo(12, k - 9); ctx.stroke(); }
    ctx.restore();
  },
  head() {
    // the back of a bald head, shoulders in a black suit
    ctx.fillStyle = '#0d0d0d';
    ctx.beginPath(); ctx.moveTo(-40, 48); ctx.quadraticCurveTo(-36, 24, -12, 22); ctx.lineTo(12, 22); ctx.quadraticCurveTo(36, 24, 40, 48); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e9e9e9'; ctx.beginPath(); ctx.moveTo(-11, 22); ctx.lineTo(11, 22); ctx.lineTo(7, 28); ctx.lineTo(-7, 28); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#b48d74'; ctx.fillRect(-7, 12, 14, 12);
    ctx.beginPath(); ctx.ellipse(-18.5, 2, 3.5, 6, 0, 0, PI2); ctx.ellipse(18.5, 2, 3.5, 6, 0, 0, PI2); ctx.fill();
    const g = ctx.createRadialGradient(-6, -10, 2, 0, 0, 26);
    g.addColorStop(0, '#ecccb4'); g.addColorStop(1, '#a07962');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 18, 22, 0, 0, PI2); ctx.fill();
    // the barcode sits on the back of the head and is clipped to it, so it never sticks out
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 18, 22, 0, 0, PI2); ctx.clip();
    const bars = [1.2, .8, 2, .8, 1, 1.6, .8, 1.2, .8, 1.6, .8, 1], gap = .7;
    let bx = -(bars.reduce((s, v) => s + v, 0) + gap * (bars.length - 1)) / 2;
    ctx.fillStyle = '#1a1412';
    bars.forEach((w, i) => { if (i % 2 === 0) ctx.fillRect(bx, 5, w, 7); bx += w + gap; });
    ctx.restore();
  },
  pistol() {
    ctx.rotate(-.15);
    ctx.fillStyle = '#1c1c1c'; rr(-28, -8, 42, 11, 2); ctx.fill();
    ctx.fillStyle = '#2b2b2b'; rr(13, -6, 26, 8, 3); ctx.fill();
    ctx.fillStyle = '#141414'; ctx.beginPath(); ctx.moveTo(-26, 3); ctx.lineTo(-13, 3); ctx.lineTo(-9, 28); ctx.lineTo(-23, 28); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#1c1c1c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-6, 6, 6, 0, Math.PI); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(-26, -7, 38, 2);
  },
  pipe() {
    const g = ctx.createLinearGradient(-18, 0, 18, 0);
    g.addColorStop(0, '#0b6b0b'); g.addColorStop(.35, '#7fe07f'); g.addColorStop(1, '#0b6b0b');
    ctx.fillStyle = g; ctx.fillRect(-16, -14, 32, 60);
    ctx.fillRect(-21, -28, 42, 16);
    ctx.strokeStyle = '#003300'; ctx.lineWidth = 2; ctx.strokeRect(-16, -14, 32, 60); ctx.strokeRect(-21, -28, 42, 16);
  },
  qblock(pr, t) {
    ctx.translate(0, Math.sin(t * .004 + pr.ph) * 3);
    px(-15, -15, 30, 30, '#f8a800'); px(-15, -15, 30, 3, '#ffd068'); px(-15, 12, 30, 3, '#a05000');
    px(-12, -12, 3, 3, '#a05000'); px(9, -12, 3, 3, '#a05000'); px(-12, 9, 3, 3, '#a05000'); px(9, 9, 3, 3, '#a05000');
    ctx.fillStyle = '#ffffff'; ctx.font = `400 16px ${P2P}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 1, 1);
  },
  mushroom() {
    ctx.fillStyle = '#f2e3c6'; rr(-10, 0, 20, 18, 5); ctx.fill();
    ctx.fillStyle = '#000'; ctx.fillRect(-5, 5, 3, 6); ctx.fillRect(3, 5, 3, 6);
    ctx.fillStyle = '#e52521'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 17, 0, Math.PI, PI2); ctx.fill();
    circle(-10, -7, 4.5, '#fff'); circle(6, -11, 5, '#fff'); circle(15, -3, 3, '#fff');
  },
  cloud8() {
    ctx.fillStyle = '#ffffff';
    [[-24, -2, 48, 14], [-16, -10, 16, 8], [0, -14, 18, 12], [-30, 4, 60, 8]].forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));
    ctx.fillStyle = 'rgba(92,148,252,.35)'; ctx.fillRect(-30, 10, 60, 2);
  },
  mask() {
    ctx.shadowColor = 'rgba(180,215,255,.6)'; ctx.shadowBlur = 12;
    ctx.fillStyle = '#f2efe8';
    ctx.beginPath(); ctx.moveTo(-12, -10); ctx.quadraticCurveTo(-26, -30, -16, -50); ctx.quadraticCurveTo(-14, -30, -4, -16); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(12, -10); ctx.quadraticCurveTo(26, -30, 16, -50); ctx.quadraticCurveTo(14, -30, 4, -16); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-17, -6); ctx.quadraticCurveTo(-19, 18, 0, 26); ctx.quadraticCurveTo(19, 18, 17, -6); ctx.quadraticCurveTo(0, -20, -17, -6); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#05070c';
    ctx.beginPath(); ctx.ellipse(-7, 4, 5, 8, -.15, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(7, 4, 5, 8, .15, 0, PI2); ctx.fill();
    // a dark cloak under the mask
    ctx.fillStyle = 'rgba(20,28,44,.9)';
    ctx.beginPath(); ctx.moveTo(-14, 24); ctx.quadraticCurveTo(-24, 50, -18, 62); ctx.lineTo(18, 62); ctx.quadraticCurveTo(24, 50, 14, 24); ctx.closePath(); ctx.fill();
  },
  nail(pr) { ctx.rotate((pr.side ? -1 : 1) * (.45 + pr.ph * .04)); drawNail(1.15); },
  guard(pr) {
    ctx.fillStyle = '#e8337a';
    rr(-20, -18, 40, 70, 16); ctx.fill();
    ctx.fillStyle = '#c21f60'; ctx.fillRect(-20, 20, 40, 3);
    ctx.fillStyle = '#0c0c0c'; ctx.beginPath(); ctx.ellipse(0, -2, 14, 17, 0, 0, PI2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.6;
    const shape = pr.n % 3;
    ctx.beginPath();
    if (shape === 0) ctx.arc(0, -2, 7, 0, PI2);
    else if (shape === 1) { ctx.moveTo(0, -10); ctx.lineTo(8, 5); ctx.lineTo(-8, 5); ctx.closePath(); }
    else ctx.rect(-6.5, -8.5, 13, 13);
    ctx.stroke();
  },
  dalgona() {
    const g = ctx.createRadialGradient(-6, -6, 4, 0, 0, 26);
    g.addColorStop(0, '#e8b85a'); g.addColorStop(1, '#a8621e');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 24, 0, PI2); ctx.fill();
    ctx.strokeStyle = 'rgba(80,40,10,.75)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(0, -2, 11, Math.PI, PI2); ctx.moveTo(-11, -2); ctx.lineTo(11, -2); ctx.moveTo(0, -2); ctx.lineTo(0, 10); ctx.arc(-3, 10, 3, 0, Math.PI); ctx.stroke();
    ctx.strokeStyle = 'rgba(60,25,5,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(14, -14); ctx.lineTo(6, -4); ctx.lineTo(10, 4); ctx.stroke();
  },
  piggy() {
    ctx.fillStyle = 'rgba(255,170,200,.5)'; ctx.strokeStyle = '#ff8ab8'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, 30, 22, 0, 0, PI2); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 6; i++) circle(-14 + i * 5 + (i % 2) * 2, 10 - (i % 3) * 5, 4, '#f5c542');
    ctx.fillStyle = '#ff8ab8'; ctx.beginPath(); ctx.ellipse(30, 2, 6, 7, 0, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-14, -18); ctx.lineTo(-8, -30); ctx.lineTo(-2, -20); ctx.fill();
    ctx.fillRect(-20, 18, 6, 10); ctx.fillRect(12, 18, 6, 10);
    ctx.fillStyle = '#7a2d4a'; ctx.fillRect(-6, -22, 12, 3);
  },
  planet() {
    const g = ctx.createRadialGradient(-8, -8, 2, 0, 0, 26);
    g.addColorStop(0, '#f6b26b'); g.addColorStop(1, '#5a2a12');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 24, 0, PI2); ctx.fill();
    ctx.strokeStyle = 'rgba(243,211,107,.7)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(0, 0, 42, 9, -.35, 0, PI2); ctx.stroke();
  },
  satellite(pr, t) {
    ctx.rotate(Math.sin(t * .0006 + pr.ph) * .5);
    ctx.fillStyle = '#5b6e9c'; ctx.fillRect(-32, -6, 18, 12); ctx.fillRect(14, -6, 18, 12);
    ctx.strokeStyle = '#9fb2dd'; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { ctx.strokeRect(-32 + i * 6, -6, 6, 12); ctx.strokeRect(14 + i * 6, -6, 6, 12); }
    ctx.fillStyle = '#c9ced6'; ctx.fillRect(-9, -8, 18, 16);
    ctx.fillStyle = LV.pal.accent; ctx.fillRect(-1, -14, 2, 6);
  },
  rocket(pr, t) {
    ctx.translate(0, Math.sin(t * .002 + pr.ph) * 6);
    ctx.fillStyle = '#e8e2d0';
    ctx.beginPath(); ctx.moveTo(0, -26); ctx.quadraticCurveTo(10, -10, 8, 14); ctx.lineTo(-8, 14); ctx.quadraticCurveTo(-10, -10, 0, -26); ctx.fill();
    ctx.fillStyle = LV.pal.accent; ctx.fillRect(-12, 6, 5, 10); ctx.fillRect(7, 6, 5, 10);
    ctx.fillStyle = `rgba(255,170,60,${.6 + .4 * Math.random()})`;
    ctx.beginPath(); ctx.moveTo(-5, 15); ctx.lineTo(5, 15); ctx.lineTo(0, 26 + Math.sin(t * .05) * 4); ctx.fill();
    circle(0, -6, 3.5, '#3c5a8c');
  },
  tree() {
    px(-4, 0, 8, 34, '#6b4a26'); px(-4, 0, 3, 34, '#8a6034');
    const greens = ['#3f8f2a', '#4ea434', '#2f7520'];
    for (let y = -30; y < 6; y += 6) for (let x = -24; x < 24; x += 6) if (Math.abs(x) + Math.abs(y + 12) < 34) px(x, y, 6, 6, greens[Math.abs(x * 7 + y * 13 + 99) % 3]);
  },
  pickaxe() {
    ctx.rotate(-.75);
    for (let i = 0; i < 10; i++) px(-3, -6 + i * 5, 5, 5, i % 2 ? '#7a5230' : '#5e3e22');
    for (let i = -4; i <= 4; i++) px(i * 5 - 2, -12 + Math.abs(i) * 2, 5, 5, Math.abs(i) > 2 ? '#2fd0c4' : '#6ff2e8');
  },
  torch() {
    px(-3, -6, 6, 34, '#7a5230');
    const f = Math.random() * 2;
    ctx.shadowColor = '#ffb347'; ctx.shadowBlur = 18;
    px(-5, -16 - f, 10, 10, '#ffcf4a'); px(-3, -20 - f, 6, 6, '#fff3b0');
    ctx.shadowBlur = 0;
  },
  diamond() {
    const c = ['#bff9ff', '#6ff2e8', '#2fd0c4', '#1a9e95'];
    [[0, -18], [-6, -12], [6, -12], [-12, -6], [12, -6], [-6, -6], [6, -6], [0, -6], [-6, 0], [0, 0], [6, 0], [0, 6]].forEach(([x, y], i) => px(x - 3, y - 3, 6, 6, c[i % 4]));
  },
  hat(pr, t) {
    ctx.rotate(Math.sin(t * .001 + pr.ph) * .08);
    ctx.fillStyle = '#3b2552';
    ctx.beginPath(); ctx.ellipse(0, 22, 30, 7, 0, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-18, 20); ctx.quadraticCurveTo(-6, -10, 8, -36); ctx.quadraticCurveTo(14, -40, 18, -34); ctx.quadraticCurveTo(6, -14, 18, 20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c9a227'; ctx.fillRect(-17, 12, 34, 5);
    ctx.fillStyle = '#ffd75e'; ctx.font = `400 12px ${SERIF}`; ctx.textAlign = 'center'; ctx.fillText('★', 2, 2);
  },
  owl(pr, t) {
    ctx.fillStyle = '#f2f0ea'; ctx.beginPath(); ctx.ellipse(0, 6, 17, 22, 0, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -14, 14, 0, PI2); ctx.fill();
    ctx.fillStyle = '#c9c4b8'; for (let i = 0; i < 5; i++) ctx.fillRect(-8 + i * 4, 4 + (i % 2) * 6, 2, 2);
    const blink = Math.sin(t * .002 + pr.ph) > .97;
    for (const sx of [-6, 6]) {
      circle(sx, -15, 5, '#f5c542');
      if (!blink) circle(sx, -15, 2.4, '#111'); else px(sx - 5, -15, 10, 1.5, '#111');
    }
    ctx.fillStyle = '#4a3a2a'; ctx.beginPath(); ctx.moveTo(-2, -10); ctx.lineTo(2, -10); ctx.lineTo(0, -6); ctx.fill();
  },
  broom() {
    ctx.rotate(.6);
    ctx.fillStyle = '#7a5230'; ctx.fillRect(-2, -44, 4, 60);
    ctx.fillStyle = '#c9a25a'; ctx.beginPath(); ctx.moveTo(-4, 14); ctx.lineTo(4, 14); ctx.lineTo(12, 44); ctx.lineTo(-12, 44); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(90,60,20,.6)'; ctx.lineWidth = 1; for (let i = -9; i <= 9; i += 3) { ctx.beginPath(); ctx.moveTo(i * .3, 16); ctx.lineTo(i, 44); ctx.stroke(); }
    ctx.fillStyle = '#5e3e22'; ctx.fillRect(-5, 12, 10, 4);
  },
  ghost(pr, t) {
    const col = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'][pr.n % 4];
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(0, -4, 16, Math.PI, PI2); ctx.lineTo(16, 16);
    const w = Math.floor(t / 150) % 2;
    for (let i = 0; i < 4; i++) { ctx.lineTo(16 - (i * 8 + 4), w ? 10 : 14); ctx.lineTo(16 - (i + 1) * 8, 16); }
    ctx.closePath(); ctx.fill();
    for (const sx of [-6, 6]) { circle(sx, -5, 5, '#fff'); circle(sx + 2, -4, 2.5, '#2121ff'); }
  },
  cherry() {
    ctx.strokeStyle = '#a05a1e'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-8, 4); ctx.quadraticCurveTo(0, -20, 10, -22); ctx.moveTo(8, 8); ctx.quadraticCurveTo(10, -10, 10, -22); ctx.stroke();
    circle(-8, 8, 9, '#e8001c'); circle(8, 12, 9, '#e8001c');
    circle(-11, 5, 2.5, 'rgba(255,255,255,.7)'); circle(5, 9, 2.5, 'rgba(255,255,255,.7)');
  },
  pills(pr, t) {
    ctx.rotate(Math.sin(t * .001 + pr.ph) * .3);
    for (const [y, a, b] of [[-10, '#ff2a2a', '#8a0000'], [12, '#2a6bff', '#00218a']]) {
      ctx.save(); ctx.translate(0, y); ctx.rotate(-.4);
      const g = ctx.createLinearGradient(0, -6, 0, 6); g.addColorStop(0, a); g.addColorStop(1, b);
      ctx.fillStyle = g; rr(-16, -6, 32, 12, 6); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.45)'; rr(-12, -4, 14, 3, 2); ctx.fill();
      ctx.restore();
    }
  },
  shades() {
    ctx.fillStyle = '#050505'; ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 1.5;
    for (const sx of [-14, 14]) { ctx.beginPath(); ctx.ellipse(sx, 0, 12, 8, 0, 0, PI2); ctx.fill(); ctx.stroke(); }
    ctx.fillRect(-3, -3, 6, 2); ctx.fillRect(-36, -4, 10, 2); ctx.fillRect(26, -4, 10, 2);
    ctx.fillStyle = 'rgba(0,255,106,.35)'; ctx.fillRect(-20, -4, 7, 2); ctx.fillRect(8, -4, 7, 2);
  },
  rabbit() {
    ctx.fillStyle = '#f4f4f4';
    ctx.beginPath(); ctx.ellipse(-4, -26, 4, 13, -.2, 0, PI2); ctx.ellipse(5, -27, 4, 13, .2, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -8, 11, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 14, 15, 17, 0, 0, PI2); ctx.fill();
    circle(-4, -9, 1.8, '#c0102a'); circle(4, -9, 1.8, '#c0102a');
  },
  buoy() {
    ctx.lineWidth = 11;
    for (let i = 0; i < 8; i++) { ctx.strokeStyle = i % 2 ? '#ffffff' : '#e3262f'; ctx.beginPath(); ctx.arc(0, 0, 20, i * Math.PI / 4, (i + 1) * Math.PI / 4); ctx.stroke(); }
    ctx.strokeStyle = '#c9b48a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 26, 0, PI2); ctx.stroke();
  },
  ship() {
    ctx.scale(.62, .62);
    ctx.fillStyle = '#101010'; ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(74, 0); ctx.lineTo(62, 22); ctx.lineTo(-62, 22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f2f2f2'; ctx.fillRect(-56, -12, 112, 12);
    for (let i = 0; i < 4; i++) { ctx.fillStyle = '#d68a1c'; ctx.fillRect(-42 + i * 26, -36, 12, 24); ctx.fillStyle = '#111'; ctx.fillRect(-42 + i * 26, -36, 12, 6); }
    ctx.fillStyle = '#ffdd88'; for (let i = 0; i < 12; i++) ctx.fillRect(-60 + i * 10, 6, 3, 3);
  },
  iceberg() {
    ctx.fillStyle = '#e8f4ff';
    ctx.beginPath(); ctx.moveTo(-34, 14); ctx.lineTo(-20, -18); ctx.lineTo(-8, -10); ctx.lineTo(4, -34); ctx.lineTo(18, -6); ctx.lineTo(34, 14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a9cde8'; ctx.beginPath(); ctx.moveTo(4, -34); ctx.lineTo(18, -6); ctx.lineTo(34, 14); ctx.lineTo(8, 14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(80,140,200,.45)'; ctx.beginPath(); ctx.moveTo(-40, 14); ctx.lineTo(40, 14); ctx.lineTo(24, 40); ctx.lineTo(-26, 36); ctx.closePath(); ctx.fill();
  },
  heart(pr, t) {
    ctx.strokeStyle = '#c9c9c9'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-20, -30); ctx.quadraticCurveTo(0, -10, 20, -30); ctx.stroke();
    ctx.shadowColor = '#4fa3ff'; ctx.shadowBlur = 14 + 6 * Math.sin(t * .004);
    ctx.fillStyle = '#1e5fd6';
    ctx.beginPath(); ctx.moveTo(0, 14); ctx.bezierCurveTo(-24, -2, -14, -24, 0, -10); ctx.bezierCurveTo(14, -24, 24, -2, 0, 14); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-6, -8, 4, 2.5, -.6, 0, PI2); ctx.fill();
  },
};
function drawNail(s, color = '#c9d2de') {
  ctx.scale(s, s);
  const g = ctx.createLinearGradient(-3, 0, 3, 0);
  g.addColorStop(0, '#8d97a6'); g.addColorStop(.5, color); g.addColorStop(1, '#7c8696');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-3, -44); ctx.lineTo(3, -44); ctx.lineTo(3, 2); ctx.lineTo(0, 12); ctx.lineTo(-3, 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d9dee6'; ctx.fillRect(-10, -47, 20, 4);
  ctx.fillStyle = '#4a3a30'; ctx.fillRect(-2.5, -62, 5, 15);
  ctx.fillStyle = '#6b5644'; for (let y = -60; y < -47; y += 4) ctx.fillRect(-2.5, y, 5, 1.5);
}
function drawProps(t, cam) {
  for (const pr of props) {
    if (pr.y - cam < -110 || pr.y - cam > H + 110) continue;
    ctx.save();
    ctx.globalAlpha = .88;
    ctx.translate(pr.x, pr.y);
    ctx.scale(pr.s * (pr.side && pr.kind === 'head' ? -1 : 1), pr.s);
    PROPS[pr.kind](pr, t);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
