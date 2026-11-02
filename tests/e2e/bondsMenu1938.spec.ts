import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// PLAN 7.192 (critic run 26's 1–3). Playing Manchukuo at the 1938 start, beside Japan in its war on
// China:
// - Japan's menu read "Fights beside you", which hid the bond. It now reads "Your overlord · fights
//   beside you", with "Force war" live (PLAN 7.191).
// - "Propose alliance" was live although the sim turns it down. It is greyed now, its reason its title.
// - The Force war takes Manchukuo out of the Chinese war: the ticker tells it ("left its war with").

const id = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
const [MAN, JAP, CHI] = ['MAN', 'JAP', 'CHI'].map(id) as [number, number, number];

/** A point of `nation`'s ground on the screen, the camera over its capital at 6 px a cell. */
async function groundOf(page: Page, nation: number): Promise<[number, number]> {
  const cap = (await page.evaluate(async (n) => (await window.__warsim!.sim.inspect(true)).cities.find((c) => c.capitalOf === n)!, nation))!;
  await page.evaluate(({ x, y }) => window.__warsim!.view!.controller.set({ cx: x, cy: y, scale: 6 }), cap);
  await page.waitForTimeout(400);
  const spot = await page.evaluate((n) => {
    const v = window.__warsim!.view!;
    const [w, h] = [innerWidth, innerHeight];
    for (let r = 12; r < Math.min(w, h) / 2; r += 12)
      for (let k = 0; k < 16; k++) {
        const x = Math.round(w / 2 + r * Math.cos((k * Math.PI) / 8));
        const y = Math.round(h / 2 + r * Math.sin((k * Math.PI) / 8));
        if (v.nationAt(x, y) === n && v.nationAt(x + 8, y) === n && v.nationAt(x, y + 8) === n) return [x, y] as [number, number];
      }
    return null;
  }, nation);
  expect(spot, `ground of nation ${nation} on the screen`).not.toBeNull();
  return spot!;
}

test("playing Manchukuo: Japan reads its overlord and the shared war, no alliance offered; Force war's exit in the ticker", async ({ page }, info) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate((n) => window.__warsim!.player!.take(n), MAN);
  await page.evaluate(() => window.__warsim!.view!.select(0));
  const out = info.outputPath();
  mkdirSync(out, { recursive: true });
  const atWar = (a: number, b: number): Promise<boolean> =>
    page.evaluate(([a, b]) => window.__warsim!.hud.stats.value!.wars.some((w) => (w.attackers.includes(a!) && w.defenders.includes(b!)) || (w.attackers.includes(b!) && w.defenders.includes(a!))), [a, b]);
  expect(await atWar(MAN, CHI)).toBe(true);

  const jap = await groundOf(page, JAP);
  await page.mouse.click(jap[0], jap[1], { button: 'right' });
  await expect(page.getByTestId('nation-menu-name')).toHaveText('Japan');
  await expect(page.getByTestId('nation-menu-standing')).toHaveText('Your overlord · fights beside you');
  await expect(page.getByTestId('nation-menu-war')).toHaveText('Force war');
  await expect(page.getByTestId('nation-menu-war')).toBeEnabled();
  await expect(page.getByTestId('nation-menu-ally')).toBeDisabled();
  await expect(page.getByTestId('nation-menu-ally')).toHaveAttribute('title', 'It is your overlord: you are bound to it already.');
  await page.screenshot({ path: path.join(out, 'man-japan-menu.png') });

  await page.getByTestId('nation-menu-war').click();
  await expect.poll(() => atWar(MAN, JAP)).toBe(true);
  expect(await atWar(MAN, CHI)).toBe(false);
  await expect(page.getByTestId('ticker')).toContainText('Manchukuo left its war with');
  await page.screenshot({ path: path.join(out, 'man-ticker.png') });
});
