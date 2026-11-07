/**
 * ROADMAP R45: the critic's headless replay as a tool (it was a hand-built `.cache/replay49/jobs.txt` and `suiteP.sh`).
 *
 * Usage: npx tsx tools/diag/replayCritic.ts [--run N] [--at head|report|<commit>] [--jobs P] [--new K] [--only <regex>]
 *        [--out <dir>] [--dry] [--report-only]
 *
 * - The jobs: `critic/scripts/c<N>_jobsAll.txt` of run N (default: the latest such list), one shell command a line, its
 *   outputs under `critic/c<N>_…`, which the replay writes under `--out` (default `.cache/replay<N>[-<commit>]/`).
 * - `--at`: the tree it runs on: HEAD (default), the last report's commit (`critic/CRITIC_REPORT.json`), or any commit,
 *   in a git worktree (node_modules joined in, HEAD's `critic/scripts` copied in: the critic commits its scripts after
 *   its run, so its own commit lacks them).
 * - `--jobs`: how many at a time (default 6; 20 1938 sims at once were killed for memory).
 * - Each job's outputs are compared with the critic's, after the run's own timings are taken out (seconds and
 *   milliseconds in the text; keys of time in a JSON): same, differs (the first line that does), or no original.
 * - `--new K`: each family (its script and mode) once more on K new seeds: the first job of the family with its seed
 *   changed; told its exit and its last line (a checker's "0 broken").
 * - The report: `<out>/REPORT.md` (each case that differs named, with what both say: a log's last line, a JSON's
 *   top values), a summary on stdout, then `done:`. Exit 1 when a job failed or, at a commit given, an output differs.
 * - `--report-only`: the report of the outputs already in `--out`, nothing run.
 */
