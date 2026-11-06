/**
 * ROADMAP R33a: the grid of the player's landing orders (`tests/helpers/landingGrid.ts`) on one seed.
 *
 * Usage: npx tsx tools/diag/landingGrid.ts <seed: 3517|15101> [op: reclick|redirect|recall|cancel|all] [out.json]
 * One line a broken case, a summary by kind, then `done:`. Red (exit 1) when anything is broken.
 */
import { writeFileSync } from 'node:fs';
import { BROKEN_KINDS, GRID_HOURS, GRID_OFFS, GRID_OPS, GRID_SETUPS, GRID_WHO, gridBase, gridCase, type GridCase, type GridOp } from '../../tests/helpers/landingGrid';

const seed = Number(process.argv[2] ?? 3517);
const opArg = process.argv[3] ?? 'all';
const outPath = process.argv[4];
const setup = GRID_SETUPS.find((s) => s.seed === seed);
if (!setup) throw new Error(`no grid setup for seed ${seed} (${GRID_SETUPS.map((s) => s.seed).join(', ')})`);
const ops: GridOp[] = opArg === 'all' ? GRID_OPS : [opArg as GridOp];
const t = performance.now();
const base = gridBase(setup);
process.stderr.write(`seed ${seed}: base at t${base.t0}, divisions ${base.ids}\n`);
const cases: GridCase[] = [];
for (const op of ops) {
  for (const hour of GRID_HOURS) {
    for (const off of GRID_OFFS) {
      for (const who of GRID_WHO) {
        const k = gridCase(base, op, hour, off, who);
        cases.push(k);
        if (k.broken.length > 0) console.log(`${op} ${hour}h +${off} ${who}: ${k.broken.map((x) => `${x.kind}: ${x.what}`).join('; ')}`);
      }
    }
  }
}
const run = cases.filter((k) => !k.skipped);
const byKind = Object.fromEntries(BROKEN_KINDS.map((kind) => [kind, run.filter((k) => k.broken.some((x) => x.kind === kind)).length]));
const worstIdle = Math.max(0, ...run.flatMap((k) => k.divisions.map((d) => d.idle)));
const broken = run.filter((k) => k.broken.length > 0).length;
const summary = { seed, ops, t0: base.t0, ids: base.ids, cases: cases.length, run: run.length, skipped: cases.length - run.length, broken, byKind, worstIdle, seconds: Math.round((performance.now() - t) / 1000) };
console.log(JSON.stringify(summary));
if (outPath) writeFileSync(outPath, JSON.stringify({ summary, cases }, null, 1));
console.log('done:');
process.exitCode = broken > 0 ? 1 : 0;
