// ---------- language: the game is written in Russian; English comes from the EN dictionary ----------
// tr(s) translates one string (ignoring case, keeping capitals); Tf(fmt, …) translates a line with
// {0}, {1}… filled in. In English every text drawn on the canvas goes through tr, so plain strings
// need no changes in the code; the credits are translated before they are cut into words.
const LANG = (() => {
  const s = store.get('gtte-lang');
  if (s === 'ru' || s === 'en') return s;
  return /^(ru|uk|be|kk)\b/i.test(navigator.language || '') ? 'ru' : 'en';
})();
const CYR = /[А-Яа-яЁё]/;
const I18N_MISS = new Set();
let EN_LOW = null;
function tr(s) {
  if (LANG !== 'en' || typeof s !== 'string' || !CYR.test(s)) return s;
  if (s[0] === '~') return '~' + tr(s.slice(1));
  if (!EN_LOW) {
    // a key written in capitals never replaces the same words written normally
    EN_LOW = new Map();
    for (const k in EN) { const l = k.toLowerCase(); if (!EN_LOW.has(l) || k !== k.toUpperCase()) EN_LOW.set(l, EN[k]); }
  }
  const v = EN_LOW.get(s.toLowerCase());
  if (v !== undefined) {
    if (s === s.toUpperCase() && s !== s.toLowerCase()) return v.toUpperCase();
    // a line that starts with a capital starts with one in English too
    return s[0] !== s[0].toLowerCase() ? v[0].toUpperCase() + v.slice(1) : v;
  }
  // a line made of parts, like a menu note: translate each part
  if (s.includes(' · ')) return s.split(' · ').map(tr).join(' · ');
  if (s.length > 1) I18N_MISS.add(s);
  return s;
}
function Tf(fmt, ...args) {
  return tr(fmt).replace(/\{(\d)\}/g, (_, i) => tr(String(args[i])));
}
function setLang(l) { store.set('gtte-lang', l); location.reload(); }
// in English every string drawn or measured on a canvas is translated on the way
function patchCtx(c) {
  if (LANG !== 'en') return;
  const fill = c.fillText, stroke = c.strokeText, measure = c.measureText;
  c.fillText = function (t, ...a) { return fill.call(this, tr(t), ...a); };
  c.strokeText = function (t, ...a) { return stroke.call(this, tr(t), ...a); };
  c.measureText = function (t) { return measure.call(this, tr(t)); };
}
patchCtx(ctx);
// the page around the canvas: labels marked with data-t, and the aria labels
if (LANG === 'en') {
  document.documentElement.lang = 'en';
  // data-t may name its own key, for a word that is translated differently on the page
  for (const el of document.querySelectorAll('[data-t]')) el.textContent = tr(el.dataset.t || el.textContent.trim());
  for (const el of document.querySelectorAll('[aria-label]')) el.setAttribute('aria-label', tr(el.getAttribute('aria-label')));
}
