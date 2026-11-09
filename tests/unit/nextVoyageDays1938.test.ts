import { describe, expect, it } from 'vitest';
import type { OrderNews } from '../../src/shared/protocol';
import { landingOfDivision, nextVoyageHours, voyageOf } from '../../src/sim/systems/landings';
import { orderNewsBrief, orderNewsText } from '../../src/ui/orderNewsText';
import { voyageText } from '../../src/ui/voyageText';
import { landingBreaks } from '../helpers/landingInvariants';

// ROADMAP R58b (critic run 59, R59-N1): a division left at its port for want of room was told "waits for the next
// voyage" with no figure; 29043's 273 (setup 15101, two groups) was left at t1170 and sailed at t1284. It is told when,
// "in about N days", from its landing's groups' way out and back (`nextVoyageHours`), and the figure comes true.

const news = (days?: number, reason = 0): OrderNews => ({ kind: 'nextVoyage', id: 273, nation: 1, reason, x: 0, y: 0, tick: 10, ...(days === undefined ? {} : { days }) });

describe('the next voyage is told with when (ROADMAP R58b)', () => {
  it('says the days, a day, or none when none is reckoned', () => {
    expect(orderNewsText(news(5), 'Infantry 273')).toContain('in about 5 days');
    expect(orderNewsText(news(1), 'Infantry 273')).toContain('in about a day');
    expect(orderNewsText(news(4, 1), 'Infantry 273')).toContain('next voyage, in about 4 days');
    expect(orderNewsText(news(), 'Infantry 273')).not.toContain('about');
    expect(orderNewsBrief(news(5), 1, 'Infantry 273')).toBe('273: next voyage in about 5 days');
    expect(orderNewsBrief(news(), 1, 'Infantry 273')).toBe('273: waits for the next voyage');
    expect(voyageText({ state: 'nextVoyage', port: 'Dover', days: 3 })).toContain('At Dover: no room on the transports that sailed; they come back for it in about 3 days');
  });

  it("29043's 273: the days told as its landing sails without it come true within a day", { timeout: 300_000 }, () => {
    let told: { tick: number; days: number } | null = null;
    let sailed = -1;
    landingBreaks({
      seed: 29043, setup: 15101, days: 60, orders: 29043, probeDays: [30], groups: 2, notes: [],
      onHour: (w, click) => {
        if (click || !w.formations.has(273)) return;
        const v = voyageOf(w, 273);
        if (told === null && v?.state === 'nextVoyage') {
          const l = landingOfDivision(w, 273)!;
          expect(v.days, 'the panel and the reckoning agree').toBe(Math.max(1, Math.ceil(nextVoyageHours(w, l) / 24)));
          told = { tick: w.tick, days: v.days! };
        }
        if (told !== null && sailed < 0 && v?.state === 'atSea') sailed = w.tick;
      },
    });
    expect(told, '273 left for the next voyage').not.toBeNull();
    expect(sailed, '273 sails on it').toBeGreaterThan(0);
    const t = told as unknown as { tick: number; days: number };
    expect(Math.abs((sailed - t.tick) / 24 - t.days), `told ${t.days} days at t${t.tick}, sailed t${sailed}`).toBeLessThanOrEqual(1);
  });
});
