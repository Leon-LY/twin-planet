<script>
import { monitorStorage } from '@/utils/storageMonitor'

export default {
  onLaunch() {
    this._syncTheme()
    // 每小时检查一次暗色模式切换
    this._themeTimer = setInterval(() => this._syncTheme(), 60 * 60 * 1000)
    // 检查存储配额（首次启动时）
    setTimeout(() => monitorStorage(), 3000)
  },
  onShow() {
    this._syncTheme()
  },
  onHide() {
    // keep timer running while app is in background
  },
  methods: {
    _syncTheme() {
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
  },
  beforeUnmount() {
    if (this._themeTimer) {
      clearInterval(this._themeTimer)
      this._themeTimer = null
    }
  },
}
</script>

<style>
/* ================================================================
   双宝记 v5 · Twin Planet
   设计方向：温暖手帳 × 贴纸收集 × 双宝成长
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
  --font-ui: 'PingFang SC', 'Microsoft YaHei', sans-serif;

  --radius-sm:12rpx;--radius-md:20rpx;--radius-lg:28rpx;--radius-full:9999rpx;
  --space-xs:8rpx;--space-sm:14rpx;--space-md:28rpx;--space-lg:48rpx;
  --font-caption:20rpx;--font-body:28rpx;--font-card:32rpx;--font-title:44rpx;--font-hero:56rpx;
  --font-xs:20rpx;--font-sm:24rpx;--font-base:30rpx;--font-md:36rpx;--font-lg:48rpx;--font-xl:60rpx;--font-xxl:72rpx;
  --leading-tight:1.15;--leading-body:1.6;--touch-min:88rpx;
  --dur-fast:0.15s;--dur-normal:0.3s;--dur-slow:0.5s;
  --ease-bounce:cubic-bezier(0.34,1.3,0.64,1);
  --ease-soft:cubic-bezier(0.16,1,0.3,1);
  /* 手帳物理曲线 */
  --ease-stamp:cubic-bezier(0.25,0.1,0.1,1);    /* 盖章：快压慢起 */
  --ease-page:cubic-bezier(0.3,0,0.1,1);        /* 翻页：平滑加速后干脆停止 */
  --ease-peel:cubic-bezier(0.5,-0.1,0.3,1);     /* 撕胶带：初始阻力+释放 */
  --ease-drop:cubic-bezier(0.2,1.6,0.5,1);      /* 掉落：弹跳着陆 */
  --ease-ink:cubic-bezier(0.05,0,0.05,1);       /* 书写：极慢起笔 */

  --twin-baby-a:var(--amber);--twin-baby-b:var(--rose);
  --twin-baby-a-light:var(--amber-lt);--twin-baby-b-light:var(--rose-lt);
  --twin-bg:var(--paper);--twin-card-bg:var(--cream);
  --twin-text:var(--ink);--twin-text-secondary:var(--ink-md);--twin-text-muted:var(--ink-lt);
  --twin-accent:var(--mint);--twin-accent-light:var(--mint-lt);
  --twin-warning:var(--gold);--twin-warning-light:var(--gold-lt);
  --twin-danger:#D4706B;--twin-border:var(--dot);
  --twin-text-tertiary:var(--ink-lt);--twin-hover:rgba(45,35,24,0.04);
  --twin-radius-sm:var(--radius-sm);--twin-radius-md:var(--radius-md);--twin-radius-lg:var(--radius-lg);--twin-radius-full:var(--radius-full);
  --twin-shadow-sm:0 2rpx 8rpx rgba(45,35,24,0.04);--twin-shadow-md:0 4rpx 16rpx rgba(45,35,24,0.06);

  /* 向后兼容别名 */
  --surface-card:var(--cream);--border-void:var(--dot);
  --text-starlight:var(--ink);--text-dust:var(--ink-md);--text-whisper:var(--ink-lt);
  --twin-a:var(--amber);--twin-b:var(--rose);
  --twin-a-glow:rgba(224,123,62,0.3);--twin-b-glow:rgba(212,128,104,0.3);
  --cosmic-cyan:var(--mint);--cosmic-gold:var(--gold);--cosmic-red:#D4706B;
  --border-glow:var(--gold-lt);
  --radius-xl:var(--radius-lg);
  --ease-pulse:var(--ease-soft);--ease-orbit:var(--ease-soft);--ease-breathing:var(--ease-soft);--ease-stardust:var(--ease-soft);--ease-spring:var(--ease-bounce);
  --dur-quick:var(--dur-fast);--dur-flow:var(--dur-normal);--dur-breathe:3s;--dur-stardust:0.5s;--dur-instant:0.1s;

  background:var(--paper);
  color:var(--ink);
  font-family:'PingFang SC','Microsoft YaHei',sans-serif;
}

.page-shell{min-height:100vh;background:var(--paper);padding:48rpx 28rpx calc(64rpx + env(safe-area-inset-bottom))}

/* ═══════════════════════════════════════════
   手帳全局样式 · Journal Design System
   点阵背景 / 装订孔 / 纸层叠 / 和纸胶带 / 印章
   ═══════════════════════════════════════════ */

/* 点阵纸纹 — 子弹笔记风格 */
.journal-paper {
  background-image:
    radial-gradient(circle, var(--dot) 0.8rpx, transparent 0.8rpx);
  background-size: 44rpx 44rpx;
  background-position: 6rpx 6rpx;
}
/* 点阵页面上隐藏全局光斑，避免纹理叠加 */
.journal-paper > .bg-spot { display: none; }

/* 纸页层叠阴影 — 立体"翻开中"的厚度感 */
.journal-card {
  position: relative;
  background: var(--cream);
  border-radius: 6rpx 22rpx 6rpx 22rpx;
  border: 1.5px solid var(--dot);
  box-shadow:
    0 1rpx 0 rgba(0,0,0,0.03),
    0 3rpx 8rpx rgba(0,0,0,0.04),
    0 6rpx 20rpx rgba(0,0,0,0.03);
}
/* 纸页底层阴影（下一张纸） */
.journal-card::before {
  content: '';
  position: absolute;
  top: 6rpx; left: 4rpx; right: 4rpx; bottom: -4rpx;
  background: var(--cream);
  opacity: 0.7;
  border-radius: 6rpx 22rpx 6rpx 22rpx;
  border: 1px solid var(--dot);
  z-index: -1;
  transform: rotate(-0.5deg);
}

/* 页边红线 — 中文笔记本的结构线 */
.journal-margin {
  border-left: 2rpx solid rgba(212,112,107,0.25);
  padding-left: 24rpx;
}

/* 装订孔 — 环形活页夹孔 */
.journal-holes {
  position: relative;
}
.journal-holes::after {
  content: '';
  position: absolute;
  left: -14rpx;
  top: 18%;
  bottom: 18%;
  width: 8rpx;
  display: flex;
  flex-direction: column;
  gap: 28%;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(circle 8rpx at center, transparent 5rpx, var(--dot) 5.5rpx, var(--dot) 6.5rpx, transparent 7rpx) repeat-y 0 0 / 8rpx calc(100% / 3);
}

