#!/bin/bash
# Critic run 90: R90-B1's figure. From c90_peaceTruth.ts's logs that track the last reason (c90_pt3b_*, c90_pt3c_*,
# c90_pt2c_*: 24 seeds; the first three sets were run before that field was added), one line per war: seed, war day,
# days since the last day the peace line gave reasons (empty: none given before it). Then the counts.
# Usage: bash critic/scripts/c90_peaceWars.sh   (writes critic/c90_peaceTruth_wars.txt)
cd /c/Git/Warism/critic
for f in c90_pt3b_*.log c90_pt3c_*.log c90_pt2c_*.log; do
  awk '/^seed/{s=$2} /^  war day/{w=$3; sub(":","",w); r=""; if (match($0,/last reason given day [0-9]+ \(([0-9]+) before/,m)) r=m[1]; print s, w, r}' $f
done | sort -u > c90_peaceTruth_wars.txt
echo "seeds $(cat c90_pt3b_*.log c90_pt3c_*.log c90_pt2c_*.log | grep -c '^seed')"
echo "wars $(wc -l < c90_peaceTruth_wars.txt), after a day with reasons $(awk '$3!=""' c90_peaceTruth_wars.txt | wc -l), of them within 30 days $(awk '$3!="" && $3<=30' c90_peaceTruth_wars.txt | wc -l) on $(awk '$3!="" && $3<=30{print $1}' c90_peaceTruth_wars.txt | sort -u | wc -l) seeds"
