#!/bin/sh
# Critic run 31: after the headless queues and the extra page probes: PHZ again (ERR_NO_BUFFER_SPACE under load), an
# older build's save (run 29, 823cbf1b) loaded on HEAD with its History, and one ten-year page watch with nothing
# else running (6151, heroes off) against the loaded one.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c31_phz 2671 40
r c31_hist2 7019 critic/c29_seed7019_y20.bin c29save
r c31_long_watch2 6151 10 '' quiet
echo FINALDONE
