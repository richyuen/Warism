# PLAN 7.186: the AT run (2026-11-02)

Seeds 1491–1500 × 3, heroes on. *sea*: `joinFights` with the crossing by sea (uncommitted); *HEAD*: db95a15f (no crossing), the same seeds.

```
sea:  93 of 170 lives at or above the top decile (0.547); ENG 10/20, USA 3/9 (pass/miss): 13 of 42
HEAD: 113 of 195 (0.579); ENG 15/26, USA 5/9: 20 of 55
sea, heroBattle: with >= 0.5 on 45 of 70; ofFleet >= 0.5 on 54 of 61
```

## sea, each life

```
seed 1491 JAP hero_o_i: life 223 d, not counted; nation land fight days 597; hero 0.000; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 83 d; asks {"refused":17,"ok":31}
seed 1491 USA hero_t28: life 141 d, MISS; nation land fight days 141; hero 0.191; regulars (59, alive ≥ 90 %) best 0.331, p10 0.253, median 0.106; fights on its land 99 d; asks {"ok":90,"refused":78}
seed 1491 SOV hero_t42: life 485 d, PASS; nation land fight days 485; hero 0.206; regulars (132, alive ≥ 90 %) best 0.212, p10 0.151, median 0.039; fights on its land 480 d; asks {"ok":338,"refused":10,"long":14}
seed 1491 GER hero_maus: life 381 d, not counted; nation land fight days 430; hero 0.344; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 324 d; asks {"ok":183}
seed 1491 ENG hero_tog2: life 36 d, MISS; nation land fight days 233; hero 0.167; regulars (39, alive ≥ 90 %) best 0.243, p10 0.189, median 0.097; fights on its land 36 d; asks {"ok":26}
seed 1491 FRA hero_char2c: life 71 d, PASS; nation land fight days 303; hero 0.479; regulars (39, alive ≥ 90 %) best 0.180, p10 0.132, median 0.073; fights on its land 58 d; asks {"ok":17,"refused":8}
seed 1491 ITA hero_p100: life 206 d, not counted; nation land fight days 521; hero 0.354; regulars (2, alive ≥ 90 %) best 0.156, p10 0.156, median 0.156; fights on its land 195 d; asks {"ok":129,"refused":36}
seed 1491 JAP hero_o_i: life 342 d, not counted; nation land fight days 597; hero 0.161; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 255 d; asks {"refused":62,"ok":20}
seed 1491 FRA hero_char2c: life 301 d, PASS; nation land fight days 303; hero 0.256; regulars (39, alive ≥ 90 %) best 0.180, p10 0.132, median 0.073; fights on its land 211 d; asks {"ok":96,"refused":10}
seed 1491 ENG hero_tog2: life 291 d, PASS; nation land fight days 233; hero 0.223; regulars (39, alive ≥ 90 %) best 0.243, p10 0.189, median 0.097; fights on its land 144 d; asks {"ok":91,"refused":98}
seed 1491 JAP hero_o_i: life 250 d, not counted; nation land fight days 597; hero 0.304; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 0 d; asks {"ok":4}
seed 1491 ITA hero_p100: life 371 d, not counted; nation land fight days 521; hero 0.151; regulars (2, alive ≥ 90 %) best 0.156, p10 0.156, median 0.156; fights on its land 144 d; asks {"ok":49}
seed 1491 GER hero_maus: life 462 d, not counted; nation land fight days 430; hero 0.069; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 155 d; asks {"ok":35,"refused":1}
seed 1491 GER hero_maus: life 336 d, not counted; nation land fight days 430; hero 0.074; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 118 d; asks {"ok":2}
seed 1491 ITA hero_p100: life 303 d, not counted; nation land fight days 521; hero 0.343; regulars (2, alive ≥ 90 %) best 0.156, p10 0.156, median 0.156; fights on its land 91 d; asks {"ok":46}
seed 1491 GER hero_maus: life 66 d, not counted; nation land fight days 430; hero 0.364; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 34 d; asks {"ok":23}
seed 1491 JAP hero_o_i: life 171 d, not counted; nation land fight days 597; hero 0.433; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 118 d; asks {"ok":68,"refused":24}
seed 1491 ITA hero_p100: life 530 d, not counted; nation land fight days 521; hero 0.221; regulars (2, alive ≥ 90 %) best 0.156, p10 0.156, median 0.156; fights on its land 12 d; asks {"ok":8}
seed 1491 ITA hero_p100: life 428 d, not counted; nation land fight days 521; hero 0.121; regulars (2, alive ≥ 90 %) best 0.156, p10 0.156, median 0.156; fights on its land 0 d; asks {}
seed 1491 AT: 4 of 6 lives at or above the top decile
seed 1492 JAP hero_o_i: life 126 d, not counted; nation land fight days 713; hero 0.349; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 117 d; asks {"refused":4,"ok":36}
seed 1492 USA hero_t28: life 212 d, MISS; nation land fight days 212; hero 0.071; regulars (47, alive ≥ 90 %) best 0.367, p10 0.284, median 0.095; fights on its land 104 d; asks {"refused":290}
seed 1492 SOV hero_t42: life 694 d, PASS; nation land fight days 694; hero 0.354; regulars (148, alive ≥ 90 %) best 0.344, p10 0.143, median 0.053; fights on its land 688 d; asks {"ok":427,"refused":45,"long":1}
seed 1492 GER hero_maus: life 205 d, not counted; nation land fight days 460; hero 0.537; regulars (1, alive ≥ 90 %) best 0.124, p10 0.124, median 0.124; fights on its land 205 d; asks {"refused":81,"ok":140}
seed 1492 ENG hero_tog2: life 250 d, PASS; nation land fight days 329; hero 0.348; regulars (38, alive ≥ 90 %) best 0.393, p10 0.323, median 0.107; fights on its land 242 d; asks {"ok":92}
seed 1492 FRA hero_char2c: life 316 d, MISS; nation land fight days 300; hero 0.098; regulars (22, alive ≥ 90 %) best 0.379, p10 0.322, median 0.101; fights on its land 257 d; asks {"ok":86,"refused":5}
seed 1492 ITA hero_p100: life 185 d, not counted; nation land fight days 510; hero 0.459; regulars (1, alive ≥ 90 %) best 0.165, p10 0.165, median 0.165; fights on its land 185 d; asks {"ok":118,"refused":54}
seed 1492 JAP hero_o_i: life 570 d, not counted; nation land fight days 713; hero 0.253; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 322 d; asks {"refused":60,"ok":34}
seed 1492 ENG hero_tog2: life 468 d, MISS; nation land fight days 329; hero 0.252; regulars (38, alive ≥ 90 %) best 0.393, p10 0.323, median 0.107; fights on its land 172 d; asks {"ok":129,"refused":26}
seed 1492 FRA hero_char2c: life 193 d, MISS; nation land fight days 300; hero 0.212; regulars (22, alive ≥ 90 %) best 0.379, p10 0.322, median 0.101; fights on its land 74 d; asks {"ok":14}
seed 1492 GER hero_maus: life 270 d, not counted; nation land fight days 460; hero 0.207; regulars (1, alive ≥ 90 %) best 0.124, p10 0.124, median 0.124; fights on its land 5 d; asks {"ok":25}
seed 1492 ITA hero_p100: life 525 d, not counted; nation land fight days 510; hero 0.192; regulars (1, alive ≥ 90 %) best 0.165, p10 0.165, median 0.165; fights on its land 196 d; asks {"ok":50}
seed 1492 JAP hero_o_i: life 74 d, not counted; nation land fight days 713; hero 0.054; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 11 d; asks {"ok":5,"refused":92}
seed 1492 FRA hero_char2c: life 248 d, MISS; nation land fight days 300; hero 0.117; regulars (22, alive ≥ 90 %) best 0.379, p10 0.322, median 0.101; fights on its land 32 d; asks {"refused":64,"ok":58}
seed 1492 GER hero_maus: life 45 d, not counted; nation land fight days 460; hero 0.511; regulars (1, alive ≥ 90 %) best 0.124, p10 0.124, median 0.124; fights on its land 45 d; asks {"ok":15,"long":2}
seed 1492 ITA hero_p100: life 339 d, not counted; nation land fight days 510; hero 0.201; regulars (1, alive ≥ 90 %) best 0.165, p10 0.165, median 0.165; fights on its land 98 d; asks {"ok":13}
seed 1492 GER hero_maus: life 3 d, not counted; nation land fight days 460; hero 0.667; regulars (1, alive ≥ 90 %) best 0.124, p10 0.124, median 0.124; fights on its land 3 d; asks {}
seed 1492 JAP hero_o_i: life 72 d, not counted; nation land fight days 713; hero 0.014; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 12 d; asks {"refused":6,"ok":13}
seed 1492 ITA hero_p100: life 145 d, not counted; nation land fight days 510; hero 0.103; regulars (1, alive ≥ 90 %) best 0.165, p10 0.165, median 0.165; fights on its land 82 d; asks {"ok":24}
seed 1492 GER hero_maus: life 30 d, not counted; nation land fight days 460; hero 0.500; regulars (1, alive ≥ 90 %) best 0.124, p10 0.124, median 0.124; fights on its land 84 d; asks {"ok":17,"refused":18}
seed 1492 JAP hero_o_i: life 110 d, not counted; nation land fight days 713; hero 0.191; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 68 d; asks {"ok":29,"refused":6}
seed 1492 ITA hero_p100: life 125 d, not counted; nation land fight days 510; hero 0.216; regulars (1, alive ≥ 90 %) best 0.165, p10 0.165, median 0.165; fights on its land 89 d; asks {"ok":47}
seed 1492 JAP hero_o_i: life 171 d, not counted; nation land fight days 713; hero 0.333; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 136 d; asks {"refused":4,"ok":56}
seed 1492 FRA hero_char2c: life 99 d, MISS; nation land fight days 300; hero 0.182; regulars (22, alive ≥ 90 %) best 0.379, p10 0.322, median 0.101; fights on its land 27 d; asks {"ok":34}
seed 1492 GER hero_maus: life 99 d, not counted; nation land fight days 460; hero 0.131; regulars (1, alive ≥ 90 %) best 0.124, p10 0.124, median 0.124; fights on its land 18 d; asks {"ok":2}
seed 1492 JAP hero_o_i: life 126 d, not counted; nation land fight days 713; hero 0.310; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 19 d; asks {"refused":82,"ok":6}
seed 1492 GER hero_maus: life 126 d, not counted; nation land fight days 460; hero 0.151; regulars (1, alive ≥ 90 %) best 0.124, p10 0.124, median 0.124; fights on its land 31 d; asks {"refused":50}
seed 1492 JAP hero_o_i: life 122 d, not counted; nation land fight days 713; hero 0.221; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 0 d; asks {"ok":2}
seed 1492 FRA hero_char2c: life 3 d, not counted; nation land fight days 300; hero 0.000; regulars (22, alive ≥ 90 %) best 0.379, p10 0.322, median 0.101; fights on its land 0 d; asks {}
seed 1492 AT: 2 of 8 lives at or above the top decile
seed 1493 JAP hero_o_i: life 60 d, PASS; nation land fight days 840; hero 0.383; regulars (9, alive ≥ 90 %) best 0.176, p10 0.176, median 0.159; fights on its land 53 d; asks {"refused":4,"ok":22}
seed 1493 USA hero_t28: life 305 d, MISS; nation land fight days 323; hero 0.098; regulars (48, alive ≥ 90 %) best 0.310, p10 0.281, median 0.102; fights on its land 80 d; asks {"ok":51,"refused":684}
seed 1493 GER hero_maus: life 45 d, PASS; nation land fight days 703; hero 0.333; regulars (3, alive ≥ 90 %) best 0.176, p10 0.176, median 0.111; fights on its land 44 d; asks {"ok":30}
seed 1493 SOV hero_t42: life 376 d, PASS; nation land fight days 670; hero 0.117; regulars (58, alive ≥ 90 %) best 0.196, p10 0.109, median 0.034; fights on its land 376 d; asks {"ok":190,"refused":10}
seed 1493 GER hero_maus: life 293 d, PASS; nation land fight days 703; hero 0.314; regulars (3, alive ≥ 90 %) best 0.176, p10 0.176, median 0.111; fights on its land 255 d; asks {"ok":184,"refused":59}
seed 1493 ENG hero_tog2: life 212 d, PASS; nation land fight days 472; hero 0.354; regulars (19, alive ≥ 90 %) best 0.377, p10 0.292, median 0.145; fights on its land 188 d; asks {"refused":10,"ok":85}
seed 1493 FRA hero_char2c: life 43 d, PASS; nation land fight days 556; hero 0.488; regulars (22, alive ≥ 90 %) best 0.233, p10 0.214, median 0.131; fights on its land 43 d; asks {"ok":18}
seed 1493 ITA hero_p100: life 52 d, PASS; nation land fight days 751; hero 0.769; regulars (25, alive ≥ 90 %) best 0.157, p10 0.124, median 0.084; fights on its land 46 d; asks {"ok":28,"refused":2}
seed 1493 JAP hero_o_i: life 720 d, PASS; nation land fight days 840; hero 0.264; regulars (9, alive ≥ 90 %) best 0.176, p10 0.176, median 0.159; fights on its land 671 d; asks {"refused":48,"ok":334}
seed 1493 ENG hero_tog2: life 47 d, PASS; nation land fight days 472; hero 0.511; regulars (19, alive ≥ 90 %) best 0.377, p10 0.292, median 0.145; fights on its land 0 d; asks {"refused":8,"ok":2}
seed 1493 ITA hero_p100: life 380 d, PASS; nation land fight days 751; hero 0.366; regulars (25, alive ≥ 90 %) best 0.157, p10 0.124, median 0.084; fights on its land 165 d; asks {"refused":134,"ok":69}
seed 1493 FRA hero_char2c: life 327 d, PASS; nation land fight days 556; hero 0.245; regulars (22, alive ≥ 90 %) best 0.233, p10 0.214, median 0.131; fights on its land 247 d; asks {"ok":50,"refused":4}
seed 1493 ENG hero_tog2: life 282 d, MISS; nation land fight days 472; hero 0.270; regulars (19, alive ≥ 90 %) best 0.377, p10 0.292, median 0.145; fights on its land 109 d; asks {"refused":64,"ok":19}
seed 1493 FRA hero_char2c: life 469 d, PASS; nation land fight days 556; hero 0.292; regulars (22, alive ≥ 90 %) best 0.233, p10 0.214, median 0.131; fights on its land 159 d; asks {"ok":115,"refused":132}
seed 1493 ENG hero_tog2: life 263 d, MISS; nation land fight days 472; hero 0.004; regulars (19, alive ≥ 90 %) best 0.377, p10 0.292, median 0.145; fights on its land 99 d; asks {"refused":12,"ok":18}
seed 1493 ITA hero_p100: life 462 d, PASS; nation land fight days 751; hero 0.208; regulars (25, alive ≥ 90 %) best 0.157, p10 0.124, median 0.084; fights on its land 457 d; asks {"refused":64,"ok":212,"long":6}
seed 1493 ENG hero_tog2: life 85 d, MISS; nation land fight days 472; hero 0.235; regulars (19, alive ≥ 90 %) best 0.377, p10 0.292, median 0.145; fights on its land 10 d; asks {"refused":64}
seed 1493 ENG hero_tog2: life 538 d, MISS; nation land fight days 472; hero 0.158; regulars (19, alive ≥ 90 %) best 0.377, p10 0.292, median 0.145; fights on its land 29 d; asks {"refused":126,"ok":22}
seed 1493 SOV hero_t42: life 418 d, MISS; nation land fight days 670; hero 0.041; regulars (58, alive ≥ 90 %) best 0.196, p10 0.109, median 0.034; fights on its land 36 d; asks {"ok":15}
seed 1493 GER hero_maus: life 123 d, PASS; nation land fight days 703; hero 0.317; regulars (3, alive ≥ 90 %) best 0.176, p10 0.176, median 0.111; fights on its land 113 d; asks {"ok":30}
seed 1493 SOV hero_t42: life 526 d, PASS; nation land fight days 670; hero 0.143; regulars (58, alive ≥ 90 %) best 0.196, p10 0.109, median 0.034; fights on its land 117 d; asks {"ok":63,"refused":3}
seed 1493 GER hero_maus: life 710 d, PASS; nation land fight days 703; hero 0.301; regulars (3, alive ≥ 90 %) best 0.176, p10 0.176, median 0.111; fights on its land 14 d; asks {"ok":6}
seed 1493 GER hero_maus: life 720 d, MISS; nation land fight days 703; hero 0.100; regulars (3, alive ≥ 90 %) best 0.176, p10 0.176, median 0.111; fights on its land 37 d; asks {"ok":8}
seed 1493 FRA hero_char2c: life 275 d, PASS; nation land fight days 556; hero 0.364; regulars (22, alive ≥ 90 %) best 0.233, p10 0.214, median 0.131; fights on its land 37 d; asks {"ok":25}
seed 1493 AT: 17 of 24 lives at or above the top decile
seed 1494 JAP hero_o_i: life 931 d, not counted; nation land fight days 931; hero 0.119; regulars (2, alive ≥ 90 %) best 0.304, p10 0.304, median 0.304; fights on its land 838 d; asks {"refused":354,"ok":197}
seed 1494 USA hero_t28: life 299 d, MISS; nation land fight days 299; hero 0.154; regulars (64, alive ≥ 90 %) best 0.442, p10 0.235, median 0.080; fights on its land 282 d; asks {"refused":270,"ok":81}
seed 1494 SOV hero_t42: life 194 d, PASS; nation land fight days 481; hero 0.314; regulars (75, alive ≥ 90 %) best 0.202, p10 0.096, median 0.012; fights on its land 194 d; asks {"ok":93}
seed 1494 GER hero_maus: life 80 d, PASS; nation land fight days 468; hero 0.600; regulars (7, alive ≥ 90 %) best 0.147, p10 0.147, median 0.092; fights on its land 78 d; asks {"ok":56}
seed 1494 ENG hero_tog2: life 331 d, MISS; nation land fight days 519; hero 0.066; regulars (25, alive ≥ 90 %) best 0.307, p10 0.262, median 0.092; fights on its land 55 d; asks {"ok":99,"refused":662}
seed 1494 FRA hero_char2c: life 30 d, MISS; nation land fight days 256; hero 0.033; regulars (53, alive ≥ 90 %) best 0.324, p10 0.261, median 0.027; fights on its land 16 d; asks {"ok":30,"refused":6}
seed 1494 ITA hero_p100: life 328 d, not counted; nation land fight days 539; hero 0.076; regulars (2, alive ≥ 90 %) best 0.067, p10 0.067, median 0.067; fights on its land 78 d; asks {"ok":41,"refused":22}
seed 1494 ITA hero_p100: life 282 d, not counted; nation land fight days 539; hero 0.216; regulars (2, alive ≥ 90 %) best 0.067, p10 0.067, median 0.067; fights on its land 317 d; asks {"refused":161,"ok":125}
seed 1494 GER hero_maus: life 145 d, PASS; nation land fight days 468; hero 0.407; regulars (7, alive ≥ 90 %) best 0.147, p10 0.147, median 0.092; fights on its land 109 d; asks {"ok":45,"refused":67}
seed 1494 SOV hero_t42: life 643 d, PASS; nation land fight days 481; hero 0.215; regulars (75, alive ≥ 90 %) best 0.202, p10 0.096, median 0.012; fights on its land 232 d; asks {"ok":162}
seed 1494 GER hero_maus: life 247 d, MISS; nation land fight days 468; hero 0.126; regulars (7, alive ≥ 90 %) best 0.147, p10 0.147, median 0.092; fights on its land 98 d; asks {"ok":60}
seed 1494 ENG hero_tog2: life 224 d, MISS; nation land fight days 519; hero 0.147; regulars (25, alive ≥ 90 %) best 0.307, p10 0.262, median 0.092; fights on its land 28 d; asks {"refused":260,"ok":14}
seed 1494 FRA hero_char2c: life 108 d, MISS; nation land fight days 256; hero 0.259; regulars (53, alive ≥ 90 %) best 0.324, p10 0.261, median 0.027; fights on its land 63 d; asks {"ok":20}
seed 1494 ITA hero_p100: life 37 d, not counted; nation land fight days 539; hero 0.162; regulars (2, alive ≥ 90 %) best 0.067, p10 0.067, median 0.067; fights on its land 37 d; asks {"ok":9}
seed 1494 GER hero_maus: life 37 d, PASS; nation land fight days 468; hero 0.324; regulars (7, alive ≥ 90 %) best 0.147, p10 0.147, median 0.092; fights on its land 37 d; asks {"ok":8}
seed 1494 GER hero_maus: life 419 d, PASS; nation land fight days 468; hero 0.420; regulars (7, alive ≥ 90 %) best 0.147, p10 0.147, median 0.092; fights on its land 64 d; asks {"ok":29}
seed 1494 FRA hero_char2c: life 442 d, MISS; nation land fight days 256; hero 0.081; regulars (53, alive ≥ 90 %) best 0.324, p10 0.261, median 0.027; fights on its land 89 d; asks {"ok":34}
seed 1494 ITA hero_p100: life 132 d, not counted; nation land fight days 539; hero 0.394; regulars (2, alive ≥ 90 %) best 0.067, p10 0.067, median 0.067; fights on its land 31 d; asks {"ok":14}
seed 1494 AT: 6 of 13 lives at or above the top decile
seed 1495 JAP hero_o_i: life 150 d, not counted; nation land fight days 1007; hero 0.480; regulars (1, alive ≥ 90 %) best 0.123, p10 0.123, median 0.123; fights on its land 143 d; asks {"refused":4,"ok":37}
seed 1495 USA hero_t28: life 629 d, MISS; nation land fight days 631; hero 0.189; regulars (25, alive ≥ 90 %) best 0.345, p10 0.192, median 0.118; fights on its land 622 d; asks {"ok":89}
seed 1495 SOV hero_t42: life 69 d, PASS; nation land fight days 749; hero 0.188; regulars (64, alive ≥ 90 %) best 0.153, p10 0.108, median 0.031; fights on its land 66 d; asks {"ok":44}
seed 1495 JAP hero_o_i: life 492 d, not counted; nation land fight days 1007; hero 0.348; regulars (1, alive ≥ 90 %) best 0.123, p10 0.123, median 0.123; fights on its land 404 d; asks {"refused":402,"ok":169}
seed 1495 GER hero_maus: life 167 d, PASS; nation land fight days 372; hero 0.419; regulars (6, alive ≥ 90 %) best 0.374, p10 0.374, median 0.285; fights on its land 163 d; asks {"ok":80,"refused":14}
seed 1495 ENG hero_tog2: life 46 d, PASS; nation land fight days 536; hero 0.826; regulars (7, alive ≥ 90 %) best 0.387, p10 0.387, median 0.188; fights on its land 39 d; asks {"ok":24,"refused":22}
seed 1495 FRA hero_char2c: life 155 d, PASS; nation land fight days 388; hero 0.490; regulars (19, alive ≥ 90 %) best 0.552, p10 0.374, median 0.254; fights on its land 153 d; asks {"ok":106}
seed 1495 ITA hero_p100: life 97 d, PASS; nation land fight days 584; hero 0.639; regulars (6, alive ≥ 90 %) best 0.222, p10 0.222, median 0.123; fights on its land 97 d; asks {"ok":58,"refused":15}
seed 1495 ITA hero_p100: life 361 d, PASS; nation land fight days 584; hero 0.479; regulars (6, alive ≥ 90 %) best 0.222, p10 0.222, median 0.123; fights on its land 86 d; asks {"ok":39}
seed 1495 USA hero_t28: life 143 d, PASS; nation land fight days 631; hero 0.497; regulars (25, alive ≥ 90 %) best 0.345, p10 0.192, median 0.118; fights on its land 83 d; asks {"ok":45}
seed 1495 ENG hero_tog2: life 367 d, MISS; nation land fight days 536; hero 0.229; regulars (7, alive ≥ 90 %) best 0.387, p10 0.387, median 0.188; fights on its land 116 d; asks {"refused":142,"ok":27}
seed 1495 SOV hero_t42: life 126 d, PASS; nation land fight days 749; hero 0.563; regulars (64, alive ≥ 90 %) best 0.153, p10 0.108, median 0.031; fights on its land 87 d; asks {"ok":68}
seed 1495 GER hero_maus: life 126 d, PASS; nation land fight days 372; hero 0.444; regulars (6, alive ≥ 90 %) best 0.374, p10 0.374, median 0.285; fights on its land 37 d; asks {"ok":10}
seed 1495 ITA hero_p100: life 88 d, PASS; nation land fight days 584; hero 0.307; regulars (6, alive ≥ 90 %) best 0.222, p10 0.222, median 0.123; fights on its land 85 d; asks {"ok":29,"refused":122}
seed 1495 GER hero_maus: life 54 d, PASS; nation land fight days 372; hero 0.722; regulars (6, alive ≥ 90 %) best 0.374, p10 0.374, median 0.285; fights on its land 49 d; asks {"ok":23}
seed 1495 ENG hero_tog2: life 313 d, MISS; nation land fight days 536; hero 0.214; regulars (7, alive ≥ 90 %) best 0.387, p10 0.387, median 0.188; fights on its land 405 d; asks {"refused":54,"ok":39}
seed 1495 SOV hero_t42: life 562 d, PASS; nation land fight days 749; hero 0.249; regulars (64, alive ≥ 90 %) best 0.153, p10 0.108, median 0.031; fights on its land 508 d; asks {"ok":238}
seed 1495 USA hero_t28: life 631 d, MISS; nation land fight days 631; hero 0.098; regulars (25, alive ≥ 90 %) best 0.345, p10 0.192, median 0.118; fights on its land 0 d; asks {"refused":1212,"ok":1}
seed 1495 FRA hero_char2c: life 789 d, MISS; nation land fight days 388; hero 0.144; regulars (19, alive ≥ 90 %) best 0.552, p10 0.374, median 0.254; fights on its land 326 d; asks {"ok":43}
seed 1495 ENG hero_tog2: life 810 d, MISS; nation land fight days 536; hero 0.215; regulars (7, alive ≥ 90 %) best 0.387, p10 0.387, median 0.188; fights on its land 242 d; asks {"refused":28,"ok":33}
seed 1495 ITA hero_p100: life 665 d, PASS; nation land fight days 584; hero 0.271; regulars (6, alive ≥ 90 %) best 0.222, p10 0.222, median 0.123; fights on its land 156 d; asks {"ok":36}
seed 1495 FRA hero_char2c: life 422 d, MISS; nation land fight days 388; hero 0.256; regulars (19, alive ≥ 90 %) best 0.552, p10 0.374, median 0.254; fights on its land 85 d; asks {"ok":12}
seed 1495 JAP hero_o_i: life 360 d, not counted; nation land fight days 1007; hero 0.197; regulars (1, alive ≥ 90 %) best 0.123, p10 0.123, median 0.123; fights on its land 302 d; asks {"refused":16,"ok":44}
seed 1495 FRA hero_char2c: life 617 d, MISS; nation land fight days 388; hero 0.078; regulars (19, alive ≥ 90 %) best 0.552, p10 0.374, median 0.254; fights on its land 266 d; asks {"refused":34,"ok":92}
seed 1495 ITA hero_p100: life 391 d, PASS; nation land fight days 584; hero 0.235; regulars (6, alive ≥ 90 %) best 0.222, p10 0.222, median 0.123; fights on its land 204 d; asks {"ok":47}
seed 1495 ITA hero_p100: life 555 d, MISS; nation land fight days 584; hero 0.121; regulars (6, alive ≥ 90 %) best 0.222, p10 0.222, median 0.123; fights on its land 0 d; asks {"ok":18}
seed 1495 ENG hero_tog2: life 94 d, MISS; nation land fight days 536; hero 0.287; regulars (7, alive ≥ 90 %) best 0.387, p10 0.387, median 0.188; fights on its land 52 d; asks {"refused":112,"ok":22}
seed 1495 FRA hero_char2c: life 280 d, MISS; nation land fight days 388; hero 0.225; regulars (19, alive ≥ 90 %) best 0.552, p10 0.374, median 0.254; fights on its land 67 d; asks {"ok":27}
seed 1495 JAP hero_o_i: life 203 d, not counted; nation land fight days 1007; hero 0.000; regulars (1, alive ≥ 90 %) best 0.123, p10 0.123, median 0.123; fights on its land 0 d; asks {"refused":630,"ok":7}
seed 1495 ENG hero_tog2: life 94 d, PASS; nation land fight days 536; hero 0.447; regulars (7, alive ≥ 90 %) best 0.387, p10 0.387, median 0.188; fights on its land 35 d; asks {"refused":5,"ok":18}
seed 1495 AT: 15 of 26 lives at or above the top decile
seed 1496 JAP hero_o_i: life 124 d, MISS; nation land fight days 725; hero 0.032; regulars (4, alive ≥ 90 %) best 0.280, p10 0.280, median 0.278; fights on its land 117 d; asks {"refused":4,"ok":46}
seed 1496 USA hero_t28: life 27 d, not counted; nation land fight days 27; hero 0.000; regulars (67, alive ≥ 90 %) best 0.548, p10 0.390, median 0.130; fights on its land 0 d; asks {"refused":18}
seed 1496 JAP hero_o_i: life 186 d, PASS; nation land fight days 725; hero 0.425; regulars (4, alive ≥ 90 %) best 0.280, p10 0.280, median 0.278; fights on its land 168 d; asks {"ok":38}
seed 1496 SOV hero_t42: life 423 d, PASS; nation land fight days 724; hero 0.343; regulars (30, alive ≥ 90 %) best 0.237, p10 0.165, median 0.066; fights on its land 422 d; asks {"ok":226}
seed 1496 GER hero_maus: life 84 d, PASS; nation land fight days 420; hero 0.452; regulars (56, alive ≥ 90 %) best 0.261, p10 0.202, median 0.117; fights on its land 84 d; asks {"ok":46,"refused":16}
seed 1496 ENG hero_tog2: life 47 d, PASS; nation land fight days 460; hero 0.489; regulars (34, alive ≥ 90 %) best 0.328, p10 0.224, median 0.111; fights on its land 26 d; asks {"ok":62}
seed 1496 FRA hero_char2c: life 241 d, PASS; nation land fight days 362; hero 0.232; regulars (35, alive ≥ 90 %) best 0.306, p10 0.155, median 0.047; fights on its land 198 d; asks {"ok":105,"refused":98,"long":1}
seed 1496 ITA hero_p100: life 195 d, PASS; nation land fight days 388; hero 0.267; regulars (59, alive ≥ 90 %) best 0.242, p10 0.191, median 0.111; fights on its land 168 d; asks {"ok":154,"refused":93}
seed 1496 JAP hero_o_i: life 122 d, MISS; nation land fight days 725; hero 0.033; regulars (4, alive ≥ 90 %) best 0.280, p10 0.280, median 0.278; fights on its land 14 d; asks {"refused":121,"ok":10}
seed 1496 ENG hero_tog2: life 7 d, not counted; nation land fight days 460; hero 0.000; regulars (34, alive ≥ 90 %) best 0.328, p10 0.224, median 0.111; fights on its land 0 d; asks {"refused":4,"ok":1}
seed 1496 GER hero_maus: life 236 d, MISS; nation land fight days 420; hero 0.153; regulars (56, alive ≥ 90 %) best 0.261, p10 0.202, median 0.117; fights on its land 142 d; asks {"ok":33,"refused":4}
seed 1496 JAP hero_o_i: life 246 d, MISS; nation land fight days 725; hero 0.228; regulars (4, alive ≥ 90 %) best 0.280, p10 0.280, median 0.278; fights on its land 281 d; asks {"refused":388,"ok":11}
seed 1496 ENG hero_tog2: life 421 d, MISS; nation land fight days 460; hero 0.071; regulars (34, alive ≥ 90 %) best 0.328, p10 0.224, median 0.111; fights on its land 175 d; asks {"refused":64,"ok":49}
seed 1496 JAP hero_o_i: life 110 d, MISS; nation land fight days 725; hero 0.245; regulars (4, alive ≥ 90 %) best 0.280, p10 0.280, median 0.278; fights on its land 87 d; asks {"ok":8}
seed 1496 GER hero_maus: life 299 d, PASS; nation land fight days 420; hero 0.338; regulars (56, alive ≥ 90 %) best 0.261, p10 0.202, median 0.117; fights on its land 30 d; asks {"ok":61}
seed 1496 ENG hero_tog2: life 428 d, MISS; nation land fight days 460; hero 0.070; regulars (34, alive ≥ 90 %) best 0.328, p10 0.224, median 0.111; fights on its land 89 d; asks {"refused":228,"ok":49}
seed 1496 JAP hero_o_i: life 116 d, PASS; nation land fight days 725; hero 0.586; regulars (4, alive ≥ 90 %) best 0.280, p10 0.280, median 0.278; fights on its land 48 d; asks {"refused":32,"ok":13}
seed 1496 GER hero_maus: life 543 d, PASS; nation land fight days 420; hero 0.308; regulars (56, alive ≥ 90 %) best 0.261, p10 0.202, median 0.117; fights on its land 150 d; asks {"ok":83}
seed 1496 ITA hero_p100: life 302 d, PASS; nation land fight days 388; hero 0.258; regulars (59, alive ≥ 90 %) best 0.242, p10 0.191, median 0.111; fights on its land 47 d; asks {"ok":16}
seed 1496 JAP hero_o_i: life 279 d, MISS; nation land fight days 725; hero 0.147; regulars (4, alive ≥ 90 %) best 0.280, p10 0.280, median 0.278; fights on its land 0 d; asks {"refused":16,"ok":25}
seed 1496 SOV hero_t42: life 622 d, MISS; nation land fight days 724; hero 0.106; regulars (30, alive ≥ 90 %) best 0.237, p10 0.165, median 0.066; fights on its land 144 d; asks {"ok":28}
seed 1496 ITA hero_p100: life 388 d, PASS; nation land fight days 388; hero 0.211; regulars (59, alive ≥ 90 %) best 0.242, p10 0.191, median 0.111; fights on its land 55 d; asks {"ok":21}
seed 1496 SOV hero_t42: life 349 d, PASS; nation land fight days 724; hero 0.178; regulars (30, alive ≥ 90 %) best 0.237, p10 0.165, median 0.066; fights on its land 98 d; asks {"ok":30}
seed 1496 FRA hero_char2c: life 246 d, MISS; nation land fight days 362; hero 0.138; regulars (35, alive ≥ 90 %) best 0.306, p10 0.155, median 0.047; fights on its land 98 d; asks {"ok":34}
seed 1496 SOV hero_t42: life 309 d, PASS; nation land fight days 724; hero 0.531; regulars (30, alive ≥ 90 %) best 0.237, p10 0.165, median 0.066; fights on its land 37 d; asks {"ok":13}
seed 1496 GER hero_maus: life 841 d, MISS; nation land fight days 420; hero 0.026; regulars (56, alive ≥ 90 %) best 0.261, p10 0.202, median 0.117; fights on its land 0 d; asks {"ok":1}
seed 1496 JAP hero_o_i: life 867 d, MISS; nation land fight days 725; hero 0.131; regulars (4, alive ≥ 90 %) best 0.280, p10 0.280, median 0.278; fights on its land 0 d; asks {"refused":36}
seed 1496 ITA hero_p100: life 718 d, MISS; nation land fight days 388; hero 0.049; regulars (59, alive ≥ 90 %) best 0.242, p10 0.191, median 0.111; fights on its land 0 d; asks {"ok":1}
seed 1496 AT: 13 of 26 lives at or above the top decile
seed 1497 JAP hero_o_i: life 178 d, not counted; nation land fight days 759; hero 0.011; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 64 d; asks {"refused":4,"ok":24}
seed 1497 USA hero_t28: life 107 d, MISS; nation land fight days 107; hero 0.047; regulars (68, alive ≥ 90 %) best 0.556, p10 0.271, median 0.093; fights on its land 101 d; asks {"ok":7,"refused":130}
seed 1497 SOV hero_t42: life 606 d, PASS; nation land fight days 606; hero 0.248; regulars (90, alive ≥ 90 %) best 0.249, p10 0.165, median 0.020; fights on its land 600 d; asks {"ok":333,"refused":8}
seed 1497 GER hero_maus: life 272 d, PASS; nation land fight days 545; hero 0.449; regulars (57, alive ≥ 90 %) best 0.253, p10 0.162, median 0.053; fights on its land 774 d; asks {"ok":191}
seed 1497 ENG hero_tog2: life 137 d, not counted; nation land fight days 496; hero 0.613; regulars (2, alive ≥ 90 %) best 0.155, p10 0.155, median 0.155; fights on its land 119 d; asks {"ok":38,"refused":2}
seed 1497 FRA hero_char2c: life 53 d, PASS; nation land fight days 472; hero 0.472; regulars (8, alive ≥ 90 %) best 0.266, p10 0.266, median 0.141; fights on its land 53 d; asks {"ok":34}
seed 1497 ITA hero_p100: life 61 d, PASS; nation land fight days 860; hero 0.443; regulars (77, alive ≥ 90 %) best 0.188, p10 0.129, median 0.066; fights on its land 61 d; asks {"ok":40}
seed 1497 JAP hero_o_i: life 551 d, not counted; nation land fight days 759; hero 0.181; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 425 d; asks {"refused":24,"ok":86}
seed 1497 ITA hero_p100: life 739 d, PASS; nation land fight days 860; hero 0.164; regulars (77, alive ≥ 90 %) best 0.188, p10 0.129, median 0.066; fights on its land 736 d; asks {"ok":385}
seed 1497 FRA hero_char2c: life 353 d, MISS; nation land fight days 472; hero 0.261; regulars (8, alive ≥ 90 %) best 0.266, p10 0.266, median 0.141; fights on its land 198 d; asks {"ok":20}
seed 1497 ENG hero_tog2: life 352 d, not counted; nation land fight days 496; hero 0.352; regulars (2, alive ≥ 90 %) best 0.155, p10 0.155, median 0.155; fights on its land 188 d; asks {"ok":45,"refused":46}
seed 1497 FRA hero_char2c: life 248 d, MISS; nation land fight days 472; hero 0.165; regulars (8, alive ≥ 90 %) best 0.266, p10 0.266, median 0.141; fights on its land 412 d; asks {"ok":4}
seed 1497 FRA hero_char2c: life 266 d, MISS; nation land fight days 472; hero 0.259; regulars (8, alive ≥ 90 %) best 0.266, p10 0.266, median 0.141; fights on its land 220 d; asks {"ok":31}
seed 1497 JAP hero_o_i: life 63 d, not counted; nation land fight days 759; hero 0.032; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 44 d; asks {"refused":28,"ok":6}
seed 1497 FRA hero_char2c: life 592 d, MISS; nation land fight days 472; hero 0.103; regulars (8, alive ≥ 90 %) best 0.266, p10 0.266, median 0.141; fights on its land 362 d; asks {"refused":40,"ok":10}
seed 1497 ENG hero_tog2: life 400 d, not counted; nation land fight days 496; hero 0.292; regulars (2, alive ≥ 90 %) best 0.155, p10 0.155, median 0.155; fights on its land 144 d; asks {"refused":254,"ok":36}
seed 1497 GER hero_maus: life 242 d, PASS; nation land fight days 545; hero 0.236; regulars (57, alive ≥ 90 %) best 0.253, p10 0.162, median 0.053; fights on its land 282 d; asks {"ok":97,"refused":58}
seed 1497 JAP hero_o_i: life 312 d, not counted; nation land fight days 759; hero 0.212; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 233 d; asks {"ok":45}
seed 1497 ENG hero_tog2: life 127 d, not counted; nation land fight days 496; hero 0.189; regulars (2, alive ≥ 90 %) best 0.155, p10 0.155, median 0.155; fights on its land 105 d; asks {"ok":40,"refused":26}
seed 1497 FRA hero_char2c: life 255 d, PASS; nation land fight days 472; hero 0.463; regulars (8, alive ≥ 90 %) best 0.266, p10 0.266, median 0.141; fights on its land 126 d; asks {"refused":72,"ok":17}
seed 1497 JAP hero_o_i: life 252 d, not counted; nation land fight days 759; hero 0.405; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 71 d; asks {"ok":83}
seed 1497 FRA hero_char2c: life 110 d, MISS; nation land fight days 472; hero 0.191; regulars (8, alive ≥ 90 %) best 0.266, p10 0.266, median 0.141; fights on its land 0 d; asks {"refused":46}
seed 1497 ENG hero_tog2: life 136 d, not counted; nation land fight days 496; hero 0.243; regulars (2, alive ≥ 90 %) best 0.155, p10 0.155, median 0.155; fights on its land 24 d; asks {"ok":4}
seed 1497 JAP hero_o_i: life 92 d, not counted; nation land fight days 759; hero 0.554; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 44 d; asks {"ok":12}
seed 1497 GER hero_maus: life 545 d, MISS; nation land fight days 545; hero 0.040; regulars (57, alive ≥ 90 %) best 0.253, p10 0.162, median 0.053; fights on its land 55 d; asks {"ok":28,"refused":24}
seed 1497 ENG hero_tog2: life 538 d, not counted; nation land fight days 496; hero 0.037; regulars (2, alive ≥ 90 %) best 0.155, p10 0.155, median 0.155; fights on its land 42 d; asks {"ok":11}
seed 1497 JAP hero_o_i: life 846 d, not counted; nation land fight days 759; hero 0.191; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 17 d; asks {"ok":7}
seed 1497 AT: 7 of 14 lives at or above the top decile
seed 1498 JAP hero_o_i: life 714 d, not counted; nation land fight days 718; hero 0.314; regulars (1, alive ≥ 90 %) best 0.252, p10 0.252, median 0.252; fights on its land 680 d; asks {"refused":56,"ok":322}
seed 1498 USA hero_t28: life 163 d, MISS; nation land fight days 163; hero 0.092; regulars (59, alive ≥ 90 %) best 0.450, p10 0.304, median 0.045; fights on its land 58 d; asks {"refused":282,"ok":86}
seed 1498 SOV hero_t42: life 589 d, PASS; nation land fight days 644; hero 0.115; regulars (52, alive ≥ 90 %) best 0.188, p10 0.092, median 0.048; fights on its land 586 d; asks {"ok":285}
seed 1498 GER hero_maus: life 510 d, PASS; nation land fight days 585; hero 0.214; regulars (58, alive ≥ 90 %) best 0.289, p10 0.191, median 0.089; fights on its land 508 d; asks {"ok":143,"refused":30}
seed 1498 ENG hero_tog2: life 548 d, MISS; nation land fight days 321; hero 0.062; regulars (22, alive ≥ 90 %) best 0.333, p10 0.290, median 0.158; fights on its land 547 d; asks {"ok":57,"refused":7}
seed 1498 FRA hero_char2c: life 265 d, PASS; nation land fight days 265; hero 0.177; regulars (40, alive ≥ 90 %) best 0.253, p10 0.117, median 0.038; fights on its land 98 d; asks {"ok":82,"refused":321}
seed 1498 ITA hero_p100: life 279 d, PASS; nation land fight days 525; hero 0.197; regulars (70, alive ≥ 90 %) best 0.203, p10 0.145, median 0.074; fights on its land 424 d; asks {"ok":79,"refused":407}
seed 1498 JAP hero_o_i: life 561 d, not counted; nation land fight days 718; hero 0.185; regulars (1, alive ≥ 90 %) best 0.252, p10 0.252, median 0.252; fights on its land 476 d; asks {"refused":8,"ok":117,"long":2}
seed 1498 ENG hero_tog2: life 320 d, MISS; nation land fight days 321; hero 0.097; regulars (22, alive ≥ 90 %) best 0.333, p10 0.290, median 0.158; fights on its land 84 d; asks {"refused":143,"ok":104}
seed 1498 ITA hero_p100: life 323 d, PASS; nation land fight days 525; hero 0.155; regulars (70, alive ≥ 90 %) best 0.203, p10 0.145, median 0.074; fights on its land 107 d; asks {"ok":59}
seed 1498 GER hero_maus: life 195 d, PASS; nation land fight days 585; hero 0.595; regulars (58, alive ≥ 90 %) best 0.289, p10 0.191, median 0.089; fights on its land 183 d; asks {"ok":122}
seed 1498 ITA hero_p100: life 603 d, MISS; nation land fight days 525; hero 0.073; regulars (70, alive ≥ 90 %) best 0.203, p10 0.145, median 0.074; fights on its land 135 d; asks {"ok":68}
seed 1498 GER hero_maus: life 553 d, MISS; nation land fight days 585; hero 0.114; regulars (58, alive ≥ 90 %) best 0.289, p10 0.191, median 0.089; fights on its land 105 d; asks {"ok":53}
seed 1498 SOV hero_t42: life 110 d, MISS; nation land fight days 644; hero 0.027; regulars (52, alive ≥ 90 %) best 0.188, p10 0.092, median 0.048; fights on its land 102 d; asks {"ok":46,"refused":10}
seed 1498 AT: 6 of 12 lives at or above the top decile
seed 1499 JAP hero_o_i: life 520 d, MISS; nation land fight days 852; hero 0.223; regulars (5, alive ≥ 90 %) best 0.254, p10 0.254, median 0.222; fights on its land 379 d; asks {"refused":5,"ok":56}
seed 1499 USA hero_t28: life 99 d, MISS; nation land fight days 99; hero 0.051; regulars (61, alive ≥ 90 %) best 0.505, p10 0.346, median 0.160; fights on its land 87 d; asks {"ok":49,"refused":102}
seed 1499 SOV hero_t42: life 465 d, PASS; nation land fight days 757; hero 0.249; regulars (34, alive ≥ 90 %) best 0.232, p10 0.096, median 0.065; fights on its land 676 d; asks {"ok":225,"refused":14,"long":99}
seed 1499 GER hero_maus: life 92 d, not counted; nation land fight days 564; hero 0.565; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 92 d; asks {"ok":52}
seed 1499 ENG hero_tog2: life 394 d, MISS; nation land fight days 390; hero 0.137; regulars (39, alive ≥ 90 %) best 0.289, p10 0.243, median 0.115; fights on its land 284 d; asks {"ok":26,"refused":30}
seed 1499 FRA hero_char2c: life 415 d, PASS; nation land fight days 415; hero 0.398; regulars (48, alive ≥ 90 %) best 0.313, p10 0.208, median 0.078; fights on its land 355 d; asks {"ok":239,"refused":43}
seed 1499 ITA hero_p100: life 207 d, PASS; nation land fight days 625; hero 0.415; regulars (10, alive ≥ 90 %) best 0.316, p10 0.316, median 0.195; fights on its land 199 d; asks {"ok":169,"refused":8}
seed 1499 GER hero_maus: life 256 d, not counted; nation land fight days 564; hero 0.313; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 127 d; asks {"ok":62,"refused":88}
seed 1499 ENG hero_tog2: life 269 d, PASS; nation land fight days 390; hero 0.472; regulars (39, alive ≥ 90 %) best 0.289, p10 0.243, median 0.115; fights on its land 6 d; asks {"refused":54,"ok":4}
seed 1499 JAP hero_o_i: life 251 d, PASS; nation land fight days 852; hero 0.586; regulars (5, alive ≥ 90 %) best 0.254, p10 0.254, median 0.222; fights on its land 5 d; asks {"refused":48,"ok":2}
seed 1499 ENG hero_tog2: life 121 d, PASS; nation land fight days 390; hero 0.504; regulars (39, alive ≥ 90 %) best 0.289, p10 0.243, median 0.115; fights on its land 1 d; asks {"ok":2}
seed 1499 JAP hero_o_i: life 716 d, MISS; nation land fight days 852; hero 0.169; regulars (5, alive ≥ 90 %) best 0.254, p10 0.254, median 0.222; fights on its land 502 d; asks {"refused":22,"ok":83}
seed 1499 ENG hero_tog2: life 215 d, MISS; nation land fight days 390; hero 0.098; regulars (39, alive ≥ 90 %) best 0.289, p10 0.243, median 0.115; fights on its land 1 d; asks {"refused":198}
seed 1499 GER hero_maus: life 466 d, not counted; nation land fight days 564; hero 0.137; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 355 d; asks {"ok":56}
seed 1499 ITA hero_p100: life 329 d, MISS; nation land fight days 625; hero 0.213; regulars (10, alive ≥ 90 %) best 0.316, p10 0.316, median 0.195; fights on its land 43 d; asks {"ok":27}
seed 1499 GER hero_maus: life 449 d, not counted; nation land fight days 564; hero 0.185; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 38 d; asks {"ok":14}
seed 1499 JAP hero_o_i: life 623 d, MISS; nation land fight days 852; hero 0.228; regulars (5, alive ≥ 90 %) best 0.254, p10 0.254, median 0.222; fights on its land 323 d; asks {"ok":101,"refused":36}
seed 1499 GER hero_maus: life 465 d, not counted; nation land fight days 564; hero 0.189; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 307 d; asks {"ok":44}
seed 1499 ITA hero_p100: life 612 d, MISS; nation land fight days 625; hero 0.144; regulars (10, alive ≥ 90 %) best 0.316, p10 0.316, median 0.195; fights on its land 32 d; asks {"ok":10}
seed 1499 GER hero_maus: life 62 d, not counted; nation land fight days 564; hero 0.081; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 0 d; asks {}
seed 1499 ITA hero_p100: life 386 d, PASS; nation land fight days 625; hero 0.464; regulars (10, alive ≥ 90 %) best 0.316, p10 0.316, median 0.195; fights on its land 34 d; asks {"ok":1}
seed 1499 ITA hero_p100: life 595 d, MISS; nation land fight days 625; hero 0.187; regulars (10, alive ≥ 90 %) best 0.316, p10 0.316, median 0.195; fights on its land 89 d; asks {"ok":79}
seed 1499 SOV hero_t42: life 397 d, PASS; nation land fight days 757; hero 0.116; regulars (34, alive ≥ 90 %) best 0.232, p10 0.096, median 0.065; fights on its land 231 d; asks {"ok":84}
seed 1499 JAP hero_o_i: life 332 d, MISS; nation land fight days 852; hero 0.172; regulars (5, alive ≥ 90 %) best 0.254, p10 0.254, median 0.222; fights on its land 0 d; asks {"refused":28}
seed 1499 AT: 8 of 18 lives at or above the top decile
seed 1500 JAP hero_o_i: life 762 d, PASS; nation land fight days 762; hero 0.304; regulars (23, alive ≥ 90 %) best 0.215, p10 0.192, median 0.144; fights on its land 732 d; asks {"refused":30,"ok":311}
seed 1500 USA hero_t28: life 3 d, not counted; nation land fight days 460; hero 1.000; regulars (33, alive ≥ 90 %) best 0.250, p10 0.191, median 0.117; fights on its land 0 d; asks {}
seed 1500 GER hero_maus: life 194 d, PASS; nation land fight days 656; hero 0.356; regulars (21, alive ≥ 90 %) best 0.182, p10 0.169, median 0.131; fights on its land 192 d; asks {"ok":87}
seed 1500 SOV hero_t42: life 119 d, PASS; nation land fight days 563; hero 0.345; regulars (54, alive ≥ 90 %) best 0.247, p10 0.120, median 0.067; fights on its land 119 d; asks {"ok":63,"refused":3}
seed 1500 GER hero_maus: life 393 d, PASS; nation land fight days 656; hero 0.318; regulars (21, alive ≥ 90 %) best 0.182, p10 0.169, median 0.131; fights on its land 388 d; asks {"ok":130}
seed 1500 ENG hero_tog2: life 384 d, MISS; nation land fight days 468; hero 0.013; regulars (12, alive ≥ 90 %) best 0.206, p10 0.164, median 0.067; fights on its land 436 d; asks {"ok":85,"refused":155}
seed 1500 FRA hero_char2c: life 369 d, MISS; nation land fight days 337; hero 0.033; regulars (5, alive ≥ 90 %) best 0.152, p10 0.152, median 0.080; fights on its land 249 d; asks {"ok":12}
seed 1500 ITA hero_p100: life 119 d, PASS; nation land fight days 551; hero 0.672; regulars (8, alive ≥ 90 %) best 0.209, p10 0.209, median 0.148; fights on its land 119 d; asks {"ok":55}
seed 1500 USA hero_t28: life 138 d, PASS; nation land fight days 460; hero 0.261; regulars (33, alive ≥ 90 %) best 0.250, p10 0.191, median 0.117; fights on its land 98 d; asks {"refused":2,"ok":25}
seed 1500 FRA hero_char2c: life 89 d, PASS; nation land fight days 337; hero 0.337; regulars (5, alive ≥ 90 %) best 0.152, p10 0.152, median 0.080; fights on its land 24 d; asks {"ok":7}
seed 1500 FRA hero_char2c: life 370 d, MISS; nation land fight days 337; hero 0.032; regulars (5, alive ≥ 90 %) best 0.152, p10 0.152, median 0.080; fights on its land 184 d; asks {"ok":32,"refused":318}
seed 1500 ITA hero_p100: life 359 d, MISS; nation land fight days 551; hero 0.181; regulars (8, alive ≥ 90 %) best 0.209, p10 0.209, median 0.148; fights on its land 298 d; asks {"refused":316,"ok":122}
seed 1500 SOV hero_t42: life 443 d, PASS; nation land fight days 563; hero 0.217; regulars (54, alive ≥ 90 %) best 0.247, p10 0.120, median 0.067; fights on its land 188 d; asks {"ok":63}
seed 1500 USA hero_t28: life 327 d, PASS; nation land fight days 460; hero 0.196; regulars (33, alive ≥ 90 %) best 0.250, p10 0.191, median 0.117; fights on its land 179 d; asks {"refused":138,"ok":68}
seed 1500 ITA hero_p100: life 519 d, PASS; nation land fight days 551; hero 0.285; regulars (8, alive ≥ 90 %) best 0.209, p10 0.209, median 0.148; fights on its land 270 d; asks {"ok":37}
seed 1500 SOV hero_t42: life 422 d, PASS; nation land fight days 563; hero 0.220; regulars (54, alive ≥ 90 %) best 0.247, p10 0.120, median 0.067; fights on its land 171 d; asks {"ok":100}
seed 1500 GER hero_maus: life 416 d, MISS; nation land fight days 656; hero 0.161; regulars (21, alive ≥ 90 %) best 0.182, p10 0.169, median 0.131; fights on its land 31 d; asks {"ok":13}
seed 1500 ITA hero_p100: life 500 d, PASS; nation land fight days 551; hero 0.282; regulars (8, alive ≥ 90 %) best 0.209, p10 0.209, median 0.148; fights on its land 136 d; asks {"refused":296,"ok":14}
seed 1500 GER hero_maus: life 324 d, PASS; nation land fight days 656; hero 0.460; regulars (21, alive ≥ 90 %) best 0.182, p10 0.169, median 0.131; fights on its land 60 d; asks {"refused":54,"ok":15}
seed 1500 FRA hero_char2c: life 445 d, MISS; nation land fight days 337; hero 0.117; regulars (5, alive ≥ 90 %) best 0.152, p10 0.152, median 0.080; fights on its land 14 d; asks {"refused":16,"ok":13}
seed 1500 SOV hero_t42: life 483 d, PASS; nation land fight days 563; hero 0.153; regulars (54, alive ≥ 90 %) best 0.247, p10 0.120, median 0.067; fights on its land 7 d; asks {"ok":11}
seed 1500 ENG hero_tog2: life 524 d, MISS; nation land fight days 468; hero 0.073; regulars (12, alive ≥ 90 %) best 0.206, p10 0.164, median 0.067; fights on its land 10 d; asks {"ok":15,"refused":10}
seed 1500 GER hero_maus: life 508 d, MISS; nation land fight days 656; hero 0.167; regulars (21, alive ≥ 90 %) best 0.182, p10 0.169, median 0.131; fights on its land 43 d; asks {"ok":20,"refused":2}
seed 1500 ENG hero_tog2: life 370 d, PASS; nation land fight days 468; hero 0.184; regulars (12, alive ≥ 90 %) best 0.206, p10 0.164, median 0.067; fights on its land 7 d; asks {"refused":2,"ok":4}
seed 1500 AT: 15 of 23 lives at or above the top decile
```

