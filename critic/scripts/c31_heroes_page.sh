#!/bin/sh
# Critic run 31 (focused): run 29's heroes page probes re-run on HEAD (5299), one browser at a time.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1800 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c31_hc_herocounters 5521 0 1600 900 desk
r c31_hc_herocounters 5521 0 390 844 phone
r c31_hcc_heroclick 5521
r c31_ht_herotitle 5521 1600 900 desk
r c31_ht_herotitle 5521 390 844 phone
r c31_hw_herowound 4111 2454 1 bismarck bis
r c31_hw_herowound 4111 2050 20 tog tog
r c31_hd_heroloss 4111 1 Bismarck 2485 3925 bis
r c31_hn_heroannex 4111
r c31_hsl_saveload 4111 2500 1500 1
r c31_rg_relations 4111 365 1600 900 desk '&heroes=on'
r c31_rg_relations 4111 365 390 844 phone '&heroes=on'
r c31_hv_heroview 3739
r c31_hs_herostack 3739
r c31_p3_widths
echo HEROPAGEDONE
