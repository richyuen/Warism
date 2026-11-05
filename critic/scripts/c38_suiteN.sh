#!/bin/sh
# Critic run 38 (copy of run 37) (full): fresh seeds for the page dimensions (zoom, battle, wing, God, stacks, relations, phone zoom).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c38_z_zoom 11003
r c38_c_battle 11071
r c38_c_battle 11287
r c38_w_wing 11149
r c38_a_god_nuke 11213
r c38_q_god_tools 11287
r c38_k_breakthrough 11003
r c38_phz 11071 40
r c38_sk_stacks 11149 20 60 11149
r c38_rg_relations 11213 365 1600 900 desk '&heroes=on'
r c38_pl_planes 11071 GER POL 5299
echo SUITENDONE
