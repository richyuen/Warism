/**
 * `npm run check:review`: the phase review's full run (ADR-297, the user's decision), every stage
 * of `npm run check:full` on its own, recorded so that the commit that ticks the review need not
 * run it again.
 *
 * Each step runs whatever the one before it did: a red stage does not stop the run. The browser
 * suite runs as one step on the GPU (ADR-1029: 9 minutes), in chunks of `E2E_CHUNK` spec files on
 * SwiftShader (about 40 minutes a chunk), and the perf spec on its own project. A unit,
 * sweep or browser test that fails is run again alone (its file, one worker) once; red is what
 * fails both times. A file whose worker was lost and a browser test that did not run are red in
 * their run as a failed test is (ROADMAP R230, ADR-1159: `vitestRed`, `playwrightRed`, `again`), and
 * so is the file of an error vitest caught outside the tests (ROADMAP R231, ADR-1160: `errorRed`).
 * Each step's result is written to `.cache/gate/review.json` under the code key
 * as soon as it is done, so a run cut off goes on where it stopped (`npm run check:review` again).
 *
 * The code key (`codeTree`) is the tree a commit of the working tree would have without the
 * documents (Markdown, `docs/`), `critic/` and the list of known reds: a commit that changes only
 * those is proved by the record. The verdict (`judge`) is taken against the list of known reds
 * as it is when it is read (`tools/gate/knownRed.json`, the failures of BLOCKERS that are this
 * machine's and not the code's): green when every step is done and every red test is on it.
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { GPU, SUITE } from './render';
import { ERRORS_ENV, type RunError } from './vitestErrors';

const ROOT = path.resolve(import.meta.dirname, '../..');
const DIR = path.join(ROOT, '.cache/gate');
export const RECORD = path.join(DIR, 'review.json');
export const KNOWN = 'tools/gate/knownRed.json';
/** Spec files a chunk of the browser suite runs on SwiftShader (about 40 minutes there); on the GPU the suite is one step. */
export const E2E_CHUNK = 20;

export interface StepRecord {
  /** The tests red twice, or `stage:<step>` for a step that failed with no test to name. */
  red: string[];
  at: string;
}

export interface ReviewRecord {
  key: string;
  steps: string[];
  done: Record<string, StepRecord>;
}

export interface Verdict {
  green: boolean;
  missing: string[];
  /** Red tests not on the list of known reds. */
  unknown: string[];
  known: string[];
}

/** The steps of a run: the plain stages, the unit and sweep tests, the browser suite (on SwiftShader a chunk of specs each), the perf spec. */
export function reviewSteps(specs: number, gpu = GPU): string[] {
  const e2e = gpu ? ['e2e'] : Array.from({ length: Math.ceil(specs / E2E_CHUNK) }, (_, i) => `e2e:${i + 1}`);
  return ['typecheck', 'lint', 'build', 'test', 'test:sweep', ...e2e, 'e2e:perf'];
}

/** The verdict of `record` against the known reds `known` (ids of tests). */
export function judge(record: ReviewRecord, known: readonly string[]): Verdict {
  const missing = record.steps.filter((s) => !(s in record.done));
  const red = record.steps.flatMap((s) => record.done[s]?.red ?? []);
  const list = new Set(known);
  const unknown = red.filter((t) => !list.has(t));
  return { green: missing.length === 0 && unknown.length === 0, missing, unknown, known: red.filter((t) => list.has(t)) };
}

/** Whether a file is left out of the code key: a document, the critic's output, the list of known reds. */
export function outOfKey(file: string): boolean {
  return file.endsWith('.md') || file.startsWith('docs/') || file.startsWith('critic/') || file === KNOWN;
}

/**
 * A file red as a whole, with no test of it to name: its id is `<file> › (the file)`. It failed to load or a hook
 * threw (PLAN 5.8p), or its worker was lost (ROADMAP R230).
 */
export const FILE_RED = '(the file)';

/**
 * The ids of the tests red in a vitest JSON report: `<file> › <full name>`; a file red as a whole, `<file> › (the
 * file)`: one that failed with no failed test, and one whose worker was lost (ROADMAP R230, ADR-1159).
 *
 * A lost file: its worker went (out of memory, killed) before its tests were done. vitest tells of it as an error of
 * the run, apart from every file, and its report calls the file 'passed': its tests 'pending' when the worker went in
 * a test or a hook (a test that failed before that is named beside), or with no test at all when it went as the file
 * loaded, or before that in the suite's setup file. Neither is a file as it stands after a run: a test left out on
 * purpose is 'skipped' or 'todo', and a file with no test in it is 'failed' by vitest. Read on vitest 5.0.3; `gateReview.test.ts` runs a fixture that loses its
 * worker, so a vitest that tells it another way turns that test red.
 */
