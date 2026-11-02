# Sweep 2026-11-02: seeds 1–10 × 20 years — FAILING (limits)

Criteria (SPEC §10, tools/sweep/criteria.ts, ADR-54; land by area in km², ADR-52). Limits, every seed: land changing controller in the last 5 years ≥ 1.0%; largest nation < 35.0% of land and < 40.0% of income at the end; 20–250 nations alive every year; a war active in ≥ 80.0% of the years. Dynamism, by realm (a nation with no overlord, with its puppets' land), each in ≥ 80.0% of the seeds of runs of ≥ 50 years: a riser (a realm ending with ≥ 1.0% of the land and ≥ 1.5 × its land after year 1) and a faller (one of the ten largest realms after year 1 ending with ≤ 66.7% of its land then); no break-up (the living nations never more than 1.1 × the most they were 20 years or more before; ADR-428). Reported, not judged: stasis (the longest run of the same five largest by land, as a set; ✓ under 20 years; ADR-750) and the last two columns.

| Seed | Land moving (last 5 y) | Largest land | Largest income | Alive (min–max) | Years with war | Largest riser (realm, M km²) | Largest faller (realm, M km²) | One top five (longest) | Alive over the most 20 y before | New in top 10 | Leader share range |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 41.9% pass | 16.0% pass | 32.1% pass | 72–100 pass | 100.0% pass | IRQ × 16.28 (0.43 → 7.08) | CHI × 0.00 (4.94 → 0.00) | 4 y | × 0.00 | 3 | 5.4% |
| 2 | 54.4% pass | 14.3% pass | 48.3% **FAIL** | 71–99 pass | 100.0% pass | CHI × 7.99 (6.07 → 48.47) | ENG × 0.00 (35.18 → 0.00) | 9 y | × 0.00 | 2 | 9.8% |
| 3 | 35.3% pass | 22.9% pass | 33.3% pass | 79–101 pass | 100.0% pass | AUT × 22.41 (0.08 → 1.85) | SOV × 0.00 (26.05 → 0.00) | 5 y | × 0.00 | 4 | 10.5% |
| 4 | 65.5% pass | 17.1% pass | 41.3% **FAIL** | 77–98 pass | 100.0% pass | USA × 3.95 (9.71 → 38.38) | ENG × 0.00 (35.26 → 0.00) | 7 y | × 0.00 | 3 | 5.1% |
| 5 | 42.6% pass | 21.4% pass | 35.6% pass | 70–97 pass | 100.0% pass | CHI × 2.71 (6.70 → 18.16) | ENG × 0.00 (36.92 → 0.00) | 9 y | × 0.00 | 2 | 9.6% |
| 6 | 38.9% pass | 13.6% pass | 39.7% pass | 75–99 pass | 100.0% pass | IRQ × 6.75 (0.43 → 2.94) | SOV × 0.00 (25.05 → 0.00) | 4 y | × 0.00 | 3 | 6.5% |
| 7 | 39.7% pass | 18.6% pass | 40.0% pass | 75–95 pass | 100.0% pass | USA × 2.03 (9.59 → 19.50) | CHI × 0.00 (6.21 → 0.00) | 6 y | × 0.00 | 4 | 3.4% |
| 8 | 34.3% pass | 24.1% pass | 55.1% **FAIL** | 77–99 pass | 100.0% pass | ARG × 5.44 (2.78 → 15.12) | ENG × 0.00 (35.50 → 0.00) | 7 y | × 0.00 | 4 | 10.1% |
| 9 | 48.6% pass | 13.1% pass | 32.4% pass | 75–101 pass | 100.0% pass | GER × 9.46 (0.80 → 7.58) | SOV × 0.00 (24.95 → 0.00) | 11 y | × 0.00 | 4 | 4.6% |
| 10 | 71.1% pass | 18.4% pass | 38.8% pass | 76–100 pass | 100.0% pass | GER × 102.80 (0.53 → 54.64) | SOV × 0.00 (26.77 → 0.00) | 6 y | × 0.00 | 3 | 8.5% |

Limits: 7 of 10 seeds. Riser: 10 of 10. Faller: 10 of 10. No stasis (reported): 10 of 10. No break-up: 10 of 10. Not judged at 20 years.

## Nuclear weapons (PLAN 6.8)

| Seed | First warhead | Warheads at the end (nations) | AI decisions | Bursts | Most land under fallout | Days of war under MAD |
|---|---|---|---|---|---|---|
| 1 | 1946 | 119 (4) | 3 | 2 | 0.02% | 3436 |
| 2 | 1946 | 81 (4) | 7 | 7 | 0.23% | 3634 |
| 3 | 1946 | 123 (4) | 3 | 2 | 0.02% | 2370 |
| 4 | 1946 | 48 (4) | 35 | 29 | 0.70% | 2416 |
| 5 | 1946 | 106 (4) | 7 | 7 | 0.49% | 789 |
| 6 | 1946 | 117 (5) | 3 | 3 | 0.02% | 1848 |
| 7 | 1946 | 117 (5) | 6 | 6 | 0.24% | 3784 |
| 8 | 1946 | 91 (5) | 15 | 13 | 0.84% | 2875 |
| 9 | 1946 | 134 (4) | 11 | 9 | 0.23% | 1237 |
| 10 | 1946 | 96 (3) | 0 | 0 | 0.00% | 1138 |

Nukes used in 9 of 10 seeds (at least 1: pass); the most land under fallout on a day 0.84% (at most 50.0%: pass).

Wall time 17.0 min with 5 processes (per seed: 1: 9.0 min, 2: 8.3 min, 3: 7.9 min, 4: 8.1 min, 5: 7.9 min, 6: 8.3 min, 7: 8.2 min, 8: 6.9 min, 9: 8.2 min, 10: 8.0 min).
