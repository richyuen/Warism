#!/bin/sh
# Critic run 43 (full): late-game probes on HEAD's own 20-year saves.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c44_an_ainuke 18003 critic/c44_seed18003_y20.bin 18003y20 3 400
r c44_hist 18003 critic/c44_seed18003_y20.bin
r c44_dl_export 18003 critic/c44_seed18003_y20.bin
r c44_an_ainuke 7019 critic/c44_seed7019_y20.bin 7019y20 3 400
echo SUITEF3DONE