export function vitestRed(report: { testResults?: { name: string; status?: string; assertionResults?: { fullName: string; status: string }[] }[] }): string[] {
  const out: string[] = [];
  for (const f of report.testResults ?? []) {
    const file = path.relative(ROOT, f.name).split(path.sep).join('/');
    const tests = f.assertionResults ?? [];
    const before = out.length;
    for (const a of tests) if (a.status === 'failed') out.push(`${file} › ${a.fullName}`);
    const lost = tests.length === 0 || tests.some((a) => a.status === 'pending');
    if (lost || (out.length === before && f.status === 'failed')) out.push(`${file} › ${FILE_RED}`);
  }
  return out;
}

/** The files the pool's error of a lost worker names, in its last words: "… while running test file(s) <a>, <b>". */
const LOST_WORKER = / while running test files? (.+)$/;

/**
 * The red ids of the errors vitest caught outside the tests of a run (ROADMAP R231, ADR-1160), as the gate's reporter
 * wrote them (`vitestErrors.ts`): a rejection nothing handled, an exception out of a timer, a worker lost. vitest
 * fails the run for each and its JSON report has no trace of them: the tests of the file pass.
 *
 * An error is red as its file is, as a whole (`FILE_RED`): the file whose worker it came from, where vitest names it,
 * or the file a lost worker was running, by the pool's own words (the file `vitestRed` reads from the report's
 * shape: one id for the two). Run again alone, that file is to be
 * clean (`again`). An error with no file to its name is the run's own (`stage:<stage>`), and no run alone clears it: a
 * rejection with a value that is no Error; a worker that went as it started, whose file is in no report at all. Read
 * on vitest 5.0.3, and held by fixtures run for real in `gateReview.test.ts`: a lost worker told another way turns
 * R230's fixture red by its run.
 */
export function errorRed(errors: readonly RunError[], stage: string): string[] {
  const out: string[] = [];
  const add = (id: string): void => {
    if (!out.includes(id)) out.push(id);
  };
  for (const e of errors) {
    const files = e.path !== undefined ? [e.path] : (LOST_WORKER.exec(e.cause ?? '') ?? LOST_WORKER.exec(e.message ?? ''))?.[1]?.split(', ') ?? [];
    if (files.length === 0) add(`stage:${stage}`);
    for (const f of files) add(`${path.relative(ROOT, f).split(path.sep).join('/')} › ${FILE_RED}`);
  }
  return out;
}

interface PwSuite {
  title: string;
  file?: string;
  suites?: PwSuite[];
  specs?: { title: string; ok: boolean; file: string; tests?: PwTest[] }[];
}

/** A spec's test in one project, as the JSON report has it: its outcome, and what it was to be. */
interface PwTest {
  status?: string;
  expectedStatus?: string;
}

/** The folder of the browser specs: what the id of a spec's file starts with. */
export const E2E_DIR = 'tests/e2e';

/**
 * A test that did not run (ROADMAP R230): its worker went as it loaded the file, or the run stopped before it. The
 * report calls it 'skipped', as a test left out on purpose (`test.skip`, `test.fixme`, in a declaration, a body or a
 * hook), and `ok`; what tells them apart is what the test was to be, 'skipped' only for the one left out on purpose.
 * Read on Playwright 1.63, and held by a fixture's run as `vitestRed`'s reading is.
 */
const notRun = (t: PwTest): boolean => t.status === 'skipped' && t.expectedStatus !== 'skipped';

/**
 * The ids of the tests red in a Playwright JSON report: `tests/e2e/<file> › <describe › … › title>`, a test that
 * failed and one that did not run (`notRun`); an error of the run outside every test (a spec that fails to load),
 * `tests/e2e/<file> › (the file)` where it names its file, else `stage:playwright` (PLAN 5.8p). `dir`: the folder
 * of the specs, for a run of a fixture's.
 */
