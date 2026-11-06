import type { ReadonlySignal } from '@preact/signals';
import type { SeaHint } from '../shared/protocol';
import type { MapHover } from './mapHover';
import { displayName } from './NationPanel';
import { t } from './i18n';

/**
 * What is under the mouse (PLAN 7.4f7, the critic's "no tooltip on hover"): the nation's name by
 * the cursor, and who holds the land when another does; over a city's dot (PLAN 7.4f13, the
 * critic's N6, "no city panel") the city first, "capital" when it is one, and its province's
 * unrest. No pointer events: it never takes a click. Given the signal, not its value: a mouse
 * move re-renders this, not the whole HUD.
 */
export function MapTooltip({ hover: signal, nameOf, unrestOf, bySea, seaNeutral, seaOpen, landing }: { hover: ReadonlySignal<MapHover | null>; nameOf: (id: number) => string | null; unrestOf: (province: number) => number | null; bySea?: ReadonlySignal<number>; seaNeutral?: ReadonlySignal<boolean>; seaOpen?: ReadonlySignal<boolean>; landing?: ReadonlySignal<SeaHint | null> }) {
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
    <div class="map-tooltip" data-testid="map-tooltip" style={{ left: `${hover.x + 14}px`, top: `${hover.y + 16}px` }}>
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
          {t('tooltip.bySeaOpen')}
        </div>
      ) : sea && seaNeutral?.value === true ? (
        <div class="map-tooltip-note" data-testid="tooltip-sea-refused">
          {t('tooltip.bySeaNeutral')}
        </div>
      ) : sea && (landing?.value?.marks.length ?? 0) > 1 ? (
        <div class="map-tooltip-note" data-testid="tooltip-by-sea" data-landings={landing!.value!.marks.length}>
          {t('tooltip.bySeaMany', { n: landing!.value!.marks.length })}
        </div>
      ) : sea && landing?.value?.marks[0]?.same === true ? (
        <div class="map-tooltip-note" data-testid="tooltip-by-sea" data-same="1">
          {t('tooltip.bySeaSame')}
        </div>
      ) : sea ? (
        <div class="map-tooltip-note" data-testid="tooltip-by-sea">
          {t('tooltip.bySea')}
        </div>
      ) : null}
    </div>
  );
}