import { spawn, execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const args = process.argv.slice(2);
const opt = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const flag = (name: string): boolean => args.includes(`--${name}`);

/** The latest run with a job list, or `--run`. */
function runNumber(): number {
  const given = opt('run');
  if (given) return Number(given);
  const runs = readdirSync(path.join(ROOT, 'critic/scripts'))
    .map((f) => /^c(\d+)_jobsAll\.txt$/.exec(f)?.[1])
    .filter((n): n is string => n !== undefined)
    .map(Number);
  if (runs.length === 0) throw new Error('no critic/scripts/c<N>_jobsAll.txt');
  return Math.max(...runs);
}

const N = runNumber();
const P = Number(opt('jobs') ?? 6);
const NEW = Number(opt('new') ?? 0);
const only = opt('only') ? new RegExp(opt('only')!) : null;
const atArg = opt('at') ?? 'head';
const commit = atArg === 'head' ? null : atArg === 'report' ? (JSON.parse(readFileSync(path.join(ROOT, 'critic/CRITIC_REPORT.json'), 'utf8')) as { commit: string }).commit : atArg;
const short = commit ? execFileSync('git', ['rev-parse', '--short', commit], { cwd: ROOT, encoding: 'utf8' }).trim() : null;
const OUT = path.resolve(ROOT, opt('out') ?? `.cache/replay${N}${short ? `-${short}` : ''}`);
const PREFIX = `critic/c${N}_`;

interface Job {
  name: string;
  cmd: string;
  /** The output files it writes (under OUT), and the critic's of the same name. */
  outputs: { mine: string; theirs: string }[];
  family: string;
  seed: number | null;
}

/** The job's command with its outputs moved under `dir`, the outputs, its script and mode (its family) and its seed. */
function parse(line: string, dir: string, tag = ''): Job {
  const outputs: Job['outputs'] = [];
  const cmd = line.replace(new RegExp(`${PREFIX.replace('/', '\\/')}([\\w.\\-]+)`, 'g'), (_m, rest: string) => {
    const mine = path.join(dir, `${tag}c${N}_${rest}`);
    outputs.push({ mine, theirs: path.join(ROOT, 'critic', `c${N}_${rest}`) });
    // Absolute, so that a run in a worktree writes here.
    return mine.replaceAll('\\', '/');
  });
  const m = /npx tsx (\S+)((?:\s+[^>\s]+)*)/.exec(line);
  const script = m?.[1] ?? line.split(' ')[0]!;
  const rest = (m?.[2] ?? '').trim().split(/\s+/).filter((a) => a !== '' && !a.startsWith(PREFIX) && !a.startsWith('.cache'));
  const seedIdx = rest.findIndex((a) => /^\d{3,}$/.test(a));
  const seed = seedIdx >= 0 ? Number(rest[seedIdx]) : null;
  // The family: the script, its mode words, and its env words but numbers (c47_far's TAG, FOE, N).
  const env = (/^env ((?:\w+=\S+\s+)+)/.exec(line)?.[1] ?? '').trim().split(/\s+/).filter((e) => e !== '' && !/=[-\d.,]+$/.test(e));
  const mode = rest.filter((a, i) => i !== seedIdx && !/^[-\d.,]+$/.test(a));
  const family = [path.basename(script), ...mode, ...env].join(' ');
  const name = outputs[0] ? path.basename(outputs[0].mine) : line.slice(0, 60);
  return { name, cmd, outputs, family, seed };
}

/** The text with the run's own timings taken out. */
function normalText(s: string): string {
  return s
    .replace(/\r/g, '')
    .replace(/\b\d+(\.\d+)?\s?(ms|s)\b/g, '#t')
    .replace(/\b\d{1,2}:\d{2}:\d{2}\b/g, '#clock')
    .replace(/\b\d{4}-\d{2}-\d{2}T[\d:.]+Z?\b/g, '#date');
}

/** The keys of a run's wall time (`ms`, `wallS`, `bootMs`), not of the sim's (`at`, `sailedAt`: compared). */
const TIME_KEY = /^(ms|s|sec|secs|seconds|wall|wallS|wallMs|elapsed|took|timestamp|duration)$|Ms$/;

function normalJson(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(normalJson);
  if (v && typeof v === 'object') {
    const o: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) if (!TIME_KEY.test(k)) o[k] = normalJson(x);
    return o;
  }
  return typeof v === 'string' ? normalText(v) : v;
}

/** Null when the same; else the first line (of the normal forms) that differs. */
function differs(mine: string, theirs: string): string | null {
  let a = readFileSync(mine, 'utf8');
  let b = readFileSync(theirs, 'utf8');
  if (mine.endsWith('.json')) {
    try {
      a = JSON.stringify(normalJson(JSON.parse(a)), null, 1);
      b = JSON.stringify(normalJson(JSON.parse(b)), null, 1);
    } catch {
      a = normalText(a);
      b = normalText(b);
    }
  } else {
    a = normalText(a);
    b = normalText(b);
  }
  if (a === b) return null;
  const la = a.split('\n');
  const lb = b.split('\n');
  for (let i = 0; i < Math.max(la.length, lb.length); i++) if (la[i] !== lb[i]) return `line ${i + 1}: replay "${(la[i] ?? '').slice(0, 100)}" vs critic "${(lb[i] ?? '').slice(0, 100)}"`;
  return 'differs';
}

/** A worktree at `commit` with node_modules joined in and HEAD's critic/scripts copied in. */
function worktree(at: string): string {
  const dir = path.join(ROOT, '.cache', `wt-replay-${short}`);
  if (!existsSync(dir)) {
    execFileSync('git', ['worktree', 'add', '--detach', dir, at], { cwd: ROOT, stdio: 'ignore' });
    execFileSync('cmd', ['/c', 'mklink', '/J', path.join(dir, 'node_modules'), path.join(ROOT, 'node_modules')], { stdio: 'ignore' });
  }
  cpSync(path.join(ROOT, 'critic/scripts'), path.join(dir, 'critic/scripts'), { recursive: true });
  return dir;
}

