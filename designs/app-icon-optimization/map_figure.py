"""Map the left figure region to find clean clone source areas"""
import cv2
import numpy as np

img = cv2.imread('icon-concept-d-figures.png', cv2.IMREAD_UNCHANGED)
h, w = img.shape[:2]

# Scan the left figure region to find clean amber pixels
# The figure is roughly in the left half of the image
# Check a grid of pixels in the upper-left quadrant

print("=== Scanning left figure region (x=400-550, y=250-420) ===")
for y in range(250, 420, 10):
    row = []
    for x in range(400, 560, 10):
        b, g, r = img[y, x, :3]
        # Identify if pixel is "dark" (artifact-like) or "amber" (normal figure)
        brightness = (int(r) + int(g) + int(b)) / 3
        if brightness < 150:
            row.append("##")  # dark artifact
        elif 150 <= brightness < 210:
            row.append("..")  # darker amber
        elif 210 <= brightness < 245:
            row.append("AA")  # amber figure
        else:
            row.append("  ")  # background/paper
    print(f"y={y:3d}: {''.join(row)}")

# Find the cleanest amber region
print("\n=== Clean amber candidates (brightness > 220, saturation check) ===")
for y in range(260, 340, 10):
    for x in range(420, 490, 10):
        b, g, r = img[y, x, :3]
        brightness = (int(r) + int(g) + int(b)) / 3
        # Amber: red >> green > blue
        if r > 220 and r > g + 80 and brightness > 210:
            print(f"  ({x:3d},{y:3d}): RGB({r},{g},{b}) brightness={brightness:.0f} CLEAN AMBER")
