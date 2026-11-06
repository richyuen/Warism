#!/bin/sh
# Critic run 43 (full): late-game probes on HEAD's own 20-year saves.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c45_an_ainuke 18003 critic/c45_seed18003_y20.bin 18003y20 3 400
r c45_hist 18003 critic/c45_seed18003_y20.bin
r c45_dl_export 18003 critic/c45_seed18003_y20.bin
r c45_an_ainuke 7019 critic/c45_seed7019_y20.bin 7019y20 3 400
echo SUITEF3DONE
