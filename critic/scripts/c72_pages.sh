#!/bin/sh
# Critic run 71 (focused): the page cases, one at a time, on the c71 build served at 5372 (starts to 1991 in it).
cd /c/Git/Warism
until [ -f critic/c72_build.done ]; do sleep 15; done
export BASE=http://127.0.0.1:5372
r() { name=$1; shift; echo "== $name $* $(date +%T)"; timeout 2400 node critic/scripts/$name.mjs "$@" > critic/$name.$(echo "$*" | tr ' /&=,:@' '_______' | cut -c1-60).log 2>&1; echo "   exit $?"; }
r c72_godpeace 1942 JAP 'United States'
r c72_godpeace 1942 GER 'Soviet Union' 390 844
r c72_god42 1942 53542 replay
r c72_god42 1943 53543 free
r c72_x_replaycard 1943 free
r c72_x_replaycard 1975 free 390 844
r c72_ev91 1938 999 1938-01-02@africa:20:0:8000,congo:23:-3:3000
r c72_ev91 1990 999 1992-01-03@europe:28:50:3000
r c72_h_godtab 1600 900
r c72_h_godtab 390 844
r c72_takescore 1943 JAP 90
r c72_takescore 1942 GER 60 390 844
echo PAGESDONE
