// Critic run 25 (new), COBEL: a nation that declares on its co-belligerent. Germany and the Soviet Union both declare on
// Poland (day 1), 60 days pass, then Germany declares on the Soviet Union. Before and after: is Germany still at war with
// Poland, how many Polish cells it holds, events of that hour. Runs on both commits.
// Usage: npx tsx critic/scripts/c27_cobel.ts <seed> <out.json> [A B C] (A and B on C, then A on B)
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { EventKind } from '../../src/shared/events';
import { loadAssets1938 } from '../../tools/headless/assets';

const seed = Number(process.argv[2] ?? 7019), out = process.argv[3]!;
const [TA, TB, TC] = [process.argv[4] ?? 'GER', process.argv[5] ?? 'SOV', process.argv[6] ?? 'POL'];
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w) });
const id = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
const A = id(TA), B = id(TB), C = id(TC);
const w = s.world;
const held = (k: number, o: number): number => { let n = 0; for (let i = 0; i < w.cells.owner.length; i++) if (w.cells.owner[i] === o && w.cells.controller[i] === k) n++; return n; };
const state = () => ({ day: w.tick / 24, [`${TA} v ${TC}`]: w.wars.atWar(A, C), [`${TB} v ${TC}`]: w.wars.atWar(B, C), [`${TA} v ${TB}`]: w.wars.atWar(A, B), [`${TA} holds ${TC}`]: held(A, C), [`${TB} holds ${TC}`]: held(B, C), [`${TC} holds ${TA}`]: held(C, A), wars: w.wars.list.map((x) => ({ id: x.id, a: x.sides[0].map(tag), d: x.sides[1].map(tag) })) });
const log: unknown[] = [];
const evs: string[] = [];
const take = (ww: typeof w) => { const e = ww.out.events; for (let i = 0; i < e.length; i += 6) evs.push(`${(e[i]! / 24).toFixed(2)} ${EV[e[i + 1]!]} ${tag(e[i + 2]!)} ${tag(e[i + 3]!)}`); ww.out.events.length = 0; ww.out.fires.length = 0; };
s.step(24, take);
log.push({ k: 'start', ...state() });
s.command({ kind: 'forceWar', attacker: A, defender: C } as never);
s.step(1, take);
s.command({ kind: 'forceWar', attacker: B, defender: C } as never);
s.step(1, take);
log.push({ k: 'both on C', ...state(), evs: evs.splice(0).filter((x) => /War|Peace/.test(x)) });
s.step(60 * 24, take);
evs.length = 0;
log.push({ k: 'day 60 after', ...state() });
s.command({ kind: 'forceWar', attacker: A, defender: B } as never);
s.step(1, take);
log.push({ k: `${TA} on ${TB}, an hour after`, ...state(), evs: evs.splice(0).filter((x) => /War|Peace|Ceded|Annex/.test(x)) });
s.step(30 * 24, take);
log.push({ k: '30 days after', ...state(), evs: evs.splice(0).filter((x) => /War|Peace|Ceded|Annex/.test(x)) });
writeFileSync(out, JSON.stringify(log, null, 1));
console.log(JSON.stringify(log.map((x) => { const { wars, evs: e, ...r } = x as Record<string, unknown>; return { ...r, evs: e }; }), null, 1));
console.log('done:');
