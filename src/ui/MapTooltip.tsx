import type { ReadonlySignal } from '@preact/signals';
import type { SeaHint } from '../shared/protocol';
import type { MapHover } from './mapHover';
import { displayName } from './NationPanel';
import { t } from './i18n';
import { sameText } from './seaHintText';

/**
 * What is under the mouse (PLAN 7.4f7, the critic's "no tooltip on hover"): the nation's name by
 * the cursor, and who holds the land when another does; over a city's dot (PLAN 7.4f13, the
 * critic's N6, "no city panel") the city first, "capital" when it is one, and its province's
 * unrest. No pointer events: it never takes a click. Given the signal, not its value: a mouse
 * move re-renders this, not the whole HUD.
 */
/** Where the tooltip goes: right of and below the mouse, its width within the screen (ROADMAP R38c; critic run 46,
 * R46-N2: a note 546 px wide on a 390-px phone). At least 200 px wide: nearer the right edge it moves left. Within
 * FLIP_PX of the screen's bottom it stands above the mouse (ROADMAP R39c; critic run 47, R47-N2: 871-957 px on a
 * 900-px screen, over the bottom bar). */
function place(x: number, y: number): Record<string, string> {
  const screen = typeof window === 'undefined' ? 1600 : window.innerWidth;
  const tall = typeof window === 'undefined' ? 900 : window.innerHeight;
  const room = Math.min(360, screen - 16);
  let left = x + 14;
  if (screen - left - 8 < Math.min(200, room)) left = Math.max(8, screen - 8 - Math.min(200, room));
  const at = y + 16 + FLIP_PX > tall ? { bottom: `${Math.max(8, tall - y + 8)}px` } : { top: `${y + 16}px` };
  return { left: `${left}px`, ...at, maxWidth: `${Math.min(room, screen - left - 8)}px` };
}

/** The room below the mouse the tooltip needs, else it stands above (R39c): its tallest, a city with notes. */
const FLIP_PX = 180;

export function MapTooltip({ hover: signal, nameOf, unrestOf, bySea, seaNeutral, seaOpen, seaAshore, seaPlain, landing, tapAgain }: { hover: ReadonlySignal<MapHover | null>; nameOf: (id: number) => string | null; unrestOf: (province: number) => number | null; bySea?: ReadonlySignal<number>; seaNeutral?: ReadonlySignal<boolean>; seaOpen?: ReadonlySignal<boolean>; seaAshore?: ReadonlySignal<boolean>; seaPlain?: ReadonlySignal<boolean>; landing?: ReadonlySignal<SeaHint | null>; tapAgain?: ReadonlySignal<boolean> }) {
  const hover = signal.value;
  const sea = bySea !== undefined && hover !== null && hover.cell >= 0 && bySea.value === hover.cell;
  if (!hover) return null;
  const owner = hover.owner !== 0 ? nameOf(hover.owner) : null;
  const holder = hover.holder !== 0 ? nameOf(hover.holder) : null;
  const name = owner ?? holder;
  // The sea, with a landing at sea selected (ROADMAP R36b): why a click there is refused.
  const open = sea && seaOpen?.value === true;
  if (!name && !hover.city && !open) return null;
  const unrest = hover.city && hover.province !== 0 ? unrestOf(hover.province) : null;
  return (
    <div class="map-tooltip" data-testid="map-tooltip" style={place(hover.x, hover.y)}>
      {hover.city ? (
        <div class="map-tooltip-name" data-testid="tooltip-city">
          {hover.city.name}
          {hover.city.capital ? <span class="map-tooltip-note"> · {t('tooltip.capital')}</span> : null}
        </div>
      ) : null}
      {name ? <div class={hover.city ? 'map-tooltip-nation' : 'map-tooltip-name'}>{displayName(name)}</div> : null}
      {owner && holder && hover.holder !== hover.owner ? <div class="map-tooltip-note">{t('tooltip.occupiedBy', { name: displayName(holder) })}</div> : null}
      {unrest !== null ? <div class="map-tooltip-nation" data-testid="tooltip-unrest">{t('tooltip.unrest', { n: Math.round(unrest) })}</div> : null}
      {open ? (
        <div class="map-tooltip-note" data-testid="tooltip-sea-open">
          {t(seaPlain?.value === true ? 'tooltip.bySeaOpenPlain' : seaAshore?.value === true ? 'tooltip.bySeaOpenAshore' : 'tooltip.bySeaOpen')}
        </div>
      ) : sea && seaNeutral?.value === true ? (
        <div class="map-tooltip-note" data-testid="tooltip-sea-refused">
          {t('tooltip.bySeaNeutral')}
        </div>
      ) : sea && landing?.value?.rejoin !== undefined ? (
        <div class="map-tooltip-note" data-testid="tooltip-by-sea" data-rejoin="1">
          {t('tooltip.bySeaRejoin', { port: landing.value.rejoin })}
        </div>
      ) : sea && (landing?.value?.marks.length ?? 0) > 1 ? (
        <div class="map-tooltip-note" data-testid="tooltip-by-sea" data-landings={landing!.value!.marks.length}>
          {t('tooltip.bySeaMany', { n: landing!.value!.marks.length })}
        </div>
      ) : sea && landing?.value?.marks[0]?.same === true ? (
        <div class="map-tooltip-note" data-testid="tooltip-by-sea" data-same="1" data-days={landing.value.sails?.days}>
          {sameText(landing.value)}
        </div>
      ) : sea ? (
        <div class="map-tooltip-note" data-testid="tooltip-by-sea">
          {t('tooltip.bySea')}
        </div>
      ) : null}
      {sea && tapAgain?.value ? (
        // A tap's (ROADMAP R34k3, ADR-849): the first shows, a second there orders.
        <div class="map-tooltip-note" data-testid="tooltip-tap-again">
          {t('tooltip.tapAgain')}
        </div>
      ) : null}
    </div>
  );
}
