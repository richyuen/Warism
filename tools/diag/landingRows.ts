/**
 * ROADMAP R47d: the landings bar's rows against the divisions' panels, hour by hour, on the critic's landing cases
 * (`tests/helpers/landingRows.ts`): run 47's grid (each setup × op × hour × who), run 50's far routes, and run 54's
 * page clicks (Rome to Valletta, each division on its own; R53d).
 *
 * Usage: npx tsx tools/diag/landingRows.ts [grid|far|page|all] [--setup <seed>] [out.json]
 * One line a broken case, a summary by kind, then `done:`. Red (exit 1) when anything is broken.
 */
import { writeFileSync } from 'node:fs';
import { GRID_HOURS, GRID_OPS, GRID_WHO } from '../../tests/helpers/landingGrid';
import { FAR_CASES, farRows, GRID_SETUPS, gridRows, PAGE_CASES, pageRows, ROW_BROKEN_KINDS, type RowRun } from '../../tests/helpers/landingRows';

const argv = process.argv.slice(2);
const which = argv.find((a) => ['grid', 'far', 'page', 'all'].includes(a)) ?? 'all';
const si = argv.indexOf('--setup');
const only = si >= 0 ? Number(argv[si + 1]) : null;
const outPath = argv.find((a) => a.endsWith('.json'));
const t0 = performance.now();
const cases: { name: string; hours: number; broken: RowRun['broken'] }[] = [];
const take = (name: string, r: RowRun | null): void => {
  if (!r) {
    process.stderr.write(`${name}: skipped\n`);
    return;
  }
  cases.push({ name, hours: r.hours, broken: r.broken });
  const rows = r.rows.length;
  process.stderr.write(`${name}: ${r.hours} h, ${r.broken.length} broken${rows ? `, ${rows} rows at the end` : ''}${r.broken.length ? ` — ${r.broken.slice(0, 3).map((b) => `${b.kind}: ${b.what}`).join('; ')}` : ''}\n`);
};
if (which === 'all' || which === 'page') for (const p of PAGE_CASES) take(`page ${p.seed} ${p.tag}→${p.to} n${p.n}`, pageRows(p));
if (which === 'all' || which === 'far') for (const f of FAR_CASES) take(`far ${f.seed} ${f.tag}→${f.to} n${f.n}`, farRows(f));
if (which === 'all' || which === 'grid')
  for (const s of GRID_SETUPS.filter((x) => only === null || x.seed === only))
    for (const op of GRID_OPS) for (const hour of GRID_HOURS) for (const who of GRID_WHO) take(`grid ${s.seed} ${op} ${hour} ${who}`, gridRows(s, op, hour, who));
const by = Object.fromEntries(ROW_BROKEN_KINDS.map((k) => [k, cases.reduce((n, c) => n + c.broken.filter((b) => b.kind === k).length, 0)]));
const bad = cases.filter((c) => c.broken.length > 0).length;
process.stdout.write(`${cases.length} cases, ${cases.reduce((n, c) => n + c.hours, 0)} hours: ${bad} broken; by kind ${JSON.stringify(by)}; ${Math.round((performance.now() - t0) / 1000)} s\n`);
if (outPath) writeFileSync(outPath, JSON.stringify({ cases }, null, 1));
process.stdout.write('done:\n');
process.exitCode = bad > 0 ? 1 : 0;
