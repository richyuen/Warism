import { describe, expect, it } from 'vitest';
import { advances } from '../../src/shared/advances';
import { ARROW_PALE, OTHER_WIDE, ARROW_LONG_PX, ARROW_MAX_MEN, ARROW_MAX_PX, ARROW_MIN_MEN, ARROW_MIN_PX, ARROW_SHORTEST_PX, ARROW_TAIL, CROSS_GAP_PX, GROUP_START_PX, HEAD_WIDE, arrowFill, arrowOutline, arrowWidth, cutAtCrossing, drawMoveArrows, groupMarches, roundedWay, wayStart, type March } from '../../src/render/units/moveArrows';

// ROADMAP R89a (ADR-1073, ADR-1074): a march is a thick arrow, as wide as its men are many; the
// marches of a nation that start together and head the same way are one arrow.

/** A march of `men` from (x, y) to (tx, ty), cells. */
const march = (id: number, nation: number, men: number, x: number, y: number, tx: number, ty: number): March => ({ id, nation, men, line: [x, y, tx, ty] });

describe('the width of a movement arrow (R89a)', () => {
  it('never narrower for more men, between its least and its most', () => {
    let last = 0;
    for (let men = 0; men <= 2_000_000; men = men < 100 ? men + 7 : Math.ceil(men * 1.07)) {
      const w = arrowWidth(men);
      expect(w, `${men} men`).toBeGreaterThanOrEqual(last);
      expect(w).toBeGreaterThanOrEqual(ARROW_MIN_PX);
      expect(w).toBeLessThanOrEqual(ARROW_MAX_PX);
      last = w;
    }
    expect(arrowWidth(ARROW_MIN_MEN)).toBe(ARROW_MIN_PX);
    expect(arrowWidth(ARROW_MAX_MEN)).toBeCloseTo(ARROW_MAX_PX, 9);
    // Ten times the men is wider by the same step anywhere between the two.
    expect(arrowWidth(40_000) - arrowWidth(4_000)).toBeCloseTo(arrowWidth(200_000) - arrowWidth(20_000), 9);
  });
});

