from PIL import Image, ImageDraw, ImageFont
import math

OUT = "E:/ly/project/twin-planet/docs"

def round_corner_mask(size, radius):
    """Create anti-aliased rounded rectangle mask"""
    from PIL import ImageFilter
    w, h = size
    mask = Image.new('L', (w*3, h*3), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([(0,0), (w*3, h*3)], radius*3, fill=255)
    mask = mask.resize((w, h), Image.LANCZOS)
    return mask

def create_logo_a():
    """方案A: 极简几何 — 两椭圆交叠"""
    SIZE = 800
    img = Image.new('RGBA', (SIZE, SIZE), (255, 251, 245, 255))  # #FFFBF5
    
    # 绘制圆形背景裁切区域（小程序图标风格）
    d = ImageDraw.Draw(img)
    cx, cy = SIZE//2, SIZE//2
    R = 360  # 圆形半径
    
    # 外圆背景 (暖白)
    d.ellipse([cx-R, cy-R, cx+R, cy+R], fill=(255, 251, 245, 255))
    
    # 蓝椭圆 (左侧)
    ex_w, ex_h = 140, 200
    ex_cx, ex_cy = cx - 52, cy
    d.ellipse(
        [ex_cx - ex_w//2, ex_cy - ex_h//2, ex_cx + ex_w//2, ex_cy + ex_h//2],
        fill=(66, 153, 225, 255)  # #4299E1
    )
    
    # 粉椭圆 (右侧)
    d.ellipse(
        [cx + 52 - ex_w//2, cy - ex_h//2, cx + 52 + ex_w//2, cy + ex_h//2],
        fill=(245, 101, 101, 255)  # #F56565
    )
    
    # 交叠处的白色隔线（让两个椭圆在重叠处有清晰边界）
    # 在中心画一条细白竖线
    d.line([(cx, cy - 90), (cx, cy + 90)], fill=(255, 255, 255, 180), width=3)
    
    img.save(f"{OUT}/logo-a-geometric.png", dpi=(300, 300))
    print("✅ Logo A saved")
    return img

def create_logo_b():
    """方案B: 并蒂花 — 双生莲花"""
    SIZE = 900
    img = Image.new('RGBA', (SIZE, SIZE), (255, 251, 245, 255))
    d = ImageDraw.Draw(img)
    
    cx, cy = SIZE//2, SIZE//2 + 30
    
    # 花茎 — 从底部中心向上延伸的柔和曲线
    stem_top = cy + 160
    stem_btm = SIZE - 80
    d.line([(cx, stem_top - 60), (cx - 6, stem_top + 80), (cx + 4, stem_btm)], 
           fill=(160, 180, 140, 255), width=10)
    d.line([(cx, stem_top - 60), (cx + 6, stem_top + 80), (cx - 4, stem_btm)], 
           fill=(160, 180, 140, 255), width=10)
    
    # 花萼 — 底部小绿叶
    leaf_pts = [(cx, stem_top - 70), (cx - 50, stem_top - 110), (cx - 30, stem_top - 130),
                (cx, stem_top - 105), (cx + 30, stem_top - 130), (cx + 50, stem_top - 110)]
    d.polygon(leaf_pts, fill=(140, 200, 140, 255))
    
    # 粉色花 (左侧花)
    def draw_petal(cx_p, cy_p, w, h, angle, color):
        """画一片花瓣通过椭圆旋转"""
        petal = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
        pd = ImageDraw.Draw(petal)
        pd.ellipse([cx_p - w//2, cy_p - h//2, cx_p + w//2, cy_p + h//2], fill=color)
        petal = petal.rotate(angle, center=(cx_p, cy_p), resample=Image.BICUBIC)
        return petal
    
    # 左侧蓝色花
    blue_center_x = cx - 100
    blue_center_y = cy - 40
    blue_petals = [
        (blue_center_x, blue_center_y - 60, 50, 110, 0),
        (blue_center_x + 35, blue_center_y - 30, 50, 110, 40),
        (blue_center_x + 40, blue_center_y + 20, 50, 110, 80),
        (blue_center_x, blue_center_y + 50, 50, 110, 130),
        (blue_center_x - 40, blue_center_y + 20, 50, 110, 180),
        (blue_center_x - 35, blue_center_y - 30, 50, 110, 230),
    ]
    for px, py, pw, ph, angle in blue_petals:
        petal = draw_petal(px, py, pw, ph, angle, (66, 153, 225, 240))
        img = Image.alpha_composite(img, petal)
        d = ImageDraw.Draw(img)
    
    # 花心 (蓝色)
    d.ellipse([blue_center_x - 22, blue_center_y - 22, blue_center_x + 22, blue_center_y + 22],
              fill=(200, 230, 160, 255))
    
    # 右侧粉色花
    pink_center_x = cx + 100
    pink_center_y = cy - 80
    pink_petals = [
        (pink_center_x, pink_center_y - 60, 50, 110, 0),
        (pink_center_x + 35, pink_center_y - 30, 50, 110, 40),
        (pink_center_x + 40, pink_center_y + 20, 50, 110, 80),
        (pink_center_x, pink_center_y + 50, 50, 110, 130),
        (pink_center_x - 40, pink_center_y + 20, 50, 110, 180),
        (pink_center_x - 35, pink_center_y - 30, 50, 110, 230),
    ]
    for px, py, pw, ph, angle in pink_petals:
        petal = draw_petal(px, py, pw, ph, angle, (245, 101, 101, 240))
        img = Image.alpha_composite(img, petal)
        d = ImageDraw.Draw(img)
    
    # 花心 (粉色)
    d.ellipse([pink_center_x - 22, pink_center_y - 22, pink_center_x + 22, pink_center_y + 22],
              fill=(200, 230, 160, 255))
    
    img.save(f"{OUT}/logo-b-lotus.png", dpi=(300, 300))
    print("✅ Logo B saved")
    return img

def create_logo_c():
    """方案C: 双星轨迹 — 两颗星球并肩运行"""
    SIZE = 900
    img = Image.new('RGBA', (SIZE, SIZE), (26, 32, 44, 255))  # 深色背景 #1A202C
    d = ImageDraw.Draw(img)
    
    cx, cy = SIZE//2, SIZE//2
    
    # 轨道弧线 (浅灰虚线感)
    for deg in range(0, 360, 6):
        r = 260
        x1 = cx + r * 0.45
        y1 = cy
        r_eff = ((r * math.cos(math.radians(deg)))**2 + (r * 0.55 * math.sin(math.radians(deg)))**2)**0.5
        # 画短小的轨道标记
        orbit_x = cx + r_eff * math.cos(math.radians(deg))
        orbit_y = cy + r_eff * 0.55 * math.sin(math.radians(deg))
        if deg % 18 == 0:
            d.ellipse([orbit_x - 2, orbit_y - 2, orbit_x + 2, orbit_y + 2], 
                      fill=(100, 120, 140, 80))
    
    # 蓝色星球 (左侧较大)
    blue_r = 95
    blue_x, blue_y = cx - 130, cy - 20
    # 星球本体
    d.ellipse([blue_x - blue_r, blue_y - blue_r, blue_x + blue_r, blue_y + blue_r],
              fill=(66, 153, 225, 255))
    # 光晕
    d.ellipse([blue_x - blue_r - 12, blue_y - blue_r - 12, blue_x + blue_r + 12, blue_y + blue_r + 12],
              outline=(66, 153, 225, 100), width=2)
    # 高光
    d.ellipse([blue_x - blue_r//3, blue_y - blue_r*2//3, blue_x + blue_r//4, blue_y - blue_r//3],
              fill=(130, 200, 255, 120))
    # 环形纹理
    d.ellipse([blue_x - blue_r//2, blue_y - 8, blue_x + blue_r//2, blue_y + 8],
              fill=(40, 120, 200, 80))
    
    # 粉色星球 (右侧较小)
    pink_r = 75
    pink_x, pink_y = cx + 120, cy + 50
    d.ellipse([pink_x - pink_r, pink_y - pink_r, pink_x + pink_r, pink_y + pink_r],
              fill=(245, 101, 101, 255))
    d.ellipse([pink_x - pink_r - 10, pink_y - pink_r - 10, pink_x + pink_r + 10, pink_y + pink_r + 10],
              outline=(245, 101, 101, 100), width=2)
    # 高光
    d.ellipse([pink_x - pink_r//3, pink_y - pink_r*2//3, pink_x + pink_r//4, pink_y - pink_r//3],
              fill=(255, 160, 160, 110))
    # 环形
    d.ellipse([pink_x - pink_r//2, pink_y - 6, pink_x + pink_r//2, pink_y + 6],
              fill=(200, 70, 70, 80))
    
    # 小星星点缀
    stars = [(cx + 200, cy - 180), (cx - 220, cy - 140), (cx + 80, cy - 220),
             (cx - 140, cy + 200), (cx - 250, cy + 80), (cx + 180, cy + 160)]
    for sx, sy in stars:
        r_star = 3 + ((sx * sy) % 5)
        d.ellipse([sx - r_star, sy - r_star, sx + r_star, sy + r_star],
                  fill=(255, 251, 245, 180))
    
    img.save(f"{OUT}/logo-c-twinstars.png", dpi=(300, 300))
    print("✅ Logo C saved")
    return img

print("Generating 并蒂星球 logos...")
create_logo_a()
create_logo_b()
create_logo_c()
print("✅ All 3 logos generated")
