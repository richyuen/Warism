# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

> The ADRs before the last release tag are in `docs/history/`: `DECISIONS-<YYYY-MM>.md` (October) and
> `DECISIONS-<release tag>.md` from November on (ADR-805, ADR-918), in the order they had here. Search them by number (`grep -rn "ADR-623 " DECISIONS.md docs/history/`).

### ADR-958 · 2026-11-11 · accepted (the user's decision) — After release-2026-11-11: armies on the replay's fronts, Cold War blocs, a start from any date, the replay past 1953
- **Context.** Critic run 63's design objections: the replay's battles of 1942–44 are moved by its stages with no
  armies there (SPEC §7.7, ADR-935), and the world after 1953 forgets the blocs at once (54 wars in two years on the own
  seed). The user's ideas (2026-11-11): do something about the empty fronts; extend the replay; model the Cold War in
  the sim; replace "World, 1938" and "World, 1938 — Historical" by a timeline slider, a start from any point of the
  replay, continuing it or free.
- **Decision** (the user: "that order looks good, and let's include 4"), in this order after Batch 17:
  1. **Armies on the replay's fronts (R66).** The script decides each front's outcome; the armies stand on the
     fronts at each stage and fight there. Where they can be made strong enough to win the stage's outcome by the
     fighting without ill effects on the rest of the replay (`historyMatch1938h`'s and `historyTrack1938h`'s bars
     kept), they should; otherwise the stage moves the line as now (the user's "middle ground").
  2. **Cold War blocs in the sim (R67):** lasting blocs under the strongest powers, war between their leaders held
     back by deterrence, rivalry by proxies; a rule of every game, not the track's.
  3. **A start from any date of the replay (R68):** the timeline slider in place of the two 1938 cards; continue the
     replay or free from there.
  4. **The replay past 1953 (R69).**
- Each is split into lettered parts with their ATs when it is started (ROADMAP's rule).
