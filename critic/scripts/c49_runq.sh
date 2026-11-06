#!/bin/sh
# Critic run 48 (copy): run a job list (one shell command a line), P at a time. Usage: sh critic/scripts/c47_runq.sh <list> <P> <tag>
cd /c/Git/Warism
L=$1; P=${2:-6}; T=${3:-q}
echo "start $T $(date +%T)" > critic/c49_q_$T.status
tr -d '\r' < "$L" | xargs -P "$P" -I{} sh -c '{}; echo "$? {}" | cut -c1-200 >> critic/c49_q_'"$T"'.done'
echo "end $T $(date +%T)" >> critic/c49_q_$T.status
echo QDONE
