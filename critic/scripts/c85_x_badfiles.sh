#!/bin/sh
# Critic run 61: the two broken scenario files for c85_x_badfile.mjs (a truncated export; plain text), then the probe on each.
cd /c/Git/Warism
head -c 2000 critic/c85_paint_32443.warism-scenario > critic/c85_bad_trunc.warism-scenario
echo "hello this is not a scenario" > critic/c85_bad_text.warism-scenario
for l in trunc text; do BASE=${BASE:-http://127.0.0.1:5377} node critic/scripts/c85_x_badfile.mjs critic/c85_bad_$l.warism-scenario $l; done
