import { describe, expect, it } from 'vitest';
import { ATLAS_FRAMES } from '../../src/render/units/atlas';
import { BALL_QUAD, BALL_QUAD_MAX, BALL_R, BallClass, ballClassOf, BallState, GUN_BARREL, HURT_AT, HURT_SHIFT, hurtLevel, GUN_WHEEL, HELMET_AT, HELMET_BRIM_X, HELMET_BRIM_Y, HELMET_FLAG_TOP, HELMET_R, flagUv, propPoint, SHIP_HULL, TREADS, TURRET_BARREL_HALF, TURRET_BARREL_LEN, WINGS } from '../../src/render/units/ballShader';
import { Frame, isShipFrame } from '../../src/shared/unitLooks';

// PLAN 7.174d (ADR-777): what each frame's ball wears, and a quad that holds it.

describe('the countryballs\' props (PLAN 7.174d)', () => {
  it('gives every frame a class: men a helmet, hulls treads, turrets a barrel, ships a hull', () => {
    for (let f = 0; f < ATLAS_FRAMES; f++) {
      const c = ballClassOf(f);
      if (isShipFrame(f)) expect(c, `frame ${f}`).toBe(BallClass.ship);
    }
    expect(ballClassOf(Frame.infantry)).toBe(BallClass.infantry);
    expect(ballClassOf(Frame.prone)).toBe(BallClass.infantry);
    expect(ballClassOf(Frame.tankHeavy)).toBe(BallClass.tank);
    expect(ballClassOf(Frame.tankSmall)).toBe(BallClass.tank);
    expect(ballClassOf(Frame.halftrack)).toBe(BallClass.carrier);
    expect(ballClassOf(Frame.gun)).toBe(BallClass.gun);
    expect(ballClassOf(Frame.aircraft)).toBe(BallClass.aircraft);
    expect(ballClassOf(Frame.turretMedium)).toBe(BallClass.turret);
    expect(ballClassOf(Frame.wake)).toBe(BallClass.none);
  });

  it('draws each class in a quad that holds its props, and no larger than it needs', () => {
    // How far each class's props reach from the middle, ball units, along x or y.
    const reach: Record<number, number> = {
      [BallClass.infantry]: Math.max(-(HELMET_AT[1] - HELMET_R[1]), HELMET_BRIM_X + 0.05),
      [BallClass.tank]: Math.max(TREADS.x, TREADS.bottom),
      [BallClass.carrier]: Math.max(TREADS.x, TREADS.bottom),
      [BallClass.gun]: Math.max(GUN_BARREL.to[0] + GUN_BARREL.half, GUN_WHEEL.at[1] + GUN_WHEEL.r),
      [BallClass.ship]: Math.max(SHIP_HULL.bowDeck, -SHIP_HULL.sternDeck, SHIP_HULL.keel),
      [BallClass.aircraft]: WINGS.rx,
      [BallClass.turret]: TURRET_BARREL_LEN + TURRET_BARREL_HALF,
      [BallClass.none]: BALL_R,
    };
    for (const [c, r] of Object.entries(reach)) {
      const quad = BALL_QUAD[Number(c)]!;
      expect(quad, `class ${c}: holds ${r.toFixed(2)} and its outline`).toBeGreaterThanOrEqual(r + 0.05);
      expect(quad, `class ${c}: not much more`).toBeLessThanOrEqual(r + 0.25);
      expect(quad).toBeLessThanOrEqual(BALL_QUAD_MAX);
    }
  });

  it('puts each prop\'s test point inside its quad and out of the eyes\' way', () => {
    for (const c of [BallClass.infantry, BallClass.tank, BallClass.gun, BallClass.ship, BallClass.aircraft, BallClass.turret]) {
      for (const facing of [0, Math.PI, 0.7, -2.4]) {
        const pt = propPoint(c, facing)!;
        expect(Math.max(Math.abs(pt.p[0]), Math.abs(pt.p[1])), `class ${c} at ${facing}`).toBeLessThan(BALL_QUAD[c]!);
      }
    }
    expect(propPoint(BallClass.none, 0)).toBeNull();
  });
});

// PLAN 7.178: a ball's losses, by the share of its men left; the level's bits clear of the face's.
describe('hurtLevel', () => {
  it('is 0 whole, then 1, 2, 3 at 3/4, 1/2 and 1/4 of its men', () => {
    expect(hurtLevel(500, 500)).toBe(0);
    expect(hurtLevel(376, 500)).toBe(0);
    expect(hurtLevel(375, 500)).toBe(1);
    expect(hurtLevel(251, 500)).toBe(1);
    expect(hurtLevel(250, 500)).toBe(2);
    expect(hurtLevel(126, 500)).toBe(2);
    expect(hurtLevel(125, 500)).toBe(3);
    expect(hurtLevel(1, 500)).toBe(3);
    expect(hurtLevel(3, 0), 'a size not known: whole').toBe(0);
    expect(HURT_AT).toEqual([0.75, 0.5, 0.25]);
  });
  it('sits above the engaged and hit bits', () => {
    expect((BallState.engaged | BallState.hit) >> HURT_SHIFT).toBe(0);
    expect(((3 << HURT_SHIFT) | BallState.hit) >> HURT_SHIFT).toBe(3);
  });
});

describe('flagUv (PLAN 7.179, critic R22-B1)', () => {
  it('is the disc\'s square with no helmet', () => {
    expect(flagUv(0, 0, 0)).toEqual([0.5, 0.5]);
    expect(flagUv(-BALL_R, -BALL_R, 0)).toEqual([0, 0]);
  });
  it('puts the whole flag below the brim under a helmet: its top row at the brim\'s lower edge, its last at the bottom', () => {
    expect(HELMET_FLAG_TOP).toBeGreaterThan(HELMET_BRIM_Y);
    expect(flagUv(0, HELMET_FLAG_TOP, 1)[1]).toBe(0);
    expect(flagUv(0, BALL_R, 1)[1]).toBe(1);
    // A top stripe of a third (Germany's black) is seen below the brim, not under it.
    const yThird = HELMET_FLAG_TOP + (BALL_R - HELMET_FLAG_TOP) / 3;
    expect(yThird).toBeGreaterThan(HELMET_FLAG_TOP);
    expect(flagUv(0, yThird - 0.01, 1)[1]).toBeLessThan(1 / 3);
    // Half faded, half way between.
    const [, a] = flagUv(0, 0.2, 0);
    const [, b] = flagUv(0, 0.2, 1);
    expect(flagUv(0, 0.2, 0.5)[1]).toBeCloseTo((a + b) / 2, 10);
  });
});
