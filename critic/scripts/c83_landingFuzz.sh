cd /c/Git/Warism; npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 83101 > critic/c83_landingFuzz.log 2>&1; echo "exit $?" >> critic/c83_landingFuzz.log
