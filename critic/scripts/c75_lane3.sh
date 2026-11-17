#!/bin/sh
# Critic run 75 (full), the third page lane: the run's own new probes, one at a time on HEAD's build (5377).
cd /c/Git/Warism
export BASE=http://127.0.0.1:5377
t() { log=$1; shift; echo "== $log $(date +%T)"; timeout 1500 "$@" > critic/$log 2>&1; echo "   exit $?"; }
t c75_monkey_58803.log node critic/scripts/c75_monkey.mjs 58803 300
t c75_monkey_58805_phone.log node critic/scripts/c75_monkey.mjs 58805 300 390 844 touch
t c75_monkey_58807.log node critic/scripts/c75_monkey.mjs 58807 300 1280 720
t c75_monkey_58809_land.log node critic/scripts/c75_monkey.mjs 58809 240 844 390 touch
t c75_mo_57619.log node critic/scripts/c75_massOff.mjs 57619 384 Hungary
echo LANE3DONE