/* 和纸胶带 — 撕裂边缘 + 纤维肌理 + 物理厚度 */
.journal-tape {
  position: absolute;
  top: -12rpx;
  left: 50%;
  transform: translateX(-50%) rotate(-2.8deg);
  width: 68%;
  height: 28rpx;
  z-index: 2;
  pointer-events: none;
  animation: tapeUnroll .6s var(--ease-peel) both;
  /* 不规则圆角 — 模拟手撕 */
  border-radius: 8rpx 1rpx 6rpx 2rpx;
  /* 双层投影：贴合阴影 + 厚度阴影 */
  box-shadow:
    0 1rpx 0 rgba(0,0,0,0.04),
    0 2rpx 4rpx rgba(0,0,0,0.05),
    0 4rpx 8rpx rgba(0,0,0,0.02);
}
/* 撕裂端锯齿 — 在胶带左端用圆点模拟撕痕 */
.journal-tape::before {
  content: '';
  position: absolute;
  left: -1rpx;
  top: 2rpx;
  bottom: 2rpx;
  width: 6rpx;
  background:
    radial-gradient(circle 1.5rpx at 3rpx 4rpx, rgba(0,0,0,0.06) 0.5rpx, transparent 1rpx),
    radial-gradient(circle 2rpx at 3rpx 14rpx, rgba(0,0,0,0.05) 0.5rpx, transparent 1rpx),
    radial-gradient(circle 1.5rpx at 3rpx 22rpx, rgba(0,0,0,0.06) 0.5rpx, transparent 1rpx);
  pointer-events: none;
  z-index: 0;
  border-radius: 0 0 0 2rpx;
}
/* 纤维肌理 — 微小噪点模拟和纸 */
.journal-tape::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    radial-gradient(circle 0.6rpx at 20% 30%, rgba(255,255,255,0.2) 0, transparent 1rpx),
    radial-gradient(circle 0.5rpx at 60% 55%, rgba(0,0,0,0.05) 0, transparent 1rpx),
    radial-gradient(circle 0.6rpx at 80% 40%, rgba(255,255,255,0.15) 0, transparent 1rpx),
    radial-gradient(circle 0.4rpx at 35% 70%, rgba(0,0,0,0.04) 0, transparent 1rpx),
    radial-gradient(circle 0.5rpx at 70% 25%, rgba(255,255,255,0.18) 0, transparent 1rpx);
  pointer-events: none;
}

.journal-tape.tape-amber {
  background: linear-gradient(175deg,
    rgba(224,123,62,0.28) 0%,
    rgba(224,123,62,0.18) 20%,
    rgba(224,123,62,0.12) 55%,
    rgba(224,123,62,0.20) 85%,
    rgba(224,123,62,0.26) 100%);
}
.journal-tape.tape-rose {
  background: linear-gradient(175deg,
    rgba(212,128,104,0.28) 0%,
    rgba(212,128,104,0.18) 20%,
    rgba(212,128,104,0.12) 55%,
    rgba(212,128,104,0.20) 85%,
    rgba(212,128,104,0.26) 100%);
  transform: translateX(-50%) rotate(2.6deg);
  border-radius: 2rpx 7rpx 1rpx 4rpx;
}
.journal-tape.tape-mint {
  background: linear-gradient(175deg,
    rgba(92,154,110,0.22) 0%,
    rgba(92,154,110,0.14) 20%,
    rgba(92,154,110,0.08) 55%,
    rgba(92,154,110,0.16) 85%,
    rgba(92,154,110,0.20) 100%);
  transform: translateX(-50%) rotate(-1.8deg);
  border-radius: 5rpx 3rpx 7rpx 1rpx;
}
.journal-tape.tape-gold {
  background: linear-gradient(175deg,
    rgba(200,153,62,0.30) 0%,
    rgba(200,153,62,0.18) 20%,
    rgba(200,153,62,0.12) 55%,
    rgba(200,153,62,0.22) 85%,
    rgba(200,153,62,0.28) 100%);
  transform: translateX(-50%) rotate(1.5deg);
  border-radius: 3rpx 5rpx 2rpx 6rpx;
}

/* 印章效果 — 不规则圆角 + 微旋转 + 颜色溢出感 */
.journal-stamp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx 18rpx;
  border-radius: 4rpx 14rpx 4rpx 14rpx;
  font-family: var(--font-journal);
  font-weight: 700;
  transform: rotate(2deg);
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.08);
  animation: stampDown .5s var(--ease-stamp) both;
}
.journal-stamp.stamp-amber {
  background: var(--amber-lt);
  color: var(--amber);
  border: 1.5px solid var(--amber-md);
}
.journal-stamp.stamp-mint {
  background: var(--mint-lt);
  color: var(--mint);
  border: 1.5px solid var(--mint-lt);
}
.journal-stamp.stamp-gold {
  background: var(--gold-lt);
  color: var(--gold);
  border: 1.5px solid var(--gold-lt);
}

/* 便签贴 — 微旋转 + 投影，仿 Post-it */
.journal-sticky {
  display: inline-block;
  padding: 12rpx 20rpx;
  background: linear-gradient(170deg, var(--gold-lt), rgba(200,153,62,0.06));
  border: 1px solid rgba(200,153,62,0.15);
  border-radius: 2rpx 12rpx 2rpx 12rpx;
  font-family: var(--font-journal);
  font-size: var(--font-caption);
  color: var(--ink-md);
  transform: rotate(-1.5deg);
  box-shadow: 0 3rpx 8rpx rgba(0,0,0,0.06);
}

/* 页卷角 — 卡片右下角翻起效果 */
.journal-curl {
  position: relative;
  overflow: visible;
}
.journal-curl::after {
  content: '';
  position: absolute;
  right: -2rpx;
  bottom: -2rpx;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 32rpx 32rpx;
  border-color: transparent transparent var(--paper) transparent;
  box-shadow: -2rpx 2rpx 3rpx rgba(0,0,0,0.1);
  border-radius: 0 0 4rpx 0;
}

/* 手帳分隔线 — 比普通虚线更有手工感 */
.journal-divider{border:none;border-top:1.5px dashed var(--dot);margin:20rpx 0}

/* 手縫线 — 模拟针线装订 */
.journal-stitch {
  border-top: 1.5px dotted var(--ink-lt);
  margin: 28rpx 0;
  opacity: 0.4;
}

/* 书签缎带 — 卡片右侧悬挂 */
.journal-ribbon {
  position: absolute;
  right: -10rpx;
  top: -10rpx;
  width: 28rpx;
  height: 80rpx;
  background: linear-gradient(180deg, var(--rose-md) 0%, var(--rose) 100%);
  border-radius: 4rpx 2rpx 2rpx 4rpx;
  z-index: 3;
  pointer-events: none;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
  animation: ribbonFall .7s var(--ease-drop) .4s both;
}
.journal-ribbon::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0;
  border-left: 14rpx solid transparent;
  border-right: 14rpx solid transparent;
  border-top: 12rpx solid var(--rose);
  border-radius: 0 0 2rpx 2rpx;
}

