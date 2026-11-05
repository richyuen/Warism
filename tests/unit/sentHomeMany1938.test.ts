import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import type { FromWorker, OrderNews } from '../../src/shared/protocol';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import type { World } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';
import { addDivision } from '../helpers/sim1938';

// ROADMAP R21d (critic run 33, R33-N4): ten of the player's divisions sent home across the sea in
// one day start are one event that counts them (`FormationsSentHome`), kept in History, and one row
// below the ticker that names the first and counts the rest; before, ten rows, of which the page
// keeps four, and History none. Britain played, ten divisions put on France's ground at Calais.

const { w: W, h: H } = SIZE_1938;
const ENG = NATIONS_1938.findIndex((n) => n.tag === 'ENG') + 1;
const CALAIS = cellOf(1.86, 50.95, W, H).map((v) => Math.floor(v) + 0.5) as [number, number];

describe('many sent home are told once (ROADMAP R21d)', () => {
  it('ten at once: ten FormationSentHome, one FormationsSentHome of ten in History, one row of ten', () => {
    const news: OrderNews[] = [];
    const s = new SimServer((m: FromWorker) => {
      if (m.type === 'orderNews') news.push(m.news);
    });
    s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed: 1, assets: assets1938(W) } }, 0);
    s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation: ENG } }, 1);
    const w = s.sim!.world;
    const ten = Array.from({ length: 10 }, (_, k) => addDivision(w, ENG, CALAIS[0] + (k % 3) * 0.1, CALAIS[1]));
    const kinds: number[][] = [];
    const drain = (x: World): void => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.FormationSentHome || ev[i + 1] === EventKind.FormationsSentHome) kinds.push([ev[i + 1]!, ev[i + 2]!, ev[i + 3]!]);
      (s as unknown as { drainEvents(w: World): void }).drainEvents(x);
    };
    s.sim!.step(25, drain);
    const each = kinds.filter((k) => k[0] === EventKind.FormationSentHome && ten.includes(k[1]!));
    expect(each.length, 'each of the ten sent home').toBe(10);
    const all = kinds.filter((k) => k[0] === EventKind.FormationsSentHome);
    expect(all, 'one event for them all').toEqual([[EventKind.FormationsSentHome, ENG, 10]]);
    const hist = w.history.rows.filter((r, i) => i % 6 === 1 && r === EventKind.FormationsSentHome);
    expect(hist.length, 'one History record').toBe(1);
    const rows = news.filter((n) => n.kind === 'sentHome');
    expect(rows.length, 'one row').toBe(1);
    expect(rows[0]!.reason, 'counting ten').toBe(10);
    expect(ten).toContain(rows[0]!.id);
  });
});
