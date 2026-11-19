#!/bin/bash
# Critic run 84 (focused), lane C: monkeys, a resize and a look at every tier on new seeds on HEAD (5409), and run 83's kept
# cases (a_god_nuke 64917, seaclick 64913, an_ainuke 64511).
export BASE=http://127.0.0.1:5409
. /c/Git/Warism/critic/scripts/c81_r.sh
export TAGL=c84_
r resize 84821 60
TO=600 r monkey 84811 240 390 844 touch
TO=600 r monkey 84815 240 844 390 touch
TO=600 r monkey 84817 180 360 640 touch
TO=600 r monkey 84813 150 1366 768
r look 84905 1600 900 45,400
r look 84907 375 667 60,240 phone
r look 84909 667 375 120 phone
r a_god_nuke 64917
r seaclick 64913
r an_ainuke 64511 critic/c79_seed64511_y13.bin 64511y13 2 400
echo done > critic/c84_laneC.done
