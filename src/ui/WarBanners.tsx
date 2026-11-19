import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
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
/** A banner's name of this many letters or fewer is shown whole however narrow the row (R174); a longer one keeps ~5. */
export const SHORT_NAME = 8;
const ellipses = new Map<string, number>();
/** The drawn width of "…" in a font (R183: 0.9 em was too little, "Quee…" drawn for five letters). */
function ellipsisWidth(font: string): number {
  let w = ellipses.get(font);
  if (w === undefined) {
    const g = document.createElement('canvas').getContext('2d');
    if (g) g.font = font;
    w = g ? g.measureText('…').width : 12;
    ellipses.set(font, w);
  }
  return w;
}
/** The drawn width of a name's first `n` letters (all of them by default). */
function lettersWidth(name: HTMLElement, n = Infinity): number {
  const text = name.firstChild;
  if (!text) return 0;
  const range = document.createRange();
  range.setStart(text, 0);
  range.setEnd(text, Math.min(n, text.textContent?.length ?? 0));
  return range.getBoundingClientRect().width;
}
/**
 * A phone's closed row sized by ADR-1136 (a)'s order (R183; critic run 82, R82-B1: shrunk by the flexbox alike, a
 * name went under five letters while its "& n" stayed, "Sovi… & 3", "Que…"). Each banner measured as it would be with
 * room; if the row is short, the long names give way by what each has to give, down to their first five letters and the
 * ellipsis; if that is not enough, banners drop their allies' counts one at a time, those with a long name first, and
 * the names give way again. Set on the elements: `war-tight` on a banner without its counts, a long name's width.
 */
function sizeRow(row: HTMLElement): void {
  const banners = [...row.querySelectorAll<HTMLElement>('[data-testid=war-banner]')];
  // As with room: nothing tight, no widths, nothing shrinks.
  for (const b of banners) b.classList.remove('war-tight');
  for (const n of row.querySelectorAll<HTMLElement>('[data-testid=war-name]')) n.style.width = '';
  row.classList.add('war-measuring');
  type Name = { el: HTMLElement; full: number; give: number };
  const rows = banners.map((b) => {
    const names: Name[] = [...b.querySelectorAll<HTMLElement>('.war-name:not(.war-name-short)')].map((el) => {
      const full = el.getBoundingClientRect().width;
      const least = Math.min(full, lettersWidth(el, 5) + ellipsisWidth(getComputedStyle(el).font) + 1);
      return { el, full, give: Math.max(0, full - least) };
    });
    const counts = [...b.querySelectorAll<HTMLElement>('[data-testid=war-allies]')].reduce((w, a) => w + a.getBoundingClientRect().width + parseFloat(getComputedStyle(a).marginLeft), 0);
    return { b, names, counts, width: b.getBoundingClientRect().width };
  });
  const children = [...row.children] as HTMLElement[];
  const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
  const others = children.filter((c) => !banners.includes(c)).reduce((w, c) => w + c.getBoundingClientRect().width, 0);
  row.classList.remove('war-measuring');
  let short = rows.reduce((w, r) => w + r.width, 0) + others + gap * Math.max(0, children.length - 1) - row.clientWidth + 1;
  if (short <= 0) return;
  const give = (): number => rows.reduce((w, r) => w + r.names.reduce((v, n) => v + n.give, 0), 0);
  // The counts, while the names cannot give what is short: first those of a banner with a long name (whose names would go
  // under five letters), then the others; the widest first.
  const long = (r: (typeof rows)[number]): number => (r.names.some((n) => n.give > 0) ? 0 : 1);
  for (const r of [...rows].sort((p, q) => long(p) - long(q) || q.counts - p.counts)) {
    if (short <= give() || r.counts === 0) break;
    r.b.classList.add('war-tight');
    short -= r.counts;
  }
  const all = give();
  if (short <= 0 || all <= 0) return;
  const k = Math.min(1, short / all);
  for (const r of rows) for (const n of r.names) n.el.style.width = `${n.full - n.give * k}px`;
}
const hex = (c: number): string => `#${c.toString(16).padStart(6, '0')}`;

