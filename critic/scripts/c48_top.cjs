// Critic run 48: per year of a headless run, the top 5 holders of land (share of all controlled cells) and the living count.
const fs = require('fs');
const a = JSON.parse(fs.readFileSync(process.argv[2]));
const tags = JSON.parse(fs.readFileSync('critic/c6_cells.json')).tags;
const name = Object.fromEntries(Object.entries(tags).map(([k, v]) => [v, k]));
for (const y of a.yearly) {
  const tot = y.nations.reduce((s, n) => s + n.controlled, 0);
  const top = [...y.nations].sort((p, q) => q.controlled - p.controlled).slice(0, 5).map((n) => `${name[n.id] ?? '#' + n.id} ${(100 * n.controlled / tot).toFixed(1)}%`);
  console.log(`y${y.year} living ${y.nations.filter((n) => n.controlled > 0).length} | ${top.join(', ')}`);
}