describe('the marches that are one arrow (R89a)', () => {
  // 10 px a cell: marches within 4.4 cells of each other start together.
  const scale = 10;
  const reach = GROUP_START_PX / scale;

  it('two of a nation from one place the same way: one arrow of their men, the stronger its lead', () => {
    const a = groupMarches([march(1, 5, 3_000, 100, 50, 130, 50), march(2, 5, 9_000, 101, 51, 131, 52)], scale);
    expect(a).toHaveLength(1);
    expect(a[0]!.men).toBe(12_000);
    expect(a[0]!.ids).toEqual([2, 1]);
    expect(Array.from(a[0]!.line)).toEqual([101, 51, 131, 52]);
  });

  it('two nations are never one arrow; nor two headings; nor two places', () => {
    expect(groupMarches([march(1, 5, 3_000, 100, 50, 130, 50), march(2, 6, 9_000, 100, 50, 130, 50)], scale)).toHaveLength(2);
    // East and south-east by 45°: two.
    expect(groupMarches([march(1, 5, 3_000, 100, 50, 130, 50), march(2, 5, 9_000, 100, 50, 130, 80)], scale)).toHaveLength(2);
    // East and east by 30°: one.
    expect(groupMarches([march(1, 5, 3_000, 100, 50, 130, 50), march(2, 5, 9_000, 100, 50, 130, 50 + 30 * Math.tan(Math.PI / 6))], scale)).toHaveLength(1);
    // Headings either side of west (±170°) are 20° apart: one.
    const west = (id: number, deg: number): March => march(id, 5, 1_000 * id, 100, 50, 100 + 30 * Math.cos((deg * Math.PI) / 180), 50 + 30 * Math.sin((deg * Math.PI) / 180));
    expect(groupMarches([west(1, 170), west(2, -170)], scale)).toHaveLength(1);
    // Just within reach and just beyond it.
    expect(groupMarches([march(1, 5, 3_000, 100, 50, 130, 50), march(2, 5, 9_000, 100 + reach - 0.01, 50, 130, 50)], scale)).toHaveLength(1);
    expect(groupMarches([march(1, 5, 3_000, 100, 50, 130, 50), march(2, 5, 9_000, 100 + reach + 0.01, 50, 130, 50)], scale)).toHaveLength(2);
  });

  it('the heading is the start of the way, not its far end: two ways that part beyond the arrow are one', () => {
    const long = ARROW_LONG_PX / scale;
    const a: March = { id: 1, nation: 5, men: 4_000, line: [100, 50, 100 + 2 * long, 50, 100 + 2 * long, 10] };
    const b: March = { id: 2, nation: 5, men: 5_000, line: [100, 50, 100 + 2 * long, 50, 100 + 2 * long, 90] };
    expect(groupMarches([a, b], scale)).toHaveLength(1);
  });

  it('every march is in one arrow, in any order given; the same marches give the same arrows', () => {
    // A seeded scatter of 300 marches of four nations.
    let s = 12345;
    const rnd = (): number => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    const marches: March[] = [];
    for (let i = 1; i <= 300; i++) {
      const [x, y] = [100 + rnd() * 40, 50 + rnd() * 40];
      marches.push(march(i, 1 + Math.floor(rnd() * 4), 500 + Math.floor(rnd() * 60_000), x, y, x + (rnd() - 0.5) * 60, y + (rnd() - 0.5) * 60));
    }
    for (const sc of [3, 10, 40]) {
      const arrows = groupMarches(marches, sc);
      const ids = arrows.flatMap((a) => a.ids).sort((a, b) => a - b);
      expect(ids).toEqual(marches.map((m) => m.id));
      expect(arrows.reduce((n, a) => n + a.men, 0)).toBe(marches.reduce((n, m) => n + m.men, 0));
      for (const a of arrows) for (const id of a.ids) expect(marches[id - 1]!.nation).toBe(a.nation);
      expect(groupMarches([...marches].reverse(), sc)).toEqual(arrows);
    }
    // Closer in, fewer start together: no fewer arrows.
    expect(groupMarches(marches, 40).length).toBeGreaterThanOrEqual(groupMarches(marches, 3).length);
  });

  it('a march with no way is in no arrow', () => {
    expect(groupMarches([{ id: 1, nation: 5, men: 100, line: [3, 4] }], scale)).toEqual([]);
  });
});

