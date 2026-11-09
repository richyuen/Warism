import { describe, expect, it } from 'vitest';
import { keepOrderNews, withLastNews, withoutNews } from '../../src/app/hud';

// ROADMAP R56c (critic run 57, R57-N3): Germany's six to Norwich (28113) were all told their landing was over in one
// hour, but the page kept the last four order news: the ticker's row named 3, 4, 5 and 42 while the over row counted
// six, and the panels of 1 and 2 had no word of it. The page keeps four rows, a loss told of several in one hour (the
// ticker's one row, R40c) counted once and kept whole.

type N = { kind: 'refused' | 'transportsSunk' | 'lostAtSea'; tick: number; reason: number; seq: number; id: number };
let seq = 0;
const sunk = (id: number, tick = 114): N => ({ kind: 'transportsSunk', tick, reason: 0, seq: seq++, id });
const refused = (id: number, tick = 100): N => ({ kind: 'refused', tick, reason: 3, seq: seq++, id });

describe("order news kept by the ticker's rows (ROADMAP R56c)", () => {
  it('six told their landing is over in one hour: all six kept', () => {
    const news = [1, 4, 2, 5, 3, 42].map((id) => sunk(id));
    expect(keepOrderNews(news).map((n) => n.id)).toEqual([1, 4, 2, 5, 3, 42]);
  });
  it('the group counts as one row beside three others; a fifth row drops the oldest', () => {
    const news = [refused(7), refused(8), refused(9), ...[1, 2, 3, 4, 5, 42].map((id) => sunk(id))];
    expect(keepOrderNews(news).map((n) => n.id)).toEqual([7, 8, 9, 1, 2, 3, 4, 5, 42]);
    expect(keepOrderNews([refused(6), ...news]).map((n) => n.id)).toEqual([7, 8, 9, 1, 2, 3, 4, 5, 42]);
  });
  it('single news: the newest four', () => {
    const news = [1, 2, 3, 4, 5, 6].map((id) => refused(id));
    expect(keepOrderNews(news).map((n) => n.id)).toEqual([3, 4, 5, 6]);
  });
  it('an older group past the bound goes whole, not in part', () => {
    const news = [sunk(1, 50), sunk(2, 50), refused(3), refused(4), refused(5), refused(6)];
    expect(keepOrderNews(news).map((n) => n.id)).toEqual([3, 4, 5, 6]);
  });
});

// ROADMAP R57c (critic run 58, R58-N2): 27125's six to Valletta, in one hour: 319–322 "its transports broke off; it came
// ashore near Palermo", 323 and 324 "transports sunk" (one row). Five rows: the ticker kept four, and 319's panel, which
// read the ticker's news, said only "Landed". Each formation's newest news is kept for its panel apart from the rows.
describe("a formation's last news kept for its panel (ROADMAP R57c)", () => {
  type T = { kind: 'thrownAshore' | 'transportsSunk'; tick: number; reason: number; seq: number; id: number };
  const thrown = (id: number): T => ({ kind: 'thrownAshore', tick: 140, reason: 0, seq: seq++, id });
  const lost = (id: number): T => ({ kind: 'transportsSunk', tick: 140, reason: 0, seq: seq++, id });
  it("the ticker's four rows drop 319; its panel keeps its news", () => {
    let rows: T[] = [];
    let last = new Map<number, T>();
    for (const n of [thrown(319), thrown(321), thrown(322), thrown(320), lost(323), lost(324)]) {
      rows = keepOrderNews([...rows, n]);
      last = withLastNews(last, n);
    }
    expect(rows.map((n) => n.id)).toEqual([321, 322, 320, 323, 324]);
    expect([...last.keys()].sort()).toEqual([319, 320, 321, 322, 323, 324]);
    expect(last.get(319)!.kind).toBe('thrownAshore');
  });
  it('a later news of one formation replaces its earlier; a dismissed one goes', () => {
    const a = thrown(5);
    const b = lost(5);
    let last = withLastNews(withLastNews(new Map<number, T>(), a), b);
    expect(last.get(5)).toBe(b);
    last = withoutNews(last, b.seq);
    expect(last.has(5)).toBe(false);
    expect(withoutNews(withLastNews(new Map<number, T>(), a), undefined).size).toBe(0);
  });
});
