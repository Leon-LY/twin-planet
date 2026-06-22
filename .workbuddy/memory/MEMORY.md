# 双宝记项目长期记忆

## 品牌（2026-06-18 统一）
- **品牌名**：双宝记 (Twin Journal)。曾用名：并蒂星球→双宝记录→双宝星球→双宝记（改名原因：四角色论证确认"双宝记"口语传播/微信搜索最优）
- **Slogan**：并蒂而生，同步成长
- **唯一 IP**：双狐（Amber 狐=大宝守护 + Terracotta 狐=小宝守护 + Gold 狐=成就使者）。废弃：星球/莲花/几何-only Logo
- **GitHub 仓库**：仍为 twin-planet（与品牌名不一致，待重命名）

## 色彩铁律
- 大宝 = amber #E07B3E（暖阳），小宝 = terracotta #C08552（暖土/陶土色）
- **按出生顺序，不按性别**。两色皆为大地色系，绝对性别中性
- 2026-06-18 小宝色迁移：rose#D48068（粉，女性化）→ sage#6B8E5A（绿，过冷）→ terracotta#C08552（陶土，暖土沉静）
- success = spring #4FAE6E（调亮以与 terracotta 区分）
- 颜色权威源：constants/design.ts (TS) + App.vue (CSS) + uni.scss (SCSS)
- --sage/--rose 别名保留映射到 --terracotta（向后兼容）

## 技术栈
- 前端：uni-app 3.0.0-alpha + Vue3 Composition API + TypeScript + Pinia
- 后端：Node.js + Express + TypeScript + PostgreSQL + Redis
- 部署：Docker Compose

## 关键约束
- 微信 WXSS：禁 conic-gradient/clip-path/filter/mask/backdrop-filter；允许 radial-gradient/box-shadow/transform
- 单位 rpx（750 基准）
- 奶奶模式：font-large 类，大字+大触摸+高对比+零动画

## 开发者
- Leon，全栈独立开发者，龙凤胎爸爸
