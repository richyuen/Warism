// Critic run 24 (new), DC: the view's draw cost on one frozen world, HEAD (5297) against run 23's build (5296):
// seed 7019's year-20 save, paused, at 30000 (world), 3000 (T0), 1200 (T1), 120 (T2) and 25 m/px over Berlin and
// over the busiest fight; each: 150 synchronous draws timed (CPU + SwiftShader raster, gl.finish forced by a 1px read).
// Usage: node critic/scripts/c25_dc_drawcost.mjs <port> <save.bin> <tag> [extra]
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const [port, bin, tag, extra] = process.argv.slice(2);
const BASE = `http://127.0.0.1:${port}`;
const out = { port, bin, tag, rows: [] };
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message)));
try {
  const bytes = readFileSync(path.resolve(bin));
  await page.route('**/__critic_ck.bin', (r) => r.fulfill({ status: 200, body: bytes, contentType: 'application/octet-stream' }));
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=7019${extra ?? ''}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120000 });
  await page.evaluate(async () => window.__warsim.sim.load(new Uint8Array(await (await fetch('/__critic_ck.bin')).arrayBuffer())));
  await page.waitForTimeout(4000);
  const spot = await page.evaluate(() => {
    const v = window.__warsim.view; const pts = [];
    for (let n = 1; n < 400; n++) { let fs; try { fs = v.formationsOf(n); } catch { continue; } for (const f of fs) if (v.formationEngaged(f)) { const p = v.formationPos(f); if (p) pts.push(p); } }
    let best = null, bn = -1;
    for (const p of pts) { let k = 0; for (const q of pts) if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 6) k++; if (k > bn) { bn = k; best = p; } }
    return best ?? [1100, 267];
  });
  out.spot = spot;
  for (const [label, [cx, cy]] of [['berlin', [1100.2, 267.4]], ['fight', spot]]) {
    for (const m of [30000, 3000, 1200, 120, 25]) {
      const r = await page.evaluate(async ({ cx, cy, m }) => {
        const v = window.__warsim.view;
        v.controller.set({ cx, cy, scale: (v.metresPerPx * v.controller.cam.scale) / m });
        for (let i = 0; i < 30; i++) { v.draw(performance.now()); await new Promise((d) => setTimeout(d, 5)); }
        const canvas = document.querySelector('canvas');
        const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
        const px = new Uint8Array(4);
        const ts = [];
        for (let i = 0; i < 150; i++) {
          const t = performance.now();
          v.draw(t);
          if (gl) gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
          ts.push(performance.now() - t);
        }
        ts.sort((a, b) => a - b);
        const mean = ts.reduce((a, b) => a + b, 0) / ts.length;
        return { mean: +mean.toFixed(2), p50: +ts[75].toFixed(2), p95: +ts[142].toFixed(2), el: v.elementCount ?? null };
      }, { cx, cy, m });
      out.rows.push({ label, m, ...r });
      console.log(label, m, JSON.stringify(r));
    }
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
writeFileSync(`critic/c25_dc_${tag}.json`, JSON.stringify(out, null, 1));
await browser.close();