/* 回形针 — 卡片角落装饰 */
.journal-clip {
  position: absolute;
  top: -12rpx;
  right: 28rpx;
  width: 32rpx;
  height: 52rpx;
  border: 2.5px solid var(--ink-lt);
  border-radius: 14rpx 14rpx 4rpx 4rpx;
  z-index: 3;
  pointer-events: none;
  opacity: 0.5;
}
.journal-clip::after {
  content: '';
  position: absolute;
  bottom: -4rpx;
  left: 4rpx;
  width: 14rpx;
  height: 20rpx;
  border: 2.5px solid var(--ink-lt);
  border-top: none;
  border-radius: 0 0 8rpx 8rpx;
}

/* 撕纸边 — 模拟手撕的不规则边缘 */
.journal-tear {
  position: relative;
}
.journal-tear::before {
  content: '';
  position: absolute;
  top: -6rpx;
  left: 8rpx;
  right: 8rpx;
  height: 6rpx;
  background:
    radial-gradient(circle 3rpx at 10rpx 3rpx, var(--paper) 2rpx, transparent 3rpx),
    radial-gradient(circle 3rpx at 30rpx 3rpx, var(--paper) 2rpx, transparent 3rpx),
    radial-gradient(circle 3rpx at 50rpx 3rpx, var(--paper) 2rpx, transparent 3rpx),
    radial-gradient(circle 3rpx at 70rpx 3rpx, var(--paper) 2rpx, transparent 3rpx),
    radial-gradient(circle 3rpx at 90rpx 3rpx, var(--paper) 2rpx, transparent 3rpx),
    radial-gradient(circle 3rpx at 110rpx 3rpx, var(--paper) 2rpx, transparent 3rpx);
  z-index: 1;
}

.heading-xl{font-family:var(--font-journal);font-size:var(--font-hero);font-weight:400;color:var(--ink);letter-spacing:-1rpx}
.heading-lg{font-family:var(--font-journal);font-size:var(--font-title);font-weight:400;color:var(--ink)}
.body-text{font-size:var(--font-body);color:var(--ink-md);line-height:var(--leading-body)}
.caption{font-size:var(--font-caption);color:var(--ink-lt)}

/* ═══════════════════════════════════════════
   物理按钮系统 · Physical Button System
   每个按钮都是纸面上的实体物件：凸起 = 可按，凹陷 = 已按
   ═══════════════════════════════════════════ */

/* 主按钮 — 凸起的蜡封印章。顶部受光、底部投影、按下时陷入纸面 */
.btn-primary{
  display:flex;align-items:center;justify-content:center;
  min-height:var(--touch-min);padding:24rpx 40rpx;
  /* 曲面渐变：上亮下暗模拟凸起圆柱 */
  background: linear-gradient(180deg,
    rgba(255,255,255,0.18) 0%,
    rgba(255,255,255,0.04) 30%,
    transparent 55%,
    rgba(0,0,0,0.06) 100%
  ), var(--amber);
  color:#FFF;border:none;border-radius:var(--radius-full);
  font-size:var(--font-body);font-weight:700;letter-spacing:3rpx;
  /* 多层阴影：底面厚度 + 悬浮投影 + 环境光 */
  box-shadow:
    inset 0 1rpx 0 rgba(255,255,255,0.25),
    0 3rpx 0 rgba(192,104,52,0.5),
    0 4rpx 8rpx rgba(0,0,0,0.06),
    0 8rpx 24rpx rgba(224,123,62,0.2);
  transition: all var(--dur-fast) var(--ease-stamp);
  position:relative;
}
.btn-primary::after{
  content:'';position:absolute;top:8rpx;left:18%;right:18%;height:40%;
  background:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.22) 0%,transparent 100%);
  border-radius:50%;pointer-events:none;
}
/* 按下：阴影收缩 → 按钮陷入纸面 */
.btn-primary:active{
  transform:scale(0.94);
  box-shadow:
    inset 0 2rpx 6rpx rgba(0,0,0,0.12),
    0 1rpx 0 rgba(192,104,52,0.4),
    0 2rpx 4rpx rgba(0,0,0,0.04);
}

/* 描边按钮 — 纸面凸起边框。轻微浮起 + 按压边框变色 */
.btn-outline{
  display:flex;align-items:center;justify-content:center;
  min-height:var(--touch-min);padding:20rpx 32rpx;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.5) 0%,
    transparent 40%,
    rgba(0,0,0,0.02) 100%
  ), var(--paper);
  color:var(--ink);border:2rpx solid var(--dot);
  border-radius:var(--radius-full);
  font-size:var(--font-body);font-weight:500;
  box-shadow:
    0 2rpx 0 rgba(0,0,0,0.04),
    0 3rpx 8rpx rgba(0,0,0,0.03);
  transition: all var(--dur-fast) var(--ease-stamp);
}
.btn-outline:active{
  transform:scale(0.94);
  border-color:var(--amber);
  box-shadow:
    inset 0 1rpx 4rpx rgba(0,0,0,0.06),
    0 0 0 rgba(0,0,0,0);
  background:var(--amber-lt);
}

/* 危险按钮 — 凸起红色，同主按钮物理感 */
.btn-danger{
  display:flex;align-items:center;justify-content:center;
  min-height:var(--touch-min);padding:24rpx 40rpx;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.16) 0%,
    rgba(255,255,255,0.03) 30%,
    transparent 55%,
    rgba(0,0,0,0.08) 100%
  ), var(--twin-danger);
  color:#FFF;border:none;border-radius:var(--radius-full);
  font-size:var(--font-body);font-weight:700;
  box-shadow:
    inset 0 1rpx 0 rgba(255,255,255,0.2),
    0 3rpx 0 rgba(180,90,85,0.5),
    0 4rpx 8rpx rgba(0,0,0,0.06),
    0 8rpx 20rpx rgba(212,112,107,0.2);
  transition:all var(--dur-fast) var(--ease-stamp);
}
.btn-danger:active{
  transform:scale(0.94);
  box-shadow:
    inset 0 2rpx 6rpx rgba(0,0,0,0.12),
    0 1rpx 0 rgba(180,90,85,0.4),
    0 2rpx 4rpx rgba(0,0,0,0.04);
}

/* 幽灵按钮 — 扁平文字，按压微微凹陷 */
.btn-ghost{
  display:flex;align-items:center;justify-content:center;
  padding:16rpx 28rpx;background:transparent;color:var(--ink-md);
  border:none;font-size:var(--font-body);font-weight:500;
  border-radius:var(--radius-sm);
  transition:all var(--dur-fast) var(--ease-soft);
}
.btn-ghost:active{
  background:rgba(0,0,0,0.04);
  color:var(--amber);
  box-shadow:inset 0 1rpx 3rpx rgba(0,0,0,0.04);
}

