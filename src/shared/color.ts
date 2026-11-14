/**
 * Colour helpers (PLAN 1.4): CIELAB conversion and ΔE*ab (CIE76) for the neighbour-contrast rule
 * (adjacent nations must differ by ΔE > 15) and for picking colours for spawned nations later.
 */

/** `#rrggbb` → 0xrrggbb. */
export function parseHex(hex: string): number {
  return parseInt(hex.slice(1, 7), 16);
}

function linear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function f(t: number): number {
  return t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116;
}

/** sRGB (0xrrggbb) → CIELAB (D65). */
export function rgbToLab(rgb: number): [number, number, number] {
  const r = linear((rgb >> 16) & 255);
  const g = linear((rgb >> 8) & 255);
  const b = linear(rgb & 255);
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** CIE76 colour difference between two sRGB colours. */
export function deltaE(a: number, b: number): number {
  const [l1, a1, b1] = rgbToLab(a);
  const [l2, a2, b2] = rgbToLab(b);
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

/** `rgb` mixed toward `to` by `t` (0: itself, 1: `to`), each channel rounded. */
export function mix(rgb: number, to: number, t: number): number {
  let out = 0;
  for (const sh of [16, 8, 0]) {
    const a = (rgb >> sh) & 255;
    const b = (to >> sh) & 255;
    out |= Math.round(a + (b - a) * t) << sh;
  }
  return out;
}

/**
 * The least ΔE between two lines of a chart (ROADMAP R82h; critic run 68: France's #3f5fbf and the United States'
 * #2a4d8f, ΔE 19, read as one blue as thin lines). The map's neighbours need only 15 (filled areas side by side).
 */
export const CHART_MIN_DE = 30;
/** The steps of a line's mix toward white, then toward black, when it is too near a line above it. */
const CHART_MIX_STEPS = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9];

/** A chart line's look (ROADMAP R82h): its colour, and whether it is dashed (no mix of its colour is far enough). */
export interface ChartLook {
  color: number;
  dashed: boolean;
}

/**
 * The look of a chart's lines, in their order (the first kept): each line its nation's colour unless it is within
 * CHART_MIN_DE of a line before it; then the first mix toward white, else toward black, that clears all of them; with
 * none, the mix furthest from its nearest, dashed (six blues of one hue cannot all be 30 apart by lightness).
 */
export function chartColours(colors: readonly number[]): ChartLook[] {
  const out: ChartLook[] = [];
  const nearest = (c: number): number => out.reduce((m, o) => Math.min(m, deltaE(c, o.color)), Infinity);
  for (const c of colors) {
    let best = c;
    let bestD = nearest(c);
    if (bestD < CHART_MIN_DE) {
      for (const x of [...CHART_MIX_STEPS.map((t) => mix(c, 0xffffff, t)), ...CHART_MIX_STEPS.map((t) => mix(c, 0x000000, t))]) {
        const d = nearest(x);
        if (d >= CHART_MIN_DE) {
          [best, bestD] = [x, d];
          break;
        }
        if (d > bestD) [best, bestD] = [x, d];
      }
    }
    out.push({ color: best, dashed: bestD < CHART_MIN_DE });
  }
  return out;
}
