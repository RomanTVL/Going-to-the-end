// ---------- boot: re-measure the words once the typefaces arrive ----------
const fontsReady = Promise.race([
  Promise.all(LEVELS.flatMap(L => Object.values(L.fonts).map(f => document.fonts.load(f[0], 'АБВ')))),
  new Promise(r => setTimeout(r, 2500)),
]).catch(() => {});
$('snd').setAttribute('aria-pressed', String(!AU.muted));
startLevel(RUN.li, 'menu');
requestAnimationFrame(frame);
// @debug-hook
fontsReady.then(() => { if (S.mode === 'menu') startLevel(RUN.li, 'menu'); });
