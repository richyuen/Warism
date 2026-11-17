# Critic run 71: CIE L*a*b* (D65) of a pixel of a shot, and CIE76 dE between two pixels. Usage: python c73_lab.py <png> x,y [x,y ...]
import sys
from PIL import Image
def lab(rgb):
    def f(c):
        c = c / 255
        return ((c + 0.055) / 1.055) ** 2.4 if c > 0.04045 else c / 12.92
    r, g, b = (f(v) for v in rgb[:3])
    X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    Y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    g_ = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    return (116 * g_(Y) - 16, 500 * (g_(X) - g_(Y)), 200 * (g_(Y) - g_(Z)))
im = Image.open(sys.argv[1]).convert('RGB')
pts = [tuple(int(v) for v in a.split(',')) for a in sys.argv[2:]]
labs = []
for p in pts:
    px = im.getpixel(p)
    L = lab(px)
    labs.append(L)
    print(f'{p}: rgb {px} L* {L[0]:.1f} a* {L[1]:.1f} b* {L[2]:.1f}')
for i in range(1, len(labs)):
    d = sum((labs[0][k] - labs[i][k]) ** 2 for k in range(3)) ** 0.5
    print(f'dE {pts[0]} vs {pts[i]}: {d:.1f}')
