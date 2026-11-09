// Critic run 54 (new): who the bar names as holding a landing up at sea (R52c, `heldBy`), against who fights its groups.
// Headless, the AI's own world. Each hour, each landing sailing with a group engaged: the formation `heldBy` picks (the
// nearest engaged formation of a nation at war with it, any kind, any distance) and the foe fleets engaged within SEE
// cells of one of its groups (those that can be in its sea battle). Flags: the named formation is not a fleet, the named
// nation has no engaged fleet within SEE cells, or no foe fleet is engaged within SEE cells at all.
// Usage: npx tsx critic/scripts/c59_heldby.ts <seed> [scenario|random] [--years N] [out.json]
import { writeFileSync } from 'node:fs';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { heldBy, LandingState } from '../../src/sim/systems/landings';
import type { World } from '../../src/sim/world';
import { loadAssets1938 } from '../../tools/headless/assets';

const a = process.argv.slice(2);
const seed = Number(a[0]);
const diplomacy = (a[1] === 'random' ? 'random' : 'scenario') as 'scenario' | 'random';
const yi = a.indexOf('--years');
const years = yi >= 0 ? Number(a[yi + 1]) : 2;
const outPath = a.find((x) => x.endsWith('.json')) ?? `critic/c59_heldby_${seed}.json`;
const SEE = 25;
const sim = new Sim({ scenario: '1938', seed, assets: loadAssets1938(SIZE_1938.w), options: { diplomacy } });
const tag = (n: number): string => TAGS_1938[n - 1] ?? `#${n}`;

function pick(world: World, fleets: number[], nation: number): { id: number; d: number } {
  const c = world.formations.cols;
  const held = fleets.filter((o) => world.formations.has(o) && c.engaged[o] === 1);
  let best = 0;
  let bd = Infinity;
  world.formations.forEach((f) => {
    if (c.engaged[f] !== 1 || !world.wars.atWar(c.nation[f]!, nation)) return;
    for (const o of held) {
      const d = (c.x[f]! - c.x[o]!) ** 2 + (c.y[f]! - c.y[o]!) ** 2;
      if (d < bd || (d === bd && f < best)) [bd, best] = [d, f];
    }
  });
  return { id: best, d: Math.sqrt(bd) };
}

let heldHours = 0;
const flags: Record<string, number> = { notFleet: 0, nameNotNear: 0, noFoeFleetNear: 0, none: 0 };
const cases: unknown[] = [];
const perLanding = new Map<number, { nation: string; hours: number; named: Set<string>; near: Set<string>; flagged: number }>();
const hours = Math.round(years * 365 * 24);
for (let h = 0; h < hours; h++) {
  sim.step(1, (w) => {
    w.out.events.length = 0;
    w.out.fires.length = 0;
    const c = w.formations.cols;
    for (const l of w.landings.values()) {
      if (l.state !== LandingState.sailing) continue;
      const eng = l.fleets.filter((o) => w.formations.has(o) && c.engaged[o] === 1);
      if (eng.length === 0) continue;
      heldHours++;
      const by = heldBy(w, l);
      const p = pick(w, l.fleets, l.nation);
      const near = new Set<string>();
      w.formations.forEach((f) => {
        if (!w.isFleet(f) || c.engaged[f] !== 1 || !w.wars.atWar(c.nation[f]!, l.nation)) return;
        for (const o of eng) if (Math.hypot(c.x[f]! - c.x[o]!, c.y[f]! - c.y[o]!) <= SEE) near.add(tag(c.nation[f]!));
      });
      const named = by === 0 ? '' : tag(by);
      const flag: string[] = [];
      if (by === 0) flag.push('none');
      else {
        if (!w.isFleet(p.id)) flag.push('notFleet');
        if (!near.has(named)) flag.push('nameNotNear');
      }
      if (near.size === 0) flag.push('noFoeFleetNear');
      for (const f of flag) flags[f]!++;
      let pl = perLanding.get(l.id);
      if (!pl) perLanding.set(l.id, (pl = { nation: tag(l.nation), hours: 0, named: new Set(), near: new Set(), flagged: 0 }));
      pl.hours++;
      if (named) pl.named.add(named);
      for (const n of near) pl.near.add(n);
      if (flag.length) pl.flagged++;
      if (flag.length && cases.length < 60) {
        const o = eng[0]!;
        cases.push({ t: w.tick, landing: l.id, nation: tag(l.nation), group: o, at: [Math.round(c.x[o]! * 10) / 10, Math.round(c.y[o]! * 10) / 10], named, namedId: p.id, namedIsFleet: p.id ? w.isFleet(p.id) : null, namedAt: p.id ? [Math.round(c.x[p.id]! * 10) / 10, Math.round(c.y[p.id]! * 10) / 10] : null, namedCells: Math.round(p.d * 10) / 10, foeFleetsNear: [...near], flag });
      }
    }
  });
}
const landings = [...perLanding.entries()].map(([id, v]) => ({ id, nation: v.nation, hours: v.hours, named: [...v.named], near: [...v.near], flaggedHours: v.flagged }));
writeFileSync(outPath, JSON.stringify({ seed, diplomacy, years, SEE, heldHours, flags, landings, cases }, null, 1));
process.stdout.write(`seed ${seed} ${diplomacy} ${years} y: ${heldHours} held landing-hours over ${landings.length} landings; flags ${JSON.stringify(flags)}\ndone:\n`);
