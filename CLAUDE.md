# 并蒂星球 · Twin Planet

> 中国首款双胞胎育儿伴侣 —— 微信小程序
> 文档最后更新：2026-06-12（多角色论证后修复版 v0.2.0）

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

## 四、设计系统 (twin-design)

### 颜色

| 用途 | Hex | CSS 变量 |
|------|------|------|
| 大宝（安宁） | `#4299E1` | babyA / Sky Blue |
| 二宝（安然） | `#F56565` | babyB / Soft Pink |
| 页面背景 | `#FFFBF5` | Warm White |
| 卡片背景 | `#FFFFFF` | Pure White |
| 主文字 | `#2D3748` | Dark Gray |
| 次文字 | `#A0AEC0` | Medium Gray |
| AI/Accent | `#48BB78` | Mint Green |
| 警告 | `#ED8936` | Warm Orange |

### 奶奶无障碍标准（5 条）

1. **一就是一定制**：首页 ≤3 个大按钮，间距 ≥40rpx
2. **能听不看**：提醒支持 TTS（未实现）
3. **图画替代数字**：小苗苗状态图代替数字（未实现）
4. **防误触**：操作间距 ≥40rpx
5. **大字模式**：默认 ≥18px（奶奶/爷爷角色自动启用）

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
E:/ly/Obsidian/work/知识库/项目/私活/双生星球/
├── 双生星球-项目建设方案.md          # V3.2 建设方案（~1200行）
├── 双生星球-十角色终局论证.md         # 终局论证
├── 双生星球-Phase0-执行手册.md         # Phase 0 手册
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
