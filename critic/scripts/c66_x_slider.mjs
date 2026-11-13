// Critic run 66 (new): R74b's slider driven as a player does, by keys and by a mouse drag: the 1938 card, focus the
// slider, End / Home / arrow keys, then a drag to about 1960 by mouse. After each: the label over the thumb, the start
// date, nations, great powers and the preview's src. At 1600 x 900 and 390 x 844.
// Usage: node critic/scripts/c66_x_slider.mjs
import { launch, shot, save, BASE } from './c66_lib.mjs';
const out = { runs: [] };
const read = (page) => page.evaluate(() => ({
  value: document.querySelector('[data-testid=title-start-year]')?.value,
  thumbLabel: [...document.querySelectorAll('.title-years *')].map((e) => e.childElementCount === 0 ? e.innerText : '').filter(Boolean).join('|'),
  date: document.querySelector('[data-testid=title-start-date]')?.innerText,
  nations: document.querySelector('[data-testid=title-nations]')?.innerText,
  powers: document.querySelector('[data-testid=title-powers]')?.innerText ?? null,
  preview: document.querySelector('[data-testid=title-preview]')?.getAttribute('src'),
  heading: document.querySelector('.title-card h2, .panel h2, h2')?.innerText ?? null,
}));
for (const [W, H] of [[1600, 900], [390, 844]]) {
  const { browser, page, errors } = await launch(W, H);
  const run = { W, H, steps: [] };
  try {
    await page.goto(`${BASE}/`);
    await page.getByTestId('title-screen').waitFor();
    await page.waitForTimeout(1500);
    const s = page.getByTestId('title-start-year');
    await s.scrollIntoViewIfNeeded();
    await s.focus();
    for (const k of ['End', 'ArrowLeft', 'ArrowLeft', 'Home', 'ArrowRight']) {
      await page.keyboard.press(k);
      await page.waitForTimeout(400);
      run.steps.push({ key: k, ...(await read(page)) });
    }
    const box = await s.boundingBox();
    run.box = box;
    await page.mouse.move(box.x + 4, box.y + box.height / 2);
    await page.mouse.down();
    const frac = (1960 - 1938) / (1975 - 1938);
    await page.mouse.move(box.x + box.width * frac, box.y + box.height / 2, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(800);
    run.steps.push({ key: 'drag~1960', ...(await read(page)) });
    run.shot = await shot(page, `c66sl_${W}x${H}_drag.png`);
  } catch (e) { run.fatal = String(e?.stack ?? e).slice(0, 400); }
  run.errors = errors.slice(0, 4);
  out.runs.push(run);
  await browser.close();
}
save('c66_slider.json', out);
console.log(JSON.stringify(out, null, 1));
