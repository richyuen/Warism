/**
 * ROADMAP R66a: the historical track's stages and the armies at them (`tests/helpers/trackFronts.ts`). On 1938h (its own
 * seed unless given), at the first hour of the date of each `occupy` stage in the dates (before any event of that date): the land it gives, who holds
 * it, and each side's land formations within BAND_KM of it, their men and how many are engaged. A stage its sides'
 * armies reach by fighting has both near; one painted on empty land has neither.
 *
 * Usage: npx tsx tools/diag/trackFronts.ts [seed = SEED_1938H] [from = 1942-01-01] [to = 1945-06-01] [out.json]
 */
import { writeFileSync } from 'node:fs';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { fightDaysOf } from '../../src/sim/track';
import { assets1938 } from '../../tests/helpers/earth';
import { stageArmies, type Side, type StageArmies } from '../../tests/helpers/trackFronts';

const seed = Number(process.argv[2] ?? SEED_1938H);
const from = process.argv[3] ?? '1942-01-01';
const to = process.argv[4] ?? '1945-06-01';
const out = process.argv[5] ?? `.cache/trackFronts_${seed}.json`;
/** A stage's row: its armies at its hour; its land, size and front at its window's opening (`left`: its land then). */
type Row = StageArmies & { date: string; note: string; by: string; kind: string; left: number; opening: { attacker: number; defender: number }; lost: { attacker: number; defender: number }; window: { samples: number; both: number } };
/** A large stage (R66b): of this many cells or more. */
const LARGE = 200;

