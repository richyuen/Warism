// Critic run 71 (new, R85a): the hour a bloc ends in a 1991 free game, found, with the checker's bloc rule judged each hour.
// Loads critic/c76_starts/1991.sav, leaves the track, steps hour by hour for DAYS days; prints each hour the number of blocs
// changes, the BlocAid rows of that hour and the hour before, and every line `blocBreaks` gives (all hours).
// Usage: npx tsx critic/scripts/c76_blocend.ts <after> [days=1825]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { blocsOf, strengths } from '../../src/sim/ai/strategic';
import { blocBreaks, useTags } from '../../tests/helpers/diploInvariants';
import { assets1938 } from '../../tests/helpers/earth';

const after = Number(process.argv[2] ?? 54611) >>> 0;
const days = Number(process.argv[3] ?? 1825);
const tags = TAGS_1938H as readonly string[];
const tag = (n: number): string => tags[n - 1] ?? `#${n}`;
useTags(tag);
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after } });
sim.load(new Uint8Array(gunzipSync(readFileSync('critic/c76_starts/1991.sav'))));
sim.world.track!.afterSeed = after;
sim.command({ kind: 'leaveTrack' });
const w = sim.world;
const date = (t: number): string => new Date(Date.UTC(1938, 0, 1) + t * 3600e3).toISOString().slice(0, 13);
const blocs = (): string => [...blocsOf(w, strengths(w))].map((id) => { const a = w.alliances.list.find((x) => x.id === id); return a ? `${id}:${tag(a.leader)}(${a.members.length})` : `${id}`; }).join(' ');
let prev = blocs();
let prevAid: string[] = [];
let breaks = 0;
for (let h = 0; h < days * 24; h++) {
  let ev: number[] = [];
  sim.step(1, (x) => { ev = [...x.out.events]; x.out.events.length = 0; x.out.fires.length = 0; });
  const aid: string[] = [];
  const other: string[] = [];
  for (let i = 0; i < ev.length; i += 6) {
    if (ev[i + 1] === EventKind.BlocAid) aid.push(`BlocAid ${tag(ev[i + 2]!)}>${tag(ev[i + 3]!)}`);
    if (ev[i + 1] === EventKind.AllianceDissolved || ev[i + 1] === EventKind.AllianceLeft) other.push(`${ev[i + 1] === EventKind.AllianceDissolved ? 'AllianceDissolved' : 'AllianceLeft'} ${tag(ev[i + 2]!)} ${tag(ev[i + 3]!)}`);
  }
  const lines = blocBreaks(w, ev);
  breaks += lines.length;
  for (const l of lines) process.stdout.write(`${date(sim.tick)} BROKEN ${l}\n`);
  const now = blocs();
  if (now !== prev) {
    process.stdout.write(`${date(sim.tick)} blocs ${prev} -> ${now}; this hour: ${[...aid, ...other].join('; ') || '-'}; the hour before: ${prevAid.join('; ') || '-'}\n`);
    prev = now;
  }
  prevAid = aid;
}
process.stdout.write(`done: ${days} days, ${breaks} bloc lines broken\n`);
