#!/bin/bash
# Critic run 66: each named headless log of run 66 against run 65's of the same name, whole, the seconds stripped.
cd /c/Git/Warism/critic
for f in c67_li_*.log c67_nvtrace_*.log c67_sb_*.log c67_diploinv_335*.log c67_diploinv_370*.log c67_wi_3600*.log c67_wi_3601*.log c67_wi_370*.log c67_wd_*.log c67_seed*_save.log c67_track_1938.log c67_track_373*.log c67_transfer_head.log c67_tf_37701.log; do
  [ -f "$f" ] || continue
  o=${f/c67_/c66_}
  if [ ! -f "$o" ]; then echo "NOOLD $f"; continue; fi
  if diff <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $o) <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $f) >/dev/null; then echo "SAME $f"; else echo "DIFF $f ($(diff <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $o) <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $f) | grep -c '^[<>]') lines)"; fi
done
