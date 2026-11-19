#!/bin/sh
# Critic run 81: copy every c80_ script to c81_ with its outputs renamed c81 and the ports moved (HEAD's build 5401 -> 5403,
# the comparison build 5402 -> 5404, now run 80's build critic/c80_dist, tagged c80build_). In the lanes, job lists and chains
# (not the probes) the new seeds move 68xxx -> 69xxx; run 80's named cases on 68xxx are re-run by hand in c81_laneE.sh.
# c81_build.sh and this file are hand-written and not copied over.
cd /c/Git/Warism/critic/scripts
for f in c80_*; do
  n=c81_${f#c80_}
  case "$f" in c80_mkprobes.sh|c80_build.sh) continue ;; esac
  case "$f" in
    c80_lane*.sh|c80_jobs*.txt|c80_startsJobs.txt|c80_chainPerf.sh|c80_runNamed.sh|c80_nukeSame.sh)
      perl -pe 's/c80/c81/g; s/5401/5403/g; s/5402/5404/g; s/c79build_/c80build_/g; s/c79_dist/c80_dist/g; s/(?<![0-9])68(\d{3})(?![0-9])/69$1/g' "$f" > "$n" ;;
    *) perl -pe 's/c80/c81/g; s/5401/5403/g; s/5402/5404/g; s/c79build_/c80build_/g' "$f" > "$n" ;;
  esac
done
mkdir -p /c/Git/Warism/critic/c81_atcache
