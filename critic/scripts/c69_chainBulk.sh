#!/bin/sh
# Critic run 69 (copy of c68_chainBulk): run 61's bulk landing sets, due again since the sim changed since run 68's commit (ADR-917):
# 396 named setups, 153 stuck-return runs, 168 next-voyage runs. Compared with run 65's (c66_li, c66_sr, c66_nv).
cd /c/Git/Warism
until [ -f critic/c69_fuzz.done ]; do sleep 20; done
echo "liab $(date +%T)"; P=6 sh critic/scripts/c69_liab.sh named > critic/c69_liab_named.log 2>&1
echo "sr $(date +%T)"; P=6 sh critic/scripts/c69_sr.sh > critic/c69_sr.log 2>&1
echo "nv $(date +%T)"; P=6 sh critic/scripts/c69_nv.sh > critic/c69_nv.log 2>&1
echo "BULKDONE $(date +%T)"
