import { describe, expect, it } from 'vitest';
import { takerOf, takingAlpha, takingCell, takingGlow, takingProgress, TAKING_ALPHA_MAX, TAKING_ALPHA_MIN, TAKING_GLOW_MAX } from '../../src/render/fx/taking';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { holdHours, takingCells } from '../../src/sim/systems/territory';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R105 (ADR-1096): the cells being taken, for the map's glow. Germany's war on Poland by God Mode, hour by
// hour for five days: each cell told is one whose holder is at war with a holder beside it, its progress is its
// `flip` counter of the hold, and a cell that changes hands was told the hour before with most of its hold done.

const { w: W } = SIZE_1938;
const [GER, POL] = ['GER', 'POL'].map(nationId) as [number, number];

describe('the cells being taken (ROADMAP R105)', () => {
  it("Germany against Poland: the cells told are the front's, by their progress, and those that fall were nearly taken", () => {
    const s = new Sim({ scenario: '1938', seed: 1938, assets: assets1938(W) });
    const w = s.world;
    s.command({ kind: 'declareWar', attacker: GER, defender: POL });
    const hold = holdHours(w);
    let [seen, fell, most] = [0, 0, 0];
    let before = new Map<number, number>();
    for (let h = 0; h < 24 * 5; h++) {
      const ctl = w.cells.controller.slice();
      s.step(1, (x) => {
        x.out.events.length = 0;
        x.out.fires.length = 0;
      });
      // Those that changed hands this hour between the two: told the hour before, with their hold all but done.
      for (let c = 0; c < ctl.length; c++) {
        const [a, b] = [ctl[c]!, w.cells.controller[c]!];
        if (a === b || !((a === GER && b === POL) || (a === POL && b === GER))) continue;
        fell++;
        expect(before.get(c), `cell ${c} fell at hour ${h + 1}: its progress the hour before`).toBeGreaterThanOrEqual(Math.floor((255 * (hold - 4)) / hold));
      }
      const told = takingCells(w);
      expect([...told].sort((x, y) => x - y)).toEqual(told);
      before = new Map();
      for (const packed of told) {
        const [c, p] = [takingCell(packed), takingProgress(packed)];
        before.set(c, p);
        expect(p).toBeGreaterThanOrEqual(1);
        expect(p).toBeLessThanOrEqual(255);
        expect(p, `cell ${c}`).toBe(Math.max(1, Math.min(255, Math.round((255 * w.cells.flip[c]!) / hold))));
        const holder = w.cells.controller[c]!;
        expect(holder).toBeGreaterThan(0);
        if (holder !== GER && holder !== POL) continue;
        seen++;
        most = Math.max(most, p);
        expect([c - 1, c + 1, c - W, c + W].some((k) => w.cells.controller[k] !== 0 && w.wars.atWar(holder, w.cells.controller[k]!)), `cell ${c}: an enemy beside it`).toBe(true);
      }
    }
    process.stderr.write(`five days: ${seen} cell-hours of Germany's and Poland's being taken, ${fell} cells fell, the most progress told ${most}\n`);
    expect(seen).toBeGreaterThan(100);
    expect(fell).toBeGreaterThan(5);
    expect(most).toBeGreaterThan(200);
  }, 240_000);

  it('the glow is faint as a cell begins to be taken and strong as it is about to fall', () => {
    expect(takingAlpha(1)).toBeCloseTo(TAKING_ALPHA_MIN, 1);
    expect(takingAlpha(255)).toBeCloseTo(TAKING_ALPHA_MAX, 6);
    expect(takingAlpha(128)).toBeGreaterThan(takingAlpha(64));
    expect([takingCell(1234 * 256 + 77), takingProgress(1234 * 256 + 77)]).toEqual([1234, 77]);
    expect(takingGlow(255)).toBeCloseTo(TAKING_GLOW_MAX, 6);
    // The taker: the holder beside the cell that is at war with its own; none at peace.
    const holders = [1, 1, 2, 3, 1, 2, 3, 3, 3];
    const war = (a: number, b: number): boolean => (a === 2 && b === 3) || (a === 3 && b === 2);
    expect(takerOf(holders, 3, 5, war)).toBe(3);
    expect(takerOf(holders, 3, 2, war)).toBe(0);
    expect(takerOf(holders, 3, 8, war)).toBe(2);
    expect(takerOf(holders, 3, 0, war)).toBe(0);
    expect(takerOf(holders, 3, 4, war)).toBe(0);
  });
});
