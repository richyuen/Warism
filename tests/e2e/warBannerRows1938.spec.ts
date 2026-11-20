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

// R183 (critic run 82, R82-B1; ADR-1136 (a)): R178 cut "Soviet Union" to "Sovi…" at 375 px and "Queensland" to "Que…" at
// 390 while their "& n" stayed. A long name draws five letters or more before its ellipsis (its first five letters' width
// and the ellipsis's within its box: a box's width alone did not see the cut), its banner's counts giving way first; the
// row in its width and "+n" in the view.
test('368 to 390 px: a long name draws five letters or more, the counts giving way first', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate(({ jap, chi, a, d }) => {
    window.__warsim!.sim.command({ kind: 'renameNation', nation: jap, name: 'Queensland' });
    window.__warsim!.sim.command({ kind: 'renameNation', nation: chi, name: 'Kagoshima Prefecture' });
    window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d });
  }, { jap: id('JAP'), chi: id('CHI'), a: id('GER'), d: id('POL') });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('war-name').filter({ hasText: 'Queensland' })).toHaveCount(1, { timeout: 20_000 });
  for (const [w, h] of [[368, 740], [375, 667], [384, 832], [390, 844]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(400);
    const faults = await page.getByTestId('war-banners').evaluate((row) => {
      const out: string[] = [];
      const g = document.createElement('canvas').getContext('2d')!;
      for (const n of row.querySelectorAll<HTMLElement>('[data-testid=war-name]')) {
        const text = n.textContent ?? '';
        if (n.scrollWidth <= n.clientWidth + 1) continue;
        g.font = getComputedStyle(n).font;
        const r = document.createRange();
        r.setStart(n.firstChild!, 0);
        r.setEnd(n.firstChild!, Math.min(5, text.length));
        if (r.getBoundingClientRect().width + g.measureText('…').width > n.clientWidth + 1) out.push(`"${text}" under five letters`);
        const side = n.closest('.war-side') as HTMLElement;
        if (side.scrollWidth > side.clientWidth + 1) out.push(`"${text}"'s side cut`);
      }
      if (row.scrollWidth > row.clientWidth + 1) out.push('the row past its width');
      const more = row.querySelector('[data-testid=war-more]');
      if (more && more.getBoundingClientRect().right > innerWidth) out.push('"+n" off the screen');
      return out;
    });
    expect(faults, `${w} × ${h}`).toEqual([]);
  }
  await page.screenshot({ path: test.info().outputPath('r183-phone-row.png') });
});

// R189 (critic run 83, R83-B1; ADR-1137 (d): an item on the phone's row crosses the sizes and opens and closes the panels
// beside it): a window that crossed a phone's width kept the phone's sizing: back at a phone's width 1 banner where 2 fit,
// back on a desk "Nationalist Sp…" cut with room. Upright, a desk, a narrow desk, sideways with a nation's panel and
// History opened and closed, upright again and a wide desk: on a phone the banners that fit (as many as at the start),
// on a desk no name with the phone's width and none cut that fits.
test('a window crossing a phone\'s width: the row counted again, a desk name whole', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 384, height: 832 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: id('GER'), d: id('POL') });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('war-more')).toBeVisible({ timeout: 20_000 });
  const look = () =>
    page.getByTestId('war-banners').evaluate((row) => {
      const names = [...row.querySelectorAll<HTMLElement>('[data-testid=war-name]')];
      return {
        banners: row.querySelectorAll('[data-testid=war-banner]').length,
        inside: row.scrollWidth <= row.clientWidth + 1,
        widths: names.filter((n) => n.style.width !== '').map((n) => n.textContent),
        cut: names.filter((n) => n.scrollWidth > n.clientWidth + 1).map((n) => n.textContent),
        tight: row.querySelectorAll('.war-tight').length,
      };
    });
  await page.waitForTimeout(300);
  const start = await look();
  expect(start.banners, 'upright at the start').toBe(2);
  const steps: [number, number, string][] = [
    [1280, 720, 'desk'],
    [1024, 768, 'desk'],
    [844, 390, 'sideways'],
    [384, 832, 'phone'],
    [1600, 900, 'desk'],
  ];
  for (const [w, h, kind] of steps) {
    await page.setViewportSize({ width: w, height: h });
    if (kind === 'sideways') {
      // A nation's panel beside the row, opened and closed; History over it, opened and closed.
      await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), id('GER'));
      await expect(page.getByTestId('nation-panel')).toBeVisible();
      await page.evaluate(() => window.__warsim!.hud.toggleHistory());
      await expect(page.getByTestId('history-panel')).toBeVisible();
      await page.evaluate(() => window.__warsim!.hud.toggleHistory());
      await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
      await expect(page.getByTestId('nation-panel')).toHaveCount(0);
    }
    await page.waitForTimeout(400);
    const r = await look();
    expect(r.inside, `${w} × ${h}: the row in its width`).toBe(true);
    if (kind === 'desk') {
      expect(r.widths, `${w} × ${h}: no name with the phone's width`).toEqual([]);
      expect(r.tight, `${w} × ${h}: no banner without its counts`).toBe(0);
      expect(r.cut, `${w} × ${h}: no name cut`).toEqual([]);
    } else if (kind === 'phone') expect(r.banners, `${w} × ${h}: the banners as at the start`).toBe(start.banners);
  }
});

