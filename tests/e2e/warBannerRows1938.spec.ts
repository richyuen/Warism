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
      // A name's first `k` letters and the ellipsis.
      const letters = (n: HTMLElement, k: number): number => {
        g.font = getComputedStyle(n).font;
        const range = document.createRange();
        range.setStart(n.firstChild!, 0);
        range.setEnd(n.firstChild!, Math.min(k, n.firstChild!.textContent!.length));
        return range.getBoundingClientRect().width + g.measureText('…').width;
      };
      const firstWord = (n: HTMLElement): number => {
        const k = (n.textContent ?? '').search(/\s/);
        return k < 0 ? Infinity : Math.max(letters(n, 5), letters(n, k));
      };
      // ADR-1144 (b) (the user's choice, R213): while a banner keeps its "& n", no name is cut inside its first word.
      const counts = [...row.querySelectorAll<HTMLElement>('[data-testid=war-allies]')].some((a) => a.getBoundingClientRect().width > 0);
      const inside = cut.filter((n) => n.clientWidth + 1 < firstWord(n));
      const inWord = counts ? inside.map((n) => `${n.textContent}:${n.clientWidth}`) : [];
      // Cut above its floor (its first word while no name is cut inside one, else its five letters), a name is at the one
      // cap: all such the same width.
      const floor = (n: HTMLElement): number => (inside.length === 0 ? Math.min(firstWord(n), n.scrollWidth) : letters(n, 5));
      const capped = cut.filter((n) => n.clientWidth > floor(n) + 2).map((n) => n.clientWidth);
      const spread = capped.length > 1 ? Math.max(...capped) - Math.min(...capped) : 0;
      return { under: under.map((n) => n.textContent), inWord, widerWhole, spread, cut: cut.map((n) => `${n.textContent}:${n.clientWidth}`) };
    });
    expect(r.under, `${w} × ${h}: under five letters`).toEqual([]);
    expect(r.inWord, `${w} × ${h}: cut inside the first word while a count stands`).toEqual([]);
    expect(r.spread, `${w} × ${h}: names cut above their floor at one width (${r.cut.join(', ')})`).toBeLessThanOrEqual(1.5);
    expect(r.widerWhole, `${w} × ${h}: whole and wider than a name cut`).toEqual([]);
  }
});

