// Critic run 59 (new): a save loaded mid-landing goes on as the unbroken run (R57a's new `world.landingSailed`).
// Runs landingBreaks(seed, setup, groups) with its hourly hash; saves at each hour in SAVEAT; then for each save a new
// Sim loads it and steps to the end with the run's later commands (from the final command log) issued at their hours,
// comparing the hash every hour. SAVEAT includes an early control hour. Usage:
// SAVEAT=400,1200,1250,1300 npx tsx critic/scripts/c59_saveland.ts <seed> <setup> <groups> [days]
import { landingBreaks } from '../../tests/helpers/landingInvariants';
import { Sim } from '../../src/sim/sim';
import { saveBytes, stateHash } from '../../src/sim/core/state';
import { assets1938 } from '../../tests/helpers/earth';
import type { World } from '../../src/sim/world';
import type { LoggedCommand } from '../../src/shared/commands';

const [seedS, setupS, groupsS, daysS] = process.argv.slice(2);
const seed = Number(seedS), setup = Number(setupS), groups = Number(groupsS ?? 2), days = Number(daysS ?? 120);
const at = new Set((process.env.SAVEAT ?? '400,1200,1250,1300').split(',').map(Number));
const hashes = new Map<number, number>();
const saves = new Map<number, Uint8Array>();
let world: World | undefined;
const t0 = Date.now();
const broken = landingBreaks({
  seed, setup, days, orders: seed, probeDays: [30, 90], groups, notes: [],
  onHour: (w, click) => {
    if (click) return;
    world = w;
    hashes.set(w.tick, stateHash(w.parts()) >>> 0);
    if (at.has(w.tick)) saves.set(w.tick, saveBytes(w.parts()));
  },
});
console.log(`run: ${broken.length} broken, ${hashes.size} hours, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
const log: LoggedCommand[] = world!.commandLog;
const last = Math.max(...hashes.keys());
const W = world!.cells.w;
for (const [T, bytes] of [...saves].sort((a, b) => a[0] - b[0])) {
  const sim = new Sim({ scenario: '1938', seed, assets: assets1938(W) });
  sim.load(bytes);
  const later = log.filter((e) => e.tick > T);
  let first = -1;
  const landings = [...sim.world.landings.values()].map((l) => `L${l.id}:${l.state}:${(l as { sailed?: boolean }).sailed ? 's' : '-'}:${[...l.divisions.keys()].join('/')}`).join(' ');
  while (sim.world.tick < last) {
    for (const e of later) if (e.tick === sim.world.tick) sim.command(e.cmd);
    sim.step(1, (w) => { w.out.events.length = 0; w.out.fires.length = 0; });
    const h = sim.hash() >>> 0;
    if (hashes.has(sim.world.tick) && hashes.get(sim.world.tick) !== h) { first = sim.world.tick; break; }
  }
  console.log(`save t${T} (${later.length} later commands; landings ${landings || 'none'}): ${first < 0 ? `same hash every hour to t${last}` : `DIVERGES at t${first}`}`);
}
console.log('done:');
