#!/bin/bash
# Critic run 85, completion: lane E from its 6th case on (the 6th, dirHand 59955 at 390 x 844, was stopped mid-run),
# on bd85eb10 (critic/c85b_dist, 5411). Then the three seen-fixed cases of R85-N1 and R85-N2 (c85_laneG.sh).
. /c/Git/Warism/critic/scripts/c85_r.sh
r dirHand 59955 120 390 844 touch
r dirHand 68957 200 390 844 touch
r dirHand 85955 120 390 844 touch
r phoneTicker 64903 200
r phoneTicker 85903 200
for wh in "390 844" "844 390" "1400 800"; do r deathTitle 7019 400 $wh; done
r deathTitle 85905 500 390 844
ROWS=alliance,Vienna,Tripartite r trackRows 1940 365
ROWS=alliance r trackRows 1941 365
ROWS=alliance r trackRows 1949 365
r rw2 64965 730
r rw2 85965 730
r tlDead critic/c76_seed7019_y20.bin 1600 900
r tlDead critic/c76_seed7019_y20.bin 390 844
r bannerRank 57901 150
r bannerRank 85901 150
for c in "57901 150" "58901 200" "57903 120" "85903 150"; do r bannerFlip $c head 60; done
r bannerHourly 57901 100 480
for f in 90 150; do LOAD=1 TAGL=load_ r bannerLoad 85901 $f; r bannerLoad 85901 $f; done
r dirHand 85955 120
r timeLapse 85941 400 head
r timeLapse 85945 400 head 390 844
r tlMonths 85947
r histPlace 85961 300
r tlMore cell 85943 400
r p_phone
r bannerOwn 1942 GER Germany 150
waitfile critic/c85_seed32019_save.log
TAG=_32019 r tlDead critic/c85_seed32019_y20.bin 1600 900
echo done > critic/c85_laneE2.done