// R213 (critic runs 88 and 89, R88-N4; ADR-1144 (b), the user's choice): at 393 px Nationalist Spain's two wars read
// "Natio… ⚔ Portugal & 2" and "Natio… & 1 ⚔ Italy & 2", the name cut to five letters while the counts stood. Now a long
// name gives way to its first word, then the counts go, and only then five letters: two banners of one row never read
// alike while their wars differ, and the name reads "Nationalist…" at least; sideways the names whole.
test('a phone\'s row: two wars of one nation read apart, the name to its first word before the counts', async ({ page }) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate(({ nsp, por, ita }) => {
    // Italy first: a war on a partner leaves the wars fought beside it (`forceWar`), and would end the other.
    window.__warsim!.sim.command({ kind: 'forceWar', attacker: nsp, defender: ita });
    window.__warsim!.sim.command({ kind: 'forceWar', attacker: nsp, defender: por });
  }, { nsp: id('NSP'), por: id('POR'), ita: id('ITA') });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  // Peace in the others (Japan's and China's), so that the banners the row shows are Nationalist Spain's.
  const wars = await page.evaluate(async (nsp) => {
    const all = (await window.__warsim!.sim.inspect()).wars;
    for (const x of all) if (!x.attackers.includes(nsp) && !x.defenders.includes(nsp)) window.__warsim!.sim.command({ kind: 'forcePeace', war: x.id });
    window.__warsim!.sim.step(1);
    return (await window.__warsim!.sim.inspect()).wars.map((x) => x.attackers.includes(nsp) || x.defenders.includes(nsp));
  }, id('NSP'));
  expect(wars.filter(Boolean).length, 'Nationalist Spain in two wars or more').toBeGreaterThanOrEqual(2);
  expect(wars.every(Boolean), 'its wars alone').toBe(true);
  for (const [w, h] of [[393, 852], [393, 659], [734, 343], [393, 852]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(400);
    const r = await page.getByTestId('war-banners').evaluate((row) => {
      const g = document.createElement('canvas').getContext('2d')!;
      // A name as drawn: whole, or the letters that fit before its ellipsis.
      const drawn = (n: HTMLElement): string => {
        const text = n.textContent ?? '';
        if (n.scrollWidth <= n.clientWidth + 1) return text;
        g.font = getComputedStyle(n).font;
        const room = n.clientWidth - g.measureText('…').width;
        const range = document.createRange();
        let k = 0;
        while (k < text.length) {
          range.setStart(n.firstChild!, 0);
          range.setEnd(n.firstChild!, k + 1);
          if (range.getBoundingClientRect().width > room + 0.5) break;
          k++;
        }
        return `${text.slice(0, k).trimEnd()}…`;
      };
      const banners = [...row.querySelectorAll<HTMLElement>('[data-testid=war-banner]')];
      return banners.map((b) => {
        const parts = [...b.querySelectorAll<HTMLElement>('[data-testid=war-name], [data-testid=war-allies]')]
          .filter((e) => e.getBoundingClientRect().width > 0)
          .map((e) => (e.dataset.testid === 'war-name' ? drawn(e) : (e.textContent ?? '').trim()));
        return { war: b.dataset.war ?? '', text: parts.join(' '), names: [...b.querySelectorAll<HTMLElement>('[data-testid=war-name]')].map((n) => ({ full: n.textContent ?? '', drawn: drawn(n) })) };
      });
    });
    const nsp = r.flatMap((b) => b.names).filter((n) => n.full.startsWith('Nationalist'));
    expect(nsp.length, `${w} × ${h}: Nationalist Spain's wars on the row (${r.map((b) => b.text).join(' | ')})`).toBeGreaterThanOrEqual(2);
    for (const n of nsp) {
      if (w > h) expect(n.drawn, `${w} × ${h}: whole sideways`).toBe(n.full);
      else expect(n.drawn.replace('…', ''), `${w} × ${h}: "${n.drawn}" reads its first word`).toMatch(/^Nationalist/);
    }
    for (let i = 0; i < r.length; i++)
      for (let j = i + 1; j < r.length; j++)
        if (r[i]!.war !== r[j]!.war) expect(r[i]!.text, `${w} × ${h}: two wars read alike`).not.toBe(r[j]!.text);
  }
  await page.screenshot({ path: test.info().outputPath('r213-phone-row.png') });
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

// R202 (critic run 86's design objection; ADR-1137 (d)): centred in the free band, the desk's row stood 16 to 44 px off the
// bar's centre and moved with the map mode. On the bar's centre when the banners the band holds fit there too: at 1600 and
// 1920 in every mode the row's middle the page's; a narrow desk still shows a war (R197); a nation's panel and History
// opened and closed at 1600, a phone and back.
test('a wide desk keeps the war row on the bar\'s centre in every map mode', async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: id('GER'), d: id('POL') });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('war-banner')).toHaveCount(3, { timeout: 20_000 });
  const look = () =>
    page.getByTestId('war-banners').evaluate((row) => {
      const r = row.getBoundingClientRect();
      const ui = row.parentElement!.getBoundingClientRect();
      return { banners: row.querySelectorAll('[data-testid=war-banner]').length, off: r.left + r.width / 2 - (ui.left + ui.width / 2), inside: row.scrollWidth <= row.clientWidth };
    });
  for (const [w, h] of [[1600, 900], [700, 800], [1920, 1080], [390, 844], [1600, 900]] as const) {
    await page.setViewportSize({ width: w, height: h });
    if (w === 1600) {
      await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), id('GER'));
      await expect(page.getByTestId('nation-panel')).toBeVisible();
      await page.evaluate(() => window.__warsim!.hud.toggleHistory());
      await page.evaluate(() => window.__warsim!.hud.toggleHistory());
      await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
      await expect(page.getByTestId('nation-panel')).toHaveCount(0);
    }
    for (const mode of ['political', 'seaControl', 'airControl', 'fallout'] as const) {
      await page.evaluate((m) => window.__warsim!.hud.setMapMode(m), mode);
      await page.waitForTimeout(400);
      const r = await look();
      expect(r.inside, `${w} × ${h} ${mode}: the row in its width`).toBe(true);
      if (w >= 1600) {
        expect(Math.abs(r.off), `${w} × ${h} ${mode}: on the bar's centre`).toBeLessThanOrEqual(1);
        expect(r.banners, `${w} × ${h} ${mode}: three banners`).toBe(3);
      } else if (w > 600) expect(r.banners, `${w} × ${h} ${mode}: a war shown`).toBeGreaterThanOrEqual(1);
    }
  }
});

