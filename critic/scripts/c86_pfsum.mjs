// Critic run 86: summary of a c85_pf_lookfps output (the JSON printed in its log): least mean fps, highest p95, worst frame.
// Usage: node critic/scripts/c86_pfsum.mjs <log>...
import { readFileSync } from 'node:fs';
for (const f of process.argv.slice(2)) {
  const t = readFileSync(f, 'utf8');
  const j = JSON.parse(t.slice(t.indexOf('{')));
  const means = [], p95 = [], worst = [];
  const walk = (o) => { if (!o || typeof o !== 'object') return; for (const [k, v] of Object.entries(o)) { if (/^(mean|fps|meanFps)$/i.test(k) && typeof v === 'number') means.push(v); else if (/p95/i.test(k)) (Array.isArray(v) ? v : [v]).forEach((x) => typeof x === 'number' && p95.push(x)); else if (/^(worst|max)$/i.test(k) && typeof v === 'number') worst.push(v); else walk(v); } };
  walk(j);
  console.log(f, 'leastMean', Math.min(...means), 'n', means.length, 'maxP95', Math.max(...p95), 'worst', Math.max(...worst), 'errors', JSON.stringify(j.errors ?? null));
}
