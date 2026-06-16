"""
Collected Warmth — Fox Sticker Art Canvas
Creates a journal-page artwork featuring twin fox mascots as collectible stickers.
Based on the "Collected Warmth" design philosophy.
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os, math, random

# ── Paths ──
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
MINIAPP = os.path.join(ROOT, "twin-planet-miniapp")
STATIC = os.path.join(MINIAPP, "src", "static")
OUTPUT = os.path.dirname(os.path.abspath(__file__))

# Load fox assets
fox_amber = Image.open(os.path.join(STATIC, "mascot-amber-fox-nobg-128.png")).convert("RGBA")
fox_gold = Image.open(os.path.join(STATIC, "mascot-gold-fox-nobg-128.png")).convert("RGBA")

# ── Colors ──
PAPER = (254, 249, 240, 255)       # #FEF9F0
CREAM = (255, 245, 232, 255)       # #FFF5E8
AMBER = (224, 123, 62, 255)        # #E07B3E
GOLD = (200, 153, 62, 255)         # #C8993E
ROSE = (212, 128, 104, 255)        # #D48068
MINT = (92, 154, 110, 255)         # #5C9A6E
INK = (45, 35, 24, 255)            # #2D2318
INK_MD = (156, 142, 124, 255)      # #9C8E7C
DOT = (232, 220, 200, 255)         # #E8DCC8

# ── Canvas setup ──
W, H = 1200, 900
canvas = Image.new("RGBA", (W, H), PAPER)
draw = ImageDraw.Draw(canvas)

# ── Paper texture — subtle grain ──
random.seed(42)
for _ in range(8000):
    x = random.randint(0, W-1)
    y = random.randint(0, H-1)
    v = random.randint(-3, 3)
    r, g, b, a = canvas.getpixel((x, y))
    canvas.putpixel((x, y), (
        max(0, min(255, r + v)),
        max(0, min(255, g + v)),
        max(0, min(255, b + v)),
        a
    ))

# ── Dot grid pattern (journal paper ruling) ──
for x in range(60, W, 40):
    for y in range(60, H, 40):
        alpha = random.randint(15, 40)
        draw.ellipse([x-1, y-1, x+1, y+1], fill=(*INK[:3], alpha))

# ── Title area — minimal hand-lettering feel ──
try:
    font_title = ImageFont.truetype("C:/Windows/Fonts/simsun.ttc", 36)
    font_body = ImageFont.truetype("C:/Windows/Fonts/simsun.ttc", 18)
    font_small = ImageFont.truetype("C:/Windows/Fonts/simsun.ttc", 14)
except:
    font_title = ImageFont.load_default()
    font_body = ImageFont.load_default()
    font_small = ImageFont.load_default()

# Top-left: journal header
draw.text((60, 40), "贴纸收集册", fill=INK, font=font_title)
draw.text((60, 85), "Sticker Collection · 并蒂而生，同步成长", fill=INK_MD, font=font_small)

# Decorative line under title
for i in range(60, 540):
    alpha = random.randint(120, 200)
    canvas.putpixel((i, 110), (*DOT[:3], alpha))

# ── Section 1: Today's Stickers strip (top) ──
draw.text((60, 128), "✦ 今日收集", fill=INK_MD, font=font_body)

# Horizontal strip of "stickers" — irregular shapes with fox variations
sticker_positions = []
y_strip = 170
x_start = 60
fox_size_small = 48

# Generate 6 small fox stickers in a row
for i in range(6):
    x = x_start + i * 110 + random.randint(-5, 5)
    y = y_strip + random.randint(-3, 3)
    rotation = random.uniform(-3, 3)
    shape = random.choice(['circle', 'rounded', 'organic'])

    # Sticker shadow
    shadow = Image.new("RGBA", (fox_size_small + 24, fox_size_small + 24), (0,0,0,0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.ellipse([12, 16, fox_size_small+20, fox_size_small+24], fill=(*INK[:3], 20))
    shadow = shadow.filter(ImageFilter.GaussianBlur(6))
    canvas.paste(shadow, (x-6, y-2), shadow)

    # Sticker base (cream circle/rounded shape)
    base = Image.new("RGBA", (fox_size_small + 20, fox_size_small + 20), (0,0,0,0))
    base_draw = ImageDraw.Draw(base)
    if shape == 'circle':
        base_draw.ellipse([2, 2, fox_size_small+18, fox_size_small+18], fill=CREAM, outline=(255,255,255,200), width=3)
    elif shape == 'rounded':
        base_draw.rounded_rectangle([2, 2, fox_size_small+18, fox_size_small+18], radius=8, fill=CREAM, outline=(255,255,255,200), width=3)
    else:
        base_draw.rounded_rectangle([2, 2, fox_size_small+18, fox_size_small+18], radius=12, fill=CREAM, outline=(255,255,255,200), width=3)

    # Shine layer
    shine = Image.new("RGBA", (fox_size_small + 20, fox_size_small + 20), (0,0,0,0))
    shine_draw = ImageDraw.Draw(shine)
    shine_draw.ellipse([8, 6, fox_size_small+10, fox_size_small//2+6], fill=(255,255,255,50))
    base = Image.alpha_composite(base, shine)

    # Paste fox (alternating amber/gold)
    fox = fox_amber if i % 2 == 0 else fox_gold
    fox_s = fox.resize((fox_size_small, fox_size_small), Image.LANCZOS)
    fox_rotated = fox_s.rotate(rotation, expand=True, resample=Image.BICUBIC)
    fx = (base.width - fox_rotated.width) // 2
    fy = (base.height - fox_rotated.height) // 2
    base.paste(fox_rotated, (fx, fy), fox_rotated)

    canvas.paste(base, (x, y), base)
    sticker_positions.append((x + base.width//2, y + base.height))

# ── Section 2: Collection grid (middle) ──
draw.text((60, 270), "✦ 全部贴纸  ·  8 / 21 已收集", fill=INK_MD, font=font_body)

# Progress bar
bar_x, bar_y, bar_w, bar_h = 60, 295, 1080, 4
draw.rounded_rectangle([bar_x, bar_y, bar_x + bar_w, bar_y + bar_h], radius=2, fill=DOT)
draw.rounded_rectangle([bar_x, bar_y, bar_x + int(bar_w*0.38), bar_y + bar_h], radius=2, fill=GOLD)

# Grid of 20 sticker cells (4 rows x 5 cols)
grid_x0, grid_y0 = 60, 320
cell_size = 100
cols, rows = 5, 4
gap = 12

earned_set = {0, 1, 2, 5, 6, 10, 12, 15}  # Simulate 8 earned stickers

# Sticker icon colors to cycle through
sticker_colors = [AMBER, GOLD, MINT, ROSE, AMBER]
sticker_shapes = ['circle', 'rounded', 'organic', 'circle', 'rounded']

for row in range(rows):
    for col in range(cols):
        idx = row * cols + col
        cx = grid_x0 + col * (cell_size + gap)
        cy = grid_y0 + row * (cell_size + gap)

        cell = Image.new("RGBA", (cell_size, cell_size), (0,0,0,0))
        cell_draw = ImageDraw.Draw(cell)

        is_earned = idx in earned_set

        if is_earned:
            # Earned: gold gradient base + white border + shadow
            # Shadow
            cell_draw.rounded_rectangle([3, 5, cell_size-1, cell_size+3], radius=12, fill=(*INK[:3], 30))
            # White border
            cell_draw.rounded_rectangle([1, 1, cell_size-3, cell_size-3], radius=12, fill=CREAM, outline=(255,255,255,220), width=3)
            # Gold gradient overlay
            for gy in range(cell_size-3):
                ratio = gy / cell_size
                alpha = int(40 * (1 - ratio))
                r = int(CREAM[0] + (GOLD[0] - CREAM[0]) * ratio * 0.15)
                g = int(CREAM[1] + (GOLD[1] - CREAM[1]) * ratio * 0.15)
                b = int(CREAM[2] + (GOLD[2] - CREAM[2]) * ratio * 0.15)
                cell_draw.line([(3, gy+1), (cell_size-5, gy+1)], fill=(r, g, b, alpha))
            # Emboss highlight
            cell_draw.ellipse([cell_size//4, 4, 3*cell_size//4, cell_size//3], fill=(255,255,255,30))
            # Small sticker icon — simple geometric shape
            icon_color = sticker_colors[idx % 5]
            shape_type = sticker_shapes[idx % 5]
            icon_cx, icon_cy = cell_size//2, cell_size//2 - 4
            if shape_type == 'circle':
                cell_draw.ellipse([icon_cx-18, icon_cy-18, icon_cx+18, icon_cy+18], fill=icon_color)
                cell_draw.ellipse([icon_cx-6, icon_cy-6, icon_cx+6, icon_cy+6], fill=CREAM)
            elif shape_type == 'rounded':
                cell_draw.rounded_rectangle([icon_cx-16, icon_cy-16, icon_cx+16, icon_cy+16], radius=6, fill=icon_color)
                cell_draw.ellipse([icon_cx-5, icon_cy-5, icon_cx+5, icon_cy+5], fill=CREAM)
            else:
                if icon_color == AMBER:
                    cell_draw.ellipse([icon_cx-17, icon_cy-17, icon_cx+17, icon_cy+17], fill=AMBER)
                    # Draw heart cutout
                    cell_draw.ellipse([icon_cx-5, icon_cy-7, icon_cx+1, icon_cy-1], fill=CREAM)
                    cell_draw.ellipse([icon_cx-1, icon_cy-7, icon_cx+5, icon_cy-1], fill=CREAM)
                    cell_draw.polygon([(icon_cx-5, icon_cy-3), (icon_cx+4, icon_cy-3), (icon_cx, icon_cy+5)], fill=CREAM)
                else:
                    cell_draw.ellipse([icon_cx-17, icon_cy-17, icon_cx+17, icon_cy+17], fill=icon_color)
                    cell_draw.ellipse([icon_cx-5, icon_cy-5, icon_cx+5, icon_cy+5], fill=CREAM)
            # Label
            cell_draw.text((cell_size//2, cell_size-20), "贴纸", fill=INK_MD, font=font_small, anchor="mt")
        else:
            # Unearned: dashed border + faded
            cell_draw.rounded_rectangle([2, 2, cell_size-2, cell_size-2], radius=12, outline=(*DOT[:3], 120), width=2)
            cell_draw.text((cell_size//2, cell_size//2), "?", fill=(*INK_MD[:3], 60), font=font_body, anchor="mm")

        canvas.paste(cell, (cx, cy), cell)

# ── Section 3: Twin fox centerpiece (bottom area) ──
fx_big_y = 770
fox_big_size = 100

# Amber fox (left)
fox_a = fox_amber.resize((fox_big_size, fox_big_size), Image.LANCZOS).rotate(-5, expand=True, resample=Image.BICUBIC)
ax = 300 - fox_a.width//2
canvas.paste(fox_a, (ax, fx_big_y), fox_a)

# Gold fox (right)
fox_g = fox_gold.resize((fox_big_size, fox_big_size), Image.LANCZOS).rotate(3, expand=True, resample=Image.BICUBIC)
gx = 900 - fox_g.width//2
canvas.paste(fox_g, (gx, fx_big_y), fox_g)

# Orbit line between them
for angle_deg in range(0, 360, 3):
    angle = math.radians(angle_deg)
    cx_orbit = 600
    cy_orbit = fx_big_y + fox_big_size//2
    rx = 280
    ry = 15
    x = cx_orbit + rx * math.cos(angle)
    y = cy_orbit + ry * math.sin(angle)
    alpha = random.randint(15, 50)
    draw.ellipse([x-1, y-1, x+1, y+1], fill=(*INK_MD[:3], alpha))

# Center connection label
draw.text((600, fx_big_y + fox_big_size//2 + 25), "并蒂而生", fill=INK_MD, font=font_small, anchor="mt")
draw.text((600, fx_big_y + fox_big_size//2 + 45), "同步成长", fill=INK_MD, font=font_small, anchor="mt")

# ── Corner decorations — hand-drawn feel ──
# Bottom-left: stamp impression
stamp_cx, stamp_cy = 80, H - 100
for _ in range(3):
    rx = random.randint(-2, 2)
    ry = random.randint(-2, 2)
    draw.arc([stamp_cx-28+rx, stamp_cy-28+ry, stamp_cx+28+rx, stamp_cy+28+ry],
             start=0, end=360, fill=(*ROSE[:3], 40), width=2)
draw.text((stamp_cx, stamp_cy), "双宝记", fill=(*ROSE[:3], 80), font=font_small, anchor="mm")

# Bottom-right: decorative mark
draw.text((W-80, H-60), "✦", fill=(*INK_MD[:3], 60), font=font_title)

# ── Final polish — subtle vignette ──
vignette = Image.new("RGBA", (W, H), (0,0,0,0))
vignette_draw = ImageDraw.Draw(vignette)
for i in range(60):
    alpha = int(15 * (1 - i/60))
    vignette_draw.rectangle([i, i, W-i, H-i], outline=(*INK[:3], alpha))

canvas = Image.alpha_composite(canvas, vignette)

# ── Save ──
output_path = os.path.join(OUTPUT, "collected-warmth-canvas.png")
canvas.save(output_path, "PNG")
print(f"Canvas saved: {output_path}")
print(f"Size: {canvas.size}")
