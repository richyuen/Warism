#!/bin/sh
# Critic run 23: run 22's probes re-run on HEAD (port 5299).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /' '__').log 2>&1; echo "   exit $?"; }
r c31_q_god_tools 6421
r c31_k_breakthrough 2203
r c31_play 6011
r c31_g_editor 4877
r c31_fight 5381 21
r c31_fp2_fight 4877
OUT=c31_os_c10fmt1.json TAG=c10fmt1 r c31_oldsave critic/c10_seed4877_y20.bin 4877 1
r c31_a_god_nuke 4219
r c31_z_zoom 5861
r c31_c_battle 7019
r c31_ww_watch 3301
while [ ! -f critic/c31_headless_7019.json ]; do sleep 20; done
r c31_dl_export 7019 critic/c31_seed7019_y20.bin
r c31_hist 7019 critic/c31_seed7019_y20.bin
echo SUITE1DONE
