"""Generate pixel PNGs for the portfolio. Standard library only."""
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "frontend" / "public"


def chunk(tag, data):
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def write_png(path, pixels, w, h):
    raw = b"".join(b"\x00" + b"".join(bytes(pixels[y * w + x]) for x in range(w)) for y in range(h))
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9))
    png += chunk(b"IEND", b"")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(png)


def canvas(w, h, color):
    return [list(color) for _ in range(w * h)]


def put(pixels, w, h, x, y, color):
    if 0 <= x < w and 0 <= y < h:
        pixels[y * w + x] = list(color)


def rect(pixels, w, h, x, y, rw, rh, color):
    for yy in range(y, y + rh):
        for xx in range(x, x + rw):
            put(pixels, w, h, xx, yy, color)


def blit(pixels, w, h, grid, ox, oy, scale, palette):
    for y, row in enumerate(grid):
        for x, ch in enumerate(row):
            color = palette.get(ch)
            if not color:
                continue
            rect(pixels, w, h, ox + x * scale, oy + y * scale, scale, scale, color)


INK = (46, 42, 42, 255)
PEACH = (244, 222, 192, 255)
CHECK = (237, 211, 174, 255)
ORANGE = (242, 106, 56, 255)
DARK = (143, 48, 18, 255)
WHITE = (255, 255, 255, 255)
SCREEN = (20, 32, 51, 255)
GOLD = (255, 225, 74, 255)
CLEAR = (0, 0, 0, 0)
BLUE = (44, 65, 176, 255)
SKY = (159, 203, 242, 255)

FACE = [
    "................",
    "......gg........",
    "......oo........",
    "....oooooo......",
    "...ohhhhhhho....",
    "...ohhhhhhho....",
    "..oossssssso....",
    "..ooseepeeso....",
    "..oossssssso....",
    "..oohhhhhoo.....",
    "...oooooo.......",
    "....o..o........",
    "...oo..oo.......",
    "................",
    "................",
    "................",
]

# glasses over the face, drawn after blit
GLASSES = [
    (2, 7, 5, 1),
    (9, 7, 5, 1),
    (6, 7, 4, 1),
]


def avatar(size=32):
    img = canvas(size, size, (249, 169, 127, 255))
    palette = {"o": INK, "h": ORANGE, "s": SCREEN, "e": WHITE, "p": INK, "g": GOLD}
    blit(img, size, size, FACE, 0, 0, 2, palette)
    rect(img, size, size, 4, 14, 10, 2, INK)
    rect(img, size, size, 18, 14, 10, 2, INK)
    rect(img, size, size, 14, 14, 4, 2, INK)
    return img


def favicon():
    return avatar(32)


def cursor_arrow():
    w = h = 16
    img = canvas(w, h, CLEAR)
    art = [
        "x...............",
        "xx..............",
        "x.x.............",
        "x..x............",
        "x...x...........",
        "x....x..........",
        "x.....x.........",
        "x......x........",
        "x.......x.......",
        "x........x......",
        "x....xxxxxx.....",
        "x..x..x.........",
        "x.x...x.........",
        "xx....x.........",
        "......x.........",
        ".......x........",
    ]
    for y, row in enumerate(art):
        for x, ch in enumerate(row):
            if ch == "x":
                put(img, w, h, x, y, INK)
            elif ch == ".":
                pass
    # white edge pixels next to the shaft so it shows on dark and light
    return img


def cursor_hand():
    w = h = 16
    img = canvas(w, h, CLEAR)
    art = [
        "....xx..xx..xx..",
        "...x..xx..xx..x.",
        "...x..xx..xx..x.",
        "...x..xx..xx..x.",
        "...x..xx..xx..x.",
        "..x...........x.",
        "..x...........x.",
        "x.............x.",
        "x.............x.",
        "x............x..",
        ".x..........x...",
        "..x........x....",
        "...xxxxxx.......",
        "................",
        "................",
        "................",
    ]
    for y, row in enumerate(art):
        for x, ch in enumerate(row):
            if ch == "x":
                put(img, w, h, x, y, INK)
    return img


def checker(w, h, a, b, size=24):
    img = canvas(w, h, a)
    for y in range(h):
        for x in range(w):
            if ((x // size) + (y // size)) % 2 == 0:
                img[y * w + x] = list(b)
    return img


def scene(kind):
    w, h = 320, 200
    img = checker(w, h, PEACH, CHECK, 20)
    rect(img, w, h, 24, 24, w - 48, h - 48, WHITE)
    rect(img, w, h, 24, 24, w - 48, 36, ORANGE)
    if kind == "cafe":
        rect(img, w, h, 120, 80, 80, 50, DARK)
        rect(img, w, h, 132, 92, 56, 28, WHITE)
        rect(img, w, h, 150, 60, 20, 24, ORANGE)
    elif kind == "split":
        rect(img, w, h, 70, 90, 70, 70, BLUE)
        rect(img, w, h, 180, 90, 70, 70, ORANGE)
        rect(img, w, h, 146, 112, 28, 16, GOLD)
    else:
        rect(img, w, h, 140, 70, 40, 70, INK)
        rect(img, w, h, 150, 80, 20, 30, WHITE)
    return img


FONT = {
    "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "I": ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
}


def text(pixels, w, h, phrase, x, y, scale, color):
    cx = x
    for ch in phrase:
        glyph = FONT.get(ch, FONT[" "])
        for gy, row in enumerate(glyph):
            for gx, bit in enumerate(row):
                if bit == "1":
                    rect(pixels, w, h, cx + gx * scale, y + gy * scale, scale, scale, color)
        cx += 6 * scale


def og():
    w, h = 1200, 630
    img = checker(w, h, PEACH, CHECK, 48)
    rect(img, w, h, 80, 80, w - 160, h - 160, (253, 239, 214, 255))
    rect(img, w, h, 80, 80, w - 160, 72, DARK)
    text(img, w, h, "PRATHAM", 140, 180, 14, DARK)
    text(img, w, h, "PORTFOLIO", 140, 340, 10, ORANGE)
    return img


def main():
    write_png(ROOT / "favicon.png", favicon(), 32, 32)
    write_png(ROOT / "cursor.png", cursor_arrow(), 16, 16)
    write_png(ROOT / "cursor-hand.png", cursor_hand(), 16, 16)
    write_png(ROOT / "sprites" / "avatar.png", avatar(32), 32, 32)
    write_png(ROOT / "og.png", og(), 1200, 630)
    write_png(ROOT / "projects" / "placeholder.png", scene("ask"), 320, 200)
    write_png(ROOT / "projects" / "cafeos.png", scene("cafe"), 320, 200)
    write_png(ROOT / "projects" / "splittab.png", scene("split"), 320, 200)
    # sprite sheet preview so /sprites/ali.png exists; runtime still draws Ali on canvas
    sheet_w, sheet_h = 64, 64
    sheet = canvas(sheet_w, sheet_h, CLEAR)
    blit(sheet, sheet_w, sheet_h, FACE, 0, 0, 4, {"o": INK, "h": ORANGE, "s": SCREEN, "e": WHITE, "p": INK, "g": GOLD})
    write_png(ROOT / "sprites" / "ali.png", sheet, sheet_w, sheet_h)
    print("wrote assets to", ROOT)


if __name__ == "__main__":
    main()
