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

// R178 (critic run 81, R81-N1: R174 kept short names whole by squeezing the swatches to 0 px at 360 px, and at 320 px the
// swords stood over "& 2"): on the narrowest phones each side keeps its colour, nothing in a banner stands on another, and
// the row stays on the screen; on a row of 350 px or less the allies' count gives way, never a name under five letters.
test('360 × 740 and 320 × 568: the swatches whole, nothing over another, the row on the screen', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  // A third war, for the "+n".
  await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: id('GER'), d: id('POL') });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('war-more')).toBeVisible({ timeout: 20_000 });
  for (const [w, h] of [[360, 740], [320, 568]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(300);
    const r = await page.getByTestId('war-banners').evaluate((row) => {
      const box = (e: Element): DOMRect => e.getBoundingClientRect();
      const out: string[] = [];
      for (const b of row.querySelectorAll('[data-testid=war-banner]')) {
        const bb = box(b);
        if (bb.left < 0 || bb.right > innerWidth) out.push(`banner off the screen ${bb.left}..${bb.right}`);
        const parts = [...b.querySelectorAll('.war-side > .chip-swatch, [data-testid=war-name], [data-testid=war-allies], .war-swords, [data-testid=war-death]')].filter((e) => box(e).width > 0);
        for (const s of b.querySelectorAll('.war-side > .chip-swatch')) if (box(s).width < 6) out.push(`swatch ${box(s).width} px`);
        for (const n of b.querySelectorAll<HTMLElement>('[data-testid=war-name]')) {
          const range = document.createRange();
          range.setStart(n.firstChild!, 0);
          range.setEnd(n.firstChild!, Math.min(5, n.textContent!.length));
          if (n.clientWidth + 1 < range.getBoundingClientRect().width) out.push(`"${n.textContent}" under five letters`);
        }
        for (let i = 0; i < parts.length; i++)
          for (let j = i + 1; j < parts.length; j++) {
            const [p, q] = [box(parts[i]!), box(parts[j]!)];
            if (Math.min(p.right, q.right) - Math.max(p.left, q.left) > 1) out.push(`${parts[i]!.className} over ${parts[j]!.className}`);
          }
        const t = box(b.querySelector('.war-title')!);
        if (t.right > bb.right + 1) out.push(`title past its banner by ${t.right - bb.right}`);
      }
      const more = row.querySelector('[data-testid=war-more]');
      if (more && box(more).right > innerWidth) out.push('"+n" off the screen');
      return out;
    });
    expect(r, `${w} × ${h}`).toEqual([]);
  }
});

// R180 (critic run 81, R81-N3): at 1024 × 768 the desk's closed row of three stood past its width, over the ticker and
// under the legend, and "+n" could not be clicked. The row shows the banners that fit; "+n" is clicked; wider, three again.
test('1024 × 768: the closed row within its width, "+n" clickable; three banners again when wider', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  const pairs = PAIRS.slice(0, 3).map(([a, b]) => [id(a), id(b)] as const);
  await page.evaluate((pairs) => {
    for (const [attacker, defender] of pairs) window.__warsim!.sim.command({ kind: 'declareWar', attacker, defender });
  }, pairs);
  await page.evaluate(() => window.__warsim!.sim.step(1));
  const more = page.getByTestId('war-more');
  await expect(more).toBeVisible({ timeout: 20_000 });
  const look = () =>
    page.getByTestId('war-banners').evaluate((row) => {
      const hit = (e: Element | null): boolean => {
        if (!e) return false;
        const r = e.getBoundingClientRect();
        const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return top === e || e.contains(top);
      };
      const over = (sel: string): boolean => {
        const o = document.querySelector(sel)?.getBoundingClientRect();
        if (!o) return false;
        return [...row.children].some((c) => {
          const r = c.getBoundingClientRect();
          return r.right > o.left && r.left < o.right && r.bottom > o.top && r.top < o.bottom;
        });
      };
      return { inside: row.scrollWidth <= row.clientWidth + 1, banners: row.querySelectorAll('[data-testid=war-banner]').length, more: hit(row.querySelector('[data-testid=war-more]')), legend: over('.map-legend'), ticker: over('[data-testid=ticker]') };
    });
  await expect.poll(look).toMatchObject({ inside: true, more: true, legend: false, ticker: false });
  await more.click();
  await expect(more).toHaveAttribute('aria-expanded', 'true');
  await more.click();
  await page.setViewportSize({ width: 1600, height: 900 });
  await expect.poll(async () => (await look()).banners).toBe(DESK_BANNERS);
});
