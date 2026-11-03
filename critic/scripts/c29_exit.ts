// Critic run 25 (new), EXIT: the headless count behind ES2. Germany declares on Poland (France, Poland's partner, called
// in); after <day> days Poland declares on France. Before and an hour after: Poland at war with Germany, cells each holds
// of the other's, the war's score as offerPeace would read it is not touched (no offer is made). Runs on both commits.
// Usage: npx tsx critic/scripts/c29_exit.ts <seed> <day> <out.json>
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { EventKind } from '../../src/shared/events';
import { loadAssets1938 } from '../../tools/headless/assets';

const seed = Number(process.argv[2] ?? 7019), day = Number(process.argv[3] ?? 30), out = process.argv[4]!;
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w) });
const id = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
const GER = id('GER'), POL = id('POL'), FRA = id('FRA');
const w = s.world;
const held = (k: number, o: number): number => { let n = 0; for (let i = 0; i < w.cells.owner.length; i++) if (w.cells.owner[i] === o && w.cells.controller[i] === k) n++; return n; };
const evs: string[] = [];
const take = (ww: typeof w) => { const e = ww.out.events; for (let i = 0; i < e.length; i += 6) if ([EventKind.WarDeclared, EventKind.PeaceSigned, EventKind.WarEnded, EventKind.WarRejected].includes(e[i + 1]! as never)) evs.push(`${(e[i]! / 24).toFixed(2)} ${EV[e[i + 1]!]} ${tag(e[i + 2]!)} ${tag(e[i + 3]!)}`); ww.out.events.length = 0; ww.out.fires.length = 0; };
const state = (k: string) => ({ k, day: +(w.tick / 24).toFixed(2), polGer: w.wars.atWar(POL, GER), polFra: w.wars.atWar(POL, FRA), gerFra: w.wars.atWar(GER, FRA), gerHoldsPol: held(GER, POL), polHoldsGer: held(POL, GER), truce: w.wars.inTruce(POL, GER, w.tick), wars: w.wars.list.filter((x) => [...x.sides[0], ...x.sides[1]].some((m) => m === POL || m === GER)).map((x) => ({ a: x.sides[0].map(tag), d: x.sides[1].map(tag) })) });
s.step(24, take);
s.command({ kind: 'forceWar', attacker: GER, defender: POL } as never);
s.step(1, take);
const log: unknown[] = [state('Germany on Poland')];
let stopped = false;
for (let d = 1; d < day; d++) { s.step(24, take); if (!w.wars.atWar(POL, GER)) { stopped = true; break; } }
log.push(state(stopped ? 'the war ended before the day' : `day ${day}`));
if (!stopped) {
  s.command({ kind: 'declareWar', attacker: POL, defender: FRA } as never);
  s.step(1, take);
  log.push(state('an hour after Poland declared on France'));
  s.command({ kind: 'declareWar', attacker: POL, defender: GER } as never);
  s.step(1, take);
  log.push(state('an hour after Poland declared on Germany again'));
}
writeFileSync(out, JSON.stringify({ seed, day, log, evs }, null, 1));
console.log(JSON.stringify(log.map((x) => { const { wars, ...r } = x as Record<string, unknown>; return r; })));
console.log('done:');
