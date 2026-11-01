#!/bin/sh
# Critic run 21: run 20's UI probes behind its non-blocking list, re-run on HEAD (port 5299).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /' '__').log 2>&1; echo "   exit $?"; }
r c22_u_ui 5557 1600 900
r c22_w_wing 5557
r c22_p_phone
r c22_p2_phone_menu
r c22_p3_widths
r c22_os_scen
r c22_pt_touch
r c22_ph_phone2
r c22_tg_tags 7019
echo SUITE2DONE
