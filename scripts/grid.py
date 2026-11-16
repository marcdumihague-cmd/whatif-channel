"""Tile contact-sheet stills into grids of 12 (3 columns), each stamped with its time.

    .venv-qwen/bin/python scripts/grid.py <dir of NNNNN.jpg from video/sheet.mjs> <output prefix> [per grid = 12]
"""
import sys, glob
from PIL import Image, ImageDraw
files = sorted(glob.glob(sys.argv[1] + "/*.jpg")); n = int(sys.argv[3]) if len(sys.argv) > 3 else 12
for g in range(0, len(files), n):
    ims = [Image.open(f) for f in files[g:g + n]]; w, h = ims[0].size; cols = 3
    sheet = Image.new("RGB", (w * cols, h * ((len(ims) + cols - 1) // cols)), "black")
    for i, (im, f) in enumerate(zip(ims, files[g:g + n])):
        sheet.paste(im, ((i % cols) * w, (i // cols) * h)); d = ImageDraw.Draw(sheet)
        d.rectangle([(i % cols) * w, (i // cols) * h, (i % cols) * w + 110, (i // cols) * h + 26], fill="black")
        d.text(((i % cols) * w + 4, (i // cols) * h + 4), f"{int(f[-9:-4]) / 30:.1f}s", fill="yellow")
    sheet.save(f"{sys.argv[2]}_{g // n:02d}.jpg", quality=80)
