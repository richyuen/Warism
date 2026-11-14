#!/bin/bash
# Critic run 66: each named headless log of run 66 against run 65's of the same name, whole, the seconds stripped.
cd /c/Git/Warism/critic
for f in c68_li_*.log c68_nvtrace_*.log c68_sb_*.log c68_diploinv_335*.log c68_diploinv_370*.log c68_wi_3600*.log c68_wi_3601*.log c68_wi_370*.log c68_wd_*.log c68_seed*_save.log c68_track_1938.log c68_track_373*.log c68_transfer_head.log c68_tf_37701.log; do
  [ -f "$f" ] || continue
  o=${f/c68_/c67_}
  if [ ! -f "$o" ]; then echo "NOOLD $f"; continue; fi
  if diff <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $o) <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $f) >/dev/null; then echo "SAME $f"; else echo "DIFF $f ($(diff <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $o) <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $f) | grep -c '^[<>]') lines)"; fi
done
