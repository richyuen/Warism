#!/bin/sh
# Critic run 51 (full): after suiteP: the 7019 year-20 save's probes, the sea balls at R46's camera, two 12-year watches.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5321
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 5400 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
until grep -q '^done:' critic/c51_seed7019_save.log 2>/dev/null; do sleep 20; done
r c51_an_ainuke 7019 critic/c51_seed7019_y20.bin 7019y20 2 400
r c51_hist 7019 critic/c51_seed7019_y20.bin
r c51_dl_export 7019 critic/c51_seed7019_y20.bin
r c51_long_watch2 21141 12 '&heroes=on' hon
r c51_long_watch2 21143 12 '' plain
echo SUITE2DONE
