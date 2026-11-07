# Replay of critic run 50 at HEAD

65 jobs: 30 same as the critic's, 35 differ, 0 failed (exit not 0); 95 on new seeds. 0 s, 6 at a time.

## Cases that differ or failed

| job | exit | the replay ← the critic | first line that differs |
|---|---|---|---|
| c50_li_19206_jap.log | 0 | seed 19206 setup 3517 orders 19206, 120 days: 0 broken, #t ← critic: seed 19206 setup 3517 orders 19206, 120 days: 0 broken, #t | line 1: replay "slowClick: 41 clicks reckoned (7 not), 2 ashore; worst 2.9 days over its best way (t98's click of 36" vs critic "note: 364 longest in a gathering landing 3.8 days, 0.6 of them with no ground gained" |
| c50_li_19207_jap.log | 0 | seed 19207 setup 3517 orders 19207, 120 days: 0 broken, #t ← critic: seed 19207 setup 3517 orders 19207, 120 days: 0 broken, #t | line 1: replay "slowClick: 30 clicks reckoned (11 not), 0 ashore; worst none" vs critic "note: 364 longest in a gathering landing 3.5 days, 0.3 of them with no ground gained" |
| c50_li_19113_eng.log | 0 | seed 19113 setup 15101 orders 19113, 120 days: 0 broken, #t ← critic: seed 19113 setup 15101 orders 19113, 120 days: 0 broken, #t | line 1: replay "slowClick: 11 clicks reckoned (20 not), 2 ashore; worst 1.6 days over its best way (t1323's click of" vs critic "note: 271 longest in a gathering landing 3.2 days, 1.0 of them with no ground gained" |
| c50_li_18705_jap.log | 0 | seed 18705 setup 3517 orders 18705, 120 days: 0 broken, #t ← critic: seed 18705 setup 3517 orders 18705, 120 days: 0 broken, #t | line 1: replay "slowClick: 36 clicks reckoned (7 not), 3 ashore; worst -0.1 days over its best way (t417's click of " vs critic "note: 364 longest in a gathering landing 5.6 days, 1.2 of them with no ground gained" |
| c50_li_19111_jap.log | 0 | seed 19111 setup 3517 orders 19111, 120 days: 0 broken, #t ← critic: seed 19111 setup 3517 orders 19111, 120 days: 0 broken, #t | line 1: replay "slowClick: 34 clicks reckoned (5 not), 3 ashore; worst -1.0 days over its best way (t1189's click of" vs critic "note: 364 longest in a gathering landing 2.7 days, 2.0 of them with no ground gained" |
| c50_li_20621_jap.log | 0 | seed 20621 setup 3517 orders 20621, 120 days: 0 broken, #t ← critic: seed 20621 setup 3517 orders 20621, 120 days: 0 broken, #t | line 1: replay "slowClick: 27 clicks reckoned (9 not), 0 ashore; worst none" vs critic "note: 364 longest in a gathering landing 15.5 days, 1.3 of them with no ground gained" |
| c50_li_20623_eng.log | 0 | seed 20623 setup 15101 orders 20623, 120 days: 0 broken, #t ← critic: seed 20623 setup 15101 orders 20623, 120 days: 0 broken, #t | line 1: replay "slowClick: 6 clicks reckoned (19 not), 2 ashore; worst 0.8 days over its best way (t415's click of 2" vs critic "note: 270 longest in a gathering landing 1.4 days, 0.4 of them with no ground gained" |
| c50_li_20629_jap.log | 0 | seed 20629 setup 3517 orders 20629, 120 days: 0 broken, #t ← critic: seed 20629 setup 3517 orders 20629, 120 days: 0 broken, #t | line 1: replay "slowClick: 34 clicks reckoned (10 not), 2 ashore; worst 3.8 days over its best way (t2200's click of" vs critic "note: 364 longest in a gathering landing 7.5 days, 1.1 of them with no ground gained" |
| c50_li_20673_jap.log | 0 | seed 20673 setup 3517 orders 20673, 120 days: 0 broken, #t ← critic: seed 20673 setup 3517 orders 20673, 120 days: 0 broken, #t | line 1: replay "slowClick: 39 clicks reckoned (2 not), 2 ashore; worst -1.2 days over its best way (t239's click of " vs critic "note: 364 longest in a gathering landing 8.2 days, 0.8 of them with no ground gained" |
| c50_li_20821_jap.log | 0 | seed 20821 setup 3517 orders 20821, 120 days: 0 broken, #t ← critic: seed 20821 setup 3517 orders 20821, 120 days: 0 broken, #t | line 1: replay "slowClick: 31 clicks reckoned (8 not), 2 ashore; worst 2.2 days over its best way (t1497's click of " vs critic "note: 364 longest in a gathering landing 13.4 days, 1.4 of them with no ground gained" |
| c50_li_20823_eng.log | 0 | seed 20823 setup 15101 orders 20823, 120 days: 0 broken, #t ← critic: seed 20823 setup 15101 orders 20823, 120 days: 0 broken, #t | line 1: replay "slowClick: 7 clicks reckoned (2 not), 5 ashore; worst -0.6 days over its best way (t131's click of 2" vs critic "note: 270 longest in a gathering landing 0.6 days, 0.2 of them with no ground gained" |
| c50_li_20825_jap.log | 0 | seed 20825 setup 3517 orders 20825, 120 days: 0 broken, #t ← critic: seed 20825 setup 3517 orders 20825, 120 days: 0 broken, #t | line 1: replay "slowClick: 29 clicks reckoned (5 not), 2 ashore; worst 0.6 days over its best way (t1933's click of " vs critic "note: 364 longest in a gathering landing 1.6 days, 0.9 of them with no ground gained" |
| c50_li_20827_eng.log | 0 | seed 20827 setup 15101 orders 20827, 120 days: 0 broken, #t ← critic: seed 20827 setup 15101 orders 20827, 120 days: 0 broken, #t | line 1: replay "slowClick: 9 clicks reckoned (12 not), 1 ashore; worst 4.6 days over its best way (t708's click of 2" vs critic "note: 270 longest in a gathering landing 9.3 days, 0.8 of them with no ground gained" |
| c50_li_20829_jap.log | 0 | seed 20829 setup 3517 orders 20829, 120 days: 0 broken, #t ← critic: seed 20829 setup 3517 orders 20829, 120 days: 0 broken, #t | line 1: replay "slowClick: 44 clicks reckoned (4 not), 4 ashore; worst 1.7 days over its best way (t1512's click of " vs critic "note: 364 longest in a gathering landing 5.3 days, 5.0 of them with no ground gained" |
| c50_li_20831_jap.log | 0 | seed 20831 setup 3517 orders 20831, 120 days: 0 broken, #t ← critic: seed 20831 setup 3517 orders 20831, 120 days: 0 broken, #t | line 1: replay "slowClick: 29 clicks reckoned (11 not), 4 ashore; worst 0.1 days over its best way (t1247's click of" vs critic "note: 364 longest in a gathering landing 4.9 days, 2.3 of them with no ground gained" |
| c50_li_20625_jap_g1.log | 0 | seed 20625 setup 3517 orders 20625, 120 days: 0 broken, #t ← critic: seed 20625 setup 3517 orders 20625, 120 days: 0 broken, #t | line 1: replay "slowClick: 16 clicks reckoned (13 not), 1 ashore; worst -0.5 days over its best way (t20's click of " vs critic "note: 364 longest in a gathering landing 5.7 days, 0.8 of them with no ground gained" |
| c50_li_20627_eng_g2.log | 0 | seed 20627 setup 15101 orders 20627, 120 days: 0 broken, #t ← critic: seed 20627 setup 15101 orders 20627, 120 days: 0 broken, #t | line 1: replay "slowClick: 14 clicks reckoned (16 not), 5 ashore; worst 2.3 days over its best way (t708's click of " vs critic "note: 270 longest in a gathering landing 3.1 days, 0.4 of them with no ground gained" |
| c50_li_20833_jap_g1.log | 0 | seed 20833 setup 3517 orders 20833, 120 days: 0 broken, #t ← critic: seed 20833 setup 3517 orders 20833, 120 days: 0 broken, #t | line 1: replay "slowClick: 8 clicks reckoned (28 not), 0 ashore; worst none" vs critic "note: 364 longest in a gathering landing 11.0 days, 1.1 of them with no ground gained" |
| c50_li_20835_eng_g2.log | 0 | seed 20835 setup 15101 orders 20835, 120 days: 0 broken, #t ← critic: seed 20835 setup 15101 orders 20835, 120 days: 0 broken, #t | line 1: replay "slowClick: 10 clicks reckoned (4 not), 3 ashore; worst 0.0 days over its best way (t372's click of 2" vs critic "note: 270 longest in a gathering landing 9.6 days, 0.5 of them with no ground gained" |
| c50_far_20661_jap_sh.json | 0 | landed={"364":129,"365":117}, landedAfterDays={"364":5.3,"365":4.8} ← critic: landed={"364":632,"365":633}, landedAfterDays={"364":26.3,"365":26.3} | line 15: replay " "firstL": "landing 1 port Tokyo fleets 1136 water 1715,412 land 1715,411 TO 1715.0293333333334,413." vs critic " "firstL": "landing 1 port Tokyo fleets 1136,1144 water 1715,412 land 1715,411 TO 1715.0293333333334"; line 15: replay " "firstL": "landing 1 port Tokyo fleets 1136 water 1715,412 land 1715,411 TO 1715.0293333333334,413." vs critic " "firstL": "landing 1 port Tokyo fleets 1136,1144 water 1715,412 land 1715,411 TO 1715.0293333333334" |
| c50_far_20841_jap_sh3.json | 0 | landed={"364":129,"365":119,"366":131}, landedAfterDays={"364":5.3,"365":4.9,"366":5.4} ← critic: landed={"364":951,"365":952,"366":952}, landedAfterDays={"364":39.5,"365":39.6,"366":39.6} | line 17: replay " "firstL": "landing 1 port Tokyo fleets 1136 water 1715,412 land 1715,411 TO 1715.0293333333334,413." vs critic " "firstL": "landing 1 port Tokyo fleets 1136,1144,1152 water 1715,412 land 1715,411 TO 1715.02933333"; line 17: replay " "firstL": "landing 1 port Tokyo fleets 1136 water 1715,412 land 1715,411 TO 1715.0293333333334,413." vs critic " "firstL": "landing 1 port Tokyo fleets 1136,1144,1152 water 1715,412 land 1715,411 TO 1715.02933333" |
| c50_far_20845_ger_norwich.json | 0 | landed={}, landedAfterDays={} ← critic: landed={}, landedAfterDays={} | line 25: replay "  "t404 kind28 4 b147 1061.2,314.5"," vs critic "  "t222 kind8 4 b1 1080.5,259.5","; line 25: replay "  "t404 kind28 4 b147 1061.2,314.5"," vs critic "  "t222 kind8 4 b1 1080.5,259.5"," |
| c50_far_usachi_eng.json | 0 | landed={}, landedAfterDays={} ← critic: landed={}, landedAfterDays={} | line 49: replay "  "t918 kind50 615 b1454 579.2,366.8"," vs critic "  "t918 kind50 615 b1454 579.4,368.4","; line 49: replay "  "t918 kind50 615 b1454 579.2,366.8"," vs critic "  "t918 kind50 615 b1454 579.4,368.4"," |
| c50_far_save1.json | 0 | port="Norfolk", firstShut=895, savedAt=273 ← critic: port="Norfolk", firstShut=895, savedAt=273 | line 40: replay "  "t918 kind50 615 b1454 579.2"," vs critic "  "t918 kind50 615 b1454 579.4","; line 40: replay "  "t918 kind50 615 b1454 579.2"," vs critic "  "t918 kind50 615 b1454 579.4"," |
| c50_sunksave_3517_n3k1.json | 0 | sailedAt=3, sunkAt=27, landedAt={} ← critic: sailedAt=830, sunkAt=854, landedAt={} | line 11: replay " "sailedAt": 3," vs critic " "sailedAt": 830,"; line 11: replay " "sailedAt": 3," vs critic " "sailedAt": 830," |
| c50_sunk_3517_n3k1.json | 0 | sailedAt=3, sunkAt=27, landedAt={} ← critic: sailedAt=830, sunkAt=854, landedAt={} | line 11: replay " "sailedAt": 3," vs critic " "sailedAt": 830,"; line 11: replay " "sailedAt": 3," vs critic " "sailedAt": 830," |
| c50_sunksave_3517_n3k2.json | 0 | sailedAt=8, sunkAt=32, landedAt={} ← critic: sailedAt=830, sunkAt=854, landedAt={} | line 11: replay " "sailedAt": 8," vs critic " "sailedAt": 830,"; line 11: replay " "sailedAt": 8," vs critic " "sailedAt": 830," |
| c50_sunk_3517_n3k2.json | 0 | sailedAt=8, sunkAt=32, landedAt={} ← critic: sailedAt=830, sunkAt=854, landedAt={} | line 11: replay " "sailedAt": 8," vs critic " "sailedAt": 830,"; line 11: replay " "sailedAt": 8," vs critic " "sailedAt": 830," |
| c50_sunksave_3517_n4k2.json | 0 | sailedAt=8, sunkAt=32, landedAt={} ← critic: sailedAt=1121, sunkAt=1145, landedAt={} | line 12: replay " "sailedAt": 8," vs critic " "sailedAt": 1121,"; line 12: replay " "sailedAt": 8," vs critic " "sailedAt": 1121," |
| c50_sunk_3517_n4k2.json | 0 | sailedAt=8, sunkAt=32, landedAt={} ← critic: sailedAt=1121, sunkAt=1145, landedAt={} | line 12: replay " "sailedAt": 8," vs critic " "sailedAt": 1121,"; line 12: replay " "sailedAt": 8," vs critic " "sailedAt": 1121," |
| c50_sunksave_3517_n5k3.json | 0 | sailedAt=8, sunkAt=32, landedAt={} ← critic: sailedAt=1121, sunkAt=1145, landedAt={} | line 12: replay " "sailedAt": 8," vs critic " "sailedAt": 1121,"; line 12: replay " "sailedAt": 8," vs critic " "sailedAt": 1121," |
| c50_sunk_3517_n5k3.json | 0 | sailedAt=8, sunkAt=32, landedAt={} ← critic: sailedAt=1121, sunkAt=1145, landedAt={} | line 12: replay " "sailedAt": 8," vs critic " "sailedAt": 1121,"; line 12: replay " "sailedAt": 8," vs critic " "sailedAt": 1121," |
| c50_sunksave_3517_n2k0.json | 0 | sailedAt=8, sunkAt=32, landedAt={} ← critic: sailedAt=511, sunkAt=535, landedAt={} | line 10: replay " "sailedAt": 8," vs critic " "sailedAt": 511,"; line 10: replay " "sailedAt": 8," vs critic " "sailedAt": 511," |
| c50_sunk_3517_n2k0.json | 0 | sailedAt=8, sunkAt=32, landedAt={} ← critic: sailedAt=511, sunkAt=535, landedAt={} | line 10: replay " "sailedAt": 8," vs critic " "sailedAt": 511,"; line 10: replay " "sailedAt": 8," vs critic " "sailedAt": 511," |
| c50_sunksave_20847_n3k2.json | 0 | sailedAt=8, sunkAt=32, landedAt={} ← critic: sailedAt=830, sunkAt=854, landedAt={} | line 11: replay " "sailedAt": 8," vs critic " "sailedAt": 830,"; line 11: replay " "sailedAt": 8," vs critic " "sailedAt": 830," |

