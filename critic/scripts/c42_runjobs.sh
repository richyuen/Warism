#!/bin/sh
cd /c/Git/Warism
xargs -P "$2" -I{} -d "
" sh -c "{}" < "$1"
echo JOBSDONE "$1"
