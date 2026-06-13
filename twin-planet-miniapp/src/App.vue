<script>
export default {
  onLaunch() {
    try {
      const app = getApp()
      if (app) {
        const hour = new Date().getHours()
        const isNight = hour >= 22 || hour < 6
        app.globalData = app.globalData || {}
        app.globalData.__theme = isNight ? 'dark' : 'light'
      }
    } catch (_) {}
  },
  onShow() {
    try {
      const app = getApp()
      if (app && app.globalData) {
        const hour = new Date().getHours()
        const isNight = hour >= 22 || hour < 6
        app.globalData.__theme = isNight ? 'dark' : 'light'
      }
    } catch (_) {}
  },
  onHide() {},
}
</script>

<style>
/* V10.0 Neo-Cosmic · Step 1: CSS tokens only */
page {
  --cosmic-void:       #0A0A14;
  --cosmic-matter:     #141428;
  --twin-a:            #FF6B35;
  --twin-b:            #A855F7;
  --twin-a-glow:       rgba(255,107,53,0.25);
  --twin-b-glow:       rgba(168,85,247,0.25);
  --twin-a-surface:    rgba(255,107,53,0.08);
  --twin-b-surface:    rgba(168,85,247,0.08);
  --cosmic-cyan:       #00E5FF;
  --cosmic-green:      #00FFA3;
  --cosmic-gold:       #FFD23F;
  --cosmic-red:        #FF4D6A;
  --text-starlight:    #F0ECFF;
  --text-dust:         #8B86A3;
  --text-whisper:      #545070;
  --surface-card:      #141428;
  --border-void:       #2A2A40;
  --shadow-sm:         0 2rpx 8rpx rgba(0,0,0,0.3);
  --radius-sm: 8rpx; --radius-md: 16rpx; --radius-lg: 24rpx; --radius-xl: 32rpx; --radius-full: 9999rpx;
  --space-xs: 8rpx; --space-sm: 16rpx; --space-md: 32rpx; --space-lg: 64rpx;
  --font-caption: 20rpx; --font-body: 28rpx; --font-body-lg: 31rpx; --font-card: 32rpx;
  --font-subtitle: 36rpx; --font-title: 44rpx; --font-hero: 52rpx; --font-display: 64rpx;
  --font-xs: 20rpx; --font-sm: 25rpx; --font-base: 31rpx; --font-md: 39rpx; --font-lg: 49rpx; --font-xl: 61rpx; --font-xxl: 76rpx;
  --leading-tight: 1.15; --leading-body: 1.6; --touch-min: 88rpx;
  --dur-instant: 0.1s; --dur-quick: 0.2s; --dur-flow: 0.45s; --dur-fast: 0.15s; --dur-normal: 0.3s; --dur-slow: 0.5s;
  --ease-orbit: cubic-bezier(0.25, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.3, 0.64, 1);
  --ease-pulse: cubic-bezier(0.45, 0, 0.55, 1);
  --ease-editorial: cubic-bezier(0.16, 1, 0.3, 1);

  --twin-baby-a: var(--twin-a);
  --twin-baby-b: var(--twin-b);
  --twin-baby-a-light: var(--twin-a-surface);
  --twin-baby-b-light: var(--twin-b-surface);
  --twin-baby-mix: #C57E5B;
  --twin-bg: var(--cosmic-void);
  --twin-card-bg: var(--surface-card);
  --twin-text: var(--text-starlight);
  --twin-text-secondary: var(--text-dust);
  --twin-text-muted: var(--text-whisper);
  --twin-text-tertiary: var(--text-whisper);
  --twin-accent: var(--cosmic-green);
  --twin-accent-light: rgba(0,255,163,0.08);
  --twin-warning: var(--cosmic-gold);
  --twin-warning-light: rgba(255,210,63,0.08);
  --twin-danger: var(--cosmic-red);
  --twin-gold: var(--cosmic-gold);
  --twin-border: var(--border-void);
  --twin-border-light: #1E1E35;
  --twin-hover: rgba(255,255,255,0.04);
  --twin-radius-sm: var(--radius-sm);
  --twin-radius-md: var(--radius-md);
  --twin-radius-lg: var(--radius-lg);
  --twin-radius-full: var(--radius-full);
  --twin-shadow-none: none;
  --twin-shadow-sm: var(--shadow-sm);
  --twin-shadow-md: var(--shadow-md);
  --twin-shadow-lg: var(--shadow-lg);

  background: var(--cosmic-void);
  color: var(--text-starlight);
  font-family: -apple-system, PingFang SC, Microsoft YaHei, sans-serif;
}

.page-shell { min-height: 100vh; background: var(--cosmic-void); padding: 56rpx 36rpx calc(64rpx + env(safe-area-inset-bottom)); }
.heading-xl { font-size: var(--font-hero); font-weight: 800; color: var(--text-starlight); }
.heading-lg { font-size: var(--font-title); font-weight: 700; color: var(--text-starlight); }
.heading-md { font-size: var(--font-card); font-weight: 600; color: var(--text-starlight); }
.body-text { font-size: var(--font-body); color: var(--text-dust); }
.caption { font-size: var(--font-caption); color: var(--text-whisper); }

