// Critic run 58: c58_la.log summed by tree (head / old), only seeds/setups present for both.
import { readFileSync } from 'node:fs';
const L = readFileSync('critic/c58_la.log', 'utf8').split('\n').filter((l) => l.includes('SUMMARY'));
const by = {};
for (const l of L) {
  const t = l.split(' ')[0];
  const key = l.replace(/^\w+ SUMMARY /, '').replace(/:.*/, '');
  const m = l.match(/(\d+) clicks with 2\+ ashore; last ashore >7 d over best: (\d+); first >7 d over: (\d+); worst last over ([-\d.]+|-)/);
  (by[key] ??= {})[t] = m ? { n: +m[1], last7: +m[2], first7: +m[3], worst: m[4] === '-' ? null : +m[4] } : null;
}
const agg = { head: { runs: 0, n: 0, last7: 0, first7: 0, worst: -99 }, old: { runs: 0, n: 0, last7: 0, first7: 0, worst: -99 } };
const diffs = [];
for (const [k, v] of Object.entries(by)) {
  if (!v.head || !v.old) continue;
  for (const t of ['head', 'old']) { const a = agg[t]; a.runs++; a.n += v[t].n; a.last7 += v[t].last7; a.first7 += v[t].first7; if (v[t].worst !== null) a.worst = Math.max(a.worst, v[t].worst); }
  if (v.head.last7 !== v.old.last7) diffs.push(`${k}: head ${v.head.last7} (worst ${v.head.worst}) old ${v.old.last7} (worst ${v.old.worst})`);
}
console.log(JSON.stringify(agg));
for (const d of diffs) console.log(d);
