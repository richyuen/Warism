#!/bin/sh
# Critic run 75 (full), the sixth page lane: two probes of mine mended (the "Charts" button's place; a log's name too
# long) and run again.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5377
t() { log=$1; shift; echo "== $log $(date +%T)"; timeout 2400 "$@" > critic/$log 2>&1; echo "   exit $?"; }
t c75_x_trackend91.1990.rerun.log node critic/scripts/c75_x_trackend91.mjs 1990
t c75_ev91_kuwait.log node critic/scripts/c75_ev91.mjs 1990 999 1990-08-03@kuwait:47.98:29.37:600 1990-08-04@kuwait2:47.98:29.37:600 1991-12-27@caucasus:44:41.5:1500,world:30:30:20000,casia:65:43:3000,lanka:80.7:7.8:1500,benin:2.3:9.5:1500,zaire:23:-2:6000,myanmar:96:20:3000 1992-01-03@europe:28:50:3000
echo LANE6DONE
