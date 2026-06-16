"""
Clone-stamp fix for the + artifact in icon-concept-d-figures.png
Strategy: Copy clean pixels from nearby area (x=480, y=358) to replace the cross pattern at (516, 358)
"""
import cv2
import numpy as np

SRC = 'icon-concept-d-figures.png'
DST = 'icon-clone-stamped.png'

img = cv2.imread(SRC, cv2.IMREAD_UNCHANGED)
if img.shape[2] == 4:
    alpha = img[:,:,3].copy()
    img = img[:,:,:3]
else:
    alpha = None

h, w = img.shape[:2]
print(f"Image: {w}x{h}")

# The + artifact center is at (516, 358)
# It's a cross pattern: vertical band x~508-524, y~344-372; horizontal band x~488-544, y~354-364
# We'll clone-stamp from a clean source region at x~460-500, y~340-380
# (to the LEFT of the artifact, same vertical band, clean amber area)

cx, cy = 516, 358
patch_r = 30  # radius of patch to replace

# Source region: shifted left by 50px
src_cx, src_cy = cx - 50, cy

result = img.copy().astype(np.float32)

# Create feathered circular mask for the destination
y_indices, x_indices = np.ogrid[:h, :w]
dist = np.sqrt((x_indices - cx)**2 + (y_indices - cy)**2)
# Feather from r-8 to r
feather_inner = patch_r - 8
mask = np.clip((dist - feather_inner) / (patch_r - feather_inner), 0, 1)
mask = 1 - mask  # 1 inside the circle, feathering to 0 at edges
mask_3ch = np.stack([mask]*3, axis=2)

# Clone from source
src_x1 = src_cx - patch_r
src_x2 = src_cx + patch_r + 1
src_y1 = src_cy - patch_r
src_y2 = src_cy + patch_r + 1
dst_x1 = cx - patch_r
dst_x2 = cx + patch_r + 1
dst_y1 = cy - patch_r
dst_y2 = cy + patch_r + 1

# Extract source patch
src_patch = img[src_y1:src_y2, src_x1:src_x2].astype(np.float32)
# Place at destination
blended_patch = result[dst_y1:dst_y2, dst_x1:dst_x2] * (1 - mask_3ch[dst_y1:dst_y2, dst_x1:dst_x2]) + src_patch * mask_3ch[dst_y1:dst_y2, dst_x1:dst_x2]
result[dst_y1:dst_y2, dst_x1:dst_x2] = blended_patch

result = np.clip(result, 0, 255).astype(np.uint8)

# Verify: check center pixel before/after
orig_center = img[cy, cx]
new_center = result[cy, cx]
print(f"Original center pixel at ({cx},{cy}): BGR{tuple(orig_center)}")
print(f"After clone stamp at ({cx},{cy}): BGR{tuple(new_center)}")
print(f"Source pixel at ({src_cx},{src_cy}): BGR{tuple(img[src_cy, src_cx])}")

# Restore alpha if present
if alpha is not None:
    result = np.dstack([result, alpha])

cv2.imwrite(DST, result)
print(f"Saved to {DST}")
