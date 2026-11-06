// Critic run 43: which fleets of each great power hold transports (cls 'tp'), and which of those also hold warships.
// R31d gives a player's fleet with transportRoom > 0, not moving, no convoy, nobody aboard, back to the AI.
// Usage: npx tsx critic/scripts/c43_fleetmix.ts <seed> <out.json>
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
import { transportRoom } from '../../src/sim/systems/amphibious';
const [seedS, outF] = process.argv.slice(2);
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
s.step(2);
const w = s.world, c = w.formations.cols, ec = w.elements.cols, units = w.rules!.units;
const out: Record<string, unknown[]> = {};
for (const t of ['ENG', 'JAP', 'GER', 'USA', 'ITA', 'FRA', 'SOV']) {
  const n = NATIONS_1938.findIndex((d) => d.tag === t) + 1;
  const rows: unknown[] = [];
  w.formations.forEach((f) => {
    if (c.nation[f] !== n || !w.isFleet(f)) return;
    const cls: Record<string, number> = {};
    w.elements.forEach((e) => { if (ec.formation[e] === f) cls[units[ec.unit[e]!]!.cls] = (cls[units[ec.unit[e]!]!.cls] ?? 0) + 1; });
    rows.push({ id: f, x: +c.x[f]!.toFixed(1), y: +c.y[f]!.toFixed(1), room: transportRoom(w, f), cls });
  });
  out[t] = rows;
}
writeFileSync(outF!, JSON.stringify(out, null, 1));
for (const [t, r] of Object.entries(out)) console.log(t, (r as { room: number; cls: Record<string, number> }[]).filter((x) => x.room > 0).map((x) => JSON.stringify(x)).join(' | '));
