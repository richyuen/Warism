#!/bin/sh
# Critic run 61 (full): the year-20 saves (AI nukes, History, CSV) and two 12-year watches at Max, beside suite B.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5361
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c61_an_ainuke 7019 critic/c61_seed7019_y20.bin 7019y20 2 400
r c61_an_ainuke 32019 critic/c61_seed32019_y20.bin 32019y20 2 400
r c61_hist 7019 critic/c61_seed7019_y20.bin
r c61_hist 32019 critic/c61_seed32019_y20.bin
r c61_dl_export 32019 critic/c61_seed32019_y20.bin
r c61_long_watch2 32141 12 '&heroes=on' hon
r c61_long_watch2 32143 12 '' plain
echo SUITECDONE
