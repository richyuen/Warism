#!/bin/sh
# Critic run 75 (full), the fifth page lane: the phone monkeys again (the first two left the game by its menu button
# within a minute: now left alone), after lane 4.
cd /c/Git/Warism
until grep -q LANE4DONE critic/c75_lane4.log 2>/dev/null; do sleep 15; done
export BASE=http://127.0.0.1:5377
t() { log=$1; shift; echo "== $log $(date +%T)"; timeout 1500 "$@" > critic/$log 2>&1; echo "   exit $?"; }
t c75_monkey_58811_phone.log node critic/scripts/c75_monkey.mjs 58811 300 390 844 touch
t c75_monkey_58813_land.log node critic/scripts/c75_monkey.mjs 58813 300 844 390 touch
t c75_monkey_58815.log node critic/scripts/c75_monkey.mjs 58815 600 1600 900
echo LANE5DONE
