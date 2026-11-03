#!/bin/sh
# Critic run 25: run 24's new probes re-run on HEAD (5299), then PF alone.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1800 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=' '____').log 2>&1; echo "   exit $?"; }
until grep -q MISCDONE critic/c29_misc.log; do sleep 15; done
r c29_dr_diplo 8821
r c29_gu_guarantee 3739
r c29_cb_balls 7019
r c29_cb2_helmet 7019 10 GER POL
r c29_pl_planes 7019 GER POL 5299
r c29_fo_follow 7019
r c29_hv_heroview 3739
r c29_hs_herostack 3739
echo NEWDONE
