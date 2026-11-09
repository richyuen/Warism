# Replay of critic run 55 at HEAD

27 jobs: 17 same as the critic's, 10 differ, 0 failed (exit not 0). 2300 s, 3 at a time.

## Cases that differ or failed

| job | exit | the replay ← the critic | first line that differs |
|---|---|---|---|
| c55_seed7019_y20.bin | 0 | done: 20 years, #t wall, mean tick #t, final hash 18430918 → .cache/runs/1938-seed7019-20y.json ← critic: done: 20 years, #t wall, mean tick #t, final hash 18430918 → .cache/runs/1938-seed7019-20y.json | line 3: replay "> tsx tools/headless/cli.ts --scenario 1938 --seed 7019 --years 20 --save C:/Git/Warism/critic/c56_r" vs critic "> tsx tools/headless/cli.ts --scenario 1938 --seed 7019 --years 20 --save critic/c55_seed7019_y20.bi" |
| c55_toparea_21099.json | 0 | done: C:/Git/Warism/critic/c56_replay/c55_toparea_21099.json ← critic: done: critic/c55_toparea_21099.json | line 28: replay "done: C:/Git/Warism/critic/c56_replay/c55_toparea_21099.json" vs critic "done: critic/c55_toparea_21099.json" |
| c55_toparea_20899.json | 0 | done: C:/Git/Warism/critic/c56_replay/c55_toparea_20899.json ← critic: done: critic/c55_toparea_20899.json | line 28: replay "done: C:/Git/Warism/critic/c56_replay/c55_toparea_20899.json" vs critic "done: critic/c55_toparea_20899.json" |
| c55_toparea_24099.json | 0 | done: C:/Git/Warism/critic/c56_replay/c55_toparea_24099.json ← critic: done: critic/c55_toparea_24099.json | line 28: replay "done: C:/Git/Warism/critic/c56_replay/c55_toparea_24099.json" vs critic "done: critic/c55_toparea_24099.json" |
| c55_toparea_26099.json | 0 | done: C:/Git/Warism/critic/c56_replay/c55_toparea_26099.json ← critic: done: critic/c55_toparea_26099.json | line 28: replay "done: C:/Git/Warism/critic/c56_replay/c55_toparea_26099.json" vs critic "done: critic/c55_toparea_26099.json" |
| c55_li_26021_jap.log | 0 | seed 26021 setup 3517 orders 26021, 120 days: 0 broken, #t ← critic: seed 26021 setup 3517 orders 26021, 120 days: 0 broken, #t | line 1: replay "slowClick: 12 clicks reckoned (28 not), 1 ashore; worst -1.3 days over its best way (t729's click of" vs critic "slowClick: 24 clicks reckoned (16 not), 2 ashore; worst -1.3 days over its best way (t729's click of" |
| c55_li_26023_eng.log | 0 | seed 26023 setup 15101 orders 26023, 120 days: 0 broken, #t ← critic: seed 26023 setup 15101 orders 26023, 120 days: 0 broken, #t | line 1: replay "slowClick: 10 clicks reckoned (23 not), 3 ashore; worst 2.8 days over its best way (t607's click of " vs critic "slowClick: 13 clicks reckoned (20 not), 3 ashore; worst 2.8 days over its best way (t607's click of " |
| c55_li_26025_jap_g1.log | 0 | seed 26025 setup 3517 orders 26025, 120 days: 0 broken, #t ← critic: seed 26025 setup 3517 orders 26025, 120 days: 0 broken, #t | line 1: replay "slowClick: 4 clicks reckoned (37 not), 0 ashore; worst none" vs critic "slowClick: 16 clicks reckoned (25 not), 0 ashore; worst none" |
| c55_li_26027_eng_g2.log | 0 | seed 26027 setup 15101 orders 26027, 120 days: 0 broken, #t ← critic: seed 26027 setup 15101 orders 26027, 120 days: 0 broken, #t | line 1: replay "slowClick: 7 clicks reckoned (3 not), 3 ashore; worst 0.0 days over its best way (t265's click of 27" vs critic "slowClick: 10 clicks reckoned (0 not), 3 ashore; worst 0.0 days over its best way (t265's click of 2" |
| c55_sb_26061.json | 0 | seed 26061 1938 scenario, 3 years: 48 sea battles, 70 sinkings out of battle; C:/Git/Warism/critic/c56_replay/c55_sb_26061.json ← critic: seed 26061 1938 scenario, 3 years: 48 sea battles, 70 sinkings out of battle; critic/c55_sb_26061.json | line 49: replay "seed 26061 1938 scenario, 3 years: 48 sea battles, 70 sinkings out of battle; C:/Git/Warism/critic/c" vs critic "seed 26061 1938 scenario, 3 years: 48 sea battles, 70 sinkings out of battle; critic/c55_sb_26061.js" |