// R193 (critic run 83's design objection; ADR-1137 (d)): shrunk in proportion, "Kagosh…" lost as much as "Chukotka
// Auton…". The longest names give way first: on a phone's closed row no long name is cut narrower than one left whole,
// and none under five letters; upright, a desk, sideways with a nation's panel opened and closed, and back.
test('the longest names give way first, at every size', async ({ page }) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate(({ jap, chi }) => {
    window.__warsim!.sim.command({ kind: 'renameNation', nation: jap, name: 'Kagoshima' });
    window.__warsim!.sim.command({ kind: 'renameNation', nation: chi, name: 'Chukotka Autonomous Okrug' });
  }, { jap: id('JAP'), chi: id('CHI') });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('war-name').filter({ hasText: 'Chukotka' })).toHaveCount(1, { timeout: 20_000 });
  for (const [w, h] of [[390, 844], [1280, 720], [844, 390], [375, 667], [390, 844]] as const) {
    await page.setViewportSize({ width: w, height: h });
    if (h < 500) {
      await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), id('GER'));
      await expect(page.getByTestId('nation-panel')).toBeVisible();
      await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
    }
    await page.waitForTimeout(400);
    const r = await page.getByTestId('war-banners').evaluate((row) => {
      const g = document.createElement('canvas').getContext('2d')!;
      const long = [...row.querySelectorAll<HTMLElement>('[data-testid=war-name]:not(.war-name-short)')];
      const cut = long.filter((n) => n.scrollWidth > n.clientWidth + 1);
      const whole = long.filter((n) => n.scrollWidth <= n.clientWidth + 1);
      const under = cut.filter((n) => {
        g.font = getComputedStyle(n).font;
        const range = document.createRange();
        range.setStart(n.firstChild!, 0);
        range.setEnd(n.firstChild!, 5);
        return range.getBoundingClientRect().width + g.measureText('…').width > n.clientWidth + 1;
      });
      const narrowestCut = Math.min(...cut.map((n) => n.clientWidth));
      const widerWhole = whole.filter((n) => n.clientWidth > narrowestCut + 1).map((n) => n.textContent);
      // Cut above its five letters, a name is at the one cap: all such the same width.
      const floor = (n: HTMLElement): number => {
        g.font = getComputedStyle(n).font;
        const range = document.createRange();
        range.setStart(n.firstChild!, 0);
        range.setEnd(n.firstChild!, 5);
        return range.getBoundingClientRect().width + g.measureText('…').width;
      };
      const capped = cut.filter((n) => n.clientWidth > floor(n) + 2).map((n) => n.clientWidth);
      const spread = capped.length > 1 ? Math.max(...capped) - Math.min(...capped) : 0;
      return { under: under.map((n) => n.textContent), widerWhole, spread, cut: cut.map((n) => `${n.textContent}:${n.clientWidth}`) };
    });
    expect(r.under, `${w} × ${h}: under five letters`).toEqual([]);
    expect(r.spread, `${w} × ${h}: names cut above their floor at one width (${r.cut.join(', ')})`).toBeLessThanOrEqual(1.5);
    expect(r.widerWhole, `${w} × ${h}: whole and wider than a name cut`).toEqual([]);
  }
});

