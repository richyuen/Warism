#!/bin/bash
# Critic run 87: the page-error monkeys (every run, ADR-1138), new seeds, four sizes, desk and touch; heroes on.
. /c/Git/Warism/critic/scripts/c87_r.sh
export EXTRA='&heroes=on'
TO=600 r monkey 87803 300
TO=600 r monkey 87811 300 390 844 touch
TO=600 r monkey 87813 240 760 800
TO=600 r monkey 87815 180 844 390 touch
echo done > /c/Git/Warism/critic/c87_laneM.done
