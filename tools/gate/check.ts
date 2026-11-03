/**
 * `npm run check`: the gate, sized to what changed since HEAD (ADR-48, ADR-49, ADR-55).
 *
 *   nothing changed, and the gate has passed this very tree           → nothing
 *   only documents changed (Markdown anywhere, anything under docs/)  → nothing; the tree is recorded
 *   no sim input changed                                             → everything but the 10-year sweep tests
 *   otherwise                                                        → everything, the sweep stage the pin alone
 *
 * The phase reviews that ran every stage are gone with the plan (ADR-805): the whole suites run in
 * `npm run check:full` and `npm run check:review`, before a release.
 *
 * Of the unit stage (ADR-280, ADR-293, the user's decisions): all of it when git cannot tell what
 * changed, under FULL, or when
 * something every test stands on changed (`UNIT_SHARED`); otherwise only the test files whose
 * imports reach a file that changed (`vitest related`), or none (`planUnit`). In full and related
 * alike, a test red in the parallel run is run again alone (its file), and red is what fails both
 * times (ADR-423, ADR-427, as `npm run check:review` judges, ADR-297): the parallel run is its own
 * load (a change of `shared/` relates most of the files), and the timing tests of BLOCKERS fail in
 * it one or two at a time, a different one each run, and pass alone.
 *
 * Of the sweep stage (ADR-278, the user's decision): every 10-year test only when git cannot tell
 * what changed, or FULL is set; otherwise only the pinned state
 * hash of seed 99 (`tests/sweep/baselineHash.test.ts`, 81 s), so a rule change still moves the
 * pin in its own commit (`planSweep`).
 *
 * And of the e2e stage (ADR-87, ADR-293): all of it when something every spec stands on changed;
 * otherwise only the spec files that changed, or none (`planE2e`). As the unit stage, a test red in it is run again alone (its file,
 * one worker), and red is what fails both times and is not on `tools/gate/knownRed.json`
 * (ADR-779, the user's decision: the timing specs of BLOCKERS fail under the parallel run's load,
 * a different few each run, and pass alone; a known red is this machine's, with its BLOCKERS entry).
 * The perf specs run on their own project, after (`e2eRuns`).
 *
 * Nothing reads the documents (parity retired, ADR-805), and nothing but a sim input can change what
 * the sweep tests prove. `critic/` is the critic's own output and is ignored. The gate runs
 * before every commit, so the stages left out were proved by the gate of an earlier commit.
 * A green gate records the tree it passed (`.cache/gate/green.json`); a clean tree whose HEAD is
 * one of those trees has nothing left to prove (the gate at the start of an iteration). A HEAD
 * the gate has not seen (a pull, a rebase, a fresh clone) still gets the code stages.
 * `npm run check:full` (or FULL=1) always runs everything: use it before a release, after
 * a pull or rebase, and whenever in doubt. If git cannot tell what changed, everything runs.
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { e2eRedTwice, e2eRuns, KNOWN, knownRed, splitKnown, unitRedTwice } from './review';

const ROOT = path.resolve(import.meta.dirname, '../..');
const STAMP_DIR = path.join(ROOT, '.cache/gate');
const STAMP = path.join(STAMP_DIR, 'green.json');
/** Trees remembered as passed (the newest last). */
const STAMP_KEEP = 50;

/** Everything the sim and the sweep tests are built from (a dependency change shows in the lock file). */
export const SWEEP_INPUTS = ['src/sim/', 'src/shared/', 'data/', 'public/data/', 'tests/sweep/', 'tests/helpers/', 'tools/headless/', 'vitest.sweep.config.ts', 'package-lock.json'];
export const ALL_STAGES = ['typecheck', 'lint', 'test', 'test:sweep', 'build', 'e2e'] as const;
export type Stage = (typeof ALL_STAGES)[number];

const ignored = (file: string): boolean => file.startsWith('critic/');
const isDocument = (file: string): boolean => file.endsWith('.md') || file.startsWith('docs/');

/**
 * The stages to run for `files` changed since HEAD (repo-relative, `/`-separated); null = unknown.
 * `gated`: the gate has already passed the tree of HEAD.
 */
export function planGate(files: readonly string[] | null, gated = false): Stage[] {
  if (files === null) return [...ALL_STAGES];
  const changed = files.filter((f) => !ignored(f));
  if (changed.length === 0 && gated) return [];
  if (changed.length > 0 && changed.every(isDocument)) return [];
  const sim = changed.some((f) => SWEEP_INPUTS.some((p) => (p.endsWith('/') ? f.startsWith(p) : f === p)));
  return ALL_STAGES.filter((s) => s !== 'test:sweep' || sim);
}

/** The pinned state hash: the one sweep test of a commit (ADR-278). */
export const PIN_TEST = 'tests/sweep/baselineHash.test.ts';

