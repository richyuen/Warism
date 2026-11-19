#!/bin/sh
# Critic run 85 (full): copy every c81_ script (run 81, the last full run) to c85_ with its outputs renamed c85 and the
# ports moved (HEAD's build 5403 -> 5411; the comparison build, now run 84's critic/c84_dist, 5404 -> 5410, tagged
# c84build_). In the lanes, job lists and chains (not the probes) the new seeds move 69xxx -> 85xxx. c85_build.sh, this
# file and the c85_lane*.sh written for this run are hand-written and not copied over.
cd /c/Git/Warism/critic/scripts
for f in c81_*; do
  n=c85_${f#c81_}
  case "$f" in c81_mkprobes.sh|c81_build.sh) continue ;; esac
  case "$f" in
    c81_lane*.sh|c81_jobs*.txt|c81_startsJobs.txt|c81_chainPerf.sh|c81_runNamed.sh|c81_nukeSame.sh|c81_chainS.sh|c81_fixups.sh)
      perl -pe 's/c81/c85/g; s/5403/5411/g; s/5404/5410/g; s/c80build_/c84build_/g; s/c80_dist/c84_dist/g; s/(?<![0-9])69(\d{3})(?![0-9])/85$1/g' "$f" > "$n.tmpl" ;;
    *) perl -pe 's/c81/c85/g; s/5403/5411/g; s/5404/5410/g; s/c80build_/c84build_/g' "$f" > "$n" ;;
  esac
done
mkdir -p /c/Git/Warism/critic/c85_atcache
