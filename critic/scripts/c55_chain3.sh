#!/bin/sh
# Critic run 55: after every other job, alone: frame rates and the glide, on HEAD (5355) and on 8d7d02fe (5356).
cd /c/Git/Warism
until grep -q SUITEB2DONE critic/c55_suiteB.log 2>/dev/null && [ "$(grep -c . critic/c55_q_all.done 2>/dev/null)" -ge 27 ] && grep -q '^done:' critic/c55_replay.log 2>/dev/null; do sleep 30; done
echo "start $(date +%T)" > critic/c55_pf.status
export BASE=http://127.0.0.1:5355
node critic/scripts/c55_pf_lookfps.mjs 7019 critic/c55_seed7019_y20.bin > critic/c55_pf_lookfps.log 2>&1; echo "pf $? $(date +%T)" >> critic/c55_pf.status
npx tsx tools/diag/lookFps.ts 7019 critic/c55_seed7019_y20.bin critic/c55_lookfps_7019.json > critic/c55_lookfps.log 2>&1; echo "lookFps $? $(date +%T)" >> critic/c55_pf.status
node critic/scripts/c55_glide.mjs 7019 critic/c55_seed7019_y20.bin 120 head > critic/c55_glide_head_120.log 2>&1
node critic/scripts/c55_glide.mjs 7019 critic/c55_seed7019_y20.bin 30 head > critic/c55_glide_head_30.log 2>&1
node critic/scripts/c55_glide.mjs 99 - 150 head > critic/c55_glide_head_99.log 2>&1
node critic/scripts/c55_tm_touch.mjs > critic/c55_tm_touch.alone.log 2>&1; echo "touch $? $(date +%T)" >> critic/c55_pf.status
(cd critic/wt && npx vite preview --outDir ../c55_olddist --port 5356 --strictPort --host 127.0.0.1 > ../c55_oldpreview.log 2>&1 &)
until curl -s http://127.0.0.1:5356/ > /dev/null; do sleep 2; done
export BASE=http://127.0.0.1:5356
node critic/scripts/c55_glide.mjs 7019 critic/c54_seed7019_y20.bin 120 old > critic/c55_glide_old_120.log 2>&1
node critic/scripts/c55_glide.mjs 7019 critic/c54_seed7019_y20.bin 30 old > critic/c55_glide_old_30.log 2>&1
node critic/scripts/c55_glide.mjs 99 - 150 old > critic/c55_glide_old_99.log 2>&1
TAG=_old node critic/scripts/c55_pf_lookfps.mjs 7019 critic/c54_seed7019_y20.bin > critic/c55_pf_lookfps_old.log 2>&1; echo "pfold $? $(date +%T)" >> critic/c55_pf.status
echo PFDONE >> critic/c55_pf.status
