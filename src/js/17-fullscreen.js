// ---------- fullscreen: the Windows build swaps in a real borderless window ----------
function toggleFullscreen() {
  if (typeof window.gtteFullscreen === 'function') { window.gtteFullscreen().then(v => setFs(!!v)).catch(() => {}); return; }
  const el = document.documentElement;
  try {
    if (!document.fullscreenElement) (el.requestFullscreen || el.webkitRequestFullscreen).call(el).catch?.(() => {});
    else (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  } catch (e) { /* fullscreen not allowed here */ }
}
function setFs(on) { document.body.classList.toggle('fs', on); $('full').setAttribute('aria-pressed', String(on)); }
document.addEventListener('fullscreenchange', () => setFs(!!document.fullscreenElement));