/**
 * How much of the sweep stage a gate with a sim input in it runs (ADR-278, the user's decision):
 * every test when what changed is not known; otherwise the pin.
 */
export function planSweep(files: readonly string[] | null): 'full' | 'pin' {
  return files === null ? 'full' : 'pin';
}

/**
 * What every unit test stands on, or reads without importing it (the earth's assets and the
 * scenario's data are read from disk): a change to any of it runs the whole unit stage.
 */
export const UNIT_SHARED = ['vitest.config.ts', 'tests/helpers/', 'package.json', 'package-lock.json', 'tsconfig.json', 'data/', 'public/data/', 'tools/headless/'];

export interface UnitPlan {
  /** 'full': every unit test. 'related': the test files whose imports reach `files`. 'none': the stage is left out. */
  mode: 'full' | 'related' | 'none';
  files: string[];
  why: string;
}

/**
 * How much of the unit stage a gate with code in it runs (ADR-280). `exists`: whether a path is on
 * disk (a file removed runs everything: what imported it is not known any more).
 */
export function planUnit(files: readonly string[] | null, exists: (f: string) => boolean): UnitPlan {
  if (files === null) return { mode: 'full', files: [], why: 'what changed is not known' };
  const changed = files.filter((f) => !ignored(f) && !isDocument(f));
  const shared = changed.find((f) => UNIT_SHARED.some((p) => (p.endsWith('/') ? f.startsWith(p) : f === p)));
  if (shared !== undefined) return { mode: 'full', files: [], why: `${shared} changed` };
  const code = changed.filter((f) => (f.startsWith('src/') || f.startsWith('tools/') || f.startsWith('tests/unit/')) && /\.(ts|tsx|js|json)$/.test(f));
  const gone = code.find((f) => !exists(f));
  if (gone !== undefined) return { mode: 'full', files: [], why: `${gone} removed` };
  if (code.length === 0) return { mode: 'none', files: [], why: 'no source or unit test changed' };
  return { mode: 'related', files: code, why: 'the tests that import what changed' };
}

export interface E2ePlan {
  /** 'full': every spec. 'changed': only `specs`. 'none': the stage is left out. */
  mode: 'full' | 'changed' | 'none';
  specs: string[];
  why: string;
}

/**
 * How much of the e2e stage a gate with code in it runs (ADR-87, the user's decision): all of it
 * when git cannot tell what changed, or when something every spec stands on changed (a helper under
 * tests/e2e, the Playwright config). Otherwise only the spec files that changed: a new or an
 * edited spec is never committed unrun.
 */
export function planE2e(files: readonly string[] | null): E2ePlan {
  if (files === null) return { mode: 'full', specs: [], why: 'what changed is not known' };
  const changed = files.filter((f) => !ignored(f));
  const shared = changed.filter((f) => f === 'playwright.config.ts' || (f.startsWith('tests/e2e/') && !f.endsWith('.spec.ts')));
  if (shared.length > 0) return { mode: 'full', specs: [], why: `${shared[0]} changed` };
  const specs = changed.filter((f) => f.startsWith('tests/e2e/') && f.endsWith('.spec.ts'));
  if (specs.length > 0) return { mode: 'changed', specs, why: 'the changed specs only' };
  return { mode: 'none', specs: [], why: 'no spec changed' };
}

/** Files that differ from HEAD (modified, staged, untracked, both ends of a rename), or null when git cannot tell. */
export function changedFiles(): string[] | null {
  const r = spawnSync('git', ['status', '--porcelain', '-z', '--untracked-files=all'], { cwd: ROOT, encoding: 'utf8' });
  if (r.status !== 0 || r.error) return null;
  const out: string[] = [];
  const parts = r.stdout.split('\0');
  for (let i = 0; i < parts.length; i++) {
    const entry = parts[i]!;
    if (entry.length < 4) continue;
    out.push(entry.slice(3));
    // A rename or copy is followed by its source path as a separate entry.
    if (entry[0] === 'R' || entry[0] === 'C') out.push(parts[++i] ?? '');
  }
  return out.filter((f) => f !== '');
}

const git = (args: string[], env?: NodeJS.ProcessEnv): string | null => {
  const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', env: env ?? process.env });
  return r.status === 0 && !r.error ? r.stdout.trim() : null;
};

/**
 * The tree a commit of the working tree would have (everything but `critic/`, as the builder
 * commits), or null when git cannot tell. Written through a scratch index, so the real index and
 * the working tree are untouched.
 */
export function worktreeTree(): string | null {
  const real = git(['rev-parse', '--git-path', 'index']);
  if (real === null) return null;
  mkdirSync(STAMP_DIR, { recursive: true });
  const index = path.join(STAMP_DIR, 'index');
  try {
    // From the real index, so files that did not change are not hashed again.
    copyFileSync(path.resolve(ROOT, real), index);
  } catch {
    rmSync(index, { force: true });
  }
  const env = { ...process.env, GIT_INDEX_FILE: index };
  if (git(['add', '-A', '--', '.', ':!critic'], env) === null) return null;
  return git(['write-tree'], env);
}

