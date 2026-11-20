#!/bin/bash
# Critic run 87: run 86's lane G and lane K cases (the war row's routes, relations) on HEAD (5421).
cd /c/Git/Warism
p() { n=$1; s=$2; shift 2; echo "== $n $* $(date +%T)"; BASE=http://127.0.0.1:5421 TAG=_c87 DPR=${DPR:-1} timeout ${TO:-900} node critic/scripts/$s.mjs "$@" > critic/c87_${n}_$(echo "$*" | tr ' ,' '__').log 2>&1; echo "   exit $?"; }
p dr c85_deskRow 84901 400 800
p dr c85_deskRow 85903 700 900
p ex c85_explore 84901 400
p dr c85_deskRow 85901 400 800
p dr c85_deskRow 85905 200 720
SCEN=random p dr c85_deskRow 85965 730 800
p rw c84_rowShot 84901 400 620x900,640x800,683x768,700x800,768x1024
p cw c84_crossWidth 85901 400 1280x800,800x800,770x800,740x800,700x800,660x800,640x800,620x800,601x800,600x800,601x800,640x800,700x800,770x800,1280x800
p df c82_deskFit 68901 400 1280 720 GER
p mc c81_moreClick 68901 400 1024 768
p rsd c84_relSide 84903 400
p rf c85_relFoot 84903 400
p gs c82_graphSize 68901 568 320
p pr c83_phoneRow 83901 200 375 667 90
p pr c83_phoneRow 83903 500 844 390 90
p pd c83_phoneToDesk 68901 400
p pd c83_phoneToDesk 83903 700 375x667,1280x720,1024x768,375x667
p rot c83_rotate 68901 400 GER 20
echo done > critic/c87_laneB.done