.brand-mark { display: inline-flex; align-items: center; justify-content: center; width: 80rpx; height: 80rpx; position: relative; }
.brand-mark::before, .brand-mark::after { content: ''; position: absolute; width: 50rpx; height: 50rpx; border-radius: 50%; }
.brand-mark::before { background: var(--twin-a); left: 2rpx; top: 15rpx; z-index: 1; box-shadow: 0 0 16rpx var(--twin-a-glow); }
.brand-mark::after { background: var(--twin-b); right: 2rpx; top: 15rpx; box-shadow: 0 0 16rpx var(--twin-b-glow); }
.brand-mark-lg { width: 140rpx; height: 140rpx; }
.brand-mark-lg::before, .brand-mark-lg::after { width: 88rpx; height: 88rpx; }
.brand-mark-lg::before { left: 4rpx; top: 26rpx; }
.brand-mark-lg::after { right: 4rpx; top: 26rpx; }
.brand-mark-sm { width: 44rpx; height: 44rpx; }
.brand-mark-sm::before, .brand-mark-sm::after { width: 28rpx; height: 28rpx; }
.brand-mark-sm::before { left: 1rpx; top: 8rpx; }
.brand-mark-sm::after { right: 1rpx; top: 8rpx; }

.btn-primary { display: flex; align-items: center; justify-content: center; min-height: 88rpx; padding: 24rpx 40rpx; background: var(--surface-card); color: var(--text-starlight); border: 3rpx solid var(--border-glow, rgba(0,229,255,0.15)); border-radius: var(--radius-full); font-size: var(--font-body-lg); font-weight: 700; }
.btn-primary:active { transform: scale(0.96); }
.btn-outline { display: flex; align-items: center; justify-content: center; min-height: 88rpx; padding: 20rpx 32rpx; background: transparent; color: var(--text-starlight); border: 2rpx solid var(--border-void); border-radius: var(--radius-full); font-size: var(--font-body); }
.btn-outline:active { transform: scale(0.96); }

/* ================================================================
   @keyframes 动画库 — 并蒂宇宙
   全部使用 transform/opacity，微信 WXSS 完全兼容
   ================================================================ */
@keyframes convergeLeft {
  0% { transform: translateX(-56rpx); opacity: 0; }
  60% { opacity: 1; }
  100% { transform: translateX(0); opacity: 1; }
}
@keyframes convergeRight {
  0% { transform: translateX(56rpx); opacity: 0; }
  60% { opacity: 1; }
  100% { transform: translateX(0); opacity: 1; }
}
@keyframes convergeScale {
  0% { opacity: 0; transform: scale(0.1); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes orbitRise {
  0% { opacity: 0; transform: translateY(56rpx); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes planetBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
@keyframes bridgePulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
@keyframes textReveal {
  0% { opacity: 0; transform: translateY(16rpx); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes starTwinkle {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.5); }
}
@keyframes drawLine {
  0% { transform: scaleX(0); }
  100% { transform: scaleX(1); }
}
@keyframes haloExpand {
  0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
}
@keyframes stardustArc {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--arc-x, 60rpx), var(--arc-y, -80rpx)) scale(0); opacity: 0; }
}
@keyframes warpFlash {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.03); opacity: 0.6; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes supernova {
  0% { transform: scale(0); opacity: 0; }
  30% { transform: scale(1.5); opacity: 1; }
  100% { transform: scale(3); opacity: 0; }
}
@keyframes shootingStar {
  0% { transform: translate(0, 0); opacity: 1; }
  100% { transform: translate(-120rpx, 160rpx); opacity: 0; }
}
@keyframes orbitalRotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes zeroGFloat {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-6rpx); }
  75% { transform: translateY(6rpx); }
}
@keyframes neonFlicker {
  0%, 100% { box-shadow: 0 0 8rpx var(--cosmic-cyan), 0 0 16rpx rgba(0,229,255,0.3); }
  50% { box-shadow: 0 0 12rpx var(--cosmic-cyan), 0 0 24rpx rgba(0,229,255,0.5); }
}

/* 动画工具类 */
.anim-converge-s { animation: convergeScale 0.9s var(--ease-spring) both; }
.anim-orbit-in { animation: orbitRise 0.7s var(--ease-orbit) both; }
.anim-d1 { animation-delay: 0.00s; } .anim-d2 { animation-delay: 0.08s; }
.anim-d3 { animation-delay: 0.16s; } .anim-d4 { animation-delay: 0.24s; }
.anim-d5 { animation-delay: 0.32s; } .anim-d6 { animation-delay: 0.40s; }
.anim-d7 { animation-delay: 0.48s; } .anim-d8 { animation-delay: 0.56s; }
.anim-text-in { animation: textReveal 0.7s var(--ease-orbit) both; }
.anim-breathe { animation: planetBreathe 3s var(--ease-pulse) infinite; }
.anim-bridge { animation: bridgePulse 3s var(--ease-pulse) infinite; }
.anim-draw-line { animation: drawLine 0.6s var(--ease-orbit) both; transform-origin: left center; }
.anim-warp { animation: warpFlash 0.4s ease both; }
.anim-float { animation: zeroGFloat 6s ease infinite; }
.anim-neon { animation: neonFlicker 2s var(--ease-pulse) infinite; }

/* 品牌标记汇聚入场 */
.brand-mark.converge::before { animation: convergeLeft 0.9s cubic-bezier(0.05,0.7,0.15,1) both; }
.brand-mark.converge::after  { animation: convergeRight 0.9s cubic-bezier(0.05,0.7,0.15,1) 0.1s both; }

/* 亮色模式 */
.theme-light { --cosmic-void: #FFFBF5; --cosmic-matter: #FFFFFF; --twin-a: #E85D26; --twin-b: #9333EA; --text-starlight: #1A1A2E; --text-dust: #6B6880; --text-whisper: #A09CB5; --surface-card: #FFFFFF; --border-void: #E5E0D8; --shadow-sm: 0 2rpx 8rpx rgba(0,0,0,0.04); }
</style>
