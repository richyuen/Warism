#!/bin/sh
# Critic run 65: run 61's bulk sets on HEAD against run 63's outputs, file by file, the seconds stripped.
# Writes critic/c68_liab_named_cmp.txt, critic/c68_sr_cmp.txt, critic/c68_nv_cmp.txt.
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
cmpset c67_li c68_li c68_liab_named_cmp.txt
cmpset c67_sr c68_sr c68_sr_cmp.txt
cmpset c67_nv c68_nv c68_nv_cmp.txt
echo "breaks in the named set:"; grep -l -E '[1-9][0-9]* broken' c68_li/*.log | head -20
