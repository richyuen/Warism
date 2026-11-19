// Critic run 85: scan every output of this run (critic/c85*.json and critic/c85_*.log) for page errors ("pageerror"),
// console errors kept in an `errors` array, and non-empty `ok` / `bad` lists; print one line per file with something, and
// a count. Usage: node critic/scripts/c85_scan.mjs
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
const dir = path.resolve(import.meta.dirname, '..');
const files = readdirSync(dir).filter((f) => /^c85.*\.(json|log)$/.test(f));
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
