import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { NationStat, WarStat } from '../shared/protocol';
import { bannerOrder, heldRow, rowStand, type Held, type RowStand } from './bannerOrder';
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
 * room; if the row is short, by ADR-1144 (b) (the user's choice, R213), the longest names give way first, each down
 * to its first word and the ellipsis at most (R193's one cap); if that is not enough, banners drop their allies'
 * counts one at a time, those with a long name first; only then do the names go on down to their first five letters.
 * Set on the elements: `war-tight` on a banner without its counts, a long name's width.
 */
function sizeRow(row: HTMLElement): void {
  const banners = [...row.querySelectorAll<HTMLElement>('[data-testid=war-banner]')];
  // As with room: nothing tight, no widths, nothing shrinks.
  for (const b of banners) b.classList.remove('war-tight');
  for (const n of row.querySelectorAll<HTMLElement>('[data-testid=war-name]')) n.style.width = '';
  row.classList.add('war-measuring');
  // `give`: down to its first five letters; `word`: down to its first word, when that is longer (ADR-1144 (b)).
  type Name = { el: HTMLElement; full: number; give: number; word: number };
  const rows = banners.map((b) => {
    const names: Name[] = [...b.querySelectorAll<HTMLElement>('.war-name:not(.war-name-short)')].map((el) => {
      const full = el.getBoundingClientRect().width;
      const dots = ellipsisWidth(getComputedStyle(el).font) + 1;
      const least = Math.min(full, lettersWidth(el, 5) + dots);
      const first = (el.textContent ?? '').search(/\s/);
      const whole = first < 0 ? full : Math.min(full, Math.max(least, lettersWidth(el, first) + dots));
      return { el, full, give: Math.max(0, full - least), word: Math.max(0, full - whole) };
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
  const names = rows.flatMap((r) => r.names);
  const give = (): number => names.reduce((v, n) => v + n.give, 0);
  // What the names give without one cut inside its first word ("Nationalist…", "Soviet…").
  const byWord = names.reduce((v, n) => v + n.word, 0);
  // The counts, while the names cannot give what is short by their words (ADR-1144 (b), the user's choice; R213, critic
  // runs 88 and 89: by ADR-1136 (a)'s order the names went to five letters with the counts whole, "Natio… ⚔ Portugal & 2"
  // beside "Natio… & 1 ⚔ Italy & 2"): first those of a banner with a long name, then the others; the widest first.
  const long = (r: (typeof rows)[number]): number => (r.names.some((n) => n.give > 0) ? 0 : 1);
  for (const r of [...rows].sort((p, q) => long(p) - long(q) || q.counts - p.counts)) {
    if (short <= byWord) break;
    if (r.counts === 0) continue;
    r.b.classList.add('war-tight');
    short -= r.counts;
  }
  if (short <= 0 || give() <= 0) return;
  // Down to their first words while that is enough; with every count gone and the row still short, to five letters.
  const floor = (n: Name): number => n.full - (short <= byWord ? n.word : n.give);
  // The longest give way first (R193, critic run 83's design objection: shrunk in proportion, "Kagosh…" lost as much as
  // "Chukotka Auton…"): one cap for every long name, each kept to its floor; the highest cap that fits.
  const at = (cap: number): number => names.reduce((w, n) => w + Math.max(0, n.full - Math.max(floor(n), cap)), 0);
  let [lo, hi] = [0, Math.max(...names.map((n) => n.full))];
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (at(mid) >= short) lo = mid;
    else hi = mid;
  }
  for (const n of names) if (n.full > lo) n.el.style.width = `${Math.max(floor(n), lo)}px`;
}
/**
 * The band a desk's row has free (R197, critic run 85, R85-N1: its `max-width` kept room for a left panel that was not
 * open, 16 px at 640, and the row showed "+3" alone): between the nearest of the page's boxes beside it at its height (the
 * news, the legend, an open panel), its centre and width in the page's px; null when one stands across the page's centre.
 */
type Band = { mid: number; width: number; centre: number; even: number };
function freeBand(row: HTMLElement): Band | null {
  const ui = row.parentElement;
  if (!ui) return null;
  const foot = row.getBoundingClientRect().bottom;
  // A banner's height above the row's foot, whatever the row holds now (R200: with "+n" alone the row was 19 px high,
  // the legend's foot above it, and the banner came back over the legend's corner by 3 px).
  const at = { top: foot - 32, bottom: foot };
  const page = ui.getBoundingClientRect();
  const cx = page.left + page.width / 2;
  let [left, right] = [page.left, page.right];
  for (const c of ui.children) {
    if (c === row) continue;
    const b = c.getBoundingClientRect();
    // An open panel at any height, the row right of it as its rule has it (PLAN 3.12Rh4); the rest at the row's height.
    const panel = c.matches('[class*="panel"]');
    if (b.width === 0 || b.height === 0 || (!panel && (b.bottom <= at.top || b.top >= at.bottom))) continue;
    if (b.right <= cx) left = Math.max(left, b.right);
    else if (b.left >= cx) right = Math.min(right, b.left);
    else return null;
  }
  // 4 px clear of each neighbour (at 8 a 601 px desk had 6 px too few for "Germany ⚔ Poland" and its "+2").
  const gap = 4;
  // `even`: the width free on both sides of the page's centre alike, where the bar's centre is (R202).
  const even = Math.max(0, 2 * Math.min(cx - left, right - cx) - 2 * gap);
  return { mid: (left + right) / 2 - page.left, width: Math.max(0, right - left - 2 * gap), centre: cx - page.left, even };
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
  /** The desk row's free width last measured: when it changes (a panel opened or closed), its banners are counted again (R197). */
  const room = useRef(-1);
  /** The side the desk's row took, held while its band and its banners' number hold (R204, `rowStand`). */
  const stand = useRef<RowStand | null>(null);
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
  // A window that turns a phone's or a desk's: its banners counted again (R189, critic run 83, R83-B1: counted down on the
  // way, while still a desk's, the phone's row kept 1 banner where 2 fit; its observer saw the width it had last seen).
  useEffect(() => {
    setFit(DESK_BANNERS);
    relay((n) => n + 1);
  }, [phone]);
  useEffect(() => {
    const el = root.current;
    if (!el || !phone || typeof ResizeObserver === 'undefined') return;
    rowWidth.current = -1;
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
    // What `sizeRow` set is a phone's closed row's alone: opened or on a desk it goes (R189, R83-B1: back on a desk
    // "Nationalist Sp…" kept the phone's width with room to spare).
    el.style.maxWidth = '';
    el.style.left = '';
    let free: Band | null = null;
    let rule = Infinity;
    // On the bar's centre when the banners the band holds fit there too (R202, critic run 86's design objection: centred
    // in the band, the row stood 16 to 44 px off the bar's centre and moved 68 px with the map mode): the band's middle
    // only when the centre would cost a banner (a narrow desk, R197). The side chosen is held while the band and the
    // number of banners hold (R204, `rowStand`: chosen at each draw, the row jumped when a name on it changed).
    const steady = (): void => {
      if (free === null || free.width <= rule) {
        stand.current = null;
        return;
      }
      const even = Math.floor(free.even);
      const banners = el.querySelectorAll('[data-testid=war-banner]').length;
      const r = rowStand(stand.current, free, banners, el.scrollWidth <= even);
      stand.current = r.stand;
      if (r.stand.side === 'band') {
        // The band as it was when the side was taken: its edges' px of slack do not walk the row.
        el.style.left = `${r.stand.mid}px`;
        return;
      }
      el.style.maxWidth = `${even}px`;
      el.style.left = `${free.centre}px`;
      if (r.drop) setFit(banners - 1);
    };
    if (opened || phone) stand.current = null;
    if (!opened && !phone) {
      // A desk's closed row in the band free beside it, if that is wider than its rule's room (R197).
      free = freeBand(el);
      rule = parseFloat(getComputedStyle(el).maxWidth);
      if (free !== null && !(free.width <= rule)) {
        // Whole px: a fraction rounded the row's width down and left its last 1 px past it (85905 at 680).
        el.style.maxWidth = `${Math.floor(free.width)}px`;
        el.style.left = `${free.mid}px`;
      }
      const now = Math.round(free ? free.width + free.mid / 1000 : -2);
      if (Math.abs(now - room.current) > 1) {
        const first = room.current === -1;
        room.current = now;
        if (!first && fit < DESK_BANNERS) {
          setFit(DESK_BANNERS);
          return;
        }
      }
    }
    if (opened || !phone) {
      el.classList.remove('war-sized');
      for (const b of el.querySelectorAll<HTMLElement>('[data-testid=war-banner]')) b.classList.remove('war-tight');
      for (const n of el.querySelectorAll<HTMLElement>('[data-testid=war-name]')) n.style.width = '';
    }
    if (opened) return;
    if (phone) {
      sizeRow(el);
      // Its names at five letters and its counts gone, a row still past its width shows fewer banners, the rest behind
      // "+n" (R183: on a sideways phone beside a nation's panel the second ran off the screen).
      if (shown > 1 && el.scrollWidth > el.clientWidth + 1) setFit(shown - 1);
      return;
    }
    el.classList.remove('war-sized');
    if (shown <= 1) {
      // A desk's row too narrow for its one banner (a window 600 to 770 px wide, between the news and the legend): its
      // names give way as a phone's do; past that, "+n" alone (R194, critic run 84, R84-N1: the banner 220 px wide in a
      // row of 90 to 170, over the ticker's second row by up to 56 px).
      if (shown === 1 && el.scrollWidth > el.clientWidth) {
        el.classList.add('war-sized');
        sizeRow(el);
        if (el.scrollWidth > el.clientWidth) {
          setFit(0);
          return;
        }
      }
      steady();
      return;
    }
    if (el.scrollWidth > el.clientWidth) setFit(shown - 1);
    else steady();
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
