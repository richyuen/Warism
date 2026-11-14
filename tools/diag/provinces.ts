/**
 * The map's provinces of countries (`adm0`, Natural Earth's `adm0_a3`), for writing timeline events by `provinces`
 * (R69b): each one's `adm1` code, name and area, and on 1938h's start's world (seed 1938) its owner's tag. With a
 * pattern after the countries, only the names matching it (case ignored).
 *
 * Usage: npx tsx tools/diag/provinces.ts AGO,ETH [name pattern]
 */
import type { Admin1Meta } from '../../src/shared/admin1';
import { earthAsset } from '../../tests/helpers/earth';

const of = new Set((process.argv[2] ?? '').split(',').filter(Boolean));
const pat = process.argv[3] ? new RegExp(process.argv[3], 'i') : null;
const meta = JSON.parse(earthAsset('admin1-meta').toString('utf8')) as Admin1Meta[];
for (const m of meta) {
  if (!of.has(m.adm0) || (pat && !pat.test(m.name))) continue;
  process.stdout.write(`${m.adm1}\t${m.adm0}\t${m.name}\t${Math.round(m.areaKm2)} km²\n`);
}
