// Critic run 61 (new): keys after a click on a bottom-bar button: does Space pause only, or also press the focused button?
// Then the number keys (map modes), '.' and ',' (speed), Escape. Usage: node critic/scripts/c67_x_keys.mjs <seed>
import { launch, open1938, shot, save } from './c67_lib.mjs';
const seed = Number(process.argv[2] ?? 32431);
const out = { seed, steps: [] };
const { browser, page, errors } = await launch(1600, 900);
const state = () => page.evaluate(() => ({
  paused: window.__warsim.hud.paused.value, speed: document.querySelector('[data-testid=speed-label]')?.innerText,
  mode: document.querySelector('[data-testid=mapmode-btn]')?.innerText,
  panels: [...document.querySelectorAll('[data-testid$=-panel],[data-testid=stats-chart],[data-testid=history-row]')].filter((e) => e.offsetParent !== null).map((e) => e.dataset.testid).filter((v, i, a) => a.indexOf(v) === i),
  focus: document.activeElement?.dataset?.testid ?? document.activeElement?.tagName,
}));
const S = async (s) => { out.steps.push({ s, ...(await state()) }); console.log(s, JSON.stringify(out.steps.at(-1))); };
try {
  await open1938(page, seed);
  await S('open');
  for (const btn of ['history-btn', 'relations-btn', 'stats-btn', 'god-btn']) {
    await page.getByTestId(btn).click(); await page.waitForTimeout(500);
    await S(`clicked ${btn}`);
    await page.keyboard.press('Space'); await page.waitForTimeout(700);
    await S(`Space after ${btn}`);
    await page.keyboard.press('Space'); await page.waitForTimeout(700);
    await S(`Space again after ${btn}`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    await S('Escape');
  }
  out.shot = await shot(page, 'c67xk_after_buttons.png');
  for (const k of ['Digit2', 'Digit3', 'Digit5', 'Digit9', 'Digit0', 'Digit1']) { await page.keyboard.press(k); await page.waitForTimeout(400); await S(`key ${k}`); }
  for (const k of ['Period', 'Period', 'Period', 'Comma']) { await page.keyboard.press(k); await page.waitForTimeout(200); await S(`key ${k}`); }
} catch (e) { out.fail = String(e).slice(0, 300); console.log(out.fail); }
finally { out.errors = errors; save('c67_xk.json', out); await browser.close(); }