## HEAD, each life

```
seed 1491 JAP hero_o_i: life 815 d, MISS; nation land fight days 684; hero 0.148; regulars (3, alive ≥ 90 %) best 0.209, p10 0.209, median 0.090; fights on its land 743 d; asks {"refused":48,"ok":136}
seed 1491 USA hero_t28: life 195 d, MISS; nation land fight days 195; hero 0.200; regulars (59, alive ≥ 90 %) best 0.371, p10 0.253, median 0.123; fights on its land 125 d; asks {"ok":66,"refused":174}
seed 1491 SOV hero_t42: life 367 d, PASS; nation land fight days 635; hero 0.213; regulars (68, alive ≥ 90 %) best 0.218, p10 0.079, median 0.028; fights on its land 365 d; asks {"ok":184,"refused":10}
seed 1491 GER hero_maus: life 183 d, PASS; nation land fight days 746; hero 0.536; regulars (5, alive ≥ 90 %) best 0.195, p10 0.195, median 0.149; fights on its land 147 d; asks {"ok":97}
seed 1491 ENG hero_tog2: life 102 d, MISS; nation land fight days 158; hero 0.088; regulars (37, alive ≥ 90 %) best 0.351, p10 0.231, median 0.120; fights on its land 57 d; asks {"ok":51,"refused":44}
seed 1491 FRA hero_char2c: life 417 d, MISS; nation land fight days 463; hero 0.060; regulars (12, alive ≥ 90 %) best 0.101, p10 0.092, median 0.004; fights on its land 164 d; asks {"ok":81,"refused":698}
seed 1491 ITA hero_p100: life 117 d, PASS; nation land fight days 728; hero 0.504; regulars (7, alive ≥ 90 %) best 0.277, p10 0.277, median 0.071; fights on its land 113 d; asks {"ok":90,"refused":24}
seed 1491 JAP hero_o_i: life 264 d, PASS; nation land fight days 684; hero 0.326; regulars (3, alive ≥ 90 %) best 0.209, p10 0.209, median 0.090; fights on its land 214 d; asks {"refused":34,"ok":92}
seed 1491 GER hero_maus: life 224 d, PASS; nation land fight days 746; hero 0.634; regulars (5, alive ≥ 90 %) best 0.195, p10 0.195, median 0.149; fights on its land 224 d; asks {"ok":114}
seed 1491 ITA hero_p100: life 681 d, MISS; nation land fight days 728; hero 0.144; regulars (7, alive ≥ 90 %) best 0.277, p10 0.277, median 0.071; fights on its land 511 d; asks {"ok":202,"refused":18,"long":56}
seed 1491 ENG hero_tog2: life 363 d, MISS; nation land fight days 158; hero 0.127; regulars (37, alive ≥ 90 %) best 0.351, p10 0.231, median 0.120; fights on its land 79 d; asks {"refused":10,"ok":33}
seed 1491 JAP hero_o_i: life 425 d, PASS; nation land fight days 684; hero 0.313; regulars (3, alive ≥ 90 %) best 0.209, p10 0.209, median 0.090; fights on its land 54 d; asks {"ok":8}
seed 1491 JAP hero_o_i: life 148 d, PASS; nation land fight days 684; hero 0.358; regulars (3, alive ≥ 90 %) best 0.209, p10 0.209, median 0.090; fights on its land 30 d; asks {"ok":22,"refused":38}
seed 1491 GER hero_maus: life 644 d, MISS; nation land fight days 746; hero 0.166; regulars (5, alive ≥ 90 %) best 0.195, p10 0.195, median 0.149; fights on its land 230 d; asks {"ok":92}
seed 1491 SOV hero_t42: life 232 d, PASS; nation land fight days 635; hero 0.142; regulars (68, alive ≥ 90 %) best 0.218, p10 0.079, median 0.028; fights on its land 230 d; asks {"ok":140}
seed 1491 ENG hero_tog2: life 587 d, MISS; nation land fight days 158; hero 0.153; regulars (37, alive ≥ 90 %) best 0.351, p10 0.231, median 0.120; fights on its land 16 d; asks {"ok":25,"refused":18}
seed 1491 JAP hero_o_i: life 94 d, PASS; nation land fight days 684; hero 0.596; regulars (3, alive ≥ 90 %) best 0.209, p10 0.209, median 0.090; fights on its land 83 d; asks {"ok":43}
seed 1491 FRA hero_char2c: life 659 d, PASS; nation land fight days 463; hero 0.200; regulars (12, alive ≥ 90 %) best 0.101, p10 0.092, median 0.004; fights on its land 31 d; asks {"ok":15}
seed 1491 FRA hero_char2c: life 48 d, PASS; nation land fight days 463; hero 0.396; regulars (12, alive ≥ 90 %) best 0.101, p10 0.092, median 0.004; fights on its land 34 d; asks {"ok":29}
seed 1491 GER hero_maus: life 622 d, MISS; nation land fight days 746; hero 0.130; regulars (5, alive ≥ 90 %) best 0.195, p10 0.195, median 0.149; fights on its land 93 d; asks {"refused":2,"ok":48}
seed 1491 ITA hero_p100: life 22 d, not counted; nation land fight days 728; hero 0.045; regulars (7, alive ≥ 90 %) best 0.277, p10 0.277, median 0.071; fights on its land 22 d; asks {"ok":11}
seed 1491 AT: 11 of 20 lives at or above the top decile
seed 1492 JAP hero_o_i: life 126 d, PASS; nation land fight days 538; hero 0.349; regulars (6, alive ≥ 90 %) best 0.306, p10 0.306, median 0.271; fights on its land 117 d; asks {"refused":4,"ok":36}
seed 1492 USA hero_t28: life 99 d, MISS; nation land fight days 99; hero 0.273; regulars (56, alive ≥ 90 %) best 0.604, p10 0.326, median 0.107; fights on its land 81 d; asks {"refused":54,"ok":55}
seed 1492 SOV hero_t42: life 371 d, PASS; nation land fight days 625; hero 0.385; regulars (142, alive ≥ 90 %) best 0.248, p10 0.158, median 0.059; fights on its land 355 d; asks {"ok":174,"refused":36}
seed 1492 GER hero_maus: life 205 d, PASS; nation land fight days 411; hero 0.537; regulars (5, alive ≥ 90 %) best 0.162, p10 0.162, median 0.079; fights on its land 205 d; asks {"refused":81,"ok":138}
seed 1492 ENG hero_tog2: life 266 d, PASS; nation land fight days 351; hero 0.327; regulars (37, alive ≥ 90 %) best 0.343, p10 0.222, median 0.102; fights on its land 258 d; asks {"ok":90}
seed 1492 FRA hero_char2c: life 338 d, MISS; nation land fight days 289; hero 0.092; regulars (18, alive ≥ 90 %) best 0.523, p10 0.304, median 0.087; fights on its land 222 d; asks {"ok":92,"refused":5}
seed 1492 ITA hero_p100: life 185 d, not counted; nation land fight days 543; hero 0.459; regulars (2, alive ≥ 90 %) best 0.297, p10 0.297, median 0.297; fights on its land 185 d; asks {"ok":118,"refused":54}
seed 1492 JAP hero_o_i: life 524 d, MISS; nation land fight days 538; hero 0.265; regulars (6, alive ≥ 90 %) best 0.306, p10 0.306, median 0.271; fights on its land 237 d; asks {"refused":60,"ok":33}
seed 1492 ENG hero_tog2: life 473 d, PASS; nation land fight days 351; hero 0.262; regulars (37, alive ≥ 90 %) best 0.343, p10 0.222, median 0.102; fights on its land 225 d; asks {"ok":161,"refused":8}
seed 1492 FRA hero_char2c: life 193 d, MISS; nation land fight days 289; hero 0.212; regulars (18, alive ≥ 90 %) best 0.523, p10 0.304, median 0.087; fights on its land 116 d; asks {"ok":14}
seed 1492 GER hero_maus: life 275 d, PASS; nation land fight days 411; hero 0.204; regulars (5, alive ≥ 90 %) best 0.162, p10 0.162, median 0.079; fights on its land 10 d; asks {"ok":17}
seed 1492 ITA hero_p100: life 343 d, not counted; nation land fight days 543; hero 0.245; regulars (2, alive ≥ 90 %) best 0.297, p10 0.297, median 0.297; fights on its land 107 d; asks {"ok":17}
seed 1492 JAP hero_o_i: life 320 d, MISS; nation land fight days 538; hero 0.100; regulars (6, alive ≥ 90 %) best 0.306, p10 0.306, median 0.271; fights on its land 265 d; asks {"ok":51,"refused":92,"long":1}
seed 1492 FRA hero_char2c: life 235 d, MISS; nation land fight days 289; hero 0.094; regulars (18, alive ≥ 90 %) best 0.523, p10 0.304, median 0.087; fights on its land 40 d; asks {"refused":40,"ok":49}
seed 1492 GER hero_maus: life 45 d, PASS; nation land fight days 411; hero 0.511; regulars (5, alive ≥ 90 %) best 0.162, p10 0.162, median 0.079; fights on its land 85 d; asks {"ok":15,"long":2}
seed 1492 ITA hero_p100: life 339 d, not counted; nation land fight days 543; hero 0.201; regulars (2, alive ≥ 90 %) best 0.297, p10 0.297, median 0.297; fights on its land 108 d; asks {"ok":13}
seed 1492 GER hero_maus: life 214 d, PASS; nation land fight days 411; hero 0.393; regulars (5, alive ≥ 90 %) best 0.162, p10 0.162, median 0.079; fights on its land 266 d; asks {"ok":17}
seed 1492 ITA hero_p100: life 364 d, not counted; nation land fight days 543; hero 0.118; regulars (2, alive ≥ 90 %) best 0.297, p10 0.297, median 0.297; fights on its land 84 d; asks {"ok":8}
seed 1492 GER hero_maus: life 332 d, PASS; nation land fight days 411; hero 0.268; regulars (5, alive ≥ 90 %) best 0.162, p10 0.162, median 0.079; fights on its land 8 d; asks {"refused":16}
seed 1492 JAP hero_o_i: life 128 d, PASS; nation land fight days 538; hero 0.648; regulars (6, alive ≥ 90 %) best 0.306, p10 0.306, median 0.271; fights on its land 250 d; asks {"refused":6,"ok":47}
seed 1492 SOV hero_t42: life 318 d, PASS; nation land fight days 625; hero 0.211; regulars (142, alive ≥ 90 %) best 0.248, p10 0.158, median 0.059; fights on its land 252 d; asks {"ok":144,"long":1}
seed 1492 ITA hero_p100: life 81 d, not counted; nation land fight days 543; hero 0.531; regulars (2, alive ≥ 90 %) best 0.297, p10 0.297, median 0.297; fights on its land 34 d; asks {"ok":23}
seed 1492 ITA hero_p100: life 106 d, not counted; nation land fight days 543; hero 0.632; regulars (2, alive ≥ 90 %) best 0.297, p10 0.297, median 0.297; fights on its land 45 d; asks {"ok":4}
seed 1492 ITA hero_p100: life 326 d, not counted; nation land fight days 543; hero 0.331; regulars (2, alive ≥ 90 %) best 0.297, p10 0.297, median 0.297; fights on its land 92 d; asks {}
seed 1492 FRA hero_char2c: life 112 d, MISS; nation land fight days 289; hero 0.268; regulars (18, alive ≥ 90 %) best 0.523, p10 0.304, median 0.087; fights on its land 17 d; asks {"ok":36}
seed 1492 ITA hero_p100: life 342 d, not counted; nation land fight days 543; hero 0.222; regulars (2, alive ≥ 90 %) best 0.297, p10 0.297, median 0.297; fights on its land 73 d; asks {"ok":31}
seed 1492 JAP hero_o_i: life 128 d, MISS; nation land fight days 538; hero 0.094; regulars (6, alive ≥ 90 %) best 0.306, p10 0.306, median 0.271; fights on its land 0 d; asks {}
seed 1492 ITA hero_p100: life 368 d, not counted; nation land fight days 543; hero 0.038; regulars (2, alive ≥ 90 %) best 0.297, p10 0.297, median 0.297; fights on its land 5 d; asks {"refused":10}
seed 1492 AT: 11 of 19 lives at or above the top decile
seed 1493 JAP hero_o_i: life 60 d, PASS; nation land fight days 842; hero 0.383; regulars (11, alive ≥ 90 %) best 0.246, p10 0.200, median 0.141; fights on its land 53 d; asks {"refused":4,"ok":22}
seed 1493 USA hero_t28: life 160 d, MISS; nation land fight days 160; hero 0.106; regulars (57, alive ≥ 90 %) best 0.357, p10 0.242, median 0.109; fights on its land 101 d; asks {"ok":54,"refused":19}
seed 1493 SOV hero_t42: life 479 d, PASS; nation land fight days 789; hero 0.106; regulars (48, alive ≥ 90 %) best 0.171, p10 0.104, median 0.053; fights on its land 476 d; asks {"ok":238,"refused":59,"long":142}
seed 1493 GER hero_maus: life 205 d, PASS; nation land fight days 547; hero 0.429; regulars (22, alive ≥ 90 %) best 0.282, p10 0.222, median 0.128; fights on its land 202 d; asks {"ok":127,"refused":2}
seed 1493 ENG hero_tog2: life 117 d, PASS; nation land fight days 518; hero 0.248; regulars (18, alive ≥ 90 %) best 0.214, p10 0.209, median 0.077; fights on its land 150 d; asks {"refused":10,"ok":39}
seed 1493 FRA hero_char2c: life 43 d, PASS; nation land fight days 368; hero 0.488; regulars (13, alive ≥ 90 %) best 0.265, p10 0.183, median 0.040; fights on its land 43 d; asks {"ok":18}
seed 1493 ITA hero_p100: life 52 d, PASS; nation land fight days 517; hero 0.769; regulars (65, alive ≥ 90 %) best 0.286, p10 0.147, median 0.097; fights on its land 46 d; asks {"ok":28,"refused":2}
seed 1493 JAP hero_o_i: life 722 d, PASS; nation land fight days 842; hero 0.222; regulars (11, alive ≥ 90 %) best 0.246, p10 0.200, median 0.141; fights on its land 679 d; asks {"refused":44,"ok":301}
seed 1493 ENG hero_tog2: life 47 d, PASS; nation land fight days 518; hero 0.511; regulars (18, alive ≥ 90 %) best 0.214, p10 0.209, median 0.077; fights on its land 0 d; asks {"refused":8,"ok":2}
seed 1493 ITA hero_p100: life 621 d, PASS; nation land fight days 517; hero 0.272; regulars (65, alive ≥ 90 %) best 0.286, p10 0.147, median 0.097; fights on its land 372 d; asks {"refused":264,"ok":176}
seed 1493 FRA hero_char2c: life 217 d, MISS; nation land fight days 368; hero 0.171; regulars (13, alive ≥ 90 %) best 0.265, p10 0.183, median 0.040; fights on its land 110 d; asks {"ok":49,"refused":18}
seed 1493 ENG hero_tog2: life 177 d, PASS; nation land fight days 518; hero 0.395; regulars (18, alive ≥ 90 %) best 0.214, p10 0.209, median 0.077; fights on its land 82 d; asks {"refused":62,"ok":3}
seed 1493 FRA hero_char2c: life 471 d, MISS; nation land fight days 368; hero 0.153; regulars (13, alive ≥ 90 %) best 0.265, p10 0.183, median 0.040; fights on its land 1 d; asks {"ok":33,"refused":250}
seed 1493 GER hero_maus: life 382 d, PASS; nation land fight days 547; hero 0.309; regulars (22, alive ≥ 90 %) best 0.282, p10 0.222, median 0.128; fights on its land 134 d; asks {"refused":356,"ok":71,"long":3}
seed 1493 ENG hero_tog2: life 399 d, MISS; nation land fight days 518; hero 0.173; regulars (18, alive ≥ 90 %) best 0.214, p10 0.209, median 0.077; fights on its land 121 d; asks {"refused":256,"ok":65}
seed 1493 FRA hero_char2c: life 481 d, PASS; nation land fight days 368; hero 0.227; regulars (13, alive ≥ 90 %) best 0.265, p10 0.183, median 0.040; fights on its land 139 d; asks {"ok":65}
seed 1493 ENG hero_tog2: life 327 d, MISS; nation land fight days 518; hero 0.067; regulars (18, alive ≥ 90 %) best 0.214, p10 0.209, median 0.077; fights on its land 0 d; asks {"ok":1}
seed 1493 FRA hero_char2c: life 87 d, MISS; nation land fight days 368; hero 0.069; regulars (13, alive ≥ 90 %) best 0.265, p10 0.183, median 0.040; fights on its land 91 d; asks {"ok":35}
seed 1493 SOV hero_t42: life 428 d, PASS; nation land fight days 789; hero 0.138; regulars (48, alive ≥ 90 %) best 0.171, p10 0.104, median 0.053; fights on its land 163 d; asks {"ok":14}
seed 1493 GER hero_maus: life 386 d, MISS; nation land fight days 547; hero 0.207; regulars (22, alive ≥ 90 %) best 0.282, p10 0.222, median 0.128; fights on its land 158 d; asks {"ok":90}
seed 1493 SOV hero_t42: life 134 d, PASS; nation land fight days 789; hero 0.157; regulars (48, alive ≥ 90 %) best 0.171, p10 0.104, median 0.053; fights on its land 184 d; asks {"ok":38,"refused":14}
seed 1493 ENG hero_tog2: life 757 d, MISS; nation land fight days 518; hero 0.132; regulars (18, alive ≥ 90 %) best 0.214, p10 0.209, median 0.077; fights on its land 101 d; asks {"refused":240,"ok":18}
seed 1493 FRA hero_char2c: life 102 d, MISS; nation land fight days 368; hero 0.157; regulars (13, alive ≥ 90 %) best 0.265, p10 0.183, median 0.040; fights on its land 7 d; asks {"ok":2}
seed 1493 ENG hero_tog2: life 783 d, MISS; nation land fight days 518; hero 0.077; regulars (18, alive ≥ 90 %) best 0.214, p10 0.209, median 0.077; fights on its land 8 d; asks {"refused":58,"ok":1}
seed 1493 SOV hero_t42: life 551 d, PASS; nation land fight days 789; hero 0.156; regulars (48, alive ≥ 90 %) best 0.171, p10 0.104, median 0.053; fights on its land 10 d; asks {"ok":6}
seed 1493 AT: 15 of 25 lives at or above the top decile
seed 1494 JAP hero_o_i: life 662 d, not counted; nation land fight days 786; hero 0.127; regulars (1, alive ≥ 90 %) best 0.281, p10 0.281, median 0.281; fights on its land 514 d; asks {"refused":336,"ok":76}
seed 1494 USA hero_t28: life 419 d, MISS; nation land fight days 419; hero 0.084; regulars (51, alive ≥ 90 %) best 0.355, p10 0.253, median 0.108; fights on its land 176 d; asks {"refused":843,"ok":136}
seed 1494 SOV hero_t42: life 522 d, PASS; nation land fight days 522; hero 0.253; regulars (74, alive ≥ 90 %) best 0.140, p10 0.090, median 0.015; fights on its land 509 d; asks {"ok":296,"refused":194}
seed 1494 GER hero_maus: life 401 d, PASS; nation land fight days 578; hero 0.214; regulars (47, alive ≥ 90 %) best 0.206, p10 0.118, median 0.040; fights on its land 264 d; asks {"ok":108}
seed 1494 ENG hero_tog2: life 503 d, MISS; nation land fight days 503; hero 0.040; regulars (22, alive ≥ 90 %) best 0.300, p10 0.221, median 0.095; fights on its land 26 d; asks {"ok":57,"refused":1742}
seed 1494 FRA hero_char2c: life 69 d, PASS; nation land fight days 317; hero 0.145; regulars (36, alive ≥ 90 %) best 0.533, p10 0.101, median 0.041; fights on its land 48 d; asks {"ok":41,"refused":6}
seed 1494 ITA hero_p100: life 389 d, MISS; nation land fight days 630; hero 0.064; regulars (40, alive ≥ 90 %) best 0.278, p10 0.071, median 0.029; fights on its land 78 d; asks {"ok":41,"refused":22}
seed 1494 ITA hero_p100: life 551 d, MISS; nation land fight days 630; hero 0.042; regulars (40, alive ≥ 90 %) best 0.278, p10 0.071, median 0.029; fights on its land 252 d; asks {"ok":184,"refused":976}
seed 1494 GER hero_maus: life 647 d, MISS; nation land fight days 578; hero 0.117; regulars (47, alive ≥ 90 %) best 0.206, p10 0.118, median 0.040; fights on its land 243 d; asks {"ok":62,"refused":1400}
seed 1494 JAP hero_o_i: life 513 d, not counted; nation land fight days 786; hero 0.273; regulars (1, alive ≥ 90 %) best 0.281, p10 0.281, median 0.281; fights on its land 437 d; asks {"refused":114,"ok":265}
seed 1494 FRA hero_char2c: life 410 d, PASS; nation land fight days 317; hero 0.193; regulars (36, alive ≥ 90 %) best 0.533, p10 0.101, median 0.041; fights on its land 78 d; asks {"refused":194,"ok":3}
seed 1494 FRA hero_char2c: life 434 d, PASS; nation land fight days 317; hero 0.302; regulars (36, alive ≥ 90 %) best 0.533, p10 0.101, median 0.041; fights on its land 42 d; asks {"ok":8,"refused":46}
seed 1494 FRA hero_char2c: life 52 d, PASS; nation land fight days 317; hero 0.404; regulars (36, alive ≥ 90 %) best 0.533, p10 0.101, median 0.041; fights on its land 19 d; asks {"ok":5}
seed 1494 AT: 6 of 11 lives at or above the top decile
seed 1495 JAP hero_o_i: life 150 d, not counted; nation land fight days 909; hero 0.480; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 143 d; asks {"refused":4,"ok":37}
seed 1495 USA hero_t28: life 279 d, PASS; nation land fight days 625; hero 0.409; regulars (26, alive ≥ 90 %) best 0.350, p10 0.176, median 0.114; fights on its land 273 d; asks {"ok":77}
seed 1495 SOV hero_t42: life 69 d, PASS; nation land fight days 675; hero 0.188; regulars (91, alive ≥ 90 %) best 0.187, p10 0.111, median 0.034; fights on its land 66 d; asks {"ok":44}
seed 1495 JAP hero_o_i: life 340 d, not counted; nation land fight days 909; hero 0.324; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 254 d; asks {"refused":402,"ok":147}
seed 1495 GER hero_maus: life 167 d, not counted; nation land fight days 404; hero 0.419; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 163 d; asks {"ok":80,"refused":14}
seed 1495 ENG hero_tog2: life 46 d, PASS; nation land fight days 512; hero 0.826; regulars (11, alive ≥ 90 %) best 0.359, p10 0.203, median 0.103; fights on its land 39 d; asks {"ok":24,"refused":22}
seed 1495 FRA hero_char2c: life 161 d, PASS; nation land fight days 385; hero 0.553; regulars (12, alive ≥ 90 %) best 0.341, p10 0.296, median 0.219; fights on its land 159 d; asks {"ok":99}
seed 1495 ITA hero_p100: life 97 d, PASS; nation land fight days 585; hero 0.639; regulars (3, alive ≥ 90 %) best 0.226, p10 0.226, median 0.125; fights on its land 97 d; asks {"ok":58,"refused":15}
seed 1495 ITA hero_p100: life 361 d, PASS; nation land fight days 585; hero 0.479; regulars (3, alive ≥ 90 %) best 0.226, p10 0.226, median 0.125; fights on its land 86 d; asks {"ok":39}
seed 1495 USA hero_t28: life 310 d, PASS; nation land fight days 625; hero 0.494; regulars (26, alive ≥ 90 %) best 0.350, p10 0.176, median 0.114; fights on its land 246 d; asks {"ok":123}
seed 1495 ENG hero_tog2: life 244 d, MISS; nation land fight days 512; hero 0.143; regulars (11, alive ≥ 90 %) best 0.359, p10 0.203, median 0.103; fights on its land 3 d; asks {"refused":148,"ok":9}
seed 1495 SOV hero_t42: life 121 d, PASS; nation land fight days 675; hero 0.579; regulars (91, alive ≥ 90 %) best 0.187, p10 0.111, median 0.034; fights on its land 83 d; asks {"ok":38}
seed 1495 GER hero_maus: life 126 d, not counted; nation land fight days 404; hero 0.444; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 37 d; asks {"ok":10}
seed 1495 ITA hero_p100: life 391 d, PASS; nation land fight days 585; hero 0.332; regulars (3, alive ≥ 90 %) best 0.226, p10 0.226, median 0.125; fights on its land 330 d; asks {"ok":42,"refused":6}
seed 1495 GER hero_maus: life 130 d, not counted; nation land fight days 404; hero 0.515; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 13 d; asks {"ok":2}
seed 1495 SOV hero_t42: life 486 d, PASS; nation land fight days 675; hero 0.226; regulars (91, alive ≥ 90 %) best 0.187, p10 0.111, median 0.034; fights on its land 429 d; asks {"ok":275}
seed 1495 ENG hero_tog2: life 198 d, PASS; nation land fight days 512; hero 0.313; regulars (11, alive ≥ 90 %) best 0.359, p10 0.203, median 0.103; fights on its land 169 d; asks {"refused":36,"ok":10}
seed 1495 ITA hero_p100: life 197 d, PASS; nation land fight days 585; hero 0.320; regulars (3, alive ≥ 90 %) best 0.226, p10 0.226, median 0.125; fights on its land 313 d; asks {"ok":7}
seed 1495 GER hero_maus: life 203 d, not counted; nation land fight days 404; hero 0.241; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 14 d; asks {"refused":16,"ok":2}
seed 1495 JAP hero_o_i: life 249 d, not counted; nation land fight days 909; hero 0.108; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 192 d; asks {"ok":34,"refused":164}
seed 1495 ITA hero_p100: life 359 d, MISS; nation land fight days 585; hero 0.164; regulars (3, alive ≥ 90 %) best 0.226, p10 0.226, median 0.125; fights on its land 136 d; asks {"ok":26}
seed 1495 ENG hero_tog2: life 200 d, MISS; nation land fight days 512; hero 0.170; regulars (11, alive ≥ 90 %) best 0.359, p10 0.203, median 0.103; fights on its land 39 d; asks {"refused":58,"ok":3}
seed 1495 FRA hero_char2c: life 166 d, PASS; nation land fight days 385; hero 0.410; regulars (12, alive ≥ 90 %) best 0.341, p10 0.296, median 0.219; fights on its land 97 d; asks {"refused":4,"ok":67}
seed 1495 ENG hero_tog2: life 810 d, MISS; nation land fight days 512; hero 0.073; regulars (11, alive ≥ 90 %) best 0.359, p10 0.203, median 0.103; fights on its land 72 d; asks {"refused":2,"ok":21}
seed 1495 ITA hero_p100: life 61 d, PASS; nation land fight days 585; hero 0.361; regulars (3, alive ≥ 90 %) best 0.226, p10 0.226, median 0.125; fights on its land 25 d; asks {"ok":23}
seed 1495 ENG hero_tog2: life 532 d, PASS; nation land fight days 512; hero 0.214; regulars (11, alive ≥ 90 %) best 0.359, p10 0.203, median 0.103; fights on its land 146 d; asks {"refused":50,"ok":11}
seed 1495 USA hero_t28: life 413 d, PASS; nation land fight days 625; hero 0.242; regulars (26, alive ≥ 90 %) best 0.350, p10 0.176, median 0.114; fights on its land 110 d; asks {"ok":114,"refused":308}
seed 1495 ITA hero_p100: life 174 d, PASS; nation land fight days 585; hero 0.379; regulars (3, alive ≥ 90 %) best 0.226, p10 0.226, median 0.125; fights on its land 88 d; asks {"ok":64}
seed 1495 GER hero_maus: life 17 d, not counted; nation land fight days 404; hero 0.118; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 97 d; asks {"refused":6}
seed 1495 ENG hero_tog2: life 95 d, MISS; nation land fight days 512; hero 0.000; regulars (11, alive ≥ 90 %) best 0.359, p10 0.203, median 0.103; fights on its land 69 d; asks {"refused":40,"ok":33}
seed 1495 JAP hero_o_i: life 228 d, not counted; nation land fight days 909; hero 0.175; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 117 d; asks {"refused":46,"ok":39}
seed 1495 AT: 17 of 22 lives at or above the top decile
seed 1496 JAP hero_o_i: life 124 d, MISS; nation land fight days 580; hero 0.032; regulars (4, alive ≥ 90 %) best 0.281, p10 0.281, median 0.275; fights on its land 117 d; asks {"refused":4,"ok":46}
seed 1496 USA hero_t28: life 86 d, MISS; nation land fight days 86; hero 0.000; regulars (63, alive ≥ 90 %) best 0.548, p10 0.304, median 0.145; fights on its land 7 d; asks {"refused":66,"ok":13}
seed 1496 SOV hero_t42: life 538 d, PASS; nation land fight days 615; hero 0.214; regulars (29, alive ≥ 90 %) best 0.099, p10 0.089, median 0.055; fights on its land 537 d; asks {"ok":211}
seed 1496 GER hero_maus: life 84 d, PASS; nation land fight days 486; hero 0.452; regulars (46, alive ≥ 90 %) best 0.222, p10 0.192, median 0.123; fights on its land 84 d; asks {"ok":46,"refused":16}
seed 1496 ENG hero_tog2: life 47 d, PASS; nation land fight days 400; hero 0.489; regulars (40, alive ≥ 90 %) best 0.297, p10 0.212, median 0.084; fights on its land 26 d; asks {"ok":62}
seed 1496 FRA hero_char2c: life 387 d, PASS; nation land fight days 387; hero 0.183; regulars (41, alive ≥ 90 %) best 0.282, p10 0.132, median 0.062; fights on its land 316 d; asks {"ok":141,"refused":126,"long":1}
seed 1496 ITA hero_p100: life 398 d, PASS; nation land fight days 398; hero 0.276; regulars (67, alive ≥ 90 %) best 0.226, p10 0.188, median 0.103; fights on its land 391 d; asks {"ok":298,"refused":45}
seed 1496 JAP hero_o_i: life 122 d, MISS; nation land fight days 580; hero 0.033; regulars (4, alive ≥ 90 %) best 0.281, p10 0.281, median 0.275; fights on its land 14 d; asks {"refused":121,"ok":10}
seed 1496 ENG hero_tog2: life 7 d, not counted; nation land fight days 400; hero 0.000; regulars (40, alive ≥ 90 %) best 0.297, p10 0.212, median 0.084; fights on its land 0 d; asks {"refused":4,"ok":1}
seed 1496 GER hero_maus: life 200 d, MISS; nation land fight days 486; hero 0.175; regulars (46, alive ≥ 90 %) best 0.222, p10 0.192, median 0.123; fights on its land 83 d; asks {"ok":100,"refused":220}
seed 1496 JAP hero_o_i: life 572 d, MISS; nation land fight days 580; hero 0.196; regulars (4, alive ≥ 90 %) best 0.281, p10 0.281, median 0.275; fights on its land 196 d; asks {"refused":388,"ok":73}
seed 1496 ENG hero_tog2: life 366 d, MISS; nation land fight days 400; hero 0.090; regulars (40, alive ≥ 90 %) best 0.297, p10 0.212, median 0.084; fights on its land 238 d; asks {"refused":518,"ok":79}
seed 1496 JAP hero_o_i: life 264 d, MISS; nation land fight days 580; hero 0.208; regulars (4, alive ≥ 90 %) best 0.281, p10 0.281, median 0.275; fights on its land 5 d; asks {"refused":6,"ok":7}
seed 1496 GER hero_maus: life 131 d, PASS; nation land fight days 486; hero 0.542; regulars (46, alive ≥ 90 %) best 0.222, p10 0.192, median 0.123; fights on its land 131 d; asks {"ok":59}
seed 1496 SOV hero_t42: life 552 d, PASS; nation land fight days 615; hero 0.373; regulars (29, alive ≥ 90 %) best 0.099, p10 0.089, median 0.055; fights on its land 180 d; asks {"ok":28}
seed 1496 SOV hero_t42: life 520 d, MISS; nation land fight days 615; hero 0.060; regulars (29, alive ≥ 90 %) best 0.099, p10 0.089, median 0.055; fights on its land 86 d; asks {"ok":16}
seed 1496 GER hero_maus: life 57 d, PASS; nation land fight days 486; hero 0.439; regulars (46, alive ≥ 90 %) best 0.222, p10 0.192, median 0.123; fights on its land 56 d; asks {"ok":37}
seed 1496 SOV hero_t42: life 303 d, PASS; nation land fight days 615; hero 0.168; regulars (29, alive ≥ 90 %) best 0.099, p10 0.089, median 0.055; fights on its land 43 d; asks {"ok":21}
seed 1496 AT: 9 of 17 lives at or above the top decile
seed 1497 JAP hero_o_i: life 178 d, not counted; nation land fight days 759; hero 0.011; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 64 d; asks {"refused":4,"ok":24}
seed 1497 USA hero_t28: life 107 d, MISS; nation land fight days 107; hero 0.047; regulars (67, alive ≥ 90 %) best 0.556, p10 0.271, median 0.093; fights on its land 101 d; asks {"ok":7,"refused":130}
seed 1497 SOV hero_t42: life 606 d, PASS; nation land fight days 606; hero 0.248; regulars (90, alive ≥ 90 %) best 0.249, p10 0.165, median 0.020; fights on its land 600 d; asks {"ok":333,"refused":8}
seed 1497 GER hero_maus: life 272 d, PASS; nation land fight days 545; hero 0.449; regulars (58, alive ≥ 90 %) best 0.259, p10 0.162, median 0.056; fights on its land 773 d; asks {"ok":191}
seed 1497 ENG hero_tog2: life 137 d, PASS; nation land fight days 495; hero 0.613; regulars (3, alive ≥ 90 %) best 0.234, p10 0.234, median 0.155; fights on its land 119 d; asks {"ok":38,"refused":2}
seed 1497 FRA hero_char2c: life 53 d, PASS; nation land fight days 469; hero 0.472; regulars (8, alive ≥ 90 %) best 0.267, p10 0.267, median 0.142; fights on its land 53 d; asks {"ok":34}
seed 1497 ITA hero_p100: life 61 d, PASS; nation land fight days 859; hero 0.443; regulars (77, alive ≥ 90 %) best 0.189, p10 0.129, median 0.066; fights on its land 61 d; asks {"ok":40}
seed 1497 JAP hero_o_i: life 551 d, not counted; nation land fight days 759; hero 0.181; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 425 d; asks {"refused":24,"ok":86}
seed 1497 ITA hero_p100: life 738 d, PASS; nation land fight days 859; hero 0.164; regulars (77, alive ≥ 90 %) best 0.189, p10 0.129, median 0.066; fights on its land 735 d; asks {"ok":385}
seed 1497 FRA hero_char2c: life 353 d, MISS; nation land fight days 469; hero 0.261; regulars (8, alive ≥ 90 %) best 0.267, p10 0.267, median 0.142; fights on its land 198 d; asks {"ok":20}
seed 1497 ENG hero_tog2: life 352 d, PASS; nation land fight days 495; hero 0.352; regulars (3, alive ≥ 90 %) best 0.234, p10 0.234, median 0.155; fights on its land 188 d; asks {"ok":45,"refused":46}
seed 1497 FRA hero_char2c: life 248 d, MISS; nation land fight days 469; hero 0.165; regulars (8, alive ≥ 90 %) best 0.267, p10 0.267, median 0.142; fights on its land 412 d; asks {"ok":4}
seed 1497 FRA hero_char2c: life 266 d, MISS; nation land fight days 469; hero 0.259; regulars (8, alive ≥ 90 %) best 0.267, p10 0.267, median 0.142; fights on its land 220 d; asks {"ok":31}
seed 1497 JAP hero_o_i: life 63 d, not counted; nation land fight days 759; hero 0.032; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 44 d; asks {"refused":28,"ok":6}
seed 1497 FRA hero_char2c: life 591 d, MISS; nation land fight days 469; hero 0.103; regulars (8, alive ≥ 90 %) best 0.267, p10 0.267, median 0.142; fights on its land 361 d; asks {"refused":40,"ok":10}
seed 1497 ENG hero_tog2: life 400 d, PASS; nation land fight days 495; hero 0.292; regulars (3, alive ≥ 90 %) best 0.234, p10 0.234, median 0.155; fights on its land 144 d; asks {"refused":254,"ok":36}
seed 1497 GER hero_maus: life 242 d, PASS; nation land fight days 545; hero 0.236; regulars (58, alive ≥ 90 %) best 0.259, p10 0.162, median 0.056; fights on its land 281 d; asks {"ok":97,"refused":58}
seed 1497 JAP hero_o_i: life 312 d, not counted; nation land fight days 759; hero 0.212; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 233 d; asks {"ok":45}
seed 1497 ENG hero_tog2: life 127 d, MISS; nation land fight days 495; hero 0.189; regulars (3, alive ≥ 90 %) best 0.234, p10 0.234, median 0.155; fights on its land 104 d; asks {"ok":40,"refused":26}
seed 1497 FRA hero_char2c: life 257 d, PASS; nation land fight days 469; hero 0.459; regulars (8, alive ≥ 90 %) best 0.267, p10 0.267, median 0.142; fights on its land 129 d; asks {"refused":72,"ok":17}
seed 1497 JAP hero_o_i: life 252 d, not counted; nation land fight days 759; hero 0.405; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 71 d; asks {"ok":83}
seed 1497 FRA hero_char2c: life 107 d, MISS; nation land fight days 469; hero 0.196; regulars (8, alive ≥ 90 %) best 0.267, p10 0.267, median 0.142; fights on its land 0 d; asks {"refused":56}
seed 1497 ENG hero_tog2: life 136 d, PASS; nation land fight days 495; hero 0.243; regulars (3, alive ≥ 90 %) best 0.234, p10 0.234, median 0.155; fights on its land 24 d; asks {"ok":4}
seed 1497 JAP hero_o_i: life 92 d, not counted; nation land fight days 759; hero 0.543; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 44 d; asks {"ok":12}
seed 1497 GER hero_maus: life 545 d, MISS; nation land fight days 545; hero 0.040; regulars (58, alive ≥ 90 %) best 0.259, p10 0.162, median 0.056; fights on its land 55 d; asks {"ok":28,"refused":24}
seed 1497 ENG hero_tog2: life 537 d, MISS; nation land fight days 495; hero 0.037; regulars (3, alive ≥ 90 %) best 0.234, p10 0.234, median 0.155; fights on its land 41 d; asks {"ok":11}
seed 1497 JAP hero_o_i: life 844 d, not counted; nation land fight days 759; hero 0.190; regulars (0, alive ≥ 90 %) best n/a, p10 n/a, median n/a; fights on its land 7 d; asks {"refused":30,"ok":3}
seed 1497 AT: 11 of 20 lives at or above the top decile
seed 1498 JAP hero_o_i: life 697 d, MISS; nation land fight days 697; hero 0.293; regulars (10, alive ≥ 90 %) best 0.349, p10 0.349, median 0.188; fights on its land 410 d; asks {"refused":914,"ok":274}
seed 1498 USA hero_t28: life 186 d, MISS; nation land fight days 186; hero 0.027; regulars (60, alive ≥ 90 %) best 0.370, p10 0.285, median 0.104; fights on its land 46 d; asks {"refused":178,"ok":48}
seed 1498 SOV hero_t42: life 334 d, PASS; nation land fight days 549; hero 0.192; regulars (57, alive ≥ 90 %) best 0.196, p10 0.117, median 0.027; fights on its land 331 d; asks {"ok":190}
seed 1498 GER hero_maus: life 419 d, PASS; nation land fight days 467; hero 0.274; regulars (58, alive ≥ 90 %) best 0.281, p10 0.220, median 0.107; fights on its land 371 d; asks {"ok":138,"refused":30}
seed 1498 ENG hero_tog2: life 430 d, MISS; nation land fight days 323; hero 0.130; regulars (29, alive ≥ 90 %) best 0.461, p10 0.373, median 0.157; fights on its land 429 d; asks {"ok":62,"refused":7}
seed 1498 FRA hero_char2c: life 156 d, PASS; nation land fight days 199; hero 0.301; regulars (40, alive ≥ 90 %) best 0.317, p10 0.217, median 0.050; fights on its land 329 d; asks {"ok":94,"refused":61}
seed 1498 ITA hero_p100: life 287 d, PASS; nation land fight days 403; hero 0.199; regulars (75, alive ≥ 90 %) best 0.291, p10 0.169, median 0.072; fights on its land 433 d; asks {"ok":82,"refused":407}
seed 1498 ENG hero_tog2: life 550 d, MISS; nation land fight days 323; hero 0.193; regulars (29, alive ≥ 90 %) best 0.461, p10 0.373, median 0.157; fights on its land 442 d; asks {"refused":8,"ok":88,"long":2}
seed 1498 ENG hero_tog2: life 297 d, MISS; nation land fight days 323; hero 0.108; regulars (29, alive ≥ 90 %) best 0.461, p10 0.373, median 0.157; fights on its land 108 d; asks {"refused":155,"ok":79}
seed 1498 ITA hero_p100: life 386 d, PASS; nation land fight days 403; hero 0.205; regulars (75, alive ≥ 90 %) best 0.291, p10 0.169, median 0.072; fights on its land 157 d; asks {"ok":76,"refused":36}
seed 1498 GER hero_maus: life 209 d, PASS; nation land fight days 467; hero 0.565; regulars (58, alive ≥ 90 %) best 0.281, p10 0.220, median 0.107; fights on its land 195 d; asks {"ok":117,"refused":2}
seed 1498 FRA hero_char2c: life 179 d, MISS; nation land fight days 199; hero 0.184; regulars (40, alive ≥ 90 %) best 0.317, p10 0.217, median 0.050; fights on its land 48 d; asks {"ok":6}
seed 1498 SOV hero_t42: life 128 d, PASS; nation land fight days 549; hero 0.438; regulars (57, alive ≥ 90 %) best 0.196, p10 0.117, median 0.027; fights on its land 8 d; asks {"ok":4}
seed 1498 SOV hero_t42: life 577 d, PASS; nation land fight days 549; hero 0.184; regulars (57, alive ≥ 90 %) best 0.196, p10 0.117, median 0.027; fights on its land 114 d; asks {"ok":21}
seed 1498 FRA hero_char2c: life 154 d, MISS; nation land fight days 199; hero 0.175; regulars (40, alive ≥ 90 %) best 0.317, p10 0.217, median 0.050; fights on its land 0 d; asks {"ok":2,"refused":30}
seed 1498 SOV hero_t42: life 453 d, PASS; nation land fight days 549; hero 0.126; regulars (57, alive ≥ 90 %) best 0.196, p10 0.117, median 0.027; fights on its land 0 d; asks {"ok":1}
seed 1498 AT: 9 of 16 lives at or above the top decile
seed 1499 JAP hero_o_i: life 518 d, MISS; nation land fight days 719; hero 0.241; regulars (12, alive ≥ 90 %) best 0.273, p10 0.262, median 0.211; fights on its land 257 d; asks {"refused":4,"ok":65}
seed 1499 USA hero_t28: life 81 d, PASS; nation land fight days 81; hero 0.519; regulars (57, alive ≥ 90 %) best 0.520, p10 0.374, median 0.136; fights on its land 50 d; asks {"ok":78,"refused":8}
seed 1499 SOV hero_t42: life 441 d, PASS; nation land fight days 717; hero 0.358; regulars (64, alive ≥ 90 %) best 0.162, p10 0.119, median 0.056; fights on its land 436 d; asks {"ok":273,"refused":3}
seed 1499 GER hero_maus: life 92 d, PASS; nation land fight days 627; hero 0.565; regulars (3, alive ≥ 90 %) best 0.287, p10 0.287, median 0.214; fights on its land 92 d; asks {"ok":52}
seed 1499 ENG hero_tog2: life 102 d, MISS; nation land fight days 388; hero 0.216; regulars (29, alive ≥ 90 %) best 0.393, p10 0.262, median 0.127; fights on its land 61 d; asks {"ok":39,"refused":64}
seed 1499 FRA hero_char2c: life 75 d, MISS; nation land fight days 231; hero 0.120; regulars (34, alive ≥ 90 %) best 0.392, p10 0.205, median 0.069; fights on its land 72 d; asks {"ok":32}
seed 1499 ITA hero_p100: life 132 d, PASS; nation land fight days 545; hero 0.591; regulars (3, alive ≥ 90 %) best 0.181, p10 0.181, median 0.133; fights on its land 131 d; asks {"ok":125,"refused":5}
seed 1499 GER hero_maus: life 228 d, PASS; nation land fight days 627; hero 0.303; regulars (3, alive ≥ 90 %) best 0.287, p10 0.287, median 0.214; fights on its land 104 d; asks {"ok":65,"refused":114}
seed 1499 JAP hero_o_i: life 121 d, MISS; nation land fight days 719; hero 0.074; regulars (12, alive ≥ 90 %) best 0.273, p10 0.262, median 0.211; fights on its land 29 d; asks {"refused":54,"ok":11}
seed 1499 ENG hero_tog2: life 127 d, PASS; nation land fight days 388; hero 0.362; regulars (29, alive ≥ 90 %) best 0.393, p10 0.262, median 0.127; fights on its land 4 d; asks {"ok":2,"refused":20}
seed 1499 FRA hero_char2c: life 269 d, PASS; nation land fight days 231; hero 0.234; regulars (34, alive ≥ 90 %) best 0.392, p10 0.205, median 0.069; fights on its land 252 d; asks {"ok":72,"refused":20}
seed 1499 ITA hero_p100: life 112 d, PASS; nation land fight days 545; hero 0.188; regulars (3, alive ≥ 90 %) best 0.181, p10 0.181, median 0.133; fights on its land 75 d; asks {"ok":17,"refused":198}
seed 1499 JAP hero_o_i: life 377 d, MISS; nation land fight days 719; hero 0.090; regulars (12, alive ≥ 90 %) best 0.273, p10 0.262, median 0.211; fights on its land 340 d; asks {"ok":174,"refused":6}
seed 1499 GER hero_maus: life 282 d, MISS; nation land fight days 627; hero 0.238; regulars (3, alive ≥ 90 %) best 0.287, p10 0.287, median 0.214; fights on its land 205 d; asks {"ok":108}
seed 1499 ENG hero_tog2: life 79 d, MISS; nation land fight days 388; hero 0.228; regulars (29, alive ≥ 90 %) best 0.393, p10 0.262, median 0.127; fights on its land 73 d; asks {"refused":130,"ok":14}
seed 1499 ITA hero_p100: life 299 d, PASS; nation land fight days 545; hero 0.204; regulars (3, alive ≥ 90 %) best 0.181, p10 0.181, median 0.133; fights on its land 215 d; asks {"ok":53,"refused":2}
seed 1499 GER hero_maus: life 396 d, MISS; nation land fight days 627; hero 0.119; regulars (3, alive ≥ 90 %) best 0.287, p10 0.287, median 0.214; fights on its land 124 d; asks {"ok":62}
seed 1499 SOV hero_t42: life 767 d, PASS; nation land fight days 717; hero 0.166; regulars (64, alive ≥ 90 %) best 0.162, p10 0.119, median 0.056; fights on its land 316 d; asks {"ok":168}
seed 1499 ITA hero_p100: life 500 d, PASS; nation land fight days 545; hero 0.312; regulars (3, alive ≥ 90 %) best 0.181, p10 0.181, median 0.133; fights on its land 67 d; asks {"ok":32}
seed 1499 ENG hero_tog2: life 4 d, not counted; nation land fight days 388; hero 0.750; regulars (29, alive ≥ 90 %) best 0.393, p10 0.262, median 0.127; fights on its land 4 d; asks {}
seed 1499 GER hero_maus: life 0 d, not counted; nation land fight days 627; hero 0.000; regulars (3, alive ≥ 90 %) best 0.287, p10 0.287, median 0.214; fights on its land 0 d; asks {}
seed 1499 ENG hero_tog2: life 560 d, MISS; nation land fight days 388; hero 0.182; regulars (29, alive ≥ 90 %) best 0.393, p10 0.262, median 0.127; fights on its land 25 d; asks {"refused":18,"ok":8}
seed 1499 FRA hero_char2c: life 514 d, PASS; nation land fight days 231; hero 0.212; regulars (34, alive ≥ 90 %) best 0.392, p10 0.205, median 0.069; fights on its land 44 d; asks {"ok":14}
seed 1499 ITA hero_p100: life 268 d, PASS; nation land fight days 545; hero 0.254; regulars (3, alive ≥ 90 %) best 0.181, p10 0.181, median 0.133; fights on its land 4 d; asks {"refused":18}
seed 1499 ENG hero_tog2: life 716 d, MISS; nation land fight days 388; hero 0.045; regulars (29, alive ≥ 90 %) best 0.393, p10 0.262, median 0.127; fights on its land 0 d; asks {"refused":84}
seed 1499 AT: 13 of 23 lives at or above the top decile
seed 1500 JAP hero_o_i: life 809 d, PASS; nation land fight days 809; hero 0.241; regulars (15, alive ≥ 90 %) best 0.212, p10 0.195, median 0.155; fights on its land 794 d; asks {"refused":14,"ok":322}
seed 1500 USA hero_t28: life 3 d, not counted; nation land fight days 353; hero 1.000; regulars (35, alive ≥ 90 %) best 0.316, p10 0.261, median 0.156; fights on its land 0 d; asks {}
seed 1500 SOV hero_t42: life 119 d, PASS; nation land fight days 880; hero 0.345; regulars (74, alive ≥ 90 %) best 0.172, p10 0.142, median 0.060; fights on its land 119 d; asks {"ok":63,"refused":3}
seed 1500 GER hero_maus: life 493 d, not counted; nation land fight days 676; hero 0.333; regulars (1, alive ≥ 90 %) best 0.158, p10 0.158, median 0.158; fights on its land 449 d; asks {"ok":177}
seed 1500 ITA hero_p100: life 224 d, MISS; nation land fight days 629; hero 0.188; regulars (4, alive ≥ 90 %) best 0.192, p10 0.192, median 0.130; fights on its land 93 d; asks {"ok":26}
seed 1500 ENG hero_tog2: life 371 d, MISS; nation land fight days 314; hero 0.013; regulars (33, alive ≥ 90 %) best 0.430, p10 0.263, median 0.165; fights on its land 346 d; asks {"ok":64,"refused":123}
seed 1500 FRA hero_char2c: life 373 d, MISS; nation land fight days 437; hero 0.097; regulars (10, alive ≥ 90 %) best 0.278, p10 0.278, median 0.100; fights on its land 105 d; asks {"ok":34}
seed 1500 ITA hero_p100: life 119 d, PASS; nation land fight days 629; hero 0.672; regulars (4, alive ≥ 90 %) best 0.192, p10 0.192, median 0.130; fights on its land 119 d; asks {"ok":55}
seed 1500 USA hero_t28: life 113 d, MISS; nation land fight days 353; hero 0.027; regulars (35, alive ≥ 90 %) best 0.316, p10 0.261, median 0.156; fights on its land 168 d; asks {"refused":52,"ok":26}
seed 1500 FRA hero_char2c: life 89 d, PASS; nation land fight days 437; hero 0.337; regulars (10, alive ≥ 90 %) best 0.278, p10 0.278, median 0.100; fights on its land 24 d; asks {"ok":7}
seed 1500 FRA hero_char2c: life 536 d, MISS; nation land fight days 437; hero 0.136; regulars (10, alive ≥ 90 %) best 0.278, p10 0.278, median 0.100; fights on its land 334 d; asks {"ok":42,"refused":434}
seed 1500 ITA hero_p100: life 263 d, PASS; nation land fight days 629; hero 0.202; regulars (4, alive ≥ 90 %) best 0.192, p10 0.192, median 0.130; fights on its land 426 d; asks {"refused":348,"ok":66}
seed 1500 GER hero_maus: life 84 d, not counted; nation land fight days 676; hero 0.345; regulars (1, alive ≥ 90 %) best 0.158, p10 0.158, median 0.158; fights on its land 80 d; asks {"ok":46}
seed 1500 SOV hero_t42: life 762 d, PASS; nation land fight days 880; hero 0.302; regulars (74, alive ≥ 90 %) best 0.172, p10 0.142, median 0.060; fights on its land 692 d; asks {"ok":349,"refused":3}
seed 1500 USA hero_t28: life 124 d, PASS; nation land fight days 353; hero 0.274; regulars (35, alive ≥ 90 %) best 0.316, p10 0.261, median 0.156; fights on its land 4 d; asks {"refused":104,"ok":3}
seed 1500 GER hero_maus: life 338 d, not counted; nation land fight days 676; hero 0.207; regulars (1, alive ≥ 90 %) best 0.158, p10 0.158, median 0.158; fights on its land 310 d; asks {"ok":53}
seed 1500 USA hero_t28: life 599 d, MISS; nation land fight days 353; hero 0.234; regulars (35, alive ≥ 90 %) best 0.316, p10 0.261, median 0.156; fights on its land 106 d; asks {"ok":55,"refused":4}
seed 1500 ITA hero_p100: life 31 d, PASS; nation land fight days 629; hero 0.258; regulars (4, alive ≥ 90 %) best 0.192, p10 0.192, median 0.130; fights on its land 158 d; asks {"ok":6}
seed 1500 FRA hero_char2c: life 631 d, MISS; nation land fight days 437; hero 0.151; regulars (10, alive ≥ 90 %) best 0.278, p10 0.278, median 0.100; fights on its land 136 d; asks {"ok":61}
seed 1500 ENG hero_tog2: life 575 d, MISS; nation land fight days 314; hero 0.235; regulars (33, alive ≥ 90 %) best 0.430, p10 0.263, median 0.165; fights on its land 47 d; asks {"ok":30}
seed 1500 GER hero_maus: life 713 d, not counted; nation land fight days 676; hero 0.132; regulars (1, alive ≥ 90 %) best 0.158, p10 0.158, median 0.158; fights on its land 243 d; asks {"ok":41}
seed 1500 ITA hero_p100: life 287 d, PASS; nation land fight days 629; hero 0.355; regulars (4, alive ≥ 90 %) best 0.192, p10 0.192, median 0.130; fights on its land 56 d; asks {"ok":45}
seed 1500 ENG hero_tog2: life 645 d, MISS; nation land fight days 314; hero 0.206; regulars (33, alive ≥ 90 %) best 0.430, p10 0.263, median 0.165; fights on its land 149 d; asks {"refused":2,"ok":1}
seed 1500 ITA hero_p100: life 406 d, PASS; nation land fight days 629; hero 0.217; regulars (4, alive ≥ 90 %) best 0.192, p10 0.192, median 0.130; fights on its land 201 d; asks {"ok":40}
seed 1500 GER hero_maus: life 309 d, not counted; nation land fight days 676; hero 0.356; regulars (1, alive ≥ 90 %) best 0.158, p10 0.158, median 0.158; fights on its land 103 d; asks {"ok":36}
seed 1500 ITA hero_p100: life 635 d, MISS; nation land fight days 629; hero 0.132; regulars (4, alive ≥ 90 %) best 0.192, p10 0.192, median 0.130; fights on its land 5 d; asks {"ok":6,"refused":12}
seed 1500 GER hero_maus: life 747 d, not counted; nation land fight days 676; hero 0.138; regulars (1, alive ≥ 90 %) best 0.158, p10 0.158, median 0.158; fights on its land 42 d; asks {"ok":17,"refused":7}
seed 1500 ENG hero_tog2: life 477 d, MISS; nation land fight days 314; hero 0.195; regulars (33, alive ≥ 90 %) best 0.430, p10 0.263, median 0.165; fights on its land 49 d; asks {"ok":1}
seed 1500 ENG hero_tog2: life 541 d, PASS; nation land fight days 314; hero 0.338; regulars (33, alive ≥ 90 %) best 0.430, p10 0.263, median 0.165; fights on its land 0 d; asks {"refused":14,"ok":2}
seed 1500 AT: 11 of 22 lives at or above the top decile
```

