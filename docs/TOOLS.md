# Diagnostic tools

By hand, for the items that need them (moved out of CLAUDE.md, ADR-918). The everyday commands are in CLAUDE.md.

- `npx tsx tools/diag/replayCritic.ts [--at head|report|<commit>] [--new K] [--jobs P]`: the last critic run's
  headless jobs again, compared with its outputs; `--new K` runs each family on K new seeds (ADR-851).
- `npx tsx tools/diag/landingFuzz.ts [--seeds N] [--first S] [--jobs P]`: the landing checker on N fresh seeds × the
  critic's six shapes (default 50, 300 runs, ~30 min at 3 jobs); by hand only, not a step of the loop (ADR-916).
- `npx tsx tools/diag/seaBattles.ts <seed> [scenario|random] [--years N]`: each sea battle with its place, sides,
  ships and a camera; `tools/diag/seaBattlesLook.ts <its json>` (a preview on 4173) checks each is drawn (ADR-852),
  in the order of their first hours; one listed with no fleet is told "no fleet to see", not failed (R59e).
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
- `npx tsx tools/diag/fewNationWars.ts <N> <S0> [K] [Y]`: random worlds of N nations on K seeds, the day of each one's
  first war over Y years (R60d; ~25 s a seed at N = 3).
- `npm run saves [-- <out> [last year]]`: 1938h's world on 1 January of each year of the track, gzipped, with
  `years.json` (format, seed, each year's tick and hash), for a start from a year (R68a, ADR-983); the Pages workflow
  builds them into `dist`; locally into `public/data/scenarios/1938h/start/` (gitignored). ~7 min, ~1 MB a year.
