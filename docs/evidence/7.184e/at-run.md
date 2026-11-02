# PLAN 7.184e: the AT's run (2026-11-02)

`npx tsx tools/diag/heroBattle.ts <seed> 3`, heroes on. *rules*: the land and sea rules of 7.184e (uncommitted, ADR-793); *HEAD*: c13a80c2's AI. Columns as in the tool's header: land `ofArmy` (bar ≥ 0.5 where the ceiling is ≥ 0.10), sea `with` and `ofFleet` (bars ≥ 0.5).

## Summary, 1461–1465 (both)

```
HEAD  land ofArmy mean 0.158, ≥ 0.5 on 0 of 34 | sea with mean 0.603, 21 of 35 | ofFleet mean 0.662, 23 of 31
rules land ofArmy mean 0.148, ≥ 0.5 on 0 of 34 | sea with mean 0.721, 25 of 35 | ofFleet mean 0.794, 28 of 32
rules, 1461–1470: land ofArmy mean 0.161, ≥ 0.5 on 1 of 69 | sea with mean 0.711, 50 of 70 | ofFleet mean 0.828, 57 of 64
```

## Rules, 1461–1470, each hero

```
seed 1461 JAP hero_yamato: at war alive 915 d, in battle 13 d, share 0.014, ceiling 0.040, gone at war 180 d; with 0.656, ofFleet 0.333 (6 d)
seed 1461 JAP hero_o_i: at war alive 795 d, in battle 96 d, share 0.121, ceiling 0.560, gone at war 300 d; ofArmy 0.216
seed 1461 USA hero_iowa: at war alive 567 d, in battle 11 d, share 0.019, ceiling 0.048, gone at war 286 d; with 0.552, ofFleet 0.750 (8 d)
seed 1461 USA hero_t28: at war alive 733 d, in battle 22 d, share 0.030, ceiling 0.405, gone at war 120 d; ofArmy 0.074
seed 1461 SOV hero_sovetsky_soyuz: at war alive 912 d, in battle 10 d, share 0.011, ceiling 0.031, gone at war 0 d; with 0.999, ofFleet 1.000 (10 d)
seed 1461 SOV hero_t42: at war alive 792 d, in battle 97 d, share 0.122, ceiling 0.592, gone at war 120 d; ofArmy 0.207
seed 1461 GER hero_bismarck: at war alive 651 d, in battle 22 d, share 0.034, ceiling 0.037, gone at war 420 d; with 0.115, ofFleet 1.000 (3 d)
seed 1461 GER hero_maus: at war alive 831 d, in battle 90 d, share 0.108, ceiling 0.563, gone at war 240 d; ofArmy 0.192
seed 1461 ENG hero_hood: at war alive 901 d, in battle 4 d, share 0.004, ceiling 0.047, gone at war 96 d; with 0.991, ofFleet 0.667 (3 d)
seed 1461 ENG hero_tog2: at war alive 817 d, in battle 76 d, share 0.093, ceiling 0.471, gone at war 180 d; ofArmy 0.197
seed 1461 FRA hero_richelieu: at war alive 894 d, in battle 2 d, share 0.002, ceiling 0.018, gone at war 0 d; with 1.000, ofFleet 0.667 (3 d)
seed 1461 FRA hero_char2c: at war alive 769 d, in battle 11 d, share 0.014, ceiling 0.427, gone at war 125 d; ofArmy 0.034
seed 1461 ITA hero_roma: at war alive 625 d, in battle 34 d, share 0.054, ceiling 0.066, gone at war 387 d; with 0.245, ofFleet 1.000 (12 d)
seed 1461 ITA hero_p100: at war alive 763 d, in battle 59 d, share 0.077, ceiling 0.539, gone at war 249 d; ofArmy 0.144
seed 1462 JAP hero_yamato: at war alive 794 d, in battle 8 d, share 0.010, ceiling 0.035, gone at war 301 d; with 0.370, ofFleet 1.000 (1 d)
seed 1462 JAP hero_o_i: at war alive 975 d, in battle 107 d, share 0.110, ceiling 0.721, gone at war 120 d; ofArmy 0.152
seed 1462 USA hero_iowa: at war alive 508 d, in battle 1 d, share 0.002, ceiling 0.012, gone at war 61 d; with 0.933, ofFleet 0.000 (1 d)
seed 1462 USA hero_t28: at war alive 569 d, in battle 72 d, share 0.127, ceiling 0.571, gone at war 0 d; ofArmy 0.222
seed 1462 SOV hero_sovetsky_soyuz: at war alive 599 d, in battle 8 d, share 0.013, ceiling 0.028, gone at war 339 d; with 0.324, ofFleet 0.667 (3 d)
seed 1462 SOV hero_t42: at war alive 737 d, in battle 114 d, share 0.155, ceiling 0.768, gone at war 201 d; ofArmy 0.201
seed 1462 GER hero_bismarck: at war alive 619 d, in battle 18 d, share 0.029, ceiling 0.039, gone at war 388 d; with 0.464, ofFleet 1.000 (1 d)
seed 1462 GER hero_maus: at war alive 841 d, in battle 100 d, share 0.119, ceiling 0.474, gone at war 166 d; ofArmy 0.251
seed 1462 ENG hero_hood: at war alive 1065 d, in battle 17 d, share 0.016, ceiling 0.059, gone at war 0 d; with 1.000, ofFleet 0.933 (15 d)
seed 1462 ENG hero_tog2: at war alive 825 d, in battle 48 d, share 0.058, ceiling 0.208, gone at war 240 d; ofArmy 0.279
seed 1462 FRA hero_richelieu: at war alive 874 d, in battle 3 d, share 0.003, ceiling 0.010, gone at war 51 d; with 1.000, ofFleet 1.000 (1 d)
seed 1462 FRA hero_char2c: at war alive 813 d, in battle 15 d, share 0.018, ceiling 0.164, gone at war 112 d; ofArmy 0.113
seed 1462 ITA hero_roma: at war alive 438 d, in battle 23 d, share 0.053, ceiling 0.055, gone at war 569 d; with 0.390, ofFleet 1.000 (6 d)
seed 1462 ITA hero_p100: at war alive 887 d, in battle 60 d, share 0.068, ceiling 0.696, gone at war 120 d; ofArmy 0.097
seed 1463 JAP hero_yamato: at war alive 1035 d, in battle 12 d, share 0.012, ceiling 0.039, gone at war 60 d; with 0.841, ofFleet 1.000 (12 d)
seed 1463 JAP hero_o_i: at war alive 1095 d, in battle 152 d, share 0.139, ceiling 0.791, gone at war 0 d; ofArmy 0.176
seed 1463 USA hero_iowa: at war alive 29 d, in battle 0 d, share 0.000, ceiling 0.034, gone at war 0 d; with 0.690, ofFleet n/a (0 d)
seed 1463 USA hero_t28: at war alive 29 d, in battle 0 d, share 0.000, ceiling 0.000, gone at war 0 d; ofArmy n/a
seed 1463 SOV hero_sovetsky_soyuz: at war alive 503 d, in battle 11 d, share 0.022, ceiling 0.028, gone at war 369 d; with 0.300, ofFleet 1.000 (1 d)
seed 1463 SOV hero_t42: at war alive 692 d, in battle 61 d, share 0.088, ceiling 0.542, gone at war 180 d; ofArmy 0.163
seed 1463 GER hero_bismarck: at war alive 960 d, in battle 17 d, share 0.018, ceiling 0.028, gone at war 120 d; with 0.879, ofFleet 1.000 (7 d)
seed 1463 GER hero_maus: at war alive 900 d, in battle 68 d, share 0.076, ceiling 0.567, gone at war 180 d; ofArmy 0.133
seed 1463 ENG hero_hood: at war alive 1017 d, in battle 4 d, share 0.004, ceiling 0.035, gone at war 0 d; with 1.000, ofFleet 0.600 (5 d)
seed 1463 ENG hero_tog2: at war alive 837 d, in battle 19 d, share 0.023, ceiling 0.416, gone at war 180 d; ofArmy 0.055
seed 1463 FRA hero_richelieu: at war alive 807 d, in battle 2 d, share 0.002, ceiling 0.009, gone at war 60 d; with 0.779, ofFleet 0.500 (4 d)
seed 1463 FRA hero_char2c: at war alive 867 d, in battle 7 d, share 0.008, ceiling 0.435, gone at war 0 d; ofArmy 0.019
seed 1463 ITA hero_roma: at war alive 740 d, in battle 2 d, share 0.003, ceiling 0.009, gone at war 315 d; with 0.981, ofFleet 1.000 (1 d)
seed 1463 ITA hero_p100: at war alive 935 d, in battle 65 d, share 0.070, ceiling 0.675, gone at war 120 d; ofArmy 0.103
seed 1464 JAP hero_yamato: at war alive 874 d, in battle 14 d, share 0.016, ceiling 0.019, gone at war 180 d; with 0.586, ofFleet 1.000 (5 d)
seed 1464 JAP hero_o_i: at war alive 1054 d, in battle 208 d, share 0.197, ceiling 0.667, gone at war 0 d; ofArmy 0.296
seed 1464 USA hero_iowa: at war alive 641 d, in battle 3 d, share 0.005, ceiling 0.072, gone at war 60 d; with 0.910, ofFleet 0.750 (4 d)
seed 1464 USA hero_t28: at war alive 581 d, in battle 31 d, share 0.053, ceiling 0.380, gone at war 120 d; ofArmy 0.140
seed 1464 SOV hero_sovetsky_soyuz: at war alive 916 d, in battle 11 d, share 0.012, ceiling 0.025, gone at war 0 d; with 1.000, ofFleet 0.875 (8 d)
seed 1464 SOV hero_t42: at war alive 651 d, in battle 103 d, share 0.158, ceiling 0.667, gone at war 265 d; ofArmy 0.237
seed 1464 GER hero_bismarck: at war alive 770 d, in battle 14 d, share 0.018, ceiling 0.022, gone at war 240 d; with 0.643, ofFleet 1.000 (4 d)
seed 1464 GER hero_maus: at war alive 950 d, in battle 70 d, share 0.074, ceiling 0.602, gone at war 60 d; ofArmy 0.122
seed 1464 ENG hero_hood: at war alive 904 d, in battle 0 d, share 0.000, ceiling 0.023, gone at war 0 d; with 1.000, ofFleet 0.000 (1 d)
seed 1464 ENG hero_tog2: at war alive 844 d, in battle 36 d, share 0.043, ceiling 0.332, gone at war 60 d; ofArmy 0.129
seed 1464 FRA hero_richelieu: at war alive 856 d, in battle 0 d, share 0.000, ceiling 0.012, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1464 FRA hero_char2c: at war alive 796 d, in battle 33 d, share 0.041, ceiling 0.317, gone at war 60 d; ofArmy 0.131
seed 1464 ITA hero_roma: at war alive 737 d, in battle 9 d, share 0.012, ceiling 0.018, gone at war 228 d; with 0.649, ofFleet 1.000 (1 d)
seed 1464 ITA hero_p100: at war alive 965 d, in battle 20 d, share 0.021, ceiling 0.626, gone at war 0 d; ofArmy 0.033
seed 1465 JAP hero_yamato: at war alive 1095 d, in battle 0 d, share 0.000, ceiling 0.017, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1465 JAP hero_o_i: at war alive 615 d, in battle 74 d, share 0.120, ceiling 0.725, gone at war 480 d; ofArmy 0.166
seed 1465 USA hero_iowa: at war alive 695 d, in battle 7 d, share 0.010, ceiling 0.095, gone at war 0 d; with 0.955, ofFleet 0.833 (6 d)
seed 1465 USA hero_t28: at war alive 612 d, in battle 39 d, share 0.064, ceiling 0.469, gone at war 83 d; ofArmy 0.136
seed 1465 SOV hero_sovetsky_soyuz: at war alive 353 d, in battle 19 d, share 0.054, ceiling 0.062, gone at war 651 d; with 0.558, ofFleet 1.000 (1 d)
seed 1465 SOV hero_t42: at war alive 884 d, in battle 123 d, share 0.139, ceiling 0.655, gone at war 120 d; ofArmy 0.212
seed 1465 GER hero_bismarck: at war alive 1009 d, in battle 3 d, share 0.003, ceiling 0.010, gone at war 39 d; with 1.000, ofFleet 0.750 (4 d)
seed 1465 GER hero_maus: at war alive 988 d, in battle 52 d, share 0.053, ceiling 0.414, gone at war 60 d; ofArmy 0.127
seed 1465 ENG hero_hood: at war alive 1012 d, in battle 3 d, share 0.003, ceiling 0.016, gone at war 60 d; with 0.455, ofFleet 1.000 (2 d)
seed 1465 ENG hero_tog2: at war alive 652 d, in battle 28 d, share 0.043, ceiling 0.319, gone at war 420 d; ofArmy 0.135
seed 1465 FRA hero_richelieu: at war alive 902 d, in battle 9 d, share 0.010, ceiling 0.021, gone at war 84 d; with 0.478, ofFleet 0.333 (3 d)
seed 1465 FRA hero_char2c: at war alive 986 d, in battle 6 d, share 0.006, ceiling 0.291, gone at war 0 d; ofArmy 0.021
seed 1465 ITA hero_roma: at war alive 1022 d, in battle 41 d, share 0.040, ceiling 0.042, gone at war 57 d; with 0.478, ofFleet 0.750 (4 d)
seed 1465 ITA hero_p100: at war alive 899 d, in battle 33 d, share 0.037, ceiling 0.353, gone at war 180 d; ofArmy 0.104
seed 1466 JAP hero_yamato: at war alive 951 d, in battle 10 d, share 0.011, ceiling 0.035, gone at war 144 d; with 0.834, ofFleet 1.000 (6 d)
seed 1466 JAP hero_o_i: at war alive 1035 d, in battle 5 d, share 0.005, ceiling 0.585, gone at war 60 d; ofArmy 0.008
seed 1466 USA hero_iowa: at war alive 289 d, in battle 7 d, share 0.024, ceiling 0.111, gone at war 412 d; with 0.512, ofFleet 1.000 (2 d)
seed 1466 USA hero_t28: at war alive 521 d, in battle 27 d, share 0.052, ceiling 0.324, gone at war 180 d; ofArmy 0.160
seed 1466 SOV hero_sovetsky_soyuz: at war alive 580 d, in battle 12 d, share 0.021, ceiling 0.071, gone at war 300 d; with 0.657, ofFleet 1.000 (2 d)
seed 1466 SOV hero_t42: at war alive 841 d, in battle 158 d, share 0.188, ceiling 0.665, gone at war 39 d; ofArmy 0.283
seed 1466 GER hero_bismarck: at war alive 862 d, in battle 15 d, share 0.017, ceiling 0.023, gone at war 228 d; with 0.828, ofFleet 0.909 (11 d)
seed 1466 GER hero_maus: at war alive 1030 d, in battle 107 d, share 0.104, ceiling 0.542, gone at war 60 d; ofArmy 0.192
seed 1466 ENG hero_hood: at war alive 637 d, in battle 6 d, share 0.009, ceiling 0.042, gone at war 144 d; with 0.958, ofFleet 1.000 (3 d)
seed 1466 ENG hero_tog2: at war alive 781 d, in battle 44 d, share 0.056, ceiling 0.455, gone at war 0 d; ofArmy 0.124
seed 1466 FRA hero_richelieu: at war alive 773 d, in battle 9 d, share 0.012, ceiling 0.016, gone at war 60 d; with 0.966, ofFleet 1.000 (7 d)
seed 1466 FRA hero_char2c: at war alive 646 d, in battle 73 d, share 0.113, ceiling 0.406, gone at war 187 d; ofArmy 0.279
seed 1466 ITA hero_roma: at war alive 850 d, in battle 15 d, share 0.018, ceiling 0.021, gone at war 240 d; with 0.678, ofFleet 1.000 (13 d)
seed 1466 ITA hero_p100: at war alive 1030 d, in battle 32 d, share 0.031, ceiling 0.550, gone at war 60 d; ofArmy 0.057
seed 1467 JAP hero_yamato: at war alive 893 d, in battle 20 d, share 0.022, ceiling 0.083, gone at war 202 d; with 0.554, ofFleet 1.000 (6 d)
seed 1467 JAP hero_o_i: at war alive 843 d, in battle 60 d, share 0.071, ceiling 0.432, gone at war 252 d; ofArmy 0.165
seed 1467 USA hero_iowa: at war alive 618 d, in battle 3 d, share 0.005, ceiling 0.045, gone at war 120 d; with 0.846, ofFleet 1.000 (2 d)
seed 1467 USA hero_t28: at war alive 618 d, in battle 6 d, share 0.010, ceiling 0.209, gone at war 120 d; ofArmy 0.047
seed 1467 SOV hero_sovetsky_soyuz: at war alive 669 d, in battle 35 d, share 0.052, ceiling 0.058, gone at war 322 d; with 0.146, ofFleet 1.000 (13 d)
seed 1467 SOV hero_t42: at war alive 811 d, in battle 137 d, share 0.169, ceiling 0.631, gone at war 180 d; ofArmy 0.268
seed 1467 GER hero_bismarck: at war alive 388 d, in battle 4 d, share 0.010, ceiling 0.018, gone at war 308 d; with 0.286, ofFleet 1.000 (1 d)
seed 1467 GER hero_maus: at war alive 446 d, in battle 135 d, share 0.303, ceiling 0.556, gone at war 250 d; ofArmy 0.544
seed 1467 ENG hero_hood: at war alive 999 d, in battle 0 d, share 0.000, ceiling 0.018, gone at war 60 d; with 1.000, ofFleet n/a (0 d)
seed 1467 ENG hero_tog2: at war alive 759 d, in battle 52 d, share 0.069, ceiling 0.520, gone at war 300 d; ofArmy 0.132
seed 1467 FRA hero_richelieu: at war alive 603 d, in battle 10 d, share 0.017, ceiling 0.041, gone at war 0 d; with 1.000, ofFleet 1.000 (9 d)
seed 1467 FRA hero_char2c: at war alive 603 d, in battle 72 d, share 0.119, ceiling 0.408, gone at war 0 d; ofArmy 0.293
seed 1467 ITA hero_roma: at war alive 494 d, in battle 20 d, share 0.040, ceiling 0.047, gone at war 577 d; with 0.294, ofFleet 1.000 (6 d)
seed 1467 ITA hero_p100: at war alive 753 d, in battle 72 d, share 0.096, ceiling 0.583, gone at war 318 d; ofArmy 0.164
seed 1468 JAP hero_yamato: at war alive 975 d, in battle 31 d, share 0.032, ceiling 0.050, gone at war 120 d; with 0.492, ofFleet 0.864 (22 d)
seed 1468 JAP hero_o_i: at war alive 915 d, in battle 97 d, share 0.106, ceiling 0.723, gone at war 180 d; ofArmy 0.147
seed 1468 USA hero_iowa: at war alive 327 d, in battle 0 d, share 0.000, ceiling 0.006, gone at war 0 d; with 0.994, ofFleet n/a (0 d)
seed 1468 USA hero_t28: at war alive 327 d, in battle 7 d, share 0.021, ceiling 0.312, gone at war 0 d; ofArmy 0.069
seed 1468 SOV hero_sovetsky_soyuz: at war alive 601 d, in battle 42 d, share 0.070, ceiling 0.073, gone at war 295 d; with 0.488, ofFleet 0.667 (3 d)
seed 1468 SOV hero_t42: at war alive 776 d, in battle 168 d, share 0.216, ceiling 0.639, gone at war 120 d; ofArmy 0.339
seed 1468 GER hero_bismarck: at war alive 654 d, in battle 42 d, share 0.064, ceiling 0.067, gone at war 420 d; with 0.349, ofFleet 1.000 (1 d)
seed 1468 GER hero_maus: at war alive 843 d, in battle 145 d, share 0.172, ceiling 0.681, gone at war 231 d; ofArmy 0.253
seed 1468 ENG hero_hood: at war alive 1041 d, in battle 5 d, share 0.005, ceiling 0.154, gone at war 0 d; with 1.000, ofFleet 0.500 (4 d)
seed 1468 ENG hero_tog2: at war alive 741 d, in battle 51 d, share 0.069, ceiling 0.491, gone at war 300 d; ofArmy 0.140
seed 1468 FRA hero_richelieu: at war alive 621 d, in battle 2 d, share 0.003, ceiling 0.024, gone at war 300 d; with 0.596, ofFleet 0.000 (1 d)
seed 1468 FRA hero_char2c: at war alive 631 d, in battle 17 d, share 0.027, ceiling 0.398, gone at war 290 d; ofArmy 0.068
seed 1468 ITA hero_roma: at war alive 706 d, in battle 40 d, share 0.057, ceiling 0.067, gone at war 360 d; with 0.334, ofFleet 1.000 (3 d)
seed 1468 ITA hero_p100: at war alive 916 d, in battle 94 d, share 0.103, ceiling 0.703, gone at war 150 d; ofArmy 0.146
seed 1469 JAP hero_yamato: at war alive 915 d, in battle 43 d, share 0.047, ceiling 0.052, gone at war 180 d; with 0.781, ofFleet 1.000 (17 d)
seed 1469 JAP hero_o_i: at war alive 1095 d, in battle 125 d, share 0.114, ceiling 0.696, gone at war 0 d; ofArmy 0.164
seed 1469 USA hero_iowa: at war alive 457 d, in battle 18 d, share 0.039, ceiling 0.050, gone at war 0 d; with 0.991, ofFleet 1.000 (16 d)
seed 1469 USA hero_t28: at war alive 397 d, in battle 4 d, share 0.010, ceiling 0.292, gone at war 60 d; ofArmy 0.034
seed 1469 SOV hero_sovetsky_soyuz: at war alive 729 d, in battle 6 d, share 0.008, ceiling 0.016, gone at war 120 d; with 0.822, ofFleet 1.000 (4 d)
seed 1469 SOV hero_t42: at war alive 729 d, in battle 150 d, share 0.206, ceiling 0.569, gone at war 120 d; ofArmy 0.361
seed 1469 GER hero_bismarck: at war alive 791 d, in battle 52 d, share 0.066, ceiling 0.072, gone at war 240 d; with 0.290, ofFleet 1.000 (14 d)
seed 1469 GER hero_maus: at war alive 749 d, in battle 91 d, share 0.121, ceiling 0.453, gone at war 282 d; ofArmy 0.268
seed 1469 ENG hero_hood: at war alive 930 d, in battle 6 d, share 0.006, ceiling 0.134, gone at war 120 d; with 0.990, ofFleet 0.059 (85 d)
seed 1469 ENG hero_tog2: at war alive 810 d, in battle 42 d, share 0.052, ceiling 0.452, gone at war 240 d; ofArmy 0.115
seed 1469 FRA hero_richelieu: at war alive 863 d, in battle 3 d, share 0.003, ceiling 0.014, gone at war 43 d; with 1.000, ofFleet 1.000 (3 d)
seed 1469 FRA hero_char2c: at war alive 788 d, in battle 99 d, share 0.126, ceiling 0.513, gone at war 118 d; ofArmy 0.245
seed 1469 ITA hero_roma: at war alive 742 d, in battle 81 d, share 0.109, ceiling 0.113, gone at war 294 d; with 0.309, ofFleet 1.000 (16 d)
seed 1469 ITA hero_p100: at war alive 924 d, in battle 86 d, share 0.093, ceiling 0.640, gone at war 112 d; ofArmy 0.146
seed 1470 JAP hero_yamato: at war alive 915 d, in battle 23 d, share 0.025, ceiling 0.044, gone at war 180 d; with 0.805, ofFleet 1.000 (2 d)
seed 1470 JAP hero_o_i: at war alive 1035 d, in battle 110 d, share 0.106, ceiling 0.714, gone at war 60 d; ofArmy 0.149
seed 1470 USA hero_iowa: at war alive 616 d, in battle 0 d, share 0.000, ceiling 0.000, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1470 USA hero_t28: at war alive 556 d, in battle 12 d, share 0.022, ceiling 0.329, gone at war 60 d; ofArmy 0.066
seed 1470 SOV hero_sovetsky_soyuz: at war alive 595 d, in battle 33 d, share 0.055, ceiling 0.072, gone at war 204 d; with 0.882, ofFleet 0.750 (4 d)
seed 1470 SOV hero_t42: at war alive 799 d, in battle 116 d, share 0.145, ceiling 0.810, gone at war 0 d; ofArmy 0.179
seed 1470 GER hero_bismarck: at war alive 784 d, in battle 19 d, share 0.024, ceiling 0.029, gone at war 298 d; with 0.719, ofFleet 0.000 (1 d)
seed 1470 GER hero_maus: at war alive 1022 d, in battle 93 d, share 0.091, ceiling 0.512, gone at war 60 d; ofArmy 0.178
seed 1470 ENG hero_hood: at war alive 817 d, in battle 6 d, share 0.007, ceiling 0.108, gone at war 32 d; with 0.979, ofFleet 1.000 (6 d)
seed 1470 ENG hero_tog2: at war alive 729 d, in battle 26 d, share 0.036, ceiling 0.428, gone at war 120 d; ofArmy 0.083
seed 1470 FRA hero_richelieu: at war alive 574 d, in battle 15 d, share 0.026, ceiling 0.037, gone at war 330 d; with 0.420, ofFleet 0.857 (7 d)
seed 1470 FRA hero_char2c: at war alive 664 d, in battle 27 d, share 0.041, ceiling 0.393, gone at war 240 d; ofArmy 0.103
seed 1470 ITA hero_roma: at war alive 903 d, in battle 28 d, share 0.031, ceiling 0.042, gone at war 180 d; with 0.749, ofFleet 1.000 (3 d)
seed 1470 ITA hero_p100: at war alive 963 d, in battle 82 d, share 0.085, ceiling 0.604, gone at war 120 d; ofArmy 0.141
```

