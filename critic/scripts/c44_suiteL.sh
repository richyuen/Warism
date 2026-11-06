#!/bin/sh
# Critic run 34: run 33's landing page cases (LP, NR, SHM) on HEAD.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c44_nr_neutralrow 3517 ENG 1023.5 275.5 1034.5 279.5 1600 900 desk eng_calais_desk
r c44_nr_neutralrow 3517 ENG 1023.5 275.5 1034.5 279.5 390 844 phone eng_calais_phone
r c44_nr_neutralrow 3517 JAP 1818.5 385.5 1715.5 413.5 1600 900 desk jap_shanghai_desk
r c44_nr_neutralrow 3517 SWE 1126.5 212.5 1095.5 242.5 1600 900 desk swe_cph_desk
r c44_shm_mass 3517 10 1600 900 ten
sh critic/scripts/c44_lpq.sh
echo SUITELDONE
