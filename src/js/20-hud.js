// ---------- hud ----------
function hud() {
  $('lvl').textContent = `${S.li + 1} / ${LEVELS.length} · ${checkpoints[S.cp] ? checkpoints[S.cp].name : ''}`;
  $('take').textContent = S.take;
  $('stars').textContent = `${stars.filter(s => s.got).length} / ${stars.length}`;
  $('fresh').hidden = !(S.mode === 'menu' && RUN.li > 0);
  $('cheatTag').hidden = !(CHEAT.on || RUN.cheat);
  $('pause').setAttribute('aria-pressed', String(S.mode === 'pause'));
  timer();
}
function timer() {
  const el = $('time');
  el.textContent = `${fmt(S.time)} / ${fmt(S.par)}`;
  el.classList.toggle('late', S.time > S.par);
}
