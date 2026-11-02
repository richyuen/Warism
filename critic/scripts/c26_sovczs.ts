// Critic run 24: the Soviet guarantee of Czechoslovakia at day 30 of the scenario's diplomacy: which war sets the guarantor on the other side?
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const seed = Number(process.argv[2] ?? 3739);
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w) });
const SOV = 10, CZS = 3;
let seen = false;
for (let d = 1; d <= 60; d++) {
  s.step(24, (w) => { w.out.events.length = 0; w.out.fires.length = 0; });
  const w = s.world;
  const g = w.alliances.guarantees.some((x) => x.guarantor === SOV && x.target === CZS);
  const ws = w.wars.list.filter((x) => (x.sides[0].includes(SOV) && x.sides[1].includes(CZS)) || (x.sides[1].includes(SOV) && x.sides[0].includes(CZS)));
  if (ws.length && !seen) { seen = true; console.log(`day ${d} guarantee ${g}`, JSON.stringify(ws.map((x) => ({ id: x.id, start: x.startTick / 24, a: x.sides[0].map(tag), d: x.sides[1].map(tag) })))); console.log('CZS alliance', JSON.stringify(w.alliances.list.filter((a) => a.members.includes(CZS) || a.members.includes(SOV)).map((a) => [tag(a.leader), a.members.map(tag)]))); console.log('CZS overlord', tag(w.nations.cols.overlord[CZS]!), 'living', w.nations.cols.living[CZS]); }
  if (seen && !ws.length) { console.log(`day ${d}: no longer; guarantee ${g}`); break; }
}
console.log('done:');
