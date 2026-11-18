#!/bin/sh
# Critic run 78: each replay case's log against run 77's: its "broken" lines and last line, side by side.
cd /c/Git/Warism
for f in $(grep -oE "critic/c78_[A-Za-z0-9_.]+\.log" critic/scripts/c78_startsJobs.txt); do
  o=$(echo $f | sed 's/c78_/c77_/')
  a=$(grep -iE "broken" $o 2>/dev/null | tail -1 | cut -c1-110); b=$(grep -iE "broken" $f 2>/dev/null | tail -1 | cut -c1-110)
  [ -z "$a" ] && a=$(tail -1 $o 2>/dev/null | cut -c1-110); [ -z "$b" ] && b=$(tail -1 $f 2>/dev/null | cut -c1-110)
  echo "$f"; echo "  77: $a"; echo "  78: $b"
done
