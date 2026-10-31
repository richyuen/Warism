import { describe, expect, it } from 'vitest';
import config, { CLASSIC_PIN } from '../../playwright.config';
import { KEY_UNIT_LOOK } from '../../src/app/settings';
import { DEFAULT_UNIT_LOOK, parseUnitLook, UNIT_LOOKS } from '../../src/shared/unitLooks';

// PLAN 7.174a (ADR-777): the unit-look setting. Countryballs the default since PLAN 7.174h.
describe('the unit-look setting', () => {
  it('is the default when nothing, or nothing it knows, is stored', () => {
    expect(DEFAULT_UNIT_LOOK).toBe('balls');
    for (const v of [null, undefined, '', 'Balls', 'squares']) expect(parseUnitLook(v), String(v)).toBe(DEFAULT_UNIT_LOOK);
  });

  it('keeps each look it offers', () => {
    expect(UNIT_LOOKS).toEqual(['balls', 'classic']);
    for (const v of UNIT_LOOKS) expect(parseUnitLook(v)).toBe(v);
  });

  // PLAN 7.174h: the e2e specs measure classic; every page of theirs starts with it stored.
  it('is pinned to classic for the e2e specs, at their base URL', () => {
    expect(config.use?.storageState).toBe(CLASSIC_PIN);
    expect(CLASSIC_PIN.origins).toEqual([{ origin: config.use?.baseURL, localStorage: [{ name: KEY_UNIT_LOOK, value: 'classic' }] }]);
  });
});
