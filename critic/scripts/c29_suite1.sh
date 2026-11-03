#!/bin/sh
# Critic run 23: run 22's probes re-run on HEAD (port 5299).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /' '__').log 2>&1; echo "   exit $?"; }
r c29_q_god_tools 6421
r c29_k_breakthrough 2203
r c29_play 6011
r c29_g_editor 4877
r c29_fight 5381 21
r c29_fp2_fight 4877
OUT=c29_os_c10fmt1.json TAG=c10fmt1 r c29_oldsave critic/c10_seed4877_y20.bin 4877 1
r c29_a_god_nuke 4219
r c29_z_zoom 5861
r c29_c_battle 7019
r c29_ww_watch 3301
while [ ! -f critic/c29_headless_7019.json ]; do sleep 20; done
r c29_dl_export 7019 critic/c29_seed7019_y20.bin
r c29_hist 7019 critic/c29_seed7019_y20.bin
echo SUITE1DONE
