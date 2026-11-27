import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { SUITE } from '../../tools/gate/render';
import { again, codeTree, E2E_CHUNK, e2eRedTwice, errorRed, FILE_RED, judge, KNOWN, outOfKey, playwrightRed, reviewSteps, runRed, unitRedTwice, vitestCommand, vitestRed, type ReviewRecord, type RunAt } from '../../tools/gate/review';

// ADR-297 (the user's decision): the phase review's full run is recorded by `npm run check:review`
// under a code key, and judged against a list of known reds, so that the commit that ticks the
// review (documents alone) does not run it again.

const ROOT = path.resolve(import.meta.dirname, '../..');

/**
 * A folder of a fixture's files under `.cache/gate` (in the repository, where its files find `vitest` and
 * `@playwright/test`; ignored by git, and outside what the suites take for tests), gone after `body`. `rel`: from the root.
 */
function withFixture<T>(files: Record<string, string[]>, body: (dir: string, rel: string) => T): T {
  mkdirSync(path.join(ROOT, '.cache/gate'), { recursive: true });
  const dir = mkdtempSync(path.join(ROOT, '.cache/gate/fixture-'));
  const rel = path.relative(ROOT, dir).split(path.sep).join('/');
  try {
    for (const [file, lines] of Object.entries(files)) {
      mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      writeFileSync(path.join(dir, file), lines.join('\n').replaceAll('<rel>', rel) + '\n');
    }
    return body(dir, rel);
  } finally {
    // A killed worker may hold its files a moment longer (Windows).
    rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
}

/** A fixture file's first lines: whether this is the first run of it (it leaves a mark beside itself, and another when it is run again). */
const FIRST_RUN = ["const mark = import.meta.filename + '.ran';", 'const first = !existsSync(mark);', "writeFileSync(first ? mark : mark + '.again', '');"];
/** The fixture's worker goes, as one out of memory or killed does: at once, with nothing said. */
const WORKER_GOES = "process.kill(process.pid, 'SIGKILL');";
/** A fixture of unit tests: its config, and a test red by its name in the first run and green alone, as a timing test under the load of the run: the red the gate has a name for. */
const UNIT_FIXTURE = {
  'vitest.config.ts': ["import { defineConfig } from 'vitest/config';", '', "export default defineConfig({ test: { include: ['<rel>/unit/*.test.ts'], exclude: ['**/node_modules/**'], environment: 'node' } });"],
  'unit/red.test.ts': ["import { existsSync, writeFileSync } from 'node:fs';", "import { expect, it } from 'vitest';", ...FIRST_RUN, "it('red in the first run, green alone', () => {", '  expect(first).toBe(false);', '});'],
};
/**
 * The gate's unit stage run on a fixture's files: its red ids (from the fixture's folder), and the files it ran again
 * alone, of those that leave their mark (`FIRST_RUN`): the files red in the first run.
 */
const unitStage = (files: Record<string, string[]>): { red: string[]; again: string[] } =>
  withFixture(files, (dir, rel) => {
    const at: RunAt = { config: `--config ${rel}/vitest.config.ts`, out: path.join(dir, 'report.json'), quiet: true };
    const red = unitRedTwice(undefined, at).map((t) => t.replace(`${rel}/`, '')).sort();
    const again = readdirSync(path.join(dir, 'unit')).filter((f) => f.endsWith('.ran.again')).map((f) => f.replace('.ran.again', '')).sort();
    return { red, again };
  });

const record = (done: Record<string, string[]>, steps = ['lint', 'test', 'e2e:1']): ReviewRecord => ({
  key: 'k',
  steps,
  done: Object.fromEntries(Object.entries(done).map(([s, red]) => [s, { red, at: '' }])),
});

describe('npm run check:review (ADR-297)', () => {
  it('steps: the plain stages, the unit and sweep tests, a step a chunk of specs, the perf spec', () => {
    // On SwiftShader in chunks; on the GPU the browser suite is one step (ADR-1029).
    expect(reviewSteps(2 * E2E_CHUNK + 1, false)).toEqual(['typecheck', 'lint', 'build', 'test', 'test:sweep', 'e2e:1', 'e2e:2', 'e2e:3', 'e2e:perf']);
    expect(reviewSteps(E2E_CHUNK, false)).toContain('e2e:1');
    expect(reviewSteps(E2E_CHUNK, false)).not.toContain('e2e:2');
    expect(reviewSteps(2 * E2E_CHUNK + 1, true)).toEqual(['typecheck', 'lint', 'build', 'test', 'test:sweep', 'e2e', 'e2e:perf']);
  });

  it('green: every step done and every red test known; a step not done or a red not known is not', () => {
    expect(judge(record({ lint: [], test: ['a › t'], 'e2e:1': [] }), ['a › t']).green).toBe(true);
    const unfinished = judge(record({ lint: [], test: [] }), []);
    expect(unfinished.green).toBe(false);
    expect(unfinished.missing).toEqual(['e2e:1']);
    const unknown = judge(record({ lint: ['stage:lint'], test: ['a › t', 'b › u'], 'e2e:1': [] }), ['a › t']);
    expect(unknown.green).toBe(false);
    expect(unknown.unknown).toEqual(['stage:lint', 'b › u']);
    expect(unknown.known).toEqual(['a › t']);
  });

  it('the code key leaves out the documents, the critic and the list of known reds, and nothing else', () => {
    for (const f of ['PLAN.md', 'PROGRESS.md', 'docs/PARITY.md', 'docs/evidence/4.7/a.png', 'critic/CRITIC_REPORT.json', KNOWN]) expect(outOfKey(f), f).toBe(true);
    for (const f of ['src/sim/sim.ts', 'tests/unit/gate.test.ts', 'tools/gate/review.ts', 'data/terrain.json', 'package.json']) expect(outOfKey(f), f).toBe(false);
  });

  it('red twice: a test red in the first run is red only when its file run alone fails it again (ADR-423)', () => {
    const first = ['tests/unit/a.test.ts › slow', 'tests/unit/a.test.ts › broken', 'tests/unit/b.test.ts › flaky', 'stage:test'];
    const files: string[] = [];
    const red = again(first, (f) => {
      files.push(f);
      return f === 'tests/unit/a.test.ts' ? ['tests/unit/a.test.ts › broken'] : [];
    });
    expect(files).toEqual(['tests/unit/a.test.ts', 'tests/unit/b.test.ts']);
    expect(red).toEqual(['stage:test', 'tests/unit/a.test.ts › broken']);
    // A file whose run alone wrote no report: its tests stay red.
    expect(again(['tests/unit/c.test.ts › x'], () => null)).toEqual(['tests/unit/c.test.ts › x']);
  });

  it('the related run is the related tests with a report, and a red file of it is run again alone (ADR-427)', () => {
    // With the gate's own reporter beside vitest's two: the errors outside the tests (R231).
    expect(vitestCommand('related --run', '--passWithNoTests', 'r.json', ['src/a.ts', 'src/b.ts'])).toBe('npx vitest related --run --passWithNoTests --reporter=default --reporter=json --outputFile=r.json --reporter=./tools/gate/vitestErrors.ts src/a.ts src/b.ts');
    expect(vitestCommand('run', '', 'r.json', ['tests/unit/a.test.ts'])).toBe('npx vitest run  --reporter=default --reporter=json --outputFile=r.json --reporter=./tools/gate/vitestErrors.ts tests/unit/a.test.ts');
  });

  it('the ids of red tests: a vitest report by file and full name, a Playwright one by file and titles', () => {
    const v = vitestRed({
      testResults: [
        { name: path.join(ROOT, 'tests/unit/a.test.ts'), assertionResults: [{ fullName: 'suite one', status: 'passed' }, { fullName: 'suite two', status: 'failed' }] },
      ],
    });
    expect(v).toEqual(['tests/unit/a.test.ts › suite two']);
    const p = playwrightRed({
      suites: [
        {
          title: 'b.spec.ts',
          file: 'b.spec.ts',
          specs: [{ title: 'top', ok: false, file: 'b.spec.ts' }, { title: 'fine', ok: true, file: 'b.spec.ts' }],
          suites: [{ title: 'group', specs: [{ title: 'inner', ok: false, file: 'b.spec.ts' }] }],
        },
      ],
    });
    expect(p).toEqual(['tests/e2e/b.spec.ts › top', 'tests/e2e/b.spec.ts › group › inner']);
  });

  it('a file red with no test red, a spec that fails to load, a run failed with no red named: each red (PLAN 5.8p)', () => {
    // A unit file that fails to import, or throws in a hook: failed, no failed test.
    const v = vitestRed({
      testResults: [
        { name: path.join(ROOT, 'tests/unit/broken.test.ts'), status: 'failed', assertionResults: [] },
        { name: path.join(ROOT, 'tests/unit/hook.test.ts'), status: 'failed', assertionResults: [{ fullName: 'skipped one', status: 'skipped' }] },
        { name: path.join(ROOT, 'tests/unit/one.test.ts'), status: 'failed', assertionResults: [{ fullName: 'it', status: 'failed' }] },
        { name: path.join(ROOT, 'tests/unit/fine.test.ts'), status: 'passed', assertionResults: [{ fullName: 'it', status: 'passed' }] },
      ],
    });
    expect(v).toEqual([`tests/unit/broken.test.ts › ${FILE_RED}`, `tests/unit/hook.test.ts › ${FILE_RED}`, 'tests/unit/one.test.ts › it']);
    // Playwright's errors outside every test: by the file they name, else the run's.
    const p = playwrightRed({ suites: [], errors: [{ location: { file: path.join(ROOT, 'tests/e2e/c.spec.ts') } }, { location: { file: 'd.spec.ts' } }, {}] });
    expect(p).toEqual([`tests/e2e/c.spec.ts › ${FILE_RED}`, `tests/e2e/d.spec.ts › ${FILE_RED}`, 'stage:playwright']);
    // A non-zero exit with no red named is the stage's red; with reds, those; a clean exit, none.
    expect(runRed([], false, 'test')).toEqual(['stage:test']);
    expect(runRed(['a › t'], false, 'test')).toEqual(['a › t']);
    expect(runRed([], true, 'test')).toEqual([]);
    // And none of these is green against an empty list of known reds.
    expect(judge(record({ lint: [], test: v, 'e2e:1': p }), []).green).toBe(false);
  });

  // ROADMAP R230 (ADR-1159). On 2026-11-26 the worker of `worldTemplate.test.ts` ran out of memory in a gate's unit
  // run; vitest told of it as an error of the run and reported the file as passed, the gate ran the one test red by
  // name again alone, and ended green with a file whose five tests never ran.
  it('a unit file whose worker was lost is red as a whole: its tests pending, or none (R230)', () => {
    // The shapes of vitest 5.0.3's report (the live run below holds them against the vitest installed).
    const v = vitestRed({
      testResults: [
        // The worker went in a test or in a hook: every test of the file pending, the file "passed".
        { name: path.join(ROOT, 'tests/unit/mid.test.ts'), status: 'passed', assertionResults: [{ fullName: 'first', status: 'pending' }, { fullName: 'second', status: 'pending' }] },
        // It went as the file loaded: no test at all.
        { name: path.join(ROOT, 'tests/unit/load.test.ts'), status: 'passed', assertionResults: [] },
        // A test failed and was told of, then the worker went: the test by its name, and the file.
        { name: path.join(ROOT, 'tests/unit/part.test.ts'), status: 'failed', assertionResults: [{ fullName: 'passes', status: 'passed' }, { fullName: 'fails', status: 'failed' }, { fullName: 'never starts', status: 'pending' }] },
        // Tests left out on purpose are no loss.
        { name: path.join(ROOT, 'tests/unit/skips.test.ts'), status: 'passed', assertionResults: [{ fullName: 'runs', status: 'passed' }, { fullName: 'left out', status: 'skipped' }, { fullName: 'to do', status: 'todo' }] },
      ],
    });
    expect(v).toEqual([`tests/unit/mid.test.ts › ${FILE_RED}`, `tests/unit/load.test.ts › ${FILE_RED}`, 'tests/unit/part.test.ts › fails', `tests/unit/part.test.ts › ${FILE_RED}`]);
  });

  it('a file red as a whole is red unless its run alone passes all of it; a run alone that failed has passed nothing (R230)', () => {
    const whole = `tests/unit/lost.test.ts › ${FILE_RED}`;
    // Alone it passes: it was the load of the run.
    expect(again([whole], () => [])).toEqual([]);
    // Lost again alone.
    expect(again([whole], () => [whole])).toEqual([whole]);
    // Alone it loads and a test of it is red: that test had no first run to be green in.
    expect(again([whole], () => ['tests/unit/lost.test.ts › never ran before'])).toEqual(['tests/unit/lost.test.ts › never ran before']);
    // A test told of as failed before the worker went: green alone, and another red alone.
    expect(again(['tests/unit/lost.test.ts › fails', whole], () => ['tests/unit/lost.test.ts › other'])).toEqual(['tests/unit/lost.test.ts › other']);
    // No report alone, or the run alone failed with nothing of the file named: the file has not passed.
    expect(again([whole], () => null)).toEqual([whole]);
    expect(again([whole], () => ['stage:test'])).toEqual([whole]);
    // The same of a test red by its name: a run alone that failed as a run has not passed it.
    expect(again(['tests/unit/a.test.ts › slow'], () => ['stage:test'])).toEqual(['tests/unit/a.test.ts › slow']);
    // And a test red by its name is red only when it fails again (ADR-423): another test's red alone is not held against it.
    expect(again(['tests/unit/a.test.ts › slow'], () => ['tests/unit/a.test.ts › other'])).toEqual([]);
  });

  it('a browser test that did not run is red; one left out on purpose is not (R230)', () => {
    // The shapes of Playwright 1.63's report: a test's outcome, and what it was to be.
    const of = (status: string, expectedStatus: string): { status: string; expectedStatus: string } => ({ status, expectedStatus });
    const p = playwrightRed({
      suites: [
        {
          title: 'lost.spec.ts',
          file: 'lost.spec.ts',
          specs: [
            // The worker went as it loaded the file: the first test failed by it, the rest did not run, and read ok.
            { title: 'first', ok: false, file: 'lost.spec.ts', tests: [of('unexpected', 'passed')] },
            { title: 'did not run', ok: true, file: 'lost.spec.ts', tests: [of('skipped', 'passed')] },
            // Left out on purpose (`test.skip`, `test.fixme`: in a declaration, a body, a hook, a group).
            { title: 'left out', ok: true, file: 'lost.spec.ts', tests: [of('skipped', 'skipped')] },
            { title: 'ran', ok: true, file: 'lost.spec.ts', tests: [of('expected', 'passed')] },
            // Of two projects, not run in one.
            { title: 'in two projects', ok: true, file: 'lost.spec.ts', tests: [of('expected', 'passed'), of('skipped', 'passed')] },
          ],
        },
      ],
    });
    expect(p).toEqual(['tests/e2e/lost.spec.ts › first', 'tests/e2e/lost.spec.ts › did not run', 'tests/e2e/lost.spec.ts › in two projects']);
    // The ids of a run of another folder's specs (a fixture's).
    expect(playwrightRed({ suites: [{ title: 'a.spec.ts', specs: [{ title: 't', ok: false, file: 'a.spec.ts' }] }], errors: [{ location: { file: 'b.spec.ts' } }] }, '.cache/x/e2e')).toEqual(['.cache/x/e2e/a.spec.ts › t', `.cache/x/e2e/b.spec.ts › ${FILE_RED}`]);
  });

  it('the unit stage on a fixture whose workers go: a lost file is red unless it passes alone, beside a red that does (R230)', () => {
    const files = {
      ...UNIT_FIXTURE,
      // Its worker goes in a test of the first run; alone it passes.
      'unit/once.test.ts': ["import { existsSync, writeFileSync } from 'node:fs';", "import { it } from 'vitest';", ...FIRST_RUN, "it('before', () => {});", "it('its worker goes in the first run', () => {", `  if (first) ${WORKER_GOES}`, '});', "it('after', () => {});"],
      // Its worker goes as the file loads, each time (as one out of memory does).
      'unit/twice.test.ts': ["import { it } from 'vitest';", WORKER_GOES, "it('never runs', () => {});"],
      // Its worker goes as the file loads in the first run; alone it loads, and a test of it is red.
      'unit/then.test.ts': ["import { existsSync, writeFileSync } from 'node:fs';", "import { expect, it } from 'vitest';", ...FIRST_RUN, `if (first) ${WORKER_GOES}`, "it('fine', () => {});", "it('red when it runs', () => {", '  expect(1).toBe(2);', '});'],
    };
    const { red, again } = unitStage(files);
    // No `stage:test` among them: vitest's error of each lost worker is read as that file's too (R231, `errorRed`).
    expect(red).toEqual(['unit/then.test.ts › red when it runs', `unit/twice.test.ts › ${FILE_RED}`]);
    // Each file red in the first run was run again alone (`twice` leaves no mark).
    expect(again).toEqual(['once.test.ts', 'red.test.ts', 'then.test.ts']);
  }, 300_000);

  // ROADMAP R231 (ADR-1160). vitest fails a run for an error it caught outside the tests (a rejection nothing handled,
  // an exception out of a timer) and its JSON report has no trace of it: beside a test red by its name that passed
  // alone, the gate ended green. The gate's reporter (`tools/gate/vitestErrors.ts`) writes those errors beside the report.
  it('an error vitest caught outside the tests is red: its file as a whole where it names one, else the run (R231)', () => {
    // As vitest hands them to a reporter (5.0.3; the live runs below hold them against the vitest installed): a file by its full path.
    const full = (f: string): string => path.join(ROOT, f).split(path.sep).join('/');
    const pool = '[vitest-pool]: Worker forks emitted error.';
    const red = errorRed(
      [
        // From a test file's worker: vitest names the file, and the test that was running.
        { type: 'Unhandled Rejection', message: 'not caught', path: full('tests/unit/a.test.ts'), test: 'a' },
        // Another of the same file: the file once.
        { type: 'Uncaught Exception', message: 'from a timer', path: full('tests/unit/a.test.ts') },
        // A lost worker (R230): the pool's error names the file in its cause's last words, as Windows says it and as Linux does.
        { type: 'Unhandled Error', message: pool, cause: `Worker exited unexpectedly with exit code 1 during started state while running test file ${full('tests/unit/lost.test.ts')}` },
        { type: 'Unhandled Error', message: pool, cause: `Worker exited unexpectedly with signal SIGKILL during started state while running test files ${full('tests/unit/b.test.ts')}, ${full('tests/unit/c.test.ts')}` },
        // No file named: a rejection with a value that is no Error; a worker that went as it started, whose file the
        // report leaves out altogether. The run's, once.
        { type: 'Unhandled Rejection', message: 'a string' },
        { type: 'Unhandled Error', message: pool, cause: 'Worker exited unexpectedly with exit code 9 during starting state' },
      ],
      'test',
    );
    expect(red).toEqual([`tests/unit/a.test.ts › ${FILE_RED}`, `tests/unit/lost.test.ts › ${FILE_RED}`, `tests/unit/b.test.ts › ${FILE_RED}`, `tests/unit/c.test.ts › ${FILE_RED}`, 'stage:test']);
    expect(errorRed([], 'test')).toEqual([]);
    expect(errorRed([{}], 'test:sweep')).toEqual(['stage:test:sweep']);
  });

  it('a run alone in which the file is red as a whole clears no red of it: an error left there, a worker lost there (R231)', () => {
    const slow = 'tests/unit/a.test.ts › slow';
    const whole = `tests/unit/a.test.ts › ${FILE_RED}`;
    // Alone the test passes and the file leaves an error outside its tests. Until the gate read such errors by their
    // file that run named nothing and was its own failure (`stage:test`), and the test stayed red: so it does.
    expect(again([slow], () => [whole])).toEqual([slow]);
    // The same of a file whose worker is lost alone, or that does not load there: the test did not pass, it did not run.
    expect(again([slow], () => ['tests/unit/a.test.ts › other', whole])).toEqual([slow]);
    // Another file's red as a whole is none of its: `again` asks of one file's run alone.
    expect(again([slow, 'tests/unit/b.test.ts › x'], (f) => (f === 'tests/unit/b.test.ts' ? [`tests/unit/b.test.ts › ${FILE_RED}`] : []))).toEqual(['tests/unit/b.test.ts › x']);
  });

  /** A fixture's test that passes and leaves an error outside it (`what` raises it): vitest catches it while the test waits. */
  const leaves = (what: string): string[] => ["it('passes, and leaves an error behind', async () => {", `  ${what}`, '  await new Promise((r) => setTimeout(r, 50));', '});'];

  it('the unit stage on a fixture with errors outside its tests: such a file is red unless its run alone is clean, beside a red that passes alone (R231)', () => {
    const files = {
      ...UNIT_FIXTURE,
      // A rejection nothing handles, each time; its test passes.
      'unit/each.test.ts': ["import { existsSync, writeFileSync } from 'node:fs';", "import { it } from 'vitest';", ...FIRST_RUN, ...leaves("void Promise.reject(new Error(first ? 'not caught' : 'nor alone'));")],
      // An exception out of a timer, in the first run alone.
      'unit/once.test.ts': ["import { existsSync, writeFileSync } from 'node:fs';", "import { it } from 'vitest';", ...FIRST_RUN, ...leaves("if (first) setTimeout(() => { throw new Error('from a timer'); }, 0);")],
      // Red by its name in the first run; alone its test passes, and leaves a rejection behind.
      'unit/after.test.ts': [
        "import { existsSync, writeFileSync } from 'node:fs';",
        "import { expect, it } from 'vitest';",
        ...FIRST_RUN,
        "it('red in the first run, and alone leaves an error behind', async () => {",
        '  expect(first).toBe(false);',
        "  void Promise.reject(new Error('alone'));",
        '  await new Promise((r) => setTimeout(r, 50));',
        '});',
      ],
    };
    const { red, again } = unitStage(files);
    // `after`'s test is not cleared by a run alone that left an error; `each` is red as a whole both times.
    expect(red).toEqual(['unit/after.test.ts › red in the first run, and alone leaves an error behind', `unit/each.test.ts › ${FILE_RED}`]);
    // Each of the four was red in the first run, `each` and `once` by their errors alone: run again alone, where `once` and `red` are clean.
    expect(again).toEqual(['after.test.ts', 'each.test.ts', 'once.test.ts', 'red.test.ts']);
  }, 300_000);

  it('the unit stage on a fixture with an error vitest names no file for: the run is red, and no run alone clears it (R231)', () => {
    // A rejection with a value that is no Error; its test passes.
    const files = { ...UNIT_FIXTURE, 'unit/bare.test.ts': ["import { it } from 'vitest';", ...leaves("void Promise.reject('a string');")] };
    // The file of that error has no name to be run again by: the red test's file alone was.
    expect(unitStage(files)).toEqual({ red: ['stage:test'], again: ['red.test.ts'] });
  }, 300_000);

  it('the browser stage on a fixture whose worker goes: a test that did not run is red unless it passes alone (R230)', () => {
    const files = {
      'playwright.config.ts': [
        "import { defineConfig } from '@playwright/test';",
        '',
        // One worker: a file's tests are one worker's, in their order. The suite's two projects, with no browser asked for.
        // Its output in its own folder: left to itself Playwright takes `test-results` beside the nearest package.json,
        // the browser suite's own, and empties it as it starts (a suite running beside this test lost 28 tests' traces so).
        "export default defineConfig({ testDir: 'e2e', outputDir: 'results', workers: 1, retries: 0, projects: [{ name: 'chromium', grepInvert: /@swiftshader/ }, { name: 'swiftshader', grep: /@swiftshader/ }] });",
      ],
      // Its worker goes as it loads the file, in the first run (the runner loads the file too, to list its tests): the
      // first test fails by it, the rest do not run. Alone the file loads, and the second test is red.
      'e2e/lost.spec.ts': [
        "import { existsSync, writeFileSync } from 'node:fs';",
        "import { test } from '@playwright/test';",
        "const mark = import.meta.filename + '.ran';",
        "if (process.env['TEST_WORKER_INDEX'] !== undefined && !existsSync(mark)) {",
        "  writeFileSync(mark, '');",
        `  ${WORKER_GOES}`,
        '}',
        "test('first', () => {});",
        "test('second', () => {",
        "  throw new Error('red when it runs');",
        '});',
        "test('third', () => {});",
      ],
      // Its worker goes as it loads the file, each time.
      'e2e/gone.spec.ts': ["import { test } from '@playwright/test';", `if (process.env['TEST_WORKER_INDEX'] !== undefined) ${WORKER_GOES}`, "test('one', () => {});", "test('two', () => {});"],
      // Red in the first run and green alone.
      'e2e/red.spec.ts': [
        "import { existsSync, writeFileSync } from 'node:fs';",
        "import { test } from '@playwright/test';",
        "const mark = import.meta.filename + '.ran';",
        "test('red in the first run, green alone', () => {",
        '  if (existsSync(mark)) return;',
        "  writeFileSync(mark, '');",
        "  throw new Error('the first run');",
        '});',
        "test('fine beside it', () => {});",
      ],
    };
    const { red, own } = withFixture(files, (dir, rel) => {
      const at: RunAt = { config: `--config ${rel}/playwright.config.ts`, out: path.join(dir, 'report.json'), dir: `${rel}/e2e`, quiet: true };
      const ids = e2eRedTwice([{ project: 'chromium', args: SUITE }], at).map((t) => t.replace(`${rel}/`, ''));
      // Playwright writes its last run's record into its output folder.
      return { red: ids, own: existsSync(path.join(dir, 'results/.last-run.json')) };
    });
    // `gone`'s first test fails by its worker both times and its second never runs; `lost`'s second is red in the one run it had.
    expect(red.sort()).toEqual(['e2e/gone.spec.ts › one', 'e2e/gone.spec.ts › two', 'e2e/lost.spec.ts › second']);
    // The fixture's runs wrote to their own folder, not the browser suite's `test-results`.
    expect(own).toBe(true);
  }, 300_000);

  it('the code key of a repository: the same after a commit of the critic\'s files or the documents, tracked or not; another after code (PLAN 5.8q)', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'review-key-'));
    try {
      const git = (...args: string[]): void => {
        const r = spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { cwd: dir, encoding: 'utf8' });
        expect(r.status, r.stderr).toBe(0);
      };
      const put = (file: string, text: string): void => {
        mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
        writeFileSync(path.join(dir, file), text);
      };
      git('init', '-q');
      put('.gitignore', '.cache/\n');
      put('src/a.ts', 'export const a = 1;\n');
      put('critic/CRITIC_REPORT.json', '{}\n');
      put('README.md', 'one\n');
      git('add', '-A');
      git('commit', '-q', '-m', 'one');
      const key = codeTree(dir);
      expect(key).not.toBeNull();
      // A critic's report changed, not committed; then committed: the same key.
      put('critic/CRITIC_REPORT.json', '{"verdict":1}\n');
      expect(codeTree(dir)).toBe(key);
      git('add', '-A');
      git('commit', '-q', '-m', 'critic');
      expect(codeTree(dir)).toBe(key);
      put('README.md', 'two\n');
      git('commit', '-q', '-am', 'docs');
      expect(codeTree(dir)).toBe(key);
      put('src/a.ts', 'export const a = 2;\n');
      expect(codeTree(dir)).not.toBe(key);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('the list of known reds: each test once, of a file that exists, with why it is there', () => {
    const list = (JSON.parse(readFileSync(path.join(ROOT, KNOWN), 'utf8')) as { tests: { id: string; why: string }[] }).tests;
    // A list, with none on it too: emptied on 2026-11-26 when its tests ran green on the user's PC (ADR-1156).
    expect(Array.isArray(list)).toBe(true);
    expect(new Set(list.map((t) => t.id)).size).toBe(list.length);
    for (const t of list) {
      expect(existsSync(path.join(ROOT, t.id.split(' › ')[0]!)), t.id).toBe(true);
      expect(t.why.length, t.id).toBeGreaterThan(20);
    }
  });
});
