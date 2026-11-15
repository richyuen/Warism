#!/bin/sh
# Critic run 71: the second page set after c72_pages.sh: the war score read after Take control (R85b), then Malta's 18 (run 59's, due).
cd /c/Git/Warism
until grep -q PAGESDONE critic/c72_pages.log; do sleep 15; done
export BASE=http://127.0.0.1:5372
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 2400 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,:@' '_______' | cut -c1-60).log 2>&1; echo "   exit $?"; }
r c72_takescore 1943 JAP 90
r c72_takescore 1942 GER 60 390 844
echo "== malta $(date +%T)"; P=3 sh critic/scripts/c72_malta.sh > critic/c72_malta.log 2>&1
echo PAGES2DONE
