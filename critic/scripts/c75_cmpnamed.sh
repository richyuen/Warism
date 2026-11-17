#!/bin/bash
# Critic run 66: each named headless log of run 66 against run 65's of the same name, whole, the seconds stripped.
cd /c/Git/Warism/critic
for f in c75_li_*.log c75_nvtrace_*.log c75_sb_*.log c75_diploinv_335*.log c75_diploinv_370*.log c75_wi_3600*.log c75_wi_3601*.log c75_wi_370*.log c75_wd_*.log c75_seed*_save.log c75_track_1938.log c75_track_373*.log c75_transfer_head.log c75_tf_37701.log; do
  [ -f "$f" ] || continue
  o=${f/c75_/c69_}
  if [ ! -f "$o" ]; then echo "NOOLD $f"; continue; fi
  if diff <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $o) <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $f) >/dev/null; then echo "SAME $f"; else echo "DIFF $f ($(diff <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $o) <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $f) | grep -c '^[<>]') lines)"; fi
done
