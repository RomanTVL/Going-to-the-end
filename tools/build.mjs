// Builds index.html from src/: the page shell, the script modules in name order,
// and the films in src/levels right after the programme module.
// node tools/build.mjs           -> index.html
// node tools/build.mjs --debug   -> build/debug.html, with window.__G exposed for the automated tests
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { narratorConfig, currentRecordings } from './narrator-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const debug = process.argv.includes('--debug');
const read = p => readFileSync(join(root, p), 'utf8');
const list = dir => readdirSync(join(root, dir)).filter(f => f.endsWith('.js')).sort().map(f => `${dir}/${f}`);

const files = [];
for (const f of list('src/js')) {
  files.push(f);
  if (f.endsWith('01-programme.js')) files.push(...list('src/levels'));
}

const HOOK = `window.__G = { S: () => S, keys, plats: () => plats, stars: () => stars, checkpoints: () => checkpoints, award, MUS, AU, NAR, say, LEVELS, startLevel, RUN: () => RUN, menu, CHEAT,
  setTimeScale: v => { timeScale = v; }, noHaz: () => LEVELS.forEach(L => { L.hazard = null; L.oxygen = false; }) };`;

// the narrator's lines, and whatever of them has been recorded (tools/voice.mjs)
const narr = narratorConfig(root), voice = currentRecordings(root, narr);
const data = `// ===== src/narrator.json =====\nconst NARR = ${JSON.stringify(narr.lines)};\nconst VOICE = ${JSON.stringify(voice)};\n`;
let js = data + files.map(f => `// ===== ${f} =====\n${read(f)}`).join('\n');
js = js.replace('// @debug-hook\n', debug ? HOOK + '\n' : '');
const script = `<script>\n(() => {\n'use strict';\n\n${js}})();\n</script>`;
const shell = read('src/shell.html');
if (!shell.includes('<!-- @script -->')) throw new Error('src/shell.html has no <!-- @script --> placeholder');
const html = shell.replace('<!-- @script -->', () => script);

const out = debug ? 'build/debug.html' : 'index.html';
mkdirSync(join(root, dirname(out)), { recursive: true });
writeFileSync(join(root, out), html);
console.log(`${out}: ${files.length} modules, ${Object.keys(narr.lines).length} narrator lines (${Object.keys(voice).length} recorded), ${(html.length / 1024).toFixed(0)} KB`);
