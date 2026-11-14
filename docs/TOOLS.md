# Diagnostic tools

By hand, for the items that need them (moved out of CLAUDE.md, ADR-918). The everyday commands are in CLAUDE.md.

- `npx tsx tools/diag/replayCritic.ts [--at head|report|<commit>] [--new K] [--jobs P]`: the last critic run's
  headless jobs again, compared with its outputs; `--new K` runs each family on K new seeds (ADR-851).
- `npx tsx tools/diag/landingFuzz.ts [--seeds N] [--first S] [--jobs P]`: the landing checker on N fresh seeds × the
  critic's six shapes (default 50, 300 runs, ~30 min at 3 jobs); by hand only, not a step of the loop (ADR-916).
- `npx tsx tools/diag/seaBattles.ts <seed> [scenario|random] [--years N]`: each sea battle with its place, sides,
  ships and a camera; `tools/diag/seaBattlesLook.ts <its json>` (a preview on 4173) checks each is drawn (ADR-852),
  in the order of their first hours; one listed with no fleet is told "no fleet to see", not failed (R59e).
  Its `sinkings` are ships sunk from the air in an hour with no sea battle, `by` the nation of the carrier whose wings
  sank them, not the nation that lost them (R78c).
- `npx tsx tools/diag/landingRows.ts [grid|far|page|all]`: the landings bar's rows against the divisions' panels and
  their order news, hour by hour, on the critic's landing cases (ADR-856, ADR-879).
- `npx tsx tools/diag/diploInvariants.ts <seed> [scenario|random] [--heroes] [--world random]`: the
  rules of war and peace on one run, as `tests/unit/diploInvariants*.test.ts` check them (ADR-803).
- `npx tsx tools/diag/trackFronts.ts [seed] [from] [to] [out.json]`: 1938h's `occupy` and `transfer` stages in the
  dates (1942 to mid-1945 by default) and each side's land formations within 120 km of the land each gives, fixed at
  its window's opening (R66d): men near and engaged at the stage's hour, the cohort's losses in the window, both sides
  engaged through it (`tests/helpers/trackFronts.ts`; R66a, ~5 min; 1945-53 ~12 min).
- `npx tsx tools/diag/afterTrack.ts [seed] [years = 20] [out.json]`: the world after 1938h's track ends: its
  alliances, great and nuclear powers, then every war declared, those between great powers and between blocs, the
  leaders' men and disbandings monthly for five years. Saves the world at the track's end to
  `.cache/afterTrack_<seed>.sav.gz` and loads it from there after (R67a; ~10 min the first time).
- `npx tsx tools/diag/flagPairs.ts [seed = 39915] [days = 5] [seeds = 39915,7019] [bar = 0.3] [out dir]` (after
  `npm run build` and `npx vite preview --port 5355 --host 127.0.0.1`): Germany's and Poland's label flags read from the
  overlay as drawn at 250 m/px, the share of pixels differing by over 60, the flag's edge against the tag's ground, the
  two tags' shots; then the flags of every pair at war in year 1 on `seeds`, those under the bar listed (ROADMAP R81d).
- `npx tsx tools/diag/burstMark.ts <seed> <save.bin> [out dir]` (after `npm run build` and `npx vite preview --port
  5355 --host 127.0.0.1`): a save run at Max to its first burst, then Speed ×1; the burst's effect drawn alone at 937
  and 3,000 m/px at 1-10.3 s, its extent, and shots (ROADMAP R81c).
- `npx tsx tools/diag/undoBars.ts <seed> <save.bin> [N = 20] [K = 2000]` (after `npm run build` and `npx vite preview
  --port 5355 --host 127.0.0.1`): ROADMAP R81b's undo bars on the GPU on a loaded world: a God act's command to its
  stats drawn with the undo's copy and without, the page's longest frame meanwhile, Undo to the loaded world drawn, and
  the tick with an undo held and with none (ADR-1032, ADR-1034).
- `npx tsx tools/diag/farConquests.ts <year|0> <after seed,...> [days = 730] [km = 500]`: a free game from a year of the
  replay (its built start; 0: plain 1938): capitals taken, once a pair, those far (no land of the taker's realm within
  `km` at the start), each in the taker's own war or joined (by which pact, on which side); the first 30 days'
  declarations; means per 100 nations alive (R81a, ADR-1033; ~2 min a seed for two years).
- `npx tsx tools/diag/fewNationWars.ts <N> <S0> [K] [Y]`: random worlds of N nations on K seeds, the day of each one's
  first war over Y years (R60d; ~25 s a seed at N = 3).
- `npm run saves [-- <out> [last year]]`: 1938h's world on 1 January of each year of the track, gzipped, with
  `years.json` (format, seed, each year's tick and hash), for a start from a year (R68a, ADR-983); the Pages workflow
  builds them into `dist`; locally into `public/data/scenarios/1938h/start/` (gitignored). ~7 min, ~1 MB a year.
