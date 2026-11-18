import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { NATIONS_1938 } from '../../src/sim/scenario1938';
import { bareNote, trackText } from '../../src/ui/historyText';
import { t, type MessageKey } from '../../src/ui/i18n';

// ROADMAP R156 (critic run 76's small things): rows of History that were a bare place name ("31 December 1941 Northern
// Malaya", "↳ Davao", "Hong Kong"): the historical track's note alone. A bare note is told by its timeline's kind.
// R159 (critic run 77, R77-N2): "{nation} occupies" went before notes that were sentences ("Kerch retaken", "The line of
// 1941-12-01"); now only a note that is a bare place is told, judged on the timeline's own notes.

// A row's nation is a message key or `=` and a name (`displayName`).
const row = (trackKind: string, note: string, name = 'Japan') => ({ kind: EventKind.TrackEvent, trackKind, note, bn: name ? `=${name}` : '' });

describe("a track row whose note is a bare place says what happened there (ROADMAP R156, R159)", () => {
  it('occupy, objective, nuke, transfer, and a nation joining an alliance or a war', () => {
    expect(trackText(row('occupy', 'Northern Malaya'))).toBe('Japan occupies Northern Malaya');
    expect(trackText(row('occupy', 'The Philippines'))).toBe('Japan occupies the Philippines');
    expect(trackText(row('objective', 'Warsaw', 'Germany'))).toBe("Germany's objective: Warsaw");
    expect(trackText(row('nuke', 'Hiroshima', 'United States'))).toBe('United States strikes Hiroshima');
    expect(trackText(row('transfer', 'Dalmatia', 'Italy'))).toBe('Dalmatia to Italy');
    expect(trackText(row('allianceJoin', 'Romania', 'Romania'))).toBe('Romania joins the alliance');
    expect(trackText(row('join', 'Romania', 'Romania'))).toBe('Romania joins the war');
  });

  it('a sentence, a name with a colon, a direction, or another kind: the note as it is', () => {
    for (const [kind, note] of [
      ['occupy', 'Kerch retaken'],
      ['occupy', 'The line of 1941-12-01'],
      ['occupy', 'The Red Army leaves Manchuria'],
      ['occupy', 'Egypt clear'],
      ['occupy', 'Torch: Morocco'],
      ['occupy', 'To El Alamein'],
      ['allianceJoin', "Thailand's alliance with Japan"],
      ['join', 'The Continuation War'],
      ['annex', 'The Anschluss'],
      ['war', 'Barbarossa'],
    ] as const)
      expect(trackText(row(kind, note, 'Germany')), `${kind}: ${note}`).toBe(note);
    expect(trackText(row('occupy', 'Davao', ''))).toBe('Davao');
    expect(trackText(row('occupy', 'Indochina', 'French Indochina'))).toBe('Indochina');
    expect(trackText({ kind: EventKind.TrackEvent, note: 'Northern Luzon', bn: '=Japan' })).toBe('Northern Luzon');
  });

  it("every note of the 1938 timeline: a sentence kept as written, a told one's place whole", () => {
    const file = path.resolve(import.meta.dirname, '../../data/scenarios/1938h/timeline.json');
    const json = JSON.parse(readFileSync(file, 'utf8')) as { events?: Record<string, unknown>[] } | Record<string, unknown>[];
    const events = Array.isArray(json) ? json : (json.events ?? []);
    const nameOf = (tag: unknown): string => {
      const n = NATIONS_1938.find((d) => d.tag === tag);
      return n ? t(n.nameKey as MessageKey) : String(tag ?? '');
    };
    const actor: Record<string, string> = { occupy: 'by', transfer: 'to', objective: 'nation', nuke: 'nation', join: 'nation', allianceJoin: 'nation' };
    let told = 0;
    for (const e of events) {
      const note = typeof e['note'] === 'string' ? e['note'] : '';
      if (!note) continue;
      const kind = String(e['kind']);
      const name = nameOf(e[actor[kind] ?? 'nation']);
      const out = trackText(row(kind, note, name));
      if (!bareNote(note)) {
        expect(out, `${kind}: "${note}" is a sentence, kept`).toBe(note);
        continue;
      }
      if (out === note) continue;
      told++;
      // A told row has its place whole, and no capital "The" inside it.
      expect(out, `${kind}: "${note}"`).toContain(note.replace(/^The /, 'the '));
      expect(out.slice(1), `${kind}: "${note}" told as "${out}"`).not.toMatch(/\bThe\b/);
    }
    expect(told, 'bare notes told').toBeGreaterThan(50);
  });
});
