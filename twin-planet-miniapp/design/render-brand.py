"""
双宝星球 · Warm Gravitation 品牌视觉渲染
Produces museum-quality, hand-crafted brand artifacts.
Philosophy: Two bodies in tender orbit — never identical, never symmetrical, always balanced.
"""
import math, random, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

# === Paths ===
DESIGN_DIR = os.path.dirname(__file__)
STATIC_DIR = os.path.join(os.path.dirname(DESIGN_DIR), 'src', 'static')
CANVAS_FONTS = os.path.join(os.path.dirname(os.path.dirname(DESIGN_DIR)),
                            '.claude', 'skills', 'canvas-design', 'canvas-fonts')
os.makedirs(STATIC_DIR, exist_ok=True)

# === Palette: Warm Gravitation ===
PAPER   = (254, 249, 240)
AMBER   = (224, 123, 62)
AMBER_D = (192, 104, 42)
AMBER_L = (240, 168, 112)
ROSE    = (212, 128, 104)
ROSE_D  = (176, 90, 64)
ROSE_L  = (232, 170, 152)
INK     = (45, 35, 24)
INK_MD  = (156, 142, 124)
INK_LT  = (212, 200, 184)
GOLD    = (200, 153, 62)
MINT    = (92, 154, 110)
DOT     = (232, 220, 200)

# === Load fonts ===
def load_font(name, size):
    paths = [
        os.path.join(CANVAS_FONTS, name),
        f"C:/Windows/Fonts/{name}",
        os.path.join(CANVAS_FONTS, name.replace('.ttf','-Regular.ttf')),
    ]
    for p in paths:
        try: return ImageFont.truetype(p, size)
        except: pass
    try: return ImageFont.truetype("C:/Windows/Fonts/simkai.ttf", size)
    except: return ImageFont.load_default()

# font aliases
f_display = lambda s: load_font('CrimsonPro-Regular.ttf', s)  # elegant serif
f_display_bold = lambda s: load_font('CrimsonPro-Bold.ttf', s)
f_hand = lambda s: load_font('NothingYouCouldDo-Regular.ttf', s)  # hand-drawn
f_kai = lambda s: load_font('simkai.ttf', s)  # Chinese KaiTi
f_thin = lambda s: load_font('PoiretOne-Regular.ttf', s)  # whisper labels
f_serif = lambda s: load_font('IBMPlexSerif-Regular.ttf', s)  # refined body

# === Paper texture ===
def add_paper_texture(img, intensity=0.03):
    """Add subtle paper grain — the evidence of materiality."""
    w, h = img.size
    noise = Image.new('L', (w, h))
    for y in range(h):
        for x in range(w):
            v = int(128 + random.gauss(0, 255 * intensity))
            noise.putpixel((x, y), max(0, min(255, v)))
    noise = noise.filter(ImageFilter.GaussianBlur(1.5))
    img.paste(Image.merge('RGB', (noise, noise, noise)), mask=Image.eval(noise, lambda v: 255 - abs(v - 128)))
    return img

# === Hand-drawn circle (imperfect, organic) ===
def hand_circle(draw, cx, cy, r, fill=None, outline=None, width=2, wobble=0.03):
    """Draw a circle with organic hand-drawn wobble — never perfectly round."""
    points = []
    steps = 80
    for i in range(steps):
        angle = 2 * math.pi * i / steps
        wobble_r = r * (1 + random.uniform(-wobble, wobble))
        x = cx + wobble_r * math.cos(angle)
        y = cy + wobble_r * math.sin(angle)
        points.append((x, y))
    if fill:
        draw.polygon(points, fill=fill)
    if outline:
        for i in range(len(points)):
            j = (i + 1) % len(points)
            draw.line([points[i], points[j]], fill=outline, width=width)

