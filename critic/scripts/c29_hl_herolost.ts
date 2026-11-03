// Critic run 29 (R5a, heroes), HL: how each hero is lost. 1938, heroes on, seed, days, hourly: the hero's last state
// before it is gone (health, supply, org, engaged, moving, aboard, on whose cell, at sea), its hours since last engaged,
// and the events of the loss hour (kinds; a FormationDestroyed of it; a LandingRepulsed, SeaBattle...).
// Usage: npx tsx critic/scripts/c29_hl_herolost.ts <seed> <days> <out.json> [random]
import { writeFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { size1938, NATIONS_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { heroHealth } from '../../src/sim/systems/heroes';
import { loadAssets1938 } from '../../tools/headless/assets';
const seed = Number(process.argv[2] ?? 4111), days = Number(process.argv[3] ?? 365), out = process.argv[4]!;
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w), options: { heroes: 'on', ...(process.argv[5] === 'random' ? { diplomacy: 'random' } : {}) } });
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
const w0 = s.world;
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const name = (row: number): string => `${tag(w0.heroRoster[row]!.nation)} ${TEMPLATES_1938[w0.heroRoster[row]!.template]?.id}`;
type St = { f: number; x: number; y: number; hp: number; supply: number; org: number; engaged: number; moving: number; aboard: boolean; fleet: boolean; cellOwner: string; sinceEng: number; men: number };
const last = new Map<number, St>();
const losses: unknown[] = [];
for (let h = 0; h < days * 24; h++) {
  const evs: number[][] = [];
  s.step(1, (w) => { const e = w.out.events; for (let i = 0; i < e.length; i += 6) evs.push([e[i]!, e[i + 1]!, e[i + 2]!, e[i + 3]!, e[i + 4]!, e[i + 5]!]); w.out.events.length = 0; w.out.fires.length = 0; });
  const w = s.world, fc = w.formations.cols, c = w.cells;
  const alive = new Map<number, number>();
  for (const [f, row] of w.heroes) alive.set(row, f);
  for (let row = 0; row < w.heroRoster.length; row++) {
    const f = alive.get(row), p = last.get(row);
    if (f === undefined) {
      if (p) {
        const mine = evs.filter((e) => e[2] === p.f || (e[1] === EventKind.FormationDestroyed && e[2] === p.f));
        const kinds: Record<string, number> = {};
        for (const e of evs) { const k = EV[e[1]!] ?? String(e[1]); kinds[k] = (kinds[k] ?? 0) + 1; }
        losses.push({ hero: name(row), day: +(w.tick / 24).toFixed(2), last: p, eventsNamingIt: mine.map((e) => [EV[e[1]!], ...e.slice(2)]), kindsThisHour: kinds });
        last.delete(row);
      }
      continue;
    }
    const cell = Math.floor(fc.y[f]!) * c.w + Math.floor(fc.x[f]!);
    const eng = fc.engaged[f] === 1;
    last.set(row, { f, x: +fc.x[f]!.toFixed(2), y: +fc.y[f]!.toFixed(2), hp: +heroHealth(w, f).toFixed(3), supply: +fc.supply[f]!.toFixed(2), org: +fc.org[f]!.toFixed(2), engaged: fc.engaged[f]!, moving: fc.moving[f]!, aboard: w.embarked.has(f), fleet: w.isFleet(f), cellOwner: c.controller[cell] ? tag(c.controller[cell]!) : 'sea', sinceEng: eng ? 0 : p && p.f === f ? p.sinceEng + 1 : 9999, men: fc.strength[f]! });
  }
}
const summary: Record<string, number> = {};
for (const l of losses as { last: St }[]) {
  const k = l.last.fleet ? (l.last.sinceEng < 24 ? 'sea:inBattle' : 'sea:notEngaged') : l.last.aboard ? 'land:aboard' : l.last.sinceEng < 24 ? 'land:inBattle' : l.last.supply < 0.2 ? 'land:outOfSupply' : 'land:other';
  summary[k] = (summary[k] ?? 0) + 1;
}
writeFileSync(out, JSON.stringify({ seed, days, summary, losses }, null, 1));
console.log(JSON.stringify(summary));
console.log('done:');
