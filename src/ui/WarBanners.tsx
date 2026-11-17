import { useRef, useState } from 'preact/hooks';
import type { NationStat, WarStat } from '../shared/protocol';
import { bannerOrder, heldRow, type Held } from './bannerOrder';
import { t } from './i18n';
import { displayName } from './NationPanel';

/**
 * Banners shown, the rest a "+N" (PLAN 7.4f6, the critic's N16): at 8 they stood three rows deep
 * over the map at 1400 px; 6 are two rows there and one or two wider.
 */
export const MAX_BANNERS = 6;
/** Banners on a phone's width (the user's choice of 2026-10-29, ADR-760): one row; "+N" opens the rest, up to MAX_BANNERS. */
export const PHONE_BANNERS = 2;
/**
 * Banners on a desk until "+N" opens the rest (ROADMAP R110, ADR-1101): one row. At MAX_BANNERS they stood two rows
 * deep over the map, with the ticker and the bar a fifth of the view's height in a year of wars.
 */
export const DESK_BANNERS = 3;
const hex = (c: number): string => `#${c.toString(16).padStart(6, '0')}`;

/**
 * War banners (PLAN 1.31b): one per active war above the bottom bar, side leaders with their
 * colours, ally counts and a score bar (attackers' share). Clicking selects the attacker leader
 * and brings the war's largest battle into view (`onBattle`, PLAN 2.14e). The swords are lit
 * while the war has a battle to go to and dim while it has none (PLAN 2.14f5b3, ADR-96).
 */
export function WarBanners({ wars, byId, onSelect, onBattle, phone = false, player = 0, tick = 0, world = 0 }: { wars: WarStat[]; byId: Map<number, NationStat>; onSelect: (id: number) => void; onBattle: (war: number) => void; phone?: boolean; /** The nation played, 0 for none: its wars are the first banners (ROADMAP R121). */ player?: number; /** The stats' tick: how long a banner has held its place (ROADMAP R132). */ tick?: number; /** The stats' world number (a new game, a load). */ world?: number }) {
  const [opened, setOpened] = useState(false);
  /**
   * The row last drawn for each world and nation played, 0 for none (ROADMAP R132: a place kept for some days once
   * taken). Each its own: a nation released, the row is the one before it was taken (R121); a new world's wars reuse ids.
   */
  const held = useRef(new Map<string, Held[]>());
  if (wars.length === 0) return null;
  const shown = opened ? MAX_BANNERS : phone ? PHONE_BANNERS : DESK_BANNERS;
  const side = (ids: number[]) => {
    const lead = byId.get(ids[0] ?? 0);
    return (
      <span class="war-side">
        <span class="chip-swatch" style={{ background: hex(lead?.color ?? 0x777777) }} />
        {lead ? displayName(lead.name) : '?'}
        {ids.length > 1 ? <span class="war-allies">+{ids.length - 1}</span> : null}
      </span>
    );
  };
  // Which wars the one row is for (ROADMAP R121; critic run 73, R73-N1): the played nation's own first; then a war
  // fought in the last days (R130, R132: by the sides' men alone three quiet wars held the row and Japan's war in China
  // was behind "+3"; by the hour's battle the row changed places by the second); then the largest, then the newest.
  const ranked = bannerOrder(wars, byId, player);
  // A war that took its place keeps it some days (R132: the row changed 12 times a minute at ×5 by the order alone).
  const key = `${world}:${player}`;
  const row = heldRow(ranked, shown, tick, held.current.get(key) ?? [], player);
  held.current.set(key, row);
  const byWar = new Map(wars.map((w) => [w.id, w]));
  const newest = row.map((h) => byWar.get(h.id)!);
  /** A side in words: its leader, and how many more (the banner's title; ROADMAP R115). */
  const sideName = (ids: number[]): string => {
    const lead = byId.get(ids[0] ?? 0);
    const name = lead ? displayName(lead.name) : '?';
    return ids.length > 1 ? t('wars.sideMore', { name, n: ids.length - 1 }) : name;
  };
  return (
    <div class={opened ? 'war-banners opened' : 'war-banners'} data-testid="war-banners">
      {newest.map((w) => (
        <button key={w.id} class={w.battle ? 'war-banner' : 'war-banner war-quiet'} data-testid="war-banner" data-war={w.id} data-battle={w.battle ? '1' : '0'} title={`${t('wars.who', { a: sideName(w.attackers), d: sideName(w.defenders) })}
${t(w.score > 0 ? 'wars.scoreAttackers' : w.score < 0 ? 'wars.scoreDefenders' : 'wars.scoreEven', { n: Math.abs(Math.round(w.score)) })}
${t(w.battle ? 'wars.toBattle' : 'wars.noBattle')}`}
          onClick={() => {
            onSelect(w.attackers[0] ?? 0);
            onBattle(w.id);
          }}
        >
          <span class="war-title">
            {side(w.attackers)}
            <span class="war-swords">{'⚔'}</span>
            {side(w.defenders)}
            <span class="war-score-n" data-testid="war-score-n">{Math.round(w.score) > 0 ? `+${Math.round(w.score)}` : String(Math.round(w.score))}</span>
          </span>
          <span class="war-score">
            <span class="war-score-fill" style={{ width: `${Math.max(0, Math.min(100, 50 + w.score / 2))}%` }} />
            <span class="war-score-mid" />
          </span>
        </button>
      ))}
      {opened || wars.length > shown ? (
        <button type="button" class="war-more war-more-btn" data-testid="war-more" aria-expanded={opened} title={t(opened ? 'wars.fewer' : 'wars.more')} onClick={() => setOpened(!opened)}>
          {opened ? '−' : `+${wars.length - shown}`}
        </button>
      ) : null}
    </div>
  );
}