// R203 (critic run 87, R87-B1; ADR-1140 (b), the user's choice; ADR-1141's sizes): on a desk of 800 px or less the legend
// R200 folds lay, once opened, over the war row (247 to 329 sampled points at 700 × 800 in the sea, air and fallout modes),
// and the row was not counted again. The narrow desk's legend stands at the top left as a phone's does, folded and opened:
// the row read while the legend is open, by the element at its points both ways; a 1 px nudge leaves the banners as they
// were; the legend gives way to a nation's panel and History and comes back; the five supported sizes crossed and back.
test('a narrow desk\'s legend stands at the top left, and opened lies over no war', async ({ page }) => {
  test.setTimeout(300_000);
  await page.setViewportSize({ width: 700, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: id('GER'), d: id('POL') });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('war-more')).toBeVisible({ timeout: 20_000 });
  const look = () =>
    page.evaluate(() => {
      const row = document.querySelector('[data-testid=war-banners]');
      const legend = document.querySelector('[data-testid=map-legend]')!;
      // The points of `outer` at which the element shown is `inner`'s.
      const hit = (outer: Element | null, inner: Element | null): number => {
        if (!outer || !inner) return 0;
        const r = outer.getBoundingClientRect();
        let n = 0;
        for (let x = r.left + 1; x < r.right - 1; x += 2) for (let y = r.top + 1; y < r.bottom - 1; y += 2) if (inner.contains(document.elementFromPoint(x, y))) n++;
        return n;
      };
      const l = legend.getBoundingClientRect();
      const meets = (b: DOMRect): boolean => l.left < b.right - 1 && b.left < l.right - 1 && l.top < b.bottom - 1 && b.top < l.bottom - 1;
      return {
        banners: row?.querySelectorAll('[data-testid=war-banner]').length ?? 0,
        rowOverLegend: hit(legend, row),
        legendOverRow: hit(row, legend),
        left: l.left,
        foot: l.bottom,
        rowTop: row?.getBoundingClientRect().top ?? innerHeight,
        // The page's other boxes the legend's box meets.
        meets: [...legend.parentElement!.children].filter((c) => c !== legend && c.getBoundingClientRect().width > 0 && meets(c.getBoundingClientRect())).map((c) => c.className.toString().split(' ')[0]),
      };
    });
  const toggle = page.getByTestId('legend-toggle');
  for (const [w, h] of [[700, 800], [393, 659], [393, 852], [734, 343], [852, 393], [2560, 1305], [780, 800], [640, 520], [700, 800]] as const) {
    await page.setViewportSize({ width: w, height: h });
    const phone = w <= 600 || h <= 500;
    const narrow = !phone && w <= 800;
    // The ranking as each view has it unasked: folded to its bar on a phone, closed on a desk (R94a).
    await page.evaluate((shown) => window.__warsim!.hud.toggleStats(!shown), phone);
    for (const mode of ['seaControl', 'fallout', 'political'] as const) {
      await page.evaluate((m) => window.__warsim!.hud.setMapMode(m), mode);
      await page.waitForTimeout(400);
      const at = `${w} × ${h} ${mode}`;
      if (!phone && !narrow) {
        // A wide desk's legend open in its place, bottom right, the row clear of it (R197).
        await expect(toggle, `${at}: no fold`).toHaveCount(0);
        const r = await look();
        expect(r.banners, `${at}: three banners`).toBe(3);
        expect([r.rowOverLegend, r.legendOverRow], `${at}: the row and the legend apart`).toEqual([0, 0]);
        continue;
      }
      await expect(page.getByTestId('map-legend'), `${at}: the legend folded`).toHaveAttribute('data-open', 'false');
      const folded = await look();
      expect(folded.left, `${at}: the legend at the left`).toBeLessThan(20);
      expect(folded.foot, `${at}: the folded legend at the top`).toBeLessThan(100);
      if (narrow) expect(folded.banners, `${at}: a war shown`).toBeGreaterThanOrEqual(1);
      await toggle.click();
      await expect(page.getByTestId('map-legend')).toHaveAttribute('data-open', 'true');
      await expect(page.locator('.map-legend .legend-row').first()).toBeVisible();
      await page.waitForTimeout(600);
      const opened = await look();
      expect([opened.rowOverLegend, opened.legendOverRow], `${at}: opened, the row and the legend apart`).toEqual([0, 0]);
      expect(opened.banners, `${at}: opened, the banners as folded`).toBe(folded.banners);
      // An upright phone's ranking, folded beside the legend's title, gives way while the legend is open (R208: the
      // opened legend lay over its bar) and is back as the legend folds; on its side there is room for both.
      if (w <= 600) await expect(page.getByTestId('stats-ranking'), `${at}: the ranking gone under the opened legend`).toBeHidden();
      else if (phone) await expect(page.getByTestId('stats-ranking'), `${at}: the ranking beside the opened legend`).toBeVisible();
      if (phone) expect(opened.meets.filter((c) => c !== 'ticker'), `${at}: the opened legend on nothing but the news`).toEqual([]);
      // On a phone on its side the sea legend is higher than the room over the row: its rows scroll (734 × 343).
      expect(opened.foot, `${at}: the opened legend above the row`).toBeLessThanOrEqual(opened.rowTop);
      if (narrow) {
        expect(opened.meets, `${at}: the opened legend on nothing of the page's`).toEqual([]);
        // A stale count shows as another after 1 px.
        await page.setViewportSize({ width: w + 1, height: h });
        await page.waitForTimeout(300);
        await page.setViewportSize({ width: w, height: h });
        await page.waitForTimeout(500);
        const nudged = await look();
        expect(nudged.banners, `${at}: nudged, the banners as shown`).toBe(opened.banners);
        expect([nudged.rowOverLegend, nudged.legendOverRow], `${at}: nudged, apart`).toEqual([0, 0]);
      }
      if (w === 700 && mode === 'seaControl') {
        // Opened, it gives way to a nation's panel and to History, and stands open again as each closes; the ranking
        // opened beside it meets neither.
        await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), id('GER'));
        await expect(page.getByTestId('nation-panel')).toBeVisible();
        await expect(page.getByTestId('map-legend'), `${at}: gone under a nation's panel`).toBeHidden();
        await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
        await expect(page.getByTestId('map-legend')).toBeVisible();
        await page.evaluate(() => window.__warsim!.hud.toggleHistory());
        await expect(page.getByTestId('map-legend'), `${at}: gone under History`).toBeHidden();
        await page.evaluate(() => window.__warsim!.hud.toggleHistory());
        await expect(page.getByTestId('map-legend')).toHaveAttribute('data-open', 'true');
        await page.evaluate(() => window.__warsim!.hud.toggleStats(false));
        await expect(page.getByTestId('stats-ranking')).toBeVisible();
        await page.waitForTimeout(300);
        const beside = await look();
        expect(beside.meets, `${at}: the opened legend beside the ranking`).toEqual([]);
        expect([beside.rowOverLegend, beside.legendOverRow], `${at}: with the ranking, apart`).toEqual([0, 0]);
        await page.evaluate(() => window.__warsim!.hud.toggleStats(true));
        await expect(page.getByTestId('stats-ranking')).toHaveCount(0);
      }
      await toggle.click();
      await expect(page.getByTestId('map-legend')).toHaveAttribute('data-open', 'false');
      if (phone) {
        // Folded again: the ranking's toggle beside it takes a tap, and the legend's title is clear of it.
        await expect(page.getByTestId('stats-ranking'), `${at}: the ranking back`).toBeVisible();
        expect((await look()).meets, `${at}: the folded legend on nothing`).toEqual([]);
      }
    }
  }
});

