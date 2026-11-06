#!/bin/sh
# Critic run 48 (full): a 12-year page watch on a new seed with heroes, then one plain.
cd /c/Git/Warism
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 5400 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c48_long_watch2 20471 12 '&heroes=on' hon
r c48_long_watch2 20473 12 '' plain
echo SUITEBDONE
