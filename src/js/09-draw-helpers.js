// ---------- drawing helpers ----------
function rr(x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
function circle(x, y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, PI2); ctx.fill(); }
function px(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
