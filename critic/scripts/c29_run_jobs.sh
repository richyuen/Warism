#!/bin/sh
# Critic run 29: run each line of a job file, P at a time; a line is logged with its start and exit.
cd /c/Git/Warism
F=$1; P=${2:-8}; LOG=$3
tr '\n' '\0' < $F | xargs -0 -P $P -I{} sh -c 'echo "start $(date +%T) {}" | cut -c1-160 >> '$LOG'; {}; echo "exit $? $(date +%T) {}" | cut -c1-160 >> '$LOG
echo ALLJOBSDONE >> $LOG
