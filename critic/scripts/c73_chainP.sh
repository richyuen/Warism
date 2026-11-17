#!/bin/sh
# Critic run 73 (focused): the performance chain, alone: it waits for landingFuzz, the nuke A/B, the starts' jobs and
# the page chain to end, runs, and then starts run 61's bulk landing sets (due: the sim changed), 10 at a time.
# Tick of seed 99 (5 years, pinned; the pin's game) and of the default game (heroes on), frames on HEAD's 7019
# year-20 world, lookFps, touch, the individual tier, and a five-year watch on the page. Guarded.
cd /c/Git/Warism
mkdir critic/c73_pf.lock 2>/dev/null || { echo "already running"; exit 0; }
until [ -f critic/c73_fuzz.done ] && grep -q "NUKEAB head done" critic/c73_nukeAB_head.log 2>/dev/null && [ -f critic/c73_startsjobs.done ] && grep -q PAGES3DONE critic/c73_pages.log 2>/dev/null && grep -q '^done' critic/c73_atx_55601.log 2>/dev/null && grep -q '^done' critic/c73_atx_37601.log 2>/dev/null; do sleep 15; done
echo "start $(date +%T)" > critic/c73_pf.status
export BASE=http://127.0.0.1:5373
npm run sim -- --scenario 1938 --seed 99 --years 5 --affinity 0xFFFF > critic/c73_tick99.log 2>&1; echo "tick $? $(date +%T)" >> critic/c73_pf.status
AFF=0xFFFF npx tsx critic/scripts/c73_heroRun.ts 99 5 - > critic/c73_tick99h.log 2>&1; echo "tickh99 $? $(date +%T)" >> critic/c73_pf.status
node critic/scripts/c73_pf_lookfps.mjs 7019 critic/c73_seed7019_y20.bin > critic/c73_pf_lookfps.log 2>&1; echo "pf $? $(date +%T)" >> critic/c73_pf.status
npx tsx tools/diag/lookFps.ts 7019 critic/c73_seed7019_y20.bin critic/c73_lookfps_7019.json > critic/c73_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c73_pf.status
node critic/scripts/c73_tm_touch.mjs > critic/c73_tm_touch.alone.log 2>&1; echo "touch $? $(date +%T)" >> critic/c73_pf.status
node critic/scripts/c73_x_indfps.mjs 32111 > critic/c73_xi.log 2>&1; echo "indfps $? $(date +%T)" >> critic/c73_pf.status
node critic/scripts/c73_long_watch2.mjs 56941 5 '&heroes=on' alone > critic/c73_lw_56941_alone.log 2>&1; echo "watch $? $(date +%T)" >> critic/c73_pf.status
echo PFDONE >> critic/c73_pf.status
echo "liab $(date +%T)" > critic/c73_chainBulk.log; P=10 sh critic/scripts/c73_liab.sh named > critic/c73_liab_named.log 2>&1
echo "sr $(date +%T)" >> critic/c73_chainBulk.log; P=10 sh critic/scripts/c73_sr.sh > critic/c73_sr.log 2>&1
echo "nv $(date +%T)" >> critic/c73_chainBulk.log; P=10 sh critic/scripts/c73_nv.sh > critic/c73_nv.log 2>&1
echo "BULKDONE $(date +%T)" >> critic/c73_chainBulk.log
