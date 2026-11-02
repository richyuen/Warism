# PLAN 7.185: the AT run and the reads (2026-11-02)

Rule (uncommitted): `joinFights` in `operational.ts`: a land hero ordered onto the enemy formation nearest to its army's nearest fight (3 tried).

## AT, 1471–1480 × 3, heroes on (`tools/diag/heroBattle.ts`)

```
land ofArmy mean 0.201, >= 0.5 on 1 of 70 | sea with mean 0.766, 58 of 70 | ofFleet mean 0.799, 50 of 58
```

```
seed 1471 JAP hero_yamato: at war alive 1035 d, in battle 1 d, share 0.001, ceiling 0.053, gone at war 60 d; with 0.971, ofFleet 0.000 (33 d)
seed 1471 JAP hero_o_i: at war alive 1095 d, in battle 0 d, share 0.000, ceiling 0.590, gone at war 0 d; ofArmy 0.000
seed 1471 USA hero_iowa: at war alive 401 d, in battle 26 d, share 0.065, ceiling 0.112, gone at war 547 d; with 0.788, ofFleet 0.917 (12 d)
seed 1471 USA hero_t28: at war alive 888 d, in battle 2 d, share 0.002, ceiling 0.413, gone at war 60 d; ofArmy 0.005
seed 1471 SOV hero_sovetsky_soyuz: at war alive 746 d, in battle 25 d, share 0.034, ceiling 0.039, gone at war 180 d; with 0.676, ofFleet 1.000 (4 d)
seed 1471 SOV hero_t42: at war alive 751 d, in battle 95 d, share 0.126, ceiling 0.474, gone at war 175 d; ofArmy 0.267
seed 1471 GER hero_bismarck: at war alive 1028 d, in battle 5 d, share 0.005, ceiling 0.009, gone at war 60 d; with 0.433, ofFleet 1.000 (5 d)
seed 1471 GER hero_maus: at war alive 1088 d, in battle 134 d, share 0.123, ceiling 0.345, gone at war 0 d; ofArmy 0.357
seed 1471 ENG hero_hood: at war alive 936 d, in battle 5 d, share 0.005, ceiling 0.032, gone at war 0 d; with 1.000, ofFleet 1.000 (5 d)
seed 1471 ENG hero_tog2: at war alive 816 d, in battle 22 d, share 0.027, ceiling 0.348, gone at war 120 d; ofArmy 0.077
seed 1471 FRA hero_richelieu: at war alive 876 d, in battle 21 d, share 0.024, ceiling 0.033, gone at war 60 d; with 0.782, ofFleet 1.000 (19 d)
seed 1471 FRA hero_char2c: at war alive 671 d, in battle 8 d, share 0.012, ceiling 0.331, gone at war 265 d; ofArmy 0.036
seed 1471 ITA hero_roma: at war alive 968 d, in battle 4 d, share 0.004, ceiling 0.012, gone at war 120 d; with 0.398, ofFleet 1.000 (3 d)
seed 1471 ITA hero_p100: at war alive 1028 d, in battle 90 d, share 0.088, ceiling 0.339, gone at war 60 d; ofArmy 0.258
seed 1472 JAP hero_yamato: at war alive 675 d, in battle 17 d, share 0.025, ceiling 0.044, gone at war 420 d; with 0.603, ofFleet 1.000 (2 d)
seed 1472 JAP hero_o_i: at war alive 915 d, in battle 94 d, share 0.103, ceiling 0.501, gone at war 180 d; ofArmy 0.205
seed 1472 USA hero_iowa: at war alive 675 d, in battle 0 d, share 0.000, ceiling 0.001, gone at war 0 d; with 0.999, ofFleet n/a (0 d)
seed 1472 USA hero_t28: at war alive 675 d, in battle 11 d, share 0.016, ceiling 0.350, gone at war 0 d; ofArmy 0.047
seed 1472 SOV hero_sovetsky_soyuz: at war alive 533 d, in battle 19 d, share 0.036, ceiling 0.041, gone at war 300 d; with 0.805, ofFleet 1.000 (2 d)
seed 1472 SOV hero_t42: at war alive 787 d, in battle 131 d, share 0.166, ceiling 0.662, gone at war 46 d; ofArmy 0.251
seed 1472 GER hero_bismarck: at war alive 992 d, in battle 11 d, share 0.011, ceiling 0.016, gone at war 60 d; with 0.094, ofFleet 1.000 (4 d)
seed 1472 GER hero_maus: at war alive 1052 d, in battle 100 d, share 0.095, ceiling 0.488, gone at war 0 d; ofArmy 0.195
seed 1472 ENG hero_hood: at war alive 991 d, in battle 6 d, share 0.006, ceiling 0.051, gone at war 60 d; with 0.997, ofFleet 0.800 (5 d)
seed 1472 ENG hero_tog2: at war alive 871 d, in battle 71 d, share 0.082, ceiling 0.565, gone at war 180 d; ofArmy 0.144
seed 1472 FRA hero_richelieu: at war alive 979 d, in battle 13 d, share 0.013, ceiling 0.030, gone at war 60 d; with 0.970, ofFleet 0.733 (15 d)
seed 1472 FRA hero_char2c: at war alive 968 d, in battle 104 d, share 0.107, ceiling 0.395, gone at war 71 d; ofArmy 0.272
seed 1472 ITA hero_roma: at war alive 999 d, in battle 8 d, share 0.008, ceiling 0.012, gone at war 60 d; with 0.097, ofFleet 1.000 (1 d)
seed 1472 ITA hero_p100: at war alive 999 d, in battle 62 d, share 0.062, ceiling 0.223, gone at war 60 d; ofArmy 0.278
seed 1473 JAP hero_yamato: at war alive 1035 d, in battle 8 d, share 0.008, ceiling 0.011, gone at war 60 d; with 0.764, ofFleet 0.778 (9 d)
seed 1473 JAP hero_o_i: at war alive 795 d, in battle 85 d, share 0.107, ceiling 0.597, gone at war 300 d; ofArmy 0.179
seed 1473 USA hero_iowa: at war alive 189 d, in battle 0 d, share 0.000, ceiling 0.005, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1473 USA hero_t28: at war alive 189 d, in battle 6 d, share 0.032, ceiling 0.667, gone at war 0 d; ofArmy 0.048
seed 1473 SOV hero_sovetsky_soyuz: at war alive 969 d, in battle 1 d, share 0.001, ceiling 0.004, gone at war 0 d; with 1.000, ofFleet 0.500 (2 d)
seed 1473 SOV hero_t42: at war alive 838 d, in battle 106 d, share 0.126, ceiling 0.415, gone at war 131 d; ofArmy 0.305
seed 1473 GER hero_bismarck: at war alive 909 d, in battle 7 d, share 0.008, ceiling 0.012, gone at war 180 d; with 0.240, ofFleet 1.000 (1 d)
seed 1473 GER hero_maus: at war alive 1029 d, in battle 153 d, share 0.149, ceiling 0.576, gone at war 60 d; ofArmy 0.258
seed 1473 ENG hero_hood: at war alive 946 d, in battle 2 d, share 0.002, ceiling 0.011, gone at war 60 d; with 0.989, ofFleet 0.000 (2 d)
seed 1473 ENG hero_tog2: at war alive 826 d, in battle 37 d, share 0.045, ceiling 0.262, gone at war 180 d; ofArmy 0.171
seed 1473 FRA hero_richelieu: at war alive 709 d, in battle 9 d, share 0.013, ceiling 0.014, gone at war 120 d; with 0.935, ofFleet 1.000 (7 d)
seed 1473 FRA hero_char2c: at war alive 769 d, in battle 34 d, share 0.044, ceiling 0.324, gone at war 60 d; ofArmy 0.137
seed 1473 ITA hero_roma: at war alive 909 d, in battle 9 d, share 0.010, ceiling 0.013, gone at war 180 d; with 0.235, ofFleet 1.000 (3 d)
seed 1473 ITA hero_p100: at war alive 969 d, in battle 98 d, share 0.101, ceiling 0.434, gone at war 120 d; ofArmy 0.233
seed 1474 JAP hero_yamato: at war alive 1035 d, in battle 9 d, share 0.009, ceiling 0.033, gone at war 60 d; with 1.000, ofFleet 0.714 (7 d)
seed 1474 JAP hero_o_i: at war alive 915 d, in battle 224 d, share 0.245, ceiling 0.623, gone at war 180 d; ofArmy 0.393
seed 1474 USA hero_iowa: at war alive 637 d, in battle 0 d, share 0.000, ceiling 0.002, gone at war 0 d; with 0.992, ofFleet n/a (0 d)
seed 1474 USA hero_t28: at war alive 637 d, in battle 22 d, share 0.035, ceiling 0.231, gone at war 0 d; ofArmy 0.150
seed 1474 SOV hero_sovetsky_soyuz: at war alive 438 d, in battle 60 d, share 0.137, ceiling 0.146, gone at war 468 d; with 0.388, ofFleet 1.000 (1 d)
seed 1474 SOV hero_t42: at war alive 906 d, in battle 46 d, share 0.051, ceiling 0.857, gone at war 0 d; ofArmy 0.059
seed 1474 GER hero_bismarck: at war alive 244 d, in battle 9 d, share 0.037, ceiling 0.045, gone at war 120 d; with 0.193, ofFleet 1.000 (5 d)
seed 1474 GER hero_maus: at war alive 188 d, in battle 54 d, share 0.287, ceiling 0.559, gone at war 176 d; ofArmy 0.514
seed 1474 ENG hero_hood: at war alive 998 d, in battle 3 d, share 0.003, ceiling 0.118, gone at war 60 d; with 1.000, ofFleet 0.021 (96 d)
seed 1474 ENG hero_tog2: at war alive 938 d, in battle 1 d, share 0.001, ceiling 0.394, gone at war 120 d; ofArmy 0.003
seed 1474 FRA hero_richelieu: at war alive 741 d, in battle 9 d, share 0.012, ceiling 0.022, gone at war 175 d; with 0.776, ofFleet 0.667 (6 d)
seed 1474 FRA hero_char2c: at war alive 679 d, in battle 123 d, share 0.181, ceiling 0.440, gone at war 237 d; ofArmy 0.411
seed 1474 ITA hero_roma: at war alive 649 d, in battle 47 d, share 0.072, ceiling 0.080, gone at war 234 d; with 0.888, ofFleet 0.800 (10 d)
seed 1474 ITA hero_p100: at war alive 648 d, in battle 83 d, share 0.128, ceiling 0.387, gone at war 235 d; ofArmy 0.331
seed 1475 JAP hero_yamato: at war alive 1095 d, in battle 6 d, share 0.005, ceiling 0.054, gone at war 0 d; with 1.000, ofFleet 1.000 (5 d)
seed 1475 JAP hero_o_i: at war alive 975 d, in battle 231 d, share 0.237, ceiling 0.733, gone at war 120 d; ofArmy 0.323
seed 1475 USA hero_iowa: at war alive 401 d, in battle 0 d, share 0.000, ceiling 0.000, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1475 USA hero_t28: at war alive 401 d, in battle 34 d, share 0.085, ceiling 0.309, gone at war 0 d; ofArmy 0.274
seed 1475 SOV hero_sovetsky_soyuz: at war alive 823 d, in battle 3 d, share 0.004, ceiling 0.022, gone at war 0 d; with 1.000, ofFleet 1.000 (2 d)
seed 1475 SOV hero_t42: at war alive 823 d, in battle 59 d, share 0.072, ceiling 0.312, gone at war 0 d; ofArmy 0.230
seed 1475 GER hero_bismarck: at war alive 1078 d, in battle 3 d, share 0.003, ceiling 0.010, gone at war 0 d; with 1.000, ofFleet 1.000 (3 d)
seed 1475 GER hero_maus: at war alive 958 d, in battle 93 d, share 0.097, ceiling 0.529, gone at war 120 d; ofArmy 0.183
seed 1475 ENG hero_hood: at war alive 930 d, in battle 37 d, share 0.040, ceiling 0.048, gone at war 60 d; with 0.654, ofFleet 1.000 (36 d)
seed 1475 ENG hero_tog2: at war alive 777 d, in battle 191 d, share 0.246, ceiling 0.728, gone at war 213 d; ofArmy 0.337
seed 1475 FRA hero_richelieu: at war alive 716 d, in battle 8 d, share 0.011, ceiling 0.022, gone at war 180 d; with 0.527, ofFleet 1.000 (5 d)
seed 1475 FRA hero_char2c: at war alive 846 d, in battle 99 d, share 0.117, ceiling 0.541, gone at war 50 d; ofArmy 0.216
seed 1475 ITA hero_roma: at war alive 1000 d, in battle 3 d, share 0.003, ceiling 0.017, gone at war 60 d; with 0.563, ofFleet 1.000 (3 d)
seed 1475 ITA hero_p100: at war alive 940 d, in battle 130 d, share 0.138, ceiling 0.493, gone at war 120 d; ofArmy 0.281
seed 1476 JAP hero_yamato: at war alive 855 d, in battle 24 d, share 0.028, ceiling 0.043, gone at war 240 d; with 0.550, ofFleet 0.714 (21 d)
seed 1476 JAP hero_o_i: at war alive 1095 d, in battle 68 d, share 0.062, ceiling 0.860, gone at war 0 d; ofArmy 0.072
seed 1476 USA hero_iowa: at war alive 861 d, in battle 1 d, share 0.001, ceiling 0.013, gone at war 0 d; with 0.999, ofFleet 1.000 (1 d)
seed 1476 USA hero_t28: at war alive 847 d, in battle 122 d, share 0.144, ceiling 0.699, gone at war 14 d; ofArmy 0.206
seed 1476 SOV hero_sovetsky_soyuz: at war alive 619 d, in battle 7 d, share 0.011, ceiling 0.026, gone at war 413 d; with 0.921, ofFleet 0.667 (6 d)
seed 1476 SOV hero_t42: at war alive 792 d, in battle 144 d, share 0.182, ceiling 0.745, gone at war 240 d; ofArmy 0.244
seed 1476 GER hero_bismarck: at war alive 705 d, in battle 9 d, share 0.013, ceiling 0.028, gone at war 360 d; with 0.176, ofFleet 0.500 (2 d)
seed 1476 GER hero_maus: at war alive 903 d, in battle 140 d, share 0.155, ceiling 0.557, gone at war 162 d; ofArmy 0.278
seed 1476 ENG hero_hood: at war alive 1026 d, in battle 6 d, share 0.006, ceiling 0.059, gone at war 60 d; with 0.998, ofFleet 0.119 (42 d)
seed 1476 ENG hero_tog2: at war alive 967 d, in battle 4 d, share 0.004, ceiling 0.410, gone at war 119 d; ofArmy 0.010
seed 1476 FRA hero_richelieu: at war alive 739 d, in battle 0 d, share 0.000, ceiling 0.005, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1476 FRA hero_char2c: at war alive 639 d, in battle 2 d, share 0.003, ceiling 0.551, gone at war 100 d; ofArmy 0.006
seed 1476 ITA hero_roma: at war alive 603 d, in battle 17 d, share 0.028, ceiling 0.036, gone at war 455 d; with 0.181, ofFleet 1.000 (2 d)
seed 1476 ITA hero_p100: at war alive 1058 d, in battle 255 d, share 0.241, ceiling 0.669, gone at war 0 d; ofArmy 0.360
seed 1477 JAP hero_yamato: at war alive 795 d, in battle 18 d, share 0.023, ceiling 0.030, gone at war 300 d; with 0.488, ofFleet 1.000 (5 d)
seed 1477 JAP hero_o_i: at war alive 779 d, in battle 82 d, share 0.105, ceiling 0.544, gone at war 316 d; ofArmy 0.193
seed 1477 USA hero_iowa: at war alive 250 d, in battle 0 d, share 0.000, ceiling 0.000, gone at war 0 d; with 0.968, ofFleet n/a (0 d)
seed 1477 USA hero_t28: at war alive 250 d, in battle 12 d, share 0.048, ceiling 0.564, gone at war 0 d; ofArmy 0.085
seed 1477 SOV hero_sovetsky_soyuz: at war alive 811 d, in battle 6 d, share 0.007, ceiling 0.016, gone at war 0 d; with 1.000, ofFleet 1.000 (4 d)
seed 1477 SOV hero_t42: at war alive 712 d, in battle 89 d, share 0.125, ceiling 0.791, gone at war 99 d; ofArmy 0.158
seed 1477 GER hero_bismarck: at war alive 767 d, in battle 15 d, share 0.020, ceiling 0.025, gone at war 240 d; with 0.099, ofFleet 1.000 (4 d)
seed 1477 GER hero_maus: at war alive 1007 d, in battle 155 d, share 0.154, ceiling 0.483, gone at war 0 d; ofArmy 0.319
seed 1477 ENG hero_hood: at war alive 714 d, in battle 13 d, share 0.018, ceiling 0.073, gone at war 311 d; with 0.846, ofFleet 1.000 (6 d)
seed 1477 ENG hero_tog2: at war alive 845 d, in battle 28 d, share 0.033, ceiling 0.471, gone at war 180 d; ofArmy 0.070
seed 1477 FRA hero_richelieu: at war alive 965 d, in battle 5 d, share 0.005, ceiling 0.012, gone at war 60 d; with 0.976, ofFleet 0.000 (1 d)
seed 1477 FRA hero_char2c: at war alive 725 d, in battle 135 d, share 0.186, ceiling 0.556, gone at war 300 d; ofArmy 0.335
seed 1477 ITA hero_roma: at war alive 927 d, in battle 15 d, share 0.016, ceiling 0.029, gone at war 120 d; with 0.502, ofFleet 0.833 (6 d)
seed 1477 ITA hero_p100: at war alive 933 d, in battle 92 d, share 0.099, ceiling 0.533, gone at war 114 d; ofArmy 0.185
seed 1478 JAP hero_yamato: at war alive 1095 d, in battle 1 d, share 0.001, ceiling 0.015, gone at war 0 d; with 1.000, ofFleet 1.000 (1 d)
seed 1478 JAP hero_o_i: at war alive 915 d, in battle 25 d, share 0.027, ceiling 0.402, gone at war 180 d; ofArmy 0.068
seed 1478 USA hero_iowa: at war alive 491 d, in battle 0 d, share 0.000, ceiling 0.002, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1478 USA hero_t28: at war alive 491 d, in battle 71 d, share 0.145, ceiling 0.420, gone at war 0 d; ofArmy 0.345
seed 1478 SOV hero_sovetsky_soyuz: at war alive 500 d, in battle 8 d, share 0.016, ceiling 0.028, gone at war 470 d; with 0.898, ofFleet n/a (0 d)
seed 1478 SOV hero_t42: at war alive 910 d, in battle 138 d, share 0.152, ceiling 0.720, gone at war 60 d; ofArmy 0.211
seed 1478 GER hero_bismarck: at war alive 918 d, in battle 3 d, share 0.003, ceiling 0.005, gone at war 175 d; with 0.600, ofFleet 1.000 (2 d)
seed 1478 GER hero_maus: at war alive 613 d, in battle 148 d, share 0.241, ceiling 0.628, gone at war 480 d; ofArmy 0.384
seed 1478 ENG hero_hood: at war alive 646 d, in battle 0 d, share 0.000, ceiling 0.002, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1478 ENG hero_tog2: at war alive 646 d, in battle 31 d, share 0.048, ceiling 0.382, gone at war 0 d; ofArmy 0.126
seed 1478 FRA hero_richelieu: at war alive 646 d, in battle 0 d, share 0.000, ceiling 0.000, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1478 FRA hero_char2c: at war alive 642 d, in battle 27 d, share 0.042, ceiling 0.204, gone at war 4 d; ofArmy 0.206
seed 1478 ITA hero_roma: at war alive 1093 d, in battle 3 d, share 0.003, ceiling 0.005, gone at war 0 d; with 1.000, ofFleet 1.000 (2 d)
seed 1478 ITA hero_p100: at war alive 1033 d, in battle 39 d, share 0.038, ceiling 0.447, gone at war 60 d; ofArmy 0.084
seed 1479 JAP hero_yamato: at war alive 1095 d, in battle 6 d, share 0.005, ceiling 0.049, gone at war 0 d; with 1.000, ofFleet 1.000 (3 d)
seed 1479 JAP hero_o_i: at war alive 915 d, in battle 102 d, share 0.111, ceiling 0.671, gone at war 180 d; ofArmy 0.166
seed 1479 USA hero_iowa: at war alive 606 d, in battle 0 d, share 0.000, ceiling 0.002, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1479 USA hero_t28: at war alive 595 d, in battle 10 d, share 0.017, ceiling 0.227, gone at war 11 d; ofArmy 0.074
seed 1479 SOV hero_sovetsky_soyuz: at war alive 573 d, in battle 7 d, share 0.012, ceiling 0.024, gone at war 169 d; with 0.892, ofFleet 0.600 (5 d)
seed 1479 SOV hero_t42: at war alive 682 d, in battle 120 d, share 0.176, ceiling 0.617, gone at war 60 d; ofArmy 0.285
seed 1479 GER hero_bismarck: at war alive 682 d, in battle 18 d, share 0.026, ceiling 0.034, gone at war 398 d; with 0.548, ofFleet 0.733 (15 d)
seed 1479 GER hero_maus: at war alive 900 d, in battle 129 d, share 0.143, ceiling 0.454, gone at war 180 d; ofArmy 0.315
seed 1479 ENG hero_hood: at war alive 869 d, in battle 30 d, share 0.035, ceiling 0.055, gone at war 120 d; with 0.891, ofFleet 0.909 (33 d)
seed 1479 ENG hero_tog2: at war alive 809 d, in battle 136 d, share 0.168, ceiling 0.637, gone at war 180 d; ofArmy 0.264
seed 1479 FRA hero_richelieu: at war alive 546 d, in battle 15 d, share 0.027, ceiling 0.042, gone at war 120 d; with 0.777, ofFleet 0.778 (9 d)
seed 1479 FRA hero_char2c: at war alive 587 d, in battle 37 d, share 0.063, ceiling 0.584, gone at war 79 d; ofArmy 0.108
seed 1479 ITA hero_roma: at war alive 952 d, in battle 12 d, share 0.013, ceiling 0.016, gone at war 120 d; with 0.836, ofFleet 1.000 (10 d)
seed 1479 ITA hero_p100: at war alive 672 d, in battle 155 d, share 0.231, ceiling 0.580, gone at war 400 d; ofArmy 0.397
seed 1480 JAP hero_yamato: at war alive 975 d, in battle 8 d, share 0.008, ceiling 0.010, gone at war 120 d; with 0.625, ofFleet 1.000 (5 d)
seed 1480 JAP hero_o_i: at war alive 855 d, in battle 32 d, share 0.037, ceiling 0.678, gone at war 240 d; ofArmy 0.055
seed 1480 USA hero_iowa: at war alive 554 d, in battle 26 d, share 0.047, ceiling 0.110, gone at war 474 d; with 0.693, ofFleet 0.412 (17 d)
seed 1480 USA hero_t28: at war alive 908 d, in battle 41 d, share 0.045, ceiling 0.389, gone at war 120 d; ofArmy 0.116
seed 1480 SOV hero_sovetsky_soyuz: at war alive 888 d, in battle 4 d, share 0.005, ceiling 0.016, gone at war 0 d; with 1.000, ofFleet 0.333 (6 d)
seed 1480 SOV hero_t42: at war alive 828 d, in battle 117 d, share 0.141, ceiling 0.479, gone at war 60 d; ofArmy 0.295
seed 1480 GER hero_bismarck: at war alive 795 d, in battle 21 d, share 0.026, ceiling 0.033, gone at war 259 d; with 0.631, ofFleet 0.929 (14 d)
seed 1480 GER hero_maus: at war alive 694 d, in battle 76 d, share 0.110, ceiling 0.563, gone at war 360 d; ofArmy 0.194
seed 1480 ENG hero_hood: at war alive 951 d, in battle 2 d, share 0.002, ceiling 0.043, gone at war 60 d; with 0.973, ofFleet n/a (0 d)
seed 1480 ENG hero_tog2: at war alive 951 d, in battle 40 d, share 0.042, ceiling 0.358, gone at war 60 d; ofArmy 0.118
seed 1480 FRA hero_richelieu: at war alive 982 d, in battle 1 d, share 0.001, ceiling 0.003, gone at war 60 d; with 0.975, ofFleet 0.000 (1 d)
seed 1480 FRA hero_char2c: at war alive 982 d, in battle 22 d, share 0.022, ceiling 0.346, gone at war 60 d; ofArmy 0.065
seed 1480 ITA hero_roma: at war alive 820 d, in battle 13 d, share 0.016, ceiling 0.034, gone at war 241 d; with 0.823, ofFleet 0.889 (9 d)
seed 1480 ITA hero_p100: at war alive 821 d, in battle 53 d, share 0.065, ceiling 0.286, gone at war 240 d; ofArmy 0.226
```

