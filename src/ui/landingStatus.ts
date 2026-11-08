import type { LandingRow } from '../shared/protocol';
import { displayName, t } from './i18n';

/** What a landing's row says of where it stands (ROADMAP R47b): its days to sail, at sea, turning back, or how it ended. */
export function landingStatus(r: LandingRow): string {
  if (r.state === 'over' && r.outcome) {
    const o = r.outcome;
    // Each division by where it ended (R50a; critic run 52, R52-B1): the first of landed, broke off, lost, never sailed
    // says how it went, the others follow.
    const target = r.target.startsWith('=') ? r.target.slice(1) : t('landing.target');
    const more = (skip: string): string => {
      const parts: string[] = [];
      if (skip !== 'lost' && o.lost > 0) parts.push(t('landing.more.lost', { n: o.lost }));
      if (skip !== 'away' && (o.away ?? 0) > 0) parts.push(t('landing.more.away', { n: o.away!, target }));
      if (skip !== 'repulsed' && (o.repulsed ?? 0) > 0) parts.push(t('landing.more.repulsed', { n: o.repulsed! }));
      if (skip !== 'sunk' && (o.stayed ?? 0) > 0) parts.push(t('landing.more.stayed', { n: o.stayed! }));
      return parts.map((p) => `, ${p}`).join('');
    };
    if (o.kind === 'landed') return t('landing.over.landed', { n: o.landed }) + more('');
    if (o.kind === 'away') return t('landing.over.away', { n: o.away ?? 0, target }) + more('away');
    if (o.kind === 'repulsed') return t('landing.over.repulsedN', { n: o.repulsed ?? 0 }) + more('repulsed');
    if (o.kind === 'lost') return t('landing.over.lostN', { n: o.lost }) + more('lost');
    if (o.kind === 'sunk') return t('landing.over.sunk', { n: o.stayed ?? 0 }) + more('sunk');
    if (o.kind === 'cancelled') {
      // R48a: those aboard back at the port, those ashore stopped where they stood (R51-N1: "back at Hamburg" for a week's march).
      // Then the AI commands them again, where the player's army is the AI's (21107: two walked off the next day).
      const home = o.home ?? 0;
      const stopped = o.stopped ?? 0;
      const said = stopped === 0 ? t('landing.over.cancelled', { port: r.port }) : home === 0 ? t('landing.over.cancelledStopped') : t('landing.over.cancelledBoth', { home, stopped, port: r.port });
      return o.ai ? t('landing.over.aiAgain', { said }) : said;
    }
    return t(`landing.over.${o.kind}`);
  }
  // R48d: its days to land (R51-N6: "at sea" alone).
  // R50c: held in a fight, no days (R52-N3: "about a day" for four days on 21105).
  if (r.state === 'sailing' && r.held) return r.heldBy ? t('landing.sailing.heldBy', { by: displayName(r.heldBy) }) : t('landing.sailing.held');
  if (r.state === 'sailing') return r.lands === undefined ? t('landing.sailing') : t(r.lands === 1 ? 'landing.sailing.one' : 'landing.sailing.days', { days: r.lands });
  // R50d: its days to the port, as one at sea has its days to land.
  if (r.state === 'returning') return r.back === undefined ? t('landing.returning', { port: r.port }) : t(r.back === 1 ? 'landing.returning.one' : 'landing.returning.days', { port: r.port, days: r.back });
  if (r.sails?.other) return t(r.sails.days === 1 ? 'landing.sibling.one' : 'landing.sibling', { other: r.sails.other, days: r.sails.days });
  if (r.sails) return t(r.sails.days === 1 ? 'landing.sails.one' : 'landing.sails', { days: r.sails.days });
  return t('landing.gathering');
}

/**
 * Where one click's landings stand together (ROADMAP R48f): one alone says its own. Several: gathering, the last to
 * sail; some at sea and some not, how many at sea and when the last sails; all at sea, the last to land; turning back,
 * so; all over, their landed summed, or, all cancelled, their sent back and stopped summed, the ports named.
 */
export function groupStatus(parts: LandingRow[]): string {
  if (parts.length === 1) return landingStatus(parts[0]!);
  const days = (r: LandingRow): number => r.sails?.days ?? 0;
  const gathering = parts.filter((r) => r.state === 'gathering').sort((a, b) => days(b) - days(a));
  const sailing = parts.filter((r) => r.state === 'sailing').sort((a, b) => (b.lands ?? 0) - (a.lands ?? 0));
  if (gathering.length > 0 && sailing.length === 0) return landingStatus(gathering[0]!);
  if (gathering.length > 0) {
    const d = days(gathering[0]!);
    if (d === 0) return t('landing.group.someNoDays', { at: sailing.length, of: parts.length });
    return t(d === 1 ? 'landing.group.some.one' : 'landing.group.some', { at: sailing.length, of: parts.length, days: d });
  }
  // Some ashore (over), the rest at sea: how many, then the sea's (R52b; critic run 53: "at sea" with one ashore).
  const done = parts.filter((r) => r.state === 'over').length;
  if (sailing.length > 0) {
    const sea = landingStatus(sailing.find((r) => r.held) ?? sailing[0]!);
    return done > 0 ? `${t('landing.group.ashore', { at: done, of: parts.length })}; ${sea}` : sea;
  }
  // Turning back from several ports: each named, the longest days (R52b; critic run 53, R53-N2: "turning back to Tokyo"
  // for Tokyo, Ōsaka and Hiroshima).
  const backs = parts.filter((r) => r.state === 'returning');
  if (backs.length === 1) return landingStatus(backs[0]!);
  if (backs.length > 1) {
    const days = Math.max(0, ...backs.map((r) => r.back ?? 0));
    return landingStatus({ ...backs[0]!, port: [...new Set(backs.map((r) => r.port))].join(', '), ...(days > 0 ? { back: days } : {}) });
  }
  const sum = (f: (r: LandingRow) => number): number => parts.reduce((n, r) => n + f(r), 0);
  // Each part's divisions by where they ended, summed (R50a), told as one landing's.
  const landed = sum((r) => r.outcome?.landed ?? 0);
  const lost = sum((r) => r.outcome?.lost ?? 0);
  const away = sum((r) => r.outcome?.away ?? 0);
  const stayed = sum((r) => r.outcome?.stayed ?? 0);
  const repulsed = sum((r) => r.outcome?.repulsed ?? 0);
  if (landed + lost + away + stayed + repulsed > 0) {
    const kind = landed > 0 ? 'landed' : away > 0 ? 'away' : repulsed > 0 ? 'repulsed' : lost > 0 ? 'lost' : 'sunk';
    return landingStatus({ ...parts[0]!, outcome: { kind, tick: parts[0]!.outcome!.tick, landed, lost, away, stayed, repulsed } });
  }
  if (parts.every((r) => r.outcome?.kind === 'cancelled')) {
    // The ports of those sent back (the others' divisions stopped where they stood).
    const port = parts.filter((r) => (r.outcome?.home ?? 0) > 0).map((r) => r.port).join(', ') || parts[0]!.port;
    const merged: LandingRow = { ...parts[0]!, port, outcome: { kind: 'cancelled', tick: parts[0]!.outcome!.tick, landed: 0, lost: 0, home: sum((r) => r.outcome?.home ?? 0), stopped: sum((r) => r.outcome?.stopped ?? 0), ...(parts.some((r) => r.outcome?.ai) ? { ai: true as const } : {}) } };
    return landingStatus(merged);
  }
  return landingStatus(parts[0]!);
}
