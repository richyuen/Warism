import { describe, expect, it } from 'vitest';
import type { FormationDetail, OrderNews } from '../../src/shared/protocol';
import { orderNewsText, staleNotice } from '../../src/ui/orderNewsText';

// ROADMAP R37b (critic run 44, R44-N1): the panel's notice "it leaves the landing it had for its new one ... it will
// not land with them" stood 20+ days after a recall that rejoined that landing. It now goes at the next order sent
// (its state changes with the order that told it, so not by state); the next voyage's goes as a refusal's: at the
// next order, or when the formation's state changes (it sails).

const news = (kind: OrderNews['kind'], seq: number): OrderNews & { seq: number } => ({ kind, id: 7, nation: 1, reason: 0, x: 0, y: 0, tick: 10, seq });
const info = (state: string, tick = 11): FormationDetail => ({ id: 7, tick, engaged: false, moving: true, goal: 5, retreat: 0, voyage: { state, port: 'Tokyo' } }) as unknown as FormationDetail;

describe("a landing's notices go when they no longer hold (ROADMAP R37b)", () => {
  it('leftLanding: kept while its state changes, with no later order', () => {
    const seen = new Map<number, string>();
    const n = news('leftLanding', 3);
    expect(staleNotice(seen, n, info('toPort'))).toBe(false);
    expect(staleNotice(seen, n, info('gathering', 60))).toBe(false);
  });
  it('nextVoyage: kept while the state holds; gone when it changes', () => {
    const seen = new Map<number, string>();
    const n = news('nextVoyage', 3);
    expect(staleNotice(seen, n, info('nextVoyage'))).toBe(false);
    expect(staleNotice(seen, n, info('nextVoyage', 40))).toBe(false);
    expect(staleNotice(seen, n, info('atSea', 60))).toBe(true);
  });
  for (const kind of ['leftLanding', 'nextVoyage'] as const) {
    it(`${kind}: gone once a later order is sent`, () => {
      expect(staleNotice(new Map(), news(kind, 3), info('toPort'), 4)).toBe(true);
    });
  }
  it('what happened (thrown back) stays', () => {
    const seen = new Map<number, string>();
    const n = news('repulsed', 3);
    staleNotice(seen, n, info('toPort'));
    expect(staleNotice(seen, n, info('atSea', 60))).toBe(false);
  });
});

// ROADMAP R40c (critic run 48, R48-N2): two divisions lost at sea in one hour read as one cut row; one row names both.
describe('a loss of several in one hour is one row naming them (ROADMAP R40c)', () => {
  it('lost at sea, and transports sunk, of two', () => {
    const n = { kind: 'lostAtSea' as const, id: 364, nation: 1, reason: 0, x: 0, y: 0, tick: 855 };
    expect(orderNewsText(n, 'A, B', 2)).toBe('2 divisions lost at sea with their transports: A, B.');
    expect(orderNewsText({ ...n, kind: 'transportsSunk', reason: 1 }, 'A, B', 2)).toContain('2 divisions: the transports of their landing were sunk; others are on their way');
    expect(orderNewsText(n, 'A')).toBe('A: its transports were sunk at sea; it was lost with them.');
  });
});
