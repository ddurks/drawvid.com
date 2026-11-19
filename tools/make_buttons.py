"""Draws drawvid.com's generated pixel art into assets/:

  <game>-button.png   a wooden sign for the home page's rotating button, in the
                      style of paradise-button.png: the game's name in white
                      pixel lettering, its favicon standing on top
  <word>-header.png   the code page's section headers, CODE-button style
  coming-soon*.png    the code page's badge and the colours it flashes to

  python3 tools/make_buttons.py     (needs Pillow)

A new game is a line in GAMES; a letter the fonts don't have yet is a line in
WIDE and NARROW. Favicons are read from the games' own repos beside this one.
This folder is kept off the site by the deploy workflow.
"""
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

SITE = Path(__file__).resolve().parent.parent
REPOS = SITE.parent


def rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (255,)


WOOD, WOOD_LIGHT, WOOD_DARK = rgb("d9a066"), rgb("eec39a"), rgb("8f563b")
RED, RED_LIGHT, RED_DARK = rgb("ac3232"), rgb("d95763"), rgb("5f1c1c")
WHITE = rgb("ffffff")

# 5 rows per glyph. WIDE is the lettering on CODE / ABOUT / POST, NARROW the
# lettering on PARADISE.
WIDE = {
    "A": ".##. #..# #### #..# #..#",
    "B": "###. #..# ###. #..# ###.",
    "C": ".### #... #... #... .###",
    "D": "###. #..# #..# #..# ###.",
    "E": "#### #... ###. #... ####",
    "F": "#### #... ###. #... #...",
    "G": ".### #... #.## #..# .###",
    "H": "#..# #..# #### #..# #..#",
    "I": "### .#. .#. .#. ###",
    "L": "#... #... #... #... ####",
    "M": "#...# ##.## #.#.# #...# #...#",
    "N": "#..# ##.# #.## #..# #..#",
    "O": ".##. #..# #..# #..# .##.",
    "P": "###. #..# ###. #... #...",
    "R": "###. #..# ###. #.#. #..#",
    "S": ".### #... .##. ...# ###.",
    "T": "##### ..#.. ..#.. ..#.. ..#..",
    "U": "#..# #..# #..# #..# .##.",
    "V": "#...# #...# .#.#. .#.#. ..#..",
    "W": "#...# #...# #.#.# ##.## #...#",
    "Y": "#...# .#.#. ..#.. ..#.. ..#..",
    "!": "# # # . #",
}
NARROW = {
    "A": ".#. #.# ### #.# #.#",
    "B": "##. #.# ##. #.# ##.",
    "C": ".## #.. #.. #.. .##",
    "D": "##. #.# #.# #.# ##.",
    "E": "### #.. ##. #.. ###",
    "F": "### #.. ##. #.. #..",
    "G": ".## #.. #.# #.# .##",
    "H": "#.# #.# ### #.# #.#",
    "I": "# # # # #",
    "L": "#.. #.. #.. #.. ###",
    "M": "#...# ##.## #.#.# #...# #...#",
    "N": "#..# ##.# #.## #..# #..#",
    "O": ".#. #.# #.# #.# .#.",
    "P": "##. #.# ##. #.. #..",
    "R": "##. #.# ##. #.# #.#",
    "S": ".## #.. .#. ..# ##.",
    "T": "### .#. .#. .#. .#.",
    "U": "#.# #.# #.# #.# .#.",
    "V": "#.# #.# #.# #.# .#.",
    "Y": "#.# #.# .#. .#. .#.",
}


def text_width(text, font):
    return sum(len(font[c].split()[0]) for c in text) + len(text) - 1


def draw_text(im, text, font, x, y, color=WHITE):
    for c in text:
        rows = font[c].split()
        for dy, row in enumerate(rows):
            for dx, bit in enumerate(row):
                if bit == "#":
                    im.putpixel((x + dx, y + dy), color)
        x += len(rows[0]) + 1


def favicon16(path):
    """The icon as a browser tab shows it: its own 16x16 frame, or shrunk to one."""
    im = Image.open(path)
    sizes = im.info.get("sizes")
    if sizes and (16, 16) in sizes:
        im = Image.open(path)
        im.size = (16, 16)
        im.load()
    im = im.convert("RGBA")
    if im.size != (16, 16):
        im = im.resize((16, 16), Image.LANCZOS)
    return im