describe("an arrow's way and outline (R89a)", () => {
  it('the start of a way: its first stretch, a turn kept, all of a shorter way', () => {
    expect(wayStart([0, 0, 100, 0], 30)).toEqual([0, 0, 30, 0]);
    expect(wayStart([0, 0, 20, 0, 20, 50], 30)).toEqual([0, 0, 20, 0, 20, 10]);
    expect(wayStart([0, 0, 20, 0], 30)).toEqual([0, 0, 20, 0]);
  });

  it('a turn is rounded: no point of the rounded way at the corner, its ends kept', () => {
    const r = roundedWay([0, 0, 100, 0, 100, 100], 28);
    expect(r.slice(0, 2)).toEqual([0, 0]);
    expect(r.slice(-2)).toEqual([100, 100]);
    for (let i = 0; i < r.length; i += 2) expect(Math.hypot(r[i]! - 100, r[i + 1]!), 'off the corner').toBeGreaterThan(5);
    // A straight way is its two ends.
    expect(roundedWay([0, 0, 50, 0], 28)).toEqual([0, 0, 50, 0]);
  });

  it('a straight arrow: tail, neck, head and tip, the same either side of its way', () => {
    const w = 10;
    const o = arrowOutline([0, 0, 100, 0], w)!;
    // Left side up (y < 0 on the screen is its left going east): tail, neck, head corner; the tip; then the right back.
    const pts: [number, number][] = [];
    for (let i = 0; i < o.length; i += 2) pts.push([o[i]!, o[i + 1]!]);
    expect(pts).toHaveLength(7);
    const [tailL, neckL, headL, tip, headR, neckR, tailR] = pts as [[number, number], [number, number], [number, number], [number, number], [number, number], [number, number], [number, number]];
    expect(tip).toEqual([100, 0]);
    expect(tailL[0]).toBe(0);
    expect(Math.abs(tailL[1])).toBeCloseTo((w / 2) * ARROW_TAIL, 9);
    expect(Math.abs(neckL[1])).toBeCloseTo(w / 2, 9);
    expect(Math.abs(headL[1])).toBeCloseTo((w * HEAD_WIDE) / 2, 9);
    expect(headL[0]).toBe(neckL[0]);
    for (const [l, r] of [[tailL, tailR], [neckL, neckR], [headL, headR]] as const) {
      expect(l[0]).toBeCloseTo(r[0], 9);
      expect(l[1]).toBeCloseTo(-r[1], 9);
    }
  });

  it('too short to see: none; a short one: its head no longer than its share', () => {
    expect(arrowOutline([0, 0, ARROW_SHORTEST_PX - 1, 0], 10)).toBeNull();
    const o = arrowOutline([0, 0, 12, 0], 20)!;
    // The neck (the second point) is behind the tip by 0.6 of the length.
    expect(o[2]).toBeCloseTo(12 * 0.4, 9);
  });

  it('along a turned way: every point of the outline within its head\'s half width of the way', () => {
    const way = [0, 0, 60, 0, 60, 80, 140, 80];
    for (const w of [5, 12, 22]) {
      const o = arrowOutline(way, w)!;
      const c = roundedWay(way, 28);
      for (let i = 0; i < o.length; i += 2) {
        let near = Infinity;
        for (let k = 2; k < c.length; k += 2) {
          const [ax, ay, bx, by] = [c[k - 2]!, c[k - 1]!, c[k]!, c[k + 1]!];
          const t = Math.max(0, Math.min(1, ((o[i]! - ax) * (bx - ax) + (o[i + 1]! - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2 || 1)));
          near = Math.min(near, Math.hypot(o[i]! - ax - t * (bx - ax), o[i + 1]! - ay - t * (by - ay)));
        }
        expect(near, `width ${w}, point ${i / 2}`).toBeLessThanOrEqual((w * HEAD_WIDE) / 2 + 1e-9);
      }
    }
  });
});

describe('two arrows of a nation do not cross (R89a)', () => {
  /** Whether two ways cross (their segments properly). */
  const cross = (p: ArrayLike<number>, q: ArrayLike<number>): boolean => {
    const side = (ax: number, ay: number, bx: number, by: number, x: number, y: number): number => Math.sign((bx - ax) * (y - ay) - (by - ay) * (x - ax));
    for (let i = 2; i < p.length; i += 2) {
      for (let k = 2; k < q.length; k += 2) {
        const [a, b, c, d, e, f, g, h] = [p[i - 2]!, p[i - 1]!, p[i]!, p[i + 1]!, q[k - 2]!, q[k - 1]!, q[k]!, q[k + 1]!];
        if (side(a, b, c, d, e, f) * side(a, b, c, d, g, h) < 0 && side(e, f, g, h, a, b) * side(e, f, g, h, c, d) < 0) return true;
      }
    }
    return false;
  };

  it("across another at right angles: it ends before the other's side by the gap", () => {
    const other = { way: [50, -40, 50, 40], width: 12 };
    expect(cutAtCrossing([0, 0, 100, 0], [other])).toEqual([0, 0, 50 - 6 - CROSS_GAP_PX, 0]);
    // Crossing none: as it is.
    expect(cutAtCrossing([0, 0, 40, 0], [other])).toEqual([0, 0, 40, 0]);
    expect(cutAtCrossing([0, 0, 100, 0], [])).toEqual([0, 0, 100, 0]);
  });

  it('the first crossing along it, of several', () => {
    const cut = cutAtCrossing([0, 0, 100, 0], [{ way: [80, -40, 80, 40], width: 6 }, { way: [30, -40, 30, 40], width: 6 }]);
    expect(cut).toEqual([0, 0, 30 - 3 - CROSS_GAP_PX, 0]);
  });

  it('on a seeded scatter of ways: the cut way crosses none of the others, at any angle and after a turn', () => {
    let s = 777;
    const rnd = (): number => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    let cuts = 0;
    for (let n = 0; n < 400; n++) {
      const others = Array.from({ length: 3 }, () => ({ way: [rnd() * 200, rnd() * 200, rnd() * 200, rnd() * 200, rnd() * 200, rnd() * 200], width: 5 + rnd() * 17 }));
      const way = [rnd() * 200, rnd() * 200, rnd() * 200, rnd() * 200, rnd() * 200, rnd() * 200];
      const cut = cutAtCrossing(way, others);
      const crossed = others.some((o) => cross(way, o.way));
      if (crossed) cuts++;
      else expect(cut).toEqual(way);
      for (const o of others) expect(cross(cut, o.way), `scatter ${n}`).toBe(false);
      // It starts where it started.
      expect(cut.slice(0, 2)).toEqual(way.slice(0, 2));
    }
    expect(cuts, 'the scatter has crossings').toBeGreaterThan(100);
  });
});

describe('which marches are advances (R96: onto land an enemy holds)', () => {
  // Nations 1 and 2 at war, 3 at peace with both. Nation 2 holds x >= 100; 1 the rest; 3 the rows y >= 200.
  const holderAt = (x: number, y: number): number => (y >= 200 ? 3 : x >= 100 ? 2 : 1);
  const atWar = (a: number, b: number): boolean => (a === 1 && b === 2) || (a === 2 && b === 1);
  const way = (id: number, nation: number, ...line: number[]): { id: number; nation: number; line: number[] } => ({ id, nation, line });
  const ids = (s: Set<number>): number[] => [...s].sort((a, b) => a - b);

  it('over the front within reach: an advance; behind it, however near the front or the enemy, not', () => {
    const got = advances([
      way(1, 1, 97, 50, 104, 50), // over the front 3 cells on
      way(2, 1, 60, 50, 90, 50), // toward the front, its end 10 cells short of it: a reinforcement
      way(3, 1, 99, 30, 99, 70), // along the front a cell behind it
      way(4, 2, 103, 50, 96, 50), // the other side's, over the front the other way
      way(5, 1, 40, 195, 40, 210), // into a neutral's land
      way(6, 3, 97, 50, 104, 50), // a nation at peace, over the same front
    ], holderAt, atWar, 5);
    expect(ids(got)).toEqual([1, 4]);
  });

  it('the front beyond the reach of the way is not looked at; just within it, it is', () => {
    for (const reach of [1, 5, 12]) {
      const got = advances([way(1, 1, 100 - reach + 0.2, 50, 130, 50), way(2, 1, 100 - reach - 0.6, 50, 130, 50)], holderAt, atWar, reach);
      expect(ids(got), `reach ${reach}`).toEqual([1]);
    }
  });

  it('already on the enemy\u2019s land and going on, or coming back from it: an advance while it stands there', () => {
    expect(ids(advances([way(1, 1, 110, 50, 120, 50), way(2, 1, 101, 50, 80, 50)], holderAt, atWar, 5))).toEqual([1, 2]);
  });

  it('along a way with a turn: the enemy\u2019s land after the turn counts, by the way\u2019s length and not as the crow flies', () => {
    // North 3 cells, then east over the front: 3 + 2.5 cells along the way.
    const bent = way(1, 1, 98, 50, 98, 47, 104, 47);
    expect(ids(advances([bent], holderAt, atWar, 6))).toEqual([1]);
    expect(ids(advances([bent], holderAt, atWar, 4))).toEqual([]);
  });

  // ROADMAP R235 (ADR-1162): land an enemy holds that cannot be taken today is no advance's. The worker asks the world
  // (`World.holdsLand`: a front the historical track holds); here, nation 2's land from row 60 south.
  it('land an enemy holds that the marcher may not take is no advance: over it, on it, or along it; land it may take beyond, within reach, is', () => {
    const takes = (_nation: number, _holder: number, _x: number, y: number): boolean => y < 60;
    const got = advances([
      way(1, 1, 97, 50, 104, 50), // over the front where the land may be taken
      way(2, 1, 97, 70, 104, 70), // over the front where it is held
      way(3, 1, 101, 70, 110, 70), // standing on the held land and going on over it
      way(4, 1, 99, 62, 102, 56), // onto the held land first, and onto land it may take 4 cells on
      way(5, 1, 99, 75, 102, 61), // onto the held land and no further than it within the reach
    ], holderAt, atWar, 5, takes);
    expect(ids(got)).toEqual([1, 4]);
    // Asked by who marches: nation 2 may take nation 1's land, nation 1 none of nation 2's.
    const byNation = (nation: number): boolean => nation === 2;
    expect(ids(advances([way(1, 1, 97, 50, 104, 50), way(2, 2, 103, 50, 96, 50)], holderAt, atWar, 5, byNation))).toEqual([2]);
  });

  it('a way of one point or none is no advance unless it stands on the enemy\u2019s land', () => {
    expect(ids(advances([way(1, 1, 50, 50), way(2, 1), way(3, 1, 120, 50)], holderAt, atWar, 5))).toEqual([3]);
  });

  it('an advance and a march behind the lines from one place the same way are two arrows, the one faint', () => {
    const a = groupMarches([{ ...march(1, 5, 3_000, 100, 50, 130, 50), faint: true }, march(2, 5, 9_000, 100, 50, 130, 50), { ...march(3, 5, 1_000, 100, 50, 130, 51), faint: true }], 10);
    expect(a.map((x) => [x.ids, Boolean(x.faint), x.men])).toEqual([[[2], false, 9_000], [[1, 3], true, 4_000]]);
  });
});

describe("an arrow's fill (R89a)", () => {
  it('half the way from its nation\'s colour to white', () => {
    // ARROW_PALE of the way to white (0.3 since ROADMAP R106; 0.5 before, and these were 128, 128, 128 and 255, 128, 192).
    expect(ARROW_PALE).toBe(0.3);
    expect(arrowFill(0x000000)).toBe('rgb(77, 77, 77)');
    expect(arrowFill(0xff0080)).toBe('rgb(255, 77, 166)');
    expect(arrowFill(0xffffff)).toBe('rgb(255, 255, 255)');
  });
});

describe("another nation's arrow with a nation looked at (ROADMAP R106)", () => {
  // A context that draws nothing: the arrows' widths are what is read.
  const ctx = { save() {}, restore() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, stroke() {}, fill() {}, globalAlpha: 1, lineJoin: '', strokeStyle: '', lineWidth: 0, fillStyle: '' } as unknown as CanvasRenderingContext2D;
  const arrows = [
    { nation: 1, men: 20_000, ids: [1], line: [10, 10, 200, 10] },
    { nation: 2, men: 20_000, ids: [2], line: [10, 100, 200, 100] },
  ];
  const widths = (own?: number): number[] => drawMoveArrows(ctx, arrows, (x, y) => [x, y], [0], 400, 300, () => '#fff', 1, own).sort((a, b) => a.nation - b.nation).map((a) => a.width);

  it('its own whole, the other OTHER_WIDE of its width; with none looked at, both whole', () => {
    const [a, b] = widths();
    expect(a).toBe(arrowWidth(20_000));
    expect(b).toBe(a);
    const [mine, theirs] = widths(1);
    expect(mine).toBe(a);
    expect(theirs).toBeCloseTo(OTHER_WIDE * a!, 6);
    expect(OTHER_WIDE).toBeLessThan(1);
    const [x, y] = widths(2);
    expect(y).toBe(a);
    expect(x).toBeCloseTo(OTHER_WIDE * a!, 6);
  });
});
