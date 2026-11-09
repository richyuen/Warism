/**
 * ADR-914 (3): the landing checker (`tools/diag/landingInvariants.ts`) on fresh seeds, as the critic runs it (its
 * `c59_liab_new.sh`: each seed × setups 3517 and 15101, transport groups kept, orders throughout or for 8 days).
 * Run it in an item that changes the landing checker or a landing rule, and before a critic run; fix what it finds.
 *
 * Usage: npx tsx tools/diag/landingFuzz.ts [--seeds N] [--first S] [--jobs P] [--days D] [--dry]
 *   --seeds  how many fresh seeds (default 50: 300 runs, about half an hour at 3 jobs; 150 took 15 minutes)
 *   --first  the first seed (default: from HEAD's commit, so each commit draws a block of its own; every other seed
 *            after it). Pass it for a before/after pair, and use a block not seen in the tuning for the check before a run.
 *   --jobs   runs at a time (default 3: 6 at once ran slower than 2 or 3 on the machine the budgets were set on)
 * Logs and a summary go to `.cache/landingFuzz/<commit>-<first>/`. The exit code is 1 when any run broke a rule.
 */
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const args = process.argv.slice(2);
const opt = (name: string): string | undefined => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const head = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
const seeds = Number(opt('--seeds') ?? 50);
// A block of seeds of HEAD's own, far from the critic's (2xxxx–3xxxx) and the earlier replays' (6xxxx).
const first = Number(opt('--first') ?? 100001 + 2 * (parseInt(head.slice(0, 5), 16) % 400000));
const jobs = Number(opt('--jobs') ?? 3);
const days = Number(opt('--days') ?? 120);

/** One run: the checker's arguments, as the critic's fuzz writes them. */
interface Run { seed: number; setup: number; probes: string; groups: number; orderDays: number | null }

/** Six runs a seed, the critic's shapes: two transport groups or one, orders throughout or for 8 days. */
export function fuzzRuns(first: number, count: number): Run[] {
  const out: Run[] = [];
  for (let i = 0; i < count; i++) {
    const seed = first + 2 * i;
    out.push({ seed, setup: 3517, probes: '30,90', groups: 2, orderDays: null });
    out.push({ seed, setup: 15101, probes: '30,90', groups: 2, orderDays: null });
    out.push({ seed, setup: 3517, probes: '30,90', groups: 1, orderDays: null });
    out.push({ seed, setup: 3517, probes: '30', groups: 2, orderDays: 8 });
    out.push({ seed, setup: 15101, probes: '30', groups: 2, orderDays: 8 });
    out.push({ seed, setup: 3517, probes: '30', groups: 1, orderDays: 8 });
  }
  return out;
}

const argv = (r: Run): string[] => [
  String(r.seed), String(r.setup), String(days), String(r.seed), r.probes, String(r.groups),
  ...(r.orderDays === null ? [] : [String(r.orderDays)]),
];
const name = (r: Run): string => `${r.seed}_${r.setup}_g${r.groups}_od${r.orderDays ?? '-'}`;

const runs = fuzzRuns(first, seeds);
const out = path.join(ROOT, '.cache/landingFuzz', `${head}-${first}`);
if (args.includes('--dry')) {
  for (const r of runs) console.log(`npx tsx tools/diag/landingInvariants.ts ${argv(r).join(' ')}`);
  process.exit(0);
}
mkdirSync(out, { recursive: true });
const tsx = path.join(ROOT, 'node_modules/tsx/dist/cli.mjs');
const checker = path.join(ROOT, 'tools/diag/landingInvariants.ts');

/** Rules broken in one log, by kind (a broken line is "t<hour> <kind>: …"). */
function kinds(log: string): Map<string, number> {
  const m = new Map<string, number>();
  for (const line of log.split('\n')) {
    const k = /^t\d+ (\w+):/.exec(line)?.[1];
    if (k !== undefined) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

const results: { run: Run; code: number; kinds: Map<string, number> }[] = [];
let next = 0;
const t0 = Date.now();
async function worker(): Promise<void> {
  while (next < runs.length) {
    const run = runs[next++]!;
    const file = path.join(out, `${name(run)}.log`);
    const code = await new Promise<number>((resolve) => {
      const p = spawn(process.execPath, [tsx, checker, ...argv(run)], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
      const chunks: Buffer[] = [];
      p.stdout.on('data', (d: Buffer) => chunks.push(d));
      p.stderr.on('data', (d: Buffer) => chunks.push(d));
      p.on('close', (c) => {
        writeFileSync(file, Buffer.concat(chunks));
        resolve(c ?? 1);
      });
    });
    const k = kinds(readFileSync(file, 'utf8'));
    results.push({ run, code, kinds: k });
    const said = code === 0 ? 'ok' : k.size > 0 ? [...k].map(([a, b]) => `${a} ${b}`).join(', ') : `failed (exit ${code})`;
    console.log(`[${results.length}/${runs.length}] ${name(run)}: ${said}`);
  }
}
await Promise.all(Array.from({ length: Math.max(1, jobs) }, worker));

const broken = results.filter((r) => r.code !== 0);
const byKind = new Map<string, number>();
for (const r of broken) for (const k of r.kinds.keys()) byKind.set(k, (byKind.get(k) ?? 0) + 1);
const lines = [
  `landingFuzz at ${head}: seeds ${first}..${first + 2 * (seeds - 1)} (${seeds}), ${runs.length} runs, ${days} days, ${Math.round((Date.now() - t0) / 60000)} min`,
  `broken: ${broken.length} of ${runs.length} runs (${((100 * broken.length) / runs.length).toFixed(1)} %)`,
  ...[...byKind].sort((a, b) => b[1] - a[1]).map(([k, n]) => `  ${k}: ${n} runs`),
  ...broken.map((r) => `  npx tsx tools/diag/landingInvariants.ts ${argv(r.run).join(' ')}   # ${r.kinds.size > 0 ? [...r.kinds.keys()].join(', ') : `exit ${r.code}`}`),
];
writeFileSync(path.join(out, 'summary.txt'), lines.join('\n') + '\n');
console.log(lines.join('\n'));
console.log(`logs: ${path.relative(ROOT, out)}`);
process.exitCode = broken.length > 0 ? 1 : 0;
