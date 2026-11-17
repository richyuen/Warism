/**
 * Ground being taken (ROADMAP R105, ADR-1096): a cell of a front whose holder is being out-pressed (`cells.flip`
 * rising to its hold, SPEC §5.2) fills with the colour of the nation that takes it, in a hot glow, the more the nearer
 * it is to changing hands. With the front's line (R90a) and the flash of land taken (R90b): the line says where the
 * front stands, the fill where it is being pushed, by whom and how near it is to moving, the flash where it just
 * went. A stretch with no fill is held: nobody out-presses its holder.
 *
 * The snapshot's `taking` is `cell · TAKING_PACK + progress`, progress 1 to 255 of the hold.
 */
import { worldToScreen, type Camera } from '../camera';

/** A cell's progress is packed under its number by this. */
export const TAKING_PACK = 256;
/** The taker's colour over the cell: its opacity as the cell begins to be taken and as it is about to change hands. */
export const TAKING_ALPHA_MIN = 0.2;
export const TAKING_ALPHA_MAX = 0.85;
/** The hot glow about it: its opacity at those two, and its colour. */
export const TAKING_GLOW_MIN = 0.25;
export const TAKING_GLOW_MAX = 0.7;
export const TAKING_GLOW_RGB: readonly [number, number, number] = [255, 170, 40];
/** The patches' radii in cells (the fill's, the glow's; soft toward their rims, so cells side by side run together), and the least on the screen, CSS px. */
export const TAKING_RADIUS_CELLS = 0.75;
export const TAKING_GLOW_CELLS = 1.15;
export const TAKING_MIN_PX = 2;

const share = (progress: number): number => Math.min(1, Math.max(0, progress / 255));
/** The opacity of the taker's colour over a cell at `progress` (1 to 255), and of the glow about it. */
export function takingAlpha(progress: number): number {
  return TAKING_ALPHA_MIN + (TAKING_ALPHA_MAX - TAKING_ALPHA_MIN) * share(progress);
}
export function takingGlow(progress: number): number {
  return TAKING_GLOW_MIN + (TAKING_GLOW_MAX - TAKING_GLOW_MIN) * share(progress);
}

/** `taking` of the snapshot as packed: the cell and its progress. */
export const takingCell = (packed: number): number => Math.floor(packed / TAKING_PACK);
export const takingProgress = (packed: number): number => packed % TAKING_PACK;

/**
 * The nation taking cell `c` of a grid of holders `w` wide: the holder of a cell beside it (of four, in the order
 * west, east, north, south) that `atWar(holder, other)` says is at war with its own; 0 with none (the picture is a
 * snapshot behind, or the taker reaches it over a strait).
 */
export function takerOf(holders: ArrayLike<number>, w: number, c: number, atWar: (a: number, b: number) => boolean): number {
  const holder = holders[c] ?? 0;
  if (holder === 0) return 0;
  const x = c % w;
  for (const k of [x > 0 ? c - 1 : c + w - 1, x < w - 1 ? c + 1 : c - w + 1, c - w, c + w]) {
    const other = holders[k] ?? 0;
    if (other !== 0 && other !== holder && atWar(holder, other)) return other;
  }
  return 0;
}

const sprites = new Map<string, HTMLCanvasElement>();
/** A soft disc of `rgb`: whole to `core` of its radius, nothing at its rim. */
function patch(rgb: readonly [number, number, number], core: number): HTMLCanvasElement {
  const key = `${rgb.join(',')}|${core}`;
  const had = sprites.get(key);
  if (had) return had;
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`);
  grad.addColorStop(core, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.95)`);
  grad.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  sprites.set(key, c);
  return c;
}

/**
 * Draws the cells of `taking` (in the CSS-px transform of `ctx`; a map `w` cells wide), each copy of the world in
 * `offs`: the glow, then over it the colour of the nation that takes the cell (`colourOf(cell)`: 0xRRGGBB, or null
 * where none is known, and the glow alone is drawn). Returns how many cells it drew.
 */
export function drawTaking(ctx: CanvasRenderingContext2D, taking: ArrayLike<number>, w: number, cam: Camera, vw: number, vh: number, offs: readonly number[], colourOf: (cell: number) => number | null): number {
  if (taking.length === 0) return 0;
  const r = Math.max(TAKING_RADIUS_CELLS * cam.scale, TAKING_MIN_PX);
  const gr = Math.max(TAKING_GLOW_CELLS * cam.scale, TAKING_MIN_PX * 1.5);
  const glow = patch(TAKING_GLOW_RGB, 0.3);
  let drawn = 0;
  ctx.save();
  for (const pass of [0, 1] as const) {
    for (let i = 0; i < taking.length; i++) {
      const packed = taking[i]!;
      const cell = takingCell(packed);
      const cx = (cell % w) + 0.5;
      const cy = Math.floor(cell / w) + 0.5;
      const colour = pass === 1 ? colourOf(cell) : null;
      if (pass === 1 && colour === null) continue;
      for (const off of offs) {
        const [x, y] = worldToScreen(cam, cx + off, cy, vw, vh);
        if (x < -gr || y < -gr || x > vw + gr || y > vh + gr) continue;
        if (pass === 0) {
          ctx.globalAlpha = takingGlow(takingProgress(packed));
          ctx.drawImage(glow, x - gr, y - gr, 2 * gr, 2 * gr);
          drawn++;
        } else {
          ctx.globalAlpha = takingAlpha(takingProgress(packed));
          ctx.drawImage(patch([(colour! >> 16) & 255, (colour! >> 8) & 255, colour! & 255], 0.55), x - r, y - r, 2 * r, 2 * r);
        }
      }
    }
  }
  ctx.restore();
  return drawn;
}
