import { describe, expect, it } from 'vitest';
import { rowStand, STAND_SLACK, type RowStand } from '../../src/ui/bannerOrder';

// ROADMAP R204 (critic run 87, R87-N2; ADR-1142): R202 chose the desk row's side, the bar's centre or the free band's
// middle, at every draw from the banners' widths, and the row jumped 24 to 44 px when a war on it changed. The side is
// chosen when the band or the number of banners changes and held until one of them changes again.

/** A row drawn again and again in one band: the banners' widths as they come, the centre `even` px wide. */
function run(widths: readonly number[], even: number, band = { width: 620, mid: 684 }, banners = 3): { sides: string[]; drops: number } {
  let held: RowStand | null = null;
  const sides: string[] = [];
  let drops = 0;
  for (const w of widths) {
    const r = rowStand(held, band, banners, w <= even);
    held = r.stand;
    sides.push(r.stand.side);
    if (r.drop) drops++;
  }
  return { sides, drops };
}

describe('rowStand: the desk row keeps its side while its band and its banners hold (ROADMAP R204)', () => {
  it('chooses the centre when the banners fit there, the band when they do not', () => {
    expect(rowStand(null, { width: 620, mid: 684 }, 3, true)).toEqual({ stand: { side: 'centre', width: 620, mid: 684, banners: 3, outgrown: 0 }, drop: false });
    expect(rowStand(null, { width: 620, mid: 684 }, 3, false)).toEqual({ stand: { side: 'band', width: 620, mid: 684, banners: 3, outgrown: 0 }, drop: false });
  });

  it('in the band, a row that would fit the centre stays: no width of the banners moves it', () => {
    for (const even of [400, 480, 532, 560, 600]) {
      const widths = [even + 40, even - 60, even, even + 1, even - 200, even + 80, even - 1];
      const r = run(widths, even);
      expect(new Set(r.sides), `even ${even}`).toEqual(new Set(['band']));
      expect(r.drops).toBe(0);
    }
  });

  it('on the centre, a row that outgrows it gives a banner and stays on the centre', () => {
    for (const even of [400, 480, 532, 560, 600]) {
      const r = run([even - 60, even, even + 1, even + 80, even - 1], even);
      expect(new Set(r.sides), `even ${even}`).toEqual(new Set(['centre']));
      expect(r.drops, `even ${even}: the two draws past the centre`).toBe(2);
    }
  });

  it('one banner on the centre that outgrows it goes to the band: a war is shown at every desk (R197)', () => {
    const r = run([200, 260, 200], 240, { width: 300, mid: 420 }, 1);
    expect(r.sides).toEqual(['centre', 'band', 'band']);
    expect(r.drops).toBe(0);
  });

  it('three banners that outgrew the centre come back in the band, once: no banner gone and back at each long name', () => {
    const band = { width: 620, mid: 684 };
    let held = rowStand(null, band, 3, true).stand;
    const out = rowStand(held, band, 3, false);
    expect([out.stand.side, out.drop]).toEqual(['centre', true]);
    // Two banners on the centre; three again (a new war counted the row again), fitting the centre now: in the band.
    held = rowStand(out.stand, band, 2, true).stand;
    expect(held.side).toBe('centre');
    held = rowStand(held, band, 3, true).stand;
    expect(held.side).toBe('band');
    for (const fits of [false, true, false, true]) {
      const r = rowStand(held, band, 3, fits);
      expect([r.stand.side, r.drop]).toEqual(['band', false]);
      held = r.stand;
    }
    // Two banners again stand on the centre (two never outgrew it); another band forgets it.
    expect(rowStand(held, band, 2, true).stand.side).toBe('centre');
    expect(rowStand(held, { width: 700, mid: 684 }, 3, true).stand).toMatchObject({ side: 'centre', outgrown: 0 });
  });

  it('chooses again when the number of banners or the band changes; the band\'s edges have STAND_SLACK px of slack', () => {
    const band = { width: 620, mid: 684 };
    const inBand = rowStand(null, band, 3, false).stand;
    expect(rowStand(inBand, band, 2, true).stand.side, 'a banner fewer').toBe('centre');
    expect(rowStand(inBand, { width: 700, mid: 684 }, 3, true).stand.side, 'a wider band').toBe('centre');
    expect(rowStand(inBand, { width: 620, mid: 640 }, 3, true).stand.side, 'the band moved').toBe('centre');
    for (const d of [-STAND_SLACK, -1, 1, STAND_SLACK]) {
      const r = rowStand(inBand, { width: band.width + d, mid: band.mid - d }, 3, true);
      expect(r.stand, `${d} px`).toBe(inBand);
    }
    expect(rowStand(inBand, { width: band.width + STAND_SLACK + 1, mid: band.mid }, 3, true).stand.side).toBe('centre');
  });
});