## What a land hero does on its army's fighting days, before (1461–1465 × 2, HEAD) and with the rule (1471, 1474, 1476 × 1) (`tools/diag/heroLandWhy.ts`)

```
seed 1461 JAP hero_o_i: days 339, fight 63, march enemy 162, march own 56, march other 0, stand 58, still 7d+ 25, supply<0.5 30, retreat 0, home 0, near <=2 10, near <=5 18, near <=10 16, near <=20 8, near <=40 12, near <=80 70, near >80 83, near - 59
seed 1461 USA hero_t28: days 435, fight 98, march enemy 79, march own 124, march other 0, stand 134, still 7d+ 98, supply<0.5 27, retreat 0, home 0, near <=2 8, near <=5 27, near <=10 31, near <=20 37, near <=40 14, near <=80 17, near >80 133, near - 70
seed 1461 SOV hero_t42: days 522, fight 94, march enemy 96, march own 240, march other 2, stand 90, still 7d+ 49, supply<0.5 41, retreat 0, home 0, near <=2 19, near <=5 23, near <=10 37, near <=20 87, near <=40 37, near <=80 12, near >80 152, near - 61
seed 1461 GER hero_maus: days 259, fight 95, march enemy 46, march own 89, march other 1, stand 28, still 7d+ 3, supply<0.5 27, retreat 0, home 16, near <=2 3, near <=5 28, near <=10 15, near <=20 13, near <=40 15, near <=80 33, near >80 20, near - 37
seed 1461 ENG hero_tog2: days 281, fight 75, march enemy 90, march own 57, march other 0, stand 59, still 7d+ 27, supply<0.5 10, retreat 0, home 0, near <=2 6, near <=5 14, near <=10 37, near <=20 18, near <=40 20, near <=80 0, near >80 64, near - 47
seed 1461 FRA hero_char2c: days 221, fight 10, march enemy 79, march own 34, march other 0, stand 98, still 7d+ 61, supply<0.5 14, retreat 0, home 0, near <=2 0, near <=5 3, near <=10 3, near <=20 3, near <=40 0, near <=80 3, near >80 148, near - 51
seed 1461 ITA hero_p100: days 362, fight 73, march enemy 88, march own 84, march other 1, stand 116, still 7d+ 73, supply<0.5 8, retreat 0, home 0, near <=2 4, near <=5 31, near <=10 50, near <=20 28, near <=40 20, near <=80 70, near >80 68, near - 18
seed 1462 JAP hero_o_i: days 459, fight 22, march enemy 10, march own 32, march other 0, stand 395, still 7d+ 377, supply<0.5 1, retreat 0, home 0, near <=2 10, near <=5 1, near <=10 10, near <=20 5, near <=40 12, near <=80 2, near >80 333, near - 64
seed 1462 USA hero_t28: days 181, fight 10, march enemy 142, march own 13, march other 0, stand 16, still 7d+ 0, supply<0.5 1, retreat 0, home 0, near <=2 1, near <=5 6, near <=10 2, near <=20 1, near <=40 0, near <=80 0, near >80 109, near - 52
seed 1462 SOV hero_t42: days 440, fight 62, march enemy 82, march own 215, march other 0, stand 81, still 7d+ 58, supply<0.5 20, retreat 0, home 0, near <=2 9, near <=5 47, near <=10 32, near <=20 38, near <=40 40, near <=80 27, near >80 101, near - 84
seed 1462 GER hero_maus: days 314, fight 20, march enemy 42, march own 14, march other 0, stand 238, still 7d+ 223, supply<0.5 3, retreat 0, home 0, near <=2 1, near <=5 0, near <=10 1, near <=20 7, near <=40 0, near <=80 0, near >80 238, near - 47
seed 1462 ENG hero_tog2: days 171, fight 55, march enemy 43, march own 5, march other 0, stand 68, still 7d+ 60, supply<0.5 13, retreat 0, home 0, near <=2 9, near <=5 23, near <=10 8, near <=20 0, near <=40 0, near <=80 0, near >80 60, near - 16
seed 1462 FRA hero_char2c: days 75, fight 18, march enemy 7, march own 8, march other 0, stand 42, still 7d+ 37, supply<0.5 2, retreat 0, home 0, near <=2 2, near <=5 6, near <=10 2, near <=20 0, near <=40 0, near <=80 0, near >80 32, near - 15
seed 1462 ITA hero_p100: days 310, fight 43, march enemy 36, march own 22, march other 0, stand 209, still 7d+ 190, supply<0.5 4, retreat 0, home 0, near <=2 0, near <=5 7, near <=10 3, near <=20 6, near <=40 1, near <=80 33, near >80 169, near - 48
seed 1463 JAP hero_o_i: days 368, fight 40, march enemy 180, march own 79, march other 0, stand 69, still 7d+ 35, supply<0.5 39, retreat 0, home 0, near <=2 6, near <=5 14, near <=10 40, near <=20 24, near <=40 52, near <=80 72, near >80 71, near - 49
seed 1463 USA hero_t28: days 0, fight 0, march enemy 0, march own 0, march other 0, stand 0, still 7d+ 0, supply<0.5 0, retreat 0, home 0, near <=2 0, near <=5 0, near <=10 0, near <=20 0, near <=40 0, near <=80 0, near >80 0, near - 0
seed 1463 SOV hero_t42: days 162, fight 21, march enemy 28, march own 83, march other 0, stand 30, still 7d+ 18, supply<0.5 14, retreat 0, home 0, near <=2 0, near <=5 10, near <=10 10, near <=20 9, near <=40 7, near <=80 56, near >80 35, near - 14
seed 1463 GER hero_maus: days 454, fight 116, march enemy 32, march own 147, march other 0, stand 159, still 7d+ 129, supply<0.5 15, retreat 0, home 0, near <=2 11, near <=5 35, near <=10 45, near <=20 43, near <=40 24, near <=80 29, near >80 85, near - 66
seed 1463 ENG hero_tog2: days 199, fight 5, march enemy 6, march own 11, march other 0, stand 177, still 7d+ 168, supply<0.5 2, retreat 0, home 0, near <=2 1, near <=5 8, near <=10 8, near <=20 4, near <=40 7, near <=80 27, near >80 99, near - 40
seed 1463 FRA hero_char2c: days 196, fight 28, march enemy 78, march own 44, march other 0, stand 46, still 7d+ 28, supply<0.5 5, retreat 0, home 0, near <=2 5, near <=5 9, near <=10 13, near <=20 2, near <=40 5, near <=80 3, near >80 94, near - 37
seed 1463 ITA hero_p100: days 413, fight 117, march enemy 32, march own 74, march other 0, stand 190, still 7d+ 152, supply<0.5 15, retreat 0, home 0, near <=2 6, near <=5 18, near <=10 31, near <=20 42, near <=40 30, near <=80 38, near >80 68, near - 63
seed 1464 JAP hero_o_i: days 382, fight 60, march enemy 137, march own 50, march other 0, stand 135, still 7d+ 90, supply<0.5 36, retreat 0, home 0, near <=2 7, near <=5 6, near <=10 31, near <=20 29, near <=40 36, near <=80 53, near >80 115, near - 45
seed 1464 USA hero_t28: days 185, fight 13, march enemy 51, march own 39, march other 0, stand 82, still 7d+ 68, supply<0.5 8, retreat 1, home 0, near <=2 0, near <=5 5, near <=10 3, near <=20 0, near <=40 7, near <=80 2, near >80 116, near - 39
seed 1464 SOV hero_t42: days 392, fight 117, march enemy 57, march own 140, march other 0, stand 78, still 7d+ 40, supply<0.5 49, retreat 0, home 0, near <=2 6, near <=5 31, near <=10 27, near <=20 21, near <=40 42, near <=80 34, near >80 78, near - 36
seed 1464 GER hero_maus: days 304, fight 51, march enemy 47, march own 102, march other 0, stand 104, still 7d+ 75, supply<0.5 7, retreat 0, home 0, near <=2 2, near <=5 7, near <=10 11, near <=20 26, near <=40 33, near <=80 80, near >80 37, near - 57
seed 1464 ENG hero_tog2: days 233, fight 30, march enemy 68, march own 90, march other 0, stand 45, still 7d+ 18, supply<0.5 13, retreat 0, home 0, near <=2 3, near <=5 10, near <=10 11, near <=20 9, near <=40 24, near <=80 22, near >80 62, near - 62
seed 1464 FRA hero_char2c: days 216, fight 24, march enemy 13, march own 9, march other 0, stand 170, still 7d+ 161, supply<0.5 0, retreat 0, home 0, near <=2 4, near <=5 5, near <=10 5, near <=20 3, near <=40 9, near <=80 5, near >80 120, near - 41
seed 1464 ITA hero_p100: days 331, fight 125, march enemy 36, march own 106, march other 1, stand 63, still 7d+ 24, supply<0.5 12, retreat 0, home 1, near <=2 7, near <=5 13, near <=10 21, near <=20 34, near <=40 31, near <=80 46, near >80 21, near - 33
seed 1465 JAP hero_o_i: days 472, fight 82, march enemy 32, march own 169, march other 2, stand 187, still 7d+ 131, supply<0.5 25, retreat 0, home 0, near <=2 14, near <=5 19, near <=10 27, near <=20 14, near <=40 34, near <=80 58, near >80 141, near - 83
seed 1465 USA hero_t28: days 88, fight 0, march enemy 0, march own 0, march other 0, stand 88, still 7d+ 88, supply<0.5 0, retreat 0, home 0, near <=2 0, near <=5 0, near <=10 0, near <=20 0, near <=40 0, near <=80 0, near >80 78, near - 10
seed 1465 SOV hero_t42: days 347, fight 22, march enemy 66, march own 82, march other 2, stand 175, still 7d+ 149, supply<0.5 12, retreat 0, home 0, near <=2 3, near <=5 12, near <=10 9, near <=20 35, near <=40 23, near <=80 45, near >80 134, near - 64
seed 1465 GER hero_maus: days 305, fight 81, march enemy 57, march own 95, march other 0, stand 72, still 7d+ 25, supply<0.5 17, retreat 0, home 0, near <=2 8, near <=5 17, near <=10 16, near <=20 12, near <=40 3, near <=80 19, near >80 75, near - 74
seed 1465 ENG hero_tog2: days 318, fight 9, march enemy 107, march own 26, march other 0, stand 176, still 7d+ 149, supply<0.5 9, retreat 0, home 0, near <=2 0, near <=5 0, near <=10 0, near <=20 0, near <=40 0, near <=80 51, near >80 179, near - 79
seed 1465 FRA hero_char2c: days 199, fight 55, march enemy 31, march own 66, march other 0, stand 47, still 7d+ 39, supply<0.5 10, retreat 0, home 0, near <=2 14, near <=5 2, near <=10 6, near <=20 4, near <=40 15, near <=80 7, near >80 50, near - 46
seed 1465 ITA hero_p100: days 352, fight 29, march enemy 22, march own 81, march other 0, stand 220, still 7d+ 144, supply<0.5 13, retreat 0, home 0, near <=2 4, near <=5 12, near <=10 12, near <=20 8, near <=40 5, near <=80 26, near >80 166, near - 90
---- with the rule
seed 1471 JAP hero_o_i: days 362, fight 0, march enemy 0, march own 0, march other 0, stand 362, still 7d+ 355, supply<0.5 0, retreat 0, home 0, near <=2 0, near <=5 0, near <=10 0, near <=20 0, near <=40 0, near <=80 0, near >80 335, near - 27
seed 1471 USA hero_t28: days 16, fight 0, march enemy 1, march own 5, march other 0, stand 10, still 7d+ 9, supply<0.5 1, retreat 0, home 0, near <=2 0, near <=5 0, near <=10 0, near <=20 0, near <=40 0, near <=80 1, near >80 11, near - 4
seed 1471 SOV hero_t42: days 154, fight 47, march enemy 49, march own 54, march other 0, stand 4, still 7d+ 1, supply<0.5 1, retreat 0, home 0, near <=2 14, near <=5 13, near <=10 8, near <=20 18, near <=40 2, near <=80 7, near >80 14, near - 31
seed 1471 GER hero_maus: days 60, fight 26, march enemy 8, march own 9, march other 0, stand 17, still 7d+ 14, supply<0.5 0, retreat 0, home 0, near <=2 0, near <=5 3, near <=10 1, near <=20 2, near <=40 1, near <=80 0, near >80 5, near - 22
seed 1471 ENG hero_tog2: days 87, fight 11, march enemy 22, march own 50, march other 0, stand 4, still 7d+ 1, supply<0.5 1, retreat 0, home 0, near <=2 2, near <=5 7, near <=10 8, near <=20 11, near <=40 7, near <=80 4, near >80 14, near - 23
seed 1471 FRA hero_char2c: days 33, fight 0, march enemy 7, march own 24, march other 0, stand 2, still 7d+ 0, supply<0.5 0, retreat 0, home 0, near <=2 0, near <=5 0, near <=10 0, near <=20 0, near <=40 0, near <=80 0, near >80 12, near - 21
seed 1471 ITA hero_p100: days 94, fight 4, march enemy 0, march own 9, march other 0, stand 81, still 7d+ 78, supply<0.5 1, retreat 0, home 0, near <=2 0, near <=5 1, near <=10 0, near <=20 1, near <=40 19, near <=80 22, near >80 14, near - 33
seed 1474 JAP hero_o_i: days 361, fight 176, march enemy 151, march own 18, march other 0, stand 16, still 7d+ 1, supply<0.5 33, retreat 0, home 0, near <=2 17, near <=5 26, near <=10 30, near <=20 41, near <=40 42, near <=80 3, near >80 12, near - 14
seed 1474 USA hero_t28: days 39, fight 22, march enemy 7, march own 8, march other 0, stand 2, still 7d+ 0, supply<0.5 3, retreat 0, home 0, near <=2 0, near <=5 8, near <=10 5, near <=20 0, near <=40 0, near <=80 0, near >80 0, near - 4
seed 1474 SOV hero_t42: days 220, fight 29, march enemy 9, march own 36, march other 2, stand 144, still 7d+ 139, supply<0.5 1, retreat 0, home 0, near <=2 1, near <=5 3, near <=10 4, near <=20 8, near <=40 5, near <=80 23, near >80 130, near - 17
seed 1474 GER hero_maus: days 105, fight 54, march enemy 34, march own 15, march other 0, stand 2, still 7d+ 0, supply<0.5 5, retreat 0, home 0, near <=2 7, near <=5 5, near <=10 7, near <=20 5, near <=40 14, near <=80 5, near >80 2, near - 6
seed 1474 ENG hero_tog2: days 98, fight 0, march enemy 25, march own 45, march other 0, stand 28, still 7d+ 28, supply<0.5 20, retreat 0, home 8, near <=2 0, near <=5 7, near <=10 1, near <=20 1, near <=40 15, near <=80 0, near >80 56, near - 18
seed 1474 FRA hero_char2c: days 58, fight 14, march enemy 10, march own 30, march other 0, stand 4, still 7d+ 0, supply<0.5 20, retreat 0, home 0, near <=2 0, near <=5 7, near <=10 7, near <=20 7, near <=40 7, near <=80 3, near >80 0, near - 13
seed 1474 ITA hero_p100: days 91, fight 53, march enemy 27, march own 10, march other 0, stand 1, still 7d+ 1, supply<0.5 1, retreat 0, home 0, near <=2 5, near <=5 5, near <=10 5, near <=20 5, near <=40 5, near <=80 6, near >80 4, near - 3
seed 1476 JAP hero_o_i: days 365, fight 52, march enemy 280, march own 24, march other 0, stand 9, still 7d+ 1, supply<0.5 30, retreat 0, home 0, near <=2 3, near <=5 37, near <=10 32, near <=20 84, near <=40 115, near <=80 31, near >80 3, near - 8
seed 1476 USA hero_t28: days 35, fight 7, march enemy 4, march own 5, march other 2, stand 17, still 7d+ 17, supply<0.5 1, retreat 0, home 0, near <=2 0, near <=5 5, near <=10 1, near <=20 0, near <=40 0, near <=80 0, near >80 12, near - 10
seed 1476 SOV hero_t42: days 214, fight 89, march enemy 43, march own 72, march other 0, stand 10, still 7d+ 1, supply<0.5 3, retreat 0, home 0, near <=2 8, near <=5 25, near <=10 18, near <=20 12, near <=40 8, near <=80 7, near >80 17, near - 30
seed 1476 GER hero_maus: days 159, fight 35, march enemy 28, march own 17, march other 0, stand 79, still 7d+ 75, supply<0.5 4, retreat 0, home 0, near <=2 1, near <=5 8, near <=10 2, near <=20 4, near <=40 1, near <=80 38, near >80 35, near - 35
seed 1476 ENG hero_tog2: days 122, fight 4, march enemy 9, march own 10, march other 0, stand 99, still 7d+ 88, supply<0.5 5, retreat 0, home 0, near <=2 0, near <=5 0, near <=10 0, near <=20 0, near <=40 0, near <=80 7, near >80 70, near - 41
seed 1476 FRA hero_char2c: days 41, fight 0, march enemy 8, march own 0, march other 0, stand 33, still 7d+ 25, supply<0.5 2, retreat 0, home 0, near <=2 0, near <=5 0, near <=10 0, near <=20 0, near <=40 0, near <=80 0, near >80 25, near - 16
seed 1476 ITA hero_p100: days 218, fight 30, march enemy 9, march own 22, march other 0, stand 157, still 7d+ 147, supply<0.5 3, retreat 0, home 0, near <=2 2, near <=5 4, near <=10 3, near <=20 6, near <=40 61, near <=80 0, near >80 69, near - 43
```

