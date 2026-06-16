"""Diagnose pixel values around the + artifact to find good clone source"""
import cv2
import numpy as np

img = cv2.imread('icon-concept-d-figures.png', cv2.IMREAD_UNCHANGED)
h, w = img.shape[:2]

# Check pixels at various positions around (516, 358)
positions = [
    (516, 358, "center of +"),
    (516, 340, "above +"),
    (516, 320, "further above"),
    (516, 375, "below +"),
    (516, 395, "further below"),
    (500, 358, "left of +"),
    (480, 358, "further left"),
    (460, 358, "even further left"),
    (540, 358, "right of +"),
    (560, 358, "further right"),
    # Find amber figure pixels
    (450, 300, "left region up"),
    (450, 400, "left region down"),
    (500, 330, "above-left of +"),
    (530, 330, "above-right of +"),
]

for x, y, label in positions:
    if 0 <= x < w and 0 <= y < h:
        b, g, r = img[y, x, :3]
        print(f"({x:3d},{y:3d}) {label:25s}: RGB({r:3d},{g:3d},{b:3d})  BGR({b:3d},{g:3d},{r:3d})")
