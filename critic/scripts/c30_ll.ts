// Critic run 30: cells (2048 x 1024 map) to lon/lat by the game's own projection; and back. Args: x y [x y ...]
import { unproject } from '../../src/sim/data/projection';
const a = process.argv.slice(2).map(Number);
for (let i = 0; i < a.length; i += 2) { const [lon, lat] = unproject(a[i]! / 2048, a[i + 1]! / 1024); console.log(a[i], a[i + 1], lon.toFixed(2), lat.toFixed(2)); }
