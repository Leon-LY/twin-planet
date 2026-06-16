"""
Generate Twin Planet icon font from simple geometric SVG paths.
Creates SVG font → converts to TTF → converts to WOFF2 → generates CSS.

Usage: python design/generate-iconfont.py
Output: src/styles/iconfont.wxss
"""

import base64
import subprocess
import os
import sys
import math

# ── Paths ──────────────────────────────────────────────
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STYLES_DIR = os.path.join(ROOT, "src", "styles")
DESIGN_DIR = os.path.dirname(os.path.abspath(__file__))
SVG_FONT_PATH = os.path.join(DESIGN_DIR, "_iconfont.svg")
TTF_PATH = os.path.join(DESIGN_DIR, "_twinplanet-icons.ttf")
WOFF2_PATH = os.path.join(DESIGN_DIR, "_twinplanet-icons.woff2")
CSS_OUTPUT = os.path.join(STYLES_DIR, "iconfont.wxss")

# ── Font metrics ───────────────────────────────────────
EM = 1000
ASCENT = 850
DESCENT = 150
DEFAULT_WIDTH = 1000

# Stroke-based icons: we use filled paths that represent strokes of width ~40 units
# All icons fit within a 24x24 conceptual grid scaled to EM units
# Origin at (0, DESCENT) = bottom of glyph; cap height at ASCENT

def S(v):
    """Scale from 24x24 grid to EM units (fits within ascent-descent)."""
    scale = (ASCENT - DESCENT) / 24.0
    return v * scale

def P(x, y):
    """Convert conceptual grid coordinates (0,0=top-left) to font coordinates.
    Grid: x=0..24, y=0..24 (top to bottom)
    Font: x=0..EM, y=baseline upward"""
    fy = ASCENT - y * (ASCENT - DESCENT) / 24.0
    fx = x * EM / 24.0
    return (fx, fy)

# ── SVG path helpers ───────────────────────────────────
def M(x, y):
    return f"M {x:.0f} {y:.0f}"

def L(x, y):
    return f"L {x:.0f} {y:.0f}"

def C(x1, y1, x2, y2, x, y):
    return f"C {x1:.0f} {y1:.0f} {x2:.0f} {y2:.0f} {x:.0f} {y:.0f}"

def Q(x1, y1, x, y):
    return f"Q {x1:.0f} {y1:.0f} {x:.0f} {y:.0f}"

def Z():
    return "Z"

def circle(cx, cy, r):
    """Approximate circle with two cubic beziers per quadrant (8 total)."""
    k = 0.5522847498  # magic constant for circle approximation
    kr = k * r
    points = []
    # Start at rightmost point
    points.append(M(cx + r, cy))
    # Quadrant 1: right to bottom
    points.append(C(cx + r, cy + kr, cx + kr, cy + r, cx, cy + r))
    # Quadrant 2: bottom to left
    points.append(C(cx - kr, cy + r, cx - r, cy + kr, cx - r, cy))
    # Quadrant 3: left to top
    points.append(C(cx - r, cy - kr, cx - kr, cy - r, cx, cy - r))
    # Quadrant 4: top to right
    points.append(C(cx + kr, cy - r, cx + r, cy - kr, cx + r, cy))
    points.append(Z())
    return " ".join(points)

def rounded_rect(x, y, w, h, r):
    """Rounded rectangle path."""
    return (
        M(x + r, y) +
        L(x + w - r, y) +
        Q(x + w, y, x + w, y + r) +
        L(x + w, y + h - r) +
        Q(x + w, y + h, x + w - r, y + h) +
        L(x + r, y + h) +
        Q(x, y + h, x, y + h - r) +
        L(x, y + r) +
        Q(x, y, x + r, y) +
        Z()
    )

def stroke_line(x1, y1, x2, y2, width):
    """Create a filled path representing a line of given width (in grid units)."""
    w = width / 2.0
    dx = x2 - x1
    dy = y2 - y1
    length = math.sqrt(dx*dx + dy*dy)
    if length < 0.001:
        return ""
    ux = -dy / length * w
    uy = dx / length * w
    p1 = P(x1 + ux, y1 + uy)
    p2 = P(x2 + ux, y2 + uy)
    p3 = P(x2 - ux, y2 - uy)
    p4 = P(x1 - ux, y1 - uy)
    return f"{M(*p1)} {L(*p2)} {L(*p3)} {L(*p4)} {Z()}"

# ── Icon path definitions (24x24 grid, stroke-based) ──

def icon_bottle():
    """Baby bottle: body + nipple"""
    paths = []
    # Bottle body (rectangle with rounded bottom)
    x, y, w, h = 6, 5, 12, 15
    r = 2.5
    paths.append(rounded_rect(x, y, w, h, r))
    # Bottle neck (narrower top part)
    nx, ny, nw, nh = 8.5, 2, 4, 3.5
    paths.append(rounded_rect(nx, ny, nw, nh, 0.8))
    # Nipple (circle on top)
    cx, cy = 10.5, 1.2
    paths.append(circle(cx, cy, 1.5))
    # Fill level line
    paths.append(stroke_line(6.5, 12, 15.5, 12, 0.6))
    return " ".join(paths)

def icon_sleep():
    """Sleeping face: circle + closed eyes + small mouth"""
    paths = []
    # Face circle
    paths.append(circle(12, 12, 10.5))
    # Closed eyes (horizontal lines)
    paths.append(stroke_line(7, 10, 10, 10, 1.0))
    paths.append(stroke_line(13, 10, 16, 10, 1.0))
    # Small mouth (arc or small circle)
    paths.append(circle(11.5, 15.5, 1.2))
    # Zzz (small z marks)
    paths.append(stroke_line(16, 4, 19, 4, 0.7))
    paths.append(stroke_line(16, 4, 19, 7, 0.7))
    paths.append(stroke_line(16, 7, 19, 7, 0.7))
    return " ".join(paths)

