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

## ADR-1140 · 2026-11-19 · proposed, the user's decision · The narrow desk's legend over the war row: R200 off its route (ADR-829's exit)

- **The case** (critic run 87, focused, on bbf47bca): R87-B1. On a desk of 800 px or less R200 folds the legend; opened,
  it lies over the war row's banner, and the row is not counted again (247 to 329 sampled points covered at 700 × 800 in
  the sea, air and fallout modes; after a resize's recount, fallout's banner still half under it). By the code: the row
  is counted again when the window or its own band changes, not when the legend's box grows; the free band is measured
  once per render. Who meets it: every player on a half-screen desk who opens the folded legend to read it.
- **Why the loop stopped:** a blocking issue that is a regression of an item ticked since the last release (R200 against
  R197's row clear of the legend). UI/UX 7 in this run alone (8 in runs 84 to 86). It is the fourth lap of one class: the
  war row and the legend share the bottom band of a narrow desk (R85-N1, R86-N2, R87-B1, and R87-N2's jumps from R202),
  each fix moving the row's room and the next finding its edge.
- **The options:**
  - **(a) Fix in the same design:** count the row again when the legend opens or closes (its box observed), make the band
    measure catch fallout's box, and fold only the wide legends (sea, air, fallout) as the objection asks. Small; keeps
    the row and the legend in one band, the class R85–R87 came from.
  - **(b) The narrow desk's legend leaves the bottom band (recommended):** on a desk of 800 px or less the legend, folded
    and opened, stands at the top left as the phone's does (its rules, ADR-760), and gives way to a nation's panel and
    History as there. The row's band then has the news alone on its left; R197's band and R200's fold stop interacting.
    The phone's layout is proven by runs 80 to 86.
  - **(c) Take R200 back:** the legend always open on a narrow desk; R86-N2 returns (the sea, air and fallout modes at
    680 to 760 px show "+5" alone, non-blocking in run 86), R87-B1 goes.
  - **(d) The legend in the map-mode button (Europa Universalis IV's way, the report's idea):** on every desk the legend
    opens from the map-mode button, never in the bottom band. The widest change; the desk's legend moves for everyone.
- **Also in the run:** R87-N2, R202's row jumping 24 to 44 px on a 1100–1366 px desk when a war on it changes; the empty
  relations footer saying the left-out count beside "No ties of these kinds."; the objection to folding the political
  legend. Filed as Batch 55 (R203–R206). The rotation's first `fresh` record: emergentDynamics and stability by rotation;
  performance afresh (8).
