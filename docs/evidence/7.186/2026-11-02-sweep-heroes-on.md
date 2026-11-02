# Sweep 2026-11-02: seeds 1–10 × 20 years, heroes on — FAILING (limits)

Criteria (SPEC §10, tools/sweep/criteria.ts, ADR-54; land by area in km², ADR-52). Limits, every seed: land changing controller in the last 5 years ≥ 1.0%; largest nation < 35.0% of land and < 40.0% of income at the end; 20–250 nations alive every year; a war active in ≥ 80.0% of the years. Dynamism, by realm (a nation with no overlord, with its puppets' land), each in ≥ 80.0% of the seeds of runs of ≥ 50 years: a riser (a realm ending with ≥ 1.0% of the land and ≥ 1.5 × its land after year 1) and a faller (one of the ten largest realms after year 1 ending with ≤ 66.7% of its land then); no break-up (the living nations never more than 1.1 × the most they were 20 years or more before; ADR-428). Reported, not judged: stasis (the longest run of the same five largest by land, as a set; ✓ under 20 years; ADR-750) and the last two columns.

| Seed | Land moving (last 5 y) | Largest land | Largest income | Alive (min–max) | Years with war | Largest riser (realm, M km²) | Largest faller (realm, M km²) | One top five (longest) | Alive over the most 20 y before | New in top 10 | Leader share range |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 68.8% pass | 18.3% pass | 38.7% pass | 69–97 pass | 100.0% pass | GER × 22.83 (0.69 → 15.78) | BRA × 0.00 (8.51 → 0.00) | 4 y | × 0.00 | 4 | 5.1% |
| 2 | 61.9% pass | 21.6% pass | 32.1% pass | 78–100 pass | 100.0% pass | USA × 4.37 (9.57 → 41.85) | FRA × 0.00 (13.30 → 0.00) | 7 y | × 0.00 | 3 | 9.5% |
| 3 | 42.2% pass | 16.8% pass | 58.1% **FAIL** | 67–96 pass | 100.0% pass | COL × 3.07 (1.07 → 3.30) | CHI × 0.00 (6.39 → 0.00) | 5 y | × 0.00 | 4 | 4.5% |
| 4 | 46.8% pass | 17.0% pass | 34.0% pass | 69–97 pass | 100.0% pass | GER × 16.10 (0.58 → 9.40) | BRA × 0.00 (8.51 → 0.00) | 4 y | × 0.00 | 3 | 5.8% |
| 5 | 39.3% pass | 22.0% pass | 33.1% pass | 74–98 pass | 100.0% pass | USA × 2.74 (9.57 → 26.22) | ENG × 0.00 (35.18 → 0.00) | 11 y | × 0.00 | 2 | 4.9% |
| 6 | 45.5% pass | 17.9% pass | 32.5% pass | 78–97 pass | 100.0% pass | GER × 11.84 (0.76 → 8.96) | ITA × 0.00 (3.86 → 0.00) | 8 y | × 0.00 | 4 | 3.6% |
| 7 | 62.0% pass | 16.5% pass | 42.1% **FAIL** | 68–95 pass | 100.0% pass | GER × 23.41 (0.98 → 22.88) | BRA × 0.00 (8.51 → 0.00) | 4 y | × 0.00 | 4 | 5.8% |
| 8 | 60.1% pass | 19.6% pass | 32.0% pass | 74–99 pass | 100.0% pass | NED × 3.07 (1.79 → 5.49) | ITA × 0.00 (4.06 → 0.00) | 10 y | × 0.00 | 5 | 4.8% |
| 9 | 52.3% pass | 9.8% pass | 30.5% pass | 69–98 pass | 100.0% pass | GER × 17.50 (0.85 → 14.93) | SOV × 0.00 (25.83 → 0.00) | 4 y | × 0.00 | 4 | 8.9% |
| 10 | 53.9% pass | 17.3% pass | 31.5% pass | 77–99 pass | 100.0% pass | GER × 17.79 (0.85 → 15.09) | ENG × 0.00 (35.18 → 0.00) | 3 y | × 0.00 | 3 | 7.8% |

Limits: 8 of 10 seeds. Riser: 10 of 10. Faller: 10 of 10. No stasis (reported): 10 of 10. No break-up: 10 of 10. Not judged at 20 years.

## Nuclear weapons (PLAN 6.8)

| Seed | First warhead | Warheads at the end (nations) | AI decisions | Bursts | Most land under fallout | Days of war under MAD |
|---|---|---|---|---|---|---|
| 1 | 1946 | 92 (2) | 6 | 3 | 0.04% | 460 |
| 2 | 1946 | 133 (6) | 3 | 3 | 0.03% | 2764 |
| 3 | 1946 | 80 (3) | 5 | 5 | 0.31% | 1131 |
| 4 | 1946 | 110 (4) | 5 | 5 | 0.03% | 3305 |
| 5 | 1946 | 109 (3) | 4 | 3 | 0.04% | 766 |
| 6 | 1946 | 115 (4) | 23 | 17 | 0.71% | 2695 |
| 7 | 1946 | 99 (4) | 31 | 30 | 0.72% | 2976 |
| 8 | 1946 | 94 (4) | 12 | 10 | 0.21% | 2666 |
| 9 | 1946 | 125 (4) | 7 | 5 | 0.23% | 2362 |
| 10 | 1946 | 128 (4) | 17 | 11 | 0.09% | 3330 |

Nukes used in 10 of 10 seeds (at least 1: pass); the most land under fallout on a day 0.72% (at most 50.0%: pass).

Wall time 17.9 min with 5 processes (per seed: 1: 8.4 min, 2: 9.3 min, 3: 7.9 min, 4: 8.6 min, 5: 7.3 min, 6: 7.8 min, 7: 8.1 min, 8: 8.2 min, 9: 8.0 min, 10: 8.6 min).