def icon_diaper():
    """Diaper/nappy: simple diaper shape"""
    paths = []
    # Main diaper body (wider at top, narrower at crotch)
    p1 = P(4, 7)
    p2 = P(20, 7)
    p3 = P(18, 19)
    p4 = P(12, 22)
    p5 = P(6, 19)
    paths.append(f"{M(*p1)} {L(*p2)} {L(*p3)} {L(*p4)} {L(*p5)} {Z()}")
    # Waistband line
    paths.append(stroke_line(3.5, 7, 20.5, 7, 0.8))
    # Pin/dot on front
    paths.append(circle(12, 13, 1.5))
    return " ".join(paths)

def icon_bath():
    """Bathtub: trapezoid shape + water lines"""
    paths = []
    # Tub body (trapezoid)
    p1 = P(3, 12)
    p2 = P(21, 12)
    p3 = P(19, 20)
    p4 = P(5, 20)
    paths.append(f"{M(*p1)} {L(*p2)} {L(*p3)} {L(*p4)} {Z()}")
    # Water waves inside
    paths.append(stroke_line(5, 14, 10, 14, 0.6))
    paths.append(stroke_line(13, 15, 18, 15, 0.6))
    # Faucet hint
    paths.append(stroke_line(12, 7, 12, 11, 1.2))
    paths.append(circle(12, 6, 1.5))
    return " ".join(paths)

def icon_thermometer():
    """Thermometer: bulb + stem"""
    paths = []
    # Stem (vertical rounded rect)
    paths.append(rounded_rect(10.2, 4, 3.6, 14, 1.8))
    # Bulb (circle at bottom)
    paths.append(circle(12, 19.5, 3.5))
    # Mercury line
    paths.append(stroke_line(12, 7, 12, 17, 1.0))
    return " ".join(paths)

def icon_medicine():
    """Medicine: pill/capsule shape"""
    paths = []
    # Capsule body
    paths.append(rounded_rect(3, 9, 18, 7, 3.5))
    # Center line
    paths.append(stroke_line(12, 9, 12, 16, 0.6))
    # Small cross on left half
    paths.append(stroke_line(8, 11, 8, 14, 0.8))
    paths.append(stroke_line(6.5, 12.5, 9.5, 12.5, 0.8))
    return " ".join(paths)

def icon_wet():
    """Droplet (wet/urine)"""
    paths = []
    # Teardrop shape
    p1 = P(12, 2)
    p2 = P(20, 14)
    p3 = P(17, 20)
    p4 = P(12, 22)
    p5 = P(7, 20)
    p6 = P(4, 14)
    paths.append(f"{M(*p1)} {C(*P(16, 5), *P(20, 10), *p2)} {C(*P(22, 17), *P(21, 20), *p3)} {Q(*P(14, 23), *p4)} {Q(*P(10, 23), *p5)} {C(*P(3, 20), *P(2, 17), *p6)} {C(*P(4, 10), *P(8, 5), *p1)} {Z()}")
    return " ".join(paths)

def icon_dirty():
    """Dirty/poop: simple blob"""
    paths = []
    # Irregular blob
    p1 = P(12, 4)
    p2 = P(19, 8)
    p3 = P(21, 15)
    p4 = P(17, 21)
    p5 = P(12, 22)
    p6 = P(5, 20)
    p7 = P(3, 14)
    p8 = P(5, 7)
    paths.append(f"{M(*p1)} {Q(*P(17, 4), *p2)} {Q(*P(22, 11), *p3)} {Q(*P(20, 20), *p4)} {Q(*P(14, 23), *p5)} {Q(*P(7, 22), *p6)} {Q(*P(2, 17), *p7)} {Q(*P(3, 9), *p8)} {Q(*P(7, 4), *p1)} {Z()}")
    # Small stink lines
    paths.append(stroke_line(18, 3, 20, 1, 0.5))
    paths.append(stroke_line(20, 4, 22, 2, 0.5))
    return " ".join(paths)

def icon_baby_a():
    """Baby A (first twin): simple bird/chick with amber vibe"""
    paths = []
    # Body (slightly larger rounded shape)
    paths.append(circle(12, 13, 9))
    # Eye
    paths.append(circle(15, 10.5, 1.5))
    # Beak
    p1 = P(19, 12)
    p2 = P(22, 11.5)
    p3 = P(19, 14)
    paths.append(f"{M(*p1)} {L(*p2)} {L(*p3)} {Z()}")
    # Small wing
    paths.append(stroke_line(7, 12, 11, 15, 0.7))
    paths.append(stroke_line(7, 15, 11, 18, 0.7))
    # Feet
    paths.append(stroke_line(9, 21, 9, 23, 0.8))
    paths.append(stroke_line(13, 21, 13, 23, 0.8))
    return " ".join(paths)

def icon_baby_b():
    """Baby B (second twin): simple bird/chick with gold vibe"""
    paths = []
    # Body (slightly smaller, rounder)
    paths.append(circle(12, 14, 8.5))
    # Eye (winking)
    paths.append(stroke_line(14, 12, 16, 12, 1.0))
    # Beak (slightly open - playful)
    p1 = P(18.5, 13)
    p2 = P(21.5, 12.5)
    p3 = P(18.5, 14.5)
    paths.append(f"{M(*p1)} {L(*p2)} {L(*p3)} {Z()}")
    # Wing (flapping up - playful)
    paths.append(stroke_line(7, 11, 5, 8, 0.7))
    paths.append(stroke_line(7, 13, 4, 11, 0.7))
    # Feet
    paths.append(stroke_line(9, 21.5, 9, 23.5, 0.8))
    paths.append(stroke_line(13, 21.5, 13, 23.5, 0.8))
    return " ".join(paths)

