// 强制声明tt存在
declare global {
  interface Window {
    tt: any
    h5sdk: any
  }
}

/**
 * 以下几种情况需要授权code（均需满足在飞书打开）
 * 1.用户未登录
 * 2.用户登录管理后台
 * 3.用户使用敏感操作
 */
function authLogin() {
  if (!window.tt.requestAccess) {
    alert('请使用新版飞书客户端打开！')
    return
  }

  window.tt.requestAccess({
    // 网页应用 App ID
    appID: 'cli_a63b10f14db4d00d',
    scopeList: ['contact:user.phone:readonly'],
    success: (res: any) => {
      // 用户授权后返回预授权码
      const { code } = res
      console.log('code', code)
    },
    fail: (error: any) => {
      // 需要额外根据errno判断是否为 客户端不支持requestAccess导致的失败
      const { errno, errString } = error

      confirm(errString)

      // location.reload()
    },
  })
}

export default () => {
  const vConsole = new window.VConsole()

  window.h5sdk.ready(() => {
    if (!userStore.value.token)
      authLogin()
  })
}
