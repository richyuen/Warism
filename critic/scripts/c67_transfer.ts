// Critic run 64 (new): R65c hides the land and death rows of a timeline transfer told by its note. On the real track
// (1938h, its own seed, to 1 September 1945), each note-told transfer: what History and the ticker still say in the
// 72 hours after it about the nations it took from (any LandCeded from them, any NationEliminated of them), and the
// History rows of 10–25 August 1945 in full. Is anything told twice, or is a death now told nowhere?
// Usage: npx tsx critic/scripts/c67_transfer.ts
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { toldByNote } from '../../src/sim/track';
import type { World } from '../../src/sim/world';
import { historyRows } from '../../src/worker/historyRows';
import { assets1938 } from '../../tests/helpers/earth';

const KN = Object.fromEntries(Object.entries(EventKind).filter(([, v]) => typeof v === 'number').map(([k, v]) => [v, k]));
const tag = (n: number): string => (n > 0 ? (TAGS_1938H[n - 1] ?? `#${n}`) : `${n}`);
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
const endTick = 24 * (365 * 7 + 2 + 243); // about 1 September 1945
while (sim.tick < endTick) {
  sim.step(24, (w: World) => {
    w.out.events.length = 0;
    w.out.fires.length = 0;
  });
}
const w = sim.world;
const t = w.track!;
const rows = historyRows(w, (n) => tag(n), () => '');
const day = (tick: number): string => new Date(Date.UTC(1938, 0, 1) + tick * 3600_000).toISOString().slice(0, 13);
const raw = w.history.rows;
let told = 0;
for (let j = 0; j < t.events.length; j++) {
  const e = t.events[j]!;
  if (e.kind !== 'transfer' || !toldByNote(t, j) || t.ticks[j]! > w.tick) continue;
  told++;
  const at = t.ticks[j]!;
  const from = e.from.map((g) => t.id(g));
  const shown = rows.filter((r) => r.tick >= at - 1 && r.tick <= at + 72 && ((r.kind === EventKind.NationEliminated && from.includes(r.a)) || (r.kind === EventKind.LandCeded && from.includes(r.b))));
  const rawDeaths: string[] = [];
  for (let i = 0; i < raw.length; i += 6) {
    if (raw[i + 1] === EventKind.NationEliminated && from.includes(raw[i + 2]!) && raw[i]! >= at && raw[i]! <= at + 24 * 60) rawDeaths.push(`${tag(raw[i + 2]!)}@+${raw[i]! - at}h`);
  }
  const deathRows = rows.filter((r) => r.kind === EventKind.NationEliminated && from.includes(r.a)).map((r) => `${tag(r.a)}@${day(r.tick)}`);
  console.log(`${day(at)} "${e.note}" from ${from.map(tag).join(',')}: still shown within 72h: ${shown.length ? shown.map((r) => `${KN[r.kind]} a=${tag(r.a)} b=${tag(r.b)} +${r.tick - at}h`).join('; ') : 'none'}; raw deaths ${rawDeaths.join(',') || 'none'}; death rows anywhere ${deathRows.join(',') || 'none'}`);
}
console.log(`note-told transfers so far: ${told}`);
const txt = (r: { kind: number; a: number; an: string; b: number; bn: string; of: string }): string => (r.kind === EventKind.TrackEvent ? `"${t.events[r.a - 1]?.note}"` : `a=${r.an || tag(r.a)} b=${r.bn || tag(r.b)}${r.of ? ` of=${r.of}` : ''}`);
// The days of the deaths of the nations a note-told transfer took from, a day each side.
const days = new Set<number>();
for (let j = 0; j < t.events.length; j++) if (t.events[j]!.kind === 'transfer' && toldByNote(t, j) && t.ticks[j]! <= w.tick) days.add(Math.floor(t.ticks[j]! / 24));
for (const d of [...days].sort((x, y) => x - y)) {
  console.log(`--- History rows, day ${d} (${day(d * 24).slice(0, 10)}) and the next`);
  for (const r of rows) if (r.tick >= d * 24 && r.tick < d * 24 + 48 && r.kind !== EventKind.OrderNews) console.log(`  ${day(r.tick)} ${KN[r.kind]} ${txt(r)}`);
}
console.log('done');
