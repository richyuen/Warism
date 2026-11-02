/**
 * PLAN 7.189 (R25-B1, the critic's EXIT and COBEL): a nation leaves a war by declaring on its
 * partner in it. Germany declares on Poland on day 1. EXIT: on day 45 Poland declares (the
 * player's way, `forceWar`) on France, its partner; COBEL: on day 61 Germany on Italy, its partner.
 * Each an hour later: whether the old war is still on, the cells held both ways, and whether the
 * partners went to war.
 *
 * Usage: npx tsx tools/diag/partnerExit.ts [seed …]
 */
import { SIZE_1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';

const id = (t: string): number => NATIONS_1938.findIndex((n) => n.tag === t) + 1;
const [GER, POL, FRA, ITA] = ['GER', 'POL', 'FRA', 'ITA'].map(id) as [number, number, number, number];
const step = (s: Sim, h: number): void =>
  s.step(h, (w) => {
    w.out.events.length = 0;
    w.out.fires.length = 0;
  });
const held = (s: Sim, a: number, b: number): number => {
  const { owner, controller } = s.world.cells;
  let n = 0;
  for (let c = 0; c < owner.length; c++) if ((controller[c] === a && owner[c] === b) || (controller[c] === b && owner[c] === a)) n++;
  return n;
};

const run = (seed: number, day: number, attacker: number, partner: number, enemy: number): string => {
  const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w) });
  step(s, 24);
  s.command({ kind: 'declareWar', attacker: GER, defender: POL });
  step(s, 24 * (day - 1));
  const w = s.world;
  const before = { war: w.wars.atWar(attacker, enemy), held: held(s, attacker, enemy) };
  s.command({ kind: 'forceWar', attacker, defender: partner });
  step(s, 1);
  const after = { war: w.wars.atWar(attacker, enemy), held: held(s, attacker, enemy), partners: w.wars.atWar(attacker, partner) };
  const left = before.war && !after.war;
  return `${left ? 'LEFT' : 'kept'} — ${NATIONS_1938[attacker - 1]!.tag} on ${NATIONS_1938[partner - 1]!.tag}, day ${day}: at war with ${NATIONS_1938[enemy - 1]!.tag} ${before.war} → ${after.war}, held ${before.held} → ${after.held}, at war with the partner ${after.partners}`;
};

const seeds = process.argv.slice(2).map(Number);
for (const seed of seeds.length > 0 ? seeds : [7019, 2531, 8467]) {
  console.log(`seed ${seed} EXIT: ${run(seed, 45, POL, FRA, GER)}`);
  console.log(`seed ${seed} COBEL: ${run(seed, 61, GER, ITA, POL)}`);
}
console.log('done:');
