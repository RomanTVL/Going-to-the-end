// ---------- menus: the programme, the modes, achievements, statistics, endings and cheats ----------
const ENDINGS = [
  { key: 'full', name: 'The Beginning', how: 'Успей на всех сеансах и собери все звёзды' },
  { key: 'almost', name: 'Свет в зале', how: 'Успей везде и собери больше половины звёзд, но не все' },
  { key: 'blind', name: 'Мимо звёзд', how: 'Успей везде, но собери меньше половины звёзд' },
  { key: 'late', name: 'Пустой зал', how: 'Опоздай хоть раз, но собери половину звёзд или больше' },
  { key: 'truck', name: 'Грузовик', how: 'Опоздай хоть раз и собери меньше половины звёзд' },
];
const DEMO = { truck: [1120, 9, 31], late: [1180, 17, 70], blind: [690, 25, 29], almost: [760, 25, 88], full: [820, 25, 103] };
const CHEAT = { on: store.get('gtte-cheat') === '1', god: store.get('gtte-god') !== '0' };
const cheatGod = () => CHEAT.on && CHEAT.god;
const menu = { screen: 'main', sel: 0, rows: [] };

function menuItems() {
  const seen = seenEndings(), back = { label: 'Назад', act: () => go('main') };
  if (menu.screen === 'endings') return [
    ...ENDINGS.map(e => {
      const open = seen.includes(e.key);
      return { label: e.name, note: open ? 'смотреть' : CHEAT.on ? 'смотреть (читы)' : 'закрыта', sub: e.how, open, act: open || CHEAT.on ? () => replayEnding(e.key) : null };
    }),
    back,
  ];
  if (menu.screen === 'modes') {
    const life = loadRun('life'), lock = (open, how) => open ? null : how;
    return [
      { label: 'Марафон', sub: `Все ${EVENING} фильмов подряд на одних часах`, open: true, note: marathonBest() ? `рекорд ${fmt(marathonBest())}` : 'смотреть', act: startMarathon },
      { label: 'Одна жизнь', sub: lock(lifeOpen(), 'Откроется после всех пяти концовок') || 'Весь вечер без единого дубля. Ошибся — всё сначала', open: lifeOpen(),
        note: lifeDone() ? 'прожита' : life.li > 0 ? `сеанс ${life.li + 1}` : lifeOpen() ? 'смотреть' : 'закрыто', act: lifeOpen() ? startLife : null },
      { label: `Сеанс ${EVENING + 1} · Все титры сразу`, sub: lock(mixOpen(), 'Откроется после первой концовки') || 'Секретный сеанс: титры всех фильмов вперемешку', open: mixOpen(),
        note: store.get('gtte-mix-done') ? 'пройден' : mixOpen() ? 'смотреть' : 'закрыт', act: mixOpen() ? () => startExtra('mix') : null },
      { label: 'Восхождение', sub: lock(riseOpen(), 'Откроется после секретного сеанса') || 'Вверх по титрам, пока снизу поднимается лава', open: riseOpen(),
        note: store.get('gtte-rise-done') ? 'пройдено' : riseOpen() ? 'смотреть' : 'закрыто', act: riseOpen() ? () => startExtra('rise') : null },
      ...(lifeDone() ? [{ label: 'Золотая точка', sub: 'Награда за прожитую одну жизнь', open: true, note: golden() ? 'вкл' : 'выкл', act: () => { store.set('gtte-gold', golden() ? '0' : '1'); GOLD = null; } }] : []),
      back,
    ];
  }
  if (menu.screen === 'ach' || menu.screen === 'stats') return [back];
  if (menu.screen === 'options') return [
    { label: 'Полный экран', note: 'F', act: toggleFullscreen },
    { label: 'Звук', note: AU.muted ? 'выкл' : 'вкл', act: () => setMute(!AU.muted) },
    { label: 'Музыка', note: MUS.on ? 'вкл' : 'выкл', act: () => setMusic(!MUS.on) },
    back,
  ];
  if (menu.screen === 'cheats') return [
    { label: 'Чит-режим', note: CHEAT.on ? 'вкл' : 'выкл', act: () => setCheat('on', !CHEAT.on) },
    { label: 'Снаряды не убивают', note: CHEAT.god ? 'да' : 'нет', act: () => setCheat('god', !CHEAT.god), dim: !CHEAT.on },
    { label: 'Начать с любого сеанса', note: '→', act: CHEAT.on ? () => go('levels') : null, dim: !CHEAT.on },
    { label: 'Любая концовка', note: '→', act: CHEAT.on ? () => go('endings') : null, dim: !CHEAT.on },
    { label: 'K во время сеанса — пропустить его', info: true, dim: !CHEAT.on },
    { label: 'Забег с читами не открывает концовки и рекорды', info: true, dim: true },
    back,
  ];
  if (menu.screen === 'levels') return [
    ...LEVELS.map((L, i) => ({ label: L.name, lv: L, n: i + 1, act: () => {
      if (L.extra) { startExtra(L.key); return; }
      RUN = Object.assign(freshRun(), { li: i, cheat: true }); saveRun(); reelChange(() => startLevel(i));
    } })),
    { label: 'Назад', act: () => go('cheats') },
  ];
  const modesOpen = 1 + [lifeOpen(), mixOpen(), riseOpen()].filter(Boolean).length, gotAch = Object.keys(achGot()).length;
  return [
    { label: RUN.li > 0 ? `Продолжить вечер · сеанс ${RUN.li + 1}` : 'Начать вечер', act: () => { if (CHEAT.on) RUN.cheat = true; reelChange(() => startLevel(RUN.li)); } },
    { label: 'Режимы', note: `${modesOpen} / 4`, act: () => go('modes') },
    { label: 'Достижения', note: `${gotAch} / ${ACH.length}`, act: () => { menu.page = 0; go('ach'); } },
    { label: 'Концовки', note: `${seen.length} / 5`, act: () => go('endings') },
    { label: 'Статистика вечера', note: '→', act: () => go('stats') },
    { label: 'Читы', note: CHEAT.on ? 'вкл' : 'выкл', act: () => go('cheats') },
    { label: 'Настройки', note: '→', act: () => go('options') },
    ...(RUN.li > 0 ? [{ label: 'Новый забег', act: newRun }] : []),
  ];
}
const marathonBest = () => +store.get('gtte-marathon-best') || 0;
function go(screen) { menu.screen = screen; menu.sel = 0; tone(660, .12, .05); }
function setCheat(k, v) {
  CHEAT[k] = v; store.set(k === 'on' ? 'gtte-cheat' : 'gtte-god', v ? '1' : '0');
  if (k === 'on' && v && RUN.li > 0) RUN.cheat = true;
  saveRun(); hud();
}
function menuMove(d) {
  const items = menuItems();
  if (menu.screen === 'levels' && Math.abs(d) === 9) { menu.sel = clamp(menu.sel + d, 0, items.length - 1); tone(520, .06, .04); return; }
  let i = menu.sel;
  for (let n = 0; n < items.length; n++) { i = (i + d + items.length) % items.length; if (items[i].act) break; }
  menu.sel = i; tone(520, .06, .04);
}
function menuActivate(i = menu.sel) {
  const it = menuItems()[i];
  if (it && it.act) { menu.sel = i; it.act(); }
}
function menuBack() { if (menu.screen === 'levels') go('cheats'); else if (menu.screen !== 'main') go('main'); }
const mixOpen = () => seenEndings().length > 0 || CHEAT.on;
const riseOpen = () => store.get('gtte-mix-done') === '1' || CHEAT.on;

