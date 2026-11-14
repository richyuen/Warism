// Critic run 66: run 65's page JSONs against run 66's of the same name (c67_X.json vs c68_X.json), with timings, shot
// paths, dates of saving and fps stripped. Prints SAME / DIFF (with the first differing keys) / NOOLD per file.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
const dir = new URL('../', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const strip = (v, k = '') => {
  if (Array.isArray(v)) return v.map((x) => strip(x));
  if (v && typeof v === 'object') { const o = {}; for (const [kk, x] of Object.entries(v)) { if (/ms|Ms|shot|Shot|fps|Fps|time|Time|saved|Saved|port|errors|frame|draw|p95|mean/.test(kk)) continue; o[kk] = strip(x, kk); } return o; }
  if (typeof v === 'string') return v.replace(/c6[78]/g, 'cXX').replace(/Saved .*?(AM|PM)/g, 'Saved T');
  return v;
};
const diffKeys = (a, b, p = '') => {
  if (JSON.stringify(a) === JSON.stringify(b)) return [];
  if (a && b && typeof a === 'object' && typeof b === 'object') { const out = []; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) out.push(...diffKeys(a[k], b[k], `${p}.${k}`)); return out; }
  return [p];
};
for (const f of readdirSync(dir).filter((f) => /^c68_.*\.json$/.test(f)).sort()) {
  const o = dir + f.replace(/^c68_/, 'c67_');
  if (!existsSync(o)) { console.log('NOOLD', f); continue; }
  try {
    const a = strip(JSON.parse(readFileSync(o, 'utf8'))), b = strip(JSON.parse(readFileSync(dir + f, 'utf8')));
    const d = diffKeys(a, b);
    console.log(d.length ? `DIFF ${f} ${d.length}: ${d.slice(0, 5).join(' ')}` : `SAME ${f}`);
  } catch (e) { console.log('ERR', f, String(e).slice(0, 100)); }
}