/**
 * War banners (PLAN 1.31b): one per active war above the bottom bar, side leaders with their
 * colours, ally counts and a score bar (attackers' share). Clicking selects the attacker leader
 * and brings the war's largest battle into view (`onBattle`, PLAN 2.14e). The swords are lit
 * while the war has a battle to go to and dim while it has none (PLAN 2.14f5b3, ADR-96).
 */
export function WarBanners({ wars, byId, onSelect, onBattle, phone = false, player = 0, tick = 0, world = 0 }: { wars: WarStat[]; byId: Map<number, NationStat>; onSelect: (id: number) => void; onBattle: (war: number) => void; phone?: boolean; /** The nation played, 0 for none: its wars are the first banners (ROADMAP R121). */ player?: number; /** The stats' tick: how long a banner has held its place (ROADMAP R132). */ tick?: number; /** The stats' world number (a new game, a load). */ world?: number }) {
  const [opened, setOpened] = useState(false);
  // Their height, for the ticker to stand above them while they are opened on a phone (R156; R126 had it give way).
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ui = el.parentElement;
    const set = (): void => ui?.style.setProperty('--banners-h', `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  /**
   * The row last drawn for each world and nation played, 0 for none (ROADMAP R132: a place kept for some days once
   * taken). Each its own: a nation released, the row is the one before it was taken (R121); a new world's wars reuse ids.
   */
  const held = useRef(new Map<string, Held[]>());
  /**
   * The banners of the closed row that fit its width, on a desk and (R183) on a phone (R180, critic run 81, R81-N3: at 1024 × 768 three stood
   * past it, over the ticker and under the legend, and "+n" could not be clicked); counted again at each resize and
   * when the number of wars changes.
   */
  const [fit, setFit] = useState(DESK_BANNERS);
  useEffect(() => {
    const again = (): void => setFit(DESK_BANNERS);
    window.addEventListener('resize', again);
    return () => window.removeEventListener('resize', again);
  }, []);
  useEffect(() => setFit(DESK_BANNERS), [wars.length]);
  /**
   * A resize lays the phone's row out again (R183: its sizes are set on the elements, not drawn from the stats); so does
   * a change of the row's own width there (its left and right are set: a panel opened beside it), counting its banners
   * again.
   */
  const [, relay] = useState(0);
  useEffect(() => {
    const again = (): void => relay((n) => n + 1);
    window.addEventListener('resize', again);
    return () => window.removeEventListener('resize', again);
  }, []);
  const rowWidth = useRef(0);
  useEffect(() => {
    const el = root.current;
    if (!el || !phone || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (Math.abs(el.clientWidth - rowWidth.current) < 1) return;
      rowWidth.current = el.clientWidth;
      setFit(DESK_BANNERS);
      relay((n) => n + 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [phone]);
  const shown = opened ? MAX_BANNERS : Math.min(phone ? PHONE_BANNERS : DESK_BANNERS, fit);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if (opened) {
      for (const b of el.querySelectorAll<HTMLElement>('[data-testid=war-banner]')) b.classList.remove('war-tight');
      for (const n of el.querySelectorAll<HTMLElement>('[data-testid=war-name]')) n.style.width = '';
      return;
    }
    if (phone) {
      sizeRow(el);
      // Its names at five letters and its counts gone, a row still past its width shows fewer banners, the rest behind
      // "+n" (R183: on a sideways phone beside a nation's panel the second ran off the screen).
      if (shown > 1 && el.scrollWidth > el.clientWidth + 1) setFit(shown - 1);
      return;
    }
    if (shown <= 1) return;
    if (el.scrollWidth > el.clientWidth + 1) setFit(shown - 1);
  });
  if (wars.length === 0) return null;
  const side = (ids: number[]) => {
    const lead = byId.get(ids[0] ?? 0);
    const name = lead ? displayName(lead.name) : '?';
    const short = [...name].length <= SHORT_NAME;
    return (
      <span class="war-side">
        <span class="chip-swatch" style={{ background: hex(lead?.color ?? 0x777777) }} />
        {/* On one line, a long name cut short and its count whole (R168, critic run 79: "Chukotka Autonomous / Okrug & / 3").
            A short name is never cut, a long one keeps its first letters (R174, critic run 80: on a phone "J… & 2 ⚔ C… & 1"). */}
        <span class={short ? 'war-name war-name-short' : 'war-name'} data-testid="war-name">
          {name}
        </span>
        {/* "& 2", not "+2" beside the score's "+32" (R162, critic run 77). */}
        {ids.length > 1 ? (
          <span class="war-allies" data-testid="war-allies" title={t('wars.sideMore', { name: lead ? displayName(lead.name) : '?', n: ids.length - 1 })}>
            {t('wars.alliesShort', { n: ids.length - 1 })}
          </span>
        ) : null}
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
  /**
   * Why a war goes on at any score (ROADMAP R135; critic run 75: Japan's war in China at −100 for 738 days, and only a
   * peace refused said why): a side fighting to the death makes no peace (SPEC §2: no suit, no offer accepted).
   */
  const deathLine = (w: WarStat): string => {
    const lead = (ids: number[]): string => {
      const n = byId.get(ids[0] ?? 0);
      return n ? displayName(n.name) : '?';
    };
    if (w.toDeath[0] && w.toDeath[1]) return `\n${t('wars.toDeathBoth', { a: lead(w.attackers), d: lead(w.defenders) })}`;
    if (w.toDeath[0] || w.toDeath[1]) return `\n${t('wars.toDeath', { name: lead(w.toDeath[0] ? w.attackers : w.defenders) })}`;
    return '';
  };
  // Opened, a sentence already said on another banner is said short (R172, critic run 79: on a phone three banners of
  // Nationalist Spain's wars said the whole sentence three times, 286 of 844 px).
  const said = new Set<string>();
  const lineOf = new Map<number, string>();
  for (const w of newest) {
    const full = deathLine(w).trim();
    if (!full) continue;
    const lead = (ids: number[]): string => {
      const n = byId.get(ids[0] ?? 0);
      return n ? displayName(n.name) : '?';
    };
    const short = w.toDeath[0] && w.toDeath[1] ? t('wars.toDeathBothAgain', { a: lead(w.attackers), d: lead(w.defenders) }) : t('wars.toDeathAgain', { name: lead(w.toDeath[0] ? w.attackers : w.defenders) });
    lineOf.set(w.id, said.has(full) ? short : full);
    said.add(full);
  }
  return (
    <div ref={root} class={opened ? 'war-banners opened' : 'war-banners'} data-testid="war-banners">
      {newest.map((w) => (
        <button key={w.id} class={w.battle ? 'war-banner' : 'war-banner war-quiet'} data-testid="war-banner" data-war={w.id} data-battle={w.battle ? '1' : '0'} data-death={w.toDeath[0] || w.toDeath[1] ? '1' : '0'} title={`${t('wars.who', { a: sideName(w.attackers), d: sideName(w.defenders) })}
${t(w.score > 0 ? 'wars.scoreAttackers' : w.score < 0 ? 'wars.scoreDefenders' : 'wars.scoreEven', { n: Math.abs(Math.round(w.score)) })}
${t(w.battle ? 'wars.toBattle' : 'wars.noBattle')}${deathLine(w)}`}
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
            {/* A war to the death marked where a phone sees it, not in the title alone (R156, critic run 76). */}
            {w.toDeath[0] || w.toDeath[1] ? (
              <span class="war-death" data-testid="war-death" aria-label={deathLine(w).trim()}>
                {'☠'}
              </span>
            ) : null}
          </span>
          {opened && (w.toDeath[0] || w.toDeath[1]) ? (
            <span class="war-death-line" data-testid="war-death-line">
              {lineOf.get(w.id)}
            </span>
          ) : null}
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
