# 双宝记小程序 Emoji 使用审计报告

> 扫描路径: src/
> 扫描日期: 2026-06-18
> 扫描范围: 所有 .vue / .ts 文件 + iconfont.wxss

---

## 一、iconfont.wxss 已有图标清单（44 个类名）

文件路径: src/styles/iconfont.wxss

### 1.1 记录类型图标（9 个）
| 类名 | 对应场景 |
|------|---------|
| icon-bottle | 喂奶 |
| icon-sleep | 睡觉 |
| icon-sleep-zzz | 睡觉(带zzz) |
| icon-diaper | 尿布 |
| icon-bath | 洗澡 |
| icon-thermometer | 体温 |
| icon-medicine | 用药 |
| icon-wet | 湿尿布 |
| icon-dirty | 脏尿布 |

### 1.2 宝宝/角色图标（6 个）
| 类名 | 对应场景 | 备注 |
|------|---------|------|
| icon-baby-a | 大宝头像 | |
| icon-baby-b | 小宝头像 | |
| icon-role-mom | 妈妈 | |
| icon-role-dad | 爸爸 | |
| icon-role-grandma | 奶奶 | |
| icon-person | 人物 | |

> 缺口: 缺少 icon-role-grandpa(爷爷) 和 icon-role-nanny(育儿嫂)

### 1.3 功能/操作图标（8 个）
icon-clipboard, icon-calendar, icon-microphone, icon-edit, icon-book, icon-share, icon-chart, icon-sprout

### 1.4 装饰/成就图标（9 个）
icon-night, icon-star, icon-trophy, icon-celebrate, icon-crown, icon-link, icon-hero, icon-strength, icon-clipboard

### 1.5 贴纸图标（13 个）
icon-sticker-sunrise, icon-sticker-watchful, icon-sticker-three-day, icon-sticker-twin-spark,
icon-sticker-ten, icon-sticker-fifty, icon-sticker-hundred, icon-sticker-observe,
icon-sticker-milestone5, icon-sticker-school, icon-sticker-inviter, icon-sticker-welcome, icon-sticker-rainbow

### 1.6 尺寸辅助类（6 个）
icon-xs(20rpx), icon-sm(28rpx), icon-md(40rpx), icon-lg(56rpx), icon-xl(80rpx), icon-xxl(120rpx)

---

## 二、App.vue 中已有的 CSS 纯图标系统

文件路径: src/App.vue (第 1194-1393 行)

| CSS 类名 | 替代的 emoji | 说明 |
|---------|-------------|------|
| .icon-arrow | 箭头 | 支持 .left/.up/.down |
| .icon-plus | 加号 | |
| .icon-check | 勾选 | |
| .icon-close | 关闭 | |
| .icon-more | 三点菜单 | |
| .status-badge | 数字角标 | |
| .status-pulse | 脉冲点 | 计时器指示 |
| .icon-warn | 警告三角 | |
| .icon-square | 空心方块 | 未勾选 |
| .icon-search | 搜索放大镜 | |
| .icon-clock | 时钟 | |
| .icon-home | 房子 | |
| .icon-user | 人物 | |

---

## 三、.vue 文件中的 Emoji 使用清单

### 3.1 pages/duty/index.vue (值班清单) - 7 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 19 | party-popper | 任务完成图标 | 有 icon-celebrate |
| 21 | party-popper | 任务全部搞定文字 | 有 icon-celebrate |
| 33 | check/white-square | 勾选/未勾选 | 有 icon-check/icon-square |
| 55 | rocket | 开始值班按钮 | 无 |
| 61 | trophy | 值班完成按钮 | 有 icon-trophy |
| 110 | trophy | Toast太棒了 | 有 icon-trophy |
| 121 | superhero | 分享标题 | 有 icon-hero |

### 3.2 pages/contribution/index.vue (贡献页) - 3 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 53 | green-heart | 标题 | 无 |
| 91 | memo | 空状态 | 无 |
| 125 | flexed-biceps | Toast已记录 | 有 icon-strength |

