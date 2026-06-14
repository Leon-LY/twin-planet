"""
双宝手帐 · 品牌资产生成器
生成: logo (app icon), share-brand (分享卡片), twin-mascots (吉祥物形象集)
"""
from PIL import Image, ImageDraw, ImageFont
import math, os

STATIC = os.path.join(os.path.dirname(__file__), 'src', 'static')
os.makedirs(STATIC, exist_ok=True)

# === 颜色 ===
WARM_PAPER = (254, 249, 240)
AMBER = (224, 123, 62)
AMBER_LIGHT = (240, 168, 112)
AMBER_DARK = (192, 104, 42)
ROSE = (212, 128, 104)
ROSE_LIGHT = (232, 170, 152)
ROSE_DARK = (176, 90, 64)
INK = (45, 35, 24)
INK_MD = (156, 142, 124)
INK_LT = (212, 200, 184)
GOLD = (200, 153, 62)
MINT = (92, 154, 110)
DOT = (232, 220, 200)

def round_corner_rect(draw, xy, r, fill=None, outline=None):
    """绘制圆角矩形"""
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, radius=r, fill=fill, outline=outline)

def draw_planet(draw, cx, cy, r, base_color, highlight_color, dark_color, face_emoji=None):
    """绘制一颗可爱小星球"""
    # 主体球
    for i in range(r, 0, -1):
        ratio = i / r
        r_mix = int(base_color[0] * ratio + dark_color[0] * (1 - ratio))
        g_mix = int(base_color[1] * ratio + dark_color[1] * (1 - ratio))
        b_mix = int(base_color[2] * ratio + dark_color[2] * (1 - ratio))
        draw.ellipse([cx - i, cy - i, cx + i, cy + i], fill=(r_mix, g_mix, b_mix))

    # 高光
    hl_x = cx - int(r * 0.35)
    hl_y = cy - int(r * 0.35)
    hl_w, hl_h = int(r * 0.55), int(r * 0.38)
    for i in range(hl_h, 0, -1):
        alpha = int(80 * (i / hl_h))
        draw.ellipse([hl_x - hl_w//2, hl_y - i, hl_x + hl_w//2, hl_y + i],
                     fill=(255, 255, 255, alpha) if hasattr(draw, 'rgba') else (255, 255, 255))

    # 眼睛
    eye_r = max(3, r // 7)
    eye_gap = r // 3
    for ex in [cx - eye_gap, cx + eye_gap]:
        draw.ellipse([ex - eye_r, cy - eye_r//2 - 2, ex + eye_r, cy + eye_r//2 + 2], fill=INK)
        # 眼白高光
        draw.ellipse([ex - eye_r//3, cy - eye_r//2 - 3, ex + eye_r//3, cy - 1], fill=(255, 255, 255))

    # 微笑嘴巴
    mouth_y = cy + r // 3
    mouth_w = r // 2
    draw.arc([cx - mouth_w, mouth_y - r//4, cx + mouth_w, mouth_y + r//4],
             start=0, end=180, fill=INK, width=max(2, r//12))

    # 腮红
    blush_r = r // 4
    for bx in [cx - r//2, cx + r//2]:
        blush_color = (255, 180, 140) if base_color == AMBER else (255, 170, 150)
        draw.ellipse([bx - blush_r, cy + r//6 - blush_r, bx + blush_r, cy + r//6 + blush_r],
                     fill=blush_color)

    # 小星星点缀
    star_r = max(2, r // 10)
    for sx, sy in [(cx - r//3, cy - r//2), (cx + r//3 + 4, cy + r//3)]:
        draw.ellipse([sx - star_r, sy - star_r, sx + star_r, sy + star_r], fill=(255, 255, 220))

def create_logo(size=256):
    """App 图标: 双宝星球 Logo"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 背景圆
    margin = size // 16
    bg_r = (size - margin * 2) // 2
    cx, cy = size // 2, size // 2
    draw.ellipse([margin, margin, size - margin, size - margin], fill=WARM_PAPER)

    # 两颗星球
    planet_r = size // 6
    gap = size // 8
    # 大宝 (左)
    draw_planet(draw, cx - gap, cy - planet_r//3, planet_r, AMBER, AMBER_LIGHT, AMBER_DARK)
    # 二宝 (右)
    draw_planet(draw, cx + gap, cy + planet_r//3, planet_r, ROSE, ROSE_LIGHT, ROSE_DARK)

    # 底部文字 "双宝"
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/simkai.ttf", size // 9)
    except:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), "双宝", font=font)
    tw = bbox[2] - bbox[0]
    draw.text((cx - tw//2, size - size//5), "双宝", fill=INK, font=font)

    path = os.path.join(STATIC, 'logo.png')
    img.save(path)
    print(f"Logo saved: {path}")
    return img

def create_share_brand(w=800, h=640):
    """品牌分享图"""
    img = Image.new('RGB', (w, h), WARM_PAPER)
    draw = ImageDraw.Draw(img)

    # 虚线边框
    dash_len = 12
    for i in range(0, w - 40, dash_len * 2):
        x = 20 + i
        draw.line([(x, 20), (min(x + dash_len, w - 20), 20)], fill=DOT, width=3)
        draw.line([(x, h - 20), (min(x + dash_len, w - 20), h - 20)], fill=DOT, width=3)
    for i in range(0, h - 40, dash_len * 2):
        y = 20 + i
        draw.line([(20, y), (20, min(y + dash_len, h - 20))], fill=DOT, width=3)
        draw.line([(w - 20, y), (w - 20, min(y + dash_len, h - 20))], fill=DOT, width=3)

    # 顶部双星球
    planet_r = 70
    draw_planet(draw, w//2 - 60, 160, planet_r, AMBER, AMBER_LIGHT, AMBER_DARK)
    draw_planet(draw, w//2 + 60, 180, planet_r, ROSE, ROSE_LIGHT, ROSE_DARK)

    # 连接线星星
    for sx, sy in [(w//2 - 30, 170), (w//2, 140), (w//2 + 30, 170)]:
        draw.ellipse([sx - 3, sy - 3, sx + 3, sy + 3], fill=GOLD)

    # 标题
    try:
        font_title = ImageFont.truetype("C:/Windows/Fonts/simkai.ttf", 56)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 28)
        font_brand = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 20)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_brand = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), "双宝手帐", font=font_title)
    tw = bbox[2] - bbox[0]
    draw.text((w//2 - tw//2, 280), "双宝手帐", fill=INK, font=font_title)

    bbox2 = draw.textbbox((0, 0), "两小只的成长记录本", font=font_sub)
    tw2 = bbox2[2] - bbox2[0]
    draw.text((w//2 - tw2//2, 350), "两小只的成长记录本", fill=INK_MD, font=font_sub)

    # 底部色条
    draw.rectangle([0, h - 28, w//2, h], fill=AMBER)
    draw.rectangle([w//2, h - 28, w, h], fill=ROSE)

    # 品牌标语
    bbox3 = draw.textbbox((0, 0), "双宝星球 · Twin Journal", font=font_brand)
    tw3 = bbox3[2] - bbox3[0]
    draw.text((w//2 - tw3//2, h - 60), "双宝星球 · Twin Journal", fill=(255, 255, 255, 180), font=font_brand)

    path = os.path.join(STATIC, 'share-brand.png')
    img.save(path)
    print(f"Share brand saved: {path}")
    return img

def create_mascots():
    """一组吉祥物小图: 用于头像、贴纸、空状态等"""
    sizes = {
        'mascot-avatar': (128, 128),    # 头像尺寸
        'mascot-sm': (64, 64),          # 小图标
        'mascot-linked': (200, 100),    # 双宝连接
    }

    # 头像: 单个星球
    for color_id, (name, base, light, dark) in enumerate([
        ('amber', AMBER, AMBER_LIGHT, AMBER_DARK),
        ('rose', ROSE, ROSE_LIGHT, ROSE_DARK),
    ]):
        img = Image.new('RGBA', (128, 128), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        draw_planet(draw, 64, 62, 52, base, light, dark)
        path = os.path.join(STATIC, f'mascot-{name}.png')
        img.save(path)
        print(f"Mascot saved: {path}")

    # 小图标
    for color_id, (name, base, light, dark) in enumerate([
        ('amber', AMBER, AMBER_LIGHT, AMBER_DARK),
        ('rose', ROSE, ROSE_LIGHT, ROSE_DARK),
    ]):
        img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        draw_planet(draw, 32, 30, 26, base, light, dark)
        path = os.path.join(STATIC, f'mascot-sm-{name}.png')
        img.save(path)
        print(f"Mascot saved: {path}")

    # 双宝连接图
    img = Image.new('RGBA', (200, 100), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_planet(draw, 55, 48, 40, AMBER, AMBER_LIGHT, AMBER_DARK)
    draw_planet(draw, 145, 52, 40, ROSE, ROSE_LIGHT, ROSE_DARK)
    # 连接虚线
    for x in range(95, 105):
        if (x - 95) % 6 < 3:
            draw.line([(x, 50), (x, 50)], fill=DOT, width=2)
    # 小星星
    draw.ellipse([96, 42, 100, 46], fill=GOLD)
    draw.ellipse([102, 54, 106, 58], fill=GOLD)
    path = os.path.join(STATIC, 'mascot-linked.png')
    img.save(path)
    print(f"Mascot saved: {path}")

def create_sticker_sheet():
    """贴纸集: 一组小 emoji 尺寸的装饰元素"""
    img = Image.new('RGBA', (320, 80), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    items = [
        (AMBER, "大宝"), (ROSE, "二宝"),
    ]
    x = 20
    for color, label in items:
        draw_planet(draw, x + 24, 40, 24, color,
                   AMBER_LIGHT if color == AMBER else ROSE_LIGHT,
                   AMBER_DARK if color == AMBER else ROSE_DARK)
        x += 70

    path = os.path.join(STATIC, 'sticker-sheet.png')
    img.save(path)
    print(f"Sticker sheet saved: {path}")

if __name__ == '__main__':
    import sys, io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    print("Generating Twin Journal brand assets...")
    create_logo(256)
    create_share_brand()
    create_mascots()
    create_sticker_sheet()
    print("All brand assets generated!")
    print(f"Output: {STATIC}")
