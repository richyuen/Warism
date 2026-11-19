#!/bin/bash
# Critic run 85 (full): checker top-up. ADR-917 asks three new five-year seeds a checker for each dimension scored afresh;
# a full run scores all 14, so 42 five-year runs: the named chain's 20 diploInvariants (two of 10 years) and 7
# worldInvariants, and these 15 worldInvariants (1938, heroes, random diplomacy, the random world). After the named chain,
# 4 at a time.
cd /c/Git/Warism
until [ -f critic/c85_named.done ]; do sleep 20; done
{
for s in 85067 85069 85071; do echo "$s 1826"; done
for s in 85073 85075 85077; do echo "$s 1826 --heroes"; done
for s in 85079 85081 85083; do echo "$s 1826 --diplomacy random"; done
for s in 85085 85087 85089; do echo "$s 1826 --world random"; done
for s in 85091 85093 85095; do echo "$s 1826 --diplomacy random --heroes"; done
} | xargs -P 4 -L 1 sh -c 'npx tsx tools/diag/worldInvariants.ts "$0" "$@" > critic/c85_wi_$0.log 2>&1; echo "$? wi $0 $*" >> critic/c85_checkersTop.progress'
echo done > critic/c85_checkersTop.done