### 3.3 pages/discover/index.vue (发现页) - 14 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 5 | compass | 页面图标 | 无 |
| 99 | seedling | 功能入口-萌芽日记 | 有 icon-sprout |
| 100 | heart-with-ribbon | 功能入口-贡献 | 无 |
| 101 | clipboard | 功能入口-值班 | 有 icon-clipboard |
| 102 | shield | 功能入口-守护 | 无 |
| 103 | studio-microphone | 功能入口-语音 | 有 icon-microphone |
| 104 | star | 功能入口-贴纸 | 有 icon-star |
| 105 | sparkles | 功能入口-任务 | 无 |
| 112 | pushpin | 默认fallback | 无 |
| 156 | fire | 成就-连续7天 | 无 |
| 158 | star | 成就-5张贴纸 | 有 icon-star |
| 161 | memo | 成就-30条记录 | 无 |
| 164 | handshake | 成就-同步率70% | 无 |
| 179 | fox | 分享标题 | 无 |

### 3.4 pages/guardian/index.vue (守护中心) - 5 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 9 | battery | 电量表标签 | 无 |
| 29 | woman | 妈妈调整按钮 | 有 icon-role-mom |
| 30 | man | 爸爸调整按钮 | 有 icon-role-dad |
| 35 | hourglass | 专属时光标签 | 无 |
| 110 | four-pointed-star | Toast装饰 | 品牌符号 |

### 3.5 pages/handover/index.vue (交接班) - 13 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 15 | studio-microphone | 录音图标 | 有 icon-microphone |
| 31 | memo | 文字便签标签 | 无 |
| 52 | pause/play | 播放/暂停 | 无 |
| 60 | radio | 空状态 | 无 |
| 96 | bust-silhouette | 作者emoji | 有 .icon-user |
| 103 | check | Toast已保存 | 有 icon-check |
| 142 | bust-silhouette | 作者emoji | 有 .icon-user |
| 149 | check | Toast已保存 | 有 icon-check |
| 210 | bust-silhouette | 作者emoji | 有 .icon-user |
| 215 | check | Toast已保存 | 有 icon-check |
| 293 | woman/man/grandma/grandpa/nanny | 角色映射 | 部分有 icon-role-* |
| 294 | bust-silhouette | 默认角色 | 有 .icon-user |
| 298 | clipboard | 分享标题 | 有 icon-clipboard |

### 3.6 pages/growth/index.vue (生长曲线) - 7 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 18 | four-pointed-star | 装饰文字 | 品牌符号 |
| 49 | boy/girl | 宝宝性别 | 无(缺性别图标) |
| 58 | four-pointed-star | 等待记录装饰 | 品牌符号 |
| 63 | boy/girl | 宝宝性别 | 无(缺性别图标) |
| 72 | four-pointed-star | 等待记录装饰 | 品牌符号 |
| 102 | hospital | 导出就诊卡按钮 | 无 |
| 248 | four-pointed-star | Toast装饰 | 品牌符号 |

### 3.7 pages/index/index.vue (首页) - 11 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 91 | party-popper | 庆祝emoji变量 | 有 icon-celebrate |
| 94 | glowing-star | 7天成就 | 有 icon-star |
| 95 | trophy | 30天成就 | 有 icon-trophy |
| 96 | crown | 100天成就 | 有 icon-crown |
| 162 | glowing-star | 贴纸计数 | 有 icon-star |
| 163 | ringed-planet | 分享文案 | 品牌符号 |
| 179 | woman | 妈妈角色 | 有 icon-role-mom |
| 180 | man | 爸爸角色 | 有 icon-role-dad |
| 181 | older-woman | 奶奶角色 | 有 icon-role-grandma |
| 182 | older-man | 爷爷角色 | 缺 icon-role-grandpa |
| 183 | woman-feeding-baby | 育儿嫂角色 | 缺 icon-role-nanny |

### 3.8 pages/index/components/HelpGranny.vue - 3 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 20 | telephone | 问家里人按钮 | 无 |
| 28 | envelope-with-arrow | 发消息按钮 | 无 |
| 58 | check | 步骤完成 | 有 icon-check |

