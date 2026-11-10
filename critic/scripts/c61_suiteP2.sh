#!/bin/sh
# Critic run 54 (full): after suiteP: the thrown-back landings at their hours, the 7019 year-20 save's probes, two 12-year watches.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5361
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 5400 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
SHOTAT=163,169,175,181,187 r c61_lhold 23105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200
until grep -q '^done:' critic/c61_seed7019_save.log 2>/dev/null; do sleep 20; done
r c61_an_ainuke 7019 critic/c61_seed7019_y20.bin 7019y20 2 400
r c61_hist 7019 critic/c61_seed7019_y20.bin
r c61_dl_export 7019 critic/c61_seed7019_y20.bin
r c61_long_watch2 24141 12 '&heroes=on' hon
r c61_long_watch2 24143 12 '' plain
echo SUITE2DONE