## The ordinary formations' share, and the hero's orders (`tools/diag/heroCeiling.ts`, with the rule, 1 year; a row per hero life)

```
seed 1471 JAP hero_o_i: nation land fight days 362; hero 0.000; regulars (4, alive ≥ 90 %) best 0.319, p10 0.319, median 0.307; fights on its land 311 d; asks {"refused":698}
seed 1471 USA hero_t28: nation land fight days 16; hero 0.000; regulars (30, alive ≥ 90 %) best 0.723, p10 0.563, median 0.090; fights on its land 7 d; asks {"ok":6,"refused":1}
seed 1471 SOV hero_t42: nation land fight days 206; hero 0.333; regulars (161, alive ≥ 90 %) best 0.388, p10 0.204, median 0.058; fights on its land 9 d; asks {"ok":4}
seed 1471 GER hero_maus: nation land fight days 61; hero 0.426; regulars (66, alive ≥ 90 %) best 0.509, p10 0.400, median 0.066; fights on its land 49 d; asks {"ok":75,"refused":4}
seed 1471 ENG hero_tog2: nation land fight days 87; hero 0.126; regulars (24, alive ≥ 90 %) best 0.390, p10 0.324, median 0.195; fights on its land 83 d; asks {"ok":36}
seed 1471 FRA hero_char2c: nation land fight days 46; hero 0.000; regulars (63, alive ≥ 90 %) best 0.554, p10 0.217, median 0.000; fights on its land 10 d; asks {"ok":19,"refused":7}
seed 1471 ITA hero_p100: nation land fight days 95; hero 0.042; regulars (84, alive ≥ 90 %) best 0.412, p10 0.105, median 0.000; fights on its land 69 d; asks {"refused":83,"ok":6}
seed 1471 SOV hero_t42: nation land fight days 206; hero 0.312; regulars (161, alive ≥ 90 %) best 0.388, p10 0.204, median 0.058; fights on its land 145 d; asks {"ok":88,"refused":11}
seed 1471 FRA hero_char2c: nation land fight days 46; hero 0.325; regulars (63, alive ≥ 90 %) best 0.554, p10 0.217, median 0.000; fights on its land 0 d; asks {"ok":1,"refused":8}
seed 1474 JAP hero_o_i: nation land fight days 362; hero 0.488; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 353 d; asks {"refused":2,"ok":125}
seed 1474 USA hero_t28: nation land fight days 39; hero 0.564; regulars (31, alive ≥ 90 %) best 0.686, p10 0.500, median 0.231; fights on its land 32 d; asks {"ok":53}
seed 1474 SOV hero_t42: nation land fight days 220; hero 0.132; regulars (160, alive ≥ 90 %) best 0.550, p10 0.359, median 0.118; fights on its land 220 d; asks {"ok":52,"refused":372}
seed 1474 GER hero_maus: nation land fight days 240; hero 0.574; regulars (2, alive ≥ 90 %) best 0.367, p10 0.367, median 0.367; fights on its land 68 d; asks {"ok":38}
seed 1474 ENG hero_tog2: nation land fight days 123; hero 0.052; regulars (22, alive ≥ 90 %) best 0.469, p10 0.407, median 0.262; fights on its land 75 d; asks {"ok":30,"refused":3}
seed 1474 FRA hero_char2c: nation land fight days 155; hero 0.520; regulars (17, alive ≥ 90 %) best 0.459, p10 0.412, median 0.188; fights on its land 25 d; asks {"ok":12}
seed 1474 ITA hero_p100: nation land fight days 256; hero 0.695; regulars (11, alive ≥ 90 %) best 0.388, p10 0.263, median 0.039; fights on its land 59 d; asks {"ok":31}
seed 1474 FRA hero_char2c: nation land fight days 155; hero 0.030; regulars (17, alive ≥ 90 %) best 0.459, p10 0.412, median 0.188; fights on its land 33 d; asks {"ok":31}
seed 1474 ITA hero_p100: nation land fight days 256; hero 0.551; regulars (11, alive ≥ 90 %) best 0.388, p10 0.263, median 0.039; fights on its land 22 d; asks {"ok":8}
seed 1474 GER hero_maus: nation land fight days 240; hero 0.604; regulars (2, alive ≥ 90 %) best 0.367, p10 0.367, median 0.367; fights on its land 20 d; asks {"ok":17}
seed 1474 ENG hero_tog2: nation land fight days 123; hero 0.337; regulars (22, alive ≥ 90 %) best 0.469, p10 0.407, median 0.262; fights on its land 48 d; asks {"ok":21}
seed 1474 GER hero_maus: nation land fight days 240; hero 0.333; regulars (2, alive ≥ 90 %) best 0.367, p10 0.367, median 0.367; fights on its land 38 d; asks {"ok":12}
seed 1474 ITA hero_p100: nation land fight days 256; hero 0.209; regulars (11, alive ≥ 90 %) best 0.388, p10 0.263, median 0.039; fights on its land 10 d; asks {"refused":10,"ok":4}
seed 1476 JAP hero_o_i: nation land fight days 365; hero 0.142; regulars (4, alive ≥ 90 %) best 0.473, p10 0.473, median 0.427; fights on its land 358 d; asks {"refused":2,"ok":119}
seed 1476 USA hero_t28: nation land fight days 35; hero 0.200; regulars (26, alive ≥ 90 %) best 0.540, p10 0.456, median 0.143; fights on its land 28 d; asks {"ok":16,"refused":12}
seed 1476 SOV hero_t42: nation land fight days 214; hero 0.416; regulars (162, alive ≥ 90 %) best 0.383, p10 0.192, median 0.042; fights on its land 210 d; asks {"ok":122,"refused":5}
seed 1476 GER hero_maus: nation land fight days 160; hero 0.219; regulars (56, alive ≥ 90 %) best 0.289, p10 0.185, median 0.056; fights on its land 97 d; asks {"ok":41,"refused":110}
seed 1476 ENG hero_tog2: nation land fight days 177; hero 0.199; regulars (18, alive ≥ 90 %) best 0.536, p10 0.387, median 0.266; fights on its land 69 d; asks {"ok":42,"refused":38}
seed 1476 FRA hero_char2c: nation land fight days 41; hero 0.125; regulars (64, alive ≥ 90 %) best 0.488, p10 0.264, median 0.073; fights on its land 7 d; asks {"ok":14,"refused":7}
seed 1476 ITA hero_p100: nation land fight days 219; hero 0.137; regulars (72, alive ≥ 90 %) best 0.381, p10 0.046, median 0.009; fights on its land 214 d; asks {"ok":38,"refused":282}
seed 1476 ENG hero_tog2: nation land fight days 177; hero 0.000; regulars (18, alive ≥ 90 %) best 0.536, p10 0.387, median 0.266; fights on its land 8 d; asks {"refused":36}
seed 1476 FRA hero_char2c: nation land fight days 41; hero 0.218; regulars (64, alive ≥ 90 %) best 0.488, p10 0.264, median 0.073; fights on its land 0 d; asks {"refused":20}
```

