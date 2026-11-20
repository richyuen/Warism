#!/bin/bash
# Critic run 91 (copy of run 90's) (copy of run 89's): the bulk sets on HEAD (c91_li, c91_sr, c91_nv; as many as finished) against the last sets on the sim
# before R217 and R218 (c90_li, c90_sr, c90_nv), file by file with the seconds stripped; and the runs with a broken rule.
cd /c/Git/Warism/critic
strip() { sed -E 's/[, ]+[0-9.]+ ?s$//; s/[0-9.]+ s,/ s,/g; s/[0-9.]+ ?ms//g' "$1"; }
cmpset() {
  old=$1; new=$2; same=0; differ=0; miss=0; d=""
  for f in $new/*.log; do b=$(basename $f); [ -f $old/$b ] || { miss=$((miss+1)); continue; }
    if diff <(strip $old/$b) <(strip $f) > /dev/null; then same=$((same+1)); else differ=$((differ+1)); d="$d $b"; fi; done
  echo "$new vs $old: finished $(ls $new/*.log | wc -l) of $(ls $old/*.log | wc -l); same $same, differ $differ, no old file $miss"
  [ -n "$d" ] && echo "  differ:$d" | cut -c1-600
  echo "  broken in $new: $(grep -lE '[1-9][0-9]* broken|^broken [1-9]' $new/*.log | wc -l); in $old (the same files): $(for f in $new/*.log; do grep -lE '[1-9][0-9]* broken|^broken [1-9]' $old/$(basename $f) 2>/dev/null; done | wc -l)"
}
cmpset c90_li c91_li; cmpset c90_sr c91_sr; cmpset c90_nv c91_nv
