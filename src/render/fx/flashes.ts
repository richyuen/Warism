/**
 * The flash of land that changed hands (ROADMAP R90b, ADR-1079): each cell a snapshot brings under
 * a new holder lights up once, a soft white patch that fades over FLASH_MS of the player's time.
 * With the fronts' line (R90a) a war is seen to move: the line says where it stands, the flash
 * where it just went.
 *
 * Not at a start or a load (the view does not tell it of those), and not of sea or of land no one
 * held before. The newest FLASH_MAX_CELLS at most: a conquest of a continent in an hour (God Mode's
 * paint, a peace's handover) does not draw every cell.
 */
import { worldToScreen, type Camera, type MapGeometry } from '../camera';

/** How long a flash lasts, ms of the player's time, and its opacity as it begins. */
export const FLASH_MS = 900;
export const FLASH_ALPHA = 0.32;
/** The most cells flashing at once: the newest are kept. */
export const FLASH_MAX_CELLS = 3000;
/** A flash's patch: its radius in cells (soft toward the rim: patches of cells side by side run together without a white blot; at 0.6 and 1.15 cells a province taken was one), and the least on the screen, CSS px. */
export const FLASH_RADIUS_CELLS = 0.85;
export const FLASH_MIN_PX = 1.5;

/** The opacity of a flash `age` ms after it began: FLASH_ALPHA falling to nothing, fast first. Nothing before it began and from FLASH_MS on. */
export function flashAlpha(age: number): number {
  if (age < 0 || age >= FLASH_MS) return 0;
  const left = 1 - age / FLASH_MS;
  return FLASH_ALPHA * left * left;
}

/**
 * The cells of `next` held by another than in `before` (the same rows of two grids, `w` wide from
 * `x0`, `y`): `x, y` by twos onto `out`. A cell no one held before or no one holds now (0: the sea,
 * empty land) is not one.
 */
export function changedCells(before: ArrayLike<number>, next: ArrayLike<number>, n: number, x0: number, y: number, out: number[]): void {
  for (let i = 0; i < n; i++) if (before[i] !== next[i] && before[i] !== 0 && next[i] !== 0) out.push(x0 + i, y);
}

interface Batch {
  start: number;
  /** `x, y` by twos, cells. */
  cells: number[];
}

/** The flashes going on: the cells of each snapshot that changed hands, and when. */
export class ControlFlashes {
  private batches: Batch[] = [];
  private sprite: HTMLCanvasElement | null = null;

  /** The cells that changed hands at `now` (`x, y` by twos). */
  add(cells: number[], now: number): void {
    if (cells.length === 0) return;
    this.batches.push({ start: now, cells: cells.length / 2 > FLASH_MAX_CELLS ? cells.slice(cells.length - 2 * FLASH_MAX_CELLS) : cells });
    // The newest FLASH_MAX_CELLS: the oldest batches go first.
    let total = 0;
    for (const b of this.batches) total += b.cells.length / 2;
    while (total > FLASH_MAX_CELLS && this.batches.length > 1) total -= this.batches.shift()!.cells.length / 2;
  }

  /** None left (a start, a load). */
  clear(): void {
    this.batches = [];
  }

  /** The cells flashing at `now`. */
  count(now: number): number {
    let n = 0;
    for (const b of this.batches) if (flashAlpha(now - b.start) > 0) n += b.cells.length / 2;
    return n;
  }

  /** True while a flash fades (the view keeps redrawing). */
  animating(now: number): boolean {
    return this.batches.some((b) => now - b.start < FLASH_MS);
  }

  /** A soft white disc: whole to a third of its radius, nothing at its rim. */
  private patch(): HTMLCanvasElement {
    if (this.sprite) return this.sprite;
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 32);
    this.sprite = c;
    return c;
  }

  /** Draws the flashes (in the CSS-px transform of `ctx`), each copy of the world in `offs`; those over are dropped. */
  draw(ctx: CanvasRenderingContext2D, cam: Camera, _geo: MapGeometry, vw: number, vh: number, now: number, offs: readonly number[]): void {
    this.batches = this.batches.filter((b) => now - b.start < FLASH_MS);
    if (this.batches.length === 0) return;
    const r = Math.max(FLASH_RADIUS_CELLS * cam.scale, FLASH_MIN_PX);
    const patch = this.patch();
    ctx.save();
    for (const b of this.batches) {
      const alpha = flashAlpha(now - b.start);
      if (alpha <= 0.01) continue;
      ctx.globalAlpha = alpha;
      for (const off of offs) {
        for (let i = 0; i < b.cells.length; i += 2) {
          const [x, y] = worldToScreen(cam, b.cells[i]! + 0.5 + off, b.cells[i + 1]! + 0.5, vw, vh);
          if (x < -r || y < -r || x > vw + r || y > vh + r) continue;
          ctx.drawImage(patch, x - r, y - r, 2 * r, 2 * r);
        }
      }
    }
    ctx.restore();
  }
}
