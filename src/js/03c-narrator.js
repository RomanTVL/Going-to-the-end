// ---------- the narrator: the projectionist talks from his booth, by voice only ----------
// The lines live in src/narrator.json (NARR); recordings, made with tools/voice.mjs, come as VOICE.
// There are no subtitles: a line that has not been recorded is simply not said.
const NAR = { on: store.get('gtte-narrator') !== '0', cur: null, last: -1e9, cool: {}, lastId: {}, bufs: {}, src: null };
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
  const ids = narrIds(key).filter(id => VOICE[id]);
  if (!ids.length) return false;
  const pool = ids.length > 1 ? ids.filter(id => id !== NAR.lastId[key]) : ids;
  const id = pick(pool);
  NAR.lastId[key] = id; NAR.cool[key] = now + cool;
  narrStop();
  // until the recording is decoded, guess its length from the text
  NAR.cur = { id, at: now, dur: 1.4 + NARR[id].length * .062, audio: true };
  narrPlay(id);
  return true;
}
function narrStop() { if (NAR.src) { try { NAR.src.stop(); } catch (e) { /* already stopped */ } NAR.src = null; } NAR.cur = null; }
function narrPlay(id) {
  if (!AU.c) audioInit();
  if (!AU.c) { NAR.cur = null; return; }
  const cur = NAR.cur, go = buf => {
    if (NAR.cur !== cur) return;
    const s = AU.c.createBufferSource(), g = AU.c.createGain();
    s.buffer = buf; g.gain.value = 1.15;
    s.connect(g); g.connect(AU.out); s.start();
    NAR.src = s; cur.dur = buf.duration + .5; cur.at = narrNow();
  };
  if (NAR.bufs[id]) { go(NAR.bufs[id]); return; }
  try {
    const bin = atob(VOICE[id]), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    AU.c.decodeAudioData(bytes.buffer).then(buf => { NAR.bufs[id] = buf; go(buf); }).catch(() => { if (NAR.cur === cur) NAR.cur = null; });
  } catch (e) { NAR.cur = null; }
}
// called every frame: a finished line frees the narrator for the next one
function narrTick() {
  const c = NAR.cur;
  if (c && narrNow() - c.at > c.dur) { NAR.cur = null; NAR.last = narrNow(); }
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
