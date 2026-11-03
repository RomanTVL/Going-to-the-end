// ---------- sound: a projector hum, and every word you land on plays a note ----------
const AU = { c: null, out: null, html: null, unlocked: false, muted: store.get('gtte-mute') === '1' };
const VOL = .9;
const SILENT_WAV = 'data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';
function audioInit() {
  if (!AU.c) {
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      AU.c = new C();
      AU.out = AU.c.createGain();
      AU.out.gain.value = AU.muted ? 0 : VOL;
      AU.out.connect(AU.c.destination);
      const c = AU.c, len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = .8;
      const g = c.createGain(); g.gain.value = .05;
      // the shutter of a projector flutters at 24 frames a second
      const lfo = c.createOscillator(), lg = c.createGain();
      lfo.frequency.value = 24; lg.gain.value = .025;
      lfo.connect(lg); lg.connect(g.gain);
      src.connect(bp); bp.connect(g); g.connect(AU.out);
      src.start(); lfo.start();
    } catch (e) { AU.c = null; return; }
  }
  if (AU.c.state !== 'running') AU.c.resume().catch(() => {});
  if (!AU.unlocked) {
    // iPhone plays Web Audio through the ringer channel, so the silent switch mutes it,
    // unless the page asks for media playback or a media element has played once
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* not supported */ }
    try {
      AU.html = AU.html || new Audio(SILENT_WAV);
      const pr = AU.html.play();
      if (pr) pr.then(() => { AU.unlocked = true; }).catch(() => {});
    } catch (e) { /* no media element */ }
  }
}
// a finger's pointerdown is not a user gesture for Safari, so unlock sound on the events that are
for (const ev of ['pointerup', 'touchend', 'click', 'keydown']) addEventListener(ev, audioInit, { capture: true, passive: true });

// the first sounds land while the context is still waking up; hold them until it runs
function ready(fn) {
  if (!AU.c || AU.c.state === 'closed') return false;
  if (AU.c.state !== 'running') { AU.c.resume().then(fn).catch(() => {}); return false; }
  return true;
}
function tone(freq, dur = .7, vol = .14, when = 0, wave = 'sine') {
  if (!ready(() => tone(freq, dur, vol, when, wave))) return;
  const c = AU.c, t = c.currentTime + when;
  // a few harmonics so the note survives a phone speaker
  for (const [mul, v, ty] of [[1, vol, wave], [2, vol * .35, 'triangle'], [3, vol * .12, 'sine']]) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = ty; o.frequency.value = freq * mul;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(ty === 'square' || ty === 'sawtooth' ? v * .35 : v, t + .008);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(AU.out); o.start(t); o.stop(t + dur + .05);
  }
}
function noise(dur = .15, vol = .2, freq = 2500, type = 'highpass') {
  if (!ready(() => noise(dur, vol, freq, type))) return;
  const c = AU.c, t = c.currentTime, len = Math.ceil(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = buf; f.type = type; f.frequency.value = freq; g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(AU.out); s.start(t);
}
function sweep(f0, f1, dur, vol = .08, wave = 'square') {
  if (!ready(() => sweep(f0, f1, dur, vol, wave))) return;
  const c = AU.c, t = c.currentTime, o = c.createOscillator(), g = c.createGain();
  o.type = wave; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(AU.out); o.start(t); o.stop(t + dur + .02);
}
function horn() {
  if (!ready(horn)) return;
  const c = AU.c, t = c.currentTime;
  for (const f of [311, 392]) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.09, t + .03);
    g.gain.setValueAtTime(.09, t + .8); g.gain.linearRampToValueAtTime(0, t + 1);
    o.connect(g); g.connect(AU.out); o.start(t); o.stop(t + 1.1);
  }
}
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
const SOLFEGE = { 'До': 523.3, 'Ре': 587.3, 'Ми': 659.3, 'Фа': 698.5, 'Соль': 784, 'Ля': 880, 'Си': 987.8 };
function landNote(pl, impact) {
  const base = LV.sound.base * (LV.sound.base < 300 ? 2 : 1);
  const f = pl.note || base * Math.pow(2, PENTA[Math.floor(clamp((pl.x + pl.w / 2) / W, 0, .999) * PENTA.length)] / 12) / (pl.size >= 30 ? 2 : 1);
  tone(f, .9, .12 + .16 * impact, 0, LV.sound.wave);
}
function setMute(m) {
  AU.muted = m;
  store.set('gtte-mute', m ? '1' : '0');
  if (AU.out) AU.out.gain.value = m ? 0 : VOL;
  if (!m) tone(784, .5, .12);
  $('snd').setAttribute('aria-pressed', String(!m));
}
