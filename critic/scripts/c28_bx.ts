// Critic run 27 (new), BX: the bond's door out of a war (PLAN 7.191's leaveWarsBeside). Enemy E force-declares on A at
// day 1; `day` days pass; A proposes an alliance to P (a nation fighting beside it) unless they are already bonded; then
// A Force-wars P. Before / an hour after / daily for 60 days: A's wars, A at war / in truce with E, A's cells held by E and
// E's held by A, and whether A's peace offer to P is accepted (A offers each day). E's re-declaration on A, if any.
// Usage: npx tsx critic/scripts/c28_bx.ts <seed> <E> <A> <P> <day> <out.json> [ally|attack]   (ally: A proposes to P first;
// attack: A declares on E at day 1 instead, its ally P called in)
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { EventKind } from '../../src/shared/events';
import { loadAssets1938 } from '../../tools/headless/assets';

const [seed, TE, TA, TP, dayS, out, mode] = [Number(process.argv[2]), process.argv[3]!, process.argv[4]!, process.argv[5]!, process.argv[6]!, process.argv[7]!, process.argv[8] ?? ''];
const day = Number(dayS);
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w) });
const w = s.world;
const nc = w.nations.cols;
const id = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
const E = id(TE), A = id(TA), P = id(TP);
const held = (k: number, o: number): number => { let n = 0; for (let i = 0; i < w.cells.owner.length; i++) if (w.cells.owner[i] === o && w.cells.controller[i] === k) n++; return n; };
const owned = (o: number): number => { let n = 0; for (let i = 0; i < w.cells.owner.length; i++) if (w.cells.owner[i] === o) n++; return n; };
const evs: string[] = [];
const take = (ww: typeof w) => { const e = ww.out.events; for (let i = 0; i < e.length; i += 6) { const a = e[i + 2]!, b = e[i + 3]!; if (a === A || b === A || a === E || b === E || a === P || b === P) evs.push(`${(e[i]! / 24).toFixed(2)} ${EV[e[i + 1]!]} ${tag(a)} ${tag(b)}`); } ww.out.events.length = 0; ww.out.fires.length = 0; };
const wdesc = (x: { id: number; sides: number[][] }) => `#${x.id} ${x.sides[0]!.map(tag).join('+')} v ${x.sides[1]!.map(tag).join('+')}`;
const st = () => ({
  day: +(w.tick / 24).toFixed(2), living: nc.living[A] === 1, overlord: tag(nc.overlord[A]!), alliance: w.alliances.allianceOf(A)?.members.map(tag) ?? null,
  AvE: w.wars.atWar(A, E), truceAE: w.wars.inTruce(A, E, w.tick), AvP: w.wars.atWar(A, P), AownCells: owned(A), EholdsA: held(E, A), AholdsE: held(A, E), PholdsA: held(P, A),
  wars: w.wars.list.filter((x) => x.sides.some((sd) => sd.includes(A))).map(wdesc),
});
const log: unknown[] = [];
s.step(24, take);
if (mode === 'attack') s.command({ kind: 'forceWar', attacker: A, defender: E } as never); else s.command({ kind: 'forceWar', attacker: E, defender: A } as never);
s.step(1, take);
log.push({ k: 'E on A', ...st(), evs: evs.splice(0).filter((x) => /War|Bond|Puppet/.test(x)) });
s.step(day * 24, take);
evs.length = 0;
if (mode === 'ally') { s.command({ kind: 'proposeAlliance', from: A, to: P } as never); s.step(1, take); }
log.push({ k: 'before', ...st(), allied: w.alliances.allied(A, P), evs: evs.splice(0) });
s.command({ kind: 'forceWar', attacker: A, defender: P } as never);
s.step(1, take);
log.push({ k: 'A on P, an hour after', ...st(), evs: evs.splice(0) });
if (process.env.REDECL) {
  // REDECL=1 (critic run 27): A declares on E again an hour after its exit (the player's "Declare war" on the old enemy).
  s.command({ kind: 'declareWar', attacker: A, defender: E } as never);
  s.step(1, take);
  log.push({ k: 'A re-declares on E, an hour after', ...st(), evs: evs.splice(0).filter((x) => /War|Bond|Truce/.test(x)) });
}
let peaceDay: number | null = null, eBack: number | null = null;
for (let d = 1; d <= 60; d++) {
  const war = w.wars.list.find((x) => (x.sides[0].includes(A) && x.sides[1].includes(P)) || (x.sides[1].includes(A) && x.sides[0].includes(P)));
  if (war && peaceDay === null) s.command({ kind: 'offerPeace', war: war.id, from: A } as never);
  s.step(24, take);
  if (peaceDay === null && !w.wars.atWar(A, P)) peaceDay = d;
  if (eBack === null && w.wars.atWar(A, E)) eBack = d;
  if (d % 10 === 0 || d === 1 || d === 3) log.push({ k: `day +${d}`, ...st(), evs: evs.splice(0).filter((x) => /War|Peace|Bond|Puppet|Annex|Ceded|Truce/.test(x)) });
}
const res = { seed, E: TE, A: TA, P: TP, day, mode, peaceWithPDay: peaceDay, EbackAtWarDay: eBack, log };
writeFileSync(out, JSON.stringify(res, null, 1));
console.log(JSON.stringify({ peaceWithPDay: peaceDay, EbackAtWarDay: eBack, before: log[1], after: log[2] }, null, 1));
console.log('done:');
