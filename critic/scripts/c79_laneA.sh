#!/bin/bash
# Critic run 79 (full), lane A: the batch's own changes (R164 track rows, R165 time-lapse tooltip, R166 banner heights),
# run 78's named UI and stats cases, and new seeds 649xx. HEAD's build on 5391; run 78's build (c78_dist) on 5392.
. /c/Git/Warism/critic/scripts/c79_r.sh
T=critic/c76_seed7019_y20.bin
# R165: the time-lapse tooltip at step 0, a middle month and the last, desk and phone; run 78's build beside it.
r tlDead $T 1600 900
STEP=mid TAGL=mid_ r tlDead $T 1600 900
STEP=last TAGL=last_ r tlDead $T 1600 900
r tlDead $T 390 844
STEP=mid TAGL=mid_ r tlDead $T 390 844
BASE=http://127.0.0.1:5392 TAG=_c78build TAGL=c78build_ r tlDead $T 1600 900
BASE=http://127.0.0.1:5392 STEP=mid TAG=_c78build TAGL=c78buildmid_ r tlDead $T 1600 900
# R166: opened banners at six sizes on run 78's case, a new seed; run 78's build at 1400 x 800.
for wh in "1400 800" "1600 900" "1024 768" "1920 1080" "390 844" "844 390"; do r deathTitle 7019 400 $wh; done
BASE=http://127.0.0.1:5392 TAG=_c78build TAGL=c78build_ r deathTitle 7019 400 1400 800
r deathTitle 64901 300 1400 800
r deathTitle 64905 500 1600 900
# R164: track rows on the page.
ROWS=Rome,alliance r trackRows 1943 600
ROWS=alliance,Vienna r trackRows 1940 365
ROWS=alliance r trackRows 1941 365
ROWS=Uranus,alliance r trackRows 1942 400
ROWS=alliance r trackRows 1939 365
ROWS=alliance r trackRows 1944 365
# Run 78's banner cases and new seeds.
r bannerRank 57901 150
r bannerRank 64901 150
for c in "57901 150" "58901 200" "57903 120" "64903 150"; do r bannerFlip $c head 60; done
r bannerHourly 57901 100 480
for f in 90 120 150; do LOAD=1 TAGL=load_ r bannerLoad 64901 $f; r bannerLoad 64901 $f; done
# Run 78's other UI cases.
r dirHand 59955 120
r dirHand 59955 120 390 844 touch
r dirHand 64955 120
r timeLapse 64941 400 head
r timeLapse 64945 400 head 390 844
r tlMonths 64947
r histPlace 64961 300
r tlMore cell 64943 400
r phoneTicker 64903 200
r p_phone
r bannerOwn 1942 GER Germany 150
waitfile critic/c79_seed32019_save.log
TAG=_32019 r tlDead critic/c79_seed32019_y20.bin 1600 900
TAG=_32019 STEP=mid TAGL=mid_ r tlDead critic/c79_seed32019_y20.bin 1600 900
echo done > critic/c79_laneA.done
