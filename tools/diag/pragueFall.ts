/**
 * ROADMAP R102: Germany's war on Czechoslovakia by God Mode on the first day (the scene of
 * `tests/unit/nukeMeansLost1938.test.ts`, without its bomber): when Prague falls, and where Germany's army is
 * meanwhile. On seed 5309 it no longer fell in 300 days after ROADMAP R97b.
 *
 * Usage: npx tsx tools/diag/pragueFall.ts <seed> [days = 120] [--no-massing] [--invaded W]
 * `--no-massing`: the wars declared as before ROADMAP R97b. `--invaded W`: W for the operational AI's INVADED_WEIGHT.
 *
 * A line every ten days: who holds Prague; Germany's men (land formations) and the share of them within 300 km of
 * its border with Czechoslovakia; the cells each holds of the other's land; and whom Germany is at war with.
 */
import { MASS_PROBE } from '../../src/sim/ai/massing';
import { SHIFT_PROBE } from '../../src/sim/ai/operational';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../headless/assets';

const NEAR_CELLS = 15;
const off = process.argv.indexOf('--no-massing');
if (off >= 0) {
  process.argv.splice(off, 1);
  MASS_PROBE.off = true;
}
const at = process.argv.indexOf('--invaded');
if (at >= 0) SHIFT_PROBE.weight = Number(process.argv.splice(at, 2)[1]);
const seed = Number(process.argv[2] ?? 5309);
const days = Number(process.argv[3] ?? 120);
const [GER, CZS] = ['GER', 'CZS'].map((t) => TAGS_1938.indexOf(t) + 1) as [number, number];
const tag = (n: number): string => TAGS_1938[n - 1] ?? `#${n}`;
const { w: W, h: H } = SIZE_1938;
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(W) });
const w = s.world;
s.command({ kind: 'declareWar', attacker: GER, defender: CZS });
const prague = Math.floor(w.nations.cols.capitalY[CZS]!) * W + Math.floor(w.nations.cols.capitalX[CZS]!);

function line(day: number): string {
  const c = w.cells.controller;
  const near = new Uint8Array(W * H);
  for (let y = 0; y < H - 1; y++) {
    for (let x = 0; x < W; x++) {
      const here = c[y * W + x]!;
      const east = c[y * W + ((x + 1) % W)]!;
      const south = c[(y + 1) * W + x]!;
      if (!((here === GER && (east === CZS || south === CZS)) || (here === CZS && (east === GER || south === GER)))) continue;
      for (let dy = -NEAR_CELLS; dy <= NEAR_CELLS; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        for (let dx = -NEAR_CELLS; dx <= NEAR_CELLS; dx++) near[yy * W + ((x + dx + W) % W)] = 1;
      }
    }
  }
  const f = w.formations.cols;
  let [men, there, czech] = [0, 0, 0];
  w.formations.forEach((id) => {
    if (w.isFleet(id) || w.isWing(id)) return;
    const m = f.strength[id]!;
    if (f.nation[id] === CZS) czech += m;
    if (f.nation[id] !== GER) return;
    men += m;
    if (near[Math.floor(f.y[id]!) * W + (((Math.floor(f.x[id]!) % W) + W) % W)]) there += m;
  });
  let [gerHolds, czsHolds] = [0, 0];
  const { owner, controller } = w.cells;
  for (let i = 0; i < owner.length; i++) {
    if (owner[i] === CZS && controller[i] === GER) gerHolds++;
    if (owner[i] === GER && controller[i] === CZS) czsHolds++;
  }
  const foes = new Set<string>();
  for (const war of w.wars.list) for (const side of [0, 1] as const) if (war.sides[side].includes(GER)) for (const m of war.sides[1 - side]!) foes.add(tag(m));
  return `day ${String(day).padStart(3)}: Prague ${tag(c[prague]!)}; GER ${Math.round(men / 1000)}k men, ${Math.round((100 * there) / Math.max(1, men))} % at the Czech front; CZS ${Math.round(czech / 1000)}k; GER holds ${gerHolds} Czech cells, CZS ${czsHolds} German; GER at war with ${[...foes].join(' ') || 'none'}`;
}

let fell = -1;
for (let day = 1; day <= days; day++) {
  s.step(24, (ww) => {
    ww.out.events.length = 0;
    ww.out.fires.length = 0;
  });
  if (fell < 0 && w.cells.controller[prague] === GER) fell = day;
  if (day === 1 || day % 10 === 0 || day === fell) console.log(line(day));
}
console.log(`seed ${seed}: Prague ${fell < 0 ? `not taken in ${days} days` : `taken on day ${fell}`}`);
console.log('done:');
