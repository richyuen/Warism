// Critic run 44: c43_gen on R33's world.landings; 'aboard' = the first standing at its landing's port, ashore (R33b), or aboard.
// Critic run 41 (new seeds and a new coast): R29b off Japan. Nation <tag> at war with <foe>; the <n> divisions nearest
// <home> (lon,lat) sent by one click (applied together at once, as the page does) to <t1>; two hours after the first is
// aboard a convoy standing at its port, the fresh division nearest <freshAt> sent to <t2> by one click, then the n by the
// next click in the same hour. Traces each division and its transport group (aboard / bound, the group's place and
// convoy port), every MoveRejected/LeftLanding/FormationLanded/FormationDestroyed of theirs, and the groups' losses.
// Usage: npx tsx critic/scripts/c45_gen.ts <seed> <tag> <foe> <homeLon,Lat> <t1Lon,Lat> <t2Lon,Lat> <freshLon,Lat> <n> <days> <out>
import { writeFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
import { landingOfDivision } from '../../src/sim/systems/landings';
const LS = ['gath', 'sail', 'ret'];
const [seedS, T, F, homeS, t1S, t2S, freshS, nS, dS, outF] = process.argv.slice(2);
const SZ = size1938();
const ll = (s: string): [number, number] => { const [lo, la] = s.split(',').map(Number); const [x, y] = cellOf(lo!, la!, SZ.w, SZ.h); return [Math.floor(x) + 0.5, Math.floor(y) + 0.5]; };
const home = ll(homeS!), t1 = ll(t1S!), t2 = ll(t2S!), freshAt = ll(freshS!);
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(SZ.w) });
const tag = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const N = tag(T!), FOE = tag(F!);
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
s.command({ kind: 'setPlayer', nation: N } as never);
if (process.env.PAGESEQ) s.applyNow((wd: any) => { wd.out.events.length = 0; wd.out.fires.length = 0; }); // PAGESEQ=1: each setup command applied at once, as the page's buttons do
const w = s.world, c = () => w.formations.cols;
if (!w.wars.atWar(N, FOE)) { s.command({ kind: 'forceWar', attacker: N, defender: FOE } as never); if (process.env.PAGESEQ) s.applyNow((wd: any) => { wd.out.events.length = 0; wd.out.fires.length = 0; }); s.step(1); }
const land: number[] = [];
w.formations.forEach((f) => { if (c().nation[f] === N && !w.isFleet(f) && !w.offLand(f)) land.push(f); });
const near = (p: [number, number], skip: number[]): number[] => land.filter((f) => !skip.includes(f)).sort((a, b) => Math.hypot(c().x[a]! - p[0], c().y[a]! - p[1]) - Math.hypot(c().x[b]! - p[0], c().y[b]! - p[1]));
const ids = process.env.PICK ? process.env.PICK.split(',').map(Number) : near(home, []).slice(0, Number(nS)); // PICK: the divisions by id
const fresh = near(freshAt, ids)[0]!;
const all = [...ids, fresh];
const ev: string[] = [];
const groups = new Set<number>();
const take = (wd: typeof w): void => {
  const e = wd.out.events;
  for (let i = 0; i < e.length; i += 6) {
    const k = e[i + 1]!, a = e[i + 2]!;
    if ((all.includes(a) && [EventKind.LeftLanding, EventKind.MoveRejected, EventKind.FormationLanded, EventKind.FormationDestroyed].includes(k)) || (groups.has(a) && k === EventKind.FormationDestroyed)) ev.push(`t${e[i]} ${EV[k]} a${a} b${e[i + 3]} x${(+e[i + 4]!).toFixed(1)} y${(+e[i + 5]!).toFixed(1)}`);
  }
  e.length = 0; wd.out.fires.length = 0;
};
const click = (who: number[], p: [number, number]): boolean[] => { const r = who.map((id) => { const ok = s.command({ kind: 'moveFormation', id, x: p[0], y: p[1], nation: N, escort: true } as never); if (process.env.PER) s.applyNow(take as never); return ok; }); s.applyNow(take as never); return r; }; // PER=1: each order applied at once (the page before R29a)
const st = (id: number): string => {
  if (!w.formations.has(id)) return `${id}:dead`;
  const e = w.embarked.get(id); const l = landingOfDivision(w, id); const g = e?.fleet ?? l?.fleets[0];
  if (l) for (const f of l.fleets) groups.add(f); if (e) groups.add(e.fleet);
  const gp = g !== undefined && w.formations.has(g) ? `[g${g}@${c().x[g]!.toFixed(1)},${c().y[g]!.toFixed(1)}${c().moving[g] ? 'm' : ''} s${c().strength[g]!.toFixed(0)}]` : g !== undefined ? `[g${g} gone]` : '';
  const lp = l ? `{L${l.id}${LS[l.state]} p${w.ports[l.port]?.name ?? l.port} f${l.fleets.join('/')} d${[...l.divisions.keys()].join('/')}}` : '';
  return `${id}:${e ? 'aboard' + e.fleet : c().moving[id] ? 'march' : 'still'}@${c().x[id]!.toFixed(1)},${c().y[id]!.toFixed(1)}${lp}${gp}`;
};
const out: Record<string, unknown> = { seed: Number(seedS), T, F, home, t1, t2, freshAt, ids, fresh };
out.first = click(ids, t1);
let aboard = -1, done = false;
const trace: string[] = []; const landed: Record<number, [number, number, number]> = {};
for (let h = 0; h < 24 * Number(dS); h++) {
  if (!done && !process.env.NOREDIRECT && aboard >= 0 && w.tick >= aboard + 2) {
    done = true;
    ev.push(`t${w.tick} before ${all.map(st).join(' | ')}`);
    out.freshOrder = click([fresh], t2);
    out.leaveOrder = process.env.ASC ? click([...ids].sort((a, b) => a - b), t2) : click(ids, t2); // ASC=1: the click's orders by ascending id, as player.ts sends them
    ev.push(`t${w.tick} after ${all.map(st).join(' | ')}`);
  }
  // Run 42: RECALL=<h> — <h> hours after the redirect, the n clicked back (ascending ids) onto RECALLTO (lon,lat; default t1).
  // LANDORDER=<h> lon,lat — <h> hours after the redirect, the n clicked (ascending) onto a land cell at home.
  if (done && process.env.RECALL && out.recallAt === undefined && w.tick >= (out.redirectTick as number) + Number(process.env.RECALL)) {
    out.recallAt = w.tick; ev.push(`t${w.tick} prerecall ${all.map(st).join(' | ')}`);
    out.recallOrder = click([...ids].sort((a, b) => a - b), process.env.RECALLTO ? ll(process.env.RECALLTO) : t1);
    ev.push(`t${w.tick} postrecall ${all.map(st).join(' | ')}`);
  }
  // FLEETMOVE=<h>,x,y — <h> hours after the redirect, the transport group of the first aboard ordered (as a player's fleet
  // order) to sea cell x,y; FLEETBEFORE=1 does it <h> hours after the first is aboard, with no redirect at all (control).
  if (process.env.FLEETMOVE && out.fleetAt === undefined) {
    const [fh, fx, fy] = process.env.FLEETMOVE.split(',').map(Number);
    const base = process.env.FLEETBEFORE ? (aboard >= 0 ? aboard : Infinity) : (out.redirectTick as number ?? Infinity);
    if (w.tick >= base + fh!) {
      const g = ids.map((id) => w.embarked.get(id)?.fleet ?? landingOfDivision(w, id)?.fleets[0]).find((x) => x !== undefined);
      out.fleetAt = w.tick; out.fleetMoved = g;
      ev.push(`t${w.tick} prefleet ${all.map(st).join(' | ')}`);
      if (g !== undefined) { out.fleetOrder = s.command({ kind: 'moveFormation', id: g, x: fx, y: fy, nation: N } as never); s.applyNow(take as never); }
      ev.push(`t${w.tick} postfleet ${all.map(st).join(' | ')}`);
    }
  }
  // FLEET2=<h>,x,y — <h> hours after FLEETMOVE, the same group ordered again; UNITAFTER=<h>,x,y — the first id ordered (a click).
  if (process.env.FLEET2 && out.fleetAt !== undefined && out.fleet2At === undefined) {
    const [fh, fx, fy] = process.env.FLEET2.split(',').map(Number);
    if (w.tick >= (out.fleetAt as number) + fh!) { out.fleet2At = w.tick; out.fleet2Order = s.command({ kind: 'moveFormation', id: out.fleetMoved, x: fx, y: fy, nation: N } as never); s.applyNow(take as never); ev.push(`t${w.tick} postfleet2 ${all.map(st).join(' | ')}`); }
  }
  if (process.env.UNITAFTER && out.fleetAt !== undefined && out.unitAt === undefined) {
    const [fh, fx, fy] = process.env.UNITAFTER.split(',').map(Number);
    if (w.tick >= (out.fleetAt as number) + fh!) { out.unitAt = w.tick; out.unitOrder = click([ids[0]!], [fx!, fy!]); ev.push(`t${w.tick} postunit ${all.map(st).join(' | ')}`); }
  }
  if (done && out.redirectTick === undefined) out.redirectTick = w.tick;
  s.step(1, take as never);
  if (aboard < 0 && ids.some((id) => { const l = landingOfDivision(w, id); return (!!l && l.state === 0 && !c().moving[id] && !w.embarked.has(id)) || w.embarked.has(id); })) aboard = w.tick; // run 44: the first standing at its landing's port (ashore, R33b) or aboard
  for (const id of all) if (!landed[id] && ev.some((x) => x.includes(`FormationLanded a${id} `))) landed[id] = [w.tick, +c().x[id]!.toFixed(1), +c().y[id]!.toFixed(1)];
  if (h % 24 === 0 || h < 8 || (process.env.HOURLY && h < 90)) trace.push(`t${w.tick} ${all.map(st).join(' ')}`);
  if (done && all.every((id) => landed[id] || !w.formations.has(id))) break;
}
Object.assign(out, { aboard, landed, end: all.map(st), events: ev, trace });
writeFileSync(outF!, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ ids, fresh, aboard, landed, end: out.end, events: ev.filter((e) => !e.includes(' before ') && !e.includes(' after ')) }));
