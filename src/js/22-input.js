// ---------- input ----------
function togglePause(force) {
  if (S.mode === 'pause' && force !== true) { S.mode = S.pauseFrom; S.pauseFrom = null; }
  else if (S.mode === 'play' || S.mode === 'cut') { S.pauseFrom = S.mode; S.mode = 'pause'; keys.left = keys.right = keys.jump = false; say('pause', { chance: .35, cool: 90 }); }
  hud();
}
function newRun() {
  RUN = freshRun(); saveRun();
  toMenu();
}
function press(k) {
  audioInit();
  if (S.mode === 'pause') { togglePause(); return; }
  if (S.mode === 'menu') {
    if (menu.screen === 'ach' && (k === 'left' || k === 'right')) { achFlip(k === 'left' ? -1 : 1); return; }
    if (k === 'left') menuMove(menu.screen === 'levels' ? -9 : -1); else if (k === 'right') menuMove(menu.screen === 'levels' ? 9 : 1); else menuActivate();
    return;
  }
  if (S.mode === 'intro') { if (S.modeT > .6) play(); return; }
  if (S.mode === 'over') { if (S.modeT > 2.5) toMenu('modes'); return; }
  if (S.mode === 'clear') {
    if (S.mdone) { if (S.modeT > 2.4) toMenu(); }
    else if (LV.extra) { if (S.modeT > 5.4) toMenu('modes'); }
    else if (RUN.kind !== 'marathon' && S.modeT > 2.2) reelChange(() => startLevel(RUN.li));
    return;
  }
  if (S.mode === 'ending') {
    if (S.modeT > ENDING_LEN[S.ending] || S.replay && S.modeT > 1) toMenu(S.replay ? 'endings' : S.ending === 'rise' ? 'modes' : 'stats');
    return;
  }
  if (k === 'jump') S.p.buffer = .12;
}
const MAP = {
  ArrowLeft: 'left', a: 'left', 'ф': 'left',
  ArrowRight: 'right', d: 'right', 'в': 'right',
  ' ': 'jump', ArrowUp: 'jump', w: 'jump', 'ц': 'jump', Enter: 'jump',
};
const keyOf = e => MAP[e.key.length === 1 ? e.key.toLowerCase() : e.key];
addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const ch = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (ch === 'm' || ch === 'ь') { setMute(!AU.muted); return; }
  if (ch === 'n' || ch === 'т') { setMusic(!MUS.on); return; }
  if (ch === 'f' || ch === 'а' || ch === 'F11') { e.preventDefault(); toggleFullscreen(); return; }
  if (S.mode === 'menu') {
    if (ch === 'ArrowUp' || ch === 'w' || ch === 'ц') { e.preventDefault(); menuMove(-1); return; }
    if (ch === 'ArrowDown' || ch === 's' || ch === 'ы') { e.preventDefault(); menuMove(1); return; }
    if (ch === 'Escape' || ch === 'Backspace') { e.preventDefault(); menuBack(); return; }
  }
  if (S.mode === 'ending' && S.replay && ch === 'Escape') { toMenu('endings'); return; }
  // leaving the marathon halfway: back to the menu from the pause
  if (S.mode === 'pause' && RUN.kind === 'marathon' && (ch === 'q' || ch === 'й')) { toMenu(); return; }
  if ((ch === 'k' || ch === 'л') && CHEAT.on && S.mode === 'play') { RUN.cheat = true; finishLevel(); return; }
  if (ch === 'p' || ch === 'з' || ch === 'Escape') { e.preventDefault(); togglePause(); return; }
  const k = keyOf(e);
  if (!k) return;
  e.preventDefault();
  if (e.repeat) return;
  keys[k] = true;
  press(k);
});
addEventListener('keyup', e => {
  const k = keyOf(e);
  if (!k) return;
  keys[k] = false;
  // a short tap gives a short hop
  if (k === 'jump' && S.p.vy < 0) S.p.vy *= .5;
});
addEventListener('blur', () => { keys.left = keys.right = keys.jump = false; if (S.mode === 'play') togglePause(true); });
document.addEventListener('visibilitychange', () => { if (document.hidden && S.mode === 'play') togglePause(true); });
cv.addEventListener('pointerdown', e => {
  if (S.mode === 'menu') {
    // tap a menu row to open it
    const r = cv.getBoundingClientRect(), y = (e.clientY - r.top) / r.height * H;
    const x = (e.clientX - r.left) / r.width * W;
    const row = menu.rows.find(q => y >= q.y0 && y <= q.y1 && x >= q.x0 && x <= q.x1);
    if (row) { audioInit(); if (row.i < 0) achFlip(row.i === -1 ? -1 : 1); else menuActivate(row.i); }
    return;
  }
  if (S.mode !== 'play' && S.mode !== 'cut') press('jump');
});
for (const b of $('pads').querySelectorAll('button')) {
  const k = b.dataset.k;
  const down = e => { e.preventDefault(); keys[k] = true; b.classList.add('on'); press(k); };
  const up = () => { keys[k] = false; b.classList.remove('on'); if (k === 'jump' && S.p.vy < 0) S.p.vy *= .5; };
  b.addEventListener('pointerdown', down);
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, up);
}
$('snd').addEventListener('click', () => setMute(!AU.muted));
$('pause').addEventListener('click', () => togglePause());
$('fresh').addEventListener('click', newRun);
$('full').addEventListener('click', toggleFullscreen);
