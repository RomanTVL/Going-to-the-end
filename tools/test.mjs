// Automated checks for the game, run against build/debug.html:
//   node tools/build.mjs --debug && node tools/test.mjs [--hazards] [--levels 3,6,9] [--jobs 4]
// 1. every film fits the frame and has stars and THE END;
// 2. a bot plays every film (hazards off unless --hazards) and must reach THE END;
// 3. the menus open.
// Exits with code 1 if anything fails.
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// require() also finds a globally installed Playwright, which a bare import does not
const { chromium } = createRequire(import.meta.url)('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const url = 'file://' + join(root, 'build/debug.html');
const arg = (name, def) => { const i = process.argv.indexOf(name); return i < 0 ? def : process.argv[i + 1]; };
const hazards = process.argv.includes('--hazards');
const jobs = Number(arg('--jobs', 4));
const failures = [];

// The bot: drop towards the nearest word below that is not covered by the one it stands on,
// steer in the air towards it, freeze on the doll's red light.
function bot() {
  let tgt = null;
  setInterval(() => {
    const S = __G.S(), k = __G.keys, L = __G.LEVELS[S.li];
    if (S.mode !== 'play' || (L.hazard === 'redlight' && S.rl.phase !== 'green' && S.p.ground)) { k.left = k.right = false; if (S.mode !== 'play') tgt = null; return; }
    const P = S.p, cx = P.x + 5, lim = S.camY + 675 - 30;
    const all = __G.plats().filter(q => !q.gone && !q.off && !(q.dust > 0) && (!q.world || q.world === S.world));
    const c2 = (a, b, v) => Math.max(a, Math.min(b, v));
    const steer = x => { if (Math.abs(x - cx) < 3) { k.left = k.right = false; } else { k.right = x > cx; k.left = x < cx; } };
    const g = P.ground;
    if (!g) { if (tgt && tgt.top > P.y + 10) steer(c2(tgt.x + 8, tgt.x + tgt.w - 8, cx)); else k.left = k.right = false; return; }
    tgt = null;
    if (g.end) { k.left = k.right = false; return; }
    const below = all.filter(q => q.top > g.top + 5 && q.top < lim).sort((a, b) => a.top - b.top);
    for (const t of below) {
      const pts = [];
      for (let x = t.x + 6; x <= t.x + t.w - 6; x += 3) if (x < g.x - 8 || x > g.x + g.w + 8) pts.push(x);
      if (pts.length) { pts.sort((a, b) => Math.abs(a - cx) - Math.abs(b - cx)); tgt = t; steer(pts[0]); return; }
    }
    if (below.length) { tgt = below[0]; const L2 = g.x - 8, R = g.x + g.w + 8; steer(Math.abs(L2 - cx) < Math.abs(R - cx) ? L2 : R); return; }
    k.left = k.right = false;
  }, 16);
}

async function openGame(browser) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.__G, null, { timeout: 15000 });
  await page.waitForTimeout(2500);
  return { page, errors };
}

const browser = await chromium.launch();
const { page, errors } = await openGame(browser);

// 1. layout
const layout = await page.evaluate(() => __G.LEVELS.map((L, i) => {
  __G.startLevel(i, 'menu');
  const pl = __G.plats();
  return { i, key: L.key, overflow: pl.filter(q => !q.block && (q.x < 8 || q.x + q.w > 532)).map(q => q.text), stars: __G.stars().length, end: pl.some(q => q.end) };
}));
for (const l of layout) {
  if (l.overflow.length) failures.push(`${l.key}: words leave the frame: ${l.overflow.join(', ')}`);
  if (!l.stars) failures.push(`${l.key}: no stars`);
  if (!l.end) failures.push(`${l.key}: no THE END`);
}
console.log(`layout: ${layout.length} films checked`);

// 2. the bot plays the films, a few at a time
const wanted = arg('--levels', null);
const queue = layout.filter(l => !wanted || wanted.split(',').map(Number).includes(l.i));
const results = [];
async function worker() {
  const game = await openGame(browser);
  await game.page.evaluate(`(${bot})()`);
  if (!hazards) await game.page.evaluate(() => __G.noHaz());
  while (queue.length) {
    const l = queue.shift();
    await game.page.evaluate(i => { __G.startLevel(i, 'intro'); }, l.i);
    await game.page.waitForTimeout(700);
    await game.page.keyboard.press('Space');
    let st = null;
    for (let s = 0; s < 120; s++) {
      await game.page.waitForTimeout(500);
      st = await game.page.evaluate(() => { const S = __G.S(); return { mode: S.mode, t: S.time, take: S.take, par: S.par, why: S.cutWhy }; });
      if (st.mode === 'clear' || st.mode === 'ending') break;
    }
    const done = st.mode === 'clear' || st.mode === 'ending';
    results.push({ ...l, ...st, done });
    console.log(`${String(l.i + 1).padStart(2)} ${l.key.padEnd(9)} ${done ? 'THE END' : 'STUCK  '} ${st.t.toFixed(1).padStart(5)}s / ${st.par}s, takes ${st.take}${st.why ? ', last: ' + st.why : ''}`);
    // with hazards on, the bot does not dodge, so getting stuck is a warning rather than a failure
    if (!done && !hazards) failures.push(`${l.key}: the bot did not reach THE END`);
  }
  errors.push(...game.errors);
  await game.page.close();
}
await Promise.all(Array.from({ length: Math.min(jobs, queue.length) }, worker));

// 3. menus
await page.evaluate(() => { __G.startLevel(0, 'menu'); });
for (const screen of ['endings', 'cheats', 'levels', 'main']) {
  await page.evaluate(s => { __G.menu.screen = s; __G.menu.sel = 0; }, screen);
  await page.waitForTimeout(150);
}

for (const e of new Set(errors)) failures.push('page error: ' + e);
await browser.close();
if (failures.length) { console.log('\nFAILED:\n' + failures.map(f => '  - ' + f).join('\n')); process.exit(1); }
console.log(`\nall good: ${results.length} films played${hazards ? ' with hazards' : ''}`);
