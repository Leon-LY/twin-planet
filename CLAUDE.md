# 并蒂星球 · Twin Planet（暂定名）

> 中国首款双胞胎育儿伴侣 —— 微信小程序
> 文档最后更新：2026-06-14（双宝手帐 v4 · 三角色论证后）
>
> **⚠️ 应用名称说明**：「并蒂星球」为开发期暂定名。最终名称将根据产品风格和功能方向确定。当前设计方向为"双宝手帐"（Twin Journal）— 温暖手工纸质感 × 贴纸游戏互动。

---

## 🎨 设计方向：双宝手帐 (Twin Journal)

> **核心理念**：一本可以玩的实体手帐本。有贴纸、盖章、手绘涂鸦的触感。
> **三角色论证**：设计师 + 双胞胎妈妈 + 前端工程师 共识通过（2026-06-14）

| 设计维度 | 值 |
|---------|-----|
| **色调** | 暖纸 `#FEF9F0` + 姜黄 `#E07B3E` (大宝) + 豆沙 `#D48068` (二宝) + 鼠尾草绿 `#5C9A6E` (完成) |
| **字体** | 标题 Georgia/KaiTi 衬线，正文 PingFang SC 无衬线 |
| **动效** | 3s 呼吸节拍系。交错入场 stagger。无抖动、无无限旋转。 |
| **交互** | 大圆形玩具按钮（320rpx，3D 内阴影，按压 0.86x 缩放）。贴纸卡片微微旋转 (-0.5°/1°)，重叠排列。 |
| **组件** | LightBridge 动态连接双胞胎（bright/steady/faint/one-sided 五态），数据驱动文案 |

**关键约束**（微信 WXSS）：
- ❌ 禁用：`conic-gradient`, `clip-path`, `filter`, `mask`, `font-variant-numeric`, `*` 通用选择器
- ✅ 可用：`radial-gradient` 多层, `box-shadow` 多层, `transform`/`opacity` 动效, `::before`/`::after`

---

## ⚠️ 已知关键问题

### WeChat 基础库兼容性

- **解决**：微信开发者工具 → 详情 → 本地设置 → 调试基础库 → **锁定 3.10.3**（3.8~3.11 稳定版本）

### 微信 WXSS 编译器不兼容的 CSS 特性

| 特性 | 状态 | 说明 |
|------|:--:|------|
| `conic-gradient` | ❌ | 用 border + 分段圆点替代 |
| `clip-path` | ❌ | 用 overflow:hidden + 内圆覆盖替代 |
| `filter`, `mask`, `backdrop-filter` | ❌ | 不支持 |
| `*` 通用选择器 | ❌ | 2026-06-14 验证：触发 `appServiceSDKScriptError` |
| `font-variant-numeric: tabular-nums` | ❌ | 用 letter-spacing 替代等宽 |
| `.stagger-reveal > *` + `animation` | ❌ | 用 nth-child 选择器替代 |
| `radial-gradient` 多层 | ✅ | 球体光照模型用 3 层 |
| `box-shadow` 多层 | ✅ | 大气光晕、3D 按钮 |
| `transform: rotate/scale` 动效 | ✅ | 所有入场动画和呼吸动画 |

---

---

## 一、项目概况

| 项目 | 详情 |
|------|------|
| **名称** | 并蒂星球 (Twin Planet) |
| **Slogan** | 并蒂而生，同步成长 |
| **产品哲学** | 看见每一个人 (See Every Person) |
| **形态** | 微信小程序 (uni-app Vue3) |
| **AppID** | `wxee2ef767a77058db` |
| **GitHub** | https://github.com/Leon-LY/twin-planet |
| **开发者** | Leon（全栈独立，龙凤胎爸爸） |
| **目标用户** | 0-6 岁双胞胎家庭（妈妈/爸爸/奶奶/育儿嫂/医生/老师） |
| **MVP 周期** | 12 周 (已完成 Sprint 1-4，约 50% 进度) |
| **年龄覆盖** | 0-6 岁全周期 — 0-3 岁同步管理 + 3-6 岁差异化陪伴 |
| **最新论证** | 2026-06-12 六角色论证发现 3-6 岁缺口 → 新增 Sprint 4.5 |

---

## 二、技术栈

