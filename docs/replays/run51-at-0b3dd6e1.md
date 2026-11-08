# Replay of critic run 51 at HEAD

65 jobs: 63 same as the critic's, 2 differ, 0 failed (exit not 0). 2174 s, 4 at a time.

## Cases that differ or failed

| job | exit | the replay ← the critic | first line that differs |
|---|---|---|---|
| c51_li_18705_jap.log | 0 | seed 18705 setup 3517 orders 18705, 120 days: 0 broken, #t ← critic: seed 18705 setup 3517 orders 18705, 120 days: 0 broken, #t | line 1: replay "slowClick: 37 clicks reckoned (6 not), 3 ashore; worst -0.1 days over its best way (t417's click of " vs critic "slowClick: 36 clicks reckoned (7 not), 3 ashore; worst -0.1 days over its best way (t417's click of " |
| c51_li_20829_jap.log | 0 | seed 20829 setup 3517 orders 20829, 120 days: 0 broken, #t ← critic: seed 20829 setup 3517 orders 20829, 120 days: 0 broken, #t | line 1: replay "slowClick: 39 clicks reckoned (9 not), 4 ashore; worst 4.3 days over its best way (t1512's click of " vs critic "slowClick: 44 clicks reckoned (4 not), 4 ashore; worst 1.7 days over its best way (t1512's click of " |

