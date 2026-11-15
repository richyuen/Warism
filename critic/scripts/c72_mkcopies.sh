#!/bin/sh
# Critic run 72 (full): copy the newest version of each run 70/71 probe as c72_* (c71 over c70), the run's prefix and port changed.
cd /c/Git/Warism/critic/scripts
for f in c70_* c71_*; do
  base=${f#c7?_}
  [ "$f" = "c70_$base" ] && [ -f "c71_$base" ] && continue
  case "$base" in *.txt|*.log|*.json) continue;; esac
  sed -e 's/c7[01]_/c72_/g' -e 's/537[01]/5372/g' "$f" > "c72_$base"
done
ls c72_* | wc -l
