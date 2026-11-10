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

  // ROADMAP R59a (critic run 60, R60-N1): 31173's 366 (setup 3517, two groups) waited at Tokyo beside an empty group
  // while the other carried the landing out; it was told "about a day" for 4.3 days, the landing gathering for the next
  // voyage only once all aboard were ashore. Every hour's figure comes true within a day.
  it("31173's 366: each hour's figure beside an empty group at the port comes true within a day", { timeout: 300_000 }, () => {
    const told: { tick: number; days: number }[] = [];
    let sailed = -1;
    let idle = 0;
    landingBreaks({
      seed: 31173, setup: 3517, days: 41, orders: 31173, probeDays: [30, 90], groups: 2, notes: [],
      onHour: (w, click) => {
        if (click || sailed >= 0 || !w.formations.has(366)) return;
        const v = voyageOf(w, 366);
        if (v?.state === 'atSea') {
          sailed = w.tick;
          return;
        }
        if (v?.state !== 'nextVoyage' || v.days === undefined) return;
        const l = landingOfDivision(w, 366)!;
        const c = w.formations.cols;
        if (l.fleets.some((o) => w.formations.has(o) && c.moving[o] !== 1 && ![...w.embarked.values()].some((e) => e.fleet === o))) idle++;
        told.push({ tick: w.tick, days: v.days });
      },
    });
    expect(told.length, '366 left for the next voyage').toBeGreaterThan(0);
    expect(idle, 'with an empty group standing by').toBeGreaterThan(24);
    expect(sailed, '366 sails on it').toBeGreaterThan(0);
    const off = told.filter((t) => Math.abs((sailed - t.tick) / 24 - t.days) > 1);
    expect(off.map((t) => `t${t.tick}: ${t.days} days`), `sailed t${sailed}`).toEqual([]);
  });

  // ROADMAP R59b (critic run 60, R60-N2): 31127's 272 (setup 15101, one group) came to Cardiff while the group was away
  // (t423, "about 4 days"); at t510 the group came back and sailed with 270 and 271, come after it, boarding first by
  // id, and 272 sailed 8.5 days after its figure. Those left by a voyage board first: 272 goes on the group's next voyage.
  it("31127's 272: on its group's next voyage, within a day of its figure", { timeout: 300_000 }, () => {
    let told: { tick: number; days: number } | null = null;
    let sailed = -1;
    let leftAtProbe = 0;
    const breaks = landingBreaks({
      // Day 19 (t458): a save while 272 waits, `world.landingLeft` not empty, loads bit-identical (`save`).
      seed: 31127, setup: 15101, days: 30, orders: 31127, probeDays: [19, 30, 90], groups: 1, notes: [],
      onHour: (w, click) => {
        if (!click && w.tick === 458) for (const l of w.landings.values()) leftAtProbe += l.left.size;
        if (click || sailed >= 0 || !w.formations.has(272)) return;
        const v = voyageOf(w, 272);
        if (told === null && v?.state === 'nextVoyage' && v.days !== undefined) told = { tick: w.tick, days: v.days };
        if (told !== null && v?.state === 'atSea') sailed = w.tick;
      },
    });
    expect(breaks.filter((b) => b.includes('leftAgain')), 'no division left again').toEqual([]);
    expect(leftAtProbe, 'the day-19 save holds a division left').toBeGreaterThan(0);
    expect(breaks.filter((b) => b.includes('save')), 'that save loads bit-identical').toEqual([]);
    expect(told, '272 left for the next voyage').not.toBeNull();
    const t = told as unknown as { tick: number; days: number };
    expect(sailed, '272 sails on the next voyage').toBeGreaterThan(0);
    expect(Math.abs((sailed - t.tick) / 24 - t.days), `told ${t.days} days at t${t.tick}, sailed t${sailed}`).toBeLessThanOrEqual(1);
  });
});