## HEAD, 1461–1465, each hero

```
seed 1461 JAP hero_yamato: at war alive 795 d, in battle 5 d, share 0.006, ceiling 0.016, gone at war 300 d; with 0.270, ofFleet 0.000 (3 d)
seed 1461 JAP hero_o_i: at war alive 675 d, in battle 102 d, share 0.151, ceiling 0.736, gone at war 420 d; ofArmy 0.205
seed 1461 USA hero_iowa: at war alive 872 d, in battle 17 d, share 0.019, ceiling 0.044, gone at war 60 d; with 0.791, ofFleet 0.737 (19 d)
seed 1461 USA hero_t28: at war alive 840 d, in battle 88 d, share 0.105, ceiling 0.487, gone at war 92 d; ofArmy 0.215
seed 1461 SOV hero_sovetsky_soyuz: at war alive 639 d, in battle 10 d, share 0.016, ceiling 0.038, gone at war 295 d; with 0.556, ofFleet 0.667 (9 d)
seed 1461 SOV hero_t42: at war alive 934 d, in battle 112 d, share 0.120, ceiling 0.607, gone at war 0 d; ofArmy 0.198
seed 1461 GER hero_bismarck: at war alive 539 d, in battle 24 d, share 0.045, ceiling 0.052, gone at war 510 d; with 0.224, ofFleet 1.000 (7 d)
seed 1461 GER hero_maus: at war alive 782 d, in battle 162 d, share 0.207, ceiling 0.614, gone at war 267 d; ofArmy 0.338
seed 1461 ENG hero_hood: at war alive 686 d, in battle 5 d, share 0.007, ceiling 0.034, gone at war 330 d; with 0.985, ofFleet 0.333 (9 d)
seed 1461 ENG hero_tog2: at war alive 956 d, in battle 65 d, share 0.068, ceiling 0.470, gone at war 60 d; ofArmy 0.145
seed 1461 FRA hero_richelieu: at war alive 643 d, in battle 5 d, share 0.008, ceiling 0.031, gone at war 120 d; with 0.927, ofFleet 0.500 (6 d)
seed 1461 FRA hero_char2c: at war alive 674 d, in battle 17 d, share 0.025, ceiling 0.527, gone at war 89 d; ofArmy 0.048
seed 1461 ITA hero_roma: at war alive 322 d, in battle 16 d, share 0.050, ceiling 0.050, gone at war 736 d; with 0.441, ofFleet 1.000 (1 d)
seed 1461 ITA hero_p100: at war alive 758 d, in battle 143 d, share 0.189, ceiling 0.625, gone at war 300 d; ofArmy 0.302
seed 1462 JAP hero_yamato: at war alive 795 d, in battle 25 d, share 0.031, ceiling 0.043, gone at war 300 d; with 0.409, ofFleet 0.778 (9 d)
seed 1462 JAP hero_o_i: at war alive 975 d, in battle 61 d, share 0.063, ceiling 0.562, gone at war 120 d; ofArmy 0.111
seed 1462 USA hero_iowa: at war alive 619 d, in battle 1 d, share 0.002, ceiling 0.021, gone at war 0 d; with 0.960, ofFleet 1.000 (1 d)
seed 1462 USA hero_t28: at war alive 603 d, in battle 24 d, share 0.040, ceiling 0.570, gone at war 16 d; ofArmy 0.070
seed 1462 SOV hero_sovetsky_soyuz: at war alive 417 d, in battle 23 d, share 0.055, ceiling 0.062, gone at war 627 d; with 0.854, ofFleet 0.833 (12 d)
seed 1462 SOV hero_t42: at war alive 984 d, in battle 46 d, share 0.047, ceiling 0.903, gone at war 60 d; ofArmy 0.052
seed 1462 GER hero_bismarck: at war alive 701 d, in battle 20 d, share 0.029, ceiling 0.039, gone at war 360 d; with 0.330, ofFleet 0.778 (9 d)
seed 1462 GER hero_maus: at war alive 1001 d, in battle 66 d, share 0.066, ceiling 0.303, gone at war 60 d; ofArmy 0.218
seed 1462 ENG hero_hood: at war alive 945 d, in battle 7 d, share 0.007, ceiling 0.103, gone at war 120 d; with 0.832, ofFleet 0.500 (6 d)
seed 1462 ENG hero_tog2: at war alive 885 d, in battle 78 d, share 0.088, ceiling 0.472, gone at war 180 d; ofArmy 0.187
seed 1462 FRA hero_richelieu: at war alive 547 d, in battle 4 d, share 0.007, ceiling 0.044, gone at war 381 d; with 0.545, ofFleet 0.400 (5 d)
seed 1462 FRA hero_char2c: at war alive 481 d, in battle 49 d, share 0.102, ceiling 0.343, gone at war 447 d; ofArmy 0.297
seed 1462 ITA hero_roma: at war alive 761 d, in battle 36 d, share 0.047, ceiling 0.058, gone at war 300 d; with 0.301, ofFleet 0.500 (8 d)
seed 1462 ITA hero_p100: at war alive 1001 d, in battle 52 d, share 0.052, ceiling 0.335, gone at war 60 d; ofArmy 0.155
seed 1463 JAP hero_yamato: at war alive 674 d, in battle 83 d, share 0.123, ceiling 0.128, gone at war 421 d; with 0.700, ofFleet 1.000 (31 d)
seed 1463 JAP hero_o_i: at war alive 915 d, in battle 123 d, share 0.134, ceiling 0.658, gone at war 180 d; ofArmy 0.204
seed 1463 USA hero_iowa: at war alive 29 d, in battle 0 d, share 0.000, ceiling 0.172, gone at war 0 d; with 0.000, ofFleet n/a (0 d)
seed 1463 USA hero_t28: at war alive 29 d, in battle 0 d, share 0.000, ceiling 0.000, gone at war 0 d; ofArmy n/a
seed 1463 SOV hero_sovetsky_soyuz: at war alive 611 d, in battle 10 d, share 0.016, ceiling 0.020, gone at war 254 d; with 0.908, ofFleet 1.000 (8 d)
seed 1463 SOV hero_t42: at war alive 805 d, in battle 85 d, share 0.106, ceiling 0.434, gone at war 60 d; ofArmy 0.244
seed 1463 GER hero_bismarck: at war alive 409 d, in battle 2 d, share 0.005, ceiling 0.015, gone at war 226 d; with 0.936, ofFleet n/a (0 d)
seed 1463 GER hero_maus: at war alive 515 d, in battle 78 d, share 0.151, ceiling 0.600, gone at war 120 d; ofArmy 0.252
seed 1463 ENG hero_hood: at war alive 612 d, in battle 3 d, share 0.005, ceiling 0.062, gone at war 357 d; with 0.735, ofFleet 0.167 (6 d)
seed 1463 ENG hero_tog2: at war alive 939 d, in battle 56 d, share 0.060, ceiling 0.370, gone at war 30 d; ofArmy 0.161
seed 1463 FRA hero_richelieu: at war alive 833 d, in battle 4 d, share 0.005, ceiling 0.022, gone at war 60 d; with 0.731, ofFleet 0.000 (3 d)
seed 1463 FRA hero_char2c: at war alive 893 d, in battle 73 d, share 0.082, ceiling 0.451, gone at war 0 d; ofArmy 0.181
seed 1463 ITA hero_roma: at war alive 724 d, in battle 14 d, share 0.019, ceiling 0.029, gone at war 306 d; with 0.536, ofFleet 1.000 (2 d)
seed 1463 ITA hero_p100: at war alive 970 d, in battle 27 d, share 0.028, ceiling 0.400, gone at war 60 d; ofArmy 0.070
seed 1464 JAP hero_yamato: at war alive 1095 d, in battle 2 d, share 0.002, ceiling 0.061, gone at war 0 d; with 0.468, ofFleet 0.167 (6 d)
seed 1464 JAP hero_o_i: at war alive 915 d, in battle 41 d, share 0.045, ceiling 0.625, gone at war 180 d; ofArmy 0.072
seed 1464 USA hero_iowa: at war alive 625 d, in battle 2 d, share 0.003, ceiling 0.053, gone at war 120 d; with 0.826, ofFleet 0.333 (3 d)
seed 1464 USA hero_t28: at war alive 685 d, in battle 11 d, share 0.016, ceiling 0.564, gone at war 60 d; ofArmy 0.028
seed 1464 SOV hero_sovetsky_soyuz: at war alive 333 d, in battle 26 d, share 0.078, ceiling 0.084, gone at war 590 d; with 0.514, ofFleet 1.000 (6 d)
seed 1464 SOV hero_t42: at war alive 743 d, in battle 126 d, share 0.170, ceiling 0.795, gone at war 180 d; ofArmy 0.213
seed 1464 GER hero_bismarck: at war alive 283 d, in battle 6 d, share 0.021, ceiling 0.025, gone at war 480 d; with 0.580, ofFleet 1.000 (1 d)
seed 1464 GER hero_maus: at war alive 524 d, in battle 107 d, share 0.204, ceiling 0.731, gone at war 239 d; ofArmy 0.279
seed 1464 ENG hero_hood: at war alive 344 d, in battle 30 d, share 0.087, ceiling 0.116, gone at war 660 d; with 0.573, ofFleet 0.286 (7 d)
seed 1464 ENG hero_tog2: at war alive 764 d, in battle 6 d, share 0.008, ceiling 0.624, gone at war 240 d; ofArmy 0.013
seed 1464 FRA hero_richelieu: at war alive 340 d, in battle 38 d, share 0.112, ceiling 0.126, gone at war 637 d; with 0.426, ofFleet 1.000 (12 d)
seed 1464 FRA hero_char2c: at war alive 917 d, in battle 12 d, share 0.013, ceiling 0.368, gone at war 60 d; ofArmy 0.036
seed 1464 ITA hero_roma: at war alive 598 d, in battle 13 d, share 0.022, ceiling 0.027, gone at war 448 d; with 0.338, ofFleet 0.667 (3 d)
seed 1464 ITA hero_p100: at war alive 809 d, in battle 109 d, share 0.135, ceiling 0.613, gone at war 237 d; ofArmy 0.220
seed 1465 JAP hero_yamato: at war alive 855 d, in battle 10 d, share 0.012, ceiling 0.036, gone at war 240 d; with 0.468, ofFleet 0.500 (6 d)
seed 1465 JAP hero_o_i: at war alive 1035 d, in battle 64 d, share 0.062, ceiling 0.702, gone at war 60 d; ofArmy 0.088
seed 1465 USA hero_iowa: at war alive 341 d, in battle 0 d, share 0.000, ceiling 0.003, gone at war 0 d; with 0.979, ofFleet n/a (0 d)
seed 1465 USA hero_t28: at war alive 341 d, in battle 0 d, share 0.000, ceiling 0.305, gone at war 0 d; ofArmy 0.000
seed 1465 SOV hero_sovetsky_soyuz: at war alive 731 d, in battle 5 d, share 0.007, ceiling 0.019, gone at war 300 d; with 0.902, ofFleet 1.000 (1 d)
seed 1465 SOV hero_t42: at war alive 971 d, in battle 46 d, share 0.047, ceiling 0.618, gone at war 60 d; ofArmy 0.077
seed 1465 GER hero_bismarck: at war alive 920 d, in battle 14 d, share 0.015, ceiling 0.020, gone at war 120 d; with 0.425, ofFleet 0.889 (9 d)
seed 1465 GER hero_maus: at war alive 920 d, in battle 78 d, share 0.085, ceiling 0.495, gone at war 120 d; ofArmy 0.171
seed 1465 ENG hero_hood: at war alive 868 d, in battle 3 d, share 0.003, ceiling 0.036, gone at war 40 d; with 0.743, ofFleet 0.500 (4 d)
seed 1465 ENG hero_tog2: at war alive 783 d, in battle 26 d, share 0.033, ceiling 0.410, gone at war 125 d; ofArmy 0.081
seed 1465 FRA hero_richelieu: at war alive 700 d, in battle 21 d, share 0.030, ceiling 0.041, gone at war 114 d; with 0.416, ofFleet n/a (0 d)
seed 1465 FRA hero_char2c: at war alive 640 d, in battle 40 d, share 0.063, ceiling 0.261, gone at war 174 d; ofArmy 0.240
seed 1465 ITA hero_roma: at war alive 842 d, in battle 23 d, share 0.027, ceiling 0.031, gone at war 240 d; with 0.463, ofFleet 1.000 (7 d)
seed 1465 ITA hero_p100: at war alive 954 d, in battle 90 d, share 0.094, ceiling 0.512, gone at war 128 d; ofArmy 0.184
```
