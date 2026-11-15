#!/bin/bash
# Critic run 66: each named headless log of run 66 against run 65's of the same name, whole, the seconds stripped.
cd /c/Git/Warism/critic
for f in c70_li_*.log c70_nvtrace_*.log c70_sb_*.log c70_diploinv_335*.log c70_diploinv_370*.log c70_wi_3600*.log c70_wi_3601*.log c70_wi_370*.log c70_wd_*.log c70_seed*_save.log c70_track_1938.log c70_track_373*.log c70_transfer_head.log c70_tf_37701.log; do
  [ -f "$f" ] || continue
  o=${f/c70_/c69_}
  if [ ! -f "$o" ]; then echo "NOOLD $f"; continue; fi
  if diff <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $o) <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $f) >/dev/null; then echo "SAME $f"; else echo "DIFF $f ($(diff <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $o) <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $f) | grep -c '^[<>]') lines)"; fi
done
