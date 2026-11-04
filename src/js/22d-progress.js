// ---------- progress: achievements with toasts, and the evening's statistics ----------

// ===== achievements =====
const ACH = [
  ['first', 'Первый сеанс', 'Дойди до THE END любого фильма'],
  ['clean', 'С первого дубля', 'Пройди фильм, ни разу не умерев'],
  ['allstars', 'Звездочёт', 'Собери все звёзды одного фильма'],
  ['quick', 'Торопыга', 'Пройди фильм быстрее 15 секунд'],
  ['blind', 'Глаза закрыты', 'Пройди фильм, не взяв ни одной звезды'],
  ['slow', 'Опоздавший', 'Опоздай на сеанс больше чем на минуту'],
  ['ghost', 'Обогнал себя', 'Побей свой рекорд в любом фильме'],
  ['stubborn', 'Дубль одиннадцать', 'Дойди до THE END после десяти смертей подряд'],
  ['mercy', 'Пощада', 'Пройди «Решимость» без единого дубля'],
  ['p456', 'Игрок 456', 'Пройди «Игру на выживание» без единого дубля'],
  ['dawn6', 'Шесть утра', 'Пройди «Ночную смену» без единого дубля'],
  ['cinephile', 'Киномания', 'Пройди каждый фильм вечера хотя бы раз'],
  ['deaths100', 'Сто дублей', 'Умри сто раз за всё время'],
  ['evening', 'Вечер окончен', 'Досмотри вечер до любой концовки'],
  ['isekai', 'Без перерождения', 'Получи концовку «Грузовик»'],
  ['begin', 'Начало', 'Получи концовку The Beginning'],
  ['director', 'Режиссёрская версия', 'Открой все пять концовок'],
  ['marathon', 'Марафонец', 'Пройди марафон'],
  ['nonstop', 'Без антракта', 'Пройди марафон быстрее 12 минут'],
  ['life', 'Одна жизнь', 'Пройди вечер в режиме «Одна жизнь»'],
  ['secret', 'Все титры сразу', 'Пройди секретный сеанс'],
  ['rise', 'Восхождение', 'Поднимись по титрам до самого начала'],
  ['stomp', 'Грибник', 'Раздави десять грибов'],
  ['eject', 'Это был красный', 'Выкинь предателя прыжком сверху'],
  ['parry', 'Отбивная', 'Отбей пять розовых капель за один дубль'],
  ['wanted', 'Пять звёзд', 'Набери пять звёзд розыска'],
  ['chain', 'Цепная реакция', 'Пусть огонь беса подорвёт бочку'],
  ['combo', 'Комбо', 'Убей трёх бандитов подряд, не касаясь слов'],
  ['tears', 'Сухим из подвала', 'Пройди «Мальчика в подвале» без единого дубля'],
  ['big', 'Большой экран', 'Включи полный экран'],
].map(([key, name, how]) => ({ key, name, how }));
const achGot = () => store.json('gtte-ach') || {};
const TOASTS = [];
// cheats open nothing, except the one about the big screen
function award(key) {
  if (key !== 'big' && (CHEAT.on || RUN.cheat)) return;
  const got = achGot();
  if (got[key]) return;
  got[key] = Date.now();
  store.set('gtte-ach', JSON.stringify(got));
  const a = ACH.find(x => x.key === key);
  if (a) TOASTS.push({ a, at: null });
}
const bump = (key, n = 1) => { const v = (+store.get(key) || 0) + n; store.set(key, String(v)); return v; };

function onFilmDone(r, best) {
  award('first');
  if (r.takes === 1) award('clean');
  if (r.total && r.got === r.total) award('allstars');
  if (r.t < 15) award('quick');
  if (r.got === 0) award('blind');
  if (r.t > r.par + 60) award('slow');
  if (best && r.t < best) award('ghost');
  if (r.takes >= 11) award('stubborn');
  const flawless = { soul: 'mercy', squid: 'p456', night: 'dawn6', basement: 'tears' }[LV.key];
  if (flawless && r.takes === 1) award(flawless);
  if (!LV.extra && LEVELS.every(L => L.extra || store.get('gtte-best-' + L.key))) award('cinephile');
}
function onDeath() { if (!CHEAT.on && !RUN.cheat && bump('gtte-deaths') >= 100) award('deaths100'); }
function onEnding(key) {
  if (key !== 'life') award('evening');
  if (key === 'truck') award('isekai');
  if (key === 'full') award('begin');
  if (key === 'life') award('life');
  if (ENDINGS.every(e => seenEndings().includes(e.key))) award('director');
}
function onMarathon(M) { award('marathon'); if (M.time < 720) award('nonstop'); }
// moments inside the films
function feat(what, v) {
  if (what === 'stomp' && !CHEAT.on && bump('gtte-stomps') >= 10) award('stomp');
  if (what === 'eject' && v) award('eject');
  if (what === 'parry' && v >= 5) award('parry');
  if (what === 'wanted' && v >= 5) award('wanted');
  if (what === 'chain') award('chain');
  if (what === 'combo' && v >= 3) award('combo');
}

