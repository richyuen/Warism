// Critic run 66: the index (1-based) of tags in TAGS_1938H, to decode c66_endhours' alliance ids printed as tags.
import { TAGS_1938H } from '../../src/sim/scenario1938h';
for (const t of process.argv.slice(2)) console.log(t, (TAGS_1938H as readonly string[]).indexOf(t) + 1);
