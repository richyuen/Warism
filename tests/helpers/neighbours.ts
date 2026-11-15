/** The pairs of nations that share a land border on an owner grid (`w` × `h`, wrapping east-west), each [a, b], a < b. */
export function neighbourPairs(owner: ArrayLike<number>, w: number, h: number): [number, number][] {
  const seen = new Set<number>();
  const out: [number, number][] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = owner[y * w + x]!;
      if (a === 0) continue;
      for (const [dx, dy] of [[1, 0], [0, 1]] as const) {
        if (y + dy >= h) continue;
        const b = owner[(y + dy) * w + ((x + dx) % w)]!;
        if (b === 0 || b === a) continue;
        const [p, q] = a < b ? [a, b] : [b, a];
        const key = p * 65536 + q;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push([p, q]);
      }
    }
  }
  return out.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
}
