#!/bin/sh
# Critic run 23: run 22's probes re-run on HEAD (port 5297).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /' '__').log 2>&1; echo "   exit $?"; }
r c26_u_ui 5557 1600 900
r c26_w_wing 5557
r c26_p_phone
r c26_p2_phone_menu
r c26_p3_widths
r c26_os_scen
r c26_pt_touch
r c26_ph_phone2
r c26_tg_tags 7019
echo SUITE2DONE
