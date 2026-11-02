// PLAN 7.185 (`npx tsx tools/diag/heroCeiling.ts <seed> <years>`): (1) the best ordinary land
// formation's share of its nation's land fighting days, against the hero's (the AT of ADR-794 a:
// the hero's life at or above its nation's top-decile regular, of those alive 90 % of the days); (2) the answers of the hero's orders (OP_PROBE.ask), and whether its
// cell's land component holds any fight of its nation.
import { SIZE_1938, NATIONS_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { OP_PROBE } from '../../src/sim/ai/operational';
import { navOf } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2] ?? 1471);
const years = Number(process.argv[3] ?? 1);
const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w), options: { heroes: 'on' } });
const w0 = s.world;
const heroIds = new Set(w0.heroes.keys());
const heroNat = new Map<number, number>();
const heroTpl = new Map<number, number>();
const answers = new Map<number, Record<string, number>>();
OP_PROBE.now = () => performance.now();
OP_PROBE.ask = (a) => {
  if (!heroIds.has(a.id)) return;
  const r = answers.get(a.id) ?? {};
  r[a.answer] = (r[a.answer] ?? 0) + 1;
  answers.set(a.id, r);
};
const natFight = new Map<number, number>(); // nation -> land fighting days
const formFight = new Map<number, number>(); // formation -> days engaged while its nation fights
const formAlive = new Map<number, number>(); // formation -> days its nation fights while it lives
const sameComp = new Map<number, number>(); // hero -> days a fight of its nation is on its component
const days = Math.round(years * 365);
for (let d = 0; d < days; d++) {
  const eng = new Set<number>();
  const nats = new Set<number>();
  s.step(24, (w) => {
    w.out.events.length = 0;
    w.out.fires.length = 0;
    const fc = w.formations.cols;
    w.formations.forEach((f) => {
      if (fc.engaged[f] === 1 && !w.isFleet(f) && !w.isWing(f)) {
        eng.add(f);
        nats.add(fc.nation[f]!);
      }
    });
  });
  const w = s.world;
  const fc = w.formations.cols;
  for (const [h] of w.heroes) if (!w.isFleet(h)) { heroIds.add(h); heroNat.set(h, fc.nation[h]!); heroTpl.set(h, fc.template[h]!); }
  for (const n of nats) natFight.set(n, (natFight.get(n) ?? 0) + 1);
  const comp = navOf(w).grid.component;
  const cell = (f: number): number => Math.floor(fc.y[f]!) * w.cells.w + Math.floor(fc.x[f]!);
  w.formations.forEach((f) => {
    if (w.isFleet(f) || w.isWing(f) || !nats.has(fc.nation[f]!)) return;
    formAlive.set(f, (formAlive.get(f) ?? 0) + 1);
    if (eng.has(f)) formFight.set(f, (formFight.get(f) ?? 0) + 1);
  });
  for (const h of heroIds) {
    if (!w.formations.has(h) || w.isFleet(h)) continue;
    const n = fc.nation[h]!;
    const c = comp[cell(h)];
    let on = false;
    for (const g of eng) if (g !== h && fc.nation[g] === n && comp[cell(g)] === c) on = true;
    if (on) sameComp.set(h, (sameComp.get(h) ?? 0) + 1);
  }
}
const w = s.world;
const fc = w.formations.cols;
let lives = 0;
let passed = 0;
for (const h of heroIds) {
  if (!heroNat.has(h)) continue;
  const n = heroNat.get(h)!;
  const nf = natFight.get(n) ?? 0;
  const ratios: number[] = [];
  for (const [f, alive] of formAlive) {
    if (heroIds.has(f) || !w.formations.has(f) || fc.nation[f] !== n || alive < nf * 0.9) continue;
    ratios.push((formFight.get(f) ?? 0) / alive);
  }
  ratios.sort((a, b) => b - a);
  const q = (p: number): string => (ratios.length ? ratios[Math.floor(p * (ratios.length - 1))]!.toFixed(3) : 'n/a');
  const tag = NATIONS_1938[n - 1]!.tag;
  const name = TEMPLATES_1938[heroTpl.get(h)!]!.id;
  const lived = formAlive.get(h) ?? 0;
  const p10 = ratios.length ? ratios[Math.floor(0.1 * (ratios.length - 1))]! : -1;
  const mine = (formFight.get(h) ?? 0) / Math.max(1, lived);
  // The AT (ADR-794 a): a life of 30 or more of its army's fighting days, of a nation with 3 or more regulars.
  const counted = lived >= 30 && ratios.length >= 3;
  if (counted) {
    lives++;
    if (mine >= p10) passed++;
  }
  console.log(`seed ${seed} ${tag} ${name}: life ${lived} d, ${counted ? (mine >= p10 ? 'PASS' : 'MISS') : 'not counted'}; nation land fight days ${nf}; hero ${((formFight.get(h) ?? 0) / Math.max(1, formAlive.get(h) ?? 0)).toFixed(3)}; regulars (${ratios.length}, alive ≥ 90 %) best ${q(0)}, p10 ${q(0.1)}, median ${q(0.5)}; fights on its land ${sameComp.get(h) ?? 0} d; asks ${JSON.stringify(answers.get(h) ?? {})}`);
}
console.log(`seed ${seed} AT: ${passed} of ${lives} lives at or above the top decile`);
console.log('done:');
