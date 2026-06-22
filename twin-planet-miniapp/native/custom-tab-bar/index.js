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
      // 手动切换后 300ms 内跳过，避免与 switchTab 中的即时 setData 竞态
      if (this._switchStamp && Date.now() - this._switchStamp < 300) return
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
      if (this.data.selected === index) return
      this._switchStamp = Date.now()
      this.setData({ selected: index })
      wx.switchTab({ url: path })
    },
  },
})
