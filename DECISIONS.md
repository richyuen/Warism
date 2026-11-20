# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

## ADR-1139 · 2026-11-19 · the user's decision · Non-blocking items fixed before the release and judged at the next; the loop stops after a release

- **The case.** ADR-1138 let a release go with its run's non-blocking items open, done after it and before the next critic
  run. The user: "It seems like we end up in a never-ending release/critic cycle then." The loop's only source of work
  had become the critic's findings, and most were side effects of the last fixes (R194 → R197 → R200 and R202; R198 →
  R201); every score has been at its bar since run 84, so the work moved no score.
- **The user:** "What if we fix non-blocking items before release and then don't judge them until following release?";
  to the builder's version with a stop after the release added, "Yes".
- **The rule** (replaces ADR-1138's rule 5; ADR-1138's other rules hold):
  1. A focused critic run on the release candidate. Its blocking issues are fixed and the critic runs again, as before.
  2. A run with no blocking issue and every score at its bar: its non-blocking items (design objections named as
     issues among them) are fixed **before the release**, each with its AT, crossing the sizes and panels where it is on
     the war row or a panel's place (ADR-1137 (d)), the gate green before each commit. **No critic run after them**: the
     release checks (`check:review`, `bench G --gpu-only`) run once, on the fixed code, and the tag follows.
  3. The next release's critic run judges them: their files are "touched" (ADR-1138's table). A side effect found then
     is an item of that cycle; a regression of them is a blocking issue under ADR-829 as now.
  4. **After the tag the loop stops**: it tells the user the release and asks what is next. The next critic run comes
     when the next release is wanted, after the user's next batch is done; it judges that batch and the last release's
     non-blocking fixes together.
- **Now:** critic run 87 (focused, on bbf47bca, spawned before this rule): with no blocking issue and every score at its
  bar, its non-blocking items are fixed, the release checks run, the release is tagged, and the loop stops.