## sea, heroBattle

```
seed 1491 JAP hero_yamato: at war alive 675 d, in battle 21 d, share 0.031, ceiling 0.052, gone at war 420 d; with 0.501, ofFleet 0.500 (2 d)
seed 1491 JAP hero_o_i: at war alive 870 d, in battle 104 d, share 0.120, ceiling 0.592, gone at war 225 d; ofArmy 0.202
seed 1491 USA hero_iowa: at war alive 594 d, in battle 2 d, share 0.003, ceiling 0.030, gone at war 0 d; with 0.978, ofFleet 0.500 (2 d)
seed 1491 USA hero_t28: at war alive 594 d, in battle 27 d, share 0.045, ceiling 0.237, gone at war 0 d; ofArmy 0.191
seed 1491 SOV hero_sovetsky_soyuz: at war alive 723 d, in battle 16 d, share 0.022, ceiling 0.025, gone at war 236 d; with 0.451, ofFleet 1.000 (10 d)
seed 1491 SOV hero_t42: at war alive 959 d, in battle 99 d, share 0.103, ceiling 0.505, gone at war 0 d; ofArmy 0.205
seed 1491 GER hero_bismarck: at war alive 352 d, in battle 7 d, share 0.020, ceiling 0.040, gone at war 270 d; with 0.886, ofFleet 0.800 (5 d)
seed 1491 GER hero_maus: at war alive 416 d, in battle 112 d, share 0.269, ceiling 0.572, gone at war 206 d; ofArmy 0.471
seed 1491 ENG hero_hood: at war alive 938 d, in battle 6 d, share 0.006, ceiling 0.035, gone at war 60 d; with 0.972, ofFleet 0.800 (5 d)
seed 1491 ENG hero_tog2: at war alive 938 d, in battle 30 d, share 0.032, ceiling 0.226, gone at war 60 d; ofArmy 0.142
seed 1491 FRA hero_richelieu: at war alive 768 d, in battle 5 d, share 0.007, ceiling 0.020, gone at war 144 d; with 0.315, ofFleet 1.000 (3 d)
seed 1491 FRA hero_char2c: at war alive 852 d, in battle 47 d, share 0.055, ceiling 0.302, gone at war 60 d; ofArmy 0.183
seed 1491 ITA hero_roma: at war alive 470 d, in battle 16 d, share 0.034, ceiling 0.051, gone at war 520 d; with 0.804, ofFleet 0.800 (5 d)
seed 1491 ITA hero_p100: at war alive 786 d, in battle 89 d, share 0.113, ceiling 0.477, gone at war 204 d; ofArmy 0.237
seed 1492 JAP hero_yamato: at war alive 959 d, in battle 34 d, share 0.035, ceiling 0.056, gone at war 136 d; with 0.515, ofFleet 0.800 (30 d)
seed 1492 JAP hero_o_i: at war alive 675 d, in battle 155 d, share 0.230, ceiling 0.736, gone at war 420 d; ofArmy 0.312
seed 1492 USA hero_iowa: at war alive 361 d, in battle 7 d, share 0.019, ceiling 0.055, gone at war 316 d; with 0.407, ofFleet 0.333 (6 d)
seed 1492 USA hero_t28: at war alive 677 d, in battle 15 d, share 0.022, ceiling 0.312, gone at war 0 d; ofArmy 0.071
seed 1492 SOV hero_sovetsky_soyuz: at war alive 815 d, in battle 9 d, share 0.011, ceiling 0.028, gone at war 120 d; with 0.904, ofFleet 0.667 (3 d)
seed 1492 SOV hero_t42: at war alive 935 d, in battle 246 d, share 0.263, ceiling 0.742, gone at war 0 d; ofArmy 0.354
seed 1492 GER hero_bismarck: at war alive 725 d, in battle 33 d, share 0.046, ceiling 0.065, gone at war 360 d; with 0.243, ofFleet 0.882 (17 d)
seed 1492 GER hero_maus: at war alive 725 d, in battle 151 d, share 0.208, ceiling 0.440, gone at war 360 d; ofArmy 0.473
seed 1492 ENG hero_hood: at war alive 603 d, in battle 11 d, share 0.018, ceiling 0.027, gone at war 283 d; with 0.265, ofFleet 0.800 (5 d)
seed 1492 ENG hero_tog2: at war alive 828 d, in battle 75 d, share 0.091, ceiling 0.395, gone at war 58 d; ofArmy 0.229
seed 1492 FRA hero_richelieu: at war alive 766 d, in battle 8 d, share 0.010, ceiling 0.017, gone at war 120 d; with 0.868, ofFleet 0.875 (8 d)
seed 1492 FRA hero_char2c: at war alive 713 d, in battle 44 d, share 0.062, ceiling 0.324, gone at war 173 d; ofArmy 0.190
seed 1492 ITA hero_roma: at war alive 660 d, in battle 15 d, share 0.023, ceiling 0.032, gone at war 408 d; with 0.494, ofFleet 0.500 (2 d)
seed 1492 ITA hero_p100: at war alive 828 d, in battle 106 d, share 0.128, ceiling 0.415, gone at war 240 d; ofArmy 0.308
seed 1493 JAP hero_yamato: at war alive 879 d, in battle 13 d, share 0.015, ceiling 0.031, gone at war 216 d; with 0.710, ofFleet 0.750 (4 d)
seed 1493 JAP hero_o_i: at war alive 1035 d, in battle 213 d, share 0.206, ceiling 0.754, gone at war 60 d; ofArmy 0.273
seed 1493 USA hero_iowa: at war alive 577 d, in battle 0 d, share 0.000, ceiling 0.075, gone at war 0 d; with 0.981, ofFleet 0.000 (1 d)
seed 1493 USA hero_t28: at war alive 559 d, in battle 30 d, share 0.054, ceiling 0.546, gone at war 18 d; ofArmy 0.098
seed 1493 SOV hero_sovetsky_soyuz: at war alive 679 d, in battle 9 d, share 0.013, ceiling 0.022, gone at war 237 d; with 0.841, ofFleet 1.000 (2 d)
seed 1493 SOV hero_t42: at war alive 770 d, in battle 71 d, share 0.092, ceiling 0.687, gone at war 146 d; ofArmy 0.134
seed 1493 GER hero_bismarck: at war alive 623 d, in battle 36 d, share 0.058, ceiling 0.058, gone at war 449 d; with 0.071, ofFleet 1.000 (6 d)
seed 1493 GER hero_maus: at war alive 793 d, in battle 134 d, share 0.169, ceiling 0.544, gone at war 279 d; ofArmy 0.311
seed 1493 ENG hero_hood: at war alive 1005 d, in battle 11 d, share 0.011, ceiling 0.055, gone at war 0 d; with 1.000, ofFleet 0.750 (12 d)
seed 1493 ENG hero_tog2: at war alive 705 d, in battle 45 d, share 0.064, ceiling 0.470, gone at war 300 d; ofArmy 0.136
seed 1493 FRA hero_richelieu: at war alive 797 d, in battle 5 d, share 0.006, ceiling 0.029, gone at war 120 d; with 0.447, ofFleet 0.667 (3 d)
seed 1493 FRA hero_char2c: at war alive 737 d, in battle 96 d, share 0.130, ceiling 0.577, gone at war 180 d; ofArmy 0.226
seed 1493 ITA hero_roma: at war alive 605 d, in battle 45 d, share 0.074, ceiling 0.081, gone at war 467 d; with 0.240, ofFleet 0.958 (24 d)
seed 1493 ITA hero_p100: at war alive 926 d, in battle 149 d, share 0.161, ceiling 0.671, gone at war 146 d; ofArmy 0.240
seed 1494 JAP hero_yamato: at war alive 975 d, in battle 4 d, share 0.004, ceiling 0.035, gone at war 120 d; with 0.867, ofFleet 1.000 (4 d)
seed 1494 JAP hero_o_i: at war alive 1095 d, in battle 111 d, share 0.101, ceiling 0.850, gone at war 0 d; ofArmy 0.119
seed 1494 USA hero_iowa: at war alive 589 d, in battle 0 d, share 0.000, ceiling 0.003, gone at war 0 d; with 0.978, ofFleet n/a (0 d)
seed 1494 USA hero_t28: at war alive 589 d, in battle 46 d, share 0.078, ceiling 0.508, gone at war 0 d; ofArmy 0.154
seed 1494 SOV hero_sovetsky_soyuz: at war alive 909 d, in battle 1 d, share 0.001, ceiling 0.013, gone at war 51 d; with 1.000, ofFleet 0.000 (1 d)
seed 1494 SOV hero_t42: at war alive 900 d, in battle 103 d, share 0.114, ceiling 0.481, gone at war 60 d; ofArmy 0.238
seed 1494 GER hero_bismarck: at war alive 800 d, in battle 10 d, share 0.013, ceiling 0.021, gone at war 196 d; with 0.874, ofFleet 0.444 (9 d)
seed 1494 GER hero_maus: at war alive 807 d, in battle 109 d, share 0.135, ceiling 0.409, gone at war 189 d; ofArmy 0.330
seed 1494 ENG hero_hood: at war alive 614 d, in battle 27 d, share 0.044, ceiling 0.085, gone at war 376 d; with 0.640, ofFleet 0.929 (14 d)
seed 1494 ENG hero_tog2: at war alive 907 d, in battle 10 d, share 0.011, ceiling 0.507, gone at war 83 d; ofArmy 0.022
seed 1494 FRA hero_richelieu: at war alive 1012 d, in battle 9 d, share 0.009, ceiling 0.015, gone at war 0 d; with 1.000, ofFleet 1.000 (6 d)
seed 1494 FRA hero_char2c: at war alive 892 d, in battle 9 d, share 0.010, ceiling 0.204, gone at war 120 d; ofArmy 0.049
seed 1494 ITA hero_roma: at war alive 582 d, in battle 15 d, share 0.026, ceiling 0.029, gone at war 444 d; with 0.524, ofFleet 1.000 (2 d)
seed 1494 ITA hero_p100: at war alive 841 d, in battle 92 d, share 0.109, ceiling 0.509, gone at war 185 d; ofArmy 0.215
seed 1495 JAP hero_yamato: at war alive 675 d, in battle 9 d, share 0.013, ceiling 0.030, gone at war 420 d; with 0.831, ofFleet n/a (0 d)
seed 1495 JAP hero_o_i: at war alive 915 d, in battle 181 d, share 0.198, ceiling 0.921, gone at war 180 d; ofArmy 0.215
seed 1495 USA hero_iowa: at war alive 787 d, in battle 21 d, share 0.027, ceiling 0.064, gone at war 120 d; with 0.914, ofFleet 1.000 (14 d)
seed 1495 USA hero_t28: at war alive 787 d, in battle 51 d, share 0.065, ceiling 0.651, gone at war 120 d; ofArmy 0.100
seed 1495 SOV hero_sovetsky_soyuz: at war alive 879 d, in battle 19 d, share 0.022, ceiling 0.028, gone at war 94 d; with 0.967, ofFleet 1.000 (7 d)
seed 1495 SOV hero_t42: at war alive 880 d, in battle 154 d, share 0.175, ceiling 0.750, gone at war 93 d; ofArmy 0.233
seed 1495 GER hero_bismarck: at war alive 416 d, in battle 11 d, share 0.026, ceiling 0.038, gone at war 180 d; with 0.697, ofFleet 0.571 (7 d)
seed 1495 GER hero_maus: at war alive 476 d, in battle 121 d, share 0.254, ceiling 0.532, gone at war 120 d; ofArmy 0.478
seed 1495 ENG hero_hood: at war alive 843 d, in battle 4 d, share 0.005, ceiling 0.058, gone at war 44 d; with 1.000, ofFleet 1.000 (3 d)
seed 1495 ENG hero_tog2: at war alive 600 d, in battle 91 d, share 0.152, ceiling 0.672, gone at war 287 d; ofArmy 0.226
seed 1495 FRA hero_richelieu: at war alive 687 d, in battle 3 d, share 0.004, ceiling 0.025, gone at war 60 d; with 0.370, ofFleet n/a (0 d)
seed 1495 FRA hero_char2c: at war alive 565 d, in battle 76 d, share 0.135, ceiling 0.481, gone at war 182 d; ofArmy 0.279
seed 1495 ITA hero_roma: at war alive 473 d, in battle 11 d, share 0.023, ceiling 0.044, gone at war 540 d; with 0.315, ofFleet 0.500 (2 d)
seed 1495 ITA hero_p100: at war alive 713 d, in battle 202 d, share 0.283, ceiling 0.506, gone at war 300 d; ofArmy 0.560
seed 1496 JAP hero_yamato: at war alive 1035 d, in battle 4 d, share 0.004, ceiling 0.020, gone at war 60 d; with 1.000, ofFleet n/a (0 d)
seed 1496 JAP hero_o_i: at war alive 675 d, in battle 67 d, share 0.099, ceiling 0.726, gone at war 420 d; ofArmy 0.137
seed 1496 USA hero_iowa: at war alive 277 d, in battle 0 d, share 0.000, ceiling 0.000, gone at war 0 d; with 1.000, ofFleet n/a (0 d)
seed 1496 USA hero_t28: at war alive 277 d, in battle 0 d, share 0.000, ceiling 0.097, gone at war 0 d; ofArmy 0.000
seed 1496 SOV hero_sovetsky_soyuz: at war alive 570 d, in battle 13 d, share 0.023, ceiling 0.030, gone at war 360 d; with 0.877, ofFleet 1.000 (5 d)
seed 1496 SOV hero_t42: at war alive 758 d, in battle 197 d, share 0.260, ceiling 0.734, gone at war 172 d; ofArmy 0.354
seed 1496 GER hero_bismarck: at war alive 786 d, in battle 5 d, share 0.006, ceiling 0.006, gone at war 240 d; with 0.190, ofFleet 1.000 (2 d)
seed 1496 GER hero_maus: at war alive 786 d, in battle 156 d, share 0.198, ceiling 0.412, gone at war 240 d; ofArmy 0.481
seed 1496 ENG hero_hood: at war alive 878 d, in battle 5 d, share 0.006, ceiling 0.018, gone at war 0 d; with 1.000, ofFleet 0.833 (6 d)
seed 1496 ENG hero_tog2: at war alive 778 d, in battle 35 d, share 0.045, ceiling 0.519, gone at war 100 d; ofArmy 0.087
seed 1496 FRA hero_richelieu: at war alive 818 d, in battle 13 d, share 0.016, ceiling 0.026, gone at war 60 d; with 0.336, ofFleet 0.900 (10 d)
seed 1496 FRA hero_char2c: at war alive 812 d, in battle 72 d, share 0.089, ceiling 0.415, gone at war 66 d; ofArmy 0.214
seed 1496 ITA hero_roma: at war alive 887 d, in battle 10 d, share 0.011, ceiling 0.017, gone at war 180 d; with 0.219, ofFleet 1.000 (6 d)
seed 1496 ITA hero_p100: at war alive 887 d, in battle 63 d, share 0.071, ceiling 0.301, gone at war 180 d; ofArmy 0.236
seed 1497 JAP hero_yamato: at war alive 975 d, in battle 5 d, share 0.005, ceiling 0.039, gone at war 120 d; with 0.717, ofFleet 0.200 (5 d)
seed 1497 JAP hero_o_i: at war alive 709 d, in battle 105 d, share 0.148, ceiling 0.704, gone at war 386 d; ofArmy 0.210
seed 1497 USA hero_iowa: at war alive 617 d, in battle 0 d, share 0.000, ceiling 0.000, gone at war 0 d; with 0.985, ofFleet n/a (0 d)
seed 1497 USA hero_t28: at war alive 617 d, in battle 5 d, share 0.008, ceiling 0.172, gone at war 0 d; ofArmy 0.047
seed 1497 SOV hero_sovetsky_soyuz: at war alive 742 d, in battle 5 d, share 0.007, ceiling 0.015, gone at war 240 d; with 0.478, ofFleet 1.000 (2 d)
seed 1497 SOV hero_t42: at war alive 982 d, in battle 150 d, share 0.153, ceiling 0.617, gone at war 0 d; ofArmy 0.248
seed 1497 GER hero_bismarck: at war alive 707 d, in battle 14 d, share 0.020, ceiling 0.030, gone at war 334 d; with 0.143, ofFleet 0.833 (6 d)
seed 1497 GER hero_maus: at war alive 932 d, in battle 155 d, share 0.166, ceiling 0.561, gone at war 109 d; ofArmy 0.296
seed 1497 ENG hero_hood: at war alive 860 d, in battle 19 d, share 0.022, ceiling 0.062, gone at war 180 d; with 0.898, ofFleet 0.895 (19 d)
seed 1497 ENG hero_tog2: at war alive 696 d, in battle 96 d, share 0.138, ceiling 0.489, gone at war 344 d; ofArmy 0.282
seed 1497 FRA hero_richelieu: at war alive 83 d, in battle 10 d, share 0.120, ceiling 0.145, gone at war 931 d; with 0.398, ofFleet 1.000 (3 d)
seed 1497 FRA hero_char2c: at war alive 656 d, in battle 35 d, share 0.053, ceiling 0.361, gone at war 358 d; ofArmy 0.148
seed 1497 ITA hero_roma: at war alive 525 d, in battle 17 d, share 0.032, ceiling 0.040, gone at war 540 d; with 0.200, ofFleet 0.875 (8 d)
seed 1497 ITA hero_p100: at war alive 1005 d, in battle 148 d, share 0.147, ceiling 0.793, gone at war 60 d; ofArmy 0.186
seed 1498 JAP hero_yamato: at war alive 1037 d, in battle 0 d, share 0.000, ceiling 0.036, gone at war 58 d; with 1.000, ofFleet n/a (0 d)
seed 1498 JAP hero_o_i: at war alive 1035 d, in battle 224 d, share 0.216, ceiling 0.646, gone at war 60 d; ofArmy 0.335
seed 1498 USA hero_iowa: at war alive 724 d, in battle 16 d, share 0.022, ceiling 0.041, gone at war 0 d; with 0.970, ofFleet 0.889 (18 d)
seed 1498 USA hero_t28: at war alive 724 d, in battle 15 d, share 0.021, ceiling 0.225, gone at war 0 d; ofArmy 0.092
seed 1498 SOV hero_sovetsky_soyuz: at war alive 609 d, in battle 39 d, share 0.064, ceiling 0.067, gone at war 231 d; with 0.787, ofFleet 1.000 (6 d)
seed 1498 SOV hero_t42: at war alive 788 d, in battle 71 d, share 0.090, ceiling 0.749, gone at war 52 d; ofArmy 0.120
seed 1498 GER hero_bismarck: at war alive 807 d, in battle 27 d, share 0.033, ceiling 0.037, gone at war 255 d; with 0.501, ofFleet 0.952 (21 d)
seed 1498 GER hero_maus: at war alive 942 d, in battle 225 d, share 0.239, ceiling 0.551, gone at war 120 d; ofArmy 0.434
seed 1498 ENG hero_hood: at war alive 937 d, in battle 12 d, share 0.013, ceiling 0.050, gone at war 44 d; with 1.000, ofFleet 1.000 (12 d)
seed 1498 ENG hero_tog2: at war alive 861 d, in battle 30 d, share 0.035, ceiling 0.274, gone at war 120 d; ofArmy 0.127
seed 1498 FRA hero_richelieu: at war alive 743 d, in battle 9 d, share 0.012, ceiling 0.022, gone at war 59 d; with 1.000, ofFleet 1.000 (9 d)
seed 1498 FRA hero_char2c: at war alive 802 d, in battle 47 d, share 0.059, ceiling 0.329, gone at war 0 d; ofArmy 0.178
seed 1498 ITA hero_roma: at war alive 942 d, in battle 26 d, share 0.028, ceiling 0.032, gone at war 120 d; with 0.432, ofFleet 0.955 (22 d)
seed 1498 ITA hero_p100: at war alive 953 d, in battle 46 d, share 0.048, ceiling 0.460, gone at war 109 d; ofArmy 0.105
seed 1499 JAP hero_yamato: at war alive 1035 d, in battle 6 d, share 0.006, ceiling 0.213, gone at war 60 d; with 0.999, ofFleet 0.023 (176 d)
seed 1499 JAP hero_o_i: at war alive 855 d, in battle 151 d, share 0.177, ceiling 0.742, gone at war 240 d; ofArmy 0.238
seed 1499 USA hero_iowa: at war alive 765 d, in battle 0 d, share 0.000, ceiling 0.000, gone at war 0 d; with 0.991, ofFleet n/a (0 d)
seed 1499 USA hero_t28: at war alive 765 d, in battle 5 d, share 0.007, ceiling 0.129, gone at war 0 d; ofArmy 0.051
seed 1499 SOV hero_sovetsky_soyuz: at war alive 570 d, in battle 176 d, share 0.309, ceiling 0.318, gone at war 378 d; with 0.496, ofFleet 1.000 (15 d)
seed 1499 SOV hero_t42: at war alive 888 d, in battle 119 d, share 0.134, ceiling 0.784, gone at war 60 d; ofArmy 0.171
seed 1499 GER hero_bismarck: at war alive 613 d, in battle 9 d, share 0.015, ceiling 0.028, gone at war 326 d; with 1.000, ofFleet 0.857 (7 d)
seed 1499 GER hero_maus: at war alive 670 d, in battle 159 d, share 0.237, ceiling 0.503, gone at war 269 d; ofArmy 0.472
seed 1499 ENG hero_hood: at war alive 784 d, in battle 37 d, share 0.047, ceiling 0.069, gone at war 240 d; with 0.348, ofFleet 0.250 (4 d)
seed 1499 ENG hero_tog2: at war alive 844 d, in battle 1 d, share 0.001, ceiling 0.293, gone at war 180 d; ofArmy 0.004
seed 1499 FRA hero_richelieu: at war alive 709 d, in battle 10 d, share 0.014, ceiling 0.017, gone at war 109 d; with 0.997, ofFleet 1.000 (9 d)
seed 1499 FRA hero_char2c: at war alive 818 d, in battle 165 d, share 0.202, ceiling 0.507, gone at war 0 d; ofArmy 0.398
seed 1499 ITA hero_roma: at war alive 779 d, in battle 13 d, share 0.017, ceiling 0.032, gone at war 238 d; with 0.448, ofFleet 0.667 (3 d)
seed 1499 ITA hero_p100: at war alive 761 d, in battle 162 d, share 0.213, ceiling 0.528, gone at war 256 d; ofArmy 0.403
seed 1500 JAP hero_yamato: at war alive 915 d, in battle 8 d, share 0.009, ceiling 0.039, gone at war 180 d; with 0.222, ofFleet 0.600 (5 d)
seed 1500 JAP hero_o_i: at war alive 1095 d, in battle 232 d, share 0.212, ceiling 0.696, gone at war 0 d; ofArmy 0.304
seed 1500 USA hero_iowa: at war alive 689 d, in battle 1 d, share 0.001, ceiling 0.033, gone at war 60 d; with 0.970, ofFleet n/a (0 d)
seed 1500 USA hero_t28: at war alive 688 d, in battle 51 d, share 0.074, ceiling 0.587, gone at war 61 d; ofArmy 0.126
seed 1500 SOV hero_sovetsky_soyuz: at war alive 731 d, in battle 19 d, share 0.026, ceiling 0.037, gone at war 239 d; with 0.287, ofFleet 1.000 (3 d)
seed 1500 SOV hero_t42: at war alive 790 d, in battle 162 d, share 0.205, ceiling 0.508, gone at war 180 d; ofArmy 0.404
seed 1500 GER hero_bismarck: at war alive 722 d, in battle 23 d, share 0.032, ceiling 0.040, gone at war 352 d; with 0.392, ofFleet 1.000 (8 d)
seed 1500 GER hero_maus: at war alive 816 d, in battle 220 d, share 0.270, ceiling 0.646, gone at war 258 d; ofArmy 0.417
seed 1500 ENG hero_hood: at war alive 784 d, in battle 11 d, share 0.014, ceiling 0.047, gone at war 240 d; with 0.952, ofFleet 0.667 (15 d)
seed 1500 ENG hero_tog2: at war alive 904 d, in battle 8 d, share 0.009, ceiling 0.438, gone at war 120 d; ofArmy 0.020
seed 1500 FRA hero_richelieu: at war alive 849 d, in battle 19 d, share 0.022, ceiling 0.037, gone at war 60 d; with 0.819, ofFleet 0.933 (15 d)
seed 1500 FRA hero_char2c: at war alive 747 d, in battle 23 d, share 0.031, ceiling 0.327, gone at war 162 d; ofArmy 0.094
seed 1500 ITA hero_roma: at war alive 774 d, in battle 9 d, share 0.012, ceiling 0.022, gone at war 288 d; with 0.806, ofFleet 0.857 (7 d)
seed 1500 ITA hero_p100: at war alive 887 d, in battle 148 d, share 0.167, ceiling 0.531, gone at war 175 d; ofArmy 0.314
```
