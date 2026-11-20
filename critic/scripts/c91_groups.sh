#!/bin/bash
# Critic run 91: the page lanes in groups (memory, browsers). (c91_lanes.sh was this driver once; on Windows it is the same
# file as c91_laneS.sh, which ran the driver again: so the stability lane is c91_laneStab.sh and this driver c91_groups.sh.)
# Run so: first M C V D (done), then N T Stab W, then run 90's named cases X A L E B. Usage: bash c91_groups.sh <lane>...
cd /c/Git/Warism
for L in "$@"; do [ -f critic/c91_stop.flag ] && break; (bash critic/scripts/c91_lane$L.sh > critic/c91_lane$L.out 2>&1) & done; wait
