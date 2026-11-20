#!/bin/bash
# Critic run 91: run 90's named cases (lanes X A L E B) once lanes N, T, W, Stab and R have ended.
cd /c/Git/Warism
until [ -f critic/c91_laneN.done ] && [ -f critic/c91_laneT.done ] && [ -f critic/c91_laneW.done ] && [ -f critic/c91_laneStab.done ] && [ -f critic/c91_laneR.done ]; do sleep 20; done
bash critic/scripts/c91_groups.sh X A L E B
echo LANESDONE > critic/c91_lanes.status
