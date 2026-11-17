// Critic run 73 (new): what a watcher sees of a massing (R97b, R103). Plain 1938 SEED (as warOpening.ts ran it), the
// camera over a border (cell CX,CY) at 3,000 and 1,200 m/px on each of DAYS: the counters and the movement arrows in
// view, every ticker row and History row that names either nation, shots. The war's own day is known from
// critic/c73_warOpening.json.
// Usage: node critic/scripts/c73_massSeen.mjs <seed> <A> <B> <cx,cy> <days,comma>
import { launch, open1938, shot, save, hours, lookAt } from './c73_lib.mjs';
const seed = Number(process.argv[2] ?? 56211);
const A = process.argv[3] ?? 'Soviet Union', B = process.argv[4] ?? 'Romania';
const [cx, cy] = (process.argv[5] ?? '1228,298').split(',').map(Number);
const days = (process.argv[6] ?? '40,55,65,72,75').split(',').map(Number);
const out = { seed, A, B, stops: [] };
const { browser, page, errors } = await launch(1600, 900);
try {
  await open1938(page, seed);
  let done = 0;
  for (const d of days) {
    await hours(page, (d - done) * 24); done = d;
    await page.waitForTimeout(1200);
    const st = { day: d, date: await page.getByTestId('date-label').innerText().catch(() => null) };
    await lookAt(page, cx, cy, 3000); st.shot3000 = await shot(page, `c73ms_${seed}_d${d}_3000m.png`);
    st.arrows3000 = await page.evaluate(() => { const v = window.__warsim.view; return (v.moveArrows ?? v.arrows ?? []).length ?? null; }).catch(() => null);
    await lookAt(page, cx, cy, 1200); st.shot1200 = await shot(page, `c73ms_${seed}_d${d}_1200m.png`);
    if (await page.getByTestId('ticker-more').count()) { await page.getByTestId('ticker-more').click(); await page.waitForTimeout(300); }
    st.ticker = await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row]')].map((e) => e.innerText.replace(/\n/g, ' ')));
    if (await page.getByTestId('ticker-more').count()) await page.getByTestId('ticker-more').click();
    await page.getByTestId('history-btn').click(); await page.waitForTimeout(900);
    st.history = await page.evaluate(({ A, B }) => document.body.innerText.split('\n').filter((l) => l.includes(A) && l.includes(B)).slice(0, 12), { A, B });
    st.historyAny = await page.evaluate(() => document.body.innerText.split('\n').filter((l) => /mass|border|gather|mobilis/i.test(l)).slice(0, 8));
    await page.getByTestId('history-btn').click(); await page.waitForTimeout(300);
    out.stops.push(st);
    console.log(`day ${d} ${st.date}: ticker ${JSON.stringify(st.ticker)} | history of the two ${JSON.stringify(st.history)} | massing words ${JSON.stringify(st.historyAny)}`);
  }
} catch (e) {
  out.error = String(e?.stack ?? e).slice(0, 1200);
  console.log('ERROR', out.error);
}
out.errors = errors;
save(`c73_ms_${seed}.json`, out);
await browser.close();