### 3.9 pages/index/components/IndexDad.vue - 3 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 47 | camera-with-flash | 查看快照按钮 | 无 |
| 90 | flexed-biceps | 问候语撑住 | 有 icon-strength |
| 92 | bar-chart | 问候语数据看板 | 有 icon-chart |

### 3.10 pages/index/components/IndexMom.vue - 13 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 28 | green-circle | 都很好状态 | 无 |
| 29 | crystal-ball | 预测提示 | 无 |
| 37 | waving-hand | 欢迎手势 | 无 |
| 97 | stopwatch | 计时器图标 | 有 .icon-clock |
| 121 | family | 邀请另一半 | 无 |
| 133 | family | 庆祝emoji | 无 |
| 153 | four-pointed-star | 连续记录装饰 | 品牌符号 |
| 202 | memo | 重新创建家庭 | 无 |
| 203 | door | 退出登录 | 无 |
| 275 | flexed-biceps | 夜间问候语 | 有 icon-strength |
| 277 | bar-chart | 下午问候语 | 有 icon-chart |
| 279 | crescent-moon | 夜间问候语 | 有 icon-night |
| 281 | teacup | 上午问候语 | 无 |

### 3.11 pages/index/components/IndexGranny.vue - 1 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 25 | telephone | 问家里人按钮 | 无 |

### 3.12 pages/milestones/index.vue (能力观察) - 6 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 103 | check | 已达标状态 | 有 icon-check |
| 104 | seedling | 发展中状态 | 有 icon-sprout |
| 105 | white-square | 未开始状态 | 有 .icon-square |
| 134 | seedling | Toast发展中 | 有 icon-sprout |
| 138 | check | Toast已达标 | 有 icon-check |
| 142 | white-square | Toast已重置 | 有 .icon-square |

### 3.13 pages/school/index.vue (入园助手) - 16 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 4 | school | 页面图标 | 有 icon-sticker-school |
| 11 | globe | 双生耦合度标题 | 无 |
| 34 | balance-scale | 同班vs分班标题 | 无 |
| 38 | check | 优点列表 | 有 icon-check |
| 39 | check | 优点列表 | 有 icon-check |
| 40 | check | 优点列表 | 有 icon-check |
| 41 | warning | 风险列表 | 有 .icon-warn |
| 46 | check | 优点列表 | 有 icon-check |
| 47 | check | 优点列表 | 有 icon-check |
| 48 | check | 优点列表 | 有 icon-check |
| 50 | warning | 风险列表 | 有 .icon-warn |
| 62 | couple/person-x2 | 班级选择 | 无 |
| 77 | couple | 同班按钮 | 无 |
| 78 | person-x2 | 分班按钮 | 有 .icon-user |
| 81 | floppy-disk | 保存评估按钮 | 无 |
| 141 | check | Toast已保存 | 有 icon-check |

### 3.14 pages/snapshot/index.vue (双宝快照) - 6 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 14 | boy/girl | 大宝头像 | 无(缺性别图标) |
| 51 | boy/girl | 小宝头像 | 无(缺性别图标) |
| 128 | woman/man/grandma/grandpa/nanny | 角色标签 | 部分有 icon-role-* |
| 129 | bust-silhouette | 默认家人 | 有 .icon-user |
| 135 | baby-bottle/sleeping-face | 状态 | 有 icon-bottle/icon-sleep |
| 137 | smiling-face | 清醒中状态 | 无 |

### 3.15 pages/stickers/index.vue (贴纸收集册) - 3 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 33 | check-mark | 完成标记 | 有 icon-check |
| 74 | open-book | 空状态 | 无 |
| 122 | fox | 分享标题 | 无 |

### 3.16 pages/sprout/index.vue (萌芽日记) - 2 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 120 | smile/neutral/cry/angry/hug/sleep (6个) | 心情emoji数组 | 无 |
| 148 | seedling | Toast已记录 | 有 icon-sprout |

### 3.17 pages/tasks/index.vue (亲子任务) - 4 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 5 | sparkles | 页面图标 | 无 |
| 35 | check-mark | 完成标记 | 有 icon-check |
| 41 | fire | 连续N天 | 无 |
| 57 | check-mark | 完成标记 | 有 icon-check |

