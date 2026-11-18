#!/bin/sh
# Critic run 76: page lane C. R125b (markers' tight rule to T1's near end) on both builds; the editor's nuclear game
# (R75-N2's instance); run 75's heroPop and markerPop cases on HEAD; two monkeys (the new buttons among the acts).
cd /c/Git/Warism
H=http://127.0.0.1:5399; O=http://127.0.0.1:5398
( BASE=$H node critic/scripts/c76_markers.mjs 58951 headn 1600 900 1675,372 30,60 1800,1300,1150,1000,600 > critic/c76_mk_headn_desk.log 2>&1 ) &
( BASE=$O node critic/scripts/c76_markers.mjs 58951 c75n 1600 900 1675,372 30,60 1800,1300,1150,1000,600 > critic/c76_mk_c75n_desk.log 2>&1 ) &
( BASE=$H node critic/scripts/c76_markers.mjs 56951 head 1600 900 1675,372 10,20,30 1800,1200,1150,600 > critic/c76_mk_head_desk.log 2>&1 ) &
wait
( BASE=$H EXTRA='&heroes=on' timeout 600 node critic/scripts/c76_g_editor.mjs 58921 > critic/c76_g_editor.58921.log 2>&1 ) &
( BASE=$H node critic/scripts/c76_heroPop.mjs 56901 400 head > critic/c76_hp_head_56901.log 2>&1 ) &
( BASE=$H node critic/scripts/c76_markerPop.mjs 56951 30 head > critic/c76_mp_head_56951.log 2>&1 ) &
wait
( BASE=$H timeout 500 node critic/scripts/c76_monkey.mjs 59803 300 > critic/c76_monkey_59803.log 2>&1 ) &
( BASE=$H timeout 500 node critic/scripts/c76_monkey.mjs 59811 300 390 844 touch > critic/c76_monkey_59811_phone.log 2>&1 ) &
wait
echo done > critic/c76_laneC.done
