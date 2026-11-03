// Critic run 26 (new), BOTH: integrity of the war lists in AI play. Each day: pairs that fight beside each other in one
// war and against each other in another; allies at war; a puppet at war with its overlord; a guarantor at war with the
// nation it guarantees. First sighting of each pair kept, with the wars. Also the nations at war with no enemy that is
// living (empty sides). Usage: npx tsx critic/scripts/c30_both.ts <seed> <days> <out.json>
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';

const seed = Number(process.argv[2] ?? 7019), days = Number(process.argv[3] ?? 730), out = process.argv[4]!;
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w) });
const w = s.world;
const tag = (n: number): string => (w.names?.get?.(n) as string | undefined) ?? NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const nc = w.nations.cols;
const found: Record<string, { first: number; last: number; days: number; wars?: string[] }> = {};
const note = (k: string, d: number, wars?: string[]) => { const f = found[k]; if (f) { f.last = d; f.days++; } else found[k] = { first: d, last: d, days: 1, wars }; };
const wdesc = (x: { sides: number[][] }) => `${x.sides[0]!.map(tag).join('+')} v ${x.sides[1]!.map(tag).join('+')}`;
for (let d = 1; d <= days; d++) {
  s.step(24, (ww) => { ww.out.events.length = 0; ww.out.fires.length = 0; });
  const L = w.wars.list;
  for (const war of L) for (const side of war.sides) for (let i = 0; i < side.length; i++) for (let j = i + 1; j < side.length; j++) {
    const a = side[i]!, b = side[j]!;
    if (w.wars.atWar(a, b)) note(`both ${tag(a)}/${tag(b)}`, d, [wdesc(war), ...L.filter((x) => (x.sides[0].includes(a) && x.sides[1].includes(b)) || (x.sides[1].includes(a) && x.sides[0].includes(b))).map(wdesc)]);
  }
  w.nations.forEach((n) => {
    if (nc.living[n] !== 1) return;
    const o = nc.overlord[n]!;
    if (o !== 0 && w.wars.atWar(n, o)) note(`puppetVsOverlord ${tag(n)}/${tag(o)}`, d);
  });
  for (const g of w.alliances.guarantees) if (w.wars.atWar(g.guarantor, g.target)) note(`guarantorVsTarget ${tag(g.guarantor)}/${tag(g.target)}`, d);
  for (const war of L) for (const s2 of [0, 1]) if (!war.sides[s2]!.some((m) => nc.living[m] === 1)) note(`deadSide ${wdesc(war)}`, d);
  for (const war of L) for (const a of war.sides[0]!) for (const b of war.sides[1]!) if (w.alliances.allied?.(a, b)) note(`alliesAtWar ${tag(a)}/${tag(b)}`, d, [wdesc(war)]);
}
writeFileSync(out, JSON.stringify({ seed, days, found }, null, 1));
console.log(JSON.stringify({ seed, n: Object.keys(found).length, keys: Object.keys(found).slice(0, 20) }));
console.log('done:');
