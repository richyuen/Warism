import { describe, expect, it } from 'vitest';
import { firstNotOutnumbered } from '../../src/sim/ai/strategic';
import { LIFT_PROBE, noLift, seaLift, sidesTouch } from '../../src/sim/ai/seaLift';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { callSides } from '../../src/sim/systems/war';
import { navOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R139: a war across the sea is declared only with a lift. On ten seeds of plain 1938, 52 of the 55 wars that ran
// a month with no cell held by either side at day 30 were between leaders with no land border; of the 74 such wars whose
// sides touched nowhere by land, 51 held nothing, and in 33 of those the attacker had, as it declared, under a transport
// group's room of free men that might march to its transports (Japan on Siam, its army on its front in China).

const { w: W } = SIZE_1938;
const id = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;

describe('a war across the sea needs a lift (ROADMAP R139)', () => {
  it('Japan on Siam: refused with its army on its front, declared with a group-room of free men at home', () => {
    const s = new Sim({ scenario: '1938', seed: 4601, assets: assets1938(W) });
    const w = s.world;
    const c = w.formations.cols;
    const nc = w.nations.cols;
    const [JAP, SIA, CHI] = [id('JAP'), id('SIA'), id('CHI')];
    expect(w.wars.atWar(JAP, CHI)).toBe(true);
    // Japan's side touches China's by land; no side Japan's war on Siam would call touches Siam's.
    const war = w.wars.list.find((x) => x.sides[0].includes(JAP) || x.sides[1].includes(JAP))!;
    expect(sidesTouch(w, war.sides[0], war.sides[1])).toBe(true);
    const sides = callSides(w, JAP, SIA);
    expect(sidesTouch(w, sides[0], sides[1])).toBe(false);
    expect(seaLift(w, JAP).room).toBeGreaterThan(0);

    // Its land army all on its front with China: none free, none to lift.
    const { w: CW, h: CH, controller } = w.cells;
    let front = -1;
    for (let k = CW; k < CW * (CH - 1) && front < 0; k++) {
      if (controller[k] === JAP && [k + 1, k - 1, k + CW, k - CW].some((q) => controller[q] === CHI)) front = k;
    }
    expect(front).toBeGreaterThanOrEqual(0);
    const land: number[] = [];
    w.formations.forEach((f) => {
      if (c.nation[f] === JAP && !w.isFleet(f) && !w.isWing(f) && !w.embarked.has(f)) land.push(f);
    });
    for (const f of land) {
      [c.x[f], c.y[f]] = [(front % CW) + 0.5, Math.floor(front / CW) + 0.5];
      c.moving[f] = 0;
    }
    const pick = (refused: ReadonlySet<number>): number => (refused.has(SIA) ? 0 : SIA);
    const across = (): boolean => true;
    expect(seaLift(w, JAP).men).toBe(0);
    expect(noLift(w, JAP, sides)).toBe(true);
    expect(firstNotOutnumbered(w, JAP, pick, across)).toBe(0);
    // Not asked of a target that is no war across the sea.
    expect(firstNotOutnumbered(w, JAP, pick)).toBe(SIA);
    // The probe's switch: as before R139.
    LIFT_PROBE.off = true;
    expect(firstNotOutnumbered(w, JAP, pick, across)).toBe(SIA);
    LIFT_PROBE.off = false;

    // Formations at Tokyo, on the home islands where its transports stand at port, under way: not free.
    const [tx, ty] = [nc.capitalX[JAP]!, nc.capitalY[JAP]!];
    const comp = navOf(w).grid.component;
    expect(comp[Math.floor(ty) * CW + Math.floor(tx)]).not.toBe(comp[front]);
    const { room } = seaLift(w, JAP);
    let men = 0;
    const home: number[] = [];
    for (const f of land) {
      if (men >= room) break;
      [c.x[f], c.y[f]] = [tx, ty];
      men += c.strength[f]!;
      home.push(f);
    }
    for (const f of home) c.moving[f] = 1;
    expect(seaLift(w, JAP).men).toBe(0);
    expect(noLift(w, JAP, sides)).toBe(true);
    // Standing: a group-room of free men that may march to the port. Declared.
    for (const f of home) c.moving[f] = 0;
    expect(seaLift(w, JAP).men).toBe(men);
    expect(men).toBeGreaterThanOrEqual(room);
    expect(noLift(w, JAP, sides)).toBe(false);
    expect(firstNotOutnumbered(w, JAP, pick, across)).toBe(SIA);
    // One formation fewer, under the room: refused again.
    const last = home[home.length - 1]!;
    [c.x[last], c.y[last]] = [(front % CW) + 0.5, Math.floor(front / CW) + 0.5];
    if (men - c.strength[last]! < room) expect(firstNotOutnumbered(w, JAP, pick, across)).toBe(0);
  }, 300_000);
});
