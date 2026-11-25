import { describe, expect, it } from 'vitest';
import { parseViewAfterLoss } from '../../src/app/viewAfterLoss';

// ADR-1153: what was open at a lost WebGL context, read back for the boot from the save.
describe('parseViewAfterLoss', () => {
  const cam = { cx: 120.5, cy: 40.25, scale: 3 };

  it('reads the view kept: camera, nation, formation, selection, panel and God tab', () => {
    const v = parseViewAfterLoss(JSON.stringify({ cam, nation: 7, formation: 312, player: 7, selection: [312, 313, 313], panel: 'history', god: true }));
    expect(v).toEqual({ cam, nation: 7, formation: 312, player: 7, selection: [312, 313], panel: 'history', god: true });
  });

  it('reads a camera kept before ADR-1153 as the camera alone', () => {
    expect(parseViewAfterLoss(JSON.stringify(cam))).toEqual({ cam, nation: 0, formation: 0, player: 0, selection: [], panel: null, god: false });
  });

  it('drops what is not an id or a panel, and keeps the rest', () => {
    const v = parseViewAfterLoss(JSON.stringify({ cam, nation: -2, formation: 1.5, player: 'x', selection: [0, 'a', 9], panel: 'nowhere', god: 'yes' }));
    expect(v).toEqual({ cam, nation: 0, formation: 0, player: 0, selection: [9], panel: null, god: false });
  });

  it('gives nothing for no value, broken JSON or no camera', () => {
    expect(parseViewAfterLoss(null)).toBeNull();
    expect(parseViewAfterLoss('{not json')).toBeNull();
    expect(parseViewAfterLoss(JSON.stringify({ nation: 7 }))).toBeNull();
    expect(parseViewAfterLoss(JSON.stringify({ cam: { cx: 1, cy: 2 } }))).toBeNull();
  });
});
