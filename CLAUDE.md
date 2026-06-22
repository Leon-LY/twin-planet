# 双宝记 · Twin Journal

> 两只并蒂而生的小狐狸，同步成长的手帐 🦊🦊 —— 微信小程序 + Express 后端
> 文档最后更新：2026-06-22（TabBar 原生自定义 + 角色切换完善 + 导航修复）

---

## 一、项目概况

| 项目 | 详情 |
|------|------|
| **名称** | 双宝记 (Twin Journal) |
| **Slogan** | 并蒂而生，同步成长 |
| **产品哲学** | 看见每一个人 (See Every Person) |
| **形态** | 微信小程序 (uni-app Vue3) + Express API 后端 |
| **AppID** | `wxee2ef767a77058db` |
| **GitHub** | https://github.com/Leon-LY/twin-planet |
| **开发者** | Leon（全栈独立，龙凤胎爸爸） |
| **目标用户** | 0-6 岁双胞胎家庭（妈妈/爸爸/奶奶/育儿嫂） |
| **当前进度** | Sprint 1-4 完成 · 贴纸 v2.0 完成 · 亲子任务 完成 · 双宝广场 v2 完成 · TabBar 底部导航 完成 · Sprint 4.5 待启动 |

---

## 二、仓库结构

```
E:/ly/project/twin-planet/
├── twin-planet-miniapp/        # 前端：微信小程序 (uni-app Vue3)
│   ├── native/                 # 原生 WeChat 组件（uni-app 不编译，构建时复制）
│   │   └── custom-tab-bar/     # 自定义底部 TabBar（.wxml/.js/.wxss/.json）
│   └── copy-tabbar.js          # 构建脚本：复制 native/custom-tab-bar → dist
├── twin-planet-server/         # 后端：Express API (Node.js + PostgreSQL + Redis)
├── docs/                       # 论证报告 + 设计文档
│   └── 论证/                   # 多角色论证报告存档
├── design-philosophy.md        # 设计哲学（暖手帐双狐主义）
└── CLAUDE.md                   # 本文件
```

---

## 三、技术栈

### 前端 (`twin-planet-miniapp/`)

```
框架：uni-app 3.0.0-alpha (Vue3 Composition API + <script setup> + TypeScript)
状态：Pinia (13 个 Store)
图表：ECharts（懒加载，growth 子包）
构建：Vite → npx uni build -p mp-weixin
```

### 后端 (`twin-planet-server/`)

```
运行时：Node.js + Express
语言：TypeScript
数据库：PostgreSQL (端口 5432)
缓存：Redis (端口 6379)
ORM：无（直接用 pg Pool + 参数化查询）
认证：JWT (jsonwebtoken)
部署：Docker Compose (Nginx + Node + PostgreSQL + Redis)
```

---

## 四、前端目录结构

