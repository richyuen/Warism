# Sweep 2026-11-04: seeds 1551–1560 × 50 years — FAILING (limits)

Criteria (SPEC §10, tools/sweep/criteria.ts, ADR-54; land by area in km², ADR-52). Limits, every seed: land changing controller in the last 5 years ≥ 1.0%; largest nation < 35.0% of land and < 40.0% of income at the end; 20–250 nations alive every year; a war active in ≥ 80.0% of the years. Dynamism, by realm (a nation with no overlord, with its puppets' land), each in ≥ 80.0% of the seeds of runs of ≥ 50 years: a riser (a realm ending with ≥ 1.0% of the land and ≥ 1.5 × its land after year 1) and a faller (one of the ten largest realms after year 1 ending with ≤ 66.7% of its land then); no break-up (the living nations never more than 1.1 × the most they were 20 years or more before; ADR-428). Reported, not judged: stasis (the longest run of the same five largest by land, as a set; ✓ under 20 years; ADR-750) and the last two columns.

| Seed | Land moving (last 5 y) | Largest land | Largest income | Alive (min–max) | Years with war | Largest riser (realm, M km²) | Largest faller (realm, M km²) | One top five (longest) | Alive over the most 20 y before | New in top 10 | Leader share range |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1551 | 57.4% pass | 18.0% pass | 31.0% pass | 73–99 pass | 100.0% pass | GER × 831.50 (0.06 → 53.55) yes | ENG × 0.00 (36.35 → 0.00) yes | 20 y **no** | × 1.04 yes | 4 | 18.5% |
| 1552 | 56.2% pass | 26.0% pass | 47.8% **FAIL** | 64–99 pass | 100.0% pass | USA × 6.56 (9.57 → 62.82) yes | SOV × 0.00 (25.41 → 0.00) yes | 6 y yes | × 0.87 yes | 2 | 15.7% |
| 1553 | 34.4% pass | 29.6% pass | 38.2% pass | 67–99 pass | 100.0% pass | SWI × 294.58 (0.06 → 18.67) yes | SOV × 0.00 (25.31 → 0.00) yes | 9 y yes | × 0.87 yes | 5 | 15.0% |
| 1554 | 62.9% pass | 18.4% pass | 34.6% pass | 62–100 pass | 100.0% pass | GER × 13.48 (1.28 → 17.28) yes | SOV × 0.00 (25.84 → 0.00) yes | 7 y yes | × 0.76 yes | 5 | 14.7% |
| 1555 | 57.7% pass | 14.1% pass | 34.3% pass | 61–100 pass | 100.0% pass | GER × 47.80 (0.77 → 36.84) yes | SOV × 0.00 (25.75 → 0.00) yes | 9 y yes | × 0.79 yes | 5 | 11.6% |
| 1556 | 38.9% pass | 41.7% **FAIL** | 71.9% **FAIL** | 59–97 pass | 100.0% pass | USA × 8.68 (10.25 → 88.91) yes | ENG × 0.00 (36.02 → 0.00) yes | 7 y yes | × 0.84 yes | 3 | 29.1% |
| 1557 | 53.7% pass | 36.7% **FAIL** | 55.8% **FAIL** | 58–95 pass | 100.0% pass | USA × 6.65 (9.57 → 63.63) yes | BRA × 0.00 (8.51 → 0.00) yes | 13 y yes | × 0.80 yes | 5 | 28.4% |
| 1558 | 49.4% pass | 9.4% pass | 30.9% pass | 72–100 pass | 100.0% pass | CZS × 92.88 (0.05 → 4.66) yes | SOV × 0.00 (25.63 → 0.00) yes | 9 y yes | × 1.05 yes | 6 | 14.2% |
| 1559 | 55.7% pass | 12.6% pass | 34.8% pass | 62–96 pass | 100.0% pass | JAP × 12.04 (0.62 → 7.48) yes | CHI × 0.00 (6.12 → 0.00) yes | 14 y yes | × 0.88 yes | 4 | 6.9% |
| 1560 | 46.4% pass | 16.6% pass | 30.9% pass | 58–97 pass | 100.0% pass | CZS × 96.40 (0.02 → 1.72) yes | ENG × 0.33 (35.57 → 11.70) yes | 10 y yes | × 0.88 yes | 3 | 12.7% |

Limits: 7 of 10 seeds. Riser: 10 of 10. Faller: 10 of 10. No stasis (reported): 9 of 10. No break-up: 10 of 10. Needed: 8 of 10 each.

## Nuclear weapons (PLAN 6.8)

| Seed | First warhead | Warheads at the end (nations) | AI decisions | Bursts | Most land under fallout | Days of war under MAD |
|---|---|---|---|---|---|---|
| 1551 | 1946 | 164 (4) | 41 | 39 | 0.74% | 9050 |
| 1552 | 1946 | 137 (5) | 64 | 64 | 1.54% | 11789 |
| 1553 | 1946 | 180 (4) | 27 | 25 | 0.90% | 7627 |
| 1554 | 1946 | 161 (5) | 44 | 36 | 0.77% | 12520 |
| 1555 | 1946 | 158 (5) | 33 | 25 | 0.54% | 12235 |
| 1556 | 1946 | 107 (2) | 39 | 39 | 0.75% | 2384 |
| 1557 | 1946 | 137 (5) | 34 | 34 | 0.30% | 3819 |
| 1558 | 1946 | 128 (5) | 19 | 19 | 0.22% | 8632 |
| 1559 | 1946 | 188 (7) | 36 | 36 | 0.76% | 11194 |
| 1560 | 1946 | 175 (7) | 51 | 44 | 1.18% | 14273 |

Nukes used in 10 of 10 seeds (at least 1: pass); the most land under fallout on a day 1.54% (at most 50.0%: pass).

Wall time 49.4 min with 8 processes (per seed: 1551: 29.3 min, 1552: 28.7 min, 1553: 23.3 min, 1554: 30.6 min, 1555: 28.6 min, 1556: 27.0 min, 1557: 27.5 min, 1558: 27.7 min, 1559: 22.4 min, 1560: 22.4 min).
