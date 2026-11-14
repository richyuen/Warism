# Sweep 2026-11-14: seeds 1581–1590 × 50 years — FAILING (limits)

Criteria (SPEC §10, tools/sweep/criteria.ts, ADR-54; land by area in km², ADR-52). Limits, every seed: land changing controller in the last 5 years ≥ 1.0%; largest nation < 35.0% of land and < 40.0% of income at the end; 20–250 nations alive every year; a war active in ≥ 80.0% of the years. Dynamism, by realm (a nation with no overlord, with its puppets' land), each in ≥ 80.0% of the seeds of runs of ≥ 50 years: a riser (a realm ending with ≥ 1.0% of the land and ≥ 1.5 × its land after year 1) and a faller (one of the ten largest realms after year 1 ending with ≤ 66.7% of its land then); no break-up (the living nations never more than 1.1 × the most they were 20 years or more before; ADR-428). Reported, not judged: stasis (the longest run of the same five largest by land, as a set; ✓ under 20 years; ADR-750) and the last two columns.

| Seed | Land moving (last 5 y) | Largest land | Largest income | Alive (min–max) | Years with war | Largest riser (realm, M km²) | Largest faller (realm, M km²) | One top five (longest) | Alive over the most 20 y before | New in top 10 | Leader share range |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1581 | 40.0% pass | 19.9% pass | 34.6% pass | 61–97 pass | 100.0% pass | USA × 5.16 (9.57 → 49.35) yes | ENG × 0.00 (35.25 → 0.00) yes | 5 y yes | × 0.77 yes | 4 | 13.9% |
| 1582 | 66.0% pass | 19.9% pass | 31.3% pass | 70–93 pass | 100.0% pass | GER × 45.98 (0.98 → 45.26) yes | FRA × 0.00 (12.87 → 0.00) yes | 6 y yes | × 0.90 yes | 4 | 13.0% |
| 1583 | 55.1% pass | 16.7% pass | 32.8% pass | 66–97 pass | 100.0% pass | CZS × 429.23 (0.03 → 14.96) yes | ENG × 0.00 (35.27 → 0.00) yes | 14 y yes | × 0.90 yes | 3 | 10.2% |
| 1584 | 61.4% pass | 27.6% pass | 58.3% **FAIL** | 64–98 pass | 100.0% pass | JAP × 14.06 (0.67 → 9.41) yes | FRA × 0.00 (12.92 → 0.00) yes | 14 y yes | × 0.84 yes | 3 | 18.2% |
| 1585 | 46.8% pass | 15.8% pass | 40.0% pass | 68–99 pass | 100.0% pass | NSP × 20.06 (0.83 → 16.65) yes | SOV × 0.19 (25.12 → 4.73) yes | 9 y yes | × 0.86 yes | 2 | 16.4% |
| 1586 | 40.5% pass | 13.2% pass | 35.1% pass | 73–97 pass | 100.0% pass | GER × 19.19 (0.85 → 16.38) yes | ENG × 0.00 (34.53 → 0.00) yes | 11 y yes | × 0.90 yes | 4 | 5.3% |
| 1587 | 68.5% pass | 31.9% pass | 40.6% **FAIL** | 57–100 pass | 100.0% pass | USA × 4.65 (9.57 → 44.49) yes | FRA × 0.00 (13.62 → 0.00) yes | 6 y yes | × 0.78 yes | 4 | 22.7% |
| 1588 | 44.5% pass | 19.0% pass | 32.3% pass | 72–97 pass | 100.0% pass | JAP × 13.85 (1.94 → 26.91) yes | ENG × 0.00 (35.46 → 0.00) yes | 7 y yes | × 0.89 yes | 5 | 8.5% |
| 1589 | 65.0% pass | 43.7% **FAIL** | 65.5% **FAIL** | 67–104 pass | 100.0% pass | USA × 8.34 (9.57 → 79.85) yes | ENG × 0.00 (35.76 → 0.00) yes | 12 y yes | × 0.82 yes | 4 | 34.2% |
| 1590 | 46.9% pass | 39.0% **FAIL** | 36.4% pass | 56–99 pass | 100.0% pass | GER × 16.08 (0.55 → 8.79) yes | ENG × 0.00 (35.18 → 0.00) yes | 12 y yes | × 0.77 yes | 5 | 22.2% |

Limits: 6 of 10 seeds. Riser: 10 of 10. Faller: 10 of 10. No stasis (reported): 10 of 10. No break-up: 10 of 10. Needed: 8 of 10 each.

## Nuclear weapons (PLAN 6.8)

| Seed | First warhead | Warheads at the end (nations) | AI decisions | Bursts | Most land under fallout | Days of war under MAD |
|---|---|---|---|---|---|---|
| 1581 | 1946 | 174 (6) | 26 | 26 | 0.75% | 5603 |
| 1582 | 1946 | 148 (5) | 47 | 47 | 1.14% | 10590 |
| 1583 | 1946 | 168 (6) | 23 | 23 | 0.63% | 12612 |
| 1584 | 1946 | 172 (6) | 30 | 30 | 0.89% | 8285 |
| 1585 | 1946 | 154 (5) | 35 | 35 | 0.75% | 11475 |
| 1586 | 1946 | 155 (3) | 79 | 78 | 2.60% | 11515 |
| 1587 | 1946 | 149 (6) | 83 | 83 | 2.32% | 13265 |
| 1588 | 1946 | 148 (4) | 55 | 55 | 2.41% | 9219 |
| 1589 | 1946 | 157 (3) | 33 | 33 | 1.27% | 9488 |
| 1590 | 1946 | 115 (3) | 25 | 25 | 0.61% | 7731 |

Nukes used in 10 of 10 seeds (at least 1: pass); the most land under fallout on a day 2.60% (at most 50.0%: pass).

Save and load on the way (the soak's checks, ADR-959): 49 saves loaded into a fresh world on 10 seeds, every 10 years, the twins compared 30 days after; no NaN or infinity at a year's end: pass.

Wall time 30.6 min with 10 processes (per seed: 1581: 24.3 min, 1582: 28.2 min, 1583: 29.0 min, 1584: 23.5 min, 1585: 30.6 min, 1586: 29.0 min, 1587: 27.2 min, 1588: 25.5 min, 1589: 27.4 min, 1590: 24.3 min).