```
twin-planet-miniapp/
├── native/                       # 原生 WeChat 组件（构建时复制到 dist）
│   └── custom-tab-bar/           # 自定义底部导航（.wxml/.js/.wxss/.json）
├── copy-tabbar.js                # 构建脚本：复制 native/custom-tab-bar → dist
└── src/
    ├── App.vue                    # 根组件（Options API）— CSS 变量 v6 + 暗色模式 + 奶奶模式
    ├── main.js                    # createSSRApp + Pinia（⚠️ 必须用 createSSRApp）
    ├── manifest.json              # AppID + 微信设置 + 隐私合规
    ├── pages.json                 # 路由表（17 pages + 3 subPackages + tabBar）
    ├── uni.scss                   # 全局 SCSS 变量（v6 暖纸色系）
│
├── components/                # 7 个组件
│   ├── common/BrandLoading.vue      # 品牌加载动画（双狐 CSS 绘制）
│   ├── common/EmptyState.vue        # 空状态（双狐剪影 + 提示）
│   ├── common/Skeleton.vue          # 手帐纸骨架屏
│   ├── cosmic/LightBridge.vue       # 双胞胎连接桥（5 态）
│   ├── journal/StickerStrip.vue     # 贴纸条（横向滑动）
│   ├── twin-skeleton/twin-skeleton.vue  # 骨架屏（旧版，逐步替换）
│   └── ec-canvas/ec-canvas.vue      # ECharts 包装
│
├── stores/                    # 13 个 Pinia Store
│   ├── user.ts                # 登录/角色/奶奶模式/大字模式
│   ├── family.ts              # 家庭（双胞胎组）
│   ├── babies.ts              # 宝宝 CRUD + 大宝/小宝 + 早产儿胎龄
│   ├── records.ts             # 双轨计时器 + 日志 + recordedBy + 贴纸自动同步
│   ├── stickers.ts            # 贴纸收集系统 v2.0（74 条规则 · 8 册 · 4 稀有度）
│   ├── growth.ts              # 生长测量数据
│   ├── sprout.ts              # 萌芽日记（7 种互动类型）
│   ├── contribution.ts        # 今天我做了什么（8 种贡献类别）
│   ├── interactions.ts        # 向后兼容层（委托 sprout + contribution）
│   ├── energy.ts              # 电量表（妈妈/爸爸精力管理）
│   ├── oneOnOne.ts            # 一人时光（一对一陪伴记录）
│   ├── guardian.ts            # 向后兼容层（委托 energy + oneOnOne）
│   ├── duty.ts                # 爸爸值班 SOP 清单
│   └── alerts.ts              # 照顾者中断通知（纯统计规则）
│
├── composables/               # 4 个 Composable
│   ├── useHaptic.ts           # 触觉反馈
│   ├── usePoeticTime.ts       # 诗意计时标签
│   ├── useQuickRef.ts         # 快速参考（按宝宝区分）
│   └── useStickerSync.ts      # 统一贴纸同步逻辑（v2 含满月/里程碑/测量检测）
│
├── utils/
│   ├── format.ts              # 时间格式化
│   ├── persist.ts             # 本地持久化封装（15 个 key）
│   ├── whoGrowth.ts           # WHO LMS 参数 + Z 值/百分位 + 差异率
│   ├── clinicCard.ts          # 就诊速查卡 Canvas 生成
│   ├── shareCard.ts           # 分享卡片 Canvas 生成
│   └── syncService.ts         # 数据同步服务（含重试队列）
│
├── api/
│   ├── client.ts              # HTTP 客户端（JWT + 错误处理）
│   └── types.ts               # API 类型定义
│
├── config/
│   ├── roles.ts               # 角色自适应配置（5 角色 · 含 tasks 功能）
│   ├── festivals.ts           # 节日配置（15 节日 · 公历/农历/国际）
│   ├── tasks.ts               # 亲子任务配置（6 日常 + 5 每周 + 4 成就）
│   └── seasonal.ts            # 节气配置（24 节气）
│
├── constants/
│   └── design.ts              # TS 颜色常量（唯一权威源 · v6 terracotta）
│
├── static/
│   ├── mascot-*-fox-nobg-*.png  # 狐狸吉祥物 PNG（64/128/256px）
│   └── stickers/                # 贴纸插画资产（75 张 PNG · 9 个子目录）
│       ├── birthday/  daynight/  festival/  growth/
│       ├── hidden/    honor/     milestone/ solar/    twin/
│
└── pages/
    ├── index/index.vue              # 品牌首页（薄外壳）
    │   └── components/              # 三角色子组件
    │       ├── IndexMom.vue         # 妈妈模式：完整手帳 + 双宝对比微卡片
    │       ├── IndexDad.vue         # 爸爸模式：战术面板
    │       └── IndexGranny.vue      # 奶奶模式：3 大按钮
    ├── login/index.vue              # 微信一键登录
    ├── onboarding/                  # 家庭创建 + 双胞胎注册
    ├── record/index.vue             # 双轨记录（盖章机）
    │   └── granny.vue               # 奶奶版记录
    ├── sprout/index.vue             # 萌芽日记
    ├── contribution/index.vue       # 今天我做了什么
    ├── snapshot/index.vue           # 爸爸的快照
    ├── handover/index.vue           # 交接班语音便签
    ├── duty/index.vue               # 爸爸值班清单
    ├── guardian/index.vue           # 守护中心
    ├── stickers/index.vue           # 贴纸收集册 v2.0（8 册分组 + 稀有度）
    ├── tasks/index.vue              # 亲子任务（日常+每周+成就）
    ├── discover/index.vue           # 双宝广场 v2（周报+功能入口+成就动态）
    ├── privacy/index.vue            # 隐私政策
    ├── growth/index.vue             # 生长曲线（WHO + ECharts，子包）
    ├── school/index.vue             # 入园助手（子包）
    └── milestones/index.vue         # 能力观察（子包）
```

