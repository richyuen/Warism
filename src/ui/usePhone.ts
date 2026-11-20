import { useEffect, useState } from 'preact/hooks';

/**
 * A phone's screen, upright (its width) or on its side (its height; the user's report: in
 * landscape the news filled the view too). The style sheet's `@media (max-width: 600px),
 * (max-height: 500px)`, which this must match.
 */
export const PHONE_QUERY = '(max-width: 600px), (max-height: 500px)';

/**
 * A desk's view too narrow for the legend opened beside the war row (R200, critic run 86, R86-N2: at 680 to 760 px the
 * sea-control legend took 315 px of 700 and no war was shown): there the legend is folded to its title until clicked, at
 * the top left as a phone's (R203, ADR-1140 (b)). The style sheet's `(max-width: 800px)` blocks, which this must match.
 */
export const NARROW_DESK_QUERY = '(max-width: 800px)';

/** Whether the view is a phone's, kept as it changes (a rotation, a resize). */
export function usePhone(): boolean {
  return useMedia(PHONE_QUERY);
}

/** Whether a media query matches, kept as it changes. */
export function useMedia(text: string): boolean {
  const query = typeof window === 'undefined' ? null : window.matchMedia(text);
  const [phone, setPhone] = useState(query?.matches ?? false);
  useEffect(() => {
    if (!query) return;
    const on = (): void => setPhone(query.matches);
    on();
    query.addEventListener('change', on);
    return () => query.removeEventListener('change', on);
  }, []);
  return phone;
}
