// Critic run 54 (new): a landing thrown back that lands anyway. Headless, the AI's own world (no staging): each
// LandingRepulsed, and whether the same division comes ashore (FormationLanded) within 48 h, and how far from where it
// was thrown back (cells). PLAN 4.5b: thrown back, "home with the transports, nothing taken".
// Usage: npx tsx critic/scripts/c58_repland.ts <seed> [scenario|random] [--years N] [out.json]
import { writeFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';

const a = process.argv.slice(2);
const seed = Number(a[0]);
const diplomacy = (a[1] === 'random' ? 'random' : 'scenario') as 'scenario' | 'random';
const yi = a.indexOf('--years');
const years = yi >= 0 ? Number(a[yi + 1]) : 3;
const outPath = a.find((x) => x.endsWith('.json')) ?? `critic/c58_repland_${seed}.json`;
const sim = new Sim({ scenario: '1938', seed, assets: loadAssets1938(SIZE_1938.w), options: { diplomacy } });
const tag = (n: number): string => TAGS_1938[n - 1] ?? `#${n}`;
const repulsed = new Map<number, { t: number; x: number; y: number; nation: number; holder: number }>();
const cases: unknown[] = [];
let nRep = 0;
let nLanded = 0;
const hours = Math.round(years * 365 * 24);
for (let h = 0; h < hours; h++) {
  sim.step(1, (w) => {
    const ev = w.out.events;
    for (let i = 0; i < ev.length; i += 6) {
      const kind = ev[i + 1]!;
      const id = ev[i + 2]!;
      if (kind === EventKind.LandingRepulsed) {
        nRep++;
        repulsed.set(id, { t: ev[i]!, x: ev[i + 4]!, y: ev[i + 5]!, nation: w.formations.has(id) ? w.formations.cols.nation[id]! : 0, holder: ev[i + 3]! });
      } else if (kind === EventKind.FormationLanded && repulsed.has(id)) {
        const r = repulsed.get(id)!;
        if (ev[i]! - r.t <= 48) {
          nLanded++;
          const d = Math.hypot(ev[i + 4]! - r.x, ev[i + 5]! - r.y);
          const cell = Math.floor(ev[i + 5]!) * w.cells.w + Math.floor(ev[i + 4]!);
          cases.push({ id, nation: tag(r.nation), holder: tag(r.holder), repulsedAt: r.t, at: [r.x, r.y], landedAt: ev[i], landed: [ev[i + 4], ev[i + 5]], cells: Math.round(d * 10) / 10, player: w.settings.player === r.nation, controllerNow: tag(w.cells.controller[cell]!) });
        }
        repulsed.delete(id);
      }
    }
    for (const [id, r] of repulsed) if (w.tick - r.t > 48) repulsed.delete(id);
    w.out.events.length = 0;
    w.out.fires.length = 0;
  });
}
const near = cases.filter((c) => (c as { cells: number }).cells <= 3).length;
writeFileSync(outPath, JSON.stringify({ seed, diplomacy, years, repulsed: nRep, landedWithin48h: nLanded, within3cells: near, cases }, null, 1));
process.stdout.write(`seed ${seed} ${diplomacy} ${years} y: ${nRep} thrown back, ${nLanded} of them ashore within 48 h (${near} within 3 cells of where thrown back)\ndone:\n`);
