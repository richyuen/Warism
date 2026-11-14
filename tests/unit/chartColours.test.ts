import { describe, expect, it } from 'vitest';
import { CHART_MIN_DE, chartColours, deltaE, parseHex } from '../../src/shared/color';
import nations from '../../data/scenarios/1938/nations.json';

// ROADMAP R82h (critic run 68, stats "not 9"): France's and the United States' chart lines in near-identical blues
// (#3f5fbf and #2a4d8f, ΔE 19). A chart's lines are told apart: each at least CHART_MIN_DE from every line above it,
// or, where no mix of its colour gets there (six blues of one hue), dashed.
const colorOf = (tag: string): number => parseHex((nations as { nations: { tag: string; color: string }[] }).nations.find((n) => n.tag === tag)!.color);

describe('chart line colours (ROADMAP R82h)', () => {
  it('France and the United States told apart; the first line its own colour', () => {
    const [fra, usa] = [colorOf('FRA'), colorOf('USA')];
    expect(deltaE(fra, usa)).toBeLessThan(CHART_MIN_DE);
    for (const order of [[fra, usa], [usa, fra]]) {
      const out = chartColours(order);
      expect(out[0]).toEqual({ color: order[0], dashed: false });
      expect(out[1]!.dashed).toBe(false);
      expect(deltaE(out[0]!.color, out[1]!.color)).toBeGreaterThanOrEqual(CHART_MIN_DE);
    }
  });

  it('colours already apart are kept', () => {
    const c = [0xff0000, 0x00a000, 0x0000ff];
    expect(chartColours(c)).toEqual(c.map((color) => ({ color, dashed: false })));
  });

  it("every six of 1938's nations in a row (a chart's top five and the selected): each line apart from those above, or dashed", () => {
    const all = (nations as { nations: { color: string }[] }).nations.map((n) => parseHex(n.color));
    let dashed = 0;
    for (let i = 0; i + 6 <= all.length; i++) {
      const out = chartColours(all.slice(i, i + 6));
      for (let a = 1; a < out.length; a++) {
        const near = Math.min(...out.slice(0, a).map((o) => deltaE(out[a]!.color, o.color)));
        if (out[a]!.dashed) dashed++;
        else expect(near, `window ${i}, line ${a}`).toBeGreaterThanOrEqual(CHART_MIN_DE);
      }
    }
    // Few: a dash only where six of one hue meet (the list's runs of neighbours' blues).
    expect(dashed).toBeLessThan(0.05 * 5 * (all.length - 5));
  });
});