---

## 五、后端目录结构

```
twin-planet-server/
├── .env                          # 环境变量（不提交 git）
├── .env.example                  # 环境变量模板
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml            # Nginx + Node + PostgreSQL + Redis
├── nginx.conf                    # 反向代理配置
├── deploy.sh                     # 部署脚本
├── drizzle.config.ts
│
└── src/
    ├── index.ts                  # Express 入口（CORS + Helmet + Rate Limit）
    ├── config.ts                 # 环境变量加载
    ├── config/
    │   ├── database.ts           # PostgreSQL Pool + query 封装
    │   └── migrate.ts            # 数据库建表迁移（10 张表）
    ├── middleware/
    │   ├── auth.ts               # JWT 认证中间件
    │   └── errorHandler.ts       # 全局错误处理
    ├── routes/
    │   ├── auth.ts               # 微信登录 + 个人资料更新
    │   ├── babies.ts             # 宝宝 CRUD
    │   ├── family.ts             # 家庭管理 + 邀请
    │   ├── records.ts            # 记录 CRUD + 批量同步
    │   ├── growth.ts             # 生长测量 CRUD
    │   ├── handover.ts           # 交接班语音/文字便签
    │   └── user.ts               # 用户设置
    ├── utils/
    │   ├── jwt.ts                # JWT 签发/验证
    │   ├── response.ts           # 统一 API 响应格式
    │   └── wechat.ts             # 微信 code2Session
    ├── models/                   # 数据模型（待实现）
    ├── repositories/             # 数据访问层（待实现）
    └── services/                 # 业务逻辑层（待实现）
```

### 后端 API 一览

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|:--:|
| GET | `/api/health` | 健康检查 | ❌ |
| POST | `/api/auth/wechat-login` | 微信登录 | ❌ |
| PUT | `/api/auth/profile` | 更新用户资料 | ✅ |
| GET | `/api/babies` | 获取宝宝列表 | ✅ |
| POST | `/api/babies` | 添加宝宝 | ✅ |
| PUT | `/api/babies/:id` | 更新宝宝 | ✅ |
| GET | `/api/records?babyId=&limit=&offset=` | 获取记录 | ✅ |
| POST | `/api/records` | 创建单条记录 | ✅ |
| GET | `/api/records/since?timestamp=` | 增量拉取 | ✅ |
| POST | `/api/records/batch` | 批量同步（≤200条） | ✅ |
| GET | `/api/growth?babyId=` | 获取生长数据 | ✅ |
| POST | `/api/growth` | 添加测量 | ✅ |
| GET | `/api/handover` | 获取交接消息（家庭范围） | ✅ |
| POST | `/api/handover` | 上传语音/文字便签 | ✅ |
| GET | `/api/handover/since?timestamp=` | 增量拉取（跨设备） | ✅ |
| DELETE | `/api/handover/:id` | 删除消息 | ✅ |
| POST | `/api/family` | 创建家庭 | ✅ |
| POST | `/api/family/join` | 加入家庭（邀请令牌） | ✅ |
| GET | `/api/user/profile` | 获取个人资料 | ✅ |