## New seeds

| family | seed | exit | what it says |
|---|---|---|---|
| diploInvariants.ts random | 60001 (for 20429) | 0 | seed 60001 random to day 3650: 0 broken, #t |
| diploInvariants.ts random | 60003 (for 20429) | 0 | seed 60003 random to day 3650: 0 broken, #t |
| diploInvariants.ts random | 60005 (for 20429) | 0 | seed 60005 random to day 3650: 0 broken, #t |
| diploInvariants.ts random | 60007 (for 20429) | 0 | seed 60007 random to day 3650: 0 broken, #t |
| diploInvariants.ts random | 60009 (for 20429) | 0 | seed 60009 random to day 3650: 0 broken, #t |
| diploInvariants.ts scenario | 60101 (for 20413) | 0 | seed 60101 scenario to day 3650: 0 broken, #t |
| diploInvariants.ts scenario | 60103 (for 20413) | 0 | seed 60103 scenario to day 3650: 0 broken, #t |
| diploInvariants.ts scenario | 60105 (for 20413) | 0 | seed 60105 scenario to day 3650: 0 broken, #t |
| diploInvariants.ts scenario | 60107 (for 20413) | 0 | seed 60107 scenario to day 3650: 0 broken, #t |
| diploInvariants.ts scenario | 60109 (for 20413) | 0 | seed 60109 scenario to day 3650: 0 broken, #t |
| diploInvariants.ts scenario --heroes | 60201 (for 20609) | 0 | seed 60201 scenario to day 3650: 0 broken, #t |
| diploInvariants.ts scenario --heroes | 60203 (for 20609) | 0 | seed 60203 scenario to day 3650: 0 broken, #t |
| diploInvariants.ts scenario --heroes | 60205 (for 20609) | 0 | seed 60205 scenario to day 3650: 0 broken, #t |
| diploInvariants.ts scenario --heroes | 60207 (for 20609) | 0 | seed 60207 scenario to day 3650: 0 broken, #t |
| diploInvariants.ts scenario --heroes | 60209 (for 20609) | 0 | seed 60209 scenario to day 3650: 0 broken, #t |
| diploInvariants.ts random --world random | 60301 (for 20611) | 0 | seed 60301 random to day 1825: 0 broken, #t |
| diploInvariants.ts random --world random | 60303 (for 20611) | 0 | seed 60303 random to day 1825: 0 broken, #t |
| diploInvariants.ts random --world random | 60305 (for 20611) | 0 | seed 60305 random to day 1825: 0 broken, #t |
| diploInvariants.ts random --world random | 60307 (for 20611) | 0 | seed 60307 random to day 1825: 0 broken, #t |
| diploInvariants.ts random --world random | 60309 (for 20611) | 0 | seed 60309 random to day 1825: 0 broken, #t |
| diploInvariants.ts random --heroes | 60401 (for 20813) | 0 | seed 60401 random to day 3650: 0 broken, #t |
| diploInvariants.ts random --heroes | 60403 (for 20813) | 0 | seed 60403 random to day 3650: 0 broken, #t |
| diploInvariants.ts random --heroes | 60405 (for 20813) | 0 | seed 60405 random to day 3650: 0 broken, #t |
| diploInvariants.ts random --heroes | 60407 (for 20813) | 0 | seed 60407 random to day 3650: 0 broken, #t |
| diploInvariants.ts random --heroes | 60409 (for 20813) | 0 | seed 60409 random to day 3650: 0 broken, #t |
| landingInvariants.ts | 60501 (for 19206) | 0 | seed 60501 setup 3517 orders 60501, 120 days: 0 broken, #t |
| landingInvariants.ts | 60503 (for 19206) | 0 | seed 60503 setup 3517 orders 60503, 120 days: 0 broken, #t |
| landingInvariants.ts | 60505 (for 19206) | 0 | seed 60505 setup 3517 orders 60505, 120 days: 0 broken, #t |
| landingInvariants.ts | 60507 (for 19206) | 0 | seed 60507 setup 3517 orders 60507, 120 days: 0 broken, #t |
| landingInvariants.ts | 60509 (for 19206) | 0 | seed 60509 setup 3517 orders 60509, 120 days: 0 broken, #t |
| c47_far.ts TAG=JAP FOE=CHI | 60601 (for 20661) | 0 | landed={"364":129,"365":117}, landedAfterDays={"364":5.3,"365":4.8} |
| c47_far.ts TAG=JAP FOE=CHI | 60603 (for 20661) | 0 | landed={"364":129,"365":117}, landedAfterDays={"364":5.3,"365":4.8} |
| c47_far.ts TAG=JAP FOE=CHI | 60605 (for 20661) | 0 | landed={"364":129,"365":117}, landedAfterDays={"364":5.3,"365":4.8} |
| c47_far.ts TAG=JAP FOE=CHI | 60607 (for 20661) | 0 | landed={"364":129,"365":117}, landedAfterDays={"364":5.3,"365":4.8} |
| c47_far.ts TAG=JAP FOE=CHI | 60609 (for 20661) | 0 | landed={"364":129,"365":117}, landedAfterDays={"364":5.3,"365":4.8} |
| c47_far.ts TAG=ENG FOE=GER | 60701 (for 20665) | 0 | landed={"271":142,"274":142}, landedAfterDays={"271":5.8,"274":5.8} |
| c47_far.ts TAG=ENG FOE=GER | 60703 (for 20665) | 0 | landed={"271":142,"274":142}, landedAfterDays={"271":5.8,"274":5.8} |
| c47_far.ts TAG=ENG FOE=GER | 60705 (for 20665) | 0 | landed={"271":142,"274":142}, landedAfterDays={"271":5.8,"274":5.8} |
| c47_far.ts TAG=ENG FOE=GER | 60707 (for 20665) | 0 | landed={"271":142,"274":142}, landedAfterDays={"271":5.8,"274":5.8} |
| c47_far.ts TAG=ENG FOE=GER | 60709 (for 20665) | 0 | landed={"271":142,"274":142}, landedAfterDays={"271":5.8,"274":5.8} |
| c47_far.ts TAG=USA FOE=JAP | 60801 (for 20667) | 0 | landed={"613":871}, landedAfterDays={"613":36.2} |
| c47_far.ts TAG=USA FOE=JAP | 60803 (for 20667) | 0 | landed={"613":871}, landedAfterDays={"613":36.2} |
| c47_far.ts TAG=USA FOE=JAP | 60805 (for 20667) | 0 | landed={"613":871}, landedAfterDays={"613":36.2} |
| c47_far.ts TAG=USA FOE=JAP | 60807 (for 20667) | 0 | landed={"613":871}, landedAfterDays={"613":36.2} |
| c47_far.ts TAG=USA FOE=JAP | 60809 (for 20667) | 0 | landed={"613":871}, landedAfterDays={"613":36.2} |
| c47_far.ts TAG=ITA FOE=ENG | 60901 (for 20843) | 0 | firstL="", landed={}, landedAfterDays={} |
| c47_far.ts TAG=ITA FOE=ENG | 60903 (for 20843) | 0 | firstL="", landed={}, landedAfterDays={} |
| c47_far.ts TAG=ITA FOE=ENG | 60905 (for 20843) | 0 | firstL="", landed={}, landedAfterDays={} |
| c47_far.ts TAG=ITA FOE=ENG | 60907 (for 20843) | 0 | firstL="", landed={}, landedAfterDays={} |
| c47_far.ts TAG=ITA FOE=ENG | 60909 (for 20843) | 0 | firstL="", landed={}, landedAfterDays={} |
| c47_far.ts TAG=GER FOE=ENG | 61001 (for 20845) | 0 | landed={}, landedAfterDays={} |
| c47_far.ts TAG=GER FOE=ENG | 61003 (for 20845) | 0 | landed={}, landedAfterDays={} |
| c47_far.ts TAG=GER FOE=ENG | 61005 (for 20845) | 0 | landed={}, landedAfterDays={} |
| c47_far.ts TAG=GER FOE=ENG | 61007 (for 20845) | 0 | landed={}, landedAfterDays={} |
| c47_far.ts TAG=GER FOE=ENG | 61009 (for 20845) | 0 | landed={}, landedAfterDays={} |
| c47_far.ts TAG=USA FOE=ENG | 61101 (for 3517) | 0 | landed={}, landedAfterDays={} |
| c47_far.ts TAG=USA FOE=ENG | 61103 (for 3517) | 0 | landed={}, landedAfterDays={} |
| c47_far.ts TAG=USA FOE=ENG | 61105 (for 3517) | 0 | landed={}, landedAfterDays={} |
| c47_far.ts TAG=USA FOE=ENG | 61107 (for 3517) | 0 | landed={}, landedAfterDays={} |
| c47_far.ts TAG=USA FOE=ENG | 61109 (for 3517) | 0 | landed={}, landedAfterDays={} |
| c50_sunk_save.ts | 61201 (for 3517) | 0 | sailedAt=3, sunkAt=27, landedAt={} |
| c50_sunk_save.ts | 61203 (for 3517) | 0 | sailedAt=3, sunkAt=27, landedAt={} |
| c50_sunk_save.ts | 61205 (for 3517) | 0 | sailedAt=3, sunkAt=27, landedAt={} |
| c50_sunk_save.ts | 61207 (for 3517) | 0 | sailedAt=3, sunkAt=27, landedAt={} |
| c50_sunk_save.ts | 61209 (for 3517) | 0 | sailedAt=3, sunkAt=27, landedAt={} |
| c47_sunk.ts | 61301 (for 3517) | 0 | sailedAt=3, sunkAt=27, landedAt={} |
| c47_sunk.ts | 61303 (for 3517) | 0 | sailedAt=3, sunkAt=27, landedAt={} |
| c47_sunk.ts | 61305 (for 3517) | 0 | sailedAt=3, sunkAt=27, landedAt={} |
| c47_sunk.ts | 61307 (for 3517) | 0 | sailedAt=3, sunkAt=27, landedAt={} |
| c47_sunk.ts | 61309 (for 3517) | 0 | sailedAt=3, sunkAt=27, landedAt={} |
| c50_rise.ts | 61401 (for 20429) | 0 | t13159 DEI living 1 overlord NED / NED living 1 / atWar false / wars with DEI: |
| c50_rise.ts | 61403 (for 20429) | 0 | t13105 DEI living 1 overlord NED / NED living 1 / atWar false / wars with DEI: CHI+TIB+ENG+EGY+SUD+BEA+SAF+SRH+NIG+GCO+PAL+TRJ+OMN+RAJ+BUR+CEY+MAL+SAR+AST+NZL+C |
| c50_rise.ts | 61405 (for 20429) | 0 |  |
| c50_rise.ts | 61407 (for 20429) | 0 | t13167 DEI living 1 overlord #0 / NED living 1 / atWar true / wars with DEI: DEI vs NED |
| c50_rise.ts | 61409 (for 20429) | 0 | t13166 DEI living 1 overlord NED / NED living 1 / atWar false / wars with DEI: FRA+AOF+AEF+MAD+FMO+TUN+SYR+LEB+INC+ITA+ALB+NSP+BEL+BCO+NED+DEI+LUX vs BRA+IRQ+DE |
| worldInvariants.ts | 61501 (for 20637) | 0 | seed 61501 1938 economy,navy,air,nukes,bonds,heroes to day 180: 0 broken, #t |
| worldInvariants.ts | 61503 (for 20637) | 0 | seed 61503 1938 economy,navy,air,nukes,bonds,heroes to day 180: 0 broken, #t |
| worldInvariants.ts | 61505 (for 20637) | 0 | seed 61505 1938 economy,navy,air,nukes,bonds,heroes to day 180: 0 broken, #t |
| worldInvariants.ts | 61507 (for 20637) | 0 | seed 61507 1938 economy,navy,air,nukes,bonds,heroes to day 180: 0 broken, #t |
| worldInvariants.ts | 61509 (for 20637) | 0 | seed 61509 1938 economy,navy,air,nukes,bonds,heroes to day 180: 0 broken, #t |
| worldInvariants.ts --heroes | 61601 (for 20853) | 0 | seed 61601 1938 economy,navy,air,nukes,bonds,heroes to day 365: 0 broken, #t |
| worldInvariants.ts --heroes | 61603 (for 20853) | 0 | seed 61603 1938 economy,navy,air,nukes,bonds,heroes to day 365: 0 broken, #t |
| worldInvariants.ts --heroes | 61605 (for 20853) | 0 | seed 61605 1938 economy,navy,air,nukes,bonds,heroes to day 365: 0 broken, #t |
| worldInvariants.ts --heroes | 61607 (for 20853) | 0 | seed 61607 1938 economy,navy,air,nukes,bonds,heroes to day 365: 0 broken, #t |
| worldInvariants.ts --heroes | 61609 (for 20853) | 0 | seed 61609 1938 economy,navy,air,nukes,bonds,heroes to day 365: 0 broken, #t |
| worldInvariants.ts --world random | 61701 (for 20855) | 0 | seed 61701 random economy,navy,air,nukes,bonds,heroes to day 365: 0 broken, #t |
| worldInvariants.ts --world random | 61703 (for 20855) | 0 | seed 61703 random economy,navy,air,nukes,bonds,heroes to day 365: 0 broken, #t |
| worldInvariants.ts --world random | 61705 (for 20855) | 0 | seed 61705 random economy,navy,air,nukes,bonds,heroes to day 365: 0 broken, #t |
| worldInvariants.ts --world random | 61707 (for 20855) | 0 | seed 61707 random economy,navy,air,nukes,bonds,heroes to day 365: 0 broken, #t |
| worldInvariants.ts --world random | 61709 (for 20855) | 0 | seed 61709 random economy,navy,air,nukes,bonds,heroes to day 365: 0 broken, #t |
| workerDeterminism.ts | 61801 (for 3517) | 0 | every: end eea62f05 same |
| workerDeterminism.ts | 61803 (for 3517) | 0 | every: end 769dd51f same |
| workerDeterminism.ts | 61805 (for 3517) | 0 | every: end c15ea1e5 same |
| workerDeterminism.ts | 61807 (for 3517) | 0 | every: end 5ab29452 same |
| workerDeterminism.ts | 61809 (for 3517) | 0 | every: end 34a5382d same |
