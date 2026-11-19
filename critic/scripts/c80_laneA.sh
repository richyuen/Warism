#!/bin/bash
# Critic run 80 (full), lane A: Batch 47's own cases (R168 banner names, R169 bufferSubData, R170 History on a phone,
# R171 pact rows, R172 death sentence said short, R173 menu and pinch), run 79's named UI and stats cases, new seeds
# 689xx. HEAD's build on 5401; run 79's build (c79_dist) on 5402.
. /c/Git/Warism/critic/scripts/c80_r.sh
O=http://127.0.0.1:5402
# R169: run 79's spot, both builds; then 1600 x 900.
r glSpot 64907 2560 1440 500 1043.43 273.0
BASE=$O TAGL=c79build_ r glSpot 64907 2560 1440 500 1043.43 273.0
r glSpot 64907 1600 900 500 1043.43 273.0
# R170: run 79's phone History act, both builds.
r dirHand 59955 120 390 844 touch
BASE=$O TAGL=c79build_ r dirHand 59955 120 390 844 touch
r dirHand 59955 120
r dirHand 68955 120 390 844 touch
# R172: opened banners on a phone, run 79's case and new seeds; run 79's build beside it.
r phoneTicker 64903 200
BASE=$O TAGL=c79build_ r phoneTicker 64903 200
r phoneTicker 68903 200
for wh in "390 844" "844 390" "1400 800"; do r deathTitle 7019 400 $wh; done
BASE=$O TAGL=c79build_ r deathTitle 7019 400 390 844
r deathTitle 68905 500 390 844
# R171: track rows on the page.
ROWS=alliance,Vienna,Tripartite r trackRows 1940 365
ROWS=alliance r trackRows 1941 365
ROWS=alliance r trackRows 1949 365
# R168: run 79's random world.
r rw2 64965 730
r rw2 68965 730
# R173 on more sizes.
for wh in "390 844" "844 390" "1024 768"; do echo "== menuPinch $wh"; set -- $wh; timeout 600 node critic/scripts/c80_menuPinch.mjs 68933 $1 $2 > critic/c80_menuPinch_68933_$1x$2.log 2>&1; echo "   exit $?"; done
# Run 79's other UI cases.
r tlDead critic/c76_seed7019_y20.bin 1600 900
r tlDead critic/c76_seed7019_y20.bin 390 844
r bannerRank 57901 150
r bannerRank 68901 150
for c in "57901 150" "58901 200" "57903 120" "68903 150"; do r bannerFlip $c head 60; done
r bannerHourly 57901 100 480
for f in 90 150; do LOAD=1 TAGL=load_ r bannerLoad 68901 $f; r bannerLoad 68901 $f; done
r dirHand 68955 120
r timeLapse 68941 400 head
r timeLapse 68945 400 head 390 844
r tlMonths 68947
r histPlace 68961 300
r tlMore cell 68943 400
r p_phone
r bannerOwn 1942 GER Germany 150
waitfile critic/c80_seed32019_save.log
TAG=_32019 r tlDead critic/c80_seed32019_y20.bin 1600 900
echo done > critic/c80_laneA.done