### 数据库表（10 张）

`families` · `family_invites` · `users` · `twin_groups` · `babies` · `records` · `growth_measurements` · `sprout_entries` · `contribution_entries` · `duty_tasks` · `school_decisions` · `handover_messages`

---

## 六、设计系统：双宝手帐 v6（暖手帐双狐主义）

### 核心理念

> 两只并蒂而生的小狐狸，在一本温暖的手帐本里同步成长。有贴纸、盖章、手绘水彩的触感。
> **品牌 IP：双狐为唯一主角**（Amber 狐 + Sage 狐 + Gold 狐）。废弃星球/莲花/几何-only Logo。

### 颜色（暖阳+冷土双生体系 · 去性别化）

| 用途 | Hex | CSS 变量 |
|------|------|------|
| 页面背景 | `#FEF9F0` | `--paper` |
| 卡片背景 | `#FFF5E8` | `--cream` |
| 大宝（暖阳） | `#E07B3E` | `--amber` |
| 小宝（暖土） | `#C08552` | `--terracotta`（`--sage`/`--rose` 别名兼容） |
| 主文字 | `#2D2318` | `--ink` |
| 次文字 | `#9C8E7C` | `--ink-md` |
| 强调/完成（春绿） | `#4FAE6E` | `--mint`（调亮以与 terracotta 区分） |
| 成就 | `#C8993E` | `--gold` |
| 边框/虚线 | `#E8DCC8` | `--dot` |
| 危险 | `#D4706B` | `--twin-danger` |

**铁律**：大宝=amber 暖阳，小宝=terracotta 陶土色。**按出生顺序，不按性别**。两色皆为大地色系，绝对性别中性。2026-06-18 小宝色从 rose#D48068（豆沙粉，有女性化倾向）→ sage#6B8E5A（鼠尾草绿，过冷）→ terracotta#C08552（陶土色，暖土沉静）。
**唯一颜色权威源**：`src/constants/design.ts` (TS) + `src/App.vue` (CSS 变量) + `src/uni.scss` (SCSS)。

### 动效规范

| 类别 | 时长 | 适用场景 |
|------|:--:|------|
| 呼吸系 | 3s | 背景光斑、头像环脉冲、LightBridge、BrandLoading 尾巴摆动 |
| 反馈系 | 0.5-1s | 贴纸弹出、按钮按压（stampDown）、盖章 |
| 入场系 | 0.5s + stagger 0.06s | 页面 .reveal-1 ~ .reveal-6（手帐翻页感 pageRevealIn + 卡片交错浮入 cardFloatIn） |

### 微信 WXSS 约束

- ❌ `conic-gradient`, `clip-path`, `filter`, `mask`, `backdrop-filter`, `*` 通用选择器
- ✅ `radial-gradient` 多层, `box-shadow` 多层, `transform`/`opacity` 动效, `::before`/`::after`

---

## 七、角色自适应系统

| 角色 | 首页布局 | 功能列表 |
|------|:--:|------|
| 妈妈 | full — 完整手帳 | record/growth/sprout/contribution/handover/guardian/snapshot/stickers/tasks |
| 爸爸 | compact — 战术面板 | record/growth/duty/handover/snapshot/stickers/contribution/tasks |
| 奶奶 | granny — 3 大按钮 | record/growth |
| 爷爷 | granny — 同奶奶 | record/growth |
| 育儿嫂 | compact — 同爸爸 | record/growth/handover/snapshot |

**配置源**：`src/config/roles.ts`
**角色切换**：妈妈模式点头像旁角色标签弹出抽屉；爸爸模式点右上角圆形按钮弹出 ActionSheet；所有模式均可切换

---

