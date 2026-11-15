// Critic run 70 (new): the hour of a `bloc: aid by X with 1 bloc(s)` line (c72_free.ts 1991 51507: 1993-09-01). From the
// 1991 start left free, stepped to two hours before the given day, then hour by hour: the blocs (diploInvariants'
// blocsOf), the alliance rows and the BlocAid rows of each hour.
// Usage: npx tsx critic/scripts/c72_aidhour.ts <after> <YYYY-MM-DD> [year=1991]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { blocsOf, strengths } from '../../src/sim/ai/strategic';
import { assets1938 } from '../../tests/helpers/earth';

const after = Number(process.argv[2] ?? 51507) >>> 0;
const day = process.argv[3] ?? '1993-09-01';
const year = Number(process.argv[4] ?? 1991);
const tag = (n: number): string => (TAGS_1938H as readonly string[])[n - 1] ?? `#${n}`;
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after } });
sim.load(new Uint8Array(gunzipSync(readFileSync(`critic/c72_starts/${year}.sav`))));
sim.world.track!.afterSeed = after;
sim.command({ kind: 'leaveTrack' });
const t1938 = Date.UTC(1938, 0, 1);
const want = (Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10))) - t1938) / 3_600_000 - 2;
const quiet = (x: World): void => {
  x.out.events.length = 0;
  x.out.fires.length = 0;
};
while (sim.tick < want) sim.step(Math.min(24, want - sim.tick), quiet);
const kinds = new Map([[EventKind.BlocAid, 'BlocAid'], [EventKind.AllianceDissolved, 'AllianceDissolved'], [EventKind.AllianceLeft, 'AllianceLeft'], [EventKind.AllianceJoined, 'AllianceJoined']]);
for (let h = 0; h < 5; h++) {
  const before = [...blocsOf(sim.world, strengths(sim.world))].map((id) => { const a = sim.world.alliances.list.find((x) => x.id === id); return `${id}:${a ? tag(a.leader) : '?'}(${a?.members.length ?? 0})`; });
  const rows: string[] = [];
  sim.step(1, (x) => {
    const e = x.out.events;
    for (let i = 0; i < e.length; i += 6) if (kinds.has(e[i + 1]!)) rows.push(`${kinds.get(e[i + 1]!)} ${tag(e[i + 2]!)} ${tag(e[i + 3]!)}`);
    quiet(x);
  });
  const blocs = [...blocsOf(sim.world, strengths(sim.world))].map((id) => { const a = sim.world.alliances.list.find((x) => x.id === id); return `${id}:${a ? tag(a.leader) : '?'}(${a?.members.length ?? 0})`; });
  const date = new Date(t1938 + sim.tick * 3_600_000).toISOString().slice(0, 13);
  process.stdout.write(`${date} blocs before [${before.join(', ')}] after [${blocs.join(', ')}]; rows: ${rows.join('; ') || '-'}\n`);
}
process.stdout.write('done:\n');
