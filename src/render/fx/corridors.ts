/**
 * The breakthrough corridors in force (ROADMAP R53e; critic run 54's objection to ADR-864: "the map still shows nothing
 * of the 10-day corridor that is the tool's whole effect"). Each row of the snapshot's `corridors` (CORRIDOR_STRIDE:
 * start, way, length and half width in cells, nation, days left) is the strip the sim reads (`inCorridor`: −1 to len
 * along its way, ± half + 0.5 across): a band of the nation's colour, edged in amber on a dark line, with amber
 * chevrons along its way, under the counters; amber, not the nation's colour, so that a corridor over its own land
 * (Germany's grey on Germany) is seen. It fades out over its last day; under MIN_PX long on the screen it is not drawn.
 * A pure function of the rows and the camera.
 */
import { CORRIDOR_STRIDE } from '../../shared/protocol';
import { itemOffsets, worldToScreen, type Camera, type MapGeometry } from '../camera';

/** Under this many CSS px long a corridor is not drawn (the world's zoom: a speck). */
export const CORRIDOR_MIN_PX = 10;
export const CORRIDOR_AMBER = '#ffcf3f';

/** Where a corridor was drawn, CSS px: its start and its end on its way. */
export interface CorridorMark {
  nation: number;
  ax: number;
  ay: number;
  bx: number;
  by: number;
}

export function drawCorridors(ctx: CanvasRenderingContext2D, rows: Float32Array, cam: Camera, geo: MapGeometry, vw: number, vh: number, tint: (nation: number) => string, scale = 1): CorridorMark[] {
  const out: CorridorMark[] = [];
  if (rows.length === 0) return out;
  const offs = itemOffsets(cam, geo, vw);
  ctx.save();
  for (let i = 0; i + CORRIDOR_STRIDE <= rows.length; i += CORRIDOR_STRIDE) {
    const [x, y, dx, dy, len, half, nation, days] = [rows[i]!, rows[i + 1]!, rows[i + 2]!, rows[i + 3]!, rows[i + 4]!, rows[i + 5]!, rows[i + 6]!, rows[i + 7]!];
    const fade = Math.max(0, Math.min(1, days));
    if (fade <= 0) continue;
    const w = half + 0.5;
    // The strip's corners in cells: −1 to len along, ± w across (`inCorridor`).
    const [nx, ny] = [-dy, dx];
    const corners: [number, number][] = [
      [x - dx + nx * w, y - dy + ny * w],
      [x + dx * len + nx * w, y + dy * len + ny * w],
      [x + dx * len - nx * w, y + dy * len - ny * w],
      [x - dx - nx * w, y - dy - ny * w],
    ];
    for (const off of offs) {
      const pts = corners.map(([cx, cy]) => worldToScreen(cam, cx + off, cy, vw, vh));
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      if (Math.max(...xs) < 0 || Math.min(...xs) > vw || Math.max(...ys) < 0 || Math.min(...ys) > vh) continue;
      const [ax, ay] = worldToScreen(cam, x - dx + off, y - dy, vw, vh);
      const [bx, by] = worldToScreen(cam, x + dx * len + off, y + dy * len, vw, vh);
      const along = Math.hypot(bx - ax, by - ay);
      if (along < CORRIDOR_MIN_PX * scale) continue;
      const band = (): void => {
        ctx.beginPath();
        ctx.moveTo(pts[0]![0], pts[0]![1]);
        for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]);
        ctx.closePath();
      };
      ctx.globalAlpha = 0.3 * fade;
      ctx.fillStyle = tint(nation);
      band();
      ctx.fill();
      ctx.globalAlpha = fade;
      ctx.setLineDash([]);
      ctx.lineWidth = 3.5 * scale;
      ctx.strokeStyle = 'rgba(20, 16, 16, 0.6)';
      band();
      ctx.stroke();
      ctx.setLineDash([8 * scale, 5 * scale]);
      ctx.lineWidth = 1.75 * scale;
      ctx.strokeStyle = CORRIDOR_AMBER;
      band();
      ctx.stroke();
      ctx.setLineDash([]);
      // Chevrons along its way, about one a band's width apart, sized to the band.
      const across = Math.hypot(pts[1]![0] - pts[2]![0], pts[1]![1] - pts[2]![1]);
      const [ux, uy] = [(bx - ax) / along, (by - ay) / along];
      const [px, py] = [-uy, ux];
      const size = Math.max(4 * scale, Math.min(across * 0.3, 18 * scale));
      const n = Math.max(1, Math.min(6, Math.floor(along / Math.max(across, size * 3))));
      for (let k = 0; k < n; k++) {
        const t = (k + 0.6) / (n + 0.2);
        const [cx, cy] = [ax + (bx - ax) * t, ay + (by - ay) * t];
        const chevron = (): void => {
          ctx.beginPath();
          ctx.moveTo(cx - ux * size + px * size, cy - uy * size + py * size);
          ctx.lineTo(cx, cy);
          ctx.lineTo(cx - ux * size - px * size, cy - uy * size - py * size);
        };
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 5 * scale;
        ctx.strokeStyle = 'rgba(20, 16, 16, 0.6)';
        chevron();
        ctx.stroke();
        ctx.lineWidth = 2.5 * scale;
        ctx.strokeStyle = CORRIDOR_AMBER;
        chevron();
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      out.push({ nation, ax, ay, bx, by });
    }
  }
  ctx.restore();
  return out;
}
