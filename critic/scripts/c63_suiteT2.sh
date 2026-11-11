#!/bin/sh
# Critic run 63: suite T's last probe again after the reboot (01:31) cut it off, then my track zoom probe.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5363
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 5400 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,' '_____').log 2>&1; echo "   exit $?"; }
r c63_h_zoom
r c63_h_watch 1600 900 1954 91 desk
echo SUITETDONE
