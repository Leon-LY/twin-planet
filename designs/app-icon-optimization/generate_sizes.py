"""Generate all 6 icon sizes from the final image with proper scaling"""
import cv2
import numpy as np

SRC = 'icon-final-v3.png'
SIZES = [1024, 256, 128, 80, 64, 40]

img = cv2.imread(SRC, cv2.IMREAD_UNCHANGED)
print(f"Source: {img.shape[1]}x{img.shape[0]}")

for size in SIZES:
    if size == 1024:
        resized = img
    else:
        resized = cv2.resize(img, (size, size), interpolation=cv2.INTER_LANCZOS4)

    # Mild unsharp mask for sizes <= 128px
    if size <= 128:
        blurred = cv2.GaussianBlur(resized[:,:,:3], (0, 0), 0.8)
        resized_rgb = cv2.addWeighted(resized[:,:,:3], 1.4, blurred, -0.4, 0)
        resized_rgb = np.clip(resized_rgb, 0, 255).astype(np.uint8)
        if resized.shape[2] == 4:
            resized[:,:,:3] = resized_rgb
        else:
            resized = resized_rgb

    out_path = f'app-icon-{size}.png'
    cv2.imwrite(out_path, resized)
    print(f"  {out_path}: {size}x{size}")

# Also copy to static dir
import shutil, os
static_dir = '../../twin-planet-miniapp/src/static'
for size in SIZES:
    src = f'app-icon-{size}.png'
    dst = os.path.join(static_dir, src)
    shutil.copy2(src, dst)
    print(f"Copied {src} -> {dst}")

print("Done!")
