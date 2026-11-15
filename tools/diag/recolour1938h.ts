// R84d (critic run 69, R69-B4): new colours for the nations of the replay whose land neighbours are too close to them.
// Reads `neighbourColours.ts --json`'s pairs; the bar of a pair is HIGH (30, ΔE CIE76) on the 1991 sets (the last map,
// the world at the end, a birth against its parents) and LOW (15, 1938's bar, `nations.test`) on the others. Greedy:
// the closest pair under its bar first; it changes one of the two, a nation the replay adds before one of plain 1938's,
// to the colour of a 16-step grid nearest its own that clears every pair it is in by MARGIN (else the one that clears
// them most), readable (L* 25-85), clear of the water's and unowned land's colours and ΔE OWN_DE from every other
// nation's (no two share one: `flagsByScenario.test`). Prints the changes as JSON.
// Usage: npx tsx tools/diag/recolour1938h.ts <pairs.json> [out.json]
import { readFileSync, writeFileSync } from 'node:fs';
import { deltaE, parseHex, rgbToLab } from '../../src/shared/color';
import { NATIONS_1938 } from '../../src/sim/scenario1938';
import { NATIONS_1938H } from '../../src/sim/scenario1938h';

const HIGH = 30;
const LOW = 15;
const MARGIN = 3;
/** From every other nation's colour, neighbour or not. */
const OWN_DE = 3;
/** Colours a nation keeps clear of: the water (palette 0), the sea's tint and unowned land. */
const AVOID = [0x1d3557, 0x2a4a6e, 0x9e9e94];

const [pairsFile, outFile] = process.argv.slice(2) as [string, string | undefined];
const sets = JSON.parse(readFileSync(pairsFile, 'utf8')) as { at: string; pairs: [string, string][] }[];
const high = (at: string): boolean => at.startsWith('map 1991') || at.startsWith('world at the end') || at === 'born from';
const bar = new Map<string, number>();
const key = (a: string, b: string): string => (a < b ? `${a}|${b}` : `${b}|${a}`);
for (const s of sets) for (const [a, b] of s.pairs) bar.set(key(a, b), Math.max(bar.get(key(a, b)) ?? 0, high(s.at) ? HIGH : LOW));
const edges = new Map<string, { other: string; bar: number }[]>();
for (const [k, b] of bar) {
  const [x, y] = k.split('|') as [string, string];
  for (const [p, q] of [[x, y], [y, x]] as const) {
    if (!edges.has(p)) edges.set(p, []);
    edges.get(p)!.push({ other: q, bar: b });
  }
}
const base = new Set(NATIONS_1938.map((n) => n.tag));
const colour = new Map(NATIONS_1938H.map((n) => [n.tag, parseHex(n.color)]));
const original = new Map(colour);
const dE = (a: number, b: number): number => deltaE(a, b);

const grid: number[] = [];
for (let r = 0; r < 256; r += 17) for (let g = 0; g < 256; g += 17) for (let b = 0; b < 256; b += 17) {
  const c = (r << 16) | (g << 8) | b;
  const L = rgbToLab(c)[0];
  if (L < 25 || L > 85) continue;
  if (AVOID.some((x) => dE(c, x) < 15)) continue;
  grid.push(c);
}

/** The least slack (ΔE less the bar) of `t` coloured `c` over its pairs. */
const slack = (t: string, c: number): number => Math.min(...(edges.get(t) ?? []).map((e) => dE(c, colour.get(e.other)!) - e.bar));

const changed = new Set<string>();
for (let round = 0; round < 2000; round++) {
  let worst: { a: string; b: string; s: number } | null = null;
  for (const [k, b] of bar) {
    const [x, y] = k.split('|') as [string, string];
    const s = dE(colour.get(x)!, colour.get(y)!) - b;
    if (s < 0 && (!worst || s < worst.s)) worst = { a: x, b: y, s };
  }
  if (!worst) break;
  // Which one to change: one the replay adds before one of 1938's; then the one changed already (it has no colour to
  // keep), then the one with the fewer pairs.
  const order = [worst.a, worst.b].sort((p, q) => Number(base.has(p)) - Number(base.has(q)) || Number(changed.has(q)) - Number(changed.has(p)) || (edges.get(p)?.length ?? 0) - (edges.get(q)?.length ?? 0));
  let done = false;
  for (const t of order) {
    const own = original.get(t)!;
    const free = grid.filter((c) => [...colour].every(([o, x]) => o === t || dE(c, x) >= OWN_DE));
    const fits = free.filter((c) => slack(t, c) >= MARGIN).sort((p, q) => dE(p, own) - dE(q, own));
    const pick = fits[0] ?? [...free].sort((p, q) => slack(t, q) - slack(t, p))[0]!;
    if (slack(t, pick) > slack(t, colour.get(t)!)) {
      colour.set(t, pick);
      changed.add(t);
      done = true;
      break;
    }
  }
  if (!done) {
    console.log(`stuck at ${worst.a}-${worst.b} (${worst.s.toFixed(1)})`);
    break;
  }
}
const hex = (c: number): string => `#${c.toString(16).padStart(6, '0')}`;
const out = Object.fromEntries([...changed].sort().map((t) => [t, hex(colour.get(t)!)]));
const left = [...bar].map(([k, b]) => ({ k, s: dE(colour.get(k.split('|')[0]!)!, colour.get(k.split('|')[1]!)!) - b })).filter((x) => x.s < 0);
console.log(`changed ${changed.size} (of 1938: ${[...changed].filter((t) => base.has(t)).join(' ') || 'none'}); pairs still under their bar: ${left.length}${left.length ? ` ${left.map((x) => `${x.k} ${x.s.toFixed(1)}`).join(', ')}` : ''}`);
for (const t of [...changed].sort()) console.log(`${t} ${hex(original.get(t)!)} -> ${hex(colour.get(t)!)} (ΔE ${dE(original.get(t)!, colour.get(t)!).toFixed(1)} from its own)`);
if (outFile) writeFileSync(outFile, JSON.stringify(out, null, 1));
console.log('done:');
