// ---------- the run: every session in a row, judged at the very end ----------
const freshRun = () => ({ li: 0, res: [], v: 4 });
let RUN = store.json('gtte-run');
if (!RUN || RUN.v !== 4 || typeof RUN.li !== 'number' || RUN.li >= LEVELS.length || !Array.isArray(RUN.res)) RUN = freshRun();
const saveRun = () => store.set('gtte-run', JSON.stringify(RUN));
const seenEndings = () => store.json('gtte-endings') || [];