{
  const sim = new Sim({ scenario: '1938h', seed, assets: assets1938(SIZE_1938.w) });
  const t = sim.world.track!;
  // The `occupy` stages and (R66e) the `transfer`s: a transfer's `to` takes the land of its `from`.
  const stages = t.events.flatMap((e, i) => ((e.kind === 'occupy' || (e.kind === 'transfer' && e.ring)) && e.date >= from && e.date < to ? [i] : []));
  type Stage = { date: string; note?: string | undefined; by: string; of: readonly string[]; ring: readonly (readonly [number, number])[]; kind: string };
  const stageOf = (i: number): Stage => {
    const e = t.events[i]!;
    if (e.kind === 'occupy') return { date: e.date, note: e.note, by: e.by, of: e.of, ring: e.ring, kind: e.kind };
    if (e.kind === 'transfer') return { date: e.date, note: e.note, by: e.to, of: e.from, ring: e.ring!, kind: e.kind };
    throw new Error(`not a stage: ${i}`);
  };
  // Measured at the first hour of the stage's date, before any of that date's events (ADR-970): a stage's `withdraw`
  // comes an hour before its `occupy`, and measured at the occupy the defenders it took were gone. Its land, size and
  // front fixed at the opening of its window of fighting (R66d, FIGHT_DAYS before, or its own `fightDays`, R77), the men there then too.
  const at = new Map(stages.map((i) => [i, t.tickOf(t.events[i]!.date)]));
  // Each stage's own window (R77: its `fightDays`, else FIGHT_DAYS).
  const opens = new Map(stages.map((i) => { const e = t.events[i]!; return [i, Math.max(0, at.get(i)! - (e.kind === 'occupy' || e.kind === 'transfer' ? fightDaysOf(e) : 0) * 24)]; }));
  const first = new Map<number, { o: StageArmies & { take: number[] }; nation: Map<number, number>; samples: number; both: number }>();
  const end = Math.max(...at.values());
  const rows: Row[] = [];
  const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
  const f = sim.world.formations.cols;
  /** The men a side's cohort lost since the opening: a formation gone (or its id now another nation's) all of them. */
  const lostOf = (side: Side, nation: Map<number, number>): number =>
    side.ids.reduce((t, [id, men]) => t + (sim.world.formations.has(id) && f.nation[id] === nation.get(id) ? Math.max(0, men - f.strength[id]!) : men), 0);
  while (sim.tick <= end && !t.ended) {
    for (const i of stages) {
      const e = stageOf(i);
      const args = [sim.world, t.id(e.by), e.of.map((g) => t.id(g)), e.ring] as const;
      if (opens.get(i) === sim.tick && !first.has(i)) {
        const o = stageArmies(...args);
        const nation = new Map<number, number>();
        for (const [id] of [...o.attacker.ids, ...o.defender.ids]) nation.set(id, f.nation[id]!);
        first.set(i, { o, nation, samples: 0, both: 0 });
      }
      const w0 = first.get(i);
      // Through the window, every 6 hours: whether both sides are engaged in the band fixed at its opening.
      if (w0 && sim.tick < at.get(i)! && sim.tick % 6 === 0) {
        const m = stageArmies(...args, { take: w0.o.take, holders: w0.o.holders });
        w0.samples++;
        if (m.attacker.engaged > 0 && m.defender.engaged > 0) w0.both++;
        // A formation that comes into the band in the window joins its side's cohort with its men then (R78a, critic run
        // 67: the Allies landed in Normandy after the window opened read "of 0k lost 0k" while losing 70k).
        for (const [side, now] of [
          [w0.o.attacker, m.attacker],
          [w0.o.defender, m.defender],
        ] as const)
          for (const [id, men] of now.ids)
            if (!w0.nation.has(id)) {
              w0.nation.set(id, f.nation[id]!);
              side.ids.push([id, men]);
              side.men += men;
            }
      }
      if (at.get(i) !== sim.tick) continue;
      const o = w0?.o ?? stageArmies(...args);
      const m = stageArmies(...args, { take: o.take, holders: o.holders });
      const left = stageArmies(...args).cells;
      const nation = w0?.nation ?? new Map<number, number>();
      const lostA = w0 ? lostOf(o.attacker, nation) : 0;
      const lostD = w0 ? lostOf(o.defender, nation) : 0;
      const row: Row = {
        date: e.date,
        note: e.note ?? '',
        by: e.by,
        kind: e.kind,
        cells: o.cells,
        holders: o.holders,
        front: o.front,
        landFront: o.landFront,
        attacker: { ...m.attacker, ids: [] },
        defender: { ...m.defender, ids: [] },
        left,
        opening: { attacker: o.attacker.men, defender: o.defender.men },
        lost: { attacker: lostA, defender: lostD },
        window: { samples: w0?.samples ?? 0, both: w0?.both ?? 0 },
      };
      rows.push(row);
      const sd = (x: Side): string => `${x.formations} f ${Math.round(x.men / 1000)}k (${x.engaged} engaged)`;
      process.stdout.write(
        `${e.date} ${e.by} of ${e.of.join(',')}, held by ${o.holders.map(tag).join(',')}${o.front ? (o.landFront ? '' : ' (over the sea)') : ' (no front)'}: ${o.cells} cells, ${Math.max(0, o.cells - left)} taken in the window; attacker ${sd(m.attacker)}, of ${Math.round(o.attacker.men / 1000)}k lost ${Math.round(lostA / 1000)}k; defender ${sd(m.defender)}, of ${Math.round(o.defender.men / 1000)}k lost ${Math.round(lostD / 1000)}k; both engaged ${row.window.both} of ${row.window.samples} samples; ${e.note ?? ''}
`,
      );
    }
    sim.step(1, (w) => {
      w.out.events.length = 0;
      w.out.fires.length = 0;
    });
  }
  writeFileSync(out, JSON.stringify(rows, null, 1));
  const empty = rows.filter((r) => r.cells > 0 && r.attacker.men + r.defender.men === 0).length;
  process.stdout.write(`stages ${rows.length}, giving land ${rows.filter((r) => r.cells > 0).length}, with no army of either side near ${empty} → ${out}
`);
  // R66b's measure: of the large stages (≥ LARGE cells), those that are fronts, and of those both sides near; R66d's:
  // of the large land fronts, both sides engaged at the stage's hour.
  const large = rows.filter((r) => r.cells >= LARGE);
  const fronts = large.filter((r) => r.front);
  const both = (rs: typeof rows): number => rs.filter((r) => r.attacker.men > 0 && r.defender.men > 0).length;
  const lands = fronts.filter((r) => r.landFront);
  const fought = lands.filter((r) => r.attacker.engaged > 0 && r.defender.engaged > 0).length;
  process.stdout.write(`large (≥ ${LARGE} cells) ${large.length}, both sides near ${both(large)}; of them fronts ${fronts.length}, both sides near ${both(fronts)}; land fronts ${lands.length}, both sides near ${both(lands)}, both engaged ${fought}
`);
}
