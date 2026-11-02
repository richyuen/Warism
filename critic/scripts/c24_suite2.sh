#!/bin/sh
# Critic run 23: run 22's probes re-run on HEAD (port 5299).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /' '__').log 2>&1; echo "   exit $?"; }
r c24_u_ui 5557 1600 900
r c24_w_wing 5557
r c24_p_phone
r c24_p2_phone_menu
r c24_p3_widths
r c24_os_scen
r c24_pt_touch
r c24_ph_phone2
r c24_tg_tags 7019
echo SUITE2DONE
