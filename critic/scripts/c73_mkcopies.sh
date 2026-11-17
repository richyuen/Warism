#!/bin/sh
# Critic run 73 (focused): copy each run 72 probe as c73_*, the run's prefix and port changed (5372 -> 5373).
cd /c/Git/Warism/critic/scripts
for f in c73_*; do
  base=${f#c73_}
  case "$base" in *.txt|*.log|*.json|mkcopies.sh) continue;; esac
  sed -e 's/c73_/c73_/g' -e 's/5372/5373/g' "$f" > "c73_$base"
done
ls c73_* | wc -l