# === Draw a planet sphere with depth ===
def draw_planet(draw, cx, cy, r, base, highlight, dark):
    """A sphere with volumetric depth — like a small world with atmosphere."""
    # Atmosphere glow
    for i in range(int(r * 0.15), 0, -1):
        alpha = int(20 * (1 - i / (r * 0.15)))
        glow_r = r + i
        draw.ellipse([cx - glow_r, cy - glow_r, cx + glow_r, cy + glow_r],
                     fill=(base[0], base[1], base[2], alpha) if len(base) == 3 else base)

    # Main body — radial gradient via concentric ellipses
    for i in range(r, 0, -1):
        ratio = (r - i) / r
        t = ratio ** 0.55  # non-linear for volumetric feel
        rr = int(base[0] * (1 - t) + dark[0] * t)
        gg = int(base[1] * (1 - t) + dark[1] * t)
        bb = int(base[2] * (1 - t) + dark[2] * t)
        draw.ellipse([cx - i, cy - i, cx + i, cy + i], fill=(rr, gg, bb))

    # Highlight — elliptical, off-center (key light from upper-left)
    hl_x = cx - int(r * 0.32)
    hl_y = cy - int(r * 0.32)
    hl_w = int(r * 0.52)
    hl_h = int(r * 0.35)
    for i in range(hl_h, 0, -1):
        alpha = int(70 * (i / hl_h) * 0.6)
        draw.ellipse([hl_x - hl_w // 2, hl_y - i, hl_x + hl_w // 2, hl_y + i],
                     fill=(255, 255, 255, alpha))

    # Rim light (subtle secondary reflection on opposite side)
    rim_x = cx + int(r * 0.35)
    rim_y = cy + int(r * 0.35)
    for i in range(int(r * 0.12), 0, -1):
        alpha = int(25 * (i / (r * 0.12)))
        draw.ellipse([rim_x - i, rim_y - i, rim_x + i, rim_y + i],
                     fill=(255, 255, 255, alpha))

def draw_planet_face(draw, cx, cy, r, expression='smile'):
    """Give a planet a tiny, charming face."""
    # Eyes — slightly different sizes for personality
    eye_y = cy - int(r * 0.08)
    eye_gap = int(r * 0.28)
    eye_r = max(3, r // 9)
    eye_r2 = max(2, r // 10)  # slightly smaller eye

    for pos, er in [(-1, eye_r), (1, eye_r2)]:
        ex = cx + pos * eye_gap
        draw.ellipse([ex - er, eye_y - er, ex + er, eye_y + er], fill=INK)
        # eye sparkle
        spark_r = max(1, er // 3)
        draw.ellipse([ex - spark_r, eye_y - er, ex + spark_r, eye_y - er + spark_r * 2],
                     fill=(255, 255, 255))

    # Mouth
    mouth_y = cy + int(r * 0.2)
    mouth_w = int(r * 0.35)
    if expression == 'smile':
        draw.arc([cx - mouth_w, mouth_y - r // 5, cx + mouth_w, mouth_y + r // 5],
                 start=0, end=180, fill=INK, width=max(1, r // 14))
    elif expression == 'grin':
        draw.arc([cx - mouth_w, mouth_y - r // 4, cx + mouth_w, mouth_y + r // 4],
                 start=0, end=180, fill=INK, width=max(2, r // 10))
        # open mouth fill
        draw.chord([cx - mouth_w // 3, mouth_y - 2, cx + mouth_w // 3, mouth_y + r // 5],
                   start=0, end=180, fill=INK)

    # Blush spots
    blush_r = max(3, r // 5)
    for bx, blush_c in [(cx - r // 2, (255, 175, 135)), (cx + r // 2, (255, 165, 145))]:
        for i in range(blush_r, 0, -1):
            alpha = int(50 * (i / blush_r))
            draw.ellipse([bx - i, cy + r // 8 - i, bx + i, cy + r // 8 + i],
                         fill=(blush_c[0], blush_c[1], blush_c[2], alpha))


# ═══════════════════════════════════════════════════
# CANVAS 1: Brand Soul — Abstract orbital composition
# ═══════════════════════════════════════════════════
def create_brand_canvas(w=1200, h=800):
    """The master brand canvas — museum-quality abstract composition."""
    random.seed(42)  # reproducible wobble for hand-drawn elements
    img = Image.new('RGBA', (w, h), PAPER)
    draw = ImageDraw.Draw(img, 'RGBA')

    # === Ground: paper-textured field ===
    # Subtle concentric rings suggesting orbital paths
    center_x, center_y = w // 2, h // 2
    for i, r_val in enumerate(range(80, 520, 80)):
        alpha = 15 - i * 2
        draw.ellipse([center_x - r_val, center_y - r_val,
                      center_x + r_val, center_y + r_val],
                     outline=(INK[0], INK[1], INK[2], max(alpha, 3)), width=1)

    # === Twin bodies ===
    # Amber planet (left, slightly larger, more energetic)
    amber_cx, amber_cy = center_x - 140, center_y - 30
    amber_r = 155
    draw_planet(draw, amber_cx, amber_cy, amber_r, AMBER, AMBER_L, AMBER_D)
    draw_planet_face(draw, amber_cx, amber_cy, amber_r, 'smile')

    # Rose planet (right, slightly smaller, gentler)
    rose_cx, rose_cy = center_x + 140, center_y + 40
    rose_r = 135
    draw_planet(draw, rose_cx, rose_cy, rose_r, ROSE, ROSE_L, ROSE_D)
    draw_planet_face(draw, rose_cx, rose_cy, rose_r, 'smile')

    # === Connection: hand-drawn dashed arc between them ===
    pts = []
    for i in range(40):
        t = i / 39
        angle = math.pi - t * math.pi * 0.7
        rx = (amber_cx + rose_cx) / 2 - amber_cx + 60
        ry = 300
        x = center_x + rx * math.cos(angle) * 0.6
        y = center_y - 30 + ry * math.sin(angle - math.pi / 2 + 0.3) * 0.5
        pts.append((x, y))
    for i in range(0, len(pts) - 1, 3):
        draw.line([pts[i], pts[i + 1]], fill=(GOLD[0], GOLD[1], GOLD[2], 80), width=2)

    # Tiny stars along the connection
    for pos in [0.15, 0.35, 0.55, 0.75]:
        idx = int(pos * (len(pts) - 1))
        sx, sy = pts[idx]
        star_r = 5
        draw.ellipse([sx - star_r, sy - star_r, sx + star_r, sy + star_r],
                     fill=(GOLD[0], GOLD[1], GOLD[2], 160))

    # === Orbital dust — tiny dots trailing each planet ===
    for planet_cx, planet_cy, pr, color in [
        (amber_cx, amber_cy, amber_r, AMBER),
        (rose_cx, rose_cy, rose_r, ROSE)
    ]:
        for _ in range(12):
            angle = random.uniform(0, 2 * math.pi)
            dist = pr + random.randint(pr // 5, pr // 2)
            dot_x = planet_cx + dist * math.cos(angle)
            dot_y = planet_cy + dist * math.sin(angle)
            dot_r = random.randint(1, 4)
            draw.ellipse([dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r],
                         fill=(color[0], color[1], color[2], random.randint(30, 80)))

    # === Typography ===
    font_display = f_display_bold(52)
    font_sub = f_thin(22)
    font_kaiti = f_kai(48)
    font_hand = f_hand(26)

    # Chinese brand name — KaiTi, warm
    ctext = "双宝星球"
    bbox = draw.textbbox((0, 0), ctext, font=font_kaiti)
    tw = bbox[2] - bbox[0]
    draw.text((center_x - tw // 2, h - 160), ctext, fill=INK, font=font_kaiti)

    # English subtitle
    etext = "Twin Journal"
    bbox2 = draw.textbbox((0, 0), etext, font=font_display)
    tw2 = bbox2[2] - bbox2[0]
    draw.text((center_x - tw2 // 2, h - 105), etext, fill=INK_MD, font=font_display)

    # Hand-drawn tagline
    tag = "two small planets · one shared orbit"
    bbox3 = draw.textbbox((0, 0), tag, font=font_hand)
    tw3 = bbox3[2] - bbox3[0]
    draw.text((center_x - tw3 // 2, h - 70), tag, fill=INK_LT, font=font_hand)

    # Bottom swatches
    draw.rectangle([0, h - 8, w // 2, h], fill=AMBER)
    draw.rectangle([w // 2, h - 8, w, h], fill=ROSE)

    # Add subtle paper texture
    img_rgb = img.convert('RGB')
    add_paper_texture(img_rgb, intensity=0.015)

    path = os.path.join(DESIGN_DIR, 'brand-canvas.png')
    img_rgb.save(path, quality=95)
    print(f"Brand canvas: {path}")
    return img_rgb


# ═══════════════════════════════════════════════════
# CANVAS 2: App Icon — Square format for WeChat
# ═══════════════════════════════════════════════════
def create_app_icon(size=512):
    """Minimal, iconic — for the WeChat app icon slot."""
    random.seed(99)
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, 'RGBA')

    # Background disc — warm paper
    margin = size // 14
    draw.ellipse([margin, margin, size - margin, size - margin], fill=PAPER)

    # Two small planets, intimate scale
    cx, cy = size // 2, size // 2
    gap = size // 7
    r_a, r_b = size // 5, size // 5

    # Amber (upper-left of center)
    draw_planet(draw, cx - gap, cy - gap // 3, r_a, AMBER, AMBER_L, AMBER_D)
    draw_planet_face(draw, cx - gap, cy - gap // 3, r_a, 'smile')

    # Rose (lower-right of center)
    draw_planet(draw, cx + gap, cy + gap // 3, r_b, ROSE, ROSE_L, ROSE_D)
    draw_planet_face(draw, cx + gap, cy + gap // 3, r_b, 'smile')

    # Tiny gold star between them
    star_x, star_y = cx, cy - gap // 4
    star_r = size // 30
    draw.ellipse([star_x - star_r, star_y - star_r, star_x + star_r, star_y + star_r],
                 fill=GOLD)

    path = os.path.join(STATIC_DIR, 'logo.png')
    img.save(path)
    print(f"App icon: {path}")

    # Also save app-icon for design reference
    path2 = os.path.join(DESIGN_DIR, 'app-icon.png')
    img.save(path2)
    print(f"App icon ref: {path2}")
    return img


# ═══════════════════════════════════════════════════
# CANVAS 3: Individual Mascot Portraits
# ═══════════════════════════════════════════════════
def create_mascot_portrait(color_name, base, light, dark, size=512, expression='grin'):
    """A single planet mascot — full of personality."""
    random.seed(hash(color_name) % 10000)
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, 'RGBA')

    cx, cy = size // 2, size // 2
    r = size // 3

    # Soft glow behind
    for i in range(int(r * 0.4), 0, -1):
        alpha = int(15 * (1 - i / (r * 0.4)))
        draw.ellipse([cx - r - i, cy - r - i, cx + r + i, cy + r + i],
                     fill=(base[0], base[1], base[2], alpha))

    draw_planet(draw, cx, cy, r, base, light, dark)
    draw_planet_face(draw, cx, cy, r, expression)

    # Orbit ring (partial, hand-drawn)
    ring_r = r + 30
    for i in range(60):
        angle = i / 59 * 2 * math.pi * 0.7 + 0.5
        x1 = cx + ring_r * math.cos(angle)
        y1 = cy + ring_r * math.sin(angle)
        x2 = cx + ring_r * math.cos(angle + 0.04)
        y2 = cy + ring_r * math.sin(angle + 0.04)
        draw.line([(x1, y1), (x2, y2)], fill=(base[0], base[1], base[2], 40), width=1)

    path = os.path.join(STATIC_DIR, f'mascot-{color_name}.png')
    img.save(path)
    print(f"Mascot {color_name}: {path}")

    # Small version
    img_sm = img.resize((128, 128), Image.LANCZOS)
    path_sm = os.path.join(STATIC_DIR, f'mascot-sm-{color_name}.png')
    img_sm.save(path_sm)
    print(f"Mascot sm {color_name}: {path_sm}")
    return img


# ═══════════════════════════════════════════════════
# CANVAS 4: Twin Connection — two planets together
# ═══════════════════════════════════════════════════
def create_twin_linked(size_w=600, size_h=300):
    """Two planets with their orbital bond visible."""
    random.seed(77)
    img = Image.new('RGBA', (size_w, size_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, 'RGBA')

    cx_a, cx_b = size_w // 3, 2 * size_w // 3
    cy = size_h // 2
    r = size_h // 3

    # Amber
    draw_planet(draw, cx_a, cy - r // 5, r, AMBER, AMBER_L, AMBER_D)
    draw_planet_face(draw, cx_a, cy - r // 5, r, 'smile')

    # Rose
    draw_planet(draw, cx_b, cy + r // 5, r, ROSE, ROSE_L, ROSE_D)
    draw_planet_face(draw, cx_b, cy + r // 5, r, 'smile')

    # Connection — dashed arc
    for i in range(60):
        t = i / 59
        x = cx_a + (cx_b - cx_a) * t
        y = cy - 50 * math.sin(t * math.pi)
        if i % 4 < 2:
            draw.ellipse([x - 2, y - 2, x + 2, y + 2], fill=(GOLD[0], GOLD[1], GOLD[2], 120))

    # Midpoint star
    mx, my = (cx_a + cx_b) // 2, cy - 20
    for i in range(8, 0, -1):
        alpha = int(100 * (i / 8))
        draw.ellipse([mx - i, my - i, mx + i, my + i], fill=(GOLD[0], GOLD[1], GOLD[2], alpha))

    path = os.path.join(STATIC_DIR, 'mascot-linked.png')
    img.save(path)
    print(f"Twin linked: {path}")

    # Shared card version
    img_share = img.resize((200, 100), Image.LANCZOS)
    path_sm = os.path.join(STATIC_DIR, 'mascot-share.png')
    img_share.save(path_sm)
    return img


# ═══════════════════════════════════════════════════
# CANVAS 5: Share / Brand Card
# ═══════════════════════════════════════════════════
def create_share_card(w=1000, h=800):
    """The card users share to WeChat — warm, crafted, memorable."""
    random.seed(123)
    img = Image.new('RGBA', (w, h), PAPER)
    draw = ImageDraw.Draw(img, 'RGBA')

    # Border — doubled, dashed inner
    m = 30
    draw.rectangle([m, m, w - m, h - m], outline=DOT, width=2)
    # dashed inner
    for i in range(0, w - 2 * m - 20, 14):
        draw.line([(m + 12 + i, m + 12), (min(m + 12 + i + 6, w - m - 12), m + 12)],
                  fill=(INK_LT[0], INK_LT[1], INK_LT[2], 60), width=1)
        draw.line([(m + 12 + i, h - m - 12), (min(m + 12 + i + 6, w - m - 12), h - m - 12)],
                  fill=(INK_LT[0], INK_LT[1], INK_LT[2], 60), width=1)

    # Twin planets — centered, intimate
    cx, cy = w // 2, h // 3
    draw_planet(draw, cx - 70, cy - 10, 80, AMBER, AMBER_L, AMBER_D)
    draw_planet_face(draw, cx - 70, cy - 10, 80, 'smile')
    draw_planet(draw, cx + 70, cy + 20, 75, ROSE, ROSE_L, ROSE_D)
    draw_planet_face(draw, cx + 70, cy + 20, 75, 'smile')

    # Golden connection dots
    for t in [0.25, 0.5, 0.75]:
        x = cx - 70 + (140) * t
        y = cy + 5 - 25 * math.sin(t * math.pi)
        draw.ellipse([x - 4, y - 4, x + 4, y + 4], fill=GOLD)

    # Typography
    title_font = f_kai(60)
    sub_font = f_display(30)
    hand_font = f_hand(24)

    title = "双宝手帐"
    bb = draw.textbbox((0, 0), title, font=title_font)
    draw.text((w // 2 - (bb[2] - bb[0]) // 2, h // 2 + 20), title, fill=INK, font=title_font)

    sub = "Twin Journal"
    bb2 = draw.textbbox((0, 0), sub, font=sub_font)
    draw.text((w // 2 - (bb2[2] - bb2[0]) // 2, h // 2 + 80), sub, fill=INK_MD, font=sub_font)

    tag = "两小只的成长记录本"
    bb3 = draw.textbbox((0, 0), tag, font=hand_font)
    draw.text((w // 2 - (bb3[2] - bb3[0]) // 2, h // 2 + 120), tag, fill=INK_LT, font=hand_font)

    # Bottom divider
    draw.line([(w // 3, h - 80), (2 * w // 3, h - 80)], fill=DOT, width=1)

    # Footer
    footer_font = f_thin(18)
    footer = "双宝星球 · 中国首款双胞胎育儿伴侣"
    bb4 = draw.textbbox((0, 0), footer, font=footer_font)
    draw.text((w // 2 - (bb4[2] - bb4[0]) // 2, h - 55), footer, fill=INK_LT, font=footer_font)

    # Bottom color bars
    draw.rectangle([0, h - 10, w // 2, h], fill=AMBER)
    draw.rectangle([w // 2, h - 10, w, h], fill=ROSE)

    path = os.path.join(STATIC_DIR, 'share-brand.png')
    img_rgb = img.convert('RGB')
    add_paper_texture(img_rgb, intensity=0.01)
    img_rgb.save(path, quality=95)
    print(f"Share card: {path}")
    return img_rgb


# ═══════════════════════════════════════════════════
# RENDER ALL
# ═══════════════════════════════════════════════════
if __name__ == '__main__':
    import sys, io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    print("═" * 50)
    print("  Warm Gravitation · Brand Artifacts")
    print("  Two bodies in tender orbit.")
    print("═" * 50)

    create_brand_canvas()
    create_app_icon(512)
    create_mascot_portrait('amber', AMBER, AMBER_L, AMBER_D, expression='grin')
    create_mascot_portrait('rose', ROSE, ROSE_L, ROSE_D, expression='smile')
    create_twin_linked()
    create_share_card()

    print("\nDone. Each artifact crafted with painstaking attention.")
    print(f"Static assets → {STATIC_DIR}")
    print(f"Design reference → {DESIGN_DIR}")
