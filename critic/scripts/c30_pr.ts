// Critic run 26 (new), PR: a puppet that fights in its overlord's war, at day <day>: (1) Force war on its overlord (the
// player's / God's command, ADR-780: "a puppet in the way goes free"); (2) in a copy of the world, God sets its loyalty to
// 0 and autonomy to 60 (SPEC: loyalty < 20 with autonomy >= 10 means a revolt and a war of independence). Each: the
// overlord after, the war between the two, the events, the wars the puppet is in. Runs on both commits.
// Usage: npx tsx critic/scripts/c30_pr.ts <seed> <day> <PUP> <OVR> <out.json>
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { EventKind } from '../../src/shared/events';
import { loadAssets1938 } from '../../tools/headless/assets';

const seed = Number(process.argv[2] ?? 7019), day = Number(process.argv[3] ?? 30);
const P0 = process.argv[4] ?? 'ALB', O0 = process.argv[5] ?? 'ITA', out = process.argv[6]!;
const assets = loadAssets1938(size1938().w);
const id = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
const P = id(P0), O = id(O0);
const keep = ['WarDeclared', 'WarRejected', 'PuppetRevolt', 'PuppetReleased', 'BondsBroken', 'PeaceSigned', 'WarEnded', 'WarLeft'];
function run(kind: 'force' | 'revolt') {
  const s = new Sim({ scenario: '1938', seed, assets });
  const w = s.world;
  const evs: string[] = [];
  const take = (ww: typeof w) => { const e = ww.out.events; for (let i = 0; i < e.length; i += 6) { const k = EV[e[i + 1]!]!; if (keep.includes(k) && (e[i + 2] === P || e[i + 3] === P || e[i + 2] === O && e[i + 3] === P)) evs.push(`${(e[i]! / 24).toFixed(2)} ${k} ${tag(e[i + 2]!)} ${tag(e[i + 3]!)}`); } ww.out.events.length = 0; ww.out.fires.length = 0; };
  s.step(day * 24, take);
  const st = () => ({ day: +(w.tick / 24).toFixed(2), overlord: tag(w.nations.cols.overlord[P]!), loyalty: +w.nations.cols.loyalty[P]!.toFixed(1), autonomy: +w.nations.cols.autonomy[P]!.toFixed(1), atWarWithOverlord: w.wars.atWar(P, O), wars: w.wars.list.filter((x) => x.sides.some((sd) => sd.includes(P))).map((x) => `${x.sides[0].map(tag).join('+')} v ${x.sides[1].map(tag).join('+')}`) });
  const before = st();
  if (kind === 'force') s.command({ kind: 'forceWar', attacker: P, defender: O } as never);
  else { s.command({ kind: 'setAutonomy', subject: P, value: 60 } as never); s.command({ kind: 'setPuppetLoyalty', subject: P, value: 0 } as never); }
  s.step(1, take);
  const hour = st();
  s.step(24 * 3, take);
  const later = st();
  return { kind, before, hour, later, evs: evs.filter((e) => Number(e.split(' ')[0]) >= day - 0.01) };
}
const res = { seed, day, puppet: P0, overlord: O0, force: run('force'), revolt: run('revolt') };
writeFileSync(out, JSON.stringify(res, null, 1));
console.log(JSON.stringify({ force: [res.force.hour.overlord, res.force.hour.atWarWithOverlord, res.force.evs], revolt: [res.revolt.later.overlord, res.revolt.later.atWarWithOverlord, res.revolt.evs] }));
console.log('done:');
