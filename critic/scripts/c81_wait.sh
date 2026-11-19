#!/bin/sh
# Critic run 81: wait (at most $2 s) for a file to exist. Usage: sh c81_wait.sh <file> <seconds>
end=$(( $(date +%s) + ${2:-540} ))
while [ ! -f "$1" ] && [ $(date +%s) -lt $end ]; do sleep 15; done
[ -f "$1" ] && echo "present $1" || echo "not yet $1 $(date +%T)"
