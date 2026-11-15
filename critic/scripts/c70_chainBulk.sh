#!/bin/sh
# Critic run 69 (copy of c69_chainBulk): run 61's bulk landing sets, due again since the sim changed since run 68's commit (ADR-917):
# 396 named setups, 153 stuck-return runs, 168 next-voyage runs. Compared with run 65's (c66_li, c66_sr, c66_nv).
cd /c/Git/Warism
until [ -f critic/c70_fuzz.done ]; do sleep 20; done
echo "liab $(date +%T)"; P=6 sh critic/scripts/c70_liab.sh named > critic/c70_liab_named.log 2>&1
echo "sr $(date +%T)"; P=6 sh critic/scripts/c70_sr.sh > critic/c70_sr.log 2>&1
echo "nv $(date +%T)"; P=6 sh critic/scripts/c70_nv.sh > critic/c70_nv.log 2>&1
echo "BULKDONE $(date +%T)"
