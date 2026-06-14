/**
 * 媒体工具 — 保存图片到相册
 * 从 shareCard.ts 和 clinicCard.ts 提取的共享逻辑
 */

/** 保存图片到相册，权限被拒时引导用户去设置 */
export function saveToAlbum(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: () => resolve(),
      fail: (err: any) => {
        if (err?.errMsg?.includes('auth deny')) {
          uni.showModal({
            title: '需要相册权限',
            content: '请在设置中允许访问你的相册',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) uni.openSetting({})
            },
          })
        }
        reject(err)
      },
    })
  })
}
