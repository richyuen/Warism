// Critic run 54 (new): a click whose parts end differently, one landed and one thrown back. Headless, through the worker
// (SimServer, as tests/helpers/landingRows.ts). TAG at war with FOE, the N divisions nearest FROM (cells) to TO (cells) in
// one click. From the hour the first of them lands, FOE is made the holder of every sea zone within R cells of the
// landings' water, each hour (sea control is reckoned daily), so a later part is thrown back (LandingRepulsed). Logs
// every hour's rows, each row's own words (landingStatus) and the click's (groupStatus), and each division's end.
// Usage: npx tsx critic/scripts/c58_repulse.ts <seed> <TAG> <FOE> <fromX,Y> <toX,Y> <N> <out.json> [HOURS] [R]
import { writeFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { seaControlOf } from '../../src/sim/systems/seaControl';
import { seaOf } from '../../src/sim/world';
import { groupStatus, landingStatus } from '../../src/ui/landingStatus';
import { nearestDivisions, RowRun } from '../../tests/helpers/landingRows';
import { nationId } from '../../tests/helpers/sim1938';

const a = process.argv.slice(2);
const seed = Number(a[0]);
const [TAG, FOE] = [a[1]!, a[2]!];
const ll = (s: string): [number, number] => s.split(',').map(Number) as [number, number];
const FROM = ll(a[3]!), TO = ll(a[4]!);
const N = Number(a[5]);
const OUT = a[6]!;
const HOURS = Number(a[7] ?? 400);
const R = Number(a[8] ?? 10);
const nation = nationId(TAG), foe = nationId(FOE);
const r = new RowRun(seed, nation);
const w = () => r.world;
r.step();
r.cmds([{ kind: 'declareWar', attacker: nation, defender: foe }]);
r.step();
const ids = nearestDivisions(w(), nation, FROM, N);
// Each event of the case's divisions (or of kind TransportsSunk/LandingRepulsed/FormationLanded), and the worker's order news.
const kinds = new Map(Object.entries(EventKind).map(([k, v]) => [v as number, k]));
const evLog: unknown[] = [];
{
  const o = w().out as unknown as { emit: (...a: number[]) => void };
  const orig = o.emit.bind(o);
  o.emit = (...a: number[]) => {
    if (ids.includes(a[2]!) || [EventKind.LandingRepulsed, EventKind.FormationLanded].includes(a[1]!)) if (ids.includes(a[2]!)) evLog.push([a[0], kinds.get(a[1]!), ...a.slice(2)]);
    orig(...a);
  };
}
const news: unknown[] = [];
{
  const srv = r.s as unknown as { post: (m: { type: string }, t?: unknown) => void };
  const orig = srv.post.bind(srv);
  srv.post = (m, t) => {
    if (m.type !== 'landings' && m.type !== 'snapshot' && /order|news|ticker|refused/i.test(m.type)) news.push([w().tick, JSON.stringify(m).slice(0, 600)]);
    orig(m, t);
  };
}
r.ids = ids;
r.cmds(ids.map((id) => ({ kind: 'moveFormation' as const, id, x: TO[0], y: TO[1], nation, escort: true })));
const out: Record<string, unknown> & { samples: unknown[]; events: unknown[] } = { seed, TAG, FOE, FROM, TO, N, ids, samples: [], events: [] };
let firstLanded = -1;
let water = -1;
let last = '';
const W = w().cells.w;
for (let h = 0; h < HOURS; h++) {
  // Hold the sea for FOE once one has landed.
  if (firstLanded >= 0 && water >= 0) {
    const sc = seaControlOf(w());
    const z = seaOf(w());
    const wx = water % W, wy = Math.floor(water / W);
    for (let y = wy - R; y <= wy + R; y++) for (let x = wx - R; x <= wx + R; x++) {
      const k = z.zoneOf[y * W + x]!;
      if (k > 0) sc.holder[k] = foe;
    }
  }
  for (const l of w().landings.values()) if (l.nation === nation && l.water >= 0) water = l.water;
  const evBefore = w().out.events.length;
  void evBefore;
  // Read the hour's events through the server's own step: wrap by watching formations.
  const was = new Map(ids.map((id) => [id, w().embarked.has(id) || (w().formations.has(id) && w().afloat(id))]));
  r.step();
  if (process.env.DBG && firstLanded >= 0) {
    const z = seaOf(w()).zoneOf[water]!;
    const fl = [...w().landings.values()].filter((l) => l.nation === nation).map((l) => [l.id, l.water, l.state, l.fleets.map((o) => [o, Math.floor(w().formations.cols.y[o]!) * W + Math.floor(w().formations.cols.x[o]!), seaOf(w()).zoneOf[Math.floor(w().formations.cols.y[o]!) * W + Math.floor(w().formations.cols.x[o]!)]])]);
    const em = ids.map((id) => w().embarked.get(id)).map((e) => e ? [e.fleet, e.water, seaOf(w()).zoneOf[e.water]] : null); process.stdout.write(`dbg t${w().tick} em ${JSON.stringify(em)} water ${water} zone ${z} holder ${w().seaControl?.holder[z]} foe ${foe} atWar ${w().wars.atWar(foe, nation)} ${JSON.stringify(fl)}\n`);
  }
  for (const id of ids) {
    const now = w().formations.has(id) && (w().embarked.has(id) || w().afloat(id));
    if (was.get(id) && !now) {
      const gone = !w().formations.has(id);
      const p = gone ? null : [Math.round(w().formations.cols.x[id]! * 10) / 10, Math.round(w().formations.cols.y[id]! * 10) / 10];
      out.events.push({ t: w().tick, id, off: gone ? 'gone' : 'ashore', p });
      if (!gone && firstLanded < 0) firstLanded = w().tick;
    }
  }
  const byClick = new Map<number, typeof r.rows>();
  for (const row of r.rows) byClick.set(row.click, [...(byClick.get(row.click) ?? []), row]);
  const groups = [...byClick.entries()].map(([click, parts]) => ({ click, parts: parts.map((p) => [p.id, p.port, p.state, landingStatus(p), p.outcome ?? null]), says: groupStatus(parts) }));
  const key = JSON.stringify(groups);
  if (key !== last) {
    out.samples.push({ t: w().tick, groups });
    process.stdout.write(`t${w().tick} ${JSON.stringify(groups)}\n`);
    last = key;
  }
  if (h > 72 && r.settled() && r.rows.length === 0) break;
}
out.repulsedKind = EventKind.LandingRepulsed;
out.end = ids.map((id) => ({ id, alive: w().formations.has(id), p: w().formations.has(id) ? [w().formations.cols.x[id], w().formations.cols.y[id]] : null }));
out.broken = r.broken;
out.evLog = evLog;
out.news = news;
writeFileSync(OUT, JSON.stringify(out, null, 1));
process.stdout.write(`broken ${r.broken.length}: ${JSON.stringify(r.broken.slice(0, 5))}\ndone:\n`);