def icon_sleep_zzz():
    """Sleep ZZZ indicator"""
    paths = []
    # Three Z shapes growing in size
    # Small Z
    paths.append(stroke_line(16, 6, 19, 6, 0.7))
    paths.append(stroke_line(19, 6, 16, 9, 0.7))
    paths.append(stroke_line(16, 9, 19, 9, 0.7))
    # Medium Z
    paths.append(stroke_line(15, 10.5, 19, 10.5, 0.8))
    paths.append(stroke_line(19, 10.5, 15, 14, 0.8))
    paths.append(stroke_line(15, 14, 19, 14, 0.8))
    # Large Z
    paths.append(stroke_line(14, 15.5, 19.5, 15.5, 0.9))
    paths.append(stroke_line(19.5, 15.5, 14, 19.5, 0.9))
    paths.append(stroke_line(14, 19.5, 19.5, 19.5, 0.9))
    return " ".join(paths)

def icon_clipboard():
    """Clipboard/checklist"""
    paths = []
    # Board (rounded rect)
    paths.append(rounded_rect(5, 6, 14, 16, 2))
    # Clip at top
    paths.append(rounded_rect(9, 3, 6, 4, 1.5))
    # Check lines
    paths.append(stroke_line(8, 11, 10.5, 14, 0.8))
    paths.append(stroke_line(10.5, 14, 16, 9, 0.8))
    # Second line item
    paths.append(stroke_line(8, 17, 16, 17, 0.5))
    return " ".join(paths)

def icon_calendar():
    """Calendar"""
    paths = []
    # Calendar body
    paths.append(rounded_rect(4, 7, 16, 15, 1.5))
    # Top binding
    paths.append(rounded_rect(4, 7, 16, 5, 1.5))
    # Binding rings
    paths.append(circle(7, 7.5, 0.8))
    paths.append(circle(12, 7.5, 0.8))
    paths.append(circle(17, 7.5, 0.8))
    # Date numbers (simple lines)
    paths.append(stroke_line(7, 13, 10, 13, 0.5))
    paths.append(stroke_line(7, 16, 10, 16, 0.5))
    paths.append(stroke_line(14, 13, 17, 13, 0.5))
    return " ".join(paths)

def icon_microphone():
    """Microphone"""
    paths = []
    # Mic body (rounded rect)
    paths.append(rounded_rect(9, 3, 6, 12, 3))
    # Mic grille lines
    paths.append(stroke_line(10, 7, 14, 7, 0.4))
    paths.append(stroke_line(10, 9, 14, 9, 0.4))
    paths.append(stroke_line(10, 11, 14, 11, 0.4))
    # Arc/handle
    arc_path = (
        M(*P(12, 15)) +
        C(*P(12, 19), *P(5, 19), *P(5, 15))
    )
    paths.append(arc_path)
    # Base line
    paths.append(stroke_line(3, 20, 21, 20, 0.8))
    return " ".join(paths)

def icon_edit():
    """Pencil/edit"""
    paths = []
    # Pencil body (diagonal rectangle)
    p1 = P(17, 3)
    p2 = P(7, 19)
    p3 = P(4, 22)
    p4 = P(1, 21)
    p5 = P(4, 18)
    p6 = P(14, 2)
    paths.append(f"{M(*p1)} {L(*p2)} {L(*p3)} {L(*p4)} {L(*p5)} {L(*p6)} {Z()}")
    # Tip
    p7 = P(7, 19)
    p8 = P(4, 22)
    p9 = P(3, 20)
    p10 = P(6, 17)
    paths.append(f"{M(*p7)} {L(*p8)} {L(*p9)} {L(*p10)} {Z()}")
    return " ".join(paths)

def icon_book():
    """Open book/journal"""
    paths = []
    # Left page
    p1 = P(12, 4)
    p2 = P(3, 6)
    p3 = P(3, 20)
    p4 = P(12, 18)
    paths.append(f"{M(*p1)} {L(*p2)} {Q(*P(2, 13), *p3)} {L(*p4)} {Q(*P(12, 11), *p1)} {Z()}")
    # Right page
    p5 = P(21, 6)
    p6 = P(21, 20)
    paths.append(f"M {P(12, 4)[0]} {P(12, 4)[1]} L {p5[0]} {p5[1]} Q {P(22, 13)[0]} {P(22, 13)[1]} L {p6[0]} {p6[1]} L {P(12, 18)[0]} {P(12, 18)[1]} Q {P(12, 11)[0]} {P(12, 11)[1]} Z")
    # Spine line
    paths.append(stroke_line(12, 4.5, 12, 17.5, 0.8))
    # Text lines on left page
    paths.append(stroke_line(5, 9, 10, 9, 0.5))
    paths.append(stroke_line(5, 12, 10, 12, 0.5))
    paths.append(stroke_line(5, 15, 9, 15, 0.5))
    # Text lines on right page
    paths.append(stroke_line(14, 9, 19, 9, 0.5))
    paths.append(stroke_line(14, 12, 19, 12, 0.5))
    return " ".join(paths)

def icon_share():
    """Share/export arrow"""
    paths = []
    # Box with arrow going out
    paths.append(rounded_rect(3, 11, 13, 11, 1.5))
    # Arrow going up-right
    paths.append(stroke_line(10, 12, 18, 4, 1.5))
    # Arrow head
    p1 = P(18, 4)
    p2 = P(14, 1)
    p3 = P(16, 7)
    paths.append(f"{M(*p1)} {L(*p2)} {L(*p3)} {Z()}")
    return " ".join(paths)

