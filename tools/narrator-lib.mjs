// Shared by the build and the voice generator: the narrator's lines and their recordings.
// A recording belongs to the exact text, voice and settings it was made with; change any of them
// and the line falls back to a subtitle until it is recorded again.
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

export function narratorConfig(root) {
  return JSON.parse(readFileSync(join(root, 'src/narrator.json'), 'utf8'));
}
export function lineHash(cfg, text) {
  const v = cfg.voice;
  return createHash('sha1').update([v.voice_id, v.model_id, v.output_format, JSON.stringify(v.settings), text].join('|')).digest('hex').slice(0, 16);
}
export function voiceManifest(root) {
  const p = join(root, 'voice/manifest.json');
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {};
}
// the recordings that still match their lines, as base64
export function currentRecordings(root, cfg) {
  const man = voiceManifest(root), out = {};
  for (const [id, text] of Object.entries(cfg.lines)) {
    const f = join(root, 'voice', id + '.mp3');
    if (man[id] === lineHash(cfg, text) && existsSync(f)) out[id] = readFileSync(f).toString('base64');
  }
  return out;
}
