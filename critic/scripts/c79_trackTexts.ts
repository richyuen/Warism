// Critic run 79: + the alliance's name key (R164's trackAlliance, as historyRows sends it). Critic run 78 (copy of c77): R156's track rows, every one of the timeline. Each event of a kind R156 tells (occupy, objective,
// nuke, allianceJoin) is put through the game's own `trackText`, with the row's nation as the sim gives it (`firstNation`
// in src/sim/track.ts: occupy's `by`, the others' `nation`), named by its message key. Prints each row the player reads,
// and counts: told by the kind, left bare (the note alone, no colon, no verb).
// Usage: npx tsx critic/scripts/c77_trackTexts.ts
import { readFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { trackText } from '../../src/ui/historyText';

const tl = JSON.parse(readFileSync('data/scenarios/1938h/timeline.json', 'utf8'));
const events = (tl.events ?? tl) as Array<Record<string, unknown>>;
const KINDS = new Set(['occupy', 'objective', 'nuke', 'allianceJoin']);
let told = 0, bare = 0, asIs = 0;
for (const e of events) {
  const kind = e.kind as string;
  if (!KINDS.has(kind) || !e.note) continue;
  const code = (kind === 'occupy' ? e.by : e.nation) as string;
  const s = trackText({ kind: EventKind.TrackEvent, trackKind: kind, note: e.note as string, bn: `nation.${code}`, ...(kind === 'allianceJoin' && e.nameKey ? { trackAlliance: e.nameKey as string } : {}) });
  const note = e.note as string;
  const how = s !== note ? 'TOLD' : note.includes(':') ? 'as-is' : 'BARE';
  if (how === 'TOLD') told++; else if (how === 'BARE') bare++; else asIs++;
  console.log(`${how}\t${e.date}\t${kind}\t${code}\t${s}`);
}
console.log(`told ${told}, as it is (a colon) ${asIs}, bare ${bare}`);
