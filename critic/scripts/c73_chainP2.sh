#!/bin/sh
# Critic run 68: the performance chain alone and last (run 67's c73_chainP.sh with this run's gates).
cd /c/Git/Warism
until grep -q BULKDONE critic/c73_chainBulk.log 2>/dev/null && [ -f critic/c73_named.done ] && [ -f critic/c73_chainS.done ] && grep -q PAGESBDONE critic/c73_pagesA.log 2>/dev/null && grep -q PAGESCDONE critic/c73_pagesC.log 2>/dev/null; do sleep 20; done
sed -e '/^until /d' critic/scripts/c73_chainP.sh > critic/c73_chainP_body.sh
sh critic/c73_chainP_body.sh