## AT of ADR-794 (a): 1481–1490 × 3, the rule with its refusals' fallback (`tools/diag/heroCeiling.ts`, `heroBattle.ts`)

```
seed 1481 AT: 9 of 16 lives at or above the top decile
seed 1482 AT: 12 of 15 lives at or above the top decile
seed 1483 AT: 16 of 30 lives at or above the top decile
seed 1484 AT: 10 of 15 lives at or above the top decile
seed 1485 AT: 9 of 14 lives at or above the top decile
seed 1486 AT: 5 of 9 lives at or above the top decile
seed 1487 AT: 14 of 21 lives at or above the top decile
seed 1488 AT: 7 of 8 lives at or above the top decile
seed 1489 AT: 8 of 16 lives at or above the top decile
seed 1490 AT: 20 of 28 lives at or above the top decile
total 110 of 172 lives (0.640; bar 2/3); by nation, pass/miss: ENG 10/20, FRA 23/8, GER 12/7, ITA 24/4, JAP 22/8, SOV 17/6, USA 2/9
sea: with >= 0.5 on 57 of 70; ofFleet >= 0.5 on 49 of 59 (83 %)
```

```
seed 1481 JAP hero_o_i: life 217 d, not counted; nation land fight days 718; hero 0.281; regulars (1, alive ≥ 90 %) best 0.086, p10 0.086, median 0.086; fights on its land 144 d; asks {"refused":168,"ok":21}
seed 1481 USA hero_t28: life 81 d, MISS; nation land fight days 176; hero 0.160; regulars (24, alive ≥ 90 %) best 0.581, p10 0.377, median 0.185; fights on its land 33 d; asks {"refused":22,"ok":28}
seed 1481 SOV hero_t42: life 592 d, PASS; nation land fight days 592; hero 0.135; regulars (117, alive ≥ 90 %) best 0.203, p10 0.093, median 0.034; fights on its land 589 d; asks {"ok":261,"refused":120}
seed 1481 GER hero_maus: life 542 d, PASS; nation land fight days 542; hero 0.395; regulars (51, alive ≥ 90 %) best 0.170, p10 0.129, median 0.090; fights on its land 522 d; asks {"ok":397,"refused":28}
seed 1481 ENG hero_tog2: life 447 d, MISS; nation land fight days 380; hero 0.210; regulars (19, alive ≥ 90 %) best 0.299, p10 0.239, median 0.108; fights on its land 445 d; asks {"ok":98,"long":1}
seed 1481 FRA hero_char2c: life 271 d, PASS; nation land fight days 284; hero 0.096; regulars (34, alive ≥ 90 %) best 0.352, p10 0.077, median 0.025; fights on its land 261 d; asks {"ok":107}
seed 1481 ITA hero_p100: life 237 d, PASS; nation land fight days 536; hero 0.257; regulars (44, alive ≥ 90 %) best 0.099, p10 0.082, median 0.041; fights on its land 231 d; asks {"ok":129,"refused":194}
seed 1481 ENG hero_tog2: life 256 d, MISS; nation land fight days 380; hero 0.215; regulars (19, alive ≥ 90 %) best 0.299, p10 0.239, median 0.108; fights on its land 120 d; asks {"refused":50,"ok":20}
seed 1481 JAP hero_o_i: life 280 d, not counted; nation land fight days 718; hero 0.121; regulars (1, alive ≥ 90 %) best 0.086, p10 0.086, median 0.086; fights on its land 25 d; asks {"refused":120,"ok":3}
seed 1481 ENG hero_tog2: life 19 d, not counted; nation land fight days 380; hero 0.263; regulars (19, alive ≥ 90 %) best 0.299, p10 0.239, median 0.108; fights on its land 11 d; asks {"refused":2,"ok":2}
seed 1481 JAP hero_o_i: life 100 d, not counted; nation land fight days 718; hero 0.110; regulars (1, alive ≥ 90 %) best 0.086, p10 0.086, median 0.086; fights on its land 19 d; asks {"refused":244,"ok":2}
seed 1481 ENG hero_tog2: life 16 d, not counted; nation land fight days 380; hero 0.500; regulars (19, alive ≥ 90 %) best 0.299, p10 0.239, median 0.108; fights on its land 9 d; asks {"ok":9}
seed 1481 FRA hero_char2c: life 9 d, not counted; nation land fight days 284; hero 0.000; regulars (34, alive ≥ 90 %) best 0.352, p10 0.077, median 0.025; fights on its land 9 d; asks {"ok":6,"refused":1}
seed 1481 USA hero_t28: life 245 d, MISS; nation land fight days 176; hero 0.351; regulars (24, alive ≥ 90 %) best 0.581, p10 0.377, median 0.185; fights on its land 161 d; asks {"ok":58}
seed 1481 JAP hero_o_i: life 197 d, not counted; nation land fight days 718; hero 0.259; regulars (1, alive ≥ 90 %) best 0.086, p10 0.086, median 0.086; fights on its land 69 d; asks {"refused":166,"ok":26}
seed 1481 ITA hero_p100: life 212 d, PASS; nation land fight days 536; hero 0.198; regulars (44, alive ≥ 90 %) best 0.099, p10 0.082, median 0.041; fights on its land 205 d; asks {"ok":123}
seed 1481 FRA hero_char2c: life 5 d, not counted; nation land fight days 284; hero 0.000; regulars (34, alive ≥ 90 %) best 0.352, p10 0.077, median 0.025; fights on its land 5 d; asks {"ok":1}
seed 1481 ENG hero_tog2: life 274 d, MISS; nation land fight days 380; hero 0.073; regulars (19, alive ≥ 90 %) best 0.299, p10 0.239, median 0.108; fights on its land 58 d; asks {"refused":114,"ok":69}
seed 1481 USA hero_t28: life 0 d, not counted; nation land fight days 176; hero 0.000; regulars (24, alive ≥ 90 %) best 0.581, p10 0.377, median 0.185; fights on its land 0 d; asks {"ok":2}
seed 1481 FRA hero_char2c: life 364 d, PASS; nation land fight days 284; hero 0.203; regulars (34, alive ≥ 90 %) best 0.352, p10 0.077, median 0.025; fights on its land 116 d; asks {"ok":40}
seed 1481 JAP hero_o_i: life 241 d, not counted; nation land fight days 718; hero 0.257; regulars (1, alive ≥ 90 %) best 0.086, p10 0.086, median 0.086; fights on its land 108 d; asks {"ok":72,"refused":44}
seed 1481 FRA hero_char2c: life 330 d, PASS; nation land fight days 284; hero 0.306; regulars (34, alive ≥ 90 %) best 0.352, p10 0.077, median 0.025; fights on its land 70 d; asks {"ok":34}
seed 1481 FRA hero_char2c: life 123 d, PASS; nation land fight days 284; hero 0.228; regulars (34, alive ≥ 90 %) best 0.352, p10 0.077, median 0.025; fights on its land 6 d; asks {"ok":5}
seed 1481 ENG hero_tog2: life 493 d, MISS; nation land fight days 380; hero 0.116; regulars (19, alive ≥ 90 %) best 0.299, p10 0.239, median 0.108; fights on its land 12 d; asks {"refused":12,"ok":28}
seed 1481 FRA hero_char2c: life 458 d, MISS; nation land fight days 284; hero 0.057; regulars (34, alive ≥ 90 %) best 0.352, p10 0.077, median 0.025; fights on its land 0 d; asks {"ok":16}
seed 1481 ITA hero_p100: life 140 d, PASS; nation land fight days 536; hero 0.393; regulars (44, alive ≥ 90 %) best 0.099, p10 0.082, median 0.041; fights on its land 26 d; asks {"ok":13}
seed 1482 JAP hero_o_i: life 188 d, PASS; nation land fight days 759; hero 0.383; regulars (10, alive ≥ 90 %) best 0.285, p10 0.285, median 0.190; fights on its land 181 d; asks {"refused":6,"ok":47}
seed 1482 USA hero_t28: life 116 d, MISS; nation land fight days 149; hero 0.017; regulars (54, alive ≥ 90 %) best 0.424, p10 0.262, median 0.074; fights on its land 53 d; asks {"ok":46,"refused":104}
seed 1482 SOV hero_t42: life 346 d, MISS; nation land fight days 346; hero 0.064; regulars (86, alive ≥ 90 %) best 0.260, p10 0.081, median 0.009; fights on its land 345 d; asks {"ok":150,"refused":9}
seed 1482 GER hero_maus: life 137 d, PASS; nation land fight days 501; hero 0.277; regulars (34, alive ≥ 90 %) best 0.322, p10 0.207, median 0.090; fights on its land 121 d; asks {"ok":126,"refused":20}
seed 1482 ENG hero_tog2: life 53 d, PASS; nation land fight days 366; hero 0.226; regulars (11, alive ≥ 90 %) best 0.190, p10 0.172, median 0.121; fights on its land 48 d; asks {"ok":18}
seed 1482 FRA hero_char2c: life 275 d, not counted; nation land fight days 498; hero 0.149; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 217 d; asks {"ok":104,"refused":62}
seed 1482 ITA hero_p100: life 365 d, PASS; nation land fight days 494; hero 0.321; regulars (58, alive ≥ 90 %) best 0.247, p10 0.159, median 0.099; fights on its land 277 d; asks {"ok":121,"refused":19}
seed 1482 ENG hero_tog2: life 327 d, PASS; nation land fight days 366; hero 0.226; regulars (11, alive ≥ 90 %) best 0.190, p10 0.172, median 0.121; fights on its land 302 d; asks {"refused":4,"ok":108}
seed 1482 JAP hero_o_i: life 522 d, PASS; nation land fight days 759; hero 0.305; regulars (10, alive ≥ 90 %) best 0.285, p10 0.285, median 0.190; fights on its land 450 d; asks {"refused":112,"ok":287}
seed 1482 GER hero_maus: life 157 d, PASS; nation land fight days 501; hero 0.363; regulars (34, alive ≥ 90 %) best 0.322, p10 0.207, median 0.090; fights on its land 78 d; asks {"ok":62}
seed 1482 ENG hero_tog2: life 114 d, MISS; nation land fight days 366; hero 0.123; regulars (11, alive ≥ 90 %) best 0.190, p10 0.172, median 0.121; fights on its land 15 d; asks {"ok":3}
seed 1482 ENG hero_tog2: life 200 d, PASS; nation land fight days 366; hero 0.535; regulars (11, alive ≥ 90 %) best 0.190, p10 0.172, median 0.121; fights on its land 134 d; asks {"ok":63,"refused":116}
seed 1482 FRA hero_char2c: life 731 d, not counted; nation land fight days 498; hero 0.235; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 185 d; asks {"ok":48}
seed 1482 FRA hero_char2c: life 381 d, not counted; nation land fight days 498; hero 0.092; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 100 d; asks {"ok":8}
seed 1482 ITA hero_p100: life 311 d, PASS; nation land fight days 494; hero 0.174; regulars (58, alive ≥ 90 %) best 0.247, p10 0.159, median 0.099; fights on its land 15 d; asks {"ok":2}
seed 1482 GER hero_maus: life 489 d, PASS; nation land fight days 501; hero 0.247; regulars (34, alive ≥ 90 %) best 0.322, p10 0.207, median 0.090; fights on its land 120 d; asks {"ok":67}
seed 1482 FRA hero_char2c: life 481 d, not counted; nation land fight days 498; hero 0.306; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 39 d; asks {"ok":13}
seed 1482 ITA hero_p100: life 494 d, PASS; nation land fight days 494; hero 0.328; regulars (58, alive ≥ 90 %) best 0.247, p10 0.159, median 0.099; fights on its land 96 d; asks {"ok":59}
seed 1482 ENG hero_tog2: life 450 d, PASS; nation land fight days 366; hero 0.284; regulars (11, alive ≥ 90 %) best 0.190, p10 0.172, median 0.121; fights on its land 0 d; asks {"refused":36,"ok":10}
seed 1482 FRA hero_char2c: life 210 d, not counted; nation land fight days 498; hero 0.119; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 14 d; asks {"ok":1}
seed 1483 JAP hero_o_i: life 181 d, PASS; nation land fight days 736; hero 0.541; regulars (5, alive ≥ 90 %) best 0.255, p10 0.255, median 0.217; fights on its land 174 d; asks {"refused":4,"ok":44}
seed 1483 USA hero_t28: life 272 d, MISS; nation land fight days 272; hero 0.000; regulars (59, alive ≥ 90 %) best 0.358, p10 0.206, median 0.114; fights on its land 66 d; asks {"ok":41,"refused":466}
seed 1483 SOV hero_t42: life 584 d, PASS; nation land fight days 795; hero 0.240; regulars (91, alive ≥ 90 %) best 0.260, p10 0.116, median 0.058; fights on its land 698 d; asks {"ok":339,"refused":6}
seed 1483 GER hero_maus: life 294 d, PASS; nation land fight days 761; hero 0.446; regulars (4, alive ≥ 90 %) best 0.226, p10 0.226, median 0.104; fights on its land 306 d; asks {"ok":221,"refused":3}
seed 1483 ENG hero_tog2: life 509 d, PASS; nation land fight days 629; hero 0.352; regulars (7, alive ≥ 90 %) best 0.255, p10 0.255, median 0.151; fights on its land 487 d; asks {"ok":126}
seed 1483 FRA hero_char2c: life 0 d, not counted; nation land fight days 434; hero 0.000; regulars (25, alive ≥ 90 %) best 0.295, p10 0.263, median 0.104; fights on its land 0 d; asks {}
seed 1483 ITA hero_p100: life 401 d, PASS; nation land fight days 741; hero 0.227; regulars (3, alive ≥ 90 %) best 0.145, p10 0.145, median 0.132; fights on its land 394 d; asks {"ok":180,"refused":4}
seed 1483 ENG hero_tog2: life 75 d, PASS; nation land fight days 629; hero 0.493; regulars (7, alive ≥ 90 %) best 0.255, p10 0.255, median 0.151; fights on its land 0 d; asks {"refused":10}
seed 1483 FRA hero_char2c: life 548 d, MISS; nation land fight days 434; hero 0.241; regulars (25, alive ≥ 90 %) best 0.295, p10 0.263, median 0.104; fights on its land 442 d; asks {"ok":149}
seed 1483 JAP hero_o_i: life 235 d, MISS; nation land fight days 736; hero 0.217; regulars (5, alive ≥ 90 %) best 0.255, p10 0.255, median 0.217; fights on its land 206 d; asks {"refused":52,"ok":57}
seed 1483 ENG hero_tog2: life 346 d, MISS; nation land fight days 629; hero 0.142; regulars (7, alive ≥ 90 %) best 0.255, p10 0.255, median 0.151; fights on its land 325 d; asks {"ok":97}
seed 1483 ENG hero_tog2: life 452 d, MISS; nation land fight days 629; hero 0.184; regulars (7, alive ≥ 90 %) best 0.255, p10 0.255, median 0.151; fights on its land 134 d; asks {"refused":805,"ok":52}
seed 1483 FRA hero_char2c: life 337 d, PASS; nation land fight days 434; hero 0.300; regulars (25, alive ≥ 90 %) best 0.295, p10 0.263, median 0.104; fights on its land 30 d; asks {"ok":13}
seed 1483 ITA hero_p100: life 60 d, PASS; nation land fight days 741; hero 0.250; regulars (3, alive ≥ 90 %) best 0.145, p10 0.145, median 0.132; fights on its land 58 d; asks {"ok":35}
seed 1483 FRA hero_char2c: life 373 d, MISS; nation land fight days 434; hero 0.113; regulars (25, alive ≥ 90 %) best 0.295, p10 0.263, median 0.104; fights on its land 105 d; asks {"ok":58,"refused":48}
seed 1483 JAP hero_o_i: life 274 d, PASS; nation land fight days 736; hero 0.336; regulars (5, alive ≥ 90 %) best 0.255, p10 0.255, median 0.217; fights on its land 0 d; asks {"ok":1}
seed 1483 GER hero_maus: life 481 d, MISS; nation land fight days 761; hero 0.208; regulars (4, alive ≥ 90 %) best 0.226, p10 0.226, median 0.104; fights on its land 34 d; asks {"ok":13}
seed 1483 ITA hero_p100: life 408 d, MISS; nation land fight days 741; hero 0.120; regulars (3, alive ≥ 90 %) best 0.145, p10 0.145, median 0.132; fights on its land 178 d; asks {"ok":11}
seed 1483 ITA hero_p100: life 144 d, MISS; nation land fight days 741; hero 0.021; regulars (3, alive ≥ 90 %) best 0.145, p10 0.145, median 0.132; fights on its land 10 d; asks {"ok":6}
seed 1483 JAP hero_o_i: life 370 d, MISS; nation land fight days 736; hero 0.149; regulars (5, alive ≥ 90 %) best 0.255, p10 0.255, median 0.217; fights on its land 0 d; asks {"refused":54,"ok":1}
seed 1483 GER hero_maus: life 207 d, MISS; nation land fight days 761; hero 0.130; regulars (4, alive ≥ 90 %) best 0.226, p10 0.226, median 0.104; fights on its land 311 d; asks {"ok":89,"refused":80}
seed 1483 ITA hero_p100: life 404 d, PASS; nation land fight days 741; hero 0.329; regulars (3, alive ≥ 90 %) best 0.145, p10 0.145, median 0.132; fights on its land 229 d; asks {"ok":73}
seed 1483 JAP hero_o_i: life 138 d, PASS; nation land fight days 736; hero 0.457; regulars (5, alive ≥ 90 %) best 0.255, p10 0.255, median 0.217; fights on its land 5 d; asks {"refused":16}
seed 1483 ITA hero_p100: life 463 d, PASS; nation land fight days 741; hero 0.227; regulars (3, alive ≥ 90 %) best 0.145, p10 0.145, median 0.132; fights on its land 25 d; asks {"ok":14}
seed 1483 JAP hero_o_i: life 142 d, MISS; nation land fight days 736; hero 0.141; regulars (5, alive ≥ 90 %) best 0.255, p10 0.255, median 0.217; fights on its land 47 d; asks {"refused":136,"ok":20}
seed 1483 SOV hero_t42: life 744 d, PASS; nation land fight days 795; hero 0.258; regulars (91, alive ≥ 90 %) best 0.260, p10 0.116, median 0.058; fights on its land 152 d; asks {"ok":85,"refused":2}
seed 1483 ITA hero_p100: life 146 d, PASS; nation land fight days 741; hero 0.384; regulars (3, alive ≥ 90 %) best 0.145, p10 0.145, median 0.132; fights on its land 68 d; asks {"ok":40}
seed 1483 ENG hero_tog2: life 619 d, MISS; nation land fight days 629; hero 0.129; regulars (7, alive ≥ 90 %) best 0.255, p10 0.255, median 0.151; fights on its land 29 d; asks {"refused":34,"ok":20}
seed 1483 GER hero_maus: life 589 d, MISS; nation land fight days 761; hero 0.211; regulars (4, alive ≥ 90 %) best 0.226, p10 0.226, median 0.104; fights on its land 86 d; asks {"ok":50,"refused":1}
seed 1483 FRA hero_char2c: life 410 d, PASS; nation land fight days 434; hero 0.298; regulars (25, alive ≥ 90 %) best 0.295, p10 0.263, median 0.104; fights on its land 2 d; asks {"ok":1}
seed 1483 ENG hero_tog2: life 588 d, PASS; nation land fight days 629; hero 0.286; regulars (7, alive ≥ 90 %) best 0.255, p10 0.255, median 0.151; fights on its land 0 d; asks {}
seed 1484 JAP hero_o_i: life 118 d, PASS; nation land fight days 713; hero 0.195; regulars (3, alive ≥ 90 %) best 0.083, p10 0.083, median 0.082; fights on its land 219 d; asks {"refused":128,"ok":7}
seed 1484 USA hero_t28: life 115 d, MISS; nation land fight days 142; hero 0.122; regulars (59, alive ≥ 90 %) best 0.480, p10 0.288, median 0.110; fights on its land 62 d; asks {"ok":64,"refused":105}
seed 1484 SOV hero_t42: life 471 d, PASS; nation land fight days 787; hero 0.327; regulars (4, alive ≥ 90 %) best 0.223, p10 0.223, median 0.041; fights on its land 467 d; asks {"ok":244}
seed 1484 GER hero_maus: life 541 d, MISS; nation land fight days 541; hero 0.092; regulars (61, alive ≥ 90 %) best 0.304, p10 0.199, median 0.076; fights on its land 540 d; asks {"ok":104,"refused":1253}
seed 1484 ENG hero_tog2: life 213 d, MISS; nation land fight days 213; hero 0.178; regulars (44, alive ≥ 90 %) best 0.366, p10 0.230, median 0.100; fights on its land 153 d; asks {"ok":142,"refused":60}
seed 1484 FRA hero_char2c: life 169 d, PASS; nation land fight days 169; hero 0.172; regulars (61, alive ≥ 90 %) best 0.292, p10 0.166, median 0.000; fights on its land 117 d; asks {"ok":150,"refused":71}
seed 1484 ITA hero_p100: life 539 d, PASS; nation land fight days 539; hero 0.416; regulars (81, alive ≥ 90 %) best 0.306, p10 0.135, median 0.080; fights on its land 533 d; asks {"refused":97,"ok":335}
seed 1484 JAP hero_o_i: life 172 d, PASS; nation land fight days 713; hero 0.436; regulars (3, alive ≥ 90 %) best 0.083, p10 0.083, median 0.082; fights on its land 83 d; asks {"refused":134,"ok":22}
seed 1484 JAP hero_o_i: life 292 d, PASS; nation land fight days 713; hero 0.264; regulars (3, alive ≥ 90 %) best 0.083, p10 0.083, median 0.082; fights on its land 88 d; asks {"refused":24,"ok":22}
seed 1484 JAP hero_o_i: life 63 d, PASS; nation land fight days 713; hero 0.476; regulars (3, alive ≥ 90 %) best 0.083, p10 0.083, median 0.082; fights on its land 48 d; asks {"ok":14}
seed 1484 JAP hero_o_i: life 142 d, PASS; nation land fight days 713; hero 0.218; regulars (3, alive ≥ 90 %) best 0.083, p10 0.083, median 0.082; fights on its land 50 d; asks {"refused":37,"ok":10}
seed 1484 SOV hero_t42: life 483 d, MISS; nation land fight days 787; hero 0.025; regulars (4, alive ≥ 90 %) best 0.223, p10 0.223, median 0.041; fights on its land 87 d; asks {"ok":14}
seed 1484 SOV hero_t42: life 306 d, MISS; nation land fight days 787; hero 0.088; regulars (4, alive ≥ 90 %) best 0.223, p10 0.223, median 0.041; fights on its land 236 d; asks {"ok":74}
seed 1484 JAP hero_o_i: life 79 d, PASS; nation land fight days 713; hero 0.532; regulars (3, alive ≥ 90 %) best 0.083, p10 0.083, median 0.082; fights on its land 11 d; asks {"refused":30,"ok":11}
seed 1484 SOV hero_t42: life 535 d, PASS; nation land fight days 787; hero 0.269; regulars (4, alive ≥ 90 %) best 0.223, p10 0.223, median 0.041; fights on its land 83 d; asks {"ok":42}
seed 1485 JAP hero_o_i: life 50 d, MISS; nation land fight days 868; hero 0.200; regulars (3, alive ≥ 90 %) best 0.205, p10 0.205, median 0.176; fights on its land 43 d; asks {"refused":4,"ok":9}
seed 1485 USA hero_t28: life 244 d, PASS; nation land fight days 244; hero 0.213; regulars (59, alive ≥ 90 %) best 0.366, p10 0.209, median 0.119; fights on its land 263 d; asks {"ok":137,"refused":163}
seed 1485 SOV hero_t42: life 385 d, PASS; nation land fight days 385; hero 0.275; regulars (95, alive ≥ 90 %) best 0.247, p10 0.195, median 0.044; fights on its land 383 d; asks {"ok":273,"refused":3}
seed 1485 GER hero_maus: life 443 d, MISS; nation land fight days 554; hero 0.160; regulars (55, alive ≥ 90 %) best 0.282, p10 0.187, median 0.022; fights on its land 238 d; asks {"ok":93,"refused":565}
seed 1485 ENG hero_tog2: life 206 d, PASS; nation land fight days 210; hero 0.262; regulars (11, alive ≥ 90 %) best 0.339, p10 0.252, median 0.206; fights on its land 189 d; asks {"ok":82,"refused":11}
seed 1485 FRA hero_char2c: life 88 d, MISS; nation land fight days 243; hero 0.295; regulars (9, alive ≥ 90 %) best 0.299, p10 0.299, median 0.117; fights on its land 76 d; asks {"ok":68}
seed 1485 ITA hero_p100: life 609 d, PASS; nation land fight days 609; hero 0.071; regulars (65, alive ≥ 90 %) best 0.108, p10 0.043, median 0.013; fights on its land 514 d; asks {"ok":117,"refused":1136}
seed 1485 JAP hero_o_i: life 525 d, PASS; nation land fight days 868; hero 0.246; regulars (3, alive ≥ 90 %) best 0.205, p10 0.205, median 0.176; fights on its land 460 d; asks {"refused":8,"ok":140}
seed 1485 FRA hero_char2c: life 140 d, PASS; nation land fight days 243; hero 0.436; regulars (9, alive ≥ 90 %) best 0.299, p10 0.299, median 0.117; fights on its land 71 d; asks {"ok":40}
seed 1485 ENG hero_tog2: life 72 d, PASS; nation land fight days 210; hero 0.292; regulars (11, alive ≥ 90 %) best 0.339, p10 0.252, median 0.206; fights on its land 0 d; asks {"refused":50,"ok":62}
seed 1485 JAP hero_o_i: life 885 d, PASS; nation land fight days 868; hero 0.214; regulars (3, alive ≥ 90 %) best 0.205, p10 0.205, median 0.176; fights on its land 216 d; asks {"refused":248,"ok":131}
seed 1485 FRA hero_char2c: life 744 d, MISS; nation land fight days 243; hero 0.238; regulars (9, alive ≥ 90 %) best 0.299, p10 0.299, median 0.117; fights on its land 21 d; asks {"ok":12}
seed 1485 FRA hero_char2c: life 347 d, PASS; nation land fight days 243; hero 0.340; regulars (9, alive ≥ 90 %) best 0.299, p10 0.299, median 0.117; fights on its land 0 d; asks {"refused":30}
seed 1485 GER hero_maus: life 858 d, MISS; nation land fight days 554; hero 0.112; regulars (55, alive ≥ 90 %) best 0.282, p10 0.187, median 0.022; fights on its land 56 d; asks {"refused":122,"ok":56}
seed 1486 JAP hero_o_i: life 634 d, PASS; nation land fight days 634; hero 0.322; regulars (24, alive ≥ 90 %) best 0.233, p10 0.227, median 0.166; fights on its land 578 d; asks {"refused":5,"ok":275}
seed 1486 USA hero_t28: life 0 d, not counted; nation land fight days 0; hero 0.000; regulars (52, alive ≥ 90 %) best 1.000, p10 0.559, median 0.323; fights on its land 0 d; asks {}
seed 1486 SOV hero_t42: life 188 d, PASS; nation land fight days 460; hero 0.186; regulars (59, alive ≥ 90 %) best 0.163, p10 0.070, median 0.026; fights on its land 182 d; asks {"ok":60,"refused":3}
seed 1486 GER hero_maus: life 542 d, MISS; nation land fight days 542; hero 0.175; regulars (50, alive ≥ 90 %) best 0.274, p10 0.192, median 0.044; fights on its land 380 d; asks {"ok":152,"refused":945}
seed 1486 ENG hero_tog2: life 257 d, MISS; nation land fight days 257; hero 0.058; regulars (48, alive ≥ 90 %) best 0.273, p10 0.223, median 0.096; fights on its land 104 d; asks {"ok":107,"refused":262}
seed 1486 FRA hero_char2c: life 39 d, PASS; nation land fight days 257; hero 0.256; regulars (44, alive ≥ 90 %) best 0.309, p10 0.214, median 0.082; fights on its land 31 d; asks {"ok":74}
seed 1486 ITA hero_p100: life 422 d, MISS; nation land fight days 422; hero 0.100; regulars (56, alive ≥ 90 %) best 0.211, p10 0.102, median 0.024; fights on its land 361 d; asks {"ok":65,"refused":898}
seed 1486 FRA hero_char2c: life 221 d, PASS; nation land fight days 257; hero 0.244; regulars (44, alive ≥ 90 %) best 0.309, p10 0.214, median 0.082; fights on its land 53 d; asks {"ok":44}
seed 1486 SOV hero_t42: life 459 d, MISS; nation land fight days 460; hero 0.024; regulars (59, alive ≥ 90 %) best 0.163, p10 0.070, median 0.026; fights on its land 296 d; asks {"ok":136,"refused":92}
seed 1486 FRA hero_char2c: life 170 d, PASS; nation land fight days 257; hero 0.353; regulars (44, alive ≥ 90 %) best 0.309, p10 0.214, median 0.082; fights on its land 161 d; asks {"ok":83,"refused":44}
seed 1487 JAP hero_o_i: life 541 d, MISS; nation land fight days 548; hero 0.068; regulars (7, alive ≥ 90 %) best 0.120, p10 0.120, median 0.046; fights on its land 576 d; asks {"refused":50,"ok":111}
seed 1487 USA hero_t28: life 286 d, MISS; nation land fight days 290; hero 0.052; regulars (28, alive ≥ 90 %) best 0.367, p10 0.261, median 0.095; fights on its land 73 d; asks {"refused":598,"ok":13}
seed 1487 SOV hero_t42: life 127 d, PASS; nation land fight days 810; hero 0.622; regulars (12, alive ≥ 90 %) best 0.096, p10 0.089, median 0.036; fights on its land 123 d; asks {"ok":64,"refused":2}
seed 1487 GER hero_maus: life 501 d, PASS; nation land fight days 528; hero 0.371; regulars (46, alive ≥ 90 %) best 0.303, p10 0.183, median 0.129; fights on its land 491 d; asks {"ok":209,"refused":80}
seed 1487 ENG hero_tog2: life 119 d, PASS; nation land fight days 568; hero 0.345; regulars (15, alive ≥ 90 %) best 0.229, p10 0.218, median 0.062; fights on its land 101 d; asks {"ok":18}
seed 1487 GER hero_maus: life 263 d, PASS; nation land fight days 528; hero 0.285; regulars (46, alive ≥ 90 %) best 0.303, p10 0.183, median 0.129; fights on its land 128 d; asks {"refused":373,"ok":158}
seed 1487 ITA hero_p100: life 37 d, PASS; nation land fight days 607; hero 0.378; regulars (62, alive ≥ 90 %) best 0.196, p10 0.165, median 0.110; fights on its land 35 d; asks {"ok":26,"refused":3}
seed 1487 ITA hero_p100: life 602 d, PASS; nation land fight days 607; hero 0.173; regulars (62, alive ≥ 90 %) best 0.196, p10 0.165, median 0.110; fights on its land 485 d; asks {"ok":165,"refused":247}
seed 1487 SOV hero_t42: life 728 d, PASS; nation land fight days 810; hero 0.214; regulars (12, alive ≥ 90 %) best 0.096, p10 0.089, median 0.036; fights on its land 718 d; asks {"ok":293,"refused":1,"long":1}
seed 1487 ENG hero_tog2: life 244 d, MISS; nation land fight days 568; hero 0.041; regulars (15, alive ≥ 90 %) best 0.229, p10 0.218, median 0.062; fights on its land 113 d; asks {"ok":70,"refused":246}
seed 1487 JAP hero_o_i: life 288 d, MISS; nation land fight days 548; hero 0.115; regulars (7, alive ≥ 90 %) best 0.120, p10 0.120, median 0.046; fights on its land 95 d; asks {"refused":116,"ok":37}
seed 1487 JAP hero_o_i: life 74 d, MISS; nation land fight days 548; hero 0.000; regulars (7, alive ≥ 90 %) best 0.120, p10 0.120, median 0.046; fights on its land 0 d; asks {"refused":222,"ok":17}
seed 1487 GER hero_maus: life 105 d, PASS; nation land fight days 528; hero 0.629; regulars (46, alive ≥ 90 %) best 0.303, p10 0.183, median 0.129; fights on its land 102 d; asks {"ok":63}
seed 1487 ENG hero_tog2: life 263 d, MISS; nation land fight days 568; hero 0.141; regulars (15, alive ≥ 90 %) best 0.229, p10 0.218, median 0.062; fights on its land 290 d; asks {"refused":2,"ok":4}
seed 1487 ENG hero_tog2: life 250 d, MISS; nation land fight days 568; hero 0.036; regulars (15, alive ≥ 90 %) best 0.229, p10 0.218, median 0.062; fights on its land 0 d; asks {"refused":904}
seed 1487 JAP hero_o_i: life 252 d, PASS; nation land fight days 548; hero 0.369; regulars (7, alive ≥ 90 %) best 0.120, p10 0.120, median 0.046; fights on its land 0 d; asks {}
seed 1487 ITA hero_p100: life 440 d, PASS; nation land fight days 607; hero 0.191; regulars (62, alive ≥ 90 %) best 0.196, p10 0.165, median 0.110; fights on its land 161 d; asks {"ok":81}
seed 1487 SOV hero_t42: life 779 d, PASS; nation land fight days 810; hero 0.098; regulars (12, alive ≥ 90 %) best 0.096, p10 0.089, median 0.036; fights on its land 70 d; asks {"ok":25}
seed 1487 GER hero_maus: life 455 d, PASS; nation land fight days 528; hero 0.259; regulars (46, alive ≥ 90 %) best 0.303, p10 0.183, median 0.129; fights on its land 74 d; asks {"ok":30}
seed 1487 SOV hero_t42: life 206 d, PASS; nation land fight days 810; hero 0.325; regulars (12, alive ≥ 90 %) best 0.096, p10 0.089, median 0.036; fights on its land 22 d; asks {"ok":9}
seed 1487 USA hero_t28: life 229 d, PASS; nation land fight days 290; hero 0.441; regulars (28, alive ≥ 90 %) best 0.367, p10 0.261, median 0.095; fights on its land 0 d; asks {"refused":134,"ok":1}
seed 1488 JAP hero_o_i: life 161 d, not counted; nation land fight days 607; hero 0.267; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 164 d; asks {"refused":4,"ok":47}
seed 1488 USA hero_t28: life 153 d, MISS; nation land fight days 153; hero 0.203; regulars (64, alive ≥ 90 %) best 0.464, p10 0.360, median 0.178; fights on its land 39 d; asks {"ok":45,"refused":396}
seed 1488 SOV hero_t42: life 269 d, PASS; nation land fight days 683; hero 0.390; regulars (147, alive ≥ 90 %) best 0.271, p10 0.187, median 0.066; fights on its land 264 d; asks {"ok":167,"refused":44}
seed 1488 GER hero_maus: life 27 d, not counted; nation land fight days 330; hero 0.704; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 27 d; asks {"ok":17,"refused":14}
seed 1488 ENG hero_tog2: life 48 d, not counted; nation land fight days 532; hero 0.729; regulars (1, alive ≥ 90 %) best 0.140, p10 0.140, median 0.140; fights on its land 48 d; asks {"ok":12}
seed 1488 FRA hero_char2c: life 10 d, not counted; nation land fight days 527; hero 0.700; regulars (4, alive ≥ 90 %) best 0.216, p10 0.216, median 0.150; fights on its land 10 d; asks {"ok":2}
seed 1488 ITA hero_p100: life 647 d, not counted; nation land fight days 435; hero 0.071; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 570 d; asks {"ok":127,"refused":28}
seed 1488 FRA hero_char2c: life 199 d, PASS; nation land fight days 527; hero 0.472; regulars (4, alive ≥ 90 %) best 0.216, p10 0.216, median 0.150; fights on its land 111 d; asks {"ok":24,"refused":6}
seed 1488 GER hero_maus: life 182 d, not counted; nation land fight days 330; hero 0.451; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 46 d; asks {"ok":11}
seed 1488 ENG hero_tog2: life 141 d, not counted; nation land fight days 532; hero 0.298; regulars (1, alive ≥ 90 %) best 0.140, p10 0.140, median 0.140; fights on its land 10 d; asks {"refused":50,"ok":6}
seed 1488 GER hero_maus: life 180 d, not counted; nation land fight days 330; hero 0.406; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 42 d; asks {"ok":16}
seed 1488 FRA hero_char2c: life 266 d, PASS; nation land fight days 527; hero 0.398; regulars (4, alive ≥ 90 %) best 0.216, p10 0.216, median 0.150; fights on its land 29 d; asks {"refused":82,"ok":20}
seed 1488 JAP hero_o_i: life 138 d, not counted; nation land fight days 607; hero 0.297; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 56 d; asks {"refused":120,"ok":25}
seed 1488 ITA hero_p100: life 140 d, not counted; nation land fight days 435; hero 0.129; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 431 d; asks {"ok":29}
seed 1488 ENG hero_tog2: life 39 d, not counted; nation land fight days 532; hero 0.205; regulars (1, alive ≥ 90 %) best 0.140, p10 0.140, median 0.140; fights on its land 2 d; asks {"refused":58,"ok":4}
seed 1488 GER hero_maus: life 244 d, not counted; nation land fight days 330; hero 0.373; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 28 d; asks {"ok":17}
seed 1488 ITA hero_p100: life 93 d, not counted; nation land fight days 435; hero 0.613; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 47 d; asks {"ok":17}
seed 1488 JAP hero_o_i: life 438 d, not counted; nation land fight days 607; hero 0.274; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 22 d; asks {"refused":148,"ok":16}
seed 1488 ENG hero_tog2: life 10 d, not counted; nation land fight days 532; hero 0.300; regulars (1, alive ≥ 90 %) best 0.140, p10 0.140, median 0.140; fights on its land 142 d; asks {"refused":6}
seed 1488 GER hero_maus: life 332 d, not counted; nation land fight days 330; hero 0.437; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 47 d; asks {"ok":3}
seed 1488 FRA hero_char2c: life 177 d, PASS; nation land fight days 527; hero 0.322; regulars (4, alive ≥ 90 %) best 0.216, p10 0.216, median 0.150; fights on its land 21 d; asks {"refused":2,"ok":23}
seed 1488 SOV hero_t42: life 431 d, PASS; nation land fight days 683; hero 0.246; regulars (147, alive ≥ 90 %) best 0.271, p10 0.187, median 0.066; fights on its land 358 d; asks {"ok":182,"long":59,"refused":84}
seed 1488 ITA hero_p100: life 431 d, not counted; nation land fight days 435; hero 0.244; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 159 d; asks {"ok":53}
seed 1488 ENG hero_tog2: life 172 d, not counted; nation land fight days 532; hero 0.372; regulars (1, alive ≥ 90 %) best 0.140, p10 0.140, median 0.140; fights on its land 16 d; asks {"refused":80,"ok":30}
seed 1488 JAP hero_o_i: life 179 d, not counted; nation land fight days 607; hero 0.492; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 70 d; asks {"ok":12}
seed 1488 FRA hero_char2c: life 277 d, PASS; nation land fight days 527; hero 0.343; regulars (4, alive ≥ 90 %) best 0.216, p10 0.216, median 0.150; fights on its land 81 d; asks {"ok":45,"refused":10}
seed 1488 ITA hero_p100: life 293 d, not counted; nation land fight days 435; hero 0.348; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 0 d; asks {}
seed 1488 FRA hero_char2c: life 627 d, PASS; nation land fight days 527; hero 0.324; regulars (4, alive ≥ 90 %) best 0.216, p10 0.216, median 0.150; fights on its land 99 d; asks {"ok":43}
seed 1488 ENG hero_tog2: life 382 d, not counted; nation land fight days 532; hero 0.243; regulars (1, alive ≥ 90 %) best 0.140, p10 0.140, median 0.140; fights on its land 22 d; asks {"refused":294,"ok":9}
seed 1488 JAP hero_o_i: life 50 d, not counted; nation land fight days 607; hero 0.220; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 0 d; asks {"refused":6}
seed 1488 ENG hero_tog2: life 486 d, not counted; nation land fight days 532; hero 0.245; regulars (1, alive ≥ 90 %) best 0.140, p10 0.140, median 0.140; fights on its land 0 d; asks {"refused":72}
seed 1489 JAP hero_o_i: life 45 d, PASS; nation land fight days 868; hero 0.444; regulars (8, alive ≥ 90 %) best 0.246, p10 0.246, median 0.190; fights on its land 38 d; asks {"refused":4,"ok":5}
seed 1489 USA hero_t28: life 153 d, MISS; nation land fight days 153; hero 0.137; regulars (57, alive ≥ 90 %) best 0.383, p10 0.271, median 0.141; fights on its land 151 d; asks {"ok":73}
seed 1489 SOV hero_t42: life 522 d, PASS; nation land fight days 651; hero 0.352; regulars (122, alive ≥ 90 %) best 0.347, p10 0.158, median 0.072; fights on its land 522 d; asks {"ok":228,"refused":167}
seed 1489 GER hero_maus: life 128 d, not counted; nation land fight days 565; hero 0.531; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 115 d; asks {"ok":34,"refused":22}
seed 1489 ENG hero_tog2: life 63 d, MISS; nation land fight days 353; hero 0.063; regulars (12, alive ≥ 90 %) best 0.287, p10 0.271, median 0.194; fights on its land 46 d; asks {"ok":5,"refused":144}
seed 1489 FRA hero_char2c: life 303 d, MISS; nation land fight days 303; hero 0.043; regulars (60, alive ≥ 90 %) best 0.238, p10 0.204, median 0.063; fights on its land 92 d; asks {"ok":43,"refused":622}
seed 1489 ITA hero_p100: life 326 d, MISS; nation land fight days 554; hero 0.049; regulars (6, alive ≥ 90 %) best 0.141, p10 0.141, median 0.111; fights on its land 300 d; asks {"ok":43,"refused":1009}
seed 1489 JAP hero_o_i: life 189 d, PASS; nation land fight days 868; hero 0.280; regulars (8, alive ≥ 90 %) best 0.246, p10 0.246, median 0.190; fights on its land 164 d; asks {"refused":40,"ok":121,"long":8}
seed 1489 ENG hero_tog2: life 295 d, MISS; nation land fight days 353; hero 0.203; regulars (12, alive ≥ 90 %) best 0.287, p10 0.271, median 0.194; fights on its land 198 d; asks {"ok":36,"refused":42}
seed 1489 GER hero_maus: life 266 d, not counted; nation land fight days 565; hero 0.117; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 90 d; asks {"ok":31,"refused":420}
seed 1489 JAP hero_o_i: life 423 d, PASS; nation land fight days 868; hero 0.251; regulars (8, alive ≥ 90 %) best 0.246, p10 0.246, median 0.190; fights on its land 119 d; asks {"refused":14,"ok":85}
seed 1489 ENG hero_tog2: life 183 d, MISS; nation land fight days 353; hero 0.202; regulars (12, alive ≥ 90 %) best 0.287, p10 0.271, median 0.194; fights on its land 53 d; asks {"ok":30,"refused":70}
seed 1489 JAP hero_o_i: life 402 d, PASS; nation land fight days 868; hero 0.609; regulars (8, alive ≥ 90 %) best 0.246, p10 0.246, median 0.190; fights on its land 242 d; asks {"refused":4,"ok":119}
seed 1489 GER hero_maus: life 387 d, not counted; nation land fight days 565; hero 0.072; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 16 d; asks {"ok":10}
seed 1489 ITA hero_p100: life 682 d, PASS; nation land fight days 554; hero 0.177; regulars (6, alive ≥ 90 %) best 0.141, p10 0.141, median 0.111; fights on its land 78 d; asks {"ok":34}
seed 1489 GER hero_maus: life 510 d, not counted; nation land fight days 565; hero 0.084; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 6 d; asks {"ok":4}
seed 1489 SOV hero_t42: life 651 d, MISS; nation land fight days 651; hero 0.063; regulars (122, alive ≥ 90 %) best 0.347, p10 0.158, median 0.072; fights on its land 36 d; asks {"ok":26,"refused":135}
seed 1489 GER hero_maus: life 584 d, not counted; nation land fight days 565; hero 0.176; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 2 d; asks {}
seed 1489 ITA hero_p100: life 863 d, PASS; nation land fight days 554; hero 0.196; regulars (6, alive ≥ 90 %) best 0.141, p10 0.141, median 0.111; fights on its land 126 d; asks {"long":1,"ok":23}
seed 1489 GER hero_maus: life 168 d, not counted; nation land fight days 565; hero 0.274; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 0 d; asks {"refused":146}
seed 1489 ITA hero_p100: life 743 d, PASS; nation land fight days 554; hero 0.288; regulars (6, alive ≥ 90 %) best 0.141, p10 0.141, median 0.111; fights on its land 0 d; asks {"refused":122}
seed 1489 JAP hero_o_i: life 576 d, MISS; nation land fight days 868; hero 0.043; regulars (8, alive ≥ 90 %) best 0.246, p10 0.246, median 0.190; fights on its land 47 d; asks {"refused":52,"ok":25}
seed 1490 JAP hero_o_i: life 45 d, PASS; nation land fight days 620; hero 0.222; regulars (25, alive ≥ 90 %) best 0.261, p10 0.184, median 0.116; fights on its land 38 d; asks {"refused":4,"ok":12}
seed 1490 USA hero_t28: life 36 d, MISS; nation land fight days 36; hero 0.000; regulars (70, alive ≥ 90 %) best 0.627, p10 0.392, median 0.130; fights on its land 0 d; asks {"refused":96,"ok":30}
seed 1490 SOV hero_t42: life 498 d, PASS; nation land fight days 706; hero 0.293; regulars (91, alive ≥ 90 %) best 0.177, p10 0.116, median 0.042; fights on its land 487 d; asks {"ok":209,"refused":2}
seed 1490 GER hero_maus: life 456 d, PASS; nation land fight days 814; hero 0.322; regulars (23, alive ≥ 90 %) best 0.160, p10 0.135, median 0.103; fights on its land 453 d; asks {"ok":245,"refused":45,"long":9}
seed 1490 ENG hero_tog2: life 100 d, MISS; nation land fight days 656; hero 0.010; regulars (6, alive ≥ 90 %) best 0.248, p10 0.248, median 0.157; fights on its land 47 d; asks {"ok":53,"refused":202}
seed 1490 FRA hero_char2c: life 109 d, PASS; nation land fight days 757; hero 0.165; regulars (3, alive ≥ 90 %) best 0.119, p10 0.119, median 0.000; fights on its land 43 d; asks {"ok":53,"refused":344}
seed 1490 ITA hero_p100: life 881 d, PASS; nation land fight days 892; hero 0.179; regulars (17, alive ≥ 90 %) best 0.111, p10 0.104, median 0.068; fights on its land 878 d; asks {"ok":236,"long":6}
seed 1490 JAP hero_o_i: life 420 d, PASS; nation land fight days 620; hero 0.526; regulars (25, alive ≥ 90 %) best 0.261, p10 0.184, median 0.116; fights on its land 330 d; asks {"refused":82,"ok":310}
seed 1490 FRA hero_char2c: life 118 d, MISS; nation land fight days 757; hero 0.102; regulars (3, alive ≥ 90 %) best 0.119, p10 0.119, median 0.000; fights on its land 93 d; asks {"ok":37,"long":44,"refused":30}
seed 1490 SOV hero_t42: life 691 d, PASS; nation land fight days 706; hero 0.190; regulars (91, alive ≥ 90 %) best 0.177, p10 0.116, median 0.042; fights on its land 353 d; asks {"ok":174,"refused":3}
seed 1490 FRA hero_char2c: life 359 d, PASS; nation land fight days 757; hero 0.203; regulars (3, alive ≥ 90 %) best 0.119, p10 0.119, median 0.000; fights on its land 314 d; asks {"ok":68}
seed 1490 ENG hero_tog2: life 334 d, MISS; nation land fight days 656; hero 0.210; regulars (6, alive ≥ 90 %) best 0.248, p10 0.248, median 0.157; fights on its land 91 d; asks {"refused":50,"ok":51}
seed 1490 ITA hero_p100: life 218 d, PASS; nation land fight days 892; hero 0.161; regulars (17, alive ≥ 90 %) best 0.111, p10 0.104, median 0.068; fights on its land 75 d; asks {"long":18,"ok":29}
seed 1490 FRA hero_char2c: life 235 d, PASS; nation land fight days 757; hero 0.260; regulars (3, alive ≥ 90 %) best 0.119, p10 0.119, median 0.000; fights on its land 169 d; asks {"ok":30}
seed 1490 GER hero_maus: life 493 d, PASS; nation land fight days 814; hero 0.227; regulars (23, alive ≥ 90 %) best 0.160, p10 0.135, median 0.103; fights on its land 296 d; asks {"ok":85}
seed 1490 ITA hero_p100: life 553 d, PASS; nation land fight days 892; hero 0.172; regulars (17, alive ≥ 90 %) best 0.111, p10 0.104, median 0.068; fights on its land 103 d; asks {"ok":70}
seed 1490 FRA hero_char2c: life 530 d, PASS; nation land fight days 757; hero 0.287; regulars (3, alive ≥ 90 %) best 0.119, p10 0.119, median 0.000; fights on its land 257 d; asks {"ok":55}
seed 1490 FRA hero_char2c: life 530 d, PASS; nation land fight days 757; hero 0.170; regulars (3, alive ≥ 90 %) best 0.119, p10 0.119, median 0.000; fights on its land 76 d; asks {"refused":32,"ok":17}
seed 1490 SOV hero_t42: life 35 d, MISS; nation land fight days 706; hero 0.029; regulars (91, alive ≥ 90 %) best 0.177, p10 0.116, median 0.042; fights on its land 35 d; asks {"ok":11}
seed 1490 ITA hero_p100: life 136 d, PASS; nation land fight days 892; hero 0.199; regulars (17, alive ≥ 90 %) best 0.111, p10 0.104, median 0.068; fights on its land 86 d; asks {"ok":23}
seed 1490 ENG hero_tog2: life 476 d, MISS; nation land fight days 656; hero 0.002; regulars (6, alive ≥ 90 %) best 0.248, p10 0.248, median 0.157; fights on its land 19 d; asks {"refused":51,"ok":10}
seed 1490 JAP hero_o_i: life 690 d, PASS; nation land fight days 620; hero 0.193; regulars (25, alive ≥ 90 %) best 0.261, p10 0.184, median 0.116; fights on its land 101 d; asks {"refused":2,"ok":44}
seed 1490 GER hero_maus: life 512 d, PASS; nation land fight days 814; hero 0.316; regulars (23, alive ≥ 90 %) best 0.160, p10 0.135, median 0.103; fights on its land 70 d; asks {"ok":35}
seed 1490 FRA hero_char2c: life 109 d, MISS; nation land fight days 757; hero 0.092; regulars (3, alive ≥ 90 %) best 0.119, p10 0.119, median 0.000; fights on its land 0 d; asks {"refused":134,"ok":2}
seed 1490 SOV hero_t42: life 352 d, PASS; nation land fight days 706; hero 0.233; regulars (91, alive ≥ 90 %) best 0.177, p10 0.116, median 0.042; fights on its land 53 d; asks {"ok":13}
seed 1490 ENG hero_tog2: life 570 d, MISS; nation land fight days 656; hero 0.098; regulars (6, alive ≥ 90 %) best 0.248, p10 0.248, median 0.157; fights on its land 29 d; asks {"refused":52,"ok":11}
seed 1490 ITA hero_p100: life 66 d, PASS; nation land fight days 892; hero 0.242; regulars (17, alive ≥ 90 %) best 0.111, p10 0.104, median 0.068; fights on its land 41 d; asks {"ok":9}
seed 1490 FRA hero_char2c: life 607 d, PASS; nation land fight days 757; hero 0.239; regulars (3, alive ≥ 90 %) best 0.119, p10 0.119, median 0.000; fights on its land 0 d; asks {}
```