```
前端：uni-app (Vue3 Composition API + <script setup> + TypeScript)
状态：Pinia
图表：ECharts（按需懒加载，不在首页阻塞）
构建：Vite → npx uni build -p mp-weixin
后端：未启动（将用现有服务器 49.232.49.175）
数据库：未启动（服务器已有 PostgreSQL + Redis）
AI：DeepSeek V4 Pro（通过 API 代理）
```

---

## 三、目录结构

```
twin-planet-miniapp/src/
├── App.vue              # 根组件（Options API，App 级生命周期）
├── main.js              # 入口，createSSRApp + Pinia
├── manifest.json        # uni-app 配置，AppID + 微信设置
├── pages.json           # 路由表（14 pages 当前）
├── uni.scss             # 全局 SCSS 变量
├── shime-uni.d.ts       # TS 类型声明
│
├── components/
│   └── ec-canvas/
│       └── ec-canvas.vue      # ECharts Canvas 包装（懒加载）
│
├── stores/              # Pinia 状态管理（7 个 Store）
│   ├── user.ts          # 用户登录/角色/奶奶模式/大字模式
│   ├── family.ts        # 双胞胎组（家庭）
│   ├── babies.ts        # 宝宝 CRUD + 大宝二宝 + 性别检测
│   ├── records.ts       # 喂养/睡眠双轨计时器 + 日志
│   ├── interactions.ts  # 萌芽日记 + 今天我做了什么
│   ├── duty.ts          # 爸爸值班 SOP 清单引擎
│   ├── alerts.ts        # 照顾者中断通知（纯统计规则）
│   └── guardian.ts      # 电量表 + 一人时光守护者
│
├── utils/
│   └── whoGrowth.ts     # WHO LMS 参数 + Z值/百分位 + 差异率计算
│
└── pages/
    ├── index/index.vue          # 品牌首页（双宝卡片 + 功能入口）
    ├── login/index.vue          # 登录页（微信一键登录）
    ├── onboarding/
    │   ├── family.vue           # 家庭创建 + 角色选择
    │   └── babies.vue           # 双胞胎注册（大宝→二宝）
    ├── record/index.vue         # 双轨记录（一屏双宝，≤2tap）
    ├── growth/index.vue         # 生长曲线对比（WHO + ECharts）
    ├── sprout/index.vue         # 萌芽日记（7种互动类型时间线）
    ├── contribution/index.vue   # 今天我做了什么（8种贡献类别）
    ├── snapshot/index.vue       # 爸爸的快照（三明治卡片布局）
    ├── handover/index.vue       # 交接班语音便签
    ├── duty/index.vue           # 爸爸值班模式（SOP 清单）
    └── guardian/index.vue       # 守护中心（电量表 + 一人时光）
```

---

## 四、设计系统：双宝手帐 (Twin Journal v4)

### 颜色（暖纸手帐）

> **V4 暖纸体系**：温暖、手工、编辑级质感。双胞胎按出生顺序用不同暖色，消除性别刻板印象。

| 用途 | Hex | 说明 |
|------|------|------|
| 页面背景 | `#FEF9F0` | 暖白纸 |
| 卡片背景 | `#FFF7ED` (`--cream`) | 暖奶油 |
| 大宝 | `#E07B3E` (`--amber`) | 姜黄/暖橙 |
| 二宝 | `#D48068` (`--rose`) | 豆沙/暖粉 |
| 主文字 | `#2D2318` | 墨色 |
| 次文字 | `#9C8E7C` | 中灰 |
| 强调/完成 | `#5C9A6E` (`--mint`) | 鼠尾草绿 |
| 成就 | `#C8993E` (`--gold`) | 暖金 |
| 边框/虚线 | `#E8DCC8` (`--dot`) | 暖灰虚线 |

**铁律**：大宝=姜黄 `#E07B3E`，二宝=豆沙 `#D48068`。按出生顺序，不按性别。

### 奶奶无障碍标准

1. 首页 ≤3 个大按钮，间距 ≥40rpx
2. 大字模式：默认 ≥18px（奶奶/爷爷角色自动启用）
3. 防误触：操作间距 ≥40rpx

### 颜色分配铁律

> **V3 推翻蓝粉。颜色按出生顺序，同色系不同明度。** 大宝=深陶土 `#A45C40`，二宝=浅陶土 `#C7866A`。
> 两个男孩不会看到粉色、两个女孩不会看到蓝色——彻底消灭性别暗示。
> 颜色是身份标识（一眼认出是谁的数据），性别通过头像/名字区分。

### 交互原则