### 3.18 pages/login/index.vue (登录页) - 4 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 4 | hibiscus-x2 | 品牌图标 | 无 |
| 6 | ringed-planet | 品牌标语 | 无 |
| 19 | mobile-phone | 离线使用功能说明 | 无 |
| 34 | gear | 跳过登录按钮 | 无 |

### 3.19 pages/onboarding/family.vue (创建家庭) - 7 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 14 | house | 区块图标 | 有 .icon-home |
| 76 | family-woman | 妈妈选项 | 部分有 icon-role-mom |
| 77 | family-man | 爸爸选项 | 部分有 icon-role-dad |
| 78 | older-woman | 奶奶选项 | 有 icon-role-grandma |
| 79 | older-man | 爷爷选项 | 缺 icon-role-grandpa |
| 80 | person-feeding-baby | 育儿嫂选项 | 缺 icon-role-nanny |
| 81 | bust-silhouette | 其他家人 | 有 .icon-user |

### 3.20 pages/onboarding/babies.vue (迎接宝宝) - 4 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 14 | baby-x2 | 区块图标 | 有 icon-baby-a/b |
| 75 | boy | 男孩选项 | 无(缺性别图标) |
| 81 | girl | 女孩选项 | 无(缺性别图标) |
| 196 | party-popper+rocket+star | Toast欢迎语 | 有 icon-celebrate |

### 3.21 pages/privacy/index.vue (隐私政策) - 4 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 29 | wastebasket | 清除本地数据按钮 | 无 |
| 38 | envelope | 邮箱联系方式 | 无 |
| 39 | globe | 官网联系方式 | 无 |
| 67 | warning | 清除数据标题 | 有 .icon-warn |

### 3.22 已完成去emoji化的.vue文件 (参考样板)
- pages/record/index.vue - 全部使用 iconfont
- pages/record/granny.vue - 全部使用 iconfont

---

## 四、.ts 文件中的 Emoji 使用清单

### 4.1 config/tasks.ts (亲子任务配置) - 14 处
| 行号 | emoji | 场景 |
|------|-------|------|
| 18 | open-book | read_book 读书任务 |
| 19 | person-cartwheeling | tummy_time 趴趴时间 |
| 20 | sun-with-face | sunlight 晒太阳 |
| 21 | palms-up-together | massage 婴儿抚触 |
| 22 | speech-balloon | talk_baby 和双宝说话 |
| 23 | baby-bottle | tummy_feed 面对面喂奶(有icon-bottle) |
| 27 | camera-with-flash | photo_together 拍合照 |
| 28 | straight-ruler | measure_both 量身高体重 |
| 29 | automobile | outing 出门 |
| 30 | bathtub | bath_both 洗澡(有icon-bath) |
| 31 | sparkles | milestone_note 记录新技能 |
| 43 | books | 成就-阅读七日 |
| 44 | flexed-biceps | 成就-趴趴达人(有icon-strength) |
| 45 | glowing-star | 成就-全能守护 |
| 46 | camera-with-flash | 成就-月度合集 |

### 4.2 config/seasonal.ts (二十四节气配置) - 24 处
| 行号 | emoji | 节气 |
|------|-------|------|
| 17 | seedling | 立春(有icon-sprout) |
| 18 | droplet | 雨水(有icon-wet) |
| 19 | high-voltage | 惊蛰 |
| 20 | cherry-blossom | 春分 |
| 21 | sewing-needle | 清明 |
| 22 | herb | 谷雨 |
| 23 | sun-with-face | 立夏 |
| 24 | sheaf-of-rice | 小满 |
| 25 | sheaf-of-rice | 芒种 |
| 26 | sun-with-face | 夏至 |
| 27 | fire | 小暑 |
| 28 | beach-with-umbrella | 大暑 |
| 29 | fallen-leaf | 立秋 |
| 30 | sun-behind-cloud | 处暑 |
| 31 | droplet | 白露 |
| 32 | full-moon | 秋分 |
| 33 | maple-leaf | 寒露 |
| 34 | snowflake | 霜降 |
| 35 | scarf | 立冬 |
| 36 | cloud-with-snow | 小雪 |
| 37 | snowman | 大雪 |
| 38 | dumpling | 冬至 |
| 39 | gloves | 小寒 |
| 40 | house | 大寒(有.icon-home) |

