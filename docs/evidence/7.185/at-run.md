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
