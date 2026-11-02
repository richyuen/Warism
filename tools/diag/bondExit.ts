/**
 * PLAN 7.191 (R26-B1, the critic's PZ): a puppet's Force war on its overlord, and an ally's on its
 * ally, while the two fight on one side of a war. The 1938 world, AI on; every `every` days, each
 * such pair (a living puppet beside its overlord, two free allies beside each other) is tried on a
 * copy of the day's world: whether the war is declared (`forceWar` gives None and the two are at
 * war) or refused for `Beside`, and whether any nation then stands on one side with its enemy.
 * Then a revolt: each puppet beside its overlord with its loyalty set under the bar, the month's
 * puppet pass run on a copy: whether it rises (`WarDeclared` on its overlord) or is refused.
 *
 * Usage: npx tsx tools/diag/bondExit.ts <seed> [days] [every]
 */
import { isMonthStart } from '../../src/shared/calendar';
import { Refusal } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { puppetSystem, REVOLT_LOYALTY } from '../../src/sim/systems/puppets';
import { beside, forceWar, whyNotWar } from '../../src/sim/systems/war';
import { assets1938 } from '../../tests/helpers/earth';
import { realmWars } from '../../tests/helpers/realmWars';

const seed = Number(process.argv[2] ?? 7019);
const days = Number(process.argv[3] ?? 365);
const every = Number(process.argv[4] ?? 30);
const assets = assets1938(SIZE_1938.w);
const s = new Sim({ scenario: '1938', seed, assets });
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const step = (x: Sim, h: number): void =>
  x.step(h, (w) => {
    w.out.events.length = 0;
    w.out.fires.length = 0;
  });
const copy = (bytes: Uint8Array): Sim => {
  const c = new Sim({ scenario: '1938', seed, assets });
  c.load(bytes);
  return c;
};
const tot = { puppet: 0, puppetWar: 0, ally: 0, allyWar: 0, beside: 0, mixed: 0, revolt: 0, revoltWar: 0 };
const refusedFor: string[] = [];
const RN: Record<number, string> = Object.fromEntries(Object.entries(Refusal).map(([k, v]) => [v, k]));
const whyNot: Record<string, number> = {};
const count = (k: string): void => {
  whyNot[k] = (whyNot[k] ?? 0) + 1;
};
for (let d = every; d <= days; d += every) {
  step(s, 24 * every);
  const w = s.world;
  const nc = w.nations.cols;
  const pairs: [number, number, 'puppet' | 'ally'][] = [];
  w.nations.forEach((p) => {
    const o = nc.overlord[p]!;
    if (nc.living[p] === 1 && o !== 0 && nc.living[o] === 1 && beside(w, p, o)) pairs.push([p, o, 'puppet']);
  });
  const free: number[] = [];
  w.nations.forEach((n) => {
    if (nc.living[n] === 1 && nc.overlord[n] === 0) free.push(n);
  });
  for (const a of free) for (const b of free) if (a !== b && w.alliances.allied(a, b) && beside(w, a, b)) pairs.push([a, b, 'ally']);
  if (pairs.length === 0) continue;
  const bytes = s.save();
  for (const [a, b, kind] of pairs) {
    const c = copy(bytes);
    const why = forceWar(c.world, a, b);
    const war = why === Refusal.None && c.world.wars.atWar(a, b);
    tot[kind]++;
    if (war) tot[kind === 'puppet' ? 'puppetWar' : 'allyWar']++;
    else count(`${kind} ${RN[why] ?? why}`);
    if (why === Refusal.Beside) {
      tot.beside++;
      refusedFor.push(`day ${d} ${tag(a)} on ${tag(b)}`);
    }
    if (realmWars(c.world, tag).length > 0) tot.mixed++;
  }
  for (const [p, o, kind] of pairs) {
    if (kind !== 'puppet' || nc.autonomy[p]! < 10) continue;
    const c = copy(bytes);
    for (let n = 1; n < c.world.nations.cols.loyalty.length; n++) if (n !== p && c.world.nations.cols.overlord[n] !== 0) c.world.nations.cols.loyalty[n] = 100;
    c.world.nations.cols.loyalty[p] = REVOLT_LOYALTY - 20;
    c.world.out.events.length = 0;
    puppetSystemAtMonth(c);
    const ev = c.world.out.events;
    let rose = false;
    for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.WarDeclared && ev[i + 2] === p && ev[i + 3] === o) rose = true;
    tot.revolt++;
    if (rose && c.world.wars.atWar(p, o)) tot.revoltWar++;
    else count(`revolt: ${c.world.nations.cols.overlord[p] === 0 ? `freed, ${RN[whyNotWar(c.world, p, o)] ?? '?'}` : 'not freed'}`);
  }
}

/** Runs the puppet pass as at the start of a month (it acts only then). */
function puppetSystemAtMonth(c: Sim): void {
  const w = c.world;
  const tick = w.tick;
  const start = w.startDay;
  // The pass acts at a month's first hour: the tick is set back to it for the call.
  const dayOf = Math.floor(tick / 24);
  let back = 0;
  while (back <= 31 && !isMonthStart(start, (dayOf - back) * 24)) back++;
  (w as { tick: number }).tick = (dayOf - back) * 24;
  puppetSystem(w);
  (w as { tick: number }).tick = tick;
}
console.log(`seed ${seed} to day ${days} every ${every}: puppet on overlord ${tot.puppetWar} of ${tot.puppet} declared, ally on ally ${tot.allyWar} of ${tot.ally}; refused for Beside ${tot.beside}${refusedFor.length > 0 ? ` (${refusedFor.slice(0, 5).join(', ')})` : ''}; a nation beside its enemy after ${tot.mixed}; revolts rising ${tot.revoltWar} of ${tot.revolt}; not declared: ${JSON.stringify(whyNot)}`);
console.log('done:');
