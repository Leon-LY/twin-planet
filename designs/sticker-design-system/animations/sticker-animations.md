# 双宝记 · 贴纸动画系统

> CSS @keyframes only · WXSS compatible · Granny-mode aware

## Animation Catalog

| Keyframe | Duration | Easing | Use | Finite? |
|----------|:--------:|--------|-----|:-------:|
| `stickerPopBounce` | 0.7s | `ease-bounce` | Record page action icon pop | Yes (forwards) |
| `stickerUnlock` | 0.7s | `ease-stamp` | StickerStrip new sticker reveal | Yes (both) |
| `stickerPeel` | 0.6s | `ease-peel` | Corner peel-off effect (legacy) | Yes (both) |
| `stickerEarned` | 0.5s | `ease-soft` | Collection cell lock→earned transition | Yes (forwards) |
| `stickerBreathe` | 3s | linear | Subtle glow pulse on earned cells | Infinite* |
| `collectionPulse` | 2s | ease-in-out | Full collection celebration border | Finite (3 iterations) |
| `stickerPlace` | varies | `ease-stamp` | Fly-in + press + settle | Yes |
| `confettiBurst` | 0.8s | `ease-stamp` | Celebration particle scatter | Yes |

*Infinite animation disabled in granny mode via `.font-large` override.

## Usage by Surface

### Record Page (sticker pop)
```css
.sticker-pop-emoji {
  font-size: 96rpx;
  animation: stickerPopBounce .7s var(--ease-bounce) forwards;
}
```
Fires on every action. Shows the action icon (icon-bottle, icon-sleep, etc.) with a spring-like bounce.

### Today's Sticker Strip (new unlock)
```css
.sticker-item.new {
  animation: stickerUnlock .7s var(--ease-stamp) both;
}
```
Triggers when `Date.now() - sticker.earnedAt < 5000`. Golden glow halo + scale bounce.

### Collection Page (earned transition)
```css
.sticker-cell.just-earned {
  animation: stickerEarned .5s var(--ease-soft) forwards;
}
```
Apply `.just-earned` class on freshly unlocked stickers in the collection grid. Dashed → solid gold with mint flash.

### Collection Page (ambient glow)
```css
.sticker-cell.earned.sticker-breathe {
  animation: stickerBreathe 3s linear infinite;
}
```
Optional subtle glow on earned cells. Disabled in granny mode.

## Granny Mode (`.font-large`)

All sticker animations are disabled when granny mode is active:
```css
.font-large .sticker-item.new,
.font-large .sticker-pop-emoji,
.font-large .sticker-cell.just-earned,
.font-large .sticker-breathe { animation: none !important; }
```

## WXSS Compatibility

All keyframes use only allowed WXSS properties:
- `transform` (translate, scale, rotate)
- `opacity`
- `box-shadow`
- `border-color`
- `background`

No forbidden properties: conic-gradient, clip-path, mask, backdrop-filter, SVG, @font-face.

## Easing Curves

| Variable | Value | Character |
|----------|-------|-----------|
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Spring overshoot |
| `--ease-stamp` | `cubic-bezier(0.25, 0.1, 0.1, 1)` | Quick press, slow release |
| `--ease-peel` | `cubic-bezier(0.5, -0.1, 0.3, 1)` | Adhesive resistance then release |
| `--ease-soft` | `cubic-bezier(0.16, 1, 0.3, 1)` | Smooth deceleration |
