#!/bin/sh
# Critic run 65: run 61's bulk landing sets, due again since the sim changed since run 64's commit (ADR-917):
# 396 named setups, 153 stuck-return runs, 168 next-voyage runs. Compared with run 63's (c63_li, c63_sr, c63_nv).
cd /c/Git/Warism
until [ -f critic/c65_named.done ]; do sleep 20; done
echo "liab $(date +%T)"; P=6 sh critic/scripts/c65_liab.sh named > critic/c65_liab_named.log 2>&1
echo "sr $(date +%T)"; P=6 sh critic/scripts/c65_sr.sh > critic/c65_sr.log 2>&1
echo "nv $(date +%T)"; P=6 sh critic/scripts/c65_nv.sh > critic/c65_nv.log 2>&1
echo "BULKDONE $(date +%T)"
