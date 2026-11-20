// Critic run 89 (new): crop a region of a shot at its own pixels, to read small things in a big picture.
// Usage: node critic/scripts/c89_crop.mjs <shot.png> <x> <y> <w> <h> <out.png> [scale=1]
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const [src, x, y, w, h, out, scale = '1'] = process.argv.slice(2);
const data = readFileSync(src).toString('base64');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Math.round(w * scale), height: Math.round(h * scale) } });
await p.setContent(`<body style="margin:0;background:#000;overflow:hidden"><img src="data:image/png;base64,${data}" style="transform-origin:0 0;transform:scale(${scale}) translate(${-x}px,${-y}px);image-rendering:pixelated"></body>`);
await p.waitForTimeout(500);
await p.screenshot({ path: out });
await b.close();
