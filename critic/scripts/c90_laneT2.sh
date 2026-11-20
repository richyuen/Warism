#!/bin/bash
# Critic run 90, lane T's last two cases (the lane stopped on a wrong file name, fixed in c90_laneT.sh): the AI's nukes on
# the page on this run's 13-year save of 90511 and run 79's of 64511.
. /c/Git/Warism/critic/scripts/c90_r.sh
rp() { EXTRA_SAVE=$EXTRA; export EXTRA=; r "$@"; export EXTRA=$EXTRA_SAVE; }
export VW=2560 VH=1305
rp an_ainuke 90511 critic/c90_seed90511_y13.bin 90511y13 2 400
rp an_ainuke 64511 critic/c79_seed64511_y13.bin 64511y13 2 400
echo done > /c/Git/Warism/critic/c90_laneT.done
