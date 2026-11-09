import { describe, expect, it } from 'vitest';
import { LandingState, landingOfDivision } from '../../src/sim/systems/landings';
import { nearestDivisions, RowRun } from '../helpers/landingRows';
import { nationId } from '../helpers/sim1938';

// ROADMAP R55a (critic run 56, R56-B1): Italy (27125), the six divisions nearest Rome sent to Valletta; at h60 four
// sail and two are told there is no room, "they come back for it". A cancel at h66 turned the four back, but 324,
// standing on Rome's port cell, stayed in the landing to the end of the run, "turning back to Rome", under "they come
// back for it"; a later click of the two to Valletta was swallowed. A landing turned back keeps only those aboard: one
// ashore leaves it by its order (or the cancel's "stop where you stand"), and a returning landing is not joined.

const ITA = nationId('ITA');
const ENG = nationId('ENG');
const ROME: [number, number] = [1095.5, 344.5];
const VALLETTA: [number, number] = [1106.5, 383.5];

function six(): { r: RowRun; ids: number[]; left: number[] } {
  const r = new RowRun(27125, ITA);
  r.cmds([{ kind: 'declareWar', attacker: ITA, defender: ENG }]);
  r.step();
  const ids = nearestDivisions(r.world, ITA, ROME, 6);
  r.ids = ids;
  for (const id of ids) r.cmds([{ kind: 'moveFormation', id, x: VALLETTA[0], y: VALLETTA[1], nation: ITA }]);
  for (let h = 1; h < 66; h++) r.step();
  const w = r.world;
  const l = landingOfDivision(w, ids.find((id) => w.embarked.has(id))!)!;
  expect(l.state, 'the four at sea').toBe(LandingState.sailing);
  const left = ids.filter((id) => !w.embarked.has(id) && landingOfDivision(w, id) === l);
  expect(left.length, 'some left at the port for the next voyage').toBeGreaterThan(0);
  return { r, ids, left };
}

describe('a landing turned back keeps only those aboard (ROADMAP R55a)', () => {
  it('Cancel at h66: those left at the port leave the landing at once and stand; the row ends cancelled', () => {
    const { r, ids, left } = six();
    const w = r.world;
    const row = r.rows.find((x) => x.divisions.some((d) => d.id === left[0]))!;
    const at = left.map((id) => [w.formations.cols.x[id], w.formations.cols.y[id]]);
    r.s.handle({ type: 'cancelLanding', id: row.id }, 0);
    r.step();
    for (const id of left) expect(landingOfDivision(w, id), `${id} out of the landing`).toBeUndefined();
    // Stood: in its own cell (an order to where it stands takes it to the cell's middle); later the AI has it (ADR-875).
    left.forEach((id, i) => expect([Math.floor(w.formations.cols.x[id]!), Math.floor(w.formations.cols.y[id]!)], `${id} stood`).toEqual(at[i]!.map((v) => Math.floor(v!))));
    for (let h = 0; h < 72; h++) r.step();
    for (const id of ids) expect(landingOfDivision(w, id), `${id}`).toBeUndefined();
    const end = r.rows.find((x) => x.id === row.id);
    expect(end?.outcome?.kind ?? 'gone').toMatch(/cancelled|gone/);
    expect(r.broken).toEqual([]);
  });

  it('all six clicked home at h66, then those left clicked to Valletta: a new landing, not swallowed', () => {
    const { r, ids, left } = six();
    const w = r.world;
    r.cmds(ids.map((id) => ({ kind: 'moveFormation' as const, id, x: ROME[0], y: ROME[1], nation: ITA })));
    for (let h = 0; h < 12; h++) r.step();
    for (const id of left) expect(landingOfDivision(w, id)?.state ?? -1, `${id} not in the returning landing`).not.toBe(LandingState.returning);
    for (let h = 0; h < 120; h++) r.step();
    r.cmds(left.map((id) => ({ kind: 'moveFormation' as const, id, x: VALLETTA[0], y: VALLETTA[1], nation: ITA })));
    r.step();
    const now = left.map((id) => landingOfDivision(w, id));
    for (const l of now) expect(l?.state, 'in a landing gathering for Valletta').toBe(LandingState.gathering);
  });
});