export function playwrightRed(report: { suites?: PwSuite[]; errors?: { location?: { file?: string } }[] }, dir = E2E_DIR): string[] {
  const out: string[] = [];
  const walk = (s: PwSuite, titles: string[]): void => {
    for (const spec of s.specs ?? []) if (!spec.ok || (spec.tests ?? []).some(notRun)) out.push(`${dir}/${spec.file} › ${[...titles, spec.title].join(' › ')}`);
    for (const c of s.suites ?? []) walk(c, [...titles, c.title]);
  };
  // A file's suite is titled by its path: not a title of the test.
  for (const f of report.suites ?? []) walk(f, []);
  for (const e of report.errors ?? []) {
    const at = e.location?.file;
    const id = at ? `${path.relative(ROOT, path.resolve(ROOT, dir, at)).split(path.sep).join('/')} › ${FILE_RED}` : 'stage:playwright';
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

/** A run's red ids, with one for the run itself where it failed and named no red (PLAN 5.8p: a non-zero exit is red). */
export function runRed(red: string[], ok: boolean, stage: string): string[] {
  return ok || red.length > 0 ? red : [`stage:${stage}`];
}

/** The file of a test id. */
const fileOf = (id: string): string => id.split(' › ')[0]!;

const git = (args: string[], env?: NodeJS.ProcessEnv, cwd = ROOT): string | null => {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: env ?? process.env });
  return r.status === 0 && !r.error ? r.stdout.trim() : null;
};

/** The code key of the working tree of the repository at `root` (see the head of the file), or null when git cannot tell. */
export function codeTree(root = ROOT): string | null {
  const dir = path.join(root, '.cache/gate');
  mkdirSync(dir, { recursive: true });
  const index = path.join(dir, 'index-review');
  const real = git(['rev-parse', '--git-path', 'index'], undefined, root);
  try {
    // From the real index, so files that did not change are not hashed again.
    if (real === null) throw new Error();
    copyFileSync(path.resolve(root, real), index);
  } catch {
    rmSync(index, { force: true });
  }
  const env = { ...process.env, GIT_INDEX_FILE: index };
  if (git(['add', '-A', '--', '.', ':!critic'], env, root) === null) return null;
  // Out of the key: the documents, the critic's files (tracked ones are in the index copied: PLAN
  // 5.8q) and the list of known reds (`git rm` from the scratch index alone).
  if (git(['rm', '-r', '-q', '--cached', '--ignore-unmatch', '--', '*.md', 'docs', 'critic', KNOWN], env, root) === null) return null;
  return git(['write-tree'], env, root);
}

export function readRecord(): ReviewRecord | null {
  try {
    return JSON.parse(readFileSync(RECORD, 'utf8')) as ReviewRecord;
  } catch {
    return null;
  }
}

export function knownRed(): string[] {
  try {
    return (JSON.parse(readFileSync(path.join(ROOT, KNOWN), 'utf8')) as { tests: { id: string }[] }).tests.map((t) => t.id);
  } catch {
    return [];
  }
}

const specFiles = (): string[] =>
  readdirSync(path.join(ROOT, 'tests/e2e'))
    .filter((f) => f.endsWith('.spec.ts') && !f.endsWith('.perf.spec.ts'))
    .sort()
    .map((f) => `tests/e2e/${f}`);

/**
 * Where a stage's runs are made, for a test of the stage itself (ROADMAP R230, `gateReview.test.ts`: a fixture whose
 * worker goes, run by the stage as the gate runs it). The gate's own runs give none of it.
 */
export interface RunAt {
  /** The runner's config as it takes one (`--config <file>`): a fixture's, in place of the repository's. */
  config?: string;
  /** The JSON report's file (a full path), in place of the gate's own under `.cache/gate`. */
  out?: string;
  /** The folder a Playwright report's files are in (the config's `testDir`, from the root), in place of `tests/e2e`. */
  dir?: string;
  /**
   * The runner's output is dropped. A fixture that loses its worker prints "Unhandled Error", and the log of a gate
   * that runs the test would read as if the gate's own run had.
   */
  quiet?: boolean;
}

function run(command: string, env?: NodeJS.ProcessEnv, quiet = false): boolean {
  if (!quiet) console.log(`review: ${command}`);
  return spawnSync(command, { cwd: ROOT, stdio: quiet ? 'ignore' : 'inherit', shell: true, env: { ...process.env, ...env } }).status === 0;
}

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T;
  } catch {
    return null;
  }
}

/** The gate's reporter, as vitest takes one from the root: the errors of a run outside its tests (`vitestErrors.ts`). */
const ERRORS_REPORTER = './tools/gate/vitestErrors.ts';

/**
 * The command of a vitest run with a JSON report to `out`, and the gate's reporter beside vitest's two: `verb` is
 * `run`, or `related --run` (ADR-427).
 */
