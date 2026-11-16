/**
 * ROADMAP R98a: where two nations' armies stand in the days after a war between them is declared by hand
 * (God Mode's `declareWar` on the first day of the 1938 world): how much of each is at their front, how much at
 * another front, how much on the march, and how much stands far from every front and still.
 *
 * Usage: npx tsx tools/diag/frontArrivals.ts <seed> <ATT,DEF> [days = 30] [THIRD]
 * `THIRD`: a nation that joins the war (France, for Germany's on Poland): the attacker's front with it too, both ways.
 *
 * A line a day for each of the two: its men (land formations); the share within NEAR_CELLS (300 km) of its
 * border with the other; the share within NEAR_CELLS of a border with another nation it is at war with ("else");
 * the share of the rest on the march; the share of the rest standing ("idle"); and the cells of the other's land
 * it holds.
 */
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../headless/assets';

const NEAR_CELLS = 15;
const seed = Number(process.argv[2] ?? 1938);
const [A, D] = (process.argv[3] ?? 'GER,POL').split(',').map((t) => TAGS_1938.indexOf(t) + 1) as [number, number];
const days = Number(process.argv[4] ?? 30);
const THIRD = process.argv[5] ? TAGS_1938.indexOf(process.argv[5]) + 1 : 0;
const tag = (n: number): string => TAGS_1938[n - 1] ?? `#${n}`;
const { w: W, h: H } = SIZE_1938;
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(W) });
const w = s.world;
s.command({ kind: 'declareWar', attacker: A, defender: D });

/** The cells within NEAR_CELLS of a border of `a` with a nation `foe` accepts. */
function zone(a: number, foe: (n: number) => boolean): Uint8Array {
  const c = w.cells.controller;
  const near = new Uint8Array(W * H);
  for (let y = 0; y < H - 1; y++) {
    for (let x = 0; x < W; x++) {
      const here = c[y * W + x]!;
      const east = c[y * W + ((x + 1) % W)]!;
      const south = c[(y + 1) * W + x]!;
      if (!((here === a && (foe(east) || foe(south))) || (foe(here) && (east === a || south === a)))) continue;
      for (let dy = -NEAR_CELLS; dy <= NEAR_CELLS; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        for (let dx = -NEAR_CELLS; dx <= NEAR_CELLS; dx++) near[yy * W + ((x + dx + W) % W)] = 1;
      }
    }
  }
  return near;
}

function line(day: number, n: number, other: number): string {
  const here = zone(n, (m) => m === other);
  const elsewhere = zone(n, (m) => m !== 0 && m !== other && m !== n && w.wars.atWar(n, m));
  const f = w.formations.cols;
  let [men, at, other2, march, idle, count, idleCount] = [0, 0, 0, 0, 0, 0, 0];
  w.formations.forEach((id) => {
    if (f.nation[id] !== n || w.isFleet(id) || w.isWing(id)) return;
    const m = f.strength[id]!;
    const c = Math.floor(f.y[id]!) * W + (((Math.floor(f.x[id]!) % W) + W) % W);
    men += m;
    count++;
    if (here[c]) at += m;
    else if (elsewhere[c]) other2 += m;
    else if (f.moving[id] === 1) march += m;
    else {
      idle += m;
      idleCount++;
    }
  });
  let holds = 0;
  const { owner, controller } = w.cells;
  for (let i = 0; i < owner.length; i++) if (owner[i] === other && controller[i] === n) holds++;
  const pc = (x: number): string => `${Math.round((100 * x) / Math.max(1, men))} %`.padStart(5);
  const foes = new Set<string>();
  for (const war of w.wars.list) for (const side of [0, 1] as const) if (war.sides[side].includes(n)) for (const m of war.sides[1 - side]!) foes.add(tag(m));
  return `day ${String(day).padStart(2)} ${tag(n)}: ${String(Math.round(men / 1000)).padStart(4)}k men in ${String(count).padStart(3)}; at the ${tag(other)} front ${pc(at)}, at another ${pc(other2)}, marching ${pc(march)}, idle ${pc(idle)} (${idleCount}); holds ${String(holds).padStart(3)} of ${tag(other)}'s cells; at war with ${[...foes].join(' ')}`;
}

for (let day = 0; day <= days; day++) {
  if (day > 0) {
    s.step(24, (ww) => {
      ww.out.events.length = 0;
      ww.out.fires.length = 0;
    });
  } else s.step(1);
  if (day <= 3 || day % 2 === 1 || day === days) {
    console.log(line(day, A, D));
    console.log(line(day, D, A));
    if (THIRD > 0) {
      console.log(line(day, A, THIRD));
      console.log(line(day, THIRD, A));
    }
  }
}
console.log('done:');
