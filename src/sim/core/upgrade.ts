/**
 * A scenario file of an older version brought up to this one (ROADMAP R53i; critic run 54: the run-26 file was
 * refused). A section that this version reads and the file lacks is added where a value says "as before the part
 * came": `UPGRADABLE_SECTIONS` (shared, so the title screen can say so). Each is a column of a table, as long as the
 * table's high water (`<table>.meta[0]`), filled with zeros. The file's own hash is the hash of its sections as read,
 * before anything is added: what the file says of itself is checked, not the world it becomes.
 */
import { UPGRADABLE_SECTIONS } from '../../shared/stateCheck';
import { decodeSections, encodeSections, hashSections, makeArray, type DType, type Section } from './sections';

export interface Upgraded {
  bytes: Uint8Array;
  /** The hash of the bytes as given (`Sim.hash` of the world that wrote them). */
  fileHash: number;
  /** The sections added, "name:dtype"; [] when nothing was. */
  added: string[];
}

export function upgradeState(bytes: Uint8Array): Upgraded {
  const sections: Section[] = decodeSections(bytes);
  const fileHash = hashSections(sections) >>> 0;
  const have = new Set(sections.map((s) => `${s.name}:${s.dtype}`));
  const added: string[] = [];
  for (const key of Object.keys(UPGRADABLE_SECTIONS)) {
    if (have.has(key)) continue;
    const [name, dtype] = key.split(':') as [string, DType];
    const table = name.slice(0, name.lastIndexOf('.'));
    const meta = sections.find((s) => s.name === `${table}.meta`);
    if (!meta) continue;
    sections.push({ name, dtype, data: makeArray(dtype, Number(meta.data[0] ?? 0)) });
    added.push(key);
  }
  return { bytes: added.length > 0 ? encodeSections(sections) : bytes, fileHash, added };
}
