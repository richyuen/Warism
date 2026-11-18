// Critic run 75 (new): is a warhead's bomber stopped short (EventKind.NukeIntercepted) told anywhere? The kind against
// the History's kinds (src/sim/history.ts HISTORY_KINDS), the ticker's (TICKER_KINDS), the war kinds, the history roles
// and the English strings.
// Usage: npx tsx critic/scripts/c76_interceptTold.ts
import { readFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { HISTORY_ROLES, TICKER_KINDS, WAR_KINDS } from '../../src/shared/history';
import { HISTORY_KINDS } from '../../src/sim/history';
const en = JSON.parse(readFileSync('src/ui/i18n/en.json', 'utf8')) as Record<string, string>;
for (const k of ['NukeLaunched', 'NukeIntercepted', 'NukeDetonated', 'NukeDecided', 'NukeMeansLost', 'NukeCasualties'] as const) {
  const id = (EventKind as Record<string, number>)[k];
  if (id === undefined) { process.stdout.write(`${k}: no such kind\n`); continue; }
  process.stdout.write(`${k} (${id}): in History's kinds ${HISTORY_KINDS.has(id)}, in the ticker's ${TICKER_KINDS.has(id)}, a war kind ${WAR_KINDS.has(id)}, has roles ${id in HISTORY_ROLES}, strings ${Object.keys(en).filter((s) => s.includes(k)).length}\n`);
}