/** Takes the worktree down: the junction first, or `git worktree remove --force` follows it into node_modules. */
function dropWorktree(dir: string): void {
  const link = path.join(dir, 'node_modules');
  if (existsSync(link)) execFileSync('cmd', ['/c', 'rmdir', link], { stdio: 'ignore' });
  execFileSync('git', ['worktree', 'remove', '--force', dir], { cwd: ROOT, stdio: 'ignore' });
}

function run(cmd: string, cwd: string): Promise<number> {
  return new Promise((resolve) => {
    const p = spawn('sh', ['-c', cmd], { cwd, stdio: 'ignore' });
    p.on('exit', (code) => resolve(code ?? 1));
    p.on('error', () => resolve(1));
  });
}

async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<void>): Promise<void> {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (next < items.length) await fn(items[next++]!);
  }));
}

/** A probe's inputs, echoed in its JSON: not what it found. */
const INPUT_KEYS = new Set(['seed', 'tag', 'foe', 'from', 'to', 'n', 'keep', 'sink', 'part', 'save', 'hours', 'chunk', 't0', 'days']);

/**
 * What a job says in a line: its log's last line but `done:` (a checker's "0 broken", workerDeterminism's "same");
 * when that is only a JSON's close, its JSON's findings: the top values but the inputs, and small objects (a probe's
 * `landedAfterDays`), the first six.
 */
function verdict(j: Job, side: 'mine' | 'theirs'): string {
  const log = j.outputs.find((o) => o.mine.endsWith('.log'))?.[side];
  const json = j.outputs.find((o) => o.mine.endsWith('.json'))?.[side];
  if (log && existsSync(log)) {
    const lines = readFileSync(log, 'utf8').replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '' && l.trim() !== 'done:');
    const last = normalText(lines.at(-1) ?? '').trim();
    if (!/^[}\]]$/.test(last) || !json || !existsSync(json)) return last.slice(0, 160);
  }
  if (!json || !existsSync(json)) return '(no output)';
  try {
    const o = normalJson(JSON.parse(readFileSync(json, 'utf8'))) as Record<string, unknown>;
    return Object.entries(o)
      .filter(([k]) => !INPUT_KEYS.has(k.toLowerCase()))
      .map(([k, v]) => [k, JSON.stringify(v)] as const)
      .filter(([, v]) => v !== undefined && v.length <= 60 && !v.startsWith('['))
      .slice(0, 6)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ')
      .slice(0, 200);
  } catch {
    return '(not JSON)';
  }
}

