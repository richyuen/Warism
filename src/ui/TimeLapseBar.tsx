import { useEffect, useState } from 'preact/hooks';
import { dateOfTick } from '../shared/calendar';
import type { TimeLapsePlayer } from '../shared/timeLapse';
import { t, type MessageKey } from './i18n';

/** A step's time on the screen while the time-lapse plays: ten months a second, fifty years in a minute. */
export const LAPSE_STEP_MS = 100;

export interface TimeLapseBarProps {
  player: TimeLapsePlayer;
  /** The step on show (the hud's signal). */
  step: number;
  startDay: number;
  onSeek: (i: number) => void;
  onClose: () => void;
}

/**
 * The borders' time-lapse (ROADMAP R143b): play and pause, a slider over its months from the record's start to now, the
 * month on show, and close. Played from the start when played at the end.
 */
export function TimeLapseBar({ player, step, startDay, onSeek, onClose }: TimeLapseBarProps) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let raf = 0;
    let at = step >= player.steps ? 0 : step;
    if (at !== step) onSeek(at);
    const frame = (now: number): void => {
      const n = Math.floor((now - last) / LAPSE_STEP_MS);
      if (n > 0) {
        last += n * LAPSE_STEP_MS;
        at = Math.min(player.steps, at + n);
        onSeek(at);
        if (at >= player.steps) {
          setPlaying(false);
          return;
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
  const d = dateOfTick(startDay, player.data.ticks[step] ?? 0);
  return (
    <div class="time-lapse" data-testid="time-lapse" data-step={step} data-steps={player.steps}>
      <button type="button" class="bar-btn" data-testid="time-lapse-play" aria-pressed={playing} onClick={() => setPlaying(!playing)}>
        {playing ? t('timeLapse.pause') : t('timeLapse.play')}
      </button>
      <input
        type="range"
        class="time-lapse-slider"
        data-testid="time-lapse-slider"
        aria-label={t('timeLapse.title')}
        min={0}
        max={player.steps}
        step={1}
        value={step}
        onInput={(e) => {
          setPlaying(false);
          onSeek(Number((e.currentTarget as HTMLInputElement).value));
        }}
      />
      <span class="time-lapse-date" data-testid="time-lapse-date">
        {t(`month.${d.month}` as MessageKey)} {d.year}
      </span>
      <button type="button" class="panel-close" data-testid="time-lapse-close" aria-label={t('panel.close')} onClick={onClose}>
        ×
      </button>
    </div>
  );
}
