/**
 * A held landing joined to the fleet that holds it (ROADMAP R53e; critic run 54's objection to ADR-873: "the fight is
 * real but 14–19 cells off, beyond what a player connects to the transports"). Each row of the snapshot's `holds`
 * (HOLD_STRIDE: the held group's place, the foe fleet's, the foe): a red ring on the transports, a dashed line in
 * the foe's colour from its fleet to them over a dark edge, and a chevron at the transports' end pointing at them.
 * Drawn at every tier, over the markers (the transports' marker would hide the ring); a pure function of the rows and
 * the camera.
 */
import { HOLD_STRIDE } from '../../shared/protocol';
import { itemOffsets, worldToScreen, type Camera, type MapGeometry } from '../camera';

/** The ring on the held transports, CSS px at scale 1, and its colour. */
export const HOLD_RING_PX = 14;
export const HOLD_RED = '#ff4b3e';

/** Where a hold's mark was drawn, CSS px: the transports' end and the fleet's. */
export interface HoldMark {
  landing: number;
  foe: number;
  gx: number;
  gy: number;
  fx: number;
  fy: number;
}

export function drawHolds(ctx: CanvasRenderingContext2D, holds: Float32Array, cam: Camera, geo: MapGeometry, vw: number, vh: number, tint: (nation: number) => string, scale = 1): HoldMark[] {
  const out: HoldMark[] = [];
  if (holds.length === 0) return out;
  const offs = itemOffsets(cam, geo, vw);
  ctx.save();
  for (let i = 0; i + HOLD_STRIDE <= holds.length; i += HOLD_STRIDE) {
    const gx0 = holds[i]!;
    const gy0 = holds[i + 1]!;
    let fx0 = holds[i + 2]!;
    const fy0 = holds[i + 3]!;
    const foe = holds[i + 4]!;
    // Unwrapped on a looping map: the fleet on the near side of the transports.
    if (geo.wrapX && Math.abs(fx0 - gx0) > geo.w / 2) fx0 += fx0 < gx0 ? geo.w : -geo.w;
    for (const off of offs) {
      const [gx, gy] = worldToScreen(cam, gx0 + off, gy0, vw, vh);
      const [fx, fy] = worldToScreen(cam, fx0 + off, fy0, vw, vh);
      if (Math.max(gx, fx) < 0 || Math.min(gx, fx) > vw || Math.max(gy, fy) < 0 || Math.min(gy, fy) > vh) continue;
      const r = HOLD_RING_PX * scale;
      const len = Math.hypot(gx - fx, gy - fy);
      // The line from the fleet to the ring's edge, over a dark edge, dashed in the foe's colour.
      if (len > r) {
        const [ux, uy] = [(gx - fx) / len, (gy - fy) / len];
        const [ex, ey] = [gx - ux * r, gy - uy * r];
        ctx.setLineDash([]);
        ctx.lineWidth = 4 * scale;
        ctx.strokeStyle = 'rgba(20, 16, 16, 0.55)';
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.setLineDash([7 * scale, 4 * scale]);
        ctx.lineWidth = 2 * scale;
        ctx.strokeStyle = tint(foe);
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.setLineDash([]);
        // A chevron at the ring, pointing at the transports: the fire's way.
        const a = 6 * scale;
        ctx.fillStyle = HOLD_RED;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - ux * a * 1.6 - uy * a, ey - uy * a * 1.6 + ux * a);
        ctx.lineTo(ex - ux * a * 1.6 + uy * a, ey - uy * a * 1.6 - ux * a);
        ctx.closePath();
        ctx.fill();
      }
      // The ring on the transports: under attack.
      ctx.lineWidth = 2.5 * scale;
      ctx.strokeStyle = 'rgba(20, 16, 16, 0.55)';
      ctx.beginPath();
      ctx.arc(gx, gy, r + 1.5 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = HOLD_RED;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(gx, gy, r, 0, Math.PI * 2);
      ctx.stroke();
      out.push({ landing: holds[i + 5]!, foe, gx, gy, fx, fy });
    }
  }
  ctx.restore();
  return out;
}
