#!/usr/bin/env python3
"""v3.2 brand assets — generated from Mr. Magic's own artwork in
brand-source/ (icon-tile.png = the app-icon tile cropped from his image;
splash-panel.png = the splash panel cropped from his image). Run:
npm run brand (needs Python + PIL).

Outputs:
 - public/icons/icon-192.png / icon-512.png (full-bleed tile)
 - public/icons/icon-maskable-512.png (tile at 78% on a deep-emerald field,
   so Android's circle/squircle masks never clip the artwork's text)
 - public/splash/splash.jpg (in-app boot splash, panel at 828w)
 - public/splash/startup-*.jpg (Apple touch startup images: the panel
   centred on the artwork's own near-black green field, contain-fit)
"""
import os
from PIL import Image

TILE = 'brand-source/icon-tile.png'
PANEL = 'brand-source/splash-panel.png'
FIELD = (6, 13, 18)        # #060D12 — the artwork's scene dark
MASK_FIELD = (10, 53, 36)  # #0A3524 — deep emerald

os.makedirs('public/icons', exist_ok=True)
os.makedirs('public/splash', exist_ok=True)

tile = Image.open(TILE).convert('RGB')
panel = Image.open(PANEL).convert('RGB')

for size in (192, 512):
    tile.resize((size, size), Image.LANCZOS).save(f'public/icons/icon-{size}.png')

inner = 400  # 78% of 512 — maskable safe zone
mask = Image.new('RGB', (512, 512), MASK_FIELD)
mask.paste(tile.resize((inner, inner), Image.LANCZOS), ((512 - inner) // 2, (512 - inner) // 2))
mask.save('public/icons/icon-maskable-512.png')

panel.resize((828, round(panel.height * 828 / panel.width)), Image.LANCZOS).save(
    'public/splash/splash.jpg', quality=82)

for w, h in [(750, 1334), (828, 1792), (1125, 2436), (1170, 2532),
             (1179, 2556), (1242, 2688), (1290, 2796)]:
    ph = round(h * 0.96)
    pw = round(panel.width * ph / panel.height)
    canvas = Image.new('RGB', (w, h), FIELD)
    canvas.paste(panel.resize((pw, ph), Image.LANCZOS), ((w - pw) // 2, (h - ph) // 2))
    canvas.save(f'public/splash/startup-{w}x{h}.jpg', quality=82)

print('brand assets generated')
