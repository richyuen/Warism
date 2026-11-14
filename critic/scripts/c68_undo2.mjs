// Critic run 68 (new, R81b): each God act undone 2 s after it, paused, the camera fixed: the map's picture before the
// act against the picture after Undo (the hash equal), for nuke, revolt, nation, city, raze and brush. Shots are compared
// by critic/scripts/c68_pixdiff.py. Usage: node critic/scripts/c68_undo2.mjs <seed>
import { launch, shot, save, CELLS, open1938, settle } from './c68_lib.mjs';

const seed = Number(process.argv[2] ?? 41211);
const out = { seed, cases: [] };
const { browser, page, errors } = await launch();
await open1938(page, seed);
await page.getByTestId('god-btn').click();
const hash = () => page.evaluate(() => window.__warsim.sim.hash().then((s) => s.hash));
const look = async (x, y, m) => {
  await page.evaluate(({ x, y, m }) => { const v = window.__warsim.view; v.controller.set({ cx: x, cy: y, scale: (v.metresPerPx * v.controller.cam.scale) / m }); }, { x, y, m });
  await page.mouse.move(5, 300);
  await settle(page);
  await page.waitForTimeout(800);
};
const closeAlerts = async () => { for (let i = 0; i < 3; i++) if (await page.getByTestId('nuke-close').count()) await page.getByTestId('nuke-close').first().click().catch(() => {}); };
const [wx, wy] = CELLS.warsaw;
const cases = [
  ['nuke', wx, wy, 937, async () => { await page.getByTestId('god-tool-nuke').click(); await page.getByTestId('god-nuke-size').selectOption('thermonuclear'); await page.mouse.click(800, 450); }],
  ['revolt', wx, wy, 937, async () => { await page.getByTestId('god-tool-revolt').click(); await page.mouse.click(800, 450); }],
  ['nation', wx + 6, wy, 600, async () => { await page.getByTestId('god-tool-nation').click(); await page.mouse.click(800, 450); }],
  ['city', wx - 8, wy + 4, 300, async () => { await page.getByTestId('god-tool-city').click(); await page.mouse.click(800, 450); }],
  ['raze', wx, wy, 300, async () => { await page.getByTestId('god-tool-raze').click(); await page.mouse.click(800, 450); }],
];
for (const [name, x, y, m, act] of cases) {
  await look(x, y, m);
  const h0 = await hash();
  const before = await shot(page, `c68u2_${seed}_${name}_0before.png`);
  await act();
  await page.waitForTimeout(2000);
  const actShot = await shot(page, `c68u2_${seed}_${name}_1act.png`);
  const h1 = await hash();
  const offered = await page.getByTestId('god-undo').count();
  if (offered) await page.getByTestId('god-undo').click();
  await page.waitForTimeout(2500);
  // Disarm the tool (Escape), close any alert, re-look at the same camera.
  await page.keyboard.press('Escape');
  await closeAlerts();
  await look(x, y, m);
  const h2 = await hash();
  const after = await shot(page, `c68u2_${seed}_${name}_2undone.png`);
  out.cases.push({ name, h0, h1, h2, offered, back: h0 === h2, before, actShot, after, undone: await page.evaluate(() => document.querySelector('[data-testid=god-undone]')?.innerText ?? null) });
}
out.errors = errors;
save(`c68_undo2_${seed}.json`, out);
console.log(JSON.stringify(out.cases.map((c) => [c.name, c.offered, c.back])));
await browser.close();
