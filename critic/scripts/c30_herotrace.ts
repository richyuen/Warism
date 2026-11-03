// Critic run 30: one hero's losses and returns in a ho JSON, by the game's projection. Usage: <file> <nameSubstr>
import { readFileSync } from 'node:fs';
import { unproject } from '../../src/sim/data/projection';
const d = JSON.parse(readFileSync(process.argv[2]!, 'utf8'));
const h = d.heroRows.find((r: { name: string }) => r.name.includes(process.argv[3]!));
const ll = (x: number, y: number): string => unproject(x / 2048, y / 1024).map((v) => v.toFixed(1)).join(',');
const ev = [...h.lost.map((l: { tick: number; x: number; y: number; foes: string[]; engagedLast24: boolean }) => ({ t: l.tick, s: `lost at ${ll(l.x, l.y)} foes ${l.foes} eng24 ${l.engagedLast24}` })), ...h.returns.map((r: { tick: number; x: number; y: number; lateDays: number }) => ({ t: r.tick, s: `back at ${ll(r.x, r.y)} late ${r.lateDays}` }))].sort((a, b) => a.t - b.t);
for (const e of ev) console.log(String(Math.floor(e.t / 24)).padStart(5), e.s);
console.log('alive hours', h.alive, 'moved', h.moved, 'engaged', h.engaged);
