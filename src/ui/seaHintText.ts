import type { SeaHint } from '../shared/protocol';
import { t } from './i18n';

/** The tooltip of the landing they already have (`same`), and when it sails where that is over a day off (ROADMAP R42a). */
export function sameText(hint: SeaHint): string {
  const s = hint.sails;
  if (!s) return t('tooltip.bySeaSame');
  const one = s.days === 1 ? '.one' : '';
  return s.other !== undefined ? t(`tooltip.bySeaSameSibling${one}`, { port: s.port, days: s.days, other: s.other }) : t(`tooltip.bySeaSameWait${one}`, { port: s.port, days: s.days });
}