## 八、6 条安全红线

| # | 红线 | 状态 |
|:--:|------|:--:|
| 1 | 不做医疗判断 | ✅ percentileHint 已修复为纯 WHO 描述 |
| 2 | 不做疫苗决策 | ✅ |
| 3 | 不做症状分析 | ✅ |
| 4 | 颜色 ≠ 诊断 | ⚠️ 差异率标签仍需去焦虑化 |
| 5 | AI 内容免责 | ✅ 生长曲线页已标注 |
| 6 | 照片加密 | 🟡 照片功能未上线 |

---

## 九、⚠️ 已知缺陷

### 历史缺陷（全部已修复或论证豁免）

| 级别 | 状态 |
|:--:|------|
| CRITICAL (C1-C12) | ✅ 全部修复（C3 运行时喂养 UI 已添加） |
| HIGH (H1-H18) | ✅ 全部修复或论证豁免（H16 事件总线为架构遗留） |

### 2026-06-18 审计新增

| # | 级别 | 缺陷 | 状态 |
|:--:|:--:|------|:--:|
| N1 | HIGH | 贴纸上下文字段缺失：`useStickerSync`/`records.ts` 未填充 `bothSproutToday`/`bothMilestoneToday`/`bothMeasureToday`/`isFullMoonNight`，导致 5 张贴纸无法触发 | ✅ 已修复（惰性加载子包 store + 农历十五速查表） |
| N2 | HIGH | `uni.scss` `$uni-color-success` 仍为旧色 `#5C9A6E`，与设计系统 v6 的 `#4FAE6E` 不一致 | ✅ 已修复 |
| N3 | MEDIUM | 贴纸双重同步：`records.ts:_syncStickersAuto()` 与页面 `syncStickers()` 各调一次，虽不重复解锁但有计算浪费 | 🔵 保留（首页快捷记录依赖此路径，去重逻辑安全） |
| N4 | MEDIUM | 贴纸页重引入 `<image>` 标签：commit `648e2a7` 曾因 uni-app 编译错误回退 `<image>`，需在微信开发者工具验证是否重现 | 🟡 待验证 |
| N5 | LOW | `dutyDoneTotalCount` 缺少持久化计数器：`solo_guard`(独当一面) 依赖累计值班次数，当前仅在 duty 页调用时通过 override 传入最近一次计数 | 🟡 待完善（加持久化计数器） |
| N6 | LOW | 满月检测用公历近似农历十五速查表（2025-2026），每年需更新 | 🟡 长期方案：接入农历库 |
| N7 | NOTE | TabBar 为原生自定义组件（`native/custom-tab-bar/`），uni-app 无法编译此目录，通过 `copy-tabbar.js` 构建时复制到 dist | ✅ 已解决 |
| N8 | NOTE | 自定义 TabBar 选中态同步：`switchTab` 时组件重新 attach 自动同步；页面内 `onShow` 暂不主动更新 tabBar（规避 `getCurrentInstance` 兼容问题） | 🔵 可接受 |

> 历史修复记录见 git log（共 24 次推送）

---

## 十、开发规范

### 不可变性（CRITICAL）

```typescript
// ❌ 错误 — 直接修改 state
profile.value.role = role
babies.value.push(baby)

// ✅ 正确 — 不可变更新
profile.value = { ...profile.value, role }
babies.value = [...babies.value, baby]
```

### uni-app 特殊规则