### 4.3 config/roles.ts (角色配置) - 5 处
| 行号 | emoji | 角色 | 已有替代 |
|------|-------|------|---------|
| 25 | woman | 妈妈 | 有 icon-role-mom |
| 34 | man | 爸爸 | 有 icon-role-dad |
| 43 | older-woman | 奶奶 | 有 icon-role-grandma |
| 52 | older-man | 爷爷 | 缺 icon-role-grandpa |
| 61 | woman-feeding-baby | 育儿嫂 | 缺 icon-role-nanny |

### 4.4 config/festivals.ts (节日配置) - 15 处
| 行号 | emoji | 节日 |
|------|-------|------|
| 30 | fireworks | 元旦 |
| 31 | tulip | 妇女节 |
| 32 | hammer | 劳动节 |
| 33 | balloon | 儿童节 |
| 34 | flag-china | 国庆节 |
| 35 | jack-o-lantern | 万圣节 |
| 36 | christmas-tree | 圣诞节 |
| 39 | red-envelope | 春节 |
| 40 | red-paper-lantern | 元宵节 |
| 41 | dragon-face | 端午节 |
| 42 | two-hearts | 七夕节 |
| 43 | moon-cake | 中秋节 |
| 44 | fallen-leaf | 重阳节 |
| 47 | bouquet | 母亲节 |
| 48 | necktie | 父亲节 |

### 4.5 stores/contribution.ts (贡献类型配置) - 8 处
| 行号 | emoji | 类型 | 已有替代 |
|------|-------|------|---------|
| 24 | crescent-moon | 夜奶 | 有 icon-night |
| 25 | safety-pin | 换尿布 | 有 icon-diaper |
| 26 | bathtub | 洗澡 | 有 icon-bath |
| 27 | video-game | 陪玩 | 无 |
| 28 | cooking | 做饭 | 无 |
| 29 | broom | 打扫 | 无 |
| 30 | shopping-cart | 跑腿 | 无 |
| 31 | sparkles | 其他 | 无 |

### 4.6 stores/duty.ts (值班清单配置) - 7 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 31 | camera-with-flash | 拍照发给妈妈任务 | 无 |
| 35 | baby-bottle | 喂养类型 | 有 icon-bottle |
| 36 | safety-pin | 换尿布 | 有 icon-diaper |
| 37 | sleeping-face | 哄睡 | 有 icon-sleep |
| 38 | bathtub | 洗澡 | 有 icon-bath |
| 39 | video-game | 陪玩 | 无 |
| 40 | clipboard | 其他 | 有 icon-clipboard |

### 4.7 stores/records.ts (记录存储) - 7 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 332 | baby-bottle/breastfeeding | 喂养模式标签 | 有 icon-bottle |
| 338 | droplet/poo | 尿布类型 | 有 icon-wet/icon-dirty |
| 346 | bathtub | 洗澡 | 有 icon-bath |
| 474 | droplet/poo | 尿布类型(同上) | 有 icon-wet/icon-dirty |
| 481 | bathtub | 洗澡(同上) | 有 icon-bath |
| 549 | four-pointed-star | 空白提示装饰 | 品牌符号 |
| 558 | four-pointed-star | 今日摘要装饰 | 品牌符号 |

### 4.8 stores/sprout.ts (萌芽日记互动类型) - 7 处
| 行号 | emoji | 类型 |
|------|-------|------|
| 25 | handshake | 分享 |
| 26 | high-voltage | 争执 |
| 27 | counterclockwise-arrows | 模仿 |
| 28 | green-heart | 安慰 |
| 29 | person-running | 比赛 |
| 30 | palms-up-together | 合作 |
| 31 | glowing-star | 第一次(有icon-star) |

### 4.9 stores/stickers.ts (贴纸配置) - 约 47 处

