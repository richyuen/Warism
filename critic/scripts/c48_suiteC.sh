#!/bin/sh
# Critic run 48 (full): the late-world page probes on HEAD's own 7019 year-20 save (made this run).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c48_an_ainuke 7019 critic/c48_seed7019_y20.bin 7019y20 2 400
r c48_hist 7019 critic/c48_seed7019_y20.bin
r c48_dl_export 7019 critic/c48_seed7019_y20.bin
echo SUITECDONE