/* 小型操作按钮 — 凸起的小物件 */
.btn-sm{
  display:inline-flex;align-items:center;justify-content:center;
  gap:6rpx;padding:14rpx 24rpx;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.6) 0%, transparent 40%,
    rgba(0,0,0,0.03) 100%
  ), var(--cream);
  border:1.5rpx solid var(--dot);
  border-radius:var(--radius-full);
  font-size:var(--font-sm);font-weight:600;color:var(--ink);
  box-shadow:
    0 1.5rpx 0 rgba(0,0,0,0.04),
    0 2rpx 6rpx rgba(0,0,0,0.03);
  transition:all var(--dur-fast) var(--ease-stamp);
}
.btn-sm:active{
  transform:scale(0.92);
  box-shadow:inset 0 1rpx 3rpx rgba(0,0,0,0.06);
  background:var(--amber-lt);
}
.btn-sm.primary{
  background: linear-gradient(180deg,
    rgba(255,255,255,0.15) 0%, transparent 55%,
    rgba(0,0,0,0.05) 100%
  ), var(--amber);
  color:#FFF;border-color:var(--amber);
  box-shadow:
    inset 0 1rpx 0 rgba(255,255,255,0.2),
    0 2rpx 0 rgba(192,104,52,0.5),
    0 3rpx 8rpx rgba(224,123,62,0.15);
}
.btn-sm.primary:active{
  box-shadow:inset 0 2rpx 4rpx rgba(0,0,0,0.12);
}

/* ═══════════════════════════════════════════
   物理输入框系统 · Recessed Writing Surface
   输入区 = 纸面上凹陷的书写区域
   ═══════════════════════════════════════════ */

.input-field{
  width:100%;padding:20rpx 24rpx;box-sizing:border-box;
  /* 凹陷纸面：顶部内阴影（光线照入凹槽）+ 底部微凸边缘 */
  background: linear-gradient(180deg,
    rgba(0,0,0,0.015) 0%, transparent 8%
  ), var(--paper);
  border:2rpx solid var(--dot);
  border-radius:var(--radius-sm);
  font-size:var(--font-body);color:var(--ink);
  font-family:var(--font-journal);
  box-shadow:
    inset 0 2rpx 6rpx rgba(0,0,0,0.04),
    inset 0 0 0 1rpx rgba(0,0,0,0.02),
    0 1rpx 0 rgba(255,255,255,0.6);
  transition:all var(--dur-fast) var(--ease-soft);
}
/* 聚焦：凹槽更深，边框变暖 */
.input-field:focus{
  border-color:var(--amber);
  box-shadow:
    inset 0 3rpx 8rpx rgba(0,0,0,0.06),
    inset 0 0 0 1rpx rgba(0,0,0,0.03),
    0 0 0 3rpx var(--amber-lt),
    0 1rpx 0 rgba(255,255,255,0.6);
}

/* 输入区 — 带横线纸纹（适合多行/备注） */
.input-lined{
  width:100%;padding:20rpx 24rpx;box-sizing:border-box;
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent, transparent 38rpx,
      var(--dot) 38rpx, var(--dot) 39rpx
    );
  background-color:var(--paper);
  background-position:0 10rpx;
  border:2rpx solid var(--dot);
  border-radius:var(--radius-sm);
  font-size:var(--font-body);color:var(--ink);
  font-family:var(--font-journal);
  line-height:39rpx;
  box-shadow:
    inset 0 2rpx 6rpx rgba(0,0,0,0.04),
    0 1rpx 0 rgba(255,255,255,0.6);
}
.input-lined:focus{
  border-color:var(--amber);
  box-shadow:
    inset 0 3rpx 8rpx rgba(0,0,0,0.06),
    0 0 0 3rpx var(--amber-lt);
}

/* ═══════════════════════════════════════════
   物理卡片系统 · Layered Paper Cards
   每张卡片 = 桌面上叠放的纸页
   ═══════════════════════════════════════════ */

/* 基础纸卡 — 轻微浮起 + 微旋转模拟手工摆放 */
.card-paper{
  background:var(--cream);
  border:1.5rpx solid var(--dot);
  border-radius:var(--radius-md);
  padding:24rpx;
  /* 纸层叠阴影：贴合阴影 + 悬浮投影 + 环境光 */
  box-shadow:
    0 1rpx 0 rgba(0,0,0,0.03),
    0 2rpx 8rpx rgba(0,0,0,0.04),
    0 4rpx 16rpx rgba(0,0,0,0.03);
  position:relative;
  transition:transform var(--dur-fast) var(--ease-soft);
}
/* ::before = 下一张纸（微偏移） */
.card-paper::before{
  content:'';position:absolute;inset:-1rpx;border-radius:inherit;
  background:var(--cream);
  border:1rpx solid var(--dot);
  z-index:-1;
  transform:rotate(0.4deg) translate(2rpx,2rpx);
  box-shadow:0 1rpx 0 rgba(0,0,0,0.02);
  pointer-events:none;
}

/* 强调卡 — 带彩色上边（来自便签纸设计） */
.card-accent{
  background:var(--cream);
  border:1.5rpx solid var(--dot);
  border-top:6rpx solid var(--amber);
  border-radius:0 0 var(--radius-md) var(--radius-md);
  padding:24rpx;
  box-shadow:
    0 1rpx 0 rgba(0,0,0,0.03),
    0 3rpx 10rpx rgba(0,0,0,0.04);
}
.card-accent.rose{border-top-color:var(--rose)}
.card-accent.mint{border-top-color:var(--mint)}
.card-accent.gold{border-top-color:var(--gold)}

/* 紧凑纸卡 — 列表/条目用，轻量浮起 */
.card-entry{
  background:var(--cream);
  border:1rpx solid var(--dot);
  border-radius:var(--radius-sm);
  padding:16rpx 20rpx;
  box-shadow:
    0 1rpx 0 rgba(0,0,0,0.02),
    0 2rpx 4rpx rgba(0,0,0,0.02);
  transition:all var(--dur-fast) var(--ease-soft);
}
.card-entry:active{
  box-shadow:inset 0 1rpx 3rpx rgba(0,0,0,0.04);
  background:var(--paper);
}

/* ═══════════════════════════════════════════
   物理标签/芯片系统 · Raised Labels & Chips
   芯片 = 贴在纸面上的小标签，轻微凸起
   ═══════════════════════════════════════════ */

/* 基础芯片 — 凸起的小纸标签 */
.chip{
  display:inline-flex;align-items:center;gap:4rpx;
  padding:8rpx 16rpx;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.5) 0%, transparent 40%,
    rgba(0,0,0,0.02) 100%
  ), var(--cream);
  border:1.5rpx solid var(--dot);
  border-radius:var(--radius-full);
  font-size:var(--font-caption);color:var(--ink-md);font-weight:500;
  box-shadow:
    0 1rpx 0 rgba(0,0,0,0.03),
    0 1.5rpx 3rpx rgba(0,0,0,0.02);
  transition:all var(--dur-fast) var(--ease-stamp);
}
.chip:active{
  transform:scale(0.94);
  box-shadow:inset 0 1rpx 3rpx rgba(0,0,0,0.05);
}
/* 选中态 — 按下贴平 + 颜色变化 */
.chip.on{
  background:var(--amber-lt);
  border-color:var(--amber);
  color:var(--amber);
  box-shadow:
    inset 0 1rpx 2rpx rgba(224,123,62,0.08),
    0 0 0 1rpx rgba(224,123,62,0.08);
}
.chip.on.mint{background:var(--mint-lt);border-color:var(--mint);color:var(--mint);box-shadow:inset 0 1rpx 2rpx rgba(92,154,110,0.08),0 0 0 1rpx rgba(92,154,110,0.08)}
.chip.on.rose{background:var(--rose-lt);border-color:var(--rose);color:var(--rose);box-shadow:inset 0 1rpx 2rpx rgba(212,128,104,0.08),0 0 0 1rpx rgba(212,128,104,0.08)}

