# Replay of critic run 52 at HEAD

35 jobs: 32 same as the critic's, 3 differ, 0 failed (exit not 0); 13 on new seeds. 2293 s, 3 at a time.

## Cases that differ or failed

| job | exit | the replay ← the critic | first line that differs |
|---|---|---|---|
| c52_seed7019_y20.bin | 0 | done: 20 years, #t wall, mean tick #t, final hash 6a8590fe → .cache/runs/1938-seed7019-20y.json ← critic: done: 20 years, #t wall, mean tick #t, final hash 6a8590fe → .cache/runs/1938-seed7019-20y.json | line 3: replay "> tsx tools/headless/cli.ts --scenario 1938 --seed 7019 --years 20 --save C:/Git/Warism/critic/c53_r" vs critic "> tsx tools/headless/cli.ts --scenario 1938 --seed 7019 --years 20 --save critic/c52_seed7019_y20.bi" |
| c52_lrows_all.json | 0 | 108 cases, 19905 hours: 0 broken; by kind {"missing":0,"twice":0,"words":0,"state":0,"outcome":0}; #t ← critic: 108 cases, 19905 hours: 0 broken; by kind {"missing":0,"twice":0,"words":0,"state":0,"outcome":0}; #t | line 24: replay "grid 3517 redirect 6 aboard: 155 h, 0 broken, 2 rows at the end" vs critic "grid 3517 redirect 6 aboard: 155 h, 0 broken, 1 rows at the end" |
| c52_sb_22061.json | 0 | seed 22061 1938 scenario, 3 years: 65 sea battles, 66 sinkings out of battle; C:/Git/Warism/critic/c53_replay/c52_sb_22061.json ← critic: seed 22061 1938 scenario, 3 years: 65 sea battles, 66 sinkings out of battle; critic/c52_sb_22061.json | line 66: replay "seed 22061 1938 scenario, 3 years: 65 sea battles, 66 sinkings out of battle; C:/Git/Warism/critic/c" vs critic "seed 22061 1938 scenario, 3 years: 65 sea battles, 66 sinkings out of battle; critic/c52_sb_22061.js" |

## New seeds

| family | seed | exit | what it says |
|---|---|---|---|
| diploInvariants.ts random | 60001 (for 21001) | 0 | seed 60001 random to day 3650: 0 broken, #t |
| diploInvariants.ts scenario --heroes | 60101 (for 21009) | 0 | seed 60101 scenario to day 3650: 0 broken, #t |
| diploInvariants.ts random --world random | 60201 (for 21011) | 0 | seed 60201 random to day 1825: 0 broken, #t |
| diploInvariants.ts random --heroes | 60301 (for 21013) | 0 | seed 60301 random to day 3650: 0 broken, #t |
| landingInvariants.ts | 60401 (for 21021) | 0 | seed 60401 setup 3517 orders 60401, 120 days: 0 broken, #t |
| c47_far.ts TAG=JAP FOE=CHI | 60501 (for 21041) | 0 | landed={"364":129,"365":119,"366":131}, landedAfterDays={"364":5.3,"365":4.9,"366":5.4} |
| c47_far.ts TAG=GER FOE=ENG | 60601 (for 21043) | 0 | landed={}, landedAfterDays={} |
| c47_far.ts TAG=ENG FOE=GER | 60701 (for 21045) | 0 | landed={"270":142,"271":142,"272":141,"274":141}, landedAfterDays={"270":5.8,"271":5.8,"272":5.8,"274":5.8} |
| worldInvariants.ts | 60801 (for 21051) | 0 | seed 60801 1938 economy,navy,air,nukes,bonds,heroes to day 180: 0 broken, #t |
| worldInvariants.ts --heroes | 60901 (for 21053) | 0 | seed 60901 1938 economy,navy,air,nukes,bonds,heroes to day 365: 0 broken, #t |
| workerDeterminism.ts | 61001 (for 21059) | 0 | every: end a2102bcc same |
| seaBattles.ts scenario --years --out | 61101 (for 22061) | 0 | seed 61101 1938 scenario, 3 years: 54 sea battles, 222 sinkings out of battle; C:/Git/Warism/critic/c53_replay/new/s61101_c52_sb_22061.json |
| c52_dest.ts | 61201 (for 21105) | 0 | target={"cell":[1106.5,383.5],"owner":"ENG","ctrl":"ENG"} |
