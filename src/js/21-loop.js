// ---------- loop ----------
// physics runs in fixed steps of 1/120 s, so the game plays the same on 60, 144 and 240 Hz screens
const STEP = 1 / 120;
let last = performance.now(), lastSec = -1, acc = 0, timeScale = 1;
function frame(t) {
  acc = Math.min(acc + Math.max(0, (t - last) / 1000) * timeScale, .1); last = t;
  while (acc >= STEP) { update(STEP); acc -= STEP; }
  render(t);
  drawToasts(t);
  postfx(t);
  const sec = Math.floor(S.time);
  if (sec !== lastSec) { lastSec = sec; timer(); }
  requestAnimationFrame(frame);
}