- **一手操作**：核心按钮在下半屏，≥44×44px 触摸区
- **零思考记录**：≤2 tap 完成喂养/睡眠记录
- **夜间模式**：22:00-06:00 自动暗色
- **宝宝即主角**：每个宝宝独立颜色 + 头像，绝不混淆

---

## 五、6 条安全红线（上线必检）

| # | 红线 | 规则 |
|:--:|------|------|
| 1 | 不做医疗判断 | 不输出"建议就医""可能是XX病" |
| 2 | 不做疫苗决策 | 只展示事实，不判断能不能打 |
| 3 | 不做症状分析 | 异常日志是纯文本便签，不做 AI 分析 |
| 4 | 颜色 ≠ 诊断 | 差异率颜色必须附免责声明 |
| 5 | AI 内容免责 | "仅供参考，不构成医疗建议" |
| 6 | 照片加密 | 异常照片 SSE-COS 加密，仅缩略图，原图 7 天删除 |

---

## 六、开发规范

### 不可变性（CRITICAL）

```typescript
// ❌ 错误
profile.value.role = role
babies.value.push(baby)

// ✅ 正确
profile.value = { ...profile.value, role }
babies.value = [...babies.value, baby]
```

### uni-app 特殊规则

- **App.vue**：必须用 Options API (`export default { onLaunch() {} }`)，不能用 `<script setup>`
- **页面组件**：`<script setup lang="ts">` 中，Vue 生命周期（onMounted/onUnmounted）从 `vue` 导入，页面生命周期（onShow/onLoad）从 `@dcloudio/uni-app` 导入
- **单位**：使用 `rpx`（750rpx 基准），不要用 `px`
- **底部安全区**：`padding-bottom: calc(XXrpx + env(safe-area-inset-bottom))`

### Git

- 仓库：`E:/ly/project/twin-planet`
- 分支：`master`
- 推送：`git push` 即可

---

## 七、构建与调试

```bash
# 编译微信小程序
cd twin-planet-miniapp
npx uni build -p mp-weixin

# 输出
dist/build/mp-weixin/

# 微信开发者工具
# 导入目录：dist/build/mp-weixin
# 填入 AppID: wxee2ef767a77058db
```

---

## 八、已完成功能（Sprint 1-4）