export function vitestCommand(verb: string, config: string, out: string, files: string[]): string {
  return `npx vitest ${verb} ${config} --reporter=default --reporter=json --outputFile=${out} --reporter=${ERRORS_REPORTER} ${files.join(' ')}`;
}

/**
 * A vitest run (`config` '' for the unit tests) of `files` (all when empty): its red ids, the tests' and those of the
 * errors outside them, or null when it wrote no report, or none of its errors.
 */
function vitest(config: string, files: string[], stage: string, verb = 'run', at: RunAt = {}): string[] | null {
  const out = at.out ?? path.join(DIR, 'vitest.json');
  // The errors' file is named for each run, beside its report: a run inside another (a fixture's, from a test of the
  // gate's own run) must not write to the file of the one about it.
  const errors = out.replace(/\.json$/, '') + '.errors.json';
  mkdirSync(path.dirname(out), { recursive: true });
  rmSync(out, { force: true });
  rmSync(errors, { force: true });
  const ok = run(vitestCommand(verb, at.config === undefined ? config : `${config} ${at.config}`.trim(), out, files), { [ERRORS_ENV]: errors }, at.quiet);
  const r = readJson<Parameters<typeof vitestRed>[0]>(out);
  const e = readJson<RunError[]>(errors);
  // A lost file is told twice, by the report's shape and by the pool's error: one id.
  return r === null || e === null ? null : runRed([...new Set([...vitestRed(r), ...errorRed(e, stage)])], ok, stage);
}

/** A Playwright run: its red ids, or null when it wrote no report. */
function playwright(args: string, stage: string, at: RunAt = {}): string[] | null {
  const out = at.out ?? path.join(DIR, 'playwright.json');
  mkdirSync(path.dirname(out), { recursive: true });
  rmSync(out, { force: true });
  const ok = run(`npx playwright test ${at.config === undefined ? '' : `${at.config} `}${args} --reporter=line,json`, { PLAYWRIGHT_JSON_OUTPUT_NAME: out }, at.quiet);
  const r = readJson<Parameters<typeof playwrightRed>[0]>(out);
  return r === null ? null : runRed(playwrightRed(r, at.dir), ok, stage);
}

/**
 * Red twice: the ids of `first` still red when each of their files is run again alone.
 *
 * A test red in the first run is red when its file's run alone fails it again (ADR-423). Two cases have no such
 * second answer (ROADMAP R230, ADR-1159):
 * - A file red as a whole in the first run (`FILE_RED`: it failed to load, a hook threw, its worker was lost) had no
 *   run of its tests to hold the second against. Alone all of it is to pass: whatever its run alone names red is red.
 * - A run alone that wrote no report, or failed with nothing of the file named (its own `stage:` id), has not passed
 *   the file: what was red of it stays red.
 * - So with a run alone in which the file is red as a whole (ROADMAP R231, ADR-1160): its worker was lost there, it
 *   did not load, or it left an error outside its tests, which the run alone told as its own failure until the gate
 *   read such errors by their file. A test that passed beside that has not cleared its red.
 */
export function again(first: string[], rerun: (file: string) => string[] | null): string[] {
  // A run's own failure is no file's to run again: red as it stands.
  const red: string[] = first.filter((t) => t.startsWith('stage:'));
  for (const file of [...new Set(first.filter((t) => !t.startsWith('stage:')).map(fileOf))]) {
    const mine = first.filter((t) => fileOf(t) === file);
    const whole = `${file} › ${FILE_RED}`;
    const second = rerun(file);
    if (second === null || second.some((t) => t.startsWith('stage:'))) red.push(...mine);
    else if (mine.includes(whole)) red.push(...second);
    else if (second.includes(whole)) red.push(...mine);
    else red.push(...mine.filter((t) => second.includes(t)));
  }
  return red;
}

/**
 * The unit tests in full, or with `related` those whose imports reach these files (`vitest
 * related`), a test red in that run run again alone (its file): the ids red both times. The
 * ordinary gate's unit stage (ADR-423, ADR-427), as this run's. `at`: for a test of the stage.
 */
export function unitRedTwice(related?: string[], at: RunAt = {}): string[] {
  const first = related ? vitest('--passWithNoTests', related, 'test', 'related --run', at) : vitest('', [], 'test', 'run', at);
  return first === null ? ['stage:test'] : again(first, (f) => vitest('', [f], 'test', 'run', at));
}

