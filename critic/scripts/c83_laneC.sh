#!/bin/bash
# Critic run 83 (focused), lane C: monkeys, resizes and a look at every tier on new seeds on HEAD (5407), and run 82's kept
# page cases (the ring over "Pari", the AI's bomb, like flags at sea).
export BASE=http://127.0.0.1:5407
. /c/Git/Warism/critic/scripts/c81_r.sh
export TAGL=c83_
r resize 83821 60
TO=600 r monkey 83811 240 390 844 touch
TO=600 r monkey 83815 240 844 390 touch
TO=600 r monkey 83817 180 360 640 touch
TO=600 r monkey 83813 150 1366 768
r look 83905 1600 900 45,400
r look 83907 375 667 60,240 phone
r look 83909 667 375 120 phone
r a_god_nuke 64917
r seaclick 64913
r an_ainuke 64511 critic/c79_seed64511_y13.bin 64511y13 2 400
echo done > critic/c83_laneC.done
