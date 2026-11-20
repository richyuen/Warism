#!/bin/bash
# Critic run 91 (copy of run 90's) (copy of run 89's) (copy of run 88's lane): run 86's lane E2 cases (statsHistory, the war row over time) on HEAD (5491), the same seeds, and the three
# lane G cases lane B left out (crossWidth steps, moreClick 84901 x2, phoneToDesk 83901).
. /c/Git/Warism/critic/scripts/c91_r.sh
p cw c84_crossWidth 84901 400 steps
for wh in "620 900" "640 800"; do set -- $wh; p mc c81_moreClick 84901 400 $1 $2; done
p pd c83_phoneToDesk 83901 400 384x832,1366x768,1024x768,384x832
r dirHand 59955 120 390 844 touch
r dirHand 85955 120
r phoneTicker 64903 200
for wh in "390 844" "1400 800"; do r deathTitle 7019 400 $wh; done
ROWS=alliance,Vienna,Tripartite r trackRows 1940 365
r rw2 64965 730
r tlDead critic/c76_seed7019_y20.bin 1600 900
r tlDead critic/c76_seed7019_y20.bin 390 844
r bannerRank 57901 150
for c in "57901 150" "58901 200" "57903 120"; do r bannerFlip $c head 60; done
r bannerHourly 57901 100 480
for f in 90 150; do LOAD=1 TAGL=load_ r bannerLoad 85901 $f; r bannerLoad 85901 $f; done
r tlMore cell 85943 400
r p_phone
r bannerOwn 1942 GER Germany 150
for c in "56901 400" "57905 200" "85905 300"; do r heroPop $c head; done
r dirHand 68957 120 390 844 touch
r phoneTicker 85903 200
r deathTitle 7019 400 844 390
r deathTitle 85905 400
r bannerRank 85901 150
r bannerFlip 85903 150 head 60
echo done > /c/Git/Warism/critic/c91_laneE.done
