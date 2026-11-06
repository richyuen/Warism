#!/bin/sh
# Critic run 49 (focused): page probes, one at a time, on the c49 build at 5299.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c49_lost 3517 desk
r c49_lost 3517 phone 390 844
r c49_lost 3517 land 844 390
export N=6; r c49_lost 3517 desk6; unset N
r c49_rise_page
r c49_hero 20471 17520 desk
r c49_hero 20471 17520 phone 390 844
r c49_hero 20651 26280 desk
r c49_z_zoom 20653
r c49_seaclick 20655
r c49_seaclick 20657
r c49_rg_relations 20659 365 1600 900 desk '&diplo=random'
r c49_u_ui
r c49_p_phone
echo SUITEPDONE
