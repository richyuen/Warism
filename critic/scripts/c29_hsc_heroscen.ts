// Critic run 29 (R5a, heroes), HSC: a scenario exported from a heroes game (Sim.exportScenario), loaded into a game
// started with heroes off: are the heroes there, does a lost one still return? And the reverse (no heroes into on).
// Usage: npx tsx critic/scripts/c29_hsc_heroscen.ts <seed>
import { size1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
const seed = Number(process.argv[2] ?? 4111);
const A = loadAssets1938(size1938().w);
const on = new Sim({ scenario: '1938', seed, assets: A, options: { heroes: 'on' } });
on.step(2500, (w) => { w.out.events.length = 0; w.out.fires.length = 0; });
const bytes = (on as unknown as { exportScenario(): { bytes: Uint8Array } }).exportScenario().bytes;
const off = new Sim({ scenario: '1938', seed: seed + 1, assets: A });
off.load(bytes);
const r1 = { heroesAlive: off.world.heroes.size, roster: off.world.heroRoster.length, returns: off.world.heroReturn.size };
off.step(1500, (w) => { w.out.events.length = 0; w.out.fires.length = 0; });
const r2 = { heroesAlive: off.world.heroes.size, returns: off.world.heroReturn.size };
const plain = new Sim({ scenario: '1938', seed, assets: A });
const on2 = new Sim({ scenario: '1938', seed, assets: A, options: { heroes: 'on' } });
on2.load((plain as unknown as { exportScenario(): { bytes: Uint8Array } }).exportScenario().bytes);
console.log(JSON.stringify({ intoOff: r1, after1500h: r2, plainIntoOn: { heroes: on2.world.heroes.size, roster: on2.world.heroRoster.length } }));
console.log('done:');
