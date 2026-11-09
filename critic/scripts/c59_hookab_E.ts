import { EventKind } from '../../src/shared/events'; void EventKind;
// Critic run 59 (new): does a hook change a landingInvariants run? MODE=none|noop|events. Prints breaks, slowClick note
// and the state hash at the end. Usage: MODE=noop npx tsx critic/scripts/c59_hookab.ts <seed> <setup> <groups>
import { landingBreaks } from '../../tests/helpers/landingInvariants';
import { stateHash } from '../../src/sim/core/state';
import type { World } from '../../src/sim/world';
const [s, su, g] = process.argv.slice(2).map(Number);
const mode = process.env.MODE ?? 'none';
const notes: string[] = [];
let world: World | undefined;
const hashes: string[] = [];
const br = landingBreaks({
  seed: s!, setup: su!, days: 120, orders: s!, probeDays: [30, 90], groups: g!, notes,
  ...(mode === 'noop' ? { onHour: (w: World) => { world = w; if (w.tick % 240 === 0) hashes.push(`${w.tick}:${(stateHash(w.parts()) >>> 0).toString(16)}`); } } : {}),
  ...(mode === 'events' ? { events: () => {} } : {}),
});
console.log(mode, br.length, 'broken', br.join(' | '));
console.log(notes.filter((n) => n.includes('slowClick')).join('\n'));
if (world) console.log('hashes', hashes.join(' '));
console.log('done:');
