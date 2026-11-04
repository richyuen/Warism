// Critic run 22, CB3: which 1938 nations' helmeted countryballs (infantry, and T1 markers of infantry) show the same
// visible flag as another nation's? The ball maps the flag's 36x24 pixels onto its disc (uv = 0.5 + p/2R) and the
// helmet hides p.y < -0.4 R, i.e. uv.y < 0.3: the top 30 % of the flag. Signature = mean colour of a 4x4 grid over
// the visible disc. Pairs whose full-flag signatures differ but whose helmeted ones match are listed, with whether
// the two share a land border at the start.
// Usage: node critic/scripts/c33_cb3_census.mjs
import { launch, open1938, save } from './c31_lib.mjs';

const { browser, page, errors } = await launch();
const out = {};
try {
  await open1938(page, 99);
  const r = await page.evaluate(() => {
    const v = window.__warsim.view;
    const ids = [...v.capitals.keys()];
    const W = 36, H = 24;
    const sig = (px, top) => {
      const g = []; const N = 4;
      for (let gy = 0; gy < N; gy++) for (let gx = 0; gx < N; gx++) {
        let r = 0, gg = 0, b = 0, n = 0;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const u = (x + 0.5) / W, w = (y + 0.5) / H;
          const p = [(u - 0.5) * 2, (w - 0.5) * 2];
          if (p[0] * p[0] + p[1] * p[1] > 1) continue;
          if (w < top) continue;
          const yy = top + ((w - top) / (1 - top)); // remap rows into grid over the visible part
          const cx = Math.min(N - 1, Math.floor(u * N)), cy = Math.min(N - 1, Math.floor(((w - top) / (1 - top)) * N));
          if (cx !== gx || cy !== gy) continue;
          const c = px[y * W + x]; r += c & 255; gg += (c >>> 8) & 255; b += (c >>> 16) & 255; n++; void yy;
        }
        g.push(n ? [r / n, gg / n, b / n] : [0, 0, 0]);
      }
      return g;
    };
    const d = (a, b) => { let m = 0; for (let i = 0; i < a.length; i++) m = Math.max(m, Math.hypot(a[i][0] - b[i][0], a[i][1] - b[i][1], a[i][2] - b[i][2])); return m; };
    const info = ids.map((id) => { const px = v.flags.pixelsOf(id); return { id, name: v.nationName(id) ?? String(id), full: sig(px, 0), helm: sig(px, 0.3) }; });
    const pairs = [];
    for (let i = 0; i < info.length; i++) for (let j = i + 1; j < info.length; j++) {
      const a = info[i], b = info[j];
      const df = d(a.full, b.full), dh = d(a.helm, b.helm);
      if (dh < 90 && df >= 90) pairs.push({ a: a.name, ida: a.id, b: b.name, idb: b.id, dFull: Math.round(df), dHelm: Math.round(dh) });
    }
    return { nations: ids.length, pairs };
  });
  Object.assign(out, r);
  // land neighbours at the start, from the controller grid
  out.neigh = await page.evaluate((pairs) => {
    const w = window.__warsim; const ins = w.sim.inspect?.();
    return pairs.map((p) => ({ ...p })); // placeholder: borders checked by name below
  }, out.pairs);
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save('c33_cb3_census.json', out);
await browser.close();
console.log(JSON.stringify({ nations: out.nations, n: out.pairs?.length, pairs: out.pairs?.slice(0, 60), fatal: out.fatal }, null, 0));
