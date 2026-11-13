#!/bin/sh
# Critic run 66: the cases the named list missed (afterTrack with its own cache, 37603/37301/37303/37009 again, the
# nuclear counts of 37501/3/7), 2 at a time.
cd /c/Git/Warism
tr -d '\r' < critic/scripts/c66_jobsExtra.txt | xargs -P 2 -I{} sh -c '{}; echo "$? {}" | cut -c1-160 >> critic/c66_extra.progress'
echo done > critic/c66_extra.done
