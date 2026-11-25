import type { Camera } from '../render/camera';

/** sessionStorage: what the player had on screen at a lost WebGL context, for the boot from the save that follows (ADR-1151, ADR-1153). */
export const VIEW_AFTER_LOSS = 'warism.viewAfterLoss';

/** The top-centre panels, at most one open at a time (`Hud.closeCentre`). */
export const CENTRE_PANELS = ['charts', 'history', 'relations', 'settings', 'editor'] as const;
export type CentrePanel = (typeof CENTRE_PANELS)[number];

/**
 * The view at a lost context (ADR-1153): the camera, the selected nation (its panel), the formation whose panel is open,
 * the played nation's selected formations, the top-centre panel open and the God tab. Ids are the save's own: the boot
 * loads the save the loss wrote, so a nation or formation that is gone by then simply is not found.
 */
export interface ViewAfterLoss {
  cam: Camera;
  nation: number;
  formation: number;
  /** The nation played when the selection was kept; the selection is given back only to that nation. */
  player: number;
  selection: number[];
  panel: CentrePanel | null;
  god: boolean;
}

const id = (v: unknown): number => (typeof v === 'number' && Number.isInteger(v) && v > 0 ? v : 0);

function isCamera(v: unknown): v is Camera {
  if (!v || typeof v !== 'object') return false;
  const c = v as Record<string, unknown>;
  return ['cx', 'cy', 'scale'].every((k) => typeof c[k] === 'number' && Number.isFinite(c[k]));
}

/** Reads what `onContextLost` kept, or null for nothing usable. A value from before ADR-1153 (a bare camera) is read as the camera alone. */
export function parseViewAfterLoss(raw: string | null): ViewAfterLoss | null {
  if (!raw) return null;
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    return null;
  }
  if (isCamera(v)) return { cam: v, nation: 0, formation: 0, player: 0, selection: [], panel: null, god: false };
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (!isCamera(o.cam)) return null;
  const panel = (CENTRE_PANELS as readonly unknown[]).includes(o.panel) ? (o.panel as CentrePanel) : null;
  const selection = Array.isArray(o.selection) ? [...new Set(o.selection.map(id).filter((x) => x !== 0))] : [];
  return { cam: o.cam, nation: id(o.nation), formation: id(o.formation), player: id(o.player), selection, panel, god: o.god === true };
}
