// Critic run 56: in landing probe JSONs (c56_lland_*, c56_lh_*), the longest run of hours a row reads the same
// "at sea: lands in about N days" (N's countdown frozen), and whether that row's landing came ashore by then.
// Usage: node critic/scripts/c56_frozen.mjs <json>...
import { readFileSync } from 'node:fs';
for (const f of process.argv.slice(2)) {
  const o = JSON.parse(readFileSync(f, 'utf8'));
  let best = { len: 0, from: null, text: '' }, cur = { from: null, text: '' };
  for (const s of o.samples ?? []) {
    const t = (s.rows ?? []).map((r) => r[2]).find((x) => /lands in about/.test(x ?? '')) ?? null;
    if (t && t === cur.text) { const len = s.h - cur.from; if (len > best.len) best = { len, from: cur.from, text: t }; }
    else cur = { from: s.h, text: t };
  }
  console.log(`${f.replace(/.*[\/]/, '')}: longest same "lands in" ${best.len} h from h${best.from} "${best.text}"`);
}
