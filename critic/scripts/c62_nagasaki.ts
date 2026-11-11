// Critic run 62 (new): the track's two atomic strikes (1938h, its own seed): each NukeDetonated/NukeCasualties row raw,
// the cell's owner, holder and terrain at the strike's x, y and around it. Is "where no nation holds the land" true?
// Usage: npx tsx critic/scripts/c62_nagasaki.ts
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const tag = (n: number): string => (n > 0 ? (TAGS_1938H[n - 1] ?? `#${n}`) : `${n}`);
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
const endTick = 24 * (365 * 7 + 2 + 226); // to about 15 August 1945
const kinds = new Set<number>([EventKind.NukeLaunched, EventKind.NukeDetonated, EventKind.NukeCasualties, EventKind.TrackEvent]);
const rows: string[] = [];
const around = (w: World, x: number, y: number): string => {
  const W = w.cells.w;
  const out: string[] = [];
  for (let dy = -2; dy <= 2; dy++) {
    const r: string[] = [];
    for (let dx = -2; dx <= 2; dx++) {
      const c = (Math.floor(y) + dy) * W + Math.floor(x) + dx;
      r.push(`${tag(w.cells.owner[c]!)}/${tag(w.cells.controller[c]!)}/t${w.cells.terrain[c]}`);
    }
    out.push(r.join(' '));
  }
  return out.join('\n    ');
};
while (sim.tick < endTick) {
  sim.step(24, (w: World) => {
    const ev = w.out.events;
    for (let i = 0; i < ev.length; i += 6) {
      const k = ev[i + 1]!;
      if (k === EventKind.NukeLaunched || k === EventKind.NukeDetonated || k === EventKind.NukeCasualties) {
        const [t, a, b, x, y] = [ev[i]!, ev[i + 2]!, ev[i + 3]!, ev[i + 4]!, ev[i + 5]!];
        rows.push(`t${t} kind ${k} a ${tag(a)} b ${b} x ${x} y ${y}${Number.isFinite(x) && Number.isFinite(y) ? `\n    ${around(w, x, y)}` : ''}`);
      }
    }
    ev.length = 0;
    w.out.fires.length = 0;
  });
}
console.log(rows.join('\n'));
console.log('done:');
