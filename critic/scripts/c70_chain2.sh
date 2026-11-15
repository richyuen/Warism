#!/bin/sh
# Critic run 70: the R82d/R82f cases and the rest of run 69's named cases (c70_jobs2.txt), 3 at a time after the first list.
cd /c/Git/Warism
until [ -f critic/c70_named.done ]; do sleep 15; done
tr -d '\r' < critic/scripts/c70_jobs2.txt | xargs -P 3 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c70_named2.progress'
echo done > critic/c70_named2.done
