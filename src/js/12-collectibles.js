// ---------- collectibles: a star in most films, something of their own in some ----------
function drawCollectible(x, y, t, L = LV) {
  const kind = L.starKind || 'star', c = L.pal.star;
  ctx.save(); ctx.translate(x, y);
  ctx.shadowColor = c; ctx.shadowBlur = 14;
  if (TOKENS[kind]) {
    TOKENS[kind](t, c, x, y);
  } else if (kind === 'coin') {
    const sx = Math.abs(Math.cos(t * .005 + x));
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.ellipse(0, 0, 8 * sx + 1, 10, 0, 0, PI2); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#c98a00'; ctx.fillRect(-1 * sx, -6, 2 * sx + .5, 12);
  } else if (kind === 'gem') {
    ctx.rotate(Math.PI / 4); px(-7, -7, 14, 14, '#4ff0f0'); ctx.shadowBlur = 0; px(-7, -7, 7, 7, '#bff9ff'); px(0, 0, 7, 7, '#1a9e95');
  } else if (kind === 'snitch') {
    const f = Math.sin(t * .05) * .6;
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.save(); ctx.rotate(-.3 - f); ctx.beginPath(); ctx.ellipse(-12, -2, 11, 4, 0, 0, PI2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.rotate(.3 + f); ctx.beginPath(); ctx.ellipse(12, -2, 11, 4, 0, 0, PI2); ctx.fill(); ctx.restore();
    const g = ctx.createRadialGradient(-2, -2, 1, 0, 0, 7); g.addColorStop(0, '#fff3b0'); g.addColorStop(1, '#c9a227');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 6.5, 0, PI2); ctx.fill();
  } else if (kind === 'task') {
    circle(0, 0, 8, '#ffd23f'); ctx.shadowBlur = 0; ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-1.3, -5, 2.6, 6.5); ctx.fillRect(-1.3, 3, 2.6, 2.4);
  } else if (kind === 'block') {
    drawBlock(-7, -7, TCOL[Object.keys(TCOL)[Math.floor(Math.abs(x)) % 7]], 14);
  } else if (kind === 'waffle') {
    ctx.fillStyle = '#d8a042'; rr(-8, -8, 16, 16, 3); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#a8701e'; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) ctx.fillRect(-6 + i * 4.5, -6 + j * 4.5, 3, 3);
  } else if (kind === 'amber') {
    const g = ctx.createRadialGradient(-2, -3, 1, 0, 0, 9); g.addColorStop(0, '#ffe08a'); g.addColorStop(1, '#c46a00');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -9); ctx.bezierCurveTo(8, -5, 8, 6, 0, 8); ctx.bezierCurveTo(-8, 6, -8, -5, 0, -9); ctx.fill();
  } else if (kind === 'battery') {
    ctx.fillStyle = '#e8e2d6'; rr(-8, -5, 15, 10, 2); ctx.fill(); ctx.fillRect(7, -2, 2, 4);
    ctx.shadowBlur = 0; ctx.fillStyle = '#3ddc4a'; ctx.fillRect(-6, -3, 11 * (.5 + .5 * Math.abs(Math.sin(t * .003 + x))), 6);
  } else if (kind === 'stone') {
    const sc = ['#2f6bff', '#e3262f', '#b44cff', '#3ddc4a', '#ffd23f', '#ff8a1e'][Math.floor(Math.abs(x + y)) % 6];
    ctx.shadowColor = sc; ctx.fillStyle = sc; ctx.rotate(Math.PI / 4); rr(-6, -6, 12, 12, 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(-4, -4, 4, 4);
  } else if (kind === 'soap') {
    ctx.rotate(-.3); const g = ctx.createLinearGradient(0, -6, 0, 6); g.addColorStop(0, '#ffb3d1'); g.addColorStop(1, '#e05592');
    ctx.fillStyle = g; rr(-11, -6, 22, 12, 4); ctx.fill();
  } else if (kind === 'heart') {
    ctx.fillStyle = '#e8233a'; ctx.beginPath(); ctx.moveTo(0, 8); ctx.bezierCurveTo(-13, -1, -8, -13, 0, -5); ctx.bezierCurveTo(8, -13, 13, -1, 0, 8); ctx.fill();
    ctx.shadowBlur = 0; circle(-4, -5, 2, 'rgba(255,255,255,.6)');
  } else if (kind === 'peeper') {
    ctx.scale(Math.sin(t * .002 + x) > 0 ? 1 : -1, 1);
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.ellipse(0, 0, 10, 6, 0, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-16, -5); ctx.lineTo(-16, 5); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; circle(4, -1, 3.6, '#fff'); circle(5, -1, 2, '#1a1a1a');
  } else if (kind === 'pellet') {
    circle(0, 0, 7 + Math.sin(t * .012) * 1.5, c);
  } else if (kind === 'pill') {
    ctx.rotate(-.5); const g = ctx.createLinearGradient(0, -5, 0, 5); g.addColorStop(0, '#ff5a5a'); g.addColorStop(1, '#8a0000');
    ctx.fillStyle = g; rr(-11, -5, 22, 10, 5); ctx.fill();
  } else if (kind === 'orb' || kind === 'pearl') {
    const g = ctx.createRadialGradient(-2, -3, 1, 0, 0, 8); g.addColorStop(0, '#ffffff'); g.addColorStop(1, kind === 'orb' ? '#6fb7ff' : '#b9d9f2');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 7.5, 0, PI2); ctx.fill();
  } else {
    ctx.fillStyle = c; ctx.font = `500 22px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('★', 0, 1);
  }
  ctx.restore();
}
