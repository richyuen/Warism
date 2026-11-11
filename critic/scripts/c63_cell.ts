import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
for (const [n, lon, lat] of [['Dover', 1.31, 51.13], ['Calais', 1.85, 50.95], ['Margate', 1.38, 51.39], ['Ostend', 2.92, 51.22], ['Portsmouth', -1.09, 50.8]] as const) console.log(n, cellOf(lon, lat, SIZE_1938.w, SIZE_1938.h));
