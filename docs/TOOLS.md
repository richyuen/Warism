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
- `npx tsx tools/diag/trackFronts.ts [seed] [from] [to] [out.json]`: 1938h's `occupy` stages in the dates (1942 to
  mid-1945 by default) and each side's land formations within 120 km of the land each gives, just before it
  (`tests/helpers/trackFronts.ts`; R66a, ~5 min).
- `npx tsx tools/diag/fewNationWars.ts <N> <S0> [K] [Y]`: random worlds of N nations on K seeds, the day of each one's
  first war over Y years (R60d; ~25 s a seed at N = 3).