def icon_chart():
    """Growth chart / bar chart"""
    paths = []
    # Chart base line
    paths.append(stroke_line(4, 20, 20, 20, 0.6))
    # Y axis
    paths.append(stroke_line(5, 5, 5, 20, 0.6))
    # Bars
    paths.append(rounded_rect(7, 14, 3, 6, 0.5))
    paths.append(rounded_rect(11.5, 10, 3, 10, 0.5))
    paths.append(rounded_rect(16, 6, 3, 14, 0.5))
    # Trend line
    paths.append(stroke_line(8.5, 13, 13, 9, 0.8))
    paths.append(stroke_line(13, 9, 17.5, 5, 0.8))
    return " ".join(paths)

def icon_sprout():
    """Seedling/sprout"""
    paths = []
    # Stem
    paths.append(stroke_line(12, 22, 12, 12, 1.2))
    # Left leaf
    leaf1 = (
        M(*P(12, 14)) +
        Q(*P(7, 12), *P(6, 8)) +
        Q(*P(8, 10), *P(12, 12))
    )
    paths.append(leaf1)
    # Right leaf
    leaf2 = (
        M(*P(12, 11)) +
        Q(*P(15, 7), *P(18, 5)) +
        Q(*P(15, 9), *P(12, 10))
    )
    paths.append(leaf2)
    # Ground line
    paths.append(stroke_line(6, 22, 18, 22, 0.8))
    return " ".join(paths)

def icon_night():
    """Crescent moon"""
    paths = []
    # Moon (circle with another circle cut out)
    outer = circle(13, 12, 9)
    # Cut-out circle creates crescent
    inner = circle(9, 9, 7.5)
    paths.append(outer)
    # We use a different approach: draw crescent directly
    # Actually let's just do a crescent path
    return " ".join(paths)

def icon_star():
    """5-pointed star"""
    paths = []
    # Simple 5-point star using polygon
    r_outer = 10
    r_inner = 4.5
    cx, cy = 12, 12
    pts = []
    for i in range(5):
        angle_outer = math.pi / 2 + i * 2 * math.pi / 5 - math.pi / 2
        angle_inner = angle_outer + math.pi / 5
        outer_pt = (cx + r_outer * math.cos(angle_outer), cy - r_outer * math.sin(angle_outer))
        inner_pt = (cx + r_inner * math.cos(angle_inner), cy - r_inner * math.sin(angle_inner))
        pts.append(outer_pt)
        pts.append(inner_pt)
    p_pts = [P(x, y) for x, y in pts]
    d = f"M {p_pts[0][0]:.0f} {p_pts[0][1]:.0f}"
    for pt in p_pts[1:]:
        d += f" L {pt[0]:.0f} {pt[1]:.0f}"
    d += " Z"
    paths.append(d)
    return " ".join(paths)

def icon_trophy():
    """Trophy cup"""
    paths = []
    # Cup body
    p1 = P(6, 12)
    p2 = P(18, 12)
    p3 = P(16, 20)
    p4 = P(8, 20)
    paths.append(f"{M(*p1)} {L(*p2)} {L(*p3)} {L(*p4)} {Z()}")
    # Left handle
    paths.append(stroke_line(6, 12, 3, 13, 1.0))
    paths.append(stroke_line(3, 13, 6, 15, 1.0))
    # Right handle
    paths.append(stroke_line(18, 12, 21, 13, 1.0))
    paths.append(stroke_line(21, 13, 18, 15, 1.0))
    # Base
    paths.append(rounded_rect(7, 20, 10, 2, 1))
    # Star on cup
    paths.append(circle(12, 15, 1.5))
    return " ".join(paths)

def icon_celebrate():
    """Celebration/party popper"""
    paths = []
    # Party horn/popper body
    p1 = P(5, 12)
    p2 = P(19, 8)
    p3 = P(18, 12)
    p4 = P(4, 14)
    paths.append(f"{M(*p1)} {L(*p2)} {L(*p3)} {L(*p4)} {Z()}")
    # Confetti dots
    paths.append(circle(19, 5, 1))
    paths.append(circle(21, 8, 0.8))
    paths.append(circle(20, 3, 0.7))
    # Streamer
    paths.append(stroke_line(19, 8, 21, 6, 0.5))
    return " ".join(paths)

def icon_crown():
    """Crown"""
    paths = []
    # Crown base
    paths.append(rounded_rect(4, 16, 16, 6, 1))
    # Crown points
    p1 = P(4, 16)
    p2 = P(6, 8)
    p3 = P(9, 12)
    p4 = P(12, 5)
    p5 = P(15, 12)
    p6 = P(18, 8)
    p7 = P(20, 16)
    paths.append(f"{M(*p1)} {L(*p2)} {L(*p3)} {L(*p4)} {L(*p5)} {L(*p6)} {L(*p7)} {Z()}")
    # Small circles on tips
    paths.append(circle(6, 7.5, 1))
    paths.append(circle(12, 4.5, 1))
    paths.append(circle(18, 7.5, 1))
    return " ".join(paths)

def icon_link():
    """Link/chain/connection"""
    paths = []
    # Two interlocking chain links
    # Left link
    paths.append(rounded_rect(3, 9, 9, 7, 3.5))
    # Right link (overlapping)
    paths.append(rounded_rect(12, 9, 9, 7, 3.5))
    return " ".join(paths)

def icon_hero():
    """Superhero/cape"""
    paths = []
    # Cape shape
    p1 = P(12, 3)
    p2 = P(21, 8)
    p3 = P(19, 20)
    p4 = P(12, 17)
    p5 = P(5, 20)
    p6 = P(3, 8)
    paths.append(f"{M(*p1)} {Q(*P(18, 2), *p2)} {Q(*P(21, 14), *p3)} {Q(*P(14, 19), *p4)} {Q(*P(10, 19), *p5)} {Q(*P(3, 14), *p6)} {Q(*P(6, 2), *p1)} {Z()}")
    # Star emblem on chest
    paths.append(circle(12, 11, 2.5))
    return " ".join(paths)

