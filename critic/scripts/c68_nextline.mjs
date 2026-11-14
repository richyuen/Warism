// Critic run 68: the Next line by day in an x_stage JSON (which date is "Next" on which day).
// Usage: node critic/scripts/c68_nextline.mjs critic/c68_st_normandyD.json
import { readFileSync } from 'node:fs';
const o = JSON.parse(readFileSync(process.argv[2], 'utf8'));
for (const d of o.days) {
  const s = JSON.stringify(d);
  const n = s.match(/Next, [^"|\\]*/);
  const dt = s.match(/\d+ (June|July|August) 1944 · Paused/);
  console.log(dt?.[0] ?? '?', '|', n?.[0]?.slice(0, 70) ?? '-');
}
