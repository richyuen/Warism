import { expect, test, type Page } from '@playwright/test';
import type {} from '../../src/app/testApi';

// ADR-1152: a touch screen's WebGL map is drawn at most at 2 px per CSS px and keeps no copy of its frame (iOS takes
// the context away under memory pressure, ADR-1151); its names keep the screen's own px. A desk keeps both.

const read = () => {
  const map = document.getElementById('map') as HTMLCanvasElement;
  const names = document.querySelector<HTMLCanvasElement>('canvas.map-nations')!;
  const gl = map.getContext('webgl2')!;
  return {
    touch: window.__warsim!.view!.touchScreen,
    preserve: gl.getContextAttributes()!.preserveDrawingBuffer,
    map: map.width / map.clientWidth,
    names: names.width / map.clientWidth,
  };
};

const boot = async (page: Page): Promise<void> => {
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.hud.worker.value ?? null) !== null, null, { timeout: 60_000 });
  await page.waitForFunction(() => window.__warsim!.view!.frames > 0 && document.querySelector<HTMLCanvasElement>('canvas.map-nations')!.width > 1);
};

test.describe('an iPhone (3 px per CSS px)', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
  test('the map at 2 px per CSS px, no kept frame, the names at 3; the map is on the screen', async ({ page }) => {
    test.setTimeout(120_000);
    await boot(page);
    const r = await page.evaluate(read);
    expect(r).toMatchObject({ touch: true, preserve: false });
    expect(r.map).toBeCloseTo(2, 1);
    expect(r.names).toBeCloseTo(3, 1);
    // The frame not kept is still what the page shows: the screen's middle is not the page's black.
    const shot = await page.screenshot({ clip: { x: 150, y: 380, width: 90, height: 90 } });
    const png = await page.evaluate(async (b64) => {
      const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
      const c = new OffscreenCanvas(img.width, img.height);
      const x = c.getContext('2d')!;
      x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, img.width, img.height).data;
      let lit = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i]! + d[i + 1]! + d[i + 2]! > 60) lit++;
      return lit / (d.length / 4);
    }, shot.toString('base64'));
    expect(png).toBeGreaterThan(0.9);
  });
});

test('a desk keeps its frame and the screen\'s px', async ({ page }) => {
  test.setTimeout(120_000);
  await boot(page);
  const r = await page.evaluate(read);
  expect(r).toMatchObject({ touch: false, preserve: true });
  expect(r.map).toBeCloseTo(r.names, 2);
});
