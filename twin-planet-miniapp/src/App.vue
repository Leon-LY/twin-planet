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
   双宝手帐 v4 · Twin Journal
   设计方向：手绘手帐 × 玩具触感 × 编辑级排版
   ================================================================ */
page {
  --paper:  #FEF9F0;
  --cream:  #FFF5E8;
  --ink:    #2D2318;
  --ink-md: #9C8E7C;
  --ink-lt: #D4C8B8;
  --amber:  #E07B3E;
  --amber-lt: rgba(224,123,62,0.08);
  --amber-md: rgba(224,123,62,0.18);
  --rose:   #D48068;
  --rose-lt: rgba(212,128,104,0.08);
  --rose-md: rgba(212,128,104,0.18);
  --mint:   #5C9A6E;
  --mint-lt: rgba(92,154,110,0.1);
  --gold:   #C8993E;
  --gold-lt: rgba(200,153,62,0.12);
  --dot:    #E8DCC8;

  --font-journal: Georgia, KaiTi, STKaiti, serif;
  --font-ui: PingFang SC, Microsoft YaHei, sans-serif;

  --radius-sm:12rpx;--radius-md:20rpx;--radius-lg:28rpx;--radius-full:9999rpx;
  --space-xs:8rpx;--space-sm:14rpx;--space-md:28rpx;--space-lg:48rpx;
  --font-caption:20rpx;--font-body:28rpx;--font-card:32rpx;--font-title:44rpx;--font-hero:56rpx;
  --font-xs:20rpx;--font-sm:24rpx;--font-base:30rpx;--font-md:36rpx;--font-lg:48rpx;--font-xl:60rpx;--font-xxl:72rpx;
  --leading-tight:1.15;--leading-body:1.6;--touch-min:88rpx;
  --dur-fast:0.15s;--dur-normal:0.3s;--dur-slow:0.5s;
  --ease-bounce:cubic-bezier(0.34,1.3,0.64,1);
  --ease-soft:cubic-bezier(0.16,1,0.3,1);

  --twin-baby-a:var(--amber);--twin-baby-b:var(--rose);
  --twin-baby-a-light:var(--amber-lt);--twin-baby-b-light:var(--rose-lt);
  --twin-bg:var(--paper);--twin-card-bg:var(--cream);
  --twin-text:var(--ink);--twin-text-secondary:var(--ink-md);--twin-text-muted:var(--ink-lt);
  --twin-accent:var(--mint);--twin-accent-light:var(--mint-lt);
  --twin-warning:var(--gold);--twin-warning-light:var(--gold-lt);
  --twin-danger:#D4706B;--twin-border:var(--dot);
  --twin-radius-sm:var(--radius-sm);--twin-radius-md:var(--radius-md);--twin-radius-lg:var(--radius-lg);--twin-radius-full:var(--radius-full);
  --twin-shadow-sm:0 2rpx 8rpx rgba(45,35,24,0.04);--twin-shadow-md:0 4rpx 16rpx rgba(45,35,24,0.06);

  background:var(--paper);
  color:var(--ink);
  font-family:PingFang SC,Microsoft YaHei,sans-serif;
}

.page-shell{min-height:100vh;background:var(--paper);padding:48rpx 28rpx calc(64rpx + env(safe-area-inset-bottom))}/* 纸张微粒纹理 */.page-shell::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:999;background:repeating-linear-gradient(0deg,transparent,transparent 2rpx,rgba(45,35,24,0.015) 2rpx,rgba(45,35,24,0.015) 3rpx),repeating-linear-gradient(90deg,transparent,transparent 3rpx,rgba(45,35,24,0.008) 3rpx,rgba(45,35,24,0.008) 4rpx);opacity:0.5}.reduce-motion *,.reduce-motion ::before,.reduce-motion ::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important}

/* 手绘虚线 */
.journal-divider{border:none;border-top:1.5px dashed var(--dot);margin:20rpx 0}

/* 标题 */
.heading-xl{font-family:var(--font-journal);font-size:var(--font-hero);font-weight:400;color:var(--ink);letter-spacing:-1rpx}
.heading-lg{font-family:var(--font-journal);font-size:var(--font-title);font-weight:400;color:var(--ink)}
.body-text{font-size:var(--font-body);color:var(--ink-md);line-height:var(--leading-body)}
.caption{font-size:var(--font-caption);color:var(--ink-lt)}

/* 按钮 */
.btn-primary{display:flex;align-items:center;justify-content:center;min-height:var(--touch-min);padding:24rpx 40rpx;background:var(--amber);color:#FFF;border:none;border-radius:var(--radius-full);font-size:var(--font-body);font-weight:700;letter-spacing:3rpx;box-shadow:0 8rpx 24rpx rgba(224,123,62,0.2);transition:transform var(--dur-fast) var(--ease-bounce)}
.btn-primary:active{transform:scale(0.94)}
.btn-outline{display:flex;align-items:center;justify-content:center;min-height:var(--touch-min);padding:20rpx 32rpx;background:transparent;color:var(--ink);border:2rpx solid var(--dot);border-radius:var(--radius-full);font-size:var(--font-body);font-weight:500;transition:transform var(--dur-fast) var(--ease-bounce)}
.btn-outline:active{transform:scale(0.94);border-color:var(--amber)}

/* 暗色模式 */
.theme-dark{
  --paper:#1E1C18;--cream:#282520;--ink:#EBE5D8;--ink-md:#9C9488;--ink-lt:#6B6558;--dot:#3D3830;
  --amber-lt:rgba(224,123,62,0.1);--rose-lt:rgba(212,128,104,0.1);
  --mint-lt:rgba(92,154,110,0.08);--gold-lt:rgba(200,153,62,0.1)
}
</style>
