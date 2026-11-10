// ---------- post-processing: the 2D frame goes through WebGL on its way to the screen ----------
// Bloom (bright parts glow), chromatic aberration (colours split towards the edges and on a hit),
// VHS (scanlines, tracking jitter, a glitch band) for the tape films, CRT lines for the arcade ones,
// and a soft blur behind the pause. Each film has its own mix. Quality: high, low (no bloom) or off;
// without WebGL the game simply shows the 2D canvas.
const FX_PRESETS = {
  _: { bloom: .45, thresh: .62, aberr: .22, vhs: 0, crt: 0 },
  menu: { bloom: .55, thresh: .55, aberr: .15 },
  agent: { aberr: .3 }, plumber: { bloom: .45, thresh: .9, aberr: .08, crt: .5 }, hollow: { bloom: .75, thresh: .48 },
  crew: { bloom: .5 }, squid: { bloom: .4, thresh: .75 }, soul: { bloom: .3, aberr: 0, crt: .45 },
  orbit: { bloom: .85, thresh: .45 }, blocks: { bloom: .55, crt: .5 }, cup: { bloom: .2, thresh: .8, aberr: 0 },
  cube: { bloom: .3, thresh: .88, aberr: .08 }, club: { aberr: .35 }, upside: { bloom: .7, aberr: .45, vhs: .3 },
  wizard: { bloom: .7, thresh: .5 }, wanted: { bloom: .7, thresh: .5, aberr: .3 }, dino: { bloom: .4, thresh: .7 },
  deep: { bloom: .65, thresh: .5 }, basement: { aberr: .35 }, hell: { bloom: .95, thresh: .48, aberr: .3 },
  night: { bloom: .55, aberr: .35 }, chomp: { bloom: .75, thresh: .5, crt: .6 }, snap: { bloom: .65, thresh: .5 },
  neon: { bloom: .75, thresh: .5, aberr: .3, vhs: .45 }, code: { bloom: .7, thresh: .5, aberr: .3, vhs: .3 },
  liner: { bloom: .5, thresh: .6 }, end: { bloom: .55, thresh: .55 }, rise: { bloom: .95, thresh: .5, aberr: .35 },
};
const FX = {
  mode: store.get('gtte-fx') || (matchMedia('(pointer: coarse)').matches ? 'low' : 'high'),
  gl: null, ok: false, cur: { bloom: 0, thresh: .6, aberr: 0, vhs: 0, crt: 0, pause: 0 },
};
const FX_NAMES = { high: 'высокие', low: 'низкие', off: 'выкл' };
// words that must stay sharp over the paused, blurred frame are drawn here and laid on top in the shader
const fxUi = document.createElement('canvas'), fxUiCtx = fxUi.getContext('2d');
fxUi.width = cv.width; fxUi.height = cv.height;
function fxPauseWords(words) {
  if (!FX.ok || FX.mode === 'off') return false;
  const c = fxUiCtx;
  c.setTransform(DPR, 0, 0, DPR, 0, 0); c.clearRect(0, 0, W, H);
  c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  drawWords(c, words);
  FX.uiFresh = true;
  return true;
}
function setFxMode(m) { FX.mode = m; store.set('gtte-fx', m); fxShow(); }
function fxShow() { if (FX.canvas) FX.canvas.style.visibility = FX.ok && FX.mode !== 'off' ? 'visible' : 'hidden'; }

