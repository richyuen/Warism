import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';
/** `MAX_BANNERS` of `src/ui/WarBanners.tsx` (a .tsx the specs do not import). */
const MAX_BANNERS = 6;
/** `DESK_BANNERS`: those of the one row a desk shows until "+N" opens the rest (ROADMAP R110). */
const DESK_BANNERS = 3;

// PLAN 7.4f6 (the critic's N16: "war banners stand three rows deep over the map"): with more wars
// than banners, at most two rows of them at 1400 × 800 and wider, the rest a "+N"; and the panels
// are opaque (N15: names and counters showed through the ranking).

const id = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
const PAIRS = [['GER', 'POL'], ['ITA', 'YUG'], ['FRA', 'SPA'], ['ENG', 'IRE'], ['SOV', 'FIN'], ['TUR', 'GRE'], ['HUN', 'ROM'], ['BUL', 'ALB'], ['SWE', 'NOR']] as const;

for (const [w, h] of [[1400, 800], [1920, 1080]] as const) {
  test(`${w} × ${h}: at most two rows of war banners, the rest a "+N"; opaque panels`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: w, height: h });
    // The ranking open, as a player who asked for it has it (ROADMAP R94a: closed on a desk until asked for).
    await page.addInitScript(() => localStorage.setItem('warsim.showStats', '1'));
    await page.goto('/?scenario=1938&paused=1&seed=1938');
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
    const pairs = PAIRS.map(([a, b]) => [id(a), id(b)] as const).filter(([a, b]) => a > 0 && b > 0);
    await page.evaluate((pairs) => {
      for (const [attacker, defender] of pairs) window.__warsim!.sim.command({ kind: 'declareWar', attacker, defender });
    }, pairs);
    await page.evaluate(() => window.__warsim!.sim.step(1));
    const wars = await page.evaluate(async () => (await window.__warsim!.sim.inspect()).wars.length);
    expect(wars, 'more wars than banners').toBeGreaterThan(MAX_BANNERS);
    const rowsOf = (): Promise<number> => page.getByTestId('war-banner').evaluateAll((els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().top))).size);
    // One row until "+N" opens the rest (ROADMAP R110): the newest wars.
    await expect(page.getByTestId('war-banner')).toHaveCount(DESK_BANNERS);
    await expect(page.getByTestId('war-more')).toContainText(`+${wars - DESK_BANNERS}`);
    expect(await rowsOf(), 'rows of banners').toBe(1);
    // Opened: as before R110, at most two rows of MAX_BANNERS.
    await page.getByTestId('war-more').click();
    await expect(page.getByTestId('war-banner')).toHaveCount(MAX_BANNERS);
    expect(await rowsOf(), 'rows of banners, opened').toBeLessThanOrEqual(2);
    const bg = await page.getByTestId('stats-ranking').evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg, 'the ranking\'s fill opaque').toContain('rgb(52, 58, 69)');
  });
}

