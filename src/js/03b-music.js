// ---------- music: every film gets its own little theme, played by a step sequencer ----------
// A bar is sixteen steps. Each film sets a tempo, a scale, four chords, an arpeggio and a drum kit;
// the root note is the film's own landing note, so the words you land on fit the music.
const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10],
  phryg: [0, 1, 3, 5, 7, 8, 10], harm: [0, 2, 3, 5, 7, 8, 11],
};
const THEMES = {
  menu: { bpm: 64, scale: 'major', prog: [0, 5, 3, 4], arp: [0, 4, 2, 4], drums: null, lead: 'sine', base: 220 },
  agent: { bpm: 104, scale: 'harm', prog: [0, 0, 5, 4], arp: [0, 4, 2, 4], drums: 'spy', lead: 'triangle' },
  plumber: { bpm: 150, scale: 'major', prog: [0, 3, 4, 0], arp: [0, 2, 4, 7], drums: 'chip', lead: 'square' },
  hollow: { bpm: 72, scale: 'minor', prog: [0, 5, 2, 6], arp: [0, 4, 7, 4], drums: null, lead: 'sine' },
  crew: { bpm: 110, scale: 'phryg', prog: [0, 1, 0, 6], arp: [0, 2, 0, 4], drums: 'soft', lead: 'triangle' },
  squid: { bpm: 92, scale: 'major', prog: [0, 4, 5, 3], arp: [0, 2, 4, 2], drums: 'soft', lead: 'triangle' },
  soul: { bpm: 108, scale: 'dorian', prog: [0, 3, 4, 0], arp: [0, 4, 2, 6], drums: 'chip', lead: 'square' },
  orbit: { bpm: 70, scale: 'major', prog: [0, 4, 5, 3], arp: [0, 4, 7, 11], drums: null, lead: 'sine' },
  blocks: { bpm: 140, scale: 'harm', prog: [0, 4, 0, 4], arp: [0, 2, 4, 2], drums: 'chip', lead: 'square' },
  cup: { bpm: 168, scale: 'major', prog: [0, 5, 1, 4], arp: [0, 2, 4, 5], drums: 'swing', lead: 'triangle' },
  cube: { bpm: 80, scale: 'major', prog: [0, 3, 0, 4], arp: [0, 4, 7, 4], drums: null, lead: 'sine' },
  club: { bpm: 120, scale: 'minor', prog: [0, 0, 5, 6], arp: [0, 0, 7, 0], drums: 'rock', lead: 'sawtooth' },
  upside: { bpm: 100, scale: 'minor', prog: [0, 5, 0, 5], arp: [0, 2, 4, 7], drums: 'soft', lead: 'sawtooth' },
  wizard: { bpm: 96, scale: 'harm', prog: [0, 3, 4, 0], arp: [0, 2, 4, 6], drums: null, lead: 'triangle' },
  wanted: { bpm: 92, scale: 'minor', prog: [0, 0, 3, 4], arp: [0, 0, 4, 0], drums: 'hiphop', lead: 'sawtooth' },
  dino: { bpm: 84, scale: 'major', prog: [0, 4, 3, 4], arp: [0, 4, 7, 4], drums: 'soft', lead: 'triangle' },
  deep: { bpm: 66, scale: 'dorian', prog: [0, 6, 5, 6], arp: [0, 4, 9, 4], drums: null, lead: 'sine' },
  basement: { bpm: 112, scale: 'phryg', prog: [0, 1, 0, 1], arp: [0, 3, 7, 3], drums: 'soft', lead: 'triangle' },
  hell: { bpm: 168, scale: 'phryg', prog: [0, 0, 1, 0], arp: [0, 0, 0, 1], drums: 'metal', lead: 'sawtooth' },
  night: { bpm: 60, scale: 'harm', prog: [0, 0, 1, 0], arp: [0, 6, 0, 6], drums: null, lead: 'sine' },
  chomp: { bpm: 150, scale: 'major', prog: [0, 0, 4, 4], arp: [0, 4, 7, 4], drums: 'chip', lead: 'square' },
  snap: { bpm: 88, scale: 'minor', prog: [0, 5, 3, 4], arp: [0, 4, 7, 4], drums: 'soft', lead: 'triangle' },
  neon: { bpm: 118, scale: 'minor', prog: [0, 5, 2, 6], arp: [0, 4, 7, 11], drums: 'synth', lead: 'sawtooth' },
  code: { bpm: 130, scale: 'phryg', prog: [0, 0, 5, 6], arp: [0, 7, 0, 7], drums: 'synth', lead: 'sawtooth' },
  liner: { bpm: 76, scale: 'major', prog: [0, 4, 5, 3], arp: [0, 4, 7, 4], drums: null, lead: 'triangle' },
  end: { bpm: 66, scale: 'major', prog: [0, 5, 3, 4], arp: [0, 4, 7, 9], drums: null, lead: 'sine' },
  rise: { bpm: 138, scale: 'harm', prog: [0, 5, 6, 4], arp: [0, 4, 7, 11], drums: 'rock', lead: 'sawtooth' },
};
// drum kits: which of the sixteen steps get a kick, a snare and a hat
const KITS = {
  soft: { k: [0, 8], s: [], h: [2, 6, 10, 14] },
  chip: { k: [0, 8], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], chip: true },
  spy: { k: [0, 10], s: [], h: [2, 4, 6, 10, 12, 14], rim: [4, 12] },
  rock: { k: [0, 6, 8], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] },
  metal: { k: [0, 2, 4, 6, 8, 10, 12, 14], s: [4, 12], h: [0, 4, 8, 12] },
  hiphop: { k: [0, 7, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] },
  swing: { k: [0, 8], s: [], h: [0, 3, 4, 7, 8, 11, 12, 15], brush: true },
  synth: { k: [0, 4, 8, 12], s: [4, 12], h: [2, 6, 10, 14] },
};
const MUS = { bus: null, on: store.get('gtte-music') !== '0', key: null, next: 0, step: 0, noise: null };