const FX_VERT = `attribute vec2 a; varying vec2 vUv; varying vec2 vFb;
void main() { vUv = vec2(a.x * .5 + .5, .5 - a.y * .5); vFb = a * .5 + .5; gl_Position = vec4(a, 0., 1.); }`;
// bright parts only, averaged down to a quarter of the size; while paused, everything goes through
const FX_BRIGHT = `precision mediump float; uniform sampler2D uSrc; uniform vec2 uTx; uniform float uTh; varying vec2 vUv;
void main() {
  vec3 c = (texture2D(uSrc, vUv + uTx * vec2(-1., -1.)).rgb + texture2D(uSrc, vUv + uTx * vec2(1., -1.)).rgb
          + texture2D(uSrc, vUv + uTx * vec2(-1., 1.)).rgb + texture2D(uSrc, vUv + uTx * vec2(1., 1.)).rgb) * .25;
  float l = dot(c, vec3(.299, .587, .114));
  gl_FragColor = vec4(c * smoothstep(uTh, uTh + .22, l), 1.);
}`;
const FX_BLUR = `precision mediump float; uniform sampler2D uSrc; uniform vec2 uDir; varying vec2 vFb;
void main() {
  vec3 c = texture2D(uSrc, vFb).rgb * .227027;
  c += (texture2D(uSrc, vFb + uDir).rgb + texture2D(uSrc, vFb - uDir).rgb) * .1945946;
  c += (texture2D(uSrc, vFb + uDir * 2.).rgb + texture2D(uSrc, vFb - uDir * 2.).rgb) * .1216216;
  c += (texture2D(uSrc, vFb + uDir * 3.).rgb + texture2D(uSrc, vFb - uDir * 3.).rgb) * .054054;
  c += (texture2D(uSrc, vFb + uDir * 4.).rgb + texture2D(uSrc, vFb - uDir * 4.).rgb) * .016216;
  gl_FragColor = vec4(c, 1.);
}`;
const FX_FINAL = `precision mediump float;
uniform sampler2D uSrc, uBloom, uUi; uniform float uTime, uBloomK, uAberr, uVhs, uCrt, uPause, uLines, uJitter, uUiOn;
varying vec2 vUv; varying vec2 vFb;
float rnd(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 uv = vUv;
  if (uVhs > 0.) {
    // the tape wanders a little line by line, and a thin glitch band rolls down the frame
    float line = floor(uv.y * uLines);
    uv.x += (rnd(vec2(line, floor(uTime * 24.))) - .5) * .0015 * uVhs * uJitter;
    float band = 1. - smoothstep(0., .012, abs(uv.y - fract(uTime * .11)));
    uv.x += band * .012 * uVhs * uJitter * sin(uTime * 37. + uv.y * 90.);
  }
  vec2 c = uv - .5;
  vec2 off = c * dot(c, c) * uAberr * .07 + vec2(uVhs * .001, 0.);
  vec3 col = vec3(texture2D(uSrc, uv + off).r, texture2D(uSrc, uv).g, texture2D(uSrc, uv - off).b);
  vec3 blur = texture2D(uBloom, vFb).rgb;
  col = mix(col, blur * .85 + .015, uPause * .9);
  col += blur * uBloomK * (1. - uPause);
  if (uVhs > 0.) col = mix(col, col * vec3(1.06, .94, 1.1) + .018, uVhs * .45);
  float sl = .5 + .5 * sin(vUv.y * uLines * 6.2831853);
  col *= 1. - (uCrt * .2 + uVhs * .12) * sl;
  float l = dot(col, vec3(.299, .587, .114));
  col = mix(col, vec3(l), uPause * .35);
  if (uUiOn > 0.) { vec4 ui = texture2D(uUi, vUv); col = mix(col, ui.rgb, ui.a); }
  gl_FragColor = vec4(col, 1.);
}`;

function fxInit() {
  const canvas = document.createElement('canvas');
  canvas.width = cv.width; canvas.height = cv.height;
  canvas.className = 'fx'; canvas.setAttribute('aria-hidden', 'true');
  cv.parentNode.appendChild(canvas);
  FX.canvas = canvas;
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false });
  if (!gl) { fxShow(); return; }
  const prog = fs => {
    const p = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, FX_VERT], [gl.FRAGMENT_SHADER, fs]]) {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      gl.attachShader(p, s);
    }
    gl.bindAttribLocation(p, 0, 'a'); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name; u[name] = gl.getUniformLocation(p, name); }
    return { p, u };
  };
  const tex = (w, h) => {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    if (w) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, w, h, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    return t;
  };
  try {
    const bw = Math.ceil(cv.width / 4), bh = Math.ceil(cv.height / 4);
    const fbo = () => { const t = tex(bw, bh), f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return { t, f }; };
    Object.assign(FX, {
      gl, src: tex(), ui: tex(), a: fbo(), b: fbo(), bw, bh,
      bright: prog(FX_BRIGHT), blur: prog(FX_BLUR), final: prog(FX_FINAL),
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    FX.ok = true;
  } catch (e) { FX.ok = false; }
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); FX.ok = false; fxShow(); });
  fxShow();
}

