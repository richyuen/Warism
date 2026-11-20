#!/bin/bash
# Critic run 91, lane R: the probes my driver's fault cut short (c91_laneS.sh and c91_lanes.sh are one file on Windows: the
# "stability lane" ran the driver again at 12:58, which re-ran lanes M, C, V and D over their own logs until stopped at
# 13:03): re-run each probe that was cut (its log overwritten mid-run). The other probes of those lanes had finished both
# times, their logs whole (the .out files of M, C, V, D hold only the second start).
. /c/Git/Warism/critic/scripts/c91_r.sh
export DPR=3 EXTRA='&heroes=on'
(TO=600 r monkey 91803 240 2560 1305) &
(TO=600 r monkey 91813 200 393 659 touch) &
wait
unset DPR EXTRA
export VW=2560 VH=1305
r fw2_forcewar 91935
unset VW VH
r timeLapse 91941 400 head 2560 1305
EXTRA='&heroes=on' r look 91901 2560 1305 45,180,400
echo done > /c/Git/Warism/critic/c91_laneR.done
