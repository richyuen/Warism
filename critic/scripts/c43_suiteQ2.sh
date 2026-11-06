#!/bin/sh
# Run 42: PF and LW re-run alone (the first pass overlapped two headless probes).
cd /c/Git/Warism
timeout 3600 node critic/scripts/c43_pf_lookfps.mjs 7019 critic/c32_seed7019_y20.bin > critic/c43_pf_rerun.log 2>&1; echo pf $?
timeout 3600 node critic/scripts/c43_long_watch.mjs 6151 10 > critic/c43_lw_rerun.log 2>&1; echo lw $?
echo SUITEQ2DONE
