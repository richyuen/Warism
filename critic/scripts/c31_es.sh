#!/bin/sh
# Critic run 26: run 25's ES and ES2 (R25-B1) re-run on HEAD (5299).
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 1800 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=' '____').log 2>&1; echo "   exit $?"; }
r c31_es2_exit 7019 5299 head 10
r c31_es_escape 7019 5299 head
r c31_es2_exit 2531 5299 head 10
r c31_es2_exit 8467 5299 head 10
echo ESDONE
