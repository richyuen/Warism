// Critic run 65: lon/lat to a 1938 map cell (projection.ts), for probes. Usage: npx tsx critic/scripts/c66_cell.ts lon lat
import { project } from '../../src/sim/data/projection';
const [u, v] = project(Number(process.argv[2]), Number(process.argv[3]));
console.log((u * 2048).toFixed(1), (v * 1024).toFixed(1));
