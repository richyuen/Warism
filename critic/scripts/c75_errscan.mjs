// Critic run 75: every c75_*.json of the page probes: page errors, fatal and error fields (read by the critic).
import { readdirSync, readFileSync } from 'node:fs';
let n = 0, bad = 0;
for (const f of readdirSync('critic').filter((x) => /^c75_.*\.json$/.test(x))) {
  let o; try { o = JSON.parse(readFileSync(`critic/${f}`, 'utf8')); } catch { continue; }
  if (typeof o !== 'object' || o === null || Array.isArray(o)) continue;
  if (!('errors' in o) && !('fatal' in o) && !('error' in o)) continue;
  n++;
  const errs = Array.isArray(o.errors) ? o.errors.length : Number(o.errors ?? o.errorCount ?? 0);
  if (errs > 0 || o.fatal || o.error) { bad++; console.log(`${f}: errors ${errs} ${JSON.stringify(Array.isArray(o.errors) ? o.errors.slice(0, 2) : '').slice(0, 300)} ${String(o.fatal ?? o.error ?? '').slice(0, 260).replace(/\n/g, ' ')}`); }
}
console.log(`${n} probe outputs read, ${bad} with a page error or a fatal`);
