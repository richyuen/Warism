#!/bin/bash
# Critic run 66: each named headless log of run 66 against run 65's of the same name, whole, the seconds stripped.
cd /c/Git/Warism/critic
for f in c74_li_*.log c74_nvtrace_*.log c74_sb_*.log c74_diploinv_335*.log c74_diploinv_370*.log c74_wi_3600*.log c74_wi_3601*.log c74_wi_370*.log c74_wd_*.log c74_seed*_save.log c74_track_1938.log c74_track_373*.log c74_transfer_head.log c74_tf_37701.log; do
  [ -f "$f" ] || continue
  o=${f/c74_/c69_}
  if [ ! -f "$o" ]; then echo "NOOLD $f"; continue; fi
  if diff <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $o) <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $f) >/dev/null; then echo "SAME $f"; else echo "DIFF $f ($(diff <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $o) <(sed -E 's/[0-9]+(\.[0-9]+)? ?(s|ms)\b//g' $f) | grep -c '^[<>]') lines)"; fi
done
