// Critic run 91 (new): why a few-nation world at peace reads "At peace for now" (no reason) day after day. A random world
// of N nations, SEED, Y years; every EVERY days at peace, `peaceWhy` read, and for each realm the R219 causes asked as
// peaceWhy asks them: a transport group at a port, a sea power ordering one at peace (`landlessPowers`), a transport in
// production, a fleet with room at sea. Prints a line per sample and, at the end, how many samples each realm had each.
// Usage: npx tsx critic/scripts/c91_forNowWhy.ts <N> <SEED> [Y=10] [EVERY=90]
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { peaceWhy } from '../../src/sim/ai/peaceWhy';
import { transportGroupsAtPort, transportRoom } from '../../src/sim/systems/amphibious';
import { landlessPowers } from '../../src/sim/ai/economic';
import { loadAssets1938 } from '../../tools/headless/assets';
const [N, SEED, Y = 10, EVERY = 90] = process.argv.slice(2).map(Number);
const assets = loadAssets1938(SIZE_1938.w);
const clear = (w: Sim['world']): void => { w.out.events.length = 0; w.out.fires.length = 0; };
const sim = new Sim({ scenario: 'random', seed: SEED!, assets, options: { nations: N! } });
const tally = new Map<string, number>();
let samples = 0, forNow = 0;
for (let d = 0; d < Y! * 365; d++) {
  const w = sim.world;
  if (d % EVERY! === 0 && w.wars.size === 0) {
    const p = peaceWhy(w);
    samples++;
    if (p && !p.why) forNow++;
    const landless = landlessPowers(w);
    const parts: string[] = [];
    w.nations.forEach((n) => {
      if (w.nations.cols.living[n] !== 1 || w.nations.cols.overlord[n] !== 0) return;
      const atPort = transportGroupsAtPort(w, n).length;
      let building = 0;
      w.production.forEach((id) => {
        if (w.production.cols.nation[id] !== n) return;
        if (w.rules?.templates[w.production.cols.template[id]!]?.elements.some((e) => w.rules!.units[e.unit]?.cls === 'tp')) building++;
      });
      let room = 0;
      w.formations.forEach((id) => { if (w.formations.cols.nation[id] === n && w.isFleet(id) && transportRoom(w, id) > 0) room++; });
      const coming = atPort === 0 && (landless.has(n) || building > 0 || room > 0);
      parts.push(`${n}:port${atPort} landless${landless.has(n) ? 1 : 0} build${building} room${room}${coming ? ' COMING' : ''}`);
      if (p && !p.why) {
        const k = `${n} ${coming ? 'lift coming' : 'other (truce or chosen)'}`;
        tally.set(k, (tally.get(k) ?? 0) + 1);
      }
    });
    console.log(`day ${d}: ${p ? (p.why ? 'reasons ' + p.rows.map((r) => `${r.n}:${r.reason}`).join(',') : 'for now') : 'no line'} | ${parts.join(' | ')}`);
  }
  sim.step(24, clear);
}
console.log(`seed ${SEED} n ${N}: samples at peace ${samples}, "for now" ${forNow}; per realm on those: ${JSON.stringify(Object.fromEntries(tally))}; wars now ${sim.world.wars.size}`);
console.log('done:');
