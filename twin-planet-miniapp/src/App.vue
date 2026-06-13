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
/* ================================================================
   双宝手帐 · Twin Journal
   暖纸 + 手绘 + 玩具触感
   ================================================================ */
page {
  --paper:       #FFFBF2;
  --paper-warm:  #FFF7ED;
  --ink:         #2C2416;
  --ink-md:      #8C7E6B;
  --ink-lt:      #C4B8A8;
  --amber:       #E8824A;
  --amber-lt:    #FFF1E5;
  --amber-bg:    #FEF5EE;
  --rose:        #D4856B;
  --rose-lt:     #FFF0EA;
  --mint:        #6BAF7E;
  --mint-lt:     #EDF6EF;
  --gold:        #D4A843;
  --gold-lt:     #FFF8E8;
  --dot-line:    #E8E0D4;

  --font-journal: Georgia, KaiTi, STKaiti, serif;
  --font-ui:      PingFang SC, Microsoft YaHei, sans-serif;

  --radius-sm: 12rpx; --radius-md: 18rpx; --radius-lg: 24rpx; --radius-full: 9999rpx;
  --space-xs: 8rpx; --space-sm: 14rpx; --space-md: 28rpx; --space-lg: 48rpx;
  --font-caption: 20rpx; --font-body: 28rpx; --font-card: 32rpx; --font-title: 40rpx; --font-hero: 52rpx;
  --font-xs:20rpx;--font-sm:24rpx;--font-base:30rpx;--font-md:36rpx;--font-lg:44rpx;--font-xl:56rpx;--font-xxl:68rpx;
  --touch-min: 88rpx;
  --leading-tight:1.2;--leading-body:1.6;
  --dur-fast:0.15s;--dur-normal:0.3s;--dur-slow:0.5s;
  --ease-bounce: cubic-bezier(0.34,1.3,0.64,1);
  --ease-soft: cubic-bezier(0.16,1,0.3,1);

  --twin-baby-a: var(--amber);
  --twin-baby-b: var(--rose);
  --twin-baby-a-light: var(--amber-lt);
  --twin-baby-b-light: var(--rose-lt);
  --twin-bg: var(--paper);
  --twin-card-bg: var(--paper-warm);
  --twin-text: var(--ink);
  --twin-text-secondary: var(--ink-md);
  --twin-text-muted: var(--ink-lt);
  --twin-accent: var(--mint);
  --twin-accent-light: var(--mint-lt);
  --twin-warning: var(--gold);
  --twin-warning-light: var(--gold-lt);
  --twin-danger: #D4706B;
  --twin-border: var(--dot-line);
  --twin-radius-sm:var(--radius-sm);--twin-radius-md:var(--radius-md);--twin-radius-lg:var(--radius-lg);--twin-radius-full:var(--radius-full);
  --twin-shadow-sm: 0 2rpx 8rpx rgba(44,36,22,0.04);
  --twin-shadow-md: 0 4rpx 16rpx rgba(44,36,22,0.05);

  background: var(--paper);
  color: var(--ink);
  font-family: PingFang SC, Microsoft YaHei, sans-serif;
}

.page-shell { min-height:100vh; background:var(--paper); padding:44rpx 28rpx calc(64rpx + env(safe-area-inset-bottom)); }

/* 手绘虚线分隔 */
.journal-divider { border:none; border-top:1.5px dashed var(--dot-line); margin:20rpx 0; }

/* 标题 */
.heading-xl { font-family:var(--font-journal); font-size:var(--font-hero); font-weight:400; color:var(--ink); letter-spacing:-0.5px; }
.heading-lg { font-family:var(--font-journal); font-size:var(--font-title); font-weight:400; color:var(--ink); }
.body-text { font-size:var(--font-body); color:var(--ink-md); line-height:var(--leading-body); }
.caption { font-size:var(--font-caption); color:var(--ink-lt); }

/* 按钮 */
.btn-primary {
  display:flex; align-items:center; justify-content:center;
  min-height:var(--touch-min); padding:24rpx 40rpx;
  background:var(--amber); color:#FFF; border:none;
  border-radius:var(--radius-full); font-size:var(--font-body); font-weight:700;
  letter-spacing:3rpx; box-shadow:0 8rpx 24rpx rgba(232,130,74,0.2);
  transition:transform var(--dur-fast) var(--ease-bounce);
}
.btn-primary:active { transform:scale(0.94); }

.btn-outline {
  display:flex; align-items:center; justify-content:center;
  min-height:var(--touch-min); padding:20rpx 32rpx;
  background:transparent; color:var(--ink);
  border:2rpx solid var(--dot-line); border-radius:var(--radius-full);
  font-size:var(--font-body); font-weight:500;
  transition:transform var(--dur-fast) var(--ease-bounce);
}
.btn-outline:active { transform:scale(0.94); border-color:var(--amber); }

/* 暗色模式适配 */
.theme-dark {
  --paper: #1E1C18; --paper-warm: #282520; --ink: #EBE5D8;
  --ink-md: #9C9488; --ink-lt: #6B6558; --dot-line: #3D3830;
  --amber-lt: #2E2218; --rose-lt: #2E221E;
  --mint-lt: #1E2A22; --gold-lt: #2E2818;
  --amber-bg: #2E2218;
}
</style>
