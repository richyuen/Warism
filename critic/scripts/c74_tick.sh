#!/bin/sh
# Critic run 70: the seed-99 tick, 5 years, alone after every other job (as run 69's c69_chainP_body's first line).
cd /c/Git/Warism

npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c74_tick99.log 2>&1
echo done > critic/c74_tick.done