async function main(): Promise<void> {
  const list = path.join(ROOT, 'critic/scripts', `c${N}_jobsAll.txt`);
  const lines = readFileSync(list, 'utf8').replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '' && !l.startsWith('#'));
  mkdirSync(OUT, { recursive: true });
  const jobs = lines.map((l) => parse(l, OUT)).filter((j) => !only || only.test(j.cmd));
  // New seeds: the first job of each family with a seed, its seed changed (outside the critic's, by family).
  const fresh: (Job & { base: number })[] = [];
  if (NEW > 0) {
    const families = [...new Set(jobs.filter((j) => j.seed !== null).map((j) => j.family))];
    families.forEach((fam, f) => {
      const first = jobs.find((j) => j.family === fam)!;
      for (let k = 0; k < NEW; k++) {
        const seed = 60_001 + f * 100 + k * 2;
        const line = lines.find((l) => parse(l, OUT).name === first.name)!.replace(new RegExp(`(\\s)${first.seed}(\\s)`), `$1${seed}$2`);
        mkdirSync(path.join(OUT, 'new'), { recursive: true });
        fresh.push({ ...parse(line, path.join(OUT, 'new'), `s${seed}_`), seed, base: first.seed! });
      }
    });
  }
  // `--report-only`: the report of the outputs already there, nothing run.
  const reportOnly = flag('report-only');
  if (flag('dry')) {
    for (const j of [...jobs, ...fresh]) process.stdout.write(`${j.family} | ${j.seed} | ${j.cmd}\n`);
    process.stdout.write('done:\n');
    return;
  }
  const cwd = reportOnly ? ROOT : commit ? worktree(commit) : ROOT;
  if (!reportOnly) process.stderr.write(`run ${N}: ${jobs.length} jobs and ${fresh.length} on new seeds, ${P} at a time, at ${short ?? 'HEAD'}, into ${OUT}\n`);
  const exits = new Map<Job, number>();
  const t0 = performance.now();
  let done = 0;
  await pool([...jobs, ...fresh], reportOnly ? 64 : P, async (j) => {
    exits.set(j, reportOnly ? (j.outputs.every((o) => existsSync(o.mine)) ? 0 : 1) : await run(j.cmd, cwd));
    if (reportOnly) return;
    done++;
    process.stderr.write(`[${done}/${jobs.length + fresh.length}] ${exits.get(j)} ${j.name} (${Math.round((performance.now() - t0) / 1000)} s)\n`);
  });
  if (commit && !reportOnly) dropWorktree(cwd);
  // The report.
  const rows: string[] = [];
  let failed = 0;
  let diff = 0;
  let same = 0;
  for (const j of jobs) {
    const exit = exits.get(j)!;
    if (exit !== 0) failed++;
    const verdicts = j.outputs.map((o) => (!existsSync(o.mine) ? 'no output' : !existsSync(o.theirs) ? 'no original' : (differs(o.mine, o.theirs) ?? 'same')));
    const d = verdicts.filter((v) => v !== 'same' && v !== 'no original');
    if (d.length > 0) diff++;
    else if (verdicts.includes('same')) same++;
    // What both say, beside the first line that differs: a note added reads apart from a verdict changed.
    const v = `${verdict(j, 'mine')} ← critic: ${verdict(j, 'theirs')}`;
    if (d.length > 0 || exit !== 0) rows.push(`| ${j.name} | ${exit} | ${v.replaceAll('|', '/')} | ${d.join('; ').replaceAll('|', '/')} |`);
  }
  const freshRows = fresh.map((j) => `| ${j.family} | ${j.seed} (for ${j.base}) | ${exits.get(j)} | ${verdict(j, 'mine').replaceAll('|', '/')} |`);
  for (const j of fresh) if (exits.get(j) !== 0) failed++;
  const head = `# Replay of critic run ${N} at ${short ?? 'HEAD'}\n\n${jobs.length} jobs: ${same} same as the critic's, ${diff} differ, ${failed} failed (exit not 0)${fresh.length ? `; ${fresh.length} on new seeds` : ''}. ${Math.round((performance.now() - t0) / 1000)} s, ${P} at a time.\n`;
  const md = [
    head,
    rows.length ? '## Cases that differ or failed\n\n| job | exit | the replay ← the critic | first line that differs |\n|---|---|---|---|\n' + rows.join('\n') + '\n' : '## Every case the same\n',
    fresh.length ? '## New seeds\n\n| family | seed | exit | what it says |\n|---|---|---|---|\n' + freshRows.join('\n') + '\n' : '',
  ].join('\n');
  writeFileSync(path.join(OUT, 'REPORT.md'), md);
  process.stdout.write(head + rows.join('\n') + (rows.length ? '\n' : '') + (fresh.length ? freshRows.join('\n') + '\n' : '') + `report: ${path.relative(ROOT, path.join(OUT, 'REPORT.md'))}\ndone:\n`);
  process.exitCode = failed > 0 || (commit !== null && diff > 0) ? 1 : 0;
}

void main().catch((e: unknown) => {
  process.stderr.write(`${e instanceof Error ? e.stack : String(e)}\n`);
  process.exitCode = 1;
});