// what this moment of the game asks for: the film's mix, plus a jolt on a hit and light in some endings
function fxTarget() {
  const key = !S || S.mode === 'menu' ? 'menu' : LV.sections && S.sec >= 0 && sections[S.sec] ? sections[S.sec].L.key : LV.key;
  const P = Object.assign({}, FX_PRESETS._, FX_PRESETS[key] || {});
  if (S && S.mode === 'cut') P.aberr += 1.4 * clamp(1 - S.cutT / .7, 0, 1);
  if (S && S.shake > 0) P.aberr += S.shake * 2.5;
  if (S && S.mode === 'ending' && /full|life|rise/.test(S.ending)) { P.bloom = Math.max(P.bloom, 1); P.thresh = Math.min(P.thresh, .5); }
  if (REEL) P.aberr += 1.2;
  P.pause = S && S.mode === 'pause' ? 1 : 0;
  return P;
}
let fxLast = 0;
function postfx(t) {
  if (!FX.ok || FX.mode === 'off') return;
  const gl = FX.gl, dt = Math.min(.1, (t - fxLast) / 1000 || 0), T = fxTarget(), C = FX.cur;
  fxLast = t;
  // ease towards the target, quickly for a hit, slowly between films
  for (const k of Object.keys(C)) C[k] += (T[k] - C[k]) * Math.min(1, dt * (k === 'aberr' || k === 'pause' ? 10 : 3));
  const hi = FX.mode === 'high';
  gl.bindTexture(gl.TEXTURE_2D, FX.src);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cv);
  if (hi || C.pause > .01) {
    // bright parts into A, then blur A→B→A twice
    gl.viewport(0, 0, FX.bw, FX.bh);
    gl.useProgram(FX.bright.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, FX.a.f);
    gl.uniform1i(FX.bright.u.uSrc, 0); gl.uniform2f(FX.bright.u.uTx, 1 / cv.width, 1 / cv.height);
    gl.uniform1f(FX.bright.u.uTh, C.thresh * (1 - C.pause));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.useProgram(FX.blur.p); gl.uniform1i(FX.blur.u.uSrc, 0);
    for (let i = 0; i < 2; i++) for (const [from, to, dx, dy] of [[FX.a, FX.b, 1.6, 0], [FX.b, FX.a, 0, 1.6]]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, to.f); gl.bindTexture(gl.TEXTURE_2D, from.t);
      gl.uniform2f(FX.blur.u.uDir, dx * (1 + i) / FX.bw, dy * (1 + i) / FX.bh);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, FX.canvas.width, FX.canvas.height);
  const F = FX.final;
  gl.useProgram(F.p);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, FX.src);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, FX.a.t);
  const ui = S && S.mode === 'pause' && FX.uiFresh;
  gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, FX.ui);
  if (ui) { gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fxUi); FX.uiFresh = false; }
  gl.uniform1i(F.u.uSrc, 0); gl.uniform1i(F.u.uBloom, 1); gl.uniform1i(F.u.uUi, 2);
  gl.uniform1f(F.u.uUiOn, S && S.mode === 'pause' ? 1 : 0);
  gl.uniform1f(F.u.uTime, t / 1000);
  gl.uniform1f(F.u.uBloomK, hi ? C.bloom : 0);
  gl.uniform1f(F.u.uAberr, C.aberr);
  gl.uniform1f(F.u.uVhs, C.vhs);
  gl.uniform1f(F.u.uCrt, C.crt);
  gl.uniform1f(F.u.uPause, C.pause);
  gl.uniform1f(F.u.uLines, H / 3);
  gl.uniform1f(F.u.uJitter, REDUCED ? 0 : 1);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.activeTexture(gl.TEXTURE0);
}
fxInit();
