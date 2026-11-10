// ---------- walking enemies hop between the lines ----------
// Mushrooms, the crew and the masked thugs no longer just walk to the end of a word and turn round:
// now and then they crouch, jump in an arc to another word (up, down or across) and land with a puff.
// In the air they ride an invisible platform along the arc, so their drawing, hit and stomp code
// works unchanged; the pose (squash, stretch, a somersault) is a transform around their feet.
const HOPPERS = {
  walker: { w: 20, h: 18, minW: 44, dust: '#8b4a22', flip: true },
  crew: { w: 18, h: 24, minW: 40, dust: '#cfe9ff', flip: false },
  thug: { w: 14, h: 34, minW: 40, dust: '#ff2ad8', flip: true },
};
const HOP_CROUCH = .2, HOP_LAND = .18;

// somewhere to jump: a free, steady word in the frame, within reach, not where the dot stands
function hopTarget(h, cfg) {
  const fx = h.pl.x + h.rx + cfg.w / 2, fy = h.pl.top, d = dotWorld(), g = S.p.ground;
  const out = [];
  for (const q of plats) {
    if (q === h.pl || !solid(q) || q.end || q.blink || q.fragile || q.block || q.glow || q.w < cfg.minW) continue;
    const sy = q.top - S.camY;
    if (sy < 60 || sy > H - 40 || q.top < fy - 90 || q.top > fy + 170) continue;
    if (S.hz.some(o => o !== h && o.alive && (o.pl === q || o.hop && o.hop.to === q))) continue;
    const rx = clamp(fx - q.x - cfg.w / 2 + Math.sign(q.x + q.w / 2 - fx || 1) * rand(30, 110), 0, q.w - cfg.w), lx = q.x + rx + cfg.w / 2;
    if (Math.abs(lx - fx) > 180 || Math.abs(lx - fx) < 24 && Math.abs(q.top - fy) < 20) continue;
    if (g === q && Math.abs(lx - d.x) < 44) continue;
    out.push({ q, rx });
  }
  return out.length ? pick(out) : null;
}

function hopStep(h, dt) {
  const cfg = HOPPERS[h.type];
  if (!h.alive) {
    // stomped in mid-air: the body drops out of the arc
    if (h.pl.air) { h.pl.vy = (h.pl.vy || 0) + 900 * dt; h.pl.top += h.pl.vy * dt; }
    h.hop = null;
    return false;
  }
  const J = h.hop;
  if (!J) {
    if (h.pl.air) return false;
    h.hopT = (h.hopT === undefined ? rand(1, 3) : h.hopT) - dt;
    // when the time comes, or now and then at the end of a word instead of turning round
    const atEdge = h.rx <= .5 || h.rx >= h.pl.w - cfg.w - .5;
    if (h.hopT > 0 && !(atEdge && Math.random() < .35)) return false;
    h.hopT = rand(1.6, 4.2);
    const tgt = hopTarget(h, cfg);
    if (!tgt) return false;
    const x0 = h.pl.x + h.rx;
    h.hop = { phase: 'crouch', t: 0, to: tgt.q, trx: tgt.rx, spin: cfg.flip && Math.random() < .6 ? PI2 : 0 };
    h.dir = Math.sign(tgt.q.x + tgt.rx - x0) || h.dir;
    if (h.hop.spin) h.hop.spin *= h.dir;
    return true;
  }
  J.t += dt;
  if (J.phase === 'crouch') {
    if (J.t < HOP_CROUCH) return true;
    // take off: from here the enemy rides an invisible platform along the arc
    const x0 = h.pl.x + h.rx, y0 = h.pl.top, dist = Math.hypot(J.to.x + J.trx - x0, J.to.top - y0);
    Object.assign(J, { phase: 'air', t: 0, x0, y0, dur: .42 + Math.min(.32, dist / 600), apex: 30 + Math.max(0, y0 - J.to.top) + dist * .08 });
    h.pl = { x: x0, top: y0, w: cfg.w, air: true, gone: false };
    h.rx = 0;
    sweep(300, 760, .14, .03, 'square');
    return true;
  }
  if (J.phase === 'air') {
    // the word it was aiming for crumbled away: it falls with it
    if (J.to.gone) { h.alive = false; h.sq = 0; h.pl.vy = 0; h.hop = null; return false; }
    const k = Math.min(1, J.t / J.dur), tx = J.to.x + J.trx, ty = J.to.top;
    h.pl.x = J.x0 + (tx - J.x0) * k;
    h.pl.top = J.y0 + (ty - J.y0) * k - J.apex * 4 * k * (1 - k);
    if (k >= 1) {
      J.phase = 'land'; J.t = 0; h.pl = J.to; h.rx = J.trx;
      burst(J.to.x + J.trx + cfg.w / 2, J.to.top, 7, cfg.dust, 80, 2.5);
      noise(.07, .14, 900, 'lowpass');
    }
    return true;
  }
  if (J.t >= HOP_LAND) h.hop = null;
  return true;
}
// the pose for this moment of the jump, around the enemy's feet
function hopPose(h) {
  const cfg = HOPPERS[h.type], J = h.hop;
  if (!cfg || !J) return;
  const fx = h.pl.x + h.rx + cfg.w / 2, fy = h.pl.top;
  let sx = 1, sy = 1, rot = 0;
  if (J.phase === 'crouch') { const k = J.t / HOP_CROUCH; sx = 1 + .3 * k; sy = 1 - .35 * k; }
  else if (J.phase === 'air') {
    const k = Math.min(1, J.t / J.dur), st = Math.max(0, 1 - k * 2.5);
    sx = 1 - .2 * st; sy = 1 + .3 * st;
    rot = J.spin ? J.spin * ease(k) : .3 * h.dir * Math.sin(k * Math.PI);
  } else { const k = 1 - J.t / HOP_LAND; sx = 1 + .35 * k; sy = 1 - .4 * k; }
  ctx.translate(fx, fy); ctx.scale(sx, sy);
  if (rot) { ctx.translate(0, -cfg.h / 2); ctx.rotate(rot); ctx.translate(0, cfg.h / 2); }
  ctx.translate(-fx, -fy);
}
for (const type of Object.keys(HOPPERS)) {
  const walk = HZ[type].step;
  HZ[type].step = (h, dt) => { if (!hopStep(h, dt)) walk(h, dt); };
}