/* 标签芯片 — 带有撕纸边缘感的不规则标签 */
.chip-tag{
  display:inline-flex;align-items:center;gap:4rpx;
  padding:8rpx 16rpx;
  background:var(--cream);
  border:1.5rpx solid var(--dot);
  border-radius:3rpx 12rpx 3rpx 12rpx;
  font-size:var(--font-caption);color:var(--ink);font-weight:600;
  box-shadow:
    0 1rpx 0 rgba(0,0,0,0.03),
    0 2rpx 4rpx rgba(0,0,0,0.02);
  transform:rotate(-0.3deg);
}
.chip-tag:nth-child(2n){transform:rotate(0.4deg);border-radius:12rpx 3rpx 12rpx 3rpx}
.chip-tag:nth-child(3n){transform:rotate(-0.6deg)}

/* ═══════════════════════════════════════════
   物理关闭按钮 · Physical Close Button
   小圆形贴纸/铜钉，不是裸字形
   ═══════════════════════════════════════════ */

.close-btn{
  display:flex;align-items:center;justify-content:center;
  width:56rpx;height:56rpx;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.6) 0%, transparent 50%,
    rgba(0,0,0,0.03) 100%
  ), var(--cream);
  border:1.5rpx solid var(--dot);
  border-radius:50%;
  font-size:28rpx;color:var(--ink-md);
  box-shadow:
    0 1.5rpx 0 rgba(0,0,0,0.04),
    0 2rpx 6rpx rgba(0,0,0,0.04);
  transition:all var(--dur-fast) var(--ease-stamp);
  position:relative;
}
.close-btn::after{
  content:'';position:absolute;top:28%;left:25%;right:25%;height:30%;
  background:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.5) 0%,transparent 100%);
  border-radius:50%;pointer-events:none;
}
.close-btn:active{
  transform:scale(0.88);
  box-shadow:
    inset 0 1rpx 4rpx rgba(0,0,0,0.08),
    0 0 0 rgba(0,0,0,0);
  background:rgba(0,0,0,0.04);
}

/* ═══════════════════════════════════════════
   物理分段控件 · Physical Segment Toggle
   选中项 = 浮在最上层的纸片
   ═══════════════════════════════════════════ */

.segment{
  display:inline-flex;background:var(--dot);border-radius:var(--radius-full);
  padding:3rpx;gap:2rpx;
  box-shadow:inset 0 2rpx 4rpx rgba(0,0,0,0.04);
}
.segment-item{
  padding:14rpx 28rpx;border-radius:var(--radius-full);
  font-size:var(--font-sm);font-weight:500;color:var(--ink-md);
  transition:all var(--dur-fast) var(--ease-stamp);
  position:relative;
}
.segment-item.active{
  background: linear-gradient(180deg,
    rgba(255,255,255,0.5) 0%, var(--cream) 30%,
    var(--cream) 70%, rgba(0,0,0,0.02) 100%
  );
  color:var(--ink);font-weight:700;
  box-shadow:
    0 2rpx 0 rgba(0,0,0,0.04),
    0 3rpx 8rpx rgba(0,0,0,0.06),
    0 1rpx 0 rgba(255,255,255,0.4);
}

/* ═══════════════════════════════════════════
   物理进度条 · Ink-Filling Groove
   轨道 = 纸面凹槽，填充 = 墨水/颜料上升
   ═══════════════════════════════════════════ */

.progress-track{
  width:100%;height:12rpx;
  background:var(--dot);
  border-radius:6rpx;
  overflow:hidden;
  box-shadow:
    inset 0 2rpx 4rpx rgba(0,0,0,0.06),
    0 1rpx 0 rgba(255,255,255,0.5);
}
.progress-fill{
  height:100%;border-radius:6rpx;
  /* 液面高光 — 填充物表面反光 */
  background: linear-gradient(180deg,
    rgba(255,255,255,0.25) 0%, transparent 40%,
    rgba(0,0,0,0.08) 100%
  ), var(--gold);
  box-shadow:inset 0 1rpx 0 rgba(255,255,255,0.2);
  transition:width .5s var(--ease-ink);
}
.progress-fill.amber{background:linear-gradient(180deg,rgba(255,255,255,0.22) 0%,transparent 40%,rgba(0,0,0,0.08) 100%),var(--amber)}
.progress-fill.mint{background:linear-gradient(180deg,rgba(255,255,255,0.22) 0%,transparent 40%,rgba(0,0,0,0.08) 100%),var(--mint)}
.progress-fill.rose{background:linear-gradient(180deg,rgba(255,255,255,0.22) 0%,transparent 40%,rgba(0,0,0,0.08) 100%),var(--rose)}

/* ═══════════════════════════════════════════
   物理复选框 · Stamped Checkbox
   空框 = 纸面凹痕轮廓，选中 = 盖章填入
   ═══════════════════════════════════════════ */

.check-stamp{
  display:inline-flex;align-items:center;justify-content:center;
  width:40rpx;height:40rpx;
  background:var(--paper);
  border:2rpx solid var(--dot);
  border-radius:6rpx;
  box-shadow:
    inset 0 1rpx 3rpx rgba(0,0,0,0.04),
    0 1rpx 0 rgba(255,255,255,0.6);
  font-size:24rpx;color:transparent;
  transition:all var(--dur-fast) var(--ease-stamp);
  flex-shrink:0;
}
.check-stamp.checked{
  background:var(--mint-lt);
  border-color:var(--mint);
  color:var(--mint);
  box-shadow:
    inset 0 1rpx 2rpx rgba(92,154,110,0.1),
    0 0 0 2rpx var(--mint-lt);
  animation:stampDown .35s var(--ease-stamp) both;
}

/* ═══════════════════════════════════════════
   物理切换开关 · Toggle Tab Bar
   标签栏 = 纸面凸起的标签页
   ═══════════════════════════════════════════ */

.tab-bar{
  display:flex;gap:4rpx;
  padding:4rpx;
  background:var(--dot);
  border-radius:var(--radius-sm);
  box-shadow:inset 0 2rpx 4rpx rgba(0,0,0,0.04);
}
.tab-item{
  flex:1;text-align:center;
  padding:14rpx 16rpx;
  font-size:var(--font-sm);font-weight:500;color:var(--ink-md);
  border-radius:10rpx;
  transition:all var(--dur-fast) var(--ease-stamp);
}
.tab-item.active{
  background: linear-gradient(180deg,
    rgba(255,255,255,0.5) 0%, var(--paper) 40%,
    var(--paper) 60%, rgba(0,0,0,0.02) 100%
  );
  color:var(--ink);font-weight:700;
  box-shadow:
    0 2rpx 0 rgba(0,0,0,0.04),
    0 3rpx 6rpx rgba(0,0,0,0.04);
}

