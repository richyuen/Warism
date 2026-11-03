#!/bin/sh
# Critic run 30 (focused): run 29's heroes page probes re-run on HEAD (5299), one browser at a time.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1800 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c30_hc_herocounters 5521 0 1600 900 desk
r c30_hc_herocounters 5521 0 390 844 phone
r c30_hcc_heroclick 5521
r c30_ht_herotitle 5521 1600 900 desk
r c30_ht_herotitle 5521 390 844 phone
r c30_hw_herowound 4111 2454 1 bismarck bis
r c30_hw_herowound 4111 2050 20 tog tog
r c30_hd_heroloss 4111 1 Bismarck 2485 3925 bis
r c30_hn_heroannex 4111
r c30_hsl_saveload 4111 2500 1500 1
r c30_rg_relations 4111 365 1600 900 desk '&heroes=on'
r c30_rg_relations 4111 365 390 844 phone '&heroes=on'
r c30_hv_heroview 3739
r c30_hs_herostack 3739
r c30_p3_widths
echo HEROPAGEDONE
