// Critic run 28 (new), LOY: can an AI puppet ever revolt? SPEC §3 puppets: "Loyalty < 20 with autonomy >= 10 means a
// revolt"; loyalty relaxes toward 40 + 0.6 x autonomy (25 lower while the overlord loses). The 1938 world, AI on,
// `years` years: each month-start, each living puppet's autonomy and loyalty; the lowest loyalty seen among puppets
// with autonomy >= 10, the puppet events by kind, and per puppet its min loyalty and its fate.
// Usage: npx tsx critic/scripts/c31_loy.ts <seed> <years> <out.json>
import { writeFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';

const seed = Number(process.argv[2] ?? 7019), years = Number(process.argv[3] ?? 30), out = process.argv[4]!;
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w) });
const w = s.world;
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
const want = new Set([EventKind.PuppetCreated, EventKind.PuppetReleased, EventKind.PuppetRevolt, EventKind.PuppetIntegrated]);
const evc: Record<string, number> = {};
const evl: string[] = [];
let day = 0;
const per: Record<string, { first: number; last: number; minLoy: number; minLoyAut10: number; aut0: number; autN: number; months: number; losingMonths: number }> = {};
let minLoyAut10 = 999, puppetMonths = 0, under20 = 0;
for (day = 1; day <= years * 365; day++) {
  s.step(24, (ww) => {
    const e = ww.out.events;
    for (let i = 0; i + 5 < e.length; i += 6) {
      const k = e[i + 1]!;
      if (want.has(k)) { evc[EV[k]!] = (evc[EV[k]!] ?? 0) + 1; if (evl.length < 400) evl.push(`d${day} ${EV[k]} ${tag(e[i + 2]!)} ${tag(e[i + 3]!)}`); }
    }
    ww.out.events.length = 0; ww.out.fires.length = 0;
  });
  if (day % 365 === 0) process.stderr.write(`y${day / 365} minLoyAut10=${minLoyAut10.toFixed(1)} ${JSON.stringify(evc)}\n`);
  if (day % 30 !== 0) continue;
  const nc = w.nations.cols;
  w.nations.forEach((p) => {
    if (nc.living[p] !== 1) return;
    const o = nc.overlord[p]!;
    if (o === 0) return;
    const k = `${tag(p)}>${tag(o)}`;
    const a = nc.autonomy[p]!, l = nc.loyalty[p]!;
    const r = (per[k] ??= { first: day, last: day, minLoy: 999, minLoyAut10: 999, aut0: a, autN: a, months: 0, losingMonths: 0 });
    r.last = day; r.autN = a; r.months++; puppetMonths++;
    r.minLoy = Math.min(r.minLoy, l);
    if (a >= 10) { r.minLoyAut10 = Math.min(r.minLoyAut10, l); minLoyAut10 = Math.min(minLoyAut10, l); }
    if (l < 20) under20++;
  });
}
const res = { seed, years, puppetMonths, under20, minLoyAut10, events: evc, eventLog: evl, perPuppet: per };
writeFileSync(out, JSON.stringify(res, null, 1));
console.log('done:', JSON.stringify({ seed, puppetMonths, under20, minLoyAut10, events: evc }));
