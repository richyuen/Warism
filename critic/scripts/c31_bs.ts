// Critic run 26 (new), BS: what PLAN 7.189's "beside" refusal and 7.190's rows do in AI play, on HEAD and on run 25's
// commit (the same script copied into the worktree). The 1938 world, one seed, `days` days. Each day: pairs of living,
// free (no overlord) nations on one side of a war that have no bond (alliance, puppet, same overlord) - the pairs the
// new refusal alone keeps from war, and of those the ones that share a land border; the longest run of days any such
// pair stays so. Events counted: declarations, peace, wars ended, GuaranteeLapsed, WarLeft, WarRejected. Each year the
// state hash (to compare the two commits' worlds) and the guarantees standing.
// Usage: npx tsx critic/scripts/c31_bs.ts <seed> <days> <out.json>
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { EventKind } from '../../src/shared/events';
import { bond } from '../../src/sim/systems/war';
import { Refusal } from '../../src/shared/commands';
import { loadAssets1938 } from '../../tools/headless/assets';

const seed = Number(process.argv[2] ?? 7019), days = Number(process.argv[3] ?? 365), out = process.argv[4]!;
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w) });
const w = s.world;
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const EVK = EventKind as unknown as Record<string, number>;
const watch: Record<string, number | undefined> = { WarDeclared: EVK.WarDeclared, PeaceSigned: EVK.PeaceSigned, WarEnded: EVK.WarEnded, WarRejected: EVK.WarRejected, GuaranteeLapsed: EVK.GuaranteeLapsed, WarLeft: EVK.WarLeft, BondsBroken: EVK.BondsBroken };
const counts: Record<string, number> = Object.fromEntries(Object.keys(watch).map((k) => [k, 0]));
const rows: string[] = [];
const take = (ww: typeof w) => {
  const e = ww.out.events;
  for (let i = 0; i < e.length; i += 6) for (const [k, v] of Object.entries(watch)) if (v !== undefined && e[i + 1] === v) {
    counts[k]!++;
    if (k === 'GuaranteeLapsed' || k === 'WarLeft') rows.push(`${(e[i]! / 24).toFixed(1)} ${k} ${tag(e[i + 2]!)} ${tag(e[i + 3]!)}`);
  }
  ww.out.events.length = 0; ww.out.fires.length = 0;
};
// Land neighbours from cells (4-neighbourhood, owners).
function borders(): Set<string> {
  const o = w.cells.owner; const W = w.cells.w; const H = o.length / W; const set = new Set<string>();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; const a = o[i]!; if (a === 0) continue;
    const r = x + 1 < W ? o[i + 1]! : 0, d = y + 1 < H ? o[i + W]! : 0;
    if (r !== 0 && r !== a) set.add(a < r ? `${a}:${r}` : `${r}:${a}`);
    if (d !== 0 && d !== a) set.add(a < d ? `${a}:${d}` : `${d}:${a}`);
  }
  return set;
}
const nc = w.nations.cols;
let nb = borders();
const run = new Map<string, number>();
let longest = { pair: '', days: 0 };
const daily: { d: number; pairs: number; neighbourPairs: number; wars: number; guarantees: number; sample: string[] }[] = [];
const hashes: string[] = [];
let pairDays = 0, nbPairDays = 0;
for (let d = 1; d <= days; d++) {
  s.step(24, take);
  if (d % 30 === 0) nb = borders();
  const seen = new Set<string>();
  const sample: string[] = [];
  let nbp = 0;
  for (const war of w.wars.list) for (const side of war.sides) for (let i = 0; i < side.length; i++) for (let j = i + 1; j < side.length; j++) {
    const a = Math.min(side[i]!, side[j]!), b = Math.max(side[i]!, side[j]!);
    const k = `${a}:${b}`;
    if (seen.has(k) || nc.living[a] !== 1 || nc.living[b] !== 1 || nc.overlord[a] !== 0 || nc.overlord[b] !== 0) continue;
    if (bond(w, a, b) !== Refusal.None) continue;
    seen.add(k);
    if (nb.has(k)) { nbp++; if (sample.length < 6) sample.push(`${tag(a)}-${tag(b)}`); }
  }
  for (const k of [...run.keys()]) if (!seen.has(k)) run.delete(k);
  for (const k of seen) { const v = (run.get(k) ?? 0) + 1; run.set(k, v); if (v > longest.days) { const [a, b] = k.split(':').map(Number); longest = { pair: `${tag(a!)}-${tag(b!)}`, days: v }; } }
  pairDays += seen.size; nbPairDays += nbp;
  if (d % 30 === 0) daily.push({ d, pairs: seen.size, neighbourPairs: nbp, wars: w.wars.list.length, guarantees: w.alliances.guarantees.length, sample });
  if (d % 365 === 0) hashes.push(s.hash().toString(16));
}
const res = { seed, days, counts, rows, longest, pairDays, nbPairDays, daily, hashes, guaranteesEnd: w.alliances.guarantees.map((g) => `${tag(g.guarantor)}>${tag(g.target)}`) };
writeFileSync(out, JSON.stringify(res, null, 1));
console.log(JSON.stringify({ seed, counts, longest, pairDays, nbPairDays }));
console.log('done:');
