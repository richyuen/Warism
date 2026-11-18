// Critic run 72 (new): plain 1938 as a game from the title gets it (heroes on, ADR-1070), headless. The headless runner
// (`npm run sim`) has no heroes option, so no tick measure or long run of the builder's covers the default game.
// Per year: hash, tick ms mean and p95 (wall), living nations, formations, heroes alive, wars declared, detonations,
// capitals taken. Saves the end state when a path is given (for the page probes).
// Usage: npx tsx critic/scripts/c76_heroRun.ts <seed> <years> [save.bin] [on|off]
import { writeFileSync } from 'node:fs';
import { parseAffinity, pinProcess } from '../../tools/headless/affinity';
if (process.env.AFF) pinProcess(parseAffinity(process.env.AFF));
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2] ?? 99);
const years = Number(process.argv[3] ?? 5);
const save = process.argv[4] && process.argv[4] !== '-' ? process.argv[4] : '';
const heroes = (process.argv[5] ?? 'on') === 'on';
const sim = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w), ...(heroes ? { options: { heroes: 'on' } } : {}) } as never);
const w = sim.world;
console.log(`seed ${seed} heroes ${heroes} roster ${w.heroRoster.length} alive ${w.heroes.size} hash0 ${(sim.hash() >>> 0).toString(16)}`);
const all: number[] = [];
for (let y = 1; y <= years; y++) {
  const ms: number[] = [];
  const k: Record<string, number> = { decl: 0, det: 0, cap: 0, peace: 0 };
  const t0 = Date.now();
  for (let h = 0; h < 8760; h++) {
    const a = performance.now();
    sim.step(1, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        const kind = ev[i + 1]!;
        if (kind === 12) k.decl!++;
        else if (kind === 55) k.det!++;
        else if (kind === 9) k.cap!++;
        else if (kind === 14) k.peace!++;
      }
      x.out.events.length = 0;
      x.out.fires.length = 0;
    });
    ms.push(performance.now() - a);
  }
  all.push(...ms);
  ms.sort((p, q) => p - q);
  const mean = ms.reduce((p, q) => p + q, 0) / ms.length;
  const nc = w.nations.cols;
  let living = 0;
  for (let n = 1; n < w.nations.count; n++) if (nc.living[n] === 1) living++;
  console.log(
    `year ${y} hash ${(sim.hash() >>> 0).toString(16).padStart(8, '0')} tick mean ${mean.toFixed(3)} p95 ${ms[Math.floor(ms.length * 0.95)]!.toFixed(3)} max ${ms[ms.length - 1]!.toFixed(1)} ` +
      `living ${living} formations ${w.formations.count} heroesAlive ${w.heroes.size} decl ${k.decl} peace ${k.peace} cap ${k.cap} det ${k.det} (${((Date.now() - t0) / 1000).toFixed(1)} s)`,
  );
}
const mean = all.reduce((p, q) => p + q, 0) / all.length;
if (save) writeFileSync(save, sim.save());
console.log(`done: ${years} years mean tick ${mean.toFixed(4)} ms final hash ${(sim.hash() >>> 0).toString(16).padStart(8, '0')}${save ? ` saved ${save}` : ''}`);
