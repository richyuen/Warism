// Critic run 31: the air checker's "wing not at its base" on 3373 random diplomacy, heroes on (worldInvariants day 581,
// 601): at the first such hour, the wing, its carrier fleet (template, place, engaged, a hero?), the heroes near, the
// fleet's last hour. Usage: <seed> <fromDay> <toDay>
import { size1938, NATIONS_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
const [seed, from, to] = [Number(process.argv[2] ?? 3373), Number(process.argv[3] ?? 575), Number(process.argv[4] ?? 605)];
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w), options: { heroes: 'on', diplomacy: 'random' } });
const clear = (w: typeof s.world): void => { w.out.events.length = 0; w.out.fires.length = 0; };
s.step(from * 24, clear);
const tag = (k: number): string => NATIONS_1938[k - 1]?.tag ?? `#${k}`;
let prev = new Map<number, [number, number]>();
let found = 0;
s.step((to - from) * 24, (w) => {
  const fc = w.formations.cols;
  for (const [id, base] of w.wingBase) {
    if (base >= 0 || !w.formations.has(id) || !w.formations.has(-base)) continue;
    const f = -base;
    if ((fc.x[id] !== fc.x[f] || fc.y[id] !== fc.y[f]) && !w.wingFerry.has(id) && found < 4) {
      found++;
      const heroesNear = [...w.heroes.keys()].filter((h) => w.formations.has(h) && Math.hypot(fc.x[h]! - fc.x[f]!, fc.y[h]! - fc.y[f]!) < 3).map((h) => `${h} ${TEMPLATES_1938[fc.template[h]!]?.id} ${tag(fc.nation[h]!)}`);
      console.log(JSON.stringify({ tick: w.tick, day: Math.floor(w.tick / 24), wing: id, nation: tag(fc.nation[id]!), wingAt: [fc.x[id], fc.y[id]], fleet: f, fleetTpl: TEMPLATES_1938[fc.template[f]!]?.id, fleetAt: [fc.x[f], fc.y[f]], fleetPrev: prev.get(f) ?? null, fleetIsHero: w.heroes.has(f), heroesNear, engagedFlag: fc.engaged?.[f] }));
    }
  }
  prev = new Map(); w.formations.forEach((id) => { if (w.isFleet(id)) prev.set(id, [fc.x[id]!, fc.y[id]!]); });
  clear(w);
});
console.log('done:');
