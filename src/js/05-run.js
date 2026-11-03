// ---------- the run: every session in a row, judged at the very end ----------
const EVENING = LEVELS.filter(L => !L.extra).length;
// kinds: evening (saved between visits) and marathon (one sitting)
const RUN_KEY = { evening: 'gtte-run' };
const freshRun = (kind = 'evening') => ({ li: 0, res: [], v: 4, kind, deaths: [] });
function loadRun(kind = 'evening') {
  const r = RUN_KEY[kind] && store.json(RUN_KEY[kind]);
  if (!r || r.v !== 4 || typeof r.li !== 'number' || r.li >= EVENING || !Array.isArray(r.res)) return freshRun(kind);
  return Object.assign(r, { kind, deaths: Array.isArray(r.deaths) ? r.deaths : [] });
}
let RUN = loadRun();
const saveRun = () => { const k = RUN_KEY[RUN.kind]; if (k) store.set(k, JSON.stringify(RUN)); };
const seenEndings = () => store.json('gtte-endings') || [];
// back to the menu always lands on the evening's own run
function toMenu(screen = 'main') {
  RUN = loadRun();
  startLevel(RUN.li, 'menu');
  menu.screen = screen; menu.sel = 0;
}