/* ═══════════════════════════════════════════
   装饰性分隔线 · Journal Dividers
   ═══════════════════════════════════════════ */

.divider-dot{
  height:1rpx;border:none;
  background:repeating-linear-gradient(
    90deg,var(--dot) 0,var(--dot) 3rpx,transparent 3rpx,transparent 8rpx
  );
  margin:24rpx 0;
}
.divider-stitch{
  height:1rpx;border:none;
  background:repeating-linear-gradient(
    90deg,var(--ink-lt) 0,var(--ink-lt) 6rpx,transparent 6rpx,transparent 12rpx
  );
  margin:20rpx 0;
}

/* 全局暖光斑 — 水彩墨晕，非正圆 */
.bg-spot{position:absolute;pointer-events:none;z-index:0}
.spot-a{width:360rpx;height:340rpx;top:100rpx;right:-120rpx;background:radial-gradient(ellipse 55% 60% at 40% 45%,var(--rose-lt) 0%,transparent 65%),radial-gradient(ellipse 40% 45% at 55% 35%,var(--rose-lt) 0%,transparent 55%)}
.spot-b{width:280rpx;height:260rpx;bottom:240rpx;left:-100rpx;background:radial-gradient(ellipse 50% 55% at 45% 40%,var(--amber-lt) 0%,transparent 65%),radial-gradient(ellipse 38% 42% at 50% 35%,var(--amber-lt) 0%,transparent 55%)}

/* 全局手写体页头 */
.page-header{position:relative;z-index:1;margin-bottom:36rpx;padding-bottom:20rpx;border-bottom:2rpx dashed var(--dot)}
.page-title{display:block;font-family:var(--font-journal);font-size:var(--font-title);color:var(--ink);font-weight:400}
.page-subtitle{display:block;font-size:var(--font-body);color:var(--ink-md);margin-top:8rpx}
.page-icon{font-size:80rpx;display:block;margin-bottom:8rpx}

/* 全局淡入 */
.page-enter{animation:revealUp .5s var(--ease-soft) both}
@keyframes revealUp{from{opacity:0;transform:translateY(18rpx)}to{opacity:1;transform:translateY(0)}}

/* ═══════════════════════════════════════════
   手帳动效关键帧 · Journal Motion System
   ═══════════════════════════════════════════ */

