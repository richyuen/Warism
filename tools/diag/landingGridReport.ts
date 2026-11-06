/**
 * ROADMAP R33a: the landing grid's report (`tools/diag/landingGrid.ts` JSON files) as Markdown.
 *
 * Usage: npx tsx tools/diag/landingGridReport.ts <title> <out.md> <grid.json>...
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { BROKEN_KINDS, type GridCase } from '../../tests/helpers/landingGrid';

const [title, outPath, ...files] = process.argv.slice(2);
if (!title || !outPath || files.length === 0) throw new Error('usage: landingGridReport.ts <title> <out.md> <grid.json>...');
interface Summary { seed: number; ops: string[]; t0: number; ids: number[] }
const rows: { seed: number; op: string; summary: Summary; cases: GridCase[] }[] = files.map((f) => {
  const j = JSON.parse(readFileSync(f, 'utf8')) as { summary: Summary; cases: GridCase[] };
  return { seed: j.summary.seed, op: j.summary.ops.join(','), summary: j.summary, cases: j.cases };
});
rows.sort((a, b) => a.seed - b.seed || a.op.localeCompare(b.op));
const lines: string[] = [`# ${title}`, '', 'ROADMAP R33a (`tools/diag/landingGrid.ts`, `tests/helpers/landingGrid.ts`): each order at 6 h, 1, 2, 3, 5 days after the', 'first boards, 0–3 cells off, for the one aboard, one walking, both. A case is broken when any of its divisions is;', 'the kinds are counted by case. `idle`: an idle spell aboard over 72 h. `wait` (a figure): the longest a division', 'stood at its port in a landing not sailed, ashore or aboard (R33b; none in the R33a files).', ''];
lines.push(`| seed | order | cases | skipped | broken | ${BROKEN_KINDS.join(' | ')} | longest idle aboard (h) | longest wait at port (h) |`);
lines.push(`|---|---|---|---|---|${BROKEN_KINDS.map(() => '---').join('|')}|---|---|`);
const total = { cases: 0, skipped: 0, broken: 0, kinds: Object.fromEntries(BROKEN_KINDS.map((k) => [k, 0])) as Record<string, number>, idle: 0, wait: 0 };
for (const r of rows) {
  const run = r.cases.filter((k) => !k.skipped);
  const kinds = BROKEN_KINDS.map((kind) => run.filter((k) => k.broken.some((x) => x.kind === kind)).length);
  const idle = Math.max(0, ...run.flatMap((k) => k.divisions.map((d) => d.idle)));
  const wait = Math.max(0, ...run.flatMap((k) => k.divisions.map((d) => d.wait ?? 0)));
  const broken = run.filter((k) => k.broken.length > 0).length;
  lines.push(`| ${r.seed} | ${r.op} | ${r.cases.length} | ${r.cases.length - run.length} | ${broken} | ${kinds.join(' | ')} | ${idle} | ${wait} |`);
  total.wait = Math.max(total.wait, wait);
  total.cases += r.cases.length;
  total.skipped += r.cases.length - run.length;
  total.broken += broken;
  BROKEN_KINDS.forEach((k, i) => (total.kinds[k]! += kinds[i]!));
  total.idle = Math.max(total.idle, idle);
}
lines.push(`| **all** | | ${total.cases} | ${total.skipped} | **${total.broken}** | ${BROKEN_KINDS.map((k) => total.kinds[k]).join(' | ')} | ${total.idle} | ${total.wait} |`);
lines.push('', '## Broken cases', '');
for (const r of rows) {
  lines.push(`### ${r.seed} ${r.op} (base t${r.summary.t0}, divisions ${r.summary.ids.join(', ')})`, '');
  for (const k of r.cases) if (!k.skipped && k.broken.length > 0) lines.push(`- ${k.op} ${k.hour} h +${k.off} ${k.who}: ${k.broken.map((x) => `**${x.kind}** ${x.what}`).join('; ')}`);
  lines.push('');
}
writeFileSync(outPath, lines.join('\n'));
console.log(`${total.broken} of ${total.cases - total.skipped} broken; done:`);
