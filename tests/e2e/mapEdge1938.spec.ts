import { expect, test, type Page } from '@playwright/test';
import type {} from '../../src/app/testApi';

// ROADMAP R214 (critic run 89, R89-N2; ADR-1141's sizes): at 2560 × 1305, at world zoom, the band above the map's north
// edge was the sea's last row drawn out into faint vertical stripes (the edge row's depth went on past the map). The
// least zoom shows the map at nine tenths of the view's height, so a twentieth of the view above and below it is past
// the map at every size. There the sea is one flat colour, reached within `EDGE_FADE_CELLS` of the edge.

/** `EDGE_FADE_CELLS` of `src/render/map/ground.ts`. */
const EDGE_FADE_CELLS = 8;

interface Band {
  /** The band's height past the map, in cells. */
  cells: number;
  /** The cells past the edge of the row read. */
  off: number;
  /** The greatest spread of a colour channel over the row, within the map's width. */
  spread: number;
  /** Pixels read. */
  n: number;
  rgb: number[];
}

/** At the least zoom: a row of the picture `px` device pixels from the view's top (`north`) or bottom, over the map's width. */
async function bandRow(page: Page, north: boolean, px: number): Promise<Band> {
  return page.evaluate(
    ({ north, px }) => {
      const v = window.__warsim!.view!;
      const { w, h } = window.__warsim!.sim.mapLayers!.terrain;
      // The least zoom the camera allows, the map in the middle.
      v.controller.set({ cx: w / 2, cy: h / 2, scale: 0.001 });
      v.draw();
      const cam = v.controller.cam;
      const c = document.getElementById('map') as HTMLCanvasElement;
      const gl = c.getContext('webgl2')!;
      const dpr = c.width / window.innerWidth;
      const band = (c.height - h * cam.scale * dpr) / 2;
      // The map's own columns, 4 px in from its sides (a map narrower than the view has no sea beside it).
      const left = Math.max(0, Math.ceil(c.width / 2 - (w / 2) * cam.scale * dpr) + 4);
      const right = Math.min(c.width, Math.floor(c.width / 2 + (w / 2) * cam.scale * dpr) - 4);
      const n = right - left;
      const p = new Uint8Array(4 * n);
      // WebGL's rows count from the bottom.
      gl.readPixels(left, north ? c.height - 1 - px : px, n, 1, gl.RGBA, gl.UNSIGNED_BYTE, p);
      let spread = 0;
      for (let ch = 0; ch < 3; ch++) {
        let lo = 255;
        let hi = 0;
        for (let i = 0; i < n; i++) {
          lo = Math.min(lo, p[4 * i + ch]!);
          hi = Math.max(hi, p[4 * i + ch]!);
        }
        spread = Math.max(spread, hi - lo);
      }
      const m = 4 * (n >> 1);
      return { cells: band / (cam.scale * dpr), off: (band - px) / (cam.scale * dpr), spread, n, rgb: [p[m]!, p[m + 1]!, p[m + 2]!] };
    },
    { north, px },
  );
}

for (const [width, height] of [[2560, 1305], [393, 659], [393, 852], [734, 343], [852, 393]] as const) {
  test(`${width} × ${height}: past the map's north and south edges the sea is one flat colour`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height });
    await page.goto('/?scenario=1938&paused=1&seed=1938');
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null && window.__warsim!.sim.mapLayers !== null && window.__warsim!.sim.elevation !== null, null, { timeout: 60_000 });
    const seen: number[][] = [];
    for (const north of [true, false]) {
      // Near the view's edge, and nearer the map (still past the fade).
      for (const px of [2, 6]) {
        const r = await bandRow(page, north, px);
        const at = `${north ? 'north' : 'south'}, ${r.off.toFixed(1)} cells past the edge`;
        expect(r.cells, 'a band past the map at the least zoom').toBeGreaterThan(3 * EDGE_FADE_CELLS);
        expect(r.off, `${at}: past the fade`).toBeGreaterThan(EDGE_FADE_CELLS);
        expect(r.n, `${at}: pixels read`).toBeGreaterThan(300);
        expect(r.spread, `${at}: one colour across ${r.n} px`).toBeLessThanOrEqual(2);
        seen.push(r.rgb);
      }
    }
    // One sea, north and south, near and far.
    for (const rgb of seen) for (let ch = 0; ch < 3; ch++) expect(Math.abs(rgb[ch]! - seen[0]![ch]!), 'the same colour in every row read').toBeLessThanOrEqual(2);
  });
}
