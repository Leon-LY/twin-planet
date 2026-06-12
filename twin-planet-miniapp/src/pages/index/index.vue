<template>
  <view class="home-page">
    <!-- 品牌区 -->
    <view class="brand-section">
      <view class="brand-icon">🌺🌺</view>
      <text class="brand-name">并蒂星球</text>
      <text class="brand-slogan">并蒂而生，同步成长</text>
    </view>

    <!-- 双宝卡片 -->
    <view class="twins-cards">
      <view class="baby-card card-aning">
        <view class="card-accent" />
        <view class="card-avatar">👦</view>
        <text class="card-name">安宁</text>
        <text class="card-fullname">李牧川</text>
        <view class="card-stats">
          <text class="card-stat">最近体重 16.8kg</text>
          <text class="card-stat">最近身高 102.3cm</text>
        </view>
      </view>

      <view class="card-divider" />

      <view class="baby-card card-anran">
        <view class="card-accent pink" />
        <view class="card-avatar">👧</view>
        <text class="card-name">安然</text>
        <text class="card-fullname">李牧岑</text>
        <view class="card-stats">
          <text class="card-stat">最近体重 15.2kg</text>
          <text class="card-stat">最近身高 99.8cm</text>
        </view>
      </view>
    </view>

    <!-- 核心功能入口 -->
    <view class="feature-section">
      <text class="section-title">核心功能</text>

      <!-- 生长曲线 — 已实现 -->
      <view class="feature-card feature-ready" @click="goGrowth">
        <view class="feature-icon">📈</view>
        <view class="feature-body">
          <text class="feature-name">对比生长曲线</text>
          <text class="feature-desc">WHO 标准 + 双宝实测对比 · 一个页面看两个娃</text>
        </view>
        <text class="feature-arrow">›</text>
      </view>

      <!-- 双轨记录 — 刚实现 -->
      <view class="feature-card feature-ready" @click="goRecord">
        <view class="feature-icon">🍼</view>
        <view class="feature-body">
          <text class="feature-name">极简双轨记录</text>
          <text class="feature-desc">1 点开始 · 2 点结束 · 两个宝宝一起记</text>
        </view>
        <text class="feature-arrow">›</text>
      </view>

      <!-- 萌芽日记 — 刚实现 -->
      <view class="feature-card feature-ready" @click="goSprout">
        <view class="feature-icon">🌱</view>
        <view class="feature-body">
          <text class="feature-name">萌芽日记</text>
          <text class="feature-desc">记录双胞胎之间的互动瞬间 · 第一次分享/第一次打架</text>
        </view>
        <text class="feature-arrow">›</text>
      </view>

      <!-- 今天我做了什么 — 刚实现 -->
      <view class="feature-card feature-ready" @click="goContribution">
        <view class="feature-icon">💪</view>
        <view class="feature-body">
          <text class="feature-name">今天我做了什么</text>
          <text class="feature-desc">看见每一位家人的付出 · 每件小事都值得被记录</text>
        </view>
        <text class="feature-arrow">›</text>
      </view>

      <!-- 爸爸值班模式 — 刚实现 -->
      <view class="feature-card feature-ready" @click="goDuty">
        <view class="feature-icon">🦸</view>
        <view class="feature-body">
          <text class="feature-name">爸爸值班模式</text>
          <text class="feature-desc">SOP 清单引擎 · 照着做，一个人也能搞定两个</text>
        </view>
        <text class="feature-arrow">›</text>
      </view>

      <!-- 交接班语音 — 刚实现 -->
      <view class="feature-card feature-ready" @click="goHandover">
        <view class="feature-icon">🎙️</view>
        <view class="feature-body">
          <text class="feature-name">交接班语音便签</text>
          <text class="feature-desc">录一段话，换班的家人打开就能听</text>
        </view>
        <text class="feature-arrow">›</text>
      </view>
    </view>

    <!-- 底部信息 -->
    <view class="footer-info">
      <text class="footer-text">并蒂星球 · 中国首款双胞胎育儿伴侣</text>
      <text class="footer-version">v0.1.0 · Phase 0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
const goGrowth = () => { uni.navigateTo({ url: '/pages/growth/index' }) }
const goRecord = () => { uni.navigateTo({ url: '/pages/record/index' }) }
const goSprout = () => { uni.navigateTo({ url: '/pages/sprout/index' }) }
const goContribution = () => { uni.navigateTo({ url: '/pages/contribution/index' }) }
const goDuty = () => { uni.navigateTo({ url: '/pages/duty/index' }) }
const goHandover = () => { uni.navigateTo({ url: '/pages/handover/index' }) }
const goSnapshot = () => { uni.navigateTo({ url: '/pages/snapshot/index' }) }
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #FFFBF5;
  padding: 24px 15px 40px;
}

/* 品牌区 */
.brand-section {
  text-align: center;
  padding: 20px 0 12px;
}
.brand-icon {
  font-size: 36px;
  margin-bottom: 8px;
}
.brand-name {
  display: block;
  font-size: 26px;
  font-weight: 700;
  color: #2D3748;
  letter-spacing: 2px;
}
.brand-slogan {
  display: block;
  font-size: 13px;
  color: #A0AEC0;
  margin-top: 6px;
  letter-spacing: 4px;
}

/* 双宝卡片 */
.twins-cards {
  display: flex;
  margin-top: 20px;
  background: #FFFFFF;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.baby-card {
  flex: 1;
  position: relative;
  padding-left: 12px;
}
.card-accent {
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 4px;
  border-radius: 2px;
  background: #4299E1;
}
.card-accent.pink {
  background: #F56565;
}
.card-divider {
  width: 1px;
  background: #EDF2F7;
  margin: 0 6px;
}
.card-avatar {
  font-size: 28px;
}
.card-name {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #2D3748;
  margin-top: 4px;
}
.card-fullname {
  display: block;
  font-size: 11px;
  color: #A0AEC0;
}
.card-stats {
  margin-top: 10px;
}
.card-stat {
  display: block;
  font-size: 11px;
  color: #718096;
  line-height: 1.8;
}

/* 功能入口 */
.feature-section {
  margin-top: 24px;
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #2D3748;
  margin-bottom: 10px;
}
.feature-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  margin-bottom: 8px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}
.feature-ready:active {
  background: #F7FAFC;
}
.feature-pending {
  opacity: 0.7;
}
.feature-icon {
  font-size: 28px;
  flex-shrink: 0;
}
.feature-body {
  flex: 1;
}
.feature-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2D3748;
}
.feature-desc {
  display: block;
  font-size: 11px;
  color: #A0AEC0;
  margin-top: 3px;
}
.feature-arrow {
  font-size: 22px;
  color: #CBD5E0;
}
.feature-badge {
  font-size: 10px;
  color: #A0AEC0;
  background: #F7FAFC;
  padding: 3px 8px;
  border-radius: 10px;
  flex-shrink: 0;
}

/* 底部 */
.footer-info {
  margin-top: 32px;
  text-align: center;
}
.footer-text {
  display: block;
  font-size: 11px;
  color: #CBD5E0;
}
.footer-version {
  display: block;
  font-size: 10px;
  color: #E2E8F0;
  margin-top: 4px;
}
</style>
