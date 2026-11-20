import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loopBoundHits } from './loopBoundsScan';

// ROADMAP R215 (critic run 89, R89-N3 and its objection: "ADR-1143's rule is written for the code and checked by
// nothing"). ADR-1143, SPEC §2.6: a loop's own bounds and counters are written in the loop's function, never by a
// closure the loop calls. With `enemyDistance`'s search loop calling a closure that wrote its `tail` and `left`,
// Chromium 153 made another world of the page's than the headless one (R209). The sim's and the worker's sources are
// read for that shape; the function as it was before R209 is the case the reading must find.

const ROOT = path.resolve(import.meta.dirname, '../..');

function sources(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) out.push(...sources(p));
    else if (/\.tsx?$/.test(name) && !name.endsWith('.d.ts')) out.push(p);
  }
  return out;
}

describe('a loop writes its own bounds: no closure it calls does (ADR-1143)', () => {
  it('finds enemyDistance as it was before R209: the search loop, and reach writing left and tail', () => {
    const before = readFileSync(path.join(ROOT, 'tests/fixtures/enemyDistanceBeforeR209.ts.txt'), 'utf8');
    const hits = loopBoundHits('enemyDistanceBeforeR209.ts', before);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({ names: ['left', 'tail'], closure: 'reach' });
    expect(before.split('\n')[hits[0]!.line - 1]).toContain('for (let head = 0; head < tail && left > 0; head++)');
  });

  it('finds a closure written in the loop, and one that writes through a destructuring', () => {
    const inline = 'export function f(xs: number[]): number {\n  let n = 0;\n  while (n < 10) {\n    xs.forEach((x) => {\n      n += x;\n    });\n  }\n  return n;\n}\n';
    expect(loopBoundHits('inline.ts', inline)).toMatchObject([{ line: 3, names: ['n'], closure: '(inline)' }]);
    const spread = 'export function g(): number {\n  let a = 0;\n  let b = 0;\n  const step = (): void => {\n    [a, b] = [b + 1, a];\n  };\n  do step();\n  while (a < 5);\n  return b;\n}\n';
    expect(loopBoundHits('spread.ts', spread)).toMatchObject([{ names: ['a'], closure: 'step' }]);
  });

  it('leaves alone a loop that writes its own bounds, a closure\'s own variables, and a closure the loop does not call', () => {
    const own = 'export function f(xs: number[]): number {\n  let tail = 0;\n  for (let head = 0; head < tail || head < xs.length; head++) {\n    tail++;\n  }\n  return tail;\n}\n';
    expect(loopBoundHits('own.ts', own)).toEqual([]);
    const local = 'export function g(xs: number[]): number {\n  let n = 0;\n  const count = (): number => {\n    let n = 0;\n    for (const x of xs) n += x;\n    return n;\n  };\n  while (n < 3) n += count();\n  return n;\n}\n';
    expect(loopBoundHits('local.ts', local)).toEqual([]);
    const apart = 'export function h(xs: number[]): number {\n  let n = 0;\n  const bump = (): void => {\n    n++;\n  };\n  bump();\n  let i = 0;\n  while (i < n) i++;\n  return i + xs.length;\n}\n';
    expect(loopBoundHits('apart.ts', apart)).toEqual([]);
  });

  it('the sim and the worker have no such loop', () => {
    const files = [...sources(path.join(ROOT, 'src/sim')), ...sources(path.join(ROOT, 'src/worker')), ...sources(path.join(ROOT, 'src/shared'))];
    expect(files.length).toBeGreaterThan(100);
    const hits = files.flatMap((f) => loopBoundHits(path.relative(ROOT, f).replace(/\\/g, '/'), readFileSync(f, 'utf8')));
    expect(hits.map((h) => `${h.file}:${h.line} ${h.closure} writes ${h.names.join(', ')}`)).toEqual([]);
  });
});
