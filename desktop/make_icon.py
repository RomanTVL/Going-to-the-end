"""Draws the app icon: the glowing dot sitting on the word END, on black film."""
import sys
from PIL import Image, ImageDraw, ImageFilter

def frame(size):
    s = size * 4
    img = Image.new('RGBA', (s, s), (0, 0, 0, 255))
    glow = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    cx, cy, r = s * .5, s * .5, s * .2
    g.ellipse((cx - r * 1.9, cy - r * 1.9, cx + r * 1.9, cy + r * 1.9), fill=(255, 236, 200, 90))
    glow = glow.filter(ImageFilter.GaussianBlur(s * .09))
    img.alpha_composite(glow)
    d = ImageDraw.Draw(img)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(255, 250, 240, 255))
    d.rectangle((s * .16, s * .76, s * .84, s * .8), fill=(239, 232, 220, 255))
    return img.resize((size, size), Image.LANCZOS)

out = sys.argv[1]
frame(256).save(out, sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