已有 iconClass 的贴纸(20个):
| 行号 | trigger | iconClass |
|------|---------|-----------|
| 149 | dawn_fox | icon-sticker-sunrise |
| 156 | watch_fox | icon-sticker-watchful |
| 163 | hero_fox | icon-hero |
| 177 | duty_fox | icon-strength |
| 195 | sprout_3 | icon-sticker-three-day |
| 202 | bloom_7 | icon-calendar |
| 209 | laurel_30 | icon-star |
| 234 | twin_back | icon-link |
| 241 | twin_chase | icon-sticker-twin-spark |
| 248 | twin_read | icon-book |
| 273 | first_sprout | icon-sprout |
| 280 | observer | icon-sticker-observe |
| 287 | chronicle | icon-book |
| 294 | five_peaks | icon-sticker-milestone5 |
| 301 | school_gate | icon-sticker-school |
| 319 | bronze_10 | icon-sticker-ten |
| 326 | silver_50 | icon-sticker-fifty |
| 333 | gold_100 | icon-sticker-hundred |
| 347 | horn_call | icon-sticker-inviter |
| 387 | lucky_rainbow | icon-sticker-rainbow |

纯 emoji 无 iconClass 的贴纸(15个):
| 行号 | trigger |
|------|---------|
| 170 | night_fox (crescent-moon) |
| 184 | lazy_fox (sleeping-face) |
| 216 | tree_100 (deciduous-tree) |
| 223 | lotus_365 (white-flower) |
| 255 | twin_hand (handshake) |
| 262 | twin_mirror (mirror) |
| 308 | solo_guard (shield) |
| 340 | jade_1000 (green-heart) |
| 394 | birthday_1 (birthday-cake) |
| 401 | birthday_2 (birthday-cake) |
| 408 | birthday_3 (birthday-cake) |
| 415 | birthday_4 (birthday-cake) |
| 422 | birthday_5 (birthday-cake) |
| 429 | birthday_6 (birthday-cake) |
| 436 | moon_fox (full-moon) |

分类图标(8处): sunrise/seedling/fox/trophy/military-medal/herb/party-popper/sparkles
稀有度图标(4处): chestnut/herb/glowing-star/fox

### 4.10 pages/milestones/store.ts (里程碑领域配置) - 6 处
| 行号 | emoji | 领域 | 已有替代 |
|------|-------|------|---------|
| 30 | brain | 认知 | 无 |
| 31 | person-cartwheeling | 体能 | 无 |
| 32 | handshake | 社交 | 无 |
| 33 | speech-balloon | 语言 | 无 |
| 34 | artist-palette | 创造 | 无 |
| 35 | broom | 自理 | 无 |
注: 同行还含 check/seedling/white-square 示例文字(各6处,共18处状态emoji)

### 4.11 utils/shareCard.ts (分享卡片绘制) - 5 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 102 | baby-bottle | 喂奶标签 | 有 icon-bottle |
| 103 | sleeping-face | 睡眠标签 | 有 icon-sleep |
| 104 | safety-pin | 尿布标签 | 有 icon-diaper |
| 139 | link | 同步率 | 有 icon-link |
| 153 | glowing-star | 新贴纸 | 有 icon-star |

### 4.12 stores/alerts.ts (告警) - 2 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 57 | warning | 超过4小时没喂奶 | 有 .icon-warn |
| 59 | alarm-clock | 距上次喂奶3小时 | 有 .icon-clock |

### 4.13 utils/storageMonitor.ts - 1 处
| 行号 | emoji | 场景 | 已有替代 |
|------|-------|------|---------|
| 56 | warning | 存储空间不足 | 有 .icon-warn |

### 4.14 composables/usePoeticTime.ts - 1 处
| 行号 | emoji | 场景 |
|------|-------|------|
| 16 | four-pointed-star | 刚开始装饰(品牌符号) |

### 4.15 仅注释中的 emoji (不需要替换)
- api/client.ts:8 (lock)
- utils/syncService.ts:148,150,167 (wrench/lock)
- App.vue:1282-1371 (warning/square/search/clock/home/user - 说明性注释)
- pages/privacy/index.vue:23 (wrench)
- pages/handover/index.vue:133,190,197 (wrench)
- utils/shareCard.ts:130,148 (NEW button)