// a gold ticket slides down from the top of the frame
function drawToasts(t) {
  const q = TOASTS[0];
  if (!q) return;
  if (q.at === null) { q.at = t; tone(784, .5, .07); tone(1174.7, .7, .06, .12); }
  const T = (t - q.at) / 1000;
  if (T > 3.4) { TOASTS.shift(); return; }
  const k = ease(clamp(T / .35, 0, 1)) * (1 - ease(clamp((T - 3) / .4, 0, 1))), y = -60 + 74 * k;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(14,11,8,.94)'; rr(70, y, W - 140, 50, 8); ctx.fill();
  ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 1.5; rr(70, y, W - 140, 50, 8); ctx.stroke();
  ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(98, y + 25, 11, 0, PI2); ctx.fill();
  ctx.fillStyle = '#1a1206'; ctx.font = `700 13px ${MONO}`; ctx.textAlign = 'center'; ctx.fillText('★', 98, y + 30);
  ctx.textAlign = 'left';
  ctx.font = `500 10px ${MONO}`; ctx.fillStyle = '#ffd23f'; ctx.fillText('ДОСТИЖЕНИЕ', 120, y + 20);
  ctx.font = `600 18px ${SERIF}`; ctx.fillStyle = '#ffffff'; ctx.fillText(q.a.name, 120, y + 39);
  ctx.textAlign = 'center';
}

// the achievements screen: ten to a page
const ACH_PAGE = 10;
const achPages = () => Math.ceil(ACH.length / ACH_PAGE);
function drawAchievements(t) {
  const got = achGot(), page = menu.page || 0, y0 = 140, rowH = 44;
  ACH.slice(page * ACH_PAGE, page * ACH_PAGE + ACH_PAGE).forEach((a, i) => {
    const y = y0 + i * rowH, on = !!got[a.key];
    ctx.globalAlpha = on ? 1 : .5;
    if (on) { ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(58, y - 5, 9, 0, PI2); ctx.fill(); ctx.fillStyle = '#1a1206'; ctx.font = `700 11px ${MONO}`; ctx.textAlign = 'center'; ctx.fillText('★', 58, y - 1); }
    else { ctx.strokeStyle = '#8e877c'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(58, y - 5, 9, 0, PI2); ctx.stroke(); }
    ctx.textAlign = 'left';
    ctx.font = `600 18px ${SERIF}`; ctx.fillStyle = on ? '#ffffff' : '#efe8dc'; ctx.fillText(a.name, 78, y);
    ctx.font = `500 10px ${MONO}`; ctx.fillStyle = on ? '#d8c27a' : '#8e877c'; ctx.fillText(a.how, 78, y + 15);
  });
  ctx.globalAlpha = 1; ctx.textAlign = 'center';
  // page arrows and the way back
  const py = y0 + ACH_PAGE * rowH + 8;
  ctx.font = `500 13px ${MONO}`; ctx.fillStyle = '#efe8dc';
  ctx.fillText(`‹   ${page + 1} / ${achPages()}   ›`, CX, py);
  menu.rows.push({ x0: CX - 110, x1: CX - 20, y0: py - 20, y1: py + 10, i: -1 }, { x0: CX + 20, x1: CX + 110, y0: py - 20, y1: py + 10, i: -2 });
}
function achFlip(d) { menu.page = ((menu.page || 0) + d + achPages()) % achPages(); tone(520, .06, .04); }

