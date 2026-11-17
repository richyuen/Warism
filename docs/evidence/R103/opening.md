# R103: the wars' openings with the target's answer and without

`tools/diag/warOpening.ts <out> --years 3 --neighbours [--no-answer] <seed>` on seeds 99, 7, 1938, 4483, 2081, 6047 and
31001 to 31006 (2026-11-16); R97b's rows are that item's runs of the same seeds on its build.

```
no-answer 12 seeds: wars with a border 413 (34.4 a seed), ran a month 287; attacker ahead 231 (80 %), defender ahead 41 (14 %), no land 15 (5 %); attacker with no man within 300 km 30 (10 %); attacker never ordered over the front 6 (2 %)
with-answer 12 seeds: wars with a border 408 (34.0 a seed), ran a month 291; attacker ahead 231 (79 %), defender ahead 40 (14 %), no land 20 (7 %); attacker with no man within 300 km 32 (11 %); attacker never ordered over the front 8 (3 %)
R97b-seen 6 seeds: wars with a border 180 (30.0 a seed), ran a month 111; attacker ahead 84 (76 %), defender ahead 18 (16 %), no land 9 (8 %); attacker with no man within 300 km 10 (9 %); attacker never ordered over the front 1 (1 %)
R97b-unseen 6 seeds: wars with a border 156 (26.0 a seed), ran a month 105; attacker ahead 87 (83 %), defender ahead 13 (12 %), no land 5 (5 %); attacker with no man within 300 km 4 (4 %); attacker never ordered over the front 1 (1 %)
```

By whether the war was prepared (a massing) or declared at once; "near": within 300 km of the border as the war begins.

```
R97b           prepared   237 wars: defender near the front, median 11 % of its men (mean 43 %), none near in 102; attacker median 71 %, none near in 1; of 173 that ran a month the attacker with none near 1 (0.6 %)
R97b           at once     93 wars: defender near the front, median 100 % of its men (mean 71 %), none near in 21; attacker median 18 %, none near in 22; of 43 that ran a month the attacker with none near 13 (30.2 %)
no-answer      prepared   269 wars: defender near the front, median  5 % of its men (mean 38 %), none near in 128; attacker median 72 %, none near in 2; of 207 that ran a month the attacker with none near 2 (1.0 %)
no-answer      at once    138 wars: defender near the front, median 100 % of its men (mean 66 %), none near in 34; attacker median 12 %, none near in 38; of 80 that ran a month the attacker with none near 28 (35.0 %)
with-answer    prepared   278 wars: defender near the front, median 10 % of its men (mean 41 %), none near in 126; attacker median 72 %, none near in 3; of 219 that ran a month the attacker with none near 3 (1.4 %)
with-answer    at once    128 wars: defender near the front, median 100 % of its men (mean 64 %), none near in 37; attacker median  7 %, none near in 47; of 72 that ran a month the attacker with none near 29 (40.3 %)
```
