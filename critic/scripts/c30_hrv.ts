// Critic run 30 (focused, ROADMAP R9): a hero's nation annexed, then revived. 1938, heroes on, seed <seed>: on day 2
// <ANNEXER> annexes <TARGET> (God's command). Then <years> years: the target's living by day, each of its rows (alive,
// waiting), its HeroReturned / HeroLost events, and the checker's heroes rules (`heroBreaks`) every hour.
// Usage: npx tsx critic/scripts/c30_hrv.ts <seed> <ANNEXER> <TARGET> <years> <out.json>
import { writeFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { size1938, NATIONS_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
import { heroBreaks } from '../../tests/helpers/worldInvariants';
const seed = Number(process.argv[2] ?? 4111), A = process.argv[3] ?? 'GER', T = process.argv[4] ?? 'FRA', years = Number(process.argv[5] ?? 20), out = process.argv[6]!;
const tag = (k: number): string => (k === 0 ? '-' : NATIONS_1938[k - 1]?.tag ?? `#${k}`);
const id = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w), options: { heroes: 'on' } });
const a = id(A), t = id(T);
const rowsT = s.world.heroRoster.map((r, row) => ({ row, r })).filter((x) => x.r.nation === t).map((x) => x.row);
const res: Record<string, unknown> = { seed, A, T, rowsT: rowsT.map((r) => TEMPLATES_1938[s.world.heroRoster[r]!.template]!.id) };
s.step(48, (w) => { w.out.events.length = 0; w.out.fires.length = 0; });
res.annexed = s.command({ kind: 'annexNation', annexer: a, target: t });
const living: [number, number][] = [];
const events: unknown[] = [];
const breaks: Record<string, number> = {};
let firstBreak: string | null = null;
let last = -1;
const lonLat = (x: number, y: number): [number, number] => [Math.round((x / s.world.cells.w) * 3600 - 1800) / 10, Math.round(900 - (y / s.world.cells.h) * 1800) / 10];
s.step(years * 365 * 24, (w) => {
  const L = w.nations.cols.living[t]!;
  if (L !== last) { living.push([w.tick, L]); last = L; }
  const ev = w.out.events;
  for (let i = 0; i < ev.length; i += 6) {
    const k = ev[i + 1];
    if ((k === EventKind.HeroLost || k === EventKind.HeroReturned) && ev[i + 2] === t) events.push({ tick: ev[i], kind: k === EventKind.HeroLost ? 'lost' : 'back', row: TEMPLATES_1938[w.heroRoster[ev[i + 3]!]!.template]!.id, at: lonLat(ev[i + 4]!, ev[i + 5]!) });
    if (k === EventKind.NationRevived && ev[i + 2] === t) events.push({ tick: ev[i], kind: 'revived' });
  }
  for (const b of heroBreaks(w, tag)) { const key = b.replace(/\d+ days/, 'N days'); breaks[key] = (breaks[key] ?? 0) + 1; firstBreak ??= `${w.tick}: ${b}`; }
  w.out.events.length = 0; w.out.fires.length = 0;
});
const w = s.world;
res.living = living;
res.events = events;
res.breaks = breaks;
res.firstBreak = firstBreak;
res.end = rowsT.map((row) => ({ row: TEMPLATES_1938[w.heroRoster[row]!.template]!.id, alive: [...w.heroes.values()].includes(row), returnAt: w.heroReturn.get(row) ?? null }));
res.tick = w.tick;
writeFileSync(out, JSON.stringify(res, null, 1));
console.log(JSON.stringify({ annexed: res.annexed, living, events: events.length, breaks, end: res.end }));
console.log('done:');
