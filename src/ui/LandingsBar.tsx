import { useState } from 'preact/hooks';
import type { LandingRow } from '../shared/protocol';
import { t } from './i18n';
import { voyageText, waitText } from './voyageText';

/** A name sent as '=' + literal, or ''. */
const literal = (s: string): string => (s.startsWith('=') ? s.slice(1) : s);

/** What a landing's row says of where it stands (ROADMAP R47b): its days to sail, at sea, turning back, or how it ended. */
export function landingStatus(r: LandingRow): string {
  if (r.state === 'over' && r.outcome) {
    const o = r.outcome;
    if (o.kind === 'landed') return o.lost > 0 ? t('landing.over.landedLost', { n: o.landed, lost: o.lost }) : t('landing.over.landed', { n: o.landed });
    if (o.kind === 'cancelled') return t('landing.over.cancelled', { port: r.port });
    return t(`landing.over.${o.kind}`);
  }
  if (r.state === 'sailing') return t('landing.sailing');
  if (r.state === 'returning') return t('landing.returning', { port: r.port });
  if (r.sails?.other) return t(r.sails.days === 1 ? 'landing.sibling.one' : 'landing.sibling', { other: r.sails.other, days: r.sails.days });
  if (r.sails) return t(r.sails.days === 1 ? 'landing.sails.one' : 'landing.sails', { days: r.sails.days });
  return t('landing.gathering');
}

/**
 * The player's landings, a row each (ROADMAP R47b; the critic's idea since run 32): where to and from which port, where
 * it stands, its transports had of those needed while it gathers. A click on a row opens it: each division with what its
 * panel says (`voyageText`, the same words), the wait at the port, and its cancel (R47c); a click on its mark flies to
 * the land it is for.
 * Top middle, under the bar of the top; a phone's width, the whole width less its gutters. None without a landing.
 */
export function LandingsBar({
  rows,
  nameOf,
  onPlace,
  onCancel,
}: {
  rows: LandingRow[];
  nameOf: (id: number) => string | undefined;
  onPlace: (x: number, y: number) => void;
  /** Its cancel (ROADMAP R47c): its divisions ordered to its port's cell, as a click there orders them. */
  onCancel: (row: LandingRow) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  if (rows.length === 0) return null;
  return (
    <section class="landings-bar" data-testid="landings-bar" aria-label={t('landing.bar')}>
      <ol>
        {rows.map((r) => {
          const isOpen = open === r.id;
          const target = literal(r.target);
          const wait = r.state === 'gathering' ? waitText(r.divisions.find((d) => d.voyage?.state === 'gathering')?.voyage ?? null) : null;
          return (
            <li key={r.id} class={`landing-row ${r.state}${isOpen ? ' open' : ''}`} data-testid="landing-row" data-landing={r.id} data-state={r.state} data-outcome={r.outcome?.kind ?? ''}>
              <div class="landing-head">
                <button type="button" class="landing-go" data-testid="landing-go" title={t('landing.toLand')} aria-label={t('landing.toLand')} onClick={() => onPlace(r.land[0], r.land[1])}>
                  {'⚓'}
                </button>
                <button type="button" class="landing-toggle" data-testid="landing-toggle" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : r.id)}>
                  <span class="landing-title" data-testid="landing-title">
                    {target ? t('landing.title', { target, port: r.port }) : t('landing.titleNoCity', { port: r.port })}
                  </span>
                  <span class="landing-status" data-testid="landing-status">
                    {landingStatus(r)}
                  </span>
                  {r.state === 'gathering' ? (
                    <span class={r.ships.have < r.ships.need ? 'landing-ships short' : 'landing-ships'} data-testid="landing-ships">
                      {t('landing.ships', { have: r.ships.have, need: r.ships.need })}
                    </span>
                  ) : null}
                </button>
              </div>
              {isOpen ? (
                <div class="landing-body">
                  {wait ? (
                    <div class="landing-wait" data-testid="landing-wait">
                      {wait}
                    </div>
                  ) : null}
                  <ul>
                    {r.divisions.map((d) => (
                      <li key={d.id} data-testid="landing-division" data-formation={d.id} data-voyage={d.voyage?.state ?? ''}>
                        <span class="landing-division-name">{nameOf(d.id) ?? `#${d.id}`}</span>
                        <span class="landing-division-voyage" data-testid="landing-division-voyage">
                          {d.voyage ? voyageText(d.voyage) : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {r.state === 'gathering' || r.state === 'sailing' ? (
                    <button type="button" class="landing-cancel" data-testid="landing-cancel" title={t('landing.cancelTip', { port: r.port })} onClick={() => onCancel(r)}>
                      {t('landing.cancel')}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
