// ROADMAP R2 (ADR-807): do AI puppets rise, and how many? The 1938 world, AI on, `years` years: the
// puppet events by kind, the risings (`PuppetRevolt`) against the puppets made (`PuppetCreated`;
// the AT's bar is at most 1 in 10), each rising with the puppet's autonomy and loyalty, its income
// beside its overlord's and whether the overlord was losing; and the lowest loyalty a puppet with
// a voice (autonomy ≥ PROTEST_FROM) had at a month's start. Built on the critic's run-28 probe
// (critic/scripts/c28_loy.ts).
// Usage: npx tsx tools/diag/puppetLoyalty.ts <seed> <years> <out.json>
import { writeFileSync } from 'node:fs';
import { isMonthStart } from '../../src/shared/calendar';
import { EventKind } from '../../src/shared/events';
import { NATIONS_1938, size1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { LOSING_SCORE, PROTEST_FROM } from '../../src/sim/systems/puppets';
import type { World } from '../../src/sim/world';
import { loadAssets1938 } from '../headless/assets';

const seed = Number(process.argv[2] ?? 7019);
const years = Number(process.argv[3] ?? 30);
const out = process.argv[4]!;
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w) });
const w = s.world;
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
const want = new Set<number>([EventKind.PuppetCreated, EventKind.PuppetReleased, EventKind.PuppetRevolt, EventKind.PuppetIntegrated]);

const losing = (ww: World, o: number): boolean =>
  ww.wars.list.some((war) => {
    const side = war.sides[0].includes(o) ? 1 : war.sides[1].includes(o) ? -1 : 0;
    return side !== 0 && side * war.score <= -LOSING_SCORE;
  });

const evc: Record<string, number> = {};
const evl: string[] = [];
const risings: string[] = [];
// The puppets' loyalty an hour before, for the risings' lines (the pass relaxes it after).
let loyalty = Array.from(w.nations.cols.loyalty);
let minLoyVoice = 999;
let day = 0;
for (day = 1; day <= years * 365; day++) {
  s.step(24, (ww) => {
    const nc = ww.nations.cols;
    const e = ww.out.events;
    for (let i = 0; i + 5 < e.length; i += 6) {
      const k = e[i + 1]!;
      if (!want.has(k)) continue;
      const p = e[i + 2]!;
      const o = e[i + 3]!;
      evc[EV[k]!] = (evc[EV[k]!] ?? 0) + 1;
      if (evl.length < 600) evl.push(`d${day} ${EV[k]} ${tag(p)} ${tag(o)}`);
      if (k === EventKind.PuppetRevolt) {
        const ratio = Math.max(0, nc.income[p]!) / Math.max(1, nc.income[o]!);
        risings.push(`d${day} ${tag(p)} on ${tag(o)}: autonomy ${nc.autonomy[p]!.toFixed(0)}, loyalty ${(loyalty[p] ?? NaN).toFixed(1)}, income ${ratio.toFixed(2)} of its overlord's${losing(ww, o) ? ', the overlord losing' : ''}`);
      }
    }
    ww.out.events.length = 0;
    ww.out.fires.length = 0;
    loyalty = Array.from(nc.loyalty);
  });
  if (isMonthStart(w.startDay, w.tick - 23) || day % 30 === 0) {
    const nc = w.nations.cols;
    w.nations.forEach((p) => {
      if (nc.living[p] === 1 && nc.overlord[p] !== 0 && nc.autonomy[p]! >= PROTEST_FROM) minLoyVoice = Math.min(minLoyVoice, nc.loyalty[p]!);
    });
  }
  if (day % 3650 === 0) process.stderr.write(`y${day / 365} ${JSON.stringify(evc)}\n`);
}
const made = evc['PuppetCreated'] ?? 0;
const rose = evc['PuppetRevolt'] ?? 0;
const res = { seed, years, made, rose, perMade: made > 0 ? rose / made : 0, minLoyVoice, events: evc, risings, eventLog: evl };
writeFileSync(out, JSON.stringify(res, null, 1));
console.log('done:', JSON.stringify({ seed, made, rose, perMade: res.perMade.toFixed(3), minLoyVoice: minLoyVoice.toFixed(1), events: evc }));
