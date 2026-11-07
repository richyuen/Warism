import type { LandingRow } from '../shared/protocol';
import { t } from './i18n';

/** What a landing's row says of where it stands (ROADMAP R47b): its days to sail, at sea, turning back, or how it ended. */
export function landingStatus(r: LandingRow): string {
  if (r.state === 'over' && r.outcome) {
    const o = r.outcome;
    if (o.kind === 'landed') return o.lost > 0 ? t('landing.over.landedLost', { n: o.landed, lost: o.lost }) : t('landing.over.landed', { n: o.landed });
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
  if (r.state === 'sailing') return r.lands === undefined ? t('landing.sailing') : t(r.lands === 1 ? 'landing.sailing.one' : 'landing.sailing.days', { days: r.lands });
  if (r.state === 'returning') return t('landing.returning', { port: r.port });
  if (r.sails?.other) return t(r.sails.days === 1 ? 'landing.sibling.one' : 'landing.sibling', { other: r.sails.other, days: r.sails.days });
  if (r.sails) return t(r.sails.days === 1 ? 'landing.sails.one' : 'landing.sails', { days: r.sails.days });
  return t('landing.gathering');
}
