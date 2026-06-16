"""
Collected Warmth — Fox Sticker Art Canvas v2 (Refined)
Museum-quality journal-page artwork. Every element placed with painstaking attention.
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math, random

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
MINIAPP = os.path.join(ROOT, "twin-planet-miniapp")
STATIC = os.path.join(MINIAPP, "src", "static")
OUTPUT = os.path.dirname(os.path.abspath(__file__))

# Load fox assets
fox_a128 = Image.open(os.path.join(STATIC, "mascot-amber-fox-nobg-128.png")).convert("RGBA")
fox_g128 = Image.open(os.path.join(STATIC, "mascot-gold-fox-nobg-128.png")).convert("RGBA")

# ── Colors ──
P = (254,249,240,255)  # paper
C = (255,245,232,255)  # cream
A = (224,123,62,255)   # amber
G = (200,153,62,255)   # gold
R = (212,128,104,255)  # rose
M = (92,154,110,255)   # mint
I = (45,35,24,255)     # ink
IM = (156,142,124,255) # ink-md
D = (232,220,200,255)  # dot

W, H = 1200, 900
cv = Image.new("RGBA", (W, H), P)
dr = ImageDraw.Draw(cv)

random.seed(42)

# ═══ PAPER TEXTURE — natural grain ═══
for _ in range(12000):
    x = random.randint(0, W-1)
    y = random.randint(0, H-1)
    v = random.randint(-2, 2)
    px = cv.getpixel((x, y))
    cv.putpixel((x, y), (
        max(0, min(255, px[0]+v)),
        max(0, min(255, px[1]+v)),
        max(0, min(255, px[2]+v)),
        255
    ))

# ═══ DOT GRID — journal ruling ═══
for x in range(80, W, 48):
    for y in range(80, H, 48):
        cv.putpixel((x, y), (*I[:3], random.randint(12, 30)))

# ═══ TYPOGRAPHY ═══
try:
    ft = ImageFont.truetype("C:/Windows/Fonts/simsun.ttc", 34)
    fb = ImageFont.truetype("C:/Windows/Fonts/simsun.ttc", 17)
    fs = ImageFont.truetype("C:/Windows/Fonts/simsun.ttc", 13)
except:
    ft = fb = fs = ImageFont.load_default()

dr.text((80, 44), "贴纸收集册", fill=I, font=ft)
dr.text((80, 84), "Sticker Collection   ·   并蒂而生，同步成长", fill=IM, font=fs)
# Decorative ink line under title
for i in range(80, 600):
    cv.putpixel((i, 108), (*D[:3], random.randint(80, 140)))
dr.text((80, 124), "✦  今日收集", fill=IM, font=fb)

# ═══ TODAYʼS STRIP — 7 fox stickers in a row ═══
ys = 168
for i in range(7):
    x = 80 + i * 108 + random.randint(-4, 4)
    y = ys + random.randint(-2, 2)
    rot = random.uniform(-3.5, 3.5)
    sz = 44

    foxy = fox_a128 if i % 2 == 0 else fox_g128
    foxy_s = foxy.resize((sz, sz), Image.LANCZOS).rotate(rot, expand=True, resample=Image.BICUBIC)

    # Shadow
    sh = Image.new("RGBA", (sz+32, sz+32), (0,0,0,0))
    ImageDraw.Draw(sh).ellipse([16, 20, sz+24, sz+32], fill=(*I[:3], 18))
    sh = sh.filter(ImageFilter.GaussianBlur(5))
    cv.paste(sh, (x-8, y-4), sh)

    # Sticker base
    base = Image.new("RGBA", (sz+28, sz+28), (0,0,0,0))
    bd = ImageDraw.Draw(base)
    bd.ellipse([4, 4, sz+24, sz+24], fill=C, outline=(255,255,255,200), width=3)
    # Shine
    bd.ellipse([10,8, sz+16, sz//2+8], fill=(255,255,255,35))
    base.paste(foxy_s, ((base.width-foxy_s.width)//2, (base.height-foxy_s.height)//2), foxy_s)
    cv.paste(base, (x, y), base)

# ═══ COLLECTION HEADER + PROGRESS ═══
dr.text((80, 268), "✦  全部贴纸", fill=IM, font=fb)
dr.text((200, 268), "8 / 21 已收集", fill=M, font=fb)

bx, by, bw, bh = 80, 294, 1040, 3
dr.rounded_rectangle([bx, by, bx+bw, by+bh], radius=2, fill=D)
dr.rounded_rectangle([bx, by, bx+int(bw*0.38), by+bh], radius=2, fill=G)

# ═══ COLLECTION GRID — 20 cells, 8 earned ═══
gx0, gy0 = 80, 318
cs, gap = 112, 8
earned = {0,1,2,5,6,10,12,15}

for row in range(4):
    for col in range(5):
        idx = row*5+col
        cx = gx0 + col*(cs+gap)
        cy = gy0 + row*(cs+gap)
        cell = Image.new("RGBA", (cs, cs), (0,0,0,0))
        cd = ImageDraw.Draw(cell)

        if idx in earned:
            # Shadow → white border → gold gradient → emboss
            cd.rounded_rectangle([3,6,cs-1,cs+3], radius=14, fill=(*I[:3],22))
            cd.rounded_rectangle([1,1,cs-3,cs-3], radius=14, fill=C, outline=(255,255,255,210), width=3)
            for gy in range(cs-3):
                ratio = gy/cs
                r = int(C[0]+(G[0]-C[0])*ratio*0.12)
                g = int(C[1]+(G[1]-C[1])*ratio*0.12)
                b = int(C[2]+(G[2]-C[2])*ratio*0.12)
                cd.line([(3,gy+1),(cs-5,gy+1)], fill=(r,g,b,20))
            cd.ellipse([cs//4,5, 3*cs//4,cs//3], fill=(255,255,255,25))

            # Draw fox icon in earned cells (alternating)
            fox_color = A if idx%2==0 else G
            foxy_sm = (fox_a128 if idx%2==0 else fox_g128).resize((36,36), Image.LANCZOS)
            fx = (cs-foxy_sm.width)//2
            fy = (cs-foxy_sm.height)//2 - 8
            cell.paste(foxy_sm, (fx, fy), foxy_sm)
            # Label below
            cd.text((cs//2, cs-22), "贴纸", fill=I, font=fs, anchor="mt")
        else:
            cd.rounded_rectangle([3,3,cs-3,cs-3], radius=14, outline=(*D[:3],100), width=2)
            cd.text((cs//2, cs//2), "?", fill=(*IM[:3],50), font=fb, anchor="mm")

        cv.paste(cell, (cx, cy), cell)

# ═══ TWIN FOX CENTERPIECE — bottom ═══
fby = 808
fsz = 88

for i, (fox, xpos, rot) in enumerate([
    (fox_a128, 260, -4),
    (fox_g128, 940, 3)
]):
    fb_ = fox.resize((fsz, fsz), Image.LANCZOS).rotate(rot, expand=True, resample=Image.BICUBIC)
    cv.paste(fb_, (xpos - fb_.width//2, fby), fb_)

# Orbit arc between them
cx_o, cy_o = 600, fby+fsz//2
for deg in range(0, 360, 2):
    ang = math.radians(deg)
    rx, ry = 310, 12
    x = cx_o + rx*math.cos(ang)
    y = cy_o + ry*math.sin(ang)
    cv.putpixel((round(x), round(y)), (*IM[:3], random.randint(10, 35)))

dr.text((600, cy_o+20), "并蒂而生", fill=IM, font=fs, anchor="mt")
dr.text((600, cy_o+38), "同步成长", fill=IM, font=fs, anchor="mt")

# ═══ CORNER MARKS ═══
# Stamp impression — bottom left
scx, scy = 100, H-100
for _ in range(2):
    ox, oy = random.randint(-1,1), random.randint(-1,1)
    dr.arc([scx-26+ox, scy-26+oy, scx+26+ox, scy+26+oy], 0, 360, fill=(*R[:3],35), width=2)
dr.text((scx, scy), "双  宝  记", fill=(*R[:3],70), font=fb, anchor="mm", spacing=4)

# Decorative ✦ — bottom right
dr.text((W-80, H-55), "✦", fill=(*IM[:3],50), font=ft)

# ═══ SUBTLE VIGNETTE ═══
for i in range(40):
    a = int(10*(1-i/40))
    dr.rectangle([i,i,W-i,H-i], outline=(*I[:3],a))

# ═══ SAVE ═══
out = os.path.join(OUTPUT, "collected-warmth-canvas.png")
cv.save(out, "PNG")
print(f"Refined canvas: {out}  ({W}×{H})")
