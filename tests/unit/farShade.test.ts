import { describe, expect, it } from 'vitest';
import { FAR_EDGE, FAR_LAND_RANGE, FAR_RELIEF, FAR_SEA_DEEP, FAR_SEA_RANGE, FAR_SEA_SHALLOW, farShade, SEA_DEPTH_FULL, seaDepthShare } from '../../src/render/map/ground';
import { deltaE, parseHex } from '../../src/shared/color';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { NATIONS_1938, politicalMap1938 } from '../helpers/earth';

// ROADMAP R91 (ADR-1080): the ground of T0 and T1: the sea by its depth, the land by its relief, a fill darker toward
// its border.

/** A map of `w` × `h` from a function of the cell. */
const elev = (w: number, h: number, f: (x: number, y: number) => number): Int16Array => Int16Array.from({ length: w * h }, (_, i) => f(i % w, Math.floor(i / w)));

describe('the shades of T0 and T1 (R91)', () => {
  it('level land and the sea: the light is level (128); the depth share 0 on land, whole over the deep', () => {
    const [w, h] = [8, 6];
    const s = farShade(w, h, elev(w, h, (x) => (x < 4 ? 300 : -SEA_DEPTH_FULL)), 20_000, false);
    for (let i = 0; i < w * h; i++) {
      const land = i % w < 4;
      // The land's last column stands over the sea: its neighbours' heights fall to 0, a slope.
      if (i % w !== 3 && i % w !== 2) expect(s[i * 2], `light of cell ${i}`).toBe(128);
      expect(s[i * 2 + 1], `depth of cell ${i}`).toBe(land ? 0 : 255);
    }
  });

  it('the depth share: 0 at the shore, never less for more depth, 1 from SEA_DEPTH_FULL on; shelves are told from basins', () => {
    expect(seaDepthShare(0)).toBe(0);
    expect(seaDepthShare(-50)).toBe(0);
    let last = 0;
    for (let d = 0; d <= 12_000; d += 37) {
      const t = seaDepthShare(d);
      expect(t).toBeGreaterThanOrEqual(last);
      expect(t).toBeLessThanOrEqual(1);
      last = t;
    }
    expect(seaDepthShare(SEA_DEPTH_FULL)).toBe(1);
    // A shelf of 100 m is under a quarter of the way down, an abyss of 4,000 m over nine tenths.
    expect(seaDepthShare(100)).toBeLessThan(0.25);
    expect(seaDepthShare(4000)).toBeGreaterThan(0.9);
  });

  it('a slope that faces the north-west is lighter than level ground, one that faces the south-east darker', () => {
    const [w, h] = [12, 12];
    // Rising to the south-east: the slope looks north-west. And the other way.
    const nw = farShade(w, h, elev(w, h, (x, y) => 100 + 400 * (x + y)), 20_000, false);
    const se = farShade(w, h, elev(w, h, (x, y) => 100 + 400 * (2 * w - x - y)), 20_000, false);
    const mid = (6 * w + 6) * 2;
    expect(nw[mid]!).toBeGreaterThan(140);
    expect(se[mid]!).toBeLessThan(116);
    // Steeper is lighter, to a limit: never beyond the byte.
    const steep = farShade(w, h, elev(w, h, (x, y) => 100 + 1200 * (x + y)), 20_000, false);
    expect(steep[mid]!).toBeGreaterThanOrEqual(nw[mid]!);
    expect(Math.max(...steep)).toBeLessThanOrEqual(255);
  });

  it('a map that goes round: the first column is lit by the last, and the same map shifted is the same shades shifted', () => {
    const [w, h] = [16, 8];
    const f = (x: number, y: number): number => 200 + 900 * Math.sin((x / w) * 2 * Math.PI) + 100 * y;
    const a = farShade(w, h, elev(w, h, f), 20_000, true);
    const b = farShade(w, h, elev(w, h, (x, y) => f((x + 5) % w, y)), 20_000, true);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) expect(b[(y * w + x) * 2], `cell ${x}, ${y}`).toBe(a[(y * w + ((x + 5) % w)) * 2]);
    // Not round: the edge columns differ from those of the round map.
    const flat = farShade(w, h, elev(w, h, f), 20_000, false);
    expect(Array.from({ length: h }, (_, y) => flat[y * w * 2]!)).not.toEqual(Array.from({ length: h }, (_, y) => a[y * w * 2]!));
  });

  it('the fills keep their colours: the land within a quarter darker and a sixth lighter, the sea within a fifth', () => {
    expect(FAR_LAND_RANGE[0]).toBeCloseTo(FAR_EDGE * (1 - FAR_RELIEF), 9);
    expect(FAR_LAND_RANGE[0]).toBeGreaterThanOrEqual(0.66);
    expect(FAR_LAND_RANGE[1]).toBeLessThanOrEqual(1.17);
    expect(FAR_SEA_RANGE).toEqual([FAR_SEA_DEEP, FAR_SEA_SHALLOW]);
    expect(FAR_SEA_DEEP).toBeGreaterThanOrEqual(0.8);
    expect(FAR_SEA_SHALLOW).toBeLessThanOrEqual(1.2);
  });

  it('neighbouring nations of 1938 are still told apart at the darkest and at the lightest shade (the AT of R91)', () => {
    const { w: W, h: H } = SIZE_1938;
    const { owner } = politicalMap1938(W);
    const shaded = (hex: string, f: number): number => {
      const c = parseHex(hex);
      const ch = (v: number): number => Math.min(255, Math.round(v * f));
      return (ch((c >> 16) & 255) << 16) | (ch((c >> 8) & 255) << 8) | ch(c & 255);
    };
    const seen = new Set<string>();
    let least = Infinity;
    let which = '';
    for (let y = 0; y < H - 1; y++) {
      for (let x = 0; x < W; x++) {
        const a = owner[y * W + x]!;
        if (a === 0) continue;
        for (const [dx, dy] of [[1, 0], [0, 1]] as const) {
          const b = owner[(y + dy) * W + ((x + dx) % W)]!;
          if (b === 0 || b === a) continue;
          const key = a < b ? `${a},${b}` : `${b},${a}`;
          if (seen.has(key)) continue;
          seen.add(key);
          // Either side of a border the two fills have the border's shade and the same ground's light.
          for (const f of [FAR_LAND_RANGE[0], FAR_EDGE, 1, FAR_LAND_RANGE[1]]) {
            const d = deltaE(shaded(NATIONS_1938[a - 1]!.color, f), shaded(NATIONS_1938[b - 1]!.color, f));
            if (d < least) [least, which] = [d, `${NATIONS_1938[a - 1]!.tag}-${NATIONS_1938[b - 1]!.tag} at ${f.toFixed(2)}`];
          }
        }
      }
    }
    process.stderr.write(`neighbours of 1938 under the shades of T0 and T1: the least ΔE ${least.toFixed(1)} (${which}), ${seen.size} pairs\n`);
    expect(seen.size).toBeGreaterThan(150);
    // Unshaded the bar is 15 (nations.test.ts): a darker pair is nearer in Lab by about the shade's share.
    expect(least).toBeGreaterThan(12);
  });
});
