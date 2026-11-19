#!/bin/bash
# Critic run 80: after the lanes. Re-runs of cases that began before the build's replay starts were in place
# (h_interv), run 79's named God/sea cases with heroes on as run 79 ran them, and the batch's fixes off their own cases
# (R170 at 844 x 390).
. /c/Git/Warism/critic/scripts/c80_r.sh
TAGL=rerun_ r h_interv 1600 900
TAGL=rerun_ r h_interv 390 844
export EXTRA='&heroes=on'
TAGL=heroes_ r a_god_nuke 64917
TAGL=heroes_ r seaclick 64913
export EXTRA=
r dirHand 59955 120 844 390 touch
r dirHand 68957 200 390 844 touch
# HEAD's arms again, last: lane A ran run 79's build after HEAD into the same JSON and shot names.
TAGL=headagain_ r phoneTicker 64903 200
TAG=_head TAGL=headagain_ r deathTitle 7019 400 390 844
TAGL=headagain_ r dirHand 59955 120 390 844 touch
echo done > critic/c80_fixups.done
