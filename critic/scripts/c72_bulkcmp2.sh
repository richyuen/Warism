#!/bin/sh
# Critic run 65: run 61's bulk sets on HEAD against run 63's outputs, file by file, the seconds stripped.
# (c71: li and sr only; run with bash)
cd /c/Git/Warism/critic
cmpset() {
  old=$1; new=$2; out=$3; same=0; differ=0; : > $out.tmp
  for f in $new/*.log; do
    b=$(basename $f)
    if [ ! -f $old/$b ]; then echo "MISSING-OLD $b" >> $out.tmp; differ=$((differ+1)); continue; fi
    if diff <(sed -E 's/[, ]+[0-9.]+ ?s$//; s/[0-9.]+ s,/ s,/g' $old/$b) <(sed -E 's/[, ]+[0-9.]+ ?s$//; s/[0-9.]+ s,/ s,/g' $f) > /dev/null; then same=$((same+1)); else differ=$((differ+1)); echo "DIFF $b" >> $out.tmp; fi
  done
  { echo "same $same differ $differ"; cat $out.tmp; } > $out; rm -f $out.tmp
  head -12 $out
}
cmpset c69_li c72_li c72_liab_named_cmp.txt
cmpset c69_sr c72_sr c72_sr_cmp.txt
