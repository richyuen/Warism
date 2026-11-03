#!/bin/sh
# Critic run 31: after the heroes page suite: the new probes (HF, RGZ), then run 29's page suites and tail, one browser at a time.
cd /c/Git/Warism
until grep -q HEROPAGEDONE critic/c31_heroes_page.log; do sleep 10; done
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1800 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c31_hf_herofold 5521 0 0 1600 900 desk
r c31_hf_herofold 5521 0 0 390 844 phone
r c31_hf_herofold 5521 0 9000 1600 900 desk
r c31_hf_herofold 4111 365 0 1600 900 desk
r c31_hf_herofold 7019 730 0 1600 900 desk
r c31_rgz_zoom 4111 365
echo NEWPAGEDONE
sh critic/scripts/c31_pagesuites.sh
sh critic/scripts/c31_tail2.sh > critic/c31_tail2.log 2>&1
echo AFTERDONE
