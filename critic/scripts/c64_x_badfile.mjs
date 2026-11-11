// Critic run 61 (new): a broken scenario file on the title screen (truncated; plain text): what the player is told.
// Usage: node critic/scripts/c64_x_badfile.mjs <file> <label>
import { launch, shot, save, BASE } from './c64_lib.mjs';
import path from 'node:path';
const [file, label] = process.argv.slice(2);
const out = { file };
const { browser, page, errors } = await launch(1600, 900);
try {
  await page.goto(`${BASE}/`);
  await page.getByTestId('title-screen').waitFor();
  await page.getByTestId('title-scenario-file').setInputFiles(path.resolve(file));
  await page.waitForTimeout(2000);
  out.text = (await page.evaluate(() => document.querySelector('[data-testid=title-screen]').innerText)).slice(0, 600);
  out.startBtn = await page.getByTestId('title-file-start').count();
  out.shot = await shot(page, `c64xb_${label}.png`);
  if (out.startBtn) {
    await page.getByTestId('title-file-start').click();
    await page.waitForTimeout(8000);
    out.after = (await page.evaluate(() => document.body.innerText)).slice(0, 600);
    out.url = page.url();
    out.shot2 = await shot(page, `c64xb_${label}_started.png`);
  }
} catch (e) { out.fail = String(e).slice(0, 300); }
finally { out.errors = errors; save(`c64_xb_${label}.json`, out); await browser.close(); console.log(JSON.stringify(out, null, 1)); }
