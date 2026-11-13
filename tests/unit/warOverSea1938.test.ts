import { describe, expect, it } from 'vitest';
import { DECLARE_AT, RESTLESS, SEA_REACH_KM, WORLD_POWERS, greatPowers, neighbourMap, seaPowers, seaTargets, sides, strengths, warTarget, warUtility, worldPowers } from '../../src/sim/ai/strategic';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { destroyFormation } from '../../src/sim/systems/elements';
import { transportRoom } from '../../src/sim/systems/amphibious';
import { whyNotWar } from '../../src/sim/systems/war';
import { Refusal } from '../../src/shared/commands';
import { portSeaOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// PLAN 7.82d (ADR-670): the war choice looked at land neighbours alone, so a nation overseas with
// none over the bar was never a war's target (seed 845, years 8–26: the United States, its puppet
// Canada and Denmark's Greenland at peace for 19 years, fixed to 2 % of their cells, while the
// Soviet Union, its transports at its ports on their water, scored 1.0–1.7 on them). With no land
// target over DECLARE_AT, a nation takes the best of those it could land on (`seaTargets`).
// The United Kingdom, its one transport group at Glasgow's water: Iceland lies across the sea.

const { w: W } = SIZE_1938;
const id = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
const ENG = id('ENG');
const ICE = id('ICE');

describe('a war across the sea (PLAN 7.82d)', () => {
  it('with no land target over the bar, the best of the nations it could land on; none without transports at a port', () => {
    const s = new Sim({ scenario: '1938', seed: 4601, assets: assets1938(W) });
    const w = s.world;
    const c = w.formations.cols;
    const nc = w.nations.cols;
    const water = portSeaOf(w);
    const glasgow = w.ports.findIndex((p) => p.name === 'Glasgow');
    expect(glasgow).toBeGreaterThanOrEqual(0);
    const sea = water[glasgow]!;
    // One British transport group, standing at Glasgow's water; the others gone.
    const groups: number[] = [];
    w.formations.forEach((f) => {
      if (w.isFleet(f) && c.nation[f] === ENG && transportRoom(w, f) > 0) groups.push(f);
    });
    expect(groups.length).toBeGreaterThan(0);
    const [tp, ...rest] = groups;
    for (const f of rest) destroyFormation(w, f);
    [c.x[tp!], c.y[tp!]] = [(sea % W) + 0.5, Math.floor(sea / W) + 0.5];
    c.moving[tp!] = 0;
    nc.aggression[ENG] = 100;

    // Iceland is no land neighbour of the United Kingdom, and is one it could land on.
    const land = [...(neighbourMap(w).get(ENG) ?? [])].sort((a, b) => a - b);
    expect(land).not.toContain(ICE);
    const over = seaTargets(w, ENG);
    expect(over).toContain(ICE);
    expect(over).not.toContain(ENG);

    const str = strengths(w);
    const { withAllies, defence } = sides(w, str);
    const attack = withAllies(ENG);
    const u = (t: number): number => warUtility(w, ENG, t, attack, defence(t), 0, RESTLESS).u;
    const valid = (t: number): boolean => whyNotWar(w, ENG, t) === Refusal.None;
    expect(valid(ICE) && u(ICE) > DECLARE_AT).toBe(true);
    // No land target: the sea's best over the bar (the highest utility, the lower id on a tie).
    const best = over.filter(valid).reduce((b, t) => (u(t) > (b === 0 ? DECLARE_AT : u(b)) ? t : b), 0);
    expect(best).not.toBe(0);
    expect(warTarget(w, ENG, [], attack, defence, 0, RESTLESS)).toBe(best);
    // A land target over the bar comes first, though the sea's may score higher.
    if (land.some((t) => valid(t) && u(t) > DECLARE_AT)) expect(land).toContain(warTarget(w, ENG, land, attack, defence, 0, RESTLESS));
    const other = over.find((t) => t !== ICE && valid(t) && u(t) > DECLARE_AT);
    if (other !== undefined) expect(warTarget(w, ENG, [other], attack, defence, 0, RESTLESS)).toBe(other);
    // R74h (ADR-1011): a nation that is no great power lands only within SEA_REACH_KM of its transports. From
    // Glasgow Iceland (1,300 km) is in reach, Japan and Australia are not; a great power reaches them all.
    const near = seaTargets(w, ENG, SEA_REACH_KM);
    expect(near).toContain(ICE);
    expect(over).toContain(id('JAP'));
    expect(near).not.toContain(id('JAP'));
    expect(near).not.toContain(id('AST'));
    expect(near.every((t) => over.includes(t))).toBe(true);
    const all = new Set(over);
    const pickFrom = (powers: ReadonlySet<number>): number => warTarget(w, ENG, [], attack, defence, 0, RESTLESS, new Set(), powers);
    expect(pickFrom(new Set([ENG]))).toBe(best);
    const minor = pickFrom(new Set());
    expect(minor === 0 || (near.includes(minor) && all.has(minor))).toBe(true);
    // The group sails away from the port: nothing across the sea.
    c.moving[tp!] = 1;
    expect(seaTargets(w, ENG)).toEqual([]);
    expect(warTarget(w, ENG, [], attack, defence, 0, RESTLESS)).toBe(0);
  }, 300_000);

  it("the powers who land across any sea: the world's seven and the sea's seven (R76c)", () => {
    // Critic run 66, R66-N3: by `greatPowers` (strength alone) plain 1938 on day 0 left out the United States, and Japan
    // from year 1, its navy the third. The world's measure (strength, income, warheads) names 1938's seven; the navies
    // keep a sea power its economy does not rank.
    const s = new Sim({ scenario: '1938', seed: 7019, assets: assets1938(W) });
    const w = s.world;
    const str = strengths(w);
    expect(greatPowers(w, str).has(id('USA'))).toBe(false);
    const world7 = worldPowers(w, str);
    expect(world7).toHaveLength(WORLD_POWERS);
    expect(new Set(world7)).toEqual(new Set(['USA', 'SOV', 'GER', 'ENG', 'FRA', 'ITA', 'JAP'].map(id)));
    const sea = seaPowers(w, str);
    for (const tag of ['USA', 'JAP', 'ENG']) expect(sea.has(id(tag)), tag).toBe(true);
    // Republican China, its army large and its navy none, is not among them in 1938.
    expect(sea.has(id('CHI'))).toBe(false);
    // A navy alone: Japan with no income and no army is out of the world's seven, and kept by its fleet.
    const jap = id('JAP');
    w.nations.cols.income[jap] = 0;
    const weak = Float64Array.from(str);
    weak[jap] = 0;
    expect(worldPowers(w, weak)).not.toContain(jap);
    expect(seaPowers(w, weak).has(jap)).toBe(true);
    // Puppets are never among them.
    w.nations.forEach((n) => {
      if (sea.has(n)) expect(w.nations.cols.overlord[n]).toBe(0);
    });
  }, 300_000);
});