/* 盖章 — 从上方落下 → 压下 → 轻微反弹 */
@keyframes stampDown {
  0%   { transform: translateY(-24rpx) scale(0.6); opacity: 0; }
  35%  { transform: translateY(4rpx) scale(1.05, 0.9); opacity: 1; }
  55%  { transform: translateY(-2rpx) scale(1); }
  70%  { transform: translateY(0); }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

/* 翻页 — 从左向右展开 + 轻微倾斜 → 展平 */
@keyframes pageFlip {
  0%   { transform: skewX(-2deg) scaleX(0.94); opacity: 0;
         box-shadow: 6rpx 0 16rpx rgba(0,0,0,0.08); }
  60%  { transform: skewX(-0.3deg) scaleX(1.01); opacity: 1; }
  100% { transform: skewX(0) scaleX(1); opacity: 1;
         box-shadow: 0 1rpx 0 rgba(0,0,0,0.03); }
}

/* 撕胶带 — 从左端揭起 → 向右展开 → 贴平 */
@keyframes tapeUnroll {
  0%   { transform: translateX(-50%) rotate(-7deg) scaleX(0); opacity: 0;
         transform-origin: left center; }
  50%  { transform: translateX(-50%) rotate(-3deg) scaleX(1.06); opacity: 1; }
  80%  { transform: translateX(-50%) rotate(-2.8deg) scaleX(0.97); }
  100% { transform: translateX(-50%) rotate(-2.4deg) scaleX(1); opacity: 1; }
}

/* 贴纸贴上 — 斜角飞入 → 按压 → 微旋转就位 */
@keyframes stickerPlace {
  0%   { transform: translate(24rpx, -32rpx) rotate(-15deg) scale(0.2); opacity: 0; }
  35%  { transform: translate(2rpx, -6rpx) rotate(3deg) scale(1.12); opacity: 1; }
  60%  { transform: translate(-1rpx, 2rpx) rotate(-0.5deg) scale(0.94); }
  100% { transform: translate(0, 0) rotate(var(--sticker-rot, -0.8deg)) scale(1); opacity: 1; }
}

/* 缎带掉落 — 从上方落下 → 弹跳 → 静止 */
@keyframes ribbonFall {
  0%   { transform: translateY(-60rpx) rotate(-2deg); opacity: 0; }
  40%  { transform: translateY(8rpx) rotate(0.5deg); opacity: 1; }
  65%  { transform: translateY(-6rpx) rotate(-0.3deg); }
  85%  { transform: translateY(2rpx) rotate(0); }
  100% { transform: translateY(0) rotate(0); opacity: 1; }
}

/* 书写揭示 — 宽度从右向左展开（配合 overflow:hidden） */
@keyframes inkReveal {
  0%   { max-width: 0; opacity: 0; }
  30%  { opacity: 0.6; }
  100% { max-width: 600rpx; opacity: 1; }
}

/* 卡片浮入 — 带纸层叠感的入场 */
@keyframes cardFloatIn {
  0%   { transform: translateY(32rpx) rotate(0.5deg); opacity: 0; }
  100% { transform: translateY(0) rotate(0); opacity: 1; }
}

/* 纸页抖动 — 轻触反馈（快速左右微颤） */
@keyframes paperJiggle {
  0%,100% { transform: rotate(0); }
  25%  { transform: rotate(0.3deg); }
  75%  { transform: rotate(-0.3deg); }
}

/* 点阵渐显 — 纸张纹理缓慢浮现 */
@keyframes dotFadeIn {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}

/* 首页交错入场 */
.reveal-1,.reveal-2,.reveal-3,.reveal-4,.reveal-5,.reveal-6 {
  animation: cardFloatIn .5s var(--ease-page) both;
}
.reveal-1 { animation-delay: .05s; }
.reveal-2 { animation-delay: .12s; }
.reveal-3 { animation-delay: .20s; }
.reveal-4 { animation-delay: .28s; }
.reveal-5 { animation-delay: .36s; }
.reveal-6 { animation-delay: .44s; }

/* 时间线条目交错入场 */
.timeline-enter {
  animation: cardFloatIn .45s var(--ease-page) both;
}
.timeline-enter:nth-child(1) { animation-delay: 0s; }
.timeline-enter:nth-child(2) { animation-delay: .06s; }
.timeline-enter:nth-child(3) { animation-delay: .12s; }
.timeline-enter:nth-child(4) { animation-delay: .18s; }
.timeline-enter:nth-child(5) { animation-delay: .24s; }
.timeline-enter:nth-child(6) { animation-delay: .30s; }
.timeline-enter:nth-child(7) { animation-delay: .36s; }
.timeline-enter:nth-child(8) { animation-delay: .42s; }

/* 全局手帳触感：轻触纸页颤动 */
.journal-touch:active {
  animation: paperJiggle .25s var(--ease-stamp) both;
}

/* ═══════════════════════════════════════════
   Motion AI Kit · 增强动效
   ═══════════════════════════════════════════ */

/* 骨架屏闪烁 — 暖光扫过纸面 */
@keyframes shimmer {
  0%   { background-position: -150% 0; }
  100% { background-position: 150% 0; }
}
.skeleton-shimmer {
  background: linear-gradient(
    105deg,
    var(--cream) 0%,
    var(--cream) 35%,
    var(--paper) 48%,
    var(--cream) 52%,
    var(--cream) 100%
  );
  background-size: 300% 100%;
  animation: shimmer 2s var(--ease-soft) infinite;
}

/* 主按钮呼吸 — 阴影脉动暗示"按我" */
@keyframes btnBreathe {
  0%,100% { box-shadow: 0 20rpx 56rpx rgba(224,123,62,0.2), 0 6rpx 12rpx rgba(224,123,62,0.1); }
  50%     { box-shadow: 0 26rpx 68rpx rgba(224,123,62,0.3), 0 8rpx 18rpx rgba(224,123,62,0.15); }
}
.btn-breathe {
  animation: btnBreathe 3s var(--ease-soft) infinite;
}

/* 庆贺彩纸 — 从中心向四周飞散（用CSS变量控制方向） */
@keyframes confettiBurst {
  0%   { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
  100% { transform: translate(var(--cx, 40rpx), var(--cy, -80rpx)) rotate(var(--cr, 180deg)) scale(0); opacity: 0; }
}
.confetti-piece {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  border-radius: 2rpx;
  animation: confettiBurst .8s var(--ease-stamp) both;
  pointer-events: none;
}

/* 贴纸撕开 — 从右下角揭起 */
@keyframes stickerPeel {
  0%   { transform: rotate(0) translate(0,0); opacity: 0.6; }
  25%  { transform: rotate(-18deg) translate(-16rpx, -24rpx); opacity: 1; }
  50%  { transform: rotate(-8deg) translate(-8rpx, -12rpx); opacity: 1; }
  80%  { transform: rotate(2deg) translate(2rpx, 4rpx); }
  100% { transform: rotate(0) translate(0,0); opacity: 1; }
}

/* 纸角折入 — 贺卡翻开效果（用于庆祝弹窗） */
@keyframes cornerFold {
  0%   { transform: scale(0.85) rotate(-3deg); opacity: 0; }
  40%  { transform: scale(1.03) rotate(0.5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

/* 墨水晕开 — 阴影从中心向四周扩散 */
@keyframes inkBleed {
  0%   { box-shadow: 0 0 0 0 var(--amber-lt); }
  100% { box-shadow: 0 0 0 12rpx transparent; }
}

/* ═══════════════════════════════════════════
   Better Icons · 图标系统
   ═══════════════════════════════════════════ */

/* 统一 emoji 尺寸体系 */
.emoji-micro  { font-size: 18rpx; }  /* 微标注 */
.emoji-sm     { font-size: 24rpx; }  /* 小图标（行内） */
.emoji-md     { font-size: 40rpx; }  /* 中图标（按钮/卡片） */
.emoji-lg     { font-size: 56rpx; }  /* 大图标（特征） */
.emoji-xl     { font-size: 80rpx; }  /* 超大（页头） */
.emoji-hero   { font-size: 120rpx; } /* 英雄（庆祝） */

/* CSS 状态指示器 — 替代小emoji的点状状态 */
.status-dot {
  display: inline-block;
  width: 14rpx; height: 14rpx;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-dot.live    { background: var(--mint); box-shadow: 0 0 8rpx var(--mint); }
.status-dot.warn    { background: var(--gold); }
.status-dot.urgent  { background: var(--twin-danger); animation: dotPulse 1.2s ease-in-out infinite; }
.status-dot.idle    { background: var(--ink-lt); }

@keyframes dotPulse {
  0%,100% { opacity: 1; transform: scale(1); }
  50%     { opacity: 0.4; transform: scale(0.65); }
}

/* 纸页标签 — 替代emoji的小书签标记 */
.page-tab {
  display: inline-flex;
  align-items: center;
  gap: 4rpx;
  padding: 4rpx 12rpx;
  background: var(--amber-lt);
  border: 1px solid var(--amber);
  border-radius: 3rpx 10rpx 3rpx 3rpx;
  font-size: 20rpx;
  font-weight: 700;
  color: var(--amber);
  font-family: var(--font-journal);
}

/* 奶奶模式 — 全局大字 */
.font-large {
  --font-caption:28rpx;
  --font-body:36rpx;
  --font-card:40rpx;
  --font-title:52rpx;
  --font-hero:64rpx;
  --font-xs:28rpx;
  --font-sm:32rpx;
  --font-base:36rpx;
  --font-md:44rpx;
  --font-lg:56rpx;
  --touch-min:108rpx;
  --space-md:40rpx;
  --space-lg:60rpx;
}
/* 奶奶模式 — 禁用所有动画与过渡（显式选择器，WXSS 兼容） */
.font-large .bg-spot,
.font-large .page-enter,
.font-large [class*="reveal-"],
.font-large .streak-stamp,
.font-large .sticker-pop-emoji,
.font-large .celebrate-overlay,
.font-large .celebrate-card,
.font-large .cs,
.font-large .avatar-ring.pulsing::before,
.font-large .welcome-card,
.font-large .wave-bar,
.font-large .orbit-ring,
.font-large .main-btn,
.font-large .q-chip,
.font-large .btn-stage,
.font-large .pulse-dot,
.font-large .stamp-btn,
.font-large .hero-face,
.font-large .clock-sep,
.font-large .spot-a,
.font-large .spot-b,
.font-large .confetti-piece,
.font-large .shine,
.font-large .float-up,
.font-large .journal-tape,
.font-large .journal-ribbon,
.font-large .journal-stamp,
.font-large .journal-card,
.font-large .sticker-item.new,
.font-large .sticker-pop-emoji,
.font-large .btn-breathe,
.font-large .skeleton-shimmer,
.font-large .confetti-piece,
.font-large .celebrate-card { animation: none !important; }

.font-large view,
.font-large text,
.font-large button,
.font-large image,
.font-large scroll-view,
.font-large input,
.font-large textarea,
.font-large label,
.font-large picker,
.font-large slider,
.font-large switch,
.font-large navigator,
.font-large video,
.font-large canvas,
.font-large map,
.font-large progress,
.font-large rich-text,
.font-large icon { animation-duration: 0s !important; transition-duration: 0s !important; }

/* 奶奶模式高对比度 */
.role-granny {
  --amber: #C06A2E;
  --rose: #B04A3A;
  --amber-md: rgba(192,106,46,0.25);
  --rose-md: rgba(176,74,58,0.25);
}

/* 暗色模式 */
.theme-dark{
  --paper:#1E1C18;--cream:#282520;--ink:#EBE5D8;--ink-md:#9C9488;--ink-lt:#6B6558;--dot:#3D3830;
  --amber:#E8915A;--rose:#E09A80;--mint:#6DAE7C;--gold:#D4A84E;
  --amber-lt:rgba(232,145,90,0.12);--amber-md:rgba(232,145,90,0.22);
  --rose-lt:rgba(224,154,128,0.12);--rose-md:rgba(224,154,128,0.22);
  --mint-lt:rgba(109,174,124,0.1);--gold-lt:rgba(212,168,78,0.12);
  --twin-shadow-sm:0 2rpx 8rpx rgba(0,0,0,0.2);--twin-shadow-md:0 4rpx 16rpx rgba(0,0,0,0.3);
  --twin-hover:rgba(235,229,216,0.1);
  --surface-card:var(--cream);--border-void:var(--dot);
  --twin-a-glow:rgba(232,145,90,0.2);--twin-b-glow:rgba(224,154,128,0.2);
  --twin-text-tertiary:var(--ink-lt);
}

/* 暗色模式 — 手帳元素微调 */
.theme-dark .journal-paper {
  background-image:
    radial-gradient(circle, var(--ink-lt) 0.8rpx, transparent 0.8rpx);
  background-size: 44rpx 44rpx;
  background-position: 6rpx 6rpx;
}
.theme-dark .journal-card {
  box-shadow:
    0 1rpx 0 rgba(255,255,255,0.02),
    0 4rpx 12rpx rgba(0,0,0,0.15),
    0 8rpx 24rpx rgba(0,0,0,0.1);
}
.theme-dark .journal-card::before {
  opacity: 0.4;
  border-color: var(--dot);
}
.theme-dark .journal-tape {
  box-shadow: 0 1rpx 3rpx rgba(0,0,0,0.2);
}
.theme-dark .journal-stamp {
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.25);
}
.theme-dark .journal-sticky {
  box-shadow: 0 3rpx 10rpx rgba(0,0,0,0.15);
}
.theme-dark .journal-ribbon {
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
}
.theme-dark .journal-clip {
  opacity: 0.35;
  border-color: var(--ink-md);
}
.theme-dark .journal-clip::after {
  border-color: var(--ink-md);
}
.theme-dark .journal-curl::after {
  box-shadow: -2rpx 2rpx 4rpx rgba(0,0,0,0.2);
}

/* 暗色模式 — 物理按钮系统 */
.theme-dark .btn-primary{
  box-shadow:
    inset 0 1rpx 0 rgba(255,255,255,0.12),
    0 3rpx 0 rgba(160,85,42,0.5),
    0 4rpx 8rpx rgba(0,0,0,0.15),
    0 8rpx 24rpx rgba(0,0,0,0.2);
}
.theme-dark .btn-primary:active{
  box-shadow:
    inset 0 2rpx 6rpx rgba(0,0,0,0.2),
    0 1rpx 0 rgba(160,85,42,0.3),
    0 2rpx 4rpx rgba(0,0,0,0.08);
}
.theme-dark .btn-primary::after{opacity:0.5}
.theme-dark .btn-outline{
  background:linear-gradient(180deg,rgba(255,255,255,0.08) 0%,transparent 40%,rgba(0,0,0,0.06) 100%),var(--paper);
}
.theme-dark .btn-outline:active{background:rgba(232,145,90,0.1)}
.theme-dark .btn-sm{background:linear-gradient(180deg,rgba(255,255,255,0.06) 0%,transparent 40%,rgba(0,0,0,0.06) 100%),var(--cream)}
.theme-dark .btn-sm:active{background:rgba(232,145,90,0.1)}
.theme-dark .close-btn{background:linear-gradient(180deg,rgba(255,255,255,0.08) 0%,transparent 50%,rgba(0,0,0,0.06) 100%),var(--cream)}
.theme-dark .close-btn::after{opacity:0.4}

/* 暗色模式 — 物理输入框 */
.theme-dark .input-field{
  background:linear-gradient(180deg,rgba(0,0,0,0.04) 0%,transparent 8%),var(--paper);
  box-shadow:inset 0 2rpx 6rpx rgba(0,0,0,0.2),inset 0 0 0 1rpx rgba(0,0,0,0.08),0 1rpx 0 rgba(255,255,255,0.06);
}
.theme-dark .input-field:focus{
  box-shadow:inset 0 3rpx 8rpx rgba(0,0,0,0.25),0 0 0 3rpx rgba(232,145,90,0.15);
}
.theme-dark .input-lined{box-shadow:inset 0 2rpx 6rpx rgba(0,0,0,0.2),0 1rpx 0 rgba(255,255,255,0.04)}

/* 暗色模式 — 物理卡片/芯片/控件 */
.theme-dark .card-paper{
  box-shadow:0 1rpx 0 rgba(255,255,255,0.02),0 2rpx 8rpx rgba(0,0,0,0.15),0 4rpx 16rpx rgba(0,0,0,0.1);
}
.theme-dark .card-paper::before{opacity:0.4}
.theme-dark .card-accent{box-shadow:0 1rpx 0 rgba(255,255,255,0.02),0 3rpx 10rpx rgba(0,0,0,0.12)}
.theme-dark .card-entry{box-shadow:0 1rpx 0 rgba(255,255,255,0.02),0 2rpx 4rpx rgba(0,0,0,0.1)}
.theme-dark .card-entry:active{box-shadow:inset 0 1rpx 3rpx rgba(0,0,0,0.15)}
.theme-dark .chip{box-shadow:0 1rpx 0 rgba(255,255,255,0.03),0 1.5rpx 3rpx rgba(0,0,0,0.08)}
.theme-dark .chip:active{box-shadow:inset 0 1rpx 3rpx rgba(0,0,0,0.12)}
.theme-dark .chip.on{box-shadow:inset 0 1rpx 2rpx rgba(232,145,90,0.15),0 0 0 1rpx rgba(232,145,90,0.12)}
.theme-dark .chip-tag{box-shadow:0 1rpx 0 rgba(255,255,255,0.03),0 2rpx 4rpx rgba(0,0,0,0.08)}
.theme-dark .segment{box-shadow:inset 0 2rpx 4rpx rgba(0,0,0,0.12)}
.theme-dark .segment-item.active{box-shadow:0 2rpx 0 rgba(0,0,0,0.08),0 3rpx 8rpx rgba(0,0,0,0.15),0 1rpx 0 rgba(255,255,255,0.06)}
.theme-dark .tab-bar{box-shadow:inset 0 2rpx 4rpx rgba(0,0,0,0.12)}
.theme-dark .tab-item.active{box-shadow:0 2rpx 0 rgba(0,0,0,0.08),0 3rpx 6rpx rgba(0,0,0,0.1)}
.theme-dark .progress-track{box-shadow:inset 0 2rpx 4rpx rgba(0,0,0,0.15),0 1rpx 0 rgba(255,255,255,0.04)}
.theme-dark .progress-fill{box-shadow:inset 0 1rpx 0 rgba(255,255,255,0.12)}
.theme-dark .check-stamp{box-shadow:inset 0 1rpx 3rpx rgba(0,0,0,0.12),0 1rpx 0 rgba(255,255,255,0.04)}
.theme-dark .check-stamp.checked{box-shadow:inset 0 1rpx 2rpx rgba(109,174,124,0.15),0 0 0 2rpx rgba(109,174,124,0.1)}
</style>