// R204 (critic run 87, R87-N2; ADR-1142): R202 chose the row's side, the bar's centre or the free band's middle, at every
// draw from the banners' widths, and at 1100 to 1366 px the row jumped 24 to 44 px when a war on it gave its place to one
// with longer or shorter names. The side is held while the band and the number of banners hold. A war of long names
// (the Spanish one) leaves the row for one of short names, then one of short names for one of long: with three banners
// before and after the row stands where it stood; a change of map mode and back chooses again.
test('a desk\'s war row keeps its side when a war on it gives its place to another', async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  const war = (a: string, d: string) => page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: id(a), d: id(d) });
  // The war one of the two is in, by the stats.
  const warOf = (tag: string) => page.evaluate((n) => window.__warsim!.hud.stats.value!.wars.find((w) => w.attackers.includes(n) || w.defenders.includes(n))?.id ?? -1, id(tag));
  const look = () =>
    page.getByTestId('war-banners').evaluate((row) => {
      const r = row.getBoundingClientRect();
      const ui = row.parentElement!.getBoundingClientRect();
      const banners = [...row.querySelectorAll('[data-testid=war-banner]')];
      return { banners: banners.length, wars: banners.map((b) => Number(b.getAttribute('data-war'))), off: r.left + r.width / 2 - (ui.left + ui.width / 2), inside: row.scrollWidth <= row.clientWidth };
    });
  // Japan and China, Germany and Poland, the Spanish war (long names) on the row; Turkey and Iran behind "+1".
  await war('GER', 'POL');
  await war('TUR', 'IRN');
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('war-more')).toContainText('+1', { timeout: 20_000 });
  const spain = await warOf('NSP');
  const long = await look();
  expect(long.banners, 'three banners').toBe(3);
  expect(long.wars, 'the Spanish war on the row').toContain(spain);
  expect(Math.abs(long.off), 'three banners with the Spanish war: in the band, off the centre').toBeGreaterThan(8);
  // The Spanish war ends: Turkey and Iran take its place. Narrower, the row would fit the centre; it stays.
  await page.evaluate((w) => window.__warsim!.sim.command({ kind: 'forcePeace', war: w }), spain);
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect.poll(async () => (await look()).wars, { timeout: 20_000 }).not.toContain(spain);
  await page.waitForTimeout(400);
  const short = await look();
  expect(short.banners, 'three banners still').toBe(3);
  expect(short.inside).toBe(true);
  expect(Math.abs(short.off - long.off), 'the row where it stood').toBeLessThanOrEqual(2);
  // Another map mode and back: the band changed, the side is chosen again, and three short banners fit the centre.
  await page.evaluate(() => window.__warsim!.hud.setMapMode('seaControl'));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.__warsim!.hud.setMapMode('political'));
  await page.waitForTimeout(400);
  const centred = await look();
  expect(centred.banners).toBe(3);
  expect(Math.abs(centred.off), 'chosen again: on the bar\'s centre').toBeLessThanOrEqual(1);
  // A war of long names behind "+1" (the United States and the Dominican Republic); Turkey and Iran end, and it takes
  // their place. The row has outgrown the centre: it stays there, and a banner goes behind "+n".
  await war('USA', 'DOM');
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect(page.getByTestId('war-more')).toContainText('+1', { timeout: 20_000 });
  const held = await look();
  expect(held.wars, 'the row as it was').toEqual(centred.wars);
  expect(Math.abs(held.off - centred.off)).toBeLessThanOrEqual(2);
  await page.evaluate((w) => window.__warsim!.sim.command({ kind: 'forcePeace', war: w }), await warOf('TUR'));
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect.poll(async () => (await page.evaluate(() => window.__warsim!.hud.stats.value!.wars.length)), { timeout: 20_000 }).toBe(3);
  await page.waitForTimeout(400);
  const after = await look();
  expect(after.inside).toBe(true);
  expect(after.banners, 'a war shown').toBeGreaterThanOrEqual(2);
  // Three banners still: where it stood. Fewer: the count changed, and the side was chosen again for it.
  if (after.banners === centred.banners) expect(Math.abs(after.off - centred.off), 'three banners: the row where it stood').toBeLessThanOrEqual(2);
  else expect(Math.abs(after.off), 'a banner behind "+n": the row on the centre still').toBeLessThanOrEqual(1);
  test.info().annotations.push({ type: 'the row that outgrew the centre', description: `${after.banners} banners, ${Math.round(after.off)} px off` });
  // What the row holds does not outlast its band (ADR-1137 (d), ADR-1141): the five supported sizes crossed and back, a
  // nation's panel and History opened and closed on the way; the row in its width and over nothing at each.
  const clear = () =>
    page.getByTestId('war-banners').evaluate((row) => {
      const over = (a: DOMRect, b: DOMRect): boolean => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      const items = [...row.children].map((c) => c.getBoundingClientRect());
      const others = [...row.parentElement!.children].filter((c) => c !== row).map((c) => c.getBoundingClientRect()).filter((b) => b.width > 0 && b.height > 0);
      return { inside: row.scrollWidth <= row.clientWidth + 1 && items.every((i) => i.left >= 0 && i.right <= innerWidth), over: items.filter((i) => others.some((o) => over(i, o))).length };
    });
  for (const [w, h] of [[393, 659], [393, 852], [734, 343], [852, 393], [2560, 1305], [1280, 720]] as const) {
    await page.setViewportSize({ width: w, height: h });
    if (w === 852 || w === 2560 || w === 1280) {
      await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), id('GER'));
      await expect(page.getByTestId('nation-panel')).toBeVisible();
      await page.evaluate(() => window.__warsim!.hud.toggleHistory());
      await page.evaluate(() => window.__warsim!.hud.toggleHistory());
      await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
      await expect(page.getByTestId('nation-panel')).toHaveCount(0);
    }
    await page.waitForTimeout(500);
    const at = `${w} × ${h}`;
    const c = await clear();
    expect(c.inside, `${at}: the row in its width`).toBe(true);
    expect(c.over, `${at}: the row over nothing`).toBe(0);
    const r = await look();
    expect(r.banners, `${at}: a war shown`).toBeGreaterThanOrEqual(1);
    if (w === 2560) {
      expect(r.banners, `${at}: three banners`).toBe(3);
      expect(Math.abs(r.off), `${at}: on the bar's centre`).toBeLessThanOrEqual(1);
    }
    if (w === 1280) {
      // Chosen afresh for this band: on the centre, or with its three banners in the band; no banner lost to a side held
      // from before the crossing.
      expect(Math.abs(r.off) <= 1 || r.banners === 3, `${at}: ${r.banners} banners ${Math.round(r.off)} px off`).toBe(true);
      // A stale count shows as another after 1 px.
      await page.setViewportSize({ width: w + 1, height: h });
      await page.waitForTimeout(300);
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(500);
      const nudged = await look();
      expect(nudged.banners, `${at}: nudged, the banners as shown`).toBe(r.banners);
      expect(Math.abs(nudged.off - r.off), `${at}: nudged, where it stood`).toBeLessThanOrEqual(2);
    }
  }
});
