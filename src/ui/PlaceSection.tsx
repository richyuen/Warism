import type { Refusal } from '../shared/commands';
import type { TemplateInfo } from '../shared/protocol';
import { REFUSAL_KEY } from './GodTab';
import { t, type MessageKey } from './i18n';
import { UnitIcon } from './UnitIcon';

/**
 * God Mode's placing (PLAN 7.176b; the Actions tab's until then): the template armed for this
 * nation, the arming of one, and why the sim did not carry out the last command (`Refusal`, 0 = it did).
 */
export interface PlaceProps {
  armed: number | null;
  onArm: (template: number) => void;
  refusal: number;
}

/**
 * "Place at once", in God's tab: each template's button arms it for the panel's nation, and each
 * map click then puts one there at once (a division on any land, a fleet on the water by the
 * click, a wing at an airbase of its), with no gold, training or research.
 */
export function PlaceSection({ templates, place }: { templates: readonly TemplateInfo[]; place: PlaceProps }) {
  return (
    <div class="panel-block" data-testid="god-place">
      <div class="panel-sub" title={t('act.placeHint')}>
        {t('act.place')}
      </div>
      <div class="panel-note">{t('act.placeHint')}</div>
      {place.armed !== null ? (
        <div class="panel-note" data-testid="god-place-armed">
          {t('act.placeArmed', { name: t((templates[place.armed]?.nameKey ?? 'template.infantry_div') as MessageKey) })}
        </div>
      ) : null}
      {place.armed !== null && place.refusal !== 0 && REFUSAL_KEY[place.refusal as Exclude<Refusal, 0>] ? (
        <div class="panel-warn" data-testid="god-place-refusal" role="status">
          {t(REFUSAL_KEY[place.refusal as Exclude<Refusal, 0>])}
        </div>
      ) : null}
      {templates.map((tp, i) =>
        // A hero is never placed (PLAN 7.184).
        tp.hero ? null : (
          <div class="god-row act-template" key={i}>
            <UnitIcon template={tp} onClick={() => place.onArm(i)} pressed={place.armed === i} label={`${t('act.placeButton')}: ${t(tp.nameKey as MessageKey)}`} testId={`god-place-${i}-icon`} />
            <span class="god-war-name">{t(tp.nameKey as MessageKey)}</span>
            <button type="button" class={place.armed === i ? 'god-btn active' : 'god-btn'} data-testid={`god-place-${i}`} onClick={() => place.onArm(i)}>
              {t('act.placeButton')}
            </button>
          </div>
        ),
      )}
    </div>
  );
}