// R194 (critic run 84, R84-N1; ADR-1137 (d)): on a desk 601 to 768 px wide one banner wider than its row spilled over the
// ticker's second row. The row in its width and clear of the news at every desk, a phone before and after, a nation's
// panel and History opened and closed on the narrow desk; the "+n" still opens the rest there.
test('a narrow desk\'s row stays in its width and off the news', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 384, height: 832 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: id('GER'), d: id('POL') });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('war-more')).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(300);
  const start = await page.getByTestId('war-banner').count();
  for (const [w, h] of [[640, 800], [620, 900], [700, 800], [768, 1024], [1280, 720], [384, 832]] as const) {
    await page.setViewportSize({ width: w, height: h });
    if (w === 640) {
      await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), id('GER'));
      await expect(page.getByTestId('nation-panel')).toBeVisible();
      await page.evaluate(() => window.__warsim!.hud.toggleHistory());
      await page.evaluate(() => window.__warsim!.hud.toggleHistory());
      await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
      await expect(page.getByTestId('nation-panel')).toHaveCount(0);
    }
    await page.waitForTimeout(400);
    const r = await page.getByTestId('war-banners').evaluate((row) => {
      const box = (e: Element): DOMRect => e.getBoundingClientRect();
      const over = (a: DOMRect, b: DOMRect): boolean => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      const items = [...row.children].map(box);
      const news = [...document.querySelectorAll('.ticker .ticker-row')].map(box);
      return { inside: row.scrollWidth <= row.clientWidth + 1, onNews: items.filter((i) => news.some((n) => over(i, n))).length };
    });
    expect(r.inside, `${w} × ${h}: the row in its width`).toBe(true);
    expect(r.onNews, `${w} × ${h}: nothing of the row over the news`).toBe(0);
    if (w === 384) expect(await page.getByTestId('war-banner').count(), `${w} × ${h}: the phone's banners as at the start`).toBe(start);
    if (w === 620) {
      await page.getByTestId('war-more').click();
      await expect(page.getByTestId('war-banners')).toHaveClass(/opened/);
      expect(await page.getByTestId('war-banner').count(), `${w} × ${h}: "+n" opens the rest`).toBeGreaterThan(1);
      await page.getByTestId('war-more').click();
      await expect(page.getByTestId('war-banners')).not.toHaveClass(/opened/);
    }
  }
});

// R197 (critic run 85, R85-N1; ADR-1137 (d)): a desk 601 to 700 px wide showed no war, "+3" alone, its row's room kept for
// a left panel that was not open. The row takes the band free between the news and the legend: a banner at least at every
// desk, the row in its width and over nothing of the page's; a phone of 600 px on each side, a nation's panel and History
// opened and closed at 640.
test('a narrow desk shows a war in the room between the news and the legend', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 600, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: id('GER'), d: id('POL') });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('war-more')).toBeVisible({ timeout: 20_000 });
  for (const [w, h] of [[601, 800], [620, 900], [640, 800], [700, 800], [1280, 720], [600, 800], [640, 800]] as const) {
    await page.setViewportSize({ width: w, height: h });
    if (w === 640) {
      await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), id('GER'));
      await expect(page.getByTestId('nation-panel')).toBeVisible();
      await page.evaluate(() => window.__warsim!.hud.toggleHistory());
      await page.evaluate(() => window.__warsim!.hud.toggleHistory());
      await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
      await expect(page.getByTestId('nation-panel')).toHaveCount(0);
    }
    await page.waitForTimeout(400);
    const r = await page.getByTestId('war-banners').evaluate((row) => {
      const over = (a: DOMRect, b: DOMRect): boolean => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      const items = [...row.children].map((c) => c.getBoundingClientRect());
      const others = [...row.parentElement!.children].filter((c) => c !== row).map((c) => c.getBoundingClientRect()).filter((b) => b.width > 0 && b.height > 0);
      return {
        banners: row.querySelectorAll('[data-testid=war-banner]').length,
        inside: row.scrollWidth <= row.clientWidth + 1 && items.every((i) => i.left >= 0 && i.right <= innerWidth),
        over: items.filter((i) => others.some((o) => over(i, o))).length,
      };
    });
    expect(r.banners, `${w} × ${h}: a war shown`).toBeGreaterThanOrEqual(1);
    expect(r.inside, `${w} × ${h}: the row in its width`).toBe(true);
    expect(r.over, `${w} × ${h}: the row over nothing`).toBe(0);
  }
});

