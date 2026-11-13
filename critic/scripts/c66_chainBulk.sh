#!/bin/sh
# Critic run 66: run 61's bulk landing sets, due again since the sim changed since run 64's commit (ADR-917):
# 396 named setups, 153 stuck-return runs, 168 next-voyage runs. Compared with run 65's (c65_li, c65_sr, c65_nv).
cd /c/Git/Warism
until [ -f critic/c66_fuzz.done ]; do sleep 20; done
echo "liab $(date +%T)"; P=6 sh critic/scripts/c66_liab.sh named > critic/c66_liab_named.log 2>&1
echo "sr $(date +%T)"; P=6 sh critic/scripts/c66_sr.sh > critic/c66_sr.log 2>&1
echo "nv $(date +%T)"; P=6 sh critic/scripts/c66_nv.sh > critic/c66_nv.log 2>&1
echo "BULKDONE $(date +%T)"