```
seed 1481 JAP hero_yamato: at war alive 915 d, in battle 12 d, share 0.013, ceiling 0.033, gone at war 180 d; with 0.866, ofFleet 1.000 (7 d)
seed 1481 JAP hero_o_i: at war alive 855 d, in battle 68 d, share 0.080, ceiling 0.632, gone at war 240 d; ofArmy 0.126
seed 1481 USA hero_iowa: at war alive 515 d, in battle 2 d, share 0.004, ceiling 0.012, gone at war 143 d; with 0.775, ofFleet 1.000 (1 d)
seed 1481 USA hero_t28: at war alive 576 d, in battle 22 d, share 0.038, ceiling 0.201, gone at war 82 d; ofArmy 0.190
seed 1481 SOV hero_sovetsky_soyuz: at war alive 931 d, in battle 4 d, share 0.004, ceiling 0.013, gone at war 60 d; with 0.984, ofFleet 1.000 (3 d)
seed 1481 SOV hero_t42: at war alive 991 d, in battle 80 d, share 0.081, ceiling 0.594, gone at war 0 d; ofArmy 0.136
seed 1481 GER hero_bismarck: at war alive 785 d, in battle 17 d, share 0.022, ceiling 0.027, gone at war 300 d; with 0.660, ofFleet 0.000 (2 d)
seed 1481 GER hero_maus: at war alive 1085 d, in battle 214 d, share 0.197, ceiling 0.500, gone at war 0 d; ofArmy 0.395
seed 1481 ENG hero_hood: at war alive 822 d, in battle 2 d, share 0.002, ceiling 0.028, gone at war 105 d; with 0.954, ofFleet 1.000 (1 d)
seed 1481 ENG hero_tog2: at war alive 663 d, in battle 32 d, share 0.048, ceiling 0.357, gone at war 264 d; ofArmy 0.135
seed 1481 FRA hero_richelieu: at war alive 846 d, in battle 4 d, share 0.005, ceiling 0.018, gone at war 45 d; with 0.774, ofFleet 0.600 (5 d)
seed 1481 FRA hero_char2c: at war alive 571 d, in battle 40 d, share 0.070, ceiling 0.254, gone at war 320 d; ofArmy 0.276
seed 1481 ITA hero_roma: at war alive 895 d, in battle 15 d, share 0.017, ceiling 0.025, gone at war 190 d; with 0.651, ofFleet 0.000 (2 d)
seed 1481 ITA hero_p100: at war alive 965 d, in battle 109 d, share 0.113, ceiling 0.492, gone at war 120 d; ofArmy 0.229
seed 1482 JAP hero_yamato: at war alive 855 d, in battle 25 d, share 0.029, ceiling 0.069, gone at war 240 d; with 0.811, ofFleet 0.150 (20 d)
seed 1482 JAP hero_o_i: at war alive 1035 d, in battle 227 d, share 0.219, ceiling 0.675, gone at war 60 d; ofArmy 0.325
seed 1482 USA hero_iowa: at war alive 579 d, in battle 4 d, share 0.007, ceiling 0.107, gone at war 0 d; with 0.990, ofFleet 0.750 (4 d)
seed 1482 USA hero_t28: at war alive 543 d, in battle 2 d, share 0.004, ceiling 0.214, gone at war 36 d; ofArmy 0.017
seed 1482 SOV hero_sovetsky_soyuz: at war alive 752 d, in battle 20 d, share 0.027, ceiling 0.031, gone at war 120 d; with 0.753, ofFleet 1.000 (14 d)
seed 1482 SOV hero_t42: at war alive 872 d, in battle 22 d, share 0.025, ceiling 0.396, gone at war 0 d; ofArmy 0.064
seed 1482 GER hero_bismarck: at war alive 578 d, in battle 47 d, share 0.081, ceiling 0.087, gone at war 480 d; with 0.303, ofFleet 1.000 (19 d)
seed 1482 GER hero_maus: at war alive 878 d, in battle 133 d, share 0.151, ceiling 0.377, gone at war 180 d; ofArmy 0.402
seed 1482 ENG hero_hood: at war alive 620 d, in battle 14 d, share 0.023, ceiling 0.094, gone at war 357 d; with 0.348, ofFleet 0.000 (4 d)
seed 1482 ENG hero_tog2: at war alive 737 d, in battle 120 d, share 0.163, ceiling 0.398, gone at war 240 d; ofArmy 0.410
seed 1482 FRA hero_richelieu: at war alive 816 d, in battle 0 d, share 0.000, ceiling 0.000, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1482 FRA hero_char2c: at war alive 603 d, in battle 60 d, share 0.100, ceiling 0.534, gone at war 213 d; ofArmy 0.186
seed 1482 ITA hero_roma: at war alive 767 d, in battle 61 d, share 0.080, ceiling 0.089, gone at war 300 d; with 0.692, ofFleet 0.906 (32 d)
seed 1482 ITA hero_p100: at war alive 947 d, in battle 156 d, share 0.165, ceiling 0.391, gone at war 120 d; ofArmy 0.422
seed 1483 JAP hero_yamato: at war alive 975 d, in battle 10 d, share 0.010, ceiling 0.019, gone at war 120 d; with 0.925, ofFleet 1.000 (9 d)
seed 1483 JAP hero_o_i: at war alive 795 d, in battle 121 d, share 0.152, ceiling 0.624, gone at war 300 d; ofArmy 0.244
seed 1483 USA hero_iowa: at war alive 722 d, in battle 0 d, share 0.000, ceiling 0.015, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1483 USA hero_t28: at war alive 722 d, in battle 0 d, share 0.000, ceiling 0.377, gone at war 0 d; ofArmy 0.000
seed 1483 SOV hero_sovetsky_soyuz: at war alive 821 d, in battle 16 d, share 0.019, ceiling 0.033, gone at war 60 d; with 0.911, ofFleet 1.000 (11 d)
seed 1483 SOV hero_t42: at war alive 821 d, in battle 147 d, share 0.179, ceiling 0.895, gone at war 60 d; ofArmy 0.200
seed 1483 GER hero_bismarck: at war alive 836 d, in battle 10 d, share 0.012, ceiling 0.018, gone at war 240 d; with 0.443, ofFleet 1.000 (5 d)
seed 1483 GER hero_maus: at war alive 896 d, in battle 199 d, share 0.222, ceiling 0.688, gone at war 180 d; ofArmy 0.323
seed 1483 ENG hero_hood: at war alive 739 d, in battle 13 d, share 0.018, ceiling 0.037, gone at war 254 d; with 0.277, ofFleet 1.000 (2 d)
seed 1483 ENG hero_tog2: at war alive 693 d, in battle 37 d, share 0.053, ceiling 0.593, gone at war 300 d; ofArmy 0.090
seed 1483 FRA hero_richelieu: at war alive 640 d, in battle 8 d, share 0.013, ceiling 0.034, gone at war 112 d; with 0.933, ofFleet 0.625 (8 d)
seed 1483 FRA hero_char2c: at war alive 586 d, in battle 74 d, share 0.126, ceiling 0.478, gone at war 166 d; ofArmy 0.264
seed 1483 ITA hero_roma: at war alive 968 d, in battle 4 d, share 0.004, ceiling 0.015, gone at war 120 d; with 0.329, ofFleet 1.000 (2 d)
seed 1483 ITA hero_p100: at war alive 696 d, in battle 158 d, share 0.227, ceiling 0.718, gone at war 392 d; ofArmy 0.316
seed 1484 JAP hero_yamato: at war alive 975 d, in battle 1 d, share 0.001, ceiling 0.008, gone at war 120 d; with 0.911, ofFleet n/a (0 d)
seed 1484 JAP hero_o_i: at war alive 747 d, in battle 122 d, share 0.163, ceiling 0.679, gone at war 348 d; ofArmy 0.241
seed 1484 USA hero_iowa: at war alive 678 d, in battle 0 d, share 0.000, ceiling 0.001, gone at war 0 d; with 0.991, ofFleet 0.000 (1 d)
seed 1484 USA hero_t28: at war alive 642 d, in battle 13 d, share 0.020, ceiling 0.176, gone at war 36 d; ofArmy 0.115
seed 1484 SOV hero_sovetsky_soyuz: at war alive 596 d, in battle 8 d, share 0.013, ceiling 0.023, gone at war 377 d; with 0.727, ofFleet 0.667 (3 d)
seed 1484 SOV hero_t42: at war alive 775 d, in battle 166 d, share 0.214, ceiling 0.818, gone at war 198 d; ofArmy 0.262
seed 1484 GER hero_bismarck: at war alive 890 d, in battle 20 d, share 0.022, ceiling 0.025, gone at war 120 d; with 0.563, ofFleet 1.000 (5 d)
seed 1484 GER hero_maus: at war alive 1010 d, in battle 50 d, share 0.050, ceiling 0.534, gone at war 0 d; ofArmy 0.093
seed 1484 ENG hero_hood: at war alive 893 d, in battle 18 d, share 0.020, ceiling 0.044, gone at war 60 d; with 1.000, ofFleet 1.000 (18 d)
seed 1484 ENG hero_tog2: at war alive 953 d, in battle 37 d, share 0.039, ceiling 0.222, gone at war 0 d; ofArmy 0.175
seed 1484 FRA hero_richelieu: at war alive 953 d, in battle 0 d, share 0.000, ceiling 0.001, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1484 FRA hero_char2c: at war alive 953 d, in battle 29 d, share 0.030, ceiling 0.177, gone at war 0 d; ofArmy 0.172
seed 1484 ITA hero_roma: at war alive 909 d, in battle 13 d, share 0.014, ceiling 0.019, gone at war 120 d; with 0.572, ofFleet 1.000 (6 d)
seed 1484 ITA hero_p100: at war alive 1029 d, in battle 224 d, share 0.218, ceiling 0.523, gone at war 0 d; ofArmy 0.416
seed 1485 JAP hero_yamato: at war alive 1035 d, in battle 9 d, share 0.009, ceiling 0.354, gone at war 60 d; with 0.951, ofFleet 0.021 (336 d)
seed 1485 JAP hero_o_i: at war alive 975 d, in battle 182 d, share 0.187, ceiling 0.767, gone at war 120 d; ofArmy 0.243
seed 1485 USA hero_iowa: at war alive 550 d, in battle 0 d, share 0.000, ceiling 0.005, gone at war 0 d; with 1.000, ofFleet 0.000 (1 d)
seed 1485 USA hero_t28: at war alive 550 d, in battle 52 d, share 0.095, ceiling 0.440, gone at war 0 d; ofArmy 0.215
seed 1485 SOV hero_sovetsky_soyuz: at war alive 831 d, in battle 2 d, share 0.002, ceiling 0.022, gone at war 0 d; with 1.000, ofFleet 0.667 (3 d)
seed 1485 SOV hero_t42: at war alive 831 d, in battle 106 d, share 0.128, ceiling 0.463, gone at war 0 d; ofArmy 0.275
seed 1485 GER hero_bismarck: at war alive 900 d, in battle 18 d, share 0.020, ceiling 0.024, gone at war 180 d; with 0.668, ofFleet 1.000 (9 d)
seed 1485 GER hero_maus: at war alive 1020 d, in battle 88 d, share 0.086, ceiling 0.498, gone at war 60 d; ofArmy 0.173
seed 1485 ENG hero_hood: at war alive 618 d, in battle 320 d, share 0.518, ceiling 0.563, gone at war 318 d; with 0.864, ofFleet 1.000 (313 d)
seed 1485 ENG hero_tog2: at war alive 876 d, in battle 22 d, share 0.025, ceiling 0.210, gone at war 60 d; ofArmy 0.120
seed 1485 FRA hero_richelieu: at war alive 714 d, in battle 45 d, share 0.063, ceiling 0.076, gone at war 83 d; with 0.874, ofFleet 1.000 (42 d)
seed 1485 FRA hero_char2c: at war alive 677 d, in battle 62 d, share 0.092, ceiling 0.309, gone at war 120 d; ofArmy 0.297
seed 1485 ITA hero_roma: at war alive 642 d, in battle 16 d, share 0.025, ceiling 0.037, gone at war 430 d; with 0.341, ofFleet 1.000 (3 d)
seed 1485 ITA hero_p100: at war alive 1072 d, in battle 43 d, share 0.040, ceiling 0.568, gone at war 0 d; ofArmy 0.071
seed 1486 JAP hero_yamato: at war alive 1095 d, in battle 0 d, share 0.000, ceiling 0.002, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1486 JAP hero_o_i: at war alive 1095 d, in battle 204 d, share 0.186, ceiling 0.579, gone at war 0 d; ofArmy 0.322
seed 1486 USA hero_iowa: at war alive 8 d, in battle 0 d, share 0.000, ceiling 0.000, gone at war 0 d; with 0.000, ofFleet n/a (0 d)
seed 1486 USA hero_t28: at war alive 8 d, in battle 0 d, share 0.000, ceiling 0.000, gone at war 0 d; ofArmy n/a
seed 1486 SOV hero_sovetsky_soyuz: at war alive 690 d, in battle 19 d, share 0.028, ceiling 0.035, gone at war 196 d; with 0.983, ofFleet 1.000 (6 d)
seed 1486 SOV hero_t42: at war alive 826 d, in battle 21 d, share 0.025, ceiling 0.484, gone at war 60 d; ofArmy 0.052
seed 1486 GER hero_bismarck: at war alive 1072 d, in battle 1 d, share 0.001, ceiling 0.006, gone at war 0 d; with 1.000, ofFleet 1.000 (1 d)
seed 1486 GER hero_maus: at war alive 1072 d, in battle 94 d, share 0.088, ceiling 0.505, gone at war 0 d; ofArmy 0.174
seed 1486 ENG hero_hood: at war alive 751 d, in battle 0 d, share 0.000, ceiling 0.027, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1486 ENG hero_tog2: at war alive 751 d, in battle 15 d, share 0.020, ceiling 0.341, gone at war 0 d; ofArmy 0.059
seed 1486 FRA hero_richelieu: at war alive 810 d, in battle 0 d, share 0.000, ceiling 0.005, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1486 FRA hero_char2c: at war alive 724 d, in battle 84 d, share 0.116, ceiling 0.354, gone at war 86 d; ofArmy 0.328
seed 1486 ITA hero_roma: at war alive 1061 d, in battle 0 d, share 0.000, ceiling 0.001, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1486 ITA hero_p100: at war alive 1061 d, in battle 41 d, share 0.039, ceiling 0.397, gone at war 0 d; ofArmy 0.097
seed 1487 JAP hero_yamato: at war alive 641 d, in battle 25 d, share 0.039, ceiling 0.114, gone at war 454 d; with 0.426, ofFleet 0.083 (48 d)
seed 1487 JAP hero_o_i: at war alive 915 d, in battle 30 d, share 0.033, ceiling 0.531, gone at war 180 d; ofArmy 0.062
seed 1487 USA hero_iowa: at war alive 551 d, in battle 4 d, share 0.007, ceiling 0.040, gone at war 107 d; with 0.871, ofFleet 0.800 (5 d)
seed 1487 USA hero_t28: at war alive 598 d, in battle 0 d, share 0.000, ceiling 0.415, gone at war 60 d; ofArmy 0.000
seed 1487 SOV hero_sovetsky_soyuz: at war alive 826 d, in battle 12 d, share 0.015, ceiling 0.023, gone at war 233 d; with 0.927, ofFleet 0.750 (8 d)
seed 1487 SOV hero_t42: at war alive 879 d, in battle 220 d, share 0.250, ceiling 0.749, gone at war 180 d; ofArmy 0.334
seed 1487 GER hero_bismarck: at war alive 604 d, in battle 24 d, share 0.040, ceiling 0.055, gone at war 460 d; with 0.204, ofFleet 0.750 (4 d)
seed 1487 GER hero_maus: at war alive 889 d, in battle 128 d, share 0.144, ceiling 0.440, gone at war 175 d; ofArmy 0.327
seed 1487 ENG hero_hood: at war alive 970 d, in battle 3 d, share 0.003, ceiling 0.056, gone at war 60 d; with 0.999, ofFleet 1.000 (3 d)
seed 1487 ENG hero_tog2: at war alive 850 d, in battle 37 d, share 0.044, ceiling 0.646, gone at war 180 d; ofArmy 0.067
seed 1487 FRA hero_richelieu: at war alive 614 d, in battle 25 d, share 0.041, ceiling 0.093, gone at war 60 d; with 0.972, ofFleet 0.543 (46 d)
seed 1487 FRA hero_char2c: at war alive 637 d, in battle 65 d, share 0.102, ceiling 0.375, gone at war 37 d; ofArmy 0.272
seed 1487 ITA hero_roma: at war alive 588 d, in battle 18 d, share 0.031, ceiling 0.036, gone at war 476 d; with 0.209, ofFleet 1.000 (3 d)
seed 1487 ITA hero_p100: at war alive 944 d, in battle 122 d, share 0.129, ceiling 0.524, gone at war 120 d; ofArmy 0.246
seed 1488 JAP hero_yamato: at war alive 735 d, in battle 34 d, share 0.046, ceiling 0.054, gone at war 360 d; with 0.865, ofFleet 0.917 (12 d)
seed 1488 JAP hero_o_i: at war alive 855 d, in battle 97 d, share 0.113, ceiling 0.488, gone at war 240 d; ofArmy 0.233
seed 1488 USA hero_iowa: at war alive 463 d, in battle 1 d, share 0.002, ceiling 0.067, gone at war 0 d; with 1.000, ofFleet 1.000 (1 d)
seed 1488 USA hero_t28: at war alive 463 d, in battle 30 d, share 0.065, ceiling 0.326, gone at war 0 d; ofArmy 0.199
seed 1488 SOV hero_sovetsky_soyuz: at war alive 889 d, in battle 11 d, share 0.012, ceiling 0.022, gone at war 82 d; with 0.996, ofFleet 0.750 (12 d)
seed 1488 SOV hero_t42: at war alive 911 d, in battle 183 d, share 0.201, ceiling 0.688, gone at war 60 d; ofArmy 0.292
seed 1488 GER hero_bismarck: at war alive 74 d, in battle 21 d, share 0.284, ceiling 0.284, gone at war 317 d; with 0.514, ofFleet 1.000 (4 d)
seed 1488 GER hero_maus: at war alive 151 d, in battle 46 d, share 0.305, ceiling 0.762, gone at war 240 d; ofArmy 0.400
seed 1488 ENG hero_hood: at war alive 1048 d, in battle 5 d, share 0.005, ceiling 0.100, gone at war 0 d; with 1.000, ofFleet 0.600 (5 d)
seed 1488 ENG hero_tog2: at war alive 688 d, in battle 59 d, share 0.086, ceiling 0.490, gone at war 360 d; ofArmy 0.175
seed 1488 FRA hero_richelieu: at war alive 984 d, in battle 15 d, share 0.015, ceiling 0.017, gone at war 60 d; with 0.970, ofFleet 1.000 (13 d)
seed 1488 FRA hero_char2c: at war alive 744 d, in battle 109 d, share 0.147, ceiling 0.465, gone at war 300 d; ofArmy 0.315
seed 1488 ITA hero_roma: at war alive 598 d, in battle 51 d, share 0.085, ceiling 0.099, gone at war 377 d; with 0.564, ofFleet 0.750 (8 d)
seed 1488 ITA hero_p100: at war alive 738 d, in battle 20 d, share 0.027, ceiling 0.447, gone at war 237 d; ofArmy 0.061
seed 1489 JAP hero_yamato: at war alive 1095 d, in battle 2 d, share 0.002, ceiling 0.037, gone at war 0 d; with 1.000, ofFleet 0.286 (7 d)
seed 1489 JAP hero_o_i: at war alive 855 d, in battle 231 d, share 0.270, ceiling 0.773, gone at war 240 d; ofArmy 0.349
seed 1489 USA hero_iowa: at war alive 599 d, in battle 0 d, share 0.000, ceiling 0.000, gone at war 0 d; with 0.998, ofFleet n/a (0 d)
seed 1489 USA hero_t28: at war alive 599 d, in battle 21 d, share 0.035, ceiling 0.255, gone at war 0 d; ofArmy 0.137
seed 1489 SOV hero_sovetsky_soyuz: at war alive 866 d, in battle 6 d, share 0.007, ceiling 0.021, gone at war 134 d; with 0.641, ofFleet 1.000 (1 d)
seed 1489 SOV hero_t42: at war alive 940 d, in battle 184 d, share 0.196, ceiling 0.628, gone at war 60 d; ofArmy 0.312
seed 1489 GER hero_bismarck: at war alive 572 d, in battle 12 d, share 0.021, ceiling 0.030, gone at war 479 d; with 0.379, ofFleet 1.000 (4 d)
seed 1489 GER hero_maus: at war alive 752 d, in battle 33 d, share 0.044, ceiling 0.438, gone at war 299 d; ofArmy 0.100
seed 1489 ENG hero_hood: at war alive 401 d, in battle 21 d, share 0.052, ceiling 0.097, gone at war 492 d; with 0.504, ofFleet 0.933 (15 d)
seed 1489 ENG hero_tog2: at war alive 773 d, in battle 54 d, share 0.070, ceiling 0.375, gone at war 120 d; ofArmy 0.186
seed 1489 FRA hero_richelieu: at war alive 554 d, in battle 1 d, share 0.002, ceiling 0.004, gone at war 60 d; with 0.955, ofFleet 1.000 (1 d)
seed 1489 FRA hero_char2c: at war alive 614 d, in battle 13 d, share 0.021, ceiling 0.492, gone at war 0 d; ofArmy 0.043
seed 1489 ITA hero_roma: at war alive 798 d, in battle 6 d, share 0.008, ceiling 0.026, gone at war 262 d; with 0.939, ofFleet 1.000 (1 d)
seed 1489 ITA hero_p100: at war alive 881 d, in battle 49 d, share 0.056, ceiling 0.510, gone at war 179 d; ofArmy 0.109
seed 1490 JAP hero_yamato: at war alive 795 d, in battle 14 d, share 0.018, ceiling 0.025, gone at war 300 d; with 0.404, ofFleet 0.800 (5 d)
seed 1490 JAP hero_o_i: at war alive 975 d, in battle 211 d, share 0.216, ceiling 0.539, gone at war 120 d; ofArmy 0.401
seed 1490 USA hero_iowa: at war alive 565 d, in battle 2 d, share 0.004, ceiling 0.023, gone at war 0 d; with 0.995, ofFleet n/a (0 d)
seed 1490 USA hero_t28: at war alive 565 d, in battle 0 d, share 0.000, ceiling 0.064, gone at war 0 d; ofArmy 0.000
seed 1490 SOV hero_sovetsky_soyuz: at war alive 497 d, in battle 22 d, share 0.044, ceiling 0.050, gone at war 471 d; with 0.724, ofFleet 1.000 (1 d)
seed 1490 SOV hero_t42: at war alive 788 d, in battle 157 d, share 0.199, ceiling 0.759, gone at war 180 d; ofArmy 0.263
seed 1490 GER hero_bismarck: at war alive 561 d, in battle 34 d, share 0.061, ceiling 0.070, gone at war 480 d; with 0.513, ofFleet 0.875 (8 d)
seed 1490 GER hero_maus: at war alive 921 d, in battle 170 d, share 0.185, ceiling 0.763, gone at war 120 d; ofArmy 0.242
seed 1490 ENG hero_hood: at war alive 847 d, in battle 12 d, share 0.014, ceiling 0.113, gone at war 240 d; with 0.966, ofFleet 1.000 (9 d)
seed 1490 ENG hero_tog2: at war alive 847 d, in battle 33 d, share 0.039, ceiling 0.553, gone at war 240 d; ofArmy 0.071
seed 1490 FRA hero_richelieu: at war alive 907 d, in battle 14 d, share 0.015, ceiling 0.024, gone at war 180 d; with 0.882, ofFleet 0.400 (5 d)
seed 1490 FRA hero_char2c: at war alive 667 d, in battle 89 d, share 0.133, ceiling 0.589, gone at war 420 d; ofArmy 0.226
seed 1490 ITA hero_roma: at war alive 681 d, in battle 30 d, share 0.044, ceiling 0.053, gone at war 360 d; with 0.386, ofFleet 1.000 (7 d)
seed 1490 ITA hero_p100: at war alive 801 d, in battle 186 d, share 0.232, ceiling 0.845, gone at war 240 d; ofArmy 0.275
```
