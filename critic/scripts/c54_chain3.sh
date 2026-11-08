#!/bin/sh
# After every other job of run 54: the frame rate, alone.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5354
until grep -q SUITE2DONE critic/c54_suiteP2.log 2>/dev/null && [ "$(wc -l < critic/c54_q_all.done 2>/dev/null)" -ge 30 ] && [ "$(wc -l < critic/c54_q_B.done 2>/dev/null)" -ge 5 ] && grep -q '^done:' critic/c54_replay.log 2>/dev/null; do sleep 30; done
echo "start $(date +%T)" > critic/c54_pf.status
node critic/scripts/c54_pf_lookfps.mjs 7019 critic/c54_seed7019_y20.bin > critic/c54_pf_lookfps.log 2>&1
echo "exit $? $(date +%T)" >> critic/c54_pf.status
echo PFDONE >> critic/c54_pf.status
