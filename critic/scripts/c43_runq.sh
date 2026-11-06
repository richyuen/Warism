#!/bin/sh
# Run a job list N at a time; log start/end and exit per job.
cd /c/Git/Warism
L=$1; N=$2; LOG=$3
: > $LOG
cat $L | xargs -P $N -I{} sh -c 'echo "start $(date +%T) {}" >> '"$LOG"'; {}; echo "end $(date +%T) exit $? {}" >> '"$LOG"
echo QUEUEDONE >> $LOG
