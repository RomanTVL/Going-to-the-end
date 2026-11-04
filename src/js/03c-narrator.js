// ---------- the narrator: the projectionist talks from his booth, with subtitles ----------
// The lines live in src/narrator.json (NARR); recordings, if made with tools/voice.mjs, come as VOICE.
// Without a recording a line is shown as a subtitle only.
const NAR = {
  on: store.get('gtte-narrator') !== '0', subs: store.get('gtte-subs') !== '0',
  cur: null, last: -1e9, cool: {}, lastId: {}, bufs: {}, src: null,
};
const narrNow = () => performance.now() / 1000;
const hasVoice = () => Object.keys(VOICE).length > 0;
// 'death' picks among death.1, death.2…; 'death.bullet' is a line of its own
function narrIds(key) {
  if (NARR[key]) return [key];
  return Object.keys(NARR).filter(k => k.startsWith(key + '.') && /^\d+$/.test(k.slice(key.length + 1)));
}
// say a line for an event: chance, a cooldown for that event, and never over another line unless forced
function say(key, { chance = 1, cool = 0, force = false } = {}) {
  if (!NAR.on) return false;
  const now = narrNow();
  if (!force && (NAR.cur || now - NAR.last < 3.5 || (NAR.cool[key] || 0) > now || Math.random() > chance)) return false;
  const ids = narrIds(key);
  if (!ids.length) return false;
  const pool = ids.length > 1 ? ids.filter(id => id !== NAR.lastId[key]) : ids;
  const id = pick(pool);
  NAR.lastId[key] = id; NAR.cool[key] = now + cool;
  narrStop();
  const text = NARR[id];
  NAR.cur = { id, text, at: now, dur: 1.4 + text.length * .062, audio: false };
  if (VOICE[id]) narrPlay(id);
  return true;
}
function narrStop() { if (NAR.src) { try { NAR.src.stop(); } catch (e) { /* already stopped */ } NAR.src = null; } NAR.cur = null; }
function narrPlay(id) {
  if (!AU.c) audioInit();
  if (!AU.c) return;
  const cur = NAR.cur, go = buf => {
    if (NAR.cur !== cur) return;
    const s = AU.c.createBufferSource(), g = AU.c.createGain();
    s.buffer = buf; g.gain.value = 1.15;
    s.connect(g); g.connect(AU.out); s.start();
    NAR.src = s; cur.audio = true; cur.dur = Math.max(cur.dur * .6, buf.duration + .5); cur.at = narrNow();
  };
  if (NAR.bufs[id]) { go(NAR.bufs[id]); return; }
  try {
    const bin = atob(VOICE[id]), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    AU.c.decodeAudioData(bytes.buffer).then(buf => { NAR.bufs[id] = buf; go(buf); }).catch(() => {});
  } catch (e) { /* a broken recording stays a subtitle */ }
}
function narrTick() {
  const c = NAR.cur;
  if (c && narrNow() - c.at > c.dur) { NAR.cur = null; NAR.last = narrNow(); }
}
// the subtitle: a strip low in the frame, the speaker's name above the words
function drawNarrator() {
  narrTick();
  const c = NAR.cur;
  if (!c || (c.audio && !NAR.subs)) return;
  const T = narrNow() - c.at, k = clamp(T / .25, 0, 1) * clamp((c.dur - T) / .35, 0, 1);
  if (k <= 0) return;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.font = `italic 500 18px ${SERIF}`;
  // wrap into at most two lines
  const words = c.text.split(' '), rows = [''];
  for (const w of words) { const tryRow = rows[rows.length - 1] ? rows[rows.length - 1] + ' ' + w : w; if (ctx.measureText(tryRow).width > W - 90 && rows[rows.length - 1]) rows.push(w); else rows[rows.length - 1] = tryRow; }
  // low in the frame, except over an ending, where the words of the ending sit low
  const top = S && (S.mode === 'ending' || S.mode === 'over');
  const y1 = top ? 30 + 22 * rows.length + 18 : H - 64, y0 = y1 - 22 * rows.length - 18;
  ctx.globalAlpha = .78 * k; ctx.fillStyle = '#050405'; rr(28, y0, W - 56, y1 - y0 + 12, 8); ctx.fill();
  ctx.globalAlpha = k; ctx.textAlign = 'center';
  ctx.font = `500 9px ${MONO}`; ctx.fillStyle = '#d8b26a'; ctx.fillText('КИНОМЕХАНИК', CX, y0 + 15);
  ctx.font = `italic 500 18px ${SERIF}`; ctx.fillStyle = '#f2ebdf';
  rows.forEach((r, i) => ctx.fillText(r, CX, y0 + 36 + i * 22));
  ctx.globalAlpha = 1;
}

// ===== when he speaks =====
function narrStart(fromMenu) {
  if (LV.extra) { say('intro.' + LV.key, { force: true }); return; }
  if (fromMenu) {
    if (RUN.kind === 'marathon') { say('marathon.start', { force: true }); return; }
    if (RUN.kind === 'life' && S.li === 0) { say('life.start', { force: true }); return; }
    if (RUN.kind === 'evening' && S.li === 0 && !RUN.res.some(Boolean)) { say('hello', { force: true }); return; }
    if (RUN.kind === 'evening') { say('continue', { force: true }); return; }
  }
  if (RUN.kind === 'marathon') return;
  say('intro.' + LV.key, { force: true });
}
function narrDeath(why) {
  if (RUN.kind === 'life') return;
  // the counter on the slate already shows the new take
  if (S.take === 5) { say('death.many', { force: true }); return; }
  if (S.take === 10) { say('death.lots', { force: true }); return; }
  if (/кадр/.test(why)) { say('death.frame', { chance: .45, cool: 25 }); return; }
  if (NARR['death.' + LV.hazard] && Math.random() < .55 && say('death.' + LV.hazard, { cool: 40 })) return;
  say('death', { chance: .45, cool: 10 });
}
function narrClear(r) {
  if (LV.extra) { if (LV.key === 'mix') say('mix.end', { force: true }); return; }
  if (RUN.kind === 'marathon') { if (LV.final) say('marathon.end', { force: true }); return; }
  if (LV.final) return;
  if (r.total && r.got === r.total) say('clear.stars', { force: true });
  else if (r.total && r.got === 0) say('clear.nostars', { chance: .7 });
  else if (r.t > r.par) say('clear.late', { force: true });
  else if (r.t < r.par * .6) say('clear.fast', { chance: .8 });
  else say('clear.ok', { chance: .6 });
}