- **App.vue**：必须用 Options API (`export default { onLaunch() {} }`)，**不能用 `<script setup>`**
- **生命周期**：Vue 生命周期（onMounted/onUnmounted）从 `vue` 导入；页面生命周期（onShow/onLoad/onHide）从 `@dcloudio/uni-app` 导入
- ⚠️ `onShow`/`onHide`/`getCurrentInstance` **不能**从 `vue` 导入（uni-app WeChat 运行时不导出）
- **App.vue 生命周期**：Vue 3 中 `beforeDestroy` → `beforeUnmount`
- **入口**：`main.js` 必须用 `createSSRApp`，不能用 `createApp`（否则 `$vm` 错误）
- **单位**：`rpx`（750rpx 基准），勿用 `px`
- **底部安全区**：`padding-bottom: calc(XXrpx + env(safe-area-inset-bottom))`
- **自定义 TabBar**：uni-app 不编译 `custom-tab-bar/` 目录，原生组件放在 `native/custom-tab-bar/`，构建时由 `copy-tabbar.js` 复制到 dist

### 文件规模红线

- 单文件 ≤800 行（当前首页 886 行超标）
- 函数 ≤50 行
- 嵌套 ≤4 层

### Store 规范

- 所有 state 更新用不可变模式
- 持久化通过 `createPersistence<T>(key)` 封装
- 跨 Store 引用在函数内部惰性获取
- **禁止外部直接赋值 Store 的 ref**（绕过持久化）

### 后端规范

- 所有 SQL 用参数化查询（`$1, $2, ...`），杜绝 SQL 注入
- API 响应统一 `{ success: boolean, data?: T, error?: { code, message } }`
- JWT 密钥从环境变量读取，无硬编码 fallback
- 数据库迁移通过 `npx tsx src/config/migrate.ts` 执行
- 速率限制：全局 200/15min，登录接口 20/15min

---

## 十一、构建、部署与 Git

### 日常开发流程

```bash
# 1. 前端编译
cd twin-planet-miniapp
npm run build:mp    # uni build + strip-wxss + copy-echarts + copy-tabbar
# 或：npm run build:mp-weixin
# ⚠️ copy-tabbar.js：将 native/custom-tab-bar/* 复制到 dist（uni-app 不编译此目录）

# 2. 后端类型检查
cd ../twin-planet-server
npx tsc --noEmit

# 3. 提交并推送（每次修改后必须执行）
cd ..
git add -A
git commit -m "feat: XXX"   # 或 fix/refactor/docs/chore
git push
```

### Git 提交规范

```
类型: feat, fix, refactor, docs, test, chore, perf, ci
格式: <type>: <中文描述>
示例:
  fix: 修复双计时器持久化只保存一个的竞态
  feat: 后端 handover API 改为家庭范围跨设备共享
  docs: 更新 CLAUDE.md 添加后端和部署章节
```

### 部署到服务器

**服务器信息**：
- IP：`49.232.49.175`
- 系统：Linux (CentOS/Ubuntu)
- ⚠️ **服务器上运行着其他项目，部署时注意端口冲突和资源竞争**
- 容器化部署，通过 Docker Compose 隔离

**部署步骤**：

```bash
# 1. SSH 到服务器
ssh root@49.232.49.175

# 2. 进入项目目录
cd /opt/twin-planet  # 或实际部署路径

# 3. 拉取最新代码
git pull

# 4. 后端部署（Docker Compose）
cd twin-planet-server
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 5. 运行数据库迁移
docker exec twin-planet-api npx tsx src/config/migrate.ts

# 6. 检查服务健康
curl http://localhost:3003/api/health

# 7. 查看日志
docker-compose logs -f api
```

**Docker Compose 服务端口**：

| 服务 | 容器端口 | 宿主机端口 | 说明 |
|------|:--:|:--:|------|
| Nginx | 80/443 | 80/443 | 反向代理 + HTTPS |
| Node API | 3003 | 3003 | Express 后端 |
| PostgreSQL | 5432 | 5432 | 数据库 |
| Redis | 6379 | 6379 | 缓存 |

**⚠️ 部署注意事项**：
- 部署前检查端口占用：`netstat -tlnp | grep -E ':(80|443|3003|5432|6379)'`
- 如果端口冲突，修改 `docker-compose.yml` 中的宿主机端口映射
- `.env` 文件不上传 GitHub，需在服务器上手动创建
- JWT_SECRET 和微信 AppSecret 生产环境必须更换
- 首次部署需先配置 Nginx SSL 证书（Let's Encrypt）

