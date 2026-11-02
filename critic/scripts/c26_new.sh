#!/bin/sh
# Critic run 25: run 24's new probes re-run on HEAD (5297), then PF alone.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1800 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=' '____').log 2>&1; echo "   exit $?"; }
until grep -q MISCDONE critic/c26_misc.log; do sleep 15; done
r c26_dr_diplo 8821
r c26_gu_guarantee 3739
r c26_cb_balls 7019
r c26_cb2_helmet 7019 10 GER POL
r c26_pl_planes 7019 GER POL 5297
r c26_fo_follow 7019
r c26_hv_heroview 3739
r c26_hs_herostack 3739
echo NEWDONE