def icon_strength():
    """Strength/flexed arm"""
    paths = []
    # Simple arm shape
    # Upper arm
    paths.append(rounded_rect(8, 10, 4, 10, 2))
    # Fist
    paths.append(circle(10, 8, 3.5))
    # Muscle curve
    paths.append(stroke_line(6, 12, 6, 17, 0.8))
    paths.append(stroke_line(14, 12, 14, 17, 0.8))
    return " ".join(paths)

def icon_role_mom():
    """Mom figure"""
    paths = []
    # Head
    paths.append(circle(12, 7, 3.5))
    # Body (dress shape)
    p1 = P(6, 11)
    p2 = P(18, 11)
    p3 = P(20, 22)
    p4 = P(4, 22)
    paths.append(f"{M(*p1)} {L(*p2)} {L(*p3)} {L(*p4)} {Z()}")
    # Hair hint
    paths.append(stroke_line(9, 4.5, 15, 4.5, 0.8))
    return " ".join(paths)

def icon_role_dad():
    """Dad figure"""
    paths = []
    # Head
    paths.append(circle(12, 7, 3.5))
    # Body (broader rectangle)
    paths.append(rounded_rect(7, 11, 10, 11, 1.5))
    # Legs
    paths.append(stroke_line(9, 22, 8, 23.5, 1.5))
    paths.append(stroke_line(15, 22, 16, 23.5, 1.5))
    return " ".join(paths)

def icon_role_grandma():
    """Grandma figure"""
    paths = []
    # Head (slightly lower)
    paths.append(circle(12, 8, 3.5))
    # Body (dress, slightly stooped)
    p1 = P(7, 12)
    p2 = P(17, 12)
    p3 = P(19, 22)
    p4 = P(5, 22)
    paths.append(f"{M(*p1)} {L(*p2)} {L(*p3)} {L(*p4)} {Z()}")
    # Hair bun
    paths.append(circle(12, 5, 2))
    # Walking stick hint
    paths.append(stroke_line(3, 10, 3, 22, 0.8))
    return " ".join(paths)

def icon_person():
    """Generic person"""
    paths = []
    # Head
    paths.append(circle(12, 6.5, 4))
    # Body
    paths.append(stroke_line(12, 10.5, 12, 17, 1.5))
    # Arms
    paths.append(stroke_line(12, 13, 7, 10, 1.2))
    paths.append(stroke_line(12, 13, 17, 10, 1.2))
    # Legs
    paths.append(stroke_line(12, 17, 8, 22, 1.2))
    paths.append(stroke_line(12, 17, 16, 22, 1.2))
    return " ".join(paths)

# ── Complete icon registry ──────────────────────────────
ICONS = [
    # Baby care core
    ("e001", "icon-bottle", icon_bottle),
    ("e002", "icon-sleep", icon_sleep),
    ("e003", "icon-diaper", icon_diaper),
    ("e004", "icon-bath", icon_bath),
    ("e005", "icon-thermometer", icon_thermometer),
    ("e006", "icon-medicine", icon_medicine),
    ("e007", "icon-wet", icon_wet),
    ("e008", "icon-dirty", icon_dirty),
    ("e009", "icon-baby-a", icon_baby_a),
    ("e010", "icon-baby-b", icon_baby_b),
    ("e011", "icon-sleep-zzz", icon_sleep_zzz),
    # Navigation / actions
    ("e012", "icon-clipboard", icon_clipboard),
    ("e013", "icon-calendar", icon_calendar),
    ("e014", "icon-microphone", icon_microphone),
    ("e015", "icon-edit", icon_edit),
    ("e016", "icon-book", icon_book),
    ("e017", "icon-share", icon_share),
    ("e018", "icon-chart", icon_chart),
    ("e019", "icon-sprout", icon_sprout),
    ("e020", "icon-night", icon_night),
    # Achievement / stickers
    ("e021", "icon-star", icon_star),
    ("e022", "icon-trophy", icon_trophy),
    ("e023", "icon-celebrate", icon_celebrate),
    ("e024", "icon-crown", icon_crown),
    ("e025", "icon-link", icon_link),
    ("e026", "icon-hero", icon_hero),
    ("e027", "icon-strength", icon_strength),
    # Roles
    ("e028", "icon-role-mom", icon_role_mom),
    ("e029", "icon-role-dad", icon_role_dad),
    ("e030", "icon-role-grandma", icon_role_grandma),
    ("e031", "icon-person", icon_person),
]

# ── Fix icon_night (crescent moon) ──────────────────────
# Override with proper crescent path
def _crescent_moon():
    cx, cy = 12, 12
    r = 9.5
    # Draw crescent: outer arc + inner arc
    # Outer circle (mostly full)
    outer = circle(cx, cy, r)
    # The crescent is created by subtracting a slightly offset circle
    # For SVG font, we need a single filled path
    # Crescent path: start at top, go right-down along outer, then left-up along inner
    pts = []
    # Outer arc (clockwise from top)
    for angle in [math.pi * a / 180 for a in range(-90, 271, 10)]:
        x = cx + r * math.cos(angle)
        y = cy - r * math.sin(angle)
        pts.append((x, y))
    # Inner arc (counter-clockwise, offset)
    r2 = r * 0.7
    ox, oy = cx - r * 0.35, cy - r * 0.1
    for angle in [math.pi * a / 180 for a in range(270, -91, -10)]:
        x = ox + r2 * math.cos(angle)
        y = oy - r2 * math.sin(angle)
        pts.append((x, y))
    # Build path
    p_pts = [P(x, y) for x, y in pts]
    d = f"M {p_pts[0][0]:.0f} {p_pts[0][1]:.0f}"
    for pt in p_pts[1:]:
        d += f" L {pt[0]:.0f} {pt[1]:.0f}"
    d += " Z"
    return d