---

## 五、按场景分类统计

### 5.1 记录类型图标 (喂奶/睡觉/尿布/体温/用药/洗澡)
| 来源 | 处数 | 已有替代 |
|------|------|---------|
| stores/duty.ts | 6 | 5/6 |
| stores/contribution.ts | 8 | 3/8 |
| stores/records.ts | 5 | 全有 |
| utils/shareCard.ts | 3 | 全有 |
| pages/snapshot/index.vue | 2 | 全有 |
| 小计 | ~25 | ~18有替代 |

### 5.2 宝宝头像/性别图标
| 来源 | 处数 | 已有替代 |
|------|------|---------|
| pages/growth/index.vue | 2 | 无 |
| pages/snapshot/index.vue | 2 | 无 |
| pages/onboarding/babies.vue | 3 | 1有替代 |
| 小计 | ~7 | ~1有替代 |

### 5.3 发现页功能入口
| 来源 | 处数 | 已有替代 |
|------|------|---------|
| pages/discover/index.vue | 9 | 4有替代 |
| 小计 | 9 | 4有替代 |

### 5.4 角色切换 emoji
| 来源 | 处数 | 已有替代 |
|------|------|---------|
| config/roles.ts | 5 | 3/5 |
| pages/index/index.vue | 5 | 3/5 |
| pages/onboarding/family.vue | 6 | 3/6 |
| pages/handover/index.vue | 5 | 3/5 |
| pages/snapshot/index.vue | 5 | 3/5 |
| pages/guardian/index.vue | 2 | 全有 |
| 小计 | ~26 | ~15有替代 |

### 5.5 里程碑/庆祝 emoji
| 来源 | 处数 | 已有替代 |
|------|------|---------|
| pages/index/index.vue | 4 | 全有 |
| pages/duty/index.vue | 4 | 全有 |
| 小计 | 6 | 全有替代 |

### 5.6 底部导航
pages.json 无 tabBar 配置，使用自定义导航 - 0 处

### 5.7 空状态 emoji
| 来源 | 处数 | 已有替代 |
|------|------|---------|
| pages/contribution/index.vue | 1 | 无 |
| pages/handover/index.vue | 1 | 无 |
| pages/stickers/index.vue | 1 | 无 |
| 小计 | 3 | 无替代 |

### 5.8 贴纸 emoji
| 来源 | 处数 | 已有替代 |
|------|------|---------|
| stores/stickers.ts 贴纸定义 | 35 | 20有iconClass |
| stores/stickers.ts 分类图标 | 8 | 2有替代 |
| stores/stickers.ts 稀有度 | 4 | 0有替代 |
| 小计 | ~47 | ~22有替代 |

### 5.9 节气/节日 emoji
| 来源 | 处数 | 已有替代 |
|------|------|---------|
| config/seasonal.ts | 24 | 2有替代 |
| config/festivals.ts | 15 | 0有替代 |
| 小计 | 39 | 2有替代 |

### 5.10 状态标记 emoji (check/white-square/check-mark/four-pointed-star)
| 来源 | 处数 | 已有替代 |
|------|------|---------|
| pages/duty/index.vue | 1 | 有 |
| pages/milestones/index.vue | 6 | 全有 |
| pages/school/index.vue | 8 | 全有 |
| pages/stickers/index.vue | 1 | 有 |
| pages/tasks/index.vue | 2 | 有 |
| pages/handover/index.vue | 3 | 有 |
| 品牌符号 four-pointed-star | ~8 | 品牌符号(保留?) |
| 小计 | ~30 | ~25有替代 |

### 5.11 问候语/文案装饰 emoji
| 来源 | 处数 | 已有替代 |
|------|------|---------|
| IndexMom.vue | 4 | 3/4 |
| IndexDad.vue | 2 | 全有 |
| pages/duty/index.vue | 1 | 无 |
| pages/guardian/index.vue | 2 | 无 |
| pages/handover/index.vue | 1 | 无 |
| 小计 | ~10 | ~5有替代 |

