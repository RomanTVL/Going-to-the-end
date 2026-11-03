// ---------- helpers ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(Math.random() * a.length)];
const rand = (a, b) => a + Math.random() * (b - a);
const $ = id => document.getElementById(id);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } },
  json(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
};
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const ease = k => k * k * (3 - 2 * k);

const cv = $('cv'), ctx = cv.getContext('2d');
const DPR = Math.min(2, window.devicePixelRatio || 1);
cv.width = W * DPR; cv.height = H * DPR;
