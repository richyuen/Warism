#!/bin/sh
# Critic run 32: run 31's named page cases on HEAD, then new seeds.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c45_hf_herofold 5521 0 0 1600 900 desk
r c45_hf_herofold 5521 0 0 390 844 phone
r c45_hf_herofold 7019 730 0 1600 900 desk
r c45_hft_foldtouch 5521
r c45_rgt_tap 4111 365
r c45_hs_herostack 3739
r c45_ht_herotitle 5521 390 844 phone
r c45_hwp_waitport 4637 132000 19 fra
r c45_df_default 7019 POL -800 220 pol
r c45_a_god_nuke 4219
r c45_q_god_tools 6421
r c45_k_breakthrough 2203
r c45_k2_refusal 2203
r c45_k3_godtab 2203
r c45_z_zoom 3517
r c45_c_battle 6421
r c45_c_battle 7019
r c45_phz 2671 40
r c45_hist2 7019 critic/c32_seed7019_y20.bin c32save
r c45_an_ainuke 6299 critic/c32_seed6299_y18.bin 6299y18c32 3 400
echo SUITEADONE