| Sprint | 功能 | 文件 | 论证 |
|:--:|------|------|:--:|
| Phase 0 | WHO 生长曲线工具 | src/utils/whoGrowth.ts | — |
| Phase 0 | 生长曲线 Demo | src/pages/growth/index.vue | — |
| Sprint 1 | 登录→家庭→双胞胎注册 | login + onboarding/* | 5 角色 ✅ |
| Sprint 2 | 极简双轨记录 | record/index.vue | 2 角色 ✅ |
| Sprint 2.5 | 萌芽日记 | sprout/index.vue | — |
| Sprint 2.5 | 今天我做了什么 | contribution/index.vue | — |
| Sprint 3 | 爸爸的快照 | snapshot/index.vue | — |
| Sprint 3 | 交接班语音便签 | handover/index.vue | — |
| Sprint 3.5 | 爸爸值班模式 | duty/index.vue | — |
| Sprint 3.5 | 照顾者中断通知 | stores/alerts.ts | — |
| Sprint 4 | 电量表 + 一人时光 | guardian/index.vue | — |
| Sprint 4.5 | 🆕 入园助手 + 能力观察 + 社交版 | (待开发) | 6 角色 ✅ |

## 九、🆕 3-6 岁延伸功能（Sprint 4.5，当前优先）

> **2026-06-12 六角色论证结论**：当前 22 个 MVP 功能中 80% 面向 0-3 岁婴儿。3 岁后用户会流失。
> 核心转型：从「两个婴儿的同步管理」→「两个独立人格的差异化陪伴」。

### 新增 3 个 P0 功能（已论证，待开发）

| # | 功能 | 工期 | 说明 | 票数 |
|:--:|------|:--:|------|:--:|
| 1 | **入园助手** | 3d | 分班决策辅助：双生耦合度雷达图 + 同班/分班利弊分析 | 🏆 5/6 |
| 2 | **双宝能力观察** | 3d | 两个独立成长时间线，非对比型，优势标记而非薄弱标记 | 🏆 5/6 |
| 3 | **萌芽日记社交版** | 2d | 新增社交分化维度：与各自朋友/与彼此的关系 + context 字段 | 🏆 4/6 |

### 爸爸值班 4 岁版（清单替换）

现有清单 `喂奶/换尿布/哄睡` → 替换为 `专属聊天10min/拍照/搭积木+画画/自己吃饭/让他们打架(自己解决)`

### 技术实现

- 全部可纯前端完成，零后端依赖
- records Store 的 RecordType 扩展为两级分类：`routine | event | milestone`
- 新增 milestones Store（认知/体能/社交/语言 CDC 标准分类 + ageNorm 区间预警）
- 本地持久化：`uni.setStorageSync` + 启动 hydrate（后迁 SQLite）

---

## 十、待开发（Sprint 5-6，需要后端支持）

### Sprint 5：留存闭环

| 功能 | 说明 | 前置依赖 |
|------|------|------|
| 智能提醒 | 喂养/疫苗提醒 + 微信订阅消息 | 后端 API + 微信模板消息 |
| 7 天语音陪伴 | 7 条真人录音陪伴新手期 | 录音资源 + COS 存储 |
| 就诊速查卡 | 双胞胎对比摘要导出 | 数据结构 |

### Sprint 6：上线准备

| 功能 | 说明 | 前置依赖 |
|------|------|------|
| 对比照自动配对 | 上传→AI 配对→并排展示 | COS + AI API |
| 异常事件日志 | 纯文本便签 | 数据库 |
| 知识库 (20+ 文章) | 双胞胎专属育儿内容 | 数据库 |

### 基础设施待办

| 事项 | 状态 |
|------|:--:|
| 域名注册 twinplanet.cn | ⏳ |
| ICP 备案 | ⏳ |
| 服务器后端搭建 | ⏳ |
| 微信小程序后台注册"并蒂星球" | ⏳ |
| 后端数据库建表 | ⏳ |

---

## 十一、项目文档

完整建设方案和论证报告在 Obsidian vault：

```
E:/ly/Obsidian/work/知识库/项目/私活/并蒂星球/
├── 并蒂星球-项目建设方案.md          # V3.2 建设方案（~1200行）
├── 并蒂星球-十角色终局论证.md         # 终局论证
├── 并蒂星球-Phase0-执行手册.md         # Phase 0 手册
└── ... (共 7 份文档)
```

AI Skill 配置：
```
E:/ly/Obsidian/work/.claude/skills/
├── twin-design/SKILL.md    # 设计系统
├── twin-data/SKILL.md      # 数据层 (WHO/DDL/API)
└── twin-rules/SKILL.md     # 项目规则 (Sprint/验收/停机)
```

---

## 十二、给下一个 AI 的快速启动命令

```bash
# 1. 进入项目
cd E:/ly/project/twin-planet

# 2. 安装依赖（首次）
cd twin-planet-miniapp && npm install

# 3. 编译
npx uni build -p mp-weixin

# 4. 提交代码
git add -A && git commit -m "feat: XXX" && git push
```

**关键原则**：
- 每个 Sprint 完成后必须启动多角色论证
- 所有代码修改后立即编译验证
- 绝对不可变更新 Pinia state
- 所有 AI 内容必须标注免责声明
- 颜色/间距严格遵循 twin-design
- 用中文写注释和 commit message

---

## 十三、核心技术图表

### 13.1 系统架构图

见 draw.io 导出或 Mermaid 源码（`docs/` 目录）。

```
微信小程序 (uni-app Vue3 + Pinia + ECharts懒加载)
    │ HTTPS JSON
    ▼
Nginx (49.232.49.175 · 反向代理 · HTTPS · 限流)
    │
    ▼
Docker: Node.js API (Express + JWT + DAL)
    ├── PostgreSQL (9表: users/babies/records/...)
    ├── Redis (缓存 · 队列 · Session)
    ├── COS (照片 · 语音 · 缩略图)
    └── AI Proxy → DeepSeek V4 Pro
外部: 微信服务端 (wx.login · 订阅消息)
```

### 13.2 功能矩阵

| # | 功能 | 0-3岁 | 3-6岁 | 状态 |
|:--:|------|:--:|:--:|:--:|
| 1 | 宝宝档案 | ✅ | ✅ | ✅ |
| 2 | 双轨记录(喂养/睡眠/换尿布) | ✅ | ✅ | ✅ |
| 3 | WHO生长曲线对比 | ✅ | ✅ | ✅ |
| 4 | 萌芽日记 | ✅ | ✅ | 🟡 |
| 5 | 今天我做了什么 | ✅ | ✅ | ✅ |
| 6 | 爸爸的快照 | ✅ | ✅ | ✅ |
| 7 | 交接班语音 | ✅ | ✅ | ✅ |
| 8 | 爸爸值班SOP | ✅ | ❌ | ✅ |
| 9 | 照顾者中断通知 | ✅ | ❌ | ✅ |
| 10 | 电量表+一人时光 | ✅ | ✅ | ✅ |
| 11 | 🆕 入园助手 | ❌ | ✅ | ✅ |
| 12 | 🆕 双宝能力观察 | ❌ | ✅ | ✅ |
| 13 | 智能提醒(订阅消息) | ✅ | ✅ | 🔴 |
| 14 | 就诊速查卡 | ✅ | ✅ | 🔴 |
| 15 | 对比照配对 | ❌ | ✅ | 🔴 |
| 16 | 知识库(20+文) | ✅ | ✅ | 🔴 |

✅ 已完成  🟡 部分实现  🔴 需后端

### 13.3 用户旅程（0-6 岁全周期）

```
注册 ──→ 0-3岁日常记录 ──→ 3岁转折(入园) ──→ 3-6岁持续成长 ──→ 6岁+
😊好奇   😐习惯偶尔焦虑    😟焦虑峰值        😌平稳安心        😊/😞留存/流失
```

关键触点：第一次记录（激活）→ 第一个里程碑（aha）→ 第一次入园评估（付费转化）

---

## 十四、品牌 VI 与 Logo 方案

### Logo 方案（三选一）

| | 方案A: 极简几何 | 方案B: 并蒂花 | 方案C: 双星轨迹 |
|------|:--:|:--:|:--:|
| **意象** | 两个重叠椭圆 | 并蒂莲双花 | 两颗并肩星球 |
| **风格** | 现代科技 App 感 | 温暖中国风 | 童趣宇宙感 |
| **颜色** | 蓝#4299E1 + 粉#F56565 | 粉渐变为主 | 蓝粉双星+轨道 |
| **适合** | 🏆 小程序图标 | 启动页品牌物料 | App内空状态插画 |

**推荐**：方案A 作为主 Logo（小程序图标裁切后仍可识别），方案B 作为品牌启动页，方案C 作为辅助图形。

### 品牌色板

| 用途 | 色值 | 场景 |
|------|------|------|
| 出生顺序1(大宝) | `#A45C40` | 深陶土 · 身份标记 · 实测曲线 · 主按钮 |
| 出生顺序2(二宝) | `#C7866A` | 浅陶土 · 身份标记 · 次按钮 · 辅助卡片 |
| 背景 | `#FFFBF5` | 全局页面底色 |
| 卡片 | `#FFFFFF` | 内容区底色 |
| 主文字 | `#2D3748` | 标题、正文 |
| 次文字 | `#A0AEC0` | 描述、时间戳 |
| AI/强调 | `#48BB78` | CTA按钮、完成状态 |
| 警告 | `#ED8936` | 中断通知、全部停止 |

---

## 十五、核心页面布局速查

### 首页三角色自适应

| 角色 | 品牌区 | 双宝卡片 | 功能入口 |
|------|------|------|------|
| 妈妈 | Logo+全称+slogan | 状态+最近记录 | 8个功能卡片 |
| 爸爸 | 品牌名(紧凑) | 三明治快照 | 今天统计+5入口网格 |
| 奶奶 | 品牌名52rpx | 不显示 | 3个大按钮竖排 |

### 双轨记录三态切换

| 状态 | 触发 | 界面 |
|------|------|------|
| 空闲态 | 无计时器 | 6操作按钮网格(喂奶/睡觉/换尿布 × 2宝宝) |
| 单计时态 | 1个宝宝运行中 | 大屏计时器+红色停止按钮 |
| 双计时态 | 2个宝宝运行中 | 并排计时器卡片+全部停止按钮 |

### 生长曲线关键约束

- 龙凤胎用不同性别的 WHO LMS 参数
- 新生儿 <14 天不显示 WHO 对比线
- 早产儿 (<37周) 使用矫正月龄
- 差异率颜色必须附免责声明

### 入园助手设计哲学

> 呈现参考维度，不替家长做决定。
> 耦合度条形图(情绪依赖/社交重叠/身份认同) + 同班v分班利弊双栏 + 学期评估历史。
> 底部必须标注"不构成教育建议"。
