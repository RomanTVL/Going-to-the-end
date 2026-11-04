// ---------- hud ----------
function hud() {
  $('lvl').textContent = `${LV.extra ? LV.name.toUpperCase() : `${S.li + 1} / ${EVENING}`} · ${checkpoints[S.cp] ? checkpoints[S.cp].name : ''}`;
  $('take').textContent = S.take;
  $('stars').textContent = `${stars.filter(s => s.got).length} / ${stars.length}`;
  $('fresh').hidden = !(S.mode === 'menu' && RUN.li > 0);
  $('cheatTag').hidden = !(CHEAT.on || RUN.cheat);
  $('pause').setAttribute('aria-pressed', String(S.mode === 'pause'));
  timer();
}
function timer() {
  const el = $('time');
  // the marathon runs on one clock for the whole evening
  const m = RUN.kind === 'marathon', now = m ? marathonTime() : S.time, par = m ? EVENING * GUEST_PAR : S.par;
  el.textContent = `${fmt(now)} / ${fmt(par)}`;
  el.classList.toggle('late', now > par);
}
