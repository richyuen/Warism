// Critic run 86: scan every output of this run (critic/c85*, c86* json and log written since SINCE, default 2026-11-19 17:20) for page errors ("pageerror"),
// console errors kept in an `errors` array, and non-empty `ok` / `bad` lists; print one line per file with something, and
// a count. Usage: [SINCE=iso] node critic/scripts/c86_scan.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
const dir = path.resolve(import.meta.dirname, '..');
const since = new Date(process.env.SINCE ?? '2026-11-19T17:20:00').getTime();
const files = readdirSync(dir).filter((f) => /^c8[56].*\.(json|log)$/.test(f) && statSync(path.join(dir, f)).mtimeMs >= since);
let hits = 0;
for (const f of files) {
  const t = readFileSync(path.join(dir, f), 'utf8');
  const pe = (t.match(/pageerror/g) ?? []).length;
  const errs = [...t.matchAll(/"errors\d?":\s*\[\s*"([^"]{0,160})/g)].map((m) => m[1]);
  const ok = [...t.matchAll(/"ok":\s*\[\s*"([^"]{0,120})/g)].map((m) => m[1]);
  const okLog = [...t.matchAll(/\bok \[([^\]]+)\]/g)].map((m) => m[1].slice(0, 120));
  if (pe || errs.length || ok.length || okLog.length) {
    hits++;
    console.log(`${f}: pageerror ${pe}; errors ${errs.slice(0, 2).join(' | ')}; ok ${[...ok, ...okLog].slice(0, 2).join(' | ')}`);
  }
}
console.log(`files ${files.length}, with something ${hits}`);
