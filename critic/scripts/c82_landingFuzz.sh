cd /c/Git/Warism; npx tsx tools/diag/landingFuzz.ts --seeds 15 --first 82101 > critic/c82_landingFuzz.log 2>&1; echo "exit $?" >> critic/c82_landingFuzz.log
