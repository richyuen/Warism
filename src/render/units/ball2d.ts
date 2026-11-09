/**
 * A countryball on a Canvas2D overlay (PLAN 7.174f, ADR-777): the T0 counters, the T1 markers and
 * the planes in flight in the ball look (`sorties.ts`: a small ball on its plane's silhouette, PLAN
 * 7.180), drawn as the shader draws an element's ball (`ballShader.ts`): its flag in a disc, darker
 * to the rim, a dark outline, two white eyes on the side it faces, and a prop for what it stands for
 * (a helmet, treads, wheels, a hull).
 */
import { BALL_R, EYE_GAP, EYE_RX, EYE_RY, EYES_ACROSS, EYES_UP, HELMET_FLAG_TOP, HELMET_RGB, HULL_RGB, OUTLINE_RGB, SHIP_FLAG_BOTTOM, STEEL_RGB, TREAD_RGB } from './ballShader';

/** What a 2D ball wears. */
export type Prop2d = 'none' | 'helmet' | 'treads' | 'wheels' | 'hull';

const css = (c: readonly number[]): string => `rgb(${c.map((v) => Math.round(v * 255)).join(', ')})`;
const OUTLINE = css(OUTLINE_RGB);
const HELMET = css(HELMET_RGB);
const TREAD = css(TREAD_RGB);
const STEEL = css(STEEL_RGB);
const HULL = css(HULL_RGB);

/** A ball's look on the overlay. */
export interface Ball2d {
  /** The flag, or null for a ball of its tint alone. */
  flag: CanvasImageSource | null;
  /** Its tint, a CSS colour, under the flag (seen where there is none). */
  tint: string;
  /** +1: its eyes to the right; -1: to the left. */
  look: 1 | -1;
  prop: Prop2d;
  /** A red ring about it: its formation in contact. */
  engaged?: boolean;
}

/**
 * Draws a ball of radius `r` CSS px about (x, y): the ball's own radius, BALL_R of half the side of
 * the shader's sprite. Below 3 px a flag dot with its outline; eyes from 4 px.
 */
