// Critic run 38 (copy of run 37) (new): ASCII of the 1938 start around (cx, cy): '.' sea, else the first letter of the holder's tag
// (lower case where the cell is not its own core... no: plain). Ports marked '*'.
// Usage: npx tsx critic/scripts/c38_map.ts <seed> <cx> <cy> <r>
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
import { isLand } from '../../src/shared/terrain';
const [seedS, cxS, cyS, rS] = process.argv.slice(2);
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
const w = s.world; const W = w.cells.w;
const cx = Math.floor(+cxS!), cy = Math.floor(+cyS!), r = +rS!;
const ports = new Set(w.ports.map((p: { cell: number }) => p.cell));
const tags = new Map<string, string>();
const head = '      ' + Array.from({ length: 2 * r + 1 }, (_, i) => String((cx - r + i) % 10)).join('');
console.log(head);
for (let y = cy - r; y <= cy + r; y++) {
  let line = String(y).padStart(5) + ' ';
  for (let x = cx - r; x <= cx + r; x++) {
    const c = y * W + x;
    if (ports.has(c)) { line += '*'; continue; }
    if (!isLand(w.cells.terrain[c]!)) { line += '.'; continue; }
    const h = w.cells.controller[c]!;
    const t = NATIONS_1938[h - 1]?.tag ?? '?';
    const ch = t[0]!;
    tags.set(t, ch);
    line += ch;
  }
  console.log(line);
}
console.log([...tags].map(([t, c]) => `${c}=${t}`).join(' '));
for (const p of w.ports as { cell: number; name?: string }[]) { const x = p.cell % W, y = Math.floor(p.cell / W); if (Math.abs(x - cx) <= r && Math.abs(y - cy) <= r) console.log('port', x + 0.5, y + 0.5, p.name ?? ''); }
