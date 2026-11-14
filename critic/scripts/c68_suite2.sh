#!/bin/sh
# Critic run 64 (focused), second page suite: run 63's remaining named page cases (the track's h_next Greece, pause
# blanks, God acts, seed URLs; closeblock at its other sizes) and History on the year-20 save of 32019 (the changed
# historyRows.ts on a plain world). The c63 save is used: the sim is unchanged and c68_jobsNamed re-makes it.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5368
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1800 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c68_hist 32019 critic/c68_seed32019_y20.bin
r c68_dl_export 32019 critic/c68_seed32019_y20.bin
r c68_hist 7019 critic/c68_seed7019_y20.bin
r c68_h_next 1030 96 greece
r c68_h_pauseblank
r c68_h_god
r c68_h_seed
for wh in "932 430" "1024 500" "667 375"; do r c68_x_closeblock 21103 $wh; done
echo SUITE2DONE
