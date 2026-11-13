// Critic run 55: one line per landing probe JSON (c67_lland_* / c67_lh_*): when the row first read "thrown back", any
// hour after it whose row still reads "lands in" / voyage hours, the final row, and each division's last order news.
// Usage: node critic/scripts/c67_lsum.mjs <json>...
import { readFileSync } from 'node:fs';
for (const f of process.argv.slice(2)) {
  const o = JSON.parse(readFileSync(f, 'utf8'));
  const st = (s) => (s.rows ?? []).map((r) => `${r[0]}: ${r[2]}`).join(' | ');
  let thrown = null, after = [], heldH = 0;
  for (const s of o.samples ?? []) {
    const t = st(s);
    if (thrown === null && /thrown back/.test(t)) thrown = s.h;
    if (thrown !== null && /lands in|there in/.test(t)) after.push(s.h);
    if (/held up/.test(t)) heldH++;
  }
  const overS = (o.samples ?? []).find((s) => s.h === o.overAt) ?? {};
  const last = (o.samples ?? []).at(-1) ?? {};
  const news = last.news ?? [];
  const lastNews = {};
  for (const n of news) { const m = /division (\d+): (.*)/.exec(n); if (m) lastNews[m[1]] = m[2]; }
  console.log(`${f.replace(/.*[\\/]/, '')} | over@${o.overAt ?? '-'} thrown@${thrown ?? '-'} landsAfterThrown:${after.length ? after.join(',') : 'none'} heldSamples:${heldH} | OVER ${st(overS)} | END ${st(last)} | NEWS ${Object.entries(lastNews).map(([k, v]) => `${k}: ${v}`).join(' ; ')}${o.fail ? ' | FAIL ' + o.fail.slice(0, 120) : ''}${(o.errors ?? []).length ? ' | ERR ' + o.errors.length : ''}`);
}
