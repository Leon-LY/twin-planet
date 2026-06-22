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

      // 选中当前页
      this._syncSelected()
    },
  },

  pageLifetimes: {
    show() {
      this._syncSelected()
    },
  },

  methods: {
    _syncSelected() {
      try {
        const pages = getCurrentPages()
        if (!pages.length) return
        const page = pages[pages.length - 1]
        const route = page.route || page.__route__ || ''
        const path = '/' + route
        const idx = this.data.list.findIndex(item => item.pagePath === path)
        if (idx >= 0 && idx !== this.data.selected) {
          this.setData({ selected: idx })
        }
      } catch (_) {}
    },

    switchTab(e) {
      const { index, path } = e.currentTarget.dataset
      // 即时高亮反馈，wx.switchTab 完成后 pageLifetimes.show 会再次确认
      this.setData({ selected: index })
      wx.switchTab({ url: path })
    },
  },
})
