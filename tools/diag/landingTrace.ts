/**
 * ROADMAP R37: the player's landings hour by hour on one 1938 case, for tracing a landing rule.
 *
 * Usage: npx tsx tools/diag/landingTrace.ts <seed> <nation tag> <foe tag> <clicks JSON> <hours>
 *   clicks: [{ "at": hour, "ids": [..], "x": .., "y": .. }] (each one click, applied at once; ids by number)
 * Prints each hour a landing changes (state, port, groups, divisions, where each division is) and each
 * event of the clicked divisions (refused with its reason, landed, next voyage, left its landing).
 */
import { EventKind } from '../../src/shared/events';
import { NATIONS_1938, size1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { loadAssets1938 } from '../headless/assets';

const [seedS, tag, foeTag, clicksS, hoursS] = process.argv.slice(2);
const clicks: { at: number; ids: number[]; x: number; y: number }[] = JSON.parse(clicksS ?? '[]');
const id = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const [n, foe] = [id(tag ?? 'JAP'), id(foeTag ?? 'CHI')];
const sim = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
const w = sim.world;
const ids = [...new Set(clicks.flatMap((c) => c.ids))];
const names = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
const take = (x: World): void => {
  const e = x.out.events;
  for (let i = 0; i < e.length; i += 6) if (ids.includes(e[i + 2]!) && [EventKind.MoveRejected, EventKind.FormationLanded, EventKind.NextVoyage, EventKind.LeftLanding].includes(e[i + 1]! as never)) console.log(`t${x.tick} ${names[e[i + 1]!]} ${e[i + 2]} ${e[i + 1] === EventKind.MoveRejected ? `why ${e[i + 4]}` : ''}`);
  e.length = 0;
  x.out.fires.length = 0;
};
sim.command({ kind: 'setPlayer', nation: n });
sim.step(1, take);
if (!w.wars.atWar(n, foe)) sim.command({ kind: 'forceWar', attacker: n, defender: foe });
sim.step(1, take);
const c = w.formations.cols;
let last = '';
for (let h = 0; h < Number(hoursS ?? 600); h++) {
  for (const k of clicks.filter((k) => k.at === w.tick)) {
    for (const d of [...k.ids].sort((a, b) => a - b)) sim.command({ kind: 'moveFormation', id: d, x: k.x, y: k.y, nation: n, escort: true });
    sim.applyNow(take);
    console.log(`t${w.tick} CLICK ${k.ids.join(',')} -> ${k.x},${k.y}`);
  }
  sim.step(1, take);
  const now = [...w.landings.values()]
    .map((l) => `L${l.id} ${['gath', 'sail', 'ret'][l.state]} ${w.ports[l.port]?.name} f${l.fleets.join('/')} d${[...l.divisions.keys()].map((d) => `${d}${w.embarked.has(d) ? 'a' : c.moving[d] === 1 ? 'm' : 's'}`).join('/')} o${l.ordered}`)
    .join(' | ');
  if (now !== last) console.log(`t${w.tick} ${now}`);
  last = now;
  if (ids.every((d) => !w.formations.has(d)) || (w.landings.size === 0 && clicks.every((k) => k.at < w.tick) && h > 48)) break;
}
console.log('done:');
