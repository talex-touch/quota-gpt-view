export const appName = 'ThisAI - Quota'
export const appDescription = 'THISAI'

// 定义了不同环境下的API URL常量，用于在不同阶段（开发、测试、生产）中使用正确的API端点
export const ENDS_URL = {
  local: {
    label: 'Local',
    value: 'http://127.0.0.1:7001/',
  },
  dev: {
    label: 'Development',
    value: 'https://dev.quotawish.com/',
  },
  test: {
    label: 'Test',
    value: 'https://test.quotawish.com/',
  },
  prod: {
    label: 'Production',
    value: 'https://api.quotawish.com/',
  },
}

let _ENDS_URL = ''

// Object.assign(globalThis, '$ENDS_URL', {
//   get() {
//     return _ENDS_URL
//   },
// })

// declare global {
//   interface Window {
//     $ENDS_URL: string
//   }
// }

// export const EndNormalUrl = ENDS_URL.prod

// (import.meta.env.DEV) ? ENDS_URL.dev : ENDS_URL.prod

/**
 * 定义全局选项类，主要用于管理和更新URL endpoints
 */
export class GlobalOptions {
  /**
   * 构造函数，根据环境（开发或生产）设置URL endpoints
   *
   * 如果当前环境是开发模式（即使用 vite 命令启动服务），则 import.meta.env.DEV 的值为 true
   * import.meta.env 只能访问到 Vite 自动注入的环境变量，
   */
  constructor() {
    this.setEndsUrl((import.meta.env.DEV) ? ENDS_URL.dev.value : ENDS_URL.prod.value)
  }

  setEndsUrl(url: string) {
    _ENDS_URL = url

    this.updateUrlStash.forEach((callback) => {
      callback(url)
    })
  }

  getEndsUrl() {
    return _ENDS_URL
  }

  /**
   * 存储需要通知的URL变更回调函数
   */
  updateUrlStash: any[] = []

  /**
   * 订阅URL变更事件，当URL变更时执行回调函数
   * @param callback URL变更时执行的回调函数
   */
  onUpdateUrl(callback: (url: string) => void) {
    this.updateUrlStash.push(callback)
  }
}

export const globalOptions = new GlobalOptions()
