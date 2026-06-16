"""
Comprehensive fix: Large-radius Gaussian blur over entire cross region + color correction
Cross artifact: ~RGB(185,110,50) within amber figure region
Clean amber figure: ~RGB(235,120,50)
"""

import cv2
import numpy as np

SRC = 'icon-concept-d-figures.png'
DST_BLURRED = 'icon-blurred-only.png'
DST_FINAL = 'icon-final-v3.png'

img = cv2.imread(SRC, cv2.IMREAD_UNCHANGED)
if img.shape[2] == 4:
    alpha = img[:,:,3].copy()
    img_bgr = img[:,:,:3]
else:
    alpha = None
    img_bgr = img

h, w = img_bgr.shape[:2]
result = img_bgr.copy().astype(np.float32)

# Step 1: Heavy blur over the cross region
# Cross center: (516, 358), covers x~488-544, y~340-375
cx, cy = 516, 358
blur_r = 35  # Large radius to fully cover cross

y1 = max(0, cy - blur_r)
y2 = min(h, cy + blur_r + 1)
x1 = max(0, cx - blur_r)
x2 = min(w, cx + blur_r + 1)

# Extract the patch
patch = result[y1:y2, x1:x2].copy()
ph, pw = patch.shape[:2]

# Apply heavy Gaussian blur
blurred = cv2.GaussianBlur(patch, (0, 0), 18.0)

# Create feathered mask (full circle, feathered edges)
mask = np.zeros((ph, pw), dtype=np.float32)
cv2.circle(mask, (blur_r, blur_r), blur_r - 5, 1.0, -1)
mask = cv2.GaussianBlur(mask, (0, 0), 10.0)  # Feather edges
mask_3ch = np.stack([mask] * 3, axis=2)

# Blend: mask=1 → use blurred, mask=0 → use original
blended = patch * (1 - mask_3ch) + blurred * mask_3ch
result[y1:y2, x1:x2] = blended

result = np.clip(result, 0, 255).astype(np.uint8)

# Save intermediate (blur only)
if alpha is not None:
    cv2.imwrite(DST_BLURRED, np.dstack([result, alpha]))
else:
    cv2.imwrite(DST_BLURRED, result)

# Step 2: Color correction
# Target brand colors:
# Amber (left figure): #E07B3E = BGR(62, 123, 224)
# Gold (right figure): #C8993E = BGR(62, 153, 200)
# Ink (background): #2D2318 = BGR(24, 35, 45)

TARGET_AMBER = np.array([62, 123, 224], dtype=np.float32)
TARGET_GOLD = np.array([62, 153, 200], dtype=np.float32)
TARGET_INK = np.array([24, 35, 45], dtype=np.float32)

# Simple approach: identify figure vs background based on brightness
gray = cv2.cvtColor(result, cv2.COLOR_BGR2GRAY)
_, figure_mask = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY_INV)

# Left/right split at x=512 (center of image)
left_mask = np.zeros((h, w), dtype=np.float32)
left_mask[:, :512] = 1.0
right_mask = 1.0 - left_mask

# Figure masks for left and right
left_fig = (figure_mask.astype(np.float32) / 255.0) * left_mask
right_fig = (figure_mask.astype(np.float32) / 255.0) * right_mask
bg_mask = 1.0 - figure_mask.astype(np.float32) / 255.0

result_f = result.astype(np.float32)

# Calculate current average colors
left_pixels = result_f[left_fig > 0.5]
right_pixels = result_f[right_fig > 0.5]
bg_pixels = result_f[bg_mask > 0.5]

if len(left_pixels) > 0:
    avg_left = left_pixels.mean(axis=0)
    print(f"Avg left figure: BGR({avg_left[0]:.0f},{avg_left[1]:.0f},{avg_left[2]:.0f})")
if len(right_pixels) > 0:
    avg_right = right_pixels.mean(axis=0)
    print(f"Avg right figure: BGR({avg_right[0]:.0f},{avg_right[1]:.0f},{avg_right[2]:.0f})")
if len(bg_pixels) > 0:
    avg_bg = bg_pixels.mean(axis=0)
    print(f"Avg background: BGR({avg_bg[0]:.0f},{avg_bg[1]:.0f},{avg_bg[2]:.0f})")

# Color shift: nudge each region toward target (60% strength)
r, g, b = result_f[:,:,2], result_f[:,:,1], result_f[:,:,0]
rn = np.clip(r + (TARGET_AMBER[2] - r) * left_fig * 0.5 + (TARGET_GOLD[2] - r) * right_fig * 0.5 + (TARGET_INK[2] - r) * bg_mask * 0.6, 0, 255)
gn = np.clip(g + (TARGET_AMBER[1] - g) * left_fig * 0.5 + (TARGET_GOLD[1] - g) * right_fig * 0.5 + (TARGET_INK[1] - g) * bg_mask * 0.6, 0, 255)
bn = np.clip(b + (TARGET_AMBER[0] - b) * left_fig * 0.5 + (TARGET_GOLD[0] - b) * right_fig * 0.5 + (TARGET_INK[0] - b) * bg_mask * 0.6, 0, 255)

result_corrected = np.stack([bn, gn, rn], axis=2).astype(np.uint8)

# Check center pixel
print(f"\nCenter pixel at ({cx},{cy}):")
print(f"  Original: BGR{tuple(img_bgr[cy, cx])}")
print(f"  After blur: BGR{tuple(result[cy, cx])}")
print(f"  After correction: BGR{tuple(result_corrected[cy, cx])}")

# Save final
if alpha is not None:
    cv2.imwrite(DST_FINAL, np.dstack([result_corrected, alpha]))
else:
    cv2.imwrite(DST_FINAL, result_corrected)

print(f"\nSaved: {DST_BLURRED}, {DST_FINAL}")
