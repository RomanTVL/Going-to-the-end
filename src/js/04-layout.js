// ---------- layout: every word on screen is a platform ----------
let LV = LEVELS[0];
let plats = [], deco = [], stars = [], checkpoints = [], props = [], endTop = 0;

function platform(text, font, size, x, base, color, extra = {}) {
  ctx.font = font;
  const fragile = text.startsWith('~');
  if (fragile) text = text.slice(1);
  const m = ctx.measureText(text);
  // stand on the real tops of the letters, whatever the typeface
  const asc = m.actualBoundingBoxAscent || size * .66;
  const p = { text, font, size, x, bx: x, dx: 0, w: m.width, base, top: base - asc, color, fragile, hold: 0, gone: false, goneT: 0, off: false, ...extra };
  if (SOLFEGE[text]) p.note = SOLFEGE[text];
  plats.push(p);
  return p;
}
function measure(text, font) { ctx.font = font; return ctx.measureText(text.replace('~', '')).width; }
function row(words, [font, size, sep], y, color, extra) {
  const ws = words.map(t => measure(t, font));
  const x0 = CX - (ws.reduce((s, v) => s + v, 0) + sep * (words.length - 1)) / 2;
  let x = x0;
  const out = words.map((t, i) => { const p = platform(t, font, size, x, y, color, extra); x += ws[i] + sep; return p; });
  return { out, x0, ws };
}

function layout() {
  plats = []; deco = []; stars = []; checkpoints = []; props = [];
  const f = LV.fonts, P = LV.pal;
  let y = H * .42;
  for (const entry of LV.credits) {
    const [type, ...a] = entry;
    const opt = a.length && typeof a[a.length - 1] === 'object' ? a.pop() : {};
    const extra = {};
    if (opt.blink) Object.assign(extra, { blink: opt.blink, phase: opt.phase || 0 });
    if (opt.sway) Object.assign(extra, { sway: opt.sway, phase: opt.phase || 0 });
    if (type === '*') {
      stars.push({ x: CX + a[0], y: y + a[1], got: false, banked: false });
    } else if (type === 'title') {
      // the title is separate words, the gaps between them are the first way down
      const { out, x0, ws } = row(a[0].split(' '), f.title, y, P.film, { glow: true });
      checkpoints.push({ name: 'Начало', top: out[0].top, x: x0 + ws[0] / 2 });
      y += LINE * 1.6;
    } else if (type === 'h') {
      y += LINE * .45;
      const text = a[0].toUpperCase();
      const p = platform(text, f.head[0], f.head[1], CX - measure(text, f.head[0]) / 2, y, P.film);
      checkpoints.push({ name: a[0], top: p.top, x: CX });
      y += LINE * 1.15;
    } else if (type === 'r') {
      const role = a[0].toUpperCase();
      platform(role, f.role[0], f.role[1], CX - 18 - measure(role, f.role[0]), y, P.dim, extra);
      platform(a[1], f.name[0], f.name[1], CX + 18, y, P.film, extra);
      y += LINE;
    } else if (type === 'c') {
      // a sentence: every word stands apart, so there is always a gap to drop through
      const fragile = a[0].startsWith('~');
      row(a[0].replace('~', '').split(' ').map(t => (fragile ? '~' : '') + t), f.sent, y, P.film, extra);
      y += LINE;
    } else if (type === 'w') {
      const { out } = row(a, f.list, y, P.film, extra);
      out.slice(0, -1).forEach(p => deco.push({ text: '·', font: p.font, x: p.x + p.w + f.list[2] / 2 - 3, base: y, color: P.dim }));
      y += LINE;
    } else if (type === 'end') {
      // THE END stands apart from the rest of the credits
      y += LINE * 2.6;
      const { out } = row(a[0].split(' '), [f.end[0], f.end[1], 20 + f.end[1] * .3], y, P.film, { end: true, glow: true });
      endTop = Math.min(...out.map(p => p.top));
    }
  }
  // in the upside-down session the words of each line alternate between the two worlds
  if (LV.hazard === 'flip') {
    const rows = new Map();
    for (const q of plats) if (!q.glow && !q.end) (rows.get(q.base) || rows.set(q.base, []).get(q.base)).push(q);
    for (const row of rows.values()) if (row.length > 1) row.sort((a, b) => a.x - b.x).forEach((q, i) => { q.world = i % 2 ? 'b' : 'a'; });
  }
  // decorations live in the margins, alternating sides
  let side = Math.random() < .5 ? 0 : 1;
  for (let py = H * .42 + 170, i = 0; py < endTop - 60 && LV.props.length; py += 200 + Math.random() * 160, i++) {
    side ^= 1;
    props.push({ kind: LV.props[i % LV.props.length], x: side ? 482 + Math.random() * 28 : 30 + Math.random() * 28, y: py, s: .85 + Math.random() * .35, ph: Math.random() * 6, n: i, side });
  }
}
