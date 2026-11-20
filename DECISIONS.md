# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

## ADR-1142 · 2026-11-19 · accepted · The desk's war row holds its side while its band and its banners' number hold (R204)

- **The case** (critic run 87, R87-N2): R202 put the desk's closed row on the bar's centre when its banners fit there and
  in the free band's middle when the centre would cost a banner, and chose at every draw from the banners' widths. In a
  running game a war on the row gives its place to one with longer or shorter names, and the row jumped 24 to 44 px with
  the same three banners. On HEAD, 87601 at day 300, eight cases of 60 s at Speed ×5 (1280 × 720, 1366 × 768, 1100 × 800,
  820 × 800; political and sea control): 12 sideways moves, 11 with the count unchanged (four of 44 px at 1280 × 720
  political, six of 24 px at 1366 × 768 sea control). The band's edges did not move in any case: the side's choice alone
  moved the row.
- **The rule** (`rowStand`, `src/ui/bannerOrder.ts`): the side is chosen when the free band or the number of banners
  shown changes, on the centre if the banners fit there, and held until one of them changes again (the band's edges have
  `STAND_SLACK`, 2 px).
  - Held in the band, the row stays there though its banners would now fit the centre.
  - Held on the centre, a row that outgrows it gives a banner behind "+n" and stays on the centre. **This changes R202's
    rule** ("the band's middle only when the centre would cost a banner"): there the row moved to keep the banner.
  - That many banners coming back in the same band stand in the band (`outgrown`), so a banner goes once, not at each
    long name. Another band (a map mode, a resize, a panel) forgets it.
  - One banner that outgrows the centre goes to the band: a war is shown at every desk (R197).
- **The cost, read** (the same eight cases, the final code, one pass of 60 s and one of the critic's 40 s):
  - Moves with the count unchanged: 0 in every pass (11 on HEAD). Moves in all: 3 in the 60 s pass, each with a change of
    the count (12 on HEAD); the count changed 4 times in eight minutes (1 on HEAD).
  - At 1280 × 720 political the row holds three banners in the band, 44 px off the bar's centre the whole time (on HEAD
    off it 47 % of the time, and jumping). At 1366 × 768 sea control three banners 92 % of the time (100 % on HEAD), the
    count changed twice, and no move without it (six on HEAD); without `outgrown` the first passes read 66 to 68 % and
    four changes.
  - On a desk with room (1600, 1920, 2560 px) nothing changes: the row on the centre, 0 px off, three banners in all
    eleven map modes (`c86_deskAttack 84901 400 wide`, as R202).
- **Not chosen:** the side from the row's widest case (three banners of 11 rem names never fit a centre under about
  2700 px: R202's centre gone at 1600 and 1920); the row moved to the band and held there (one move with the count
  unchanged, which the AT forbids).

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

## ADR-1140 · 2026-11-19 · the user's decision: (b) · The narrow desk's legend over the war row: R200 off its route (ADR-829's exit)

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
- **The user:** "OK, let's do b." (Asked first whether (d)'s legend showed only while the map-mode menu is open: yes, as
  the report put it; its live sea and air rows would be hidden while the map is read.) Under ADR-1141 R87-B1 is outside
  the supported sizes and no longer blocks; (b) is done as an item all the same ("We can fix the listed issues, just
  shouldn't be blockers").

## ADR-1141 · 2026-11-19 · the user's decision · The supported sizes: the iPhone 16 and a 1440p desk's window

- **The case.** The critic chose its own sizes: about 40 in runs 83 to 87 (phones from 320 × 568 to 932 × 430, desks of
  600 to 820 px most of all, 1024 × 768 to 4K), and ADR-1137 (d) had every phone-row or panel item cross as many. Most of
  runs 80 to 87's blocking issues were at sizes few players have (a phone narrowed under 600 px and widened, a half-screen
  desk).
- **The user:** "What are all the screen sizes that the critic looks at? Can we limit this? The only important ones are
  1440p, 1080p, iPhone 16/17."; then "OK, for phone, let's just worry about iPhone 16 only, both vertical and sideways
  and with/without Safari bars. On desktop, let's just focus on 1440p - don't worry about fullscreen, just windowed
  height. We can fix the listed issues, just shouldn't be blockers."
- **The rule.**
  1. **The supported sizes** (CSS px; Playwright's `iPhone 16` and `iPhone 16 landscape` for the bars, touch, a pixel
     ratio of 3):
     - the iPhone 16 upright with Safari's bars, **393 × 659**, and without them, **393 × 852**;
     - the iPhone 16 sideways with Safari's bars, **734 × 343**, and without them, **852 × 393**;
     - a 1440p desk's browser window, maximized at 100 % scaling (the taskbar and the browser's bars off its height),
       **2560 × 1305**.
  2. **Only a defect at a supported size can block a release or hold a score under its bar.** A defect seen only at
     another size is a non-blocking issue: filed, and fixed before the release as ADR-1139 has it, never blocking.
  3. **The critic** judges the page at the supported sizes; it may look at others, and files what it finds there as
     non-blocking. The page's frame rate in the performance chain is measured at 2560 × 1305 (and the seed 99 tick as
     before).
  4. **ADR-1137 (d)'s crossing** becomes: the five supported sizes and back, the panels beside the item opened and
     closed. A spec may cover other sizes; it does not have to.
- **Now:** R87-B1 (a desk of 800 px or less) is outside the supported sizes: Batch 55's items are non-blocking and done
  as items (R203 by ADR-1140 (b)). Run 87 judged UI/UX 7 on R87-B1 alone: the next critic run scores under this rule.

