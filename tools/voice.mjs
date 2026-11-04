// Records the narrator's lines with ElevenLabs into voice/<id>.mp3, then rebuild the game to embed them.
//   ELEVENLABS_API_KEY=... node tools/voice.mjs            record what is missing or out of date
//   node tools/voice.mjs --dry                             only count what would be recorded
//   node tools/voice.mjs --only hello.1,intro.agent        just these lines
//   node tools/voice.mjs --force                           record everything again
// The voice, model and settings are in src/narrator.json. Lines already recorded with the same
// text and settings are skipped, so the script can be stopped and run again.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { narratorConfig, lineHash, voiceManifest } from './narrator-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const dry = process.argv.includes('--dry'), force = process.argv.includes('--force');
const only = arg('--only') && arg('--only').split(',');
const cfg = narratorConfig(root), v = cfg.voice, man = voiceManifest(root);

const todo = Object.entries(cfg.lines).filter(([id, text]) =>
  (!only || only.includes(id)) && (force || man[id] !== lineHash(cfg, text) || !existsSync(join(root, 'voice', id + '.mp3'))));
const chars = todo.reduce((n, [, t]) => n + t.length, 0);
console.log(`${todo.length} of ${Object.keys(cfg.lines).length} lines to record, ${chars} characters, voice ${v.voice_id}, ${v.model_id}`);
if (dry || !todo.length) process.exit(0);

const key = process.env.ELEVENLABS_API_KEY;
if (!key) { console.error('ELEVENLABS_API_KEY is not set'); process.exit(1); }
mkdirSync(join(root, 'voice'), { recursive: true });
const wait = ms => new Promise(r => setTimeout(r, ms));

for (const [id, text] of todo) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.voice_id}?output_format=${v.output_format}`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: v.model_id, voice_settings: v.settings }),
    });
    if (res.ok) {
      writeFileSync(join(root, 'voice', id + '.mp3'), Buffer.from(await res.arrayBuffer()));
      man[id] = lineHash(cfg, text);
      writeFileSync(join(root, 'voice/manifest.json'), JSON.stringify(man, null, 1) + '\n');
      console.log(`ok  ${id}`);
      break;
    }
    const body = await res.text();
    // too many requests or a busy server: wait and try again; anything else stops the run
    if ((res.status === 429 || res.status >= 500) && attempt < 5) { console.log(`${res.status} ${id}, retrying`); await wait(2000 * 2 ** attempt); continue; }
    console.error(`failed ${id}: ${res.status} ${body.slice(0, 300)}`);
    process.exit(1);
  }
}
console.log('done; now run npm run build');
