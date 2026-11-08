import { useState } from 'preact/hooks';
import type { LandingRow } from '../shared/protocol';
import { t } from './i18n';
import { groupStatus, landingStatus } from './landingStatus';
import { voyageText, waitText } from './voyageText';

/** A name sent as '=' + literal, or ''. */
const literal = (s: string): string => (s.startsWith('=') ? s.slice(1) : s);

/** One click's rows (ROADMAP R48f): its landings from several ports, in the order of their ids. */
function byClick(rows: LandingRow[]): LandingRow[][] {
  const out = new Map<number, LandingRow[]>();
  for (const r of rows) {
    const g = out.get(r.click) ?? [];
    g.push(r);
    out.set(r.click, g);
  }
  return [...out.values()];
}

const live = (r: LandingRow): boolean => r.state === 'gathering' || r.state === 'sailing';

/** A part's divisions, each with what its panel says. */
function Divisions({ r, nameOf }: { r: LandingRow; nameOf: (id: number) => string | undefined }) {
  return (
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
  );
}

/** Gathering at its port: how many of it are there, and how far off the last (`waitText`). */
const waitOf = (r: LandingRow): string | null => (r.state === 'gathering' ? waitText(r.divisions.find((d) => d.voyage?.state === 'gathering')?.voyage ?? null) : null);

/**
 * The player's landings, a row each click (ROADMAP R47b, R48f; the critic's idea since run 32, and Hearts of Iron's
 * one plan): where to and from which ports, where it stands, its transports had of those needed while it gathers. A
 * click on a row opens it: each port's landing (where the click made several) and each division with what its panel
 * says (`voyageText`, the same words), the wait at the port, and its one cancel (R47c) for every landing of the click;
 * a click on its mark flies to the land it is for.
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
  /** A landing's cancel (ROADMAP R47c): its divisions aboard to its port, those ashore stopped. */
  onCancel: (row: LandingRow) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  if (rows.length === 0) return null;
  return (
    <section class="landings-bar" data-testid="landings-bar" aria-label={t('landing.bar')}>
      <ol>
        {byClick(rows).map((parts) => {
          const r = parts[0]!;
          const key = r.click;
          const isOpen = open === key;
          const target = literal(r.target);
          const ports = parts.map((p) => p.port).join(', ');
          const many = parts.length > 1;
          const state = parts.every((p) => p.state === 'over') ? 'over' : parts.some((p) => p.state === 'gathering') ? 'gathering' : parts.some((p) => p.state === 'sailing') ? 'sailing' : r.state;
          const kinds = new Set(parts.map((p) => p.outcome?.kind ?? ''));
          const outcome = state !== 'over' ? '' : kinds.size === 1 ? [...kinds][0]! : 'mixed';
          const gathering = parts.filter((p) => p.state === 'gathering');
          const have = gathering.reduce((n, p) => n + p.ships.have, 0);
          const need = gathering.reduce((n, p) => n + p.ships.need, 0);
          const cancellable = parts.filter(live);
          const wait = many ? null : waitOf(r);
          return (
            <li key={key} class={`landing-row ${state}${isOpen ? ' open' : ''}`} data-testid="landing-row" data-landing={r.id} data-parts={parts.length} data-state={state} data-outcome={outcome}>
              <div class="landing-head">
                <button type="button" class="landing-go" data-testid="landing-go" title={t('landing.toLand')} aria-label={t('landing.toLand')} onClick={() => onPlace(r.land[0], r.land[1])}>
                  {'⚓'}
                </button>
                <button type="button" class="landing-toggle" data-testid="landing-toggle" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : key)}>
                  <span class="landing-title" data-testid="landing-title">
                    {target ? t('landing.title', { target, port: ports }) : t('landing.titleNoCity', { port: ports })}
                  </span>
                  <span class="landing-status" data-testid="landing-status">
                    {groupStatus(parts)}
                  </span>
                  {gathering.length > 0 ? (
                    <span class={have < need ? 'landing-ships short' : 'landing-ships'} data-testid="landing-ships">
                      {t('landing.ships', { have, need })}
                    </span>
                  ) : null}
                </button>
                {/* In the head, opened (R48c; critic run 51, R51-N3: at 844 × 390 under the divisions it was in the bar's scroll); one for the click (R48f). */}
                {isOpen && cancellable.length > 0 ? (
                  <button type="button" class="landing-cancel" data-testid="landing-cancel" title={t('landing.cancelTip', { port: cancellable.map((p) => p.port).join(', ') })} onClick={() => cancellable.forEach(onCancel)}>
                    {t('landing.cancel')}
                  </button>
                ) : null}
              </div>
              {isOpen ? (
                <div class="landing-body">
                  {wait ? (
                    <div class="landing-wait" data-testid="landing-wait">
                      {wait}
                    </div>
                  ) : null}
                  {many ? (
                    parts.map((p) => (
                      <div key={p.id} class="landing-part" data-testid="landing-part" data-landing={p.id} data-state={p.state}>
                        <div class="landing-part-head">
                          <span class="landing-part-port">{t('landing.part', { port: p.port })}</span>
                          <span class="landing-part-status" data-testid="landing-part-status">
                            {landingStatus(p)}
                          </span>
                        </div>
                        {waitOf(p) ? (
                          <div class="landing-wait" data-testid="landing-wait">
                            {waitOf(p)}
                          </div>
                        ) : null}
                        <Divisions r={p} nameOf={nameOf} />
                      </div>
                    ))
                  ) : (
                    <Divisions r={r} nameOf={nameOf} />
                  )}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
