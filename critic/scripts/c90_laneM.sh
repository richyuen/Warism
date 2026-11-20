#!/bin/bash
# Critic run 90 (copy of run 89's) (copy of run 88's lane): the page-error monkeys (every run, ADR-1138), new seeds, at the five supported sizes (ADR-1141): the
# 1440p desk's window, and the iPhone 16 upright and sideways with and without Safari's bars (touch, pixel ratio 3:
# c88_monkey reads DPR). Heroes on. Two at a time.
. /c/Git/Warism/critic/scripts/c90_r.sh
export EXTRA='&heroes=on' DPR=3
(TO=600 r monkey 90803 240 2560 1305; TO=600 r monkey 90811 200 393 852 touch; TO=600 r monkey 90817 180 734 343 touch) &
(TO=600 r monkey 90813 200 393 659 touch; TO=600 r monkey 90815 200 852 393 touch) &
wait
echo done > /c/Git/Warism/critic/c90_laneM.done
