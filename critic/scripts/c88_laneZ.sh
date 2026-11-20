#!/bin/bash
# Critic run 88, lane Z: semanticZoom (the rotation: last fresh in run 85), run 85's zoom cases on new seeds 88xxx, the
# looks at the supported sizes (2560 x 1305, 393 x 852, 852 x 393): every tier, markers, the pop between tiers, the
# heroes' pop (run 86's kept 85905), the phone's zoom, the resize.
. /c/Git/Warism/critic/scripts/c88_r.sh
export EXTRA='&heroes=on'
r look 88901 2560 1305 45,180,400
r look 88903 393 852 60,240 phone
r look 88907 852 393 120,400 phone
r z_zoom 88911
VW=2560 VH=1305 TAGL=qhd_ r z_zoom 88913
r markers 88951 head 1600 900 1675,372 10,20,30 1800,1200,600
r markerPop 88951 30 head 1675,372
r markerPop 56951 30 head 1675,372
r heroPop 88905 300 head
r phz 88933 40
r h_zoom
r resize 88821 60
r massSeen 56211
echo done > /c/Git/Warism/critic/c88_laneZ.done
