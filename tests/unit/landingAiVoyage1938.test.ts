import { describe, expect, it } from 'vitest';
import type { FormationDetail } from '../../src/shared/protocol';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { landingOfDivision } from '../../src/sim/systems/landings';
import type { World } from '../../src/sim/world';
import { voyageText } from '../../src/ui/voyageText';
import { RowRun, nearestDivisions } from '../helpers/landingRows';
import { nationId } from '../helpers/sim1938';

// ROADMAP R48b (critic run 51, R51-N2): on 20661 Japan's two divisions nearest Tokyo, sent to Shanghai and cancelled at
// hour 26, are the AI's again (ADR-759); the AI ships one off on a landing of its own, and its panel said "At sea, bound
// for its landing" with no row in "Your landings". Each hour one of them is on a voyage in no landing of the player's,
// its panel says the AI's (`ai`, "the AI's landing (not one of yours)"); in one of the player's, never.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');

describe("a division on the AI's voyage says so (ROADMAP R48b)", () => {
  it('20661: cancelled at hour 26, shipped by the AI within 10 days; its panel says the AI\'s landing', { timeout: 240_000 }, () => {
    const r = new RowRun(20661, JAP);
    r.step();
    r.cmds([{ kind: 'declareWar', attacker: JAP, defender: CHI }]);
    r.step();
    const w: World = r.world;
    const two = nearestDivisions(w, JAP, cellOf(139.69, 35.69, W, H) as [number, number], 2);
    r.ids = two;
    const to = cellOf(121.47, 31.23, W, H);
    r.cmds(two.map((id) => ({ kind: 'moveFormation' as const, id, x: Math.floor(to[0]) + 0.5, y: Math.floor(to[1]) + 0.5, nation: JAP, escort: true })));
    for (let h = 0; h < 26; h++) r.step();
    const row = r.rows.find((x) => x.state !== 'over')!;
    expect(row, 'its landing').toBeDefined();
    r.s.handle({ type: 'cancelLanding', id: row.id }, 0);
    let aiVoyage = 0;
    for (let h = 0; h < 240; h++) {
      r.step();
      for (const id of two) {
        if (!w.formations.has(id)) continue;
        const v = r.panel(id) as FormationDetail['voyage'];
        const mine = landingOfDivision(w, id) !== undefined;
        if (!mine && (w.embarked.has(id) || w.seaBound.has(id))) {
          aiVoyage++;
          expect(v?.ai, `t${w.tick} ${id} on the AI's voyage`).toBe(true);
          expect(voyageText(v!), `t${w.tick} ${id}`).toContain("the AI's landing");
        }
        if (mine) expect(v?.ai, `t${w.tick} ${id} in the player's landing`).toBeUndefined();
      }
    }
    expect(aiVoyage, "hours on the AI's voyage seen").toBeGreaterThan(0);
    expect(r.broken).toEqual([]);
  });
});