### 微信开发者工具

```
导入目录：twin-planet-miniapp/dist/build/mp-weixin
AppID: wxee2ef767a77058db
调试基础库：锁定 3.10.3
```

---

## 十二、论证与文档

| 文档 | 路径 |
|------|------|
| 十角色论证报告 | `docs/论证/2026-06-14-十角色论证报告.md` |
| 四角色论证第四轮 | `docs/论证/2026-06-14-四角色论证-第四轮.md` |
| Logo 设计哲学 | `docs/logo-design-philosophy.md` |
| 设计哲学（双狐主义） | `design-philosophy.md` |
| 项目建设方案 | Obsidian: `并蒂星球-项目建设方案.md` |

**论证机制**：每个 Sprint 完成后启动多角色论证，结果保存为 `docs/论证/YYYY-MM-DD-论证主题.md`。

---

## 十三、当前优先级路线图

```
✅ Phase 0-3 已完成:
  ├── CRITICAL/HIGH 全线修复
  ├── 首页拆分为 IndexMom/IndexDad/IndexGranny
  ├── interactionsStore → sproutStore + contributionStore
  ├── guardianStore → energyStore + oneOnOneStore
  ├── 贴纸系统 v2.0（74 张贴纸 · 8 册 · 4 稀有度 · 75 PNG）
  ├── 亲子任务页面（日常 6 + 每周 5 + 成就 4）
  ├── 双宝广场 v2（周报 + 功能入口 + 成就动态）
  ├── 品牌统一：双狐为唯一 IP + 色彩去性别化（terracotta）
  ├── 通用组件：BrandLoading / EmptyState / Skeleton
  ├── 底部导航：原生自定义 TabBar（4 tabs · switchTab）
  └── 角色切换：所有模式均可切换角色

🟡 Phase 4 (当前): Sprint 4.5 — 3-6 岁衔接
  ├── 入园助手完善
  ├── 能力观察完善
  ├── RecordType 扩展到 3-6 岁
  └── 爸爸值班 4 岁版清单

⏳ Phase 5: 后端依赖功能
  ├── shareCard.ts Canvas 动态生成 + 接入分享流程
  ├── 贴纸插图实际生成（当前为临时占位 PNG）
  ├── 智能提醒（微信订阅消息）
  ├── COS 语音文件上传
  ├── dutyDoneTotalCount 持久化计数器
  └── 农历库接入（替代满月速查表）
```

---

## 十四、给下一个 AI 的快速启动

```bash
# 1. 进入项目
cd E:/ly/project/twin-planet

# 2. 安装依赖（首次）
cd twin-planet-miniapp && npm install
cd ../twin-planet-server && npm install
cd ..

# 3. 前端编译
cd twin-planet-miniapp && npm run build:mp

# 4. 后端类型检查
cd ../twin-planet-server && npx tsc --noEmit

# 5. 提交代码（每次修改后必须执行）
git add -A
git commit -m "feat: XXX"
git push
```

**关键原则**：
- ⚠️ **每次修改后必须 `git add -A && git commit && git push`**
- 所有代码修改后立即编译验证（前端 `npm run build:mp` + 后端 `npx tsc --noEmit`）
- 严格遵守不可变更新 Pinia state
- 颜色/间距引用 `src/constants/design.ts` + CSS 变量
- AI 内容标注「仅供参考，不构成医疗建议」
- 用中文写注释和 commit message
- ⚠️ 不要重新引入 `lazyCodeLoading`（已知引发 `$vm` 崩溃）
- ⚠️ App.vue 用 Vue 3 生命周期名：`beforeUnmount` 不是 `beforeDestroy`
- ⚠️ 服务器 `49.232.49.175` 上运行着其他项目，注意端口隔离
