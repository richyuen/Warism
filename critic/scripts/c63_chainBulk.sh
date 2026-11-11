#!/bin/sh
# Critic run 63: after the headless queue, run 61's bulk landing sets (the sim changed since run 62's commit, ADR-917):
# 396 named setups, 153 stuck-return runs, 168 next-voyage runs; then the performance chain alone.
cd /c/Git/Warism
until grep -q QDONE critic/c63_q_resume.log 2>/dev/null; do sleep 30; done
echo "liab $(date +%T)"; P=4 sh critic/scripts/c63_liab.sh named > critic/c63_liab_named.log 2>&1
echo "sr $(date +%T)"; P=4 sh critic/scripts/c63_sr.sh > critic/c63_sr.log 2>&1
echo "nv $(date +%T)"; P=4 sh critic/scripts/c63_nv.sh > critic/c63_nv.log 2>&1
echo "BULKDONE $(date +%T)"