function replayEnding(key) {
  startLevel(LEVELS.findIndex(L => L.final), 'ending');
  const e = plats.find(q => q.end);
  S.camY = endTop - H * .6;
  S.p.x = e.x + 30; S.p.y = e.top - PH; S.p.vy = 0;
  S.ending = key; S.modeT = 0; S.replay = true;
  const d = DEMO[key];
  const total = LEVELS.reduce((n, L) => n + L.credits.filter(c => c[0] === '*').length, 0);
  S.summary = store.json('gtte-summary-' + key) || { time: d[0], inTime: d[1], got: Math.round(d[2] / 103 * total), total, fast: d[1] === EVENING };
  S.endDot = { x: S.p.x + PW / 2, y: S.p.y + PH / 2 - S.camY };
}

function drawMenu(t) {
  const film = '#efe8dc', dim = '#8e877c';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(CX, 90, 0, CX, 90, 340);
  g.addColorStop(0, 'rgba(255,236,200,.1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(255,240,210,.55)'; ctx.shadowBlur = 18;
  drawBeam(t, 1);
  for (const x of [8, W - 20]) { ctx.fillStyle = '#0d0b0c'; ctx.fillRect(x - 6, 0, 24, H); for (let y = ((t * .03) % 34) - 34; y < H; y += 34) { ctx.fillStyle = '#1e1a1b'; rr(x, y, 12, 18, 3); ctx.fill(); } }
  // the sprockets turn gold once one life has been lived
  const gold = lifeDone();
  for (const x of [8, W - 20]) for (let y = ((t * .03) % 34) - 34; y < H && gold; y += 34) { ctx.fillStyle = 'rgba(255,210,63,.35)'; rr(x, y, 12, 18, 3); ctx.fill(); }
  const titles = { main: 'GOING TO THE END', endings: 'Концовки', cheats: 'Читы', levels: 'С какого сеанса', modes: 'Режимы', ach: 'Достижения', stats: 'Статистика вечера', options: 'Настройки' };
  caption(titles[menu.screen], `600 ${menu.screen === 'main' ? 40 : 34}px ${SERIF}`, 74, film);
  ctx.shadowBlur = 0;
  const st = menu.screen === 'stats' && store.json('gtte-laststats'), en = st && ENDINGS.find(e => e.key === st.ending);
  const subs = { main: `${EVENING} сеансов. Один вечер. Одна жизнь.`, endings: 'Открытые можно пересмотреть. Под каждой — как её открыть.', cheats: 'Для тестов и просмотра концовок', levels: 'Тестовый забег, в рекорды не идёт',
    modes: 'Другие способы провести вечер', options: 'F — экран · M — звук · N — музыка', ach: `Открыто ${Object.keys(achGot()).length} из ${ACH.length}`, stats: st ? `Последний вечер · ${en ? en.name : 'Одна жизнь'}` : 'Вечер ещё идёт' };
  caption(subs[menu.screen], `italic 500 ${menu.screen === 'main' ? 20 : 17}px ${SERIF}`, 104, dim);

  const items = menuItems(), endings = menu.screen === 'endings' || menu.screen === 'modes', levels = menu.screen === 'levels';
  const rowH = endings ? 64 : levels ? 46 : 34, y0 = endings ? 140 : levels ? 140 : 146;
  menu.rows = [];
  // achievements and statistics draw their own page, with only the way back below it
  const page = menu.screen === 'ach' || menu.screen === 'stats';
  if (page) {
    if (menu.screen === 'ach') drawAchievements(t); else drawStats(t);
    const y = H - 52, sel = menu.sel === 0;
    menu.rows.push({ x0: CX - 80, x1: CX + 80, y0: y - 22, y1: y + 8, i: 0 });
    ctx.font = `500 21px ${SERIF}`; ctx.fillStyle = sel ? '#ffffff' : film; ctx.textAlign = 'center'; ctx.fillText('Назад', CX, y);
    if (sel) { ctx.fillStyle = CUT; ctx.fillRect(CX - 44, y + 6, 88, 2); }
  }
  if (!page) items.forEach((it, i) => {
    if (levels) {
      // the sessions in three columns of nine, each with the film's own token
      const col = it.lv ? Math.floor(i / 9) : 0, row = it.lv ? i % 9 : 9, x = 30 + col * 166, y = y0 + row * rowH;
      const sel = i === menu.sel;
      menu.rows.push({ x0: x - 8, x1: x + 158, y0: y - 22, y1: y + 22, i });
      if (sel) { ctx.fillStyle = 'rgba(255,74,61,.14)'; ctx.fillRect(x - 8, y - 20, 162, 38); ctx.fillStyle = CUT; ctx.fillRect(x - 8, y - 20, 3, 38); }
      ctx.textAlign = 'left';
      if (it.lv) {
        ctx.save(); ctx.globalAlpha = .95; drawCollectible(x + 10, y - 2, t, it.lv); ctx.restore();
        ctx.font = `500 10px ${MONO}`; ctx.fillStyle = dim; ctx.fillText(String(it.n).padStart(2, '0'), x + 26, y - 6);
        ctx.font = `500 14px ${SERIF}`; ctx.fillStyle = sel ? '#ffffff' : film; ctx.fillText(it.label, x + 26, y + 10);
      } else { ctx.font = `500 21px ${SERIF}`; ctx.fillStyle = sel ? '#ffffff' : film; ctx.fillText(it.label, x + 8, y + 6); }
      return;
    }
    const y = y0 + i * rowH, sel = i === menu.sel && it.act;
    menu.rows.push({ x0: 0, x1: W, y0: y - rowH / 2 - 4, y1: y + rowH / 2 - 4, i });
    if (sel) { ctx.fillStyle = 'rgba(255,74,61,.12)'; ctx.fillRect(40, y - (endings ? 30 : 20), W - 80, endings ? 56 : 28); ctx.fillStyle = CUT; ctx.fillRect(40, y - (endings ? 30 : 20), 3, endings ? 56 : 28); }
    ctx.globalAlpha = it.dim || (!it.act && !it.info) ? .45 : 1;
    ctx.textAlign = 'left';
    ctx.font = it.info ? `italic 500 15px ${SERIF}` : `500 ${levels ? 18 : 21}px ${SERIF}`;
    ctx.fillStyle = sel ? '#ffffff' : it.info ? dim : film;
    ctx.fillText((endings && !it.open && it.sub ? '🔒︎ ' : '') + it.label, 56, y - (endings && it.sub ? 8 : 0));
    if (it.sub) { ctx.font = `500 11px ${MONO}`; ctx.fillStyle = it.open ? '#b9f27c' : dim; ctx.fillText(it.sub, 56, y + 14); }
    if (it.note) { ctx.textAlign = 'right'; ctx.font = `500 11px ${MONO}`; ctx.fillStyle = it.note === 'вкл' || it.note === 'да' ? CUT : dim; ctx.fillText(it.note.toUpperCase(), W - 56, y - (endings ? 8 : 0)); }
    ctx.globalAlpha = 1;
  });

  if (menu.screen === 'main') {
    // the evening's programme in three columns, with each film's token and this run's results
    const py = 146 + items.length * 34 + 4;
    ctx.textAlign = 'center'; ctx.font = `500 10px ${MONO}`; ctx.fillStyle = dim; ctx.fillText('ПРОГРАММА ВЕЧЕРА', CX, py);
    LEVELS.slice(0, EVENING).forEach((L, i) => {
      const col = Math.floor(i / 9), x = 30 + col * 166, y = py + 22 + (i % 9) * 21, r = RUN.res[i], cur = i === RUN.li;
      ctx.globalAlpha = r || cur ? 1 : .5;
      ctx.save(); drawCollectible(x + 6, y - 5, t, L); ctx.restore();
      ctx.globalAlpha = r || cur ? 1 : .5;
      ctx.textAlign = 'left'; ctx.font = `500 13px ${SERIF}`; ctx.fillStyle = cur ? CUT : r || cur ? film : dim; ctx.fillText(L.name, x + 20, y);
      if (r) { circle(x + 156, y - 5, 3, r.t <= r.par ? '#b9f27c' : CUT); }
    });
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = 'center';
  caption(menu.screen === 'ach' ? '← → — листать · ESC — назад' : '↑ ↓ — выбрать · ПРОБЕЛ или касание — открыть · ESC — назад', `500 10px ${MONO}`, H - 22, dim, .7);
  if (CHEAT.on) caption('ЧИТ-РЕЖИМ', `500 10px ${MONO}`, 24, CUT, .9);
}
