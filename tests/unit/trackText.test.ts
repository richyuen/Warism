import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { trackText } from '../../src/ui/historyText';

// ROADMAP R156 (critic run 76's small things): rows of History that were a bare place name ("31 December 1941 Northern
// Malaya", "↳ Davao", "Hong Kong"): the historical track's note alone. A bare note is told by its timeline's kind.

// A row's nation is a message key or `=` and a name (`displayName`).
const row = (trackKind: string, note: string, name = 'Japan') => ({ kind: EventKind.TrackEvent, trackKind, note, bn: name ? `=${name}` : '' });

describe("a track row whose note is a bare place says what happened there (ROADMAP R156)", () => {
  it('occupy, objective, nuke and a nation joining an alliance', () => {
    expect(trackText(row('occupy', 'Northern Malaya'))).toBe('Japan occupies Northern Malaya');
    expect(trackText(row('objective', 'Warsaw', 'Germany'))).toBe("Germany's objective: Warsaw");
    expect(trackText(row('nuke', 'Hiroshima', 'United States'))).toBe('United States strikes Hiroshima');
    expect(trackText(row('allianceJoin', 'Romania', 'Germany'))).toBe('Romania joins the alliance');
  });

  it('a note that says itself, another kind, or no nation: the note as it is', () => {
    expect(trackText(row('occupy', "Japan's occupation: North China"))).toBe("Japan's occupation: North China");
    expect(trackText(row('occupy', 'Japan in Manchuria'))).toBe('Japan in Manchuria');
    expect(trackText(row('annex', 'The Anschluss', 'Germany'))).toBe('The Anschluss');
    expect(trackText(row('occupy', 'Davao', ''))).toBe('Davao');
    expect(trackText({ kind: EventKind.TrackEvent, note: 'Northern Luzon', bn: '=Japan' })).toBe('Northern Luzon');
  });
});
