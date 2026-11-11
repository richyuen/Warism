/**
 * ROADMAP R66a: the historical track's stages and the armies at them (`tests/helpers/trackFronts.ts`). On 1938h (its own
 * seed unless given), at the hour of each `occupy` stage in the dates (before it applies): the land it gives, who holds
 * it, and each side's land formations within BAND_KM of it, their men and how many are engaged. A stage its sides'
 * armies reach by fighting has both near; one painted on empty land has neither.
 *
 * Usage: npx tsx tools/diag/trackFronts.ts [seed = SEED_1938H] [from = 1942-01-01] [to = 1945-06-01] [out.json]
 */
import { writeFileSync } from 'node:fs';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';
import { stageArmies, type Side, type StageArmies } from '../../tests/helpers/trackFronts';

const seed = Number(process.argv[2] ?? SEED_1938H);
const from = process.argv[3] ?? '1942-01-01';
const to = process.argv[4] ?? '1945-06-01';
const out = process.argv[5] ?? `.cache/trackFronts_${seed}.json`;

{
  const sim = new Sim({ scenario: '1938h', seed, assets: assets1938(SIZE_1938.w) });
  const t = sim.world.track!;
  const stages = t.events.flatMap((e, i) => (e.kind === 'occupy' && e.date >= from && e.date < to ? [i] : []));
  const end = Math.max(...stages.map((i) => t.ticks[i]!));
  const rows: (StageArmies & { date: string; note: string; by: string })[] = [];
  const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
  while (sim.tick <= end && !t.ended) {
    for (const i of stages) {
      if (t.ticks[i] !== sim.tick) continue;
      const e = t.events[i]! as Extract<(typeof t.events)[number], { kind: 'occupy' }>;
      const m = stageArmies(sim.world, t.id(e.by), e.of.map((g) => t.id(g)), e.ring);
      rows.push({ date: e.date, note: e.note ?? '', by: e.by, ...m });
      const s = (x: Side): string => `${x.formations} f ${Math.round(x.men / 1000)}k (${x.engaged} engaged)`;
      process.stdout.write(`${e.date} ${e.by} of ${e.of.join(',')}, held by ${m.holders.map(tag).join(',')}: ${m.cells} cells; attacker ${s(m.attacker)}; defender ${s(m.defender)}; ${e.note ?? ''}\n`);
    }
    sim.step(1, (w) => {
      w.out.events.length = 0;
      w.out.fires.length = 0;
    });
  }
  writeFileSync(out, JSON.stringify(rows, null, 1));
  const empty = rows.filter((r) => r.cells > 0 && r.attacker.men + r.defender.men === 0).length;
  process.stdout.write(`stages ${rows.length}, giving land ${rows.filter((r) => r.cells > 0).length}, with no army of either side near ${empty} → ${out}\n`);
}
