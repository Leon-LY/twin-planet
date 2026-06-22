Component({
  data: {
    selected: 0,
    safeBottom: 0,
    list: [
      { pagePath: '/pages/index/index', text: '手帳', icon: '🦊' },
      { pagePath: '/pages/record/index', text: '记录', icon: '📝' },
      { pagePath: '/pages/stickers/index', text: '贴纸', icon: '⭐' },
      { pagePath: '/pages/discover/index', text: '发现', icon: '🧭' },
    ],
  },

  lifetimes: {
    attached() {
      // 安全区
      try {
        const info = wx.getWindowInfo()
        this.setData({ safeBottom: info.safeAreaInsets?.bottom || 0 })
      } catch (_) {
        try {
          const sys = wx.getSystemInfoSync()
          this.setData({ safeBottom: sys.safeAreaInsets?.bottom || 0 })
        } catch (_) {}
      }

      // 初始加载时选中当前页
      try {
        const pages = getCurrentPages()
        if (pages.length) {
          const route = pages[pages.length - 1].route || ''
          const idx = this.data.list.findIndex(item => item.pagePath === '/' + route)
          if (idx >= 0) this.setData({ selected: idx })
        }
      } catch (_) {}
    },
  },

  methods: {
    switchTab(e) {
      const { index, path } = e.currentTarget.dataset
      this.setData({ selected: index })
      wx.switchTab({ url: path })
    },
  },
})
