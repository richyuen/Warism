// Critic run 27 (new), OR: every bonded Force war that PLAN 7.191 now lets through, and what it leaves behind. The 1938
// world, one seed, AI on, to each probe day. There, for every ordered pair (a, b) of living nations where a fights
// beside b (or beside b's overlord) in a war and a bond ties them (bond() != None: puppet / ally / same overlord / allied
// realm), from one saved state: a Force-wars b; an hour later, the war list's integrity over the whole world:
//   both: a pair on one side of a war and enemies in another; pvo: a puppet at war with its overlord; aa: allies at war;
//   and whether a is at war with b at all (the command's promise), and whether a is still beside b anywhere.
// Usage: npx tsx critic/scripts/c31_or.ts <seed> <days,comma> <out.json> [maxPairsPerDay]
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { bond, beside } from '../../src/sim/systems/war';
import { Refusal } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import { loadAssets1938 } from '../../tools/headless/assets';

const seed = Number(process.argv[2] ?? 7019);
const days = (process.argv[3] ?? '30,120').split(',').map(Number);
const out = process.argv[4]!;
const maxPairs = Number(process.argv[5] ?? 400);
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w) });
let w = s.world;
let nc = w.nations.cols;
const fresh = () => { w = s.world; nc = w.nations.cols; };
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const RN: Record<number, string> = Object.fromEntries(Object.entries(Refusal).map(([k, v]) => [v, k]));
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
const clear = (ww: typeof w) => { ww.out.events.length = 0; ww.out.fires.length = 0; };
const wdesc = (x: { sides: number[][] }) => `${x.sides[0]!.map(tag).join('+')} v ${x.sides[1]!.map(tag).join('+')}`;
function integrity(): string[] {
  fresh();
  const f: string[] = [];
  for (const war of w.wars.list) for (const side of war.sides) for (let i = 0; i < side.length; i++) for (let j = i + 1; j < side.length; j++) {
    const a = side[i]!, b = side[j]!;
    if (w.wars.atWar(a, b)) f.push(`both ${tag(a)}/${tag(b)} [${wdesc(war)}]`);
  }
  w.nations.forEach((n) => {
    if (nc.living[n] !== 1) return;
    const o = nc.overlord[n]!;
    if (o !== 0 && w.wars.atWar(n, o)) f.push(`pvo ${tag(n)}/${tag(o)}`);
  });
  const living: number[] = [];
  w.nations.forEach((n) => { if (nc.living[n] === 1) living.push(n); });
  for (let i = 0; i < living.length; i++) for (let j = i + 1; j < living.length; j++) if (w.alliances.allied(living[i]!, living[j]!) && w.wars.atWar(living[i]!, living[j]!)) f.push(`aa ${tag(living[i]!)}/${tag(living[j]!)}`);
  return f;
}
const res: Record<string, unknown> = { seed, days };
let prev = 0;
for (const d of days) {
  s.step((d - prev) * 24, clear);
  prev = d;
  const base = integrity();
  const snap = s.save();
  const living: number[] = [];
  w.nations.forEach((n) => { if (nc.living[n] === 1) living.push(n); });
  const pairs: [number, number, string][] = [];
  for (const a of living) for (const b of living) {
    if (a === b) continue;
    const o = nc.overlord[b]!;
    const parts = o !== 0 ? [b, o] : [b];
    const bd = parts.map((p) => bond(w, a, p)).find((r) => r !== Refusal.None);
    if (bd === undefined) continue;
    if (!parts.some((p) => beside(w, a, p))) continue;
    pairs.push([a, b, RN[bd]!]);
  }
  const rows: unknown[] = [];
  const kinds: Record<string, number> = {};
  let n = 0;
  const stride = Math.max(1, Math.ceil(pairs.length / maxPairs));
  for (const [a, b, bd] of pairs.filter((_, i) => i % stride === 0)) {
    s.load(snap);
    fresh();
    clear(w);
    s.command({ kind: 'forceWar', attacker: a, defender: b } as never);
    const evs: string[] = [];
    s.step(1, (ww) => { const e = ww.out.events; for (let i = 0; i < e.length; i += 6) { const k = EV[e[i + 1]!]!; if (/War|Bond|Puppet|Alliance/.test(k)) evs.push(`${k} ${tag(e[i + 2]!)} ${tag(e[i + 3]!)}`); } clear(ww); });
    const after = integrity().filter((x) => !base.includes(x));
    fresh();
    const atWar = w.wars.atWar(a, b);
    const still = beside(w, a, b) || (nc.overlord[b] !== 0 && beside(w, a, nc.overlord[b]!));
    const k = `${bd}:${atWar ? 'war' : 'nowar'}${still ? ':stillBeside' : ''}${after.length ? ':broken' : ''}`;
    kinds[k] = (kinds[k] ?? 0) + 1;
    if (after.length || !atWar || still || n < 6) rows.push({ a: tag(a), b: tag(b), bond: bd, atWar, stillBeside: still, broken: after.slice(0, 8), evs: evs.slice(0, 14) });
    n++;
  }
  s.load(snap);
  fresh();
  res[`day${d}`] = { pairs: pairs.length, tried: n, stride, baseBroken: base, kinds, rows };
  console.log(d, pairs.length, JSON.stringify(kinds));
}
writeFileSync(out, JSON.stringify(res, null, 1));
console.log('done:');