/** A run of the browser suite: a project's specs (its arguments to `npx playwright test`). */
export interface E2eRun {
  project: 'chromium' | 'perf';
  args: string;
}

/**
 * The runs of the ordinary gate's e2e stage for `specs` (all of them when empty): the chromium
 * project, and the perf specs on their own project with no dependencies (ADR-779). Run as one, a
 * red in chromium left perf not run.
 */
export function e2eRuns(specs: readonly string[]): E2eRun[] {
  const perf = specs.filter((f) => f.endsWith('.perf.spec.ts'));
  const rest = specs.filter((f) => !f.endsWith('.perf.spec.ts'));
  const runs: E2eRun[] = [];
  if (specs.length === 0 || rest.length > 0) runs.push({ project: 'chromium', args: [...rest, SUITE].join(' ') });
  if (specs.length === 0 || perf.length > 0) runs.push({ project: 'perf', args: [...perf, '--project=perf', '--no-deps'].join(' ') });
  return runs;
}

/**
 * The ordinary gate's e2e stage (ADR-779, the user's decision), as this run judges a chunk: each
 * run, a chromium test red in it run again alone (its file, one worker); the ids red both times. A
 * perf test is red once (its timings are the test), as `e2e:perf` here. `at`: for a test of the stage.
 */
export function e2eRedTwice(runs: readonly E2eRun[], at: RunAt = {}): string[] {
  const red: string[] = [];
  for (const r of runs) {
    const stage = r.project === 'perf' ? 'e2e:perf' : 'e2e';
    const first = playwright(r.args, stage, at);
    if (first === null) red.push(`stage:${stage}`);
    else red.push(...(r.project === 'perf' ? first : again(first, (f) => playwright(`${SUITE} --workers=1 ${f}`, stage, at))));
  }
  return red;
}

/** The ids of `red` on the list of known reds (`known`) and those not on it. */
export function splitKnown(red: readonly string[], known: readonly string[]): { known: string[]; unknown: string[] } {
  const list = new Set(known);
  return { known: red.filter((t) => list.has(t)), unknown: red.filter((t) => !list.has(t)) };
}

function step(name: string, specs: string[]): string[] {
  if (['typecheck', 'lint', 'build'].includes(name)) return run(`npm run ${name}`) ? [] : [`stage:${name}`];
  if (name === 'test' || name === 'test:sweep') {
    if (name === 'test') return unitRedTwice();
    const config = '--config vitest.sweep.config.ts';
    const first = vitest(config, [], name);
    if (first === null) return [`stage:${name}`];
    return again(first, (f) => vitest(config, [f], name));
  }
  if (name === 'e2e:perf') {
    const first = playwright('--project=perf --no-deps', name);
    return first === null ? ['stage:e2e:perf'] : first;
  }
  const i = Number(name.slice(4)) - 1;
  const chunk = name === 'e2e' ? [] : specs.slice(i * E2E_CHUNK, (i + 1) * E2E_CHUNK);
  const first = playwright([SUITE, ...chunk].join(' '), name);
  if (first === null) return [`stage:${name}`];
  return again(first, (f) => playwright(`${SUITE} --workers=1 ${f}`, name));
}

function main(): void {
  const key = codeTree();
  if (key === null) {
    console.error('review: git cannot tell the tree');
    process.exitCode = 1;
    return;
  }
  const specs = specFiles();
  let record = readRecord();
  if (record === null || record.key !== key) record = { key, steps: reviewSteps(specs.length), done: {} };
  for (const name of record.steps) {
    if (name in record.done) {
      console.log(`review: ${name} done (${record.done[name]!.at}), red ${record.done[name]!.red.length}`);
      continue;
    }
    const red = step(name, specs);
    if (codeTree() !== key) {
      console.error('review: the code changed during the run; nothing recorded for this step');
      process.exitCode = 1;
      return;
    }
    record.done[name] = { red, at: new Date().toISOString() };
    mkdirSync(DIR, { recursive: true });
    writeFileSync(RECORD, JSON.stringify(record, null, 1));
  }
  const v = judge(record, knownRed());
  for (const t of v.known) console.log(`review: known red: ${t}`);
  for (const t of v.unknown) console.log(`review: RED, not on ${KNOWN}: ${t}`);
  console.log(`review: ${v.green ? 'green' : 'RED'} (${v.known.length} known red, ${v.unknown.length} not known)`);
  if (!v.green) process.exitCode = 1;
}

if (process.argv[1] && existsSync(process.argv[1]) && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) main();
