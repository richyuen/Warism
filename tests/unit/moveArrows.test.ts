import { describe, expect, it } from 'vitest';
import { pressesAt } from '../../src/shared/advances';
import { ARROW_PALE, OTHER_WIDE, ARROW_LONG_PX, ARROW_MAX_MEN, ARROW_MAX_PX, ARROW_MIN_MEN, ARROW_MIN_PX, ARROW_SHORTEST_PX, ARROW_TAIL, CROSS_GAP_PX, GROUP_START_PX, HEAD_WIDE, OWN_SIDE_STEP, arrowFill, arrowOutline, arrowWidth, cutAtCrossing, drawMoveArrows, groupMarches, ownSideLength, roundedWay, wayStart, type March } from '../../src/render/units/moveArrows';

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

describe('which marches are advances, and where each presses (R96: onto land an enemy holds; R241: by its route)', () => {
  // A map 200 cells wide. Nations 1 and 2 at war, 3 at peace with both. Nation 2 holds x >= 100, and the one cell
  // (99, 150) west of that; 1 the rest; 3 the rows y >= 170.
  const W = 200;
  const cell = (x: number, y: number): number => y * W + x;
  const holderOf = (c: number): number => {
    const [x, y] = [c % W, Math.floor(c / W)];
    return y >= 170 ? 3 : x >= 100 || (x === 99 && y === 150) ? 2 : 1;
  };
  const atWar = (a: number, b: number): boolean => (a === 1 && b === 2) || (a === 2 && b === 1);
  /** A route through the cells given, `x, y` by twos. */
  const route = (...xy: number[]): number[] => Array.from({ length: xy.length / 2 }, (_, i) => cell(xy[2 * i]!, xy[2 * i + 1]!));
  /** The route from (x, y) straight east or west to (tx, y). */
  const along = (x: number, y: number, tx: number): number[] => Array.from({ length: Math.abs(tx - x) + 1 }, (_, i) => cell(x + Math.sign(tx - x) * i, y));
  /**
   * Where nation `n`'s march presses, by the cell: [x, y], or null. It stands in the middle of the cell of its route it
   * has reached (`step`), or `at` a place of its own.
   */
  const presses = (n: number, path: number[], reach = 5, takes?: (holder: number, c: number) => boolean, step = 0, at?: [number, number]): [number, number] | null => {
    const here = path[step] ?? 0;
    const [x, y] = at ?? [(here % W) + 0.5, Math.floor(here / W) + 0.5];
    const k = pressesAt(path, step, x, y, n, W, reach, holderOf, atWar, takes);
    return k < 0 ? null : [path[k]! % W, Math.floor(path[k]! / W)];
  };

  it('over the front within reach: an advance, pressing on the first cell of its route the enemy holds; behind it, however near, not', () => {
    // Over the front 3 cells on.
    expect(presses(1, along(97, 50, 104))).toEqual([100, 50]);
    // Toward the front, its end 10 cells short of it: a reinforcement.
    expect(presses(1, along(60, 50, 90))).toBeNull();
    // Along the front a cell behind it.
    expect(presses(1, route(99, 30, 99, 31, 99, 32, 99, 33))).toBeNull();
    // The other side's, over the front the other way.
    expect(presses(2, along(103, 50, 96))).toEqual([99, 50]);
    // Into a neutral's land.
    expect(presses(1, route(40, 167, 40, 168, 40, 169, 40, 170, 40, 171))).toBeNull();
    // A nation at peace, over the same front.
    expect(presses(3, along(97, 50, 104))).toBeNull();
  });

  // The line of a march on land is straight to its target (PLAN 7.4g3): along a front that bends it lies over land
  // the route goes round. By the line that was an advance; by the route it is a march on its own side.
  it("a route round a corner of the enemy's land that its straight line lies over: no advance", () => {
    // From (99, 148) to (99, 152): the straight line is over (99, 150), the enemy's; the route goes by (98, 150).
    const round = route(99, 148, 99, 149, 98, 150, 99, 151, 99, 152);
    expect(holderOf(cell(99, 150))).toBe(2);
    expect(presses(1, round)).toBeNull();
    // The same way through that cell: it presses on it.
    expect(presses(1, route(99, 148, 99, 149, 99, 150, 99, 151, 99, 152))).toEqual([99, 150]);
  });

  it('the front beyond reach is not looked at; just within it, it is: as the crow flies from where the march stands', () => {
    for (const reach of [1, 5, 12]) {
      expect(presses(1, along(100 - reach, 50, 130), reach), `reach ${reach}`).toEqual([100, 50]);
      expect(presses(1, along(100 - reach - 1, 50, 130), reach), `reach ${reach}`).toBeNull();
    }
    // A route that winds, 8.2 cells long, to a cell 4 away: within a reach of 5.
    const winding = route(96, 50, 97, 49, 97, 50, 98, 51, 98, 50, 99, 49, 99, 50, 100, 50);
    expect(presses(1, winding)).toEqual([100, 50]);
    // One that first goes 6 cells north, out of reach, and comes to the enemy's land after: none.
    const away = [...route(96, 50, 96, 49, 96, 48, 96, 47, 96, 46, 96, 45, 96, 44), ...along(97, 44, 101)];
    expect(presses(1, away)).toBeNull();
    expect(presses(1, away, 9)).toEqual([100, 44]);
    // From where it stands, not from the cell of its route it last reached: well on its way to the next one, the
    // front is that much nearer. The middle of (100, 50) is 5 cells from the middle of (95, 50) and 4.7 from here.
    expect(presses(1, along(95, 50, 104), 4.8)).toBeNull();
    expect(presses(1, along(95, 50, 104), 4.8, undefined, 0, [95.8, 50.5])).toEqual([100, 50]);
  });

  it("already on the enemy's land: pressing on its next cell, going on or coming back", () => {
    expect(presses(1, along(110, 50, 120))).toEqual([111, 50]);
    expect(presses(1, along(101, 50, 80))).toEqual([100, 50]);
    // On the enemy's first cell and off it at once: over the front while it stands there, pressing where it goes.
    expect(presses(1, along(100, 50, 96))).toEqual([99, 50]);
    // At its way's end on the enemy's land: that cell.
    expect(presses(1, route(100, 50))).toEqual([100, 50]);
  });

  // ROADMAP R235 (ADR-1162): land an enemy holds that cannot be taken today is no advance's. The worker asks the world
  // (`World.holdsLand`: a front the historical track holds); here, nation 2's land from row 60 south.
  it('the first cell of the enemy that the march comes to may not be taken: no advance, whatever lies beyond', () => {
    const takes = (_holder: number, c: number): boolean => Math.floor(c / W) < 60;
    // Over the front where the land may be taken.
    expect(presses(1, along(97, 50, 104), 5, takes)).toEqual([100, 50]);
    // Over the front where it is held.
    expect(presses(1, along(97, 70, 104), 5, takes)).toBeNull();
    // Standing on the held land and going on over it.
    expect(presses(1, along(101, 70, 110), 5, takes)).toBeNull();
    // Onto the held land first, and onto land it may take three cells on: it waits before the held cell.
    expect(presses(1, route(99, 62, 100, 61, 101, 60, 102, 59, 103, 58), 5, takes)).toBeNull();
    // Asked by who marches: here nation 2 may take nation 1's land, nation 1 none of nation 2's.
    const of2 = (holder: number): boolean => holder === 1;
    expect(presses(1, along(97, 50, 104), 5, of2)).toBeNull();
    expect(presses(2, along(103, 50, 96), 5, of2)).toEqual([99, 50]);
  });

  it('from the cell it stands in, not from its route’s start; with no route left, or none, no advance', () => {
    // The same route, the march 5 cells along it: the front is 2 cells on.
    expect(presses(1, along(93, 50, 104), 5, undefined, 0)).toBeNull();
    expect(presses(1, along(93, 50, 104), 5, undefined, 5)).toEqual([100, 50]);
    expect(presses(1, along(60, 50, 90), 5, undefined, 30)).toBeNull();
    expect(presses(1, [], 5)).toBeNull();
    expect(presses(1, along(97, 50, 104), 5, undefined, 99)).toBeNull();
  });

  it("over the map's seam: the reach is by the nearer way round", () => {
    // Nation 2 holds x >= 100: a march of nation 1 from (2, 50) west over the seam comes to (199, 50), 3 cells on.
    expect(presses(1, route(2, 50, 1, 50, 0, 50, 199, 50, 198, 50))).toEqual([199, 50]);
    expect(presses(1, route(2, 50, 1, 50, 0, 50, 199, 50, 198, 50), 2)).toBeNull();
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

// ROADMAP R241 (ADR-1165): a march behind the lines is drawn on its own side of a front. Its line is straight to its
// target, and at a far zoom the stretch of it the arrow is drawn along lay over the front.
describe("how much of a way runs before an enemy's land (R241)", () => {
  // The enemy's land: x >= 100.
  const enemyAt = (x: number): boolean => x >= 100;

  it('to the last point looked at before it; all of it where it comes onto none; nothing where it starts on it', () => {
    // From 90 east: looked at every OWN_SIDE_STEP, the first on the enemy's land at 10 along it.
    expect(ownSideLength([90, 50, 130, 50], enemyAt)).toBe(10 - OWN_SIDE_STEP);
    expect(ownSideLength([90, 50, 99.9, 50], enemyAt)).toBe(Infinity);
    expect(ownSideLength([100, 50, 130, 50], enemyAt)).toBe(0);
    expect(ownSideLength([130, 50, 90, 50], enemyAt)).toBe(0);
    expect(ownSideLength([90, 50], enemyAt)).toBe(Infinity);
    expect(ownSideLength([], enemyAt)).toBe(Infinity);
  });

  it('along a way with turns, by its length; its end is looked at too', () => {
    // North 3, then east: the enemy's land 5 cells east of the turn.
    expect(ownSideLength([95, 50, 95, 47, 104, 47], enemyAt)).toBe(3 + 5 - OWN_SIDE_STEP);
    // A way that ends on the enemy's first cell, its last stretch shorter than a look apart.
    expect(ownSideLength([99.8, 50, 100.1, 50], enemyAt)).toBe(0);
    expect(ownSideLength([99.2, 50, 100.0, 50], enemyAt)).toBe(OWN_SIDE_STEP);
  });

  it('the way cut there stays on its own side', () => {
    for (const line of [[90, 50, 130, 50], [95, 50, 95, 47, 104, 47], [80.3, 20, 111.7, 31.5]]) {
      const cut = wayStart(line, ownSideLength(line, enemyAt));
      for (let i = 0; i < cut.length; i += 2) expect(enemyAt(cut[i]!), `${line.join(',')} at ${cut[i]},${cut[i + 1]}`).toBe(false);
      // And it is no shorter than a look less than the way to the front.
      expect(100 - cut[cut.length - 2]!).toBeLessThanOrEqual(OWN_SIDE_STEP + 1e-9);
    }
  });
});
