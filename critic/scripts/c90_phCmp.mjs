// Critic run 90 (new): c88_playHash's and c88_playHash2's runs (their logs: "tick T ... hash H") compared with HEAD's
// headless hashes at the same ticks (critic/c90_headHash_88901_from9600.log, by c88_headHash.ts 88901 9620 100000 9600):
// the probes read run 88's headless file, made on the sim before R217 and R218. Usage: node critic/scripts/c90_phCmp.mjs <headless log> <probe log...>
import { readFileSync } from 'node:fs';
const [hf, ...logs] = process.argv.slice(2);
const head = new Map(readFileSync(hf, 'utf8').trim().split('\n').map((l) => l.trim().split(' ').map(Number)));
for (const f of logs) {
  let same = 0, n = 0;
  for (const m of readFileSync(f, 'utf8').matchAll(/run (\d+): tick (\d+) \(still \w+\) hash (\d+)/g)) { n++; const h = head.get(Number(m[2])); const ok = h >>> 0 === Number(m[3]) >>> 0; if (ok) same++; console.log(f, `run ${m[1]} tick ${m[2]} page ${m[3]} head ${h >>> 0} ${ok ? 'same' : 'DIFFER'}`); }
  console.log(`${f}: ${same} of ${n} the headless hash at their tick`);
}
