#!/bin/sh
# Critic run 49 (focused): R40c page probes again (the first pass failed on a script bug: NDIV in page.evaluate).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 3600 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c49_lost 3517 desk
r c49_lost 3517 phone 390 844
r c49_lost 3517 land 844 390
export N=6; r c49_lost 3517 desk6; unset N
echo SUITEP2DONE
