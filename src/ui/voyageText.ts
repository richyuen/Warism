import type { FormationDetail } from '../shared/protocol';
import { t } from './i18n';

type Voyage = NonNullable<FormationDetail['voyage']>;

/**
 * What a division's voyage over the sea says (ROADMAP R17c, R22c, R42a): marching to its port (with its days), waiting
 * there, gathering, ready, waiting for a sibling landing, at sea, sailing back, landed. Its panel's status line, and its
 * line in its landing's row (R47b): the two say the same.
 */
export function voyageText(voyage: Voyage): string {
  if (voyage.state === 'sibling') return t(voyage.days === 1 ? 'formation.voyage.sibling.one' : 'formation.voyage.sibling', { port: voyage.port ?? '', other: voyage.other ?? '', days: voyage.days ?? 1 });
  if (voyage.state === 'toPort' && voyage.port && voyage.later) return t(voyage.days !== undefined ? 'formation.voyage.toPort.later' : 'formation.voyage.toPort.laterSoon', { port: voyage.port, days: voyage.days ?? 1 });
  if (voyage.state === 'toPort' && voyage.port && voyage.days !== undefined) return t('formation.voyage.toPort.days', { port: voyage.port, days: voyage.days });
  return t(voyage.port ? `formation.voyage.${voyage.state}.port` : `formation.voyage.${voyage.state}`, { port: voyage.port ?? '' });
}

/** Gathering at its port (ROADMAP R22c, R33b): how many of its landing are there, and how far off the last. Null otherwise. */
export function waitText(voyage: Voyage | null): string | null {
  const wait = voyage?.state === 'gathering' ? voyage.wait : undefined;
  if (!wait) return null;
  if (wait.days === null) return t('formation.wait.held', { n: wait.aboard, of: wait.of });
  if (wait.aboard === wait.of) return t('formation.wait.ships', { n: wait.aboard, of: wait.of });
  if (wait.days === 0) return t('formation.wait.here', { n: wait.aboard, of: wait.of });
  return t(wait.days === 1 ? 'formation.wait.days.one' : 'formation.wait.days', { n: wait.aboard, of: wait.of, days: wait.days });
}