// R200 (critic run 86, R86-N2; ADR-1137 (d)): in the sea-control, air-control and fallout modes the legend took 315 px of a
// 700 px desk and no war was shown. On a desk of 800 px or less the legend is folded to its title until clicked: a war shown
// in every map mode at 680 to 760, the row over nothing; the legend opened and closed again, a nation's panel opened and
// closed; a wide desk keeps its legend open, a phone its own fold.
test('a narrow desk folds the legend and shows a war in every map mode', async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 700, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: id('GER'), d: id('POL') });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('war-more')).toBeVisible({ timeout: 20_000 });
  const look = () =>
    page.getByTestId('war-banners').evaluate((row) => {
      const over = (a: DOMRect, b: DOMRect): boolean => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      const items = [...row.children].map((c) => c.getBoundingClientRect());
      const others = [...row.parentElement!.children].filter((c) => c !== row).map((c) => c.getBoundingClientRect()).filter((b) => b.width > 0 && b.height > 0);
      return { banners: row.querySelectorAll('[data-testid=war-banner]').length, inside: row.scrollWidth <= row.clientWidth, over: items.filter((i) => others.some((o) => over(i, o))).length };
    });
  for (const [w, h] of [[700, 800], [680, 800], [760, 800], [1280, 720], [390, 844], [700, 800]] as const) {
    await page.setViewportSize({ width: w, height: h });
    for (const mode of ['seaControl', 'airControl', 'fallout', 'political'] as const) {
      await page.evaluate((m) => window.__warsim!.hud.setMapMode(m), mode);
      await page.waitForTimeout(400);
      const legend = page.getByTestId('map-legend');
      if (w <= 800 && h > 500 && w > 600) {
        await expect(legend, `${w} × ${h} ${mode}: the legend folded`).toHaveAttribute('data-open', 'false');
        const r = await look();
        expect(r.banners, `${w} × ${h} ${mode}: a war shown`).toBeGreaterThanOrEqual(1);
        expect(r.inside, `${w} × ${h} ${mode}: the row in its width`).toBe(true);
        expect(r.over, `${w} × ${h} ${mode}: the row over nothing`).toBe(0);
      } else if (w > 800) await expect(legend, `${w} × ${h}: a wide desk's legend open`).not.toHaveAttribute('data-open', /.*/);
    }
    if (w === 700) {
      // The folded legend opened (its rows and the units' signs) and closed; a nation's panel opened and closed.
      await page.getByTestId('legend-toggle').click();
      await expect(page.getByTestId('map-legend')).toHaveAttribute('data-open', 'true');
      await expect(page.locator('.map-legend .legend-row').first()).toBeVisible();
      await page.getByTestId('legend-toggle').click();
      await expect(page.getByTestId('map-legend')).toHaveAttribute('data-open', 'false');
      await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), id('GER'));
      await expect(page.getByTestId('nation-panel')).toBeVisible();
      await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
      await page.waitForTimeout(300);
      expect((await look()).banners, `${w} × ${h}: a war shown after the panel`).toBeGreaterThanOrEqual(1);
    }
  }
});
