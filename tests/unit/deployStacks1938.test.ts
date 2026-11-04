import { describe, expect, it } from 'vitest';
import { SLOT_SPACING, slotGrid } from '../../src/sim/core/pose';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { contactsOf, deployOf, elementIndex, slotCount } from '../../src/sim/systems/elements';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R18: the blocks of one side's two stacks, on two neighbouring enemies, stood in one
// another (`stackBlocks1938.spec.ts`, red after R16b: seed 1212, the Soviet Union at war with
// Poland from the start, day 20: Soviet blocks on Polish divisions 552 and 569 0.024 slot apart).
// A block keeps clear of its own side's blocks before it in the hour's order as of an enemy's.
// Here: on that day no two Soviet blocks in contact stand in one another.

const W = SIZE_1938.w;
const SOV = nationId('SOV');
const POL = nationId('POL');

interface Block {
  id: number;
  x: number;
  y: number;
  facing: number;
  width: number;
  depth: number;
}

/** How far apart two blocks stand along the best of their own four axes (negative: in one another). */
function apart(p: Block, q: Block): number {
  const corners = (b: Block): [number, number][] => {
    const [fx, fy] = [Math.cos(b.facing), Math.sin(b.facing)];
    return [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(([i, j]) => [b.x + (fx * b.depth * i!) / 2 - (fy * b.width * j!) / 2, b.y + (fy * b.depth * i!) / 2 + (fx * b.width * j!) / 2]);
  };
  const [cp, cq] = [corners(p), corners(q)];
  let best = -Infinity;
  for (const b of [p, q])
    for (const ang of [b.facing, b.facing + Math.PI / 2]) {
      const pr = cp.map(([x, y]) => x * Math.cos(ang) + y * Math.sin(ang));
      const qr = cq.map(([x, y]) => x * Math.cos(ang) + y * Math.sin(ang));
      best = Math.max(best, Math.min(...qr) - Math.max(...pr), Math.min(...pr) - Math.max(...qr));
    }
  return best;
}

function sovietBlocks(w: World): Block[] {
  const contacts = contactsOf(w);
  const idx = elementIndex(w);
  const c = w.formations.cols;
  const out: Block[] = [];
  for (const f of [...contacts.keys()].sort((a, b) => a - b)) {
    if (c.nation[f] !== SOV) continue;
    const n = slotCount(w, f, idx.get(f)?.length ?? 0);
    const d = deployOf(w, f, n);
    if (!d) continue;
    const g = slotGrid(n);
    out.push({ id: f, ...d, width: g.cols * SLOT_SPACING, depth: g.rows * SLOT_SPACING });
  }
  return out;
}

describe('the blocks of one side’s stacks (ROADMAP R18)', () => {
  it('seed 1212, the Soviet Union on Poland, day 20: no two Soviet blocks in contact stand in one another', () => {
    const s = new Sim({ scenario: '1938', seed: 1212, assets: assets1938(W) });
    s.command({ kind: 'declareWar', attacker: SOV, defender: POL });
    s.step(20 * 24, (w) => {
      w.out.events.length = 0;
      w.out.fires.length = 0;
    });
    const blocks = sovietBlocks(s.world);
    expect(blocks.length, 'Soviet blocks in contact').toBeGreaterThan(10);
    const inOne: string[] = [];
    for (let i = 0; i < blocks.length; i++)
      for (let j = i + 1; j < blocks.length; j++) {
        const a = apart(blocks[i]!, blocks[j]!);
        if (a < -1e-6) inOne.push(`${blocks[i]!.id}/${blocks[j]!.id} ${a.toFixed(3)}`);
      }
    expect(inOne).toEqual([]);
  }, 300_000);
});
