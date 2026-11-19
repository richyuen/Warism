#!/bin/bash
# Critic run 82 (focused), lane D: run 81's kept named page cases on HEAD (5405) (the ring over "Pari", the AI's bomb on
# 64511 at 600 m/px, like flags at sea), and a look at every tier on a new seed at desk and phone sizes (mapVisuals afresh).
export BASE=http://127.0.0.1:5405
. /c/Git/Warism/critic/scripts/c81_r.sh
export TAGL=c82_
r a_god_nuke 64917
r seaclick 64913
r an_ainuke 64511 critic/c79_seed64511_y13.bin 64511y13 2 400
r look 82905 1600 900 45,400
r look 82907 390 844 60,240 phone
r look 82909 844 390 120 phone
echo done > critic/c82_laneD.done
