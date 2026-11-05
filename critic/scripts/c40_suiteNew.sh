#!/bin/sh
# Critic run 39 (full): the page probes on new seeds (13xxx), not compared.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c40_z_zoom 13109
r c40_c_battle 13313
r c40_c_battle 13519
r c40_w_wing 13417
r c40_a_god_nuke 13007
r c40_q_god_tools 13211
r c40_k_breakthrough 13109
r c40_phz 13109 40
r c40_sk_stacks 13313 20 60 13313
r c40_rg_relations 13109 365 1600 900 desk '&heroes=on'
r c40_pl_planes 13417 GER POL 5299
r c40_hf_herofold 13007 730 0 1600 900 desk
r c40_an_ainuke 13007 critic/c39_seed13007_y18.bin 13007y18 3 400
r c40_hist 13007 critic/c39_seed13007_y18.bin
r c40_dl_export 13007 critic/c39_seed13007_y18.bin
echo SUITENEWDONE
