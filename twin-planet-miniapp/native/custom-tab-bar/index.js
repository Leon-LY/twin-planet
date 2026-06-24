Component({
  data: {
    selected: 0,
    safeBottom: 0,
    badges: { 0: 0, 1: 0, 2: 0, 3: 0 },
    list: [
      { pagePath: '/pages/index/index', text: '手帳', icon: '🦊' },
      { pagePath: '/pages/record/index', text: '记录', icon: '📝' },
      { pagePath: '/pages/stickers/index', text: '贴纸', icon: '⭐' },
      { pagePath: '/pages/discover/index', text: '发现', icon: '🧭' },
    ],
  },

  lifetimes: {
    attached() {
      try {
        const info = wx.getWindowInfo()
        this.setData({ safeBottom: info.safeAreaInsets?.bottom || 0 })
      } catch (_) {
        try {
          const sys = wx.getSystemInfoSync()
          this.setData({ safeBottom: sys.safeAreaInsets?.bottom || 0 })
        } catch (_) {}
      }
      try {
        const pages = getCurrentPages()
        if (pages.length) {
          const route = pages[pages.length - 1].route || ''
          const idx = this.data.list.findIndex(item => item.pagePath === '/' + route)
          if (idx >= 0) this.setData({ selected: idx })
        }
      } catch (_) {}
      // 从 globalData 恢复红点
      const app = getApp()
      if (app?.globalData?.__tabBadges) {
        this.setData({ badges: app.globalData.__tabBadges })
      }
    },
  },

  methods: {
    switchTab(e) {
      const { index, path } = e.currentTarget.dataset
      this.setData({ selected: index })
      wx.switchTab({ url: path })
    },
    /** 更新 tab 红点：setBadge(tabIndex, count) */
    setBadge(tabIndex, count) {
      const badges = { ...this.data.badges, [tabIndex]: Math.max(0, count || 0) }
      this.setData({ badges })
      const app = getApp()
      if (app) { app.globalData = app.globalData || {}; app.globalData.__tabBadges = badges }
    },
  },
})