def crisp(icon):
    """Shrunken 3D renders are soft at 16px; sharpen and give them a hard edge
    so they sit with the pixel art when the page draws them 4x."""
    r, g, b, a = icon.split()
    colour = Image.merge("RGB", (r, g, b)).filter(ImageFilter.UnsharpMask(radius=1, percent=120, threshold=0))
    colour = ImageEnhance.Contrast(colour).enhance(1.15)
    a = a.point(lambda v: 255 if v >= 110 else 0)
    return Image.merge("RGBA", (*colour.split(), a))


def sign_button(lines, icon):
    """32x32: a 16x16 icon standing on a 32x16 wooden sign."""
    im = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    top = 16
    for y in range(top, 32):
        for x in range(32):
            r = y - top
            if r == 0:
                c = WOOD_LIGHT if 2 <= x <= 29 else None
            elif r == 1:
                c = None if x in (0, 31) else WOOD_DARK if x == 1 else WOOD_LIGHT if x == 30 else WOOD
            elif r <= 12:
                c = WOOD_DARK if x < 2 else WOOD_LIGHT if x == 31 else WOOD
            elif r == 13:
                c = WOOD_DARK if x < 3 else WOOD_LIGHT if x == 31 else WOOD
            elif r == 14:
                c = None if x in (0, 31) else WOOD_DARK
            else:
                c = WOOD_DARK if 2 <= x <= 29 else None
            if c:
                im.putpixel((x, y), c)
    # Lettering goes in columns 2..30, rows top+2..top+12.
    fits = all(text_width(l, WIDE) <= 27 for l in lines)
    font = WIDE if fits else NARROW
    ys = [top + 2, top + 8] if len(lines) == 2 else [top + 5]
    for line, y in zip(lines, ys):
        w = text_width(line, font)
        draw_text(im, line, font, 2 + (29 - w + 1) // 2, y)
    im.alpha_composite(icon, (8, 0))
    return im


def badge(lines, body, light, dark, ink):
    """A CODE-button shaped badge holding centred lines of WIDE lettering."""
    w = max(text_width(l, WIDE) for l in lines) + 8
    h = 6 * len(lines) + 5
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    for y in range(h):
        for x in range(w):
            if y == 0:
                c = light if 2 <= x <= w - 3 else None
            elif y == 1:
                c = None if x in (0, w - 1) else dark if x == 1 else light if x == w - 2 else body
            elif y <= h - 4:
                c = dark if x < 2 else light if x == w - 1 else body
            elif y == h - 3:
                c = dark if x < 3 else light if x == w - 1 else body
            elif y == h - 2:
                c = None if x in (0, w - 1) else dark
            else:
                c = dark if 2 <= x <= w - 3 else None
            if c:
                im.putpixel((x, y), c)
    for i, line in enumerate(lines):
        draw_text(im, line, WIDE, (w - text_width(line, WIDE) + 1) // 2, 3 + 6 * i, ink)
    return im


def red_button(text):
    """A CODE / ABOUT style button, as wide as the word needs."""
    return badge([text], RED, RED_LIGHT, RED_DARK, WHITE)


GAMES = [
    # subdomain, the sign's lines, favicon (in the game's repo)
    ("appleroyale", ["APPLE", "ROYALE"], "appleroyale/assets/favicon.png"),
    ("balls", ["BALLS", "GOLF"], "balls/favicon.ico"),
    ("beebattle", ["BEE", "BATTLE"], "beebattle/favicon.ico"),
    ("cyberia", ["CYBERIA"], "cyberia/assets/favicon.ico"),
    ("fih", ["FIH"], "fih/web/favicon.ico"),
    ("stuntguy", ["STUNT", "GUY"], "stuntguy/favicon.ico"),
]
HEADERS = ["DEMOS", "GAMES", "TOOLS"]


if __name__ == "__main__":
    out = SITE / "assets"
    for name, lines, favicon in GAMES:
        art = crisp(favicon16(REPOS / favicon))
        sign_button(lines, art).save(out / f"{name}-button.png", optimize=True)
    for word in HEADERS:
        red_button(word).save(out / f"{word.lower()}-header.png", optimize=True)
    # "coming soon!" and the colours it flashes to.
    soon = ["COMING", "SOON!"]
    badge(soon, rgb("fbf236"), WHITE, rgb("df7126"), rgb("222034")).save(out / "coming-soon.png", optimize=True)
    badge(soon, RED, RED_LIGHT, RED_DARK, WHITE).save(out / "coming-soon-flash.png", optimize=True)
