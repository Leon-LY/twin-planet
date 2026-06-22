# 双宝记 UI 重塑 · 设计产出目录

> 方向 C ·「星图日记」Stellar Journal — 精炼暖现代演进
> 执行范围：P0 纯设计稿（不修改 app 源码）

---

## 目录结构

```
designs/ui-redesign/
├── README.md                    # 本文件
├── direction-comparison.html    # 三方向对比页（A/B/C 色彩字体组件并排）
├── tokens/                      # 设计令牌
│   ├── tokens.json              # 机器可读唯一源（Style Dictionary 兼容）
│   ├── tokens.scss              # SCSS 变量
│   ├── tokens-wxss.wxss         # CSS 变量（WXSS 兼容）
│   └── tokens-doc.html          # 可视化令牌文档
├── logo/                        # Logo 全规格
│   ├── concept-1-sprout/        # 概念1·并蒂嫩芽
│   ├── concept-2-fox-duo/       # 概念2·狐狸双星
│   ├── concept-3-orbit-kiss/    # 概念3·轨道之吻
│   └── logo-spec.html           # 使用规范文档
├── illustration/                # 插画体系
│   ├── character-spec.html      # 角色规范（狐狸家族 + 星球宝宝）
│   ├── icon-set.svg             # 完整图标集
│   ├── empty-states.svg         # 空状态插画 ×6
│   └── celebration-kit.svg      # 庆祝素材
└── mockups/                     # 高保真页面稿
    ├── home-mom.html            # 首页·妈妈（旗舰）
    ├── home-granny.html         # 首页·奶奶（无障碍）
    ├── record-dual.html         # 双轨记录
    ├── growth-charts.html       # 生长曲线
    └── sticker-collection.html  # 贴纸收集册
```

## 设计方向

**方向 C · 星图日记 (Stellar Journal)**

- 演进当前 Warm Constellations 暖纸系统
- 保留 amber/rose 双宝色彩基因
- 修复 Logo 配色冲突、插画缺失、图标不全、奶奶模式缺页
- 印章/胶带仅在庆祝场景保留为点睛
- 字体：思源宋体 + Inter/Lora（开源免费）

## 色彩速查

| 用途 | Hex | 令牌 |
|------|------|------|
| 背景 | `#FDFAF3` | `--color-bg` |
| 卡片 | `#FFF7EC` | `--color-surface` |
| 大宝 | `#E07B3E` | `--color-baby-a` |
| 小宝 | `#D48068` | `--color-baby-b` |
| 主文字 | `#2A2017` | `--color-ink` |
| 次文字 | `#948570` | `--color-ink-md` |
| 强调/CTA | `#5C9A6E` | `--color-success` |
| 成就 | `#C8993E` | `--color-warning` |
| 边框 | `#EADFCB` | `--color-border` |
| 危险 | `#D4706B` | `--color-danger` |
