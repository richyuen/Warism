import { expect, it } from 'vitest';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { STEERING_KINDS, TOLD_KINDS, toldByNote } from '../../src/sim/track';
import { assets1938 } from '../helpers/earth';

// ROADMAP R64b (critic run 62, R62-N2): of the timeline's notes, those told as rows are the player's words and each
// event once: none of the steering's, none with the builder's "timeline" or "stage", no war, peace or annexation (their
// own rows tell them), and no two of a day of which one begins as the other.
it("the track's rows by note: the player's words, one an event", () => {
  const t = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }).world.track!;
  const told = t.events.flatMap((e, i) => (toldByNote(t, i) ? [{ e, i }] : []));
  expect(told.length).toBeGreaterThan(150);
  for (const { e } of told) {
    expect(TOLD_KINDS.has(e.kind), e.note).toBe(true);
    expect(STEERING_KINDS.has(e.kind), e.note).toBe(false);
    expect(/timeline|stage/i.test(e.note!), e.note).toBe(false);
  }
  for (const a of told)
    for (const b of told)
      if (a.i < b.i && a.e.date === b.e.date) expect(a.e.note!.startsWith(b.e.note!) || b.e.note!.startsWith(a.e.note!), `${a.e.note} / ${b.e.note}`).toBe(false);
  // The critic's doubles: the Soviet entry, the Vistula-Oder's pocket, India.
  const notes = told.map(({ e }) => e.note);
  expect(notes).not.toContain('The Soviet Union declares war on Japan');
  expect(notes.filter((n) => n!.startsWith('The Vistula-Oder')).length).toBe(1);
  expect(notes.filter((n) => n!.includes('India')).length).toBeLessThanOrEqual(2);
});

// ROADMAP R82e (critic run 68, R68-N3: "Next, 25 July 1944: D-Day: the Normandy beachhead" from 2 to 25 July): a stage
// with a window of its own (`fightDays`) is dated at its handover and the Next line names it from the window's middle,
// so its note names what happens at the handover, not what opened the window: its name (before a colon) is no named
// event's of the window or the day before it.
it("a stage with its own window is named for its handover, not for what opened its window", () => {
  const t = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }).world.track!;
  const name = (n: string): string => n.split(':')[0]!.trim();
  const day = (d: string): number => Date.parse(`${d}T00:00:00Z`) / 86_400_000;
  const stages = t.events.filter((e) => e.kind === 'occupy' && e.fightDays !== undefined && e.note !== undefined);
  expect(stages.length).toBeGreaterThan(0);
  for (const s of stages) {
    const end = day(s.date);
    const open = end - (s.kind === 'occupy' ? s.fightDays! : 0) - 1;
    for (const e of t.events) {
      if (e === s || e.note === undefined || STEERING_KINDS.has(e.kind)) continue;
      const d = day(e.date);
      if (d >= open && d < end) expect(name(e.note), `${s.date} "${s.note}" beside ${e.date} "${e.note}"`).not.toBe(name(s.note!));
    }
  }
});

// ROADMAP R64c (critic run 62, R62-N3): an arrival (`forces`) is told once, by whose it is; its repeats have no name
// ("The mobilisation" ×22 before, whose not said).
it("the track's arrivals: each told once, by whose", () => {
  const t = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }).world.track!;
  const arrivals = t.events.filter((e) => e.kind === 'forces' && e.note !== undefined).map((e) => e.note!);
  expect(new Set(arrivals).size).toBe(arrivals.length);
  // R66b (ADR-972), R66d (ADR-976): the Pacific's and China's arrivals by the same rule; R74g (ADR-1010) D-Day's.
  for (const n of arrivals) expect(/German|Soviet|Afrika Korps|Japanese|British|Australian|Chinese|American/.test(n), n).toBe(true);
  expect(arrivals).not.toContain('The mobilisation');
});