export function drawBall2d(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, b: Ball2d): void {
  const u = r / BALL_R; // px a ball unit
  const lw = Math.max(1, 0.1 * r);
  ctx.save();
  ctx.lineJoin = 'round';
  // No shadow of the caller's (a plane's): one part's shadow fell on the next.
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  // Behind the ball.
  if (b.prop === 'treads') {
    ctx.fillStyle = TREAD;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = lw;
    roundRect(ctx, x - 1.12 * u, y + 0.5 * u, 2.24 * u, 0.62 * u, 0.22 * u);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = STEEL;
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath();
      ctx.arc(x + k * 0.42 * u, y + 0.91 * u, 0.13 * u, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (b.prop === 'wheels') {
    ctx.fillStyle = TREAD;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = lw;
    for (const k of [-0.55, 0.55]) {
      ctx.beginPath();
      ctx.arc(x + k * u, y + 0.82 * u, 0.3 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  // The ball: the tint, the flag in a disc, shaded round.
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = b.tint;
  ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  if (b.flag) {
    ctx.imageSmoothingEnabled = true;
    // Under a helmet, the whole flag below its brim (R22-B1), as the shader draws it.
    if (b.prop === 'helmet') ctx.drawImage(b.flag, x - r, y + HELMET_FLAG_TOP * u, 2 * r, (BALL_R - HELMET_FLAG_TOP) * u);
    // In a hull, the whole flag above its deck (R56e).
    else if (b.prop === 'hull') ctx.drawImage(b.flag, x - r, y - r, 2 * r, (BALL_R + SHIP_FLAG_BOTTOM) * u);
    else ctx.drawImage(b.flag, x - r, y - r, 2 * r, 2 * r);
  }
  const shade = ctx.createRadialGradient(x - 0.4 * r, y - 0.45 * r, 0, x, y, r);
  shade.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
  shade.addColorStop(0.45, 'rgba(255, 255, 255, 0)');
  shade.addColorStop(0.75, 'rgba(0, 0, 0, 0.06)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
  ctx.fillStyle = shade;
  ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  ctx.restore();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = r < 3 ? 0.75 : lw;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  // Its eyes.
  if (r >= 4) {
    const cx = x + EYES_ACROSS * b.look * u;
    const cy = y + EYES_UP * u;
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = Math.max(0.75, 0.07 * r);
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(cx + s * EYE_GAP * u, cy, EYE_RX * u, EYE_RY * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  // In front of the ball.
  if (b.prop === 'helmet') {
    ctx.fillStyle = HELMET;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.ellipse(x, y - 0.5 * u, 0.74 * u, 0.52 * u, 0, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    roundRect(ctx, x - 0.95 * u, y - 0.46 * u, 1.9 * u, 0.12 * u, 0.05 * u);
    ctx.fill();
    ctx.stroke();
  } else if (b.prop === 'hull') {
    ctx.fillStyle = HULL;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = lw;
    const s = b.look;
    ctx.beginPath();
    ctx.moveTo(x - 1.4 * u * s, y + 0.3 * u);
    ctx.lineTo(x + 1.7 * u * s, y + 0.3 * u);
    ctx.lineTo(x + 1.15 * u * s, y + 0.92 * u);
    ctx.lineTo(x - 1.2 * u * s, y + 0.92 * u);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  if (b.engaged) {
    ctx.strokeStyle = '#ff4d3d';
    ctx.lineWidth = Math.max(1.5, 0.14 * r);
    ctx.beginPath();
    ctx.arc(x, y, r + ctx.lineWidth, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/** A ball drawn once, to be copied (`drawBall2dCached`). */
interface CachedBall {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  /** Its half side, device px; the ball's centre this far in, and the phase on. */
  half: number;
}

/** Balls a cache keeps before it starts again (a plane's ball takes a new size as the view zooms). */
const CACHE_MOST = 4096;

/** A ball's place off the device pixel, as cached: to a quarter of a pixel each way. */
const PHASES = 4;

/**
 * Balls drawn once, by their look, size, device scale and place off the device pixel (PLAN
 * 7.181): the counters and the planes in flight drew a clipped flag, a gradient and outlines for
 * each ball on every frame, and the GPU's raster of the overlay was long now and then, the world
 * view at 135 fps against classic's 346. A flag's balls by the flag's image, so a new image draws
 * anew.
 */
export class Ball2dCache {
  private byFlag = new WeakMap<object, Map<string, CachedBall | null>>();
  private noFlag = new Map<string, CachedBall | null>();
  private count = 0;

  /** The ball of radius `r` CSS px at `scale` device px a CSS px, its centre (px, py) device px off its pixel's corner. */
  get(r: number, b: Ball2d, scale: number, px = 0, py = 0): CachedBall | null {
    const key = `${r}|${scale}|${px}|${py}|${b.tint}|${b.look}|${b.prop}|${b.engaged ? 1 : 0}`;
    let map = this.noFlag;
    if (b.flag) {
      let m = this.byFlag.get(b.flag);
      if (!m) this.byFlag.set(b.flag, (m = new Map()));
      map = m;
    }
    if (map.has(key)) return map.get(key)!;
    if (++this.count > CACHE_MOST) {
      this.byFlag = new WeakMap();
      this.noFlag = new Map();
      this.count = 1;
      map = this.noFlag;
      if (b.flag) this.byFlag.set(b.flag, (map = new Map()));
    }
    // Wide enough for a hull (1.7 ball units out), treads, and the engaged ring.
    const half = Math.ceil((2 * (r / BALL_R) + 3) * scale);
    const made = canvasOf(2 * half);
    let ball: CachedBall | null = null;
    if (made) {
      made.ctx.setTransform(scale, 0, 0, scale, half + px, half + py);
      drawBall2d(made.ctx as CanvasRenderingContext2D, 0, 0, r, b);
      ball = { canvas: made.canvas, half };
    }
    map.set(key, ball);
    return ball;
  }
}

/**
 * Draws a ball as `drawBall2d` does, from `cache`: its pixels drawn once and copied onto the
 * device's pixels, at its place to a quarter of a pixel. At an opacity under 1 the ball fades as one
 * picture, not part over part. Under a turn or a skew, or where no canvas can be made (node), drawn
 * as `drawBall2d`.
 */
export function drawBall2dCached(ctx: CanvasRenderingContext2D, cache: Ball2dCache, x: number, y: number, r: number, b: Ball2d): void {
  const m = ctx.getTransform();
  if (m.b !== 0 || m.c !== 0 || m.a <= 0 || m.a !== m.d) {
    drawBall2d(ctx, x, y, r, b);
    return;
  }
  // The centre in device px, its pixel and its place in it.
  const dx = m.a * x + m.e;
  const dy = m.d * y + m.f;
  let ix = Math.floor(dx);
  let iy = Math.floor(dy);
  let px = Math.round((dx - ix) * PHASES) / PHASES;
  let py = Math.round((dy - iy) * PHASES) / PHASES;
  if (px === 1) {
    ix++;
    px = 0;
  }
  if (py === 1) {
    iy++;
    py = 0;
  }
  const ball = cache.get(r, b, m.a, px, py);
  if (!ball) {
    drawBall2d(ctx, x, y, r, b);
    return;
  }
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(ball.canvas, ix - ball.half, iy - ball.half);
  ctx.restore();
}

function canvasOf(side: number): { canvas: HTMLCanvasElement | OffscreenCanvas; ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D } | null {
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = side;
    canvas.height = side;
    const ctx = canvas.getContext('2d');
    return ctx ? { canvas, ctx } : null;
  }
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(side, side);
    const ctx = canvas.getContext('2d');
    return ctx ? { canvas, ctx } : null;
  }
  return null;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
