#!/bin/bash
# Critic run 73: run 61's bulk sets on HEAD against run 72's outputs, file by file, the seconds stripped (as
# c73_bulkcmp2.sh), and the runs with a broken rule in each set on both. Run with bash.
# Writes critic/c77_liab_named_cmp.txt, critic/c77_sr_cmp.txt, critic/c77_nv_cmp.txt.
cd /c/Git/Warism/critic
cmpset() {
  old=$1; new=$2; out=$3; same=0; differ=0; : > $out.tmp
  for f in $new/*.log; do
    b=$(basename $f)
    if [ ! -f $old/$b ]; then echo "MISSING-OLD $b" >> $out.tmp; differ=$((differ+1)); continue; fi
    if diff <(sed -E 's/[, ]+[0-9.]+ ?s$//; s/[0-9.]+ s,/ s,/g' $old/$b) <(sed -E 's/[, ]+[0-9.]+ ?s$//; s/[0-9.]+ s,/ s,/g' $f) > /dev/null; then same=$((same+1)); else differ=$((differ+1)); echo "DIFF $b" >> $out.tmp; fi
  done
  { echo "same $same differ $differ of $(ls $new/*.log | wc -l) (old set $(ls $old/*.log | wc -l))"; echo "broken in $old: $(grep -lE '[1-9][0-9]* broken|^broken [1-9]' $old/*.log | wc -l): $(grep -lE '[1-9][0-9]* broken|^broken [1-9]' $old/*.log | xargs -n1 basename 2>/dev/null | tr '\n' ' ')"; echo "broken in $new: $(grep -lE '[1-9][0-9]* broken|^broken [1-9]' $new/*.log | wc -l): $(grep -lE '[1-9][0-9]* broken|^broken [1-9]' $new/*.log | xargs -n1 basename 2>/dev/null | tr '\n' ' ')"; echo "rules broken in $new:"; grep -h -o 't[0-9]* [A-Za-z]*:' $(grep -lE '[1-9][0-9]* broken|^broken [1-9]' $new/*.log) 2>/dev/null | sed 's/t[0-9]* //' | sort | uniq -c; cat $out.tmp; } > $out; rm -f $out.tmp
  head -8 $out | cut -c1-400
}
cmpset c77_li c81_li c81_liab_named_cmp.txt
cmpset c77_sr c81_sr c81_sr_cmp.txt
cmpset c77_nv c81_nv c81_nv_cmp.txt