/** The trees the gate has passed on this machine (oldest first). */
export function gatedTrees(): string[] {
  try {
    const trees = (JSON.parse(readFileSync(STAMP, 'utf8')) as { trees?: unknown }).trees;
    return Array.isArray(trees) ? trees.filter((t): t is string => typeof t === 'string') : [];
  } catch {
    return [];
  }
}

function recordGreen(tree: string | null): void {
  if (tree === null) return;
  const trees = gatedTrees().filter((t) => t !== tree);
  trees.push(tree);
  mkdirSync(STAMP_DIR, { recursive: true });
  writeFileSync(STAMP, JSON.stringify({ trees: trees.slice(-STAMP_KEEP) }, null, 1));
}

function main(): void {
  const files = process.env['FULL'] ? null : changedFiles();
  const head = git(['rev-parse', 'HEAD^{tree}']);
  const stages = planGate(files, head !== null && gatedTrees().includes(head));
  const sweep = planSweep(files);
  if (stages.length === 0) {
    // Documents alone (or nothing) changed: record the tree, so the clean tree after the commit runs nothing.
    recordGreen(worktreeTree());
    console.log('gate: no code changed since a tree the gate passed (npm run check:full runs everything)');
    console.log('gate: green');
    return;
  }
  // The tree as it is now: what the stages below prove. A file edited while they run is not in it.
  const tree = worktreeTree();
  // The e2e stage: the specs that changed, or all when what they stand on changed (ADR-87).
  let e2e: E2ePlan = { mode: 'full', specs: [], why: '' };
  if (stages.includes('e2e') && !process.env['FULL']) {
    e2e = planE2e(files);
    e2e.specs = e2e.specs.filter((f) => existsSync(path.join(ROOT, f)));
    if (e2e.mode === 'changed' && e2e.specs.length === 0) e2e.mode = 'none';
    if (e2e.mode === 'none') stages.splice(stages.indexOf('e2e'), 1);
  }
  // The unit stage: the tests related to what changed, or all when what they stand on changed (ADR-280).
  const unit: UnitPlan = process.env['FULL'] ? { mode: 'full', files: [], why: '' } : planUnit(files, (f) => existsSync(path.join(ROOT, f)));
  const unitWhy = unit.why !== '' && stages.includes('test');
  if (stages.includes('test') && unit.mode === 'none') stages.splice(stages.indexOf('test'), 1);
  const skipped = ALL_STAGES.filter((s) => !stages.includes(s));
  console.log(`gate: ${stages.join(' → ')}${skipped.length > 0 ? `   (skipped: ${skipped.join(', ')}; npm run check:full runs everything)` : ''}`);
  if (unitWhy) console.log(`gate: unit ${unit.mode === 'full' ? 'in full' : unit.mode === 'related' ? `the tests related to ${unit.files.length} file(s)` : 'left out'}: ${unit.why}`);
  if (e2e.why !== '') console.log(`gate: e2e ${e2e.mode === 'full' ? 'in full' : e2e.mode === 'changed' ? `of ${e2e.specs.length} spec file(s)` : 'left out'}: ${e2e.why}`);
  if (stages.includes('test:sweep')) console.log(`gate: sweep ${sweep === 'full' ? 'in full' : `the pin alone (${PIN_TEST}); every sweep test in npm run check:full`}`);
  for (const stage of stages) {
    if (stage === 'test') {
      const red = unitRedTwice(unit.mode === 'related' ? unit.files : undefined);
      if (red.length === 0) continue;
      console.error(`gate: red in the ${unit.mode} run and again alone:\n  ${red.join('\n  ')}`);
      console.error('gate: FAILED at test');
      process.exitCode = 1;
      return;
    }
    if (stage === 'e2e') {
      const { known, unknown } = splitKnown(e2eRedTwice(e2eRuns(e2e.mode === 'changed' ? e2e.specs : [])), knownRed());
      for (const t of known) console.log(`gate: known red (${KNOWN}): ${t}`);
      if (unknown.length === 0) continue;
      console.error(`gate: red in the e2e run and again alone, not on ${KNOWN}:\n  ${unknown.join('\n  ')}`);
      console.error('gate: FAILED at e2e');
      process.exitCode = 1;
      return;
    }
    const command =
      stage === 'test:sweep' && sweep === 'pin'
          ? `npx vitest run --config vitest.sweep.config.ts ${PIN_TEST}`
          : `npm run ${stage}`;
    const r = spawnSync(command, { cwd: ROOT, stdio: 'inherit', shell: true });
    if (r.status !== 0) {
      console.error(`gate: FAILED at ${stage}`);
      process.exitCode = r.status ?? 1;
      return;
    }
  }
  recordGreen(tree);
  console.log('gate: green');
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) main();
