import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { judge, loadCorpus, specMisses } from '../../tools/spec/refs';

/**
 * ROADMAP R6, ADR-821: a section of SPEC.md rewritten as the game is names only files, code and
 * scripts that exist. Each part of R6 adds its section here.
 */
const REWRITTEN = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

describe('SPEC.md names what exists', () => {
  const corpus = loadCorpus();

  it('the checker tells a stale name from a live one', () => {
    expect(judge('tools/gate/check.ts', corpus)).toBeNull();
    expect(judge('systems/air.ts', corpus)).toBeNull();
    expect(judge('data/scenarios/<id>/scenario.json', corpus)).toBeNull();
    expect(judge('World.cellPoint', corpus)).toBeNull();
    expect(judge('npm run check:review', corpus)).toBeNull();
    expect(judge('tools/gate/criticDue.ts', corpus)).not.toBeNull();
    expect(judge('npm run parity', corpus)).not.toBeNull();
    expect(judge('isCapitalOfNowhere', corpus)).not.toBeNull();
  });

  // ROADMAP R233 (ADR-1161): the tree read is the working tree, not git's index. A file SPEC.md cites counts before it
  // is added (R231's own line was red until then), and one removed from the disk does not count, staged or not.
  it('the tree is the working tree: a new file counts before it is added, a removed one does not, an ignored one never', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'spec-refs-'));
    try {
      const git = (...args: string[]): void => void execFileSync('git', args, { cwd: dir, stdio: 'ignore' });
      const write = (f: string, text: string): void => {
        mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
        writeFileSync(path.join(dir, f), text);
      };
      write('package.json', '{ "scripts": { "check": "x" } }\n');
      write('.gitignore', '.cache/\n');
      write('src/added.ts', 'export const addedWord = 1;\n');
      write('src/gone.ts', 'export const goneWord = 1;\n');
      git('init', '-q');
      git('add', '-A');
      // After the add: a new file, a file under an ignored folder, and one of those added removed from the disk.
      write('tools/fresh.ts', 'export const freshWord = 1;\n');
      write('.cache/run.ts', 'export const cacheWord = 1;\n');
      rmSync(path.join(dir, 'src/gone.ts'));
      const c = loadCorpus(dir);
      expect([...c.files].sort()).toEqual(['.gitignore', 'package.json', 'src/added.ts', 'tools/fresh.ts']);
      expect(judge('tools/fresh.ts', c)).toBeNull();
      expect(judge('freshWord', c)).toBeNull();
      expect(judge('src/added.ts', c)).toBeNull();
      expect(judge('src/gone.ts', c)).not.toBeNull();
      expect(judge('goneWord', c)).not.toBeNull();
      expect(judge('cacheWord', c)).not.toBeNull();
      expect(judge('npm run check', c)).toBeNull();
    } finally {
      rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    }
  });

  for (const s of REWRITTEN) {
    it(`§${s}: every path, name and script it cites exists`, () => {
      expect(specMisses(s, corpus).map((m) => `${m.line}: ${m.span} (${m.why})`)).toEqual([]);
    });
  }
});
