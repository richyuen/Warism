#!/bin/sh
# Critic run 65: c68_freeburst.ts on free starts of 1946, 1954, 1963, 1975 and plain 1938 (year 0), two second seeds each,
# 365 days, five at a time.
cd /c/Git/Warism
for y in 0 1938 1939 1941 1946 1954 1963 1975; do for s in 5151 6161; do echo "$y $s"; done; done |
  xargs -P 4 -L 1 sh -c 'npx tsx critic/scripts/c68_freeburst.ts $0 $1 365 > critic/c68_fb_$0_$1.log 2>&1'
echo done > critic/c68_fb.done
