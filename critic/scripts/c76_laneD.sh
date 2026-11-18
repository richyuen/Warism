#!/bin/sh
# Critic run 76: page lane D: map look on a new seed at desk and phone, an armoured fight at every tier, the planes,
# a sea battle from the ticker, God Mode's tools and nuke (new seeds 59xxx), two at a time.
cd /c/Git/Warism
export BASE=http://127.0.0.1:5399
( node critic/scripts/c76_look.mjs 59901 1600 900 45,180,400 > critic/c76_look_59901_desk.log 2>&1 ) &
( node critic/scripts/c76_look.mjs 59903 390 844 60,240 phone > critic/c76_look_59903_phone.log 2>&1 ) &
wait
( timeout 500 node critic/scripts/c76_c_battle.mjs 59915 > critic/c76_c_battle.59915.log 2>&1 ) &
( timeout 500 node critic/scripts/c76_pl_planes.mjs 59925 GER POL 5399 > critic/c76_pl_planes.59925.log 2>&1 ) &
wait
( timeout 500 node critic/scripts/c76_a_god_nuke.mjs 59917 > critic/c76_a_god_nuke.59917.log 2>&1 ) &
( timeout 500 node critic/scripts/c76_q_god_tools.mjs 59919 > critic/c76_q_god_tools.59919.log 2>&1 ) &
wait
( timeout 600 node critic/scripts/c76_seaclick.mjs 58061 > critic/c76_seaclick.58061.log 2>&1 ) &
( timeout 500 node critic/scripts/c76_z_zoom.mjs 59911 > critic/c76_z_zoom.59911.log 2>&1 ) &
wait
echo done > critic/c76_laneD.done