### 5.12 其他功能 emoji
| 来源 | 处数 | 场景 |
|------|------|------|
| pages/login/index.vue | 4 | 品牌/功能 |
| pages/school/index.vue | 7 | 页面/功能 |
| pages/growth/index.vue | 1 | 就诊卡按钮 |
| pages/sprout/index.vue | 1(6个emoji) | 心情选择器 |
| pages/contribution/index.vue | 1 | 标题 |
| pages/discover/index.vue | 2 | 成就 |
| config/tasks.ts | 10 | 任务图标 |
| pages/milestones/store.ts | 6 | 领域图标 |
| stores/sprout.ts | 7 | 互动类型 |
| 小计 | ~35 | 基本无替代 |

---

## 六、总览统计

### 6.1 按文件类型统计
| 类型 | 含emoji文件数 | emoji使用处数 |
|------|--------------|--------------|
| .vue 文件 | 21个(含2个已完成) | 约120处 |
| .ts 文件 | 14个 | 约135处 |
| 注释(不需处理) | 6个 | 约17处 |
| 合计 | 35个文件 | 约255处(去注释后约238处) |

### 6.2 按场景分类统计
| 场景 | 处数 | 已有替代 | 纯emoji无替代 |
|------|------|---------|--------------|
| 记录类型图标 | ~25 | ~18 | ~7 |
| 宝宝头像/性别 | ~7 | ~1 | ~6 |
| 发现页功能入口 | ~9 | ~4 | ~5 |
| 角色切换 | ~26 | ~15 | ~11 |
| 里程碑庆祝 | ~6 | ~6 | 0 |
| 底部导航 | 0 | - | - |
| 空状态 | ~3 | 0 | ~3 |
| 贴纸系统 | ~47 | ~22 | ~25 |
| 节气/节日 | ~39 | ~2 | ~37 |
| 状态标记 | ~30 | ~25 | ~5(+品牌符号) |
| 问候语/文案装饰 | ~10 | ~5 | ~5 |
| 其他功能 | ~35 | ~0 | ~35 |
| 合计 | ~237 | ~98 | ~134 |

### 6.3 去emoji化改造优先级建议

P0 - 已有替代，直接替换 (约98处)
这些emoji已有对应的iconfont类名或CSS图标，只需将emoji字符替换为 text class=iconfont icon-xxx 或 text class=icon-xxx

P1 - 缺少图标，需新增iconfont (约50处)
需新增的iconfont图标:
- icon-role-grandpa (爷爷)
- icon-role-nanny (育儿嫂)
- icon-boy / icon-girl (性别)
- icon-phone (电话)
- icon-message (消息)
- icon-rocket (开始)
- icon-battery (电量)
- icon-hourglass (沙漏)
- icon-hospital (医院)
- icon-sparkle (闪光)
- icon-fire (火焰)
- icon-compass (指南针)
- icon-play / icon-pause (播放控制)
- icon-trash (删除)
- icon-mail (邮件)
- icon-globe (地球)
- icon-gear (设置)
- icon-save (保存)
- icon-lock (安全)
- icon-book-open (打开的书)

P2 - 贴纸系统 (约25处无替代)
stores/stickers.ts中15个贴纸缺iconClass，需要设计对应iconfont图标

P3 - 节气/节日/心情 (约60处)
- config/seasonal.ts 24个节气emoji
- config/festivals.ts 15个节日emoji
- pages/sprout/index.vue 6个心情emoji
这些场景emoji语义丰富、数量大，可考虑保留或设计专题图标集

保留 - 品牌符号 (约8处)
four-pointed-star 是双宝记品牌装饰符号，建议保留

---

## 七、已完成去emoji化的文件 (参考样板)

1. src/pages/record/index.vue - 记录页 (全部使用iconfont)
2. src/pages/record/granny.vue - 奶奶模式记录页 (全部使用iconfont)
3. src/App.vue (第1194-1393行) - CSS纯图标系统 (13个CSS图标)
4. src/styles/iconfont.wxss - iconfont字体系统 (44个图标类名)
