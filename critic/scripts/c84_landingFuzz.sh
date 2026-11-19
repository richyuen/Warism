cd /c/Git/Warism; npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 84101 > critic/c84_landingFuzz.log 2>&1; echo "exit $?" >> critic/c84_landingFuzz.log
