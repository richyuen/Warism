#!/bin/sh
# Critic run 43 (full): run 39's page probes on new seeds, lane 1.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c43_z_zoom 17101
r c43_c_battle 17203
r c43_c_battle 17307
r c43_w_wing 17411
r c43_a_god_nuke 17101
r c43_q_god_tools 17203
r c43_k_breakthrough 17307
r c43_phz 17411 40
r c43_sk_stacks 17513 20 60 17513
echo SUITEF1DONE
