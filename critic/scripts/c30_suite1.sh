#!/bin/sh
# Critic run 23: run 22's probes re-run on HEAD (port 5299).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1500 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /' '__').log 2>&1; echo "   exit $?"; }
r c30_q_god_tools 6421
r c30_k_breakthrough 2203
r c30_play 6011
r c30_g_editor 4877
r c30_fight 5381 21
r c30_fp2_fight 4877
OUT=c30_os_c10fmt1.json TAG=c10fmt1 r c30_oldsave critic/c10_seed4877_y20.bin 4877 1
r c30_a_god_nuke 4219
r c30_z_zoom 5861
r c30_c_battle 7019
r c30_ww_watch 3301
while [ ! -f critic/c30_headless_7019.json ]; do sleep 20; done
r c30_dl_export 7019 critic/c30_seed7019_y20.bin
r c30_hist 7019 critic/c30_seed7019_y20.bin
echo SUITE1DONE