# Replace icon_night
ICONS[19] = ("e020", "icon-night", _crescent_moon)


# ── Sticker badge icons (e032-e044) ──────────────────────
# Monochrome iconfont-compatible versions of sticker badge designs

def _sticker_sunrise():
    """Sunrise badge — circle + radiating beams"""
    paths = []
    paths.append(circle(12, 12, 3))
    paths.append(stroke_line(11.5, 1, 12.5, 1, 1.5))
    paths.append(stroke_line(11.5, 23, 12.5, 23, 1.0))
    paths.append(stroke_line(1, 11.5, 1, 12.5, 1.5))
    paths.append(stroke_line(23, 11.5, 23, 12.5, 1.0))
    paths.append(stroke_line(5, 5, 5, 6.5, 1.5))
    paths.append(stroke_line(19, 19, 19, 20.5, 1.0))
    paths.append(stroke_line(19, 5, 19, 6.5, 1.0))
    paths.append(stroke_line(5, 19, 5, 20.5, 1.0))
    return " ".join(paths)

def _sticker_watchful():
    """Care badge — heart/hands shape (replaces eye)"""
    paths = []
    # Heart shape
    p1 = P(12, 20)
    p2 = P(4, 13)
    p3 = P(2, 8)
    p4 = P(5, 4)
    p5 = P(9, 5)
    p6 = P(12, 9)
    p7 = P(15, 5)
    p8 = P(19, 4)
    p9 = P(22, 8)
    p10 = P(20, 13)
    pts = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10]
    d = f"M {pts[0][0]:.0f} {pts[0][1]:.0f}"
    d += f" Q {P(7,16)[0]:.0f} {P(7,16)[1]:.0f} {pts[1][0]:.0f} {pts[1][1]:.0f}"
    d += f" Q {P(3,10)[0]:.0f} {P(3,10)[1]:.0f} {pts[2][0]:.0f} {pts[2][1]:.0f}"
    d += f" Q {P(2.5,5.5)[0]:.0f} {P(2.5,5.5)[1]:.0f} {pts[3][0]:.0f} {pts[3][1]:.0f}"
    d += f" Q {P(7,3)[0]:.0f} {P(7,3)[1]:.0f} {pts[4][0]:.0f} {pts[4][1]:.0f}"
    d += f" Q {P(11,7.5)[0]:.0f} {P(11,7.5)[1]:.0f} {pts[5][0]:.0f} {pts[5][1]:.0f}"
    d += f" Q {P(13,7.5)[0]:.0f} {P(13,7.5)[1]:.0f} {pts[6][0]:.0f} {pts[6][1]:.0f}"
    d += f" Q {P(17,3)[0]:.0f} {P(17,3)[1]:.0f} {pts[7][0]:.0f} {pts[7][1]:.0f}"
    d += f" Q {P(21.5,5.5)[0]:.0f} {P(21.5,5.5)[1]:.0f} {pts[8][0]:.0f} {pts[8][1]:.0f}"
    d += f" Q {P(21,10)[0]:.0f} {P(21,10)[1]:.0f} {pts[9][0]:.0f} {pts[9][1]:.0f}"
    d += f" Q {P(17,16)[0]:.0f} {P(17,16)[1]:.0f} {pts[0][0]:.0f} {pts[0][1]:.0f} Z"
    paths.append(d)
    # Small star inside
    paths.append(stroke_line(10.5, 10, 11.5, 10, 0.8))
    paths.append(stroke_line(12, 11.5, 12, 12.5, 0.8))
    return " ".join(paths)

def _sticker_three_day():
    """Three-day streak — ascending bars"""
    paths = []
    paths.append(rounded_rect(3, 12, 5, 9, 1.5))
    paths.append(rounded_rect(9.5, 7, 5, 14, 1.5))
    paths.append(rounded_rect(16, 3, 5, 18, 1.5))
    return " ".join(paths)

def _sticker_twin_spark():
    """Twin active — interlocking circles (monochrome)"""
    paths = []
    paths.append(circle(8.5, 12, 6.5))
    paths.append(circle(15.5, 12, 6.5))
    # Small dots for orbit
    paths.append(circle(5, 8, 0.8))
    paths.append(circle(19, 16, 0.8))
    return " ".join(paths)

def _sticker_ten():
    """10 records — concentric target"""
    paths = []
    # Use filled rings via evenodd (approximate with nested circles)
    outer = circle(12, 12, 10)
    # Make a ring by drawing outer circle + inner circle (will be merged in iconfont)
    paths.append(circle(12, 12, 10))
    paths.append(circle(12, 12, 4))
    return " ".join(paths)

def _sticker_fifty():
    """50 records — shield badge"""
    paths = []
    # Shield shape
    p1 = P(12, 1)
    p2 = P(21, 6)
    p3 = P(21, 13)
    p4 = P(12, 23)
    p5 = P(3, 13)
    p6 = P(3, 6)
    d = f"M {p1[0]:.0f} {p1[1]:.0f} L {p2[0]:.0f} {p2[1]:.0f} Q {P(21,10)[0]:.0f} {P(21,10)[1]:.0f} {p3[0]:.0f} {p3[1]:.0f} Q {P(15,20)[0]:.0f} {P(15,20)[1]:.0f} {p4[0]:.0f} {p4[1]:.0f} Q {P(9,20)[0]:.0f} {P(9,20)[1]:.0f} {p5[0]:.0f} {p5[1]:.0f} Q {P(3,10)[0]:.0f} {P(3,10)[1]:.0f} {p6[0]:.0f} {p6[1]:.0f} Z"
    paths.append(d)
    return " ".join(paths)

