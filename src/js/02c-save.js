// ---------- saves: a save code that carries progress anywhere, and a cloud copy on claude.ai ----------
// Progress is everything in localStorage under gtte-, except this device's own settings and the ghost
// recordings (large, and only worth having where they were made). Every change stamps the time; the
// newer copy wins.
const SAVE_LOCAL = new Set(['gtte-fx', 'gtte-lang', 'gtte-mute', 'gtte-music', 'gtte-stamp', 'gtte-cheat', 'gtte-god']);
const synced = k => k.startsWith('gtte-') && !SAVE_LOCAL.has(k) && !k.startsWith('gtte-ghost-');
function saveSnapshot() {
  const o = {};
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (synced(k)) o[k] = localStorage.getItem(k); } } catch (e) { /* storage blocked */ }
  return o;
}
function applySnapshot(o) {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) { const k = localStorage.key(i); if (synced(k)) localStorage.removeItem(k); }
    for (const k in o) if (synced(k) && typeof o[k] === 'string') localStorage.setItem(k, o[k]);
  } catch (e) { /* storage blocked */ }
}
const rawSet = store.set;
store.set = (k, v) => { rawSet(k, v); if (synced(k)) { rawSet('gtte-stamp', String(Date.now())); cloudPush(); } };
// progress from before stamps existed counts as the oldest possible
if (!store.get('gtte-stamp') && Object.keys(saveSnapshot()).length) rawSet('gtte-stamp', '1');

// ===== the save code: gzip + base64, prefixed so a wrong paste is caught =====
const b64url = bytes => { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const gz = (bytes, dir) => new Response(new Blob([bytes]).stream().pipeThrough(new (dir ? CompressionStream : DecompressionStream)('gzip'))).arrayBuffer().then(b => new Uint8Array(b));
async function saveCode() {
  let bytes = new TextEncoder().encode(JSON.stringify({ v: 1, d: saveSnapshot() })), tag = 'J';
  if (window.CompressionStream) { bytes = await gz(bytes, true); tag = 'Z'; }
  return 'GTTE1' + tag + b64url(bytes);
}
async function readCode(code) {
  const m = code.replace(/\s+/g, '').match(/^GTTE1([JZ])([A-Za-z0-9_-]+)$/);
  if (!m) throw new Error('format');
  let b = m[2].replace(/-/g, '+').replace(/_/g, '/');
  while (b.length % 4) b += '=';
  let bytes = Uint8Array.from(atob(b), c => c.charCodeAt(0));
  if (m[1] === 'Z') bytes = await gz(bytes, false);
  const o = JSON.parse(new TextDecoder().decode(bytes));
  if (!o || o.v !== 1 || !o.d || typeof o.d !== 'object') throw new Error('format');
  return o.d;
}

// ===== the cloud: the viewer's own private record in the claude.ai page; elsewhere it stays off =====
const CLOUD = { ref: null, state: 'off', busy: false, again: false, timer: 0 };
function cloudPush(delay = 3000) {
  if (!CLOUD.ref) return;
  clearTimeout(CLOUD.timer);
  CLOUD.timer = setTimeout(async () => {
    if (CLOUD.busy) { CLOUD.again = true; return; }
    CLOUD.busy = true;
    try {
      await CLOUD.ref.set({ stamp: +store.get('gtte-stamp') || Date.now(), data: JSON.stringify(saveSnapshot()) });
      CLOUD.state = 'on';
    } catch (e) { CLOUD.state = 'error'; }
    CLOUD.busy = false;
    if (CLOUD.again) { CLOUD.again = false; cloudPush(500); }
  }, delay);
}
(async () => {
  try {
    if (!window.claude || typeof window.claude.use !== 'function') return;
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    const id = db && user && await user.id();
    if (!id) return;
    CLOUD.state = 'sync';
    const ref = db.doc('data/users/' + id + '/save');
    const snap = await Promise.race([ref.get(), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 10000))]);
    const cloud = snap.exists ? snap.data() : null, local = +store.get('gtte-stamp') || 0;
    // the copy in the cloud is newer (played on another device): take it and start from it
    if (cloud && +cloud.stamp > local && typeof cloud.data === 'string') {
      applySnapshot(JSON.parse(cloud.data));
      rawSet('gtte-stamp', String(cloud.stamp));
      location.reload();
      return;
    }
    CLOUD.ref = ref; CLOUD.state = 'on';
    if (local > (cloud ? +cloud.stamp : 0)) cloudPush(0);
  } catch (e) { CLOUD.state = 'error'; }
})();

// ===== the save code dialog over the screen =====
function openSaveBox() {
  const box = $('savebox'), area = $('savecode'), msg = $('savemsg');
  box.hidden = false; box.dataset.armed = '';
  msg.textContent = tr('Скопируй код, чтобы перенести прогресс, или вставь свой и нажми «Загрузить».');
  area.value = '…';
  saveCode().then(c => { area.value = c; area.select(); }).catch(() => { area.value = ''; });
}
function closeSaveBox() { $('savebox').hidden = true; }
const saveBoxOpen = () => !$('savebox').hidden;
$('savecopy').addEventListener('click', () => {
  const area = $('savecode'), msg = $('savemsg');
  area.select();
  const ok = () => { msg.textContent = tr('Скопировано.'); };
  if (navigator.clipboard) navigator.clipboard.writeText(area.value).then(ok, () => { msg.textContent = tr('Выдели код и скопируй вручную.'); });
  else msg.textContent = tr('Выдели код и скопируй вручную.');
});
$('saveload').addEventListener('click', () => {
  const box = $('savebox'), msg = $('savemsg');
  readCode($('savecode').value).then(d => {
    // loading replaces everything here, so it takes a second press
    if (!box.dataset.armed) { box.dataset.armed = '1'; msg.textContent = tr('Нажми «Загрузить» ещё раз: прогресс на этом устройстве заменится.'); return; }
    applySnapshot(d);
    rawSet('gtte-stamp', String(Date.now()));
    location.reload();
  }).catch(() => { msg.textContent = tr('Этот код не подошёл.'); box.dataset.armed = ''; });
});
$('saveclose').addEventListener('click', closeSaveBox);
for (const id of ['savecopy', 'saveload', 'saveclose']) $(id).textContent = tr($(id).textContent);
