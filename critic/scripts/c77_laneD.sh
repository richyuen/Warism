#!/bin/sh
# Critic run 76: page lane D: map look on a new seed at desk and phone, an armoured fight at every tier, the planes,
# a sea battle from the ticker, God Mode's tools and nuke (new seeds 59xxx), two at a time.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5399
( node critic/scripts/c77_look.mjs 62901 1600 900 45,180,400 > critic/c77_look_62901_desk.log 2>&1 ) &
( node critic/scripts/c77_look.mjs 62903 390 844 60,240 phone > critic/c77_look_62903_phone.log 2>&1 ) &
wait
( timeout 500 node critic/scripts/c77_c_battle.mjs 62915 > critic/c77_c_battle.62915.log 2>&1 ) &
( timeout 500 node critic/scripts/c77_pl_planes.mjs 62925 GER POL 5399 > critic/c77_pl_planes.62925.log 2>&1 ) &
wait
( timeout 500 node critic/scripts/c77_a_god_nuke.mjs 62917 > critic/c77_a_god_nuke.62917.log 2>&1 ) &
( timeout 500 node critic/scripts/c77_q_god_tools.mjs 62919 > critic/c77_q_god_tools.62919.log 2>&1 ) &
wait
( timeout 600 node critic/scripts/c77_seaclick.mjs 58061 > critic/c77_seaclick.58061.log 2>&1 ) &
( timeout 500 node critic/scripts/c77_z_zoom.mjs 62911 > critic/c77_z_zoom.62911.log 2>&1 ) &
wait
echo done > critic/c77_laneD.done
