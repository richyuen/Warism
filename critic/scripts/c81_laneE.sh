#!/bin/bash
# Critic run 81 (full), lane E: run 80's other UI cases (tlDead, banner order and hold, time-lapse, History's place) on
# new seeds 69xxx, and run 80's left-out fix-ups (h_interv, heroes-on a_god_nuke 64917 and seaclick 64913, dirHand at
# 844 x 390, phoneTicker 64903 and deathTitle 7019 on HEAD), R170/R172 off their cases. HEAD's build on 5403.
. /c/Git/Warism/critic/scripts/c81_r.sh
r h_interv 1600 900
r h_interv 390 844
export EXTRA='&heroes=on'
TAGL=heroes_ r a_god_nuke 64917
TAGL=heroes_ r seaclick 64913
export EXTRA=
r dirHand 59955 120 844 390 touch
r dirHand 59955 120 390 844 touch
r dirHand 68957 200 390 844 touch
r dirHand 69955 120 390 844 touch
r phoneTicker 64903 200
r phoneTicker 69903 200
for wh in "390 844" "844 390" "1400 800"; do r deathTitle 7019 400 $wh; done
r deathTitle 69905 500 390 844
ROWS=alliance,Vienna,Tripartite r trackRows 1940 365
ROWS=alliance r trackRows 1941 365
ROWS=alliance r trackRows 1949 365
r rw2 64965 730
r rw2 69965 730
r tlDead critic/c76_seed7019_y20.bin 1600 900
r tlDead critic/c76_seed7019_y20.bin 390 844
r bannerRank 57901 150
r bannerRank 69901 150
for c in "57901 150" "58901 200" "57903 120" "69903 150"; do r bannerFlip $c head 60; done
r bannerHourly 57901 100 480
for f in 90 150; do LOAD=1 TAGL=load_ r bannerLoad 69901 $f; r bannerLoad 69901 $f; done
r dirHand 69955 120
r timeLapse 69941 400 head
r timeLapse 69945 400 head 390 844
r tlMonths 69947
r histPlace 69961 300
r tlMore cell 69943 400
r p_phone
r bannerOwn 1942 GER Germany 150
waitfile critic/c81_seed32019_save.log
TAG=_32019 r tlDead critic/c81_seed32019_y20.bin 1600 900
echo done > critic/c81_laneE.done