def _sticker_hundred():
    """100 records — diamond honor badge"""
    # Diamond shape
    p1 = P(12, 1)
    p2 = P(22, 12)
    p3 = P(12, 23)
    p4 = P(2, 12)
    d = f"M {p1[0]:.0f} {p1[1]:.0f} L {p2[0]:.0f} {p2[1]:.0f} L {p3[0]:.0f} {p3[1]:.0f} L {p4[0]:.0f} {p4[1]:.0f} Z"
    # Inner star
    star_pts = []
    for i in range(5):
        a_outer = -math.pi/2 + i*2*math.pi/5
        a_inner = a_outer + math.pi/5
        star_pts.append((12+6*math.cos(a_outer), 12-6*math.sin(a_outer)))
        star_pts.append((12+2.5*math.cos(a_inner), 12-2.5*math.sin(a_inner)))
    p_pts = [P(x,y) for x,y in star_pts]
    sd = f"M {p_pts[0][0]:.0f} {p_pts[0][1]:.0f}"
    for pt in p_pts[1:]:
        sd += f" L {pt[0]:.0f} {pt[1]:.0f}"
    sd += " Z"
    return f"{d} {sd}"

def _sticker_observe():
    """Observe badge — magnifying glass"""
    paths = []
    paths.append(circle(9, 9, 5.5))
    paths.append(stroke_line(13, 13, 20, 20, 2))
    return " ".join(paths)

def _sticker_milestone5():
    """5 milestones — ascending pillars"""
    paths = []
    paths.append(rounded_rect(2, 18, 3.5, 4, 1))
    paths.append(rounded_rect(6, 14, 3.5, 8, 1))
    paths.append(rounded_rect(10, 10, 3.5, 12, 1))
    paths.append(rounded_rect(14, 6, 3.5, 16, 1))
    paths.append(rounded_rect(18, 2, 3.5, 20, 1))
    return " ".join(paths)

def _sticker_school():
    """School badge — backpack (monochrome)"""
    paths = []
    # Backpack body
    paths.append(rounded_rect(6, 9, 12, 13, 2))
    # Flap
    paths.append(rounded_rect(6, 9, 12, 4, 2))
    # Handle
    paths.append(stroke_line(10, 5, 14, 5, 1.5))
    paths.append(stroke_line(12, 5, 12, 9, 1.2))
    return " ".join(paths)

def _sticker_inviter():
    """Inviter badge — envelope (monochrome)"""
    paths = []
    # Envelope body
    paths.append(rounded_rect(3, 7, 18, 12, 1.5))
    # Flap triangle
    p1 = P(3, 7)
    p2 = P(12, 14)
    p3 = P(21, 7)
    d = f"M {p1[0]:.0f} {p1[1]:.0f} L {p2[0]:.0f} {p2[1]:.0f} L {p3[0]:.0f} {p3[1]:.0f} Z"
    paths.append(d)
    return " ".join(paths)

def _sticker_welcome():
    """Welcome badge — gift box (monochrome)"""
    paths = []
    # Box body
    paths.append(rounded_rect(4, 10, 16, 12, 1.5))
    # Lid
    paths.append(stroke_line(3, 10, 21, 10, 2))
    # Ribbon vertical
    paths.append(stroke_line(12, 6, 12, 22, 1.2))
    # Ribbon horizontal
    paths.append(stroke_line(4, 15, 20, 15, 1.0))
    # Bow
    paths.append(circle(12, 5, 2))
    return " ".join(paths)

def _sticker_rainbow():
    """Rainbow badge — three arcs (monochrome, simplified)"""
    paths = []
    # Three bold concentric arcs
    # Outer arc
    outer_pts = []
    for angle in [math.pi*a/180 for a in range(180, 361, 8)]:
        x = 12 + 10*math.cos(angle)
        y = 18 - 10*math.sin(angle)
        outer_pts.append(P(x, y))
    # Inner arcs (offset upward)
    mid_pts = []
    for angle in [math.pi*a/180 for a in range(180, 361, 8)]:
        x = 12 + 7*math.cos(angle)
        y = 18 - 7*math.sin(angle)
        mid_pts.append(P(x, y))
    inner_pts = []
    for angle in [math.pi*a/180 for a in range(180, 361, 8)]:
        x = 12 + 4*math.cos(angle)
        y = 18 - 4*math.sin(angle)
        inner_pts.append(P(x, y))

    # Draw as thick arcs using filled paths
    for pts, w in [(outer_pts, 0.8), (mid_pts, 0.8), (inner_pts, 0.8)]:
        d = f"M {pts[0][0]:.0f} {pts[0][1]:.0f}"
        for pt in pts[1:]:
            d += f" L {pt[0]:.0f} {pt[1]:.0f}"
        paths.append(d)

    # Star at end
    star_pts = []
    for i in range(5):
        a = -math.pi/2 + i*2*math.pi/5
        star_pts.append((3+2*math.cos(a), 18-2*math.sin(a)))
    p_pts = [P(x,y) for x,y in star_pts]
    sd = f"M {p_pts[0][0]:.0f} {p_pts[0][1]:.0f}"
    for pt in p_pts[1:]:
        sd += f" L {pt[0]:.0f} {pt[1]:.0f}"
    sd += " Z"
    paths.append(sd)
    return " ".join(paths)

