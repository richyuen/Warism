import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { e2eRuns, splitKnown } from '../../tools/gate/review';
import { ALL_STAGES, changedFiles, gatedTrees, historySpecs, PIN_TEST, planE2e, planGate, planSweep, planUnit, runsTheSim, worktreeTree } from '../../tools/gate/check';

// ADR-48, ADR-49: the gate is sized to what changed since HEAD. ADR-55: a clean tree that the
// gate has already passed runs nothing. ADR-805: the plan's phase reviews no longer widen it; the
// whole suites run in check:full and check:review, before a release.

describe('gate plan (ADR-48, ADR-49)', () => {
  it('documents only: nothing to run (parity retired, ADR-805)', () => {
    expect(planGate(['PROGRESS.md', 'docs/PARITY.md', 'docs/sweeps/2026-10-03-sweep-b1.json', 'docs/evidence/2.3/warsaw.png'])).toEqual([]);
    expect(planGate(['CLAUDE.md', 'critic/shots/s1.png'])).toEqual([]); // critic/ is ignored
  });

  it('code outside the sim: everything but the sweep tests', () => {
    const stages = planGate(['src/render/units/counters.ts', 'PROGRESS.md']);
    expect(stages).toEqual(ALL_STAGES.filter((s) => s !== 'test:sweep'));
    expect(planGate(['package.json'])).not.toContain('test:sweep'); // scripts; dependencies show in the lock file
    expect(planGate(['tests/unit/war.test.ts'])).toContain('test');
  });

  it('a sim input: everything', () => {
    for (const f of ['src/sim/systems/war.ts', 'src/shared/calendar.ts', 'data/terrain.json', 'tests/helpers/aiSweep.ts', 'tools/headless/runner.ts', 'package-lock.json', 'vitest.sweep.config.ts']) {
      expect(planGate([f, 'PLAN.md']), f).toEqual([...ALL_STAGES]);
    }
  });

  it('a clean tree, or only critic output, still checks the code; unknown changes run everything', () => {
    expect(planGate([])).toEqual(ALL_STAGES.filter((s) => s !== 'test:sweep'));
    expect(planGate(['critic/CRITIC_REPORT.json'])).toEqual(ALL_STAGES.filter((s) => s !== 'test:sweep'));
    expect(planGate(null)).toEqual([...ALL_STAGES]);
  });

  it('a clean tree the gate has already passed runs nothing; any change runs as before (ADR-55)', () => {
    expect(planGate([], true)).toEqual([]);
    expect(planGate(['critic/CRITIC_REPORT.json'], true)).toEqual([]);
    expect(planGate(['PROGRESS.md'], true)).toEqual([]);
    expect(planGate(['src/render/units/counters.ts'], true)).toEqual(ALL_STAGES.filter((s) => s !== 'test:sweep'));
    expect(planGate(['src/sim/systems/war.ts'], true)).toEqual([...ALL_STAGES]);
    expect(planGate(null, true)).toEqual([...ALL_STAGES]);
  });

  // ADR-278 (the user's decision, 2026-10-12): the pin alone; every 10-year test in check:full.
  it('the sweep stage: the pin alone, every sweep test when what changed is not known', () => {
    expect(planSweep(['src/sim/systems/war.ts'])).toBe('pin');
    expect(planSweep(null)).toBe('full');
    expect(readFileSync(path.resolve(import.meta.dirname, '../..', PIN_TEST), 'utf8')).toContain('BASELINE');
  });

  // ADR-280 (the user's decision, 2026-10-12): the test files whose imports reach what changed;
  // all of them when something every test stands on changed.
  it('the unit stage: in full when a shared file changed or what changed is not known; otherwise the related tests', () => {
    const on = (): boolean => true;
    expect(planUnit(['src/render/fx/wrecks.ts', 'PROGRESS.md'], on)).toEqual({ mode: 'related', files: ['src/render/fx/wrecks.ts'], why: expect.any(String) });
    expect(planUnit(['src/sim/world.ts', 'tests/unit/war.test.ts'], on).files).toEqual(['src/sim/world.ts', 'tests/unit/war.test.ts']);
    expect(planUnit(null, on).mode).toBe('full');
    for (const f of ['vitest.config.ts', 'tests/helpers/earth.ts', 'package-lock.json', 'data/scenarios/1938/oob.json', 'public/data/earth/manifest.json', 'tools/headless/assets.ts']) expect(planUnit([f], on).mode, f).toBe('full');
    // A file removed: what imported it is not known any more.
    expect(planUnit(['src/sim/gone.ts'], (f) => f !== 'src/sim/gone.ts').mode).toBe('full');
    // A commit of documents alone runs nothing (ADR-805).
    expect(planGate(['PLAN.md', 'PROGRESS.md'])).toEqual([]);
    expect(planUnit(['PLAN.md', 'PROGRESS.md'], on).mode).toBe('none');
    // No source and no unit test: none (a spec, a picture, the critic's output).
    expect(planUnit(['tests/e2e/fire1938.spec.ts', 'docs/evidence/4.7/a.png', 'critic/x.json'], on).mode).toBe('none');
  });

  it('the working tree has a tree id, the same when asked twice; the record of passed trees is a list of ids', () => {
    const tree = worktreeTree();
    expect(tree).toMatch(/^[0-9a-f]{40,64}$/);
    expect(worktreeTree()).toBe(tree);
    for (const t of gatedTrees()) expect(t).toMatch(/^[0-9a-f]{40,64}$/);
  });

  // ADR-87 (the user's decision): the specs that changed, or all when what they stand on changed.
  it('e2e: the changed specs, or none; in full when what every spec stands on changed', () => {
    const code = ['src/render/units/markers.ts', 'PLAN.md'];
    expect(planE2e(code)).toMatchObject({ mode: 'none' });
    // With a spec written or edited: that spec is run.
    expect(planE2e([...code, 'tests/e2e/tags1938.spec.ts', 'tests/unit/tags.test.ts'])).toMatchObject({ mode: 'changed', specs: ['tests/e2e/tags1938.spec.ts'] });
    // What every spec stands on, or an unknown change: everything.
    expect(planE2e([...code, 'tests/e2e/settle.ts'])).toMatchObject({ mode: 'full' });
    expect(planE2e([...code, 'playwright.config.ts'])).toMatchObject({ mode: 'full' });
    expect(planE2e(null)).toMatchObject({ mode: 'full' });
    // ADR-825 (ROADMAP R19), ADR-1029: the pin of seed 99 moved, with the rule that moved it: the
    // specs whose world moves past its start, and the changed ones.
    const history = (): string[] => ['tests/e2e/b1938.spec.ts'];
    expect(planE2e(['src/sim/systems/elements.ts', PIN_TEST], history)).toMatchObject({ mode: 'changed', specs: ['tests/e2e/b1938.spec.ts'] });
    expect(planE2e(['src/sim/systems/elements.ts', PIN_TEST, 'tests/e2e/a.spec.ts'], history)).toMatchObject({ mode: 'changed', specs: ['tests/e2e/a.spec.ts', 'tests/e2e/b1938.spec.ts'] });
    expect(planE2e([PIN_TEST, 'tests/e2e/settle.ts'], history)).toMatchObject({ mode: 'full' });
    expect(planE2e(['src/sim/systems/elements.ts'])).toMatchObject({ mode: 'none' });
    // The critic's own files are not a change.
    expect(planE2e(['critic/scripts/x.spec.ts', 'src/app/hud.ts'])).toMatchObject({ mode: 'none' });
  });

  // ADR-1029: a spec whose world never moves past its start cannot see a rule that moves the history.
  it('a spec runs the sim when it steps it, starts its clock, loads a game or opens a page not paused', () => {
    const none = (): null => null;
    const still = "await page.goto('/?scenario=1938&paused=1&seed=99');\nawait page.evaluate(() => window.__warsim!.view!.select(3));";
    expect(runsTheSim(still, none)).toBe(false);
    expect(runsTheSim(`${still}\nawait page.evaluate(() => window.__warsim!.sim.step(24));`, none)).toBe(true);
    expect(runsTheSim(`${still}\nawait page.getByTestId('pause-btn').click();`, none)).toBe(true);
    expect(runsTheSim(`${still}\nawait page.keyboard.press('Space');`, none)).toBe(true);
    expect(runsTheSim(`${still}\nawait page.getByTestId('settings-new-game').click();`, none)).toBe(true);
    expect(runsTheSim("await page.goto('/?scenario=toy');", none)).toBe(true);
    expect(runsTheSim("await page.goto('/');", none)).toBe(true);
    expect(runsTheSim('await page.goto(url);', none)).toBe(true);
    expect(runsTheSim('await page.goto(`/?scenario=1938h&paused=1&after=7`);', none)).toBe(true);
    expect(runsTheSim('const x = 1;', none)).toBe(true);
    // Through a helper of tests/e2e it imports.
    const helper = (h: string): string | null => (h === 'reach' ? 'await page.evaluate(() => window.__warsim!.sim.step(1));' : null);
    expect(runsTheSim(`import { reach } from './reach';\n${still}`, helper)).toBe(true);
    expect(runsTheSim(`import { settle } from './settle';\n${still}`, helper)).toBe(false);
    // This repository's specs: a battle needs its days; the camera spec has none.
    const specs = historySpecs();
    expect(specs).toContain('tests/e2e/battleView1938.spec.ts');
    expect(specs).not.toContain('tests/e2e/camera.spec.ts');
  });

  // A perf spec named alone ran the whole suite: the perf project depends on chromium (PLAN 4.7's tick).
  it('the e2e runs: a perf spec on its project without its dependency, the others on chromium', () => {
    expect(e2eRuns(['tests/e2e/fire1938.spec.ts'])).toEqual([{ project: 'chromium', args: 'tests/e2e/fire1938.spec.ts --project=chromium --project=swiftshader' }]);
    expect(e2eRuns(['tests/e2e/provinces.perf.spec.ts'])).toEqual([{ project: 'perf', args: 'tests/e2e/provinces.perf.spec.ts --project=perf --no-deps' }]);
    expect(e2eRuns(['tests/e2e/a.spec.ts', 'tests/e2e/b.perf.spec.ts'])).toEqual([
      { project: 'chromium', args: 'tests/e2e/a.spec.ts --project=chromium --project=swiftshader' },
      { project: 'perf', args: 'tests/e2e/b.perf.spec.ts --project=perf --no-deps' },
    ]);
    // In full (ADR-779): chromium and swiftshader (ADR-1029), then perf on its own (a red in chromium left perf not run).
    expect(e2eRuns([])).toEqual([
      { project: 'chromium', args: '--project=chromium --project=swiftshader' },
      { project: 'perf', args: '--project=perf --no-deps' },
    ]);
  });

  it('fails the e2e stage only on a test red twice that is not a known red (ADR-779)', () => {
    const red = ['tests/e2e/seaRow1938.spec.ts › x', 'tests/e2e/new.spec.ts › y'];
    expect(splitKnown(red, ['tests/e2e/seaRow1938.spec.ts › x', 'tests/e2e/other.spec.ts › z'])).toEqual({ known: ['tests/e2e/seaRow1938.spec.ts › x'], unknown: ['tests/e2e/new.spec.ts › y'] });
    expect(splitKnown([], ['tests/e2e/seaRow1938.spec.ts › x'])).toEqual({ known: [], unknown: [] });
  });

  it('a file that only looks like a document is code', () => {
    expect(planGate(['src/docs/readme.ts'])).toContain('typecheck');
    expect(planGate(['docs.ts'])).toContain('typecheck');
  });

  it('git reports the changed files of this repository', () => {
    const files = changedFiles();
    expect(files).not.toBeNull();
    for (const f of files!) expect(f).not.toMatch(/^.. /); // paths, not status lines
  });
});