// ===== the evening's statistics =====
function lastStats() {
  const s = store.json('gtte-laststats');
  if (s && Array.isArray(s.res)) return s;
  // no finished evening yet: show the one in progress
  return RUN.res.some(Boolean) ? { res: RUN.res, deaths: RUN.deaths || [], ending: null } : null;
}
function statsSummary(s) {
  const res = s.res, deaths = s.deaths || [];
  const films = res.map((r, i) => r && { i, ...r }).filter(Boolean);
  const byFilm = new Map(), byWhy = new Map();
  for (const [li, , why] of deaths) { byFilm.set(li, (byFilm.get(li) || 0) + 1); byWhy.set(why, (byWhy.get(why) || 0) + 1); }
  const top = (m) => [...m.entries()].sort((a, b) => b[1] - a[1])[0];
  return {
    films, deaths: deaths.length,
    time: films.reduce((a, r) => a + r.t, 0), got: films.reduce((a, r) => a + r.got, 0), total: films.reduce((a, r) => a + r.total, 0),
    worst: top(byFilm), why: top(byWhy),
  };
}
function drawStats(t) {
  const s = lastStats(), film = '#efe8dc', dim = '#8e877c';
  if (!s) { caption('Сначала посмотри хотя бы один фильм.', `italic 500 20px ${SERIF}`, H * .45, dim); return; }
  const sum = statsSummary(s), deaths = s.deaths || [];
  const x = { n: 30, name: 52, time: 236, takes: 286, star: 336, map: 352 }, mapW = W - 30 - x.map;
  let y = 138;
  ctx.font = `500 9px ${MONO}`; ctx.fillStyle = dim; ctx.textAlign = 'left';
  ctx.fillText('ФИЛЬМ', x.name, y); ctx.textAlign = 'right'; ctx.fillText('ВРЕМЯ', x.time, y); ctx.fillText('ДУБЛИ', x.takes, y); ctx.fillText('★', x.star, y);
  ctx.textAlign = 'left'; ctx.fillText('ГДЕ УМИРАЛ: ОТ ТИТРА ДО THE END', x.map, y);
  y += 16;
  for (let i = 0; i < EVENING; i++) {
    const L = LEVELS[i], r = s.res[i], yy = y + i * 15;
    ctx.globalAlpha = r ? 1 : .35;
    ctx.textAlign = 'left'; ctx.font = `500 10px ${MONO}`; ctx.fillStyle = dim; ctx.fillText(String(i + 1).padStart(2, '0'), x.n, yy);
    ctx.font = `500 13px ${SERIF}`; ctx.fillStyle = film;
    let name = L.name; while (ctx.measureText(name).width > x.time - x.name - 48 && name.length > 4) name = name.slice(0, -2) + '…';
    ctx.fillText(name, x.name, yy);
    // the death map: a strip for the film, a red tick for every take lost on it
    ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(x.map, yy - 6, mapW, 4);
    if (r) {
      ctx.textAlign = 'right'; ctx.font = `500 10px ${MONO}`;
      ctx.fillStyle = r.t <= r.par ? '#b9f27c' : CUT; ctx.fillText(fmt(r.t), x.time, yy);
      ctx.fillStyle = r.takes > 1 ? film : dim; ctx.fillText(String(r.takes - 1), x.takes, yy);
      ctx.fillStyle = r.got === r.total ? '#ffd23f' : film; ctx.fillText(`${r.got}/${r.total}`, x.star, yy);
    }
    ctx.fillStyle = CUT;
    for (const [li, f] of deaths) if (li === i) ctx.fillRect(x.map + f * (mapW - 2), yy - 9, 2, 10);
  }
  ctx.globalAlpha = 1; ctx.textAlign = 'center';
  y += EVENING * 15 + 6;
  caption(`ВСЕГО ${fmt(sum.time)} · ${sum.deaths} ${plural(sum.deaths, 'ДУБЛЬ', 'ДУБЛЯ', 'ДУБЛЕЙ')} · ★ ${sum.got} / ${sum.total}`, `500 12px ${MONO}`, y, film);
  if (sum.worst) caption(`Самый смертельный: «${LEVELS[sum.worst[0]].name}» — ${sum.worst[1]} ${plural(sum.worst[1], 'дубль', 'дубля', 'дублей')}`, `italic 500 17px ${SERIF}`, y + 22, film);
  if (sum.why) caption(`Чаще всего: «${sum.why[0].toLowerCase()}» × ${sum.why[1]}`, `italic 500 17px ${SERIF}`, y + 42, dim);
}
