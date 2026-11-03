// Critic run 27 (new), AL: PLAN 7.192's greyed "Propose alliance" against the sim's own verdict. The 1938 world, one
// seed, AI on, to each probe day. For every ordered pair (a, b) of living nations not at war with each other (the menu
// offers no alliance to an enemy), the menu's verdict (`allyWhy` from src/ui/standing.ts, fed what NationStat carries:
// overlord, alliance {id}) against the sim's (`proposeAlliance` from a saved state: accepted or AllianceRejected).
// Counts: greyed & rejected, live & accepted, live but REJECTED (a dead button), greyed but would be accepted.
// Usage: npx tsx critic/scripts/c31_al.ts <seed> <days,comma> <out.json> [maxPairs]
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { proposeAlliance } from '../../src/sim/systems/alliances';
import { allyWhy } from '../../src/ui/standing';
import { loadAssets1938 } from '../../tools/headless/assets';

const seed = Number(process.argv[2] ?? 7019);
const days = (process.argv[3] ?? '30,120').split(',').map(Number);
const out = process.argv[4]!;
const maxPairs = Number(process.argv[5] ?? 3000);
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w) });
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const clear = (ww: typeof s.world) => { ww.out.events.length = 0; ww.out.fires.length = 0; };
const res: Record<string, unknown> = { seed, days };
let prev = 0;
for (const d of days) {
  s.step((d - prev) * 24, clear);
  prev = d;
  const snap = s.save();
  const w0 = s.world;
  const nc0 = w0.nations.cols;
  const living: number[] = [];
  w0.nations.forEach((n) => { if (nc0.living[n] === 1) living.push(n); });
  const who = new Map(living.map((n) => [n, { id: n, overlord: nc0.overlord[n]!, alliance: w0.alliances.allianceOf(n) ? { id: w0.alliances.allianceOf(n)!.id } : null, truces: [] }]));
  const pairs: [number, number][] = [];
  for (const a of living) for (const b of living) if (a !== b && !w0.wars.atWar(a, b)) pairs.push([a, b]);
  const stride = Math.max(1, Math.ceil(pairs.length / maxPairs));
  const kinds: Record<string, number> = {};
  const dead: string[] = [];
  const wrongGrey: string[] = [];
  for (const [a, b] of pairs.filter((_, i) => i % stride === 0)) {
    const why = allyWhy(a, b, (id) => who.get(id) as never);
    s.load(snap);
    const w = s.world;
    const ok = proposeAlliance(w, a, b);
    clear(w);
    const k = `${why ? 'greyed' : 'live'}:${ok ? 'accepted' : 'rejected'}`;
    kinds[k] = (kinds[k] ?? 0) + 1;
    if (!why && !ok && dead.length < 40) dead.push(`${tag(a)}>${tag(b)} a.ov=${tag(nc0.overlord[a]!)} a.al=${w0.alliances.allianceOf(a)?.members.map(tag).join('+') ?? '-'} b.wars=${w0.wars.list.filter((x) => x.sides.some((sd) => sd.includes(b))).length}`);
    if (why && ok && wrongGrey.length < 40) wrongGrey.push(`${tag(a)}>${tag(b)} ${why}`);
  }
  s.load(snap);
  res[`day${d}`] = { pairs: pairs.length, stride, kinds, deadButtons: dead, greyedButAccepted: wrongGrey };
  console.log(d, pairs.length, JSON.stringify(kinds));
}
writeFileSync(out, JSON.stringify(res, null, 1));
console.log('done:');
