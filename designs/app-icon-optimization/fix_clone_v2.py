"""
Clone-stamp v2: Copy from clean amber region ABOVE the artifact,
adapting brightness to match local context.
"""
import cv2
import numpy as np

SRC = 'icon-concept-d-figures.png'
DST = 'icon-clone-stamped-v2.png'

img = cv2.imread(SRC, cv2.IMREAD_UNCHANGED)
if img.shape[2] == 4:
    alpha = img[:,:,3].copy()
    img_bgr = img[:,:,:3]
else:
    alpha = None
    img_bgr = img

h, w = img_bgr.shape[:2]
result = img_bgr.copy().astype(np.float32)

# The + artifact cross pattern:
# Vertical arm: x~508-524, y~340-375
# Horizontal arm: x~488-544, y~352-366
# Center at (516, 358)

# Strategy: Replace the entire cross region with cloned pixels from
# clean amber areas. Use TWO source patches:
# Source A: above the cross, clean figure (x=440-480, y=290-320)
# Source B: below the cross, clean figure (for brightness matching)

# Create a feathered replacement mask for the entire cross region
mask = np.zeros((h, w), dtype=np.float32)

# Define the cross region (generous bounds)
cx_region = (488, 544)  # x range of horizontal arm
cy_region = (340, 375)  # y range of vertical arm

# Vertical arm mask
cv2.rectangle(mask, (508, 340), (524, 375), 1.0, -1)
# Horizontal arm mask
cv2.rectangle(mask, (488, 352), (544, 366), 1.0, -1)

# Dilate to cover edge transitions
kernel = np.ones((5, 5), np.float32)
mask = cv2.dilate(mask, kernel, iterations=2)

# Feather the mask with Gaussian blur
mask = cv2.GaussianBlur(mask, (15, 15), 8.0)

# Source region: clean amber above the cross (y=290-320, x=440-480)
src_y1, src_y2 = 290, 320
src_x1, src_x2 = 440, 480
src_h = src_y2 - src_y1
src_w = src_x2 - src_x1

# For each pixel in the destination that has mask > 0,
# map it to the source patch (tile if needed)
for dst_y in range(340, 376):
    for dst_x in range(488, 545):
        m = mask[dst_y, dst_x]
        if m <= 0.01:
            continue
        # Map to source using relative position within the patch
        # Wrap around within source patch
        src_y = src_y1 + ((dst_y - 340) % src_h)
        src_x = src_x1 + ((dst_x - 488) % src_w)
        src_pixel = img_bgr[src_y, src_x].astype(np.float32)
        dst_pixel = result[dst_y, dst_x]
        # Blend based on mask value
        result[dst_y, dst_x] = dst_pixel * (1 - m) + src_pixel * m

result = np.clip(result, 0, 255).astype(np.uint8)

# Check before/after
print("=== Before/After at key points ===")
for x, y in [(516, 358), (516, 350), (516, 365), (500, 358), (530, 358)]:
    before = img_bgr[y, x]
    after = result[y, x]
    print(f"({x:3d},{y:3d}): BGR({before[0]},{before[1]},{before[2]}) -> BGR({after[0]},{after[1]},{after[2]})")

# Restore alpha
if alpha is not None:
    result = np.dstack([result, alpha])
cv2.imwrite(DST, result)
print(f"\nSaved to {DST}")