// R168 (critic run 79, R79-N1): the random world's long names wrapped mid-phrase on a banner ("Chukotka Autonomous / Okrug
// & / 3", "Orientale & / 1 ⚔ Diffa & / 2"). Each side stands on one line, a long name cut short, its allies' count whole.
test('a banner\'s sides each on one line, a long name cut short with its count whole', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  const pairs = PAIRS.map(([a, b]) => [id(a), id(b)] as const).filter(([a, b]) => a > 0 && b > 0);
  const names = ['Chukotka Autonomous Okrug', 'Democratic Republic of Orientale', 'Free Tete', 'Eastern Cape', 'Diffa'];
  await page.evaluate(({ pairs, names }) => {
    for (const [i, [attacker, defender]] of pairs.entries()) {
      window.__warsim!.sim.command({ kind: 'renameNation', nation: attacker, name: names[(2 * i) % names.length]! });
      window.__warsim!.sim.command({ kind: 'renameNation', nation: defender, name: names[(2 * i + 1) % names.length]! });
      window.__warsim!.sim.command({ kind: 'declareWar', attacker, defender });
    }
    // Allies on a side: an "& n" beside a long name.
    window.__warsim!.sim.command({ kind: 'declareWar', attacker: pairs[0]![0], defender: pairs[1]![1] });
  }, { pairs, names });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('war-name').first()).toContainText(/Chukotka|Orientale|Tete|Cape|Diffa/, { timeout: 20_000 });
  // The closed row (three banners on one line, where the critic saw them wrap), then opened.
  for (const opened of [false, true]) {
    if (opened) await page.getByTestId('war-more').click();
    const sides = await page.locator('.war-side').evaluateAll((els) =>
      els.map((e) => {
        const name = e.querySelector<HTMLElement>('[data-testid=war-name]')!;
        const allies = e.querySelector<HTMLElement>('[data-testid=war-allies]');
        const lh = parseFloat(getComputedStyle(name).lineHeight) || parseFloat(getComputedStyle(name).fontSize) * 1.3;
        return { text: name.textContent, h: name.getBoundingClientRect().height, lh, allies: allies ? { h: allies.getBoundingClientRect().height, w: allies.scrollWidth, cw: allies.clientWidth } : null };
      }),
    );
    expect(sides.some((s) => s.allies !== null), 'a side with allies').toBe(true);
    for (const s of sides) {
      expect(s.h, `"${s.text}" on one line`).toBeLessThan(s.lh * 1.5);
      if (s.allies) {
        expect(s.allies.h, `"${s.text}"'s count on one line`).toBeLessThan(s.lh * 1.5);
        expect(s.allies.w, `"${s.text}"'s count whole`).toBeLessThanOrEqual(s.allies.cw);
      }
    }
  }
});

// R174 (critic run 80, R80-B1: R168 cut the phone's names, every 1938 game opening "J… & 2 ⚔ C… & 1", "China" 0 of 5
// letters): on a phone's closed row a short name is whole and a long one keeps its first five letters; the allies' count
// stays whole, and the row stays on the screen. Then with a long name and allies at the row's head.
test('390 × 844: on the closed row a short name whole, a long one five letters, the count whole', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await expect(page.getByTestId('war-name').first()).toBeVisible({ timeout: 20_000 });
  const look = () =>
    page.locator('[data-testid=war-banners] .war-side').evaluateAll((els) =>
      els.map((e) => {
        const name = e.querySelector<HTMLElement>('[data-testid=war-name]')!;
        const allies = e.querySelector<HTMLElement>('[data-testid=war-allies]');
        const text = name.textContent ?? '';
        const node = name.firstChild!;
        const range = document.createRange();
        range.setStart(node, 0);
        range.setEnd(node, Math.min(5, text.length));
        const banner = e.closest('[data-testid=war-banner]')!.getBoundingClientRect();
        return { text, whole: name.scrollWidth <= name.clientWidth + 1, five: range.getBoundingClientRect().width, w: name.clientWidth, allies: allies ? allies.scrollWidth <= allies.clientWidth + 1 : true, on: banner.left >= 0 && banner.right <= innerWidth };
      }),
    );
  const judge = (sides: Awaited<ReturnType<typeof look>>): void => {
    expect(sides.length, 'sides on the row').toBeGreaterThanOrEqual(2);
    for (const s of sides) {
      if ([...s.text].length <= 8) expect(s.whole, `"${s.text}" whole`).toBe(true);
      else expect(s.w, `"${s.text}": its first five letters`).toBeGreaterThanOrEqual(s.five);
      expect(s.allies, `"${s.text}"'s count whole`).toBe(true);
      expect(s.on, `"${s.text}"'s banner on the screen`).toBe(true);
    }
  };
  judge(await look());
  // Long names with allies on both sides of the first banner.
  const [jap, chi] = [id('JAP'), id('CHI')];
  await page.evaluate(({ jap, chi }) => {
    window.__warsim!.sim.command({ kind: 'renameNation', nation: jap, name: 'Chukotka Autonomous Okrug' });
    window.__warsim!.sim.command({ kind: 'renameNation', nation: chi, name: 'Democratic Republic of Orientale' });
  }, { jap, chi });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('war-name').filter({ hasText: 'Chukotka' })).toHaveCount(1, { timeout: 20_000 });
  judge(await look());
  await page.screenshot({ path: test.info().outputPath('r174-phone-row.png') });
});
