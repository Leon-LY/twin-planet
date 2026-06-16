"""Find matching-brightness source pixels adjacent to the cross"""
import cv2
import numpy as np

img = cv2.imread('icon-concept-d-figures.png', cv2.IMREAD_UNCHANGED)

print("=== Pixels just LEFT of the cross (x=470-486, y=340-375) ===")
for y in range(338, 378, 2):
    row = []
    for x in range(470, 548, 2):
        b, g, r = img[y, x, :3]
        row.append(f"({r:3d},{g:3d},{b:3d})")
    print(f"y={y}: {' '.join(row)}")

print("\n=== Checking x=484-486 (just left of horizontal arm start at x=488) ===")
for y in range(340, 375):
    b, g, r = img[y, 486, :3]
    bright = (int(r)+int(g)+int(b))/3
    print(f"  y={y}: RGB({r},{g},{b}) brightness={bright:.0f}")
