# Replay of critic run 51 at HEAD

65 jobs: 63 same as the critic's, 2 differ, 0 failed (exit not 0); 19 on new seeds. 2201 s, 5 at a time.

## Cases that differ or failed

| job | exit | the replay ← the critic | first line that differs |
|---|---|---|---|
| c51_li_18705_jap.log | 0 | seed 18705 setup 3517 orders 18705, 120 days: 0 broken, #t ← critic: seed 18705 setup 3517 orders 18705, 120 days: 0 broken, #t | line 1: replay "slowClick: 37 clicks reckoned (6 not), 3 ashore; worst -0.1 days over its best way (t417's click of " vs critic "slowClick: 36 clicks reckoned (7 not), 3 ashore; worst -0.1 days over its best way (t417's click of " |
| c51_li_20829_jap.log | 0 | seed 20829 setup 3517 orders 20829, 120 days: 0 broken, #t ← critic: seed 20829 setup 3517 orders 20829, 120 days: 0 broken, #t | line 1: replay "slowClick: 39 clicks reckoned (9 not), 4 ashore; worst 4.3 days over its best way (t1512's click of " vs critic "slowClick: 44 clicks reckoned (4 not), 4 ashore; worst 1.7 days over its best way (t1512's click of " |

## New seeds

| family | seed | exit | what it says |
|---|---|---|---|
| diploInvariants.ts random | 60001 (for 20429) | 0 | seed 60001 random to day 3650: 0 broken, #t |
| diploInvariants.ts scenario | 60101 (for 20413) | 0 | seed 60101 scenario to day 3650: 0 broken, #t |
| diploInvariants.ts scenario --heroes | 60201 (for 20609) | 0 | seed 60201 scenario to day 3650: 0 broken, #t |
| diploInvariants.ts random --world random | 60301 (for 20611) | 0 | seed 60301 random to day 1825: 0 broken, #t |
| diploInvariants.ts random --heroes | 60401 (for 20813) | 0 | seed 60401 random to day 3650: 0 broken, #t |
| landingInvariants.ts | 60501 (for 19206) | 0 | seed 60501 setup 3517 orders 60501, 120 days: 0 broken, #t |
| c47_far.ts TAG=JAP FOE=CHI | 60601 (for 20661) | 0 | landed={"364":129,"365":117}, landedAfterDays={"364":5.3,"365":4.8} |
| c47_far.ts TAG=ENG FOE=GER | 60701 (for 20665) | 0 | landed={"271":142,"274":142}, landedAfterDays={"271":5.8,"274":5.8} |
| c47_far.ts TAG=USA FOE=JAP | 60801 (for 20667) | 0 | landed={"613":871}, landedAfterDays={"613":36.2} |
| c47_far.ts TAG=ITA FOE=ENG | 60901 (for 20843) | 0 | firstL="", landed={}, landedAfterDays={} |
| c47_far.ts TAG=GER FOE=ENG | 61001 (for 20845) | 0 | landed={}, landedAfterDays={} |
| c47_far.ts TAG=USA FOE=ENG | 61101 (for 3517) | 0 | landed={}, landedAfterDays={} |
| c51_sunk_save.ts | 61201 (for 3517) | 0 | sailedAt=3, sunkAt=27, landedAt={} |
| c47_sunk.ts | 61301 (for 3517) | 0 | sailedAt=3, sunkAt=27, landedAt={} |
| c51_rise.ts | 61401 (for 20429) | 0 | t13159 DEI living 1 overlord NED / NED living 1 / atWar false / wars with DEI: |
| worldInvariants.ts | 61501 (for 20637) | 0 | seed 61501 1938 economy,navy,air,nukes,bonds,heroes to day 180: 0 broken, #t |
| worldInvariants.ts --heroes | 61601 (for 20853) | 0 | seed 61601 1938 economy,navy,air,nukes,bonds,heroes to day 365: 0 broken, #t |
| worldInvariants.ts --world random | 61701 (for 20855) | 0 | seed 61701 random economy,navy,air,nukes,bonds,heroes to day 365: 0 broken, #t |
| workerDeterminism.ts | 61801 (for 3517) | 0 | every: end eea62f05 same |
