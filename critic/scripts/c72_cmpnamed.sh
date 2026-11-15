#!/bin/bash
# Critic run 66: each named headless log of run 66 against run 65's of the same name, whole, the seconds stripped.
cd /c/Git/Warism/critic
for f in c72_li_*.log c72_nvtrace_*.log c72_sb_*.log c72_diploinv_335*.log c72_diploinv_370*.log c72_wi_3600*.log c72_wi_3601*.log c72_wi_370*.log c72_wd_*.log c72_seed*_save.log c72_track_1938.log c72_track_373*.log c72_transfer_head.log c72_tf_37701.log; do
  [ -f "$f" ] || continue
  o=${f/c72_/c69_}
  if [ ! -f "$o" ]; then echo "NOOLD $f"; continue; fi
  if diff <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $o) <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $f) >/dev/null; then echo "SAME $f"; else echo "DIFF $f ($(diff <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $o) <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $f) | grep -c '^[<>]') lines)"; fi
done
