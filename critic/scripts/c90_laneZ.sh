#!/bin/bash
# Critic run 90 (copy of run 88's lane Z): semanticZoom (touched: src/render), run 85's zoom cases on new seeds 90xxx, the
# looks at the supported sizes (2560 x 1305, 393 x 852, 852 x 393): every tier, markers, the pop between tiers, the
# heroes' pop (run 86's kept 85905), the phone's zoom, the resize.
. /c/Git/Warism/critic/scripts/c90_r.sh
export EXTRA='&heroes=on'
r look 90971 2560 1305 45,180,400
r look 90973 393 852 60,240 phone
r look 90977 852 393 120,400 phone
r z_zoom 90911
VW=2560 VH=1305 TAGL=qhd_ r z_zoom 90913
r markers 90951 head 1600 900 1675,372 10,20,30 1800,1200,600
r markerPop 90951 30 head 1675,372
r markerPop 56951 30 head 1675,372
r heroPop 85905 300 head
r heroPop 90905 300 head
r phz 90933 40
r h_zoom
r resize 90821 60
r massSeen 56211
echo done > /c/Git/Warism/critic/c90_laneZ.done