# Add sticker icons to registry
_sticker_entries = [
    ("e032", "icon-sticker-sunrise", _sticker_sunrise),
    ("e033", "icon-sticker-watchful", _sticker_watchful),
    ("e034", "icon-sticker-three-day", _sticker_three_day),
    ("e035", "icon-sticker-twin-spark", _sticker_twin_spark),
    ("e036", "icon-sticker-ten", _sticker_ten),
    ("e037", "icon-sticker-fifty", _sticker_fifty),
    ("e038", "icon-sticker-hundred", _sticker_hundred),
    ("e039", "icon-sticker-observe", _sticker_observe),
    ("e040", "icon-sticker-milestone5", _sticker_milestone5),
    ("e041", "icon-sticker-school", _sticker_school),
    ("e042", "icon-sticker-inviter", _sticker_inviter),
    ("e043", "icon-sticker-welcome", _sticker_welcome),
    ("e044", "icon-sticker-rainbow", _sticker_rainbow),
]
ICONS.extend(_sticker_entries)
def generate_svg_font():
    """Generate an SVG font file."""
    glyphs_xml = []
    missing_glyph_d = circle(12, 12, 10)  # Circle as .notdef

    for unicode_hex, name, path_fn in ICONS:
        try:
            d = path_fn()
        except Exception as e:
            print(f"  WARNING: Failed to generate {name}: {e}")
            d = missing_glyph_d
        unicode_char = chr(int(unicode_hex, 16))
        glyphs_xml.append(f'''    <glyph unicode="&#x{unicode_hex};" glyph-name="{name}"
          horiz-adv-x="{DEFAULT_WIDTH}" d="{d}" />''')

    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000">
  <defs>
    <font id="twinplanet-icons" horiz-adv-x="{DEFAULT_WIDTH}">
      <font-face
        font-family="twinplanet-icons"
        font-weight="400"
        font-stretch="normal"
        units-per-em="{EM}"
        ascent="{ASCENT}"
        descent="{DESCENT}"
        cap-height="{ASCENT}"
      />
      <missing-glyph horiz-adv-x="{DEFAULT_WIDTH}" d="{missing_glyph_d}" />
      <glyph unicode=" " glyph-name="space" horiz-adv-x="{DEFAULT_WIDTH}" d="" />
{chr(10).join(glyphs_xml)}
    </font>
  </defs>
</svg>'''
    return svg


# ── Generate CSS ────────────────────────────────────────
def generate_css(woff2_b64):
    """Generate the iconfont.wxss CSS file."""
    glyph_classes = []
    for unicode_hex, name, _ in ICONS:
        glyph_classes.append(f'.iconfont.{name}::before {{ content: "\\{unicode_hex}"; }}')

    css = f'''/* 双宝记 · Iconfont 图标系统
 * 由 design/generate-iconfont.py 自动生成
 * 风格：手帳墨水笔触 · 1.5-2px 线条 · 几何极简
 */

@font-face {{
  font-family: "twinplanet-icons";
  src: url("data:application/x-font-woff2;charset=utf-8;base64,{woff2_b64}") format("woff2");
  font-weight: normal;
  font-style: normal;
  font-display: block;
}}

.iconfont {{
  font-family: "twinplanet-icons" !important;
  font-size: inherit;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1;
  display: inline-block;
  vertical-align: middle;
}}

/* Glyph 映射 */
{chr(10).join(glyph_classes)}

/* 尺寸辅助类 */
.iconfont.icon-xs  {{ font-size: 20rpx; }}
.iconfont.icon-sm  {{ font-size: 28rpx; }}
.iconfont.icon-md  {{ font-size: 40rpx; }}
.iconfont.icon-lg  {{ font-size: 56rpx; }}
.iconfont.icon-xl  {{ font-size: 80rpx; }}
.iconfont.icon-xxl {{ font-size: 120rpx; }}
'''
    return css


# ── Main ────────────────────────────────────────────────
def main():
    print("🎨 Twin Planet Iconfont Generator")
    print("=================================")

    # Step 1: Generate SVG font
    print("\n[1/4] Generating SVG font...")
    svg_content = generate_svg_font()
    with open(SVG_FONT_PATH, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"  ✓ Written: {SVG_FONT_PATH}")

    # Step 2: Convert SVG font to TTF using svg2ttf
    print("\n[2/4] Converting SVG font → TTF (svg2ttf)...")
    result = subprocess.run(
        f'npx --yes svg2ttf "{SVG_FONT_PATH}" "{TTF_PATH}"',
        capture_output=True, text=True, cwd=DESIGN_DIR, shell=True
    )
    if result.returncode != 0:
        print(f"  ERROR: svg2ttf failed:")
        print(f"  stdout: {result.stdout}")
        print(f"  stderr: {result.stderr}")
        sys.exit(1)
    print(f"  ✓ Written: {TTF_PATH}")

    # Step 3: Convert TTF to WOFF2 using fonttools
    print("\n[3/4] Converting TTF → WOFF2 (fonttools)...")
    try:
        from fontTools.ttLib import TTFont
        font = TTFont(TTF_PATH)
        font.flavor = 'woff2'
        font.save(WOFF2_PATH)
        print(f"  ✓ Written: {WOFF2_PATH}")
    except Exception as e:
        print(f"  ERROR: fonttools conversion failed: {e}")
        sys.exit(1)

    # Step 4: Base64 encode WOFF2 and generate CSS
    print("\n[4/4] Generating CSS with base64 WOFF2...")
    with open(WOFF2_PATH, "rb") as f:
        woff2_data = f.read()
    woff2_b64 = base64.b64encode(woff2_data).decode("ascii")
    print(f"  WOFF2 size: {len(woff2_data)} bytes → base64: {len(woff2_b64)} chars")

    css_content = generate_css(woff2_b64)
    os.makedirs(STYLES_DIR, exist_ok=True)
    with open(CSS_OUTPUT, "w", encoding="utf-8") as f:
        f.write(css_content)
    print(f"  ✓ Written: {CSS_OUTPUT}")

    # Cleanup intermediate files
    for tmp_file in [SVG_FONT_PATH, TTF_PATH, WOFF2_PATH]:
        if os.path.exists(tmp_file):
            os.remove(tmp_file)
    print("  ✓ Cleaned up intermediate files")

    print(f"\n✅ Done! {len(ICONS)} icons generated.")
    print(f"   CSS file: {CSS_OUTPUT}")


if __name__ == "__main__":
    main()
