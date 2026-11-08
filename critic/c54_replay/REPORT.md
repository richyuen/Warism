# Replay of critic run 53 at HEAD

18 jobs: 15 same as the critic's, 3 differ, 0 failed (exit not 0); 11 on new seeds. 1905 s, 2 at a time.

## Cases that differ or failed

| job | exit | the replay ← the critic | first line that differs |
|---|---|---|---|
| c53_sb_23061.json | 0 | seed 23061 1938 scenario, 3 years: 61 sea battles, 81 sinkings out of battle; C:/Git/Warism/critic/c54_replay/c53_sb_23061.json ← critic: seed 23061 1938 scenario, 3 years: 61 sea battles, 81 sinkings out of battle; critic/c53_sb_23061.json | line 62: replay "seed 23061 1938 scenario, 3 years: 61 sea battles, 81 sinkings out of battle; C:/Git/Warism/critic/c" vs critic "seed 23061 1938 scenario, 3 years: 61 sea battles, 81 sinkings out of battle; critic/c53_sb_23061.js" |
| c53_repulse_23071.json | 0 | broken 0: [] ← critic: broken 0: [] | line 210: replay "       "over: 1 landed, 2 thrown back"," vs critic "       "over: 1 landed, 2 came ashore away from Bremerhaven","; line 11: replay "t201 [{"click":1,"parts":[[1,"Portsmouth","over","over: 1 landed, 2 thrown back",{"kind":"landed","t" vs critic "t201 [{"click":1,"parts":[[1,"Portsmouth","over","over: 1 landed, 2 came ashore away from Bremerhave" |
| c53_repulse_20861.json | 0 | broken 0: [] ← critic: broken 0: [] | line 597: replay "     "says": "1 of 3 ashore; at sea: lands in about a day"" vs critic "     "says": "at sea: lands in about a day""; line 18: replay "t120 [{"click":1,"parts":[[1,"Tokyo","sailing","at sea: lands in about a day",null],[2,"Ōsaka","over" vs critic "t120 [{"click":1,"parts":[[1,"Tokyo","sailing","at sea: lands in about a day",null],[2,"Ōsaka","over" |

## New seeds

| family | seed | exit | what it says |
|---|---|---|---|
| landingInvariants.ts | 60001 (for 23021) | 0 | seed 60001 setup 3517 orders 60001, 120 days: 0 broken, #t |
| diploInvariants.ts random | 60101 (for 23001) | 0 | seed 60101 random to day 3650: 0 broken, #t |
| diploInvariants.ts scenario --heroes | 60201 (for 23003) | 0 | seed 60201 scenario to day 3650: 0 broken, #t |
| diploInvariants.ts random --world random | 60301 (for 23005) | 0 | seed 60301 random to day 1825: 0 broken, #t |
| workerDeterminism.ts | 60401 (for 23059) | 0 | every: end 4895a8ec same |
| worldInvariants.ts | 60501 (for 23051) | 0 | seed 60501 1938 economy,navy,air,nukes,bonds,heroes to day 3650: 0 broken, #t |
| seaBattles.ts scenario --years --out | 60601 (for 23061) | 0 | seed 60601 1938 scenario, 3 years: 79 sea battles, 82 sinkings out of battle; C:/Git/Warism/critic/c54_replay/new/s60601_c53_sb_23061.json |
| c53_repulse.ts ENG GER | 60701 (for 23071) | 0 | broken 0: [] |
| c53_repland.ts scenario --years | 60801 (for 23081) | 0 | seed 60801 scenario 3 y: 1 thrown back, 0 of them ashore within 48 h (0 within 3 cells of where thrown back) |
| c53_repland.ts random --years | 60901 (for 23083) | 0 | seed 60901 random 3 y: 0 thrown back, 0 of them ashore within 48 h (0 within 3 cells of where thrown back) |
| c53_repulse.ts JAP CHI | 61001 (for 20861) | 0 | broken 0: [] |
