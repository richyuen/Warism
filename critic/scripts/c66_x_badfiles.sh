#!/bin/sh
# Critic run 61: the two broken scenario files for c66_x_badfile.mjs (a truncated export; plain text), then the probe on each.
cd /c/Git/Warism
head -c 2000 critic/c66_paint_32443.warism-scenario > critic/c66_bad_trunc.warism-scenario
echo "hello this is not a scenario" > critic/c66_bad_text.warism-scenario
for l in trunc text; do BASE=${BASE:-http://127.0.0.1:5366} node critic/scripts/c66_x_badfile.mjs critic/c66_bad_$l.warism-scenario $l; done