function musicTheme() {
  if (!S || S.mode === 'menu') return 'menu';
  // the secret session plays the theme of whichever film the dot is in
  const key = LV.sections && S.sec >= 0 && sections[S.sec] ? sections[S.sec].L.key : LV.key;
  return THEMES[key] ? key : 'end';
}
// how loud the music sits under the game, by what is on screen
function musicLevel() {
  if (!MUS.on || !S) return 0;
  // the music steps back while the projectionist speaks
  const duck = NAR.cur && NAR.cur.audio ? .4 : 1;
  return ({ play: .5, intro: .32, clear: .4, cut: .1, pause: 0, menu: .34, ending: 0, over: 0 }[S.mode] ?? .3) * duck;
}
function musicTick() {
  const c = AU.c;
  if (!c || c.state !== 'running') return;
  if (!MUS.bus) {
    MUS.bus = c.createGain(); MUS.bus.gain.value = 0; MUS.bus.connect(AU.out);
    const len = c.sampleRate, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    MUS.noise = buf;
  }
  MUS.bus.gain.setTargetAtTime(musicLevel(), c.currentTime, .25);
  const key = musicTheme();
  if (key !== MUS.key) { MUS.key = key; MUS.step = 0; MUS.next = Math.max(MUS.next, c.currentTime + .08); }
  if (!MUS.on) { MUS.next = c.currentTime; return; }
  const T = THEMES[key], dt = 60 / T.bpm / 4;
  if (MUS.next < c.currentTime - .5) MUS.next = c.currentTime + .05;
  while (MUS.next < c.currentTime + .25) { musicStep(T, MUS.step, MUS.next, dt); MUS.next += dt; MUS.step++; }
}
setInterval(musicTick, 60);

function musicStep(T, n, t, dt) {
  const step = n % 16, bar = Math.floor(n / 16), sc = SCALES[T.scale];
  let root = T.base || (LV.sound && LV.sound.base) || 220;
  while (root > 110) root /= 2;
  while (root < 55) root *= 2;
  const deg = i => { const o = Math.floor(i / sc.length); return root * Math.pow(2, (sc[((i % sc.length) + sc.length) % sc.length] + 12 * o) / 12); };
  const chord = T.prog[bar % T.prog.length];
  // swing pushes every second eighth a little late
  const sw = KITS[T.drums] && KITS[T.drums].brush && step % 4 === 2 ? dt * .33 : 0;
  if (step === 0) {
    // a soft pad holds the chord for the whole bar
    for (const k of [0, 2, 4]) mnote(deg(chord + k) * 2, t, dt * 16, .028, 'sine', dt * 3);
  }
  if (step % 8 === 0 || (T.drums === 'rock' || T.drums === 'metal') && step % 4 === 0) mnote(deg(chord), t, dt * 3.5, .13, 'triangle', .005);
  if (step % 2 === 0) {
    const a = T.arp[(step / 2) % T.arp.length];
    mnote(deg(chord + a) * 4, t + sw, dt * 2.2, T.lead === 'square' || T.lead === 'sawtooth' ? .022 : .05, T.lead || 'triangle', .004);
  }
  const K = KITS[T.drums];
  if (!K) return;
  if (K.k.includes(step)) mkick(t, .26);
  if (K.s.includes(step)) mhit(t + sw, .09, 1800, 'bandpass', .12);
  if (K.h.includes(step)) mhit(t + sw, K.brush ? .025 : .035, K.chip ? 6000 : 8000, 'highpass', K.brush ? .09 : .03);
  if (K.rim && K.rim.includes(step)) mnote(1700, t, .04, .03, 'square', .001);
}
function mnote(f, t, dur, vol, wave, att) {
  const c = AU.c, o = c.createOscillator(), g = c.createGain();
  o.type = wave; o.frequency.value = f;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(MUS.bus); o.start(t); o.stop(t + dur + .05);
}
function mkick(t, vol) {
  const c = AU.c, o = c.createOscillator(), g = c.createGain();
  o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + .12);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .22);
  o.connect(g); g.connect(MUS.bus); o.start(t); o.stop(t + .25);
}
function mhit(t, vol, freq, type, dur) {
  const c = AU.c, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = MUS.noise; f.type = type; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(MUS.bus); s.start(t, Math.random() * .8, dur + .02);
}
function setMusic(on) {
  MUS.on = on; store.set('gtte-music', on ? '1' : '0');
  if (on) audioInit();
}
