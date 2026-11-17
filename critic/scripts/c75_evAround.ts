// Critic run 75 (new): the events of two nations about a day (a called-off massing and the war of the same day).
// Plain 1938 SEED, stepped an hour at a time from day FROM to day TO: every event whose a or b is one of TAGS,
// with its hour, kind (by name), a, b and its x/y.
// Usage: npx tsx critic/scripts/c75_evAround.ts <seed> <fromDay> <toDay> <TAG,TAG>
import { EventKind } from '../../src/shared/events';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const [seedS, fromS, toS, tagsS] = process.argv.slice(2);
const seed = Number(seedS), from = Number(fromS), to = Number(toS);
const tags = (tagsS ?? '').split(',');
const ids = new Set(tags.map((t) => (TAGS_1938 as readonly string[]).indexOf(t) + 1));
const name = new Map(Object.entries(EventKind).map(([k, v]) => [v as number, k]));
const tag = (n: number): string => (TAGS_1938 as readonly string[])[n - 1] ?? String(n);
const sim = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w) });
const clear = (x: World): void => { x.out.events.length = 0; x.out.fires.length = 0; };
sim.step(from * 24, clear);
for (let h = from * 24; h < to * 24; h++) {
  sim.step(1, (x: World) => {
    const ev = x.out.events;
    for (let i = 0; i < ev.length; i += 6) {
      const a = ev[i + 2]!, b = ev[i + 3]!;
      const k = ev[i + 1]!;
      if ((ids.has(a) || ids.has(b)) && k !== EventKind.BattleStarted && k !== EventKind.BattleEnded) process.stdout.write(`d${Math.floor(h / 24)} h${h % 24} ${name.get(k) ?? k} ${tag(a)} ${tag(b)} ${ev[i + 4]} ${ev[i + 5]}\n`);
    }
    clear(x);
  });
}
const w = sim.world;
const [A, B] = [...ids];
process.stdout.write(`at the end: at war ${tag(A!)} ${tag(B!)}: ${w.wars.atWar(A!, B!)}\ndone:\n`);
